import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, processColor } from 'react-native';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { widthToDp, heightToDp } from '../utils/Responsive';
import { BarChart } from 'react-native-charts-wrapper';
import moment from 'moment';
import GlobalStyles from '../utils/GlobalStyles';
import { Dropdown } from 'react-native-element-dropdown';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';
import WarningModal from '../components/WarningModal';
import { apiCall } from '../utils/ApiUtils';
import Global from '../screens/Global';

function Bar_Chart(props) {

    const [selectFilter, setSelectFilter] = useState("Daily");
    const [showModal, setShowModal] = useState(false);
    const [warningText, setWarningText] = useState("");
    const [loading, setLoading] = useState(false);
    const [historyData, setHistoryData] = useState({});
    const weekDate = [
        {
            label: "Monthly"
        },
        {
            label: "Weekly"
        },
        {
            label: "Daily"
        },
    ];

    const DisplayError = (text) => {
        setWarningText(text)
        setShowModal(true);
    };

    const vitalData = props.vitalData;
    const readingDataArray = historyData.valueData;
    const bloodPressureValues = historyData.secondValueData;

    const getvitalshistorydata = async () => {
        const body = {
            "treatmentCycleId": props.cycleID.toString(),
            "vitalsId": vitalData.id,
            "type": selectFilter,
            "date": moment(props.date).format("DD/MM/YYYY"),
            "coord": [
                "24.623061",
                "10.830960"
            ],
            "location": "Mumbai",
            "deviceInfo": Global.OS
        };
        try {
            setLoading(true);
            const response = await apiCall('vitals/getvitalshistorydata', body);
            const emptyData = {
                "name": "empty History",
                "valueData": [
                    {
                        "x": 0,
                        "y": 0.0
                    }
                ],
                "secondValueData": [
                    {
                        "x": 0.2,
                        "y": 0.0
                    }
                ],
                "lables": [
                    "00:00"
                ]
            };
            setHistoryData(Object.keys(response.historyData).length === 0 ? emptyData : response.historyData);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            DisplayError(error.msg || "Something went wrong, please try again");
        }
    }

    useEffect(() => {
        getvitalshistorydata();
    }, [selectFilter]);

    const xAxisProps = {
        valueFormatter: historyData.lables,
        granularityEnabled: true,
        granularity: 1,
        drawGridLines: false,
        position: "BOTTOM",
        textSize: 12,
    }

    const yAxisProps = {
        left: {
            granularityEnabled: true,
            drawGridLines: true,
            granularity: 1,
            textSize: 12,
            axisMinimum: 0,
        },
        right: { drawGridLines: false, drawLabels: false, axisMinimum: 0 }
    }

    const descriptionConfig = {
        text: "",
        textSize: 14,
        textColor: processColor('gray'),
        positionX: widthToDp(100),
        positionY: 10,
    };
    const configBarChart = {
        color: processColor(Colors.primaryButtonColor),
        highlightAlpha: 100,
        highlightColor: processColor("#3d2485"),
        valueTextSize: 10,
        labelCount: 5
    }
    const bloodChartConfig = {
        color: processColor(Colors.secondarybuttonColor),
        highlightAlpha: 100,
        highlightColor: processColor("#bf5c17"),
        valueTextSize: 10,
        labelCount: 5
    }

    return (
        <View style={styles.container}>
            <View style={styles.historycontainer}>
                <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold]}>History</Text>
                <Pressable style={({ pressed }) => ([styles.Button, { opacity: pressed ? 0.4 : 1 }])}>
                    <Dropdown
                        style={[styles.dropdown, Fonts.Nunito_600SemiBold, GlobalStyles.normalText, { backgroundColor: Colors.lightblue }]}
                        iconStyle={styles.iconStyle}
                        iconColor={Colors.primaryTextColor}
                        itemTextStyle={[GlobalStyles.mediumText]}
                        selectedTextStyle={GlobalStyles.mediumText}
                        data={weekDate}
                        maxHeight={300}
                        labelField="label"
                        valueField="label"
                        value={selectFilter}
                        onChange={(item) => setSelectFilter(item.label)}
                    />
                </Pressable>
            </View>
            {readingDataArray &&
                <BarChart
                    style={styles.chart}
                    data={{
                        config: { barWidth: 0.2, barSpace: 50 },
                        dataSets: vitalData.name == "Blood Pressure" ? [
                            {
                                label: "Systolic",
                                config: configBarChart,
                                values: readingDataArray
                            },
                            {
                                label: "Diastolic",
                                config: bloodChartConfig,
                                values: bloodPressureValues
                            }
                        ] :
                            [
                                {
                                    label: "Value",
                                    config: configBarChart,
                                    values: readingDataArray
                                }
                            ]
                    }}
                    legend={{ enabled: true }}
                    xAxis={xAxisProps}
                    yAxis={yAxisProps}
                    drawValueAboveBar
                    chartDescription={descriptionConfig}
                    doubleTapToZoomEnabled={false}
                    pinchZoom={false}
                />
            }
            <Spinner
                visible={loading}
                color={Colors.primaryButtonColor}
                customIndicator={<Loader />}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
            <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: heightToDp(2),
        marginBottom: heightToDp(6),
        flex: 1,
        backgroundColor: processColor('white'),
    },
    historycontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '94%',
        marginBottom: heightToDp(2)
    },
    chart: {
        height: heightToDp(30),
    },
    Button: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        width: widthToDp(37),
    },
    dropdown: {
        height: 50,
        borderColor: Colors.lightblue,
        borderWidth: 0.5,
        borderRadius: 14,
        paddingHorizontal: 16,
        width: "100%",
    },
    iconStyle: {
        width: 30,
        height: 30,
        color: Colors.primaryButtonColor
    }
})

export default Bar_Chart;