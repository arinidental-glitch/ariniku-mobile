import React, { Component } from "react";

import {
    Alert,
    Platform,
    StatusBar,
    Animated,
} from "react-native";

// App screens
import MainStart from "./screens/MainStart";
import HomeWithNavBar from "./screens/HomeWithNavBar";
import Login from "./screens/Login";
import Messaging from "./screens/Messaging";
import Chat from "./screens/Chat";

// Expo Notifications
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

// React Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AsyncStorage from "@react-native-async-storage/async-storage";

import config from "./config.js";
import axios from "axios";

const Stack = createNativeStackNavigator();

const navigationRef = React.createRef();


// ==========================================
// EXPO NOTIFICATION HANDLER
// ==========================================

Notifications.setNotificationHandler({

    handleNotification: async () => ({

        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,

    }),

});


// ==========================================
// NAVIGATION ANIMATION
// ==========================================

const forFade = ({ current, next }) => {

    const opacity = Animated.add(

        current.progress,

        next ? next.progress : 0

    ).interpolate({

        inputRange: [0, 1, 2],

        outputRange: [0, 1, 0],

    });


    return {

        leftButtonStyle: { opacity },

        rightButtonStyle: { opacity },

        titleStyle: { opacity },

        backgroundStyle: { opacity },

    };

};


// ==========================================
// ASYNC STORAGE
// ==========================================

const setValue = async (column, value) => {

    try {

        await AsyncStorage.setItem(
            column,
            JSON.stringify(value)
        );

    } catch (e) {

        console.log(e);

    }

};


// ==========================================
// APP
// ==========================================

export default class App extends Component {


    constructor(props) {

        super(props);


        this.state = {};


        // Expo notification subscriptions

        this.notificationReceivedSubscription = null;

        this.notificationResponseSubscription = null;

        this.pendingNotificationData = null;
        this.lastNotificationResponseId = null;


        // Initialize push notification

        setTimeout(() => {

            this.initializeFCM();

        }, 2000);

    }


