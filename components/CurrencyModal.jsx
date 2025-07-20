// File: components/CurrencyModal.jsx

import React, { useState, useMemo } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TextInput,
  SectionList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

const CurrencyItem = ({ item, onSelect, isFavorite, onToggleFavorite }) => (
  <TouchableOpacity style={styles.itemContainer} onPress={() => onSelect(item)}>
    <View style={styles.itemLeft}>
      <Text style={styles.itemFlag}>{item.flag || '🏳️'}</Text>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemCode}>{item.code}</Text>
        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
      </View>
    </View>
    <View style={styles.itemRight}>
      <Text style={styles.itemSymbol}>{item.symbol}</Text>
      <TouchableOpacity onPress={() => onToggleFavorite(item)} style={styles.favoriteIcon}>
        <Feather name="star" size={22} color={isFavorite ? COLORS.accent : COLORS.border} />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

export default function CurrencyModal({ isVisible, currencies, onSelect, onClose, favorites, onToggleFavorite }) {
  const [searchQuery, setSearchQuery] = useState('');

  const sections = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    
    const filtered = currencies.filter(currency =>
      !searchQuery ||
      currency.code.toLowerCase().includes(lowercasedQuery) ||
      (currency.name && currency.name.toLowerCase().includes(lowercasedQuery))
    );

    const favs = filtered.filter(c => favorites.includes(c.code));
    const others = filtered.filter(c => !favorites.includes(c.code));

    const result = [];
    if (favs.length > 0) {
      result.push({ title: 'FAVORITES', data: favs });
    }
    if (others.length > 0) {
      result.push({ title: 'ALL CURRENCIES', data: others });
    }
    return result;
  }, [currencies, searchQuery, favorites]);

  const handleSelect = (currency) => {
    onSelect(currency);
    setSearchQuery('');
  };

  const handleClose = () => {
    setSearchQuery('');
    onClose();
  }

  return (
    <Modal visible={isVisible} onRequestClose={handleClose} animationType="slide">
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Currency</Text>
          <TouchableOpacity onPress={handleClose}><Feather name="x" size={28} color={COLORS.textHeader} /></TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color={COLORS.textSubtle} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search currency by code or name"
            placeholderTextColor={COLORS.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.code + index}
          renderItem={({ item, section }) => (
            <CurrencyItem
              item={item}
              onSelect={handleSelect}
              isFavorite={section.title === 'FAVORITES'}
              onToggleFavorite={onToggleFavorite}
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.listHeader}>{title}</Text>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No currencies found.</Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: COLORS.header },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.textHeader },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, marginHorizontal: 20, marginTop: 20, marginBottom: 10, paddingHorizontal: 15, borderWidth: 1, borderColor: COLORS.border },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, fontSize: 16, color: COLORS.textDark },
  itemContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: COLORS.white },
  itemLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  itemRight: { flexDirection: 'row', alignItems: 'center' },
  itemFlag: { fontSize: 30, marginRight: 15 },
  itemTextContainer: { flex: 1, marginRight: 10 },
  itemCode: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark },
  itemName: { fontSize: 14, color: COLORS.textSubtle },
  itemSymbol: { fontSize: 16, color: COLORS.textDark, marginRight: 15 },
  favoriteIcon: { padding: 5 },
  listHeader: { fontSize: 12, fontWeight: '700', color: COLORS.textSubtle, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: COLORS.background, textTransform: 'uppercase' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: COLORS.textSubtle },
});