import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
  PanResponder,
} from 'react-native';
import { useScanClientMutation } from '../store/clientsApi';
import SuccessMessage from '../components/SuccessMessage';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 1.1; // Increased card width (was width * 0.95)
const CARD_HEIGHT = 300;         // Make card taller

const NFCCard = ({ onPress, disabled, animatedStyle, isActive }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Always run the wave animation, regardless of isActive
    const waveLoop = Animated.loop(
      Animated.timing(waveAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    waveLoop.start();

    // Only run the pulse animation when active
    let pulseLoop;
    if (isActive) {
      pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
    }

    // Reset waveAnim to 0 when animation completes to keep it looping smoothly
    const waveListener = waveAnim.addListener(({ value }) => {
      if (value === 1) {
        waveAnim.setValue(0);
      }
    });

    return () => {
      waveLoop.stop();
      if (pulseLoop) pulseLoop.stop();
      waveAnim.removeListener(waveListener);
    };
  }, []); // Remove isActive from dependency array to keep wave always running

  const waveOpacity = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.8, 0.3, 0],
  });

  const waveScale = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1.5],
  });

  return (
    <Animated.View style={[
      styles.cardContainer,
      animatedStyle,
      styles.nfcCardRotate
    ]}>
      <TouchableOpacity
        style={[
          styles.nfcCard,
          styles.nfcCardLarge,
          disabled && styles.disabled
        ]}
        onPress={onPress} // already calls onPress from parent
        activeOpacity={0.95}
        disabled={disabled}
      >
        {/* Simple solid background */}
        <View style={styles.nfcSimpleBackground} />

        {/* Centered Content */}
        <View style={styles.nfcPremiumContent}>
          {/* NFC Waves */}
          <View style={styles.nfcWaves}>
            {[1, 2, 3].map((i) => (
              <Animated.View
                key={i}
                style={[
                  styles.wave,
                  {
                    width: 30 + i * 15,
                    height: 30 + i * 15,
                    opacity: waveOpacity,
                    transform: [{ scale: waveScale }],
                  },
                ]}
              />
            ))}
          </View>

          {/* Large NFC Text */}
          <Text style={styles.nfcPremiumTitle}>NFC</Text>
        </View>

        {/* Tap Indicator */}
        <View style={styles.tapIndicator}>
          <Text style={styles.tapText}>TAP TO SCAN</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const QRCard = ({ onPress, disabled, animatedStyle, isActive }) => {
  // Remove animation logic for simplicity
  return (
    <Animated.View style={[
      styles.qrBoxContainer,
      animatedStyle,
      { alignItems: 'center', justifyContent: 'center', left: '-2.5%' }  
    ]}>
      <TouchableOpacity
        style={[
          styles.qrBoxTouchable,
          { alignItems: 'center', justifyContent: 'center' },
          disabled && styles.disabled
        ]}
        onPress={onPress} // already calls onPress from parent
        activeOpacity={0.95}
        disabled={disabled}
      >
        <View style={styles.qrBoxOuter}>
          <View style={styles.qrBoxInnerSimple}>
            {/* Simple QR Pattern */}
            <View style={styles.qrPattern}>
              {[...Array(8)].map((_, row) => (
                <View key={row} style={styles.qrRow}>
                  {[...Array(8)].map((_, col) => (
                    <View
                      key={col}
                      style={[
                        styles.qrBlock,
                        (row + col) % 2 === 0 ? styles.qrBlockFilled : null,
                      ]}
                    />
                  ))}
                </View>
              ))}
            </View>
            {/* Simple Corners */}
            <View style={styles.qrCorners}>
              <View style={[styles.qrCorner, styles.topLeft]} />
              <View style={[styles.qrCorner, styles.topRight]} />
              <View style={[styles.qrCorner, styles.bottomLeft]} />
            </View>
          </View>
        </View>
        {/* QR Title and Tap Indicator below the box */}
        <View style={[
          styles.qrBoxLabel,
          { alignItems: 'center', marginLeft: 0 } // center label text
        ]}>
          <Text style={styles.qrMainText}>QR SCANNER</Text>
          <Text style={styles.qrSubText}>Tap to scan</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation, route }) => {
  const [scanClient, { isLoading }] = useScanClientMutation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentClient, setCurrentClient] = useState(null); // Add currentClient state
  const [success, setSuccess] = useState(false);
  const [pointsAdded, setPointsAdded] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (route?.params?.success && route?.params?.pointsAdded && route?.params?.totalPoints) {
      setSuccess(true);
      setPointsAdded(route.params.pointsAdded);
      setTotalPoints(route.params.totalPoints);
      // Remove params so message doesn't show again on back
      navigation.setParams({ success: undefined, pointsAdded: undefined, totalPoints: undefined });
    }
  }, [route?.params]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const logoScale = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const handleScan = async (type) => {
    // Use currentClient for navigation
    navigation.navigate('AddPoints', { client: currentClient });
  };

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10;
    },
    onPanResponderGrant: () => {
      translateX.setOffset(translateX._value);
      translateX.setValue(0);
    },
    onPanResponderMove: Animated.event(
      [null, { dx: translateX }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: (evt, gestureState) => {
      translateX.flattenOffset();
      
      const { dx, vx } = gestureState;
      const threshold = width * 0.25;
      const velocityThreshold = 0.5;
      
      let newIndex = currentIndex;
      
      if (Math.abs(dx) > threshold || Math.abs(vx) > velocityThreshold) {
        if (dx > 0 && currentIndex > 0) {
          newIndex = currentIndex - 1;
        } else if (dx < 0 && currentIndex < 1) {
          newIndex = currentIndex + 1;
        }
      }
      
      setCurrentIndex(newIndex);
      
      Animated.spring(translateX, {
        toValue: -newIndex * CARD_WIDTH,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {/* Success Message */}
      {success && (
        <View style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          zIndex: 0,
          alignItems: 'center', // center horizontally
        }}>
          <View style={{
            width: 300, // smaller width

            borderRadius: 16,
            padding: 0,
            overflow: 'hidden',
          }}>
            <SuccessMessage
              visible={success}
              pointsAdded={pointsAdded}
              totalPoints={totalPoints}
              onHide={() => setSuccess(false)}
            />
          </View>
        </View>
      )}

      {/* Clients Button at Top Left */}
      <TouchableOpacity
        style={styles.clientsButton}
        onPress={() => navigation.navigate('ClientsList')}
        activeOpacity={0.7}
      >
        <Image
          source={require('../../assets/clients.png')}
          style={styles.clientsIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Background */}
      <View style={styles.backgroundGradient} />
      
      <View style={styles.centerContent}>
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: logoScale }
              ]
            }
          ]}
        >
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Cards Container */}
        <View style={styles.cardsContainer}>
          <Animated.View
            style={[
              styles.cardsWrapper,
              {
                transform: [{ translateX }]
              }
            ]}
            {...panResponder.panHandlers}
          >
              <NFCCard
                onPress={() => handleScan('NFC')}
                disabled={isLoading}
                animatedStyle={styles.cardSlide}
                isActive={currentIndex === 0}
              />
              {/* Add space between the cards */}
              <View style={styles.cardSpacer} />
              <QRCard
                onPress={() => handleScan('QR')}
                disabled={isLoading}
                animatedStyle={styles.cardSlide}
                isActive={currentIndex === 1}
              />
            </Animated.View>
        </View>

        {/* Indicators */}
        <View style={styles.indicators}>
          {[0, 1].map((index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.indicator,
                currentIndex === index && styles.activeIndicator
              ]}
              onPress={() => {
                setCurrentIndex(index);
                Animated.spring(translateX, {
                  toValue: -index * CARD_WIDTH,
                  useNativeDriver: false,
                  tension: 100,
                  friction: 8,
                }).start();
              }}
            />
          ))}
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            {currentIndex === 0 ? 'Swipe left for QR Code scanner' : 'Swipe right for NFC scanner'}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  clientsButton: {
    position: 'absolute',
    top: 70,      // move to top
    right: 29,    // keep at right
    zIndex: 100,
    width: 40,
    height: 40,
    backgroundColor: 'transparent',
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  clientsIcon: {
    width: 28,
    height: 28,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    opacity: 0.05,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 0,
    marginTop: -60, // move logo even further up
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 60,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 0,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  cardsContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    marginBottom: 0,
  },
  cardsWrapper: {
    flexDirection: 'row',
    width: CARD_WIDTH * 2 + 24, // add space for spacer
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardSlide: {
    marginHorizontal: 0,
  },
  cardSpacer: {
    width: 24,
  },
  nfcCardRotate: {
    transform: [{ rotate: '90deg' }],
  },

  // NFC Card Styles
  nfcCard: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000', // changed to black
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  nfcCardLarge: {
    backgroundColor: '#000', // changed to black
    width: '100%',
    height: '100%',
  },
  nfcSimpleBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000', // changed to black
  },
  nfcPremiumContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  nfcPremiumTitle: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginTop: 24,
    marginBottom: 4,
    textShadowColor: '#fff',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  nfcPremiumSubtitle: {
    color: '#fbbf24',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 12,
  },
  nfcWaves: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  wave: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 50,
    right: 0,
    top: 0,
  },
  tapIndicator: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  tapText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  // QR Card Styles
  qrBoxContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBoxTouchable: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  qrBoxOuter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
    marginBottom: 20,
  },
  qrBoxInner: {
    width: 120,
    height: 120,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 4,
    borderColor: '#22c55e',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrBoxInnerSimple: {
    width: 120,
    height: 120,
    backgroundColor: 'black',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#black',
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPattern: {
    flex: 1,
    flexDirection: 'column',
    zIndex: 1,
  },
  qrRow: {
    flex: 1,
    flexDirection: 'row',
  },
  qrBlock: {
    flex: 1,
    backgroundColor: 'black',
    margin: 0.5,
    borderRadius: 1,
  },
  qrBlockFilled: {
    backgroundColor: '#0f172a',
  },
  qrCorners: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    zIndex: 2,
  },
  qrCorner: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderWidth: 3,
    borderColor: '#fff',
    borderRadius: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 3,
  },
  qrBoxLabel: {
    alignItems: 'center',
    marginTop: 8,
  },
  qrMainText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 2,
  },
  qrSubText: {
    color: '#blacl',
    fontSize: 14,
    letterSpacing: 0.5,
  },

  // Indicators
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20, 
    marginTop: 110,    // add more space above indicators
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#000',
    width: 20,
  },

  // Instructions
  instructions: {
    paddingHorizontal: 20,
    marginBottom: 0, // move instructions further down
  },
  instructionText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  disabled: {
    opacity: 0.6,
  },
});

export default HomeScreen;