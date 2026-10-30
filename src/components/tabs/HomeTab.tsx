import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LiveCoupleWidget, RoomTheme } from '../widget/LiveCoupleWidget';
import { CharacterConfig, CharacterMood, CharacterAction } from '../pixel/PixelCharacter';
import { PetType } from '../pixel/PixelPet';
import { retroAudio } from '../../utils/audio';

interface HomeTabProps {
  userConfig: CharacterConfig;
  partnerConfig: CharacterConfig;
  partnerMood: CharacterMood;
  onChangePartnerMood: (m: CharacterMood) => void;
  partnerBattery: number;
  onChangePartnerBattery: (b: number) => void;
  partnerStatus: {
    isSleeping: boolean;
    isWorking: boolean;
    isLowBattery: boolean;
  };
  onToggleStatus: (key: 'isSleeping' | 'isWorking' | 'isLowBattery') => void;
  roomTheme: RoomTheme;
  petType: PetType;
  currentAction: CharacterAction;
  onTriggerAction: (action: CharacterAction, notificationText?: string) => void;
  latestNote: string;
  latestNoteSender?: string;
  onSendNote: (note: string, sender: 'user' | 'partner') => void;
  latestPhotoUrl?: string;
  latestPhotoTimestamp?: string;
  onSnapPhoto: (photoUrl: string, sender: 'user' | 'partner') => void;
  latestDoodleGrid?: string[][];
  onOpenScribble: () => void;
  notification: string | null;
  onReopenOnboarding?: () => void;
  darkMode?: boolean;
  onDismissPhoto?: () => void;
  latestNoteKey?: number;
}

const PRESET_DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=400&q=80',
];

