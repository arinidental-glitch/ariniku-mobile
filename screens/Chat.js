import React, { useState, useMemo, useRef, useLayoutEffect, useEffect, useCallback, lazy } from "react";
import { View, Text, Pressable, FlatList, ToastAndroid, Image, useWindowDimensions, Alert, BackHandler } from "react-native";
import ChatDoctorComponent from "../component/ChatDoctorComponent";
import ChatComponent from "../component/ChatComponent";
import ChatForCSComponent from "../component/ChatForCSComponent";
// import SearchBarOnChatComponent from "../component/SearchBarOnChatComponent";
import getSocket from "../utils/socket";
import { styles } from "../utils/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config.js";
import axios from "axios";
import AnimatedLoader from "react-native-animated-loader";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
// import BottomSheet from '@gorhom/bottom-sheet';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
// import { ReduceMotion, useReducedMotion } from "react-native-reanimated"


const Chat = ({ navigation }) => {
	const { height, width } = useWindowDimensions();
	const [rooms, setRooms] = useState([]);
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [loading, setLoading] = useState(false);
	const [listDokter, setListDokter] = useState([]);
	const [dataCS, setDataCS] = useState([]);

	const [isCS, setCS] = useState(0);
	const [position, setPosition] = useState(0);
	const [messageStorage, setAllMessageStorage] = useState([]);
	const snapPoints = useMemo(() => ['50%', '80%', '100%'], []);
	const [exitApp, setExitApp] = useState(0);


	const [lastMessagesCS, setLastMessagesCS] = useState("");
	const [totalUnreadCount, setTotalUnreadCount] = useState(0);

	const bottomSheetModalRef = useRef(null);
	const ANIMATION_CONFIGS_IOS = {
		damping: 500,
		stiffness: 1000,
		mass: 3,
		overshootClamping: true,
		restDisplacementThreshold: 10,
		restSpeedThreshold: 10,
		// reduceMotion: ReduceMotion.Never,
	};

	const handlePresentModalPress = () => {
		bottomSheetModalRef.current?.present();
	};
	const handleSheetChanges = useCallback((index) => {
		// //console.log('handleSheetChanges', index);
	}, []);

	useLayoutEffect(() => {
		setLoading(true);
		setTimeout(() => {
			getUsername();
		}, 1000);
	}, []);

	useEffect(() => {
		try {


			// socket.on("roomsList", (rooms) => {
			// 	setRooms(rooms);
			// });

			// var self = this;
			// socket.emit('roomsList');

			getListDokter();
			getListCS();

			async function getListDokter() {
				return await axios
					.get(`${config.url_backend}/api/ariniku/chat-doctor/list`)
					.then((res) => {
						setListDokter(res.data.data);
					})
					.catch((err) => {
						//console.log(err.response);
						if (err.response) {
							//console.log("Error when get chat doctor");
						}
						// return "";
					});
			}

			async function getListCS() {
				// setLoading(true);
				return await axios
					.get(`${config.url_backend}/api/ariniku/chat-doctor/get-cs`)
					.then((res) => {
						if (res != undefined && res != null) {
							if (res.data.data.length > 0) {
								setDataCS(res.data.data);
							}
						}
					})
					.catch((err) => {
						//console.log(err.response);
						if (err.response) {
							//console.log("Error when get chat doctor");
						}
						// return "";
					});
			}


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
		} catch (e) {
			//console.log("Error while loading usernamehaha!");
		}
	}, [exitApp]);

	useEffect(() => { /////////// INISIAL AWAL LOAD MESSAGE FROM SOCKET
		try {
			const reloadInterval = setInterval(() => {
				// //console.log("loaaaaaaaaaaaaaaaaadd teruuuusss" + Date.now() + " - " + email, rooms);
				getMessageFromServer(email);
				// //console.log("isCS", isCS);
				loadMessage(isCS);
				saveMessagesFromSocketIO(email, rooms);
			}, 1000);


			setTimeout(() => {
				setLoading(false);
			}, 1000);

			if (email != undefined && email != null) {
				// getMessageFromServer(email);
				// loadMessage(isCS);
				return () => clearInterval(reloadInterval);
			}

		} catch (e) {
			//console.log("Error while loading username haha!1");
		}
	}, [loading, dataCS, listDokter, messageStorage, email, rooms]);

	// useEffect(() => { ///////////// INISTAL AWAL CHECK MESSAGE FROM RESULT ROOMS SOCKET AND THEN CHECK DB
	// 	try {
	// 		//console.log("email RESULT email ", email);
	// 		// //console.log("email RESULT messageStorage ", messageStorage);
	// 		// if (email !== null && email !== "" && email !== undefined && rooms != undefined && rooms.length > 0) {
	// 		// 	// saveMessagesFromSocketIO(email, rooms);

	// 		// 	const reloadInterval = setInterval(async () => {
	// 		// 		//console.log("MASUKKKK reloadInterval");
	// 		// 		saveMessagesFromSocketIO(email, rooms);
	// 		// 	}, 3000);
	// 		// 	return () => clearInterval(reloadInterval);
	// 		// }

	// 	} catch (e) {
	// 		//console.log("Error while loading username haha!2");
	// 	}
	// }, [loading, dataCS, listDokter, messageStorage, email, rooms]);

	const loadMessage = async (isCS) => {
		try {
			const storedMessages = await AsyncStorage.getItem('chatMessages');
			if (storedMessages != null && storedMessages != undefined && storedMessages.length > 0) {
				const parsedMessages = JSON.parse(storedMessages);
				if (isCS !== 1) { /// SEBAGAI BUKAN CS, ARTINYA SEBGAI USER
					if (parsedMessages != undefined && parsedMessages.length > 0) {
						const lastMessagesCS = parsedMessages.filter((p) => p.id.includes('room-cs'));
						// //console.log("lastMessagesCS", lastMessagesCS[0]);
						if (lastMessagesCS.length > 0 && lastMessagesCS[0].messages.length > 0) {
							const lastmessages = lastMessagesCS[0].messages[lastMessagesCS[0].messages.length - 1].text;
							const msg = lastmessages.length > 30 ? lastmessages.substring(0, 30) + "..." : lastmessages;
							const getCountUnRead = lastMessagesCS[0].messages.filter((data) => !data.read).length;
							setTotalUnreadCount(getCountUnRead);
							setLastMessagesCS(msg);
						}
					}
				}
				// //console.log("LOG MASUK Lokal DB -> ", parsedMessages);
				setAllMessageStorage(parsedMessages);
			}
		} catch (error) {
			console.error('Error loading messages from AsyncStorage:', error);
		}
	}

	const getMessageFromServer = async (email) => {
		// //console.log("getMessageFromServer");
		let urlSVRChat = await AsyncStorage.getItem('url_svr_chat');
		urlSVRChat = urlSVRChat !== null ? JSON.parse(urlSVRChat) : null;

		return await axios
			.get(`${urlSVRChat}/api`, {
				params: {
					email: email,
				},
			})
			.then((res) => {
				if (res !== undefined && res !== null) {
					// //console.log("res.data ++++++++++++++++++++++++++++++++++++++=", res.data);
					if (res.data.length > 0 && res.data[0] !== null && res.data[0] !== undefined) {
						// //console.log("----------getMessageFromServer", res.data);
						setRooms(res.data);
						// return res.data;
					}
				}
			})
			.catch((err) => {
				//console.log(err.response);
				if (err.response) {
					//console.log("Error when get message");
				}
				// return "";
			});
	}

	const saveMessagesFromSocketIO = async (email, datarooms) => {
		try {
			if (email !== null && email !== "" && datarooms !== null && datarooms !== undefined && datarooms.length > 0) {
				const messageFromSocket = datarooms.filter((room) => room.to === email || room.me === email);  /// GET DATA ONLY MY ACCOUNT
				if (messageFromSocket !== null && messageFromSocket !== undefined && messageFromSocket.length > 0) {
					const storedMessages = await AsyncStorage.getItem('chatMessages');
					if (storedMessages !== undefined && storedMessages !== null && storedMessages.length > 0) {
						const dataCheckExist = JSON.parse(storedMessages);
						if (dataCheckExist.length > 0) {
							let loopRoot = 0;
							// for (let i = 0; i < messageFromSocket.length; i++) {
							for await (const loopInduk of messageFromSocket) {
								const cMessageFromSocket = [messageFromSocket[loopRoot]];
								// const cMessageFromSocket = [loopInduk];
								if (cMessageFromSocket !== null && cMessageFromSocket.length > 0) {
									if (dataCheckExist.filter((p) => p.id === cMessageFromSocket[0].id).length === 0) { ///////////// KONDISI DATA CHAT & ROOM TIDAK ADA DI DB MAKA DIINSERT MSG BARU +++++++++++++++++++++++++++++
										// //console.log("PART 1");
										if (cMessageFromSocket.map((p) => p.messages.length > 0 ? p.messages.length : 0)[0] > 0) {
											const msgFromSocket = cMessageFromSocket.map((p) => p.messages)[0];
											const getNewMsg = msgFromSocket.map((d) => d.user === email ? { ...d, read: true } : d);

											const mergeMessageFromNew = messageFromSocket.map((data) => data.id === cMessageFromSocket[0].id && data.messages.length > 0 ? { ...data, messages: getNewMsg } : null)
											const afterCheckNull = mergeMessageFromNew.filter((p) => p !== null);
											const mergeAllMessages = [...dataCheckExist, afterCheckNull[0]];
											// //console.log("MASUK 111 -------------> ", mergeAllMessages);

											// //console.log("LOG MASUK 111 -> ", mergeAllMessages);
											setAllMessageStorage(mergeAllMessages);
											setValue('chatMessages', mergeAllMessages);
										}
									} else {
										const idPercakapanFromSocket = cMessageFromSocket[0].id;
										const getDataMsgFromDBByID = dataCheckExist.filter((p) => p.id === idPercakapanFromSocket);
										const getDataMsgFromSocketByID = messageFromSocket.filter((p) => p.id === idPercakapanFromSocket);  //// CHECK CHAT BERDASARKAN ID FROM SERVER AND DB

										if (getDataMsgFromDBByID.length > 0) {  //////////// KONDISI APABILA CHAT ORG SUDAH ADA DI DB
											// const idPercakapanFromDB = dataCheckExist[i].id;
											const idPercakapanFromDB = getDataMsgFromDBByID[0].id;
											const detailDataMsgFromDBByID = getDataMsgFromDBByID.map((p) => p.messages);
											// const getDataMsgFromSocketByID = messageFromSocket.filter((p) => p.id === idPercakapanFromDB);
											const detailDataMsgFromSocketByID = getDataMsgFromSocketByID.map((p) => p.messages);

											if (getDataMsgFromDBByID[0].messages.length <= getDataMsgFromSocketByID[0].messages.length) {
												const resultMergeNew = detailDataMsgFromSocketByID[0];
												if (getDataMsgFromDBByID[0].messages.length == 0) {
													// //console.log("PART 2");
													if (getDataMsgFromDBByID[0].messages.length == 0 && getDataMsgFromSocketByID[0].messages.length !== 0) {
														const mergeMessageFromNew = dataCheckExist.map((data) => data.id === idPercakapanFromDB && data.messages.length === 0 ? { ...data, messages: resultMergeNew } : null)
														const afterCheckNull = mergeMessageFromNew.filter((p) => p !== null);
														if (afterCheckNull.length > 0) {
															const mergeMessageAllFromNew = [...dataCheckExist.filter((p) => p.id !== idPercakapanFromDB), afterCheckNull[0]];
															if (mergeMessageAllFromNew.length > 0 && mergeMessageAllFromNew[0].id !== undefined) {
																// //console.log("LOG MASUK 222 -> ", mergeMessageAllFromNew);
																setAllMessageStorage(mergeMessageAllFromNew);
																setValue('chatMessages', mergeMessageAllFromNew);
															} else {
																// //console.log("LOG MASUK 333 -> ", mergeMessageAllFromNew);
																setAllMessageStorage(mergeMessageAllFromNew);
																setValue('chatMessages', mergeMessageAllFromNew);
															}
														}
													}
												} else { //////////////// DISINI UNTUK KONDISI APABILA ROOM SUDAH TERBUAT DAN ADA ISI CHAT YG BARU MASUK KE DALAM SINI
													// //console.log("PART 3");

													// for await(let loop = 0; loop < getDataMsgFromSocketByID[0].messages.length; loop++) {
													let loop = 0;
													for await (const dataloop of getDataMsgFromSocketByID[0].messages) {
														const checkFromDB = detailDataMsgFromDBByID[0].filter((p) => p.id == getDataMsgFromSocketByID[0].messages[loop].id);
														// const checkFromDB = detailDataMsgFromDBByID[0].filter((p) => p.id == dataloop.id);
														if (checkFromDB.length === 0) { /// PESAN YG BARU HARUS DIMASUKAN KE DB DENGAN ID detailDataMsgFromSocketByID[0][loop].id
															const mergeMessageFromNew = detailDataMsgFromSocketByID[0].filter((p) => p.id === getDataMsgFromSocketByID[0].messages[loop].id);
															// UPDATE FOR READ STATUS FOR MY SELF
															const getNewMsg = mergeMessageFromNew.map((d) => d.user === email ? { ...d, read: true } : d);
															const mergeMessageAllFromNew = [...detailDataMsgFromDBByID[0], getNewMsg[0]];
															const mergeMessageFromNewSave = dataCheckExist.map((data) => data.id === idPercakapanFromSocket && data.messages.length > 0 ? { ...data, messages: mergeMessageAllFromNew } : null)
															const afterCheckNull = mergeMessageFromNewSave.filter((p) => p !== null);
															const mergeMessageAllFromNewSave = [...dataCheckExist.filter((p) => p.id !== idPercakapanFromSocket), afterCheckNull[0]];
															// // PROSES SAVE KE DATABASE
															// //console.log("masuk part 3s");
															// //console.log("LOG MASUK 444 -> ", mergeMessageAllFromNewSave);
															setAllMessageStorage(mergeMessageAllFromNewSave);
															setValue('chatMessages', mergeMessageAllFromNewSave);
														}
														loop++;
													}
												}
											}
										}
									}
								}
								loopRoot++;
							}
						} else {
							// PROSES SAVE KE DATABASE
							// UPDATE FOR READ STATUS FOR MY SELF
							// //console.log("messageFromSocket 22222", messageFromSocket.map((p) => p.messages.length > 0 ? p.messages.length : 0)[0]);

							// if (messageFromSocket.map((p) => p.messages.length > 0 ? p.messages.length : 0)[0] > 0) {
							// 	const msgFromSocket = messageFromSocket.map((p) => p.messages);
							// 	//console.log("msgFromSocket 1 -> ", msgFromSocket);
							// 	// const getNewMsg = msgFromSocket.map((d) => d.user === email ? { ...d, read: true } : d);
							// 	// const mergeMessageFromNewSave = messageFromSocket.map((data) => data.messages.length > 0 || data.messages.length === 0 ? { ...data, messages: getNewMsg } : null)
							// 	// const afterCheckNull = mergeMessageFromNewSave.filter((p) => p !== null);
							// 	// // //console.log("MASUK 222 -------------> ", afterCheckNull);
							// 	// setAllMessageStorage(afterCheckNull);
							// 	// setValue('chatMessages', afterCheckNull);
							// }


							//if (messageFromSocket.map((p) => p.messages.length > 0 ? p.messages.length : 0)[0]) {

							let tempMessages = [];
							if (messageFromSocket.map((p) => p.messages.length > 0 ? p.messages.length : 0).length > 0) {
								const msgFromSocket = messageFromSocket.map((p) => {
									const getNewMsg = p.messages.map((d) => d.user === email ? { ...d, read: true } : d);
									const mergeMessageFromNewSave = messageFromSocket.map((data) => data.id === p.id && data.messages.length > 0 || data.id === p.id && data.messages.length === 0 ? { ...data, messages: getNewMsg } : null)
									const afterCheckNull = mergeMessageFromNewSave.filter((p) => p !== null);

									tempMessages = [...tempMessages.filter((o) => o.id !== p.id), afterCheckNull[0]];

									// //console.log("LOG MASUK 555 -> ", tempMessages);
									setAllMessageStorage(tempMessages);
									setValue('chatMessages', tempMessages);
								});
							}
						}


					} else {
						// PROSES SAVE KE DATABASE
						// UPDATE FOR READ STATUS FOR MY SELF
						// //console.log("messageFromSocket 3333", messageFromSocket.map((p) => p.messages.length > 0 ? p.messages.length : 0)[0]);
						//if (messageFromSocket.map((p) => p.messages.length > 0 ? p.messages.length : 0)[0]) {

						// //console.log("dataroom", messageFromSocket.map((p) => p.messages.length > 0 ? p.messages.length : 0).length > 0);

						let tempMessages = [];
						if (messageFromSocket.map((p) => p.messages.length > 0 ? p.messages.length : 0).length > 0) {

							const msgFromSocket = messageFromSocket.map((p) => {
								const getNewMsg = p.messages.map((d) => d.user === email ? { ...d, read: true } : d);
								const mergeMessageFromNewSave = messageFromSocket.map((data) => data.id === p.id && data.messages.length > 0 || data.id === p.id && data.messages.length === 0 ? { ...data, messages: getNewMsg } : null)
								const afterCheckNull = mergeMessageFromNewSave.filter((p) => p !== null);

								tempMessages = [...tempMessages.filter((o) => o.id !== p.id), afterCheckNull[0]];

								// //console.log("LOG MASUK 666 -> ", tempMessages);
								setAllMessageStorage(tempMessages);
								setValue('chatMessages', tempMessages);
							});
						}
					}
				}
			}
		} catch (error) {
			console.error('Error saving messages to AsyncStorage:', error);
		}
	};

	const getUsername = async () => {
		try {
			const emailc = await AsyncStorage.getItem("email");
			const name = await AsyncStorage.getItem("name");
			const cisCS = await AsyncStorage.getItem("is_cs");
			const cPosition = await AsyncStorage.getItem("position");

			if (emailc !== null && name !== null) {
				setUsername(JSON.parse(name));
				setEmail(JSON.parse(emailc));
				setCS(JSON.parse(cisCS));
				setPosition(JSON.parse(cPosition));
				// //console.log("cPosition", cPosition);
			}
		} catch (e) {
			//console.log("Error while loading usernamesss!");
		}
	};

	const setValue = async (column, value) => {
		try {
			// await AsyncStorage.clear();
			await AsyncStorage.setItem(column, JSON.stringify(value));
			// //console.log("SAVED COMPLETED");
		} catch (e) {
			//console.log(e);
		}
	}

	const showToastTapStartChat = () => {
		ToastAndroid.show('Tap sekali lagi untuk memulai Chat!', ToastAndroid.LONG, ToastAndroid.CENTER);
	};

	const getRoomByIDFromServer = async (id) => {
		//console.log("getRoomByIDFromServer", id);
		let urlSVRChat = await AsyncStorage.getItem('url_svr_chat');
		urlSVRChat = urlSVRChat !== null ? JSON.parse(urlSVRChat) : null;

		return await axios
			.get(`${urlSVRChat}/api/getRoomID`, {
				params: {
					id: id,
				},
			})
			.then((res) => {
				// //console.log("resultCheckExistRoom data", res);
				if (res != undefined && res != null) {
					//console.log("resultCheckExistRoom data", res.data);
					if (res.data.length > 0) {
						return res.data.length;
					} else {
						return 0;
					}
				}
			})
			.catch((err) => {
				//console.log(err.response);
				if (err.response) {
					//console.log("Error when get message");
				}
				// return "";
			});
	}

	const calculateTotalUnreadCount = () => {
		if (item !== null && item !== "") {
			const getCountUnRead = item.messages.filter((data) => !data.read).length;
			setTotalUnreadCount(getCountUnRead);
		}
	};

	const handlePressRead = async (id) => {
		/// PROSES AMBIL MESSAGE BERDASARKAN ID CHAT PERSONAL
		const storedMessages = await AsyncStorage.getItem('chatMessages');
		const dataCheckExist = JSON.parse(storedMessages);
		if (dataCheckExist !== null && dataCheckExist !== undefined && dataCheckExist.length > 0 && dataCheckExist[0] !== undefined) {
			const from = dataCheckExist.filter((data) => data.id === id);
			if (from !== null && from !== undefined && from.length > 0) {
				const updatedMessages_fixed = [{
					...from[0], messages: from.map((data) =>
						data.messages.map((msg) => msg.read !== true ? { ...msg, read: true } : msg))[0]
				}];
				/// PROSES PENGGABUNGAN ANTARA CHAT LAMA DENGAN CHAT YG SUDAH DIUPDATE STATUS READNYA !
				const mergeMessages = [...dataCheckExist.filter((data) => data.id !== id), updatedMessages_fixed[0]];
				// PROSES SAVE KE DATABASE

				// //console.log("LOG MASUK 777 -> ", mergeMessages);
				setAllMessageStorage(mergeMessages);
				setValue('chatMessages', mergeMessages);
			}
		}
	};

	const handleNavigationCS = async (email) => {
		//console.log("handleNavigationCS ", email);
		//console.log("dataCS[0].email ", dataCS[0].email);
		if (email != null && email != "" && email != undefined && dataCS[0].email != null && dataCS[0].email != undefined) {
			const resultCheckExistRoom = await getRoomByIDFromServer("room-cs-" + email + "-" + dataCS[0].email);
			// //console.log("getRoomByIDFromServer", resultCheckExistRoom);

			if (resultCheckExistRoom === undefined || resultCheckExistRoom === null || resultCheckExistRoom === 0) {
				const groupChat = email + "," + username + "|" + dataCS[0].email + "," + "Customer Service" + ",";
				const socket = await getSocket();

				socket.emit("createRoomCS", groupChat);
			}

			handlePressRead("room-cs-" + email + "-" + dataCS[0].email);

			navigation.navigate("Messaging", {
				id: "room-cs-" + email + "-" + dataCS[0].email,
				me: email,
				me_name: username,
				to: dataCS[0].email,
				to_name: "Customer Service",
				to_foto: "",
			});
		}
	};
	return (
		<GestureHandlerRootView style={styles.chatscreen} >
			<ScrollView style={styles.chatscreen}
				alwaysBounceVertical={true}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				showsHorizontalScrollIndicator={false}
			>
				{loading ? (
					<AnimatedLoader
						visible={true}
						overlayColor="rgba(255,255,255,0.75)"
						source={require("../utils/Loading-Animation-Bubble4.json")}
						animationStyle={styles.lottie}
						speed={1}
					>
					</AnimatedLoader>
				) : (
					<View style={styles.chatscreen}>
						{email ? (
							<View style={styles.chatlistContainer}>
								{isCS != 1 && position != 1 ? ( 					//////////// KONDISI UNTUK USER
									<View style={styles.chatlistContainerView}>
										<Pressable style={styles.cchat} onPress={() => handleNavigationCS(email)}>
											<Ionicons
												name='headset-outline'
												loading={lazy}
												size={45}
												color='black'
												style={styles.cavatar}
											/>
											<View style={styles.crightContainer}>
												<View>
													<Text style={styles.cusername}>Customer Service</Text>{/*
													<Text style={styles.cmessage}>
														{lastMessagesCS ? lastMessagesCS : "Tap to start chatting"}
													</Text> */}

													{totalUnreadCount > 0 ? (
														<Text style={styles.cmessage_newchat} >{lastMessagesCS ? lastMessagesCS : "Tap to start chatting"}</Text>
													) : (
														<Text style={styles.cmessage}>{lastMessagesCS ? lastMessagesCS : "Tap to start chatting"}</Text>
													)}

												</View>
												<View>
													<Text style={styles.ctime}>
														<Ionicons
															loading={lazy}
															name='ellipse-sharp'
															size={10}
															color='#40C057'
															style={styles.cbubble}
														/>
													</Text>
												</View>
												{totalUnreadCount > 0 ? (
													<View style={{ position: 'absolute', top: 25, right: 0, backgroundColor: '#18dce4', borderRadius: 25, padding: 5, textAlign: 'center' }}>
														<Text style={styles.ctotal_newchat}>{totalUnreadCount}</Text>
													</View>
												) : null}
											</View>
										</Pressable>
										<View style={{ marginBottom: 10 }}>
											<Text >
												Online Consultation
											</Text>
										</View>
										<Pressable style={styles.cchat} onPress={handlePresentModalPress}>
											<Ionicons
												name='chatbubbles-outline'
												loading={lazy}
												size={45}
												color='black'
												style={styles.cavatar}
											/>
											<View style={styles.crightContainer}>
												<View>
													<Text style={styles.cusername}>Our Doctor</Text>
													<Text style={styles.cmessage}>
														Tap to choose a Doctor
													</Text>
												</View>
												<View>
													<Text style={styles.ctime}>
														<Ionicons
															loading={lazy}
															name='ellipse-sharp'
															size={10}
															color='#40C057'
															style={styles.cbubble}
														/>
													</Text>
												</View>
											</View>
										</Pressable>
										<ScrollView nestedScrollEnabled={true}
											alwaysBounceVertical={true}
											style={styles.chatscreenScrollView}
											scrollEventThrottle={16}
											showsVerticalScrollIndicator={false}
											showsHorizontalScrollIndicator={false}
											contentContainerStyle={{
												flexGrow: 1,
												justifyContent: 'center',
												width: '100%',
											}}>
											<View style={styles.chatlistContainerView}>
												<ScrollView horizontal={true} contentContainerStyle={{
													flexGrow: 1,
													justifyContent: 'center',
													width: '100%',
												}}
												>

													{messageStorage != undefined && messageStorage.length > 0 && messageStorage.filter((room) => room.to === email && room.messages.length > 0 || room.me === email && room.messages.length > 0).length > 0 ? (
														<FlatList
															style={{ marginBottom: 270 }}
															showsHorizontalScrollIndicator={false}
															showsVerticalScrollIndicator={false}
															data={messageStorage.filter((room) => room.to === email && room.me_name !== 'Customer Service' && room.messages.length > 0 || room.me === email && room.to_name !== 'Customer Service' && room.messages.length > 0).sort((a, b) => (a.messages.length > 0 ? a.messages[a.messages.length - 1].datechat : 0) < (b.messages.length > 0 ? b.messages[b.messages.length - 1].datechat : 0) ? 1 : -1)}
															renderItem={({ item }) => <ChatComponent email={email} username_={username} item={item} />}
															keyExtractor={(item) => item.id}
														/>
													) : null}

												</ScrollView>
											</View>
										</ScrollView>

									</View>
								) : ( 										////////////// KONDISI UNTUK CS & DR
									<View style={styles.chatlistContainerView}>
										<ScrollView nestedScrollEnabled={true}
											alwaysBounceVertical={true}
											style={styles.chatscreenScrollView}
											scrollEventThrottle={16}
											showsVerticalScrollIndicator={false}
											showsHorizontalScrollIndicator={false}
											contentContainerStyle={{
												flexGrow: 1,
												justifyContent: 'center',
												width: '100%',
											}}>
											<View style={styles.chatlistContainerView}>
												<ScrollView horizontal={true} contentContainerStyle={{
													flexGrow: 1,
													justifyContent: 'center',
													width: '100%',
												}}
												>
													{messageStorage != undefined && messageStorage.length > 0 && messageStorage.filter((room) => room.to === email && room.messages.length > 0 || room.me === email && room.messages.length > 0).length > 0 ? (
														<FlatList
															// ListHeaderComponent={this.SearchBarOnChatComponent}
															style={{ marginBottom: 270 }}
															showsHorizontalScrollIndicator={false}
															showsVerticalScrollIndicator={false}
															data={messageStorage.filter((room) => room.to === email && room.messages.length > 0 || room.me === email && room.messages.length > 0).sort((a, b) => (a.messages.length > 0 ? a.messages[a.messages.length - 1].datechat : 0) < (b.messages.length > 0 ? b.messages[b.messages.length - 1].datechat : 0) ? 1 : -1)}
															renderItem={({ item }) => <ChatForCSComponent email={email} username_={username} item={item} />}
															keyExtractor={(item) => item.id}
														/>
													) : (
														<View style={styles.chatemptyContainer}>
															<Image loading={lazy} source={require('../assets/icon_chat_empty_fixed.png')} style={{ width: 140, height: 140 }} />
															<Text style={styles.chatemptyText}>Chat kosong!</Text>
														</View>
													)}
												</ScrollView>
											</View>
										</ScrollView>
									</View>
								)}
							</View>

						) : (
							<View style={styles.chatemptyContainer}>
								<Image loading={lazy} source={require('../assets/icon_chat_empty_fixed.png')} style={{ width: 140, height: 140 }} />
								<Text style={styles.chatemptyText}>Chat kosong!</Text>

								{/* <Text>Click the icon above to create a Chat Doctor</Text> */}
							</View>
						)}
						{/* <Pressable style={styles.floatBtnChat} onPress={handleCreateGroup}>
					<Ionicons
					name='chatbubble-ellipses-outline'
					size={40}
					color='white'
					/>
				</Pressable> */}
						{/* {isCS != 1 && position != 1 ? (  */}
						{/* {visible ? <Modal setVisible={setVisible} email={email} username={username}  /> : ""}				 */}
					</View>
				)}

				<BottomSheetModalProvider
					style={styles.modalDoctor} >
					<BottomSheetModal
						ref={bottomSheetModalRef}
						index={1}
						snapPoints={snapPoints}
						enableOverDrag
						enablePanDownToClose
						onChange={handleSheetChanges}
					// animationConfigs={ANIMATION_CONFIGS_IOS}
					>
						<ScrollView nestedScrollEnabled={true}
							alwaysBounceVertical={true}
							scrollEventThrottle={16}
							showsVerticalScrollIndicator={false}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{
								flexGrow: 1,
								justifyContent: 'center',
								width: '100%',
							}}>
							{/* <View> */}
							<ScrollView horizontal={true} contentContainerStyle={{
								flexGrow: 1,
								justifyContent: 'center',
								width: '100%'
							}}
							>
								{listDokter != null && listDokter.length > 0 ? (
									<FlatList
										showsHorizontalScrollIndicator={false}
										showsVerticalScrollIndicator={false}
										data={listDokter}
										renderItem={({ item }) => <ChatDoctorComponent email={email} username_={username} item={item} />}
										keyExtractor={(item) => item.to}
									/>
								) : (
									<View style={styles.chatemptyContainer}>
										<Text>Maaf Kak, saat ini sedang tidak ada Dokter online </Text>
									</View>
								)}
							</ScrollView>
						</ScrollView>
					</BottomSheetModal>
				</BottomSheetModalProvider>
			</ScrollView>
		</GestureHandlerRootView>
	);

	// return (
	// 	<AnimatedLoader
	//         visible={true}
	//         overlayColor="rgba(255,255,255,0.75)"
	//         source={require("../utils/Loading-Animation-Bubble4.json")}
	//         animationStyle={styles.lottie}
	//         speed={1}
	//       >
	//         <Text>Doing something...</Text>
	//       </AnimatedLoader>

	// );

};

export default Chat;