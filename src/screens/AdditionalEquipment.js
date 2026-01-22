import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, FlatList, ImageBackground, Image } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import moment from 'moment';
import Global from './Global';
import Spinner from 'react-native-loading-spinner-overlay';
import { apiCall } from '../utils/ApiUtils';
import WarningModal from '../components/WarningModal';
import Loader from '../components/Loader';
import { scale, verticalScale } from 'react-native-size-matters';

const AdditionalEquipment = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [equipmentData, setEquipmentData] = useState([]);
    useEffect(() => {
        getPatientRequest();
    }, []);

    const getPatientRequest = async () => {
        try {
            const body = {
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "deviceInfo": "android",
                "location": "Mumbai",
                "patientId": Global.userType == "Patient" ? Global.patientID : "0",
                "caregiverId": Global.userType == "Patient" ? "0" : Global.userID
            }
            setLoading(true);
            const response = await apiCall('carebuddy/getpatientrequestlist', body);
            setEquipmentData(response.requestedData);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    };
    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }
    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Equipment Request"
                    onPress={() => navigation.navigate("Dashboard")}
                />
                {
                    equipmentData.length != 0 ?
                        <FlatList
                            keyExtractor={(item, index) => "key" + index}
                            data={equipmentData}
                            renderItem={({ item, index }) =>
                                <View style={{ backgroundColor: Colors.primaryButtonColor, width: '100%', borderRadius: 14, overflow: "hidden", marginBottom: heightToDp(2) }}>
                                    <ImageBackground resizeMode="cover" source={require('../assets/vectors/blue_slice.png')} style={{ width: '100%' }}>
                                        <View style={{ padding: scale(10) }}>
                                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.boxBackground, width: "40%" }]}>Equipment</Text>
                                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_400Regular, { color: Colors.boxBackground, width: "60%" }]}>: {item.equipment}</Text>
                                            </View>
                                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: verticalScale(3) }}>
                                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.boxBackground, width: "40%" }]}>Requested on</Text>
                                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_400Regular, { color: Colors.boxBackground }]}>: {moment(item.requestedOn).format("DD MMM h:mm a")}</Text>
                                            </View>
                                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: verticalScale(3) }}>
                                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.boxBackground, width: "40%" }]}>Requested by</Text>
                                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_400Regular, { color: Colors.boxBackground }]}>: {item.providerName}</Text>
                                            </View>
                                            <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: verticalScale(3) }}>
                                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.boxBackground, width: "40%" }]}>Provider type</Text>
                                                <Text style={[GlobalStyles.smallText, Fonts.Nunito_400Regular, { color: Colors.boxBackground }]}>: {item.providerType}</Text>
                                            </View>
                                            {Global.userType == 'Caregiver' &&
                                                <View>
                                                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: verticalScale(3) }}>
                                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.boxBackground, width: "40%" }]}>Patient name</Text>
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_400Regular, { color: Colors.boxBackground }]}>: {item.requestedTo}</Text>
                                                    </View>

                                                    <View style={{ display: "flex", flexDirection: "row", alignItems: "center", marginTop: verticalScale(3) }}>
                                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold, { color: Colors.boxBackground, width: "40%" }]}>Patient relation</Text>
                                                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_400Regular, { color: Colors.boxBackground }]}>: {item.relation}</Text>
                                                    </View>
                                                </View>
                                            }
                                        </View>
                                    </ImageBackground>
                                </View>
                            }
                        />
                        :
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
                            <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold]}>No Request Found.</Text>
                        </View>
                }
                <Spinner
                    visible={loading}
                    color={Colors.primaryButtonColor}
                    customIndicator={<Loader />}
                    textStyle={{ color: Colors.primaryButtonColor }}
                />
                <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
            </View>
        </SafeAreaView>
    )
}

export default AdditionalEquipment;