import React, { useLayoutEffect, useState, lazy, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";


import MainStart from "./MainStart";
import HomeWebView from "./HomeWebView";
import Login from "./Login";
import Messaging from "./Messaging";
import Chat from "./Chat";

import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config.js";
import axios from "axios";

const HomeWithNavBar = ({ navigation }) => {
	const BottomTab = createBottomTabNavigator();

	const [selecttedNav, setSelectedNav] = useState("HomeWebView");
	const [showChatTab, setShowChatTab] = useState(true); // default tampilkan

	// const [email, setEmail] = useState("");
	// const [countChat, setCountChat] = useState(0);

	useEffect(() => {
		const checkPhone = async () => {
			try {
				const dataSessionAccess = await AsyncStorage.getItem('phone');
				if (JSON.parse(dataSessionAccess) == "0") {
					setShowChatTab(false); // Sembunyikan tab Chat
				}
			} catch (e) {
				console.log("Gagal ambil session:", e);
			}
		};
		checkPhone();
	}, []);



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

	return (
		<BottomTab.Navigator
			initialRouteName="HomeWebView"
			screenOptions={{
				tabBarShowLabel: false,
				tabBarActiveTintColor: "#ef369b",
				tabBarInactiveTintColor: "#fff",
				tabBarStyle: {
					height: Platform.OS == "android" ? 60 : 85,
					borderTopLeftRadius: 20,
					borderTopRightRadius: 20,
					marginLeft: 0,
					marginRight: 0,
					marginBottom: 0,
					paddingHorizontal: 5,
					paddingTop: 0,
					backgroundColor: '#10dce3',
					position: 'absolute',
				}
			}}
		>
			<BottomTab.Screen
				name='HomeWebView'
				component={HomeWebView}
				listeners={{
					tabPress: e => {
						setSelectedNav("HomeWebView");
					}
				}}
				options={{
					headerShown: false,
					headerStyleInterpolator: forFade,
					tabBarShowLabel: true,
					tabBarLabel: 'Home',
					tabBarLabelStyle: {
						paddingBottom: 7,
						fontFamily: 'Rubik-Medium',
						fontSize: 11,
						letterSpacing: 1,
					},
					tabBarIcon: ({ color }) => <Ionicons
						loading={lazy}
						name='home-outline'
						size={25}
						color={selecttedNav === 'HomeWebView' ? '#ef369b' : '#fff'}
					/>
				}}
			/>

			{/* <BottomTab.Screen
				name='Chat'
				component={Chat}
				listeners={{
					tabPress: e => {
						setSelectedNav("Chat");
					}
				}}
				options={{
					title: 'Chat', headerShown: false,
					tabBarShowLabel: true,
					tabBarLabel: 'Chat',
					tabBarLabelStyle: {
						paddingBottom: 7,
						fontFamily: 'Rubik-Medium',
						fontSize: 11,
						letterSpacing: 1,
					},
					// tabBarBadge: countChat,
					tabBarIcon: ({ color }) => <Ionicons
						loading={lazy}
						name='chatbubble-ellipses-outline'
						size={25}
						color={selecttedNav === 'Chat' ? '#ef369b' : '#fff'}
					/>
				}}
			/> */}

			<BottomTab.Screen
				name='Chat'
				component={Chat}
				listeners={{
					tabPress: e => {
						if (!showChatTab) {
							e.preventDefault(); // cegah navigasi
							// Bisa juga tampilkan alert atau toast
							alert('Silahkan register akun.');
						} else {
							setSelectedNav("Chat");
						}
					}
				}}
				options={{
					title: 'Chat', headerShown: false,
					tabBarShowLabel: true,
					tabBarLabel: 'Chat',
					tabBarLabelStyle: {
						paddingBottom: 7,
						fontFamily: 'Rubik-Medium',
						fontSize: 11,
						letterSpacing: 1,
					},
					tabBarIcon: ({ color }) => <Ionicons
						loading={lazy}
						name='chatbubble-ellipses-outline'
						size={25}
						color={selecttedNav === 'Chat' ? '#ef369b' : '#fff'}
					/>
				}}
			/>

			<BottomTab.Screen
				name='Reservasi'
				component={HomeWebView}
				listeners={{
					tabPress: e => {
						// e.preventDefault();
						setSelectedNav("Reservasi");
					}
				}}
				options={{
					title: 'Reservasi', headerShown: false,
					tabBarShowLabel: true,
					tabBarLabel: 'Reservasi',
					tabBarLabelStyle: {
						paddingBottom: 7,
						fontFamily: 'Rubik-Medium',
						fontSize: 11,
						letterSpacing: 1,
					},
					tabBarIcon: ({ color }) =>
						<View style={{
							position: 'absolute',
							bottom: 5, // space from bottombar
							height: 58,
							width: 58,
							borderRadius: 58,
							backgroundColor: '#10dce3',
							borderColor: selecttedNav === 'Reservasi' ? '#ef369b' : '#fff',
							borderWidth: 2,
							justifyContent: 'center',
							alignItems: 'center',
						}}>
							<Ionicons
								loading={lazy}
								name='calendar-outline'
								size={30}
								color={selecttedNav === 'Reservasi' ? '#ef369b' : '#fff'}
							/>
						</View>

				}}
			/>

			<BottomTab.Screen
				name='Contact'
				component={HomeWebView}
				listeners={{
					tabPress: e => {
						setSelectedNav("Contact");
					}
				}}
				options={{
					title: 'Contact', headerShown: false,
					tabBarShowLabel: true,
					tabBarLabel: 'Contact',
					tabBarLabelStyle: {
						paddingBottom: 7,
						fontFamily: 'Rubik-Medium',
						fontSize: 11,
						letterSpacing: 1,
					},
					tabBarIcon: ({ color }) => <Ionicons
						loading={lazy}
						name='call-outline'
						size={25}
						color={selecttedNav === 'Contact' ? '#ef369b' : '#fff'}
					/>
				}}
			/>

			<BottomTab.Screen
				name='Profile'
				component={HomeWebView}
				listeners={{
					tabPress: e => {
						setSelectedNav("Profile");
					}
				}}
				options={{
					title: 'Profile', headerShown: false,
					tabBarShowLabel: true,
					tabBarLabel: 'Profile',
					tabBarLabelStyle: {
						paddingBottom: 7,
						fontFamily: 'Rubik-Medium',
						fontSize: 11,
						letterSpacing: 1,
					},
					tabBarIcon: ({ color }) => <Ionicons
						loading={lazy}
						name='person-outline'
						size={25}
						color={selecttedNav === 'Profile' ? '#ef369b' : '#fff'}
					/>
				}}
			/>
		</BottomTab.Navigator>
		// <>
		// </>
	);
};

export default HomeWithNavBar;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		//marginTop: Platform.OS == 'ios' ? Constants.statusBarHeight : 0
		// alignItems: 'center',
		// justifyContent: 'center',
	},
});

