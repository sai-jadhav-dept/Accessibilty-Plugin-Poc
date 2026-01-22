import React from 'react';
import { View, SafeAreaView } from 'react-native';
import GlobalStyles from '../utils/GlobalStyles';
import Header from '../components/Header';
import FooterComponent from '../components/Footer';
import { heightToDp } from '../utils/Responsive';
import ComingSoon from '../components/ComingSoon';

const Notifications = (props) => {
    return (
        <SafeAreaView style={GlobalStyles.mainContainer}>
            <View style={GlobalStyles.mainBox}>
                <Header
                    headerTitle="Notifications"
                    onPress={() => props.navigation.navigate(props.route.params.sourcePage, { refreshing: true })}
                />
                <View style={{ marginBottom: heightToDp(15) }}>
                    <ComingSoon />
                </View>

            </View>
            <FooterComponent />
        </SafeAreaView>
    )
};

export default Notifications;