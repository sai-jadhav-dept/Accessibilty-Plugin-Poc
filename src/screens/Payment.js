import React from 'react';
import { Button, SafeAreaView, ScrollView, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import Config from '../config/Config';
import Colors from '../utils/Colors';

const Payment = () => {

  return (
    <SafeAreaView>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic">
        <View>
          <Button
            title={'Pay with Razorpay'}
            onPress={() => {
              var options = {
                description: 'Credits towards consultation',
                image: 'https://i.imgur.com/3g7nmJC.png',
                currency: 'INR',
                key: Config.PaymentKey,
                amount: '5000',
                name: 'foo',
                prefill: {
                  email: 'void@razorpay.com',
                  contact: '9191919191',
                  name: 'Razorpay Software',
                },
                theme: { color: Colors.primaryButtonColor },
              };
              RazorpayCheckout.open(options)
                .then(data => {
                  alert(`Success: ${data.razorpay_payment_id}`);
                })
                .catch(error => {
                  alert(`Error: ${error.code} | ${error.description}`);
                });
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Payment;