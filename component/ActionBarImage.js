import React from 'react';
import config  from "../config.js";
import { styles } from "../utils/styles";
import {View, Image} from 'react-native';

const ActionBarImage = (to_foto) => {
  return (
    <View>
			<Image 
			source={{ uri:config.url_primary+ "/image/dokter/" + to_foto}} 
			style={styles.cavatarchattop} />

		  </View>
  );
};

export default ActionBarImage;