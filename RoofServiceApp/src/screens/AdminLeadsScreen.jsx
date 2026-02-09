import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Modal,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { api } from '../config/api';
import { COLORS, LEAD_STATUS, FONTS, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const formatDateLocal = value => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString();
};

const AdminLeadsScreen = () => {
  const navigation = useNavigation();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDate, setTempDate] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadQuotes('');
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadQuotes(searchQuery, dateFilter);
    }, []),
  );

  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeout = setTimeout(() => {
      setPage(1);
      loadQuotes(searchQuery, dateFilter, 1, false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery, dateFilter, statusFilter]);

  const loadQuotes = async (
    search = '',
    date = null,
    pageNum = 1,
    shouldAppend = false,
  ) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = { page: pageNum, limit: 10 };
      if (search) params.search = search;
      if (date) params.date = date;
      // Add existing filters if needed, though statusFilter is local filtering currently?
      // Wait, statusFilter is applied on `filteredQuotes` in frontend.
      // The backend has `req.query.status`.
      // The current frontend uses `filteredQuotes = quotes.filter(...)` which means it fetches ALL and filters locally?
      // Looking at `loadQuotes`, it calls `api.getLeads(params)`.
      // The backend `getLeads` uses `req.query.status`.
      // BUT `AdminLeadsScreen` logic: `const filteredQuotes = quotes.filter(...)`.
      // This means we are fetching paginated data and filtering locally? That's bad for pagination.
      // If we paginate, we must filter on backend.
      // Current `loadQuotes` does NOT send `status` to backend.
      // I should update `loadQuotes` to send `status` if `statusFilter !== 'all'`.

      if (statusFilter !== 'all') params.status = statusFilter;

      const response = await api.getLeads(params);
      const rawItems =
        response.data?.items ||
        response.data?.data ||
        (Array.isArray(response.data) ? response.data : []);

      const normalizedItems = rawItems.map(item => ({
        id: item.id || item._id || item.lead_id,
        clientName: item.clientName || item.client_name || item.name || 'N/A',
        service: item.serviceType || item.service_name || 'N/A',
        address: item.address || 'N/A',
        phone: item.phone || item.phone_number || 'N/A',
        status: item.status || LEAD_STATUS.PENDING,
        date: formatDateLocal(item.date || item.created_at || item.createdAt),
        email: item.email || 'N/A',
        preferedDate: formatDateLocal(
          item.preferredDate || item.prefered_date || item.preferedDate,
        ),
        scheduledAt:
          item.preferredDate || item.prefered_date || item.preferedDate,
        assignedTo:
          item.assignedEmployee?.name ||
          item.assignedTo?.name ||
          item.assigned_to ||
          null,
        assignedEmployee: item.assignedEmployee || item.assignedTo || null,
        employeeStartTime: item.employeeStartTime || null,
        employeeEndTime: item.employeeEndTime || null,
        inTime:
          item.employeeStartTime != null
            ? `${item.employeeStartTime} - ${formatDateLocal(item.inTime)}`
            : null,
        outTime:
          item.employeeEndTime != null
            ? `${item.employeeEndTime} - ${formatDateLocal(item.outTime)}`
            : null,
        employeeNotes: item.employeeNotes || null,
        completionImages: item.completionImages || null,
      }));

      if (shouldAppend) {
        setQuotes(prev => [...prev, ...normalizedItems]);
      } else {
        // When invalidating logic (new search/filter), we set quotes to new items
        setQuotes(normalizedItems);
      }

      // Update hasMore
      if (normalizedItems.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.log('Admin load quotes error:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await loadQuotes(searchQuery, dateFilter, 1, false);
    setRefreshing(false);
  }, [searchQuery, dateFilter, statusFilter]);

  const onEndReached = () => {
    if (!loading && !loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadQuotes(searchQuery, dateFilter, nextPage, true);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const applyDateFilter = () => {
    if (tempDate && !/^\d{4}-\d{2}-\d{2}$/.test(tempDate)) {
      // alert('Invalid Date'); // Simplified for brevity
      return;
    }
    setDateFilter(tempDate || null);
    setShowDateModal(false);
  };

  const clearDateFilter = () => {
    setDateFilter(null);
    setTempDate('');
    setShowDateModal(false);
  };

  const getStatusColor = status => {
    switch (status) {
      case LEAD_STATUS.PENDING:
        return COLORS.warning;
      case LEAD_STATUS.REVIEWED:
        return COLORS.info;
      case LEAD_STATUS.APPROVED:
      case LEAD_STATUS.ASSIGNED:
        return COLORS.success;
      case LEAD_STATUS.COMPLETED:
        return COLORS.primary;
      case LEAD_STATUS.REJECTED:
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };

  const filteredQuotes = quotes.filter(quote => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return quote.status === LEAD_STATUS.PENDING;
    if (statusFilter === 'assigned')
      return quote.status === LEAD_STATUS.ASSIGNED;
    if (statusFilter === 'completed')
      return quote.status === LEAD_STATUS.COMPLETED;
    return true;
  });

  const renderQuoteItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.quoteCard}
      onPress={() => navigation.navigate('AdminAssign', { quote: item })}
    >
      <View style={styles.cardHeaderRow}>
        <View style={styles.serviceIconContainer}>
          <Text style={styles.serviceIcon}>
            {item.service.toLowerCase().includes('repair')
              ? '🔧'
              : item.service.toLowerCase().includes('install')
              ? '🏠'
              : '📋'}
          </Text>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.quoteService}>{item.service}</Text>
          <Text style={styles.quoteClient}>{item.clientName}</Text>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text
            style={[
              styles.statusPillText,
              { color: getStatusColor(item.status) },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailText} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailIcon}>📅</Text>
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        {item.assignedTo && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>👷</Text>
            <Text
              style={[
                styles.detailText,
                { color: COLORS.primary, fontWeight: '600' },
              ]}
            >
              {item.assignedTo}
            </Text>
          </View>
        )}
        {item.status === 'in_progress' && item.inTime && (
          <View style={styles.detailRow}>
            <Text style={styles.detailIcon}>📥</Text>
            <Text style={styles.detailText}>In: {item.inTime}</Text>
          </View>
        )}
        {item.status === 'completed' && (
          <>
            {item.inTime && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📥</Text>
                <Text style={styles.detailText}>In: {item.inTime}</Text>
              </View>
            )}
            {item.outTime && (
              <View style={styles.detailRow}>
                <Text style={styles.detailIcon}>📤</Text>
                <Text style={styles.detailText}>Out: {item.outTime}</Text>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Leads</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search leads..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                style={styles.clearButton}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.filterIconButton,
              dateFilter && styles.filterIconActive,
            ]}
            onPress={() => setShowDateModal(true)}
          >
            <Text style={styles.filterIconText}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {['all', 'pending', 'assigned', 'completed'].map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                statusFilter === f && styles.filterChipActive,
              ]}
              onPress={() => {
                setStatusFilter(f);
                setPage(1);
                // Trigger reload with new status
                // Since loadQuotes depends on state, and state update is async,
                // we might need useEffect to trigger reload or pass directly.
                // The existing useEffect handles search and date, but not status?
                // Let's add statusFilter to the dependency array of the useEffect.
              }}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === f && styles.filterChipTextActive,
                ]}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List */}
        <FlatList
          data={quotes} // No longer filtering locally
          renderItem={renderQuoteItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No leads found</Text>
              </View>
            )
          }
        />
      </View>

      {/* Date Filter Modal */}
      <Modal
        visible={showDateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Date</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={COLORS.textLight}
              value={tempDate}
              onChangeText={setTempDate}
              keyboardType="numeric"
              maxLength={10}
            />
            <Text style={styles.dateHint}>Example: 2026-02-07</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowDateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonClear]}
                onPress={clearDateFilter}
              >
                <Text style={styles.modalButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonApply]}
                onPress={applyDateFilter}
              >
                <Text style={[styles.modalButtonText, { color: COLORS.white }]}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer navigation */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Text style={[styles.navIcon, { color: COLORS.primary }]}>📋</Text>
          <Text style={[styles.navLabel, { color: COLORS.primary }]}>
            Leads
          </Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(16),
    paddingBottom: verticalScale(16),
    paddingHorizontal: moderateScale(20),
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '700',
    color: COLORS.text,
  },
  contentContainer: {
    flex: 1,
    marginTop: verticalScale(16),
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(20),
    marginBottom: verticalScale(12),
    gap: moderateScale(10),
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    height: verticalScale(46),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: {
    fontSize: moderateScale(16),
    marginRight: moderateScale(8),
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: moderateScale(14),
    color: COLORS.text,
    paddingVertical: 0,
  },
  clearButton: {
    padding: moderateScale(4),
  },
  clearButtonText: {
    fontSize: moderateScale(16),
    color: COLORS.textLight,
  },
  filterIconButton: {
    width: verticalScale(46),
    height: verticalScale(46),
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterIconActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f9ff',
  },
  filterIconText: {
    fontSize: moderateScale(20),
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: moderateScale(20),
    marginBottom: verticalScale(16),
    gap: moderateScale(8),
  },
  filterChip: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  listContent: {
    paddingHorizontal: moderateScale(20),
    paddingBottom: verticalScale(100),
  },
  quoteCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    padding: moderateScale(16),
    ...SHADOWS.small,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  serviceIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#F0F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  serviceIcon: {
    fontSize: moderateScale(20),
  },
  headerTextContainer: {
    flex: 1,
  },
  quoteService: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(2),
  },
  quoteClient: {
    fontSize: moderateScale(14),
    color: COLORS.textLight,
  },
  statusPill: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(8),
  },
  statusPillText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: verticalScale(12),
    opacity: 0.5,
  },
  cardDetails: {
    gap: verticalScale(6),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: moderateScale(20),
    textAlign: 'center',
    marginRight: moderateScale(8),
    fontSize: moderateScale(14),
  },
  detailText: {
    fontSize: moderateScale(13),
    color: COLORS.text,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(40),
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: COLORS.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(24),
    width: '85%',
    maxWidth: moderateScale(340),
    ...SHADOWS.medium,
  },
  modalTitle: {
    fontSize: moderateScale(FONTS.sizes.h3),
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(16),
    textAlign: 'center',
  },
  dateInput: {
    backgroundColor: COLORS.background,
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    paddingVertical: verticalScale(12),
    fontSize: moderateScale(16),
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
    textAlign: 'center',
  },
  dateHint: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: verticalScale(8),
    marginBottom: verticalScale(20),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  modalButton: {
    flex: 1,
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: COLORS.background,
  },
  modalButtonClear: {
    backgroundColor: '#ffe0e0',
  },
  modalButtonApply: {
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: COLORS.text,
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

export default AdminLeadsScreen;
