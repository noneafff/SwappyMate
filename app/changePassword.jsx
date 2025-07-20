// File: app/changePassword.jsx

import React, { useState } from 'react';
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
import { Stack, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { supabase } from '../utils/supabase';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // This function is no longer needed since updateUser now handles password verification.
  // const reauthenticate = async () => { ... }
  
  const handleUpdatePassword = async () => {
    if (loading) return;
    
    // --- Validation ---
    if (!newPassword || !confirmPassword) { // We no longer need the current password for this flow
      Alert.alert('Missing Information', 'Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The new passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Password Too Short', 'Your new password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    // Supabase requires you to provide the new password to change it for a signed-in user.
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    setLoading(false);

    if (updateError) {
      // The most common error is "New password should be different from the old password."
      Alert.alert('Update Error', updateError.message);
    } else {
      // Success! Now sign out and redirect.
      Alert.alert(
        'Success!',
        'Your password has been updated. You will now be logged out.',
        [
          { text: 'OK', 
            onPress: async () => {
              // Sign the user out
              const { error: signOutError } = await supabase.auth.signOut();
              
              if (signOutError) {
                Alert.alert('Logout Error', signOutError.message);
              } else {
                // Redirect to the welcome screen, replacing the current history stack
                router.replace('/welcome'); 
              }
            } 
          } 
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Change Password',
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.textHeader,
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Feather name="lock" size={60} color={COLORS.primary} style={styles.headerIcon} />
          <Text style={styles.title}>Update Your Password</Text>
          <Text style={styles.subtitle}>Enter and confirm your new password below.</Text>
        </View>

        <View style={styles.form}>
          {/* We can remove the "Current Password" field as Supabase updateUser doesn't need it. */}
          {/* It verifies the user's session instead. */}
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor={COLORS.textSubtle}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor={COLORS.textSubtle}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.disabledButton]} 
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.textHeader} />
          ) : (
            <Text style={styles.primaryButtonText}>Update Password & Log Out</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
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