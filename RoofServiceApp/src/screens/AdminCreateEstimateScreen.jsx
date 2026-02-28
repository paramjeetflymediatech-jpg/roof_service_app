import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
    ActivityIndicator, Alert, Platform, StatusBar, KeyboardAvoidingView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../config/api';
import { COLORS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const today = () => new Date().toISOString().split('T')[0];

const AdminCreateEstimateScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const existing = route.params?.estimate || null;
    const leadId = route.params?.leadId || null;
    const prefill = route.params?.prefill || {};
    const isEdit = !!existing;

    const [form, setForm] = useState({
        clientName: existing?.clientName || prefill.clientName || '',
        clientEmail: existing?.clientEmail || prefill.clientEmail || '',
        clientPhone: existing?.clientPhone || prefill.clientPhone || '',
        clientAddress: existing?.clientAddress || prefill.clientAddress || '',
        date: existing?.date?.slice(0, 10) || today(),
        expiryDate: existing?.expiryDate?.slice(0, 10) || '',
        notes: existing?.notes || '',
        status: existing?.status || 'Draft',
    });

    const [items, setItems] = useState(
        (existing?.items && existing.items.length > 0)
            ? existing.items.map(i => ({ description: i.description || '', rate: String(i.rate || 0), qty: String(i.qty || 1) }))
            : [{ description: '', rate: '', qty: '1' }]
    );

    const [saving, setSaving] = useState(false);

    const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const setItem = (idx, key, val) => {
        setItems(prev => prev.map((item, i) => i === idx ? { ...item, [key]: val } : item));
    };

    const addItem = () => setItems(prev => [...prev, { description: '', rate: '', qty: '1' }]);
    const removeItem = (idx) => {
        if (items.length === 1) return Alert.alert('', 'At least one line item is required.');
        setItems(prev => prev.filter((_, i) => i !== idx));
    };

    const calcSubtotal = () => items.reduce((sum, it) => {
        const r = parseFloat(it.rate) || 0;
        const q = parseFloat(it.qty) || 0;
        return sum + r * q;
    }, 0);

    const subtotal = calcSubtotal();
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const handleSave = async () => {
        if (!form.clientName.trim()) return Alert.alert('Validation', 'Client name is required.');
        if (items.some(it => !it.description.trim())) return Alert.alert('Validation', 'All items need a description.');

        setSaving(true);
        try {
            const payload = {
                ...form,
                leadId: leadId || existing?.leadId || undefined,
                items: items.map(it => ({
                    description: it.description,
                    rate: parseFloat(it.rate) || 0,
                    qty: parseFloat(it.qty) || 1,
                    amount: (parseFloat(it.rate) || 0) * (parseFloat(it.qty) || 1),
                })),
                subtotal,
                tax,
                total,
            };

            if (isEdit) {
                await api.updateEstimate(existing.id, payload);
                Alert.alert('Success', 'Estimate updated!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
            } else {
                await api.createEstimate(payload);
                Alert.alert('Success', 'Estimate created!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
            }
        } catch (e) {
            console.log('Save estimate error:', e?.response?.data || e.message);
            Alert.alert('Error', e?.response?.data?.message || 'Could not save estimate. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEdit ? 'Edit Estimate' : 'New Estimate'}</Text>
                <View style={{ width: moderateScale(60) }} />
            </View>

            <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

                {/* Client Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Client Information</Text>
                    {[
                        { label: 'Client Name *', key: 'clientName', placeholder: 'Full name' },
                        { label: 'Email', key: 'clientEmail', placeholder: 'email@example.com', keyboard: 'email-address' },
                        { label: 'Phone', key: 'clientPhone', placeholder: '604-000-0000', keyboard: 'phone-pad' },
                        { label: 'Address', key: 'clientAddress', placeholder: 'Service address', multi: true },
                    ].map(({ label, key, placeholder, keyboard, multi }) => (
                        <View key={key} style={styles.field}>
                            <Text style={styles.label}>{label}</Text>
                            <TextInput
                                style={[styles.input, multi && styles.inputMulti]}
                                value={form[key]}
                                onChangeText={v => setField(key, v)}
                                placeholder={placeholder}
                                placeholderTextColor={COLORS.textLight}
                                keyboardType={keyboard || 'default'}
                                multiline={multi}
                                numberOfLines={multi ? 3 : 1}
                                autoCapitalize={key === 'clientEmail' ? 'none' : 'words'}
                            />
                        </View>
                    ))}
                </View>

                {/* Dates */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dates & Status</Text>
                    <View style={styles.row}>
                        <View style={[styles.field, { flex: 1 }]}>
                            <Text style={styles.label}>Date</Text>
                            <TextInput style={styles.input} value={form.date} onChangeText={v => setField('date', v)}
                                placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textLight} keyboardType="numeric" maxLength={10} />
                        </View>
                        <View style={{ width: moderateScale(12) }} />
                        <View style={[styles.field, { flex: 1 }]}>
                            <Text style={styles.label}>Expiry Date</Text>
                            <TextInput style={styles.input} value={form.expiryDate} onChangeText={v => setField('expiryDate', v)}
                                placeholder="YYYY-MM-DD" placeholderTextColor={COLORS.textLight} keyboardType="numeric" maxLength={10} />
                        </View>
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.statusRow}>
                            {['Draft', 'Sent', 'Accepted', 'Rejected'].map(s => (
                                <TouchableOpacity
                                    key={s}
                                    style={[styles.statusChip, form.status === s && styles.statusChipActive]}
                                    onPress={() => setField('status', s)}
                                >
                                    <Text style={[styles.statusChipText, form.status === s && styles.statusChipTextActive]}>{s}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Line Items */}
                <View style={styles.section}>
                    <View style={styles.sectionRow}>
                        <Text style={styles.sectionTitle}>Line Items</Text>
                        <TouchableOpacity onPress={addItem} style={styles.addItemBtn}>
                            <Text style={styles.addItemBtnText}>+ Add</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Column headers */}
                    <View style={styles.itemHeader}>
                        <Text style={[styles.itemHeaderText, { flex: 2 }]}>Description</Text>
                        <Text style={[styles.itemHeaderText, { flex: 1, textAlign: 'right' }]}>Rate</Text>
                        <Text style={[styles.itemHeaderText, { width: moderateScale(40), textAlign: 'center' }]}>Qty</Text>
                        <Text style={[styles.itemHeaderText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
                    </View>

                    {items.map((item, idx) => {
                        const amt = (parseFloat(item.rate) || 0) * (parseFloat(item.qty) || 0);
                        return (
                            <View key={idx} style={styles.itemRow}>
                                <TextInput
                                    style={[styles.itemInput, { flex: 2 }]}
                                    value={item.description}
                                    onChangeText={v => setItem(idx, 'description', v)}
                                    placeholder="Description"
                                    placeholderTextColor={COLORS.textLight}
                                    multiline
                                />
                                <TextInput
                                    style={[styles.itemInput, { flex: 1, textAlign: 'right' }]}
                                    value={item.rate}
                                    onChangeText={v => setItem(idx, 'rate', v)}
                                    placeholder="0"
                                    placeholderTextColor={COLORS.textLight}
                                    keyboardType="decimal-pad"
                                />
                                <TextInput
                                    style={[styles.itemInput, { width: moderateScale(40), textAlign: 'center' }]}
                                    value={item.qty}
                                    onChangeText={v => setItem(idx, 'qty', v)}
                                    placeholder="1"
                                    placeholderTextColor={COLORS.textLight}
                                    keyboardType="decimal-pad"
                                />
                                <Text style={[styles.itemAmount, { flex: 1, textAlign: 'right' }]}>${amt.toFixed(2)}</Text>
                                {items.length > 1 && (
                                    <TouchableOpacity onPress={() => removeItem(idx)} style={styles.removeBtn}>
                                        <Text style={styles.removeText}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Totals */}
                <View style={styles.totalsBox}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal</Text>
                        <Text style={styles.totalVal}>${subtotal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>GST (5%)</Text>
                        <Text style={styles.totalVal}>${tax.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.totalRow, styles.totalGrandRow]}>
                        <Text style={styles.totalGrandLabel}>Total CAD</Text>
                        <Text style={styles.totalGrand}>${total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Notes */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.inputMulti]}
                        value={form.notes}
                        onChangeText={v => setField('notes', v)}
                        placeholder="Additional notes or terms..."
                        placeholderTextColor={COLORS.textLight}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={handleSave} disabled={saving}>
                    {saving
                        ? <ActivityIndicator size="small" color={COLORS.white} />
                        : <Text style={styles.saveBtnText}>{isEdit ? 'Update Estimate' : 'Create Estimate'}</Text>
                    }
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <View style={{ height: verticalScale(30) }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(35),
        paddingBottom: verticalScale(16),
        paddingHorizontal: moderateScale(20),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: { width: moderateScale(60) },
    backText: { color: COLORS.white, fontSize: moderateScale(14), fontWeight: '600' },
    headerTitle: { fontSize: moderateScale(18), fontWeight: '700', color: COLORS.white },
    scroll: { flex: 1, backgroundColor: '#F8F9FA' },
    scrollContent: { padding: moderateScale(16) },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: moderateScale(14),
        padding: moderateScale(16),
        marginBottom: verticalScale(12),
        ...SHADOWS.small,
    },
    sectionTitle: { fontSize: moderateScale(15), fontWeight: '700', color: COLORS.text, marginBottom: verticalScale(12) },
    sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: verticalScale(12) },
    field: { marginBottom: verticalScale(12) },
    label: { fontSize: moderateScale(12), fontWeight: '600', color: COLORS.textLight, marginBottom: verticalScale(4), textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
        borderWidth: 1, borderColor: COLORS.border, borderRadius: moderateScale(10),
        paddingHorizontal: moderateScale(12), paddingVertical: verticalScale(10),
        fontSize: moderateScale(14), color: COLORS.text, backgroundColor: '#FAFAFA',
    },
    inputMulti: { minHeight: verticalScale(70), textAlignVertical: 'top' },
    row: { flexDirection: 'row' },
    statusRow: { flexDirection: 'row', gap: moderateScale(8), flexWrap: 'wrap' },
    statusChip: {
        paddingHorizontal: moderateScale(12), paddingVertical: verticalScale(6),
        borderRadius: moderateScale(20), borderWidth: 1, borderColor: COLORS.border, backgroundColor: '#F5F5F5',
    },
    statusChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    statusChipText: { fontSize: moderateScale(12), color: COLORS.textLight, fontWeight: '600' },
    statusChipTextActive: { color: COLORS.white },
    addItemBtn: {
        backgroundColor: COLORS.primary + '15', paddingHorizontal: moderateScale(12),
        paddingVertical: verticalScale(5), borderRadius: moderateScale(8),
        borderWidth: 1, borderColor: COLORS.primary,
    },
    addItemBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: moderateScale(12) },
    itemHeader: { flexDirection: 'row', marginBottom: verticalScale(6), alignItems: 'center' },
    itemHeaderText: { fontSize: moderateScale(10), fontWeight: '700', color: COLORS.textLight, textTransform: 'uppercase', letterSpacing: 0.4 },
    itemRow: {
        flexDirection: 'row', alignItems: 'center', gap: moderateScale(6),
        marginBottom: verticalScale(8), padding: moderateScale(8),
        backgroundColor: '#F8F9FA', borderRadius: moderateScale(10),
    },
    itemInput: {
        borderWidth: 1, borderColor: COLORS.border, borderRadius: moderateScale(8),
        paddingHorizontal: moderateScale(8), paddingVertical: verticalScale(6),
        fontSize: moderateScale(13), color: COLORS.text, backgroundColor: COLORS.white,
        minHeight: verticalScale(36),
    },
    itemAmount: { fontSize: moderateScale(13), fontWeight: '700', color: COLORS.text },
    removeBtn: { padding: moderateScale(4) },
    removeText: { color: COLORS.error, fontSize: moderateScale(14), fontWeight: '700' },
    totalsBox: {
        backgroundColor: COLORS.white, borderRadius: moderateScale(14),
        padding: moderateScale(16), marginBottom: verticalScale(12), ...SHADOWS.small,
    },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(8) },
    totalLabel: { fontSize: moderateScale(13), color: COLORS.textLight },
    totalVal: { fontSize: moderateScale(13), color: COLORS.text, fontWeight: '600' },
    totalGrandRow: {
        borderTopWidth: 1, borderTopColor: COLORS.border,
        paddingTop: verticalScale(10), marginTop: verticalScale(4), marginBottom: 0,
    },
    totalGrandLabel: { fontSize: moderateScale(15), fontWeight: '700', color: COLORS.text },
    totalGrand: { fontSize: moderateScale(18), fontWeight: '800', color: COLORS.primary },
    saveBtn: {
        backgroundColor: COLORS.primary, borderRadius: moderateScale(12),
        paddingVertical: verticalScale(14), alignItems: 'center',
        marginBottom: verticalScale(10), ...SHADOWS.medium,
    },
    saveBtnText: { color: COLORS.white, fontSize: moderateScale(15), fontWeight: '700' },
    cancelBtn: {
        backgroundColor: COLORS.white, borderRadius: moderateScale(12),
        paddingVertical: verticalScale(14), alignItems: 'center',
        borderWidth: 1, borderColor: COLORS.border,
    },
    cancelBtnText: { color: COLORS.textLight, fontSize: moderateScale(14), fontWeight: '600' },
});

export default AdminCreateEstimateScreen;
