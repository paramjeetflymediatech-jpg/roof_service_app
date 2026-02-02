import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../components/Button';
import Card from '../components/Card';
import ImagePickerComponent from '../components/ImagePicker';
import { COLORS, JOB_STATUS } from '../utils/constants';

const EmployeeJobDetailScreen = () => {
  const navigation = useNavigation();
  const { job } = useRoute().params || {};
  const [currentJob, setCurrentJob] = useState(job);
  const [images, setImages] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [inTime, setInTime] = useState(null);
  const [outTime, setOutTime] = useState(null);

  const handleClockIn = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setInTime(timeString);
    setCurrentJob({ ...currentJob, status: JOB_STATUS.IN_PROGRESS, inTime: timeString });
    Alert.alert('Clocked In', `You clocked in at ${timeString}`);
  };

  const handleClockOut = () => {
    if (!inTime) {
      Alert.alert('Error', 'Please clock in first');
      return;
    }
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    setOutTime(timeString);
    setCurrentJob({ ...currentJob, outTime: timeString });
    Alert.alert('Clocked Out', `You clocked out at ${timeString}`);
  };

  const handleCompleteJob = async () => {
    if (!inTime) {
      Alert.alert('Error', 'Please clock in first');
      return;
    }
    if (!outTime) {
      Alert.alert('Error', 'Please clock out first');
      return;
    }

    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await api.updateJobStatus(currentJob.id, {
      //   status: JOB_STATUS.COMPLETED,
      //   inTime,
      //   outTime,
      //   notes,
      //   images,
      // });

      Alert.alert(
        'Job Completed',
        'The job has been marked as complete. The admin will be notified.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to complete job');
    } finally {
      setLoading(false);
    }
  };

  if (!currentJob) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No job selected</Text>
      </View>
    );
  }

  const isAssigned = currentJob.status === JOB_STATUS.ASSIGNED;
  const isInProgress = currentJob.status === JOB_STATUS.IN_PROGRESS;
  const isCompleted = currentJob.status === JOB_STATUS.COMPLETED;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{currentJob.service}</Text>
      <Text style={styles.subtitle}>{currentJob.address}</Text>

      <Card title="Job Details">
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Client:</Text>
          <Text style={styles.detailValue}>{currentJob.clientName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone:</Text>
          <Text style={styles.detailValue}>{currentJob.phone}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date:</Text>
          <Text style={styles.detailValue}>{currentJob.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Notes:</Text>
          <Text style={styles.detailValue}>{currentJob.notes}</Text>
        </View>
      </Card>

      {isAssigned && (
        <Card title="Start Job">
          <Text style={styles.cardText}>
            You have been assigned to this job. Please clock in when you arrive at the location.
          </Text>
          <Button title="Clock In" onPress={handleClockIn} style={styles.clockButton} />
        </Card>
      )}

      {isInProgress && (
        <Card title="Job in Progress">
          <View style={styles.timeContainer}>
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>Clock In</Text>
              <Text style={styles.timeValue}>{inTime || 'Not set'}</Text>
            </View>
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>Clock Out</Text>
              <Text style={styles.timeValue}>{outTime || 'Not set'}</Text>
            </View>
          </View>

          {!outTime ? (
            <Button
              title="Clock Out"
              onPress={handleClockOut}
              variant="secondary"
              style={styles.clockButton}
            />
          ) : (
            <Card title="Work Photos" style={styles.photosCard}>
              <Text style={styles.cardText}>Upload photos of completed work</Text>
              <ImagePickerComponent
                images={images}
                onImagesChange={setImages}
                maxImages={10}
              />

              <View style={styles.notesContainer}>
                <Text style={styles.label}>Work Notes</Text>
                <TextInput
                  style={styles.notesInput}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add notes about the work completed..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <Button
                title="Complete Job"
                onPress={handleCompleteJob}
                loading={loading}
                variant="success"
                style={styles.completeButton}
              />
            </Card>
          )}
        </Card>
      )}

      {isCompleted && (
        <Card title="Job Completed">
          <View style={styles.timeContainer}>
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>Clock In</Text>
              <Text style={styles.timeValue}>{currentJob.inTime}</Text>
            </View>
            <View style={styles.timeBox}>
              <Text style={styles.timeLabel}>Clock Out</Text>
              <Text style={styles.timeValue}>{currentJob.outTime}</Text>
            </View>
          </View>
          <Text style={styles.completedText}>✓ This job has been completed</Text>
        </Card>
      )}
    </ScrollView>
  );
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  cardText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeBox: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 16,
    width: '45%',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  clockButton: {
    width: '100%',
  },
  photosCard: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  notesContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  completeButton: {
    width: '100%',
    marginTop: 16,
  },
  completedText: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 40,
  },
});

export default EmployeeJobDetailScreen;
