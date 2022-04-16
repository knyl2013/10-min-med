import { View, Text } from "react-native";
import { Switch } from "react-native-switch";
import React, { useState, useEffect, useRef } from "react";

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <View style={{ flexDirection: "row" }}>
        <Text style={{ fontSize: 16, fontWeight: "700", paddingRight: 30 }}>
          Theme:
        </Text>
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
    </View>
  );
}
