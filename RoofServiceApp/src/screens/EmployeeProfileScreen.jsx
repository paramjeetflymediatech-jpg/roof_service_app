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
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import Button from '../components/Button';
import { COLORS, SHADOWS } from '../utils/constants';
import { api, SERVER_URL } from '../config/api';
import { moderateScale, verticalScale } from '../utils/responsive';

// Reuse the hero background
const HERO_IMAGE = require('../../assets/roofing-background.jpg');

const EmployeeProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, login } = useAuth();
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture ? SERVER_URL + user.profilePicture : null,
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [user?.id]);

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
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => await logout(),
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This will permanently delete all your data including jobs, assignments, and images. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // Double confirmation
            Alert.alert(
              'Final Confirmation',
              'This is your last chance! All your data will be permanently deleted. Are you absolutely sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setSaving(true);
                      await api.deleteMyAccount();
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been permanently deleted.',
                        [
                          {
                            text: 'OK',
                            onPress: async () => await logout(),
                          },
                        ],
                      );
                    } catch (error) {
                      console.log(
                        'Delete account error:',
                        error.response || error,
                      );
                      Alert.alert(
                        'Error',
                        error.response?.data?.message ||
                          'Failed to delete account. Please try again.',
                      );
                    } finally {
                      setSaving(false);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    try {
      setSaving(true);
      const res = await api.updateProfile({
        name: name.trim(),
        phone: phone.trim(),
      });
      const updatedUser = res.data?.data || res.data || {};
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
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 800,
    });

    if (result.didCancel) return;
    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Failed to pick image');
      return;
    }

    const asset = result.assets?.[0];
    if (!asset) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('profilePicture', {
        uri:
          Platform.OS === 'android'
            ? asset.uri
            : asset.uri.replace('file://', ''),
        type: asset.type || 'image/jpeg',
        name: asset.fileName || `profile-${Date.now()}.jpg`,
      });

      const res = await api.uploadProfilePicture(formData);
      const updatedUser = res.data?.data || {};
      setProfilePicture(updatedUser.profilePicture);
      const merged = { ...(user || {}), ...updatedUser };
      await login(merged);

      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.log('Upload profile picture error:', error.response || error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setUploading(false);
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
          <View style={styles.headerOverlay}>
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
                      uri: profilePicture.startsWith('http')
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
              </View>
              <Text style={styles.userName}>{user?.name || 'Employee'}</Text>
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
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: COLORS.error }]}>
            Danger Zone
          </Text>
          <View style={styles.formContainer}>
            <TouchableOpacity
              style={{
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={handleDeleteAccount}
            >
              <Text style={{ fontSize: 20, marginRight: 12 }}>🗑️</Text>
              <Text style={{ fontSize: 16, color: COLORS.error, flex: 1 }}>
                Delete Account
              </Text>
              <Text style={{ fontSize: 18, color: COLORS.error }}>›</Text>
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
      <View style={styles.footer}>
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
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(20),
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
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
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
    paddingBottom:
      Platform.OS === 'ios' ? verticalScale(30) : verticalScale(12),
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
});

export default EmployeeProfileScreen;
