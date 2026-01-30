import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Intro from '../screens/Intro';
import SelectLanguage from '../screens/SelectLanguage';
import IntroCarousel from '../screens/IntroCarousel';
import Login from '../screens/Login';
import VerifyOTP from '../screens/VerifyOTP';
import SelectUserType from '../screens/SelectUserType';
import MyDetails from '../screens/MyDetails';
import PatientDetails from '../screens/PatientDetails';
import RegisteredSuccessfully from '../screens/RegisteredSuccessfully';
import PatientDetailsForm from '../screens/PatientDetailsForm';
import Dashboard from '../screens/Dashboard';
import MyTreatment from '../screens/MyTreatment'
import DiseaseSearch from '../screens/DiseaseSearch'
import CreateAppointment from '../screens/CreateAppointment';
import MyAppointments from '../screens/MyAppointments';
import AppointmentType from '../screens/AppointmentType';
import ChooseDateAndTime from '../screens/ChooseDateAndTime';
import CreateReview from '../screens/CreateReview';
import Reviews from '../screens/Reviews';
import YourTreatments from '../screens/YourTreatments';
import MedicineReminders from '../screens/MedicineReminders';
import AddMedicineReminder from '../screens/AddMedicineReminder';
import Notifications from '../screens/Notifications';
import SelectDoctor from '../screens/SelectDoctor';
import DoctorDetails from '../screens/DoctorDetails';
import TreatmentData from '../screens/TreatmentData';
import HopeConnect from '../screens/HopeConnect';
import Test from '../screens/Test';
import LabTest from '../screens/LabTest'
import OrderMedicines from '../screens/OrderMedicines';
import MedicationDetails from '../screens/MedicationDetails'
import UserChat from '../screens/UserChat';
import Forum from '../screens/Forum';
import LatestDiscussion from '../screens/LatestDiscussion';
import StartDiscussion from '../screens/StartDiscussion';
import SettingsPage from '../screens/SettingsPage';
import CareCircle from '../screens/CareCircle';
import Faqs from '../screens/Faqs';
import SelectCareBuddyType from '../screens/SelectCareBuddyType';
import AddServices from '../screens/AddServices';
import SelectDate from '../screens/SelectDate';
import SelectServiceTime from '../screens/SelectServiceTime';
import SearchLocation from '../screens/SearchLocation';
import SelectCareBuddy from '../screens/SelectCareBuddy';
import CareBuddyDetail from '../screens/CareBuddyDetail';
import AppointmentReview from '../screens/AppointmentReview';
import PaymentSuccess from '../screens/PaymentSuccess';
import Favourites from '../screens/Favourites';
import PaymentConfirmation from '../screens/PaymentConfirmation';
import Help from '../screens/Help';
import LabTestSubcatagory from '../screens/LabTestSubcatagory';
import ManualSelectDoctor from '../screens/ManualSelectDoctor';
import CareCircleSearch from '../screens/CareCircleSearch';
import PatientDashboard from '../screens/PatientDashboard';
import DisclaimerScreen from '../screens/DisclaimerScreen';
import MyRequests from '../screens/MyRequests';
import MyNurseAppointment from '../screens/MyNurseAppointment';
import NurseAppointmentScreen from '../screens/NurseAppointmentScreen';
import SelectDoctorScreen from '../screens/SelectDoctorScreen';
import QuickAccessList from '../screens/QuickAccessList';
import DoctorReviewAppointment from '../screens/DoctorReviewAppointment';
import PaymentSummary from '../screens/PaymentSummary';
import DoctorNotes from '../screens/DoctorNotes';
import PatientList from '../screens/PatientList';
import NoShowAppointmentScreen from '../screens/NoShowAppointmentScreen';
import AdditionalEquipment from '../screens/AdditionalEquipment';

const Stack = createStackNavigator();

