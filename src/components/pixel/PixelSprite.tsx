import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import { View, StyleProp, ViewStyle } from 'react-native';

export interface PixelSpriteProps {
  grid: string[];
  colorMap: Record<string, string>;
  pixelSize?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * PixelSprite takes a letter-coded 2D ASCII grid (e.g. "..HHHH..")
 * and renders it as a razor-sharp vector SVG using react-native-svg
 * compatible with iOS, Android, and Web.
 */
export const PixelSprite: React.FC<PixelSpriteProps> = ({
  grid,
  colorMap,
  pixelSize = 4,
  style,
}) => {
  const height = grid.length;
  const width = Math.max(...grid.map((row) => row.length));

  const rects: { x: number; y: number; fill: string; key: string }[] = [];

  grid.forEach((row, rowIndex) => {
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const char = row[colIndex];
      if (char !== '.' && char !== ' ') {
        const fill = colorMap[char];
        if (fill && fill !== 'transparent') {
          rects.push({
            x: colIndex * pixelSize,
            y: rowIndex * pixelSize,
            fill,
            key: `${rowIndex}-${colIndex}`,
          });
        }
      }
    }
  });

  return (
    <View style={style}>
      <Svg
        width={width * pixelSize}
        height={height * pixelSize}
        viewBox={`0 0 ${width * pixelSize} ${height * pixelSize}`}
      >
        {rects.map((rect) => (
          <Rect
            key={rect.key}
            x={rect.x}
            y={rect.y}
            width={pixelSize}
            height={pixelSize}
            fill={rect.fill}
          />
        ))}
      </Svg>
    </View>
  );
};
