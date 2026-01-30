import React from 'react';
import { View, Text, StyleSheet, Modal, Image } from 'react-native';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import GlobalStyles from '../utils/GlobalStyles';
import { heightToDp, widthToDp } from '../utils/Responsive';



export default function NurseAppointmentModel(props) {
    return (
        <Modal visible={props.showModal} animationType={'fade'} transparent={true}>
            <View style={{ flex: 1, backgroundColor: Colors.modalBackground }}>
                <View style={[styles.optionView]}>
                    <View style={[styles.modalMainSection]}>
                        <View style={[styles.modalContentFirst]}>
                            <Image
                                resizeMode="cover"
                                source={require('../assets/images/noti_dp_2.png')}
                                style={[styles.modalImage]}    
                            />
                            <View>
                                <Text style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold,]}>jane Doe</Text>
                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { color: Colors.primaryinactive }]}>Pune</Text>
                            </View>
                        </View>
                        <View style={[styles.modalLastContent]}>
                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_700Bold,]}>Appointment cancelled for 13-05-2023 09:00AM to 12:00PM</Text>
                            <Text style={[Fonts.Nunito_700Bold, { marginTop: '2%', color: Colors.secondarybuttonColor }]}>Cancelled by Jane Doe </Text>
                            <Text style={[GlobalStyles.smallText, Fonts.Nunito_400Regular, { marginTop: '4%', color: Colors.darkBlue }]}>Refund is Initiated and will be credited in your account within 48 hours.</Text>
                        </View>
                    </View>

                </View>
            </View>
        </Modal>
    )
}
const styles = StyleSheet.create(
    {
        warningMessage: {
            marginTop: heightToDp(2),
            paddingHorizontal: widthToDp(6),
            textAlign: "center",
        },
        optionView: {
            minHeight: heightToDp(24),
            width: widthToDp(80),
            borderRadius: 14,
            backgroundColor: Colors.boxBackground,
            justifyContent: 'space-around',
            alignItems: 'center',
            marginTop: heightToDp(35),
            alignSelf: "center",
            shadowColor: Colors.primaryTextColor,
            shadowOffset: {
                width: 0,
                height: 12,
            },
            shadowOpacity: 0.58,
            shadowRadius: 16.00,
            elevation: 24,
        },
        button: {
            alignSelf: 'center',
            width: widthToDp(20),
            height: heightToDp(6),
            marginBottom: heightToDp(2),
        },
        modalMainSection: {
            justifyContent: 'center',
            alignItems: 'center',
            padding: widthToDp(5)
        },
        modalContentFirst: {
            flexDirection: 'row',
            width: "100%",
            marginRight: widthToDp(25)
        },
        modalImage: {
            marginRight: widthToDp(8),
            height: heightToDp(8),
            width: widthToDp(15),
            borderRadius: 50,
        },
        modalLastContent: {
            flexDirection: 'column',
            margin: heightToDp(2),
            width: '100%'
        }
    }
)