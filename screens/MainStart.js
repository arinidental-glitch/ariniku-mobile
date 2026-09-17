import React, { useEffect, useState, useRef } from 'react';

import {
    StyleSheet,
    Alert,
    BackHandler,
    Linking,
    View,
    Image,
    ActivityIndicator,
    Text,
    Platform
} from 'react-native';

import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GetLocation from 'react-native-get-location';
import config from '../config.js';
import axios from "axios";


const MainStart = ({ navigation, route }) => {

    // =========================================================
    // URL
    // =========================================================

    const [urlPage, setStateURL] = useState(config.url_backend);

    const [urlPageNow, setStateURLNow] = useState(
        config.url_backend
    );

    const webview = useRef(null);


    // =========================================================
    // STATE
    // =========================================================

    const [exitApp, setExitApp] = useState(0);

    const [webKey, setWebKey] = useState(0);

    const [webLoading, setWebLoading] = useState(true);

    const [showSplash, setShowSplash] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [webError, setWebError] = useState(false);


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        if (route.params?.status_logout) {

            setStateURL(config.url_backend + "/");

            setShowSplash(false);

        } else {

            const timer = setTimeout(() => {

                GetSessionLocal();

            }, 500);

            return () => clearTimeout(timer);

        }

    }, [route.params?.status_logout]);


    useEffect(() => {

    if (!route.params?.notificationArticle) {
        return;
    }

    const articleId = route.params?.articleId;

    console.log("========================================");
    console.log("ARTICLE NOTIFICATION EFFECT");
    console.log("ARTICLE ID =", articleId);

    if (!articleId) {
        console.log("ARTICLE ID KOSONG");
        return;
    }

    const articleUrl =
        config.url_backend +
        "/Menu/NewsDetail?code=" +
        encodeURIComponent(articleId);

    console.log("ARTICLE URL =", articleUrl);

    setStateURL(articleUrl);

}, [
    route.params?.notificationArticle,
    route.params?.articleId
]);


