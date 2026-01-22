import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import Vitals from '../screens/Vitals';
import VitalsReading from '../screens/VitalsReading';
import Fonts from '../utils/Fonts';
import Global from '../screens/Global';
import Colors from '../utils/Colors';
import moment from 'moment';
import YourDocuments from '../screens/YourDocuments';
import MedicineReminders from '../screens/MedicineReminders';
import Timeline from '../screens/Timeline';
import MyAppointments from '../screens/MyAppointments';
import Share from 'react-native-share';
import ReusableCarousel from './ReusableCarousel';
import GlobalStyles from '../utils/GlobalStyles';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from './Loader';
import WarningModal from './WarningModal';
import { apiCall } from '../utils/ApiUtils';
import { scale } from 'react-native-size-matters';
const windowWidth = Math.round(Dimensions.get('window').width);

let selectedTreatmentCycleObj = {};
var emptyVitalsData = [];
const TreatmentCycle = (props) => {
  const propsData = props?.routedData;
  const [data, setData] = useState([]);
  const [value, setValue] = useState(Global.selectedCycle);
  const [selected, setSelected] = useState(propsData.selectedTab || "vitals");
  const [date, setDate] = useState(moment());
  const [currentCycleIdObj, setCurrentCycleIdObj] = useState({});
  const [firstTime, setFirstTime] = useState(true);
  const [notEditable, setNotEditable] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [loading, setLoading] = useState(false);
  const tabRef = useRef();
  const [newVitalData, setNewVitalData] = useState([]);
  const [prevCycle, setPrevCycle] = useState(false);
  const [vitalData, setVitalData] = useState();

  const isSelectedIdLargest = (selectedData, selectedId) => {
    const selectedItem = selectedData.find(item => item.id === selectedId);
    if (!selectedItem) {
      return false; // If the selectedId is not found, return false
    }
    const { treatmentTypeId } = selectedItem;
    const sameTreatmentTypeItems = selectedData.filter(item => item.treatmentTypeId === treatmentTypeId);
    const isLargest = sameTreatmentTypeItems.every(item => parseInt(item.id) <= parseInt(selectedId));
    setPrevCycle(!isLargest);
    return isLargest;
  };

  const createNewVitalData = (id, vitalType, vitalUnit, vitalMaxRange, vitalMinRange) => {
    const vitalDataObj = {};
    vitalDataObj.id = id;
    vitalDataObj.maximumValue = vitalMaxRange;
    vitalDataObj.minimumValue = vitalMinRange;
    vitalDataObj.name = vitalType;
    vitalDataObj.unit = vitalUnit;
    return vitalDataObj;
  };

  const setcycleId = (cycledata, selectedId) => {
    cycledata = cycledata.reverse();
    const tempObj = {};
    for (const cycle of cycledata) {
      tempObj[cycle.name] = cycle.id;
      if (tempObj[Global.selectedTreatmentType] === selectedId) {
        selectedTreatmentCycleObj = cycle;
      }
    }
    const newData = cycledata;
    setNotEditable(isSelectedIdLargest(newData, selectedId));
    setCurrentCycleIdObj(tempObj);
  }

  const getDiseaseTreatmentCycle = async () => {
    try {
      const body = {
        "diseaseId": Global.diseaseID.toString(),
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": Global.OS
      };
      setLoading(true);
      const response = await apiCall('treatment/getdiseasetreatmentcycleslist', body);
      setcycleId(response.cycles, Global.selectedCycle);
      setData(response.cycles);
      setFirstTime(false);
      if (!(firstTime && selected == "vitals")) {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      DisplayError(error.msg || "Something went wrong, please try again");
    }
  }

  const tabData = [
    {
      tabName: "vitals",
      tabShowName: "VITALS",
      iconImage: require("../assets/vectors/Vital.png"),
      activeIconImage: require("../assets/vectors/Vital_active.png"),
      tabStyle: [styles.vitals, { width: windowWidth < 360 ? widthToDp(33) : windowWidth < 530 ? widthToDp(20) : widthToDp(12) }]
    },
    {
      tabName: "Reports",
      tabShowName: "REPORTS",
      iconImage: require("../assets/vectors/Report.png"),
      activeIconImage: require("../assets/vectors/Report_active.png"),
      tabStyle: [styles.reports, { width: windowWidth < 360 ? widthToDp(33) : windowWidth < 530 ? widthToDp(22) : widthToDp(18.5) }]
    },
    {
      tabName: "appointments",
      tabShowName: "APPOINTMENTS",
      iconImage: require("../assets/vectors/Appointment.png"),
      activeIconImage: require("../assets/vectors/Appointment_active.png"),
      tabStyle: [styles.appointments, { width: windowWidth < 360 ? widthToDp(33) : windowWidth < 530 ? widthToDp(28) : widthToDp(26.8) }]
    },
    {
      tabName: "Medications",
      tabShowName: "MEDICATIONS",
      iconImage: require("../assets/vectors/medication.png"),
      activeIconImage: require("../assets/vectors/Medication_active.png"),
      tabStyle: [styles.medications, { width: windowWidth < 360 ? widthToDp(33) : windowWidth < 530 ? widthToDp(28) : widthToDp(26.5) }]
    },
    {
      tabName: "Timeline",
      tabShowName: "TIMELINE",
      iconImage: require("../assets/vectors/timeline_inactive.png"),
      activeIconImage: require("../assets/vectors/timeline_active.png"),
      tabStyle: [styles.timeLine, { width: windowWidth < 360 ? widthToDp(33) : windowWidth < 530 ? widthToDp(19) : widthToDp(15.5) }]
    },
  ];

  const DisplayError = (text) => {
    setWarningText(text)
    setShowModal(true);
  }

  const getvitalslist = async () => {
    try {
      const body = {
        "diseaseId": Global.diseaseID,
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": Global.OS
      };
      setLoading(true);
      const response = await apiCall('vitals/getvitalslist', body, true);
      const vitals = response.vitals;
      if (!(firstTime && selected == "vitals")) {
        setLoading(false);
      }
      const updatedList = [];
      for (let i = 0; i < vitals.length; i++) {
        updatedList[vitals[i].id] = createNewVitalData(vitals[i].id, vitals[i].name, vitals[i].unit, vitals[i].maximumValue, vitals[i].minimumValue);
      }
      emptyVitalsData = updatedList;
    } catch (error) {
      setLoading(false);
      DisplayError(error.msg || "Something went wrong, please try again");
    }
  }

  const getvitalsdata = async (vitaldate, cycleID) => {
    try {
      const body = {
        "treatmentCycleId": cycleID?.toString(),
        "date": vitaldate ? moment(vitaldate).format("DD/MM/YYYY") : moment().format("DD/MM/YYYY"),
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": Global.OS
      };
      setLoading(true);
      const response = await apiCall('vitals/getvitalsdata', body);
      const vitals = response.vitals;
      setLoading(false);
      const updatedData = vitals.map((values, i) => {
        if (emptyVitalsData.length !== 0) {
          const foundedValue = emptyVitalsData[values.id];
          foundedValue.value = values?.value || "";
          foundedValue.time = values?.time || "";
          foundedValue.recordedBy = values?.recordedBy || "";
          return foundedValue;
        }
      });
      setNewVitalData(updatedData);
    } catch (error) {
      setLoading(false);
      DisplayError(error.msg || "Something went wrong, please try again");
    }
  }

  const getData = async () => {
    if (firstTime) {
      await getDiseaseTreatmentCycle();
      await getvitalslist();
    }
    if (selected == "vitals") {
      await getvitalsdata(date, Global.selectedCycle);
    }
  }

  useEffect(() => {
    getData();
  }, [selected]);

  const getVitalData = (value1) => {
    setVitalData(value1);
    props.setShowOtherScreen(true);
  }

  const setGlobalVitalData = (vital) => {
    props.setDisable(false);
    props.setShowOtherScreen(false);
  };

  const ShareData = (item) => {
    const message = `*Vitals Type* :\n${"vitalsData.vitalType"}\n*Reading Value* : ${"readingValues.reading"}\n*Reading Time* : ${"readingValues.readingTime"}\n*Readed By* : ${"readingValues.recordedBy"}`;
    Share.open({
      title: 'Sharing Vitals Details',
      message: message,
    }).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log("share chatch if error", err);
    });
  }

  const setEditable = (cycle, dateString) => {
    if (currentCycleIdObj[cycle.name] == cycle.id) {
      setNotEditable(moment().format("DD/MM/YYYY") === dateString);
    } else {
      setNotEditable(false);
    }
  }

  const onDropdownValueChange = (item) => {
    Global.selectedCycle = item.id;
    selectedTreatmentCycleObj = item;
    setValue(item.id);
    getvitalsdata(date, item.id);
    setNotEditable(isSelectedIdLargest(data, item.id));
  };

  const onTabClick = (item) => {
    setSelected(item.tabName);
    props.setShowOtherScreen(false);
    props.setDisable(false);
  }

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Dropdown
          disable={props.isDisable}
          style={[styles.dropdown, Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { backgroundColor: props.isDisable ? Colors.boxBackground : Colors.lightblue, borderColor: props.isDisable ? Colors.defaultBackground : Colors.lightblue }]}
          iconStyle={styles.iconStyle}
          iconColor={props.isDisable ? "#ffffff00" : Colors.primaryTextColor}
          itemTextStyle={[GlobalStyles.mediumText, { fontSize: responsiveFont(scale(18)) }]}
          selectedTextStyle={[GlobalStyles.mediumText, { fontSize: responsiveFont(scale(18)) }]}
          data={data}
          maxHeight={300}
          labelField="cycle"
          valueField="id"
          value={Global.selectedCycle}
          onChange={(item) => onDropdownValueChange(item)}
        />
      </View>
      <View style={styles.navContainer}>
        <ReusableCarousel
          useRefValue={tabRef}
          showBtn={(windowWidth <= 530)}
          DATA={tabData}
          renderItemFunc={(item, index) => {
            return (
              <TouchableOpacity key={index} style={[styles.Button, selected == item.tabName ? styles.Selected : null]}
                onPress={() => onTabClick(item)}>
                <View style={item.tabStyle}>
                  <Image resizeMode='contain' style={styles.iconImage} source={selected == item.tabName ? item.activeIconImage : item.iconImage} />
                  <Text style={[{ fontSize: responsiveFont(12), color: selected == item.tabName ? Colors.primaryButtonColor : Colors.primaryTextColor }, Fonts.Nunito_600SemiBold]}>{item.tabShowName}</Text>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      </View>
      {(selected == "vitals" && !props.showOtherScreen) && (
        <Vitals diseaseName={Global.selectedDiseaseName} selectedCycleId={Global.selectedCycle} getVitalData={getVitalData} newVitalData={newVitalData} setDate={setDate} date={date} notEditable={notEditable} setDisable={props.setDisable} setNotEditable={setNotEditable} ShareData={ShareData} onRefreshBtn={getvitalsdata} cycleID={value} setEditable={setEditable} selectedTreatmentCycleObj={selectedTreatmentCycleObj} />
      )}
      {
        (selected == "vitals" && props.showOtherScreen) && (<VitalsReading vitalData={vitalData} setGlobalVitalData={setGlobalVitalData} cycleID={value} setNotEditable={setNotEditable} notEditable={notEditable} setDate={setDate} date={date} prevCycle={prevCycle} />)
      }
      {
        selected == "Reports" &&
        <View style={{ flex: 1 }}>
          <YourDocuments dropdownValue={value} />
        </View>
      }
      {
        selected == "Medications" &&
        <View style={{ flex: 1 }}>
          <MedicineReminders dropdownValue={value} selectedTab={selected} />
        </View>
      }
      {
        selected == "Timeline" &&
        <View style={{ flex: 1 }}>
          <Timeline cycleID={value} date={date} setselectedTab={setSelected} />
        </View>
      }
      {
        selected == "appointments" &&
        <View style={{ flex: 1 }}>
          <MyAppointments noHeader={true} noFooter={true} />
        </View>
      }
      <Spinner
        visible={loading}
        color={Colors.primaryButtonColor}
        customIndicator={<Loader />}
        textStyle={{ color: Colors.primaryButtonColor }}
      />
      <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
    </View>
  )
}

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: Colors.lightblue,
    borderWidth: 0.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    width: "90%",
    marginHorizontal: widthToDp(5),
  },
  iconStyle: {
    width: 30,
    height: 30,
    marginRight: 10,
    color: Colors.primaryButtonColor
  },
  navContainer: {
    height: heightToDp(12),
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: heightToDp(2),
  },
  vitals: {
    justifyContent: "center",
    alignItems: "center",
    width: widthToDp(20),
  },
  iconImage: {
    height: heightToDp(5),
    width: widthToDp(9),
    marginBottom: heightToDp(1),
  },
  reports: {
    justifyContent: "center",
    alignItems: "center",
    width: widthToDp(22)
  },
  appointments: {
    justifyContent: "center",
    alignItems: "center",
    width: widthToDp(28)
  },
  medications: {
    justifyContent: "center",
    alignItems: "center",
    width: widthToDp(28)
  },
  timeLine: {
    justifyContent: "center",
    alignItems: "center",
    width: widthToDp(20)
  },
  Button: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: heightToDp(1),
  },
  Selected: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primaryButtonColor
  }
});

export default TreatmentCycle;