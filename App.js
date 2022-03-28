import { setStatusBarBackgroundColor, StatusBar } from "expo-status-bar";
import {
  AsyncStorage,
  Button,
  InteractionManager,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import React, { useState, useEffect, useLayoutEffect } from "react";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Switch } from "react-native-switch";
// import BackgroundTimer from "react-native-background-timer";

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
export default function App() {
  const start = 60 * 10;
  // const start = 5;
  const [seconds, setSeconds] = useState(start);
  const [pause, setPause] = useState(!true);
  const [day, setDay] = useState(0);
  const [lastDone, setLastDone] = useState("");
  const [isDarkMode, setIsDarkMode] = useState();
  const [finishFirstRead, setFinishFirstRead] = useState(false);
  const STORAGE_KEY = "@storage_key";
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
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null && jsonValue != "") {
        const obj = JSON.parse(jsonValue);
        console.log("READ: " + jsonValue);
        setDay(obj["day"] ? obj["day"] : 0);
        setLastDone(obj["lastDone"] ? obj["lastDone"] : "");
        setIsDarkMode(obj["isDarkMode"]);
      } else {
        console.log("No data found, setting default values");
      }
      setFinishFirstRead(true);
    } catch (e) {
      console.error(e);
    }
  };
  const saveData = async () => {
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
  useEffect(() => {
    readData();
    activateKeepAwake();
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
        if (seconds == 0) {
          setPause(true);
          Vibration.vibrate([500], true);
          if (lastDone != getToday().toString()) {
            setDay(day + 1);
            setLastDone(getToday().toString());
          }
        } else {
          setSeconds(seconds - 1);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [seconds, pause]);
  const TimerText = () => {
    return (
      <React.Fragment>
        <Text style={isDarkMode ? styles.darkTime : styles.lightTime}>
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
            if (seconds == 0) {
              Vibration.cancel();
              setSeconds(start);
              setPause((pause) => true);
            } else {
              if (!pause) setSeconds(start);
              setPause((pause) => !pause);
            }
          }}
        />
        {/* {seconds != start && (
        <Button
          title="Reset"
          onPress={() => {
            setSeconds(start);
            setPause(true);
            Vibration.cancel();
          }}
        />
      )} */}
        {/* <Button
        title="Delete History"
        onPress={() => AsyncStorage.setItem(STORAGE_KEY, "")}
      /> */}
      </React.Fragment>
    );
  };
  return (
    <View style={isDarkMode ? styles.darkContainer : styles.lightContainer}>
      {pause && (
        <View style={styles.theme}>
          <Switch
            onValueChange={() => setIsDarkMode((isDarkMode) => !isDarkMode)}
            value={isDarkMode}
            inActiveText={"🌙"}
            activeText={"☀️"}
            switchLeftPx={4}
            switchRightPx={4}
            backgroundActive={"#333"}
            backgroundInactive={"#eee"}
          />
        </View>

        // <SwitchWithIcons
        //   onValueChange={(value) =>
        //     console.log(`Value has been updated to ${value}`)
        //   }
        // />
      )}
      <AnimatedCircularProgress
        size={300}
        width={15}
        fill={((start - seconds) / start) * 100}
        tintColor="#f9013f"
        backgroundColor={isDarkMode ? "#333" : "#eee"}
      >
        {(fill) => <TimerText />}
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
    fontSize: 70,
    color: "#fff",
  },
  lightContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  lightTime: {
    fontSize: 70,
    color: "#000",
  },
  streak: {
    color: "grey",
  },
  theme: {
    position: "absolute",
    right: 20,
    top: 20,
  },
  button: {
    backgroundColor: "transparent",
  },
});