useEffect(() => {

    if (!route.params?.notificationCampaign) {
        return;
    }

    const notificationId =
        route.params?.notificationId;

    console.log("========================================");
    console.log("INBOX NOTIFICATION EFFECT");
    console.log("NOTIFICATION ID =", notificationId);

    const inboxUrl =
        config.url_backend +
        "/Menu/Inbox?notificationId=" +
        encodeURIComponent(notificationId || "");

    console.log("INBOX URL =", inboxUrl);

    setStateURL(inboxUrl);

}, [
    route.params?.notificationCampaign,
    route.params?.notificationId
]);


    // =========================================================
    // BACK BUTTON
    // =========================================================

    useEffect(() => {

        const backAction = () => {

            setTimeout(() => {
                setExitApp(0);
            }, 2000);


            if (exitApp === 0) {

                const currentUrl = urlPageNow || "";


                const isMainPage =
                    currentUrl.includes("/Main") ||
                    currentUrl.includes("/Home") ||
                    currentUrl.includes("/UserSettings") ||
                    currentUrl.includes("/Contact") ||
                    currentUrl.includes("/Reservasi?") ||
                    currentUrl === config.url_backend;


                if (!isMainPage) {

                    webview.current?.goBack();

                }


                setExitApp(exitApp + 1);


            } else if (exitApp === 1) {

                Alert.alert(

                    "Arini Dental Clinic",

                    "Apakah Anda yakin ingin keluar dari Aplikasi?",

                    [

                        {
                            text: "Tidak",

                            onPress: () => null,

                            style: "cancel"
                        },

                        {
                            text: "Ya",

                            onPress: () =>
                                BackHandler.exitApp()
                        }

                    ]

                );

            }


            return true;
        };


        const backHandler =
            BackHandler.addEventListener(
                "hardwareBackPress",
                backAction
            );


        return () =>
            backHandler.remove();


    }, [exitApp, urlPageNow]);


    // =========================================================
    // GET LOCATION
    // =========================================================

    const GetUserDataLok = async () => {

        GetLocation.getCurrentPosition({

            enableHighAccuracy: true,

            timeout: 15000,

        })

            .then(location => {

                if (location) {

                    AsyncStorage.setItem(

                        'location',

                        JSON.stringify(location)

                    );

                }

            })

            .catch(error => {

                const { code, message } = error;

                console.log(
                    code,
                    "GPS ->" + message
                );

            });

    };


    // =========================================================
    // GET SESSION
    // =========================================================

    const GetSessionLocal = async () => {

        try {

            let dataTokenFirebase =
                await AsyncStorage.getItem('token');

            let dataSessionAccess =
                await AsyncStorage.getItem('phone');

            let dataSessionEmail =
                await AsyncStorage.getItem('email');

            let dataSessionName =
                await AsyncStorage.getItem('name');

            let dataSessionUserID =
                await AsyncStorage.getItem('userid');


            dataTokenFirebase =
                dataTokenFirebase !== null
                    ? JSON.parse(dataTokenFirebase)
                    : null;


            dataSessionAccess =
                dataSessionAccess !== null
                    ? JSON.parse(dataSessionAccess)
                    : null;


            dataSessionEmail =
                dataSessionEmail !== null
                    ? JSON.parse(dataSessionEmail)
                    : null;


            dataSessionName =
                dataSessionName !== null
                    ? JSON.parse(dataSessionName)
                    : null;


            dataSessionUserID =
                dataSessionUserID !== null
                    ? JSON.parse(dataSessionUserID)
                    : null;


            // =================================================
            // USER SUDAH LOGIN
            // =================================================

            if (

                dataSessionAccess !== null &&

                dataSessionEmail !== null &&

                dataSessionName !== null &&

                dataSessionUserID !== null

            ) {


                // =============================================
                // NOTIFICATION → CHAT ARDA
                // =============================================

                if (
                    route.params?.notificationChat === true
                ) {

                    const chatUrl =
                        config.url_backend +
                        "/Chat/Index?userid=" +
                        encodeURIComponent(
                            dataSessionUserID
                        );


                    setStateURL(chatUrl);

                    return;
                }
// =============================================
// NOTIFICATION → ARTICLE
// =============================================

if (
    route.params?.notificationArticle === true
) {

    const articleId =
        route.params?.articleId;

    console.log(
        "========================================"
    );

    console.log(
        "NOTIFICATION → OPEN ARTICLE"
    );

    console.log(
        "ARTICLE ID =",
        articleId
               );

    if (articleId) {

        const articleUrl =
            config.url_backend +
            "/Menu/NewsDetail?code=" +
            encodeURIComponent(articleId);

        console.log(
            "ARTICLE URL =",
            articleUrl
        );

        setStateURL(articleUrl);

        return;
    }
}   


// =============================================
// NOTIFICATION → INBOX
// =============================================

if (
    route.params?.notificationCampaign === true
) {

    const notificationId =
        route.params?.notificationId;

    console.log(
        "========================================"
    );

    console.log(
        "NOTIFICATION → OPEN INBOX"
    );

    console.log(
        "NOTIFICATION ID =",
        notificationId
    );

    const inboxUrl =
        config.url_backend +
        "/Menu/Inbox?notificationId=" +
        encodeURIComponent(notificationId);

    console.log(
        "INBOX URL =",
        inboxUrl
    );

    setStateURL(inboxUrl);

    return;
}



                // =============================================
                // MAIN
                // =============================================

                const mainUrl =
                    config.url_backend +
                    "/Main?phone=" +
                    encodeURIComponent(dataSessionAccess) +
                    "&email=" +
                    encodeURIComponent(dataSessionEmail) +
                    "&name=" +
                    encodeURIComponent(dataSessionName) +
                    "&userid=" +
                    encodeURIComponent(dataSessionUserID);


                setStateURL(mainUrl);


                // =============================================
                // REFRESH TOKEN
                // =============================================

                async function getTokenFirebase(
                    email,
                    token
                ) {

                    return await axios

                        .get(

                            `${config.url_backend}/api/ariniku/chat-doctor/refresh-token/`,

                            {

                                params: {

                                    email: email,

                                    token: token,

                                },

                            }

                        )

                        .then((res) => {

                            if (
                                res.data &&
                                res.data.data &&
                                res.data.data.length > 0
                            ) {

                                setValue(

                                    'token_server',

                                    res.data.data[0]
                                        .token_server

                                );

                            }

                        })

                        .catch((err) => {

                            console.log(
                                "Error refresh token:",
                                err.response
                            );

                        });

                }


                if (
                    dataSessionEmail &&
                    dataTokenFirebase
                ) {

                    getTokenFirebase(

                        dataSessionEmail,

                        dataTokenFirebase

                    );

                }

            } else {

                // =============================================
                // BELUM LOGIN
                // =============================================

                setStateURL(
                    config.url_backend
                );

            }


        } catch (e) {

            console.log(
                "GetSessionLocal Error:",
                e
            );

            setStateURL(
                config.url_backend
            );

        }

    };


    // =========================================================
    // WEBVIEW MESSAGE
    // =========================================================

    const onMessage = (data) => {

        try {

            if (
                data?.nativeEvent?.data
            ) {

                const arParam =
                    data.nativeEvent.data
                        .toString()
                        .split(';');


                setValue(
                    'phone',
                    arParam[0]
                );

                setValue(
                    'email',
                    arParam[1]
                );

                setValue(
                    'name',
                    arParam[2]
                );

                setValue(
                    'userid',
                    arParam[3]
                );

                setValue(
                    'is_cs',
                    arParam[4]
                );

                setValue(
                    'position',
                    arParam[5]
                );

                setValue(
                    'emp_no',
                    arParam[6]
                );

                setValue(
                    'url_svr_chat',
                    arParam[7]
                );

            }

        } catch (e) {

            console.log(
                "onMessage Error:",
                e
            );

        }

    };


    // =========================================================
    // ASYNC STORAGE
    // =========================================================

    const setValue = async (
        column,
        value
    ) => {

        try {

            await AsyncStorage.setItem(

                column,

                JSON.stringify(value)

            );

        } catch (e) {

            console.log(e);

        }

    };


    // =========================================================
    // LOGOUT
    // =========================================================

    const clearAsyncStorage = async () => {

        try {

            const keys =
                await AsyncStorage.getAllKeys();

            await AsyncStorage.multiRemove(keys);

            await AsyncStorage.clear();

            console.log(
                "BERHASIL LOGOUT"
            );

        } catch (e) {

            console.log(
                "Logout Error:",
                e
            );

        }

    };


    // =========================================================
    // WEBVIEW RELOAD
    // =========================================================

    const handleReload = () => {

        setWebError(false);

        setWebLoading(true);

        setWebKey(
            prev => prev + 1
        );

    };


    // =========================================================
    // PULL TO REFRESH
    // =========================================================

    const handleRefresh = () => {

        if (!webview.current) {
            return;
        }

        setRefreshing(true);

        webview.current.reload();

    };


    // =========================================================
    // WEBVIEW LOAD START
    // =========================================================

    const handleLoadStart = () => {

        setWebLoading(true);

        setWebError(false);

    };


    // =========================================================
    // WEBVIEW LOAD END
    // =========================================================

    const handleLoadEnd = () => {

        setWebLoading(false);

        setRefreshing(false);

        setWebError(false);


        // Splash hanya tampil saat pertama kali
        // WebView sudah berhasil dimuat

        setTimeout(() => {

            setShowSplash(false);

        }, 300);

    };


    // =========================================================
    // WEBVIEW ERROR
    // =========================================================

    const handleError = (syntheticEvent) => {

        const {
            nativeEvent
        } = syntheticEvent;


        console.warn(
            "WebView error:",
            nativeEvent
        );


        setWebLoading(false);

        setRefreshing(false);

        setWebError(true);

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <View style={styles.root}>

            {/* =================================================
                WEBVIEW
            ================================================= */}

            {!webError && (

               <WebView

    key={webKey}

    ref={webview}

    style={styles.container}

    originWhitelist={[
        'https://*',
        'http://*',
        'file:///*'
    ]}

    source={{
        uri: urlPage || config.url_backend
    }}

    mixedContentMode="always"

    pullToRefreshEnabled={true}

    bounces={true}

    overScrollMode="always"

    onMessage={onMessage}

    onLoadStart={handleLoadStart}

    onLoadEnd={handleLoadEnd}

    onShouldStartLoadWithRequest={(req) => {

        if (!req.url.includes(config.url_backend)) {

            Linking.openURL(req.url);

            return false;
        }

        return true;
    }}

    onNavigationStateChange={(navState) => {

        setStateURLNow(navState.url);

        if (
            navState.url &&
            navState.url.includes("/Home")
        ) {

            navigation.navigate(
                "HomeWithNavBar"
            );

        } else if (
            navState.url &&
            navState.url.includes("Logout")
        ) {

            clearAsyncStorage();

        }

    }}

    onError={handleError}

    startInLoadingState={true}

/>

            )}


            {/* =================================================
                ERROR SCREEN
            ================================================= */}

            {webError && (

                <View style={styles.errorContainer}>

                    <Text
                        style={styles.errorTitle}
                    >
                        Tidak dapat memuat halaman
                    </Text>


                    <Text
                        style={styles.errorText}
                    >
                        Silahkan periksa koneksi internet
                        kemudian coba lagi.
                    </Text>


                    <View
                        style={styles.retryButton}
                    >

                        <Text
                            style={styles.retryText}
                            onPress={handleReload}
                        >
                            Coba Lagi
                        </Text>

                    </View>

                </View>

            )}


            {/* =================================================
                SPLASH / LOADING
            ================================================= */}

            {showSplash && (

                <View
                    style={styles.splashContainer}
                >

                    <Image

                        source={require(
                            '../assets/splash.png'
                        )}

                        style={styles.splashImage}

                        resizeMode="contain"

                    />


                    <ActivityIndicator

                        size="large"

                        color="#ED2F92"

                        style={
                            styles.loader
                        }

                    />

                </View>

            )}


        </View>

    );

};


