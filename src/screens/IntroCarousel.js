import React, { useState, useRef } from 'react';
import { Image, Text, View, StyleSheet, FlatList, Dimensions, SafeAreaView } from "react-native";
import Logo from '../components/Logo';
import { widthToDp, heightToDp } from '../utils/Responsive';
import CommonButton from '../components/CommonButton';
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';
import GlobalStyles from '../utils/GlobalStyles';
import { useNavigation } from '@react-navigation/native';
import { scale } from 'react-native-size-matters';
import { ExecuteDBQuery } from '../utils/ExecuteDBQuery';

const WIDTH = Dimensions.get('window').width;

const IntroCarousel = () => {
  const navigation = useNavigation();
  const insertQuery = "INSERT INTO BioMetricTable (Biometric_Id) values ('')";

  let INTRO_DATA = [
    {
      key: 0,
      title: 'Your Insurance Simplified',
      description1: 'Care for yourself and your loved ones - with HOPE',
      img: require('../assets/images/splash_first.png')
    },
    {
      key: 1,
      title: 'Your Insurance Policies, on your fingertips',
      description1: "Use the timeline to track everything - from appointments, to tests, to medication.",
      img: require('../assets/images/splash_second.png')
    },
    {
      key: 2,
      title: 'Your Claims. Our Concerns',
      description1: 'One platform connecting doctors, patients and caregivers.',
      img: require('../assets/images/splash_third.png')
    },
  ];
  let [currentIndex, setCurrentIndex] = useState(0);
  const [btnTxt, setBtnTxt] = useState('Next');
  const viewabilityConfig = useRef(null);

  const successCallback = (txObj, resultSet, resolve, reject) => {
    resolve(true);
  };

  const failureCallback = (txObj, error, resolve, reject) => {
    console.log('Table insert Error : ', txObj.message);
    resolve(false);
  };

  const clickNext = async () => {
    if (currentIndex == INTRO_DATA.length - 1) {
      await ExecuteDBQuery(insertQuery, successCallback, failureCallback);
      navigation.replace("Login");
    }
    else {
      currentIndex = currentIndex + 1;
      viewabilityConfig.current.scrollToIndex({ index: currentIndex });
      if (currentIndex == INTRO_DATA.length - 1) {
        setBtnTxt('Log In / Sign Up');
      } else {
        setBtnTxt('Next');
      }
    }
  };

  const onViewableItemsChanged = ({ viewableItems }) => {
    const firstViewItem = viewableItems[viewableItems.length - 1].index;
    const index = INTRO_DATA.findIndex(item => item.key === firstViewItem);
    setCurrentIndex(index);
    if (index == INTRO_DATA.length - 1) {
      setBtnTxt('Log In / Sign Up');
    } else {
      setBtnTxt('Next');
    }
  }
  const viewabilityConfigCallbackPairs = useRef([
    { onViewableItemsChanged },
  ]);

  return (
    <SafeAreaView style={GlobalStyles.mainContainer}>
      <View style={GlobalStyles.mainBox}>
        <Logo />
        <View style={{ flex: 1 }}>
          <FlatList
            data={INTRO_DATA}
            ref={viewabilityConfig}
            viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            horizontal
            decelerationRate={'normal'}
            scrollEventThrottle={16}
            renderItem={({ item }) => {
              return (
                <View style={{ paddingVertical: heightToDp(2) }}>
                  <Image style={styles.sliderimage} source={item.img} />
                  <View style={[styles.itemContainer, { width: WIDTH - (currentIndex == item.length - 1 ? widthToDp(8) : widthToDp(6)) }]}>
                    <View style={styles.textcontainer}>
                      <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { marginTop: heightToDp(6) }]}>
                        {item.description1}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            }}
          />
          <View style={styles.dotContainer}>
            <View style={{ alignItems: 'center', width: '100%', marginBottom: heightToDp(2) }}>
              <FlatList
                data={INTRO_DATA}
                horizontal={true}
                pagingEnabled={true}
                renderItem={({ item }) =>
                  <View>
                    <Text style={{ fontSize: scale(40), color: item.key == currentIndex ? Colors.primaryButtonColor : Colors.textInputBorder }}>.</Text>
                  </View>
                }
              />
            </View>
          </View>
        </View>
        <CommonButton
          buttonText={btnTxt}
          onPress={() => clickNext()}
          extraStyles={{ bottom: widthToDp(6), position: 'absolute' }}
        />
      </View>
    </SafeAreaView>
  );
}

export default IntroCarousel;

const styles = StyleSheet.create({
  dotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    bottom: heightToDp(10),
    position: 'absolute'
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: "wrap"
  },
  sliderimage: {
    resizeMode: 'contain',
    height: heightToDp(40),
    width: '100%',
    alignSelf: 'center'
  },
  textcontainer: {
    alignItems: 'center',
    paddingHorizontal: widthToDp(4),
    flexWrap: "wrap"
  }
});