import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';

// AddPointsForm component with matching design
const AddPointsForm = ({ onSubmit, loading }) => {
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    const pointsValue = parseInt(points);
    if (!pointsValue || pointsValue <= 0) {
      Alert.alert('Invalid Points', 'Please enter a valid number of points');
      return;
    }
    
    // Only pass the number to onSubmit
    onSubmit(pointsValue);
    
    // Clear form after submission
    setPoints('');
    setReason('');
  };

  return (
    <View style={styles.addPointsCard}>
      <Text style={styles.addPointsTitle}>Add Points</Text>
      
      <View style={styles.formContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Points to Add</Text>
          <TextInput
            style={styles.textInput}
            value={points}
            onChangeText={setPoints}
            placeholder="Enter points"
            keyboardType="numeric"
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Reason (Optional)</Text>
          <TextInput
            style={styles.textInput}
            value={reason}
            onChangeText={setReason}
            placeholder="e.g., Purchase, Bonus, etc."
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Adding Points...' : 'Add Points'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const ClientInfo = ({ client, onAddPoints, addPointsLoading, onPointsAdded }) => {
  const [quickPoints, setQuickPoints] = useState('');

  // Add: Quick add preset values
  const quickAddPresets = [5, 10, 20, 50];

  const handleQuickAdd = (value) => {
    const pointsValue = typeof value === 'number' ? value : parseInt(quickPoints);
    if (!pointsValue || pointsValue <= 0) {
      Alert.alert('Invalid Points', 'Please enter a valid number of points');
      return;
    }
    if (typeof onAddPoints === 'function') {
      onAddPoints(pointsValue).then((result) => {
        if (onPointsAdded) onPointsAdded(result);
      });
      setQuickPoints('');
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Avatar color always black, text always white
  const getAvatarColor = () => '#000000';

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!client) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Client Selected</Text>
          <Text style={styles.emptySubtitle}>
            Please scan NFC or QR code to view client information
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.clientCard}>
        {/* Card Header: Avatar, Name, Phone */}
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: getAvatarColor() }]}>
            <Text style={styles.avatarText}>{getInitials(client.name)}</Text>
          </View>
          <View style={styles.clientMainInfo}>
            <Text style={styles.clientName} numberOfLines={1}>{client.name}</Text>
            <Text style={styles.clientPhone}>{client.phone}</Text>
          </View>
        </View>
        <View style={styles.divider} />
        {/* Card Body */}
        <View style={styles.cardBody}>
          {/* Email row */}
          {client.email && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <View style={styles.icon}>
                  <Text style={styles.iconText}>@</Text>
                </View>
              </View>
              <Text style={styles.clientInfo} numberOfLines={1}>{client.email}</Text>
            </View>
          )}
          {/* Stats row */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{client.totalVisits || 0}</Text>
              <Text style={styles.statLabel}>Visits</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{client.points || 0}</Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
          </View>
          {/* Member since */}
          <View style={styles.joinedDateContainer}>
            <Text style={styles.joinedDateText}>
              {client.dateCreated
                ? `Member since ${new Date(client.dateCreated).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit',
                  })}`
                : 'Member since -'}
            </Text>
          </View>
          {/* Additional client details */}
          <View style={styles.detailsSection}>
            {client.lastVisit && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Visit</Text>
                <Text style={styles.detailValue}>
                  {formatDate(client.lastVisit)}
                </Text>
              </View>
            )}
            {client.favoriteService && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Favorite Service</Text>
                <Text style={styles.detailValue}>{client.favoriteService}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
      {/* Quick Add Points */}
      {typeof onAddPoints === 'function' && (
        <>
          <View style={{ height: 10 }} />
          <View style={styles.quickAddPresetsRow}>
            {quickAddPresets.map((val) => (
              <TouchableOpacity
                key={val}
                style={[styles.quickAddPresetButton, addPointsLoading && styles.quickAddButtonDisabled]}
                onPress={() => handleQuickAdd(val)}
                disabled={addPointsLoading}
              >
                <Text style={styles.quickAddPresetText}>+{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.quickAddRow}>
            <TextInput
              style={styles.quickAddInput}
              value={quickPoints}
              onChangeText={setQuickPoints}
              placeholder="Quick add points"
              keyboardType="numeric"
              editable={!addPointsLoading}
              maxLength={4}
            />
            <TouchableOpacity
              style={[styles.quickAddButton, addPointsLoading && styles.quickAddButtonDisabled]}
              onPress={() => handleQuickAdd()}
              disabled={addPointsLoading}
            >
              <Text style={styles.quickAddButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  clientCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#000000',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  clientMainInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 15,
    color: '#222222',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 20,
  },
  cardBody: {
    padding: 20,
    paddingTop: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 14,
    color: '#222222',
    fontWeight: '600',
  },
  clientInfo: {
    fontSize: 15,
    color: '#000000',
    flex: 1,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#222222',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 16,
  },
  joinedDateContainer: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinedDateText: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '400',
    textAlign: 'center',
  },
  // --- Details section (unchanged) ---
  detailsSection: {
    paddingTop: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  // --- Empty state (unchanged) ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  // --- Quick Add Points (unchanged) ---
  quickAddPresetsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 16,
    marginBottom: 8,
    gap: 10,
  },
  quickAddPresetButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  quickAddPresetText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 0,
  },
  quickAddInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    marginRight: 10,
  },
  quickAddButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  quickAddButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ClientInfo;