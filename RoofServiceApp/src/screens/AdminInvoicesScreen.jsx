import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, Alert, Platform, StatusBar, Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, SERVER_URL } from '../config/api';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';
import BeautifulAlert from '../components/BeautifulAlert';

const fmtDate = v => {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d) ? String(v).slice(0, 10) : d.toLocaleDateString();
};

const statusColor = s => {
    if (!s) return COLORS.textLight;
    const sl = s.toLowerCase();
    if (sl === 'paid') return '#2e7d32';
    if (sl === 'sent') return COLORS.info;
    if (sl === 'overdue') return COLORS.error;
    return COLORS.warning;
};

const AdminInvoicesScreen = () => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        title: '',
        message: '',
        confirmText: 'OK',
        type: 'default',
        onConfirm: () => setAlertVisible(false),
        showCancel: false,
    });
    const [downloadingId, setDownloadingId] = useState(null);

    const fetchInvoices = async () => {
        try {
            const res = await api.getInvoices({ limit: 100 });
            const data = res.data?.data || res.data?.items || res.data || [];
            setInvoices(Array.isArray(data) ? data : []);
        } catch (e) {
            console.log('Fetch invoices error:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(useCallback(() => { setLoading(true); fetchInvoices(); }, []));
    const onRefresh = () => { setRefreshing(true); fetchInvoices(); };

    const confirmDelete = (id) => {
        setAlertConfig({
            title: 'Delete Invoice',
            message: 'Are you sure you want to delete this invoice? This action cannot be undone.',
            confirmText: 'Delete',
            type: 'destructive',
            showCancel: true,
            onConfirm: async () => {
                setAlertVisible(false);
                try {
                    await api.deleteInvoice(id);
                    setInvoices(prev => prev.filter(i => i.id !== id));
                } catch (error) {
                    setAlertConfig({
                        title: 'Error',
                        message: 'Failed to delete invoice.',
                        type: 'destructive',
                        onConfirm: () => setAlertVisible(false),
                    });
                    setAlertVisible(true);
                }
            }
        });
        setAlertVisible(true);
    };

    const handleDownloadPDF = async (inv) => {
        try {
            setDownloadingId(inv.id);
            const userData = await AsyncStorage.getItem('user');
            const token = userData ? JSON.parse(userData).token : '';
            await Linking.openURL(`${SERVER_URL}/api/invoices/${inv.id}/pdf?token=${token}`);
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
                    <Text style={styles.invNumber}>#{item.invoiceNumber || item.id?.slice(0, 8)}</Text>
                    <Text style={styles.clientName}>{item.clientName || 'Unknown Client'}</Text>
                    <Text style={styles.date}>
                        Issued: {fmtDate(item.date)}
                        {item.dueDate ? `  Due: ${fmtDate(item.dueDate)}` : ''}
                    </Text>
                </View>
                <View style={styles.cardRight}>
                    <View style={[styles.badge, { backgroundColor: statusColor(item.status) + '20', borderColor: statusColor(item.status) }]}>
                        <Text style={[styles.badgeText, { color: statusColor(item.status) }]}>
                            {item.status || 'Pending'}
                        </Text>
                    </View>
                    <Text style={styles.amount}>${parseFloat(item.total || 0).toFixed(2)}</Text>
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionBtn, styles.editBtn]}
                    onPress={() => navigation.navigate('AdminCreateInvoice', { invoice: item })}
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
                    onPress={() => confirmDelete(item.id)}
                >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a4a2e" />
            <View style={[styles.header, { backgroundColor: '#1a4a2e' }]}>
                <Text style={styles.headerTitle}>Invoices</Text>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => navigation.navigate('AdminCreateInvoice', {})}
                >
                    <Text style={styles.addBtnText}>+ New</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#1a4a2e" /></View>
            ) : (
                <FlatList
                    data={invoices}
                    keyExtractor={i => String(i.id)}
                    renderItem={renderItem}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1a4a2e" />}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No invoices yet</Text>
                            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: '#1a4a2e' }]}
                                onPress={() => navigation.navigate('AdminCreateInvoice', {})}>
                                <Text style={styles.emptyBtnText}>Create First Invoice</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Footer navigation */}
            <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(12) }]}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('AdminDashboard')}
                >
                    <Text style={styles.navIcon}>📊</Text>
                    <Text style={styles.navLabel}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AdminEstimates')}>
                    <Text style={styles.navIcon}>📋</Text>
                    <Text style={styles.navLabel}>Estimates</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Text style={[styles.navIcon, { color: '#1a4a2e' }]}>🧾</Text>
                    <Text style={[styles.navLabel, { color: '#1a4a2e' }]}>Invoices</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('AdminProfile')}>
                    <Text style={styles.navIcon}>👤</Text>
                    <Text style={styles.navLabel}>Profile</Text>
                </TouchableOpacity>
            </View>

            <BeautifulAlert
                visible={alertVisible}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText={alertConfig.confirmText}
                onConfirm={alertConfig.onConfirm}
                onCancel={() => setAlertVisible(false)}
                type={alertConfig.type}
                showCancel={alertConfig.showCancel}
                cancelText="Cancel"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: verticalScale(40) },
    header: {
        paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(35),
        paddingBottom: verticalScale(16),
        paddingHorizontal: moderateScale(20),
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    },
    headerTitle: { fontSize: moderateScale(20), fontWeight: '700', color: COLORS.white },
    addBtn: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: moderateScale(14), paddingVertical: verticalScale(7),
        borderRadius: moderateScale(20), borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)',
    },
    addBtnText: { color: COLORS.white, fontWeight: '700', fontSize: moderateScale(13) },
    list: { padding: moderateScale(16), paddingBottom: verticalScale(90) },
    card: { backgroundColor: COLORS.white, borderRadius: moderateScale(14), padding: moderateScale(16), marginBottom: verticalScale(12), ...SHADOWS.small },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(12) },
    cardLeft: { flex: 1 },
    cardRight: { alignItems: 'flex-end', gap: verticalScale(6) },
    invNumber: { fontSize: moderateScale(15), fontWeight: '700', color: COLORS.text, marginBottom: 2 },
    clientName: { fontSize: moderateScale(13), color: COLORS.textLight },
    date: { fontSize: moderateScale(12), color: COLORS.textLight, marginTop: 2 },
    badge: { paddingHorizontal: moderateScale(8), paddingVertical: verticalScale(3), borderRadius: moderateScale(6), borderWidth: 1 },
    badgeText: { fontSize: moderateScale(10), fontWeight: '700', textTransform: 'capitalize' },
    amount: { fontSize: moderateScale(16), fontWeight: '800', color: COLORS.text },
    actions: { flexDirection: 'row', gap: moderateScale(8) },
    actionBtn: { flex: 1, paddingVertical: verticalScale(8), borderRadius: moderateScale(8), alignItems: 'center', justifyContent: 'center', minHeight: verticalScale(34) },
    editBtn: { backgroundColor: '#e8f5e9', borderWidth: 1, borderColor: '#1a4a2e' },
    editBtnText: { color: '#1a4a2e', fontWeight: '700', fontSize: moderateScale(12) },
    pdfBtn: { backgroundColor: '#1a4a2e', flex: 0.8 },
    pdfBtnText: { color: COLORS.white, fontWeight: '700', fontSize: moderateScale(12) },
    deleteBtn: { backgroundColor: '#ffebee', borderWidth: 1, borderColor: '#ef9a9a', flex: 0.8 },
    deleteBtnText: { color: COLORS.error, fontWeight: '700', fontSize: moderateScale(12) },
    emptyText: { fontSize: moderateScale(16), color: COLORS.textLight, marginBottom: verticalScale(16) },
    emptyBtn: { paddingHorizontal: moderateScale(24), paddingVertical: verticalScale(12), borderRadius: moderateScale(10) },
    emptyBtnText: { color: COLORS.white, fontWeight: '700', fontSize: moderateScale(14) },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingVertical: verticalScale(12),
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        justifyContent: 'space-around',
        ...SHADOWS.large,
    },
    navItem: { alignItems: 'center' },
    navIcon: { fontSize: moderateScale(22), color: COLORS.textLight, marginBottom: verticalScale(2) },
    navLabel: { fontSize: moderateScale(10), color: COLORS.textLight, fontWeight: '600' },
});

export default AdminInvoicesScreen;
