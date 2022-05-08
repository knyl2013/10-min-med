import "react-native-gesture-handler";
import React, { useState } from "react";
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

export const PersonContext = React.createContext();
export default function App() {
  const Drawer = createDrawerNavigator();
  const [days, setDays] = useAsyncStorage("@DAYS", "[]");
  const [loggedEmail, setLoggedEmail] = useAsyncStorage("@LOGGED_EMAIL", "");
  const [token, setToken] = useAsyncStorage("@TOKEN", "");
  const [isLightMode, setIsLightMode] = useAsyncStorage(
    "@IS_LIGHT_MODE",
    "false"
  );
  useEffect(() => {
    activateKeepAwake();
  }, []);
  return (
    <PersonContext.Provider
      value={{
        token,
        setToken,
        loggedEmail,
        setLoggedEmail,
        days,
        setDays,
        isLightMode,
        setIsLightMode,
      }}
    >
      <NavigationContainer
        theme={isLightMode && JSON.parse(isLightMode) ? LightTheme : DarkTheme}
      >
        <Drawer.Navigator>
          <Drawer.Screen name="Home" component={MeditationScreen} />
          <Drawer.Screen name="Profile" component={ProfileScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </PersonContext.Provider>
  );
}
