import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { retroAudio } from '../../utils/audio';

interface QuickScribbleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendDoodle: (grid: string[][]) => void;
}

const PALETTE = [
  { name: 'Rose', color: '#FF85A1' },
  { name: 'Mint', color: '#8EE4AF' },
  { name: 'Sun', color: '#FFD166' },
  { name: 'Midnight', color: '#1A1C2E' },
  { name: 'White', color: '#FFFFFF' },
  { name: 'Cream', color: '#FAF7EE' },
];

export const QuickScribbleModal: React.FC<QuickScribbleModalProps> = ({
  isOpen,
  onClose,
  onSendDoodle,
}) => {
  const createEmptyGrid = () => Array(8).fill(null).map(() => Array(8).fill('#FFFFFF'));

  const [grid, setGrid] = useState<string[][]>(createEmptyGrid());
  const [history, setHistory] = useState<string[][][]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#FF85A1');
  const [isEraser, setIsEraser] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCellPaint = (row: number, col: number) => {
    const newColor = isEraser ? '#FFFFFF' : selectedColor;
    if (grid[row][col] === newColor) return;

    setHistory((prev) => [...prev, grid.map((r) => [...r])]);

    const newGrid = grid.map((r, rIdx) =>
      r.map((c, cIdx) => (rIdx === row && cIdx === col ? newColor : c))
    );
    setGrid(newGrid);
    retroAudio.playClick();
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const last = history[history.length - 1];
    setGrid(last);
    setHistory((prev) => prev.slice(0, prev.length - 1));
    retroAudio.playClick();
  };

  const handleClear = () => {
    setHistory((prev) => [...prev, grid.map((r) => [...r])]);
    setGrid(createEmptyGrid());
    retroAudio.playClick();
  };

  const handleSend = () => {
    retroAudio.playSuccess();
    onSendDoodle(grid);
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, marginRight: 6 }}>✎</Text>
              <Text style={styles.headerTitle}>Quick Scribble</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                retroAudio.playClick();
                onClose();
              }}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 8x8 Pixel Grid */}
          <View style={styles.gridOuter}>
            <View style={styles.gridContainer}>
              {grid.map((row, rIdx) => (
                <View key={rIdx} style={{ flexDirection: 'row' }}>
                  {row.map((cellColor, cIdx) => (
                    <TouchableOpacity
                      key={`${rIdx}-${cIdx}`}
                      activeOpacity={0.8}
                      onPress={() => handleCellPaint(rIdx, cIdx)}
                      style={[styles.gridCell, { backgroundColor: cellColor }]}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Palette Bar */}
          <View style={styles.paletteBar}>
            {PALETTE.map((item) => (
              <TouchableOpacity
                key={item.name}
                onPress={() => {
                  setSelectedColor(item.color);
                  setIsEraser(false);
                  retroAudio.playClick();
                }}
                style={[
                  styles.paletteColor,
                  { backgroundColor: item.color },
                  !isEraser && selectedColor === item.color && styles.selectedColor,
                ]}
              />
            ))}

            {/* Eraser button */}
            <TouchableOpacity
              onPress={() => {
                setIsEraser(!isEraser);
                retroAudio.playClick();
              }}
              style={[
                styles.eraserButton,
                isEraser && { backgroundColor: '#FF85A1' },
              ]}
            >
              <Text style={{ fontSize: 12 }}>🧽</Text>
            </TouchableOpacity>
          </View>

          {/* Tool Actions */}
          <View style={styles.footer}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                onPress={handleUndo}
                disabled={history.length === 0}
                style={[styles.smallBtn, history.length === 0 && { opacity: 0.4 }]}
              >
                <Text style={styles.btnText}>Undo</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleClear} style={styles.smallBtn}>
                <Text style={styles.btnText}>Clear</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleSend} style={styles.sendBtn}>
              <Text style={[styles.btnText, { color: '#1E1E24' }]}>Send Doodle ✎</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FAF7EE',
    borderWidth: 3,
    borderColor: '#1E1E24',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1E1E24',
    paddingBottom: 8,
  },
  headerTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#1E1E24',
  },
  closeButton: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E1E24',
    backgroundColor: '#FF85A1',
    borderRadius: 4,
  },
  closeButtonText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  gridOuter: {
    alignItems: 'center',
    marginVertical: 12,
  },
  gridContainer: {
    backgroundColor: '#1E1E24',
    padding: 2,
    borderWidth: 3,
    borderColor: '#1E1E24',
    borderRadius: 6,
  },
  gridCell: {
    width: 28,
    height: 28,
    margin: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  paletteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  paletteColor: {
    width: 26,
    height: 26,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1E1E24',
  },
  selectedColor: {
    transform: [{ scale: 1.15 }],
  },
  eraserButton: {
    width: 28,
    height: 26,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#1E1E24',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#1E1E24',
    paddingTop: 10,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#1E1E24',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  sendBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#1E1E24',
    backgroundColor: '#8EE4AF',
    borderRadius: 8,
  },
  btnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
});
