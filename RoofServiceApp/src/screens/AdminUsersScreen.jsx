import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../App';
import Button from '../components/Button';
import BrandLogo from '../components/BrandLogo';
import Card from '../components/Card';
import { api } from '../config/api';
import { COLORS, ROLES } from '../utils/constants';

const AdminUsersScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(ROLES.CLIENT);

  useEffect(() => {
    loadUsers();
  }, []);

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
    } catch (error) {
      console.log('Load users error:', error.response || error);
      Alert.alert('Error', 'Failed to load users');
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
    if (!editingUser && !password.trim()) {
      Alert.alert('Validation', 'Password is required when creating a user');
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      // map client role constant to backend enum 'user'
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
      console.log('Save user error:', error.response || error);
      Alert.alert('Error', 'Failed to save user');
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
              console.log('Delete user error:', error.response || error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ],
    );
  };

  const renderUserItem = ({ item }) => (
    <Card
      title={item.name}
      subtitle={`${item.email} • ${item.role}`}
      onPress={() => startEdit(item)}
    >
      <View style={styles.userRow}>
        <Text style={styles.userDetail}>📞 {item.phone || 'N/A'}</Text>
        <Text style={styles.userDetail}>Role: {item.role}</Text>
      </View>
      <View style={styles.userActions}>
        <Button
          title="Edit"
          size="small"
          variant="outline"
          style={styles.actionButton}
          onPress={() => startEdit(item)}
        />
        <Button
          title="Delete"
          size="small"
          variant="danger"
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <BrandLogo
            imageStyle={{ width: 40, height: 40, marginRight: 10 }}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.headerTitle}>Admin - Users</Text>
            <Text style={styles.headerSubtitle}>{user?.name || 'Admin'}</Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          <Button
            title="New User"
            size="small"
            style={{ marginRight: 8 }}
            onPress={openCreateForm}
          />
          <Button
            title="Back"
            variant="outline"
            size="small"
            onPress={() => navigation.goBack()}
          />
        </View>
      </View>

      {/* Create / Edit form */}
      {showForm && (
      <Card title={editingUser ? 'Edit User' : 'Create User'}>
        <View style={styles.formRow}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
          />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number"
            keyboardType="phone-pad"
          />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={editingUser ? 'Leave blank to keep current' : 'Password'}
            secureTextEntry
          />
        </View>
        <View style={styles.formRow}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.roleRow}>
            {[
              { key: ROLES.ADMIN, label: 'Admin' },
              { key: ROLES.EMPLOYEE, label: 'Employee' },
              { key: ROLES.CLIENT, label: 'Client' },
            ].map(r => (
              <Button
                key={r.key}
                title={r.label}
                size="small"
                variant={role === r.key ? 'primary' : 'outline'}
                style={styles.roleButton}
                onPress={() => setRole(r.key)}
              />
            ))}
          </View>
        </View>
        <Button
          title={editingUser ? 'Update User' : 'Create User'}
          onPress={handleSave}
          loading={saving}
          style={{ marginTop: 12 }}
        />
        <Button
          title={editingUser ? 'Cancel Edit' : 'Close'}
          variant="outline"
          style={{ marginTop: 8 }}
          onPress={() => {
            resetForm();
            setShowForm(false);
          }}
        />
      </Card>
      )}

      {/* Users list */}
      <Text style={styles.sectionTitle}>All Users</Text>
      <FlatList
        data={users}
        keyExtractor={item => String(item.id)}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  formRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#fff',
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleButton: {
    marginRight: 4,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  userDetail: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
});

export default AdminUsersScreen;
