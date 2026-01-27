import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import Fonts from '../utils/Fonts';
import Global from '../screens/Global';

const DictionaryLookup = ({ children, enabled, textStyle }) => {
  const [selectedWord, setSelectedWord] = useState('');
  const [definition, setDefinition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState('');
  const [currentAlignment, setCurrentAlignment] = useState('left');

  // Poll for alignment changes
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const alignment = Global.accessibility?.textAlignment || 'left';
      if (alignment !== currentAlignment) {
        setCurrentAlignment(alignment);
      }
    }, 100);
    return () => clearInterval(checkInterval);
  }, [currentAlignment]);

  const fetchDefinition = async (word) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('Word not found');
      }
      const data = await response.json();
      setDefinition(data[0]);
    } catch (err) {
      setError('Definition not found. Please check the word and try again.');
      setDefinition(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWordPress = (word) => {
    if (!enabled || !word) return;

    const cleanWord = word.replace(/[.,!?;:'"()•\n]/g, '').trim();
    
    if (cleanWord && cleanWord.length > 1) {
      setSelectedWord(cleanWord);
      setModalVisible(true);
      fetchDefinition(cleanWord);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setDefinition(null);
    setError('');
    setSelectedWord('');
  };

  const extractTextContent = (content) => {
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      return content.map(extractTextContent).join('');
    }
    if (React.isValidElement(content)) {
      return extractTextContent(content.props.children);
    }
    return '';
  };

  const renderClickableText = () => {
    // Handle nested components (like TextMagnifier wrapping Text)
    const processChildren = (child) => {
      if (!React.isValidElement(child)) {
        return child;
      }

      // If child is TextMagnifier or other wrapper, process its children
      if (child.props.children) {
        const nestedChild = child.props.children;
        
        // If nested child is a Text component
        if (React.isValidElement(nestedChild) && nestedChild.type === Text) {
          const textContent = extractTextContent(nestedChild.props.children);
          const textProps = nestedChild.props;
          
          // If dictionary is enabled, split into clickable words
          if (enabled) {
            // Split into words while preserving spaces and punctuation
            const parts = textContent.split(/(\s+)/);
            
            const clickableText = (
              <Text {...textProps} style={[textProps.style, { textAlign: currentAlignment }]}>
                {parts.map((part, index) => {
                  // If it's whitespace, render as is
                  if (/^\s+$/.test(part)) {
                    return <Text key={index}>{part}</Text>;
                  }
                  
                  // If it's a word (or word with punctuation), make it pressable
                  const cleanWord = part.replace(/[.,!?;:'"()•]/g, '').trim();
                  if (cleanWord.length > 0) {
                    return (
                      <Text
                        key={index}
                        onPress={() => handleWordPress(cleanWord)}
                      >
                        {part}
                      </Text>
                    );
                  }
                  
                  return <Text key={index}>{part}</Text>;
                })}
              </Text>
            );

            // Clone the wrapper (TextMagnifier) with the new clickable text
            return React.cloneElement(child, {}, clickableText);
          } else {
            // Dictionary not enabled, but still apply text alignment
            const alignedText = (
              <Text {...textProps} style={[textProps.style, { textAlign: currentAlignment }]}>
                {textContent}
              </Text>
            );
            
            // Clone the wrapper (TextMagnifier) with the aligned text
            return React.cloneElement(child, {}, alignedText);
          }
        }
      }

      return child;
    };

    return processChildren(children);
  };

  return (
    <>
      {renderClickableText()}
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, Fonts.Nunito_700Bold]}>
                {selectedWord}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.definitionContainer}>
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={[styles.loadingText, Fonts.Nunito_600SemiBold]}>
                    Looking up definition...
                  </Text>
                </View>
              )}

              {error && !loading && (
                <View style={styles.errorContainer}>
                  <Text style={[styles.errorText, Fonts.Nunito_600SemiBold]}>
                    {error}
                  </Text>
                </View>
              )}

              {definition && !loading && !error && (
                <View>
                  {/* Phonetic */}
                  {definition.phonetic && (
                    <Text style={[styles.phonetic, Fonts.Nunito_600SemiBold]}>
                      {definition.phonetic}
                    </Text>
                  )}

                  {/* Meanings */}
                  {definition.meanings?.map((meaning, index) => (
                    <View key={index} style={styles.meaningSection}>
                      <Text style={[styles.partOfSpeech, Fonts.Nunito_700Bold]}>
                        {meaning.partOfSpeech}
                      </Text>
                      
                      {meaning.definitions?.slice(0, 3).map((def, defIndex) => (
                        <View key={defIndex} style={styles.definitionItem}>
                          <Text style={styles.bullet}>•</Text>
                          <View style={styles.definitionText}>
                            <Text style={[styles.definition, Fonts.Nunito_600SemiBold]}>
                              {def.definition}
                            </Text>
                            {def.example && (
                              <Text style={[styles.example, Fonts.Nunito_600SemiBold]}>
                                Example: "{def.example}"
                              </Text>
                            )}
                          </View>
                        </View>
                      ))}

                      {/* Synonyms */}
                      {meaning.synonyms && meaning.synonyms.length > 0 && (
                        <View style={styles.synonymsContainer}>
                          <Text style={[styles.synonymsLabel, Fonts.Nunito_700Bold]}>
                            Synonyms:{' '}
                          </Text>
                          <Text style={[styles.synonyms, Fonts.Nunito_600SemiBold]}>
                            {meaning.synonyms.slice(0, 5).join(', ')}
                          </Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.doneButton} onPress={closeModal}>
              <Text style={[styles.doneButtonText, Fonts.Nunito_700Bold]}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    color: '#0B3B91',
    textTransform: 'capitalize',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  definitionContainer: {
    padding: 16,
    maxHeight: 400,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
  },
  phonetic: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  meaningSection: {
    marginBottom: 20,
  },
  partOfSpeech: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  definitionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#333',
    marginRight: 8,
    marginTop: 2,
  },
  definitionText: {
    flex: 1,
  },
  definition: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  example: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
  },
  synonymsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    paddingLeft: 8,
  },
  synonymsLabel: {
    fontSize: 13,
    color: '#666',
  },
  synonyms: {
    fontSize: 13,
    color: '#007AFF',
    flex: 1,
  },
  doneButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default DictionaryLookup;
