import { View, Text, SafeAreaView, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header';
import Colors from '../utils/Colors';
import { heightToDp, responsiveFont, widthToDp } from '../utils/Responsive';
import { scale, verticalScale } from 'react-native-size-matters';
import Fonts from '../utils/Fonts';
import { useNavigation } from '@react-navigation/native';
import Pdf from 'react-native-pdf';
import { Image } from 'react-native-elements';
import { apiCall } from '../utils/ApiUtils';
import Loader from '../components/Loader';
import Spinner from 'react-native-loading-spinner-overlay';
import WarningModal from '../components/WarningModal';
import FieldLabel from '../components/FieldLabel';
import Global from './Global';

const DoctorNotes = (props) => {

    const appointmentId = props.route.params?.appointmentId || "";
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [viewNotes, setViewNotes] = useState([]);
    const [reports, setReports] = useState([]);
    const [warningText, setWarningText] = useState("");
    const [showModal, setShowModal] = useState("");
    useEffect(() => {
        GetAppointmentData()
    }, [])
    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    };
    const GetAppointmentData = async () => {
        try {
            const body = {
                "appointmentId": appointmentId,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": "android"
            }
            setLoading(true);
            let response = await apiCall("registration/getappointmentdata", body);
            if (response.note) {
                setViewNotes([response.note]);
            }
            if (response.reports) {
                setReports(response.reports);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || Global.warningMessage);
        }
    }
    const getFileExtension = (uri) => {
        const parts = uri.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
    };
    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Back"
                    onPress={() => { navigation.navigate('TreatmentData') }}
                />
                <View>
                    {
                        viewNotes?.length != 0 ?
                            <View>
                                {
                                    viewNotes.map((item, index) =>
                                        <ScrollView style={{ marginBottom: heightToDp(0) }}>
                                            <View key={index} style={[GlobalStyles.inputBoxShadow, styles.filterbutton, { height: 250 }]} >
                                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_400Regular, { marginVertical: verticalScale(10) }]}>{item}</Text>
                                            </View>
                                        </ScrollView>
                                    )
                                }
                            </View>
                            :
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                {/* <Text >No Notes To Show</Text> */}
                                <FieldLabel text={"No Notes To Show"} Nospace={true} TextType={"small"} extraStyles={[GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold, { fontSize: responsiveFont(scale(14)), color: Colors.modalBackground }]} />
                            </View>
                    }
                    {
                        reports.length != 0 ?
                            <View style={[GlobalStyles.inputBoxShadow, styles.filterbutton, { padding: scale(0), height: 400 }]}>
                                <ScrollView >
                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}  >
                                        {
                                            reports?.map((item, index) => {
                                                const fileExtension = getFileExtension(item.filePath);
                                                return (
                                                    <View key={index} style={{ marginHorizontal: scale(5) }} >
                                                        {fileExtension === 'pdf' ? (
                                                            <Pdf
                                                                renderActivityIndicator={() => (
                                                                    <ActivityIndicator size="large" color={Colors.primaryButtonColor} />
                                                                )}
                                                                onStartShouldSetResponder={() => true}
                                                                trustAllCerts={false}
                                                                source={{ uri: item.filePath, cache: true }}
                                                                style={styles.pdf}
                                                            />
                                                        ) : (
                                                            <Image
                                                                source={{ uri: item.filePath }}
                                                                style={styles.profileImage}
                                                                resizeMode="contain"
                                                            />
                                                        )}
                                                    </View>
                                                )
                                            })
                                        }
                                    </View>
                                </ScrollView>
                            </View>
                            :
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                                <FieldLabel text={"No Reports To Show"} Nospace={true} TextType={"small"} extraStyles={[GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold, { fontSize: responsiveFont(scale(14)), color: Colors.modalBackground }]} />
                            </View>
                    }
                </View>
            </View>
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal showModal={showModal} warningText={warningText} setShowModal={setShowModal} />
        </SafeAreaView>
    )
}
const styles = StyleSheet.create({
    filterbutton: {
        height: 300,
        width: '100%',
        backgroundColor: Colors.defaultBackground,
        borderRadius: 14,
        marginBottom: heightToDp(1),
        marginTop: heightToDp(1),
        padding: scale(15),
        alignSelf: "center",
    },
    profileImage: {
        height: 200,
        width: 100,
    },
    pdf: {
        height: 200,
        width: 100,
    }
})
export default DoctorNotes;