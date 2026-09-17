import React, { useEffect, useState } from 'react';
import { StyleSheet, Alert, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GetLocation from 'react-native-get-location';
import config from './config.js';



export default function App() {

  const [urlPage, setStateURL] = useState("");
  var vUri = config.url;  

  useEffect(() => {    
    setTimeout(() => {
      GetSessionLocal();
      GetUserDataLok();
    }, 100);
  });

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Arini Dental Clinic", "Apakah Anda yakin ingin keluar dari Aplikasi?", [
        {
          text: "Tidak",
          onPress: () => null,
          style: "cancel"
        },
        { text: "Ya", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

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
    let dataSessionAccess = await AsyncStorage.getItem('phone');
    let dataSessionEmail = await AsyncStorage.getItem('email');
    let dataSessionName = await AsyncStorage.getItem('name');
    let dataSessionUserID = await AsyncStorage.getItem('userid');
    dataSessionAccess = dataSessionAccess !== null ? JSON.parse(dataSessionAccess) : null;
    dataSessionEmail = dataSessionEmail !== null ? JSON.parse(dataSessionEmail) : null;
    dataSessionName = dataSessionName !== null ? JSON.parse(dataSessionName) : null;
    dataSessionUserID = dataSessionUserID !== null ? JSON.parse(dataSessionUserID) : null;

    if(dataSessionAccess != null && dataSessionEmail != null && dataSessionName != null && dataSessionUserID != null)
    vUri += "/Main?phone=" + dataSessionAccess + "&email=" + dataSessionEmail + "&name=" + dataSessionName + "&userid=" + dataSessionUserID;
    
    setStateURL(vUri);
    // console.log(vUri);
  }

  const onMessage = (data) => {
    if(data.nativeEvent.data !== null || data.nativeEvent.data !== undefined){
      var arParam = data.nativeEvent.data.toString().split(';'); // phone;email;name;iduser
      // console.log(data.nativeEvent.data);
      setValue('phone', arParam[0]);
      setValue('email', arParam[1]);
      setValue('name', arParam[2]);
      setValue('userid', arParam[3]);
    }
  }

  const setValue = async (column, value) => {
    await AsyncStorage.setItem(column, JSON.stringify(value));
  }

  return (
  <WebView 
    style={styles.container}
    source={{ uri: (urlPage !== undefined ? urlPage : vUri) }} 
    mixedContentMode="compatibility"
    onMessage={onMessage}
  />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
