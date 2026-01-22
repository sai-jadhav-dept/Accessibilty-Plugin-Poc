/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotification, { Importance } from "react-native-push-notification";

// Must be outside of any component LifeCycle (such as `componentDidMount`).
PushNotification.configure({
    // (optional) Called when Token is generated (iOS and Android)
    onRegister: function (token) {

        PushNotification.createChannel(
            {
                channelId: "hope-fcm-foreground-notification", // (required)
                channelName: "HOPE FCM Foreground Notifications", // (required)
                channelDescription: "This channel is used for HOPE FCM Foreground Notifications", // (optional) default: undefined.
                playSound: true, // (optional) default: true
                soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
                importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
                vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
            },
            (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
        );
    },

    // (required) Called when a remote is received or opened, or local notification is opened
    onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);

        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        notification.finish(PushNotificationIOS.FetchResult.NoData);
    },

    // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
    onAction: function (notification) {
        console.log("ACTION:", notification.action);
        console.log("NOTIFICATION:", notification);

        // process the action
    },

    // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
    onRegistrationError: function (err) {
        console.error(err.message, err);
    },

    // Should the initial notification be popped automatically
    // default: true
    popInitialNotification: true,

    /**
     * (optional) default: true
     * - Specified if permissions (ios) and token (android and ios) will requested or not,
     * - if not, you must call PushNotificationsHandler.requestPermissions() later
     * - if you are not using remote notification or do not have Firebase installed, use this:
     *     requestPermissions: Platform.OS === 'ios'
     */
    requestPermissions: true,
});

messaging().registerDeviceForRemoteMessages();

messaging().onMessage(async (remoteMessage) => {
    // Handle the received notification payload
    console.log('Notification received:', remoteMessage);
    // Display the notification in the notification panel or handle it differently
    PushNotification.localNotification({
        channelId: "hope-fcm-foreground-notification", // (required) channelId, if the channel doesn't exist, notification will not trigger.
        title: remoteMessage.notification.title,
        message: remoteMessage.notification.body,
        bigPictureUrl: remoteMessage.notification.android?.imageUrl,
        largeIconUrl: remoteMessage.notification.android?.imageUrl
    });
});


messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('Notification opened by user:', remoteMessage);
});

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
