// utils/socket.js
import { io } from "socket.io-client";
import AsyncStorage from '@react-native-async-storage/async-storage';

let socketInstance = null;

const getSocket = async () => {
  if (socketInstance) return socketInstance;

  try {
    let urlSVRChat = await AsyncStorage.getItem('url_svr_chat');
    urlSVRChat = urlSVRChat !== null ? JSON.parse(urlSVRChat) : null;

    if (!urlSVRChat) {
      console.warn('url_svr_chat not found, socket not connected');
      return null;
    }

    socketInstance = io.connect(urlSVRChat);
    return socketInstance;
  } catch (err) {
    console.error('Failed to initialize socket:', err);
    return null;
  }
};

export default getSocket;
