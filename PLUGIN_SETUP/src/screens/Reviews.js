import React, { useState } from 'react';
import { View, Image, FlatList, Pressable, Text, SafeAreaView, StyleSheet } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import Header from '../components/Header';
import FooterComponent from '../components/Footer';
import VectorIcons from '../components/VectorIcons';
import ReviewData from '../assets/mdm/ReviewData.json';
import { widthToDp, heightToDp } from '../utils/Responsive';
import { useNavigation } from '@react-navigation/native';
import { scale } from 'react-native-size-matters';
import FastImage from 'react-native-fast-image';

const Reviews = () => {
    const navigation = useNavigation();
    const [displayMoreModal, setDisplayMoreModal] = useState(false);
    const [modalIndex, setModalIndex] = useState(-1);
    const reviewsData = ReviewData.reverse();
    const totalRatings = reviewsData.length;
    const ratingsCount = [0, 0, 0, 0, 0];
    reviewsData.map(item => ratingsCount[item.ratings - 1]++);
    const averageRating = reviewsData.reduce((previousValue, currentValue) => previousValue + currentValue.ratings, 0) / totalRatings;
    const ratingsPercentage = ratingsCount.map(item => (item / totalRatings) * 100);
    ratingsPercentage.reverse();

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Reviews"
                    onPress={() => navigation.navigate("MyAppointments")}
                />
                <View style={styles.container}>
                    <View style={[GlobalStyles.columnCenter, styles.ratingcontainer]}>
                        <Text style={[{ color: Colors.primaryTextColor, fontSize: scale(50) }, Fonts.Nunito_600SemiBold]}>
                            {Math.round(averageRating)}
                        </Text>
                        <View style={styles.starcontainer}>
                        </View>
                        <Text style={[GlobalStyles.smallText, styles.reviewcount, Fonts.Nunito_600SemiBold]}>
                            {reviewsData.length} reviews
                        </Text>
                    </View>
                    <View style={styles.graphcontainer}>
                        {
                            ratingsPercentage.map((item, index) =>
                                <View key={index + "firstmap"} style={styles.graphdatacontainer}>
                                    <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                                        {(index - 5) * (-1)}
                                    </Text>
                                    <View style={styles.inactive}>
                                        <View style={[styles.active, { width: item + '%' }]} />
                                    </View>
                                </View>
                            )
                        }
                    </View>
                </View>
                <View style={styles.feedbackcontainer}>
                    <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold]}>
                        User Feedbacks
                    </Text>
                    <Pressable style={({ pressed }) => ([styles.filterbutton, { opacity: pressed ? 0.4 : 1 }])}>
                        <Text style={[GlobalStyles.smallText, styles.filterbuttontext, Fonts.Nunito_600SemiBold]}>Most useful</Text>
                        <VectorIcons groupName='Ionicons' iconName='filter' iconstyle={[{ color: Colors.primaryTextColor }]} />
                    </Pressable>
                </View>
                <FlatList
                    data={reviewsData}
                    keyExtractor={(item, index) => item.id}
                    style={GlobalStyles.fixedTopSpacing}
                    renderItem={({ item, index }) =>
                        <Pressable
                            onPress={() => setDisplayMoreModal(false)}
                            style={[styles.commentboxcontainer, GlobalStyles.inputBoxShadow, {
                                marginTop: (index == 0) ? heightToDp(1) : heightToDp(0),
                                marginBottom: (index == reviewsData.length - 1) ? heightToDp(5) : heightToDp(3)
                            }]}>
                            {
                                displayMoreModal && modalIndex == index ?
                                    <Pressable style={({ pressed }) => ([styles.connectbutton, { opacity: pressed ? 0.4 : 1 }, GlobalStyles.inputBoxShadow,])}>
                                        <Image resizeMode='contain' style={styles.connectimage} source={require("../assets/vectors/AddUser.png")} />
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>Connect</Text>
                                    </Pressable> :
                                    null
                            }
                            <View style={GlobalStyles.rowSpaceBetween}>
                                <View style={styles.userimagecontainer}>
                                    <Image resizeMode='contain' style={styles.userimage} source={require("../assets/vectors/Gradient.png")} />
                                    <FastImage
                                        resizeMode={FastImage.resizeMode.cover}
                                        style={styles.profileimage}
                                        source={{ uri: item.profilePicture }}
                                    />
                                    <View style={[{ flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }]}>
                                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>
                                            {item.name}
                                        </Text>
                                        <View style={styles.starrating}>
                                        </View>
                                    </View>
                                </View>
                                <Pressable
                                    onPress={() => {
                                        if (modalIndex == index) {
                                            setDisplayMoreModal(!displayMoreModal);
                                        }
                                        else {
                                            setDisplayMoreModal(true);
                                            setModalIndex(index);
                                        }
                                    }}
                                    hitSlop={20}
                                    style={({ pressed }) => ([{ opacity: pressed ? 0.4 : 1 }])}>
                                    <VectorIcons groupName='Entypo' iconName='dots-three-horizontal'
                                        iconstyle={[{
                                            color: (displayMoreModal && modalIndex == index) ? Colors.primaryButtonColor : Colors.primaryTextColor
                                        }]} />
                                </Pressable>
                            </View>
                            <View style={styles.reviewtextcontainer}>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>{item.review}</Text>
                            </View>
                        </Pressable>
                    }
                />
            </View>
            <FooterComponent navigation={navigation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: heightToDp(2),
        marginHorizontal: widthToDp(3),
    },
    ratingcontainer: {
        flex: 1,
        marginRight: widthToDp(2),
    },
    starcontainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: heightToDp(1),
    },
    reviewcount: {
        marginTop: heightToDp(1),
    },
    graphcontainer: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        flex: 1.5,
    },
    graphdatacontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: heightToDp(2),
    },
    inactive: {
        height: heightToDp(1),
        width: '92%',
        backgroundColor: Colors.textInputBorder,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    active: {
        height: heightToDp(1),
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 14,
    },
    feedbackcontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: heightToDp(2),
    },
    filterbutton: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: Colors.boxBackground,
        padding: widthToDp(2),
        borderRadius: 14,
    },
    filterbuttontext: {
        marginRight: widthToDp(2),
    },
    commentboxcontainer: {
        flexDirection: 'column',
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        position: 'relative',
        padding: widthToDp(2),
        justifyContent: 'flex-start',
    },
    connectbutton: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'absolute',
        top: heightToDp(7),
        right: widthToDp(4),
        backgroundColor: Colors.boxBackground,
        padding: widthToDp(2),
        zIndex: 999,
        borderRadius: 14,
    },
    connectimage: {
        width: widthToDp(4),
        height: heightToDp(4),
        marginRight: widthToDp(2),
    },
    userimagecontainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        position: 'relative',
    },
    userimage: {
        zIndex: 10,
        width: widthToDp(17),
        height: heightToDp(9.5),
        position: 'absolute',
        top: -heightToDp(0.5),
        left: -widthToDp(0.5),
    },
    reviewtextcontainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        marginTop: heightToDp(2),
        marginLeft: widthToDp(1),
        marginRight: widthToDp(2),
        marginBottom: heightToDp(2),
    },
    profileimage: {
        borderRadius: 50,
        width: widthToDp(17),
        height: heightToDp(9),
        marginRight: widthToDp(2),
    },
    starrating: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: heightToDp(0.5),
    }
})

export default Reviews;