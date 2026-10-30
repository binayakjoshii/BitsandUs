import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CharacterConfig, Hairstyle, PaletteColor, PixelCharacter } from '../pixel/PixelCharacter';
import { PetType, PixelPet } from '../pixel/PixelPet';
import { RoomTheme } from '../widget/LiveCoupleWidget';
import { retroAudio } from '../../utils/audio';

interface RoomTabProps {
  userConfig: CharacterConfig;
  partnerConfig: CharacterConfig;
  onUpdateUserConfig: (config: CharacterConfig) => void;
  onUpdatePartnerConfig: (config: CharacterConfig) => void;
  roomTheme: RoomTheme;
  onChangeRoomTheme: (theme: RoomTheme) => void;
  petType: PetType;
  onChangePetType: (pet: PetType) => void;
  darkMode?: boolean;
}

const PALETTE_COLORS: { name: PaletteColor; hex: string }[] = [
  { name: 'rose', hex: '#FF85A1' },
  { name: 'mint', hex: '#8EE4AF' },
  { name: 'sun', hex: '#FFD166' },
  { name: 'midnight', hex: '#1A1C2E' },
  { name: 'cream', hex: '#FAF7EE' },
];

const ROOM_THEMES: { id: RoomTheme; label: string; icon: string; desc: string }[] = [
  { id: 'rainy', label: 'Rainy Window', icon: '🌧️', desc: 'Moody raindrops on glass & cozy tea' },
  { id: 'fireplace', label: 'Cozy Fireplace', icon: '🔥', desc: 'Warm flickering pixel hearth' },
  { id: 'beach', label: 'Starlit Beach', icon: '✨', desc: 'Midnight sea breeze & twinkling stars' },
];

const PET_OPTIONS: { id: PetType; label: string }[] = [
  { id: 'cat', label: 'Kitty' },
  { id: 'dog', label: 'Puppy' },
  { id: 'ghost', label: 'Ghostie' },
  { id: 'none', label: 'No Pet' },
];

