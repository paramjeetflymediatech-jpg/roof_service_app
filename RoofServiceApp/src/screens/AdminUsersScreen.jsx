import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  Platform,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import Button from '../components/Button';
import { api } from '../config/api';
import { COLORS, ROLES, SHADOWS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const AdminUsersScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.CLIENT);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lower = searchQuery.toLowerCase();
      const filtered = users.filter(
        u =>
          (u.name && u.name.toLowerCase().includes(lower)) ||
          (u.email && u.email.toLowerCase().includes(lower)),
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers();
      const raw =
        res.data?.items ||
        res.data?.data ||
        res.data?.users ||
        (Array.isArray(res.data) ? res.data : []);
      setUsers(raw);
      setFilteredUsers(raw);
    } catch (error) {
      console.log('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole(ROLES.CLIENT);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const normalizeRole = value => {
    if (!value) return ROLES.CLIENT;
    if (value === 'client') return ROLES.CLIENT;
    return value;
  };

  const startEdit = u => {
    setEditingUser(u);
    setName(u.name || '');
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setPassword('');
    setRole(normalizeRole(u.role));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Validation', 'Name and email are required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Validation', 'Please enter a valid email address');
      return;
    }

    if (!editingUser && !password.trim()) {
      Alert.alert('Validation', 'Password is required when creating a user');
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      role: role === ROLES.CLIENT ? 'user' : role,
    };
    if (password.trim()) {
      payload.password = password.trim();
    }

    try {
      setSaving(true);
      if (editingUser) {
        await api.updateUser(editingUser.id, payload);
      } else {
        await api.createUser(payload);
      }
      await loadUsers();
      resetForm();
      setShowForm(false);
      Alert.alert('Success', 'User saved successfully');
    } catch (error) {
      // Extract error message if available from backend
      const msg = error.response?.data?.message || 'Failed to save user';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = userToDelete => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userToDelete.name || 'this user'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteUser(userToDelete.id);
              await loadUsers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ],
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.cardMain}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => startEdit(item)}
          activeOpacity={0.7}
        >
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.name}</Text>
              {item.role === ROLES.ADMIN && (
                <View style={styles.adminBadge}>
                  <Text style={styles.adminBadgeText}>ADMIN</Text>
                </View>
              )}
            </View>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userPhone}>{item.phone || 'No phone'}</Text>

            <View style={styles.roleContainer}>
              <View
                style={[
                  styles.rolePill,
                  {
                    backgroundColor:
                      item.role === ROLES.EMPLOYEE
                        ? COLORS.info + '20'
                        : item.role === ROLES.ADMIN
                        ? COLORS.primary + '20'
                        : '#f0f0f0',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    {
                      color:
                        item.role === ROLES.EMPLOYEE
                          ? COLORS.info
                          : item.role === ROLES.ADMIN
                          ? COLORS.primary
                          : COLORS.textLight,
                    },
                  ]}
                >
                  {item.role}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editIconBtn}
          onPress={() => startEdit(item)}
        >
          <Text style={styles.editIcon}>✎</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteBtnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>User Management</Text>
        <TouchableOpacity onPress={openCreateForm} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => String(item.id)}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadUsers}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No users found.</Text>
            </View>
          )
        }
      />

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingUser ? 'Edit User' : 'New User'}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowForm(false)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.formScroll}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. John Doe"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="e.g. john@example.com"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="e.g. +1 234 567 8900"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    {editingUser ? 'New Password (Optional)' : 'Password'}
                  </Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textLight}
                    secureTextEntry
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Role</Text>
                  <View style={styles.roleSelector}>
                    {[ROLES.CLIENT, ROLES.EMPLOYEE].map(r => (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.roleOption,
                          role === r && styles.roleOptionActive,
                        ]}
                        onPress={() => setRole(r)}
                      >
                        <Text
                          style={[
                            styles.roleOptionText,
                            role === r && styles.roleOptionTextActive,
                          ]}
                        >
                          {r.charAt(0).toUpperCase() + r.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Button
                  title={editingUser ? 'Update User' : 'Create User'}
                  onPress={handleSave}
                  loading={saving}
                  style={{
                    marginTop: verticalScale(12),
                    marginBottom: verticalScale(20),
                  }}
                />
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Footer Nav */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AdminDashboard')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('AdminLeads')}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={styles.navLabel}>Leads</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Text style={[styles.navIcon, { color: COLORS.primary }]}>👥</Text>
          <Text style={[styles.navLabel, { color: COLORS.primary }]}>
            Users
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(20),
    paddingTop: Platform.OS === 'ios' ? verticalScale(50) : verticalScale(16),
    paddingBottom: verticalScale(16),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    ...SHADOWS.small,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.text,
  },
  addButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: moderateScale(24),
    marginTop: -2,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: moderateScale(20),
    paddingVertical: verticalScale(12),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(12),
    height: verticalScale(44),
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
  clearIcon: {
    fontSize: moderateScale(16),
    color: COLORS.textLight,
    padding: moderateScale(4),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: moderateScale(20),
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContainer: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(20),
    padding: moderateScale(24),
    maxHeight: '85%',
    ...SHADOWS.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: verticalScale(12),
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    padding: moderateScale(8),
  },
  closeText: {
    fontSize: moderateScale(20),
    color: COLORS.textLight,
  },
  formScroll: {
    flexGrow: 0,
  },
  inputGroup: {
    marginBottom: verticalScale(16),
  },
  label: {
    fontSize: moderateScale(12),
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: verticalScale(6),
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: moderateScale(12),
    padding: moderateScale(14),
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: moderateScale(16),
    color: COLORS.text,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F8',
    borderRadius: moderateScale(12),
    padding: moderateScale(4),
  },
  roleOption: {
    flex: 1,
    paddingVertical: verticalScale(10),
    alignItems: 'center',
    borderRadius: moderateScale(8),
  },
  roleOptionActive: {
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  roleOptionText: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    fontWeight: '600',
  },
  roleOptionTextActive: {
    color: COLORS.primary,
  },
  listContent: {
    padding: moderateScale(20),
    paddingBottom: verticalScale(100),
  },
  userCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    marginBottom: verticalScale(16),
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  cardMain: {
    flexDirection: 'row',
    padding: moderateScale(16),
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
  },
  avatarContainer: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  avatarText: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(2),
  },
  userName: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    color: COLORS.text,
    marginRight: moderateScale(8),
  },
  adminBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: moderateScale(6),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
  },
  adminBadgeText: {
    color: COLORS.white,
    fontSize: moderateScale(8),
    fontWeight: '700',
  },
  userEmail: {
    fontSize: moderateScale(13),
    color: COLORS.textLight,
    marginBottom: verticalScale(2),
  },
  userPhone: {
    fontSize: moderateScale(12),
    color: COLORS.textLight,
    marginBottom: verticalScale(6),
  },
  roleContainer: {
    flexDirection: 'row',
  },
  rolePill: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(6),
  },
  roleText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  editIconBtn: {
    paddingHorizontal: moderateScale(8),
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: moderateScale(18),
    color: COLORS.textLight,
  },
  cardActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: verticalScale(12),
    alignItems: 'center',
  },
  deleteBtn: {
    backgroundColor: '#fff0f0',
  },
  deleteBtnText: {
    color: COLORS.error,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: verticalScale(60),
  },
  emptyIcon: {
    fontSize: moderateScale(40),
    marginBottom: verticalScale(16),
    opacity: 0.3,
  },
  emptyText: {
    fontSize: moderateScale(16),
    color: COLORS.textLight,
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

export default AdminUsersScreen;
