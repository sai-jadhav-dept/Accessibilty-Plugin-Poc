import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Image, TouchableOpacity, Linking, PermissionsAndroid } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import { widthToDp, heightToDp } from '../utils/Responsive';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Colors from '../utils/Colors';
import CommonButton from '../components/CommonButton';
import { useNavigation } from '@react-navigation/native';
import ReadMore from 'react-native-read-more-text';
import DoctorsData from '../assets/mdm/DoctorsData.json'
import LabData from '../assets/mdm/LabData.json'
import VectorIcons from '../components/VectorIcons';
import { scale } from 'react-native-size-matters';
import FastImage from 'react-native-fast-image';

const bookFromImages = [
  { require: require('../assets/images/share1.png') },
  { require: require('../assets/images/share2.png') },
  { require: require('../assets/images/share3.png') },
];

const _renderTruncatedFooter = handlePress => {
  return (
    <Text style={[{ marginTop: 5, color: Colors.primaryButtonColor }, Fonts.Nunito_600SemiBold]}
      onPress={handlePress}>
      Read more
    </Text>
  );
};

const _renderRevealedFooter = handlePress => {
  return (
    <Text style={[GlobalStyles.buttonextrasmallText, { marginTop: 5 }, Fonts.Nunito_600SemiBold]}
      onPress={handlePress}>
      Show less
    </Text>
  );
};

