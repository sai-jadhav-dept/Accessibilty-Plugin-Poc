import React, { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, ActivityIndicator, KeyboardAvoidingView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import GlobalStyles from '../utils/GlobalStyles';
import { useNavigation } from '@react-navigation/native';
import Global from './Global';
import { widthToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import Colors from '../utils/Colors';
import { scale, verticalScale } from 'react-native-size-matters';
import Fonts from '../utils/Fonts';
import { convertTimeString } from '../utils/CommonFunctions';
import moment from 'moment';
import Clipboard from '@react-native-community/clipboard';
import ToastMessage from '../components/ToastMessage';

const UserChat = ({ route }) => {
    const navigation = useNavigation();
    const userId = route.params?.userId;
    const userName = route.params?.userName;
    const [message, setMessage] = useState('');
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const flatListRef = useRef(null);
    const [messageRefresh, setMessageRefresh] = useState(false);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [setter, setSetter] = useState(true);
    const [messages, setMessages] = useState(Global.messages[userId]);
    const [selecting, setSelecting] = useState(false);
    const [selectedCount, setSelectedCount] = useState(0);
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessageText, setToastMessageText] = useState("");

    setInterval(() => {
        const timeString = moment().format('DD/MM/YYYY HH:mm');
        setTime(timeString);
    }, 1000);

    const handleShowAlert = (msg) => {
        setToastVisible(true);
        setToastMessageText(msg);
        setTimeout(() => {
            setToastVisible(false);
            setToastMessageText('');
        }, 1500);
    };

    const handleSubmit = () => {
        setSendingMessage(true);
        var toUserID = userId;
        var config = {
            priority: 1 // Set priority for the message. 1: Low (by default). 2: Medium. 3: High.
        };
        var type = 0; // Session type. Values are: 0: One-on-one chat.  1: Chat room  2: Group chat.
        var notification = {
            onMessageAttached: function (onMessage) {
                // toodo: Loading
            }
        };

        // Send one-to-one text messages. 
        var messageTextObj = { type: 1, message: message };
        Global.zim.sendMessage(messageTextObj, toUserID, type, config, notification)
            .then(function ({ zimMessage }) {
                // Message sent successfully.
                if (messages == undefined) {
                    Global.messages[userId] = [];
                    if (message.trim() != "") {
                        setMessages([{
                            id: messages == undefined ? 1 : messages.length + 1,
                            message: `${message.trim()}`,
                            time: `${time}`,
                            senderId: "reciever",
                            viewed: false,
                            selected: false,
                        }]);
                        setMessage('');
                        Global.messages[userId] = messages;
                        setSetter(true);
                    }
                } else {
                    if (message.trim() != "") {
                        let allMessages = [{
                            id: messages.length + 1,
                            message: `${message.trim()}`,
                            time: `${time}`,
                            senderId: "reciever",
                            viewed: false,
                            selected: false,
                        }];
                        for (const message of messages) {
                            allMessages.push(message);
                        }
                        setMessages(allMessages);
                        setMessage('');
                        Global.messages[userId] = allMessages;
                        setSetter(true);
                    }
                }
                setSendingMessage(false);
            })
            .catch(function (err) {
                // Failed to send the message.
                setSendingMessage(false);
                console.log(err);
            });
    };

    useEffect(() => {//history messages
        // 3. Query the message history. 
        Global.setMessageRefresh = setMessageRefresh;

        var conversationID = userId;
        var conversationType = 0;
        // Queries session history messages from late to early. The number of historical messages is 30 at a time.
        var config = {
            nextMessage: null, // NextMessage is null on the first query.
            count: 30,
            reverse: true
        }

        function queryMessageCallback({ messageList }) {
            let myMessages = [];
            for (const message of messageList) {
                myMessages.push({
                    id: message.messageID,
                    message: message.message,
                    time: convertTimeString(message.timestamp),
                    senderId: message.direction ? "sender" : "receiver",
                    viewed: false,
                    selected: false,
                });
            }
            myMessages = myMessages.reverse();
            Global.messages[userId] = myMessages;
            setMessages(myMessages);

            // When you scroll down to a message at the top of the screen, you can search for earlier messages.    if (fetchMore && messageList.length > 0) {
            // In subsequent paging queries, nextMessage is the last message in the list of messages currently queried.
            //         config.nextMessage = messageList[messageList.length - 1];
            //         zim.queryHistoryMessage(conversationID, conversationType, config).then(queryMessageCallback);
            //     }
        }

        Global.zim.queryHistoryMessage(conversationID, conversationType, config).then(queryMessageCallback);

        return () => {
            Global.setMessageRefresh = false;
        }

    }, []);

    useEffect(() => {
        try {
            setMessages(Global.messages[userId]);
        } catch (e) {
            console.log(e, selectedCount);
        }
    }, [messageRefresh]);


    useEffect(() => {
        Global.messages[userId] = messages;
        setSetter(false);
    }, [setter])

    const clearSelection = () => {
        const allMessages = messages.map((message) => ({
            ...message,
            selected: false
        }));
        setMessages(allMessages);
        setSelecting(false);
        setSelectedCount(0);
    };

    const selectMessage = (item) => {
        const allMessages = messages.map((message) => {
            if (item.id === message.id) {
                let updatedMessage = { ...message, selected: !message.selected };
                if (updatedMessage.selected) {
                    setSelectedCount((val) => val + 1);
                } else {
                    setSelectedCount((val) => {
                        if (val === 1) {
                            setSelecting(false);
                        }
                        return val - 1;
                    });
                }
                return updatedMessage;
            } else {
                return message;
            }
        });
        setMessages(allMessages);
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Global.OS === "ios" ? 'padding' : null}>
            <SafeAreaView style={GlobalStyles.mainContainer}>
                <View style={[GlobalStyles.mainBox, { marginBottom: widthToDp(2) }]}>
                    <View style={[styles.headerContainer,]}>
                        <View style={{ flexDirection: 'row', }}>
                            <Pressable
                                style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }, styles.headerBackArrowContainer])}
                                onPress={() => navigation.replace("HopeConnect", { refreshing: true, selectedOption: "CHAT" })}>
                                <VectorIcons groupName='AntDesign' iconName="arrowleft" iconstyle={{ color: Colors.primaryTextColor }} />
                            </Pressable>
                            <Text style={[GlobalStyles.largeText, styles.headerTitle, Fonts.Nunito_700Bold,]}>
                                {userName}
                            </Text>
                        </View>
                        {
                            selecting ?
                                <View style={{ flexDirection: 'row', }}>
                                    <Pressable style={({ pressed }) => ([
                                        {
                                            opacity: pressed ? 0.5 : 1,
                                        }
                                    ])}
                                        onPress={() => {
                                            let copyMessages = '';
                                            for (let i = messages.length - 1; i >= 0; i--) {
                                                if (messages[i].selected) {
                                                    copyMessages += "[" + messages[i].time + "]" + '\n';
                                                    copyMessages += messages[i].senderId == 'sender' ? userName : "You";
                                                    copyMessages += ": " + messages[i].message + "\n";
                                                }
                                            }
                                            Clipboard.setString(copyMessages);
                                            handleShowAlert("Copied to clipboard");
                                            clearSelection();
                                        }}
                                    >
                                        <Text style={[GlobalStyles.smallText, styles.headerTitle, Fonts.Nunito_400Regular, { color: Colors.primaryButtonColor, }]}>
                                            Copy
                                        </Text>
                                    </Pressable>
                                    <Pressable style={({ pressed }) => ([
                                        {
                                            opacity: pressed ? 0.5 : 1,
                                            marginLeft: widthToDp(3),
                                        }
                                    ])}
                                        onPress={clearSelection}>
                                        <Text style={[GlobalStyles.smallText, styles.headerTitle, Fonts.Nunito_400Regular, { color: Colors.red }]}>
                                            Clear
                                        </Text>
                                    </Pressable>
                                </View>
                                : null
                        }
                    </View>
                    <View style={[{ flex: 1, justifyContent: 'flex-end' }]}>
                        <View>
                            <FlatList
                                ref={flatListRef}
                                showsVerticalScrollIndicator={false}
                                data={messages}
                                inverted
                                renderItem={({ item }) => (
                                    <Pressable
                                        onLongPress={() => {
                                            setSelecting(true);
                                            selectMessage(item);
                                        }}
                                        onPress={() => {
                                            if (selecting) {
                                                selectMessage(item);
                                            }
                                        }}
                                        style={({ pressed }) => ([
                                            {
                                                opacity: pressed ? 0.7 : 1,
                                            },
                                            item.selected && { backgroundColor: Colors.lightblue }
                                        ])}
                                    >
                                        <View style={{ alignItems: "center", paddingHorizontal: widthToDp(4), width: "100%" }}>
                                            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.extrasmallText]}>
                                                {item.time}
                                            </Text>
                                        </View>
                                        <View style={[item.senderId == "sender" ? styles.messageContainerSender : styles.messageContainerReciever, { maxWidth: "75%", position: "relative", borderRadius: message.length <= 50 ? 50 : 14 }]}>
                                            <Text style={[item.senderId == "sender" ? styles.messageTextSender : styles.messageTextReciever, Fonts.Nunito_600SemiBold]}>{item.message}</Text>
                                        </View>
                                    </Pressable>
                                )}
                            />
                        </View>
                    </View>
                    <View style={{ flexDirection: "row", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
                        {/* <VectorIcons groupName='AntDesign' iconName="smile-circle" iconsize={scale(25)} /> */}
                        <View style={[styles.inputContainer, { flexDirection: "row", justifyContent: "space-between", width: "100%" }]}>
                            <TextInput
                                style={[styles.input, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { width: message.length == 0 ? "63%" : "90%", height: Global.OS == "ios" ? verticalScale(45) : null }]}
                                value={message}
                                placeholderTextColor={Colors.placeholderTextColor}
                                editable
                                onChangeText={(text) => setMessage(text)}
                                placeholder="Type a message..."
                            />
                            {message.length == 0 ?
                                <View style={{ flexDirection: "row", width: widthToDp(25), justifyContent: "space-between", alignItems: "center" }}>
                                    {/* <VectorIcons groupName='FontAwesome' iconName="camera" />
                                <VectorIcons groupName='Entypo' iconName="attachment" />
                                <VectorIcons groupName='FontAwesome' iconName="microphone" /> */}
                                </View> :
                                <View style={{ flexDirection: "row", width: widthToDp(8), justifyContent: "space-between", alignItems: "center" }}>
                                    {/* <VectorIcons groupName='Entypo' iconName="attachment" /> */}
                                    {
                                        sendingMessage ?
                                            (<ActivityIndicator size={'large'} color={Colors.primaryButtonColor} />)
                                            :
                                            (<Pressable onPress={handleSubmit}>
                                                <VectorIcons groupName='Ionicons' iconName="send" iconstyle={{ color: Colors.primaryButtonColor }} />
                                            </Pressable>)
                                    }
                                </View>
                            }
                        </View>
                    </View>
                </View>
                <ToastMessage visible={toastVisible} text={toastMessageText} />
            </SafeAreaView>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    messageContainerSender: {
        padding: 10,
        margin: 5,
        backgroundColor: Colors.textInputBorder,
        borderRadius: 50,
        alignSelf: "flex-start",
        paddingHorizontal: widthToDp(4),
        maxWidth: "80%",
    },
    messageContainerReciever: {
        padding: 10,
        margin: 5,
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 50,
        alignSelf: "flex-end",
        paddingHorizontal: widthToDp(4),
        maxWidth: "80%",
    },
    messageTextReciever: {
        fontSize: scale(14),
        color: Colors.boxBackground,
        lineHeight: scale(16),
    },
    messageTextSender: {
        fontSize: scale(14),
        color: Colors.primaryTextColor,
        lineHeight: scale(16),
    },
    inputContainer: {
        paddingHorizontal: widthToDp(4),
        borderRadius: 14,
        borderWidth: 1,
        borderColor: Colors.textInputBorder,
    },
    input: {
        paddingHorizontal: widthToDp(2),
        minHeight: 20,
        maxHeight: 50,
    },
    headerContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        justifyContent: 'space-between'
    },
    headerBackArrowContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: widthToDp(2),
    },
    headerTitle: {
        marginLeft: widthToDp(1),
    },
});

export default UserChat;