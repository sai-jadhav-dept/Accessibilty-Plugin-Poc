import React, { useEffect, useState } from 'react';
import { View, Text, Image, Pressable, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import AppointmentCard from '../components/AppointmentCard';
import { useNavigation } from '@react-navigation/native';
import Global from './Global';
import { scale } from 'react-native-size-matters';
import { apiCall } from '../utils/ApiUtils';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';

const MyAppointments = (props) => {
    const navigation = useNavigation();
    const [selectedFilter, setSelectedFilter] = useState({
        showValue: "Upcoming",
        value: "Confirmed"
    });

    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    let [transferedGlobalData, setTransferedGlobalData] = useState(Global.appointmentDetails);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [confirmedAppointments, setConfirmedAppointments] = useState([]);
    const [completedAppointments, setCompletedAppointments] = useState([]);
    const [cancelledAppointments, setCancelledAppointments] = useState([]);
    const [inProgressAppointment, setInProgressAppointment] = useState([]);
    const [noShowAppointment, setNoShowAppointment] = useState([]);

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }
    const appointmentFilterData = [
        {
            key: 0,
            name: 'Confirmed',
            value: 'Upcoming',
            id: 1,
        },
        {
            key: 1,
            name: 'Completed',
            value: 'Completed',
            id: 2,
        },
        {
            key: 2,
            name: 'Cancelled',
            value: 'Cancelled',
            id: 3,
        },
        {
            key: 3,
            name: "In Progress",
            value: "In Progress",
            id: 4,
        },
        {
            key: 4,
            name: "No Show",
            value: "No Show",
            id: 5,
        },
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingAppointments = confirmedAppointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        const appointmentTime = new Date(`1970-01-01T${appointment.time}`);
        const appointmentDateTime = new Date(appointmentDate.getTime() + appointmentTime.getTime());
        return appointmentDateTime >= today;
    });

    const compareAppointments = (a, b) => {
        const dateA = new Date(a.date);
        const timeA = new Date(`1970-01-01T${a.time}`);
        const dateTimeA = new Date(dateA.getTime() + timeA.getTime());

        const dateB = new Date(b.date);
        const timeB = new Date(`1970-01-01T${b.time}`);
        const dateTimeB = new Date(dateB.getTime() + timeB.getTime());

        return dateTimeA - dateTimeB;
    };
    upcomingAppointments.sort(compareAppointments);

    const sortedcompletedAppointments = completedAppointments.slice().sort((a, b) => {
        const cancelDateA = new Date(a.date);
        const cancelDateB = new Date(b.date);
        return cancelDateB - cancelDateA;
    });

    const sortedCancelledAppointments = cancelledAppointments.slice().sort((a, b) => {
        const cancelDateA = new Date(a.date);
        const cancelDateB = new Date(b.date);

        return cancelDateB - cancelDateA;
    });


    const GetAppointmentList = async () => {
        try {
            const body = {
                "userId": Global.userID,
                "patientId": Global.patientID,
                "treatmentCycleId": Global.selectedCycle,
                "status": selectedFilter.value,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true)
            const response = await apiCall('appointments/getappointmentlist', body);
            if (selectedFilter.value === "Confirmed") {
                setConfirmedAppointments(response.appointments);
            } else if (selectedFilter.value === "Completed") {
                setCompletedAppointments(response.appointments);
            } else if (selectedFilter.value == "In Progress") {
                setInProgressAppointment(response.appointments);
            } else if (selectedFilter.value === "Cancelled") {
                setCancelledAppointments(response.appointments);
            } else if (selectedFilter.value === "No Show") {
                setNoShowAppointment(response.appointments);
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    useEffect(() => {
        const filterByTime = transferedGlobalData.filter((value, i) => {
            const ddmmyy = value.date?.split(" ");
            const timeInAmPm = value.time.split(" ");
            const hhmm = timeInAmPm[0].split(":");
            const today = new Date();
            if (today.getDate() == ddmmyy[0]) {
                const hours = today.getHours();
                const minutes = today.getMinutes();
                const appointmentHours = timeInAmPm[1] == "PM" ? (hhmm[0] == 12 ? hhmm[0] : parseInt(hhmm[0]) + 12) : hhmm[0]
                if ((hours < appointmentHours)) {
                    return true;
                } else if ((hours == appointmentHours) && (minutes < hhmm[1])) {
                    return true;
                }
            } else if (today.getDate() < ddmmyy[0]) {
                return true;
            }
        });
        setTransferedGlobalData(filterByTime);
    }, []);

    useEffect(() => {
        GetAppointmentList()
    }, [selectedFilter, Global.selectedCycle])
    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <View style={styles.container}>
                    <Text style={[GlobalStyles.mediumText, Fonts.Nunito_700Bold, { fontSize: responsiveFont(18) }]}>Your Appointments</Text>
                    <Pressable
                        onPress={() => setShowFilterDropdown(preValue => !preValue)}
                        style={({ pressed }) => ([styles.filtercontainer, { opacity: pressed ? 0.4 : 1, width: (selectedFilter == 'Filter') ? widthToDp(28) : widthToDp(32) }])}
                    >
                        <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold, { fontSize: responsiveFont(14) }]}>
                            {selectedFilter.showValue}
                        </Text>
                        <VectorIcons groupName='MaterialCommunityIcons' iconName='filter-variant' iconstyle={[{ color: Colors.primaryTextColor, marginHorizontal: widthToDp(2) }]} />
                    </Pressable>
                    {showFilterDropdown &&
                        <FlatList
                            data={appointmentFilterData}
                            style={[styles.boxcontainer, GlobalStyles.inputBoxShadow]}
                            keyExtractor={(item, index) => "key" + index}
                            renderItem={({ item, index, data }) =>
                                <Pressable
                                    onPress={() => {
                                        setShowFilterDropdown(false);
                                        setSelectedFilter({
                                            showValue: item.value,
                                            value: item.name
                                        });
                                    }}
                                    style={({ pressed }) => ([{
                                        opacity: pressed ? 0.4 : 1,
                                        backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                                        paddingHorizontal: widthToDp(6),
                                        paddingVertical: heightToDp(1),
                                        borderTopWidth: (index == 0) ? 1 : 0,
                                        borderBottomWidth: 1,
                                        borderLeftWidth: 1,
                                        borderColor: 'rgba(60,60,67,0.1)',
                                        borderTopLeftRadius: (index == 0) ? 14 : 0,
                                        borderTopRightRadius: (index == 0) ? 14 : 0,
                                        borderBottomLeftRadius: (index == appointmentFilterData.length - 1) ? 14 : 0,
                                        borderBottomRightRadius: (index == appointmentFilterData.length - 1) ? 14 : 0
                                    }])}>
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>{item.value}</Text>
                                </Pressable>
                            }
                        />}
                </View>
                <AppointmentCard
                    selectedFilter={selectedFilter.value}
                    isCompleted={selectedFilter.value === "Completed"}
                    isCanclled={selectedFilter.value === "Cancelled"}
                    extraStyles={GlobalStyles.fixedTopSpacing}
                    appointmentsData={confirmedAppointments}
                    GetAppointmentList={GetAppointmentList}
                />
                {
                    selectedFilter.value == 'Confirmed' ? (
                        upcomingAppointments.length != 0 ?
                            <AppointmentCard
                                selectedFilter={selectedFilter.value}
                                appointmentsData={upcomingAppointments}
                                isCompleted={false}
                                extraStyles={GlobalStyles.fixedTopSpacing}
                                GetAppointmentList={GetAppointmentList}
                            />
                            :
                            (
                                <View style={styles.noappcontainer}>
                                    <Image
                                        resizeMode='contain'
                                        style={[{ height: heightToDp(12), width: widthToDp(25) }]}
                                        source={require("../assets/vectors/no_data_illustration.png")}
                                    />
                                    <Text style={[GlobalStyles.mediumText, GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold]}>No Appointments!</Text>
                                    <View style={styles.appointmenttext}>
                                        <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                            Click&nbsp;
                                        </Text>
                                        <VectorIcons groupName='MaterialIcons' iconName='add-circle-outline' iconsize={18} />
                                        <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                            &nbsp;to create new appointment
                                        </Text>
                                    </View>
                                </View>
                            )
                    )
                        :
                        selectedFilter.value == 'Completed' ?
                            sortedcompletedAppointments.length != 0 ?
                                <AppointmentCard
                                    selectedFilter={selectedFilter.value}
                                    appointmentsData={sortedcompletedAppointments}
                                    isCompleted={true}
                                    extraStyles={GlobalStyles.fixedTopSpacing}
                                    GetAppointmentList={GetAppointmentList}
                                />
                                :
                                <View style={styles.noappcontainer}>
                                    <Image
                                        resizeMode='contain'
                                        style={[{ height: heightToDp(12), width: widthToDp(25) }]}
                                        source={require("../assets/vectors/no_data_illustration.png")}
                                    />
                                    <Text style={[GlobalStyles.mediumText, GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold]}>No Appointments!</Text>
                                    <View style={styles.appointmenttext}>
                                        <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                            Click&nbsp;
                                        </Text>
                                        <VectorIcons groupName='MaterialIcons' iconName='add-circle-outline' iconsize={18} />
                                        <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                            &nbsp;to create new appointment
                                        </Text>
                                    </View>
                                </View>
                            : selectedFilter.value == 'Cancelled' ? (
                                sortedCancelledAppointments.length != 0 ?
                                    <AppointmentCard
                                        selectedFilter={selectedFilter.value}
                                        appointmentsData={sortedCancelledAppointments}
                                        isCompleted={true}
                                        extraStyles={GlobalStyles.fixedTopSpacing}
                                        GetAppointmentList={GetAppointmentList}
                                    />
                                    :
                                    (
                                        <View style={styles.noappcontainer}>
                                            <Image
                                                resizeMode='contain'
                                                style={[{ height: heightToDp(12), width: widthToDp(25) }]}
                                                source={require("../assets/vectors/no_data_illustration.png")}
                                            />
                                            <Text style={[GlobalStyles.mediumText, GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold]}>No Appointments!</Text>
                                            <View style={styles.appointmenttext}>
                                                <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                                    Click&nbsp;
                                                </Text>
                                                <VectorIcons groupName='MaterialIcons' iconName='add-circle-outline' iconsize={18} />
                                                <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                                    &nbsp;to create new appointment
                                                </Text>
                                            </View>
                                        </View>
                                    )
                            ) : selectedFilter.value == 'In Progress' ? (
                                inProgressAppointment.length != 0 ?
                                    <AppointmentCard
                                        selectedFilter={selectedFilter.value}
                                        appointmentsData={inProgressAppointment}
                                        isCompleted={false}
                                        extraStyles={GlobalStyles.fixedTopSpacing}
                                        GetAppointmentList={GetAppointmentList}
                                    />
                                    :
                                    <View style={styles.noappcontainer}>
                                        <Image
                                            resizeMode='contain'
                                            style={[{ height: heightToDp(12), width: widthToDp(25) }]}
                                            source={require("../assets/vectors/no_data_illustration.png")}
                                        />
                                        <Text style={[GlobalStyles.mediumText, GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold]}>No In Progress Appointments!</Text>
                                        <View style={styles.appointmenttext}>
                                            <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                                Click&nbsp;
                                            </Text>
                                            <VectorIcons groupName='MaterialIcons' iconName='add-circle-outline' iconsize={18} />
                                            <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                                &nbsp;to create new appointment
                                            </Text>
                                        </View>
                                    </View>
                            ) : selectedFilter.value == 'No Show' &&
                                noShowAppointment.length != 0 ?
                                <AppointmentCard
                                    selectedFilter={selectedFilter.value}
                                    appointmentsData={noShowAppointment}
                                    isCompleted={false}
                                    extraStyles={GlobalStyles.fixedTopSpacing}
                                    GetAppointmentList={GetAppointmentList}
                                />
                                :
                                <View style={styles.noappcontainer}>
                                    <Image
                                        resizeMode='contain'
                                        style={[{ height: heightToDp(12), width: widthToDp(25) }]}
                                        source={require("../assets/vectors/no_data_illustration.png")}
                                    />
                                    <Text style={[GlobalStyles.mediumText, GlobalStyles.fixedTopSpacing, Fonts.Nunito_700Bold]}>No No Show Appointments!</Text>
                                    <View style={styles.appointmenttext}>
                                        <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                            Click&nbsp;
                                        </Text>
                                        <VectorIcons groupName='MaterialIcons' iconName='add-circle-outline' iconsize={18} />
                                        <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                            &nbsp;to create new appointment
                                        </Text>
                                    </View>
                                </View>

                }
                <View style={[{ position: 'absolute', bottom: heightToDp(5), right: widthToDp(1) }]}>
                    <Pressable
                        onPress={() => navigation.navigate("CreateAppointment")}
                        style={({ pressed }) => ([styles.newappbutton, { opacity: pressed ? 0.4 : 1 }, GlobalStyles.inputBoxShadow,])}
                    >
                        <VectorIcons groupName='MaterialIcons' iconName='add-circle-outline' iconstyle={[{ color: Colors.primaryButtonColor }]} />
                        <Text style={[GlobalStyles.buttonnormalText, { marginLeft: widthToDp(2) }, Fonts.Nunito_600SemiBold]}>Create Appointment</Text>
                    </Pressable>
                </View>
            </View>
            {<WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />}
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
        </SafeAreaView>
    );
}
const styles = StyleSheet.create(
    {
        container: {
            position: "relative",
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginHorizontal: widthToDp(2),
            marginTop: heightToDp(1),
            zIndex: 99,
        },
        filtercontainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: Colors.boxBackground,
            paddingHorizontal: widthToDp(4),
            paddingVertical: heightToDp(1),
            borderRadius: 14,
        },
        noappcontainer: {
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginTop: heightToDp(12),
        },
        appointmenttext: {
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginTop: heightToDp(2),
        },
        appointmentdesc: {
            color: Colors.primaryinactive,
            fontSize: scale(16),
        },
        newappbutton: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: Colors.defaultBackground,
            paddingHorizontal: widthToDp(4),
            paddingVertical: heightToDp(2),
            borderRadius: 14,
        },
        boxcontainer: {
            position: 'absolute',
            top: heightToDp(5),
            right: 0,
            backgroundColor: Colors.boxBackground,
            borderRadius: 14,
            zIndex: 10
        }
    }
)
export default MyAppointments;