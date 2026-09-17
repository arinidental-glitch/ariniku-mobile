import { View, Text } from "react-native";
import React from "react";
import moment from 'moment';
import 'moment/locale/id';

// import { Ionicons } from "@expo/vector-icons";
import { styles } from "../utils/styles";

export default function MessageComponent({ item, user, from }) {
	const status = item.user !== user;

	return (
		<View>
			{status ? (
				<View
				style={styles.mmessageWrapper}>
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<View
						style={styles.mmessage}>
						<Text style={{ textAlign:"left", paddingBottom: 5 }}>{item.text}</Text>
						<Text style={{ textAlign:"left", color: "#919191", fontSize: 10 }}>{moment(item.datechat).calendar()}</Text>
					</View>
				</View>				
			</View>
			) : (
			<View style={[styles.mmessageWrapper, { alignItems: "flex-end" }]}>				
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<View style={[styles.mmessage, { backgroundColor: "rgb(194, 243, 194)" }]}>
						<Text style={{ textAlign:"right", paddingBottom: 5 }}>{item.text}</Text>
						<Text style={{ textAlign:"right", color: "#919191", fontSize: 10 }}>{moment(item.datechat).calendar()}</Text>
					</View>
				</View>				
			</View>
			)}
			
			{/* <View
				style={
					status
						? styles.mmessageWrapper
						: [styles.mmessageWrapper, { alignItems: "flex-end" }]
				}
			>
				
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					 <Ionicons
						name='person-circle-outline'
						size={30}
						color='black'
						style={status ? styles.mavatar :  styles.notshowusername }
					/> 
					<View
						style={
							status
								? styles.mmessage
								: [styles.mmessage, { backgroundColor: "rgb(194, 243, 194)" }]
						}
					>
					 <Text style={ status ? { fontWeight: "bold", color: "#c44f4f", textAlign:"left" } : styles.notshowusername } >{from}</Text>
						<Text>{item.text}</Text>
						<Text style={{ textAlign:"right", color: "#919191" }}>{item.time}</Text>
					</View>
				</View>				
			</View> */}
		</View>
	);
}
