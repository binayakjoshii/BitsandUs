import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CharacterConfig, CharacterMood, CharacterAction } from '../components/pixel/PixelCharacter';
import { PetType } from '../components/pixel/PixelPet';
import { RoomTheme } from '../components/widget/LiveCoupleWidget';
import { MemoryItem } from '../utils/helpers';
import { retroAudio } from '../utils/audio';
import { PixelHeart } from '../components/pixel/PixelIcons';
import { OnboardingFlow } from '../components/onboarding/OnboardingFlow';
import { HomeTab } from '../components/tabs/HomeTab';
import { ScrapbookTab } from '../components/tabs/ScrapbookTab';
import { RoomTab } from '../components/tabs/RoomTab';
import { CoupleHubTab } from '../components/tabs/CoupleHubTab';
import { QuickScribbleModal } from '../components/modals/QuickScribbleModal';

type ActiveTab = 'home' | 'scrapbook' | 'room' | 'couple_hub';

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'm1',
    type: 'photo',
    title: 'Rainy afternoon coffee',
    content: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=600&q=80',
    timestamp: 'Oct 24, 2:45 PM',
    sender: 'partner',
    senderName: 'Juno',
    rotation: -1.5,
    likes: 8,
  },
  {
    id: 'm2',
    type: 'note',
    content: 'Can’t wait for date night! I saved the special spot.',
    timestamp: 'Oct 23, 8:12 PM',
    sender: 'you',
    senderName: 'Alex',
    rotation: 2,
    likes: 5,
  },
  {
    id: 'm3',
    type: 'photo',
    title: 'Sunset stroll',
    content: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=600&q=80',
    timestamp: 'Oct 22, 6:30 PM',
    sender: 'partner',
    senderName: 'Juno',
    rotation: 1,
    likes: 12,
  },
  {
    id: 'm4',
    type: 'doodle',
    title: 'Heart doodle',
    content: JSON.stringify([
      ['#FFFFFF','#FFFFFF','#FF85A1','#FF85A1','#FFFFFF','#FF85A1','#FF85A1','#FFFFFF'],
      ['#FFFFFF','#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FFFFFF'],
      ['#FF85A1','#FF85A1','#FFB3C6','#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FF85A1'],
      ['#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FF85A1'],
      ['#FFFFFF','#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FFFFFF'],
      ['#FFFFFF','#FFFFFF','#FF85A1','#FF85A1','#FF85A1','#FF85A1','#FFFFFF','#FFFFFF'],
      ['#FFFFFF','#FFFFFF','#FFFFFF','#FF85A1','#FF85A1','#FFFFFF','#FFFFFF','#FFFFFF'],
      ['#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF','#FFFFFF'],
    ]),
    timestamp: 'Oct 21, 10:15 PM',
    sender: 'you',
    senderName: 'Alex',
    rotation: -2,
    likes: 7,
  },
];

