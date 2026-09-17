import { View, Text, Pressable, Image } from "react-native";
import React, { useLayoutEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../utils/styles";
import config  from "../config.js";
import getSocket from "../utils/socket";

const ListDokterOnlineComponent = ({ setVisible, item, email, username }) => {
	const navigation = useNavigation();	
	const closeModal = () => setVisible(false);

	useLayoutEffect(() => {
		// console.log("useLayoutEffect HALLOOO");
		// console.log(email);	
		// console.log(username);	
	});

	// const getUsername = async () => {
	// 	try {
	// 		let email = await AsyncStorage.getItem("email");
	// 		let name = await AsyncStorage.getItem("name");
	// 		email = email.replaceAll('"', '');
	// 		name = name.replaceAll('"', '');
	// 		if (email !== null) {
	// 			if(email === item.me){
	// 				setUsername(item.to_name);
	// 				setEmail(item.to);
	// 			}else if (email === item.to){
	// 				setUsername(item.me_name);
	// 				setEmail(item.me);
	// 			}
	// 		}
	// 	} catch (e) {
	// 		console.error("Error while loading username!");
	// 	}
	// };

	

	const handleCreateRoom = async () => {
		const groupChat = email + "," + username + "|" + item.emp_email + "," + item.emp_fname + "," + item.emp_foto2;
		console.log(groupChat);
		const socket = await getSocket();
		socket.emit("createRoom", groupChat);
		closeModal();
	};

	return (
		<Pressable style={styles.cchat} onPress={handleCreateRoom} >
			<Image 
			source={{ uri:config.url_primary+ "/image/dokter/" + item.emp_foto2}} 
			style={styles.cavatarchat} />

			<View style={styles.crightContainer}>
				<View>
					<Text style={styles.cusername}>{item.emp_fname}</Text>

					<Text style={styles.cmessage}>
						Online
					</Text>
				</View>
				<View>
					
					<Text style={styles.ctime}>
					<Ionicons
				name='ellipse-sharp'
				size={10}
				color='#40C057'
				style={styles.cbubble}
			/>
					</Text>
				</View>
			</View>
		</Pressable>
	);
};

export default ListDokterOnlineComponent;
