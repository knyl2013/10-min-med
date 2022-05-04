import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import {
  AsyncStorage,
  Button,
  InteractionManager,
  StyleSheet,
  Text,
  Vibration,
  View,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Switch } from "react-native-switch";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import { useAsyncStorage } from "../util/useAsyncStorage";
import { PersonContext } from "../App";
import * as env from "../constants/Environment";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function normalize(size) {
  return Platform.OS == "android" ? size / 2 : size;
}
const getYesterday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - 1);
  return d;
};
const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
export default function MeditationScreen() {
  const {
    isLoggedIn,
    setIsLoggedIn,
    lastDone,
    setLastDone,
    isDarkMode,
    setIsDarkMode,
    day,
    setDay,
    loggedEmail,
    days,
    setDays,
    isLightMode,
    setIsLightMode,
  } = useContext(PersonContext);
  const [json, setJson] = useAsyncStorage(STORAGE_KEY, "");
  const start = 60 * 10;
  // const start = 5;
  const [seconds, setSeconds] = useState(start);
  const [pause, setPause] = useState(!true);
  const [finishFirstRead, setFinishFirstRead] = useState(false);
  const [guideText, setGuideText] = useState(
    "Focus on your breathing, and nothing else"
  );
  const STORAGE_KEY = "@storage_key";
  useEffect(() => {
    if (!json) return;
    console.log(json);
    setDay(json["day"] ? json["day"] : 0);
    setLastDone(json["lastDone"] ? json["lastDone"] : "");
    setIsDarkMode(json["isDarkMode"]);
  }, [json]);
  const d0 = useRef(-1);
  const convert = (seconds) => {
    let min = Math.floor(seconds / 60);
    let sec = seconds % 60;
    return ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2);
  };
  const checkStreak = () => {
    if (
      day > 0 &&
      getToday().toString() != lastDone &&
      getYesterday().toString() != lastDone
    ) {
      setDay(0);
      setLastDone("");
    }
  };
  const readData = async () => {
    // try {
    //   const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    //   if (jsonValue != null && jsonValue != "") {
    //     const obj = JSON.parse(jsonValue);
    //     console.log("READ: " + jsonValue);
    //     setDay(obj["day"] ? obj["day"] : 0);
    //     setLastDone(obj["lastDone"] ? obj["lastDone"] : "");
    //     setIsDarkMode(obj["isDarkMode"]);
    //   } else {
    //     console.log("No data found, setting default values");
    //   }
    //   setFinishFirstRead(true);
    // } catch (e) {
    //   console.error(e);
    // }
  };
  const saveData = async () => {
    console.log("saveData()");
    try {
      const jsonValue = JSON.stringify({
        day: day,
        lastDone: lastDone,
        isDarkMode: isDarkMode,
      });
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
      console.log("SAVED: " + jsonValue);
    } catch (e) {
      console.log("Failed to save the data to the storage");
    }
  };
  const askPermissions = async () => {
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if (status != "granted") {
      const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      if (status == "granted") {
        console.log("Notification permission granted.");
      }
    } else {
      console.log("Already have permission");
    }
  };
  useEffect(() => {
    readData();
    askPermissions();
  }, []);
  useEffect(() => checkStreak(), [finishFirstRead, seconds]);
  useEffect(() => {
    if (!finishFirstRead) return;
    saveData();
  }, [day, lastDone, isDarkMode]);
  useEffect(() => {
    // // Start a timer that runs continuous after X milliseconds
    // const intervalId = BackgroundTimer.setInterval(() => {
    //   // this will be executed every 200 ms
    //   // even when app is the background
    //   console.log("tic");
    // }, 200);

    // // Cancel the timer when you are done with it
    // return () => BackgroundTimer.clearInterval(intervalId);
    const interval = setInterval(() => {
      if (!pause) {
        const firstRun = d0.current == -1;
        const now = Math.floor(new Date().getTime() / 1000);
        const diff = now - d0.current;
        d0.current = now;
        if (!firstRun && diff > 2) {
          console.log(
            "Detected time elapsed from background, adjust seconds by " + diff
          );
          setSeconds(Math.max(0, seconds - diff));
          return;
        }
        if (seconds == 0) {
          setPause(true);
          Vibration.vibrate([500], true);
          if (lastDone != getToday().toString()) {
            setDay(day + 1);
            setLastDone(getToday().toString());
          }
          setDays((prevDays) => {
            try {
              arr = JSON.parse(prevDays);
            } catch (e) {
              arr = [];
            }
            const today = getToday().toString();
            if (arr.indexOf(today) == -1) {
              arr.push(getToday().toString());
            }
            return JSON.stringify(arr);
          });
        } else {
          setSeconds(seconds - 1);
        }
        console.log(seconds, start);
        if (seconds == start) {
          // cancel previous notifications before adding a new one
          Notifications.cancelAllScheduledNotificationsAsync();
          console.log("scheduling notifications...");
          Notifications.scheduleNotificationAsync({
            content: {
              title: "10-min-med",
              body: "Finished. Well Done!",
            },
            trigger: { seconds: start },
          });
        }
      }
    }, 1000);
    // // Times up but still in foreground, cancel the notification
    if (seconds == 1) {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
    return () => clearInterval(interval);
  }, [seconds, pause]);
  const TimerText = () => {
    return (
      <React.Fragment>
        <Text
          style={
            isLightMode && JSON.parse(isLightMode)
              ? styles.lightTime
              : styles.darkTime
          }
        >
          {convert(seconds)}
        </Text>
        <Text style={styles.streak}>
          Streak: {day} Day{day > 1 ? "s" : ""} (
          {lastDone == getToday().toString() ? "" : "Not "}Done Today)
        </Text>
        <StatusBar style="auto" />
        <Button
          color="#f9013f"
          title={pause && seconds != 0 ? "Start" : "Reset"}
          style={styles.button}
          onPress={() => {
            setIsLoggedIn((prev) => !prev); // just for checking
            if (seconds == 0) {
              Vibration.cancel();
              setSeconds(start);
              d0.current = -1;
              setPause((pause) => true);
            } else {
              if (!pause) {
                setSeconds(start);
                Notifications.cancelAllScheduledNotificationsAsync();
                d0.current = -1;
              }
              setPause((pause) => !pause);
            }
          }}
        />
      </React.Fragment>
    );
  };
  return (
    <View
      style={
        isLightMode && JSON.parse(isLightMode)
          ? styles.lightContainer
          : styles.darkContainer
      }
    >
      {/* {pause && (
        <View style={styles.theme}>
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
        </View>
      )} */}
      {!pause && <Text style={styles.guide}>{guideText}</Text>}
      <AnimatedCircularProgress
        size={300}
        width={15}
        fill={((start - seconds) / start) * 100}
        tintColor="#f9013f"
        backgroundColor={
          isLightMode && JSON.parse(isLightMode) ? "#eee" : "#333"
        }
      >
        {() => <TimerText />}
      </AnimatedCircularProgress>
      <Text>Hi {loggedEmail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  darkContainer: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  darkTime: {
    fontSize: normalize(70),
    color: "#fff",
  },
  lightContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  lightTime: {
    fontSize: normalize(70),
    color: "#000",
  },
  streak: {
    fontSize: normalize(15),
    color: "grey",
  },
  theme: {
    position: "absolute",
    right: "5%",
    top: "5%",
  },
  button: {
    backgroundColor: "transparent",
  },
  guide: {
    position: "absolute",
    fontSize: normalize(15),
    color: "grey",
    right: "0%",
    left: "0%",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    top: "20%",
  },
});