    onNavigationReady() {

    console.log(
        "========================================"
    );

    console.log(
        "🧭 NAVIGATION READY"
    );

    console.log(
        "========================================"
    );

    if (!this.pendingNotificationData) {
        return;
    }

    const data =
        this.pendingNotificationData;

    this.pendingNotificationData = null;

    console.log(
        "🔔 PROCESS PENDING NOTIFICATION =",
        data
    );

    setTimeout(() => {

        this.handleNotificationData(data);

    }, 300);

}


async handleNotificationData(data) {

    console.log(
        "========================================"
    );

    console.log(
        "🔔 HANDLE NOTIFICATION DATA"
    );

    console.log(
        JSON.stringify(
            data,
            null,
            2
        )
    );

    console.log(
        "========================================"
    );


    const type =
        String(
            data?.type || ""
        ).toUpperCase();

        const useridStorage =
    await AsyncStorage.getItem("userid");

const userid =
    useridStorage !== null
        ? JSON.parse(useridStorage)
        : null;

console.log("🔥 NOTIFICATION USERID =", userid);


    console.log(
        "🔔 NOTIFICATION TYPE =",
        type
    );


    // ==========================================
    // NAVIGATION BELUM READY
    // ==========================================

    if (
        !navigationRef.current ||
        !navigationRef.current.isReady()
    ) {

        console.log(
            "⏳ NAVIGATION BELUM READY - SIMPAN PENDING"
        );

        this.pendingNotificationData = data;

        return;

    }


    // ==========================================
    // CHAT
    // ==========================================

     if (type === "CHAT") {

    console.log(
        "💬 OPEN ARDA CHAT"
    );

    navigationRef.current.navigate(
        "MainStart",
        {
            notificationChat: true,
            chatUrl:
            config.url_backend +
            "/Chat/Index?userid=" +
            encodeURIComponent(userid),
            notificationKey: Date.now()
        }
    );

    return;
}


    // ==========================================
    // CAMPAIGN
    // ==========================================

    if (type === "CAMPAIGN") {

        const actionType =
            data?.action_type || "";

        const actionValue =
            data?.action_value || "";

        const notificationId =
            data?.notification_id || "";


        console.log(
            "CAMPAIGN ACTION TYPE =",
            actionType
        );

        console.log(
            "CAMPAIGN ACTION VALUE =",
            actionValue
        );


        // ==========================================
        // ARTICLE
        // ==========================================

        if (
            actionType === "ARTICLE"
        ) {

            navigationRef.current.navigate(
                "MainStart",
                {
                    notificationArticle: true,
                    articleId: actionValue
                }
            );

            return;

        }


                // ==========================================
        // PROMO
        // ==========================================

        if (
            actionType === "PROMO"
        ) {

            console.log(
                "🎁 OPEN PROMO"
            );

            console.log(
                "PROMO ID =",
                actionValue
            );

            navigationRef.current.navigate(
                "MainStart",
                {
                    notificationPromo: true,
                    promoId: actionValue,
                    promoUrl:
                        config.url_backend +
                        "/Menu/PromoDetail?code=" +
                        encodeURIComponent(actionValue)
                }
            );

            return;
        }


        // ==========================================
        // INBOX
        // ==========================================

        if (
            actionType === "INBOX"
        ) {

            navigationRef.current.navigate(
                "MainStart",
                {
                    notificationCampaign: true,
                    notificationId:
                        notificationId
                }
            );

            return;

        }


        // ==========================================
        // CAMPAIGN FALLBACK
        // ==========================================

        navigationRef.current.navigate(
            "MainStart",
            {
                notificationCampaign: true,
                notificationId:
                    notificationId
            }
        );

        return;

    }


    console.log(
        "⚠️ UNKNOWN NOTIFICATION TYPE =",
        type
    );

}


handleNotificationResponse(response) {

    if (!response) {
        return;
    }

    console.log(
        "========================================"
    );

    console.log(
        "🔔 NOTIFICATION CLICKED"
    );

    console.log(
        "🔔 RESPONSE =",
        JSON.stringify(
            response,
            null,
            2
        )
    );

    console.log(
        "========================================"
    );

    const responseId =
        response?.notification?.request?.identifier;

    // Hindari notification yang sama diproses 2x
    if (
        responseId &&
        this.lastNotificationResponseId === responseId
    ) {

        console.log(
            "⚠️ NOTIFICATION SUDAH DIPROSES"
        );

        return;
    }

    if (responseId) {

        this.lastNotificationResponseId =
            responseId;
    }

    const data =
        response
            ?.notification
            ?.request
            ?.content
            ?.data || {};

    console.log(
        "🔔 NOTIFICATION DATA =",
        data
    );

    this.handleNotificationData(data);
}


    // ==========================================
    // RENDER
    // ==========================================

    render() {

        return (

            <NavigationContainer
    ref={navigationRef}
    onReady={() => this.onNavigationReady()}
>

                <StatusBar
                    translucent
                    backgroundColor="transparent"
                    barStyle="dark-content"
                />


                <Stack.Navigator
                    initialRouteName="MainStart"
                >


                    <Stack.Screen
                        name="MainStart"
                        component={MainStart}
                        options={{
                            headerShown: false,
                            headerStyleInterpolator: forFade
                        }}
                    />


                    <Stack.Screen
                        name="HomeWithNavBar"
                        component={HomeWithNavBar}
                        options={{
                            headerShown: false
                        }}
                    />


                    <Stack.Screen
                        name="Chat"
                        component={Chat}
                        options={{
                            title: "Chats",
                            headerShown: false
                        }}
                    />


                    <Stack.Screen
                        name="Messaging"
                        component={Messaging}
                        options={{
                            title: "Messaging",
                            headerShown: true
                        }}
                    />


                    {/*
                    <Stack.Screen
                        name="Reservasi"
                        component={HomeWithNavBar}
                        options={{
                            headerShown: false,
                            headerStyleInterpolator: forFade
                        }}
                    />


                    <Stack.Screen
                        name="Contact"
                        component={HomeWithNavBar}
                        options={{
                            headerShown: false,
                            headerStyleInterpolator: forFade
                        }}
                    />


                    <Stack.Screen
                        name="Profile"
                        component={HomeWithNavBar}
                        options={{
                            headerShown: false,
                            headerStyleInterpolator: forFade
                        }}
                    />
                    */}


                    {/*
                    <Stack.Screen
                        name="Chat"
                        component={Chat}
                        options={{
                            title: "Chats",
                            headerShown: true,
                        }}
                    />
                    */}


                </Stack.Navigator>

            </NavigationContainer>

        );

    }


