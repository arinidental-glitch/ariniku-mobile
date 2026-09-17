import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import { View, TextInput, FlatList, Pressable, ActivityIndicator, BackHandler, Platform } from "react-native";
import getSocket from "../utils/socket";
import MessageComponent from "../component/MessageComponent";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../utils/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config.js";
import axios from "axios";
import AnimatedLoader from "react-native-animated-loader";

function Messaging({ route, navigation }) {
	const [user, setUser] = useState("");
	const [name, setName] = useState("");
	const { me, me_name, to, to_name, to_foto, id } = route.params;
	const [chatMessages, setChatMessages] = useState([]);
	const [messages, setMessage] = useState("");
	const flatlistRef = useRef(null);
	const [usernameTitle, setUsername] = useState("");
	const [tokenServer, setTokenServer] = useState("");
	const [tokenClient, setTokenClient] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingPage, setLoadingPage] = useState(false);

	useLayoutEffect(() => {
		setLoadingPage(true);
		getUsername();

		const backAction = () => {
			navigation.goBack();			
			return true;
		};

		const backHandler = BackHandler.addEventListener(
			"hardwareBackPress",
			backAction
		);

		return () => backHandler.remove();
	}, []);

	useEffect(() => {
		if (id != "" && id != null && id != undefined) {
			 const init = async () => {
				const socket = await getSocket();
				if (socket) {
					socket.emit("findRoom", id);
					socket.on("foundRoom", (roomChats) => prosesSetNewChat(roomChats));
				}
			};
			init();
		}
	});

	// AMBIL TOKEN UNTUK TUJUAN CLIENT CHAT
	async function getTokenFirebase(email, token) {
		return await axios
			.get(`${config.url_backend}/api/ariniku/chat-doctor/refresh-token/`, {
				params: {
					email: email,
					token: token,
				},
			})
			.then((res) => {
				// console.log(email, res.data.data[0].token_notif_fb);
				setTokenClient(res.data.data[0].token_notif_fb);
				setValue('token_server', res.data.data[0].token_server);
			})
			.catch((err) => {
				console.log(err.response);
				if (err.response) {
					console.log("Error when get token firebase");
				}
			});
	}

	async function saveChatToServer(room_id, me, me_name, chat_to, chat_to_name, message_chat) {
		if (room_id != null && me_name != null && chat_to_name != null && message_chat != null) {
			setLoading(true);
			const headers = { 'Content-Type': `application/json` };
			const dataBody = {
				"room_id": room_id,
				"me": me,
				"me_name": me_name,
				"chat_to": chat_to,
				"chat_to_name": chat_to_name,
				"message_chat": message_chat,
			};

			return await axios
				.post(`${config.url_backend}/api/ariniku/chat-doctor/save-chat`, dataBody, { headers })
				.then((res) => {
					setLoading(false);
				})
				.catch((err) => {
					setLoading(false);
					if (err.response) {
						console.log("Error when get message");
					}
				});
		}
	}

	const getUsername = async () => {
		try {
			// console.log("getUsername");
			let email = await AsyncStorage.getItem("email");
			let name = await AsyncStorage.getItem("name");
			let tokenServerLocal = await AsyncStorage.getItem("token_server");
			email = JSON.parse(email);
			name = JSON.parse(name);
			tokenServerLocal = JSON.parse(tokenServerLocal);

			if (email !== null) {
				setUser(email);
				setTokenServer(tokenServerLocal);
				if (email === me) {
					getTokenFirebase(to, null);
					setName(me_name);
					setUsername(to_name);
					navigation.setOptions({ title: to_name });
				} else if (email === to) {
					getTokenFirebase(me, null);
					setName(to_name);
					setUsername(me_name);
					navigation.setOptions({ title: me_name });
				}

				// if(email != "" && email != null && email != undefined){
				// 	async function getMessageFromServer() {	
				// 		return await axios
				// 			.get(`${config.url}/api`, {
				// 				params: {
				// 				email: email,
				// 				},
				// 			})
				// 			.then((res) => {
				// 				const dataRoom = res.data;
				// 				if(dataRoom !== undefined && dataRoom.length > 0){
				// 					let getID = dataRoom.filter((room) => room.to === me && room.me === to || room.me === me && room.to === to);
				// 					if(getID !== null && getID !== undefined && getID.length > 0){
				// 						setID(getID[0].id);
				// 					}else{
				// 						// const groupChat = email + "," + name + "|" + to + "," + to_name + "," + "";
				// 						// console.log("groupChat", groupChat);
				// 						// socket.emit("createRoom", groupChat);
				// 					}
				// 				}								
				// 				setLoadingPage(false);
				// 			})
				// 			.catch((err) => {
				// 				setLoadingPage(false);
				// 				console.log(err.response);
				// 				if (err.response) {
				// 				console.log("Error when get message");
				// 				}
				// 				// return "";
				// 			});
				// 	}				

				// 	if(email !== null || email !== ""|| email !== undefined){
				// 		getMessageFromServer(email);
				// 	}
				// }
			}

			setLoadingPage(false);
		} catch (e) {
			console.error("Error while loading username!");
		}
	};

	const handleNewMessage = async () => {
		const hour =
			new Date().getHours() < 10
				? `0${new Date().getHours()}`
				: `${new Date().getHours()}`;

		const mins =
			new Date().getMinutes() < 10
				? `0${new Date().getMinutes()}`
				: `${new Date().getMinutes()}`;

		// console.log("HANDLE MESSAGE ID ", id);
		// console.log("HANDLE MESSAGE BODY ", user);
		if (user && id != "" && messages != null && messages != "") {
			sendNotificationFirebase(tokenServer, tokenClient, name, messages);	
			const socket = await getSocket();		
			socket.emit("newMessage", {
				messages,
				room_id: id,
				user,
				timestamp: { hour, mins }
			});			
			saveChatToServer(id, me, me_name, to, to_name, messages);
			setMessage('');
			flatlistRef.current?.scrollToEnd();

		}
	};

	const handleNewMessageAllChatBackup = async () => {
		
		   for (let i = 0; i < dataMessages.length; i++) {
			let idnew = dataMessages[i].id;
			let user = dataMessages[i].user;
			let usernamenew = dataMessages[i].username;
			let tonew = dataMessages[i].to;
			let messages = dataMessages[i].message;
			let to_name = dataMessages[i].to_name;
			let to_foto = dataMessages[i].to_foto;
	
			// const groupChat = user + "," + usernamenew + "|" + tonew + "," + "Customer Service" + ",";
			// socket.emit("createRoomCS", groupChat);

			// const groupChat = user + "," + usernamenew + "|" + tonew + "," + to_name + "," + to_foto;
			// 		socket.emit("createRoom", groupChat);
	
			const hour =
				new Date().getHours() < 10
					? `0${new Date().getHours()}`
					: `${new Date().getHours()}`;
	
			const mins =
				new Date().getMinutes() < 10
					? `0${new Date().getMinutes()}`
					: `${new Date().getMinutes()}`;
	
					// console.log(messages);
	
			if (user && idnew != "" && messages != null && messages != "") {
				// sendNotificationFirebase(tokenServer, tokenClient, name, messages);
				setMessage('');
				const socket = await getSocket();	
				socket.emit("newMessage", {
					messages,
					room_id: idnew,
					user,
					timestamp: { hour, mins }
				});
	
				flatlistRef.current?.scrollToEnd();
			}

		   }
		
	};

	const prosesSetNewChat = (chat) => {
		setChatMessages(chat);
	}

	async function sendNotificationFirebase(tokenServer, tokenClient, name, messages) {
		if (tokenServer != null && tokenClient != null && name != null && messages != null ||
			tokenServer != undefined && tokenClient != undefined && name != undefined && messages != undefined) {
			setLoading(true);
			const headers = { 'Authorization': `Bearer ${tokenServer}` };
			const dataBody = {
				"message": {
					"token": tokenClient,
					"notification": {
						body: messages,
						title: name
					}
				}
			};

			return await axios
				.post(`${config.url_fcm}`, dataBody, { headers })
				.then((res) => {
					// console.log("result + sendNOTIF", res.data);
					// console.log("result + dataBody", dataBody);
					setLoading(false);
				})
				.catch((err) => {
					setLoading(false);
					// console.log("ERRORRR NIH ->>>>>>>>>>>>>>>>>>>>>>>>>>>>", err.response.data);
					// console.log(err.response);
					if (err.response) {
						console.log("Error when get message");
					}
				});
		}
	}

	const setValue = async (column, value) => {
		try {
			await AsyncStorage.setItem(column, JSON.stringify(value));
		} catch (e) {
			console.log(e);
		}
	}

	return (
		<View style={styles.messagingscreen}>
			{loadingPage ? (
				<AnimatedLoader
					visible={true}
					overlayColor="rgba(255,255,255,0.75)"
					source={require("../utils/Loading-Animation-Bubble4.json")}
					animationStyle={styles.lottie}
					speed={1}
				>
				</AnimatedLoader>
			) : (
				<View style={styles.messagingscreen}>
					<View
						style={[
							styles.messagingscreen,
							{ paddingVertical: 15, paddingHorizontal: 10 },
						]}
					>
						{chatMessages[0] ? (
							<FlatList
								ref={flatlistRef}
								showsHorizontalScrollIndicator={false}
								showsVerticalScrollIndicator={false}
								data={chatMessages}
								// reference={(ref) => this.flatListRef = ref}
								renderItem={({ item }) => (
									<MessageComponent item={item} user={user} from={usernameTitle} />
								)}
								keyExtractor={(item) => item.id}
								inverted contentContainerStyle={{ flexDirection: 'column-reverse' }}
							/>
						) : (
							""
						)}
					</View>

					<View style={styles.messaginginputContainer}>
						<TextInput
							value={messages}
							style={styles.messaginginput}
							placeholder="Type a message"
							onChangeText={(value) => setMessage(value)}
						/>
						<Pressable
							// style={styles.messagingbuttonContainer}
							style={({ pressed }) => [pressed ? styles.messagingbuttonContainerPressed : styles.messagingbuttonContainer, styles.btn]}
							onPress={handleNewMessage} >
							{loading ? (
								<ActivityIndicator size="large" color="#ffffff" />
							) : (<View>
								{/* <Text style={{ color: "#f2f0f1", fontSize: 15, fontWeight: "bold" }}>SEND</Text> */}
								<Ionicons
									name='send'
									size={30}
									color='white'
								/>
							</View>)}

						</Pressable>
					</View>
				</View>
			)}

		</View>
	);
};

export default Messaging;
