import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, SafeAreaView, StyleSheet } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import Footer from '../components/Footer';
import { widthToDp, heightToDp } from '../utils/Responsive';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import Global from './Global';
import { scale } from 'react-native-size-matters';
import WarningModal from '../components/WarningModal';
import Spinner from 'react-native-loading-spinner-overlay';
import { apiCall } from '../utils/ApiUtils';
import Loader from '../components/Loader';
import CommonButton from '../components/CommonButton';

const MyTreatment = (props) => {
  const navigation = useNavigation();
  const [diseaseData, setDiseaseData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [loading, setLoading] = useState(false);

  const DisplayError = (text) => {
    setWarningText(text);
    setShowModal(true);
  }

  const FirstTime = '';
  useEffect(() => {
    Global.patientDiseaseDetials = [];
  }, [FirstTime]);

  useEffect(() => {
    getTreatmentList();
  }, []);

  const getTreatmentList = async () => {
    try {
      const body = {
        "patientId": Global.patientID,
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": Global.OS
      };
      setLoading(true);
      const response = await apiCall('treatment/gettreatmentlist', body);
      setDiseaseData(response.treatments);
      setLoading(false);
      Global.patientDiseaseDetials = response.treatments;
    } catch (error) {
      setLoading(false);
      DisplayError(error.msg || "Something went wrong, please try again");
    }
  }

  const handleBackNavigation = () => {
    if (props?.route.params?.fromCareCircle) {
      navigation.navigate('PatientDashboard', { personData: props?.route?.params?.personData })
    } else {
      navigation.replace('Dashboard')
    }
  }


  const onContinueClick = () => {
    navigation.replace('DiseaseSearch')
  }

  return (
    <SafeAreaView style={GlobalStyles.mainContainer}>
      <View style={GlobalStyles.mainBox}>
        <Header
          headerTitle="My Treatments"
          onPress={() => { handleBackNavigation(); }}
        />
        <View style={{ paddingHorizontal: widthToDp(2), marginTop: heightToDp(1) }}>
          <Text style={[GlobalStyles.selectBoxText, Fonts.Nunito_600SemiBold, { textAlign: 'left' }]}>HOPE will help you to manage your</Text>
          <Text style={[GlobalStyles.selectBoxText, Fonts.Nunito_600SemiBold, { textAlign: 'left', marginTop: heightToDp(1) }]}>Treatment for</Text>
        </View>
        <View style={styles.Container}>
          <FlatList
            style={{ width: '100%', marginTop: heightToDp(2) }}
            data={diseaseData}
            extraData={diseaseData}
            keyExtractor={(item, index) => 'key' + index}
            renderItem={({ item }) => (
              item.date != "" &&
              <Pressable style={({ pressed }) => [styles.selectBox, styles.Button, { opacity: pressed ? 0.5 : 1 }]}
                onPress={() => {
                  Global.diseaseID = item.id;
                  navigation.replace('YourTreatments', { diseaseData: item });
                }}>
                <View style={styles.diseaseContainer}>
                  <View style={styles.BoxLeft}>
                    <Text style={[Fonts.Nunito_700Bold, styles.diseaseText]}>{item.name}</Text>
                    {(
                      <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.backgroundsmallText, styles.createdText]}>
                        {'Created on ' + item.createdOn}
                      </Text>
                    )}
                  </View>
                  <View style={styles.BoxRight}>
                    <VectorIcons groupName="AntDesign" iconName="arrowright" iconstyle={styles.SecondArrow} />
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>
      </View>
      <View style={{ paddingHorizontal: widthToDp(4) }}>
        <CommonButton
          onPress={onContinueClick}
          visible={true}
          extraStyles={{
            marginTop: heightToDp(2),
            marginBottom: heightToDp(5),
          }}
          buttonText={"Add New"}
        />
        <Spinner
          visible={loading}
          color={Colors.primaryButtonColor}
          customIndicator={<Loader />}
          textStyle={{ color: Colors.primaryButtonColor }}
        />
        <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
      </View>
      <Footer navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  Container: {
    flexDirection: 'row-reverse',
    flex: 1,
    alignItems: 'flex-end'
  },
  Button: {
    marginBottom: heightToDp(2),
    backgroundColor: Colors.primaryButtonColor,
    borderColor: Colors.secondarybuttonColor,
    minHeight: heightToDp(15)
  },
  diseaseContainer: {
    width: '100%',
    flexDirection: 'row'
  },
  BoxLeft: {
    width: '85%',
    flexDirection: 'column'
  },
  diseaseText: {
    color: Colors.boxBackground,
    fontSize: scale(20),
    lineHeight: heightToDp(5)
  },
  createdText: {
    lineHeight: heightToDp(5)
  },
  BoxRight: {
    width: '15%',
    flexDirection: "row",
    alignItems: "flex-end"
  },
  arrow: {
    color: Colors.boxBackground,
    marginLeft: widthToDp(6)
  },
  SecondArrow: {
    color: Colors.boxBackground,
    marginLeft: widthToDp(6),
    justifyContent: "flex-end",
    marginBottom: widthToDp(1)
  },
  selectBox: {
    width: '100%',
    borderRadius: 14,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    padding: widthToDp(6)
  }
})

export default MyTreatment;