import React, { useEffect, useState } from 'react';
import { Pressable, Image, View, TextInput, Modal, StyleSheet } from 'react-native';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import VectorIcons from './VectorIcons';
import Global from '../screens/Global';
import GlobalStyles from '../utils/GlobalStyles';
import { moderateScale, scale } from 'react-native-size-matters'

const DateSelect = (props) => {
  const [selectedStartDate, setSelectedStartDate] = useState(undefined);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(undefined);
  const [dateInputText, setDateInputText] = useState("");
  const today = new Date();
  const patientsDOB = new Date();

  let initialDate;

  const onDateChange = (date) => {
    if (!props.isPatientForm) {
      handdleInputDate(moment(date).format('DD/MM/YYYY'));
      setSelectedStartDate(props.isPatientForm ? props.dob : moment(date).format('DD/MM/YYYY'));
      setShowDatePickerModal(false);
      setCurrentDate(date);
    }
    else {
      handdleInputDate(moment(date).format('DD/MM/YYYY'));
      setSelectedStartDate(moment(date).format('DD/MM/YYYY'));
      setShowDatePickerModal(false);
      setCurrentDate(date);
    }
  };

  let minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 110);

  let maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);
  initialDate = maxDate;

  if (props.SelectedRelation) {
    if (props.SelectedRelation == 'Father' || props.SelectedRelation == 'Mother' || props.SelectedRelation == 'Father in Law' || props.SelectedRelation == 'Mother in Law') {
      const parentMinDate = Global.userInfo.DOB ? new Date(Global.userInfo.DOB) : new Date();
      minDate = parentMinDate.setFullYear(parentMinDate.getFullYear() + 15);
      maxDate = new Date();
      initialDate = maxDate;
    } else if (props.SelectedRelation == 'Son' || props.SelectedRelation == 'Daughter' || props.SelectedRelation == 'Son in Law' || props.SelectedRelation == 'Daughter in Law') {
      const parentMinDate = Global.userInfo.DOB ? new Date(Global.userInfo.DOB) : new Date();
      minDate = parentMinDate.setFullYear(parentMinDate.getFullYear() - 100);
      maxDate = parentMinDate.setFullYear(parentMinDate.getFullYear() + 85);
      initialDate = maxDate;
    } else if (props.SelectedRelation == 'Self') {
      console.log("Self");
    } else {
      maxDate = new Date();
      initialDate = maxDate;
    }
  }

  useEffect(() => {
    if (props.fromSetting || props.dob) {
      handdleInputDate(moment(props.dob).format('DD/MM/YYYY'));
    }
  }, [props.dob]);

  const handdleInputDate = (dateInText) => {
    props.getDateOfBirth("");
    setCurrentDate("");
    const newTextDate = dateInText.split("");
    for (let i = 0; i < newTextDate.length; i++) {
      if (newTextDate[i].includes("/")) {
        newTextDate.splice(i, 1);
      }
    }
    if (newTextDate.length >= 3) {
      if (!newTextDate[2]?.includes("/")) {
        newTextDate.splice(2, 0, "/");
      }
    }
    if (newTextDate.length >= 6) {
      if (!newTextDate[5]?.includes("/")) {
        newTextDate.splice(5, 0, "/");
      }
    }

    setDateInputText(newTextDate.join(""));

    if (newTextDate.join("").length == 10) {
      const dateText = newTextDate.join("");
      const ddmmyy = dateText.split("/");
      if (!(/^(3[01]|[1-2]\d|0?[1-9])-(1[0-2]|0?[1-9])-((\d{4})|(0{2}?\d{2}))$/g.test(ddmmyy.join("-")))) {
        props.DisplayError("Please enter valid Date.");
        return;
      }
      patientsDOB.setDate(parseInt(ddmmyy[0]));
      patientsDOB.setMonth(parseInt(ddmmyy[1]) - 1);
      patientsDOB.setFullYear(parseInt(ddmmyy[2]));
      if (props.isPatientForm) {
        const newMinDateTime = typeof minDate == "string" || typeof minDate == "object" ? new Date(minDate).getTime() : parseInt(minDate);
        const newMaxDateTime = typeof maxDate == "object" ? (maxDate.getTime() + 86400000) : (parseInt(maxDate) + 86400000);
        if ((newMinDateTime <= patientsDOB?.getTime()) && (patientsDOB?.getTime() <= newMaxDateTime)) {
          props.getDateOfBirth(patientsDOB);
          setCurrentDate(patientsDOB);
        }
      } else {
        today.setFullYear(today.getFullYear() - 18);
        if (patientsDOB.getTime() <= today.getTime()) {
          props.getDateOfBirth(patientsDOB)
          setCurrentDate(patientsDOB);
        }
      }
    }
  };

  useEffect(() => {
    handdleInputDate("");
  }, [props.SelectedRelation]);

  return (
    <View style={[styles.mainDateContainer, props.extraStyles]}>
      <Pressable
        onPress={() => {
          if (props.isPatientForm) {
            !props.fromSetting &&
              setShowDatePickerModal(true)
          }
        }}
        style={({ pressed }) => [{ opacity: pressed && props.isPatientForm ? 0.4 : 1, flexDirection: "row", width: "100%" }]}>
        <TextInput
          placeholder="DD/MM/YYYY"
          keyboardType="numeric"
          maxLength={10}
          value={dateInputText || selectedStartDate}
          onChangeText={(text) => {
            setSelectedStartDate("");
            handdleInputDate(text);
          }}
          editable={!props.isPatientForm && !props.fromSetting}
          placeholderTextColor={Colors.placeholderTextColor}
          style={[GlobalStyles.mediumText, { flex: 1, paddingLeft: widthToDp(4) }, Fonts.Nunito_600SemiBold]} />
        <Pressable
          onPress={() => !props.fromSetting && setShowDatePickerModal(true)}
          style={({ pressed }) => [{ opacity: pressed ? 0.4 : 1 }, styles.button]}
        >
          <Image resizeMode="contain" style={[styles.icon]} source={require('../assets/vectors/calender_icon.png')} />
        </Pressable>
      </Pressable>
      <Modal
        visible={showDatePickerModal}
        animationType={'fade'}
        transparent={true}>
        <View style={[GlobalStyles.columnCenter, styles.modalcontainer]}>
          <View style={styles.boxcontainer}>
            <View style={styles.selectcontainer}>
              <Pressable
                hitSlop={50}
                onPress={() => { setShowDatePickerModal(false); }}
                style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.4 : 1 }]}
              >
                <VectorIcons groupName="Ionicons" iconName={"close"} iconsize={scale(25)} iconstyle={{ color: Colors.placeholderTextColor }} />
              </Pressable>
            </View>
            <CalendarPicker
              textStyle={[{ fontSize: responsiveFont(scale(16)), color: Colors.primaryTextColor }, Fonts.Nunito_700Bold]}
              restrictMonthNavigation={true}
              selectedDayColor={Colors.primaryButtonColor}
              selectedDayTextColor={Colors.boxBackground}
              selectedStartDate={currentDate ? currentDate : undefined}
              initialDate={currentDate ? currentDate : initialDate}
              minDate={minDate}
              maxDate={maxDate}
              onDateChange={onDateChange}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainDateContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.boxBackground,
    borderRadius: 14
  },
  modalcontainer: {
    backgroundColor: Colors.modalBackground,
    flex: 1
  },
  boxcontainer: {
    backgroundColor: Colors.boxBackground,
    borderRadius: 14,
    width: '97%',
    paddingBottom: widthToDp(4)
  },
  selectcontainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  button: [{
    borderRadius: 14,
    paddingHorizontal: widthToDp(2),
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  }, GlobalStyles.normalText, Fonts.Nunito_600SemiBold],
  icon: {
    width: widthToDp(8),
    height: heightToDp(8),
    marginRight: widthToDp(2)
  },
  closeButton: {
    marginRight: 8,
    marginTop: widthToDp(4),
    backgroundColor: Colors.boxBackground,
    justifyContent: "center",
    borderRadius: 50,
    alignItems: "center",
    height: moderateScale(30),
    width: moderateScale(30)
  }
});

export default DateSelect;