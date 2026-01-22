import React from 'react';
import { View } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import Colors from '../utils/Colors';

const Splash = () => {
    return (
        <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
            <Spinner
                visible={true}
                color={Colors.primaryButtonColor}
                textContent={'Loading...'}
                textStyle={{ color: Colors.primaryButtonColor }}
            />
        </View>
    );
}

export default Splash;