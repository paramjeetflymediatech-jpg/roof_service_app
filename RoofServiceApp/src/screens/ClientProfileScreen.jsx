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

// Reuse the hero background if available
const HERO_IMAGE = require('../../assets/roofing-background.jpg');

const ClientProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, login } = useAuth();
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture ? SERVER_URL + user.profilePicture : null,
  );
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

      // Update local state and auth context
      setProfilePicture(updatedUser.profilePicture);
      const merged = { ...(user || {}), ...updatedUser };
      await login(merged);

      Alert.alert('Success', 'Profile picture updated successfully');
    } catch (error) {
      console.log('Upload profile picture error:', error.response || error);
      Alert.alert(
        'Error',
        'Failed to upload profile picture. Please try again.',
      );
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
});

export default ClientProfileScreen;