export default MainStart;


// =============================================================
// STYLES
// =============================================================

const styles = StyleSheet.create({

    root: {

        flex: 1,

        backgroundColor: '#FFFFFF',

    },


    container: {

        flex: 1,

    },


    splashContainer: {

        ...StyleSheet.absoluteFillObject,

        backgroundColor: '#FFFFFF',

        justifyContent: 'center',

        alignItems: 'center',

        zIndex: 999,

    },


    splashImage: {

        width: '75%',

        height: '45%',

    },


    loader: {

        marginTop: -40,

    },


    errorContainer: {

        flex: 1,

        justifyContent: 'center',

        alignItems: 'center',

        padding: 30,

        backgroundColor: '#FFFFFF',

    },


    errorTitle: {

        fontSize: 20,

        fontWeight: '600',

        color: '#333333',

        marginBottom: 10,

        textAlign: 'center',

    },


    errorText: {

        fontSize: 15,

        color: '#777777',

        textAlign: 'center',

        marginBottom: 25,

    },


    retryButton: {

        backgroundColor: '#ED2F92',

        paddingHorizontal: 30,

        paddingVertical: 12,

        borderRadius: 25,

    },


    retryText: {

        color: '#FFFFFF',

        fontSize: 15,

        fontWeight: '600',

    },

});