import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Button from '../components/Button';
import ImagePickerComponent from '../components/ImagePicker';
import { COLORS, JOB_STATUS, SHADOWS } from '../utils/constants';
import { api, SERVER_URL } from '../config/api';
import { moderateScale, verticalScale } from '../utils/responsive';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const isValidHHMM = value => TIME_REGEX.test(value.trim());

const EmployeeJobDetailScreen = () => {
  const navigation = useNavigation();
  const { job } = useRoute().params || {};
  const [currentJob, setCurrentJob] = useState(job);
  const [images, setImages] = useState([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [inTime, setInTime] = useState(job?.inTime || job?.employeeStartTime);
  const [outTime, setOutTime] = useState(job?.outTime || job?.employeeEndTime);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Status Checkers
  const jobStatus = currentJob?.status;
  const isPending = jobStatus === 'assigned' || jobStatus === 'pending';
  const isAccepted = jobStatus === 'accepted';
  const isInProgress = jobStatus === 'in_progress';
  const isCompleted = jobStatus === 'completed';

  const handleSaveLeadDetails = async () => {
    if (!job?.leadId) return Alert.alert('Error', 'Missing lead info.');
    if (inTime && !isValidHHMM(inTime))
      return Alert.alert('Invalid Start Time', 'Use HH:MM format');
    if (outTime && !isValidHHMM(outTime))
      return Alert.alert('Invalid End Time', 'Use HH:MM format');

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

      Alert.alert('Saved', 'Details updated successfully.');
    } catch (error) {
      console.log('Save details error:', error);
      Alert.alert('Error', 'Failed to save details.');
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    setLoading(true);
    try {
      const response = await api.startJob(currentJob.id);
      const updatedJob = response.data?.data || response.data || {};
      const start = updatedJob.inTime || new Date().toISOString();
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
      Alert.alert('Clocked In', `Started at ${timeString}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to clock in.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async () => {
    setLoading(true);
    try {
      await api.updateJobStatus(currentJob.id, {
        status: 'accepted',
        notes: 'Employee accepted job',
      });
      setCurrentJob(prev => ({ ...prev, status: 'accepted' }));
      Alert.alert('Accepted', 'Job accepted successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to accept job.');
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = () => {
    if (!inTime) return Alert.alert('Error', 'Must clock in first');
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;
    setOutTime(timeString);
    setCurrentJob({ ...currentJob, outTime: timeString });
    Alert.alert('Clocked Out', `Finished at ${timeString}`);
  };

  const openImageModal = imageUrl => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  const handleCompleteJob = async () => {
    if (!inTime || !outTime)
      return Alert.alert('Error', 'Clock in and out times are required.');

    setLoading(true);
    try {
      const completionImages = [];

      // Upload images first
      for (const img of images) {
        if (img.uri.startsWith('http')) {
          completionImages.push({
            uri: img.uri,
            fileName: img.fileName,
            type: img.type,
          });
        } else {
          const formData = new FormData();
          formData.append('image', {
            uri: img.uri,
            type: img.type || 'image/jpeg',
            name: img.fileName || `upload-${Date.now()}.jpg`,
          });

          try {
            const uploadRes = await api.uploadImage(formData);
            if (uploadRes.data?.success) {
              completionImages.push({
                uri: uploadRes.data.data.url,
                fileName: uploadRes.data.data.fileName,
                type: img.type,
              });
            }
          } catch (uploadError) {
            console.error('Failed to upload image:', uploadError);
            Alert.alert('Error', 'Failed to upload one or more images.');
            setLoading(false);
            return;
          }
        }
      }

      await api.completeJob(currentJob.id, {
        completionNotes: notes,
        afterImages: completionImages,
      });

      setCurrentJob(prev => ({ ...prev, status: JOB_STATUS.COMPLETED }));
      Alert.alert('Success', 'Job marked as completed!', [
        { text: 'Back', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to complete job.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentJob)
    return (
      <View style={styles.container}>
        <Text>No Job Found</Text>
      </View>
    );

  const TimelineItem = ({ title, active, completed, isLast }) => (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineDot,
            (active || completed) && styles.timelineDotActive,
          ]}
        />
        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              completed && styles.timelineLineActive,
            ]}
          />
        )}
      </View>
      <View style={styles.timelineContent}>
        <Text
          style={[
            styles.timelineTitle,
            (active || completed) && styles.timelineTitleActive,
          ]}
        >
          {title}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: moderateScale(40) }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Job Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.serviceTitle}>{currentJob.service}</Text>
            <View
              style={[
                styles.statusBadge,
                isCompleted
                  ? { backgroundColor: COLORS.success }
                  : { backgroundColor: COLORS.primary },
              ]}
            >
              <Text style={styles.statusText}>
                {jobStatus.toUpperCase().replace('_', ' ')}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>👤</Text>
            <View>
              <Text style={styles.infoLabel}>Client</Text>
              <Text style={styles.infoValue}>{currentJob.clientName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{currentJob.address}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📞</Text>
            <View>
              <Text style={styles.infoLabel}>Contact</Text>
              <Text style={styles.infoValue}>{currentJob.phone}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📝</Text>
            <View>
              <Text style={styles.infoLabel}>Notes</Text>
              <Text style={styles.infoValue}>
                {currentJob.notes || 'No notes provided.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Client Images Section */}
        {currentJob?.lead?.clientImages &&
          currentJob.lead.clientImages.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Client Photos</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageScroll}
              >
                {currentJob.lead.clientImages.map((img, index) => {
                  const url = img.url || img.uri;
                  const imageUrl = url.startsWith('http')
                    ? url
                    : `${SERVER_URL}/${url}`;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => openImageModal(imageUrl)}
                    >
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.detailImage}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

        {/* Completion Images Section */}
        {((currentJob?.afterImages && currentJob.afterImages.length > 0) ||
          (currentJob?.lead?.completionImages &&
            currentJob.lead.completionImages.length > 0)) && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Work Photos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.imageScroll}
            >
              {(
                currentJob.afterImages ||
                currentJob.lead.completionImages ||
                []
              ).map((img, index) => {
                const url = img.url || img.uri;
                const imageUrl = url.startsWith('http')
                  ? url
                  : `${SERVER_URL}/${url}`;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => openImageModal(imageUrl)}
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.detailImage}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Timeline / Progress */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Progress</Text>
          <View style={styles.timelineContainer}>
            <TimelineItem title="Job Assigned" completed={true} />
            <TimelineItem
              title="Accepted"
              active={isAccepted}
              completed={isInProgress || isCompleted}
            />
            <TimelineItem
              title="In Progress"
              active={isInProgress}
              completed={isCompleted}
            />
            <TimelineItem
              title="Completed"
              active={isCompleted}
              completed={isCompleted}
              isLast
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Actions</Text>

          {isPending && (
            <Button
              title="Accept Job"
              onPress={handleAcceptJob}
              loading={loading}
            />
          )}

          {isAccepted && (
            <Button
              title="Clock In & Start"
              onPress={handleClockIn}
              loading={loading}
            />
          )}

          {isInProgress && (
            <View style={styles.progressActions}>
              <View style={styles.clockRow}>
                <View style={styles.clockInput}>
                  <Text style={styles.clockLabel}>Start Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={inTime}
                    onChangeText={setInTime}
                    placeholder="09:00"
                  />
                </View>
                <View style={styles.clockInput}>
                  <Text style={styles.clockLabel}>End Time</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={outTime}
                    onChangeText={setOutTime}
                    placeholder="17:00"
                  />
                </View>
              </View>

              {!outTime && (
                <Button
                  title="Clock Out"
                  onPress={handleClockOut}
                  style={{ marginBottom: 20 }}
                  variant="secondary"
                />
              )}

              <Text style={styles.clockLabel}>Upload Photos</Text>
              <ImagePickerComponent
                images={images}
                onImagesChange={setImages}
                maxImages={6}
              />

              <Text style={[styles.clockLabel, { marginTop: 16 }]}>
                Completion Notes
              </Text>
              <TextInput
                style={styles.textArea}
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Describe work done..."
              />

              <View style={styles.actionButtons}>
                <Button
                  title="Complete Job"
                  onPress={handleCompleteJob}
                  style={{ flex: 1, marginLeft: 8 }}
                  loading={loading}
                />
              </View>
            </View>
          )}

          {isCompleted && (
            <View style={styles.completedBanner}>
              <Text style={styles.completedBannerText}>✓ Job Completed</Text>
              <Text style={styles.completedTimeText}>
                Notes: {job.employeeNotes}
              </Text>
              <Text style={styles.completedTimeText}>
                Work Time: {inTime} - {outTime}
              </Text>
              <Text style={styles.completedTimeText}>Job Date: {job.date}</Text>
              <Text style={styles.completedTimeText}>
                Completed Date: {job.completedDate}
              </Text>
            </View>
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={closeModal}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
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
    paddingVertical: verticalScale(16),
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.text,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    padding: moderateScale(20),
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(16),
    padding: moderateScale(20),
    ...SHADOWS.small,
    marginBottom: verticalScale(20),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(12),
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginLeft: 10,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginBottom: verticalScale(16),
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: verticalScale(16),
  },
  infoIcon: {
    fontSize: 18,
    width: 30,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    lineHeight: 20,
  },
  sectionContainer: {
    marginBottom: verticalScale(24),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: verticalScale(12),
    marginLeft: 4,
  },
  timelineContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.small,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    borderWidth: 2,
    borderColor: COLORS.white,
    zIndex: 1,
  },
  timelineDotActive: {
    backgroundColor: COLORS.primary,
  },
  timelineLine: {
    width: 2,
    height: 30,
    backgroundColor: '#e0e0e0',
    marginVertical: 4,
  },
  timelineLineActive: {
    backgroundColor: COLORS.primary,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 20,
  },
  timelineTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: -4,
  },
  timelineTitleActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
  progressActions: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    ...SHADOWS.small,
  },
  clockRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  clockInput: {
    flex: 1,
  },
  clockLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  completedBanner: {
    backgroundColor: '#e7e5e7ff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  completedBannerText: {
    color: COLORS.textLight,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  completedTimeText: {
    color: COLORS.textLight,
    fontSize: 14,
  },
  imageScroll: {
    paddingBottom: 10,
  },
  detailImage: {
    width: moderateScale(120),
    height: verticalScale(120),
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: verticalScale(40),
    right: moderateScale(20),
    zIndex: 10,
    padding: 10,
  },
  modalCloseText: {
    color: COLORS.white,
    fontSize: moderateScale(30),
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: '80%',
  },
});

export default EmployeeJobDetailScreen;
