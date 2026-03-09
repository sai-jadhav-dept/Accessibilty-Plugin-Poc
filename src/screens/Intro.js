import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalStyles from '../utils/GlobalStyles';
import Logo from '../components/Logo';
import Fonts from '../utils/Fonts';
import CommonButton from '../components/CommonButton';
import { heightToDp } from '../utils/Responsive';
import { useDynamicColors, AccessibleFilteredImage, useAccessibility, TTSService, AccessibleText } from '../accessibility';
import ReadModal from '../accessibility/ReadModal';
import TextMagnifier from '../accessibility/TextMagnifier';
import DictionaryLookup from '../accessibility/DictionaryLookup';
import ReadingGuide from '../accessibility/ReadingGuide';
import Global from './Global';

export default function Intro() {
  const colors = useDynamicColors();
  const { announce, fontScale, lineHeight, letterSpacing, currentReadingText } = useAccessibility();

  const [readModal, setReadModal] = useState(false);
  const [textMagnifierEnabled, setTextMagnifierEnabled] = useState(false);
  const [dictionaryEnabled, setDictionaryEnabled] = useState(false);
  const [readingMaskEnabled, setReadingMaskEnabled] = useState(false);
  const [readingLineEnabled, setReadingLineEnabled] = useState(false);
  const [reducedMotionEnabled, setReducedMotionEnabled] = useState(false);
  const [highlightLinksEnabled, setHighlightLinksEnabled] = useState(false);
  const [textAlignment, setTextAlignment] = useState('left');
  const [isSpeakerDragging, setIsSpeakerDragging] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Ensure Global is initialized to false on component mount
    TTSService.init();
    Global.accessibility.pageRead = false;
    setReadModal(false);

    const checkInterval = setInterval(() => {
      setReadModal(Global.accessibility.pageRead);
      setTextMagnifierEnabled(Global.accessibility.textMagnifier || false);
      setDictionaryEnabled(Global.accessibility.dictionary || false);
      setReadingMaskEnabled(Global.accessibility.readingMask || false);
      setReadingLineEnabled(Global.accessibility.readingLine || false);
      setReducedMotionEnabled(Global.accessibility.reducedMotion || false);
      setHighlightLinksEnabled(Global.accessibility.highlightLinks || false);
      setTextAlignment(Global.accessibility.textAlignment || 'left');
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  // Animation effects
  useEffect(() => {
    if (!reducedMotionEnabled) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })]
        )
      ).start();

      // Fade animation
      Animated.loop(
        Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true
        })]
        )
      ).start();

      // Rotate animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();

      // Slide animation
      Animated.loop(
        Animated.sequence([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })]
        )
      ).start();
    } else {
      // Stop animations - set to default values
      pulseAnim.setValue(1);
      fadeAnim.setValue(1);
      rotateAnim.setValue(0);
      slideAnim.setValue(0);
    }
  }, [reducedMotionEnabled]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const slideX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20]
  });
  return (
    <SafeAreaView style={[GlobalStyles.mainContainer, { backgroundColor: colors.defaultBackground }]}>
            <ReadingGuide
        maskEnabled={readingMaskEnabled}
        lineEnabled={readingLineEnabled}>
        
                <View style={GlobalStyles.mainBox}>
                    <Logo />
                    <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            pointerEvents='auto'
            // scrollEnabled={!readModal}
          >
                        <View style={{ flex: 1, justifyContent: 'space-between', marginBottom: heightToDp(4) }}>
                            <View style={styles.imageContainer}>
                                <AccessibleFilteredImage
                  source={require("../assets/images/medical_care.png")}
                  style={styles.mediCare}
                  resizeMode='contain'
                  alt="Healthcare professionals helping patients manage treatments" />
                
                            </View>
                            <DictionaryLookup enabled={dictionaryEnabled}>
                                <TextMagnifier enabled={textMagnifierEnabled}>
                                    <AccessibleText onPress={() => {Global.pageReadText = "Manage treatments with ease, on one platform";}} style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { marginTop: heightToDp(4), color: colors.primaryTextColor, fontSize: GlobalStyles.extralargeText.fontSize * fontScale, lineHeight: GlobalStyles.extralargeText.fontSize * fontScale * lineHeight, letterSpacing: letterSpacing }, currentReadingText === "Manage treatments with ease, on one platform" ? styles.readingBorder : null]}>
                                        Manage treatments with ease, on one platform
                                    </AccessibleText>
                                </TextMagnifier>
                            </DictionaryLookup>
                            <DictionaryLookup enabled={dictionaryEnabled}>
                                <TextMagnifier enabled={textMagnifierEnabled}>
                                    <AccessibleText onPress={() => {Global.pageReadText = "Welcome to our healthcare platform! Here you can manage your medical appointments, track your medications, connect with trusted healthcare providers, and access your health records anytime, anywhere. Our platform makes it easy to take control of your health journey with intuitive tools and personalized care recommendations.";}} style={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { marginTop: heightToDp(4), color: colors.primaryTextColor, fontSize: GlobalStyles.smallText.fontSize * fontScale, lineHeight: GlobalStyles.smallText.fontSize * fontScale * lineHeight, letterSpacing: letterSpacing }, currentReadingText === "Welcome to our healthcare platform! Here you can manage your medical appointments, track your medications, connect with trusted healthcare providers, and access your health records anytime, anywhere. Our platform makes it easy to take control of your health journey with intuitive tools and personalized care recommendations." ? styles.readingBorder : null]}>
                                        Welcome to our healthcare platform! Here you can manage your medical appointments,
                                        track your medications, connect with trusted healthcare providers, and access your
                                        health records anytime, anywhere. Our platform makes it easy to take control of
                                        your health journey with intuitive tools and personalized care recommendations.
                                    </AccessibleText>
                                </TextMagnifier>
                            </DictionaryLookup>

                            <DictionaryLookup enabled={dictionaryEnabled}>
                                <TextMagnifier enabled={textMagnifierEnabled}>
                                    <AccessibleText onPress={() => {Global.pageReadText = "Key Features: Schedule and manage appointments with doctors and nurses, set medication reminders and track your prescriptions, access lab results and medical documents securely, connect with your care circle and trusted providers, get personalized health insights and recommendations.";}} style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { marginTop: heightToDp(2), color: colors.primaryTextColor, fontSize: GlobalStyles.smallText.fontSize * fontScale, lineHeight: GlobalStyles.smallText.fontSize * fontScale * lineHeight, letterSpacing: letterSpacing }, currentReadingText === "Key Features: Schedule and manage appointments with doctors and nurses, set medication reminders and track your prescriptions, access lab results and medical documents securely, connect with your care circle and trusted providers, get personalized health insights and recommendations." ? styles.readingBorder : null]}>
                                        Key Features:{' \n'}
                                        • Schedule and manage appointments with doctors and nurses{'\n'}
                                        • Set medication reminders and track your prescriptions{'\n'}
                                        • Access lab results and medical documents securely{'\n'}
                                        • Connect with your care circle and trusted providers{'\n'}
                                        • Get personalized health insights and recommendations
                                    </AccessibleText>
                                </TextMagnifier>
                            </DictionaryLookup>

                            <View style={{ marginTop: heightToDp(2) }}>
                                <DictionaryLookup enabled={dictionaryEnabled}>
                                    <TextMagnifier enabled={textMagnifierEnabled}>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                                            <AccessibleText style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: colors.primaryTextColor, fontSize: GlobalStyles.smallText.fontSize * fontScale, letterSpacing: letterSpacing }]}>
                                                For more information, visit our{' '}
                                            </AccessibleText>
                                            <Pressable
                        onPress={() => {
                          console.log("Privacy Policy pressed");
                          Linking.openURL('https://example.com/privacy');
                        }}
                        accessibilityRole="link"
                        accessibilityLabel="Privacy Policy link">
                        
                                                <AccessibleText style={[
                        styles.link,
                        { color: colors.primaryTextColor || '#007AFF', fontSize: GlobalStyles.smallText.fontSize * fontScale, letterSpacing: letterSpacing },
                        highlightLinksEnabled && styles.linkHighlighted]
                        }>
                                                    Privacy Policy
                                                </AccessibleText>
                                            </Pressable>
                                            <AccessibleText style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: colors.primaryTextColor, fontSize: GlobalStyles.smallText.fontSize * fontScale, letterSpacing: letterSpacing }]}>
                                                {' '}or{' '}
                                            </AccessibleText>
                                            <Pressable
                        onPress={() => {
                          console.log("Terms pressed");
                          Linking.openURL('https://example.com/terms');
                        }}
                        accessibilityRole="link"
                        accessibilityLabel="Terms of Service link">
                        
                                                <AccessibleText style={[
                        styles.link,
                        { color: colors.primaryTextColor || '#007AFF', fontSize: GlobalStyles.smallText.fontSize * fontScale, letterSpacing: letterSpacing },
                        highlightLinksEnabled && styles.linkHighlighted]
                        }>
                                                    Terms of Service
                                                </AccessibleText>
                                            </Pressable>
                                        </View>
                                    </TextMagnifier>
                                </DictionaryLookup>
                            </View>

                        </View>

                        <View style={[styles.animationDemoContainer, { backgroundColor: colors.boxBackground }]}>
                            <AccessibleText style={[GlobalStyles.smallText, Fonts.Nunito_700Bold, { color: colors.primaryTextColor, textAlign: 'center', marginBottom: 10, fontSize: GlobalStyles.smallText.fontSize * fontScale, letterSpacing: letterSpacing }]}>
                                Animation Demo {reducedMotionEnabled ? '(Paused)' : '(Playing)'}
                            </AccessibleText>
                            <View style={styles.animationRow}>
                                <Animated.View style={[styles.animatedBox, { transform: [{ scale: pulseAnim }], backgroundColor: '#007AFF' }]}>
                                    <AccessibleText style={styles.boxLabel}>Pulse</AccessibleText>
                                </Animated.View>
                                <Animated.View style={[styles.animatedBox, { opacity: fadeAnim, backgroundColor: '#34C759' }]}>
                                    <AccessibleText style={styles.boxLabel}>Fade</AccessibleText>
                                </Animated.View>
                                <Animated.View style={[styles.animatedBox, { transform: [{ rotate: spin }], backgroundColor: '#FF9500' }]}>
                                    <AccessibleText style={styles.boxLabel}>Rotate</AccessibleText>
                                </Animated.View>
                                <Animated.View style={[styles.animatedBox, { transform: [{ translateX: slideX }], backgroundColor: '#FF3B30' }]}>
                                    <AccessibleText style={styles.boxLabel}>Slide</AccessibleText>
                                </Animated.View>
                            </View>
                        </View>
                        <CommonButton
              buttonText="Get Started"
              visible={true}
              // onPress={() => navigation.replace("SelectLanguage")}
              extraStyles={[{ backgroundColor: colors.primaryButtonColor, borderColor: colors.secondarybuttonColor, marginBottom: heightToDp(4) }]} />
            
                    </ScrollView>
                    <ReadModal activeModal={readModal} />
                </View>
            </ReadingGuide>
        </SafeAreaView>);

}
const styles = StyleSheet.create({
  animationDemoContainer: {
    padding: 15,
    borderRadius: 12,
    marginTop: heightToDp(2),
    marginHorizontal: 10,
    marginBottom: heightToDp(4)
  },
  animationRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10
  },
  animatedBox: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  boxLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  imageContainer: {
    alignSelf: 'center',
    height: 300,
    width: '100%',
    marginTop: heightToDp(4)
  },
  mediCare: {
    alignSelf: 'center',
    height: "100%",
    width: '100%'
  },
  link: {
    textDecorationLine: 'underline',
    fontWeight: '700'
  },
  linkHighlighted: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4
  },
  readingBorder: {
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 8,
    // padding: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)'
  }
});