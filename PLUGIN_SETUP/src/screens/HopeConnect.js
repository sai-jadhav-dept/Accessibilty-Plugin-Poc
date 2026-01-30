import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, SafeAreaView, Pressable, Dimensions, Keyboard } from 'react-native'
import GlobalStyles from '../utils/GlobalStyles'
import { widthToDp, heightToDp } from '../utils/Responsive';
import { useNavigation } from '@react-navigation/native';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import Header from '../components/Header'
import Footer from '../components/Footer';
import VectorIcons from '../components/VectorIcons';
import { scale } from 'react-native-size-matters';
import Articles from './Articles';
import Forum from './Forum';
import Spinner from 'react-native-loading-spinner-overlay';
import WarningModal from '../components/WarningModal';
import Global from './Global';
import Loader from '../components/Loader';
import { apiCall } from '../utils/ApiUtils';
import FastImage from 'react-native-fast-image';
import { convertTimeString } from '../utils/CommonFunctions';

const windowHeight = Dimensions.get('window').height;
export default function HopeConnect(props) {
    const navigation = useNavigation();
    const [selectedOption, setSelectedOption] = useState();
    const [displayBottomButton, setDisplayBottomButton] = useState(true);
    const [requestList, setRequestList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [chatList, setChatList] = useState([]);
    let [topMenus, setTopMenus] = useState([
        {
            key: 0,
            id: 1,
            menu: 'CHAT',
            isSelected: true,
            iconName: 'chatbubble-ellipses-outline',
            groupName: 'Ionicons',
        },
        {
            key: 1,
            id: 2,
            menu: 'FORUM',
            isSelected: false,
            iconName: 'chatbubbles-outline',
            groupName: 'Ionicons',
        },
        {
            key: 2,
            id: 3,
            menu: 'ARTICLES',
            isSelected: false,
            iconName: 'newspaper-o',
            groupName: 'FontAwesome',
        },
    ])
    const [suggestionOption, setSuggestionOption] = useState([
        {
            optionName: 'Photos',
            key: 0,
            id: 1,
            isSelected: false,
        },
        {
            optionName: 'Videos',
            key: 1,
            id: 2,
            isSelected: false,
        },
        {
            optionName: 'Links',
            key: 2,
            id: 3,
            isSelected: false,
        },
        {
            optionName: 'GIFs',
            key: 3,
            id: 4,
            isSelected: false,
        },
        {
            optionName: 'Audio',
            key: 4,
            id: 5,
            isSelected: false,
        },
        {
            optionName: 'Documents',
            key: 5,
            id: 6,
            isSelected: false,
        },
    ]);

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }
    useEffect(() => {
        getConnectedUserList();
    }, [])

    const getConversationList = (userData) => {
        return new Promise((res, rej) => {
            try {
                var config = {
                    // The conversation flag. If it is set to `null`, the flag is the latest conversation.
                    nextConversation: null,
                    // The number of conversations queried per page.
                    count: 20
                };

                // Pull the conversation list.
                Global.zim.queryConversationList(config)
                    .then(function ({ conversationList }) {
                        for (let i = 0; i < userData.length; i++) {
                            const lastMessage = conversationList.find((item) => item.conversationID == userData[i].userResponseId);
                            if (lastMessage && lastMessage.lastMessage !== null) {
                                userData[i].lastMessage = lastMessage.lastMessage.message;
                                userData[i].lastMessageTime = lastMessage.lastMessage.timestamp;
                            } else {
                                userData[i].lastMessage = '';
                                userData[i].lastMessageTime = '';
                            }

                            userData[i].lastMessage = lastMessage ? lastMessage?.lastMessage?.message : '';
                            userData[i].lastMessageTime = lastMessage ? lastMessage?.lastMessage?.timestamp : '';
                        }
                        setChatList(userData);
                        // Query succeeded. You need to store and maintain the conversation objects in the array.
                        res(true);
                    })
                    .catch(function (err) {
                        // Query failed.
                        console.log(err);
                        res(false);
                    })
            } catch (e) {
                console.log(e);
                res(false);
            }
        })

    }

    const getConnectedUserList = async () => {
        try {
            const body = {
                "userId": Global.userID,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": "android"
            }
            setLoading(true);
            const response = await apiCall('connect/getconnecteduserlist', body);
            await getConversationList(response.userData);
            setLoading(false);
        } catch (e) {
            setLoading(false);
            DisplayError(e.msg || "Something went wrong, please try again");
        }
    }

    let suggestion = false;
    useEffect(() => {
        setSelectedOption(props.route.params?.selectedOption);
        topMenus.forEach((value) => {
            if (value.menu == props.route.params?.selectedOption) {
                value.isSelected = true;
            } else {
                value.isSelected = false;
            }
        });
        suggestionOption.forEach((value) => {
            value.isSelected = false;
        });
    }, [suggestion]);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (() => {
            setDisplayBottomButton(false);
        }));
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setDisplayBottomButton(true);
        });
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        }
    }, []);

    const MenuSelecter = (item, index) => {
        setTopMenus(prevState => {
            const nextState = prevState.map((question, i) => {
                if (i === index) {
                    question.isSelected = !question.isSelected;
                } else {
                    question.isSelected = false;
                }
                return question;
            });

            return nextState;
        });
    };

    const removeReqCard = (reqId) => {
        const updatedList = requestList.filter((value, i) => {
            return value.id != reqId;
        });
        setRequestList(updatedList);
    }

    const updateConnetRequest = async (status, Id) => {
        if (!Global.clicked) {
            Global.clicked = true;
            try {
                const body = {
                    "requestId": Id,
                    "status": status.toString(),
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                }
                setLoading(true);
                await apiCall('connect/updateconnetrequest', body);
                setLoading(false);
                removeReqCard(Id);
                getConnectedUserList();
            } catch (error) {
                setLoading(false);
                DisplayError(error.msg || "Something went wrong, please try again");
            }
            Global.clicked = false;
        }
    }

    const getConnectRequestList = async () => {
        try {
            const body = {
                "userId": Global.userID,
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            const response = await apiCall('connect/getconnectrequestlist', body);
            setRequestList(response.userData);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const formatDate = (requestedOn) => {
        const currentDate = new Date();
        const requestedDate = new Date(requestedOn);
        const timeDiff = currentDate.getTime() - requestedDate.getTime();
        const oneDayInMillis = 24 * 60 * 60 * 1000;

        if (timeDiff < oneDayInMillis) {
            const hours = requestedDate.getHours();
            const minutes = requestedDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes.toString().padStart(2, '0');
            return `${formattedHours}:${formattedMinutes} ${ampm}`;
        } else if (timeDiff < 2 * oneDayInMillis) {
            return 'Yesterday';
        } else {
            const day = requestedDate.getDate().toString().padStart(2, '0');
            const month = requestedDate.toLocaleString('default', { month: 'long' });
            const year = requestedDate.getFullYear();
            return `${day} ${month} ${year}`;
        }
    };

    requestList.sort((a, b) => new Date(b.requestedOn) - new Date(a.requestedOn));

    useEffect(() => {
        if (selectedOption != "ARTICLES") {
            getConnectRequestList();
        }
    }, [selectedOption])

    const onOptionSelect = (item) => {
        const newArr = suggestionOption.map((value, i) => {
            if (value.id === item.id) {
                value.isSelected = !value.isSelected;
            }
            return value;
        });

        setSuggestionOption(newArr);
    };

    const refreshButton = async () => {
        if (!Global.clicked) {
            Global.clicked = true;
            await getConnectedUserList();
            await getConnectRequestList();
            Global.clicked = false;
        }
    };

    const handleCarecircleSearchNavigation = () => {
        navigation.navigate("CareCircleSearch", { fromConnect: true })
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={{ zIndex: 999, marginHorizontal: widthToDp(4) }}>
                <Header headerTitle="Connect"
                    onPress={() => {
                        if (props?.route?.params?.fromScreen == "DiseaseSearch") {
                            navigation.replace("DiseaseSearch", { fromCareCircle: props.route.params.fromCareCircle, personData: props.route.params.personData });
                        } else {
                            navigation.navigate("Dashboard");
                        }
                    }}
                />
                <View style={[{
                    flexDirection: 'row',
                    justifyContent: "center",
                    width: '110%',
                    alignSelf: "center",
                    marginTop: heightToDp(2)
                }]}>
                    {
                        topMenus.map((item, index) =>
                            <Pressable
                                key={item.id}
                                onPress={() => {
                                    if (!item.isSelected) {
                                        MenuSelecter(item, index);
                                        setSelectedOption(item.menu);
                                    }
                                }}
                                style={({ pressed }) => ([{
                                    opacity: pressed ? 0.7 : 1,
                                    flex: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderBottomWidth: 2,
                                    borderBottomColor: item.isSelected ? Colors.primaryButtonColor : Colors.boxBackground
                                }])}>
                                <VectorIcons groupName={item.groupName} iconName={item.iconName}
                                    iconsize={widthToDp(7)}
                                    iconstyle={{ color: item.isSelected ? Colors.primaryButtonColor : Colors.primaryTextColor }} />
                                <Text style={[{
                                    fontSize: scale(14),
                                    color: item.isSelected ? Colors.primaryButtonColor : Colors.primaryTextColor,
                                    marginVertical: heightToDp(1)
                                },
                                Fonts.Nunito_600SemiBold
                                ]}>
                                    {item.menu}
                                </Text>
                            </Pressable>
                        )
                    }
                </View>
            </View>
            <ScrollView keyboardShouldPersistTaps={"handled"} contentContainerStyle={{ flexGrow: windowHeight - 100 }} nestedScrollEnabled={true}>
                {selectedOption == "CHAT" ? <View style={styles.searchContainer}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Pressable style={({ pressed }) => ([styles.Button, GlobalStyles.inputBoxShadow, { backgroundColor: Colors.defaultBackground, opacity: pressed ? 0.4 : 1, marginTop: heightToDp(2), borderRadius: 14, width: "83%" }])}
                            onPress={() => handleCarecircleSearchNavigation()}
                        >
                            <View style={[{ flexDirection: "row", paddingVertical: heightToDp(2), paddingHorizontal: widthToDp(4), alignItems: "center" }]}>
                                <VectorIcons groupName='AntDesign' iconName={'search1'}
                                    iconsize={widthToDp(5)}
                                    iconstyle={[{ color: Colors.placeholderTextColor, marginRight: widthToDp(2) }]}
                                />
                                <Text style={[Fonts.Nunito_400Regular, GlobalStyles.normalText, { color: Colors.placeholderTextColor, marginLeft: widthToDp(1) }]}>
                                    Search by name
                                </Text>
                            </View>
                        </Pressable>
                        <Pressable hitSlop={15} style={({ pressed }) => ([GlobalStyles.fixedTopSpacing, styles.refresh, { opacity: pressed ? 0.4 : 1 }])} onPress={async () => { await refreshButton() }}>
                            <VectorIcons groupName='FontAwesome' iconName='refresh' iconstyle={[{ color: Colors.primaryTextColor }]} iconsize={scale(20)} />
                        </Pressable>
                    </View>
                    {suggestion ?
                        <View
                            style={[GlobalStyles.inputBoxShadow, GlobalStyles.columnFlexstart,
                            {
                                backgroundColor: Colors.boxBackground,
                                width: '100%',
                                borderRadius: 14,
                                borderTopLeftRadius: 0,
                                borderTopRightRadius: 0,
                                borderTopColor: Colors.textInputBorder,
                                borderTopWidth: 1.5
                            }]}
                        >
                            <View style={[{
                                flexDirection: 'row',
                                alignItems: 'center',
                                width: '100%',
                                flexWrap: "wrap",
                                paddingVertical: heightToDp(1)
                            }]}>
                                {suggestionOption.map((item, index) => (
                                    <Pressable key={item.id}
                                        onPress={() => onOptionSelect(item)}
                                        style={({ pressed }) => [{
                                            opacity: pressed ? 0.5 : 1,
                                            backgroundColor: item.isSelected ? Colors.primaryButtonColor : Colors.boxBackground,
                                            paddingVertical: heightToDp(1),
                                            paddingHorizontal: widthToDp(4),
                                            borderRadius: 14,
                                            marginLeft: widthToDp(2),
                                            marginTop: widthToDp(4)
                                        }]}>
                                        <Text style={[{
                                            color: item.isSelected ? Colors.boxBackground : Colors.primaryTextColor,
                                            fontSize: scale(14)
                                        },
                                        Fonts.Nunito_600SemiBold
                                        ]}>
                                            {item.optionName}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                        : null
                    }
                    {
                        requestList.length > 0 && (
                            requestList.map((item, index) => {
                                return (
                                    <View style={[styles.mainContainer]} key={index}>
                                        <View style={[{ flexDirection: 'row', justifyContent: 'flex-start' }, GlobalStyles.inputBoxShadow]}>
                                            <View style={[{
                                                position: 'relative',
                                                width: widthToDp(14),
                                                height: heightToDp(6)
                                            }]}>
                                                <FastImage
                                                    resizeMode={FastImage.resizeMode.cover}
                                                    style={styles.profileImage}
                                                    source={item.profilePath !== "" ? { uri: item.profilePath } : require("../assets/images/profile.png")}
                                                />
                                                <View style={styles.underline} />
                                            </View>
                                            <View style={[GlobalStyles.rowFlexstart, { flex: 1 }]}>
                                                <View style={[{
                                                    flexDirection: 'column',
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'flex-start',
                                                    flex: 1,
                                                    marginRight: widthToDp(2),
                                                    borderBottomRightRadius: 0,
                                                    borderBottomLeftRadius: 0
                                                }]}>
                                                    <View style={{ flexDirection: 'row', width: '97%', justifyContent: 'space-between' }}>
                                                        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', }}>
                                                            <Text style={[GlobalStyles.normalText, { marginBottom: heightToDp(0.5) }, Fonts.Nunito_700Bold]}>
                                                                {item.firstName + " "}
                                                            </Text>
                                                            <Text style={[GlobalStyles.normalText, { marginBottom: heightToDp(0.5) }, Fonts.Nunito_700Bold]}>
                                                                {item.lastName}
                                                            </Text>
                                                        </View>
                                                        <Text style={[{ color: 'rgba(45, 49, 66, 0.8)', fontSize: scale(12) }, Fonts.Nunito_600SemiBold]}>
                                                            {formatDate(item.requestedOn)}
                                                        </Text>
                                                    </View>
                                                    <Text numberOfLines={3} style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>
                                                        {item.firstName} {item.lastName} wants to be in your connection
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginLeft: '20%', marginVertical: heightToDp(1) }}>
                                            <Pressable
                                                onPress={async () => {
                                                    await updateConnetRequest(2, item.id);
                                                }}
                                                style={({ pressed }) => ([GlobalStyles.rowFlexstart, {
                                                    paddingHorizontal: widthToDp(4),
                                                    paddingVertical: heightToDp(2),
                                                    backgroundColor: pressed ? Colors.textInputBorder : Colors.boxBackground,
                                                    borderRadius: 14
                                                },
                                                GlobalStyles.inputBoxShadow
                                                ])}>
                                                <VectorIcons groupName='Ionicons' iconName='close' iconsize={scale(17)} iconstyle={[{ color: Colors.red }]} />
                                                <Text style={[{ marginLeft: 4, color: Colors.red, fontSize: scale(12) }, Fonts.Nunito_600SemiBold]}>
                                                    Decline
                                                </Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={async () => { await updateConnetRequest(1, item.id); }}
                                                style={({ pressed }) => ([GlobalStyles.rowFlexstart,
                                                {
                                                    paddingHorizontal: widthToDp(4),
                                                    paddingVertical: heightToDp(2),
                                                    backgroundColor: pressed ? Colors.textInputBorder : Colors.primaryButtonColor,
                                                    borderRadius: 14,
                                                    marginLeft: widthToDp(4)
                                                },
                                                GlobalStyles.inputBoxShadow
                                                ])}>
                                                <VectorIcons groupName='Feather' iconName='check' iconsize={widthToDp(5)} iconstyle={[{ color: Colors.boxBackground }]} />
                                                <Text style={[GlobalStyles.backgroundextrasmallText, { marginLeft: 4 }, Fonts.Nunito_600SemiBold]}>
                                                    Accept
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                )
                            }))
                    }
                    {
                        requestList.length > 0 && (
                            <View style={{ height: 2, backgroundColor: Colors.textInputBorder, marginTop: widthToDp(3), marginBottom: heightToDp(2) }}>
                            </View>)
                    }
                    {chatList.length > 0 &&
                        <View style={{ marginTop: heightToDp(2), }}>
                            <Text style={[Fonts.Nunito_700Bold, GlobalStyles.extralargeText, { marginBottom: heightToDp(2) }]}>New Chats</Text>
                            {
                                chatList.map((item, index) =>
                                    <Pressable
                                        key={item.id}
                                        onPress={() => {
                                            navigation.replace("UserChat", { userId: item.userResponseId, userName: `${item.firstName} ${item.lastName}`, });
                                        }}
                                        style={({ pressed }) => ([GlobalStyles.rowFlexstart, {
                                            marginBottom: chatList.length - 1 == index ? heightToDp(6) : heightToDp(2),
                                            padding: widthToDp(2),
                                            backgroundColor: pressed ? Colors.primaryinactive : Colors.defaultBackground,
                                            borderRadius: 14
                                        },
                                        GlobalStyles.inputBoxShadow,
                                        ])}>
                                        <View style={[{ position: 'relative' }]}>
                                            <FastImage
                                                resizeMode={FastImage.resizeMode.cover}
                                                style={[{
                                                    width: widthToDp(11),
                                                    height: heightToDp(6),
                                                    marginRight: widthToDp(2),
                                                    borderRadius: 50

                                                }]}
                                                source={item.profilePicturePath == "" ? require('../assets/images/profile.png') : { uri: item.profilePicturePath }}
                                            />
                                            {/* <View style={[{
                                                backgroundColor: Colors.primaryButtonColor,
                                                height: 12,
                                                width: 12,
                                                borderRadius: 50,
                                                position: 'absolute',
                                                bottom: -heightToDp(0.5),
                                                right: widthToDp(2),
                                                zIndex: 999
                                            }]} /> */}
                                        </View>
                                        <View style={[GlobalStyles.rowFlexstart, { flex: 1 }]}>
                                            <View style={[{
                                                flexDirection: 'column',
                                                justifyContent: 'flex-start',
                                                alignItems: 'flex-start',
                                                flex: 1,
                                                marginRight: widthToDp(2),
                                                marginLeft: widthToDp(2)
                                            }]}>
                                                <View style={{ width: '100%' }} >
                                                    <Text numberOfLines={1} style={[GlobalStyles.normalText, { marginBottom: heightToDp(0.5) }, Fonts.Nunito_700Bold]}>
                                                        {item.firstName} {item.lastName}
                                                    </Text>
                                                    <Text numberOfLines={1}
                                                        style={[
                                                            GlobalStyles.smallText,
                                                            { paddingBottom: heightToDp(1), width: '100%', }
                                                        ]}>
                                                        {item.lastMessage}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={GlobalStyles.columnFlexstart}>
                                                <Text style={[{ color: 'rgba(45, 49, 66, 0.8)', fontSize: scale(12), flex: 1 }, Fonts.Nunito_600SemiBold]}>
                                                    {item.lastMessageTime ? convertTimeString(item.lastMessageTime) : ''}
                                                </Text>
                                            </View>
                                        </View>
                                    </Pressable>
                                )
                            }
                        </View>
                    }
                    {chatList.length > 0 || requestList.length > 0 ? null :
                        <View style={styles.appointmenttext}>
                            <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                Click&nbsp;
                            </Text>
                            <VectorIcons groupName='MaterialIcons' iconName='search' iconsize={18} />
                            <Text style={[styles.appointmentdesc, Fonts.Nunito_300Light]}>
                                &nbsp;to Add New Chats
                            </Text>
                        </View>
                    }
                </View> : selectedOption == "FORUM" ? <Forum cardData={props.route.params} />
                    : selectedOption == "ARTICLES" ? <View style={{ padding: widthToDp(4) }}><Articles /></View> : null}
            </ScrollView>
            {displayBottomButton && <Footer navigation={navigation} />}
            {
                selectedOption == "FORUM" && displayBottomButton &&
                <Pressable style={[styles.startBtn, { bottom: Global.OS == "ios" ? heightToDp(18) : heightToDp(14) }]}
                    onPress={() => { navigation.replace("StartDiscussion"); }}>
                    <VectorIcons groupName={"MaterialIcons"} iconName={"add-circle-outline"} iconstyle={{ color: Colors.boxBackground }} />
                    <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.backgroundsmallText, { marginLeft: widthToDp(3) }]}>Start New Thread</Text>
                </Pressable>
            }
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    searchContainer: {
        flex: 1,
        marginHorizontal: widthToDp(1),
        width: "90%",
        alignSelf: "center"
    },
    mainContainer: {
        alignItems: 'center',
        padding: widthToDp(2),
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        marginTop: heightToDp(2)
    },
    profileImage: {
        width: widthToDp(11),
        height: heightToDp(6),
        marginRight: widthToDp(2),
        borderRadius: 14
    },
    underline: {
        position: "absolute",
        backgroundColor: Colors.primaryButtonColor,
        height: 12,
        width: 12,
        borderRadius: 50,
        bottom: 0,
        right: widthToDp(3),
        zIndex: 999
    },
    refresh: {
        width: "15%",
        alignItems: "center",
        justifyContent: "center"
    },
    startBtn: {
        position: "absolute",
        right: widthToDp(5),
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Colors.primaryButtonColor,
        padding: widthToDp(2),
        borderRadius: 14,
        minWidth: widthToDp(45)
    },
    appointmenttext: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    appointmentdesc: {
        color: Colors.primaryinactive,
        fontSize: scale(16),
    }
});
