import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Roof Service</Text>
      <Text style={styles.text}>
        Professional roofing, renovation and repair services.
      </Text>
      <View style={{ height: 16 }} />
      <Button title="View Services" onPress={() => navigation.navigate('Services')} />
      <View style={{ height: 8 }} />
      <Button title="Go to Admin" onPress={() => navigation.navigate('Admin')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4b5563',
  },
});

export default HomeScreen;
