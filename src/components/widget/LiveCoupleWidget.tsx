import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { PixelCharacter, CharacterConfig, CharacterMood, CharacterAction } from '../pixel/PixelCharacter';
import { PixelPet, PetType } from '../pixel/PixelPet';
import { PixelBatteryBar, PixelHeart, PixelPlant } from '../pixel/PixelIcons';
import { PixelSprite } from '../pixel/PixelSprite';
import { retroAudio } from '../../utils/audio';

export type RoomTheme = 'rainy' | 'fireplace' | 'beach';

interface LiveCoupleWidgetProps {
  userConfig: CharacterConfig;
  partnerConfig: CharacterConfig;
  partnerMood: CharacterMood;
  partnerBattery: number;
  partnerStatus: {
    isSleeping: boolean;
    isWorking: boolean;
    isLowBattery: boolean;
  };
  roomTheme: RoomTheme;
  petType: PetType;
  currentAction: CharacterAction;
  latestNote: string;
  latestNoteSender?: string;
  latestPhotoUrl?: string;
  latestPhotoTimestamp?: string;
  isDevelopingPhoto?: boolean;
  latestDoodleGrid?: string[][];
  onWidgetClick?: () => void;
  isNightMode?: boolean;
  onDismissPhoto?: () => void;
  latestNoteKey?: number;
}

