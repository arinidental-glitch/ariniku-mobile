import React, { useState, useMemo, useRef, useLayoutEffect, useEffect, useCallback, lazy } from "react";
import { View, Text, Pressable, SafeAreaView, FlatList, ToastAndroid, Image, useWindowDimensions, Animated } from "react-native";
import ChatDoctorComponent from "../component/ChatDoctorComponent";
import ChatComponent from "../component/ChatComponent";
import socket from "../utils/socket";
import { styles } from "../utils/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../config.js";
import axios from "axios";
import AnimatedLoader from "react-native-animated-loader";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
// import BottomSheet from '@gorhom/bottom-sheet';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ReduceMotion, useReducedMotion } from "react-native-reanimated"


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
		// console.log('handleSheetChanges', index);
	}, []);

	useLayoutEffect(() => {
		setLoading(true);


		// loadMessage();
	}, []);

	useEffect(() => {
		console.log("useEffect 1 running");
		setTimeout(() => {
			getUsername();
		}, 1500);

		socket.on("roomsList", (rooms) => {
			setRooms(rooms);
		});

		var self = this;
		socket.emit('roomsList');

		getListDokter();
		getListCS();

		async function getListDokter() {
			return await axios
				.get(`${config.url_backend}/api/ariniku/chat-doctor/list`)
				.then((res) => {
					setListDokter(res.data.data);
				})
				.catch((err) => {
					console.log(err.response);
					if (err.response) {
						console.log("Error when get chat doctor");
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
					console.log(err.response);
					if (err.response) {
						console.log("Error when get chat doctor");
					}
					// return "";
				});
		}

		setTimeout(() => {
			setLoading(false);
		}, 2000)
	}, []);

	// useEffect(() => {

	// 	console.log("useEffect SaveMessage running");
	// 	// saveMessagesFromSocketIO();
	// }, [rooms, email]);

	useEffect(() => {
		try {
			// loadMessage();

			if (email !== null && email !== "" && email !== undefined) {
				async function getMessageFromServer() {
					return await axios
						.get(`${config.url}/api`, {
							params: {
								email: email,
							},
						})
						.then((res) => {
							if (res != undefined && res != null) {
								// console.log(res.data);
								if (res.data.length > 0) {
									console.log("----------getMessageFromServer", res.data);
									setRooms(res.data);
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

				if (email !== null || email !== "" || email !== undefined) {
					getMessageFromServer(email);
					saveMessagesFromSocketIO();
				}

				const reloadInterval = setInterval(() => {
					// const sec =
					// new Date().getSeconds() < 10
					// 	? `0${new Date().getSeconds()}`
					// 	: `${new Date().getSeconds()}`;
					// console.log(email);

					if (email !== null && email !== "" && email !== undefined) {
						getMessageFromServer(email);
						saveMessagesFromSocketIO();
					}

				}, 3000);


				setLoading(false);

				return () => clearInterval(reloadInterval);
			}
		} catch (e) {
			console.log("Error while loading usernamehaha!");
		}
	}, [loading, dataCS, messageStorage]);

	const loadMessage = async () => {
		try {
			const storedMessages = await AsyncStorage.getItem('chatMessages');
			if (storedMessages != null && storedMessages != undefined && storedMessages.length > 0) {
				const parsedMessages = JSON.parse(storedMessages);
				setAllMessageStorage(parsedMessages);
			}
		} catch (error) {
			console.error('Error loading messages from AsyncStorage:', error);
		}
	}

	const saveMessagesFromSocketIO = async () => {
		try {
			console.log("saveMessagesFromSocketIO " + Date.now(), rooms);
			if (email !== null && email !== "" && rooms !== null && rooms !== undefined && rooms.length > 0) {
				const messageFromSocket = rooms.filter((room) => room.to === email || room.me === email);  /// GET DATA ONLY MY ACCOUNT

				if (messageFromSocket !== null && messageFromSocket !== undefined && messageFromSocket.length > 0) {
					const storedMessages = await AsyncStorage.getItem('chatMessages');
					// console.log("rooms", storedMessages);

					if (storedMessages !== undefined && storedMessages !== null && storedMessages.length > 0) {
						const dataCheckExist = JSON.parse(storedMessages);

						if (dataCheckExist.length > 0) {
							const alreadyID = dataCheckExist.map((db) => db.messages.map((d) => d.id));
							let dataIDExisting = [];

							// if(alreadyID.length == 1 && alreadyID[0].length === 0){

							console.log("MASUK KONDISI alreadyID 1", alreadyID);
							// }


							if (alreadyID.length > 0 && alreadyID[0].length > 0) {
								// console.log("alreadyID", alreadyID);
								alreadyID.map((data) => {
									data.map((d) => {
										dataIDExisting = [...dataIDExisting, d];
									})
								});

								const getNewMsg2 = messageFromSocket.map((msg) =>
									msg.messages.map((d) =>
										dataIDExisting.filter((f) => f === d.id).length > 0 ? null : d
									)
								)[0].filter((val) => val !== null);

								/// UPDATE STATUS READ TRUE BECAUSE CHAT FROM SELF
								const getNewMsg = getNewMsg2.map((d) => d.user === email ? { ...d, read: true } : d);

								if (getNewMsg.length > 0) {


									const getIDPersonal = messageFromSocket.map((msg) =>
										msg.messages.map((d) =>
											dataIDExisting.filter((f) => f === d.id).length > 0 ? null : msg.id
										)
									)[0].filter((val) => val !== null)[0];
									if (getIDPersonal.length > 0) {
										const dataMsgFilterByID = dataCheckExist.filter((v) => v.id === getIDPersonal);
										const mergeMessageFromNew = dataMsgFilterByID.map((msg) => msg.messages.map((m) => m))[0];
										const resultMergeFromNew = [...mergeMessageFromNew, getNewMsg[0]];
										const mergeMessageAllFromNew = [...dataCheckExist.filter((data) => data.id !== getIDPersonal),
										dataMsgFilterByID.map((msg) => msg.messages.length > 0 ? { ...msg, messages: resultMergeFromNew } : null)[0]
										];

										if (mergeMessageAllFromNew.length > 0) {
											setAllMessageStorage(mergeMessageAllFromNew);
											// console.log("mergeMessageAllFromNew", mergeMessageAllFromNew);
											// PROSES SAVE KE DATABASE
											setValue('chatMessages', mergeMessageAllFromNew);
										}
									}
								} else {
									loadMessage();
								}

							} else {

								const getNewMsg2 = messageFromSocket.map((msg) =>
									msg.messages.map((d) =>
										dataIDExisting.filter((f) => f !== d.id).length > 0 ? null : d
									)
								).filter((val) => val !== null);

								console.log("getNewMsg2", getNewMsg2);

								// if(getNewMsg2.length > 0){
								// 	for (let i = 0; i < getNewMsg2.length; i++) {
								// 		// console.log("getNewMsg2", getNewMsg2[i]);
								// 		/// UPDATE STATUS READ TRUE BECAUSE CHAT FROM SELF
								// 		const getNewMsg = getNewMsg2[i].map((d) => d.user === email ? { ...d, read: true } : d);

								// 		// console.log("getNewMsg", getNewMsg);

								// 		if (getNewMsg.length > 0) {
								// 			const getIDPersonal = messageFromSocket.map((msg) =>
								// 				msg.messages.map((d) =>
								// 					// dataIDExisting.filter((f) => f === d.id).length > 0 ? null : msg.id
								// 					msg.id
								// 				)
								// 			)[i].filter((val) => val !== null)[0];

								// 				if (getIDPersonal.length > 0) {
								// 					const dataMsgFilterByID = dataCheckExist.filter((v) => v.id === getIDPersonal);


								// 					const mergeMessageFromNew = dataMsgFilterByID.map((msg) => msg.messages.map((m) => m))[i];

								// 					let dataTempMerge = undefined;
								// 					if(mergeMessageFromNew != undefined){
								// 						dataTempMerge = mergeMessageFromNew;
								// 					}else{
								// 						dataTempMerge = [];
								// 					}
								// 					const resultMergeFromNew = [...dataTempMerge, getNewMsg[0]];					

								// 					console.log("ID--> ", getIDPersonal);
								// 					console.log("dataCheckExist lama->" + i , dataCheckExist.filter((data) => data.id === getIDPersonal));
								// 					console.log("dataCheckExist baru->" + i , dataMsgFilterByID.map((msg) => msg.messages.length > 0 ? { ...msg, messages: resultMergeFromNew } : msg)[0]);

								// 			// 		const mergeMessageAllFromNew = [...dataCheckExist.filter((data) => data.id !== getIDPersonal),
								// 			// 		dataMsgFilterByID.map((msg) => msg.messages.length > 0 ? { ...msg, messages: resultMergeFromNew } : msg)[0]
								// 			// 		];


								// 			// console.log("dataCheckExist" + i, mergeMessageAllFromNew);


								// 					// if (mergeMessageAllFromNew.length > 0) {
								// 					// 	setAllMessageStorage(mergeMessageAllFromNew);
								// 					// 	// console.log("mergeMessageAllFromNew", mergeMessageAllFromNew);
								// 					// 	// PROSES SAVE KE DATABASE
								// 					// 	setValue('chatMessages', mergeMessageAllFromNew);
								// 					// }
								// 				}
								// 		} //else {
								// 		// 	loadMessage();
								// 		// }

								// 	}
								// }
							}
						} else {
							setAllMessageStorage(messageFromSocket);
							// PROSES SAVE KE DATABASE
							setValue('chatMessages', messageFromSocket);
						}


					} else {
						setAllMessageStorage(messageFromSocket);
						// PROSES SAVE KE DATABASE
						setValue('chatMessages', messageFromSocket);
					}
				}
			}
		} catch (error) {
			console.error('Error saving messages to AsyncStorage:', error);
		}
	};

	const getUsername = async () => {
		try {
			const email = await AsyncStorage.getItem("email");
			const name = await AsyncStorage.getItem("name");
			const cisCS = await AsyncStorage.getItem("is_cs");
			const cPosition = await AsyncStorage.getItem("position");

			if (email !== null && name !== null) {
				setUsername(JSON.parse(name));
				setEmail(JSON.parse(email));
				setCS(JSON.parse(cisCS));
				setPosition(JSON.parse(cPosition));
			}
		} catch (e) {
			console.log("Error while loading usernamesss!");
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

	const showToastTapStartChat = () => {
		ToastAndroid.show('Tap sekali lagi untuk memulai Chat!', ToastAndroid.LONG, ToastAndroid.CENTER);
	};

	const getRoomByIDFromServer = async (id) => {
		return await axios
			.get(`${config.url}/api/getRoomID`, {
				params: {
					id: id,
				},
			})
			.then((res) => {
				if (res != undefined && res != null) {
					// console.log("resultCheckExistRoom", res);
					// console.log("resultCheckExistRoom data", res.data);
					if (res.data.length > 0) {
						return res.data.length;
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

	const handleNavigationCS = async (email) => {
		if (email != null && email != "" && email != undefined && dataCS[0].email != null && dataCS[0].email != undefined) {
			const resultCheckExistRoom = await getRoomByIDFromServer("room-cs-" + email + "-" + dataCS[0].email);
			console.log("getRoomByIDFromServer", resultCheckExistRoom);

			if (resultCheckExistRoom === undefined || resultCheckExistRoom === null || resultCheckExistRoom === 0) {
				const groupChat = email + "," + username + "|" + dataCS[0].email + "," + "Customer Service" + ",";
				socket.emit("createRoomCS", groupChat);
			}
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
		<GestureHandlerRootView style={styles.chatscreen}>
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
									<View>

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
													<Text style={styles.cusername}>Customer Service</Text>

													<Text style={styles.cmessage}>
														{/* {messages?.text ? messages.text : "Tap to start chatting"} */}
														Tap to start chatting
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
											scrollEventThrottle={16}
											showsVerticalScrollIndicator={false}
											showsHorizontalScrollIndicator={false}
											contentContainerStyle={{
												flexGrow: 1,
												justifyContent: 'center',
												width: '100%'
											}}>
											<View>
												<ScrollView horizontal={true} contentContainerStyle={{
													flexGrow: 1,
													justifyContent: 'center',
													width: '100%'
												}}
												>
													{rooms != null && rooms.length > 0 && rooms.filter((room) => room.to === email && room.messages.length > 0 || room.me === email && room.messages.length > 0).length > 0 ? (
														<FlatList
															style={{ marginBottom: 270 }}
															showsHorizontalScrollIndicator={false}
															showsVerticalScrollIndicator={false}
															data={rooms.filter((room) => room.to === email && room.me_name !== 'Customer Service' || room.me === email && room.to_name !== 'Customer Service')}
															renderItem={({ item }) => <ChatComponent email={email} username_={username} item={item} rooms={rooms.filter((room) => room.to === email && room.me_name !== 'Customer Service' || room.me === email && room.to_name !== 'Customer Service')} />}
															keyExtractor={(item) => item.id}
														/>
													) : (
														null
													)}

												</ScrollView>
											</View>
										</ScrollView>

									</View>
								) : ( 										////////////// KONDISI UNTUK CS & DR
									// <View>
									<ScrollView nestedScrollEnabled={true}
										alwaysBounceVertical={true}
										scrollEventThrottle={16}
										showsVerticalScrollIndicator={false}
										showsHorizontalScrollIndicator={false}
										contentContainerStyle={{
											flexGrow: 1,
											justifyContent: 'center',
											width: '100%'
										}}>
										<View>
											<ScrollView horizontal={true} contentContainerStyle={{
												flexGrow: 1,
												justifyContent: 'center',
												width: '100%'
											}}
											>

												{messageStorage != null && messageStorage.length > 0 && messageStorage.filter((room) => room.to === email && room.messages.length > 0 || room.me === email && room.messages.length > 0).length > 0 ? (
													<FlatList
														style={{ marginBottom: 270 }}
														showsHorizontalScrollIndicator={false}
														showsVerticalScrollIndicator={false}
														data={messageStorage.filter((room) => room.to === email || room.me === email)}
														renderItem={({ item }) => <ChatComponent email={email} username_={username} item={item} rooms={messageStorage.filter((room) => room.to === email || room.me === email)} />}
														keyExtractor={(item) => item.id}
													/>
												) : (
													<View style={styles.chatemptyContainer}>
														<Image loading={lazy} source={require('../assets/icon_chat_empty_fixed.png')} style={{ width: 140, height: 140 }} />
														<Text style={styles.chatemptyText}>Chat kosong!</Text>


														{/* <AnimatedLoader
						visible={true}
						overlayColor="rgba(255,255,255,0.75)"
						source={require("../utils/Loading-Animation-Kucing.json")}
						animationStyle={styles.lottie}
						speed={1}
					>
						</AnimatedLoader>						 */}


													</View>
												)}
											</ScrollView>
										</View>
									</ScrollView>
									// </View>
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

				<BottomSheetModalProvider style={styles.modalDoctor} >
					<BottomSheetModal
						ref={bottomSheetModalRef}
						index={1}
						snapPoints={snapPoints}
						enableOverDrag
						enablePanDownToClose
						onChange={handleSheetChanges}
						animationConfigs={ANIMATION_CONFIGS_IOS}
					>
						<ScrollView nestedScrollEnabled={true}
							alwaysBounceVertical={true}
							scrollEventThrottle={16}
							showsVerticalScrollIndicator={false}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{
								flexGrow: 1,
								justifyContent: 'center',
								width: '100%'
							}}>
							<View>
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
											<Text>Maaf Kak, saat ini sedang tidak ada Dokter yang online </Text>
										</View>
									)}
								</ScrollView>

							</View>
						</ScrollView>
					</BottomSheetModal>
				</BottomSheetModalProvider>


				{/* </useBottomSheetGestureHandlers> */}

				{/* <GestureHandlerRootView style={styles.modalContainer}> */}



				{/* <BottomSheet
					visible={true}
					// ref={bottomSheetModalRef}
					index={1}
					snapPoints={snapPoints}
					enableOverDrag
					enablePanDownToClose
				// onChange={handleSheetChanges}
				>
					<ScrollView nestedScrollEnabled={true}
					contentContainerStyle={{
						flexGrow: 1,
						justifyContent: 'center',
						width: '100%'
					  }}>
					<View>
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
										<Text>Maaf Kak, saat ini sedang tidak ada Dokter yang online </Text>
									</View>
								)}
						</ScrollView>
								
							</View>
					</ScrollView>
				</BottomSheet> */}
				{/* </GestureHandlerRootView> */}

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