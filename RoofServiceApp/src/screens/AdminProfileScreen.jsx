import React, { useEffect, useState } from 'react';
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
  Image,
  ActivityIndicator,
  StatusBar,
  Modal,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../App';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import { COLORS, SHADOWS } from '../utils/constants';
import { api, SERVER_URL } from '../config/api';
import { moderateScale, verticalScale } from '../utils/responsive';

// Reuse hero image
const HERO_IMAGE = require('../../assets/roofing-background.jpg');

const AdminProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, login } = useAuth();
  console.log(user,'sss')
  const insets = useSafeAreaInsets();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isEditing, setIsEditing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  
  const isPendingDeletion = user?.status === 'pending_deletion';

  const [stats, setStats] = useState({
    leadsManaged: 0,
    activeEmployees: 0,
  });

  useEffect(() => {
    loadProfileStats();
  }, []);

  // Sync state with user context if it changes
  useEffect(() => {
    if (user?.profilePicture) {
      setProfilePicture(user.profilePicture);
    }
  }, [user?.profilePicture]);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.phone) setPhone(user.phone);
  }, [user?.name, user?.phone]);

  const loadProfileStats = async () => {
    try {
      const leadsRes = await api.getLeads({});
      const usersRes = await api.getAllUsers({ role: 'employee' });
      const leads = leadsRes.data?.items?.length || 0;
      const employees = usersRes.data?.items?.length || 0;

      setStats({
        leadsManaged: leads,
        activeEmployees: employees,
      });
    } catch (e) {
      console.log('Error loading stats', e);
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

    if (phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        Alert.alert('Validation', 'Please enter a valid phone number');
        return;
      }
    }

    try {
      setSaving(true);
      const res = await api.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      const updatedUser = res.data?.data || res.data || {};

      // Merge with existing auth user to preserve token and role
      const merged = { ...(user || {}), ...updatedUser };
      await login(merged);
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.log('Update profile error:', error.response || error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadProfilePicture = async () => {
    try {
      const result = await ImagePicker.openPicker({
        mediaType: 'photo',
        width: 800,
        height: 800,
        cropping: true,
      });

      if (!result) return;
      setUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', {
        uri:
          Platform.OS === 'android'
            ? result.path
            : result.path.replace('file://', ''),
        type: result.mime || 'image/jpeg',
        name: result.filename || `profile-${Date.now()}.jpg`,
      });

      const res = await api.uploadProfilePicture(formData);
      const updatedUser = res.data?.data || {};

      setProfilePicture(updatedUser.profilePicture);
      const merged = { ...(user || {}), ...updatedUser };
      await login(merged);

      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        console.log('Upload profile picture error:', error.response || error);
        Alert.alert('Error', 'Failed to upload profile picture');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePress = () => {
    if (isPendingDeletion) {
      Alert.alert(
        'Cancel Deletion',
        'Cancel your account deletion request?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            onPress: handleCancelDeletion,
          },
        ],
      );
    } else {
      setShowDeleteModal(true);
    }
  };

  const handleVerifyAndDelete = async () => {
    if (!password.trim()) {
      Alert.alert('Error', 'Password required');
      return;
    }

    try {
      setVerifying(true);
      await api.login({ email: user.email, password: password });
      await api.requestAccountDeletion();
      
      const updatedUser = { 
        ...user, 
        status: 'pending_deletion', 
        deletionRequestedAt: new Date().toISOString() 
      };
      await login(updatedUser);

      setShowDeleteModal(false);
      setPassword('');
      Alert.alert('Submitted', 'Account scheduled for deletion in 24-48 hours.');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid password or failed to request deletion.');
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      setSaving(true);
      await api.cancelAccountDeletion();
      const updatedUser = { ...user, status: 'active' };
      delete updatedUser.deletionRequestedAt;
      await login(updatedUser);
      Alert.alert('Success', 'Deletion request cancelled.');
    } catch (error) {
      Alert.alert('Error', 'Failed to cancel deletion request.');
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
        <View style={[styles.headerOverlay, { paddingTop: insets.top > 0 ? insets.top + verticalScale(20) : verticalScale(30) }]}>
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarContainer}>
              {profilePicture ? (
                <Image
                  source={{
                    uri: profilePicture && profilePicture.startsWith('http')
                      ? profilePicture
                      : `${SERVER_URL}${profilePicture}`,
                  }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </Text>
              )}
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={handleUploadProfilePicture}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.cameraIcon}>📷</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
            <Text style={styles.userEmail}>
              {user?.email || 'admin@example.com'}
            </Text>
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

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('TermsConditions')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('HelpSupport')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Help & Support</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('AboutApp')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>About App</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleDeletePress}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, !isPendingDeletion && { color: COLORS.error }]}>
                {isPendingDeletion ? 'Cancel Account Deletion' : 'Delete Account'}
              </Text>
              {isPendingDeletion && (
                <Text style={styles.settingSub}>Account deletion scheduled</Text>
              )}
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Version 1.0.2 • Build 2026</Text>
      </ScrollView>

      {/* Delete Account Verification Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalDescription}>
              Enter your password to confirm account deletion.
            </Text>
            <View style={styles.warningContainer}>
              <Text style={styles.modalWarning}>
                Your account will be deleted in 24-48 hours. Most functions will be restricted.
              </Text>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setPassword('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleVerifyAndDelete}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Top Bar (Overlay) */}
      <View style={[styles.topBar, styles.topBarOverlay, { paddingTop: insets.top > 0 ? insets.top + verticalScale(10) : verticalScale(20) }]}>
        <BrandLogo
          imageStyle={{ width: 30, height: 30 }}
          tintColor={COLORS.white}
          resizeMode="contain"
        />
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Footer Nav */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(12) }]}>
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
    height: 'auto',
    position: 'absolute',
    zIndex: 10,
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
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: moderateScale(20),
    zIndex: 10,
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
    fontSize: moderateScale(40),
    fontWeight: '700',
    color: COLORS.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(50),
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 5,
    elevation: 5,
  },
  cameraIcon: {
    fontSize: moderateScale(14),
  },
  userName: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: verticalScale(2),
  },
  userEmail: {
    fontSize: moderateScale(13),
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: verticalScale(2),
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(12),
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
    paddingTop: verticalScale(220), // Push content down to overlapping position
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
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(20),
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    width: '100%',
    ...SHADOWS.large,
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(12),
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: moderateScale(14),
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: verticalScale(16),
  },
  warningContainer: {
    backgroundColor: '#FEF2F2',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    marginBottom: verticalScale(20),
  },
  modalWarning: {
    fontSize: moderateScale(12),
    color: COLORS.error,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: moderateScale(10),
    padding: moderateScale(12),
    fontSize: moderateScale(16),
    marginBottom: verticalScale(20),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: moderateScale(12),
  },
  confirmButton: {
    backgroundColor: COLORS.error,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});

export default AdminProfileScreen;