export const LiveCoupleWidget: React.FC<LiveCoupleWidgetProps> = ({
  userConfig,
  partnerConfig,
  partnerMood,
  partnerBattery,
  partnerStatus,
  roomTheme,
  petType,
  currentAction,
  latestNote,
  latestNoteSender,
  latestPhotoUrl,
  latestPhotoTimestamp = 'Just now',
  isDevelopingPhoto = false,
  latestDoodleGrid,
  onWidgetClick,
  isNightMode = false,
  onDismissPhoto,
  latestNoteKey,
}) => {
  const [displayedNote, setDisplayedNote] = useState('');
  const [prevNoteKey, setPrevNoteKey] = useState<string | number | undefined>(latestNoteKey);
  if (latestNoteKey !== prevNoteKey) {
    setPrevNoteKey(latestNoteKey);
    setDisplayedNote('');
  }

  const [cameraFlash, setCameraFlash] = useState(false);

  // 1. Dual-State Persistent Wall Love Note (Home Screen Widget Safe)
  const [readNoteKeys, setReadNoteKeys] = useState<Record<string, boolean>>({});
  const noteId = String(latestNoteKey ?? latestNote ?? '');
  const showWallNote = Boolean(latestNote && latestNote.trim());
  const isNewNote = Boolean(noteId && !readNoteKeys[noteId]);

  // 2. Interactive Cozy Floor Lamp
  const [isLampOn, setIsLampOn] = useState(true);

  // 3. Retro Pixel Jukebox & Floating Notes
  const [isPlayingJukebox, setIsPlayingJukebox] = useState(false);
  const [musicNoteAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(musicNoteAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(musicNoteAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [musicNoteAnim]);

  const handleTapJukebox = () => {
    retroAudio.playJukebox();
    setIsPlayingJukebox(true);
    setTimeout(() => setIsPlayingJukebox(false), 3600);
  };

  // 4. Joy Mode / Zoomies Running across screen
  const [joyRunAnim] = useState(() => new Animated.Value(0));
  const [joyHopAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (currentAction === 'joy') {
      retroAudio.playZoomies();
      joyRunAnim.setValue(0);
      joyHopAnim.setValue(0);

      Animated.sequence([
        // Dash right towards partner
        Animated.timing(joyRunAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        // Joyful leap
        Animated.sequence([
          Animated.timing(joyHopAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
          Animated.timing(joyHopAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        ]),
        // Dash back across room
        Animated.timing(joyRunAnim, {
          toValue: 2,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        joyRunAnim.setValue(0);
      });
    }
  }, [currentAction, joyRunAnim, joyHopAnim]);

  // 5. Ambient Window Weather Loop (Raindrops & Meteors)
  const [windowAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(windowAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [windowAnim]);

  // 6. Interactive Pet Toy
  const [yarnBounce, setYarnBounce] = useState(false);
  const handleTapPetToy = () => {
    retroAudio.playPoke();
    setYarnBounce(true);
    setTimeout(() => setYarnBounce(false), 450);
  };

  // Typewriter effect + 5-Second Auto-Vanish (for ephemeral bubble)
  useEffect(() => {
    let index = 0;
    let dismissTimer: ReturnType<typeof setTimeout>;

    if (!latestNote || !latestNote.trim()) return;

    const timer = setInterval(() => {
      index++;
      if (index <= latestNote.length) {
        setDisplayedNote(latestNote.slice(0, index));
      } else {
        clearInterval(timer);
        // Automatically vanish after 5 seconds
        dismissTimer = setTimeout(() => {
          setDisplayedNote('');
        }, 5000);
      }
    }, 35);

    return () => {
      clearInterval(timer);
      clearTimeout(dismissTimer);
    };
  }, [latestNote, latestNoteKey]);

  useEffect(() => {
    if (currentAction === 'photo') {
      const flashTimer = setTimeout(() => setCameraFlash(true), 0);
      const timer = setTimeout(() => setCameraFlash(false), 500);
      return () => {
        clearTimeout(flashTimer);
        clearTimeout(timer);
      };
    }
  }, [currentAction]);

  const getMoodLabel = (m: CharacterMood) => {
    switch (m) {
      case 'joy': return 'Joy 💖';
      case 'sleepy': return 'Sleepy 💤';
      case 'working': return 'Working 💻';
      case 'miss_you': return 'Miss you 🥺';
      case 'loved': return 'Loved 🥰';
      default: return 'Cozy ✨';
    }
  };

  // Joy interpolation calculations
  const joyTranslateX = joyRunAnim.interpolate({
    inputRange: [0, 1, 1.05, 2],
    outputRange: [0, 68, 68, 0],
  });

  const joyScaleX = joyRunAnim.interpolate({
    inputRange: [0, 0.98, 1, 1.02, 1.98, 2],
    outputRange: [1, 1, -1, -1, -1, 1],
  });

  const joyHopY = joyHopAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });

  // Music note bobbing interpolation
  const musicNoteTranslateY = musicNoteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -7],
  });

  const musicNoteRotate = musicNoteAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-6deg', '8deg'],
  });

  // Window Raindrop falling interpolation
  const rainTranslateY = windowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  const rainOpacity = windowAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0.3, 0.9, 0.8, 0.2],
  });

  // Starry window meteor streak interpolation
  const meteorTranslateX = windowAnim.interpolate({
    inputRange: [0, 0.4, 0.8, 1],
    outputRange: [-10, 15, 55, 75],
  });

  const meteorOpacity = windowAnim.interpolate({
    inputRange: [0, 0.25, 0.6, 1],
    outputRange: [0, 1, 0.7, 0],
  });

  const handleToggleLamp = () => {
    retroAudio.playLampClick();
    setIsLampOn(prev => !prev);
  };

  const handleTapWallNote = () => {
    retroAudio.playPoke();
    if (noteId) {
      setReadNoteKeys((prev) => ({ ...prev, [noteId]: true }));
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onWidgetClick}
      style={[
        styles.widgetWrapper,
        isNightMode && styles.widgetWrapperNight,
      ]}
    >
      {/* Camera Flash Overlay */}
      {cameraFlash && <View style={styles.flashOverlay} pointerEvents="none" />}

      {/* Top Status Bar */}
      <View
        style={[
          styles.statusBar,
          isNightMode && styles.statusBarNight,
        ]}
      >
        <View style={styles.statusLeft}>
          <View style={[styles.dotIndicator, isNightMode && { backgroundColor: '#8EE4AF' }]} />
          <Text
            style={[
              styles.partnerNameText,
              isNightMode && { color: '#FFFFFF' },
            ]}
          >
            {partnerConfig.name}
          </Text>
          <View
            style={[
              styles.moodBadge,
              isNightMode && styles.moodBadgeNight,
            ]}
          >
            <Text
              style={[
                styles.moodBadgeText,
                isNightMode && { color: '#FAF7EE' },
              ]}
            >
              {getMoodLabel(partnerMood)}
            </Text>
          </View>
        </View>

        {/* 10-Segment Battery Bar */}
        <PixelBatteryBar level={partnerBattery} />
      </View>

      {/* Room Background / Wallpaper & Themes */}
      <View style={styles.roomContainer}>
        {/* NIGHT MODE ROOM WALLPAPER */}
        {isNightMode ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: '#111424' }]}>
            {/* Starry Night Window with shooting star */}
            <View style={styles.nightWindow}>
              <Text style={styles.crescentMoon}>🌙</Text>
              <View style={[styles.nightStar, { top: 6, left: 10 }]} />
              <View style={[styles.nightStar, { top: 18, left: 22 }]} />
              <View style={[styles.nightStar, { top: 10, left: 42 }]} />
              <View style={[styles.nightStar, { top: 22, left: 52 }]} />
              <Animated.View
                style={[
                  styles.shootingStar,
                  {
                    transform: [{ translateX: meteorTranslateX }],
                    opacity: meteorOpacity,
                  },
                ]}
              />
            </View>

            {/* Warm Fairy Lights String */}
            <View style={styles.fairyLightsRow}>
              {['#FFD166', '#FF85A1', '#8EE4AF', '#FFD166', '#FF85A1', '#8EE4AF'].map((c, i) => (
                <View key={i} style={[styles.fairyBulb, { backgroundColor: c }]} />
              ))}
            </View>

            {/* Warm Hearth if fireplace theme is selected */}
            {roomTheme === 'fireplace' && (
              <View style={styles.hearthContainer}>
                <Text style={[styles.hearthText, { color: '#FFD166' }]}>HEARTH</Text>
                <PixelSprite
                  pixelSize={3}
                  grid={[
                    '....X....',
                    '...XYX...',
                    '..XYRYX..',
                    '.XYRORYX.',
                    'XYROOORYX',
                    '.XXXXXXX.',
                  ]}
                  colorMap={{
                    X: '#1E1E24',
                    Y: '#FFD166',
                    R: '#FF5A79',
                    O: '#F4A261',
                  }}
                />
              </View>
            )}
          </View>
        ) : (
          /* DAY MODE ROOM THEMES */
          <>
            {roomTheme === 'rainy' && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: '#D4E0E6' }]}>
                {/* Window with animated rain */}
                <View style={styles.rainyWindow}>
                  <View style={styles.windowMullionV} />
                  <View style={styles.windowMullionH} />
                  <Animated.View
                    style={[
                      styles.raindrop,
                      { top: 6, left: 14, transform: [{ translateY: rainTranslateY }], opacity: rainOpacity },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.raindrop,
                      { top: 18, left: 34, transform: [{ translateY: rainTranslateY }], opacity: rainOpacity },
                    ]}
                  />
                  <Animated.View
                    style={[
                      styles.raindrop,
                      { top: 10, left: 52, transform: [{ translateY: rainTranslateY }], opacity: rainOpacity },
                    ]}
                  />
                </View>
              </View>
            )}

            {roomTheme === 'fireplace' && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: '#F4DFCD' }]}>
                {/* Hearth */}
                <View style={styles.hearthContainer}>
                  <Text style={styles.hearthText}>HEARTH</Text>
                  <PixelSprite
                    pixelSize={3}
                    grid={[
                      '....X....',
                      '...XYX...',
                      '..XYRYX..',
                      '.XYRORYX.',
                      'XYROOORYX',
                      '.XXXXXXX.',
                    ]}
                    colorMap={{
                      X: '#1E1E24',
                      Y: '#FFD166',
                      R: '#FF5A79',
                      O: '#F4A261',
                    }}
                  />
                </View>
              </View>
            )}

            {roomTheme === 'beach' && (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: '#161B33' }]}>
                <View style={styles.beachWindow}>
                  <Text style={styles.moonEmoji}>🌙</Text>
                  <View style={styles.waveLayer} />
                </View>
              </View>
            )}
          </>
        )}

        {/* Top-Right: Polaroid Photo Frame with Pin */}
        {latestPhotoUrl && (
          <View style={[styles.polaroidFrame, isDevelopingPhoto && { opacity: 0.7 }]}>
            <View style={styles.pin} />
            <View style={styles.photoWrapper}>
              <Image
                source={{ uri: latestPhotoUrl }}
                style={styles.photoImage}
                resizeMode="cover"
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.polaroidTime} numberOfLines={1}>
                {latestPhotoTimestamp}
              </Text>
              {onDismissPhoto && (
                <TouchableOpacity onPress={onDismissPhoto} style={styles.photoDismissBtn}>
                  <Text style={styles.photoDismissText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Retro Pixel Jukebox Shelf */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleTapJukebox}
          style={styles.jukeboxContainer}
        >
          {isPlayingJukebox && (
            <Animated.View
              style={[
                styles.floatingNotesRow,
                {
                  transform: [
                    { translateY: musicNoteTranslateY },
                    { rotate: musicNoteRotate },
                  ],
                },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.musicNoteText}>♪</Text>
              <Text style={[styles.musicNoteText, { fontSize: 13, color: '#FF85A1' }]}>♫</Text>
              <Text style={[styles.musicNoteText, { fontSize: 10, color: '#8EE4AF' }]}>♪</Text>
            </Animated.View>
          )}
          <View style={styles.shelfBoard} />
          <View style={[styles.jukeboxBody, isPlayingJukebox && styles.jukeboxPlaying]}>
            <View style={styles.jukeboxSpeakerGrid}>
              <View style={styles.jukeboxSpeakerLine} />
              <View style={styles.jukeboxSpeakerLine} />
            </View>
            <View style={[styles.jukeboxLed, isPlayingJukebox && { backgroundColor: '#8EE4AF' }]} />
          </View>
        </TouchableOpacity>

        {/* Latest Doodle Framed on the Wall */}
        {latestDoodleGrid && (
          <View style={styles.doodleFrame}>
            <View style={styles.doodleGridContainer}>
              {latestDoodleGrid.map((row, r) => (
                <View key={r} style={{ flexDirection: 'row' }}>
                  {row.map((col, c) => (
                    <View
                      key={`${r}-${c}`}
                      style={{ backgroundColor: col || '#FFFDF9', width: 3, height: 3 }}
                    />
                  ))}
                </View>
              ))}
            </View>
            <Text style={styles.doodleLabel}>DOODLE</Text>
          </View>
        )}

        {/* Persistent Wall Love Note (Home Screen Widget Safe) */}
        {showWallNote && Boolean(latestNote) && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleTapWallNote}
            style={[
              styles.wallNoteCard,
              latestPhotoUrl ? { right: 110 } : { right: 14 },
              isNightMode && styles.wallNoteCardNight,
              isNewNote && styles.wallNoteCardNew,
            ]}
          >
            <View style={styles.wallNotePin} />
            <View style={styles.wallNoteHeader}>
              <Text style={styles.wallNoteTitle} numberOfLines={1}>
                📌 {latestNoteSender ? `${latestNoteSender}` : 'Note'}
              </Text>
              {isNewNote ? (
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>✨ NEW</Text>
                </View>
              ) : (
                <Text style={styles.seenBadgeText}>✓ Seen</Text>
              )}
            </View>
            <Text
              style={[
                styles.wallNoteText,
                isNightMode && { color: '#E8ECF5' },
              ]}
              numberOfLines={2}
            >
              {latestNote}
            </Text>
          </TouchableOpacity>
        )}

        {/* COMPACT PIXEL SPEECH BUBBLE (High above characters, auto-vanishes) */}
        {Boolean(displayedNote) && (
          <View style={styles.bubbleContainer} pointerEvents="box-none">
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setDisplayedNote('')}
              style={[
                styles.speechBubble,
                isNightMode && styles.speechBubbleNight,
              ]}
            >
              {Boolean(latestNoteSender) && (
                <View style={styles.speechSenderBadge}>
                  <Text style={styles.speechSenderText}>{latestNoteSender}</Text>
                </View>
              )}
              <Text
                style={[
                  styles.speechBubbleText,
                  isNightMode && styles.speechBubbleTextNight,
                ]}
              >
                &ldquo;{displayedNote}&rdquo;
              </Text>
            </TouchableOpacity>
            <View
              style={[
                styles.bubbleTail,
                isNightMode && { borderTopColor: '#22263C' },
              ]}
            />
          </View>
        )}

        {/* Ambient Floor Lamp Glow */}
        {isLampOn && (
          <View
            style={[
              styles.lampAmbientGlow,
              isNightMode ? styles.lampAmbientGlowNight : styles.lampAmbientGlowDay,
            ]}
            pointerEvents="none"
          />
        )}

        {/* Wooden Floor Planks & Characters Base */}
        <View style={styles.floorArea}>
          <View style={styles.characterRow}>
            {/* Potted Plant */}
            <View style={{ marginRight: -6 }}>
              <PixelPlant size={2.5} />
            </View>

            {/* You (with Joy Mode Running Animation) */}
            <Animated.View
              style={[
                { alignItems: 'center' },
                {
                  transform: [
                    { translateX: joyTranslateX },
                    { translateY: joyHopY },
                    { scaleX: joyScaleX },
                  ],
                },
              ]}
            >
              <PixelCharacter
                config={userConfig}
                mood={partnerMood}
                action={currentAction}
                isPartner={false}
                pixelSize={3.2}
              />
              <View
                style={[
                  styles.nameTag,
                  isNightMode && styles.nameTagNight,
                ]}
              >
                <Text
                  style={[
                    styles.nameTagText,
                    isNightMode && { color: '#FFFFFF' },
                  ]}
                >
                  {userConfig.name}
                </Text>
              </View>
            </Animated.View>

            {/* Selected Pet & Interactive Pet Toy */}
            {petType !== 'none' && (
              <View style={{ alignItems: 'center', marginBottom: 4 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handleTapPetToy}
                  style={[
                    styles.petToyContainer,
                    yarnBounce && { transform: [{ translateY: -6 }] },
                  ]}
                >
                  <Text style={styles.petToyEmoji}>
                    {petType === 'cat' ? '🧶' : '🦴'}
                  </Text>
                </TouchableOpacity>
                <PixelPet type={petType} pixelSize={2.6} />
              </View>
            )}

            {/* Partner "Juno" */}
            <View style={{ alignItems: 'center' }}>
              <PixelCharacter
                config={partnerConfig}
                mood={partnerMood}
                action={currentAction}
                isPartner={true}
                isSleeping={partnerStatus.isSleeping}
                pixelSize={3.2}
              />
              <View style={[styles.nameTag, { backgroundColor: '#FF85A1' }]}>
                <Text style={[styles.nameTagText, { color: '#FFFFFF' }]}>
                  {partnerConfig.name}
                </Text>
              </View>
            </View>

            {/* Cozy Floor Lamp */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handleToggleLamp}
              style={styles.floorLampContainer}
            >
              <View style={[styles.lampShade, !isLampOn && styles.lampShadeOff]} />
              <View style={styles.lampPole} />
              <View style={styles.lampBase} />
            </TouchableOpacity>
          </View>

          {/* Wooden Floor */}
          <View
            style={[
              styles.woodFloor,
              isNightMode && { backgroundColor: '#2C1E19', borderTopColor: '#1A110E' },
            ]}
          />
        </View>
      </View>

      {/* Widget Footer Glass Badge */}
      <View
        style={[
          styles.widgetFooter,
          isNightMode && styles.widgetFooterNight,
        ]}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <PixelHeart size={1.5} color="#FF85A1" />
          <Text
            style={[
              styles.footerText,
              isNightMode && { color: '#A0A6C2' },
            ]}
          >
            {' '}Bits & Us Room
          </Text>
        </View>
        <Text
          style={[
            styles.footerText,
            isNightMode && { color: '#A0A6C2' },
          ]}
        >
          {isNightMode ? '🌙 Night Room' : '2x2 Live Space'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  widgetWrapper: {
    width: '100%',
    maxWidth: 370,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#1E1E24',
    backgroundColor: '#FAF7EE',
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  widgetWrapperNight: {
    borderColor: '#2B304C',
    backgroundColor: '#111424',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFFFFF',
    zIndex: 50,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(250, 247, 238, 0.95)',
    borderBottomWidth: 3,
    borderBottomColor: '#1E1E24',
    zIndex: 20,
  },
  statusBarNight: {
    backgroundColor: 'rgba(17, 20, 36, 0.95)',
    borderBottomColor: '#2B304C',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8EE4AF',
    marginRight: 6,
  },
  partnerNameText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#1E1E24',
    marginRight: 8,
  },
  moodBadge: {
    backgroundColor: '#FAF7EE',
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  moodBadgeNight: {
    backgroundColor: '#23273D',
    borderColor: '#484F75',
  },
  moodBadgeText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
  },
  roomContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  nightWindow: {
    position: 'absolute',
    top: 8,
    left: 14,
    width: 68,
    height: 48,
    backgroundColor: '#0A0C16',
    borderWidth: 2,
    borderColor: '#2B304C',
    borderRadius: 6,
    overflow: 'hidden',
  },
  crescentMoon: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 14,
  },
  nightStar: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#FFE082',
    borderRadius: 1,
  },
  shootingStar: {
    position: 'absolute',
    top: 14,
    left: 0,
    width: 14,
    height: 1.5,
    backgroundColor: '#FFF9D2',
    borderRadius: 1,
    transform: [{ rotate: '-25deg' }],
  },
  fairyLightsRow: {
    position: 'absolute',
    top: 4,
    left: 90,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 12,
  },
  fairyBulb: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#FFE082',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  rainyWindow: {
    position: 'absolute',
    top: 8,
    left: 14,
    width: 70,
    height: 52,
    backgroundColor: '#B8C9D1',
    borderWidth: 2,
    borderColor: '#1E1E24',
  },
  windowMullionV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#1E1E24',
  },
  windowMullionH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#1E1E24',
  },
  raindrop: {
    position: 'absolute',
    width: 2,
    height: 6,
    backgroundColor: '#7A9AAB',
    borderRadius: 1,
  },
  hearthContainer: {
    position: 'absolute',
    left: 16,
    bottom: 40,
    alignItems: 'center',
  },
  hearthText: {
    fontSize: 7,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#D84A75',
    marginBottom: 2,
  },
  beachWindow: {
    position: 'absolute',
    top: 8,
    left: 14,
    width: 70,
    height: 50,
    backgroundColor: '#0F1326',
    borderWidth: 2,
    borderColor: '#1E1E24',
    overflow: 'hidden',
  },
  moonEmoji: {
    position: 'absolute',
    top: 4,
    right: 6,
    fontSize: 16,
  },
  waveLayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: '#1B3B6F',
    borderTopWidth: 1,
    borderTopColor: '#8EE4AF',
  },
  polaroidFrame: {
    position: 'absolute',
    top: 6,
    right: 12,
    width: 95,
    padding: 5,
    backgroundColor: '#FFFDF9',
    borderWidth: 2,
    borderColor: '#1E1E24',
    zIndex: 10,
    transform: [{ rotate: '2deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  pin: {
    position: 'absolute',
    top: -5,
    left: '50%',
    marginLeft: -5,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5A79',
    borderWidth: 1,
    borderColor: '#1E1E24',
    zIndex: 20,
  },
  photoWrapper: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#E0D8C3',
    borderWidth: 1,
    borderColor: '#1E1E24',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  polaroidTime: {
    fontSize: 7,
    fontFamily: 'monospace',
    marginTop: 3,
    color: 'rgba(30,30,36,0.7)',
    flex: 1,
  },
  photoDismissBtn: {
    paddingHorizontal: 3,
  },
  photoDismissText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FF5A79',
  },
  doodleFrame: {
    position: 'absolute',
    top: 10,
    left: 92,
    backgroundColor: '#FAF7EE',
    borderWidth: 2,
    borderColor: '#1E1E24',
    padding: 3,
    transform: [{ rotate: '-3deg' }],
    zIndex: 8,
  },
  doodleGridContainer: {
    borderWidth: 1,
    borderColor: '#1E1E24',
    padding: 1,
    backgroundColor: '#1E1E24',
  },
  doodleLabel: {
    fontSize: 6,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 2,
    color: '#1E1E24',
  },
  bubbleContainer: {
    position: 'absolute',
    top: 36,
    left: 14,
    right: 14,
    alignItems: 'center',
    zIndex: 35,
  },
  speechBubble: {
    backgroundColor: '#FFFDF9',
    borderWidth: 2,
    borderColor: '#1E1E24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    maxWidth: 190,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 3,
  },
  speechBubbleNight: {
    backgroundColor: '#22263C',
    borderColor: '#4A527A',
  },
  speechSenderBadge: {
    alignSelf: 'center',
    backgroundColor: '#FF85A1',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginBottom: 2,
  },
  speechSenderText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 6.5,
    color: '#FFFFFF',
  },
  speechBubbleText: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#1E1E24',
    textAlign: 'center',
    lineHeight: 12,
  },
  speechBubbleTextNight: {
    color: '#FAF7EE',
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#1E1E24',
    marginTop: -0.5,
  },
  floorArea: {
    marginTop: 'auto',
    zIndex: 10,
  },
  characterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingBottom: 6,
    gap: 16,
  },
  nameTag: {
    backgroundColor: '#FAF7EE',
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  nameTagNight: {
    backgroundColor: '#24283F',
    borderColor: '#484F75',
  },
  nameTagText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#1E1E24',
  },
  woodFloor: {
    height: 24,
    backgroundColor: '#EAD7C0',
    borderTopWidth: 2,
    borderTopColor: '#C4AB8E',
  },
  widgetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(250, 247, 238, 0.95)',
    borderTopWidth: 2,
    borderTopColor: '#1E1E24',
  },
  widgetFooterNight: {
    backgroundColor: 'rgba(17, 20, 36, 0.95)',
    borderTopColor: '#2B304C',
  },
  footerText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: 'rgba(30,30,36,0.6)',
  },
  // Retro Pixel Jukebox
  jukeboxContainer: {
    position: 'absolute',
    top: 10,
    left: 88,
    alignItems: 'center',
    zIndex: 12,
  },
  shelfBoard: {
    width: 38,
    height: 4,
    backgroundColor: '#8C6239',
    borderWidth: 1,
    borderColor: '#1E1E24',
    borderRadius: 1,
    marginTop: 2,
  },
  jukeboxBody: {
    width: 28,
    height: 24,
    backgroundColor: '#F4A261',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  jukeboxPlaying: {
    borderColor: '#FF85A1',
    backgroundColor: '#F28E5B',
  },
  jukeboxSpeakerGrid: {
    width: 16,
    height: 8,
    backgroundColor: '#264653',
    justifyContent: 'space-around',
    paddingVertical: 1,
    paddingHorizontal: 2,
  },
  jukeboxSpeakerLine: {
    height: 1.5,
    backgroundColor: '#E76F51',
  },
  jukeboxLed: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E63946',
    marginTop: 2,
  },
  floatingNotesRow: {
    position: 'absolute',
    top: -16,
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  musicNoteText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD166',
  },
  // Persistent Wall Love Note
  wallNoteCard: {
    position: 'absolute',
    top: 12,
    width: 112,
    backgroundColor: '#FFFDE7',
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 4,
    transform: [{ rotate: '1.5deg' }],
    zIndex: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  wallNoteCardNight: {
    backgroundColor: '#262A40',
    borderColor: '#4E567E',
  },
  wallNoteCardNew: {
    borderColor: '#FF85A1',
    borderWidth: 2,
  },
  wallNotePin: {
    position: 'absolute',
    top: -4,
    left: '50%',
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A79',
    borderWidth: 1,
    borderColor: '#1E1E24',
  },
  wallNoteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  wallNoteTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 7.5,
    color: '#1E1E24',
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#FF85A1',
    borderRadius: 3,
    paddingHorizontal: 3,
    paddingVertical: 0.5,
  },
  newBadgeText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 6.5,
    color: '#FFFFFF',
  },
  seenBadgeText: {
    fontFamily: 'monospace',
    fontSize: 6.5,
    color: '#888888',
  },
  wallNoteText: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: '#2B2D42',
    lineHeight: 11,
  },
  // Ambient Floor Lamp
  floorLampContainer: {
    alignItems: 'center',
    marginLeft: -4,
    marginBottom: 2,
  },
  lampShade: {
    width: 18,
    height: 12,
    backgroundColor: '#FFE89E',
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  lampShadeOff: {
    backgroundColor: '#B5A882',
  },
  lampPole: {
    width: 2.5,
    height: 28,
    backgroundColor: '#8C6239',
  },
  lampBase: {
    width: 14,
    height: 3,
    backgroundColor: '#1E1E24',
    borderRadius: 1.5,
  },
  lampAmbientGlow: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 120,
    height: 140,
    backgroundColor: 'rgba(255, 230, 140, 0.16)',
    borderTopLeftRadius: 90,
    zIndex: 5,
  },
  lampAmbientGlowDay: {
    backgroundColor: 'rgba(255, 230, 140, 0.12)',
  },
  lampAmbientGlowNight: {
    backgroundColor: 'rgba(255, 230, 140, 0.22)',
  },
  // Pet Toy
  petToyContainer: {
    marginBottom: 2,
    alignItems: 'center',
  },
  petToyEmoji: {
    fontSize: 12,
  },
});
