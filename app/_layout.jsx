// File: app/_layout.jsx

import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      {/* Set the status bar style once for the whole app */}
      <StatusBar style="dark" />

      <Stack>
        {/* Define all your app's screens here */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="forgotPassword" />
        <Stack.Screen name="resetPassword" />
        <Stack.Screen name="mainmenu" />
        <Stack.Screen name="converterMenu" />
        <Stack.Screen name="recentConvert" />
        <Stack.Screen name="setting" />
        <Stack.Screen name="editProfile" />
        <Stack.Screen name="changePassword" />
      </Stack>
    </>
  );
}