// File: app/index.jsx

import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { Stack, router } from 'expo-router';
import { COLORS } from '../constants/colors'; // <-- Use static COLORS import

export default function SplashScreen() {
  // We no longer call useTheme() or create styles here.

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/welcome');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Image
        source={require('../assets/img/currency-exchange.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>SwappyMate</Text>
      <Text style={styles.subtitle}>Your converter mate</Text>
    </View>
  );
}

// The StyleSheet is now outside the component and uses the static COLORS object
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSubtle,
    fontStyle: 'italic',
  },
});