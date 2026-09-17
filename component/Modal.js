import { View, Text, FlatList, TextInput, Pressable } from "react-native";
import React, { useState, useEffect, CSSProperties } from "react";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "../utils/styles";
import config  from "../config.js";
import ListDokterOnlineComponent from "../component/ListDokterOnlineComponent.js";
import axios from "axios";
// import SyncLoader  from "react-spinners/SyncLoader.js";


const Modal = ({ setVisible, email, username}) => {
	const closeModal = () => setVisible(false);
	const [listDokter, setListDokter] = useState([]);
	// const [CloseNumber, setCloseNumber] = useState("");
	// const [CloseNumber2, setCloseNumber2] = useState("");
	// let [loading, setLoading] = useState(false);
	// let [color, setColor] = useState("#36d7b7");

	// const override: CSSProperties = {
	// 	display: "block",
	// 	margin: "0 auto",
	// 	borderColor: "red",
	//   };


	// const handleCreateRoom = () => {
	// 	getUsername();
	// };

	
	useEffect(() => {
		try{
			// setColor("#36d7b7");
			getListDokter();

			async function getListDokter() {
				// setLoading(true);
				return await axios
					.get(`${config.url_backend}/api/ariniku/chat-doctor/list`)
					.then((res) => {
						setListDokter(res.data.data);	
						// setLoading(false);		 
						// return res.data.data;
					})
					.catch((err) => {
						// setLoading(false);		 
						console.log(err.response);
						if (err.response) {
						console.log("Error when get chat doctor");
						}
						// return "";
					});
			}
		}
		catch(e){
			console.log(e);
		}
	}, []);
	
	return (
		<View style={styles.modalContainer} >
			<View style={styles.modalHeader}>
				<Text style={styles.ccountlistchat}>{listDokter.length} Doctor</Text>
					<Ionicons
					name='close-sharp'
					size={25}
					color='black'
					style={styles.ccloselistchat}
					onPress={closeModal}
					/>
			</View>
			 {listDokter.length > 0 ? (
					<FlatList
						data={listDokter}
						onMomentumScrollEnd={(event) => {
							// console.log(event.nativeEvent.contentOffset.y);
							// console.log(CloseNumber);
							// console.log(CloseNumber2);
							if(event.nativeEvent.contentOffset.y > 105){
								// setCloseNumber("1");
								// setCloseNumber2("1");
								// closeModal;
								// console.log("TUTUP1");
							}else if(event.nativeEvent.contentOffset.y <= 0){
								// if(CloseNumber === "0" && CloseNumber2 === "0"){									
								// 	closeModal();
								// }else{
								// 	setCloseNumber("0");
								// 	setCloseNumber2("0");
								// }
								

								// closeModal;
								// console.log("TUTUP2");
							}

								

						}}
						renderItem={({ item }) => <ListDokterOnlineComponent setVisible={setVisible} item={item} email={email} username={username} />}
						keyExtractor={(item) => item.emp_ktp}
					/>
				) : (
					<View style={styles.chatemptyContainer}>
						<Text style={styles.chatemptyText}>No Online!</Text>
					</View>
				)}

					{/* <View>
						<SyncLoader
					color={color}
					loading={loading}
					// cssOverride={override}
					size={150}
					aria-label="Loading Spinner"
					data-testid="loader"
				/>
					</View> */}
		
		</View>
	);
};

export default Modal;
