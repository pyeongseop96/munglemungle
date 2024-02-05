import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet,
  ScrollView, TouchableOpacity, Button,
  Dimensions,
  TextInput, 
} from "react-native";


// import ImagePicker from 'react-native-image-crop-picker';

import iconClose from "../../assets/icons/close1.png";

import axios, { Axios } from "axios";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

export default function PostCreate (props) {
  const openPicker = () => {
    // return(
    //   ImagePicker.openPicker({
    //     multiple: true
    //   }).then((images) => {
    //     console.log(images);
    //   })
    // );
  }

  return (
    <View style={styles.createModalBackGround}>
      <View style={styles.createModalContainer}>
        <ScrollView style={styles.createModalScrollView}>
          <TouchableOpacity
            style={styles.closeView}
            onPress={props.closeCreateModal}
            >
            <Image 
              style={styles.closeImage}
              source={iconClose}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={openPicker} style={styles.postCreateTopView}>
            <Text style={styles.postCreateTopText}>게시물 생성</Text>
          </TouchableOpacity>

          <View style={styles.postCreateMiddleView}>
            <Text>middle</Text>
          </View>

          <View style={styles.postCreateBottomView}>
            <Text>bottom</Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  createModalBackGround: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  createModalContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.78,
    backgroundColor: "white",
    marginBottom: SCREEN_HEIGHT * 0.03,
    padding: SCREEN_WIDTH * 0.0,
    position: "relative",
  },
  createModalScrollView: {
  },

  closeView: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
    position: "absolute",
    top: 0,
    right: 0,
  },
  closeImage: {
    width: SCREEN_WIDTH * 0.06,
    height: SCREEN_WIDTH * 0.06,
  },

  postCreateTopView: {
    marginTop: SCREEN_HEIGHT * 0.03,
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.31,
    justifyContent: "center",
    alignItems: "center",
  },

  postCreateMiddleView: {
    marginTop: SCREEN_HEIGHT * 0.01,
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  postCreateBottomView: {
    marginBottom: SCREEN_HEIGHT * 0.01,
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.215,
    alignItems: "center",
  },
});