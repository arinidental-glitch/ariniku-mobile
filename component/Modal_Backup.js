import { View, Text, TextInput, Pressable } from "react-native";
import React, { useState } from "react";
import socket from "../utils/socket";
import { styles } from "../utils/styles";
import AsyncStorage from "@react-native-async-storage/async-storage";


const Modal = ({ setVisible }) => {
	const closeModal = () => setVisible(false);
	const [groupName, setGroupName] = useState("");
	const [username, setUsername] = useState("");

	const getUsername = async () => {
		try {
			const namaStorage = await AsyncStorage.getItem("email");
			if (namaStorage !== null) {
				await setUsername(namaStorage);
				// console.log(namaStorage + " chat to >> " + groupName);
				socket.emit("createRoom", groupName);
				closeModal();
			}
		} catch (e) {
			console.error("Error while loading username!");
		}
	};

	const handleCreateRoom = () => {
		getUsername();
	};
	
	return (
		<View style={styles.modalContainer}>
			<Text style={styles.modalsubheading}>Enter your Friend name</Text>
			<TextInput
				style={styles.modalinput}
				placeholder='Friend name'
				onChangeText={(value) => setGroupName(value)}
			/>
			<View style={styles.modalbuttonContainer}>
				<Pressable style={styles.modalbutton} onPress={handleCreateRoom}>
					<Text style={styles.modaltext}>Chat</Text>
				</Pressable>
				<Pressable
					style={[styles.modalbutton, { backgroundColor: "#E14D2A" }]}
					onPress={closeModal}
				>
					<Text style={styles.modaltext}>CANCEL</Text>
				</Pressable>
			</View>
		</View>
	);
};

export default Modal;
