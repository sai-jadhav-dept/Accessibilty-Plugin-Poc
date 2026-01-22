import React, { useState } from 'react';
import { View, Text, Image, Pressable, TextInput } from 'react-native';
import { scale, ScaledSheet, verticalScale } from 'react-native-size-matters';
import Colors from '../utils/Colors';
import { heightToDp, widthToDp } from '../utils/Responsive';
import VectorIcons from './VectorIcons';
import Fonts from '../utils/Fonts';
import { useNavigation } from '@react-navigation/native';
import GlobalStyles from '../utils/GlobalStyles';
import WarningModal from '../components/WarningModal';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import Global from '../screens/Global';
import { apiCall } from '../utils/ApiUtils';
import FastImage from 'react-native-fast-image';

export default function DiscussionsCard(props) {
    const Navigator = useNavigation();
    const [repliesText, setRepliesText] = useState("");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const emogiRegex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32-\ude3a]|[\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    const addComment = async () => {
        if (!Global.clicked) {
            Global.clicked = true;
            if (repliesText.trim() == "") {
                DisplayError("Please enter text in comment field");
            }
            else if (repliesText != "" && emogiRegex.test(repliesText)) {
                DisplayError("Please enter valid comment");
            }
            else {
                const body = {
                    "userId": Global.userID,
                    "forumId": props.data.id.trim(),
                    "comment": repliesText.trim(),
                    "coord": [
                        "24.623061",
                        "10.830960"
                    ],
                    "location": "Mumbai",
                    "deviceInfo": Global.OS
                }
                try {
                    setLoading(true);
                    await apiCall('forum/addcomment', body);
                    setRepliesText("");
                    setLoading(false);
                } catch (error) {
                    setLoading(false);
                    DisplayError(e.msg || "Something went wrong, please try again");
                }
            }
            Global.clicked = false;
        }
    }

    const handleLatestDiscussionnavigation = () => {
        Navigator.navigate("LatestDiscussion", { selectedId: props.data.id, index: props.index });
    }

    return (
        <View style={[styles.shadow, styles.DiscussionsCard]} key={props.index}>
            {props.data.length == 0 ? (
                <View>
                    <Text>Sorry No Data</Text>
                </View>
            )
                : (
                    <View key={props.index}>
                        <View style={{ flexDirection: "row", alignItems: "center" }}>
                            <View style={[styles.shadow, { width: widthToDp(10), height: widthToDp(10), backgroundColor: Colors.placeholderTextColor, borderRadius: 14 }]}>
                                {
                                    props?.data?.profilePath == "" ?
                                        <Image resizeMode="contain" style={styles.photo} source={require('../assets/images/profile.png')} />
                                        :
                                        <FastImage resizeMode={FastImage.resizeMode.cover} style={styles.photo} source={{ uri: props?.data?.profilePath }} />
                                }
                            </View>
                            <View style={{ marginLeft: widthToDp(4) }}>
                                <Text style={[Fonts.Nunito_600SemiBold, { fontSize: scale(14) }]}>{props.data.startedBy}</Text>
                                <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText]}>{props.data.username}</Text>
                            </View>
                        </View>
                        <Text style={[Fonts.Nunito_700Bold, GlobalStyles.smallText, GlobalStyles.fixedTopSpacing]}>{props.data.title}</Text>
                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.extrasmallText]} >Category : {props.data.category}</Text>
                        <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.extrasmallText]} numberOfLines={2}>{props.data.description}</Text>
                        <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }])}
                            onPress={() => handleLatestDiscussionnavigation()}>
                            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.buttonsmallText, { marginVertical: heightToDp(2) }]}>View all replies</Text>
                        </Pressable>
                        <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: Colors.placeholderTextColor, borderRadius: 14, paddingHorizontal: widthToDp(4) }}>
                            <TextInput
                                onChangeText={(text) => { setRepliesText(text) }}
                                value={repliesText}
                                placeholder='Add a reply...'
                                placeholderTextColor={Colors.placeholderTextColor}
                                style={[{ width: "90%", height: Global.OS == "ios" ? verticalScale(30) : null }, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                            />
                            <Pressable onPress={addComment}>
                                {
                                    repliesText == "" ?
                                        <Image resizeMode="contain" style={{ height: heightToDp(3) }} source={require('../assets/images/Vector.png')} />
                                        : 
                                        <VectorIcons groupName='Ionicons' iconName="send" iconstyle={{ color: Colors.primaryButtonColor }} />
                                }
                            </Pressable>
                        </View>
                    </View>)
            }
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
        </View>
    )
}

const styles = ScaledSheet.create({
    DiscussionsCard: {
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        padding: widthToDp(4),
        marginVertical: heightToDp(2),
    },
    shadow: {
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    photo: {
        width: widthToDp(10),
        height: widthToDp(10),
        borderRadius: 14
    }
});