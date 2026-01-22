import { View, StyleSheet, Pressable, Text } from 'react-native'
import React from 'react'
import { heightToDp } from '../utils/Responsive';
import Colors from '../utils/Colors';
import { usePageRead } from './usePageRead';
import Global from '../screens/Global';
import GlobalStyles from '../utils/GlobalStyles';
import Fonts from '../utils/Fonts';
const ReadModal = ({ activeModal }) => {

    const pageRead = usePageRead(Global.pageReadText);
    return (
        activeModal &&
        <View onPress={() => { Global.accessibility.pageRead = false }}
            style={{
                width: "100%",
                height: 80,
                position: "absolute",
                bottom: 0, left: 0, right: 0,
                justifyContent: "center",
                // alignContent:"space-between",
                margin: "auto",
                padding: "auto",
                alignItems: "center",
                // backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backgroundColor: Colors.defaultBackground,
                zIndex: 99999999,

            }}
        >

            <Pressable style={{ position: "absolute", left: 0, top: -35 }} onPress={() => { Global.accessibility.pageRead = false }}>
            
            <Text style={[GlobalStyles.normalText, Fonts.Nunito_600SemiBold, { color: Colors.primaryTextColor, position: "relative", top: 0, backgroundColor: Colors.primaryButtonColor,borderRadius: 8,padding:5 }]}>Close</Text></Pressable>
            <View style={styles.pageReadRow}>
                <PageReadButton
                    label="Start"
                    onPress={pageRead.start}
                    accessibilityLabel="Start reading"
                />
                <PageReadButton
                    label="Pause"
                    onPress={pageRead.pause}
                    accessibilityLabel="Pause reading"
                />
                <PageReadButton
                    label="Resume"
                    onPress={pageRead.resume}
                    accessibilityLabel="Resume reading"
                />
                <PageReadButton
                    label="Stop"
                    onPress={pageRead.stop}
                    accessibilityLabel="Stop reading"
                />
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    pageReadRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        // paddingVertical: 60,
        marginBottom: 40
    },
    modalContent: {
        marginTop: heightToDp(7),
        maxHeight: heightToDp(30),
        overflow: "hidden",
        backgroundColor: Colors.defaultBackground,
        position: 'absolute',
        width: '36%',
    }
    , pageReadButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#0B3B91',
    },
    pageReadButtonText: {
        color: 'white',
        fontSize: 13,
        fontWeight: '700',
    },
});
export default ReadModal;


function PageReadButton({ label, onPress, accessibilityLabel }) {
    return (
        <Pressable
            style={styles.pageReadButton}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
        >
            <Text style={styles.pageReadButtonText}>
                {label}
            </Text>
        </Pressable>
    );
}

