// File: app/recentConvert.jsx

import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { supabase } from "../utils/supabase";
import { CURRENCY_DATA } from "../utils/currencyData";

const CustomHeader = () => (
  <View style={styles.headerContentContainer}>
    <Image
      source={require("../assets/img/currency-exchange.png")}
      style={styles.headerLogo}
    />
    <Text style={styles.headerTitleText}>SwappyMate</Text>
  </View>
);

const HistoryItem = ({ item, onDelete }) => {
  const formattedDate = new Date(item.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.dateContainer}>
          <Feather name="calendar" size={16} color={COLORS.textSubtle} />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteButton}>
          <Feather name="trash-2" size={20} color={COLORS.error} />
        </TouchableOpacity>
      </View>
      <View style={styles.conversionRow}>
        <Text style={styles.amountText}>
          {item.fromSymbol}{item.fromAmount} {item.fromCode}
        </Text>
        <Text style={styles.flagText}>{item.fromFlag}</Text>
      </View>
      <Feather
        name="arrow-down"
        size={20}
        color={COLORS.textSubtle}
        style={styles.arrowIcon}
      />
      <View style={styles.conversionRow}>
        <Text style={[styles.amountText, styles.resultText]}>
          {item.toSymbol}{item.toAmount} {item.toCode}
        </Text>
        <Text style={styles.flagText}>{item.toFlag}</Text>
      </View>
    </View>
  );
};

export default function RecentConversionsScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        try {
          setLoading(true);
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            setHistory([]);
            setLoading(false);
            return;
          }

          const { data, error } = await supabase
            .from("conversions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;

          if (data) {
            const formattedData = data.map((item) => {
              const fromData = CURRENCY_DATA[item.base_currency] || { flag: "🏳️", symbol: "" };
              const toData = CURRENCY_DATA[item.target_currency] || { flag: "🏳️", symbol: "" };
              return {
                id: item.id,
                date: item.created_at,
                fromAmount: parseFloat(item.amount_entered).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                fromCode: item.base_currency,
                fromFlag: fromData.flag,
                fromSymbol: fromData.symbol,
                toAmount: parseFloat(item.converted_value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                toCode: item.target_currency,
                toFlag: toData.flag,
                toSymbol: toData.symbol,
              };
            });
            setHistory(formattedData);
          }
        } catch (error) {
          if (error.message !== "No user logged in") {
            Alert.alert("Error", "Could not fetch conversion history.");
          }
          console.error("Error fetching history:", error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Conversion",
      "Are you sure you want to delete this history item?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const originalHistory = [...history];
            setHistory(currentHistory => currentHistory.filter(item => item.id !== id));
            
            const { error } = await supabase
              .from('conversions')
              .delete()
              .eq('id', id);
              
            if (error) {
              Alert.alert("Error", "Could not delete the conversion. Please try again.");
              console.error("Error deleting conversion:", error.message);
              setHistory(originalHistory); // Revert the UI if the delete fails
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.textHeader,
          headerTitle: () => <CustomHeader />,
          headerBackTitle: "Back",
          headerTitleAlign: "left",
          headerTitleContainerStyle: { left: -10 },
        }}
      />
      <FlatList
        data={history}
        renderItem={({ item }) => <HistoryItem item={item} onDelete={handleDelete} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        ListHeaderComponent={<Text style={styles.pageTitle}>Conversion History</Text>}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <>
                <Feather name="clock" size={48} color={COLORS.textSubtle} />
                <Text style={styles.emptyText}>No recent conversions found.</Text>
                <Text style={styles.emptySubtext}>Your past conversions will appear here.</Text>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerContentContainer: { flexDirection: "row", alignItems: "center" },
  headerLogo: { width: 30, height: 30, marginRight: 10 },
  headerTitleText: { color: COLORS.textHeader, fontSize: 20, fontWeight: "bold" },
  listContainer: { padding: 20, paddingBottom: 40 },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: { marginLeft: 8, fontSize: 14, color: COLORS.textSubtle },
  deleteButton: {
    padding: 5,
  },
  conversionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountText: { fontSize: 20, fontWeight: "500", color: COLORS.textDark },
  resultText: { fontWeight: "bold", color: COLORS.primary },
  flagText: { fontSize: 24 },
  arrowIcon: { alignSelf: "center", marginVertical: 8 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  emptySubtext: { marginTop: 4, fontSize: 14, color: COLORS.textSubtle },
});