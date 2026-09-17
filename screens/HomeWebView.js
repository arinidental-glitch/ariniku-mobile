import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Alert, BackHandler, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GetLocation from 'react-native-get-location';
import config, { url } from '../config.js';
import axios from "axios";
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeWebView = ({ navigation, route }) => {

	const [urlPage, setStateURL] = useState("");
	var vUri = config.url_backend;
	const [urlPageNow, setStateURLNow] = useState(vUri);
	const webview = useRef(null);
	const [exitApp, setExitApp] = useState(0);
	const [webKey, setWebKey] = useState(0);

	useEffect(() => {
		// setTimeout(() => {
		GetSessionLocal();
		// GetUserDataLok();
		// }, 1000);
	});

	useEffect(() => {
		const backAction = () => {
			setTimeout(() => {
				setExitApp(0);
			}, 2000); // 2 seconds to tap second-time

			if (exitApp === 0) {
				if (urlPageNow !== undefined && urlPageNow !== null && urlPageNow !== "" && urlPageNow.includes("/Main") ||
					urlPageNow !== undefined && urlPageNow !== null && urlPageNow !== "" && urlPageNow.includes("/Home") ||
					urlPageNow !== undefined && urlPageNow !== null && urlPageNow !== "" && urlPageNow.includes("/UserSettings") ||
					urlPageNow !== undefined && urlPageNow !== null && urlPageNow !== "" && urlPageNow.includes("/Contact") ||
					urlPageNow !== undefined && urlPageNow !== null && urlPageNow !== "" && urlPageNow.includes("/Reservasi?") ||
					urlPageNow !== undefined && urlPageNow !== null && urlPageNow !== "" && urlPageNow === config.url_backend) {
				} else {
					webview.current?.goBack();
				}
				setExitApp(exitApp + 1);
			} else if (exitApp === 1) {
				Alert.alert("Arini Dental Clinic", "Apakah Anda yakin ingin keluar dari Aplikasi?", [
					{
						text: "Tidak",
						onPress: () => null,
						style: "cancel"
					},
					{ text: "Ya", onPress: () => BackHandler.exitApp() }
				]);
			}
			return true;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);

		return () => backHandler.remove();
	}, [exitApp, urlPageNow]);

	const GetUserDataLok = async () => {
		GetLocation.getCurrentPosition({
			enableHighAccuracy: true,
			timeout: 15000,
		})
			.then(location => {
				// console.log("GPS ->" + location);
				if (location != null && location != undefined) {
					AsyncStorage.setItem('location', JSON.stringify(location));
				}
			})
			.catch(error => {
				const { code, message } = error;
				console.log(code, "GPS ->" + message);
			});
	};

	const GetSessionLocal = async () => {
		try {
			let dataTokenFirebase = await AsyncStorage.getItem('token');
			let dataSessionAccess = await AsyncStorage.getItem('phone');
			let dataSessionEmail = await AsyncStorage.getItem('email');
			let dataSessionName = await AsyncStorage.getItem('name');
			let dataSessionUserID = await AsyncStorage.getItem('userid');
			dataTokenFirebase = dataTokenFirebase !== null ? JSON.parse(dataTokenFirebase) : null;
			dataSessionAccess = dataSessionAccess !== null ? JSON.parse(dataSessionAccess) : null;
			dataSessionEmail = dataSessionEmail !== null ? JSON.parse(dataSessionEmail) : null;
			dataSessionName = dataSessionName !== null ? JSON.parse(dataSessionName) : null;
			dataSessionUserID = dataSessionUserID !== null ? JSON.parse(dataSessionUserID) : null;

			if (dataSessionAccess != null && dataSessionEmail != null && dataSessionName != null && dataSessionUserID != null) {
				// vUri += "/Main?phone=" + dataSessionAccess + "&email=" + dataSessionEmail + "&name=" + dataSessionName + "&userid=" + dataSessionUserID;
				if (route !== undefined && route !== null) {
					// console.log(" MASUK HOMEWEBVIEW --->>> ", route.name);
					if (route.name == 'HomeWebView') {
						vUri += "/Home?phone=" + dataSessionAccess + "&email=" + dataSessionEmail + "&name=" + dataSessionName + "&userid=" + dataSessionUserID;
					} else if (route.name == 'Reservasi') {
						vUri += "/Menu/Reservasi?phone=" + dataSessionAccess + "&email=" + dataSessionEmail + "&name=" + dataSessionName + "&userid=" + dataSessionUserID;
					} else if (route.name == 'Contact') {
						vUri += "/Menu/Contact?phone=" + dataSessionAccess + "&email=" + dataSessionEmail + "&name=" + dataSessionName + "&userid=" + dataSessionUserID;
					} else if (route.name == 'Profile') {
						vUri += "/Menu/UserSettings?phone=" + dataSessionAccess + "&email=" + dataSessionEmail + "&name=" + dataSessionName + "&userid=" + dataSessionUserID;
					}
				}

				//   const value = await AsyncStorage.getItem("name");
				//   if (value !== null) {
				// 	  navigation.navigate("Chat");
				//   }   

				//AMBIL TOKEN UNTUK USER SENDIRI
				async function getTokenFirebase(email, token) {
					return await axios
						.get(`${config.url_backend}/api/ariniku/chat-doctor/refresh-token/`, {
							params: {
								email: email,
								token: token,
							},
						})
						.then((res) => {
							// console.log(res.data.data[0].token_notif_fb);
							setValue('token_server', res.data.data[0].token_server);
						})
						.catch((err) => {
							console.log(err.response);
							if (err.response) {
								console.log("Error when get token firebase");
							}
							// return "";
						});
				}

				//AMBIL TOKEN UNTUK UPDATE SERVER
				// async function getTokenServer() {	
				// 	return await axios
				// 		.get(`${config.url}/api/refresh-token-svr-firebase`)
				// 		.then((res) => {
				// 			// console.log(res.data);
				// 		})
				// 		.catch((err) => {
				// 			console.log(err.response);
				// 			if (err.response) {
				// 			console.log("Error when get token firebase");
				// 			}
				// 			// return "";
				// 		});
				// }

				// getTokenServer();
				getTokenFirebase(dataSessionEmail, dataTokenFirebase);
			}
			setStateURL(vUri);
		} catch (e) {
			console.log(e);
		}
	}

	const onMessage = (data) => {
		try {
			if (data.nativeEvent.data !== null || data.nativeEvent.data !== undefined) {
				var arParam = data.nativeEvent.data.toString().split(';'); // phone;email;name;iduser;is_cs;position;emp_no;url_svr_chat
				setValue('phone', arParam[0]);
				setValue('email', arParam[1]);
				setValue('name', arParam[2]);
				setValue('userid', arParam[3]);
				setValue('is_cs', arParam[4]);
				setValue('position', arParam[5]);
				setValue('emp_no', arParam[6]);
				setValue('url_svr_chat', arParam[7]);
			}
		} catch (e) {
			console.log(e);
		}
	}

	const setValue = async (column, value) => {
		try {
			await AsyncStorage.setItem(column, JSON.stringify(value));
		} catch (e) {
			console.log(e);
		}
	}

	const clearAsyncStorage = async () => {
		await AsyncStorage.getAllKeys()
			.then(keys => AsyncStorage.multiRemove(keys))
			.then(() => console.log("BERHASIL LOGOUT"));
		await AsyncStorage.clear();
	}

	const handleReload = () => {
		setWebKey(prev => prev + 1); // trigger reload by changing key
	};

	return (
		// <SafeAreaView style={{ flex: 1 }}>
		<WebView
			key={webKey}
			ref={webview}
			style={styles.container}
			originWhitelist={['https://*', 'file:///*']}
			allowFileAccess={true}
			source={{ uri: (urlPage !== undefined ? urlPage : vUri) }}
			mixedContentMode="always"
			onMessage={onMessage}
			onShouldStartLoadWithRequest={(req) => { if (!req.url.includes(config.url_backend)) { Linking.openURL(req.url); return false; } return true; }}
			onNavigationStateChange={navState => {
				setStateURLNow(navState.url.toString());
				if (navState.url.toString().includes("#Chat")) {
					navigation.navigate("Chat");
				} else if (navState.url.toString().includes("Logout")) {
					clearAsyncStorage();
					navigation.navigate("MainStart", { status_logout: true });
				}
			}}
			onError={(syntheticEvent) => {
				const { nativeEvent } = syntheticEvent;
				console.warn('WebView error: ', nativeEvent);
				// bisa kasih retry atau ganti halaman error
			}}
			startInLoadingState={true}
			renderError={(errorName) => (
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
					<Text style={{ marginBottom: 10, fontSize: 16, color: 'red' }}>
						Terjadi kesalahan: {errorName}
					</Text>
					<Text style={{ marginBottom: 20 }}>
						Halaman gagal dimuat. Silahkan coba lagi ya.
					</Text>
					<Button title="Coba Lagi" onPress={handleReload} />
				</View>
			)}
		/>
		// </SafeAreaView>
	);
};

export default HomeWebView;

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

