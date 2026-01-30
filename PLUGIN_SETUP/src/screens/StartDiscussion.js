import React, { useEffect, useState } from 'react';
import { View, SafeAreaView, ScrollView, TextInput } from 'react-native';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
import GlobalStyles from '../utils/GlobalStyles';
import { heightToDp, widthToDp } from '../utils/Responsive';
import { ScaledSheet, verticalScale } from 'react-native-size-matters';
import { Dropdown } from 'react-native-element-dropdown';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import CommonButton from '../components/CommonButton';
import Global from './Global';
import FieldLabel from '../components/FieldLabel';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import { apiCall } from '../utils/ApiUtils';

export default function StartDiscussion() {
    const navigation = useNavigation();
    const [selectedCategory, setSelectedCategory] = useState("");
    const [titleDiscussion, setTitleDiscussion] = useState("");
    const [detailedDescription, setDetailedDescription] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const [topicList, setTopicList] = useState([]);

    const DisplayError = (text) => {
        setWarningText(text);
        setShowModal(true);
    }

    const postDiscussion = async () => {
        const body = {
            "userId": Global.userID.toString(),
            "title": titleDiscussion.toString(),
            "categoryId": selectedCategory.toString(),
            "description": detailedDescription,
            "coord": [
                "24.623061",
                "10.830960"
            ],
            "location": "Mumbai",
            "deviceInfo": Global.OS
        }
        try {
            setLoading(true);
            await apiCall("forum/creatediscussion", body);
            setLoading(false);
            navigation.navigate('HopeConnect', { selectedOption: "FORUM" });
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const onPostClick = async () => {
        if (titleDiscussion.trim() == "") {
            DisplayError("Please enter Title value.");
        } else if (selectedCategory.trim() == "") {
            DisplayError("Please selecte Category.");
        } else if (detailedDescription.trim() == "") {
            DisplayError("Please enter description for discussion.");
        }
        else {
            await postDiscussion();
        }
    }

    const getTopicList = async () => {
        const body = {
            "coord": [
                "24.623061",
                "10.830960"
            ],
            "location": "Mumbai",
            "deviceInfo": Global.OS
        }
        try {
            setLoading(true);
            const response = await apiCall("forum/gettopiccategorylist", body, true);
            setTopicList(response.categoryData);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    useEffect(() => {
        getTopicList();
    }, []);

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <Header headerTitle={"Start a Discussion"} extraStyles={{ paddingHorizontal: widthToDp(4) }}
                onPress={() => { navigation.navigate('HopeConnect', { selectedOption: "FORUM" }) }} />
            <View style={[GlobalStyles.mainBox, { marginHorizontal: 0, paddingHorizontal: widthToDp(4) }]}>
                <ScrollView style={{ paddingBottom: heightToDp(10) }}>
                    <FieldLabel text={"Title"} />
                    <View style={styles.button}>
                        <TextInput
                            onChangeText={(text) => {
                                setTitleDiscussion(text);
                            }}
                            maxLength={400}
                            value={titleDiscussion}
                            placeholder='Discussion Title'
                            placeholderTextColor={Colors.placeholderTextColor}
                            style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { width: "90%", height: Global.OS == "ios" ? verticalScale(45) : null }]}
                        />
                    </View>
                    <FieldLabel text={"Choose category"} />
                    <View style={styles.button}>
                        <Dropdown
                            style={[styles.dropdown]}
                            placeholderStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, { color: Colors.placeholderTextColor }]}
                            selectedTextStyle={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}
                            iconStyle={styles.iconStyle}
                            itemTextStyle={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                            itemContainerStyle={{ paddingHorizontal: 5, margin: -5 }}
                            data={topicList}
                            placeholder="select category"
                            maxHeight={300}
                            labelField="name"
                            valueField="id"
                            value={selectedCategory}
                            onChange={item => {
                                setSelectedCategory(item.id);
                            }}
                        />
                    </View>
                    <FieldLabel text={"Detailed description"} />
                    <View style={styles.button}>
                        <TextInput
                            maxLength={4000}
                            keyboardType='default'
                            numberOfLines={5}
                            onChangeText={(text) => {
                                setDetailedDescription(text);
                            }}
                            multiline
                            placeholder='Write a detailed description for your disscusion.'
                            placeholderTextColor={Colors.placeholderTextColor}
                            style={[Fonts.Nunito_600SemiBold, GlobalStyles.mediumText, { width: "90%", textAlignVertical: 'top', height: Global.OS == "ios" ? verticalScale(100) : null, marginTop: Global.OS == "ios" ? verticalScale(10) : 0 }]}
                        />
                    </View>

                    <CommonButton
                        buttonText={"Post"}
                        onPress={onPostClick}
                        extraStyles={{ marginVertical: heightToDp(5) }}
                    />
                </ScrollView>
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

const styles = ScaledSheet.create({
    dropdown: {
        width: "100%",
        height: heightToDp(7),
        borderColor: Colors.primaryinactive,
        borderRadius: 14,
        paddingHorizontal: 10,
        color: Colors.placeholderTextColor,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 0,
        borderColor: Colors.placeholderTextColor,
        borderRadius: 14,
        paddingHorizontal: widthToDp(4),
        marginTop: heightToDp(2),
        backgroundColor: Colors.boxBackground
    }
});