export const RoomTab: React.FC<RoomTabProps> = ({
  userConfig,
  partnerConfig,
  onUpdateUserConfig,
  onUpdatePartnerConfig,
  roomTheme,
  onChangeRoomTheme,
  petType,
  onChangePetType,
  darkMode = false,
}) => {
  const [editingTarget, setEditingTarget] = useState<'you' | 'partner'>('you');

  const currentConfig = editingTarget === 'you' ? userConfig : partnerConfig;
  const updateConfig = (newConfig: CharacterConfig) => {
    if (editingTarget === 'you') {
      onUpdateUserConfig(newConfig);
    } else {
      onUpdatePartnerConfig(newConfig);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View>
        <Text style={[styles.title, darkMode && styles.titleNight]}>Our Cozy Room & Closet</Text>
        <Text style={[styles.subtitle, darkMode && styles.subtitleNight]}>
          Customize room ambiance, hair, outfits and little pets!
        </Text>
      </View>

      {/* Room Themes Picker */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, darkMode && styles.sectionLabelNight]}>Room Theme:</Text>
        <View style={styles.themeRow}>
          {ROOM_THEMES.map((theme) => {
            const isEquipped = roomTheme === theme.id;
            return (
              <TouchableOpacity
                key={theme.id}
                onPress={() => {
                  retroAudio.playClick();
                  onChangeRoomTheme(theme.id);
                }}
                style={[
                  styles.themeCard,
                  darkMode && styles.themeCardNight,
                  isEquipped && (darkMode ? styles.themeCardEquippedNight : styles.themeCardEquipped),
                ]}
              >
                <Text style={{ fontSize: 20 }}>{theme.icon}</Text>
                <Text style={[styles.themeTitle, darkMode && styles.themeTitleNight]}>{theme.label}</Text>
                <Text style={[styles.themeDesc, darkMode && styles.themeDescNight]}>{theme.desc}</Text>
                <View style={[styles.badge, isEquipped ? { backgroundColor: '#8EE4AF' } : { backgroundColor: darkMode ? '#2B304C' : '#ECE7D5' }]}>
                  <Text style={[styles.badgeText, darkMode && !isEquipped && { color: '#FAF7EE' }]}>
                    {isEquipped ? '✓ Equipped' : 'Equip'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Pet Picker */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, darkMode && styles.sectionLabelNight]}>Room Pet Companion:</Text>
        <View style={styles.petRow}>
          {PET_OPTIONS.map((pet) => {
            const isSelected = petType === pet.id;
            return (
              <TouchableOpacity
                key={pet.id}
                onPress={() => {
                  retroAudio.playClick();
                  onChangePetType(pet.id);
                }}
                style={[
                  styles.petCard,
                  darkMode && styles.petCardNight,
                  isSelected && (darkMode ? styles.petCardSelectedNight : styles.petCardSelected),
                ]}
              >
                <View style={styles.petIconWrapper}>
                  {pet.id !== 'none' ? (
                    <PixelPet type={pet.id} pixelSize={2} />
                  ) : (
                    <Text style={{ fontSize: 16 }}>🚫</Text>
                  )}
                </View>
                <Text style={[styles.petLabel, darkMode && styles.petLabelNight]}>{pet.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Pixel Closet */}
      <View style={[styles.closetCard, darkMode && styles.closetCardNight]}>
        <View style={[styles.closetHeader, darkMode && { borderBottomColor: '#2B304C' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>👗</Text>
            <Text style={[styles.closetTitle, darkMode && styles.closetTitleNight]}>Pixel Closet</Text>
          </View>

          {/* Switch target: You vs Juno */}
          <View style={[styles.targetSwitch, darkMode && styles.targetSwitchNight]}>
            <TouchableOpacity
              onPress={() => {
                retroAudio.playClick();
                setEditingTarget('you');
              }}
              style={[
                styles.targetBtn,
                editingTarget === 'you' && { backgroundColor: '#FF85A1' },
              ]}
            >
              <Text
                style={[
                  styles.targetBtnText,
                  editingTarget === 'you' && { color: '#FFFFFF' },
                  darkMode && editingTarget !== 'you' && { color: '#FAF7EE' },
                ]}
              >
                {userConfig.name}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                retroAudio.playClick();
                setEditingTarget('partner');
              }}
              style={[
                styles.targetBtn,
                editingTarget === 'partner' && { backgroundColor: '#8EE4AF' },
              ]}
            >
              <Text
                style={[
                  styles.targetBtnText,
                  editingTarget === 'partner' && { color: '#1E1E24' },
                  darkMode && editingTarget !== 'partner' && { color: '#FAF7EE' },
                ]}
              >
                {partnerConfig.name}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Live Preview */}
        <View style={[styles.previewBox, darkMode && styles.previewBoxNight]}>
          <PixelCharacter config={currentConfig} pixelSize={4} />
        </View>

        {/* Hairstyle selector */}
        <View style={{ gap: 6 }}>
          <Text style={[styles.fieldLabel, darkMode && styles.fieldLabelNight]}>Hair Style:</Text>
          <View style={styles.hairRow}>
            {(['bob', 'spiky', 'long'] as Hairstyle[]).map((style) => (
              <TouchableOpacity
                key={style}
                onPress={() => {
                  retroAudio.playClick();
                  updateConfig({ ...currentConfig, hairStyle: style });
                }}
                style={[
                  styles.styleBtn,
                  darkMode && styles.styleBtnNight,
                  currentConfig.hairStyle === style && styles.styleBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.styleBtnText,
                    darkMode && styles.styleBtnTextNight,
                    currentConfig.hairStyle === style && { color: '#FFFFFF' },
                  ]}
                >
                  {style.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hair Color */}
        <View style={{ gap: 6 }}>
          <Text style={[styles.fieldLabel, darkMode && styles.fieldLabelNight]}>Hair Color:</Text>
          <View style={styles.paletteRow}>
            {PALETTE_COLORS.map((col) => (
              <TouchableOpacity
                key={col.name}
                onPress={() => {
                  retroAudio.playClick();
                  updateConfig({ ...currentConfig, hairColor: col.name });
                }}
                style={[
                  styles.colorDot,
                  { backgroundColor: col.hex },
                  currentConfig.hairColor === col.name && styles.colorDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Outfit Color */}
        <View style={{ gap: 6 }}>
          <Text style={[styles.fieldLabel, darkMode && styles.fieldLabelNight]}>Outfit Color:</Text>
          <View style={styles.paletteRow}>
            {PALETTE_COLORS.map((col) => (
              <TouchableOpacity
                key={col.name}
                onPress={() => {
                  retroAudio.playClick();
                  updateConfig({ ...currentConfig, outfitColor: col.name });
                }}
                style={[
                  styles.colorDot,
                  { backgroundColor: col.hex },
                  currentConfig.outfitColor === col.name && styles.colorDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 90,
    width: '100%',
    gap: 16,
  },
  title: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#1E1E24',
  },
  subtitle: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: 'rgba(30,30,36,0.7)',
    marginTop: 2,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  themeRow: {
    flexDirection: 'column',
    gap: 8,
  },
  themeCard: {
    backgroundColor: '#FFFDF9',
    borderWidth: 2,
    borderColor: 'rgba(30,30,36,0.4)',
    padding: 10,
    borderRadius: 12,
    gap: 4,
  },
  themeCardEquipped: {
    borderColor: '#1E1E24',
    backgroundColor: '#FFE8EE',
    borderWidth: 2,
  },
  themeTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#1E1E24',
  },
  themeDesc: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: 'rgba(30,30,36,0.7)',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1E1E24',
    marginTop: 4,
  },
  badgeText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 7,
    color: '#1E1E24',
  },
  petRow: {
    flexDirection: 'row',
    gap: 8,
  },
  petCard: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    borderWidth: 2,
    borderColor: 'rgba(30,30,36,0.4)',
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  petCardSelected: {
    borderColor: '#1E1E24',
    backgroundColor: '#FFE8EE',
  },
  petIconWrapper: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petLabel: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
    marginTop: 4,
  },
  closetCard: {
    backgroundColor: '#FFFDF9',
    borderWidth: 3,
    borderColor: '#1E1E24',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  closetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1E1E24',
    paddingBottom: 8,
  },
  closetTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#1E1E24',
  },
  targetSwitch: {
    flexDirection: 'row',
    backgroundColor: '#F0EAD6',
    borderWidth: 1,
    borderColor: '#1E1E24',
    borderRadius: 6,
    padding: 2,
  },
  targetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  targetBtnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
  },
  previewBox: {
    backgroundColor: '#FAF7EE',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  fieldLabel: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
  },
  hairRow: {
    flexDirection: 'row',
    gap: 6,
  },
  styleBtn: {
    flex: 1,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: 'rgba(30,30,36,0.4)',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FAF7EE',
  },
  styleBtnActive: {
    backgroundColor: '#FF85A1',
    borderColor: '#1E1E24',
  },
  styleBtnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1E1E24',
  },
  colorDotActive: {
    transform: [{ scale: 1.15 }],
  },
  titleNight: {
    color: '#FAF7EE',
  },
  subtitleNight: {
    color: '#8F96B2',
  },
  sectionLabelNight: {
    color: '#FAF7EE',
  },
  themeCardNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  themeCardEquippedNight: {
    borderColor: '#FF85A1',
    backgroundColor: '#38222B',
  },
  themeTitleNight: {
    color: '#FAF7EE',
  },
  themeDescNight: {
    color: '#8F96B2',
  },
  petCardNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  petCardSelectedNight: {
    borderColor: '#FF85A1',
    backgroundColor: '#38222B',
  },
  petLabelNight: {
    color: '#FAF7EE',
  },
  closetCardNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  closetTitleNight: {
    color: '#FAF7EE',
  },
  targetSwitchNight: {
    backgroundColor: '#20243B',
    borderColor: '#2B304C',
  },
  targetBtnTextNight: {
    color: '#8F96B2',
  },
  previewBoxNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  fieldLabelNight: {
    color: '#FAF7EE',
  },
  styleBtnNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  styleBtnTextNight: {
    color: '#8F96B2',
  },
});
