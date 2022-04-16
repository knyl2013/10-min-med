import "react-native-gesture-handler";
import * as React from "react";
import { Text } from "react-native";
import MeditationScreen from "./screens/Meditation";
import SettingsScreen from "./screens/Settings";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect } from "react";

export default function App() {
  const Drawer = createDrawerNavigator();
  useEffect(() => {
    activateKeepAwake();
  }, []);
  return (
    <NavigationContainer /*theme={DarkTheme}*/>
      <Drawer.Navigator useLegacyImplementation>
        <Drawer.Screen name="Home" component={MeditationScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
