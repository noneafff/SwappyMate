// File: app/mainmenu.jsx

import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { Stack, router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { supabase } from '../utils/supabase';

// Helper component is now outside and uses the static styles object below
const CustomHeader = () => {
  return (
    <View style={styles.headerContentContainer}>
      <Image
        source={require('../assets/img/currency-exchange.png')}
        style={styles.headerLogo}
      />
      <Text style={styles.headerTitleText}>SwappyMate</Text>
    </View>
  );
};

export default function MainMenu() {
  const [username, setUsername] = useState('');
  
  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data, error, status } = await supabase
              .from('profiles')
              .select(`username`)
              .eq('id', user.id)
              .single();

            if (error && status !== 406) throw error;
            if (data) setUsername(data.username);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error.message);
        }
      };
      fetchProfile();
    }, [])
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/welcome');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.textHeader,
          headerBackVisible: false,
          headerTitle: () => <CustomHeader />,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 10 }}>
              <Feather name="log-out" size={24} color={COLORS.textHeader} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <View style={styles.content}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Hey, Welcome,</Text>
          <Text style={styles.welcomeTitle}>{username ? `${username}!` : ''}</Text>
          <Text style={styles.welcomeSubtitle}>What would you like to do today?</Text>
        </View>

        <TouchableOpacity 
          style={styles.card} 
          onPress={() => router.push('/converterMenu')}
        >
          <Image source={require('../assets/img/money-exchange.png')} style={styles.cardImage} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Currency Converter</Text>
            <Text style={styles.cardDescription}>Perform real-time currency conversions.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/recentConvert')}
        >
          <Image source={require('../assets/img/history.png')} style={styles.cardImage} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>View Recent Conversions</Text>
            <Text style={styles.cardDescription}>Check your past conversion history.</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/setting')}
        >
          <Image source={require('../assets/img/setting.png')} style={styles.cardImage} />
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>Setting</Text>
            <Text style={styles.cardDescription}>Manage your account.</Text>
          </View>
        </TouchableOpacity>

        {/* --- THIS IS THE NEW ABOUT BUTTON --- */}
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/about')} // Navigates to the new about page
        >
          {/* Using a Feather icon inside a styled View to match the other cards */}
          <Image source={require('../assets/img/about1.png')} style={styles.cardImage} />
          
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>About SwappyMate</Text>
            <Text style={styles.cardDescription}>App information and developer credit.</Text>
          </View>
        </TouchableOpacity>
        {/* --- END OF NEW BUTTON --- */}
        
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
  headerContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerTitleText: {
    color: COLORS.textHeader,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.textSubtle,
    marginTop: 8,
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
  cardImage: {
    width: 50,
    height: 50,
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