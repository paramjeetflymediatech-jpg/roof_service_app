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
import BrandLogo from '../components/BrandLogo';
import { COLORS, JOB_STATUS } from '../utils/constants';
import { api } from '../config/api';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const isValidHHMM = value => TIME_REGEX.test(value.trim());

const EmployeeJobDetailScreen = () => {
  const navigation = useNavigation();
  console.log(useRoute().params, ' useRoute().params');
  const { job } = useRoute().params || {};
  const [currentJob, setCurrentJob] = useState(job);
  const [images, setImages] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [inTime, setInTime] = useState(
    job?.inTime || job?.employeeStartTime || '',
  );
  const [outTime, setOutTime] = useState(
    job?.outTime || job?.employeeEndTime || '',
  );

  const handleSaveLeadDetails = async () => {
    if (!job?.leadId) {
      Alert.alert('Error', 'Missing lead information for this job.');
      return;
    }

    if (inTime && !isValidHHMM(inTime)) {
      Alert.alert(
        'Invalid time',
        'Please enter start time in HH:MM format, e.g. 09:00.',
      );
      return;
    }

    if (outTime && !isValidHHMM(outTime)) {
      Alert.alert(
        'Invalid time',
        'Please enter end time in HH:MM format, e.g. 17:30.',
      );
      return;
    }

    setLoading(true);
    try {
      const completionImages = images.map(img => ({
        uri: img.uri,
        fileName: img.fileName,
        type: img.type,
      }));

      await api.updateLead(job.leadId, {
        employeeStartTime: inTime,
        employeeEndTime: outTime,
        employeeNotes: notes,
        completionImages,
      });

      Alert.alert('Saved', 'Lead details have been updated.');
    } catch (error) {
      console.log('Save lead details error:', error.response || error);
      Alert.alert('Error', 'Failed to update lead details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!currentJob || currentJob.status === JOB_STATUS.COMPLETED) {
      return;
    }

    setLoading(true);
    try {
      const afterImages = images.map(img => ({
        uri: img.uri,
        fileName: img.fileName,
        type: img.type,
      }));

      const response = await api.updateJob(currentJob.id, {
        employeeNotes: notes,
        afterImages,
      });

      const updated = response.data?.data || response.data || {};
      setCurrentJob(prev => ({ ...prev, ...updated }));
      Alert.alert('Saved', 'Job details have been updated.');
    } catch (error) {
      console.log('Save job details error:', error.response || error);
      Alert.alert('Error', 'Failed to save job details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    console.log(currentJob, 'currentJob');
    if (
      currentJob.status === 'in_progress' ||
      currentJob.status === 'completed'
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.startJob(currentJob.id);
      const updatedJob = response.data?.data || response.data || {};
      const start =
        updatedJob.inTime || updatedJob.startTime || new Date().toISOString();
      const startDate = new Date(start);
      const timeString = `${String(startDate.getHours()).padStart(
        2,
        '0',
      )}:${String(startDate.getMinutes()).padStart(2, '0')}`;

      setInTime(timeString);
      setCurrentJob(prev => ({
        ...prev,
        status: JOB_STATUS.IN_PROGRESS,
        inTime: timeString,
      }));
      Alert.alert('Clocked In', `You clocked in at ${timeString}`);
    } catch (error) {
      console.log('Clock in error:', error.response || error);
      Alert.alert('Error', 'Failed to clock in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async () => {
    if (!currentJob) return;

    setLoading(true);
    try {
      const response = await api.updateJobStatus(currentJob.id, {
        status: 'accepted',
        notes: 'Employee accepted job',
      });
      const updatedJob = response.data?.data || response.data || {};
      setCurrentJob(prev => ({
        ...prev,
        status: updatedJob.status || 'accepted',
      }));
      Alert.alert('Job Accepted', 'You have accepted this job.');
    } catch (error) {
      console.log('Accept job error:', error.response || error);
      Alert.alert('Error', 'Failed to accept job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = () => {
    console.log(currentJob, 'currentJob');
    if (!inTime) {
      Alert.alert('Error', 'Please clock in first');
      return;
    }
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;
    setOutTime(timeString);
    setCurrentJob({ ...currentJob, outTime: timeString });
    Alert.alert('Clocked Out', `You clocked out at ${timeString}`);
  };

  const handleCompleteJob = async () => {
    if (!inTime) {
      Alert.alert('Error', 'Please enter start time first');
      return;
    }
    if (!outTime) {
      Alert.alert('Error', 'Please clock out first');
      return;
    }
    if (!isValidHHMM(inTime) || !isValidHHMM(outTime)) {
      Alert.alert(
        'Invalid time',
        'Please enter start and end times in HH:MM format, e.g. 09:00 and 17:30.',
      );
      return;
    }

    setLoading(true);
    try {
      const afterImages = images.map(img => ({
        uri: img.uri,
        fileName: img.fileName,
        type: img.type,
      }));

      const response = await api.completeJob(currentJob.id, {
        completionNotes: notes,
        afterImages,
      });

      console.log('Complete job response:', response.data);

      setCurrentJob(prev => ({
        ...prev,
        status: JOB_STATUS.COMPLETED,
        outTime,
      }));

      Alert.alert(
        'Job Completed',
        'The job has been marked as complete. The admin will be notified.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
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
  console.log(currentJob, 'job', JOB_STATUS);

  const jobStatus = currentJob.status;
  const isPending = jobStatus === 'assigned' || jobStatus === 'pending';
  const isAccepted = jobStatus === 'accepted';
  const isInProgress = jobStatus === 'in_progress';
  const isCompleted = jobStatus === 'completed';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.title}>{currentJob.service}</Text>
        <BrandLogo imageStyle={{ width: 40, height: 40 }} resizeMode="contain" />
      </View>
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

      {(isPending || isAccepted) && (
        <Card title="Job Status">
          <Text style={styles.cardText}>
            You have been assigned to this job. Please accept and start the
            work.
          </Text>
          {isPending && (
            <Button
              title="Accept Job"
              onPress={handleAcceptJob}
              loading={loading}
              style={styles.clockButton}
            />
          )}
          {isAccepted && (
            <Button
              title="Clock In"
              onPress={handleClockIn}
              style={styles.clockButton}
            />
          )}
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
            <Card title="Work Details" style={styles.photosCard}>
              <Text style={styles.cardText}>
                Enter start/end time and upload photos of the completed work.
              </Text>

              <View style={styles.timeInputRow}>
                <View style={styles.timeInputContainer}>
                  <Text style={styles.label}>Start Time (HH:MM)</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={inTime}
                    onChangeText={setInTime}
                    placeholder="e.g. 09:00"
                  />
                </View>
                <View style={styles.timeInputContainer}>
                  <Text style={styles.label}>End Time (HH:MM)</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={outTime}
                    onChangeText={setOutTime}
                    placeholder="e.g. 17:30"
                  />
                </View>
              </View>

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
                title="Save Lead Details"
                onPress={handleSaveLeadDetails}
                loading={loading}
                style={styles.saveButton}
              />

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
          <Text style={styles.completedText}>
            ✓ This job has been completed
          </Text>
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
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
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
  saveButton: {
    width: '100%',
    marginTop: 16,
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
