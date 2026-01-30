import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native'
import GlobalStyles from '../utils/GlobalStyles'
import Colors from '../utils/Colors';
import Fonts from '../utils/Fonts';

const ToastMessage = ({ visible, text, extraStyles }) => {
    const [filterModal, setFilterModal] = useState(visible);
    useEffect(() => {
        setFilterModal(visible)
    })
    return (
        <View style={[{ position: "absolute", width: "100%", bottom: 0, marginBottom: "31%", alignItems: "center", justifyContent: "flex-end" }, extraStyles]}>
            {
                filterModal ?
                    <View style={[{
                        width: "50%", backgroundColor: Colors.defaultBackground,
                        borderColor: Colors.primaryinactive, borderRadius: 14, alignItems: "center",
                        shadowColor: "#000",
                        shadowOffset: {
                            width: 14,
                            height: 8,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5
                    }]}>
                        <Text style={[{ paddingVertical: "8%", flexWrap: "wrap", paddingHorizontal: "5%" }, GlobalStyles.smallText, Fonts.Nunito_600SemiBold]}>
                            {text}
                        </Text>
                    </View>
                    : null
            }
        </View>
    )
}

export default ToastMessage