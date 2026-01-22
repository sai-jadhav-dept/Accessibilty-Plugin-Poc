import { View, Text, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import VoiceSearch from '../components/VoiceSearch';
import { heightToDp, widthToDp } from '../utils/Responsive';
import GlobalStyles from '../utils/GlobalStyles';
import Colors from '../utils/Colors';
import { ScaledSheet, verticalScale } from 'react-native-size-matters';
import VectorIcons from '../components/VectorIcons';
import Fonts from '../utils/Fonts';
import DiscussionsCard from '../components/DiscussionsCard';
import { useNavigation } from '@react-navigation/native';
import Global from './Global';
import { apiCall } from '../utils/ApiUtils';
import WarningModal from '../components/WarningModal';
import Spinner from 'react-native-loading-spinner-overlay';
import Loader from '../components/Loader';

export default function Forum() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warningText, setWarningText] = useState("");
  const [forumData, setForumData] = useState([]);
  const [topic, setTopic] = useState('');
  const [noResult, setNoResult] = useState(false);

  const DisplayError = (text) => {
    setWarningText(text);
    setShowModal(true);
  }

  useEffect(() => {
    GetDiscussionList();
  }, [])

  const GetDiscussionList = async () => {
    try {
      const body = {
        "userId": Global.userID,
        "topic": topic,
        "coord": [
          "24.623061",
          "10.830960"
        ],
        "location": "Mumbai",
        "deviceInfo": Global.OS
      }
      setLoading(true);
      const response = await triggerApiCall('forum/getdiscussionlist', body);
      setForumData(response.forumData);
      setLoading(false);
      if (response.forumData.length <= 0) {
        setNoResult(true);
      }
      else {
        setNoResult(false);
      }
    }
    catch (e) {
      setLoading(false);
      DisplayError(e.msg || "Something went wrong, please try again");
    }
  }
  const triggerApiCall = (endpoint, body) => {
    return new Promise(async (res, rej) => {
      try {
        const response = await apiCall(endpoint, body);
        res(response);
      } catch (error) {
        rej(error);
      }
    })
  }
  const searchTopic = () => {
    GetDiscussionList();
  };
  return (
    <View style={[GlobalStyles.mainBox]}>
      <VoiceSearch
        isSearchOutline={false}
        placeholderText="Search forum title"
        isSearchButtonNeed={true}
        getName={(text) => { setTopic(text) }}
        onSearch={searchTopic}
        data={forumData}
        extraStyles={[GlobalStyles.fixedTopSpacing, { height: Global.OS == "ios" ? verticalScale(45) : null }]}
      />
      <Pressable style={({ pressed }) => ([{ opacity: pressed ? 0.5 : 1 }, styles.Button])}
        onPress={() => { navigation.navigate('Faqs') }}
      >
        <View style={{ flexDirection: 'row', width: '100%', alignItems: "center" }}>
          <Text style={[GlobalStyles.largeText, Fonts.Nunito_700Bold, { color: Colors.secondarybuttonColor, width: "90%" },]}>Frequently Asked Questions</Text>
          <VectorIcons groupName={"AntDesign"} iconName={"arrowright"} iconstyle={{ marginLeft: widthToDp(1), color: Colors.secondarybuttonColor }} />
        </View>
      </Pressable>
      {!noResult &&
        <Text style={[GlobalStyles.buttonmediumText, Fonts.Nunito_700Bold, { marginTop: heightToDp(2) }]}>Latest Discussions</Text>
      }
      {noResult &&
        <View style={{ justifyContent: "center", alignItems: "center", marginTop: heightToDp(20) }}>
          <Text style={[GlobalStyles.extralargeText, Fonts.Nunito_600SemiBold]}>No result found</Text>
        </View>
      }
      <View style={{ marginBottom: heightToDp(35) }}>
        {forumData.map((item, index) => (<DiscussionsCard key={item.id} data={item} index={index} />))}
      </View>
      <WarningModal showModal={showModal} setShowModal={setShowModal} warningText={warningText} />
      <Spinner
        visible={loading}
        color={Colors.primaryButtonColor}
        customIndicator={<Loader />}
        textStyle={{ color: Colors.primaryButtonColor }}
      />
    </View>
  )
}

const styles = ScaledSheet.create({
  Button: {
    flexDirection: "row",
    marginTop: heightToDp(4)
  }
});