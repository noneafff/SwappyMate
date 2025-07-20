// File: app/converterMenu.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Keyboard,
  Image,
  ScrollView,
} from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { COLORS } from "../constants/colors";
import { supabase } from "../utils/supabase";
import CurrencyModal from "../components/CurrencyModal";
import { CURRENCY_DATA } from "../utils/currencyData";

const currencyTips = [
  "💡 Did you know? The Euro is used by over 340 million people every day.",
  "💡 Tip: Track currency trends before converting large amounts to save money.",
  "💡 Did you know? The British Pound (GBP) is the world's oldest currency still in use.",
  "💡 Tip: Weekdays often have better exchange rates than weekends due to market activity.",
  "💡 Fun Fact: Malaysian Ringgit banknotes feature a portrait of the country's first king, Tuanku Abdul Rahman.",
];

const CustomHeader = () => (
  <View style={styles.headerContentContainer}>
    <Image
      source={require("../assets/img/currency-exchange.png")}
      style={styles.headerLogo}
    />
    <Text style={styles.headerTitleText}>SwappyMate</Text>
  </View>
);
const MiniHistoryItem = ({ item }) => (
  <View style={styles.miniCard}>
    <View style={styles.miniConversionRow}>
      <Text style={styles.miniAmountText}>
        {item.fromSymbol}
        {item.fromAmount} {item.fromCode}
      </Text>
      <Text style={styles.miniFlagText}>{item.fromFlag}</Text>
    </View>
    <Feather
      name="arrow-down"
      size={16}
      color={COLORS.textSubtle}
      style={styles.miniArrowIcon}
    />
    <View style={styles.miniConversionRow}>
      <Text style={[styles.miniAmountText, styles.miniResultText]}>
        {item.toSymbol}
        {item.toAmount} {item.toCode}
      </Text>
      <Text style={styles.miniFlagText}>{item.toFlag}</Text>
    </View>
  </View>
);

