import { View, Text, Pressable, Image } from "react-native";
import React, { lazy, useEffect, useLayoutEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import moment from 'moment';
import 'moment/locale/id';
import { styles } from "../utils/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config.js";

const ChatComponent = ({ email, username_, item }) => {
	const navigation = useNavigation();
	const [messages, setMessages] = useState();
	const [username, setUsername] = useState("");
	const [ImageUserChat, setImageUserChat] = useState(false);
	const [NewChat, setNewChat] = useState(false);
	const [totalUnreadCount, setTotalUnreadCount] = useState(0);

	const [lastMessageTime, setLastMessageTime] = useState("");


	const [newMsg, setNewMsg] = useState([]);

	useLayoutEffect(() => {
		loadMessage();
		getUsername();
	}, []);

	useEffect(() => {
		try {
			// console.log("useEffect ChatComponent->", Date.now());			

			const reloadInterval = setInterval(() => {
				// console.log("newMsg", newMsg);
				loadMessage();
				if (item !== null && item !== undefined) {
					if (newMsg !== undefined && newMsg.length > 0) {

						// console.log("reload interval ID ->", item.id);
						// console.log("reload interval ITEM ->", item);
						const AllChat = newMsg.filter((p) => p.id === item.id);

						if (AllChat.length > 0 && AllChat[0].messages.length > 0) {
							const lastmessages = AllChat[0].messages[AllChat[0].messages.length - 1].text;
							const msg = lastmessages.length > 30 ? lastmessages.substring(0, 30) + "..." : lastmessages;
							setMessages(msg);
							const lasttime = moment(AllChat[0].messages[AllChat[0].messages.length - 1].datechat).fromNow();
							const time = lasttime.length > 15 ? lasttime.substring(0, 15) + "..." : lasttime;
							setLastMessageTime(time);
						}
						calculateTotalUnreadCount();
					}
				}

			}, 1000);
			return () => clearInterval(reloadInterval);

		} catch (e) {
			console.log("Error while loading usernamebabba!");
		}
	}, [messages, newMsg]);


	const calculateTotalUnreadCount = () => {
		if (item !== null && item !== "") {
			const getCountUnRead = item.messages.filter((data) => !data.read).length;
			setTotalUnreadCount(getCountUnRead);
		}
	};


	const getUsername = async () => {
		try {
			let value = await AsyncStorage.getItem("email");
			value = JSON.parse(value);
			if (value !== null) {
				if (value === item.me) {
					setImageUserChat(false);
					const toname = item.to_name.length > 20 ? item.to_name.substring(0, 20) + "..." : item.to_name;
					setUsername(toname);
				} else if (value === item.to) {
					setImageUserChat(true);
					const mename = item.me_name.length > 20 ? item.me_name.substring(0, 20) + "..." : item.me_name;
					setUsername(mename);
				}
			}
		} catch (e) {
			console.error("Error while loading usernamekaka!");
		}
	};

	const setValue = async (column, value) => {
		try {
			// await AsyncStorage.clear();
			await AsyncStorage.setItem(column, JSON.stringify(value));
			// console.log("SAVED COMPLETED");
		} catch (e) {
			console.log(e);
		}
	}

	const loadMessage = async () => {
		try {
			const storedMessages = await AsyncStorage.getItem('chatMessages');
			if (storedMessages != null && storedMessages != undefined && storedMessages.length > 0) {
				const parsedMessages = JSON.parse(storedMessages);
				const lastMessagesCS = parsedMessages.filter((p) => !p.id.includes('room-cs'));
				setNewMsg(lastMessagesCS);
			}
		} catch (error) {
			console.error('Error loading messages from AsyncStorage:', error);
		}
	}

	const handlePressRead = async (id) => {
		/// PROSES AMBIL MESSAGE BERDASARKAN ID CHAT PERSONAL
		const storedMessages = await AsyncStorage.getItem('chatMessages');
		const dataCheckExist = JSON.parse(storedMessages);
		if(dataCheckExist !== null && dataCheckExist !== undefined && dataCheckExist.length > 0 && dataCheckExist[0] !== undefined){
			const from = dataCheckExist.filter((data) => data.id === id);
			if (from !== null && from !== undefined && from.length > 0) {
				const updatedMessages_fixed = [{
					...from[0], messages: from.map((data) =>
						data.messages.map((msg) => msg.read !== true ? { ...msg, read: true } : msg))[0]
				}];
				/// PROSES PENGGABUNGAN ANTARA CHAT LAMA DENGAN CHAT YG SUDAH DIUPDATE STATUS READNYA !
				const mergeMessages = [...dataCheckExist.filter((data) => data.id !== id), updatedMessages_fixed[0]];
				// PROSES SAVE KE DATABASE
				setValue('chatMessages', mergeMessages);
			}
		}
	};

	const handleNavigation = (messageId) => {
		handlePressRead(messageId);
		navigation.navigate("Messaging", {
			id: messageId,
			me: item.me,
			me_name: item.me_name,
			to: item.to,
			to_name: item.to_name,
			to_foto: item.to_foto,
		});
	};

	return (
		<Pressable style={styles.cchat} onPress={() => handleNavigation(item.id)}>
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
					<Text style={styles.cusername}>{username}</Text>
					{totalUnreadCount > 0 ? (
						<Text style={styles.cmessage_newchat} >{messages ? messages : "Tap to start chatting"}</Text>
					) : (
						<Text style={styles.cmessage}>{messages ? messages : "Tap to start chatting"}</Text>
					)}
				</View>
				<View>
					{totalUnreadCount > 0 ? (
						<Text style={styles.ctime_newchat} >{lastMessageTime ? lastMessageTime + '' : "now"}</Text>
					) : (
						<Text style={styles.ctime}>{lastMessageTime ? lastMessageTime + '' : "now"}</Text>
					)}
				</View>
				{totalUnreadCount > 0 ? (
					<View style={{ position: 'absolute', top: 25, right: 0, backgroundColor: '#18dce4', borderRadius: 25, padding: 5, textAlign: 'center' }}>
						<Text style={styles.ctotal_newchat}>{totalUnreadCount}</Text>
					</View>
				) : null}

			</View>
		</Pressable>
	);
};

export default ChatComponent;
