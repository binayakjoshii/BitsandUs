import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  Easing,
} from 'react-native';
import { PixelSprite } from './PixelSprite';
import { PixelHeart } from './PixelIcons';

export type Hairstyle = 'bob' | 'spiky' | 'long';
export type PaletteColor = 'rose' | 'mint' | 'sun' | 'midnight' | 'cream';
export type CharacterMood = 'joy' | 'sleepy' | 'working' | 'miss_you' | 'loved';
export type CharacterAction = 'none' | 'hug' | 'poke' | 'note' | 'photo' | 'scribble' | 'joy';

export interface CharacterConfig {
  name: string;
  hairStyle: Hairstyle;
  hairColor: PaletteColor;
  outfitColor: PaletteColor;
  pantsColor: PaletteColor;
}

interface PixelCharacterProps {
  config: CharacterConfig;
  mood?: CharacterMood;
  action?: CharacterAction;
  isSleeping?: boolean;
  isPartner?: boolean;
  pixelSize?: number;
  style?: StyleProp<ViewStyle>;
}

export const COLOR_MAPS: Record<
  PaletteColor,
  { base: string; highlight: string; shadow: string }
> = {
  rose: { base: '#FF85A1', highlight: '#FFB3C6', shadow: '#D84A75' },
  mint: { base: '#8EE4AF', highlight: '#B9F5D2', shadow: '#4EAF77' },
  sun: { base: '#FFD166', highlight: '#FFE39B', shadow: '#DE8B26' },
  midnight: { base: '#2B2E4A', highlight: '#484D7A', shadow: '#181A2B' },
  cream: { base: '#FAF7EE', highlight: '#FFFFFF', shadow: '#D8D0B8' },
};

