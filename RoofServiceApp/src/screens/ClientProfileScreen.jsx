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
import { COLORS, SHADOWS } from '../utils/constants';
import { api, SERVER_URL } from '../config/api';
import { moderateScale, verticalScale } from '../utils/responsive';

// Reuse the hero background if available
const HERO_IMAGE = require('../../assets/roofing-background.jpg');

const ClientProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, login } = useAuth();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

  const isPendingDeletion = user?.status === 'pending_deletion';

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.email) return;
      try {
        setLoading(true);
        const res = await api.getLeads();
        const all = res.data?.items || [];
        const clientLeads = all.filter(
          lead => lead.email?.toLowerCase() === user.email.toLowerCase(),
        );
        const total = clientLeads.length;
        const inProgress = clientLeads.filter(l =>
          ['pending', 'approved', 'assigned', 'in_progress'].includes(l.status),
        ).length;
        const completed = clientLeads.filter(
          l => l.status === 'completed',
        ).length;
        setStats({ total, inProgress, completed });
      } catch (error) {
        console.log('Client profile stats error:', error.response || error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.email]);

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

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
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

      // merge with existing auth user to preserve token and role
      const merged = { ...(user || {}), ...updatedUser };
      await login(merged);
      Alert.alert('Success', 'Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.log('Update profile error:', error.response || error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
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

      // Update local state and auth context
      setProfilePicture(updatedUser.profilePicture);
      const merged = { ...(user || {}), ...updatedUser };
      await login(merged);

      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        console.log('Upload profile picture error:', error.response || error);
        Alert.alert(
          'Error',
          'Failed to upload profile picture. Please try again.',
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePress = () => {
    if (isPendingDeletion) {
      Alert.alert(
        'Cancel Deletion',
        'Are you sure you want to cancel your account deletion request?',
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
      Alert.alert('Error', 'Please enter your password to confirm.');
      return;
    }

    try {
      setVerifying(true);
      // Verify password by attempting to login
      await api.login({
        email: user.email,
        password: password,
      });

      // If login succeeds, request deletion
      await api.requestAccountDeletion();
      
      // Update local user state
      const updatedUser = { ...user, status: 'pending_deletion', deletionRequestedAt: new Date().toISOString() };
      await login(updatedUser);

      setShowDeleteModal(false);
      setPassword('');
      Alert.alert(
        'Request Submitted',
        'Your account is now scheduled for deletion in 24-48 hours. Most app features are now restricted.',
      );
    } catch (error) {
      console.log('Verification/Deletion error:', error.response?.data || error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Invalid password or failed to request deletion. Please try again.',
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      setLoading(true);
      await api.cancelAccountDeletion();
      
      // Update local user state
      const updatedUser = { ...user, status: 'active' };
      delete updatedUser.deletionRequestedAt;
      await login(updatedUser);

      Alert.alert('Success', 'Your account deletion request has been cancelled.');
    } catch (error) {
      console.log('Cancel deletion error:', error.response?.data || error);
      Alert.alert('Error', 'Failed to cancel deletion request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const StatItem = ({ label, value, color }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: color || COLORS.text }]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const SettingsItem = ({ icon, title, onPress, isDestructive }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.settingsIconContainer,
          isDestructive && styles.destructiveIconContainer,
        ]}
      >
        <Text
          style={[styles.settingsIcon, isDestructive && styles.destructiveText]}
        >
          {icon}
        </Text>
      </View>
      <Text
        style={[styles.settingsTitle, isDestructive && styles.destructiveText]}
      >
        {title}
      </Text>
      <Text style={styles.settingsArrow}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + verticalScale(20) : verticalScale(40) }
        ]}
        showsVerticalScrollIndicator={false}
        style={{ zIndex: 10 }}
      >
        {/* Header Section */}
        <ImageBackground
          source={HERO_IMAGE}
          style={styles.headerBackground}
          imageStyle={styles.headerImageStyle}
        >
          <View style={[styles.headerOverlay, { paddingTop: insets.top > 0 ? insets.top + verticalScale(10) : verticalScale(20) }]}>
            <View style={styles.navBar}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>My Profile</Text>
              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

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
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
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
              <Text style={styles.userName}>{user?.name || 'Client Name'}</Text>
              <Text style={styles.userEmail}>
                {user?.email || 'email@example.com'}
              </Text>
            </View>
          </View>
        </ImageBackground>

        {/* Stats Card */}
        <View style={styles.statsCardWrapper}>
          <View style={styles.statsCard}>
            <StatItem
              label="Total Quotes"
              value={stats.total}
              color={COLORS.primary}
            />
            <View style={styles.statDivider} />
            <StatItem
              label="Active"
              value={stats.inProgress}
              color={COLORS.warning}
            />
            <View style={styles.statDivider} />
            <StatItem
              label="Completed"
              value={stats.completed}
              color={COLORS.success}
            />
          </View>
        </View>

        {/* User Details Form (Editable) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your Name"
                />
              ) : (
                <Text style={styles.infoText}>{user?.name || 'N/A'}</Text>
              )}
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <Text style={[styles.infoText, { color: COLORS.textLight }]}>
                {user?.email || 'N/A'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.infoText}>{user?.phone || 'Not set'}</Text>
              )}
            </View>
          </View>

          {isEditing && (
            <Button
              title="Save Changes"
              onPress={handleSaveProfile}
              loading={saving}
              style={styles.saveButton}
            />
          )}
        </View>

        {/* Settings / Menu */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuContainer}>
            <SettingsItem
              icon="🔔"
              title="Notifications"
              onPress={() =>
                Alert.alert(
                  'Coming Soon',
                  'Notification settings will be available soon.',
                )
              }
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="🛡️"
              title="Privacy Policy"
              onPress={() => navigation.navigate('PrivacyPolicy')}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="📄"
              title="Terms & Conditions"
              onPress={() => navigation.navigate('TermsConditions')}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="❓"
              title="Help & Support"
              onPress={() => navigation.navigate('HelpSupport')}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon="ℹ️"
              title="About App"
              onPress={() => navigation.navigate('AboutApp')}
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={isPendingDeletion ? '🔄' : '🗑️'}
              title={isPendingDeletion ? 'Cancel Account Deletion' : 'Delete Account'}
              isDestructive={!isPendingDeletion}
              onPress={handleDeletePress}
            />
          </View>
        </View>

        <View style={styles.logoutContainer}>
          <Button
            title="Log Out"
            onPress={handleLogout}
            variant="outline"
            style={{ borderColor: COLORS.error }}
            textStyle={{ color: COLORS.error }}
          />
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        <View style={{ height: 40 }} />
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
            <Text style={styles.modalTitle}>Confirm Account Deletion</Text>
            <Text style={styles.modalDescription}>
              For your security, please enter your password to confirm that you
              want to delete your account.
            </Text>
            <Text style={styles.modalWarning}>
              Your account will be deleted in 24-48 hours. You can cancel this
              request anytime during the cooldown period.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter your password"
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
                  <Text style={styles.confirmButtonText}>Confirm Deletion</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: verticalScale(20),
  },
  headerBackground: {
    width: '100%',
    height: verticalScale(280),
  },
  headerImageStyle: {
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    paddingHorizontal: moderateScale(20),
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
  },
  backButton: {
    padding: moderateScale(8),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: moderateScale(20),
  },
  backButtonText: {
    fontSize: moderateScale(20),
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: COLORS.white,
  },
  editButton: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: moderateScale(15),
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: moderateScale(12),
  },
  profileHeaderContent: {
    alignItems: 'center',
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
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(60),
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary, // or a bright color
    width: moderateScale(28),
    height: moderateScale(28),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cameraIcon: {
    fontSize: moderateScale(14),
  },
  userName: {
    fontSize: moderateScale(22),
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: verticalScale(4),
  },
  userEmail: {
    fontSize: moderateScale(14),
    color: 'rgba(255,255,255,0.8)',
  },
  statsCardWrapper: {
    paddingHorizontal: moderateScale(20),
    marginTop: -verticalScale(40),
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(20),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    marginBottom: verticalScale(4),
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.border,
  },
  sectionContainer: {
    marginTop: verticalScale(24),
    paddingHorizontal: moderateScale(20),
  },
  sectionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(12),
    marginLeft: moderateScale(4),
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    ...SHADOWS.small,
  },
  inputGroup: {
    marginBottom: verticalScale(4),
  },
  inputLabel: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    marginBottom: verticalScale(4),
  },
  input: {
    fontSize: moderateScale(16),
    color: COLORS.text,
    paddingVertical: verticalScale(8),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  },
  infoText: {
    fontSize: moderateScale(16),
    color: COLORS.text,
    paddingVertical: verticalScale(8),
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: verticalScale(12),
  },
  saveButton: {
    marginTop: verticalScale(16),
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    paddingHorizontal: moderateScale(16),
    ...SHADOWS.small,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  settingsIconContainer: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  destructiveIconContainer: {
    backgroundColor: '#FEE2E2',
  },
  settingsIcon: {
    fontSize: moderateScale(18),
  },
  settingsTitle: {
    flex: 1,
    fontSize: moderateScale(16),
    color: COLORS.text,
    fontWeight: '500',
  },
  destructiveText: {
    color: COLORS.error,
  },
  settingsArrow: {
    fontSize: moderateScale(18),
    color: COLORS.textLight,
  },
  logoutContainer: {
    marginTop: verticalScale(30),
    paddingHorizontal: moderateScale(20),
    alignItems: 'center',
  },
  versionText: {
    marginTop: verticalScale(16),
    color: COLORS.textLight,
    fontSize: moderateScale(12),
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
    lineHeight: 20,
    marginBottom: verticalScale(16),
  },
  modalWarning: {
    fontSize: moderateScale(12),
    color: COLORS.error,
    backgroundColor: '#FEF2F2',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    textAlign: 'center',
    marginBottom: verticalScale(20),
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

export default ClientProfileScreen;
