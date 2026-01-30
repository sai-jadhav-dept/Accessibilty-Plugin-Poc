import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Keyboard, TouchableOpacity, FlatList, Image, Modal, Pressable, TextInput, TouchableWithoutFeedback } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import { widthToDp, heightToDp } from '../utils/Responsive';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VectorIcons from '../components/VectorIcons';
import { useNavigation } from '@react-navigation/native';
import VoiceSearch from '../components/VoiceSearch';
import DoctorsData from '../assets/mdm/DoctorsData.json';
import Colors from '../utils/Colors';
import LabData from '../assets/mdm/LabData.json';
import CommonButton from '../components/CommonButton';
import { BlurView } from "@react-native-community/blur";
import Global from './Global';
import { scale } from 'react-native-size-matters';
import FieldLabel from '../components/FieldLabel';

const SelectDoctor = ({ route }) => {
  const navigation = useNavigation();
  const firstTime = '';
  let Mode = route?.params?.Mode;
  let Type = route?.params?.Type;
  let TestName = route?.params?.TestName;
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [filteredDocs, setFilteredDocs] = useState(DoctorsData);
  const [refreshingData, setRefreshingData] = useState(filteredDocs);
  const [filteredLab, setFilteredLab] = useState(LabData);
  let [showFilterOptions, setShowFilterOptions] = useState(false);
  const [recommendRefresher, setRecommendRefresher] = useState(false);
  const [filteredVoiceSearchDocsData, setFilteredVoiceSearchDocsData] = useState(filteredDocs);
  const [searchData, setSearchData] = useState('');
  let [validPincode, setValidPincode] = useState('');
  let filterModalData = Type == "Lab Tests" ? [
    {
      id: 0,
      key: 1,
      optionTitle: 'Rating',
      isSelected: false,
    },
    {
      id: 1,
      key: 2,
      optionTitle: 'Fees: Low to High',
      isSelected: false,
    },
    {
      id: 2,
      key: 3,
      optionTitle: 'Fees: High to Low',
      isSelected: false,
    },
  ] : [
    {
      id: 0,
      key: 1,
      optionTitle: 'Experience',
      isSelected: false,
    },
    {
      id: 1,
      key: 2,
      optionTitle: 'Rating',
      isSelected: false,
    },
    {
      id: 2,
      key: 3,
      optionTitle: 'Fees: Low to High',
      isSelected: false,
    },
    {
      id: 3,
      key: 4,
      optionTitle: 'Fees: High to Low',
      isSelected: false,
    },
  ];
  const sortedDocs = [...filteredDocs].sort(function (a, b) { return !a.isTrusted && b.isTrusted });
  const sortedLabs = [...filteredLab].sort(function (a, b) { return !a.isTrusted && b.isTrusted });

  const SearchLabData = () => {
    let data = [];
    for (let i = 0; i < LabData.length; i++) {
      let Labdata = {
        "id": LabData[i].id,
        "Image": LabData[i].Image,
        "name": LabData[i].name,
        "MobileNumber": LabData[i].MobileNumber,
        "Specialization": LabData[i].Specialization,
        "isTrusted": LabData[i].isTrusted,
        "about": LabData[i].about,
        "Experience": LabData[i].Experience,
        "Rating": LabData[i].Rating,
        "Location": []
      };
      if (LabData[i].Specialization.match(TestName)) {
        for (let j = 0; j < LabData[i].Location.length; j++) {
          if (LabData[i].Location[j].PinCode == pinCode) {
            let ClinicData = {
              "id": LabData[i].Location[j].id,
              "AreaName": LabData[i].Location[j].AreaName,
              "PinCode": LabData[i].Location[j].PinCode,
              "ClinicDetails": LabData[i].Location[j].ClinicDetails
            }
            Labdata["Location"].push(ClinicData);
          }
        }
        if (Labdata.Location.length > 0) {
          data.push(Labdata);
        }
      }
    }
    setFilteredLab(data);
    setRefreshingData(filteredLab);
    setRefreshing(true);
  }

  const SearchData = () => {
    let data = [];
    for (let i = 0; i < DoctorsData.length; i++) {
      let doctordata = {
        "id": DoctorsData[i].id,
        "Image": DoctorsData[i].Image,
        "name": DoctorsData[i].name,
        "MobileNumber": DoctorsData[i].MobileNumber,
        "Specialization": DoctorsData[i].Specialization,
        "isTrusted": DoctorsData[i].isTrusted,
        "about": DoctorsData[i].about,
        "Experience": DoctorsData[i].Experience,
        "Rating": DoctorsData[i].Rating,
        "Location": []
      };

      for (let j = 0; j < DoctorsData[i].Location.length; j++) {
        if (Mode == "Virtual") {
          let ClinicData = {
            "id": DoctorsData[i].Location[j].id,
            "AreaName": DoctorsData[i].Location[j].AreaName,
            "PinCode": DoctorsData[i].Location[j].PinCode,
            "FaceToFace": DoctorsData[i].Location[j].FaceToFace,
            "Virtual": DoctorsData[i].Location[j].Virtual,
            "ClinicDetails": DoctorsData[i].Location[j].ClinicDetails,
          }
          if ((ClinicData.FaceToFace == true ? "Face to Face" : null) == Mode) {
            doctordata["Location"].push(ClinicData);
          }
          else if ((ClinicData.Virtual == true ? "Virtual" : null) == Mode) {
            doctordata["Location"].push(ClinicData);
          }
        } else if (DoctorsData[i].Location[j].PinCode == pinCode) {
          let ClinicData = {
            "id": DoctorsData[i].Location[j].id,
            "AreaName": DoctorsData[i].Location[j].AreaName,
            "PinCode": DoctorsData[i].Location[j].PinCode,
            "FaceToFace": DoctorsData[i].Location[j].FaceToFace,
            "Virtual": DoctorsData[i].Location[j].Virtual,
            "ClinicDetails": DoctorsData[i].Location[j].ClinicDetails,
          }
          if ((ClinicData.FaceToFace == true ? "Face to Face" : null) == Mode) {
            doctordata["Location"].push(ClinicData);
          }
          else if ((ClinicData.Virtual == true ? "Virtual" : null) == Mode) {
            doctordata["Location"].push(ClinicData);
          }
        }
      }
      if (doctordata.Location.length > 0) {
        data.push(doctordata);
      }
    }
    setFilteredDocs(data);
    setRefreshingData(filteredDocs);
    setRefreshing(true);
  }

  const SearchRecommendedLocationData = () => {
    let data = [];
    for (let i = 0; i < DoctorsData.length; i++) {
      let doctordata = {
        "id": DoctorsData[i].id,
        "Image": DoctorsData[i].Image,
        "name": DoctorsData[i].name,
        "MobileNumber": DoctorsData[i].MobileNumber,
        "Specialization": DoctorsData[i].Specialization,
        "isTrusted": DoctorsData[i].isTrusted,
        "about": DoctorsData[i].about,
        "Experience": DoctorsData[i].Experience,
        "Rating": DoctorsData[i].Rating,
        "Location": []
      };

      for (let j = 0; j < DoctorsData[i].Location.length; j++) {
        if (DoctorsData[i].Location[j].PinCode == parseInt(pinCode) + 1) {
          let ClinicData = {
            "id": DoctorsData[i].Location[j].id,
            "AreaName": DoctorsData[i].Location[j].AreaName,
            "PinCode": DoctorsData[i].Location[j].PinCode,
            "ClinicDetails": DoctorsData[i].Location[j].ClinicDetails
          }
          doctordata["Location"].push(ClinicData);
        } else if (DoctorsData[i].Location[j].PinCode == parseInt(pinCode) - 1) {
          let ClinicData = {
            "id": DoctorsData[i].Location[j].id,
            "AreaName": DoctorsData[i].Location[j].AreaName,
            "PinCode": DoctorsData[i].Location[j].PinCode,
            "ClinicDetails": DoctorsData[i].Location[j].ClinicDetails
          }
          doctordata["Location"].push(ClinicData);
        }
      }
      if (doctordata.Location.length > 0) {
        data.push(doctordata);
      }
    }
    setFilteredDocs(data);
    setRefreshingData(filteredDocs);
    setRefreshing(true);
  }

  const SearchRecommendedLabLocationData = () => {
    let data = [];
    for (let i = 0; i < LabData.length; i++) {
      let labdata = {
        "id": LabData[i].id,
        "Image": LabData[i].Image,
        "name": LabData[i].name,
        "MobileNumber": LabData[i].MobileNumber,
        "Specialization": LabData[i].Specialization,
        "isTrusted": LabData[i].isTrusted,
        "about": LabData[i].about,
        "Experience": LabData[i].Experience,
        "Rating": LabData[i].Rating,
        "Location": []
      };

      for (let j = 0; j < LabData[i].Location.length; j++) {
        if (LabData[i].Location[j].PinCode == parseInt(pinCode) + 1) {
          let ClinicData = {
            "id": LabData[i].Location[j].id,
            "AreaName": LabData[i].Location[j].AreaName,
            "PinCode": LabData[i].Location[j].PinCode,
            "ClinicDetails": LabData[i].Location[j].ClinicDetails
          }
          labdata["Location"].push(ClinicData);
        } else if (LabData[i].Location[j].PinCode == parseInt(pinCode) - 1) {
          let ClinicData = {
            "id": LabData[i].Location[j].id,
            "AreaName": LabData[i].Location[j].AreaName,
            "PinCode": LabData[i].Location[j].PinCode,
            "ClinicDetails": LabData[i].Location[j].ClinicDetails
          }
          labdata["Location"].push(ClinicData);
        }
      }
      if (labdata.Location.length > 0) {
        data.push(labdata);
      }
    }
    setFilteredDocs(data);
    setRefreshingData(filteredDocs);
    setRefreshing(true);
  }

  const DataPasser = () => {
    for (let i = 0; i < DoctorsData.length; i++) {
      for (let j = 0; j < DoctorsData[i].Location.length; j++) {
        if (DoctorsData[i].Location[j].PinCode == pinCode) {
          SearchData();
          setRecommendRefresher(true);
        } else if (DoctorsData[i].Location[j].PinCode !== pinCode) {
          SearchRecommendedLocationData();
        }
      }
    }
  }

  const LabDataPasser = () => {
    for (let i = 0; i < LabData.length; i++) {
      for (let j = 0; j < LabData[i].Location.length; j++) {
        if (LabData[i].Location[j].PinCode == pinCode) {
          SearchLabData();
          setRecommendRefresher(true);
        } else if (LabData[i].Location[j].PinCode !== pinCode) {
          SearchRecommendedLabLocationData();
        }
      }
    }
  }

  const remover = (item) => {
    let i = Global.trustedDoctorDetails.indexOf(item.id);
    Global.trustedDoctorDetails.splice(i, 1);
  }

  const removerLabglobalid = (item) => {
    let j = Global.trustedLabDetails.indexOf(item.id);
    Global.trustedLabDetails.splice(j, 1);
  }

  function SortedDocsDataFunc() {
    let sortedArray = filteredDocs.map((value) => {
      if (Global.trustedDoctorDetails.includes(value.id)) {
        value.isTrusted = true;
        return value;
      }
      else {
        value.isTrusted = false;
        return value;
      }
    })
    setFilteredDocs(sortedArray);
  }

  function SortedLabDataFunc() {
    let sortedArray = filteredLab.map((value) => {
      if (Global.trustedLabDetails.includes(value.id)) {
        value.isTrusted = true;
        return value;
      }
      else {
        value.isTrusted = false;
        return value;
      }
    })
    setFilteredLab(sortedArray);
  }

  useEffect(() => {
    if (Type == "Lab Tests") {
      SortedLabDataFunc();
      SearchLabData();
    }
    else {
      SortedDocsDataFunc();
      SearchData();
    }
  }, [firstTime])

  useEffect(() => {
    SearchData();
    setRecommendRefresher(false);
  }, [recommendRefresher]);

  const setFilteredData = (TestType) => {
    setFilteredVoiceSearchDocsData(TestType);
  }

  const filterbyid = (id) => {

    filterModalData.forEach((value, index) => {
      if (id == value.id) {
        setShowFilterOptions(!showFilterOptions);
        value.isSelected = true;
      } else if (id == -1) {
        value.isSelected = false;
      } else {
        value.isSelected = false;
      }
    })
  }

  const handleFilter = (option) => {
    const filteredArray = Type === "Lab Tests" ? filteredLab : filteredDocs;

    let sortedArray = option === "Experience" ? filteredArray.sort((a, b) => b.Experience - a.Experience)
      : option === "Rating" ? [...filteredArray].sort((a, b) => b.Rating - a.Rating)
        : option === "Fees: Low to High" ? [...filteredArray].sort((a, b) => b.Location.flatMap(loc => loc.ClinicDetails).map(cd => cd.Fees).sort().reverse()[0] - a.Location.flatMap(loc => loc.ClinicDetails).map(cd => cd.Fees).sort().reverse()[0])
          : option === "Fees: High to Low" ? [...filteredArray].sort((a, b) => a.Location.flatMap(loc => loc.ClinicDetails).map(cd => cd.Fees).sort()[0] - b.Location.flatMap(loc => loc.ClinicDetails).map(cd => cd.Fees).sort()[0])
            : filteredArray;

    if (Type === "Lab Tests") {
      setFilteredLab(sortedArray);
    } else {
      setFilteredDocs(sortedArray);
    }
  };

  const onDoctorCardClick = (item) => {
    navigation.navigate("ChooseDateAndTime",
      {
        appointmentId: 0,
        sourcePage: "SelectDoctor",
        Type: Type,
        TypeID: item.id,
        Mode: Type == "Lab Tests" ? '' : Mode,
        locationData: item.Location[0].AreaName
      })
  }

  const onLabCardClick = (item) => {
    if (route.params.doctorName == "footer") {
      console.log("No Redirection");
    }
  }

  const onDoctorLikeBtnClick = (item) => {
    if (Type == "Lab Tests") {
      if (Global.trustedLabDetails.includes(item.id)) {
        removerLabglobalid(item)
      }
      else {
        Global.trustedLabDetails.push(item.id)
      }
      SortedLabDataFunc();
    } else {
      if (Global.trustedDoctorDetails.includes(item.id)) {
        remover(item)
      }
      else {
        Global.trustedDoctorDetails.push(item.id)
      }
      SortedDocsDataFunc();
    }
  }

  const onLabLikeBtnClick = (item) => {
    if (Type == "Lab Tests") {
      if (Global.trustedLabDetails.includes(item.id)) {
        removerLabglobalid(item)
      }
      else {
        Global.trustedLabDetails.push(item.id)
      }
      SortedLabDataFunc();
    } else {
      if (Global.trustedDoctorDetails.includes(item.id)) {
        remover(item)
      }
      else {
        Global.trustedDoctorDetails.push(item.id)
      }
      SortedDocsDataFunc();
    }
  }

  const onContinueClick = () => {
    if (pinCode.length == "") {
      setValidPincode(true);
    } else if (pinCode.length < 6) {
      setValidPincode(true);
    } else if (pinCode.length == 6) {
      setModalVisible(false)
      Type == "Lab Tests" ? LabDataPasser() : DataPasser()
    }
  }
  return (
    <SafeAreaView style={GlobalStyles.mainContainer}>
      <View style={GlobalStyles.mainBox}>
        <Header
          headerTitle={Type == "Lab Tests" ? "Select Lab" : route.params.doctorName == "footer" ? "Doctors" : "Select Doctor"}
          onPress={() => { Type == "Lab Tests" ? navigation.navigate("LabTest", { Type: Type }) : route.params.doctorName == "footer" ? navigation.navigate("Dashboard") : navigation.navigate("AppointmentType", { Type: Type }) }}
        />
        <View style={styles.inputContainer}>
          <VoiceSearch
            showFilterOptions={showFilterOptions}
            setshowFilterOptions={setShowFilterOptions}
            placeholderText={Type == "Lab Tests" ? "Search by Test name" : "Search by doctors name"} extraStyles={{ fontSize: scale(16) }}
            functionPropNameHere={(data) => {
              setFilteredData(data);
              if (data.length == filteredDocs.length) {
                setSearchData("");
              } else {
                setSearchData(data);
              }
            }}
            mainContext={this}
            data={Type == "Lab Tests" ? filteredLab : filteredDocs}
            isMicOutline={false}
            isFilterNeed={true}
          />
        </View>
        {Type == "Lab Tests" ? <TouchableOpacity style={styles.textBelowInput} onPress={() => setModalVisible(true)}>
          <View style={styles.textBelowInputData}>
            <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.largeText, { marginLeft: widthToDp(6) }]}>Labs Near You</Text>
          </View>

          <View style={styles.textBelowInputData}>
            <Text style={[Fonts.Nunito_700Bold, GlobalStyles.buttonnormalText, { marginRight: 5 }]}> {pinCode != filteredLab[0]?.Location[0].PinCode ? pinCode : filteredLab[0]?.Location[0]?.AreaName}</Text>
            <VectorIcons groupName='AntDesign' iconstyle={{ color: Colors.primaryButtonColor }} iconName='right' iconsize={20} />
          </View>

        </TouchableOpacity> :
          Mode !== "Virtual" ?
            <TouchableOpacity style={styles.textBelowInput} onPress={() => setModalVisible(true)}>
              <View style={styles.textBelowInputData}>
                <VectorIcons groupName='Ionicons' iconName='location-sharp' extraStyles={{ left: -5 }} iconsize={scale(20)} />
                <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold,]}>Clinic Location</Text>
              </View>
              <View style={styles.textBelowInputData}>
                <Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_700Bold, { marginRight: 5 }]}> {pinCode != filteredDocs[0]?.Location[0].PinCode ? pinCode : filteredDocs[0]?.Location[0]?.AreaName}</Text>
                <VectorIcons groupName='AntDesign' iconstyle={{ color: Colors.primaryButtonColor }} iconName='right' iconsize={20} />
              </View>
            </TouchableOpacity> : null}
        <View style={{ flex: 1 }}>
          {Type != "Lab Tests" ?
            pinCode != filteredDocs[0]?.Location[0]?.PinCode ?
              <View>
                <FieldLabel text={"No Doctors are currently available for this pincode."} />
                <FieldLabel extraStyles={{ color: Colors.primaryButtonColor }} text={"Nearby Doctors"} />
                <FlatList
                  data={searchData == "" ? Type == "Lab Tests" ? sortedLabs : sortedDocs
                    : filteredVoiceSearchDocsData}
                  contentContainerStyle={{ paddingBottom: heightToDp(20) }}
                  keyExtractor={(item, index) => 'key' + index}
                  extraData={refreshingData}
                  refreshing={refreshing}
                  renderItem={({ item, index }) => {
                    return (
                      <TouchableOpacity
                        onPress={() => onDoctorCardClick(item)}>
                        <View style={[{ flexDirection: 'row' }, styles.doctorCardContainer]}>
                          <View style={styles.doctorImageContainer}>
                            <Image style={styles.doctorImage} resizeMode='cover' source={{ uri: item.Image }}></Image>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                          <View style={[styles.doctorCardDetails]}>
                            <View style={GlobalStyles.rowSpaceBetween}>
                              <Text style={[GlobalStyles.largeText, Fonts.Nunito_700Bold]}>{item.name}</Text>
                            </View>
                            <View style={GlobalStyles.rowSpaceBetween}>
                              {Type == "Lab Tests" ?
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_400Regular, { marginTop: heightToDp(1) }]}>{item.Specialization}</Text>
                                :
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_400Regular, { marginTop: heightToDp(1) }]}>{item.Specialization} ({item.Experience}+ Years)</Text>
                              }
                            </View>
                            <View style={GlobalStyles.rowSpaceBetween}>
                              <Text style={[GlobalStyles.normalText, Fonts.Nunito_400Regular, { marginTop: heightToDp(1) }]}><Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_700Bold]}>₹ {item.Location[0].ClinicDetails[0].Fees} / visit</Text></Text>
                              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: widthToDp(4) }}>
                                <VectorIcons groupName='FontAwesome' iconstyle={{ color: Colors.primaryButtonColor, width: 30, height: 26, paddingLeft: 4 }} iconName='star' iconsize={scale(18)} />
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_400Regular]}>{item.Rating} / 5</Text>
                              </View>
                            </View>
                            <View style={{ height: 2, backgroundColor: Colors.modalBackground, marginTop: heightToDp(1) }}></View>
                            <View style={styles.dataBelowDoctorDetailsContainer}>
                              <View style={{ flexDirection: 'column', width: '10%' }}>
                                <TouchableOpacity
                                  onPress={() => onDoctorLikeBtnClick(item)}>
                                  {
                                    item.isTrusted ?
                                      <VectorIcons groupName='AntDesign' iconstyle={{ color: Colors.primaryButtonColor, width: 30, height: 26 }}
                                        iconName='like1' />
                                      : <VectorIcons groupName='AntDesign' iconstyle={{ color: Colors.primaryTextColor, width: 30, height: 26, alignItems: "center", justifyContent: "center" }}
                                        iconName='like1' />
                                  }
                                  <View style={{ flexDirection: 'column', width: '40%' }}>
                                    <Text style={[Fonts.Nunito_400Regular, item.isTrusted ? GlobalStyles.buttonnormalText : GlobalStyles.normalText]}>
                                      {(item.isTrusted ? 'Trusted' : 'Trust') + ' ' + (Type == "Lab Tests" ? 'Lab' : 'Doctor')}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              </View>

                              <View style={{ flexDirection: 'column', width: '50%', alignItems: 'flex-end' }}>
                                {
                                  Type == "Lab Tests" ?
                                    <TouchableOpacity style={styles.moreDetails}
                                      onPress={() => {
                                        navigation.navigate("DoctorDetails", { Type: Type, LabId: item.id, locationData: item.Location[0].AreaName })
                                      }}>
                                      <Text style={[GlobalStyles.buttonnormalText, { color: Colors.placeholderTextColor }, Fonts.Nunito_400Regular]}>More Details </Text>
                                      <VectorIcons groupName='AntDesign' iconstyle={{ color: Colors.placeholderTextColor, marginTop: 2 }} iconName="right" iconsize={scale(18)} />
                                    </TouchableOpacity>
                                    :
                                    <TouchableOpacity style={styles.moreDetails}
                                      onPress={() => {
                                        navigation.navigate("DoctorDetails", { Mode: Mode, DoctorsId: item.id, locationData: item.Location[0].AreaName })
                                      }}>
                                      <Text style={[GlobalStyles.buttonnormalText, { color: Colors.placeholderTextColor }, Fonts.Nunito_400Regular]}>More Details </Text>
                                      <VectorIcons groupName='AntDesign' iconstyle={{ color: Colors.placeholderTextColor, marginTop: 2 }} iconName="right" iconsize={scale(18)} />
                                    </TouchableOpacity>
                                }
                              </View>
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    )
                  }}
                />
              </View>
              :
              <FieldLabel text={"Recommended Doctors"} />
            : pinCode != filteredLab[0]?.Location[0].PinCode ?
              <Text style={[Fonts.Nunito_700Bold, GlobalStyles.largeText]}>No Labs are currently available for this pincode.{'\n'}
                <Text style={GlobalStyles.buttonextrasmallText}>Nearby Labs</Text>
              </Text>
              : null}
          <FlatList
            data={searchData == "" ? Type == "Lab Tests" ? sortedLabs : sortedDocs : filteredVoiceSearchDocsData}
            contentContainerStyle={{ paddingBottom: 20 }}
            keyExtractor={(item, index) => 'key' + index}
            extraData={refreshingData}
            refreshing={refreshing}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  onPress={() => onLabCardClick(item)}>
                  <View style={[{ flexDirection: 'row' }, styles.doctorCardContainer]}>
                    <View style={styles.doctorImageContainer}>
                      <Image style={styles.doctorImage} resizeMode='cover' source={{ uri: item.Image }}></Image>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <View style={styles.doctorCardDetails}>
                      <View style={GlobalStyles.rowSpaceBetween}>
                        <FieldLabel extraStyles={{ marginTop: -heightToDp(1) }} text={item.name} />
                      </View>
                      <View style={GlobalStyles.rowSpaceBetween}>
                        {Type == "Lab Tests" ?
                          <Text style={[GlobalStyles.normalText, Fonts.Nunito_400Regular, { marginTop: heightToDp(1) }]}>{item.Specialization}</Text>
                          :
                          <Text style={[GlobalStyles.normalText, Fonts.Nunito_400Regular, { marginTop: heightToDp(1) }]}>{item.Specialization} ({item.Experience}+ Years)</Text>
                        }
                      </View>
                      <View style={GlobalStyles.rowSpaceBetween}>
                        <Text style={[GlobalStyles.normalText, Fonts.Nunito_400Regular, { marginTop: heightToDp(1) }]}><Text style={[GlobalStyles.buttonnormalText, Fonts.Nunito_700Bold]}>₹ {item.Location[0].ClinicDetails[0].Fees} / visit</Text></Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginRight: widthToDp(4) }}>
                          <VectorIcons groupName="FontAwesome" iconstyle={{ color: Colors.primaryButtonColor, width: 30, height: 26, paddingLeft: 4 }} iconName="star" />
                          <Text style={[GlobalStyles.normalText, Fonts.Nunito_400Regular]}>{item.Rating} / 5</Text>
                        </View>
                      </View>
                      <View style={{ height: 2, backgroundColor: Colors.modalBackground, marginTop: heightToDp(1) }}></View>
                      <View style={styles.dataBelowDoctorDetailsContainer}>
                        <View style={{ flexDirection: 'row', width: '50%' }}>
                          <TouchableOpacity
                            onPress={() => onLabLikeBtnClick(item)}
                            style={{ flexDirection: "row", alignItems: "center" }}>

                            <View>
                              {
                                item.isTrusted ?
                                  <VectorIcons groupName='AntDesign' iconstyle={{ color: Colors.primaryButtonColor, width: 30, height: 26, alignItems: "center", justifyContent: "center" }}
                                    iconName='like1' iconsize={23} />
                                  :
                                  route.params.doctorName == "footer" ?
                                    null :
                                    <VectorIcons groupName='AntDesign' iconstyle={{ color: Colors.primaryTextColor, width: 30, height: 26, alignItems: "center", justifyContent: "center" }}
                                      iconName='like1' iconsize={23} />
                              }
                            </View>
                            <View>
                              <Text style={[Fonts.Nunito_400Regular, item.isTrusted ? GlobalStyles.buttonnormalText : route.params.doctorName == "footer" ? null : GlobalStyles.normalText]}>
                                {
                                  route.params.doctorName == "footer" ? "" :
                                    (item.isTrusted ? 'Trusted' : 'Trust') + (Type === "Lab Tests" ? " Lab" : " Doctor")
                                }
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'column', width: '50%', alignItems: 'flex-end' }}>
                          {
                            Type == "Lab Tests" ?
                              <TouchableOpacity
                                style={styles.moreDetails}
                                onPress={() => {
                                  navigation.navigate("DoctorDetails", { Type: Type, LabId: item.id, locationData: item.Location[0].AreaName })
                                }}>
                                <Text style={[GlobalStyles.buttonnormalText, { color: Colors.placeholderTextColor }, Fonts.Nunito_400Regular]}>More Details </Text>
                                <VectorIcons groupName="AntDesign" iconstyle={{ color: Colors.placeholderTextColor, marginTop: 2 }} iconName='right' iconsize={scale(18)} />
                              </TouchableOpacity>
                              :
                              <TouchableOpacity
                                style={styles.moreDetails}
                                onPress={() => {
                                  navigation.navigate("DoctorDetails", { Type: Type, Mode: Mode, DoctorsId: item.id, locationData: item.Location[0].AreaName, hideButton: route.params.doctorName })
                                }}>
                                <Text style={[GlobalStyles.buttonnormalText, { color: Colors.placeholderTextColor }, Fonts.Nunito_400Regular]}>More Details </Text>
                                <VectorIcons groupName="AntDesign" iconstyle={{ color: Colors.placeholderTextColor, marginTop: 2 }} iconName="right" iconsize={scale(18)} />
                              </TouchableOpacity>
                          }
                        </View>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}>
            <Pressable style={styles.centeredView}>
              <BlurView
                style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }]}
                blurType="dark"
                blurAmount={20}
                reducedTransparencyFallbackColor={Colors.boxBackground}
              />
              <View style={styles.modalView}>
                <View style={{ justifyContent: 'space-between', flexDirection: "row", padding: 9, borderBottomWidth: 2, borderBottomColor: Colors.placeholderTextColor, marginTop: heightToDp(1) }}>
                  <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_700Bold, { width: "90%", marginLeft: widthToDp(2) }]}>Enter your Pincode</Text>
                  <TouchableOpacity onPress={() => {
                    setModalVisible(false);
                  }}>
                    <VectorIcons groupName='Ionicons' iconName='close' iconsize={20} />
                  </TouchableOpacity>
                </View>
                <View style={{ justifyContent: "center", alignItems: "center" }}>
                  <TextInput
                    style={[GlobalStyles.mediumText, Fonts.Nunito_600SemiBold, styles.input]}
                    maxLength={6}
                    onChangeText={(text) => {
                      setPinCode(text.replace(/[^0-9]/g, ''));
                      if (text.length == 6 || text.length > 6) {
                        Keyboard.dismiss();
                        setValidPincode(false);
                      }
                    }}
                    value={pinCode.toString()}
                    placeholder="Enter your Pincode"
                    underlineColorAndroid="transparent"
                    keyboardType='number-pad'
                    placeholderTextColor={Colors.placeholderTextColor}
                    autoFocus={true}
                  />
                  {
                    validPincode ?
                      <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.extrasmallText, { color: Colors.red, marginLeft: -widthToDp(14) }]}>Please Enter 6 digit pincode</Text>
                      : null
                  }
                  <View style={[{ width: '40%', marginTop: heightToDp(1) }, GlobalStyles.fixedBottomSpacing]}>
                    <CommonButton
                      buttonText="Continue"
                      onPress={onContinueClick}
                      extraStyles={styles.Button}
                      extraTextStyles={{ color: Colors.boxBackground }}
                    />
                  </View>
                </View>
              </View>
            </Pressable>
          </Modal>
        </View>
        {
          showFilterOptions ?
            <TouchableWithoutFeedback onPress={() => setShowFilterOptions(false)}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <View style={[GlobalStyles.inputBoxShadow, {
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  backgroundColor: Colors.boxBackground,
                  borderRadius: 14,
                  position: 'absolute',
                  top: heightToDp(14),
                  right: widthToDp(0)
                }]}>
                  <FlatList
                    data={filterModalData}
                    keyExtractor={(item, index) => "key" + index}
                    renderItem={({ item, index }) => {
                      return (
                        <Pressable
                          key={index}
                          style={({ pressed }) => ([{
                            backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                            paddingTop: index == 0 ? heightToDp(1.5) : heightToDp(1),
                            paddingBottom: filterModalData.length - 1 == index ? heightToDp(1.5) : heightToDp(1),
                            paddingHorizontal: widthToDp(4),
                            borderTopLeftRadius: index == 0 ? 14 : 0,
                            borderTopRightRadius: index == 0 ? 14 : 0,
                            width: '100%'
                          }])}
                          onPress={() => {
                            filterbyid(item.id);
                            handleFilter(item.optionTitle)
                          }}>
                          <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.normalText, {
                            color: item.isSelected ? Colors.primaryButtonColor : Colors.primaryTextColor,
                          }]}>
                            {item.optionTitle}
                          </Text>
                        </Pressable>
                      )
                    }}
                  />
                  <View style={[{
                    borderBottomWidth: 1,
                    width: '80%',
                    alignSelf: 'center',
                    borderBottomColor: Colors.primaryinactive
                  }]} />
                  <Pressable
                    style={({ pressed }) => ([{
                      backgroundColor: pressed ? Colors.primaryinactive : Colors.boxBackground,
                      padding: widthToDp(2),
                      width: '100%',
                      borderBottomLeftRadius: 14,
                      borderBottomRightRadius: 14
                    }])}
                    onPress={() => {
                      filterbyid(-1);
                      setShowFilterOptions(!showFilterOptions);
                      setFilteredDocs(sortedDocs);
                      setFilteredLab(sortedLabs);
                    }}>
                    <Text style={[Fonts.Nunito_600SemiBold, {
                      color: Colors.secondarybuttonColor,
                      fontSize: scale(16)
                    }]}>
                      Reset Filter
                    </Text>
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
            :
            null
        }
      </View>
      <Footer navigation={navigation} activeScreen={"Doctors"} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 14
  },
  textBelowInput: {
    marginTop: heightToDp(2),
    height: heightToDp(5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  textBelowInputData: {
    flexDirection: "row",
    alignItems: "center"
  },
  doctorCardContainer: {
    backgroundColor: Colors.modalBackground,
    width: "100%",
    marginTop: heightToDp(2),
    borderRadius: 14,
    marginBottom: heightToDp(0)
  },
  doctorImageContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.placeholderTextColor,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14
  },
  doctorImage: {
    width: "100%",
    height: heightToDp(22),
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14
  },
  doctorCardDetails: {
    backgroundColor: Colors.boxBackground,
    padding: 12,
    width: "100%",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginBottom: heightToDp(2)
  },
  dataBelowDoctorDetailsContainer: {
    flexDirection: "row",
    marginTop: heightToDp(1),
    paddingBottom: heightToDp(1)
  },
  moreDetails: {
    flexDirection: "row",
    alignItems: "center"
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.modalBackground
  },
  modalView: {
    margin: 20,
    backgroundColor: Colors.boxBackground,
    borderRadius: 14,
    width: "80%",
    shadowColor: Colors.primaryTextColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  input: {
    height: 50,
    borderWidth: 1,
    padding: 10,
    width: "80%",
    borderRadius: 14,
    marginTop: heightToDp(2)
  },
  Button: {
    height: heightToDp(5)
  }
});

export default SelectDoctor;