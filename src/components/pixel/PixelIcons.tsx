import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PixelSprite } from './PixelSprite';
import { formatBatteryLevel } from '../../utils/helpers';

export const PixelHeart: React.FC<{ size?: number; color?: string; style?: object }> = ({
  size = 3,
  color = '#FF85A1',
  style,
}) => {
  const grid = [
    '..XX..XX..',
    '.XHHXXHHX.',
    'XHHHHHHHHX',
    'XWHHHHHHHX',
    'XHHHHHHHHX',
    '.XHHHHHHX.',
    '..XHHHHX..',
    '...XHHX...',
    '....XX....',
  ];

  const colorMap = {
    X: '#1E1E24',
    H: color,
    W: '#FFFDF9', // light highlight
  };

  return <PixelSprite grid={grid} colorMap={colorMap} pixelSize={size} style={style} />;
};

export const PixelStar: React.FC<{ size?: number; color?: string; style?: object }> = ({
  size = 3,
  color = '#FFD166',
  style,
}) => {
  const grid = [
    '....X....',
    '...XYX...',
    '..XYYYX..',
    '.XYYYYYX.',
    'XXYYYYYXX',
    '.XYYYYYX.',
    '..XYYYX..',
    '...XYX...',
    '....X....',
  ];

  const colorMap = {
    X: '#1E1E24',
    Y: color,
  };

  return <PixelSprite grid={grid} colorMap={colorMap} pixelSize={size} style={style} />;
};

export const PixelPlant: React.FC<{ size?: number; style?: object }> = ({ size = 3, style }) => {
  const grid = [
    '....XX....',
    '..XXGGXX..',
    '.XGGGGGGX.',
    '..XXGGXX..',
    '...XGGX...',
    '..XXXXXX..',
    '.XOOOOOOX.',
    '.XOOOOOOX.',
    '..XOOOOX..',
    '...XXXX...',
  ];

  const colorMap = {
    X: '#1E1E24',
    G: '#8EE4AF',
    O: '#F4A261', // terra cotta pot
  };

  return <PixelSprite grid={grid} colorMap={colorMap} pixelSize={size} style={style} />;
};

export const PixelEnvelope: React.FC<{ size?: number; style?: object }> = ({ size = 3, style }) => {
  const grid = [
    'XXXXXXXXXXXX',
    'XWWWWWWWWWWX',
    'XWXXWWWWXXWX',
    'XWWWXXXXWWWW',
    'XWWWWWWWWWWX',
    'XWWWWWWWWWWX',
    'XXXXXXXXXXXX',
  ];

  const colorMap = {
    X: '#1E1E24',
    W: '#FFFDF9',
  };

  return <PixelSprite grid={grid} colorMap={colorMap} pixelSize={size} style={style} />;
};

/**
 * 10-segment game-style battery bar:
 * mint above 50%, yellow at 20-50%, red at 20% or below with pulsing heart
 */
export const PixelBatteryBar: React.FC<{ level: number }> = ({ level }) => {
  const { percent, segments, color, colorHex } = formatBatteryLevel(level);

  return (
    <View style={styles.batteryContainer}>
      <View style={{ marginRight: 4 }}>
        <PixelHeart size={2} color={color === 'red' ? '#FF5A79' : colorHex} />
      </View>

      {/* Battery segments frame */}
      <View style={styles.segmentsFrame}>
        {Array.from({ length: 10 }).map((_, idx) => {
          const filled = idx < segments;
          return (
            <View
              key={idx}
              style={{
                backgroundColor: filled ? colorHex : '#383A49',
                width: 4,
                height: 10,
                marginHorizontal: 1,
              }}
            />
          );
        })}
      </View>

      <Text style={styles.percentText}>
        {percent}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF7EE',
    borderWidth: 2,
    borderColor: '#1E1E24',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  segmentsFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E24',
    padding: 2,
    borderRadius: 2,
  },
  percentText: {
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#1E1E24',
    marginLeft: 4,
  },
});