export const PixelCharacter: React.FC<PixelCharacterProps> = ({
  config,
  mood = 'joy',
  action = 'none',
  isSleeping = false,
  isPartner = false,
  pixelSize = 3.6,
  style,
}) => {
  const sleeping = isSleeping || mood === 'sleepy';

  // 1. Natural periodic eye blinking state (every 3.5 - 5s)
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (sleeping || action !== 'none') {
      return;
    }

    let blinkTimeout: ReturnType<typeof setTimeout>;
    let loopTimeout: ReturnType<typeof setTimeout>;

    const triggerBlink = () => {
      setIsBlinking(true);
      blinkTimeout = setTimeout(() => {
        setIsBlinking(false);
        scheduleNext();
      }, 140);
    };

    const scheduleNext = () => {
      const delay = 3200 + Math.random() * 2600;
      loopTimeout = setTimeout(triggerBlink, delay);
    };

    scheduleNext();

    return () => {
      clearTimeout(blinkTimeout);
      clearTimeout(loopTimeout);
    };
  }, [sleeping, action]);

  const effectiveBlinking = isBlinking && !sleeping && action === 'none';

  // 2. Idle gentle breathing loop animation
  const [idleAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(idleAnim, {
          toValue: 1,
          duration: 1250,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(idleAnim, {
          toValue: 0,
          duration: 1250,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [idleAnim]);

  // 3. Reactive action animation controller
  const [actionAnim] = useState(() => new Animated.Value(0));
  const [heartFloatAnim] = useState(() => new Animated.Value(0));

  // Running leg stride frame toggle (0 and 1) for Joy Mode
  const [strideTick, setStrideTick] = useState(0);

  useEffect(() => {
    if (action === 'joy') {
      const stepInterval = setInterval(() => {
        setStrideTick((prev) => (prev === 0 ? 1 : 0));
      }, 120);
      return () => clearInterval(stepInterval);
    }
  }, [action]);

  const stepFrame = action === 'joy' ? strideTick : 0;

  useEffect(() => {
    if (action === 'none') {
      actionAnim.setValue(0);
      heartFloatAnim.setValue(0);
      return;
    }

    if (action === 'hug') {
      heartFloatAnim.setValue(0);
      Animated.parallel([
        Animated.sequence([
          Animated.spring(actionAnim, {
            toValue: 1,
            friction: 5,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(actionAnim, {
            toValue: 0.85,
            duration: 900,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(heartFloatAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    } else if (action === 'poke') {
      actionAnim.setValue(0);
      Animated.sequence([
        Animated.timing(actionAnim, {
          toValue: 1,
          duration: 120,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(actionAnim, {
          toValue: 0,
          friction: 4,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (action === 'photo') {
      actionAnim.setValue(0);
      Animated.spring(actionAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else if (action === 'scribble') {
      actionAnim.setValue(0);
      Animated.sequence([
        Animated.timing(actionAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.timing(actionAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(actionAnim, { toValue: 1, duration: 160, useNativeDriver: true }),
        Animated.spring(actionAnim, { toValue: 0, friction: 4, useNativeDriver: true }),
      ]).start();
    } else if (action === 'joy') {
      actionAnim.setValue(0);
      Animated.loop(
        Animated.sequence([
          Animated.timing(actionAnim, { toValue: 1, duration: 130, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(actionAnim, { toValue: 0, duration: 130, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
        { iterations: 14 }
      ).start();
    }
  }, [action, actionAnim, heartFloatAnim]);

  // Interpolated animation values
  const idleTranslateY = idleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1.8],
  });

  const idleScaleY = idleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.015],
  });

  const actionTranslateX = actionAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      0,
      action === 'hug'
        ? isPartner
          ? -10
          : 10
        : action === 'poke'
        ? isPartner
          ? 7
          : 6
        : 0,
      action === 'hug' ? (isPartner ? -9 : 9) : 0,
    ],
  });

  const actionTranslateY = actionAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      0,
      action === 'joy' ? -7 : action === 'scribble' ? -8 : action === 'photo' ? -3 : 0,
      0,
    ],
  });

  const actionScaleX = actionAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      1,
      action === 'poke' && isPartner ? 1.15 : action === 'hug' ? 1.05 : 1,
      action === 'photo' ? 1.08 : 1,
    ],
  });

  const actionScaleY = actionAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      1,
      action === 'poke' && isPartner ? 0.85 : action === 'hug' ? 0.96 : 1,
      action === 'photo' ? 1.08 : 1,
    ],
  });

  const actionRotate = actionAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      '0deg',
      action === 'hug'
        ? isPartner
          ? '-6deg'
          : '6deg'
        : action === 'poke' && isPartner
        ? '7deg'
        : '0deg',
      action === 'hug' ? (isPartner ? '-4deg' : '4deg') : '0deg',
    ],
  });

  // Floating heart transforms
  const heartTranslateY = heartFloatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -26],
  });
  const heartOpacity = heartFloatAnim.interpolate({
    inputRange: [0, 0.15, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });
  const heartScale = heartFloatAnim.interpolate({
    inputRange: [0, 0.25, 1],
    outputRange: [0.6, 1.25, 1],
  });

  // 4. Razor-Sharp 16-Bit Chibi Grid Definition (14 columns)
  const getHairCrown = (styleName: Hairstyle): string[] => {
    switch (styleName) {
      case 'spiky':
        return [
          '..XX..XX..XX..',
          '.XHhX.XhhX.XhX.',
          'XHHHX.XhhX.XHHHX',
          'XHHHHHhhhhHHHX',
          'XHH.SSsSS.SHHX',
        ];
      case 'long':
        return [
          '....XXXXXX....',
          '..XXHHhhhhXX..',
          '.XHHHhhhhHHHX.',
          'XHHHHHHHHHHHHX',
          'XHHSSsSSsSSHHX',
        ];
      case 'bob':
      default:
        return [
          '....XXXXXX....',
          '..XXHHhhhhXX..',
          '.XHHHhhhhHHHX.',
          'XHHHHHHHHHHHHX',
          'XHHSSsSSsSSHHX',
        ];
    }
  };

  // Eye rows (Rows 5 & 6)
  let eyeRow1 = 'XHSWEssssWESHX';
  let eyeRow2 = 'XHCEESSSSEECX';

  if (sleeping || effectiveBlinking) {
    // Closed peaceful eyes
    eyeRow1 = 'XHSSSSssssSSHX';
    eyeRow2 = 'XHCXXSSSSXXCHX';
  } else if (action === 'hug' || action === 'joy' || mood === 'loved') {
    // Happy squint eyes ^ ◡ ^
    eyeRow1 = 'XHS.XssssX.SHX';
    eyeRow2 = 'XHCX.SSSS.XCHX';
  } else if (action === 'poke' && isPartner) {
    // Startled / shocked eyes > <
    eyeRow1 = 'XHSX.ssss.XSHX';
    eyeRow2 = 'XHC.XSSSSX.CHX';
  } else if (action === 'photo') {
    // Cute winking pose ^ _ -
    eyeRow1 = 'XHSWEssss..SSHX';
    eyeRow2 = 'XHCEESSSSXXCHX';
  }

  // Mouth & Chin (Row 7)
  const mouthRow =
    action === 'hug' || action === 'joy' || mood === 'joy'
      ? '.XHSsMMMMsSHX.' // Open happy smile
      : action === 'poke' && isPartner
      ? '.XHSssOOssSHX.' // Surprised open mouth
      : '.XHSssMMssSHX.'; // Sweet gentle smile

  // Upper Body & Arms (Rows 8 to 11)
  let row8 = '..XXoOOOOoXX..';
  let row9 = '.XOSoOOOOoSOX.';
  let row10 = '.XOSuOOOOuSOX.';
  const row11 = '..XXuOOOOuXX..';

  if (config.hairStyle === 'long' && action === 'none') {
    row8 = 'XHX.oOOOOo.XHX';
    row9 = 'XHXSoOOOOoSHX';
    row10 = 'XHXSuOOOOuSHX';
  } else if (action === 'hug') {
    if (isPartner) {
      // Reaching left toward Alex
      row8 = '..XXoOOOOoXX..';
      row9 = 'SSXOSoOOOOOX..';
      row10 = 'SSXOSuOOOOOX..';
    } else {
      // Reaching right toward Juno
      row8 = '..XXoOOOOoXX..';
      row9 = '..XOOOOOoSOXSS';
      row10 = '..XOOOOOuSOXSS';
    }
  } else if (action === 'poke') {
    if (!isPartner) {
      // Pointing poker arm
      row8 = '..XXoOOOOoXX..';
      row9 = '..XOOOOOoSSSSS';
      row10 = '.XOSuOOOOuSOX.';
    } else {
      // Startled hands up
      row8 = 'SSXXoOOOOoXXSS';
      row9 = '.XOSoOOOOoSOX.';
      row10 = '.XOSuOOOOuSOX.';
    }
  } else if (action === 'photo') {
    // Peace sign hand raised
    row8 = '..XXoOOOOoXXSS';
    row9 = '.XOSoOOOOoSSX.';
    row10 = '.XOSuOOOOuSOX.';
  } else if (action === 'scribble' || action === 'joy' || mood === 'joy') {
    // Cheering / running arms pumping up
    row8 = 'SSXXoOOOOoXXSS';
    row9 = '.XOSoOOOOoSOX.';
    row10 = '.XOSuOOOOuSOX.';
  }

  // Pants and Shoes (Rows 12 to 17) - with animated running stride in Joy Mode
  const pantsAndShoesRows =
    action === 'joy'
      ? stepFrame === 0
        ? [
            '..XXpPPPPpXX..', // Row 12 (Pants waist)
            '..XPPPuuPPPX..', // Row 13 (Thighs)
            '..XPP...UPPX..', // Row 14 (Left leg forward)
            '..XPP....PPX..', // Row 15
            '..XBB....BBX..', // Row 16
            '..Xbb....bbX..', // Row 17
          ]
        : [
            '..XXpPPPPpXX..', // Row 12
            '..XPPPuuPPPX..', // Row 13
            '..XPPU...PPX..', // Row 14 (Right leg forward)
            '..XPPU...PPX..', // Row 15
            '..X.BB...BBX..', // Row 16
            '..X.bb...bbX..', // Row 17
          ]
      : [
          '..XXpPPPPpXX..', // Row 12 (Pants waist)
          '..XPPPuuPPPX..', // Row 13 (Thighs)
          '..XPPU..UPPX..', // Row 14 (Separated legs)
          '..XPP....PPX..', // Row 15 (Cuffs)
          '..XBB....BBX..', // Row 16 (Boots)
          '..Xbb....bbX..', // Row 17 (Shoe highlights)
        ];

  const fullGrid = [
    ...getHairCrown(config.hairStyle),
    eyeRow1,
    eyeRow2,
    mouthRow,
    row8,
    row9,
    row10,
    row11,
    ...pantsAndShoesRows,
  ];

  const hairColors = COLOR_MAPS[config.hairColor];
  const outfitColors = COLOR_MAPS[config.outfitColor];
  const pantsColors = COLOR_MAPS[config.pantsColor];

  const colorMap: Record<string, string> = {
    X: '#2B2129', // Deep soft plum outline (gentler and richer than pitch black)
    H: hairColors.base,
    h: hairColors.highlight,
    d: hairColors.shadow,
    S: '#FFDFC4', // Warm skin base
    s: '#F5C4A4', // Skin shadow
    C: '#FF8DA6', // Rosy cheek blush
    W: '#FFFFFF', // Eye glint / catchlight
    E: '#231B2A', // Expressive deep pupil
    M: '#D84A75', // Cheerful smile
    O: outfitColors.base,
    o: outfitColors.highlight,
    u: outfitColors.shadow,
    P: pantsColors.base,
    p: pantsColors.shadow,
    B: '#352D3D', // Boots
    b: '#4D4257', // Boot highlight
    U: '#E8DEC4', // Leg gap shadow
    '.': 'transparent',
    ' ': 'transparent',
  };

  return (
    <Animated.View
      style={[
        styles.characterContainer,
        {
          transform: [
            { translateY: Animated.add(idleTranslateY, actionTranslateY) },
            { translateX: actionTranslateX },
            { scaleX: actionScaleX },
            { scaleY: Animated.multiply(idleScaleY, actionScaleY) },
            { rotate: actionRotate },
          ],
        },
        style,
      ]}
    >
      {/* Animated Floating Heart on Hug */}
      {action === 'hug' && (
        <Animated.View
          style={[
            styles.floatingHeartBubble,
            {
              transform: [{ translateY: heartTranslateY }, { scale: heartScale }],
              opacity: heartOpacity,
            },
          ]}
        >
          <PixelHeart size={2.4} color="#FF85A1" />
        </Animated.View>
      )}

      {/* Mood Indicators & Action Bubbles */}
      {action === 'hug' && (
        <View style={styles.actionBubble}>
          <Text style={[styles.bubbleText, { color: '#FF85A1' }]}>♥ HUG!</Text>
        </View>
      )}
      {action === 'poke' && isPartner && (
        <View style={styles.actionBubble}>
          <Text style={[styles.bubbleText, { color: '#E75480' }]}>! HEY!</Text>
        </View>
      )}
      {action === 'note' && isPartner && (
        <View style={styles.actionBubble}>
          <Text style={[styles.bubbleText, { color: '#8EE4AF' }]}>✉ GOT IT</Text>
        </View>
      )}
      {action === 'photo' && (
        <View style={styles.actionBubble}>
          <Text style={[styles.bubbleText, { color: '#FFD166' }]}>📸 CHEESE</Text>
        </View>
      )}
      {action === 'scribble' && (
        <View style={styles.actionBubble}>
          <Text style={[styles.bubbleText, { color: '#5CDB95' }]}>✎ CUTE!</Text>
        </View>
      )}
      {action === 'joy' && (
        <View style={styles.actionBubble}>
          <Text style={[styles.bubbleText, { color: '#FFD166' }]}>🏃 ZOOMIES!</Text>
        </View>
      )}

      {/* Mood badges when idle */}
      {action === 'none' && isPartner && mood === 'sleepy' && (
        <View style={[styles.moodBadge, { right: 0 }]}>
          <Text style={[styles.moodText, { color: '#8EE4AF' }]}>z Z</Text>
        </View>
      )}
      {action === 'none' && isPartner && mood === 'miss_you' && (
        <View style={[styles.moodBadge, styles.moodBubble]}>
          <Text style={styles.moodText}>...</Text>
        </View>
      )}
      {action === 'none' && isPartner && mood === 'loved' && (
        <View style={styles.moodBadge}>
          <Text style={{ fontSize: 12 }}>💖</Text>
        </View>
      )}
      {action === 'none' && isPartner && mood === 'joy' && (
        <View style={styles.moodBadge}>
          <Text style={{ fontSize: 12 }}>✨</Text>
        </View>
      )}

      {/* The 16-Bit Chibi Character SVG Sprite */}
      <PixelSprite grid={fullGrid} colorMap={colorMap} pixelSize={pixelSize} />

      {/* Pixel Laptop on lap when working */}
      {mood === 'working' && action === 'none' && (
        <View style={styles.laptopContainer}>
          <PixelSprite
            pixelSize={2}
            grid={[
              '..XXXXXX..',
              '.XWWWWWWX.',
              '.XWMMMMWX.',
              'XXXXXXXXXX',
              'XXXXXXXXXX',
            ]}
            colorMap={{
              X: '#2B2129',
              W: '#FAF7EE',
              M: '#8EE4AF',
            }}
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  characterContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  floatingHeartBubble: {
    position: 'absolute',
    top: -20,
    zIndex: 25,
  },
  actionBubble: {
    position: 'absolute',
    top: -24,
    backgroundColor: '#FAF7EE',
    borderWidth: 2,
    borderColor: '#1E1E24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  bubbleText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  moodBadge: {
    position: 'absolute',
    top: -20,
    zIndex: 10,
  },
  moodBubble: {
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: '#1E1E24',
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  moodText: {
    fontSize: 8,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#1A1C2E',
  },
  laptopContainer: {
    position: 'absolute',
    bottom: 6,
    right: -4,
    zIndex: 10,
  },
});