export default function BitsAndUsApp() {
  const [isOnboarded, setIsOnboarded] = useState<boolean>(true);
  const [pairingCode, setPairingCode] = useState<string>('BITS-4982');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);

  const [userConfig, setUserConfig] = useState<CharacterConfig>({
    name: 'Alex',
    hairStyle: 'bob',
    hairColor: 'sun',
    outfitColor: 'rose',
    pantsColor: 'midnight',
  });

  const [partnerConfig, setPartnerConfig] = useState<CharacterConfig>({
    name: 'Juno',
    hairStyle: 'spiky',
    hairColor: 'midnight',
    outfitColor: 'mint',
    pantsColor: 'cream',
  });

  const [partnerMood, setPartnerMood] = useState<CharacterMood>('joy');
  const [partnerBattery, setPartnerBattery] = useState<number>(85);
  const [partnerStatus, setPartnerStatus] = useState({
    isSleeping: false,
    isWorking: false,
    isLowBattery: false,
  });

  const [roomTheme, setRoomTheme] = useState<RoomTheme>('rainy');
  const [petType, setPetType] = useState<PetType>('cat');

  const PHOTO_EXPIRATION_MS = 150000; // 2.5 minutes (live polaroid on room wall auto-vanishes)

  const [currentAction, setCurrentAction] = useState<CharacterAction>('none');
  const [latestNote, setLatestNote] = useState<string>('Missing your smile today! ♥');
  const [latestNoteSender, setLatestNoteSender] = useState<string>('Alex');
  const [noteNonce, setNoteNonce] = useState<number>(1);
  const [latestPhotoUrl, setLatestPhotoUrl] = useState<string | undefined>(
    'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=400&q=80'
  );
  const [latestPhotoTimestamp, setLatestPhotoTimestamp] = useState<string>('Today 2:45 PM');
  const [latestDoodleGrid, setLatestDoodleGrid] = useState<string[][] | undefined>(undefined);
  const photoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [memories, setMemories] = useState<MemoryItem[]>(INITIAL_MEMORIES);

  const [startDateStr, setStartDateStr] = useState<string>('2025-10-24');
  const [nextDateNightStr, setNextDateNightStr] = useState<string>('2026-10-30T19:00:00');
  const [userQuestionAnswer, setUserQuestionAnswer] = useState<string>('');
  const [partnerQuestionAnswer, setPartnerQuestionAnswer] = useState<string>('');

  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [isScribbleOpen, setIsScribbleOpen] = useState<boolean>(false);

  useEffect(() => {
    retroAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Initial photo auto-vanish after 2.5 minutes
  useEffect(() => {
    if (latestPhotoUrl && !photoTimerRef.current) {
      photoTimerRef.current = setTimeout(() => {
        setLatestPhotoUrl(undefined);
        setNotification('📷 Live Polaroid on the wall expired (saved in Scrapbook!)');
        setTimeout(() => setNotification(null), 3500);
      }, PHOTO_EXPIRATION_MS);
    }
    return () => {
      if (photoTimerRef.current) {
        clearTimeout(photoTimerRef.current);
      }
    };
  }, [latestPhotoUrl]);

  const triggerAction = (action: CharacterAction, notifText?: string) => {
    setCurrentAction(action);
    if (notifText) {
      setNotification(notifText);
      setTimeout(() => setNotification(null), 3500);
    }

    if (action === 'hug' || action === 'poke' || action === 'joy') {
      const newMemory: MemoryItem = {
        id: `m_${Date.now()}`,
        type: action === 'joy' ? 'note' : action,
        content:
          action === 'hug'
            ? 'Shared a warm virtual hug!'
            : action === 'poke'
            ? 'Gave a playful poke!'
            : 'Had joyful zoomies across the room! 🏃',
        timestamp: 'Just now',
        sender: 'you',
        senderName: userConfig.name,
        likes: 1,
      };
      setMemories((prev) => [newMemory, ...prev]);
    }

    const duration = action === 'joy' ? 3200 : 2500;
    setTimeout(() => {
      setCurrentAction('none');
    }, duration);
  };

  const handleToggleStatus = (key: 'isSleeping' | 'isWorking' | 'isLowBattery') => {
    setPartnerStatus((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (key === 'isSleeping' && next.isSleeping) {
        setPartnerMood('sleepy');
      } else if (key === 'isWorking' && next.isWorking) {
        setPartnerMood('working');
      } else if (key === 'isLowBattery') {
        setPartnerBattery(next.isLowBattery ? 15 : 85);
      }
      return next;
    });
  };

  const handleSendNote = (text: string, sender: 'user' | 'partner' = 'user') => {
    const senderName = sender === 'user' ? userConfig.name : partnerConfig.name;
    setLatestNote(text);
    setLatestNoteSender(senderName);
    setNoteNonce((prev) => prev + 1);
    const newMemory: MemoryItem = {
      id: `m_${Date.now()}`,
      type: 'note',
      content: text,
      timestamp: 'Just now',
      sender: sender === 'user' ? 'you' : 'partner',
      senderName: senderName,
      likes: 1,
    };
    setMemories((prev) => [newMemory, ...prev]);
  };

  const handleSnapPhoto = (url: string, sender: 'user' | 'partner' = 'user') => {
    const senderName = sender === 'user' ? userConfig.name : partnerConfig.name;
    setLatestPhotoUrl(url);
    setLatestPhotoTimestamp('Just now');

    // Reset and start 2.5 min auto-vanish timer
    if (photoTimerRef.current) {
      clearTimeout(photoTimerRef.current);
    }
    photoTimerRef.current = setTimeout(() => {
      setLatestPhotoUrl(undefined);
      setNotification('📷 Live Polaroid on the wall expired (saved in Scrapbook!)');
      setTimeout(() => setNotification(null), 3500);
    }, PHOTO_EXPIRATION_MS);

    const newMemory: MemoryItem = {
      id: `m_${Date.now()}`,
      type: 'photo',
      title: 'Polaroid Moment',
      content: url,
      timestamp: 'Just now',
      sender: sender === 'user' ? 'you' : 'partner',
      senderName: senderName,
      likes: 1,
    };
    setMemories((prev) => [newMemory, ...prev]);
  };

  const handleDismissPhoto = () => {
    if (photoTimerRef.current) {
      clearTimeout(photoTimerRef.current);
      photoTimerRef.current = null;
    }
    setLatestPhotoUrl(undefined);
  };

  const copyPairingCode = () => {
    retroAudio.playClick();
    if (Clipboard && Clipboard.setString) {
      Clipboard.setString(pairingCode);
    }
    setNotification(`📋 Room Code "${pairingCode}" copied to share!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSendDoodle = (grid: string[][]) => {
    setLatestDoodleGrid(grid);
    triggerAction('scribble', '✎ You sent a cute pixel doodle to the room!');
    const newMemory: MemoryItem = {
      id: `m_${Date.now()}`,
      type: 'doodle',
      title: 'Pixel Doodle',
      content: JSON.stringify(grid),
      timestamp: 'Just now',
      sender: 'you',
      senderName: userConfig.name,
      likes: 1,
    };
    setMemories((prev) => [newMemory, ...prev]);
  };

  const handleAddReaction = (memoryId: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === memoryId ? { ...m, likes: (m.likes || 1) + 1 } : m))
    );
  };

  const handleCompleteOnboarding = (
    uConfig: CharacterConfig,
    pConfig: CharacterConfig,
    code: string
  ) => {
    setUserConfig(uConfig);
    setPartnerConfig(pConfig);
    setPairingCode(code);
    setIsOnboarded(true);
    setIsEditingProfile(false);
    setNotification(`✨ Welcome to your live space with ${pConfig.name}!`);
    setTimeout(() => setNotification(null), 4000);
  };

  if (!isOnboarded || isEditingProfile) {
    return (
      <OnboardingFlow
        initialUserConfig={userConfig}
        initialPartnerConfig={partnerConfig}
        onComplete={handleCompleteOnboarding}
        onCancel={isOnboarded ? () => setIsEditingProfile(false) : undefined}
      />
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: darkMode ? '#0C0E1A' : '#EDE8D5' },
      ]}
      edges={['top', 'bottom', 'left', 'right']}
    >
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.appCard, darkMode && styles.appCardNight]}>
        {/* Header */}
        <View style={[styles.header, darkMode && styles.headerNight]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <PixelHeart size={2.5} color="#FF85A1" />
            <Text style={[styles.appTitle, darkMode && styles.appTitleNight]}>Bits & Us</Text>
          </View>

          {/* Quick Bar Controls */}
          <View style={styles.controlsRow}>
            {/* Space Code Pill */}
            <TouchableOpacity
              onPress={copyPairingCode}
              style={[styles.codePill, darkMode && styles.codePillNight]}
            >
              <Text style={[styles.codePillText, darkMode && styles.codePillTextNight]}>
                🔗 {pairingCode}
              </Text>
            </TouchableOpacity>

            {/* Profile Customizer Button */}
            <TouchableOpacity
              onPress={() => {
                retroAudio.playClick();
                setIsEditingProfile(true);
              }}
              style={[styles.profileBtn, darkMode && styles.profileBtnNight]}
            >
              <Text style={[styles.profileBtnText, darkMode && styles.profileBtnTextNight]}>
                👤 Profile
              </Text>
            </TouchableOpacity>

            {/* Sound FX Toggle */}
            <TouchableOpacity
              onPress={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) retroAudio.playClick();
              }}
              style={[styles.controlBtn, darkMode && styles.controlBtnNight]}
            >
              <Text style={{ fontSize: 13 }}>{soundEnabled ? '🔊' : '🔇'}</Text>
            </TouchableOpacity>

            {/* Dark Mode Toggle */}
            <TouchableOpacity
              onPress={() => {
                retroAudio.playClick();
                setDarkMode(!darkMode);
              }}
              style={[styles.controlBtn, darkMode && styles.controlBtnNight]}
            >
              <Text style={{ fontSize: 13 }}>{darkMode ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content Area */}
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'home' && (
            <HomeTab
              userConfig={userConfig}
              partnerConfig={partnerConfig}
              partnerMood={partnerMood}
              onChangePartnerMood={setPartnerMood}
              partnerBattery={partnerBattery}
              onChangePartnerBattery={setPartnerBattery}
              partnerStatus={partnerStatus}
              onToggleStatus={handleToggleStatus}
              roomTheme={roomTheme}
              petType={petType}
              currentAction={currentAction}
              onTriggerAction={triggerAction}
              latestNote={latestNote}
              latestNoteSender={latestNoteSender}
              onSendNote={handleSendNote}
              latestPhotoUrl={latestPhotoUrl}
              latestPhotoTimestamp={latestPhotoTimestamp}
              onSnapPhoto={handleSnapPhoto}
              onDismissPhoto={handleDismissPhoto}
              latestDoodleGrid={latestDoodleGrid}
              onOpenScribble={() => setIsScribbleOpen(true)}
              notification={notification}
              onReopenOnboarding={() => setIsEditingProfile(true)}
              darkMode={darkMode}
              latestNoteKey={noteNonce}
            />
          )}

          {activeTab === 'scrapbook' && (
            <ScrapbookTab
              memories={memories}
              onAddReaction={handleAddReaction}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'room' && (
            <RoomTab
              userConfig={userConfig}
              partnerConfig={partnerConfig}
              onUpdateUserConfig={setUserConfig}
              onUpdatePartnerConfig={setPartnerConfig}
              roomTheme={roomTheme}
              onChangeRoomTheme={setRoomTheme}
              petType={petType}
              onChangePetType={setPetType}
              darkMode={darkMode}
            />
          )}

          {activeTab === 'couple_hub' && (
            <CoupleHubTab
              startDateStr={startDateStr}
              onUpdateStartDate={setStartDateStr}
              nextDateNightStr={nextDateNightStr}
              onUpdateNextDateNight={setNextDateNightStr}
              userName={userConfig.name}
              partnerName={partnerConfig.name}
              userQuestionAnswer={userQuestionAnswer}
              partnerQuestionAnswer={partnerQuestionAnswer}
              onSaveUserAnswer={setUserQuestionAnswer}
              onSimulatePartnerAnswer={setPartnerQuestionAnswer}
              darkMode={darkMode}
            />
          )}
        </ScrollView>

        {/* Bottom Navigation Bar (4 tabs) */}
        <View style={[styles.navBar, darkMode && styles.navBarNight]}>
          {[
            { id: 'home', label: 'Home', icon: '🏠' },
            { id: 'scrapbook', label: 'Scrapbook', icon: '📖' },
            { id: 'room', label: 'Room', icon: '🛋️' },
            { id: 'couple_hub', label: 'Couple Hub', icon: '💖' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => {
                  retroAudio.playClick();
                  setActiveTab(tab.id as ActiveTab);
                }}
                style={[
                  styles.navItem,
                  isActive && styles.navItemActive,
                ]}
              >
                <Text style={{ fontSize: 16 }}>{tab.icon}</Text>
                <Text
                  style={[
                    styles.navItemText,
                    isActive ? { color: '#FFFFFF' } : darkMode ? { color: '#8F96B2' } : { color: '#1E1E24' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Quick Scribble Modal */}
      <QuickScribbleModal
        isOpen={isScribbleOpen}
        onClose={() => setIsScribbleOpen(false)}
        onSendDoodle={handleSendDoodle}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    alignItems: 'center',
  },
  appCard: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#FAF7EE',
    borderLeftWidth: Platform.OS === 'web' ? 3 : 0,
    borderRightWidth: Platform.OS === 'web' ? 3 : 0,
    borderColor: '#1E1E24',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#1E1E24',
    backgroundColor: '#FAF7EE',
    zIndex: 40,
  },
  appTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#1E1E24',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codePill: {
    backgroundColor: '#FFD166',
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codePillText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  profileBtn: {
    backgroundColor: '#8EE4AF',
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  controlBtn: {
    width: 28,
    height: 28,
    backgroundColor: '#FFFDF9',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainScrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 88,
    alignItems: 'center',
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'rgba(250, 247, 238, 0.95)',
    borderTopWidth: 3,
    borderTopColor: '#1E1E24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: 4,
    zIndex: 50,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 8,
  },
  navItemActive: {
    backgroundColor: '#FF85A1',
    borderWidth: 2,
    borderColor: '#1E1E24',
  },
  navItemText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 7,
    color: '#1E1E24',
    marginTop: 2,
  },
  appCardNight: {
    backgroundColor: '#121422',
    borderColor: '#262A42',
  },
  headerNight: {
    backgroundColor: '#16192A',
    borderBottomColor: '#262A42',
  },
  appTitleNight: {
    color: '#FAF7EE',
  },
  codePillNight: {
    backgroundColor: '#262A42',
    borderColor: '#FFD166',
  },
  codePillTextNight: {
    color: '#FFD166',
  },
  profileBtnNight: {
    backgroundColor: '#1C332A',
    borderColor: '#8EE4AF',
  },
  profileBtnTextNight: {
    color: '#8EE4AF',
  },
  controlBtnNight: {
    backgroundColor: '#20243B',
    borderColor: '#3D4468',
  },
  navBarNight: {
    backgroundColor: 'rgba(22, 25, 42, 0.98)',
    borderTopColor: '#262A42',
  },
});