export const HomeTab: React.FC<HomeTabProps> = ({
  userConfig,
  partnerConfig,
  partnerMood,
  onChangePartnerMood,
  partnerBattery,
  onChangePartnerBattery,
  partnerStatus,
  onToggleStatus,
  roomTheme,
  petType,
  currentAction,
  onTriggerAction,
  latestNote,
  latestNoteSender,
  onSendNote,
  latestPhotoUrl,
  latestPhotoTimestamp,
  onSnapPhoto,
  latestDoodleGrid,
  onOpenScribble,
  notification,
  onReopenOnboarding,
  darkMode = false,
  onDismissPhoto,
  latestNoteKey,
}) => {
  const [noteInput, setNoteInput] = useState('');
  const [isPrintingPhoto, setIsPrintingPhoto] = useState(false);
  const [isPhotoPickerOpen, setIsPhotoPickerOpen] = useState(false);
  const [isSimOpen, setIsSimOpen] = useState(false);

  // Dual-perspective simulation state: which partner is currently active
  const [activeSpeaker, setActiveSpeaker] = useState<'user' | 'partner'>('user');
  const activeSpeakerName = activeSpeaker === 'user' ? userConfig.name : partnerConfig.name;

  const triggerHeartExplosion = async () => {
    try {
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        const confettiModule = await import('canvas-confetti');
        const confetti = confettiModule.default || confettiModule;
        confetti({
          particleCount: 40,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF85A1', '#FFB3C6', '#FFD166', '#8EE4AF'],
        });
      }
    } catch {
      // Confetti fallback
    }
  };

  const handleSendHug = () => {
    retroAudio.playHug();
    triggerHeartExplosion();
    onTriggerAction('hug', `❤️ ${activeSpeakerName} sent a warm hug!`);
    onSendNote('♥ Sent a warm hug!', activeSpeaker);
  };

  const handlePoke = () => {
    retroAudio.playPoke();
    onTriggerAction('poke', `👉 ${activeSpeakerName} gave a playful poke!`);
    onSendNote('👉 Poked you!', activeSpeaker);
  };

  const handleJoyRun = () => {
    retroAudio.playZoomies();
    onTriggerAction('joy', `🏃 ${activeSpeakerName} had joyful zoomies across the room!`);
    onSendNote('🏃 Zoomies around the room!', activeSpeaker);
  };

  const handleQuickChip = (text: string) => {
    setNoteInput('');
    const lower = text.toLowerCase();
    if (/hug|warm|love/.test(lower)) {
      handleSendHug();
    } else if (/poke|boop/.test(lower)) {
      handlePoke();
    } else if (/zoomies|run|joy/.test(lower)) {
      handleJoyRun();
    } else {
      retroAudio.playNote();
      onTriggerAction('note', `✉ ${activeSpeakerName}: "${text}"`);
      onSendNote(text, activeSpeaker);
    }
  };

  // Keyword-driven instruction engine
  const handleSendNote = () => {
    if (!noteInput.trim()) return;
    const text = noteInput.trim();
    const lower = text.toLowerCase();

    if (/joy|run|zoomies|happy|yay|jump|dance|excited|zoom/.test(lower)) {
      retroAudio.playZoomies();
      onTriggerAction('joy', `🏃 ${activeSpeakerName}: "${text}"`);
    } else if (/hug|love|cuddle|kiss|warm|xoxo|heart|miss/.test(lower)) {
      retroAudio.playHug();
      triggerHeartExplosion();
      onTriggerAction('hug', `❤️ ${activeSpeakerName}: "${text}"`);
    } else if (/poke|hey|boop|wake|look|psst|hi\b/.test(lower)) {
      retroAudio.playPoke();
      onTriggerAction('poke', `👉 ${activeSpeakerName} poked you: "${text}"`);
    } else if (/cheese|photo|pic|selfie|pose|smile/.test(lower)) {
      retroAudio.playShutter();
      onTriggerAction('photo', `📸 ${activeSpeakerName} struck a pose: "${text}"`);
    } else if (/sleep|goodnight|tired|bed|nap|night/.test(lower)) {
      retroAudio.playClick();
      onToggleStatus('isSleeping');
      onTriggerAction('note', `💤 ${activeSpeakerName}: "${text}"`);
    } else if (/work|code|study|laptop|busy|office/.test(lower)) {
      retroAudio.playClick();
      onToggleStatus('isWorking');
      onTriggerAction('note', `💻 ${activeSpeakerName}: "${text}"`);
    } else if (/doodle|draw|sketch|scribble/.test(lower)) {
      retroAudio.playClick();
      onTriggerAction('scribble', `✎ ${activeSpeakerName}: "${text}"`);
    } else {
      retroAudio.playNote();
      onTriggerAction('note', `✉ ${activeSpeakerName}: "${text}"`);
    }

    onSendNote(text, activeSpeaker);
    setNoteInput('');
  };

  // Live photo sharing handlers
  const handlePickFromCamera = async () => {
    setIsPhotoPickerOpen(false);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Camera access is required to take a live photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        processSharedPhoto(result.assets[0].uri);
      }
    } catch {
      // Fallback
      processSharedPhoto(PRESET_DEMO_PHOTOS[0]);
    }
  };

  const handlePickFromGallery = async () => {
    setIsPhotoPickerOpen(false);
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Needed', 'Gallery access is required to choose a photo.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        processSharedPhoto(result.assets[0].uri);
      }
    } catch {
      // Fallback
      processSharedPhoto(PRESET_DEMO_PHOTOS[1]);
    }
  };

  const processSharedPhoto = (url: string) => {
    retroAudio.playShutter();
    setIsPrintingPhoto(true);
    onTriggerAction('photo', `📸 ${activeSpeakerName} shared a live photo to the wall!`);

    setTimeout(() => {
      onSnapPhoto(url, activeSpeaker);
      setIsPrintingPhoto(false);
      retroAudio.playSuccess();
    }, 1800);
  };

  return (
    <View style={styles.container}>
      {/* Notification Banner */}
      {Boolean(notification) && (
        <View style={[styles.notificationBanner, darkMode && styles.notificationBannerNight]}>
          <Text style={{ fontSize: 14, marginRight: 6 }}>🔔</Text>
          <Text style={[styles.notificationText, darkMode && styles.notificationTextNight]}>
            {notification}
          </Text>
        </View>
      )}

      {/* Top Status Bar & Perspective Capsule */}
      <View style={styles.topBarRow}>
        <View style={[styles.liveStatusBadge, darkMode && styles.liveStatusBadgeNight]}>
          <View style={[styles.liveDot, darkMode && styles.liveDotNight]} />
          <Text style={[styles.liveStatusText, darkMode && styles.liveStatusTextNight]}>
            Live Room • Synced
          </Text>
        </View>

        {/* Minimal Perspective Switcher */}
        <View style={[styles.perspectiveCapsule, darkMode && styles.perspectiveCapsuleNight]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              retroAudio.playClick();
              setActiveSpeaker('user');
            }}
            style={[
              styles.speakerPill,
              activeSpeaker === 'user' && (darkMode ? styles.speakerPillActiveNight : styles.speakerPillActive),
            ]}
          >
            <Text
              style={[
                styles.speakerPillText,
                darkMode && styles.speakerPillTextNight,
                activeSpeaker === 'user' && { color: '#FFFFFF' },
              ]}
            >
              🧑 {userConfig.name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              retroAudio.playClick();
              setActiveSpeaker('partner');
            }}
            style={[
              styles.speakerPill,
              activeSpeaker === 'partner' && styles.speakerPillActivePartner,
            ]}
          >
            <Text
              style={[
                styles.speakerPillText,
                darkMode && styles.speakerPillTextNight,
                activeSpeaker === 'partner' && { color: '#FFFFFF' },
              ]}
            >
              💖 {partnerConfig.name}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* THE LIVE 2x2 HOME SCREEN WIDGET */}
      <LiveCoupleWidget
        userConfig={userConfig}
        partnerConfig={partnerConfig}
        partnerMood={partnerMood}
        partnerBattery={partnerBattery}
        partnerStatus={partnerStatus}
        roomTheme={roomTheme}
        petType={petType}
        currentAction={currentAction}
        latestNote={latestNote}
        latestNoteSender={latestNoteSender || activeSpeakerName}
        latestPhotoUrl={latestPhotoUrl}
        latestPhotoTimestamp={latestPhotoTimestamp}
        isDevelopingPhoto={isPrintingPhoto}
        latestDoodleGrid={latestDoodleGrid}
        onWidgetClick={handlePoke}
        isNightMode={darkMode}
        onDismissPhoto={onDismissPhoto}
        latestNoteKey={latestNoteKey}
      />

      {/* Sleek Interactive Action Dock */}
      <View style={[styles.actionDock, darkMode && styles.actionDockNight]}>
        {/* Primary Row: 4 Essential Partner Interactions */}
        <View style={styles.primaryActionsRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleSendHug}
            style={[styles.dockBtn, styles.hugBtn, darkMode && styles.hugBtnNight]}
          >
            <Text style={styles.dockIcon}>🫂</Text>
            <Text style={[styles.dockLabel, styles.hugLabel, darkMode && styles.hugLabelNight]}>Hug</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handlePoke}
            style={[styles.dockBtn, styles.pokeBtn, darkMode && styles.pokeBtnNight]}
          >
            <Text style={styles.dockIcon}>👉</Text>
            <Text style={[styles.dockLabel, styles.pokeLabel, darkMode && styles.pokeLabelNight]}>Poke</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleJoyRun}
            style={[styles.dockBtn, styles.joyBtn, darkMode && styles.joyBtnNight]}
          >
            <Text style={styles.dockIcon}>🏃</Text>
            <Text style={[styles.dockLabel, styles.joyLabel, darkMode && styles.joyLabelNight]}>Zoomies</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => setIsPhotoPickerOpen(true)}
            style={[styles.dockBtn, styles.photoBtn, darkMode && styles.photoBtnNight]}
          >
            <Text style={styles.dockIcon}>📸</Text>
            <Text style={[styles.dockLabel, styles.photoLabel, darkMode && styles.photoLabelNight]}>Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Utility Row: Doodle & Status */}
        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              retroAudio.playClick();
              onOpenScribble();
            }}
            style={[styles.toolBtn, darkMode && styles.toolBtnNight]}
          >
            <Text style={styles.toolIcon}>✎</Text>
            <Text style={[styles.toolLabel, darkMode && styles.toolLabelNight]}>Draw Doodle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              retroAudio.playClick();
              onToggleStatus('isSleeping');
            }}
            style={[
              styles.toolBtn,
              darkMode && styles.toolBtnNight,
              partnerStatus.isSleeping && styles.toolBtnActiveSleep,
            ]}
          >
            <Text style={styles.toolIcon}>💤</Text>
            <Text
              style={[
                styles.toolLabel,
                darkMode && styles.toolLabelNight,
                partnerStatus.isSleeping && { color: '#5C6BC0', fontWeight: 'bold' },
              ]}
            >
              {partnerStatus.isSleeping ? 'Waking Up' : 'Set Sleepy'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => {
              retroAudio.playClick();
              onToggleStatus('isWorking');
            }}
            style={[
              styles.toolBtn,
              darkMode && styles.toolBtnNight,
              partnerStatus.isWorking && styles.toolBtnActiveWork,
            ]}
          >
            <Text style={styles.toolIcon}>💻</Text>
            <Text
              style={[
                styles.toolLabel,
                darkMode && styles.toolLabelNight,
                partnerStatus.isWorking && { color: '#E76F51', fontWeight: 'bold' },
              ]}
            >
              {partnerStatus.isWorking ? 'Finish Work' : 'Set Busy'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modern Floating Message Capsule & Quick Chips */}
      <View style={[styles.messageCard, darkMode && styles.messageCardNight]}>
        <View style={styles.inputContainer}>
          <Text style={styles.inputPrefixIcon}>♥</Text>
          <TextInput
            maxLength={40}
            value={noteInput}
            onChangeText={setNoteInput}
            placeholder={`Send note as ${activeSpeakerName}...`}
            placeholderTextColor={darkMode ? '#707798' : '#999999'}
            style={[styles.floatingInput, darkMode && styles.floatingInputNight]}
            onSubmitEditing={handleSendNote}
            returnKeyType="send"
          />
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleSendNote}
            disabled={!noteInput.trim()}
            style={[
              styles.sendBubbleBtn,
              noteInput.trim() ? styles.sendBubbleBtnActive : styles.sendBubbleBtnDisabled,
            ]}
          >
            <Text style={[styles.sendBubbleText, !noteInput.trim() && { opacity: 0.5 }]}>↑</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tap Chips */}
        <View style={styles.quickChipsRow}>
          {[
            { label: '❤️ Love you', text: 'Love you so much ♥' },
            { label: '👉 Boop!', text: 'Boop! Thinking of you' },
            { label: '🏃 Zoomies!', text: 'Running around with joy!' },
            { label: '🥺 Miss you', text: 'Miss you lots! 🥺' },
          ].map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.7}
              onPress={() => handleQuickChip(chip.text)}
              style={[styles.chipPill, darkMode && styles.chipPillNight]}
            >
              <Text style={[styles.chipText, darkMode && styles.chipTextNight]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Clean Collapsible Partner Simulation Drawer */}
      <View style={[styles.simDrawer, darkMode && styles.simDrawerNight]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            retroAudio.playClick();
            setIsSimOpen((prev) => !prev);
          }}
          style={styles.simDrawerHeader}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 13 }}>⚙️</Text>
            <Text style={[styles.simDrawerTitle, darkMode && styles.simDrawerTitleNight]}>
              Partner Simulation
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.simStatusSummary, darkMode && { color: '#8EE4AF' }]}>
              {partnerBattery}% • {partnerMood}
            </Text>
            <Text style={[styles.simChevron, darkMode && styles.simChevronNight]}>
              {isSimOpen ? '▲' : '▼'}
            </Text>
          </View>
        </TouchableOpacity>

        {isSimOpen && (
          <View style={styles.simDrawerContent}>
            {/* Battery Level Stepper Buttons */}
            <View style={{ gap: 4 }}>
              <Text style={[styles.simSublabel, darkMode && styles.simSublabelNight]}>
                Simulate Battery Level:
              </Text>
              <View style={styles.batterySliderRow}>
                {[15, 45, 80, 100].map((b) => (
                  <TouchableOpacity
                    key={b}
                    onPress={() => {
                      retroAudio.playClick();
                      onChangePartnerBattery(b);
                    }}
                    style={[
                      styles.batteryStepBtn,
                      darkMode && styles.batteryStepBtnNight,
                      partnerBattery === b && styles.batteryStepBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.batteryStepText,
                        darkMode && styles.batteryStepTextNight,
                        partnerBattery === b && { color: '#FFFFFF' },
                      ]}
                    >
                      {b}% {b <= 20 ? '🪫' : '🔋'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Active Mood Picker */}
            <View style={{ gap: 4, marginTop: 6 }}>
              <Text style={[styles.simSublabel, darkMode && styles.simSublabelNight]}>
                Simulate Active Mood:
              </Text>
              <View style={styles.moodGrid}>
                {[
                  { id: 'joy', icon: '💖', label: 'Joy' },
                  { id: 'sleepy', icon: '💤', label: 'Sleepy' },
                  { id: 'working', icon: '💻', label: 'Work' },
                  { id: 'miss_you', icon: '🥺', label: 'Miss' },
                  { id: 'loved', icon: '🥰', label: 'Loved' },
                ].map((m) => {
                  const isSelected = partnerMood === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => {
                        retroAudio.playClick();
                        onChangePartnerMood(m.id as CharacterMood);
                      }}
                      style={[
                        styles.moodTile,
                        darkMode && styles.moodTileNight,
                        isSelected && (darkMode ? styles.moodTileSelectedNight : styles.moodTileSelected),
                      ]}
                    >
                      <Text style={{ fontSize: 15 }}>{m.icon}</Text>
                      <Text style={[styles.moodTileLabel, darkMode && styles.moodTileLabelNight]}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Live Photo Sharing Modal */}
      <Modal
        visible={isPhotoPickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPhotoPickerOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.pickerModalBox, darkMode && styles.pickerModalBoxNight]}>
            <View style={[styles.modalHeader, darkMode && { borderBottomColor: '#2B304C' }]}>
              <Text style={[styles.modalTitle, darkMode && styles.modalTitleNight]}>📸 Share Live Photo</Text>
              <TouchableOpacity
                onPress={() => setIsPhotoPickerOpen(false)}
                style={[styles.modalCloseBtn, darkMode && styles.modalCloseBtnNight]}
              >
                <Text style={[{ fontWeight: 'bold' }, darkMode && { color: '#FAF7EE' }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.pickerDesc, darkMode && styles.pickerDescNight]}>
              The photo you share will instantly pin to the Polaroid frame on the room wall for your friend to see!
            </Text>

            <View style={{ gap: 8 }}>
              <TouchableOpacity
                onPress={handlePickFromCamera}
                style={[styles.pickerActionBtn, darkMode && styles.pickerActionBtnNight]}
              >
                <Text style={{ fontSize: 20 }}>📷</Text>
                <View>
                  <Text style={[styles.pickerBtnTitle, darkMode && styles.pickerBtnTitleNight]}>Snap with Camera</Text>
                  <Text style={[styles.pickerBtnSub, darkMode && styles.pickerBtnSubNight]}>Take a live selfie or moment right now</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePickFromGallery}
                style={[styles.pickerActionBtn, darkMode && styles.pickerActionBtnNight]}
              >
                <Text style={{ fontSize: 20 }}>🖼️</Text>
                <View>
                  <Text style={[styles.pickerBtnTitle, darkMode && styles.pickerBtnTitleNight]}>Pick from Gallery</Text>
                  <Text style={[styles.pickerBtnSub, darkMode && styles.pickerBtnSubNight]}>Choose a photo from your camera roll</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setIsPhotoPickerOpen(false);
                  processSharedPhoto(PRESET_DEMO_PHOTOS[Math.floor(Math.random() * PRESET_DEMO_PHOTOS.length)]);
                }}
                style={[
                  styles.pickerActionBtn,
                  darkMode ? { backgroundColor: '#20243B', borderColor: '#2B304C' } : { backgroundColor: '#FAF7EE' },
                ]}
              >
                <Text style={{ fontSize: 20 }}>✨</Text>
                <View>
                  <Text style={[styles.pickerBtnTitle, darkMode && styles.pickerBtnTitleNight]}>Curated Aesthetic Polaroid</Text>
                  <Text style={[styles.pickerBtnSub, darkMode && styles.pickerBtnSubNight]}>Instant cafe & couple moment preset</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingBottom: 90,
    width: '100%',
    gap: 14,
  },
  notificationBanner: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#FFE8EE',
    borderWidth: 2,
    borderColor: '#1E1E24',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
    flex: 1,
  },
  topBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    maxWidth: 370,
    paddingHorizontal: 4,
  },
  liveStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 228, 175, 0.25)',
    borderWidth: 1.5,
    borderColor: '#2A9D8F',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
    gap: 6,
  },
  liveStatusBadgeNight: {
    backgroundColor: 'rgba(142, 228, 175, 0.12)',
    borderColor: '#3D5A50',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2A9D8F',
  },
  liveDotNight: {
    backgroundColor: '#8EE4AF',
  },
  liveStatusText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8.5,
    color: '#1E1E24',
  },
  liveStatusTextNight: {
    color: '#8EE4AF',
  },
  perspectiveCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderRadius: 20,
    padding: 2,
    gap: 3,
  },
  perspectiveCapsuleNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  speakerPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 14,
  },
  speakerPillActive: {
    backgroundColor: '#1E1E24',
  },
  speakerPillActiveNight: {
    backgroundColor: '#2E3556',
  },
  speakerPillActivePartner: {
    backgroundColor: '#FF6584',
  },
  speakerPillText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
  },
  speakerPillTextNight: {
    color: '#FAF7EE',
  },
  // Sleek Action Dock
  actionDock: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 16,
    padding: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  actionDockNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  primaryActionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dockBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    gap: 3,
  },
  dockIcon: {
    fontSize: 16,
  },
  dockLabel: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
  },
  hugBtn: {
    backgroundColor: '#FFE8EE',
    borderColor: '#FF85A1',
  },
  hugBtnNight: {
    backgroundColor: '#2D1B24',
    borderColor: '#FF6584',
  },
  hugLabel: {
    color: '#D81E5B',
  },
  hugLabelNight: {
    color: '#FF85A1',
  },
  pokeBtn: {
    backgroundColor: '#FFF4E6',
    borderColor: '#F4A261',
  },
  pokeBtnNight: {
    backgroundColor: '#2A1F18',
    borderColor: '#F4A261',
  },
  pokeLabel: {
    color: '#C05621',
  },
  pokeLabelNight: {
    color: '#F4A261',
  },
  joyBtn: {
    backgroundColor: '#FFFBEA',
    borderColor: '#FFD166',
  },
  joyBtnNight: {
    backgroundColor: '#2B2818',
    borderColor: '#FFD166',
  },
  joyLabel: {
    color: '#B7791F',
  },
  joyLabelNight: {
    color: '#FFD166',
  },
  photoBtn: {
    backgroundColor: '#F0F9F5',
    borderColor: '#8EE4AF',
  },
  photoBtnNight: {
    backgroundColor: '#182B22',
    borderColor: '#8EE4AF',
  },
  photoLabel: {
    color: '#2A9D8F',
  },
  photoLabelNight: {
    color: '#8EE4AF',
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,30,36,0.08)',
    paddingTop: 8,
  },
  toolBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 4,
  },
  toolBtnNight: {
    backgroundColor: '#1C2136',
    borderColor: '#2B304C',
  },
  toolIcon: {
    fontSize: 11,
  },
  toolLabel: {
    fontFamily: 'monospace',
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#475569',
  },
  toolLabelNight: {
    color: '#CBD5E1',
  },
  toolBtnActiveSleep: {
    backgroundColor: '#E8EAF6',
    borderColor: '#5C6BC0',
  },
  toolBtnActiveWork: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  // Floating Message Capsule
  messageCard: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 16,
    padding: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  messageCardNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7EE',
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderRadius: 24,
    paddingHorizontal: 10,
    paddingVertical: 3,
    gap: 6,
  },
  inputPrefixIcon: {
    fontSize: 13,
    color: '#FF6584',
  },
  floatingInput: {
    flex: 1,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 10.5,
    color: '#1E1E24',
    paddingVertical: 6,
  },
  floatingInputNight: {
    color: '#FAF7EE',
  },
  sendBubbleBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBubbleBtnActive: {
    backgroundColor: '#FF6584',
  },
  sendBubbleBtnDisabled: {
    backgroundColor: '#E2E8F0',
  },
  sendBubbleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: -1,
  },
  quickChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  chipPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipPillNight: {
    backgroundColor: '#1C2136',
    borderColor: '#2B304C',
  },
  chipText: {
    fontFamily: 'monospace',
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#64748B',
  },
  chipTextNight: {
    color: '#94A3B8',
  },
  // Collapsible Simulation Drawer
  simDrawer: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(30,30,36,0.3)',
    borderRadius: 14,
    overflow: 'hidden',
  },
  simDrawerNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  simDrawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#FAF7EE',
  },
  simDrawerTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  simDrawerTitleNight: {
    color: '#FAF7EE',
  },
  simStatusSummary: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: '#64748B',
    fontWeight: 'bold',
  },
  simChevron: {
    fontSize: 9,
    color: '#1E1E24',
  },
  simChevronNight: {
    color: '#FAF7EE',
  },
  simDrawerContent: {
    padding: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,30,36,0.08)',
  },
  simSublabel: {
    fontFamily: 'monospace',
    fontSize: 8,
    fontWeight: 'bold',
    color: '#64748B',
  },
  simSublabelNight: {
    color: '#94A3B8',
  },
  batterySliderRow: {
    flexDirection: 'row',
    gap: 5,
  },
  batteryStepBtn: {
    flex: 1,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  batteryStepBtnActive: {
    backgroundColor: '#1E1E24',
  },
  batteryStepBtnNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  batteryStepText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
  },
  batteryStepTextNight: {
    color: '#8F96B2',
  },
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  moodTile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(30,30,36,0.15)',
    backgroundColor: '#FFFFFF',
  },
  moodTileNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  moodTileSelected: {
    borderColor: '#1E1E24',
    backgroundColor: '#FFE8EE',
    borderWidth: 2,
  },
  moodTileSelectedNight: {
    backgroundColor: '#38222B',
    borderColor: '#FF85A1',
  },
  moodTileLabel: {
    fontFamily: 'monospace',
    fontSize: 7.5,
    fontWeight: 'bold',
    color: '#1E1E24',
    marginTop: 2,
  },
  moodTileLabelNight: {
    color: '#FAF7EE',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  pickerModalBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FAF7EE',
    borderWidth: 3,
    borderColor: '#1E1E24',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  pickerModalBoxNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1E1E24',
    paddingBottom: 8,
  },
  modalTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#1E1E24',
  },
  modalTitleNight: {
    color: '#FAF7EE',
  },
  modalCloseBtn: {
    width: 26,
    height: 26,
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  modalCloseBtnNight: {
    backgroundColor: '#20243B',
    borderColor: '#3D4468',
  },
  pickerDesc: {
    fontFamily: 'monospace',
    fontSize: 8.5,
    color: 'rgba(30,30,36,0.7)',
    lineHeight: 12,
  },
  pickerDescNight: {
    color: '#8F96B2',
  },
  pickerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 10,
    padding: 10,
    gap: 12,
  },
  pickerActionBtnNight: {
    backgroundColor: '#1F2338',
    borderColor: '#2B304C',
  },
  pickerBtnTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#1E1E24',
  },
  pickerBtnTitleNight: {
    color: '#FAF7EE',
  },
  pickerBtnSub: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: 'rgba(30,30,36,0.6)',
    marginTop: 2,
  },
  pickerBtnSubNight: {
    color: '#8F96B2',
  },
  notificationBannerNight: {
    backgroundColor: '#38222B',
    borderColor: '#FF85A1',
  },
  notificationTextNight: {
    color: '#FAF7EE',
  },
});
