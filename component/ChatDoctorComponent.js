import { View, Text, Pressable, Image, ToastAndroid } from "react-native";
import React, { lazy, useEffect, useLayoutEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../utils/styles.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config.js";
import getSocket from "../utils/socket";
import axios from "axios";

const ChatDoctorComponent = ({ email, username_, item }) => {
	const navigation = useNavigation();
	// const [messages, setMessages] = useState({});
	const [username, setUsername] = useState("");
	const [ImageUserChat, setImageUserChat] = useState(false);
	const [totalUnreadCount, setTotalUnreadCount] = useState(0);

	useLayoutEffect(() => {
		getUsername();
		// setMessages(item.messages[item.messages.length - 1]);
	}, []);

	const getUsername = async () => {
		try {
			let value = await AsyncStorage.getItem("email");
			const name = await AsyncStorage.getItem("name");
			value = JSON.parse(value);
			if (value !== null) {
				if (value === item.me) {
					setImageUserChat(false);
					setUsername(username_);
				} else if (value === item.to) {
					setImageUserChat(true);
					setUsername(item.me_name);
				}
			}
		} catch (e) {
			console.error("Error while loading username!");
		}
	};

	// const showToastTapStartChat = () => {
	// 	ToastAndroid.show('Tap sekali lagi untuk memulai Chat!', ToastAndroid.LONG, ToastAndroid.CENTER);
	//   };

	const showToastTapStartChatOffline = () => {
		ToastAndroid.show('Mohon Maaf Kak, Dokter sedang offline', ToastAndroid.LONG, ToastAndroid.CENTER);
	};

	const getRoomByEmailFromServer = async (email, to) => {
		let urlSVRChat = await AsyncStorage.getItem('url_svr_chat');
		urlSVRChat = urlSVRChat !== null ? JSON.parse(urlSVRChat) : null;

		return await axios
			.get(`${urlSVRChat}/api/getRoomEmail`, {
				params: {
					email: email,
					email_tujuan: to,
				},
			})
			.then((res) => {
				if (res != undefined && res != null) {
					// console.log("resultCheckExistRoom data", res.data);
					if (res.data.length > 0) {
						return res.data;
					} else {
						return 0;
					}
				}
			})
			.catch((err) => {
				console.log(err.response);
				if (err.response) {
					console.log("Error when get message");
				}
				// return "";
			});
	}


	const handleNavigationDoctor = async (email, to, to_name, to_foto, status_online) => {
		let IDRoom = null;
		if (status_online == 1) {
			if (email != null && email != "" && email != undefined && to != null && to != undefined) {
				const resultCheckExistRoom = await getRoomByEmailFromServer(email, to);
				// console.log("result return getroom", resultCheckExistRoom);

				if (resultCheckExistRoom === undefined || resultCheckExistRoom === null || resultCheckExistRoom === 0) {
					const groupChat = email + "," + username_ + "|" + to + "," + to_name + "," + to_foto;
					const socket = await getSocket();	
					socket.emit("createRoom", groupChat);
					const resultCheckExistRoom2 = await getRoomByEmailFromServer(email, to);
					if (resultCheckExistRoom2.length > 0) {
						if (resultCheckExistRoom2[0].id !== undefined && resultCheckExistRoom2[0].id !== null) {
							navigation.navigate("Messaging", {
								id: resultCheckExistRoom2[0].id,
								me: email,
								me_name: username_,
								to: to,
								to_name: to_name,
								to_foto: to_foto,
							});
						}
					} else {
						ToastAndroid.show('Tidak menemukan Room Dokter!', ToastAndroid.LONG, ToastAndroid.CENTER);
					}
				} else if (resultCheckExistRoom.length > 0) {
					if (resultCheckExistRoom[0].id !== undefined && resultCheckExistRoom[0].id !== null) {
						IDRoom = resultCheckExistRoom[0].id;
					}
				}

				if (IDRoom !== null) {
					navigation.navigate("Messaging", {
						id: IDRoom,
						me: email,
						me_name: username_,
						to: to,
						to_name: to_name,
						to_foto: to_foto,
					});
				}
			}
		} else {
			showToastTapStartChatOffline();
		}
	};

	return (
		<Pressable style={[styles.cchat, item.status_online == 1 ? styles.cchat : styles.cchatoffline]} onPress={() => handleNavigationDoctor(email, item.to, item.to_name, item.to_foto, item.status_online)}>
			{ImageUserChat ? (
				<Ionicons
					loading={lazy}
					name='person-circle-outline'
					size={45}
					color='black'
					style={styles.cavatar}
				/>
			) : (<Image
				loading={lazy}
				source={{ uri: config.url_primary + "/image/dokter/" + item.to_foto }}
				style={styles.cavatarchat} />)}

			<View style={styles.crightContainer}>
				<View>
					<Text style={styles.cusername}>{item.to_name}</Text>
					{item.status_online == 1 ? (
						<Text style={styles.cmessage}>
							Online
						</Text>
					) : (
						<Text style={styles.cmessage}>
							Offline
						</Text>
					)}
				</View>
				<View>
					{item.status_online == 1 ? (
						<Text style={styles.ctime}>
							<Ionicons
								loading={lazy}
								name='ellipse-sharp'
								size={10}
								color='#40C057'
								style={styles.cbubble}
							/>
						</Text>
					) : (
						null
					)}

				</View>
			</View>
		</Pressable>
	);
};

export default ChatDoctorComponent;
