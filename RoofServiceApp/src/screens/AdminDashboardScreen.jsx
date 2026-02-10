import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  ImageBackground,
  StatusBar,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../App';
import BrandLogo from '../components/BrandLogo';
import { api } from '../config/api';
import { COLORS, LEAD_STATUS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

// Reuse hero image
const HERO_IMAGE = require('../../assets/roofing-background.jpg');

const AdminDashboardScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    reviewed: 0,
    approved: 0,
    assigned: 0,
    completed: 0,
    total: 0,
  });

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, []),
  );

  const loadStats = async () => {
    try {
      const response = await api.getLeads({});
      const rawItems =
        response.data?.items ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);

      setStats({
        pending: rawItems.filter(q => q.status === LEAD_STATUS.PENDING).length,
        reviewed: rawItems.filter(q => q.status === LEAD_STATUS.REVIEWED)
          .length,
        approved: rawItems.filter(q => q.status === LEAD_STATUS.APPROVED)
          .length,
        assigned: rawItems.filter(q => q.status === LEAD_STATUS.ASSIGNED)
          .length,
        completed: rawItems.filter(q => q.status === LEAD_STATUS.COMPLETED)
          .length,
        total: rawItems.length,
      });
    } catch (error) {
      console.log('Admin load stats error:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, []);

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
              imageStyle={{
                width: moderateScale(30),
                height: moderateScale(30),
              }}
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

          <View style={styles.welcomeContainer}>
            <Text style={styles.greeting}>Admin Dashboard</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>
      </ImageBackground>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Main Stats Grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Leads"
            value={stats.total}
            color={COLORS.primary}
            icon="📊"
            fullWidth
          />
          <View style={styles.row}>
            <StatCard
              label="Pending"
              value={stats.pending}
              color={COLORS.warning}
              icon="⏳"
            />
            <StatCard
              label="Assigned"
              value={stats.assigned}
              color={COLORS.info}
              icon="👷"
            />
          </View>
          <View style={styles.row}>
            <StatCard
              label="Completed"
              value={stats.completed}
              color={COLORS.success}
              icon="✅"
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              color={COLORS.secondary}
              icon="👍"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { marginTop: verticalScale(24) }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminLeads')}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: '#eef2ff' },
              ]}
            >
              <Text style={styles.actionIcon}>📋</Text>
            </View>
            <Text style={styles.actionText}>View All Leads</Text>
            <Text style={styles.actionSubtext}>Manage and assign</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminUsers')}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: '#ecfdf5' },
              ]}
            >
              <Text style={styles.actionIcon}>👥</Text>
            </View>
            <Text style={styles.actionText}>Manage Users</Text>
            <Text style={styles.actionSubtext}>Add or remove staff</Text>
          </TouchableOpacity>
        </View>

        {/* Row 2 Quick Actions */}
        <View
          style={[
            styles.quickActionsContainer,
            { marginTop: verticalScale(16) },
          ]}
        >
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminServices')}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: '#fdf4ff' },
              ]}
            >
              <Text style={styles.actionIcon}>🛠️</Text>
            </View>
            <Text style={styles.actionText}>Services</Text>
            <Text style={styles.actionSubtext}>Manage offerings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('AdminGallery')}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: '#fff7ed' },
              ]}
            >
              <Text style={styles.actionIcon}>🖼️</Text>
            </View>
            <Text style={styles.actionText}>Gallery</Text>
            <Text style={styles.actionSubtext}>Update portfolio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Text style={[styles.navIcon, { color: COLORS.primary }]}>📊</Text>
          <Text style={[styles.navLabel, { color: COLORS.primary }]}>
            Dashboard
          </Text>
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
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AdminProfile')}
        >
          <Text style={styles.navIcon}>👤</Text>
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* ---------- Small Components ---------- */

const StatCard = ({ label, value, color, icon, fullWidth }) => (
  <View
    style={[
      styles.statCard,
      fullWidth && styles.statCardFull,
      { borderLeftColor: color },
    ]}
  >
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: color }]}>{value}</Text>
    </View>
    <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
      <Text style={styles.statIcon}>{icon}</Text>
    </View>
  </View>
);

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  headerBackground: {
    width: '100%',
    height: verticalScale(200),
  },
  headerImage: {
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    padding: moderateScale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(30),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
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
  welcomeContainer: {
    marginBottom: verticalScale(20),
  },
  greeting: {
    fontSize: moderateScale(28),
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: verticalScale(4),
  },
  dateText: {
    fontSize: moderateScale(14),
    color: 'rgba(255,255,255,0.8)',
  },
  scrollContent: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(100),
    marginTop: verticalScale(10),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(16),
  },
  statsGrid: {
    gap: moderateScale(12),
  },
  row: {
    flexDirection: 'row',
    gap: moderateScale(12),
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...SHADOWS.small,
  },
  statCardFull: {
    width: '100%',
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    marginBottom: verticalScale(4),
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  statValue: {
    fontSize: moderateScale(24),
    fontWeight: '700',
  },
  statIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    fontSize: moderateScale(20),
  },
  quickActionsContainer: {
    flexDirection: 'row',
    gap: moderateScale(16),
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    alignItems: 'center',
    ...SHADOWS.small,
  },
  actionIconContainer: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    marginBottom: verticalScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: moderateScale(24),
  },
  actionText: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(4),
  },
  actionSubtext: {
    fontSize: moderateScale(10),
    color: COLORS.textLight,
    textAlign: 'center',
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

export default AdminDashboardScreen;