    // ==========================================
    // EXPO PUSH NOTIFICATION
    // ==========================================

    async initializeFCM() {

        try {

            console.log(
                "========================================"
            );

            console.log(
                "INITIALIZE PUSH NOTIFICATION - EXPO"
            );

            console.log(
                "========================================"
            );


            // ==========================================
            // PHYSICAL DEVICE CHECK
            // ==========================================

            if (!Device.isDevice) {

                console.log(
                    "❌ Push notification membutuhkan physical device"
                );

                return;

            }


            console.log(
                "📱 Physical Device = true"
            );


            // ==========================================
            // PERMISSION
            // ==========================================

            const {
                status: existingStatus
            } = await Notifications.getPermissionsAsync();


            console.log(
                "🔔 EXISTING NOTIFICATION PERMISSION =",
                existingStatus
            );


            let finalStatus = existingStatus;


            if (existingStatus !== "granted") {

                const {
                    status
                } = await Notifications.requestPermissionsAsync();


                finalStatus = status;


                console.log(
                    "🔔 REQUESTED NOTIFICATION PERMISSION =",
                    finalStatus
                );

            }


            if (finalStatus !== "granted") {

                console.log(
                    "❌ Notification permission tidak diberikan"
                );

                return;

            }


            console.log(
                "✅ Notification permission granted"
            );


            // ==========================================
            // ANDROID CHANNEL
            // ==========================================

            if (Platform.OS === "android") {

                await Notifications.setNotificationChannelAsync(

                    "default",

                    {
                        name: "default",

                        importance:
                            Notifications.AndroidImportance.MAX,

                        vibrationPattern:
                            [0, 250, 250, 250],

                        lightColor: "#FF1493",
                    }

                );

            }


            // ==========================================
            // EXPO PROJECT ID
            // ==========================================

            const projectId =

                Constants?.expoConfig?.extra?.eas?.projectId ||

                Constants?.easConfig?.projectId;


            console.log(
                "🚀 EXPO PROJECT ID =",
                projectId
            );


            if (!projectId) {

                console.log(
                    "❌ Expo Project ID tidak ditemukan"
                );

                return;

            }


            // ==========================================
            // GET EXPO PUSH TOKEN
            // ==========================================

            console.log(
                "🔥 GET EXPO PUSH TOKEN"
            );


            const tokenResponse =

                await Notifications.getExpoPushTokenAsync({

                    projectId: projectId,

                });


            const expoPushToken =
                tokenResponse?.data;


            console.log(
                "🔥 EXPO PUSH TOKEN =",
                expoPushToken
            );


            // ==========================================
            // SAVE TOKEN
            // ==========================================

            if (expoPushToken) {

                await setValue(
                    "token",
                    expoPushToken
                );


                this.setState({

                    registerToken:
                        expoPushToken,

                    fcmRegistered:
                        true

                });


                console.log(
                    "✅ EXPO PUSH TOKEN SAVED TO ASYNC STORAGE"
                );

                console.log("🔎 PLATFORM BEFORE EXPO DB SAVE =", Platform.OS);

                if (Platform.OS === "ios") {
    try {
        const emailStorage = await AsyncStorage.getItem("email");
        const email = emailStorage !== null
            ? JSON.parse(emailStorage)
            : null;

        console.log("📧 EXPO TOKEN USER EMAIL =", email);

        if (email) {
            const response = await axios.post(
                `${config.url_backend}/api/ariniku/save-expo-token`,
                {
                    email: email,
                    token: expoPushToken
                }
            );

            console.log(
                "✅ EXPO TOKEN SAVED TO DATABASE =",
                response.data
            );
        } else {
            console.log("⚠️ EMAIL USER BELUM TERSEDIA");
        }

    } catch (error) {
        console.log(
            "❌ SAVE EXPO TOKEN ERROR =",
            error?.response?.data ||
            error?.message ||
            error
        );
    }
}

            }


            // ==========================================
            // FOREGROUND NOTIFICATION
            // ==========================================

            this.notificationReceivedSubscription =

                Notifications.addNotificationReceivedListener(

                    notification => {

                        console.log(
                            "========================================"
                        );

                        console.log(
                            "🔔 NOTIFICATION RECEIVED"
                        );

                        console.log(

                            JSON.stringify(
                                notification,
                                null,
                                2
                            )

                        );

                        console.log(
                            "========================================"
                        );

                    }

                );


            // ==========================================
            // NOTIFICATION CLICK
            // ==========================================

            // ==========================================
// NOTIFICATION CLICK
// ==========================================

this.notificationResponseSubscription =
    Notifications.addNotificationResponseReceivedListener(
        response => {

            this.handleNotificationResponse(
                response
            );

        }
    );


// ==========================================
// NOTIFICATION OPENED FROM KILLED STATE
// ==========================================

try {

    const lastResponse =
        await Notifications
            .getLastNotificationResponseAsync();

    if (lastResponse) {

        console.log(
            "🔔 LAST NOTIFICATION RESPONSE FOUND"
        );

        this.handleNotificationResponse(
            lastResponse
        );

        if (
            Notifications
                .clearLastNotificationResponseAsync
        ) {

            await Notifications
                .clearLastNotificationResponseAsync();

        }
    }

} catch (error) {

    console.log(
        "❌ GET LAST NOTIFICATION RESPONSE ERROR =",
        error
    );

}


            console.log(
                "========================================"
            );

            console.log(
                "✅ EXPO PUSH INITIALIZATION SUCCESS"
            );

            console.log(
                "========================================"
            );


        } catch (error) {


            console.log(
                "========================================"
            );

            console.log(
                "❌ EXPO PUSH INITIALIZATION ERROR"
            );

            console.log(
                error
            );

            console.log(
                "========================================"
            );

        }

    }


