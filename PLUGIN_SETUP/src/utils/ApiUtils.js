import Config from "../config/Config";
import axios from "axios";
import Global from "../screens/Global";
import { isNetworkAvailable } from "../components/NetworkUtils";

const apiCall = (endpoint, body, isMdm) => {
    const stringifiedBody = JSON.stringify(body);
    return new Promise(async (res, rej) => {
        try {
            if (isMdm && Global.cachedData[endpoint]) {
                if (Global.cachedData[endpoint][stringifiedBody]) {
                    return res(Global.cachedData[endpoint][stringifiedBody]);
                }
            }
            const networkAvailable = await isNetworkAvailable();
            if (networkAvailable) {
                setTimeout(() => {
                    let data = JSON.stringify({
                        "header": {
                            "authToken": Global.authToken
                        },
                        "body": body
                    });
                    let config = {
                        method: 'post',
                        maxBodyLength: Infinity,
                        url: Config.apiURL + endpoint,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: data
                    };
                    axios.request(config)
                        .then((response) => {
                            if (response.data.responseJson.status == 200) {
                                if (response.data.responseJson.message == 'Failure') {
                                    rej({
                                        status: 200,
                                        msg: response.data.responseJson.data.message
                                    });
                                } else {
                                    if (isMdm) {
                                        if (!Global.cachedData[endpoint]) {
                                            Global.cachedData[endpoint] = {};
                                        }
                                        Global.cachedData[endpoint][stringifiedBody] = response.data.responseJson.data;
                                    }
                                    res(response.data.responseJson.data);
                                }
                            } else if (response.data.responseJson.status == 400) {
                                rej({
                                    status: 400,
                                    msg: "Something went wrong, please try again",
                                });
                            } else if (response.data.responseJson.status == 401) {
                                Global.authExpired = true;
                                rej({
                                    status: 401,
                                    msg: "Your login session is expired, Please login again.",
                                });
                            } else if (response.data.responseJson.status == 404) {
                                rej({
                                    status: 404,
                                    msg: response.data.responseJson.data.message,
                                });
                            } else if (response.data.responseJson.status == 409) {
                                rej({
                                    status: 409,
                                    msg: response.data.responseJson.data.message,
                                });
                            } else {
                                rej({
                                    status: response.data.responseJson.status,
                                    msg: "Something went wrong, please try again",
                                });
                            }
                        })
                        .catch((error) => {
                            if (error.message == "Network Error") {
                                rej({
                                    status: 'No internet',
                                    msg: 'Internet connection is not available, Please connect to the Internet',
                                });
                            } else if (error.response.status == 401) {
                                Global.authExpired = true;
                                rej({
                                    status: 401,
                                    msg: "Your login session is expired, Please login again.",
                                });
                            } else {
                                try {
                                    if (error.response.data.responseJson.status == 400) {
                                        rej({
                                            status: 400,
                                            msg: "Something went wrong, please try again",
                                        });
                                    } else if (error.response.data.responseJson.status == 401) {
                                        Global.authExpired = true;
                                        rej({
                                            status: 401,
                                            msg: "Your login session is expired, Please login again.",
                                        });
                                    } else if (error.response.data.responseJson.status == 404) {
                                        rej({
                                            status: 404,
                                            msg: error.response.data.responseJson.data.message,
                                        });
                                    } else if (error.response.data.responseJson.status == 409) {
                                        rej({
                                            status: 409,
                                            msg: error.response.data.responseJson.data.message,
                                        });
                                    } else {
                                        rej({
                                            status: error.response.data.responseJson.status,
                                            msg: "Something went wrong, please try again",
                                        });
                                    }
                                } catch (e) {
                                    rej({
                                        status: 'unknown',
                                        msg: "Something went wrong, please try again",
                                    });
                                }
                            }
                        });
                }, Global.OS === "android" ? 0 : 500);
            } else {
                rej({
                    status: 'No internet',
                    msg: 'Internet connection is not available, Please connect to the Internet',
                });
            }
        } catch (error) {
            rej({
                status: "unknown",
                msg: "Something went wrong, please try again",
            });
        }
    });
}

export { apiCall };