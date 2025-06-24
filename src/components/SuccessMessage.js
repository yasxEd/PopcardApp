import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const SuccessMessage = ({ visible, pointsAdded, totalPoints, onHide }) => {
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible, fadeAnim, onHide]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.message}>
       ✦ {pointsAdded} ✦ points added! &nbsp;
        <Text style={styles.totalText}>Total: {totalPoints}</Text>
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginVertical: 10,
    alignSelf: 'center',
    minWidth: 0,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOpacity: 0.08, // more subtle shadow
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  icon: {
    fontSize: 22,
    marginRight: 10,
  },
  message: {
    color: '#111',
    fontSize: 15,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  totalText: {
    color: '#22c55e',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default SuccessMessage;