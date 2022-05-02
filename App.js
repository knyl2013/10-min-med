import "react-native-gesture-handler";
import React, { useState } from "react";
import { Text } from "react-native";
import MeditationScreen from "./screens/Meditation";
import ProfileScreen from "./screens/Profile";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  NavigationContainer,
  DarkTheme,
  LightTheme,
} from "@react-navigation/native";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect } from "react";
import { useAsyncStorage } from "./util/useAsyncStorage";
import GlobalProvider from "./context/Provider";

export const PersonContext = React.createContext();
export default function App() {
  const Drawer = createDrawerNavigator();
  const STORAGE_KEY = "@storage_key";
  const [isDarkMode, setIsDarkMode] = useAsyncStorage("@IS_DARK_MODE", false);
  const [day, setDay] = useAsyncStorage("@DAY", 0);
  const [lastDone, setLastDone] = useAsyncStorage("@LAST_DONE", "");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [loggedEmail, setLoggedEmail] = useState("");
  const [token, setToken] = useState("");
  const states = {
    isDarkMode,
    setIsDarkMode,
    day,
    setDay,
    lastDone,
    setLastDone,
    isLoggedIn,
    setIsLoggedIn,
  };
  useEffect(() => {
    activateKeepAwake();
  }, []);
  return (
    <PersonContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        day,
        setDay,
        lastDone,
        setLastDone,
        isDarkMode,
        setIsDarkMode,
        token,
        setToken,
        loggedEmail,
        setLoggedEmail,
      }}
    >
      <NavigationContainer theme={isDarkMode ? DarkTheme : LightTheme}>
        <Drawer.Navigator>
          <Drawer.Screen
            name="Home"
            component={MeditationScreen}
            initialParams={{
              states,
            }}
          />
          <Drawer.Screen
            name="Profile"
            component={ProfileScreen}
            initialParams={{
              states,
            }}
          />
        </Drawer.Navigator>
      </NavigationContainer>
    </PersonContext.Provider>
  );
}