        // ==========================================
    // LEGACY REGISTER CALLBACK
    // ==========================================

    async onRegister(token) {

        console.log(
            "========================================"
        );

        console.log(
            "PUSH NOTIFICATION REGISTER"
        );

        console.log(
            "PLATFORM =",
            Platform.OS
        );

        console.log(
            "========================================"
        );


        // ==========================================
        // ANDROID LEGACY
        // ==========================================

        if (Platform.OS === "android") {

            const fcmToken =
                token?.token;


            console.log(
                "ANDROID FCM TOKEN =",
                fcmToken
            );


            if (fcmToken) {

                await setValue(
                    "token",
                    fcmToken
                );


                this.setState({

                    registerToken:
                        fcmToken,

                    fcmRegistered:
                        true

                });


                console.log(
                    "ANDROID TOKEN SAVED"
                );

            }


            return;

        }


        // ==========================================
        // iOS
        // ==========================================

        if (Platform.OS === "ios") {

            console.log(
                "iOS Push Notification ditangani oleh Expo Notifications"
            );

            return;

        }

    }


    // ==========================================
    // COMPONENT WILL UNMOUNT
    // ==========================================

    componentWillUnmount() {


        if (
            this.notificationReceivedSubscription
        ) {

            this.notificationReceivedSubscription.remove();

            this.notificationReceivedSubscription = null;

        }


        if (
            this.notificationResponseSubscription
        ) {

            this.notificationResponseSubscription.remove();

            this.notificationResponseSubscription = null;

        }

    }


    // ==========================================
    // NOTIFICATION HANDLER
    // ==========================================

