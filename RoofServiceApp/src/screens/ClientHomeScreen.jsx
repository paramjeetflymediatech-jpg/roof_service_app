import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../App';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import BrandLogo from '../components/BrandLogo';
import { api } from '../config/api';
import { COLORS, SHADOWS, LEAD_STATUS } from '../utils/constants';
import {
  moderateScale,
  verticalScale,
  getMenuWidth,
} from '../utils/responsive';

// Use a local image for Hero background if available, or a nice placeholder
const HERO_IMAGE = require('../../assets/roofing-background.jpg'); // Ensure this exists or use a fallback

const ClientHomeScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    activeQuotes: 0,
    pending: 0,
    approved: 0,
    completed: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadStats();
    }, [user?.id]),
  );

  const loadStats = async () => {
    try {
      const response = await api.getLeads({ userId: user?.id });
      const leads = response.data?.items || [];

      const pending = leads.filter(
        l => l.status === LEAD_STATUS.PENDING,
      ).length;
      const approved = leads.filter(
        l =>
          l.status === LEAD_STATUS.APPROVED ||
          l.status === LEAD_STATUS.ASSIGNED,
      ).length;
      const completed = leads.filter(
        l => l.status === LEAD_STATUS.COMPLETED,
      ).length;

      setStats({
        activeQuotes: leads.length,
        pending,
        approved,
        completed,
      });
    } catch (error) {
      console.log('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await logout();
  };

  const QuickActionCard = ({ title, icon, color, onPress, subtitle }) => (
    <TouchableOpacity
      style={styles.actionCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[styles.actionIconContainer, { backgroundColor: color + '20' }]}
      >
        <Text style={styles.actionIcon}>{icon}</Text>
      </View>
      <View>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={[styles.arrowIcon, { color: color }]}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.white}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <ImageBackground
          source={HERO_IMAGE}
          style={styles.heroSection}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={() => setIsMenuOpen(true)}>
                  <Text style={styles.menuIcon}>≡</Text>
                </TouchableOpacity>
                <BrandLogo
                  imageStyle={{
                    width: moderateScale(35),
                    height: moderateScale(35),
                    marginLeft: moderateScale(10),
                  }}
                  resizeMode="contain"
                  tintColor={COLORS.white}
                />
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('ClientProfile')}
              >
                <View style={styles.profileIcon}>
                  <Text style={styles.profileInitials}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.greeting}>
                Welcome, {user?.name?.split(' ')[0] || 'Client'}!
              </Text>
              <Text style={styles.heroTitle}>Premium Roofing Services</Text>
              <Text style={styles.heroSubtitle}>
                Quality you can trust, right over your head.
              </Text>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => navigation.navigate('ClientQuote')}
              >
                <Text style={styles.ctaButtonText}>Request a Quote</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* Dashboard Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.activeQuotes}</Text>
            <Text style={styles.statLabel}>Total Quotes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.warning }]}>
              {stats.pending}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: COLORS.success }]}>
              {stats.approved}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.gridContainer}>
            <QuickActionCard
              title="My Quotes"
              subtitle="Track status"
              icon="📋"
              color={COLORS.primary}
              onPress={() => navigation.navigate('ClientMyQuotes')}
            />
            <QuickActionCard
              title="Services"
              subtitle="What we do"
              icon="🛠️"
              color="#FF9800"
              onPress={() => navigation.navigate('ClientServices')}
            />
            <QuickActionCard
              title="Gallery"
              subtitle="Our Past Work"
              icon="📷"
              color="#4CAF50"
              onPress={() => navigation.navigate('ClientGallery')}
            />
            <QuickActionCard
              title="Profile"
              subtitle="Manage account"
              icon="👤"
              color="#9C27B0"
              onPress={() => navigation.navigate('ClientProfile')}
            />
          </View>
        </View>

        {/* Promo / Info Card */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          <View style={styles.promoCard}>
            <Image
              source={require('../../assets/roofing-logo.png')}
              style={styles.promoImage}
              resizeMode="contain"
            />
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Certified Experts</Text>
              <Text style={styles.promoText}>
                Over 20 years of experience in residential and commercial
                roofing. We guarantee satisfaction.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={styles.menuOverlayBackdrop}
            onPress={() => setIsMenuOpen(false)}
          />
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                <Text style={styles.closeMenuText}>✕</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('ClientMyQuotes');
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>My Quotes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('ClientServices');
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>Services</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('ClientGallery');
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('ClientProfile');
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity onPress={handleLogout} style={styles.menuItem}>
              <Text style={[styles.menuItemText, { color: COLORS.error }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Slightly gray background for dashboard feel
  },
  scrollContent: {
    paddingBottom: 0,
    // paddingTop: verticalScale(10),
  },
  heroSection: {
    height: verticalScale(300),
    width: '100%',
    marginBottom: verticalScale(30), // Space for overlapping stats
  },
  heroImage: {
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dark overlay for text readability
    borderBottomLeftRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(34),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    marginBottom: verticalScale(20),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: moderateScale(30),
    color: COLORS.white,
    marginRight: moderateScale(10),
  },
  profileIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  profileInitials: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: moderateScale(16),
  },
  heroContent: {
    paddingHorizontal: moderateScale(20),
    justifyContent: 'center',
    flex: 1,
    // paddingBottom: verticalScale(50), // Increased bottom padding to make room for stats
  },
  greeting: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: moderateScale(16),
    marginBottom: verticalScale(4),
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: moderateScale(24),
    fontWeight: '800',
    marginBottom: verticalScale(8),
    letterSpacing: 0.5,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: moderateScale(14),
    marginBottom: verticalScale(20),
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: moderateScale(24),
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(30),
    alignSelf: 'flex-start',
    ...SHADOWS.medium,
  },
  ctaButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: moderateScale(16),
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: moderateScale(20),
    marginTop: -verticalScale(40), // Negative margin to overlap hero
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(20),
    paddingHorizontal: moderateScale(10),
    ...SHADOWS.medium,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    marginTop: verticalScale(4),
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
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(16),
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: moderateScale(16),
  },
  actionCard: {
    // Updated Grid Card Style
    width: '47%', // slightly less than 50% for gap
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    ...SHADOWS.small,
    marginBottom: verticalScale(8),
    minHeight: verticalScale(130),
    justifyContent: 'space-between',
  },
  actionIconContainer: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(12),
  },
  actionIcon: {
    fontSize: moderateScale(22),
  },
  actionTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(2),
  },
  actionSubtitle: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
  },
  arrowIcon: {
    position: 'absolute',
    right: moderateScale(12),
    top: moderateScale(12),
    fontSize: moderateScale(20),
    fontWeight: 'bold',
  },
  promoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  promoImage: {
    width: moderateScale(60),
    height: moderateScale(60),
    marginRight: moderateScale(16),
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(4),
  },
  promoText: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    lineHeight: verticalScale(18),
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    zIndex: 100,
  },
  menuOverlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  menuContainer: {
    width: getMenuWidth(),
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(20),
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(24),
    ...SHADOWS.large,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(24),
  },
  menuTitle: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: COLORS.text,
  },
  closeMenuText: {
    fontSize: moderateScale(24),
    color: COLORS.textLight,
    padding: moderateScale(4),
  },
  menuItem: {
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemText: {
    fontSize: moderateScale(16),
    color: COLORS.text,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: verticalScale(16),
  },
});

export default ClientHomeScreen;
