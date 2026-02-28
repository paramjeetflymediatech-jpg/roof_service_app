import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';
import { SERVER_URL } from '../config/api';

const fmtCurrency = value =>
  `CAD $${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
  })}`;

const fmtDate = value => {
  if (!value) return 'N/A';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? String(value).slice(0, 10)
    : d.toLocaleDateString();
};

const getStatusColor = status => {
  switch ((status || '').toLowerCase()) {
    case 'approved':
      return { bg: '#d4edda', text: '#155724', border: '#28a745' };
    case 'rejected':
      return { bg: '#f8d7da', text: '#721c24', border: '#dc3545' };
    case 'sent':
      return { bg: '#cce5ff', text: '#004085', border: '#007bff' };
    default:
      return { bg: '#fff3cd', text: '#856404', border: '#ffc107' };
  }
};

const ClientEstimateScreen = () => {
  const navigation = useNavigation();
  const { estimate } = useRoute().params;
  const [downloading, setDownloading] = useState(false);

  if (!estimate) return null;

  const statusColors = getStatusColor(estimate.status);

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      const userData = await AsyncStorage.getItem('user');
      const token = userData ? JSON.parse(userData).token : '';
      const url = `${SERVER_URL}/api/estimates/${estimate.id}/pdf?token=${token}`;
      await Linking.openURL(url);
    } catch (err) {
      console.log('PDF error:', err);
      Alert.alert('Error', 'Could not open the PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Hero Header ── */}
      <View style={styles.heroHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>

        <View style={styles.heroCenter}>
          <Text style={styles.heroLabel}>ESTIMATE</Text>
          <Text style={styles.heroNumber}>#{estimate.estimateNumber}</Text>
        </View>

        <TouchableOpacity
          style={[styles.pdfBtn, downloading && { opacity: 0.6 }]}
          onPress={handleDownload}
          disabled={downloading}
          activeOpacity={0.8}
        >
          {downloading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.pdfBtnText}>⬇ PDF</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Summary Banner ── */}
        <View style={styles.summaryBanner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerTotalLabel}>Grand Total</Text>
            <Text style={styles.bannerTotalValue}>{fmtCurrency(estimate.total)}</Text>
          </View>
          <View
            style={[
              styles.bannerStatusBadge,
              { backgroundColor: statusColors.bg, borderColor: statusColors.border },
            ]}
          >
            <Text style={[styles.bannerStatusText, { color: statusColors.text }]}>
              {estimate.status || 'Draft'}
            </Text>
          </View>
        </View>

        {/* ── Info Row ── */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>📅 DATE</Text>
            <Text style={styles.infoValue}>{fmtDate(estimate.date)}</Text>
          </View>
          {estimate.expiryDate ? (
            <View style={[styles.infoBox, styles.infoBoxRight]}>
              <Text style={styles.infoLabel}>⏳ EXPIRES</Text>
              <Text style={styles.infoValue}>{fmtDate(estimate.expiryDate)}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Client Info ── */}
        {(estimate.clientName || estimate.clientAddress) ? (
          <View style={styles.clientCard}>
            <Text style={styles.sectionLabel}>BILLED TO</Text>
            {estimate.clientName ? (
              <Text style={styles.clientName}>{estimate.clientName}</Text>
            ) : null}
            {estimate.clientEmail ? (
              <Text style={styles.clientDetail}>✉ {estimate.clientEmail}</Text>
            ) : null}
            {estimate.clientPhone ? (
              <Text style={styles.clientDetail}>📞 {estimate.clientPhone}</Text>
            ) : null}
            {estimate.clientAddress ? (
              <Text style={styles.clientDetail}>📍 {estimate.clientAddress}</Text>
            ) : null}
          </View>
        ) : null}

        {/* ── Work Items ── */}
        <Text style={styles.sectionTitle}>Work Items</Text>
        {(estimate.items || []).map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemIndex}>
              <Text style={styles.itemIndexText}>{index + 1}</Text>
            </View>
            <View style={styles.itemBody}>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <View style={styles.itemMeta}>
                <View style={styles.itemQtyPill}>
                  <Text style={styles.itemQtyText}>Qty {item.qty ?? 1}</Text>
                </View>
                {item.rate != null ? (
                  <Text style={styles.itemRate}>
                    @ {fmtCurrency(item.rate)} ea
                  </Text>
                ) : null}
              </View>
            </View>
            <Text style={styles.itemAmount}>{fmtCurrency(item.amount)}</Text>
          </View>
        ))}

        {/* ── Totals ── */}
        <View style={styles.totalsCard}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>{fmtCurrency(estimate.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax (5% GST)</Text>
            <Text style={styles.totalsValue}>{fmtCurrency(estimate.tax)}</Text>
          </View>
          <View style={styles.totalsDivider} />
          <View style={styles.totalsRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>{fmtCurrency(estimate.total)}</Text>
          </View>
        </View>

        {/* ── Notes ── */}
        {estimate.notes ? (
          <View style={styles.notesCard}>
            <Text style={styles.sectionLabel}>📝 NOTES</Text>
            <Text style={styles.notesText}>{estimate.notes}</Text>
          </View>
        ) : null}

        {/* ── Full-width Download ── */}
        <TouchableOpacity
          style={[styles.downloadFullBtn, downloading && { opacity: 0.6 }]}
          onPress={handleDownload}
          disabled={downloading}
          activeOpacity={0.8}
        >
          {downloading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.downloadFullBtnText}>⬇  Download PDF</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4fb' },

  // Hero Header
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(14),
    ...SHADOWS.medium,
  },
  backBtn: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { color: COLORS.white, fontSize: moderateScale(20), fontWeight: '700' },
  heroCenter: { alignItems: 'center', flex: 1 },
  heroLabel: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
  },
  heroNumber: { fontSize: moderateScale(15), fontWeight: '800', color: COLORS.white },
  pdfBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(7),
    borderRadius: moderateScale(8),
    minWidth: moderateScale(60),
    alignItems: 'center',
  },
  pdfBtnText: { color: COLORS.white, fontSize: moderateScale(12), fontWeight: '700' },

  scroll: { flex: 1 },
  scrollContent: { padding: moderateScale(16), paddingBottom: verticalScale(40) },

  // Summary Banner
  summaryBanner: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
    ...SHADOWS.small,
  },
  bannerLeft: {},
  bannerTotalLabel: {
    fontSize: moderateScale(11),
    color: COLORS.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: verticalScale(2),
  },
  bannerTotalValue: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: COLORS.primary,
  },
  bannerStatusBadge: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(20),
    borderWidth: 1,
  },
  bannerStatusText: { fontSize: moderateScale(11), fontWeight: '700', textTransform: 'capitalize' },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    marginBottom: verticalScale(12),
    gap: moderateScale(10),
  },
  infoBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    ...SHADOWS.small,
  },
  infoBoxRight: {},
  infoLabel: {
    fontSize: moderateScale(10),
    color: COLORS.textLight,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: verticalScale(4),
  },
  infoValue: { fontSize: moderateScale(13), fontWeight: '700', color: COLORS.text },

  // Client Card
  clientCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.small,
  },
  sectionLabel: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: verticalScale(6),
  },
  clientName: {
    fontSize: moderateScale(15),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(2),
  },
  clientDetail: {
    fontSize: moderateScale(13),
    color: COLORS.textLight,
    marginTop: verticalScale(2),
  },

  // Items
  sectionTitle: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.5,
    marginBottom: verticalScale(10),
    textTransform: 'uppercase',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    marginBottom: verticalScale(8),
    ...SHADOWS.small,
    gap: moderateScale(12),
  },
  itemIndex: {
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(1),
  },
  itemIndexText: { fontSize: moderateScale(12), fontWeight: '700', color: COLORS.primary },
  itemBody: { flex: 1 },
  itemDescription: {
    fontSize: moderateScale(13),
    color: COLORS.text,
    fontWeight: '600',
    lineHeight: verticalScale(18),
    marginBottom: verticalScale(6),
  },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: moderateScale(8) },
  itemQtyPill: {
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(8),
  },
  itemQtyText: { fontSize: moderateScale(11), color: COLORS.primary, fontWeight: '600' },
  itemRate: { fontSize: moderateScale(11), color: COLORS.textLight },
  itemAmount: {
    fontSize: moderateScale(14),
    fontWeight: '800',
    color: COLORS.primary,
    alignSelf: 'center',
  },

  // Totals
  totalsCard: {
    backgroundColor: COLORS.primary,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(12),
    ...SHADOWS.medium,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(10),
  },
  totalsLabel: { fontSize: moderateScale(13), color: 'rgba(255,255,255,0.75)' },
  totalsValue: { fontSize: moderateScale(13), color: COLORS.white, fontWeight: '600' },
  totalsDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: verticalScale(10),
  },
  grandTotalLabel: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    color: COLORS.white,
  },
  grandTotalValue: {
    fontSize: moderateScale(18),
    fontWeight: '900',
    color: COLORS.secondary,
  },

  // Notes
  notesCard: {
    backgroundColor: '#fffbf0',
    borderRadius: moderateScale(12),
    padding: moderateScale(16),
    borderWidth: 1,
    borderColor: '#ffe4a0',
    marginBottom: verticalScale(16),
  },
  notesText: {
    fontSize: moderateScale(13),
    color: COLORS.text,
    lineHeight: verticalScale(20),
    fontStyle: 'italic',
    marginTop: verticalScale(4),
  },

  // Full Download Button
  downloadFullBtn: {
    backgroundColor: COLORS.success,
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(15),
    alignItems: 'center',
    ...SHADOWS.small,
  },
  downloadFullBtnText: {
    color: COLORS.white,
    fontSize: moderateScale(15),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default ClientEstimateScreen;