export default function DoctorDetails({ route }, props) {
  const navigation = useNavigation();
  const RouteParamsData = route.params;
  let Type = route.params.Type;
  let filteredData = Type == "Lab Tests" ?
    (LabData.filter(value => { return value.id == RouteParamsData.LabId }))
    : (DoctorsData.filter(value => { return value.id == RouteParamsData.DoctorsId }))

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          'title': 'Example App',
          'message': 'Example App access to your location '
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        alert("You can use the location");
      } else {
        alert("Location permission denied");
      }
    } catch (err) {
      console.warn(err)
    }
  }

  let data = [];
  for (let i = 0; i < filteredData[0].Location.length; i++) {
    if (filteredData[0].Location[i].AreaName == RouteParamsData.locationData) {
      let ClinicData = {
        "id": filteredData[0].Location[i].id,
        "AreaName": filteredData[0].Location[i].AreaName,
        "PinCode": filteredData[0].Location[i].PinCode,
        "ClinicDetails": filteredData[0].Location[i].ClinicDetails,
        "Latitude": filteredData[0].Location[i].Latitude,
        "Longitude": filteredData[0].Location[i].Longitude
      }
      data.push(ClinicData);
    }
  }

  const ReviewsTag = () => {
    return (
      <View style={styles.TaGBox}>
        <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>Reviews</Text>
        <View style={GlobalStyles.rowCenter}>
          <Text style={[GlobalStyles.smallText, { textAlign: 'center', marginTop: heightToDp(1) }, Fonts.Nunito_800ExtraBold]}>
            {filteredData[0].Rating + '/'}
          </Text>
          <Text style={[{ fontSize: scale(10), textAlign: 'center', marginTop: heightToDp(2), color: Colors.primaryTextColor }, Fonts.Nunito_800ExtraBold]}>
            5
          </Text>
        </View>
      </View>
    )
  }

  const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
  const latLng = `${data[0].Latitude},${data[0].Longitude}`;
  const coordinates = 'Custom Label';
  const url = Platform.select({
    ios: `${scheme}${coordinates}@${latLng}`,
    android: `${scheme}${latLng}(${coordinates})`
  });
  return (
    <SafeAreaView style={GlobalStyles.mainContainer}>
      <View style={GlobalStyles.mainBox}>
        <Header
          headerTitle={Type == "Lab Tests" ? "Lab Details" : "Doctor Details"}
          onPress={() => { RouteParamsData.hideButton === "footer" ? navigation.navigate("Dashboard") : navigation.navigate('SelectDoctor', { appointmentType: route.params.appointmentType }) }}
        />
        <ScrollView>
          <View style={styles.doctorDatailHeader}>
            {
              Type == "Lab Tests" ? null :
                <FastImage
                  resizeMode={FastImage.resizeMode.cover}
                  style={styles.Image}
                  source={{ uri: filteredData[0].Image }}
                />
            }
            <View style={Type == "Lab Tests" ? {} : styles.headertext}>
              <Text style={[GlobalStyles.mediumText, styles.name, Fonts.Nunito_700Bold]}>{filteredData[0].name}</Text>
              <Text style={[GlobalStyles.smallText, styles.Specialization, Fonts.Nunito_600SemiBold]}>{filteredData[0].Specialization}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                  Visiting Fee : <Text style={[GlobalStyles.buttonsmallText, Fonts.Nunito_600SemiBold]}>₹ {filteredData[0].Location[0].ClinicDetails[0].Fees} / visit</Text>
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.tagListStyle}>
            <View style={styles.boxContainer}>
              <View style={styles.TaGBox}>
                <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>Patients</Text>
                <Text style={[GlobalStyles.smallText, { textAlign: 'center', marginTop: heightToDp(1) }, Fonts.Nunito_800ExtraBold]}>800+</Text>
              </View>
            </View>
            <View style={styles.boxContainer}>
              <View style={styles.TaGBox}>
                <Text style={[GlobalStyles.extrasmallText, Fonts.Nunito_600SemiBold]}>{Type == "Lab Tests" ? "Years in Service" : "Experience"}</Text>
                <Text style={[GlobalStyles.smallText, { textAlign: 'center', marginTop: heightToDp(1) }, Fonts.Nunito_800ExtraBold]}>{filteredData[0].Experience}+ Years</Text>
              </View>
            </View>
            <View style={styles.boxContainer}>
              <ReviewsTag />
            </View>
          </View>
          {
            Type == "Lab Tests" ?
              <TouchableOpacity onPress={() => {
                Linking.openURL(url);
                requestLocationPermission()
              }} style={styles.tagListStyle}>
                <View style={{ width: '100%' }}>
                  <View style={[styles.TaGBox, { flexDirection: 'row', justifyContent: "center" }]}>
                    <VectorIcons groupName='Ionicons' iconName='location-sharp' iconstyle={[{ color: Colors.primaryButtonColor, marginRight: widthToDp(2) }]} />
                    <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_600SemiBold]}>View Lab in Map</Text>
                  </View>
                </View>
              </TouchableOpacity>
              : null
          }
          <View style={GlobalStyles.fixedTopBottomSpacing}>
            <Text style={[GlobalStyles.largeText, { marginBottom: heightToDp(3) }, Fonts.Nunito_700Bold]}>
              {Type == "Lab Tests" ? "About Laboratory" : "About Doctor"}
            </Text>
            <View>
              <ReadMore
                numberOfLines={10}
                renderTruncatedFooter={_renderTruncatedFooter}
                renderRevealedFooter={_renderRevealedFooter}>
                <Text style={[GlobalStyles.normalText, { margin: widthToDp(10), lineHeight: 20 }, Fonts.Nunito_600SemiBold]}>
                  {filteredData[0].about}
                </Text>
              </ReadMore>
            </View>
          </View>
          {RouteParamsData.hideButton === "footer" ? null : (
            <>
              <CommonButton
                onPress={() => {
                  // navigation.navigate("ChooseDateAndTime", {
                  //   appointmentId: 0,
                  //   sourcePage: "SelectDoctor",
                  //   Type,
                  //   TypeID: filteredData[0].id,
                  //   Mode: Type === "Lab Tests" ? "" : RouteParamsData.Mode,
                  //   locationData: route.params.locationData,
                  // })
                }}
                buttonText={Type === "Lab Tests" ? "Select this Lab" : "Book Doctor"}
                visible
              />
              <Text style={[GlobalStyles.mediumText, GlobalStyles.fixedTopBottomSpacing, { marginHorizontal: widthToDp(2) }, Fonts.Nunito_700Bold]}>
                Or Book from
              </Text>
              <View style={styles.BookMoreContainer}>
                {bookFromImages.map((value, i) => (
                  <View style={styles.BookMoreImg} key={i}>
                    <Image
                      source={value.require}
                      alt="book from more"
                      resizeMode="contain"
                      style={styles.bookMoreImgStyle}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
      <Footer navigation={props.navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  doctorDatailHeader: {
    flexDirection: 'row',
    marginTop: heightToDp(2)
  },
  headertext: {
    paddingHorizontal: widthToDp(4),
    marginBottom: heightToDp(3)
  },
  tagListStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: heightToDp(2)
  },
  TaGBox: {
    backgroundColor: Colors.boxBackground,
    paddingVertical: widthToDp(1),
    borderRadius: 14,
    marginHorizontal: 2,
    alignItems: 'center'
  },
  BookMoreContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: heightToDp(8),
    marginHorizontal: widthToDp(4),
    marginTop: heightToDp(1)
  },
  BookMoreImg: {
    width: 50,
    height: 50,
    marginRight: widthToDp(2),
    borderRadius: 14
  },
  bookMoreImgStyle: {
    width: '100%',
    height: '100%'
  },
  name: {
    marginBottom: 4,
    marginTop: 3
  },
  Specialization: {
    marginBottom: 1
  },
  Image: {
    height: 80,
    width: 80,
    borderWidth: 3,
    borderRadius: 50,
    overflow: 'hidden'
  },
  boxContainer: {
    flexDirection: 'column',
    width: '33%'
  }
});