export default function ConverterMenu() {
  const [fromCurrency, setFromCurrency] = useState({
    code: "GBP",
    symbol: "£",
    flag: "🇬🇧",
    name: "British Pound Sterling",
  });
  const [toCurrency, setToCurrency] = useState({
    code: "MYR",
    symbol: "RM",
    flag: "🇲🇾",
    name: "Malaysian Ringgit",
  });
  const [amount, setAmount] = useState("100");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [conversionRates, setConversionRates] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState("from");
  const [allCurrencies, setAllCurrencies] = useState([]);
  const [favoriteCodes, setFavoriteCodes] = useState([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [recentHistory, setRecentHistory] = useState([]);
  const API_KEY = process.env.EXPO_PUBLIC_API_KEY;

  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prevIndex) => (prevIndex + 1) % currencyTips.length);
    }, 7000);
    return () => clearInterval(tipInterval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        setIsDataLoading(true);
        setError(null);

        try {
          const currencyList = Object.values(CURRENCY_DATA)
            .filter((item) => item && item.code)
            .sort((a, b) => a.code.localeCompare(b.code));

          if (currencyList.length === 0) {
            throw new Error("Your currencyData.js file is empty or invalid.");
          }
          setAllCurrencies(currencyList);

          const ratesResponse = await fetch(
            `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${fromCurrency.code}`
          );
          const ratesData = await ratesResponse.json();
          if (ratesData.result !== "success")
            throw new Error(ratesData["error-type"] || "API request failed");
          setConversionRates(ratesData.conversion_rates);

          try {
            const {
              data: { user },
            } = await supabase.auth.getUser();
            if (user) {
              const [favoritesResponse, historyResponse] = await Promise.all([
                supabase
                  .from("favorite_currencies")
                  .select("currency_code")
                  .eq("user_id", user.id),
                supabase
                  .from("conversions")
                  .select("*")
                  .eq("user_id", user.id)
                  .order("created_at", { ascending: false })
                  .limit(2),
              ]);

              if (favoritesResponse.data)
                setFavoriteCodes(
                  favoritesResponse.data.map((fav) => fav.currency_code)
                );
              if (historyResponse.data) {
                const formatNumber = (value) =>
                  parseFloat(value)
                    ? parseFloat(value).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "0.00";
                const formattedData = historyResponse.data.map((item) => {
                  const fromData = CURRENCY_DATA[item.base_currency] || {
                    flag: "🏳️",
                    symbol: "",
                  };
                  const toData = CURRENCY_DATA[item.target_currency] || {
                    flag: "🏳️",
                    symbol: "",
                  };
                  return {
                    id: item.id,
                    fromAmount: formatNumber(item.amount_entered),
                    fromCode: item.base_currency,
                    fromFlag: fromData.flag,
                    fromSymbol: fromData.symbol,
                    toAmount: formatNumber(item.converted_value),
                    toCode: item.target_currency,
                    toFlag: toData.flag,
                    toSymbol: toData.symbol,
                  };
                });
                setRecentHistory(formattedData);
              }
            }
          } catch (err) {
            console.error(
              "Non-critical error fetching user data:",
              err.message
            );
          }
        } catch (err) {
          setError(`Error: ${err.message}`);
          setAllCurrencies([]);
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchData();
    }, [fromCurrency.code])
  );

  const handleConvert = () => {
    Keyboard.dismiss();
    if (!amount || !conversionRates) return;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      Alert.alert("Invalid Input", "Please enter a valid number.");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      const rate = conversionRates[toCurrency.code];
      if (rate) {
        const result = (numericAmount * rate).toFixed(2);
        setConvertedAmount(result.toString());
        saveConversion(amount, result);
      } else {
        Alert.alert(
          "Error",
          `Conversion rate for ${toCurrency.code} not found.`
        );
      }
      setIsLoading(false);
    }, 300);
  };
  const saveConversion = async (amountEntered, convertedValue) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from("conversions")
          .insert([
            {
              user_id: user.id,
              base_currency: fromCurrency.code,
              target_currency: toCurrency.code,
              amount_entered: parseFloat(amountEntered),
              converted_value: parseFloat(convertedValue),
            },
          ]);
        if (error) throw error;
      }
    } catch (error) {
      console.error("Error saving conversion:", error.message);
    }
  };
  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setAmount(convertedAmount);
    setConvertedAmount(amount);
  };
  const openModal = (type) => {
    setModalType(type);
    setModalVisible(true);
  };
  const handleSelectCurrency = (currency) => {
    if (modalType === "from") setFromCurrency(currency);
    else setToCurrency(currency);
    setModalVisible(false);
    setConvertedAmount("");
  };
  const handleToggleFavorite = async (currency) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const isFavorite = favoriteCodes.includes(currency.code);
      if (isFavorite) {
        setFavoriteCodes((prev) =>
          prev.filter((code) => code !== currency.code)
        );
        await supabase
          .from("favorite_currencies")
          .delete()
          .match({ user_id: user.id, currency_code: currency.code });
      } else {
        setFavoriteCodes((prev) => [...prev, currency.code]);
        await supabase
          .from("favorite_currencies")
          .insert({ user_id: user.id, currency_code: currency.code });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error.message);
      Alert.alert("Error", "Could not update your favorites.");
    }
  };

  const isDataReady = !isDataLoading && !error;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: COLORS.header },
          headerTintColor: COLORS.textHeader,
          headerTitleAlign: "left",
          headerTitleContainerStyle: { left: -10 },
          headerTitle: () => <CustomHeader />,
          headerBackTitle: "Menu",
          headerRight: () => (
            <TouchableOpacity>
              
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Currency Converter</Text>
        <View style={styles.converterCard}>
          {isDataLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.currencyInfo}
                  onPress={() => openModal("from")}
                  disabled={isDataLoading}
                >
                  <Text style={styles.flag}>{fromCurrency.flag}</Text>
                  <Text style={styles.currencySymbol}>
                    {fromCurrency.symbol}
                  </Text>
                  <Text style={styles.currencyCode}>{fromCurrency.code}</Text>
                  <Feather
                    name="chevron-down"
                    size={20}
                    color={COLORS.textSubtle}
                    style={{ marginLeft: 5 }}
                  />
                </TouchableOpacity>
                <TextInput
                  style={styles.input}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.separatorContainer}>
                <View style={styles.line} />
                <TouchableOpacity
                  onPress={handleSwap}
                  style={styles.swapButton}
                >
                  <Feather name="repeat" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <View style={styles.line} />
              </View>
              <View style={styles.inputRow}>
                <TouchableOpacity
                  style={styles.currencyInfo}
                  onPress={() => openModal("to")}
                  disabled={isDataLoading}
                >
                  <Text style={styles.flag}>{toCurrency.flag}</Text>
                  <Text style={styles.currencySymbol}>{toCurrency.symbol}</Text>
                  <Text style={styles.currencyCode}>{toCurrency.code}</Text>
                  <Feather
                    name="chevron-down"
                    size={20}
                    color={COLORS.textSubtle}
                    style={{ marginLeft: 5 }}
                  />
                </TouchableOpacity>
                {isLoading ? (
                  <ActivityIndicator color={COLORS.textDark} />
                ) : (
                  <Text style={styles.resultText}>{convertedAmount}</Text>
                )}
              </View>
            </>
          )}
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Conversion History</Text>
          {isDataReady && recentHistory.length > 0 ? (
            recentHistory.map((item) => (
              <MiniHistoryItem key={item.id} item={item} />
            ))
          ) : (
            <Text style={styles.noHistoryText}>
              Your recent conversions will appear here.
            </Text>
          )}
        </View>

        {/* MOVED: The tips section is now below the history section */}
        <View style={styles.tipContainer}>
          <Text style={styles.tipText}>{currencyTips[currentTipIndex]}</Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, !isDataReady && styles.disabledButton]}
          onPress={handleConvert}
          disabled={!isDataReady}
        >
          <Text style={styles.primaryButtonText}>Convert</Text>
        </TouchableOpacity>
      </View>
      <CurrencyModal
        isVisible={isModalVisible}
        currencies={allCurrencies}
        onSelect={handleSelectCurrency}
        onClose={() => setModalVisible(false)}
        favorites={favoriteCodes}
        onToggleFavorite={handleToggleFavorite}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerContentContainer: { flexDirection: "row", alignItems: "center" },
  headerLogo: { width: 30, height: 30, marginRight: 10 },
  headerTitleText: {
    color: COLORS.textHeader,
    fontSize: 20,
    fontWeight: "bold",
  },
  content: { padding: 20, paddingBottom: 120 },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.textDark,
    marginBottom: 20,
    textAlign: "center",
  },
  converterCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
    minHeight: 180,
    justifyContent: "center",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currencyInfo: { flexDirection: "row", alignItems: "center" },
  disabledCurrencyInfo: { opacity: 0.5 },
  flag: { fontSize: 32, marginRight: 10 },
  currencySymbol: {
    fontSize: 20,
    fontWeight: "600",
    color: COLORS.textSubtle,
    marginRight: 8,
  },
  currencyCode: { fontSize: 20, fontWeight: "bold", color: COLORS.textDark },
  input: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.accent || COLORS.primary,
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  resultText: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.textDark,
    textAlign: "right",
    flex: 1,
    marginLeft: 10,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  swapButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    marginHorizontal: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  disabledButton: { backgroundColor: COLORS.textSubtle },
  primaryButtonText: {
    color: COLORS.textHeader,
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: { textAlign: "center", color: COLORS.error, fontSize: 16 },
  tipContainer: {
    marginTop: 25,
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipText: {
    color: COLORS.textSubtle,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  historySection: { marginTop: 25, marginBottom: 0 }, // Changed marginBottom to 0
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 10,
  },
  miniCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniConversionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  miniAmountText: { fontSize: 16, fontWeight: "500", color: COLORS.textDark },
  miniResultText: { fontWeight: "bold", color: COLORS.primary },
  miniFlagText: { fontSize: 20 },
  miniArrowIcon: { alignSelf: "center", marginVertical: 4 },
  noHistoryText: {
    textAlign: "center",
    color: COLORS.textSubtle,
    fontStyle: "italic",
    marginTop: 10,
  },
});
