// File: app/setting.jsx

import React from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export default function SettingScreen() {
  // We no longer need the SettingsRow component, as we'll use a card style directly.

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Settings',
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.textHeader,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Account Settings Section */}
        <Text style={styles.pageTitle}>Account Settings</Text>
        
        {/* Edit Profile Card Button */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/editProfile')}
        >
          <View style={[styles.cardIconContainer, {backgroundColor: COLORS.primaryLight}]}>
            <Feather name="user" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Edit Profile Info</Text>
            <Text style={styles.cardDescription}>Change username and email address.</Text>
          </View>
        </TouchableOpacity>

        {/* Change Password Card Button */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/changePassword')}
        >
          <View style={[styles.cardIconContainer, {backgroundColor: COLORS.primaryLight}]}>
            <Feather name="lock" size={28} color={COLORS.primary} />
          </View>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Change Password</Text>
            <Text style={styles.cardDescription}>Update your current password.</Text>
          </View>
        </TouchableOpacity>
        
      </ScrollView>
    </SafeAreaView>
  );
}

// The stylesheet has been updated to use the 'card' style from mainmenu.jsx
const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: { 
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 30,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  // This style is for the colored circle behind the icon
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25, // Make it a circle
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: COLORS.textSubtle,
  },
});