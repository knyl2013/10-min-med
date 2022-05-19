import { View, Text, TextInput, StyleSheet, Button, Image } from "react-native";
import { Switch } from "react-native-switch";
import React, { useState, useEffect, useRef, useContext } from "react";
import { PersonContext } from "../App";
import * as AWSUtil from "../util/AWSUtil";
import { setBadgeCountAsync } from "expo-notifications";
import * as DateUtil from "../util/DateUtil";

export default function ProfileScreen() {
  const {
    token,
    setToken,
    setLoggedEmail,
    loggedEmail,
    isLightMode,
    setIsLightMode,
    days,
    setDays,
  } = useContext(PersonContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const onChangeEmail = (newEmail) => setEmail(newEmail);
  const onChangePassword = (newPassword) => setPassword(newPassword);
  const handleLogin = async () => {
    setIsLoading(true);
    const data = await AWSUtil.login(email, password);
    if (data.token) {
      setMessage("");
      setToken(data.token);
      setLoggedEmail(data.user.email);
      setPassword("");
    } else {
      setMessage("Failed: " + data.message);
    }
    console.log(data);
    setDays(
      JSON.stringify(DateUtil.merge(JSON.parse(days), data.user.completedDays))
    );
    setIsLoading(false);
  };
  const handleRegister = async () => {
    setIsLoading(true);
    const data = await AWSUtil.register(email, password);
    if (data.email) {
      setMessage("Register Successful");
    } else {
      setMessage("Failed: " + data.message);
    }
    console.log(data);
    setIsLoading(false);
  };
  const handleClearHistory = () => {
    setDays("[]");
  };
  const handleSync = async () => {
    setIsLoading(true);
    const data = await AWSUtil.sync(
      { email: loggedEmail, completedDays: days },
      token
    );
    if (!data.synced) {
      setMessage("Sync Failed: " + data.message);
    } else {
      setDays(
        JSON.stringify(
          DateUtil.merge(JSON.parse(days), data.user.completedDays)
        )
      );
    }
    console.log(data);
    setIsLoading(false);
  };
  useEffect(() => {
    if (!!days && !!JSON.parse(days).length && token) {
      handleSync();
    }
  }, [days]);
  return (
    <View style={{ flex: 1, alignItems: "center", top: "20%" }}>
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
      {!!loggedEmail && !!token && (
        <>
          <Text
            style={
              isLightMode && JSON.parse(isLightMode)
                ? styles.lightText
                : styles.darkText
            }
          >
            User: {loggedEmail}
          </Text>
          <View style={styles.rowContainer}>
            <Button
              title="Logout"
              color="#f9013f"
              onPress={() => {
                setLoggedEmail("");
                setToken("");
              }}
              disabled={isLoading}
            />
            <Button
              title="Sync"
              color="#f9013f"
              onPress={() => handleSync()}
              disabled={isLoading}
            />
          </View>
        </>
      )}

      {!loggedEmail && (
        <>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              style={
                isLightMode && JSON.parse(isLightMode)
                  ? styles.lightInput
                  : styles.darkInput
              }
              onChangeText={onChangeEmail}
              placeholder="email"
              keyboardType="email-address"
              value={email}
              editable={!isLoading}
            />
          </View>
          <View style={{ flexDirection: "row" }}>
            <TextInput
              style={
                isLightMode && JSON.parse(isLightMode)
                  ? styles.lightInput
                  : styles.darkInput
              }
              onChangeText={onChangePassword}
              placeholder="password"
              secureTextEntry={true}
              keyboardType="default"
              value={password}
              editable={!isLoading}
            />
          </View>
          <Button
            color="#f9013f"
            title="Login"
            onPress={handleLogin}
            disabled={isLoading}
          ></Button>
          <Button
            color="#f9013f"
            title="Register"
            onPress={handleRegister}
            disabled={isLoading}
          ></Button>
        </>
      )}
      <Text
        style={
          isLightMode && JSON.parse(isLightMode)
            ? styles.lightText
            : styles.darkText
        }
      >
        Completed Days: {days}
      </Text>
      <Button
        color="#f9013f"
        title="Clear History"
        onPress={handleClearHistory}
        disabled={isLoading}
      ></Button>
      <Text
        style={
          isLightMode && JSON.parse(isLightMode)
            ? styles.lightText
            : styles.darkText
        }
      >
        {message}
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lightInput: {
    height: 40,
    width: "70%",
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  darkInput: {
    height: 40,
    width: "70%",
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  lightText: {
    color: "#000",
  },
  darkText: {
    color: "#fff",
  },
});
