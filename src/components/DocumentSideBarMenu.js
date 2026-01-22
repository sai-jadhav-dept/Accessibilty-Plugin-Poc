import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Fonts from '../utils/Fonts';
import Colors from '../utils/Colors';
import { widthToDp, heightToDp, responsiveFont } from '../utils/Responsive';
import VectorIcons from './VectorIcons';
import GlobalStyles from '../utils/GlobalStyles';
import { scale } from 'react-native-size-matters';

const DocumentSideBarMenu = (props) => {

    const onTabPress = (item) => {
        props.setDocTypeId(item.id)
        props.setselectedMenu({ reportType: item.name, reportId: item.id })
        props.setselectedDocument(undefined);
        props.setselectedMoreOption(undefined);
        props.setSelectedFilter('Filter');
        props.setShowFilterOptions(false);
        props.setSelectedType("");
    }
    return (
        <View style={styles.container}>
            {
                props.menu.map((item, index) =>
                    <Pressable
                        onPress={() => onTabPress(item)}
                        key={index}
                        style={({ pressed }) => ([GlobalStyles.columnCenter, styles.button,
                        {
                            opacity: pressed ? 0.5 : 1,
                            backgroundColor: props.selectedMenu == item.name ? Colors.boxBackground : Colors.defaultBackground,
                            marginTop: heightToDp(1)
                        }
                        ])}>
                        <VectorIcons groupName={item.iconGroup} iconName={item.iconName}
                            iconsize={widthToDp(7)}
                            iconstyle={[{ color: props.selectedMenu.reportType == item.name ? Colors.primaryButtonColor : Colors.primaryTextColor }]}
                        />
                        <Text style={[styles.name, { color: props.selectedMenu.reportType == item.name ? Colors.primaryButtonColor : Colors.primaryTextColor }, Fonts.Nunito_600SemiBold]}>
                            {item.name}
                        </Text>
                    </Pressable>
                )
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.textInputBorder,
        borderRadius: 14,
    },
    button: {
        width: '93%',
        borderRadius: 14,
        marginBottom: heightToDp(1)
    },
    name: {
        fontSize: responsiveFont(scale(12)),
        marginTop: heightToDp(1),
        marginBottom: heightToDp(1)
    }
})
export default DocumentSideBarMenu;