    onNotif(notif) {


        console.log(
            "========== NOTIFICATION =========="
        );


        console.log(
            JSON.stringify(
                notif,
                null,
                2
            )
        );


        console.log(
            "=================================="
        );


        // ==========================================
        // NOTIFICATION CLICKED
        // ==========================================

        if (
            notif?.userInteraction === true
        ) {


            const type =

                notif?.data?.type ||

                notif?.userInfo?.type ||

                notif?.type ||

                "";


            console.log(
                "NOTIFICATION TYPE =",
                type
            );


            // ==========================================
            // CAMPAIGN
            // ==========================================

            if (
                type === "CAMPAIGN"
            ) {


                const actionType =

                    notif?.data?.action_type ||

                    notif?.userInfo?.action_type ||

                    notif?.action_type ||

                    "";


                const actionValue =

                    notif?.data?.action_value ||

                    notif?.userInfo?.action_value ||

                    notif?.action_value ||

                    "";


                console.log(
                    "NOTIFICATION ACTION TYPE =",
                    actionType
                );


                console.log(
                    "NOTIFICATION ACTION VALUE =",
                    actionValue
                );


                // ==========================================
                // ARTICLE
                // ==========================================

                if (
                    actionType === "ARTICLE"
                ) {


                    console.log(
                        "NOTIFICATION CLICKED - OPEN ARTICLE"
                    );


                    console.log(
                        "ARTICLE ID =",
                        actionValue
                    );


                    if (
                        navigationRef.current
                    ) {

                        navigationRef.current.navigate(

                            "MainStart",

                            {

                                notificationArticle:
                                    true,

                                articleId:
                                    actionValue

                            }

                        );

                    }


                    return;

                }


                // ==========================================
                // PROMO
                // ==========================================

                if (
                    actionType === "PROMO"
                ) {

                    console.log(
                        "NOTIFICATION CLICKED - OPEN PROMO"
                    );

                    console.log(
                        "PROMO ID =",
                        actionValue
                    );

                    if (
                        navigationRef.current
                    ) {

                        navigationRef.current.navigate(
                            "MainStart",
                            {
                                notificationPromo: true,
                                promoId: actionValue,
                                promoUrl:
                                    config.url_backend +
                                    "/Menu/PromoDetail?code=" +
                                    encodeURIComponent(actionValue)
                            }
                        );

                    }

                    return;
                }


                // ==========================================
                // INBOX / CAMPAIGN
                // ==========================================

                if (
                    actionType === "INBOX"
                ) {


                    const notificationId =

                        notif?.data?.notification_id ||

                        notif?.userInfo?.notification_id ||

                        notif?.notification_id;


                    console.log(
                        "NOTIFICATION CLICKED - OPEN CAMPAIGN"
                    );


                    console.log(
                        "CAMPAIGN notification_id =",
                        notificationId
                    );


                    if (
                        navigationRef.current
                    ) {

                        navigationRef.current.navigate(

                            "MainStart",

                            {

                                notificationCampaign:
                                    true,

                                notificationId:
                                    notificationId

                            }

                        );

                    }


                    return;

                }


                // ==========================================
                // FALLBACK - CAMPAIGN LAMA
                // ==========================================

                console.log(
                    "CAMPAIGN ACTION TYPE EMPTY - FALLBACK"
                );


                const notificationId =

                    notif?.data?.notification_id ||

                    notif?.userInfo?.notification_id ||

                    notif?.notification_id;


                if (
                    navigationRef.current
                ) {

                    navigationRef.current.navigate(

                        "MainStart",

                        {

                            notificationCampaign:
                                true,

                            notificationId:
                                notificationId

                        }

                    );

                }


                return;

            }


            // ==========================================
            // CHAT
            // ==========================================

          // CHAT
console.log(
    "NOTIFICATION CLICKED - OPEN ARDA CHAT"
);

if (navigationRef.current) {
    navigationRef.current.navigate(
        "MainStart",
        {
            notificationChat: true,
             chatUrl:
            config.url_backend +
            "/Chat/Index?userid=" +
            encodeURIComponent(userid),
            notificationKey: Date.now()
        }
    );
}

return;
        }


        // ==========================================
        // FOREGROUND
        // ==========================================

        console.log(
            "NOTIFICATION FOREGROUND - handled by Expo Notifications"
        );

    }


    // ==========================================
    // PERMISSION HANDLER
    // ==========================================

    handlePerm(perms) {

        Alert.alert(
            "Permissions",
            JSON.stringify(perms)
        );

    }

}