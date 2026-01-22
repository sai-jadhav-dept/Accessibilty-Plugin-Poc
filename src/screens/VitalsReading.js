import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Pressable, Vibration } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import CommonButton from '../components/CommonButton';
import { widthToDp, heightToDp } from '../utils/Responsive';
import { Slider } from '@miblanchard/react-native-slider';
import VectorIcons from '../components/VectorIcons';
import VitalOptions from '../components/VitalOptions';
import moment from 'moment';
import Bar_Chart from '../components/Bar_Chart';
import { ScaledSheet, scale } from 'react-native-size-matters';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import { apiCall } from '../utils/ApiUtils';
import Global from './Global';

const VitalsReading = (props) => {
    const [time, setTime] = useState(new Date());
    const vitalData = props.vitalData;
    const [value, setValue] = useState(vitalData.minimumValue || 0);
    const [dotValue, setDotValue] = useState(0);
    const [bloodPressureSecondaryValue, setBloodPressureSecondaryValue] = useState(30);
    const [recordedBy, setRecordedBy] = useState(Global.userType);
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const today = moment().format('YYYY-MM-DD'); // Get today's date in 'YYYY-MM-DD' format
    const inputDate = moment(props.date).format('YYYY-MM-DD'); // Format input date
    const showHistory = props.notEditable ? true : props.prevCycle ? false : inputDate == today ? true : vitalData.value == "";
    const showDotSlider = vitalData.name === "Temperature" || vitalData.name === "Weight";
    const showBloodPressureSlider = vitalData.name === "Blood Pressure";

    useEffect(() => {
        if (vitalData.value) {
            if (showDotSlider) {
                const vitalValue = vitalData.value.split(".");
                setValue(vitalValue[0]);
                setDotValue(vitalValue[1])
            } else if (showBloodPressureSlider) {
                const vitalValue = vitalData.value.split("/");
                setValue(vitalValue[0]);
                setBloodPressureSecondaryValue(vitalValue[1]);
            } else {
                setValue(vitalData.value);
            }
            setRecordedBy(vitalData.recordedBy);
        }
    }, []);

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    }

    const setVitalData = async () => {
        if (value == 0) {
            DisplayError('Please add any value to record.');
            return;
        } else if (moment(props.date).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY') && (time >= new Date())) {
            DisplayError("Please select appropriate time.");
            return;
        }
        try {
            let vitalValue = "";
            if (showDotSlider) {
                vitalValue = `${value}.${dotValue}`;
            } else {
                vitalValue = vitalData.name != "Blood Pressure" ? value : `${value}/${bloodPressureSecondaryValue}`;
            }
            const body = {
                "treatmentCycleId": props.cycleID.toString(),
                "vitalsId": vitalData.id.toString(),
                "value": vitalValue.toString(),
                "date": moment(new Date(props.date)).format('DD-MM-yyyy'),
                "recordedBy": Global.userType,
                "time": moment(time).format("hh:mm A"),
                "coord": [
                    "24.623061",
                    "10.830960"
                ],
                "location": "Mumbai",
                "deviceInfo": Global.OS
            }
            setLoading(true);
            await apiCall('vitals/updatevitalsdata', body);
            setLoading(false);
            vitalData.value = vitalValue;
            vitalData.time = moment(time).format("hh:mm A");
            vitalData.recordedBy = recordedBy;
            props.setGlobalVitalData(vitalData);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    const onSliderValueChange = sliderValue => {
        if (value != sliderValue) {
            Vibration.vibrate(10);
        }
        setValue(sliderValue.toString());
    };

    const onDotValueChange = (sliderValue) => {
        if (dotValue != sliderValue) {
            Vibration.vibrate(10);
        }
        setDotValue(sliderValue.toString());
    }

    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <ScrollView>
                    <View style={{ marginVertical: heightToDp(3) }}>
                        <VitalOptions
                            readingTime={time}
                            setTime={setTime}
                            isReadingsScreen={true}
                            showHistory={showHistory}
                            extraStyles={{ marginBottom: heightToDp(4) }}
                            setNotEditable={props.setNotEditable}
                            setDate={props.setDate}
                            date={props.date}
                        />
                        {showHistory && <View style={GlobalStyles.rowFlexstart}>
                            <View style={[{ flex: 1 }]}>
                                <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>
                                    {vitalData.name || "VitalsReading"}
                                </Text>
                            </View>
                        </View>}
                        {showHistory &&
                            <>
                                <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 30 }}>
                                    <Text style={[Fonts.Nunito_300Light, { fontSize: scale(90), color: Colors.primaryTextColor }]}>{showDotSlider ? `${value}.${dotValue}` : value}</Text>
                                    {
                                        vitalData.unit == "F" && <Text style={[Fonts.Nunito_300Light, { fontSize: scale(56), position: 'absolute', color: Colors.primaryTextColor, top: -heightToDp(2), right: widthToDp(value.length != 2 ? (value.length != 3 ? 18 : 0) : 9) }]}>o</Text>
                                    }
                                    {
                                        vitalData.unit != 'mmHg' && <Text style={[Fonts.Nunito_600SemiBold, GlobalStyles.extralargeText]}>{vitalData.unit}</Text>
                                    }
                                </View>
                                <View style={{
                                    marginLeft: 20,
                                    marginRight: 20,
                                    alignItems: 'stretch',
                                    justifyContent: 'center'
                                }}>
                                    <Slider
                                        value={value}
                                        renderAboveThumbComponent={() =>
                                            <View style={styles.sliderThumb}>
                                                <View style={styles.thumbDownArrow}></View>
                                                <Text style={[GlobalStyles.backgroundextrasmallText, Fonts.Nunito_600SemiBold]}>{value}</Text>
                                            </View>}
                                        onValueChange={onSliderValueChange}
                                        thumbStyle={{ height: 20, width: 20 }}
                                        thumbTintColor={Colors.boxBackground}
                                        minimumTrackTintColor='#8B63FF'
                                        minimumValue={parseInt(vitalData.minimumValue)}
                                        maximumValue={parseInt(vitalData.maximumValue)}
                                        step={1}
                                        maximumTrackTintColor='#D9D2FF'
                                        trackStyle={{ height: 30, borderRadius: 14 }}
                                    />
                                </View>
                                {/* dot values slider */}
                                {showDotSlider && <View style={{
                                    marginLeft: 20,
                                    marginRight: 20,
                                    alignItems: 'stretch',
                                    justifyContent: 'center',
                                    marginTop: heightToDp(7)
                                }}>
                                    <Slider
                                        value={dotValue}
                                        renderAboveThumbComponent={() =>
                                            <View style={styles.sliderThumb}>
                                                <View style={styles.thumbDownArrow}></View>
                                                <Text style={[GlobalStyles.backgroundextrasmallText, Fonts.Nunito_600SemiBold]}>{dotValue}</Text>
                                            </View>}
                                        onValueChange={onDotValueChange}
                                        thumbStyle={{ height: 20, width: 20 }}
                                        thumbTintColor={Colors.boxBackground}
                                        minimumTrackTintColor='#8B63FF'
                                        minimumValue={0}
                                        maximumValue={9}
                                        step={1}
                                        maximumTrackTintColor='#D9D2FF'
                                        trackStyle={{ height: 30, borderRadius: 14 }}
                                    />
                                </View>}
                            </>}
                        {showHistory && showBloodPressureSlider &&
                            <View>
                                <View style={[{
                                    borderBottomWidth: 1,
                                    borderBottomColor: Colors.textInputBorder,
                                    width: '50%',
                                    alignSelf: 'center',
                                    marginTop: heightToDp(2)
                                }]} />
                                <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 30 }}>
                                    <Text style={[Fonts.Nunito_300Light, { fontSize: scale(104), color: Colors.primaryTextColor }]}>{bloodPressureSecondaryValue}</Text>
                                </View>
                                <View style={{
                                    marginLeft: 20,
                                    marginRight: 20,
                                    alignItems: 'stretch',
                                    justifyContent: 'center'
                                }}>
                                    <Slider
                                        value={bloodPressureSecondaryValue}
                                        renderAboveThumbComponent={() =>
                                            <View style={styles.secondSliderThumb}>
                                                <View style={styles.secondSliderDownArrow}></View>
                                                <Text style={[GlobalStyles.backgroundextrasmallText, Fonts.Nunito_600SemiBold]}>{bloodPressureSecondaryValue}</Text>
                                            </View>}
                                        onValueChange={bloodPressurevalue => {
                                            if (bloodPressureSecondaryValue != bloodPressurevalue) {
                                                Vibration.vibrate(10);
                                            }
                                            setBloodPressureSecondaryValue(bloodPressurevalue.toString());
                                        }}
                                        thumbStyle={{ height: 20, width: 20 }}
                                        thumbTintColor={Colors.boxBackground}
                                        minimumTrackTintColor='#8B63FF'
                                        minimumValue={parseInt(vitalData.vitalSecondaryMinRange) || 30}
                                        maximumValue={parseInt(vitalData.vitalSecondaryMaxRange) || 120}
                                        step={1}
                                        maximumTrackTintColor='#D9D2FF'
                                        trackStyle={{ height: 30, borderRadius: 14 }}
                                    />
                                </View>
                            </View>
                        }
                    </View>
                    {showHistory && <CommonButton
                        onPress={async () => {
                            await setVitalData();
                            Vibration.vibrate(50);
                        }}
                        buttonText="Record Vital"
                        extraStyles={{ marginBottom: heightToDp(4), borderRightWidth: 0 }}
                    />}
                    <Bar_Chart vitalData={vitalData} cycleID={props.cycleID} date={props.date} />
                    <Spinner
                        visible={loading}
                        color={Colors.primaryButtonColor}
                        customIndicator={<Loader />}
                        textStyle={{ color: Colors.primaryButtonColor }}
                    />
                    <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );

}

export default VitalsReading;

const styles = ScaledSheet.create({
    sliderThumb: {
        backgroundColor: Colors.secondarybuttonColor,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        width: 40,
        right: widthToDp(5)
    },
    thumbDownArrow: {
        position: 'absolute',
        bottom: -5,
        width: '1%',
        height: 0,
        borderLeftWidth: 20,
        borderRightWidth: 20,
        borderTopWidth: 20,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: Colors.secondarybuttonColor
    },
    secondSliderThumb: {
        backgroundColor: Colors.secondarybuttonColor,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 50,
        right: widthToDp(6)
    },
    secondSliderDownArrow: {
        position: 'absolute',
        bottom: -5,
        width: '1%',
        height: 0,
        borderLeftWidth: 20,
        borderRightWidth: 20,
        borderTopWidth: 20,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: Colors.secondarybuttonColor
    }
});