import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../App';
import Button from '../components/Button';
import Card from '../components/Card';
import { api } from '../config/api';
import { COLORS, LEAD_STATUS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const formatDateLocal = value => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString();
};

const TABS = ['All', 'Pending', 'Approved', 'Completed'];

const ClientMyQuotesScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadQuotes(1, true);
  }, [activeTab]);

  useFocusEffect(
    React.useCallback(() => {
      loadQuotes(1, true);
    }, [user?.id, activeTab]),
  );

  const getStatusFilter = () => {
    if (activeTab === 'Pending') return LEAD_STATUS.PENDING;
    if (activeTab === 'Approved') return LEAD_STATUS.APPROVED; // Backend might need to handle 'assigned' too
    if (activeTab === 'Completed') return LEAD_STATUS.COMPLETED;
    return null;
  };

  const loadQuotes = async (pageNum = 1, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const status = getStatusFilter();
      const response = await api.getLeads({
        userId: user?.id,
        page: pageNum,
        limit: 10,
        status: status,
        search: searchQuery.trim() || undefined,
      });

      const { items, pages } = response.data;
      const clientLeads = Array.isArray(items) ? items : [];

      const mapped = clientLeads.map(lead => ({
        id: String(lead.id),
        service: lead.serviceType || 'Roof Service',
        address: `${lead.address} ${lead?.city || ''}` || 'N/A',
        status: lead.status,
        date: formatDateLocal(lead.createdAt),
        message: lead.message || lead.description || '',
        preferedDate: lead.preferredDate
          ? formatDateLocal(lead.preferredDate)
          : null,
        assignedEmployeeName:
          lead.assignedEmployee?.name || lead.assignedTo?.name || null,
        assignedEmployeePhone:
          lead.assignedEmployee?.phone || lead.assignedTo?.phone || null,
        employeeStartTime: lead.employeeStartTime || null,
        employeeEndTime: lead.employeeEndTime || null,
        // Keep raw data for editing
        raw: lead,
      }));

      if (isInitial) {
        setQuotes(mapped);
      } else {
        setQuotes(prev => [...prev, ...mapped]);
      }

      setPage(pageNum);
      setHasMore(pageNum < pages);
    } catch (error) {
      console.log('Load quotes error:', error.response || error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadQuotes(page + 1);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadQuotes(1, true);
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

  const handleOpenDetails = item => {
    navigation.navigate('ClientLeadDetail', { lead: item });
  };

  const handleEdit = item => {
    navigation.navigate('ClientQuote', { lead: item.raw, isEditing: true });
  };

  const handleDelete = item => {
    Alert.alert(
      'Delete Quote',
      'Are you sure you want to delete this quote request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteLead(item.id);
              Alert.alert('Success', 'Quote deleted successfully');
              onRefresh();
            } catch (error) {
              const msg =
                error.response?.data?.message || 'Failed to delete quote';
              Alert.alert('Error', msg);
            }
          },
        },
      ],
    );
  };

  const filteredQuotes = quotes.filter(quote => {
    // 1. Status Filter
    if (activeTab !== 'All') {
      if (activeTab === 'Pending' && quote.status !== LEAD_STATUS.PENDING)
        return false;
      if (
        activeTab === 'Approved' &&
        quote.status !== LEAD_STATUS.APPROVED &&
        quote.status !== LEAD_STATUS.ASSIGNED
      )
        return false;
      if (activeTab === 'Completed' && quote.status !== LEAD_STATUS.COMPLETED)
        return false;
    }

    // 2. Search Filter
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      quote.service?.toLowerCase().includes(query) ||
      quote.address?.toLowerCase().includes(query) ||
      quote.message?.toLowerCase().includes(query) ||
      quote.status?.toLowerCase().includes(query) ||
      quote.assignedEmployeeName?.toLowerCase().includes(query) ||
      quote.date?.toLowerCase().includes(query) ||
      quote.preferedDate?.toLowerCase().includes(query)
    );
  });

  const clearSearch = () => setSearchQuery('');

  const renderQuoteItem = ({ item }) => (
    <Card
      title={item.service}
      subtitle={`Date: ${item.preferedDate || 'N/A'}\nAddress: ${item.address}`}
      status={item.status}
      statusColor={getStatusColor(item.status)}
      onPress={() => handleOpenDetails(item)}
    >
      <Text style={styles.description} numberOfLines={2}>
        {item.message}
      </Text>
      {item.assignedEmployeeName && (
        <View style={styles.assignedInfo}>
          <Text style={styles.assignedText}>
            👷 Assigned: {item.assignedEmployeeName}
          </Text>
        </View>
      )}

      {/* Edit/Delete Actions for Pending Quotes */}
      {item.status === LEAD_STATUS.PENDING && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Quotes</Text>
        <View style={{ width: moderateScale(40) }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search quotes..."
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

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tabItem,
                activeTab === item && styles.tabItemActive,
              ]}
              onPress={() => setActiveTab(item)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === item && styles.tabTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.tabsContent}
        />
      </View>

      <FlatList
        data={quotes}
        keyExtractor={item => item.id}
        renderItem={renderQuoteItem}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={() =>
          loadingMore ? (
            <View style={{ paddingVertical: 20 }}>
              <ActivityIndicator color={COLORS.primary} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>
              {loading ? 'Loading quotes...' : 'No quotes found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {loading
                ? 'Please wait while we fetch your data'
                : activeTab !== 'All'
                ? `No ${activeTab.toLowerCase()} quotes found`
                : 'Request a quote to get started'}
            </Text>
            {!loading && (
              <Button
                title="Request New Quote"
                onPress={() => navigation.navigate('ClientQuote')}
                style={styles.emptyButton}
                size="small"
              />
            )}
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ClientQuote')}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'ios' ? verticalScale(40) : verticalScale(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
    zIndex: 1,
  },
  backButton: {
    padding: moderateScale(8),
  },
  backButtonText: {
    fontSize: moderateScale(24),
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: moderateScale(FONTS.sizes.h3),
    fontWeight: '700',
    color: COLORS.text,
  },
  searchContainer: {
    paddingHorizontal: moderateScale(20),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(8),
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    height: verticalScale(48),
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  searchIcon: {
    fontSize: moderateScale(16),
    marginRight: moderateScale(8),
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: moderateScale(8),
  },
  clearButtonText: {
    fontSize: moderateScale(16),
    color: COLORS.textLight,
    fontWeight: '600',
  },
  tabsContainer: {
    marginBottom: verticalScale(8),
  },
  tabsContent: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(8),
  },
  tabItem: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(8),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.white,
    marginRight: moderateScale(10),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: moderateScale(FONTS.sizes.small),
    color: COLORS.textLight,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(100),
  },
  description: {
    fontSize: moderateScale(FONTS.sizes.caption),
    color: COLORS.textLight,
    marginBottom: verticalScale(8),
  },
  assignedInfo: {
    marginTop: verticalScale(8),
    paddingTop: verticalScale(8),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  assignedText: {
    fontSize: moderateScale(FONTS.sizes.small),
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: verticalScale(8),
  },
  editBtn: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    marginRight: moderateScale(8),
    backgroundColor: '#E3F2FD',
    borderRadius: moderateScale(6),
  },
  editBtnText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: moderateScale(12),
  },
  deleteBtn: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    backgroundColor: '#FFEBEE',
    borderRadius: moderateScale(6),
  },
  deleteBtnText: {
    color: COLORS.error,
    fontWeight: '600',
    fontSize: moderateScale(12),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyIcon: {
    fontSize: moderateScale(48),
    marginBottom: verticalScale(16),
    opacity: 0.5,
  },
  emptyText: {
    fontSize: moderateScale(FONTS.sizes.h3),
    fontWeight: '600',
    color: COLORS.text,
  },
  emptySubtext: {
    fontSize: moderateScale(FONTS.sizes.body),
    color: COLORS.textLight,
    marginTop: verticalScale(4),
    marginBottom: verticalScale(20),
  },
  emptyButton: {
    minWidth: moderateScale(150),
  },
  fab: {
    position: 'absolute',
    bottom: verticalScale(40),
    right: moderateScale(20),
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.large,
    zIndex: 10,
  },
  fabText: {
    fontSize: moderateScale(30),
    color: COLORS.white,
    marginTop: verticalScale(-4),
  },
});

export default ClientMyQuotesScreen;
