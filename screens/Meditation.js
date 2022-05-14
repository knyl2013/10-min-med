import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import {
  Button,
  StyleSheet,
  Text,
  Vibration,
  View,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef, useContext } from "react";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import * as DateUtil from "../util/DateUtil";
import { PersonContext } from "../App";
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
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
export default function MeditationScreen() {
  const { loggedEmail, days, setDays, isLightMode, setIsLightMode } =
    useContext(PersonContext);
  const start = 60 * 10;
  const [seconds, setSeconds] = useState(start);
  const [pause, setPause] = useState(!true);
  const [guideText, setGuideText] = useState(
    "Focus on your breathing, and nothing else"
  );
  const d0 = useRef(-1);
  const convert = (seconds) => {
    let min = Math.floor(seconds / 60);
    let sec = seconds % 60;
    return ("0" + min).slice(-2) + ":" + ("0" + sec).slice(-2);
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
    askPermissions();
  }, []);

  useEffect(() => {
    // Start a timer that runs continuous after X milliseconds
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
          setDays((prevDays) => {
            let arr = [];
            try {
              arr = JSON.parse(prevDays);
            } catch (e) {
              arr = [];
            }
            const todayStr = DateUtil.getDateStr(DateUtil.getToday());
            if (arr.indexOf(todayStr) == -1) {
              arr.push(todayStr);
            }
            return JSON.stringify(arr);
          });
        } else {
          setSeconds(seconds - 1);
        }
        console.log(seconds, start);
        if (seconds == start && Platform.OS === "ios") {
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
    // Times up but still in foreground, cancel the notification
    if (seconds == 1 && Platform.OS === "ios") {
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
          Streak: {DateUtil.getConsecutiveDays(days)} Day
          {DateUtil.getConsecutiveDays(days) > 1 ? "s" : ""} (
          {DateUtil.isTodayDone(days) ? "" : "Not "}Done Today)
        </Text>
        <StatusBar style="auto" />
        <Button
          color="#f9013f"
          title={pause && seconds != 0 ? "Start" : "Reset"}
          style={styles.button}
          onPress={() => {
            if (seconds == 0) {
              Vibration.cancel();
              setSeconds(start);
              d0.current = -1;
              setPause((pause) => true);
            } else {
              if (!pause) {
                setSeconds(start);
                if (Platform.OS === "ios") {
                  Notifications.cancelAllScheduledNotificationsAsync();
                }
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
  profileButton: {
    backgroundColor: "transparent",
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
