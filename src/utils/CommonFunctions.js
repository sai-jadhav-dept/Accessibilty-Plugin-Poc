import { useEffect, useState } from 'react';
import { PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { request, check, RESULTS } from 'react-native-permissions';
import Global from '../screens/Global';
import { apiCall } from './ApiUtils';
import { RNS3 } from 'react-native-aws3';
import Config from '../config/Config';
import ZIM from 'zego-zim-react-native';
import moment from 'moment';
import axios from 'axios';

const useGeolocation = () => {
  const [currentLongitude, setCurrentLongitude] = useState('...');
  const [currentLatitude, setCurrentLatitude] = useState('...');
  const [locationStatus, setLocationStatus] = useState('');
  let watchID;

  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Global.OS === 'ios') {
        getOneTimeLocation();
        subscribeLocationLocation();
      } else {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Access Required',
              message: 'This App needs to Access your location',
            },
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getOneTimeLocation();
            subscribeLocationLocation();
          } else {
            setLocationStatus('Permission Denied');
          }
        } catch (err) {
          console.warn(err);
        }
      }
    };
    requestLocationPermission();
    return () => {
      Geolocation.clearWatch(watchID);
    };
  }, []);

  const getOneTimeLocation = () => {
    setLocationStatus('Getting Location ...');
    Geolocation.getCurrentPosition(
      (position) => { setValue(position) },
      (error) => { setLocationStatus(error.message); },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 1000
      },
    );
  };

  const subscribeLocationLocation = () => {
    watchID = Geolocation.watchPosition(
      (position) => { setValue(position) },
      (error) => { setLocationStatus(error.message); },
      {
        enableHighAccuracy: false,
        maximumAge: 1000
      },
    );
  };

  const setValue = (position) => {
    setLocationStatus('You are Here');
    setCurrentLongitude(position.coords.longitude);
    setCurrentLatitude(position.coords.latitude);
  }

  return {
    currentLongitude,
    currentLatitude,
    locationStatus,
    getOneTimeLocation,
    subscribeLocationLocation
  };
};

const invoiceTempalate = (template) => {
  return new Promise(async (resolve, reject) => {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${Config.templateURL}${template}.html`,
      headers: {
        'Authorization': 'Basic aG9wZS1kZXY6SG9wZUBkZXYkMTIz'
      }
    };

    axios.request(config)
      .then((response) => {
        const htmlData = response.data;
        resolve(htmlData);
      }).catch((error) => {
        reject(error);
      });
  });
};

const createZimInstance = () => {
  ZIM.create({ appID: Config.zimAppId, appSign: Config.zimAppSign });
  var zim = ZIM.getInstance();

  // Set up and listen for the callback for receiving error codes.  
  zim.on('error', function (zim, errorInfo) {
    console.log('error', errorInfo.code, errorInfo.message);
  });

  // Set up and listen for the callback for connection status changes. 
  zim.on('connectionStateChanged', function (zim, { state, event, extendedData }) {
    // Handle connection state changes
  });

  // Set up and listen for the callback for receiving one-to-one messages. 
  zim.on('receivePeerMessage', function (zim, { messageList, fromConversationID }) {
    console.log('receivePeerMessage', messageList, fromConversationID);
    const message = {
      id: messageList[0].messageID,
      message: messageList[0].message,
      time: convertTimeString(messageList[0].timestamp),
      senderId: messageList[0].direction ? "sender" : "reciever",
      viewed: false,
      selected: false,
    }
    Global.messages[fromConversationID] = [message, ...Global.messages[fromConversationID]];
    if (Global.setMessageRefresh) {
      Global.setMessageRefresh(val => !val);
    }
  });

  Global.zim = zim;
}

const convertTimeString = (timeStamp) => moment(timeStamp).format('DD/MM/YYYY HH:mm');

const uploadProfilePicture = async (url, userID, patientID) => {
  return new Promise(async (resolve, reject) => {
    try {
      const body = {
        "userId": userID,
        "patientId": patientID,
        "imageUrl": url,
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": Global.OS
      };
      const response = await apiCall('registration/uploadprofilepicture', body);
      resolve(response);
    } catch (error) {
      reject(error)
    }
  })
}

const uploadFileToS3 = async (fileData, name, keyPrefix) => {
  return new Promise(async (resolve, reject) => {
    try {
      const file = {
        uri: fileData.uri,
        name: name,
        type: fileData.type,
      }
      const options = {
        keyPrefix: keyPrefix,
        bucket: Config.bucket,
        region: Config.region,
        accessKey: Config.accessKey,
        secretKey: Config.secretKey,
        successActionStatus: 201
      }
      RNS3.put(file, options).then(response => {
        resolve(response);
      })
        .catch((error) => {
          reject(error)
        })
    }
    catch (error) {
      reject(error)
    }
  })
};
const fetchPostalData = async (pincodeValue) => {
  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincodeValue}`);
    if (response.data && response.data.length > 0 && response.data[0].Message === "No records found") {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return true;
  }
};

const validatePincode = async (pincodeValue) => {
  let statusMessage = '';
  try {
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincodeValue}`);
    if (response.data[0].Status == "Error") {
      statusMessage = "Please enter valid pincode";
    }
    else if (response.data[0].Status == "Success" && response.data[0].PostOffice[0].State != 'Maharashtra') {
      statusMessage = "Please enter the Maharashtra state pincode only.";
    }
    return statusMessage;
  } catch (err) {
    return statusMessage;
  }
};

const Permission = (permissionName, actionType, successCallback, failureCallback, name) => {
  return new Promise((resolve, reject) => {
    const action = actionType === 'check' ? check : request;
    action(permissionName)
      .then((result) => {
        switch (result) {
          case RESULTS.UNAVAILABLE:
            console.log('This feature is not available (on this device / in this context)');
            failureCallback(resolve, reject);
            break;
          case RESULTS.DENIED:
            console.log('The permission has not been requested / is denied but requestable');
            failureCallback(resolve, reject);
            break;
          case RESULTS.LIMITED:
            console.log('The permission is limited: some actions are possible');
            failureCallback(resolve, reject);
            break;
          case RESULTS.GRANTED:
            successCallback(resolve, reject);
            break;
          case RESULTS.BLOCKED:
            console.log(`The permission is denied and not requestable anymore`);
            failureCallback(resolve, reject, `To access this functionality, the required ${name} permission must be granted. Please enable it in the app settings.`);
            break;
        }
      })
      .catch((error) => {
        console.log(error);
        failureCallback(error);
      });
  });

}
export { useGeolocation, uploadProfilePicture, Permission, uploadFileToS3, createZimInstance, convertTimeString, invoiceTempalate, fetchPostalData, validatePincode }