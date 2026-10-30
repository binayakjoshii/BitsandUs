import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Clipboard, ScrollView } from 'react-native';
import { CharacterConfig, Hairstyle, PaletteColor, PixelCharacter } from '../pixel/PixelCharacter';
import { generatePairingCode } from '../../utils/helpers';
import { retroAudio } from '../../utils/audio';
import { PixelHeart } from '../pixel/PixelIcons';

interface OnboardingFlowProps {
  initialUserConfig?: CharacterConfig;
  initialPartnerConfig?: CharacterConfig;
  onComplete: (userConfig: CharacterConfig, partnerConfig: CharacterConfig, pairingCode: string) => void;
  onCancel?: () => void;
}

const PALETTE_COLORS: { name: PaletteColor; hex: string }[] = [
  { name: 'rose', hex: '#FF85A1' },
  { name: 'mint', hex: '#8EE4AF' },
  { name: 'sun', hex: '#FFD166' },
  { name: 'midnight', hex: '#2B2E4A' },
  { name: 'cream', hex: '#FAF7EE' },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialUserConfig,
  initialPartnerConfig,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // User character customization state
  const [userName, setUserName] = useState<string>(initialUserConfig?.name || 'Alex');
  const [userHairStyle, setUserHairStyle] = useState<Hairstyle>(initialUserConfig?.hairStyle || 'bob');
  const [userHairColor, setUserHairColor] = useState<PaletteColor>(initialUserConfig?.hairColor || 'sun');
  const [userOutfitColor, setUserOutfitColor] = useState<PaletteColor>(initialUserConfig?.outfitColor || 'rose');
  const [userPantsColor, setUserPantsColor] = useState<PaletteColor>(initialUserConfig?.pantsColor || 'midnight');

  // Connection mode and friend setup state
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [generatedCode] = useState<string>(generatePairingCode());
  const [inputCode, setInputCode] = useState<string>('');
  const [partnerName, setPartnerName] = useState<string>(initialPartnerConfig?.name || 'Juno');
  const [partnerHairStyle] = useState<Hairstyle>(initialPartnerConfig?.hairStyle || 'spiky');
  const [partnerHairColor] = useState<PaletteColor>(initialPartnerConfig?.hairColor || 'midnight');
  const [partnerOutfitColor] = useState<PaletteColor>(initialPartnerConfig?.outfitColor || 'mint');

  const [isCopied, setIsCopied] = useState<boolean>(false);

  const currentUserConfig: CharacterConfig = {
    name: userName.trim() || 'Alex',
    hairStyle: userHairStyle,
    hairColor: userHairColor,
    outfitColor: userOutfitColor,
    pantsColor: userPantsColor,
  };

  const currentPartnerConfig: CharacterConfig = {
    name: partnerName.trim() || 'Juno',
    hairStyle: partnerHairStyle,
    hairColor: partnerHairColor,
    outfitColor: partnerOutfitColor,
    pantsColor: 'cream',
  };

  const copyCode = () => {
    retroAudio.playClick();
    if (Clipboard && Clipboard.setString) {
      Clipboard.setString(generatedCode);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleStep1Next = () => {
    retroAudio.playClick();
    setStep(2);
  };

  const handleStep2Connect = () => {
    retroAudio.playSuccess();
    setStep(3);

    const finalCode = mode === 'create' ? generatedCode : inputCode.trim() || 'BITS-4982';

    setTimeout(() => {
      onComplete(currentUserConfig, currentPartnerConfig, finalCode);
    }, 1800);
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.cardContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <PixelHeart size={2.5} color="#FF85A1" />
            <Text style={styles.headerTitle}>Bits & Us</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>Step {step} / 3</Text>
            </View>
            {onCancel && (
              <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* STEP 1: Choose Name & Customize Character */}
        {step === 1 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            <View>
              <Text style={styles.stepTitle}>1. Design Your Pixel Self</Text>
              <Text style={styles.stepSubtitle}>
                Choose your nickname and customize your retro 16-bit avatar.
              </Text>
            </View>

            {/* Live Character Preview */}
            <View style={styles.previewBox}>
              <PixelCharacter config={currentUserConfig} pixelSize={4.2} />
              <View style={styles.nameTag}>
                <Text style={styles.nameTagText}>{currentUserConfig.name}</Text>
              </View>
            </View>

            {/* Nickname Input */}
            <View style={{ gap: 4 }}>
              <Text style={styles.fieldLabel}>Your Nickname:</Text>
              <TextInput
                maxLength={15}
                value={userName}
                onChangeText={setUserName}
                placeholder="e.g. Alex"
                placeholderTextColor="#999"
                style={styles.textInput}
              />
            </View>

            {/* Hairstyle */}
            <View style={{ gap: 4 }}>
              <Text style={styles.fieldLabel}>Hairstyle:</Text>
              <View style={styles.optionsRow}>
                {(['bob', 'spiky', 'long'] as Hairstyle[]).map((h) => (
                  <TouchableOpacity
                    key={h}
                    onPress={() => {
                      retroAudio.playClick();
                      setUserHairStyle(h);
                    }}
                    style={[
                      styles.optionBtn,
                      userHairStyle === h && styles.optionBtnActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionBtnText,
                        userHairStyle === h && { color: '#FFFFFF' },
                      ]}
                    >
                      {h.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Hair Color */}
            <View style={{ gap: 4 }}>
              <Text style={styles.fieldLabel}>Hair Color:</Text>
              <View style={styles.paletteRow}>
                {PALETTE_COLORS.map((col) => (
                  <TouchableOpacity
                    key={col.name}
                    onPress={() => {
                      retroAudio.playClick();
                      setUserHairColor(col.name);
                    }}
                    style={[
                      styles.colorDot,
                      { backgroundColor: col.hex },
                      userHairColor === col.name && styles.colorDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Shirt Color */}
            <View style={{ gap: 4 }}>
              <Text style={styles.fieldLabel}>Shirt Color:</Text>
              <View style={styles.paletteRow}>
                {PALETTE_COLORS.map((col) => (
                  <TouchableOpacity
                    key={col.name}
                    onPress={() => {
                      retroAudio.playClick();
                      setUserOutfitColor(col.name);
                    }}
                    style={[
                      styles.colorDot,
                      { backgroundColor: col.hex },
                      userOutfitColor === col.name && styles.colorDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Pants Color */}
            <View style={{ gap: 4 }}>
              <Text style={styles.fieldLabel}>Pants Color:</Text>
              <View style={styles.paletteRow}>
                {PALETTE_COLORS.map((col) => (
                  <TouchableOpacity
                    key={col.name}
                    onPress={() => {
                      retroAudio.playClick();
                      setUserPantsColor(col.name);
                    }}
                    style={[
                      styles.colorDot,
                      { backgroundColor: col.hex },
                      userPantsColor === col.name && styles.colorDotActive,
                    ]}
                  />
                ))}
              </View>
            </View>

            <TouchableOpacity onPress={handleStep1Next} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Next: Connect with Friend →</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* STEP 2: Generate Code or Join Friend's Room */}
        {step === 2 && (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14 }}>
            <View>
              <Text style={styles.stepTitle}>2. Connect with Your Friend</Text>
              <Text style={styles.stepSubtitle}>
                Generate a room code to invite your friend, or enter their code to enter their space.
              </Text>
            </View>

            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                onPress={() => {
                  retroAudio.playClick();
                  setMode('create');
                }}
                style={[styles.modeBtn, mode === 'create' && styles.modeBtnActive]}
              >
                <Text
                  style={[
                    styles.modeBtnText,
                    mode === 'create' && { color: '#FFFFFF' },
                  ]}
                >
                  Create & Share Code
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  retroAudio.playClick();
                  setMode('join');
                }}
                style={[
                  styles.modeBtn,
                  mode === 'join' && { backgroundColor: '#8EE4AF', borderColor: '#1E1E24' },
                ]}
              >
                <Text style={styles.modeBtnText}>Join with Code</Text>
              </TouchableOpacity>
            </View>

            {mode === 'create' ? (
              <View style={styles.codeBox}>
                <Text style={styles.codeBoxLabel}>Your Unique Space Pairing Code:</Text>
                <Text style={styles.codeText}>{generatedCode}</Text>
                <TouchableOpacity onPress={copyCode} style={styles.copyBtn}>
                  <Text style={styles.copyBtnText}>
                    {isCopied ? '✓ Copied to Clipboard!' : '📋 Copy Space Code'}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.codeHelperText}>
                  Send this code to your partner or friend so they can join your live widget!
                </Text>
              </View>
            ) : (
              <View style={{ gap: 6 }}>
                <Text style={styles.fieldLabel}>Enter Friend&apos;s Space Code:</Text>
                <TextInput
                  placeholder="e.g. BITS-4982"
                  placeholderTextColor="#888"
                  value={inputCode}
                  onChangeText={(val) => setInputCode(val.toUpperCase())}
                  style={styles.textInput}
                />
              </View>
            )}

            {/* Friend's Name */}
            <View style={{ gap: 4 }}>
              <Text style={styles.fieldLabel}>Friend / Partner&apos;s Name:</Text>
              <TextInput
                maxLength={15}
                value={partnerName}
                onChangeText={setPartnerName}
                placeholder="e.g. Juno"
                placeholderTextColor="#888"
                style={styles.textInput}
              />
            </View>

            {/* Preview Together */}
            <View style={styles.previewBoxTogether}>
              <Text style={styles.togetherLabel}>Room Preview</Text>
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14 }}>
                <View style={{ alignItems: 'center' }}>
                  <PixelCharacter config={currentUserConfig} pixelSize={3} />
                  <Text style={styles.togetherName}>{currentUserConfig.name}</Text>
                </View>
                <Text style={{ fontSize: 16, marginBottom: 12 }}>💖</Text>
                <View style={{ alignItems: 'center' }}>
                  <PixelCharacter config={currentPartnerConfig} isPartner pixelSize={3} />
                  <Text style={styles.togetherName}>{currentPartnerConfig.name}</Text>
                </View>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={() => setStep(1)}
                style={[styles.primaryBtn, { flex: 1, backgroundColor: '#FAF7EE' }]}
              >
                <Text style={[styles.primaryBtnText, { color: '#1E1E24' }]}>← Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleStep2Connect}
                style={[styles.primaryBtn, { flex: 2, backgroundColor: '#8EE4AF' }]}
              >
                <Text style={styles.primaryBtnText}>Enter Room 🚪</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* STEP 3: Connecting Fanfare & Entrance */}
        {step === 3 && (
          <View style={styles.connectedScreen}>
            <PixelHeart size={5} color="#FF85A1" />
            <Text style={styles.connectedTitle}>Entering Your Live Room...</Text>
            <Text style={styles.connectedDesc}>
              {currentUserConfig.name} and {currentPartnerConfig.name}&apos;s space is ready! Stepping onto the wooden floor...
            </Text>
            <View style={styles.syncPulse}>
              <Text style={styles.syncPulseText}>✦ Connected • Live Widget Synced</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#EDE8D5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
    backgroundColor: '#FAF7EE',
    borderWidth: 3,
    borderColor: '#1E1E24',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1E1E24',
    paddingBottom: 10,
  },
  headerTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#1E1E24',
  },
  stepBadge: {
    backgroundColor: '#FF85A1',
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stepBadgeText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  cancelBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#1E1E24',
  },
  stepTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1E1E24',
  },
  stepSubtitle: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: 'rgba(30,30,36,0.7)',
    marginTop: 2,
  },
  previewBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  nameTag: {
    marginTop: 6,
    backgroundColor: '#FFD166',
    borderWidth: 1.5,
    borderColor: '#1E1E24',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  nameTagText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  fieldLabel: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 13,
    color: '#1E1E24',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  optionBtnActive: {
    backgroundColor: '#FF85A1',
  },
  optionBtnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 8,
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1E1E24',
  },
  colorDotActive: {
    transform: [{ scale: 1.2 }],
    borderColor: '#FF85A1',
    borderWidth: 3,
  },
  primaryBtn: {
    backgroundColor: '#FF85A1',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#FFFFFF',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: 'rgba(30,30,36,0.3)',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  modeBtnActive: {
    backgroundColor: '#FF85A1',
    borderColor: '#1E1E24',
  },
  modeBtnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  codeBox: {
    backgroundColor: '#FFFDF9',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  codeBoxLabel: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: 'rgba(30,30,36,0.7)',
  },
  codeText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 22,
    color: '#1A1C2E',
    letterSpacing: 2,
  },
  copyBtn: {
    backgroundColor: '#FFD166',
    borderWidth: 2,
    borderColor: '#1E1E24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  copyBtnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  codeHelperText: {
    fontFamily: 'monospace',
    fontSize: 7.5,
    color: 'rgba(30,30,36,0.6)',
    textAlign: 'center',
  },
  previewBoxTogether: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  togetherLabel: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: 'rgba(30,30,36,0.6)',
    textTransform: 'uppercase',
  },
  togetherName: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
    marginTop: 2,
  },
  connectedScreen: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  connectedTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#1E1E24',
  },
  connectedDesc: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: 'rgba(30,30,36,0.8)',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 14,
  },
  syncPulse: {
    backgroundColor: '#8EE4AF',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  syncPulseText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
});
