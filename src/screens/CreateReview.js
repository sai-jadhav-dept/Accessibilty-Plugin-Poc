import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import CommonButton from '../components/CommonButton';
import { widthToDp, heightToDp } from '../utils/Responsive';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReviewData from '../assets/mdm/ReviewData.json';
import { useNavigation } from '@react-navigation/native';
import StarRating from '../components/StarRating';
import Global from './Global';
import WarningModal from '../components/WarningModal';
import FieldLabel from '../components/FieldLabel';

const CreateReview = ({ route }) => {
    const navigation = useNavigation();
    const [feedbackData, setFeedbackData] = useState('');
    const paramsData = route.params;
    const [rating, setRating] = useState(paramsData.rating);
    const [showWorningModal, setShowWorningModal] = useState(false);

    const handleRatingChange = () => {
        setRating(rating);
    };

    const onSubmitBtnClick = () => {
        if (rating == 0) {
            setShowWorningModal(true);
        } else {
            navigation.navigate("Reviews",
                ReviewData.push({
                    key: ReviewData.length - 1,
                    id: ReviewData.length + 1,
                    name: Global.userInfo.firstName + " " + Global.userInfo.lastName,
                    ratings: rating,
                    profilePicture: Global.userInfo.image,
                    review: feedbackData
                })
            );
        }
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Reviews"
                    onPress={() => navigation.navigate("TreatmentData", { diseaseName: "Dengue", selectedID: 1, treatmentType: "Chemotherapy", vitalData: "vitalData" })} />
                <ScrollView>
                    <View>
                        <FieldLabel text={"Your rating for the Doctor"} extraStyles={[GlobalStyles.extralargeText]} />
                        <View style={{ borderBottomWidth: 1, paddingVertical: heightToDp(1), borderColor: 'rgba(60, 60, 67, 0.36)' }}>
                            <View style={{ height: 60, width: "100%" }}>
                                <StarRating initialRating={rating} onChange={handleRatingChange} />
                            </View>
                        </View>
                        <FieldLabel text={"Title for your Review"} extraStyles={[GlobalStyles.extralargeText]} />
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold,]}>(Optional)</Text>
                        <TextInput
                            keyboardType='default'
                            placeholder='A short title for your review'
                            placeholderTextColor={Colors.placeholderTextColor}
                            style={[styles.reviewText, GlobalStyles.mediumText, Fonts.Nunito_600SemiBold]}
                        />
                        <FieldLabel text={"Your Feedback"} extraStyles={[GlobalStyles.extralargeText]} />
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold,]}>(Optional)</Text>
                        <TextInput
                            keyboardType='default'
                            placeholder='Write a detailed feedback about your appointment with the doctor'
                            placeholderTextColor={Colors.placeholderTextColor}
                            multiline
                            value={feedbackData}
                            numberOfLines={4}
                            style={[styles.reviewText, GlobalStyles.mediumText, { textAlignVertical: 'top', flexWrap: 'wrap' }, Fonts.Nunito_600SemiBold]}
                            onChangeText={(text) => { setFeedbackData(text) }}
                        />
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { marginTop: heightToDp(1), color: Colors.placeholderTextColor }]}>{(3000 - feedbackData.length)} characters left</Text>
                    </View>
                    <CommonButton
                        buttonText="Submit"
                        onPress={onSubmitBtnClick}
                        extraStyles={{ marginBottom: heightToDp(5), marginTop: heightToDp(3) }}
                    />
                </ScrollView>
                <WarningModal warningText={"Rating should not be empty."} showModal={showWorningModal} setShowModal={setShowWorningModal} />
            </View>
            <Footer navigation={navigation} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    reviewText: {
        borderRadius: 14,
        paddingVertical: heightToDp(2),
        paddingHorizontal: widthToDp(6),
        backgroundColor: Colors.boxBackground,
        marginTop: heightToDp(2),
        width: '100%',
        alignSelf: 'center',
    }
});

export default CreateReview;