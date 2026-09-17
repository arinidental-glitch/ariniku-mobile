import React, { Component } from "react";
import { Alert, Platform, PermissionsAndroid, StatusBar } from 'react-native';
import messaging from '@react-native-firebase/messaging';
//👇🏻 app screens
import MainStart from "./screens/MainStart";
import HomeWithNavBar from "./screens/HomeWithNavBar";
import Login from "./screens/Login";
import Messaging from "./screens/Messaging";

import Chat from "./screens/Chat";

//👇🏻 React Navigation configurations
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NotifService from './NotifService';


const Stack = createNativeStackNavigator();
const navigationRef = React.createRef();


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

const setValue = async (column, value) => {
	try {
		await AsyncStorage.setItem(column, JSON.stringify(value));
	} catch (e) {
		console.log(e);
	}
}

const requestNotificationPermission = async () => {
	if (Platform.OS === "android") {
		try {
			PermissionsAndroid.check('android.permission.POST_NOTIFICATIONS').then(
				response => {
					if (!response) {
						PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS', {
							title: 'Notification',
							message:
								'App needs access to your notification ' +
								'so you can get Updates',
							buttonNeutral: 'Ask Me Later',
							buttonNegative: 'Cancel',
							buttonPositive: 'OK',
						})
					}
				}
			).catch(
				err => {
					console.log("Notification Error=====>", err);
				}
			)
		} catch (err) {
			console.log(err);
		}
	}
};

export default class App extends Component {
	constructor(props) {
    super(props);

    this.state = {};

    requestNotificationPermission();

    const notif = new NotifService(
        this.onRegister.bind(this),
        this.onNotif.bind(this),
    );

    // ==========================================
    // FCM TOKEN REFRESH
    // ==========================================
    this.unsubscribeTokenRefresh = null;

    if (Platform.OS === 'ios') {
        this.initializeFCM();
    }
}

	render() {
		return (
			<NavigationContainer ref={navigationRef}>
				<StatusBar
					translucent
					backgroundColor="transparent"
					barStyle="dark-content"
				/>
				<Stack.Navigator
					initialRouteName="MainStart"
				>
					<Stack.Screen
						name='MainStart'
						component={MainStart}
						options={{ headerShown: false, headerStyleInterpolator: forFade}}
					/>

					<Stack.Screen
						name='HomeWithNavBar'
						component={HomeWithNavBar}
						options={{ headerShown: false }}
					/>

					<Stack.Screen
						name='Chat'
						component={Chat}
						options={{
							title: "Chats",
							headerShown: false
						}}
					/>

					<Stack.Screen
						name='Messaging'
						component={Messaging}
						options={{
							title: "Messaging",
							headerShown: true
						}}
					/>

					{/*

					<Stack.Screen
						name='Reservasi'
						component={HomeWithNavBar}
						options={{ headerShown: false, headerStyleInterpolator: forFade }}
					/>

					<Stack.Screen
						name='Contact'
						component={HomeWithNavBar}
						options={{ headerShown: false, headerStyleInterpolator: forFade }}
					/>

					<Stack.Screen
						name='Profile'
						component={HomeWithNavBar}
						options={{ headerShown: false, headerStyleInterpolator: forFade }}
					/> */}

					{/* <Stack.Screen
						name='Chat'
						component={Chat}
						options={{
							title: "Chats",
							headerShown: true,
						}}
					/> */}
				</Stack.Navigator>
			</NavigationContainer>
		);
	}



	async initializeFCM() {

    try {

        console.log("========================================");
        console.log("INITIALIZE FCM - iOS");
        console.log("========================================");

        // ==========================================
        // REQUEST NOTIFICATION PERMISSION
        // ==========================================

        const authStatus =
            await messaging().requestPermission();

        console.log(
            "FCM permission status =",
            authStatus
        );


        // ==========================================
        // REGISTER DEVICE TO REMOTE NOTIFICATIONS
        // ==========================================

        await messaging().registerDeviceForRemoteMessages();

        console.log(
            "Device registered for remote messages"
        );


        // ==========================================
        // APNS TOKEN
        // ==========================================

        const apnsToken =
            await messaging().getAPNSToken();

        console.log(
            "APNS TOKEN =",
            apnsToken
        );


        // ==========================================
        // FCM TOKEN
        // ==========================================

        const fcmToken =
            await messaging().getToken();

        console.log(
            "FCM TOKEN =",
            fcmToken
        );


        if (fcmToken) {

            await setValue(
                'token',
                fcmToken
            );

            this.setState({
                registerToken: fcmToken,
                fcmRegistered: true
            });

            console.log(
                "FCM TOKEN SAVED TO ASYNC STORAGE"
            );
        }


        // ==========================================
        // TOKEN REFRESH LISTENER
        // ==========================================

        this.unsubscribeTokenRefresh =
            messaging().onTokenRefresh(
                async (newToken) => {

                    console.log(
                        "========================================"
                    );

                    console.log(
                        "FCM TOKEN REFRESH"
                    );

                    console.log(
                        "NEW FCM TOKEN =",
                        newToken
                    );

                    console.log(
                        "========================================"
                    );


                    if (newToken) {

                        await setValue(
                            'token',
                            newToken
                        );

                        this.setState({
                            registerToken: newToken,
                            fcmRegistered: true
                        });

                        console.log(
                            "NEW FCM TOKEN SAVED"
                        );
                    }

                }
            );

    } catch (error) {

        console.log(
            "========================================"
        );

        console.log(
            "FCM INITIALIZATION ERROR"
        );

        console.log(
            error
        );

        console.log(
            "========================================"
        );
    }
}



