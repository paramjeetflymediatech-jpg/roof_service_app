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
import ImageModal from '../components/ImageModal';
import BeautifulAlert from '../components/BeautifulAlert';

// Reuse the hero background
const HERO_IMAGE = require('../../assets/roofing-background.jpg');

const EmployeeProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, login } = useAuth();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedViewerImage, setSelectedViewerImage] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    confirmText: 'OK',
    type: 'default',
    onConfirm: () => setAlertVisible(false),
    showCancel: false,
  });

  const isPendingDeletion = user?.status === 'pending_deletion';

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

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

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const res = await api.getEmployeeJobs(user.id);
      const jobs =
        res.data?.items ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);

      const total = jobs.length;
      const inProgress = jobs.filter(j => j.status === 'in_progress').length;
      const completed = jobs.filter(j => j.status === 'completed').length;
      setStats({ total, inProgress, completed });
    } catch (error) {
      console.log('Stats error:', error);
    }
  };

  const handleLogout = async () => {
    setAlertConfig({
      title: 'Logout Confirmation',
      message: 'Are you sure you want to log out of your account?',
      confirmText: 'Logout',
      type: 'destructive',
      showCancel: true,
      onConfirm: async () => {
        setAlertVisible(false);
        await logout();
      },
    });
    setAlertVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      setAlertConfig({
        title: 'Validation Error',
        message: 'Name is required to update your profile.',
        type: 'destructive',
        onConfirm: () => setAlertVisible(false),
      });
      setAlertVisible(true);
      return;
    }

    if (phone.trim()) {
      const phoneRegex = /^\+?[\d\s\-()]{10,15}$/;
      if (!phoneRegex.test(phone.trim())) {
        setAlertConfig({
          title: 'Invalid Phone',
          message: 'Please enter a valid phone number (10-15 digits).',
          type: 'destructive',
          onConfirm: () => setAlertVisible(false),
        });
        setAlertVisible(true);
        return;
      }
    }

    setAlertConfig({
      title: 'Update Profile',
      message: 'Are you sure you want to save these changes to your profile?',
      confirmText: 'Save',
      type: 'default',
      showCancel: true,
      onConfirm: async () => {
        setAlertVisible(false);
        await performUpdateProfile();
      },
    });
    setAlertVisible(true);
  };

  const performUpdateProfile = async () => {
    try {
      setSaving(true);
      const res = await api.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      const updatedUser = res.data?.data || res.data || {};
      const merged = { ...(user || {}), ...updatedUser };
      await login(merged);
      
      setAlertConfig({
        title: 'Profile Updated',
        message: 'Your profile information has been successfully saved.',
        confirmText: 'OK',
        type: 'default',
        showCancel: false,
        onConfirm: () => setAlertVisible(false),
      });
      setAlertVisible(true);
      
      setIsEditing(false);
    } catch (error) {
      console.log('Update profile error:', error.response || error);
      setAlertConfig({
        title: 'Update Failed',
        message: 'Failed to update profile. Please try again.',
        type: 'destructive',
        onConfirm: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadProfilePicture = async () => {
    setAlertConfig({
      title: 'Profile Picture',
      message: 'Would you like to change your profile picture?',
      confirmText: 'Choose Image',
      type: 'default',
      showCancel: true,
      onConfirm: () => {
        setAlertVisible(false);
        setTimeout(performImageUpload, 500);
      },
    });
    setAlertVisible(true);
  };

  const performImageUpload = async () => {
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

      setAlertConfig({
        title: 'Success',
        message: 'Profile picture updated successfully.',
        confirmText: 'OK',
        type: 'default',
        showCancel: false,
        onConfirm: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        console.log('Upload profile picture error:', error.response || error);
        setAlertConfig({
          title: 'Upload Error',
          message: 'Failed to upload profile picture. Please try again.',
          type: 'destructive',
          onConfirm: () => setAlertVisible(false),
        });
        setAlertVisible(true);
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

  const StatItem = ({ label, value, color }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color: color || COLORS.text }]}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
              <TouchableOpacity 
                style={styles.avatarContainer} 
                onPress={() => {
                  if (profilePicture) {
                    setSelectedViewerImage(profilePicture.startsWith('http') ? profilePicture : `${SERVER_URL}${profilePicture}`);
                    setViewerVisible(true);
                  }
                }}
                activeOpacity={0.8}
              >
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
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'E'}
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
              </TouchableOpacity>
              <Text style={styles.userName}>{user?.name || 'Employee'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Stats Card */}
        <View style={styles.statsCardWrapper}>
          <View style={styles.statsCard}>
            <StatItem
              label="Assignments"
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

        {/* User Details Form */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Employee Information</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
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

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>App Settings</Text>
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={[
                styles.settingRow,
                {
                  borderBottomWidth: 1,
                  borderBottomColor: '#f0f0f0',
                  paddingVertical: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
              ]}
              onPress={() => navigation.navigate('PrivacyPolicy')}
            >
              <Text style={{ fontSize: 16, color: COLORS.text }}>
                Privacy Policy
              </Text>
              <Text style={{ fontSize: 18, color: COLORS.textLight }}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingRow,
                {
                  paddingVertical: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
              ]}
              onPress={() => navigation.navigate('TermsConditions')}
            >
              <Text style={{ fontSize: 16, color: COLORS.text }}>
                Terms & Conditions
              </Text>
              <Text style={{ fontSize: 18, color: COLORS.textLight }}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingRow,
                {
                  borderTopWidth: 1,
                  borderTopColor: '#f0f0f0',
                  paddingVertical: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
              ]}
              onPress={() => navigation.navigate('HelpSupport')}
            >
              <Text style={{ fontSize: 16, color: COLORS.text }}>
                Help & Support
              </Text>
              <Text style={{ fontSize: 18, color: COLORS.textLight }}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingRow,
                {
                  borderTopWidth: 1,
                  borderTopColor: '#f0f0f0',
                  paddingVertical: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
              ]}
              onPress={() => navigation.navigate('AboutApp')}
            >
              <Text style={{ fontSize: 16, color: COLORS.text }}>
                About App
              </Text>
              <Text style={{ fontSize: 18, color: COLORS.textLight }}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.settingRow,
                {
                  borderTopWidth: 1,
                  borderTopColor: '#f0f0f0',
                  paddingVertical: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                },
              ]}
              onPress={handleDeletePress}
            >
              <Text style={{ fontSize: 16, color: isPendingDeletion ? COLORS.text : COLORS.error }}>
                {isPendingDeletion ? 'Cancel Account Deletion' : 'Delete Account'}
              </Text>
              <Text style={{ fontSize: 18, color: COLORS.textLight }}>›</Text>
            </TouchableOpacity>
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
          <Text style={styles.versionText}>Employee App v1.0.0</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Footer Nav */}
      <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(12) }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EmployeeDashboard')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EmployeeMyJobs')}
        >
          <Text style={styles.navIcon}>💼</Text>
          <Text style={styles.navLabel}>Jobs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('EmployeeTimesheet')}
        >
          <Text style={styles.navIcon}>⏰</Text>
          <Text style={styles.navLabel}>Timesheet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => { }}>
          <Text style={[styles.navIcon, { color: COLORS.primary }]}>👤</Text>
          <Text style={[styles.navLabel, { color: COLORS.primary }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

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
 
      <ImageModal 
        visible={viewerVisible} 
        imageUrl={selectedViewerImage} 
        onClose={() => setViewerVisible(false)} 
      />

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
  container: {
    flex: 1,
    marginTop: verticalScale(10),
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    paddingBottom: verticalScale(80),
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
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
  },
  backButtonText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
  },
  editButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
  },
  profileHeaderContent: {
    alignItems: 'center',
    width: "100%",
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: moderateScale(36),
    fontWeight: '700',
    color: COLORS.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(45),
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
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16, 
    color: COLORS.white,
    textAlign:"center", 
    marginBottom: 4,
  },
 
  userRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsCardWrapper: {
    paddingHorizontal: 20,
    marginTop: -40,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 20,
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
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.border,
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    marginLeft: 4,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.small,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 8,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  saveButton: {
    marginTop: 16,
  },
  logoutContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  versionText: {
    marginTop: 16,
    color: COLORS.textLight,
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.large,
    zIndex: 1000,
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 22,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  navLabel: {
    fontSize: 10,
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

export default EmployeeProfileScreen;
