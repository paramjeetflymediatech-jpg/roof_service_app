import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Alert, Platform, StatusBar,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api, SERVER_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const fmtDate = v => {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d) ? String(v).slice(0, 10) : d.toLocaleDateString();
};

const statusColor = s => {
    if (!s) return COLORS.textLight;
    const sl = s.toLowerCase();
    if (sl === 'accepted' || sl === 'paid') return '#2e7d32';
    if (sl === 'sent') return COLORS.info;
    if (sl === 'rejected') return COLORS.error;
    return COLORS.warning;
};

const AdminEstimatesScreen = () => {
    const navigation = useNavigation();
    const [estimates, setEstimates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [downloadingId, setDownloadingId] = useState(null);

    const fetchEstimates = async () => {
        try {
            const res = await api.getEstimates({ limit: 100 });
            const data = res.data?.data || res.data?.items || res.data || [];
            setEstimates(Array.isArray(data) ? data : []);
        } catch (e) {
            console.log('Fetch estimates error:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { setLoading(true); fetchEstimates(); }, []));

    const onRefresh = () => { setRefreshing(true); fetchEstimates(); };

    const handleDelete = (id) => {
        Alert.alert('Delete Estimate', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive', onPress: async () => {
                    try {
                        await api.deleteEstimate(id);
                        setEstimates(prev => prev.filter(e => e.id !== id));
                    } catch (e) { Alert.alert('Error', 'Could not delete estimate.'); }
                }
            }
        ]);
    };

    const handleDownloadPDF = async (est) => {
        try {
            setDownloadingId(est.id);
            const userData = await AsyncStorage.getItem('user');
            const token = userData ? JSON.parse(userData).token : '';
            await Linking.openURL(`${SERVER_URL}/api/estimates/${est.id}/pdf?token=${token}`);
        } catch (e) {
            Alert.alert('Error', 'Could not open PDF.');
        } finally {
            setDownloadingId(null);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                    <Text style={styles.estNumber}>#{item.estimateNumber || item.id?.slice(0, 8)}</Text>
                    <Text style={styles.clientName}>{item.clientName || 'Unknown Client'}</Text>
                    <Text style={styles.date}>{fmtDate(item.date)}</Text>
                </View>
                <View style={styles.cardRight}>
                    <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '20', borderColor: statusColor(item.status) }]}>
                        <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>
                            {item.status || 'Draft'}
                        </Text>
                    </View>
                    <Text style={styles.amount}>
                        ${parseFloat(item.total || 0).toFixed(2)}
                    </Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => navigation.navigate('AdminCreateEstimate', { estimate: item })}
                >
                    <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.pdfBtn]}
                    disabled={downloadingId === item.id}
                    onPress={() => handleDownloadPDF(item)}
                >
                    {downloadingId === item.id
                        ? <ActivityIndicator size="small" color={COLORS.white} />
                        : <Text style={styles.pdfBtnText}>PDF</Text>
                    }
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(item.id)}
                >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Estimates</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('AdminCreateEstimate', {})}
                >
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
            ) : (
                <FlatList
                    data={estimates}
                    keyExtractor={i => String(i.id)}
                    renderItem={renderItem}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No estimates yet</Text>
                            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AdminCreateEstimate', {})}>
                                <Text style={styles.emptyBtnText}>Create First Estimate</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Footer nav */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AdminDashboard')}>
                    <Text style={styles.navIcon}>📊</Text>
                    <Text style={styles.navLabel}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Text style={[styles.navIcon, { color: COLORS.primary }]}>📋</Text>
                    <Text style={[styles.navLabel, { color: COLORS.primary }]}>Estimates</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AdminInvoices')}>
                    <Text style={styles.navIcon}>🧾</Text>
                    <Text style={styles.navLabel}>Invoices</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AdminProfile')}>
                    <Text style={styles.navIcon}>👤</Text>
                    <Text style={styles.navLabel}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: verticalScale(40) },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(35),
        paddingBottom: verticalScale(16),
        paddingHorizontal: moderateScale(20),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: { fontSize: moderateScale(20), fontWeight: '700', color: COLORS.white },
    addBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: moderateScale(14),
        paddingVertical: verticalScale(7),
        borderRadius: moderateScale(20),
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    addBtnText: { color: COLORS.white, fontWeight: '700', fontSize: moderateScale(13) },
    list: { padding: moderateScale(16), paddingBottom: verticalScale(90) },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: moderateScale(14),
        padding: moderateScale(16),
        marginBottom: verticalScale(12),
        ...SHADOWS.small,
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(12) },
    cardLeft: { flex: 1 },
    cardRight: { alignItems: 'flex-end', gap: verticalScale(6) },
    estNumber: { fontSize: moderateScale(15), fontWeight: '700', color: COLORS.text, marginBottom: 2 },
    clientName: { fontSize: moderateScale(13), color: COLORS.textLight },
    date: { fontSize: moderateScale(12), color: COLORS.textLight, marginTop: 2 },
    badge: {
        paddingHorizontal: moderateScale(8),
        paddingVertical: verticalScale(3),
        borderRadius: moderateScale(6),
        borderWidth: 1,
    },
    badgeText: { fontSize: moderateScale(10), fontWeight: '700', textTransform: 'capitalize' },
    amount: { fontSize: moderateScale(16), fontWeight: '800', color: COLORS.text },
    actions: { flexDirection: 'row', gap: moderateScale(8) },
    actionBtn: {
        flex: 1,
        paddingVertical: verticalScale(8),
        borderRadius: moderateScale(8),
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: verticalScale(34),
    },
    editBtn: { backgroundColor: COLORS.primary + '15', borderWidth: 1, borderColor: COLORS.primary },
    editBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: moderateScale(12) },
    pdfBtn: { backgroundColor: '#1e3a5f', flex: 0.8 },
    pdfBtnText: { color: COLORS.white, fontWeight: '700', fontSize: moderateScale(12) },
    deleteBtn: { backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#ef9a9a', flex: 0.8 },
    deleteBtnText: { color: COLORS.error, fontWeight: '700', fontSize: moderateScale(12) },
    emptyText: { fontSize: moderateScale(16), color: COLORS.textLight, marginBottom: verticalScale(16) },
    emptyBtn: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: moderateScale(24),
        paddingVertical: verticalScale(12),
        borderRadius: moderateScale(10),
    },
    emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: moderateScale(14) },
    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        flexDirection: 'row', backgroundColor: COLORS.white,
        paddingVertical: verticalScale(12),
        paddingBottom: Platform.OS === 'ios' ? verticalScale(30) : verticalScale(12),
        borderTopWidth: 1, borderTopColor: COLORS.border,
        justifyContent: 'space-around', ...SHADOWS.large,
    },
    navItem: { alignItems: 'center' },
    navIcon: { fontSize: moderateScale(22), color: COLORS.textLight, marginBottom: verticalScale(2) },
    navLabel: { fontSize: moderateScale(10), color: COLORS.textLight, fontWeight: '600' },
});

export default AdminEstimatesScreen;
