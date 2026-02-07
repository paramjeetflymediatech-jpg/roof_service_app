import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Platform,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import { api } from '../config/api';
import { moderateScale, verticalScale } from '../utils/responsive';

// Reuse hero image
const HERO_IMAGE = require('../../assets/roofing-background.jpg');

const AdminProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({
    leadsManaged: 0,
    activeEmployees: 0,
  });

  useEffect(() => {
    loadProfileStats();
  }, []);

  const loadProfileStats = async () => {
    try {
      // Mock stats or fetch real ones if endpoints exist
      // For now, we'll try to get basic counts if possible, or just mock for visual appeal
      // In a real app, this would come from a tailored endpoint
      const leadsRes = await api.getLeads({});
      const usersRes = await api.getUsers('employee');

      const leads = leadsRes.data?.items?.length || 0;
      const employees = usersRes.data?.items?.length || 0;

      setStats({
        leadsManaged: leads,
        activeEmployees: employees,
      });
    } catch (e) {
      // console.log('Error loading stats', e);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => await logout(),
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }

    try {
      setSaving(true);
      const res = await api.updateMe({
        name: name.trim(),
        phone: phone.trim(),
      });
      const updatedUser = res.data?.data || res.data || {};

      // Merge with existing auth user to preserve token and role
      const merged = { ...(user || {}), ...updatedUser };
      await login(merged);
      Alert.alert('Success', 'Profile updated successfully.');
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Hero Header */}
      <ImageBackground
        source={HERO_IMAGE}
        style={styles.headerBackground}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay}>
          <View style={styles.topBar}>
            <BrandLogo
              imageStyle={{ width: 30, height: 30 }}
              tintColor={COLORS.white}
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
            <Text style={styles.userRole}>System Administrator</Text>
          </View>
        </View>
      </ImageBackground>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.leadsManaged}</Text>
            <Text style={styles.statLabel}>Total Leads</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.activeEmployees}</Text>
            <Text style={styles.statLabel}>Employees</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Uptime</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Personal Information</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={styles.editLink}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.inputEditable]}
                value={name}
                onChangeText={setName}
                placeholder="Name"
              />
            ) : (
              <Text style={styles.valueText}>{name}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={[styles.valueText, { color: COLORS.textLight }]}>
              {user?.email || '-'}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.inputEditable]}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.valueText}>{phone || 'Not set'}</Text>
            )}
          </View>

          {isEditing && (
            <Button
              title="Save Changes"
              onPress={handleSaveProfile}
              loading={saving}
              style={{ marginTop: verticalScale(16) }}
            />
          )}
        </View>

        {/* Settings / Extra */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>App Settings</Text>
          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingSub}>Get alerts for new leads</Text>
            </View>
            <View style={styles.switchOn}>
              <View style={styles.switchKnob} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Version 1.0.2 • Build 2026</Text>
      </ScrollView>

      {/* Footer Nav */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AdminLeads')}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Leads</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AdminUsers')}
        >
          <Text style={styles.navIcon}>👥</Text>
          <Text style={styles.navLabel}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Text style={[styles.navIcon, { color: COLORS.primary }]}>👤</Text>
          <Text style={[styles.navLabel, { color: COLORS.primary }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerBackground: {
    width: '100%',
    height: verticalScale(280),
    position: 'absolute',
    top: 0,
  },
  headerImage: {
    borderBottomLeftRadius: moderateScale(40),
    borderBottomRightRadius: moderateScale(40),
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: moderateScale(40),
    borderBottomRightRadius: moderateScale(40),
    padding: moderateScale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(30),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoutButton: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: moderateScale(12),
  },
  logoutText: {
    color: COLORS.white,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  profileHeaderContent: {
    alignItems: 'center',
    marginTop: verticalScale(10),
  },
  avatarContainer: {
    width: moderateScale(90),
    height: moderateScale(90),
    borderRadius: moderateScale(45),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: verticalScale(12),
  },
  avatarText: {
    fontSize: moderateScale(36),
    fontWeight: '700',
    color: COLORS.primary,
  },
  userName: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: verticalScale(2),
  },
  userRole: {
    fontSize: moderateScale(13),
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(100),
    paddingTop: verticalScale(240), // Push content down to overlapping position
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(20),
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: moderateScale(11),
    color: COLORS.textLight,
    marginTop: verticalScale(2),
  },
  verticalDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#f0f0f0',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    marginBottom: verticalScale(20),
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  cardTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  editLink: {
    fontSize: moderateScale(14),
    color: COLORS.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: verticalScale(20),
    opacity: 0.5,
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    marginBottom: verticalScale(4),
    textTransform: 'uppercase',
  },
  valueText: {
    fontSize: moderateScale(16),
    color: COLORS.text,
    fontWeight: '500',
  },
  input: {
    paddingVertical: verticalScale(4),
    fontSize: moderateScale(16),
    color: COLORS.text,
  },
  inputEditable: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: moderateScale(8),
    borderRadius: moderateScale(4),
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: moderateScale(16),
    color: COLORS.text,
  },
  settingSub: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    marginTop: verticalScale(2),
  },
  switchOn: {
    width: moderateScale(40),
    height: verticalScale(24),
    backgroundColor: COLORS.success,
    borderRadius: moderateScale(12),
    padding: 2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  switchKnob: {
    width: moderateScale(20),
    height: moderateScale(20),
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.white,
  },
  chevron: {
    fontSize: moderateScale(20),
    color: COLORS.textLight,
  },
  versionText: {
    textAlign: 'center',
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    marginTop: verticalScale(10),
    opacity: 0.5,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: verticalScale(12),
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(30) : verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    justifyContent: 'space-around',
    ...SHADOWS.large,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: moderateScale(22),
    color: COLORS.textLight,
    marginBottom: verticalScale(2),
  },
  navLabel: {
    fontSize: moderateScale(10),
    color: COLORS.textLight,
    fontWeight: '600',
  },
});

export default AdminProfileScreen;
