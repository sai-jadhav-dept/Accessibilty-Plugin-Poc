import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, Pressable, FlatList, Keyboard, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import Fonts from '../utils/Fonts';
import { heightToDp, widthToDp } from '../utils/Responsive';
import Colors from '../utils/Colors';
import VectorIcons from './VectorIcons';
import { useNavigation } from '@react-navigation/native';
import Global from '../screens/Global';
import GlobalStyles from '../utils/GlobalStyles';
import { scale } from 'react-native-size-matters';

const Footer = (props) => {
  const navigation = useNavigation();
  const [activeScreen, setActiveScreen] = useState('Home');
  const [footerModal, setFooterModal] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const menu = [
    {
      id: 1,
      Name: 'Treatments',
      redirect: 'MyTreatment',
      icon: require('../assets/vectors/Treatments.png'),
    },
    {
      id: 2,
      Name: 'My Appointment',
      redirect: 'NurseAppointmentScreen',
      icon: require('../assets/vectors/Treatments.png'),
    },
    {
      id: 3,
      Name: 'Nurse',
      redirect: 'AddServices',
      icon: require('../assets/vectors/Appointment_active.png'),
    },
    {
      id: 4,
      Name: 'Caretaker',
      redirect: 'AddServices',
      icon: require('../assets/vectors/Appointment_active.png'),
    },
    {
      id: 5,
      Name: 'Additional Equipment Request',
      redirect: 'AdditionalEquipment',
      icon: require('../assets/vectors/Appointment_active.png'),
    },
  ];
  const caregiverMenu = [
    {
      id: 6,
      Name: 'Treatments',
      redirect: 'MyTreatment',
      icon: require('../assets/vectors/Treatments.png'),
    },
    {
      id: 3,
      Name: 'Nurse',
      redirect: 'PatientList',
      icon: require('../assets/vectors/Appointment_active.png'),
    },
    {
      id: 4,
      Name: 'Caretaker',
      redirect: 'PatientList',
      icon: require('../assets/vectors/Appointment_active.png'),
    },
    {
      id: 2,
      Name: 'My Appointment',
      redirect: 'NurseAppointmentScreen',
      icon: require('../assets/vectors/Treatments.png'),
    },
    {
      id: 5,
      Name: 'Additional Equipment Request',
      redirect: 'AdditionalEquipment',
      icon: require('../assets/vectors/Appointment_active.png'),
    },
  ];

  useEffect(() => {
    setActiveScreen(props.activeScreen)
  }, [])

  const navigatetoScreen = (screenName, type) => {
    setFooterModal(false);
    if (screenName == 'MyAppointments') {
      navigation.navigate(screenName, { filterType: 'Upcoming' });
    }
    else if (screenName == "SelectDoctor") {
      navigation.navigate(screenName, { doctorName: "footer" });
    }
    else if (screenName == "AddServices") {
      if (type == "Caretaker") {
        Global.nurseSelecting.userTypeId = '6';
        Global.nurseSelecting.Type = "Caretaker"
        navigation.replace("SelectCareBuddy", { userType: "Domestic Caretaker" });
      } else {
        Global.nurseSelecting.userTypeId = '3';
        navigation.navigate(screenName, { userType: "Nurse" });
      }
    }
    else if (screenName == "PatientList") {
      navigation.navigate(screenName, { userType: type == "Caretaker" ? "Domestic Caretaker" : type });
    }
    else {
      navigation.navigate(screenName, { refreshing: true });
    }
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const onFooterTabClick = (item) => {
    setFooterModal(false);
    navigatetoScreen(item.redirect, item.Name);
  }

  return footerModal ? (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        style={{ opacity: 0.1 }}
        visible={footerModal}
        onRequestClose={() => { setFooterModal(false); }}
      >
        <SafeAreaView style={styles.menucontainer}>
          <View style={[styles.boxcontainer]}>
            <View style={{ marginHorizontal: widthToDp(4) }}>
              <View style={styles.heading}>
                <View style={styles.headingcontainer}>
                  <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold]}>Quick Actions</Text>
                </View>
                <View style={styles.closeiconcontainer}>
                  <Pressable style={styles.closebutton} onPress={() => setFooterModal(false)}>
                    <VectorIcons groupName="Ionicons" iconName="close" iconsize={scale(20)} />
                  </Pressable>
                </View>
              </View>
              <View style={{ height: heightToDp(70) }}>
                <FlatList
                  data={Global.userType == "Patient" ? menu : caregiverMenu}
                  numColumns={2}
                  keyExtractor={(item, index) => 'key' + index}
                  renderItem={({ item }) => (
                    <View style={{ width: '50%', margin: widthToDp(1) }}>
                      <Pressable
                        style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, styles.button]}
                        onPress={() => onFooterTabClick(item)}>
                        <View style={{ marginHorizontal: widthToDp(2) }}>
                          <View
                            style={{
                              flexDirection: 'column',
                              position: 'absolute',
                              bottom: -heightToDp(11),
                              left: widthToDp(1)
                            }}>
                            {(item.Name == "Additional Equipment Request" ?
                              <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{item.Name}</Text>
                              :
                              item.id == 1 ?
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>My{' '}</Text>
                                : item.id !== 2 && <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>Book{' '}</Text>)}
                            {item.Name != "Additional Equipment Request" &&
                              <Text style={[GlobalStyles.normalText, Fonts.Nunito_700Bold]}>{item.Name}</Text>}
                          </View>
                          <View style={{ position: 'absolute', right: 0 }}>
                            <Image source={item.icon}
                              style={{
                                height: item.Name == 'Treatments' ? 50 : 40,
                                width: 50,
                                marginTop: item.Name == 'Treatments' ? 3 : 10,
                              }}
                              resizeMode="contain"
                            />
                          </View>
                        </View>
                      </Pressable>
                    </View>
                  )}
                />
              </View>
            </View>
            <View style={styles.Modalcontainer}>
              <View style={styles.homeicon}>
                <TouchableOpacity transparent onPress={() => navigatetoScreen('Dashboard')}                >
                  <View style={{ alignItems: 'center' }}>
                    <Image source={activeScreen == 'Home' ? require('../assets/vectors/home_active.png') : require('../assets/vectors/home.png')} style={styles.icon} resizeMode="contain" />
                    <Text style={[
                      Fonts.Nunito_400Regular,
                      styles.iconText,
                      {
                        color: activeScreen == 'Home' ? Colors.primaryTextColor : Colors.primaryinactive
                      }
                    ]}>
                      HOME
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.familyicon}>
                <TouchableOpacity
                  transparent
                  onPress={() => navigatetoScreen("CareCircle")}>
                  <View style={{ alignItems: 'center' }}>
                    <Image source={activeScreen == 'Family' ? require('../assets/vectors/family_active.png') : require('../assets/vectors/family.png')} style={styles.icon} resizeMode="contain" />
                    <Text
                      style={[
                        Fonts.Nunito_400Regular,
                        styles.iconText,
                        {
                          color: activeScreen == 'Family' ? dynamicColors.primaryTextColor : dynamicColors.primaryinactive
                        }
                      ]}>
                      {Global.userType == "Caregiver" ? "MY PATIENTS" : "CARE CIRCLE"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.iconcontainer}>
                <TouchableOpacity transparent onPress={() => { setFooterModal(false); }}>
                  <View style={styles.arrowcontainer}>
                    <Image source={require('../assets/images/down_arrow.png')} style={{ height: 80, width: 80 }} resizeMode="contain" />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.iconcontainer}>
                <TouchableOpacity transparent onPress={() => navigatetoScreen("SelectDoctor")}>
                  <View style={{ alignItems: 'center' }}>
                    <Image source={activeScreen == 'Doctors' ? require('../assets/vectors/doctors_active.png') : require('../assets/vectors/doctors.png')} style={styles.icon} resizeMode="contain" />
                    <Text
                      style={[
                        Fonts.Nunito_400Regular,
                        styles.iconText,
                        {
                          color: activeScreen == 'Doctors' ? dynamicColors.primaryTextColor : dynamicColors.primaryinactive
                        }
                      ]}>
                      DOCTORS
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.iconcontainer}>
                <TouchableOpacity transparent onPress={() => navigatetoScreen("SettingsPage")}>
                  <View style={{ alignItems: 'center' }}>
                    <Image source={activeScreen == 'Settings' ? require('../assets/vectors/setting_active.png') : require('../assets/vectors/setting.png')} style={styles.icon} resizeMode="contain" />
                    <Text
                      style={[
                        Fonts.Nunito_400Regular,
                        styles.iconText,
                        {
                          color: activeScreen == 'Settings' ? dynamicColors.primaryTextColor : dynamicColors.primaryinactive
                        }
                      ]}>
                      SETTINGS
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.iosModal}>
          </View>
        </SafeAreaView>

      </Modal>
    </>
  ) : (
    <>{
      !isKeyboardVisible && (
        <KeyboardAvoidingView style={styles.container}>
          <View style={styles.homeicon}>
            <TouchableOpacity transparent onPress={() => navigatetoScreen('Dashboard')}>
              <View style={{ alignItems: 'center' }}>
                <Image source={activeScreen == 'Home' ? require('../assets/vectors/home_active.png') : require('../assets/vectors/home.png')} style={styles.icon} resizeMode="contain" />
                <Text
                  style={[
                    Fonts.Nunito_400Regular,
                    styles.iconText,
                    {
                      color: activeScreen == 'Home' ? Colors.primaryTextColor : Colors.primaryinactive
                    }
                  ]}>
                  HOME
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={[styles.familyicon]}>
            <TouchableOpacity transparent onPress={() => navigatetoScreen("CareCircle")}>
              <View style={{ alignItems: 'center' }}>
                <Image source={activeScreen == 'Family' ? require('../assets/vectors/family_active.png') : require('../assets/vectors/family.png')} style={styles.icon} resizeMode="contain" />
                <Text
                  style={[
                    Fonts.Nunito_400Regular,
                    styles.iconText,
                    {
                      color: activeScreen == 'Family' ? Colors.primaryTextColor : Colors.primaryinactive
                    }
                  ]}>
                  {Global.userType == "Caregiver" ? "MY PATIENTS" : "CARE CIRCLE"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.iconcontainer}>
            <TouchableOpacity transparent onPress={() => { setFooterModal(true); }}>
              <View style={styles.arrowcontainer}>
                <Image source={require('../assets/images/up_arrow.png')} style={{ height: 80, width: 80 }} resizeMode="contain" />
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.iconcontainer}>
            <TouchableOpacity transparent onPress={() => navigatetoScreen("SelectDoctor")}>
              <View style={{ alignItems: 'center' }}>
                <Image source={activeScreen == 'Doctors' ? require('../assets/vectors/doctors_active.png') : require('../assets/vectors/doctors.png')} style={styles.icon} resizeMode="contain" />
                <Text
                  style={[
                    Fonts.Nunito_400Regular,
                    styles.iconText,
                    {
                      color: activeScreen == 'Doctors' ? Colors.primaryTextColor : Colors.primaryinactive
                    }
                  ]}>
                  DOCTORS
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.iconcontainer}>
            <TouchableOpacity
              transparent
              onPress={() => navigatetoScreen("SettingsPage")}>
              <View style={{ alignItems: 'center' }}>
                <Image source={activeScreen == 'Settings' ? require('../assets/vectors/setting_active.png') : require('../assets/vectors/setting.png')} style={styles.icon} resizeMode="contain" />
                <Text
                  style={[
                    Fonts.Nunito_400Regular,
                    styles.iconText,
                    {
                      color: activeScreen == 'Settings' ? Colors.primaryTextColor : Colors.primaryinactive
                    }
                  ]}>
                  SETTINGS
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.defaultBackground,
    height: 60,
    elevation: 20,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    shadowColor: Colors.primaryTextColor,
    shadowOpacity: 0.54,
    shadowRadius: 4,
    shadowOffset: {
      height: -10,
      width: 1,
    }
  },
  Modalcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
    marginTop: 15,
    shadowColor: Colors.primaryTextColor
  },
  menucontainer: {
    backgroundColor: Colors.modalBackground,
    flex: 1,
    justifyContent: 'flex-end'
  },
  boxcontainer: {
    backgroundColor: Colors.defaultBackground,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14
  },
  heading: {
    flexDirection: 'row',
    alignItems: "center",
    marginBottom: heightToDp(3),
    marginTop: widthToDp(4)
  },
  closebutton: {
    backgroundColor: Colors.boxBackground,
    borderRadius: 50,
    height: 30,
    width: 30,
    justifyContent: "center",
    alignItems: "center"
  },
  button: {
    overflow: 'hidden',
    position: 'relative',
    borderRadius: 14,
    marginBottom: heightToDp(2),
    height: heightToDp(14),
    width: '95%',
    backgroundColor: Colors.boxBackground
  },
  iosModal: {
    zIndex: -999,
    width: "100%",
    position: "absolute",
    bottom: 0,
    backgroundColor: Colors.defaultBackground,
    height: 100
  },
  iconcontainer: {
    flexDirection: 'column',
    width: '20%',
    alignItems: 'center'
  },
  homeicon: {
    flexDirection: 'column',
    width: '18%',
    alignItems: 'center'
  },
  familyicon: {
    flexDirection: 'column',
    width: '23%',
    alignItems: 'center'
  },
  icon: {
    height: 20
  },
  iconText: {
    fontSize: scale(10),
    flexWrap: 'wrap',
    textAlign: 'center'
  },
  arrowcontainer: {
    alignItems: 'center',
    paddingBottom: heightToDp(6)
  },
  headingcontainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '90%'
  },
  closeiconcontainer: {
    flexDirection: 'column',
    width: '10%'
  }
});

export default Footer;