import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS, FONTS } from '../utils/constants';
import { moderateScale, verticalScale } from '../utils/responsive';

const Card = ({
  title,
  subtitle,
  status,
  statusColor,
  onPress,
  children,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          {title && <Text style={styles.cardTitle}>{title}</Text>}
          {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        </View>
        {status && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor || COLORS.info },
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
      </View>
      {children && <View style={styles.cardContent}>{children}</View>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: moderateScale(16),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
    ...SHADOWS.small,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: verticalScale(10),
  },
  cardTitleContainer: {
    flex: 1,
    paddingRight: moderateScale(10),
  },
  cardTitle: {
    fontSize: moderateScale(FONTS.sizes.body),
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: moderateScale(FONTS.sizes.caption),
    color: COLORS.textLight,
    marginTop: verticalScale(4),
    lineHeight: moderateScale(20),
  },
  statusBadge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: verticalScale(4),
    borderRadius: moderateScale(12),
    minWidth: moderateScale(70),
    alignItems: 'center',
  },
  statusText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    color: COLORS.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    marginTop: verticalScale(8),
    paddingTop: verticalScale(12),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default Card;
