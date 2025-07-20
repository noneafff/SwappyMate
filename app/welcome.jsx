// File: app/welcome.jsx

import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Stack, router } from 'expo-router';
import { COLORS } from '../constants/colors'; // <-- Use static COLORS import

export default function WelcomeScreen() {
  // We no longer call useTheme() or create styles here.

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
            headerShown: true,
            title: 'Welcome to SwappyMate',
            headerStyle: { backgroundColor: COLORS.header },
            headerTintColor: COLORS.textHeader,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerBackVisible: false,
        }}
      />
    
      <View style={styles.content}>
        <Image
          source={require('../assets/img/currency-exchange.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>SwappyMate</Text>
        <Text style={styles.subtitle}>Your converter mate</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton} 
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </TouchableOpacity>
        
        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// The StyleSheet is now outside the component and uses the static COLORS object
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.textSubtle,
    fontStyle: 'italic',
    marginBottom: 30,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: COLORS.textHeader,
    fontSize: 16,
    fontWeight: '600',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: COLORS.textSubtle,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});