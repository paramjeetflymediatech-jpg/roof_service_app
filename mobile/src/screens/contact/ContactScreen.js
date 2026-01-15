import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';
import { createLead } from '../../api/leads.api';

function ContactScreen() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    setError('');
    setSuccess('');

    if (!form.name) {
      setError('Name is required');
      return;
    }

    try {
      setLoading(true);
      await createLead({
        leadType: 'contact',
        source: 'mobile_app',
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });
      setSuccess('Request sent successfully');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      setError('Failed to send request');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact / Request a Quote</Text>

      <TextInput
        style={styles.input}
        placeholder="Name *"
        value={form.name}
        onChangeText={(text) => handleChange('name', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.email}
        keyboardType="email-address"
        onChangeText={(text) => handleChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone"
        value={form.phone}
        keyboardType="phone-pad"
        onChangeText={(text) => handleChange('phone', text)}
      />
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
        placeholder="Message"
        value={form.message}
        multiline
        numberOfLines={4}
        onChangeText={(text) => handleChange('message', text)}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      {loading ? (
        <ActivityIndicator size="small" color="#2563eb" />
      ) : (
        <Button title="Send" onPress={handleSubmit} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  error: {
    color: '#b91c1c',
    marginBottom: 8,
  },
  success: {
    color: '#047857',
    marginBottom: 8,
  },
});

export default ContactScreen;
