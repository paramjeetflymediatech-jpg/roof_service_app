import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useAuth } from '../../App';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import Card from '../components/Card';
import { api } from '../config/api';
import { COLORS, LEAD_STATUS } from '../utils/constants';

const formatDateLocal = value => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString();
};

const ClientHomeScreen = () => {
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadQuotes();
  }, []);

  // Reload quotes whenever screen comes into focus (so new quotes appear)
  useFocusEffect(
    React.useCallback(() => {
      loadQuotes();
    }, [user?.id]),
  );

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const response = await api.getLeads({ userId: user?.id });
      console.log('Get leads API response:', response.data);
      // Backend returns { items, total, ... }
      const clientLeads = response.data?.items || [];
      console.log('Client leads:', clientLeads);

      const mapped = clientLeads.map(lead => ({
        id: String(lead.id),
        service: lead.serviceType || 'Roof Service',
        address: lead.address || lead.city || 'N/A',
        status: lead.status,
        date: formatDateLocal(lead.createdAt),
        description: lead.message || lead.description || '',
        preferedDate: lead.preferredDate
          ? formatDateLocal(lead.preferredDate)
          : null,
        assignedEmployeeName:
          lead.assignedEmployee?.name || lead.assignedTo?.name || null,
        assignedEmployeePhone:
          lead.assignedEmployee?.phone || lead.assignedTo?.phone || null,
        employeeStartTime: lead.employeeStartTime || null,
        employeeEndTime: lead.employeeEndTime || null,
      }));
      setQuotes(mapped);
    } catch (error) {
      console.log('Load quotes error:', error.response || error);
      Alert.alert('Error', 'Failed to load quotes');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuotes();
    setRefreshing(false);
  };

  const getStatusColor = status => {
    switch (status) {
      case LEAD_STATUS.PENDING:
        return COLORS.warning;
      case LEAD_STATUS.APPROVED:
      case LEAD_STATUS.ASSIGNED:
        return COLORS.info;
      case LEAD_STATUS.COMPLETED:
        return COLORS.success;
      case LEAD_STATUS.REJECTED:
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const handleLogout = async () => {
    await logout();
    // RootNavigator will switch to the auth stack (Onboarding/Login/Register)
  };

  const handleOpenDetails = item => {
    navigation.navigate('ClientLeadDetail', { lead: item });
  };

  // Filter quotes based on search query
  const filteredQuotes = quotes.filter(quote => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      quote.service?.toLowerCase().includes(query) ||
      quote.address?.toLowerCase().includes(query) ||
      quote.description?.toLowerCase().includes(query) ||
      quote.status?.toLowerCase().includes(query) ||
      quote.assignedEmployeeName?.toLowerCase().includes(query) ||
      quote.date?.toLowerCase().includes(query) ||
      quote.preferedDate?.toLowerCase().includes(query)
    );
  });

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderQuoteItem = ({ item }) => (
    <Card
      title={item.service}
      subtitle={`
Date• ${item.preferedDate}
Address:${item.address}
        `}
      status={item.status}
      statusColor={getStatusColor(item.status)}
      onPress={() => handleOpenDetails(item)}
    >
      <Text style={styles.description}>{item.description}</Text>
      {item.assignedEmployeeName && (
        <Text style={styles.assignedText}>
          Assigned Employee: {item.assignedEmployeeName}
          {item.assignedEmployeePhone ? ` (${item.assignedEmployeePhone})` : ''}
        </Text>
      )}
      {item.employeeStartTime && (
        <Text style={styles.assignedText}>
          Start Time: {item.employeeStartTime}
        </Text>
      )}
      {item.employeeEndTime && (
        <Text style={styles.assignedText}>
          End Time: {item.employeeEndTime}
        </Text>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header with burger + logout */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => setIsMenuOpen(true)}
            style={styles.menuButton}
          >
            <Text style={styles.menuIcon}>≡</Text>
          </TouchableOpacity>
          <BrandLogo
            imageStyle={{ width: 40, height: 40, marginRight: 10 }}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.welcomeText}>Welcome,</Text>
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

      <View style={styles.actionsContainer}>
        <Button
          title="Request New Quote"
          onPress={() => navigation.navigate('ClientQuote')}
          style={styles.actionButton}
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by service, address, status..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.sectionTitle}>My Quotes</Text>

      <FlatList
        data={filteredQuotes}
        keyExtractor={item => item.id}
        renderItem={renderQuoteItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No quotes yet</Text>
            <Text style={styles.emptySubtext}>
              Request a quote to get started
            </Text>
          </View>
        }
      />

      {/* Bottom navigation bar */}
      <View style={styles.footer}>
        <Button
          title="My Leads"
          size="small"
          onPress={() => navigation.navigate('ClientHome')}
          style={styles.footerButton}
        />
        <Button
          title="Profile"
          size="small"
          onPress={() => navigation.navigate('ClientProfile')}
          style={styles.footerButton}
          variant="outline"
        />
      </View>

      {/* Simple sidebar menu */}
      {isMenuOpen && (
        <View style={styles.menuOverlay}>
          <TouchableOpacity
            style={styles.menuOverlayBackdrop}
            onPress={() => setIsMenuOpen(false)}
          />
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Menu</Text>
            <Button
              title="My Leads"
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('ClientHome');
              }}
              style={styles.menuButtonItem}
            />
            <Button
              title="Profile"
              onPress={() => {
                setIsMenuOpen(false);
                navigation.navigate('ClientProfile');
              }}
              style={styles.menuButtonItem}
              variant="outline"
            />
            <Button
              title="Logout"
              onPress={async () => {
                setIsMenuOpen(false);
                await handleLogout();
              }}
              style={styles.menuButtonItem}
              variant="danger"
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    marginTop: 30,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    paddingBottom: 20,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 12,
    padding: 4,
  },
  menuIcon: {
    fontSize: 22,
    color: COLORS.text,
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
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    width: '100%',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 6,
    marginLeft: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  assignedText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: 14,
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
  menuOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
  },
  menuOverlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuContainer: {
    width: '70%',
    backgroundColor: COLORS.white,
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
  },
  menuButtonItem: {
    width: '100%',
    marginTop: 8,
  },
});

export default ClientHomeScreen;
