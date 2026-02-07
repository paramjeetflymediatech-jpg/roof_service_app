import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import Card from '../components/Card';
import { COLORS } from '../utils/constants';
import { api } from '../config/api';

const ClientProfileScreen = () => {
  const navigation = useNavigation();
  const { user, logout, login } = useAuth();
  const [stats, setStats] = useState({ total: 0, inProgress: 0, completed: 0 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');

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
        const inProgress = clientLeads.filter(l => l.status === 'in_progress').length;
        const completed = clientLeads.filter(l => l.status === 'completed').length;
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
    await logout();
    // RootNavigator will switch to the auth stack (Onboarding/Login/Register)
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    try {
      setSaving(true);
      const res = await api.updateMe({ name: name.trim(), phone: phone.trim() });
      const updatedUser = res.data?.data || res.data || {};

      // merge with existing auth user to preserve token and role
      const merged = { ...(user || {}), ...updatedUser };
      await login(merged);
      Alert.alert('Profile Updated', 'Your profile has been saved.');
    } catch (error) {
      console.log('Update profile error:', error.response || error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with simple nav */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BrandLogo
            imageStyle={{ width: 40, height: 40, marginRight: 10 }}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.welcomeText}>Profile</Text>
            <Text style={styles.userName}>{user?.name || 'Client'}</Text>
          </View>
        </View>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          size="small"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card title="Personal Info">
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
            />
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{user?.email || '-'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone:</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              keyboardType="phone-pad"
            />
          </View>
        </Card>

        <Button
          title="Save Profile"
          onPress={handleSaveProfile}
          loading={saving}
          style={{ marginBottom: 16 }}
        />

        <Card title="My Leads Summary">
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.inProgress}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.completed}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          )}
        </Card>
      </ScrollView>

      {/* Simple bottom nav bar */}
      <View style={styles.footer}>
        <Button
          title="My Leads"
          size="small"
          onPress={() => navigation.navigate('ClientHome')}
          style={styles.footerButton}
          variant="outline"
        />
        <Button
          title="Profile"
          size="small"
          onPress={() => {}}
          style={styles.footerButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 30,
    paddingBottom: 70,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  welcomeText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  detailValue: {
    flex: 1,
    color: COLORS.text,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ClientProfileScreen;
