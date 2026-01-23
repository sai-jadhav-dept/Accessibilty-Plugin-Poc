import React, { useEffect } from 'react';
import { LogBox, PermissionsAndroid, Platform, StyleSheet, View } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import DeviceInfo from 'react-native-device-info';
import Global from './screens/Global';
import { createZimInstance } from './utils/CommonFunctions';
import messaging from '@react-native-firebase/messaging';
import { apiCall } from './utils/ApiUtils';
import { openDatabase } from 'react-native-sqlite-storage';
import { AccessibilityProvider, AccessibilityButton, AccessibilityModal } from './accessibility';
import AccessibilityColorWrapper from './accessibility/AccessibilityColorWrapper';
var db = openDatabase({ name: 'HOPE.db' });

Global.OS = Platform.OS;
Global.androidVersion = DeviceInfo.getSystemVersion();

LogBox.ignoreAllLogs();

export default function App() {
  useEffect(() => {
    createFcmTokenTable();
    requestNotificationPermission();
    handleTokenUpdates();
    DeviceInfo.getFontScale().then(async (fontScale) => {
      Global.fontScale = fontScale;
    });
    createZimInstance();
  }, []);

  const createFcmTokenTable = () => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS FCMToken (ID INTEGER PRIMARY KEY AUTOINCREMENT, Token TEXT, IsRegistered TEXT)'
          , null, (txObj, resultSet) => {
            console.log('Create FCMToken Table', resultSet);
          }, (txObj, error) => {
            console.log('FCMToken Table Creation Error : ', txObj.message);
          }
        );
      })
    } catch (error) {
      console.log('Table Creation Error: ' + error);
    }
  }

  const getFcmTokenFromLocalDb = () => {
    return new Promise((resolve, reject) => {
      try {
        db.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM FCMToken'
            , null, (txObj, resultSet) => {
              if (resultSet.rows.length > 0) {
                resolve({ token: resultSet.rows.item(0).Token, isRegistered: resultSet.rows.item(0).IsRegistered });
              } else {
                resolve({ token: '', isRegistered: 'NO' });
              }
            }, (txObj, error) => {
              console.log('FCMToken Table Reading Error : ', txObj.message);
              reject(txObj.message);
            }
          );
        })
      } catch (error) {
        console.log("Error while reading FCM Token: " + error);
        reject(error);
      }
    })
  }

  const updateFcmTokenTable = (token) => {
    try {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM FCMToken'
          , null, (txObj, resultSet) => {
            console.log('Data deleted from FCMToken Table', resultSet);
            try {
              db.transaction(tx1 => {
                tx1.executeSql(
                  "INSERT INTO FCMToken (Token, IsRegistered) VALUES ('" + token + "', 'NO')"
                  , null, (resultSet1) => {
                    console.log('Data inserted into FCMToken Table', resultSet1);
                  }, (txObj2) => {
                    console.log('FCMToken Table Data Insertion Error : ', txObj2.message);
                  }
                );
              })
            } catch (err) {
              console.log("Error while inserting into FcmToken Table: " + err);
            }
          }, (txObj, error) => {
            console.log('FCMToken Table Data Deletion Error : ', txObj.message);
          }
        );
      })
    } catch (error) {
      console.log("Error while updating FcmToken Table: " + error);
    }
  }

  const registerToken = async (token, isRegistered) => {
    try {
      const body = {
        "token": token,
        "platform": Platform.OS,
        "appVersion": DeviceInfo.getVersion(),
        "osVersion": DeviceInfo.getSystemVersion(),
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": Platform.OS
      }
      await apiCall('pushnotifications/registertoken', body);
      Global.registerUserWithToken = isRegistered == 'NO' ? true : false;
      updateFcmTokenTable(token);
    } catch (error) {
      Global.registerUserWithToken = false;
      console.log(error.msg, "Something went wrong, please try again");
    }
  }


  const handleRegisterToken = async (token) => {
    Global.fcmToken = token;
    Global.registerUserWithToken = false;
    try {
      const localFcmToken = await getFcmTokenFromLocalDb();
      if (localFcmToken.token != token) {//calling api only when local fcm token and new token are not same
        registerToken(token, localFcmToken.isRegistered);
      }
      Global.registerUserWithToken = localFcmToken.isRegistered == 'NO' ? true : false;
    } catch (error) {
      console.log(error);
    }
  }

  async function handleTokenUpdates() {
    // Get the initial FCM token
    const initialToken = await messaging().getToken();
    Global.fcmToken = initialToken;
    handleRegisterToken(initialToken);

    // Listen for token refresh events
    messaging().onTokenRefresh((token) => {
      console.log('Refreshed FCM Token:', token);
      // Send the updated token to your server if needed
      if (Global.fcmToken != token) handleRegisterToken(token);//extra check is added because it was triggering on every app load causing 2 tokens to be inserted in db
    });
  }

  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const authStatus = await messaging().hasPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          const permission = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );

          if (permission === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Notification permission granted.');
          } else {
            console.log('Notification permission denied.');
          }
        } else {
          console.log('Authorization status:', authStatus);
        }
      } else {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);
        }
      }
    } catch (error) {
      console.error(error, 'Push Notification Error');
    }
  }

  return (
    <AccessibilityProvider>
      <AccessibilityColorWrapper>
        <View style={styles.container}>
          <AppNavigator />
          <AccessibilityButton />
          <AccessibilityModal />
        </View>
      </AccessibilityColorWrapper>
    </AccessibilityProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});