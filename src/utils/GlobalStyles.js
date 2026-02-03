import { StyleSheet } from 'react-native';
import Colors from './Colors';
import { widthToDp, heightToDp } from './Responsive';
import { scale, moderateScale } from 'react-native-size-matters';

export default StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.defaultBackground,
    },
    mainBox: {
        flex: 1,
        marginHorizontal: widthToDp(4),
    },
    fixedTopSpacing: {
        marginTop: heightToDp(2)
    },
    fixedBottomSpacing: {
        marginBottom: heightToDp(2)
    },
    fixedTopBottomSpacing: {
        marginTop: heightToDp(2),
        marginBottom: heightToDp(2)
    },
    rowCenter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },
    columnCenter: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    rowSpaceBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rowSpaceAround: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    rowFlexstart: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    columnFlexstart: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    commonButton: {
        backgroundColor: Colors.primaryButtonColor,
        borderRadius: 14,
        borderColor: Colors.secondarybuttonColor,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        height: moderateScale(50),
        flexDirection: 'row'
    },
    fixbottomcommonButton: {
        bottom: widthToDp(6),
        position: 'absolute',
    },
    extrasmallText: {
        fontSize: scale(12),
        color: Colors.primaryTextColor,
        flexWrap: 'wrap'
    },
    backgroundextrasmallText: {
        fontSize: scale(12),
        color: Colors.boxBackground,
        flexWrap: 'wrap'
    },
    buttonextrasmallText: {
        fontSize: scale(12),
        color: Colors.primaryButtonColor,
        flexWrap: 'wrap'
    },
    smallText: {
        fontSize: scale(14),
        color: Colors.primaryTextColor,
        flexWrap: 'wrap'
    },
    backgroundsmallText: {
        fontSize: scale(14),
        color: Colors.boxBackground,
        flexWrap: 'wrap'
    },
    buttonsmallText: {
        fontSize: scale(14),
        color: Colors.primaryButtonColor,
        flexWrap: 'wrap'
    },
    normalText: {
        fontSize: scale(16),
        color: Colors.primaryTextColor,
        flexWrap: 'wrap'
    },
    backgroundnormalText: {
        fontSize: scale(16),
        color: Colors.boxBackground,
        flexWrap: 'wrap'
    },
    buttonnormalText: {
        fontSize: scale(16),
        color: Colors.primaryButtonColor,
        flexWrap: 'wrap'
    },
    mediumText: {
        fontSize: scale(18),
        color: Colors.primaryTextColor,
        flexWrap: 'wrap'
    },
    buttonmediumText: {
        fontSize: scale(18),
        color: Colors.primaryButtonColor,
        flexWrap: 'wrap'
    },
    largeText: {
        fontSize: scale(20),
        color: Colors.primaryTextColor,
        flexWrap: 'wrap'
    },
    buttonlargeText: {
        fontSize: scale(20),
        color: Colors.primaryButtonColor,
        flexWrap: 'wrap'
    },
    extralargeText: {
        fontSize: scale(24),
        color: Colors.primaryTextColor,
        flexWrap: 'wrap'
    },
    inputtype: {
        borderRadius: 14,
        backgroundColor: Colors.boxBackground,
        width: '95%',
        alignSelf: 'center',
        fontSize: scale(16),
        color: Colors.primaryTextColor,
        padding: widthToDp(4),
    },
    inputBoxShadow: {
        shadowColor: Colors.primaryinactive,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 15,
    },
    boxMainContainer: {
        backgroundColor: Colors.boxBackground,
        borderRadius: 14,
        width: '95%',
        marginTop: heightToDp(4),
        marginHorizontal: widthToDp(2),
        paddingVertical: widthToDp(4),
        paddingHorizontal: widthToDp(4)
    },
    boxTitleText: {
        fontSize: scale(22),
        marginBottom: heightToDp(2),
        color: Colors.primaryTextColor,
    },
    loginInputContainer: {
        flexDirection: 'row',
        width: '100%',
        alignSelf: 'center',
        borderWidth: 1,
        alignItems: 'center',
        borderColor: Colors.textInputBorder,
        borderRadius: 14,
        backgroundColor: Colors.defaultBackground,
        marginTop: heightToDp(2),
        paddingHorizontal: widthToDp(2),
    },
    loginMobileTextInput: {
        width: '98%',
        fontSize: scale(18),
        color: Colors.primaryTextColor,
        textAlign: 'left',
    },
    loginEmailTextInput: {
        fontSize: scale(18),
        color: Colors.primaryTextColor,
        width: '100%',
        borderWidth: 1,
        paddingLeft: widthToDp(4),
        borderColor: Colors.textInputBorder,
        borderRadius: 14,
        backgroundColor: Colors.defaultBackground,
        height: 58,
        textAlign: 'left',
    },
    selectBox: {
        width: '100%',
        height: heightToDp(18),
        borderRadius: 14,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        padding: widthToDp(6),
    },
    selectBoxText: {
        fontSize: scale(16),
        lineHeight: heightToDp(3),
        textAlign: 'left',
        color: Colors.primaryTextColor
    }
})
