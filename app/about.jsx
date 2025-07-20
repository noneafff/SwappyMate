// File: app/about.jsx

import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Image, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'About',
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.textHeader,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={require('../assets/img/currency-exchange.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>SwappyMate</Text>
        <Text style={styles.version}>Version 1.0.0</Text>

        <View style={styles.section}>
          <Text style={styles.description}>
            SwappyMate is your friendly and reliable mate for quick and easy currency conversions. 
            Powered by real-time exchange rates, it provides a seamless experience for all your conversion needs.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.creditTitle}>Developed by</Text>
          <Text style={styles.developerName}>Nabil Afnan</Text>
        </View>

        <View style={styles.footer}>
          <Feather name="globe" size={16} color={COLORS.textSubtle} />
          <Text style={styles.footerText}>
            Currency data provided by ExchangeRate-API.com
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  version: {
    fontSize: 14,
    color: COLORS.textSubtle,
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
    alignItems: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 24,
  },
  creditTitle: {
    fontSize: 14,
    color: COLORS.textSubtle,
    marginBottom: 4,
  },
  developerName: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
  },
  footer: {
    marginTop: 'auto', // Pushes the footer to the bottom
    paddingTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    marginLeft: 8,
    fontSize: 12,
    color: COLORS.textSubtle,
  },
});