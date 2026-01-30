import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, BackHandler } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import CommonButton from '../components/CommonButton';
import { widthToDp, heightToDp } from '../utils/Responsive';
import RadioButton from '../components/RadioButton';
import Global from './Global';
import { useNavigation } from '@react-navigation/native';

const RegisteredSuccessfully = () => {

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            return true;
        });
        return () => {
            backHandler.remove();
        }
    }, []);

    const navigation = useNavigation();
    let UserType = Global.userType;
    return (
        <View style={[GlobalStyles.mainContainer, { justifyContent: 'center' }]}>
            <View style={{ marginHorizontal: widthToDp(6) }}>
                <RadioButton selected={true} backgroundColor={Colors.successColor} bigImage={true} extraStyles={{ marginLeft: widthToDp(1) }} />
                <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, styles.Heading]}>
                    Congratulations!
                </Text>
                <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, styles.Message]}>
                    You are now registered, and ready to use HOPE. ​Visit your dashboard and let HOPE take care of you.
                </Text>
            </View>
            {
                UserType == 'Patient' ? null :
                    <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }, styles.Button])}
                        onPress={() => navigation.navigate("Dashboard", { refreshing: true })}>
                        <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_700Bold]}>
                            Take me to the Dashboard
                        </Text>
                    </Pressable>
            }
            <CommonButton
                buttonText={UserType == 'Patient' ? "Take me to the Dashboard" : "Add Patient"}
                onPress={() => {
                    UserType == 'Patient' ? navigation.navigate("Dashboard", { refreshing: true }) : navigation.navigate("PatientDetailsForm", { id: 0, viewRelation: true })
                }}
                extraStyles={{ width: '93%', bottom: heightToDp(4), position: 'absolute' }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    Heading: {
        lineHeight: heightToDp(4),
        marginBottom: heightToDp(2),
        marginTop: heightToDp(2)
    },
    Message: {
        lineHeight: heightToDp(3)
    },
    Button: {
        position: 'absolute',
        bottom: heightToDp(15),
        alignSelf: 'center',
    }
})
export default RegisteredSuccessfully;