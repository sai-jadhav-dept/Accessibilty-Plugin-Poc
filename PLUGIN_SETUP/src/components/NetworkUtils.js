import NetInfo from "@react-native-community/netinfo";
export const isNetworkAvailable = async () => (await NetInfo.fetch()).isConnected;