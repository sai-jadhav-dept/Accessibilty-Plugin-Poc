import React from 'react';
import { View, Text, FlatList, Image, Pressable, SafeAreaView, StyleSheet } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { widthToDp, heightToDp } from '../utils/Responsive';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigation } from '@react-navigation/native';
import Global from './Global';

const CreateAppointment = () => {
  const navigation = useNavigation();
  const appointmentTypes = [
    {
      key: 1,
      appoitnmentType: 'Doctor Visit',
      illustration: require('../assets/images/doctor_illustration.png'),
      type: "Doctor",
      id: 0,
      redirect: 'AppointmentType',
    },
    {
      key: 2,
      appoitnmentType: 'Nutritionist',
      illustration: require('../assets/images/scientist_illustration.png'),
      type: "Nutritionist",
      id: 1,
      redirect: 'AppointmentType',
    },
  ];

  const onSelectAppointment = (item) => {
    item.redirect == '' ?
      console.log('no redirection available') :
      navigation.navigate(item.redirect, { Type: item.type });
    Global.appointmentType = item.type
  }

  return (
    <SafeAreaView style={GlobalStyles.mainContainer}>
      <View style={GlobalStyles.mainBox}>
        <Header
          headerTitle="Select Appointment Type"
          onPress={() => navigation.navigate('TreatmentData', { selectedTab: "appointments" })}
        />
        <FlatList
          data={appointmentTypes}
          style={styles.Container}
          keyExtractor={(item, index) => 'key' + index}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelectAppointment(item)}
              style={({ pressed }) => [styles.Button, { backgroundColor: pressed ? Colors.secondarybuttonColor : Colors.textInputBorder }]}>
              <View style={styles.typeBox}>
                <Text style={[GlobalStyles.mediumText, styles.typeText, Fonts.Nunito_700Bold]}>{item.appoitnmentType}</Text>
                <Image resizeMode="contain" style={styles.Image} source={item.illustration} />
              </View>
            </Pressable>
          )}
        />
      </View>
      <Footer navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  Container: {
    width: '100%',
    alignSelf: 'center'
  },
  Button: {
    marginHorizontal: widthToDp(2),
    width: '96%',
    borderRadius: 14,
    marginTop: heightToDp(2)
  },
  typeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '98.5%',
    alignItems: 'flex-end',
    borderRadius: 14,
    backgroundColor: Colors.boxBackground,
    paddingHorizontal: widthToDp(4),
    paddingTop: heightToDp(2)
  },
  typeText: {
    marginBottom: heightToDp(8),
    marginLeft: widthToDp(6),
    width: "40%",
    flexWrap: "wrap"
  },
  Image: {
    height: heightToDp(18),
    width: widthToDp(42)
  }
})
export default CreateAppointment;