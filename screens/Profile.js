import { View, Text, TextInput, StyleSheet, Button, Image } from "react-native";
import { Switch } from "react-native-switch";
import React, { useState, useEffect, useRef, useContext } from "react";
import { useAsyncStorage } from "../util/useAsyncStorage";
import { GlobalContext } from "../context/Provider";
import { PersonContext } from "../App";
import * as env from "../constants/Environment";

export default function ProfileScreen() {
  const { isLoggedIn, setIsLoggedIn, isDarkMode, setIsDarkMode } =
    useContext(PersonContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const onChangeEmail = (newEmail) => setEmail(newEmail);
  const onChangePassword = (newPassword) => setPassword(newPassword);
  const handleLogin = async () => {
    setIsLoading(true);
    // POST request using fetch with async/await
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.API_KEY,
      },
      body: JSON.stringify({ email: email, password: password }),
    };
    const response = await fetch(env.BASE_URL, requestOptions);
    const data = await response.json();
    if (data.token) {
      setMessage("Login Successful");
    } else {
      setMessage("Failed: " + data.message);
    }
    console.log(data);
    // this.setState({ postId: data.id });
    setIsLoading(false);
  };
  return (
    <View style={{ flex: 1, alignItems: "center", top: "20%" }}>
      {isLoggedIn && <Text value="Hi user"></Text>}
      {!isLoggedIn && (
        <>
          <Switch
            onValueChange={(prevIsDarkMode) => {
              setIsDarkMode(!isDarkMode);
            }}
            value={isDarkMode}
            inActiveText={"🌙"}
            activeText={"☀️"}
            switchLeftPx={4}
            switchRightPx={4}
            backgroundActive={"#333"}
            backgroundInactive={"#eee"}
          />
          <View style={{ flexDirection: "row" }}>
            <TextInput
              style={styles.input}
              onChangeText={onChangeEmail}
              placeholder="email"
              keyboardType="text"
              value={email}
              editable={!isLoading}
            />
            <TextInput />
          </View>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              style={styles.input}
              onChangeText={onChangePassword}
              placeholder="password"
              secureTextEntry={true}
              value={password}
              editable={!isLoading}
            />
            <TextInput />
          </View>
          <Button
            title="Login"
            onPress={handleLogin}
            disabled={isLoading}
          ></Button>
          <Text>{message}</Text>
        </>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  input: {
    height: 40,
    width: "70%",
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