export default function MainTabNavigatorIntro() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Intro" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Intro" component={Intro}></Stack.Screen>
        <Stack.Screen name="SelectLanguage" component={SelectLanguage}></Stack.Screen>
        <Stack.Screen name="IntroCarousel" component={IntroCarousel}></Stack.Screen>
        <Stack.Screen name="Login" component={Login}></Stack.Screen>
        <Stack.Screen name="VerifyOTP" component={VerifyOTP}></Stack.Screen>
        <Stack.Screen name="SelectUserType" component={SelectUserType}></Stack.Screen>
        <Stack.Screen name="MyDetails" component={MyDetails}></Stack.Screen>
        <Stack.Screen name="PatientDetails" component={PatientDetails}></Stack.Screen>
        <Stack.Screen name="RegisteredSuccessfully" component={RegisteredSuccessfully}></Stack.Screen>
        <Stack.Screen name="Dashboard" component={Dashboard}></Stack.Screen>
        <Stack.Screen name="PatientDetailsForm" component={PatientDetailsForm}></Stack.Screen>
        <Stack.Screen name="MyTreatment" component={MyTreatment}></Stack.Screen>
        <Stack.Screen name="DiseaseSearch" component={DiseaseSearch}></Stack.Screen>
        <Stack.Screen name="CreateAppointment" component={CreateAppointment}></Stack.Screen>
        <Stack.Screen name="MyAppointments" component={MyAppointments}></Stack.Screen>
        <Stack.Screen name="AppointmentType" component={AppointmentType}></Stack.Screen>
        <Stack.Screen name="ChooseDateAndTime" component={ChooseDateAndTime}></Stack.Screen>
        <Stack.Screen name="CreateReview" component={CreateReview}></Stack.Screen>
        <Stack.Screen name="Reviews" component={Reviews}></Stack.Screen>
        <Stack.Screen name="YourTreatments" component={YourTreatments}></Stack.Screen>
        <Stack.Screen name="MedicineReminders" component={MedicineReminders}></Stack.Screen>
        <Stack.Screen name="AddMedicineReminder" component={AddMedicineReminder}></Stack.Screen>
        <Stack.Screen name="SelectDoctor" component={SelectDoctor}></Stack.Screen>
        <Stack.Screen name="DoctorDetails" component={DoctorDetails}></Stack.Screen>
        <Stack.Screen name="TreatmentData" component={TreatmentData}></Stack.Screen>
        <Stack.Screen name="HopeConnect" component={HopeConnect}></Stack.Screen>
        <Stack.Screen name="Notifications" component={Notifications}></Stack.Screen>
        <Stack.Screen name="Test" component={Test}></Stack.Screen>
        <Stack.Screen name="LabTest" component={LabTest}></Stack.Screen>
        <Stack.Screen name="OrderMedicines" component={OrderMedicines}></Stack.Screen>
        <Stack.Screen name="MedicationDetails" component={MedicationDetails}></Stack.Screen>
        <Stack.Screen name="UserChat" component={UserChat}></Stack.Screen>
        <Stack.Screen name="Forum" component={Forum}></Stack.Screen>
        <Stack.Screen name="LatestDiscussion" component={LatestDiscussion}></Stack.Screen>
        <Stack.Screen name="StartDiscussion" component={StartDiscussion}></Stack.Screen>
        <Stack.Screen name="SettingsPage" component={SettingsPage}></Stack.Screen>
        <Stack.Screen name="CareCircle" component={CareCircle}></Stack.Screen>
        <Stack.Screen name="Faqs" component={Faqs}></Stack.Screen>
        <Stack.Screen name="AddServices" component={AddServices}></Stack.Screen>
        <Stack.Screen name="SelectDate" component={SelectDate}></Stack.Screen>
        <Stack.Screen name="SelectServiceTime" component={SelectServiceTime}></Stack.Screen>
        <Stack.Screen name="SearchLocation" component={SearchLocation}></Stack.Screen>
        <Stack.Screen name="SelectCareBuddy" component={SelectCareBuddy}></Stack.Screen>
        <Stack.Screen name="CareBuddyDetail" component={CareBuddyDetail}></Stack.Screen>
        <Stack.Screen name="AppointmentReview" component={AppointmentReview}></Stack.Screen>
        <Stack.Screen name="Favourites" component={Favourites}></Stack.Screen>
        <Stack.Screen name="SelectCareBuddyType" component={SelectCareBuddyType}></Stack.Screen>
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccess}></Stack.Screen>
        <Stack.Screen name="PaymentConfirmation" component={PaymentConfirmation}></Stack.Screen>
        <Stack.Screen name="LabTestSubcatagory" component={LabTestSubcatagory}></Stack.Screen>
        <Stack.Screen name="Help" component={Help}></Stack.Screen>
        <Stack.Screen name="ManualSelectDoctor" component={ManualSelectDoctor}></Stack.Screen>
        <Stack.Screen name="CareCircleSearch" component={CareCircleSearch}></Stack.Screen>
        <Stack.Screen name="PatientDashboard" component={PatientDashboard}></Stack.Screen>
        <Stack.Screen name="DisclaimerScreen" component={DisclaimerScreen}></Stack.Screen>
        <Stack.Screen name="MyRequests" component={MyRequests}></Stack.Screen>
        <Stack.Screen name="MyNurseAppointment" component={MyNurseAppointment}></Stack.Screen>
        <Stack.Screen name="NurseAppointmentScreen" component={NurseAppointmentScreen}></Stack.Screen>
        <Stack.Screen name="SelectDoctorScreen" component={SelectDoctorScreen}></Stack.Screen>
        <Stack.Screen name="QuickAccessList" component={QuickAccessList}></Stack.Screen>
        <Stack.Screen name="DoctorReviewAppointment" component={DoctorReviewAppointment}></Stack.Screen>
        <Stack.Screen name="PaymentSummary" component={PaymentSummary}></Stack.Screen>
        <Stack.Screen name="DoctorNotes" component={DoctorNotes}></Stack.Screen>
        <Stack.Screen name="PatientList" component={PatientList}></Stack.Screen>
        <Stack.Screen name="NoShowAppointmentScreen" component={NoShowAppointmentScreen}></Stack.Screen>
        <Stack.Screen name="AdditionalEquipment" component={AdditionalEquipment}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
