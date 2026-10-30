import React, { useEffect, useState } from 'react';
import { StyleProp, ViewStyle, Animated, Easing } from 'react-native';
import { PixelSprite } from './PixelSprite';

export type PetType = 'cat' | 'dog' | 'ghost' | 'none';

interface PixelPetProps {
  type: PetType;
  pixelSize?: number;
  style?: StyleProp<ViewStyle>;
}

export const PixelPet: React.FC<PixelPetProps> = ({ type, pixelSize = 2.8, style }) => {
  const [floatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (type === 'none') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: type === 'ghost' ? 1400 : 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: type === 'ghost' ? 1400 : 1100,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [floatAnim, type]);

  if (type === 'none') return null;

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, type === 'ghost' ? -4 : -1.5],
  });

  if (type === 'cat') {
    // 10x9 Cute Calico Cat with pink ears and swishing tail
    const catGrid = [
      'X...X.....',
      'XP.PX...X.', // P = Pink inner ear
      'XWWWX..XOX', // O = Orange calico spot
      'XWEWEXXOOX', // W = White face, E = Eye
      'XWNWXXOOX.', // N = Pink nose
      'XWWWWWOOX.',
      'XWWWWWWOX.',
      'XWWWWWWX..',
      'XX.XX.XX..',
    ];
    const catColorMap = {
      X: '#2B2129',
      W: '#FFFDF9',
      P: '#FFB3C6',
      O: '#F4A261',
      E: '#2B2129',
      N: '#FF85A1',
    };

    return (
      <Animated.View style={[{ transform: [{ translateY }] }, style]}>
        <PixelSprite grid={catGrid} colorMap={catColorMap} pixelSize={pixelSize} />
      </Animated.View>
    );
  }

  if (type === 'dog') {
    // 11x9 Cute Golden Puppy with floppy ears and tail
    const dogGrid = [
      '.XX...XX...',
      'XDDX.XDDX..',
      'XDDDDDDDX.X',
      'XDEDNDEDX.XD', // E = Eye, N = Nose
      'XDDDDDDDX.XD',
      'XDDDDDDDDXX',
      '.XDDDDDDDDX',
      '..XDDDDDDX.',
      '..XX.XX.XX.',
    ];
    const dogColorMap = {
      X: '#2B2129',
      D: '#E09F3E',
      E: '#231B2A',
      N: '#231B2A',
    };

    return (
      <Animated.View style={[{ transform: [{ translateY }] }, style]}>
        <PixelSprite grid={dogGrid} colorMap={dogColorMap} pixelSize={pixelSize} />
      </Animated.View>
    );
  }

  if (type === 'ghost') {
    // 10x9 Cute Floating Ghostie with blush cheeks
    const ghostGrid = [
      '..XXXXXX..',
      '.XWWWWWWX.',
      'XWWWWWWWWX',
      'XWEWWWEWWX', // E = Cute wide eye
      'XWCWWWCWWX', // C = Rosy blush
      'XWWWWWWWWX',
      'XWWWWWWWWX',
      '.XWWWWWWX.',
      '..XX..XX..',
    ];
    const ghostColorMap = {
      X: '#2B2129',
      W: '#FAF7EE',
      E: '#231B2A',
      C: '#FF8DA6',
    };

    return (
      <Animated.View style={[{ transform: [{ translateY }] }, style]}>
        <PixelSprite grid={ghostGrid} colorMap={ghostColorMap} pixelSize={pixelSize} />
      </Animated.View>
    );
  }

  return null;
};
