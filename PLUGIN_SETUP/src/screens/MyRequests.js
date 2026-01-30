import { View, Text, SafeAreaView, ScrollView, StyleSheet, Pressable } from 'react-native'
import React, { useEffect, useState } from 'react'
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { scale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import Footer from '../components/Footer';
import VectorIcons from '../components/VectorIcons';
import Global from './Global';
import { apiCall } from '../utils/ApiUtils';
import WarningModal from '../components/WarningModal';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import moment from 'moment';

const MyRequests = () => {
    const navigation = useNavigation();
    const [requestCardData, setRequestCardData] = useState([]);
    const [acceptedRequest, setAcceptedRequest] = useState([]);
    const [rejectedRequest, setRejectedRequest] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");

    const handleApprove = async (item, status) => {
        if (!Global.clicked) {
            Global.clicked = true;
            if (status == "Approved") {
                await updateRequest(item.id, "1");
            } else if (status == "Reject") {
                await updateRequest(item.id, "2");
            }
            Global.clicked = false;
        }
    };

    const getProviderRequestList = async () => {
        try {
            const body = {
                "caregiverId": Global.userID,
                "coord": ["24.623061", "10.830960"],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            const response = await apiCall('carebuddy/getproviderrequestlist', body);
            const pendingRequests = response.requestedData.filter(item => item.status === "0");
            const acceptedRequests = response.requestedData.filter(item => item.status === "1");
            const rejectedRequests = response.requestedData.filter(item => item.status === "2");
            setRequestCardData(pendingRequests);
            setAcceptedRequest(acceptedRequests);
            setRejectedRequest(rejectedRequests);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    };

    const updateRequest = async (id, status) => {
        try {
            const body = {
                "requestId": id,
                "status": status,
                "coord": ["24.623061", "10.830960"],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            };
            setLoading(true);
            await apiCall('carebuddy/updaterequest', body);
            getProviderRequestList();
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

    useEffect(() => {
        getProviderRequestList();
    }, [])

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle={"My Requests"}
                    onPress={() => { navigation.navigate("Dashboard") }}
                />
                <View style={{ marginTop: heightToDp(1) }}>
                    {requestCardData.length == 0 && acceptedRequest.length == 0 && rejectedRequest.length == 0 ?
                        <View style={{ justifyContent: "center", alignItems: "center", marginTop: heightToDp(35) }}>
                            <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_600SemiBold]}>No Request !</Text>
                        </View>
                        :
                        <ScrollView contentContainerStyle={{ paddingBottom: heightToDp(25) }} showsVerticalScrollIndicator={false}>
                            {requestCardData.length !== 0 &&
                                <View style={{ width: "100%", marginBottom: heightToDp(1) }}>
                                    <Text style={[GlobalStyles.buttonmediumText, Fonts.Nunito_700Bold]}>
                                        Pending
                                    </Text>
                                </View>
                            }
                            {requestCardData.map((item, index) => (
                                <View style={[styles.mainContainer]} key={index}>
                                    <View style={{ width: "100%", marginHorizontal: widthToDp(3) }}>
                                        <Text style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5), marginHorizontal: widthToDp(3) }, Fonts.Nunito_700Bold]}>
                                            {item.equipment}
                                        </Text>
                                    </View>
                                    <View style={{ width: "100%", flexDirection: "row" }}>
                                        <Text style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5), marginLeft: widthToDp(3) }, Fonts.Nunito_700Bold]}>
                                            Patient Name:
                                        </Text>
                                        <Text numberOfLines={2} style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5), width: "55%", marginLeft: widthToDp(2) }, Fonts.Nunito_700Bold]}>
                                            {item.patientName}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: widthToDp(3), marginVertical: heightToDp(1) }}>
                                        <View style={{ flex: 1, }}>
                                            <Text style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5) }, Fonts.Nunito_700Bold]}>
                                                {"Request by " + "(" + item.requestedBy + ")"}
                                            </Text>
                                        </View>
                                        <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>
                                            {moment(item.requestedOn).format("DD MMM h.mm a")}
                                        </Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', marginVertical: heightToDp(1) }}>
                                        <Pressable
                                            onPress={async () => { await handleApprove(item, 'Reject') }}
                                            style={({ pressed }) => ([GlobalStyles.rowFlexstart, {
                                                paddingHorizontal: widthToDp(11),
                                                paddingVertical: heightToDp(2),
                                                backgroundColor: pressed ? Colors.textInputBorder : Colors.boxBackground,
                                                borderRadius: 14
                                            },
                                            GlobalStyles.inputBoxShadow
                                            ])}>
                                            <VectorIcons groupName='Ionicons' iconName='close' iconsize={scale(17)} iconstyle={[{ color: Colors.primaryButtonColor }]} />
                                            <Text style={[{ marginLeft: 4, color: Colors.primaryButtonColor, fontSize: scale(12) }, Fonts.Nunito_600SemiBold]}>
                                                Reject
                                            </Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={async () => { await handleApprove(item, 'Approved') }}
                                            style={({ pressed }) => ([GlobalStyles.rowFlexstart,
                                            {
                                                paddingHorizontal: widthToDp(11),
                                                paddingVertical: heightToDp(2),
                                                backgroundColor: pressed ? Colors.textInputBorder : Colors.primaryButtonColor,
                                                borderRadius: 14,
                                                marginLeft: widthToDp(4)
                                            },
                                            GlobalStyles.inputBoxShadow
                                            ])}>
                                            <VectorIcons groupName='Feather' iconName='check' iconsize={widthToDp(5)} iconstyle={[{ color: Colors.boxBackground }]} />
                                            <Text style={[GlobalStyles.backgroundextrasmallText, { marginLeft: 4 }, Fonts.Nunito_600SemiBold]}>
                                                Complete
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            ))}
                            {acceptedRequest.length !== 0 &&
                                <View style={{ width: "100%" }}>
                                    <Text style={[GlobalStyles.buttonmediumText, Fonts.Nunito_700Bold]}>
                                        Completed
                                    </Text>
                                </View>
                            }
                            {acceptedRequest.map((item, index) => (
                                <View style={[styles.mainContainer]} key={index}>
                                    <View style={{ width: "100%", marginHorizontal: widthToDp(3) }}>
                                        <Text style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5), marginHorizontal: widthToDp(3) }, Fonts.Nunito_700Bold]}>
                                            {item.equipment}
                                        </Text>
                                    </View>
                                    <View style={{ width: "100%", flexDirection: "row" }}>
                                        <Text style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5), marginLeft: widthToDp(3) }, Fonts.Nunito_700Bold]}>
                                            Patient Name:
                                        </Text>
                                        <Text numberOfLines={2} style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5), width: "55%", marginLeft: widthToDp(2) }, Fonts.Nunito_700Bold]}>
                                            {item.patientName}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: widthToDp(3), marginVertical: heightToDp(1) }}>
                                        <View style={{ flex: 1, }}>
                                            <Text style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5) }, Fonts.Nunito_700Bold]}>
                                                {"Request by " + "(" + item.requestedBy + ")"}
                                            </Text>
                                        </View>
                                        <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>
                                            {moment(item.requestedOn).format("DD MMM h.mm a")}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                            {rejectedRequest.length !== 0 &&
                                <View style={{ width: "100%", marginTop: heightToDp(2) }}>
                                    <Text style={[GlobalStyles.buttonmediumText, Fonts.Nunito_700Bold]}>
                                        Rejected
                                    </Text>
                                    {rejectedRequest.map((item, index) => (
                                        <View style={[styles.mainContainer]} key={index}>
                                            <View style={{ width: "100%", marginHorizontal: widthToDp(3) }}>
                                                <Text style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5), marginHorizontal: widthToDp(3) }, Fonts.Nunito_700Bold]}>
                                                    {item.equipment}
                                                </Text>
                                            </View>
                                            <View style={{ width: "100%", flexDirection: "row" }}>
                                                <Text style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5), marginLeft: widthToDp(3) }, Fonts.Nunito_700Bold]}>
                                                    Patient Name:
                                                </Text>
                                                <Text numberOfLines={2} style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5), width: "55%", marginLeft: widthToDp(2) }, Fonts.Nunito_700Bold]}>
                                                    {item.patientName}
                                                </Text>
                                            </View>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: widthToDp(3), marginVertical: heightToDp(1) }}>
                                                <View style={{ flex: 1, }}>
                                                    <Text style={[GlobalStyles.smallText, { marginBottom: heightToDp(0.5) }, Fonts.Nunito_700Bold]}>
                                                        {"Request by " + "(" + item.requestedBy + ")"}
                                                    </Text>
                                                </View>
                                                <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>
                                                    {moment(item.requestedOn).format("DD MMM h.mm a")}
                                                </Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            }
                        </ScrollView>
                    }
                </View>
            </View>
            <Footer navigation={navigation} />
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create(
    {
        mainContainer: {
            alignItems: 'center',
            padding: widthToDp(3),
            backgroundColor: Colors.boxBackground,
            borderRadius: 14,
            marginTop: heightToDp(2)
        },
    }
)

export default MyRequests;