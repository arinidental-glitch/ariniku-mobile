import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Alert, BackHandler, Platform,  } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GetLocation from 'react-native-get-location';
import config from '../config.js';
import axios from "axios";

const Home = ({ navigation }) => {
	
	const [urlPage, setStateURL] = useState("");
	var vUri = config.url_backend;  
	const webview = useRef(null);
	const [exitApp, setExitApp] = useState(0);
  
	useEffect(() => {    
	  setTimeout(() => {
		GetSessionLocal();
		// GetUserDataLok();
	  }, 1000);
	});
  
	useEffect(() => {
	  const backAction = () => {
		setTimeout(() => {
			setExitApp(0);
		  }, 2000); // 2 seconds to tap second-time
		  
		  if (exitApp === 0) {
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
	}, [exitApp]);
  
	const GetUserDataLok = async () => {
	  GetLocation.getCurrentPosition({
		enableHighAccuracy: true,
		 timeout: 15000,
	  })
		.then(location => {
		  // console.log("GPS ->" + location);
		  if(location != null && location != undefined){
			AsyncStorage.setItem('location', JSON.stringify(location));
		  }
		})
		.catch(error => {
		  const {code, message} = error;
		  console.log(code, "GPS ->" + message);
		});
	};
  
	const GetSessionLocal = async () => {    
		try{
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
		
			if(dataSessionAccess != null && dataSessionEmail != null && dataSessionName != null && dataSessionUserID != null){
			  vUri += "/Main?phone=" + dataSessionAccess + "&email=" + dataSessionEmail + "&name=" + dataSessionName + "&userid=" + dataSessionUserID;
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
			// console.log(vUri);
		}catch(e){
			console.log(e);
		}	  
	}
  
	const onMessage = (data) => {
		try{
			if(data.nativeEvent.data !== null || data.nativeEvent.data !== undefined){
				var arParam = data.nativeEvent.data.toString().split(';'); // phone;email;name;iduser;is_cs;position;emp_no
				setValue('phone', arParam[0]);
				setValue('email', arParam[1]);
				setValue('name', arParam[2]);
				setValue('userid', arParam[3]);
				setValue('is_cs', arParam[4]);
				setValue('position', arParam[5]);
				setValue('emp_no', arParam[6]);
			  }
		}catch(e){
			console.log(e);
		}
	}
  
	const setValue = async (column, value) => {
		try{
	  		await AsyncStorage.setItem(column, JSON.stringify(value));
		}catch(e){
			console.log(e);
		}
	}

	const clearAsyncStorage = async() => {
		await AsyncStorage.getAllKeys()
        .then(keys => AsyncStorage.multiRemove(keys))
        .then(() => alert('Logout Success'));
		// await AsyncStorage.clear();
	}

	return (
		<WebView 
				ref={webview}
				style={styles.container}
				source={{ uri: (urlPage !== undefined ? urlPage : vUri) }} 
				mixedContentMode="compatibility"
				onMessage={onMessage}
				onNavigationStateChange={ navState => {
					console.log("HOMEEEEEE================");
					console.log(navState.url);
					if(navState.url !== undefined){
						console.log(navState.url.toString());
					}

					if (navState.url.toString().includes("#Chat")) {
						navigation.navigate("Chat");
					}else if(navState.url.toString().includes("Logout")){
						clearAsyncStorage();
						navigation.navigate("App");
					}
				}}
			/>
	);
};

export default Home;

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

