import { View, Text, TextInput, StyleSheet, Button, Image } from "react-native";
import { Switch } from "react-native-switch";
import React, { useState, useEffect, useRef, useContext } from "react";
import { useAsyncStorage } from "../util/useAsyncStorage";
import { GlobalContext } from "../context/Provider";
import { PersonContext } from "../App";
import * as env from "../constants/Environment";

export default function ProfileScreen() {
  const {
    isDarkMode,
    setIsDarkMode,
    token,
    setToken,
    setLoggedEmail,
    loggedEmail,
    isLightMode,
    setIsLightMode,
  } = useContext(PersonContext);
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
    const response = await fetch(env.BASE_URL + "/login", requestOptions);
    const data = await response.json();
    if (data.token) {
      // setMessage("Login Successful");
      setMessage("");
      setToken(data.token);
      setLoggedEmail(data.user.email);
      setPassword("");
    } else {
      setMessage("Failed: " + data.message);
    }
    console.log(data);
    setIsLoading(false);
  };
  const handleRegister = async () => {
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
    const response = await fetch(env.BASE_URL + "/register", requestOptions);
    const data = await response.json();
    if (data.email) {
      setMessage("Register Successful");
    } else {
      setMessage("Failed: " + data.message);
    }
    console.log(data);
    setIsLoading(false);
  };
  return (
    <View style={{ flex: 1, alignItems: "center", top: "20%" }}>
      {!!loggedEmail && !!token && (
        <>
          <Text>Hi {loggedEmail}</Text>
          <Button
            title="Logout"
            onPress={() => {
              setLoggedEmail("");
              setToken("");
            }}
          />
        </>
      )}
      {!loggedEmail && (
        <>
          <Switch
            onValueChange={() => {
              setIsLightMode((prevIsLightMode) => {
                return JSON.stringify(!JSON.parse(prevIsLightMode));
              });
            }}
            value={isLightMode && JSON.parse(isLightMode)}
            activeText={"🌙"}
            inActiveText={"☀️"}
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
              keyboardType="email-address"
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
              keyboardType="default"
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
          <Button
            title="Register"
            onPress={handleRegister}
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
