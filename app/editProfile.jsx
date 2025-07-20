// File: app/editProfile.jsx

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { supabase } from '../utils/supabase';

export default function EditProfileScreen() {
  const [username, setUsername] = useState('');
  const [initialUsername, setInitialUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch the user's profile data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        setIsFetching(true);
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('No user found');

          // Set the email directly from the auth user object
          setEmail(user.email || '');

          // Fetch the username from the 'profiles' table
          const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;

          if (data) {
            setUsername(data.username);
            setInitialUsername(data.username); // Keep a copy to check for changes
          }
        } catch (error) {
          Alert.alert('Error', 'Could not fetch your profile data.');
          console.error('Error fetching profile:', error.message);
        } finally {
          setIsFetching(false);
        }
      };

      fetchProfile();
    }, [])
  );

  const handleUpdateProfile = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to update your profile.');

      // 1. Update Username in the 'profiles' table (if it has changed)
      if (username !== initialUsername) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ username: username.trim(), updated_at: new Date() })
          .eq('id', user.id);
        
        if (profileError) throw profileError;
      }
      
      // 2. Update Email in Supabase Auth (if it has changed)
      if (email !== user.email) {
        const { error: authError } = await supabase.auth.updateUser({ email });
        if (authError) throw authError;
      }

      Alert.alert('Success', 'Your profile has been updated.', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error) {
      Alert.alert('Update Error', error.message);
      console.error('Error updating profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} style={{flex: 1}} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.textHeader,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Feather name="user" size={60} color={COLORS.primary} style={styles.headerIcon} />
          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>Update your username and email address.</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor={COLORS.textSubtle}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={COLORS.textSubtle}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.disabledButton]} 
          onPress={handleUpdateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textHeader} />
          ) : (
            <Text style={styles.primaryButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// The StyleSheet is now outside the component and uses the static COLORS object
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerIcon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSubtle,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSubtle,
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
    color: COLORS.textDark,
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
  disabledButton: {
    backgroundColor: COLORS.textSubtle,
  },
});