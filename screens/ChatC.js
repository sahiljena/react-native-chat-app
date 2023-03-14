import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";

import { TouchableOpacity } from "react-native-gesture-handler";
import { GiftedChat } from "react-native-gifted-chat";
import { auth, database } from "../config/firebase";

import { AntDesign } from "@expo/vector-icons";
import colors from "../colors";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

export default function ChatC() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();

  const onSignOut = () => {
    signOut(auth).catch((error) => console.log(error));
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}
        >
          <AntDesign
            name="logout"
            size={24}
            color={colors.gray}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>;
      },
    });
  }, [navigation]);

  useEffect(() => {
    const collectionRef = collection(database, "chats");
    const q = query(collectionRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("snapshot");
      setMessages(
        snapshot.docs.map((doc) => ({
          _id: doc.id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
    });
    return unsubscribe;
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, messages));

    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(database, "chats"), {
      _id,
      createdAt,
      text,
      user,
    });
  }, []);

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: auth?.currentUser?.email,
        avatar:
          "https://gifdb.com/images/thumbnail/the-office-dwight-cheering-for-christmas-bylsjh8c4j66l4v1.gif",
      }}
      messagesContainerStyle={{
        backgroundColor: "#fff",
      }}
    />
  );
}