	async onRegister(token) {

    console.log("========================================");
    console.log("PUSH NOTIFICATION REGISTER");
    console.log("PLATFORM =", Platform.OS);
    console.log("========================================");


    // ==========================================
    // ANDROID
    // ==========================================

    if (Platform.OS === 'android') {

        const fcmToken = token?.token;

        console.log(
            "ANDROID FCM TOKEN =",
            fcmToken
        );

        if (fcmToken) {

            await setValue(
                'token',
                fcmToken
            );

            this.setState({
                registerToken: fcmToken,
                fcmRegistered: true
            });

        }

        return;
    }


    // ==========================================
    // iOS
    // ==========================================

    if (Platform.OS === 'ios') {

        console.log(
            "iOS PushNotification register callback"
        );

        console.log(
            "APNs token dari PushNotification =",
            token?.token
        );

        console.log(
            "FCM token iOS ditangani oleh initializeFCM()"
        );
    }
  }

  componentWillUnmount() {

    if (this.unsubscribeTokenRefresh) {

        this.unsubscribeTokenRefresh();

        this.unsubscribeTokenRefresh = null;
    }
}


onNotif(notif) {

    console.log("========== NOTIFICATION ==========");
    console.log(JSON.stringify(notif, null, 2));
    console.log("==================================");

    if (notif.userInteraction === true) {

        const type =
            notif?.data?.type ||
            notif?.userInfo?.type ||
            notif?.type ||
            "";

        console.log("NOTIFICATION TYPE =", type);

        // ==========================================
        // CAMPAIGN
        // ==========================================
        // ==========================================
// CAMPAIGN
// ==========================================
if (type === "CAMPAIGN") {

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

    console.log("NOTIFICATION ACTION TYPE =", actionType);
    console.log("NOTIFICATION ACTION VALUE =", actionValue);

    // ==========================================
    // ARTICLE
    // ==========================================
    if (actionType === "ARTICLE") {

        console.log(
            "NOTIFICATION CLICKED - OPEN ARTICLE"
        );

        console.log(
            "ARTICLE ID =",
            actionValue
        );

        // Untuk sementara kita kirim ke MainStart
        // dengan parameter articleId.
        if (navigationRef.current) {

            navigationRef.current.navigate(
                "MainStart",
                {
                    notificationArticle: true,
                    articleId: actionValue
                }
            );

        }

        return;
    }

    // ==========================================
    // INBOX / CAMPAIGN
    // ==========================================
    if (actionType === "INBOX") {

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

        if (navigationRef.current) {

            navigationRef.current.navigate(
                "MainStart",
                {
                    notificationCampaign: true,
                    notificationId: notificationId
                }
            );

        }

        return;
    }

    // ==========================================
    // FALLBACK - campaign lama
    // ==========================================
    console.log(
        "CAMPAIGN ACTION TYPE EMPTY - FALLBACK"
    );

    const notificationId =
        notif?.data?.notification_id ||
        notif?.userInfo?.notification_id ||
        notif?.notification_id;

    if (navigationRef.current) {

        navigationRef.current.navigate(
            "MainStart",
            {
                notificationCampaign: true,
                notificationId: notificationId
            }
        );

    }

    return;
}
        // ==========================================
        // CHAT
        // ==========================================
        console.log(
            "NOTIFICATION CLICKED - OPEN ARDA CHAT"
        );

        if (navigationRef.current) {

            navigationRef.current.navigate(
                "MainStart",
                {
                    notificationChat: true
                }
            );
        }

        return;
    }

    // ==========================================
    // NOTIFICATION FOREGROUND
    // ==========================================

    const notification = new NotifService(
        this.onRegister.bind(this),
        this.onNotif.bind(this),
    );

    notification.localNotifWithParam(
        'default',
        'Zahra',
        'New Chat',
        notif.title,
        notif.message
    );
}

	handlePerm(perms) {
		Alert.alert('Permissions', JSON.stringify(perms));
	}
}