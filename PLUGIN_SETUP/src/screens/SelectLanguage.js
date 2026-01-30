import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList, SafeAreaView, ToastAndroid } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import Logo from '../components/Logo';
import CommonButton from '../components/CommonButton';
import { widthToDp, heightToDp } from '../utils/Responsive';
import english from '../assets/languages/english.json';
import hindi from '../assets/languages/hindi.json';
import telungu from '../assets/languages/telungu.json';
import tamil from '../assets/languages/tamil.json';
import gujarati from '../assets/languages/gujarati.json';
import malayalam from '../assets/languages/malayalam.json';
import marathi from '../assets/languages/marathi.json';
import Global from './Global';
import RadioButton from '../components/RadioButton';
import { useNavigation } from '@react-navigation/native';
import { scale } from 'react-native-size-matters';
import FieldLabel from '../components/FieldLabel';
import ToastMessage from '../components/ToastMessage';

const SelectLanguage = () => {
    const navigation = useNavigation();
    let [selectedLanguage, setSelectedLanguage] = useState("english");
    const [toastMessageText, setToastMessageText] = useState("");
    let Languages = [
        {
            id: 'english',
            Name: 'English',
            AbsName: 'A'
        },
        {
            id: 'hindi',
            Name: 'हिंदी ',
            AbsName: 'हि'
        },
        {
            id: 'telungu',
            Name: 'తెలుగు ',
            AbsName: 'తె'
        },
        {
            id: 'tamil',
            Name: 'தமிழ்',
            AbsName: 'த'
        },
        {
            id: 'gujarati',
            Name: 'ગુજરાતી',
            AbsName: 'ગુ'
        },
        {
            id: 'malayalam',
            Name: 'മലയാളം',
            AbsName: 'മ'
        },
        {
            id: 'marathi',
            Name: 'मराठी',
            AbsName: 'मर'
        }
    ];
    const [toastVisible, setToastVisible] = useState(false);
    const handleShowAlert = (msg) => {
        setToastVisible(true);
        setToastMessageText(msg);
        setTimeout(() => {
            setToastVisible(false);
        }, 1500);
    };

    const validateLanguage = () => {
        if (selectedLanguage == 'english') {
            Global.languageData = english;
        }
        else if (selectedLanguage == 'hindi') {
            Global.languageData = hindi;
        }
        else if (selectedLanguage == 'telungu') {
            Global.languageData = telungu;
        }
        else if (selectedLanguage == 'tamil') {
            Global.languageData = tamil;
        }
        else if (selectedLanguage == 'gujarati') {
            Global.languageData = gujarati;
        }
        else if (selectedLanguage == 'malayalam') {
            Global.languageData = malayalam;
        }
        else if (selectedLanguage == 'marathi') {
            Global.languageData = marathi;
        }
        else {
            Global.languageData = english;
        }
        navigation.replace("IntroCarousel");
    }

    const languageComingSoon = (item) => {
        if (item.id == "english") {
            setSelectedLanguage(item.id);
        }
        ToastMessagerFunction("Feature coming soon...");
    }

    const ToastMessagerFunction = (msg) => {
        if (Global.OS === 'android') {
            ToastAndroid.show(msg, ToastAndroid.SHORT)
        } else {
            handleShowAlert(msg)
        }
    }

    console.log("test");
    

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Logo />
                <FieldLabel text={'Choose Language'} TextType={"ExtraLarge"} />
                <View>
                    <FlatList
                        data={Languages}
                        numColumns={3}
                        keyExtractor={(item, index) => 'key' + index}
                        renderItem={({ item }) =>
                            <View style={{ width: '31%', marginRight: widthToDp(2), marginTop: widthToDp(4) }}>
                                <Pressable style={[styles.languageButton, { overflow: 'hidden', position: 'relative' }, {
                                    backgroundColor: selectedLanguage == item.id ? Colors.primaryButtonColor : '#D9D2FF',
                                    borderWidth: selectedLanguage == item.id ? 1 : 0
                                }]}
                                    onPress={() => { languageComingSoon(item) }}
                                >
                                    <View style={{ position: 'relative' }}>
                                        {
                                            selectedLanguage == item.id ?
                                                <View style={[{ position: 'absolute', height: heightToDp(4), top: widthToDp(3) }]}>
                                                    <RadioButton selected={true} backgroundColor={Colors.secondarybuttonColor} />
                                                </View>
                                                : null
                                        }
                                        <Text style={[styles.languageButtonTextabsolute, {
                                            fontFamily: item.AbsName === 'A' ? 'Nunito-Bold' : 'Amiko-Bold',
                                            fontSize: item.AbsName === 'A' ? scale(85) : scale(65),
                                            right: item.AbsName === 'A' || item.AbsName === 'मर' ? -widthToDp(7) : item.AbsName === 'हि' ? -widthToDp(2) : widthToDp(1),
                                            bottom: item.AbsName === 'తె' || item.AbsName === 'A' || item.AbsName === 'मर' ? -heightToDp(15) : -heightToDp(13)
                                        },
                                        { color: selectedLanguage == item.id ? '#AD90FF' : '#dfd9ff' }
                                        ]}>
                                            {item.AbsName}
                                        </Text>
                                        <Text style={[styles.languageButtonText, Fonts.Nunito_700Bold, {
                                            fontSize: item.Name === 'മലയാളം' ? scale(16) : scale(20),
                                            color: selectedLanguage == item.id ? Colors.boxBackground : Colors.primaryButtonColor
                                        }]}>
                                            {item.Name}
                                        </Text>
                                    </View>
                                </Pressable>
                            </View>
                        }
                    />
                </View>
                <CommonButton
                    buttonText="Continue"
                    visible=' true'
                    onPress={() => { validateLanguage() }}
                    extraStyles={GlobalStyles.fixbottomcommonButton}
                />
            </View>
            <ToastMessage visible={toastVisible} text={toastMessageText} />
        </SafeAreaView>
    );
}

export default SelectLanguage;

const styles = StyleSheet.create(
    {
        languageButton: {
            borderColor: Colors.primaryButtonColor,
            borderRadius: 14,
            height: heightToDp(17.5)
        },
        languageButtonTextabsolute: {
            color: '#dfd9ff',
            position: 'absolute',
        },
        languageButtonText: {
            position: 'absolute',
            bottom: -heightToDp(17),
            textAlign: 'center',
            alignSelf: 'center',
            justifyContent: 'center'
        },
    }
)
