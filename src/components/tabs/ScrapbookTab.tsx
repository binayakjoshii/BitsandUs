import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { MemoryItem, filterMemories } from '../../utils/helpers';
import { retroAudio } from '../../utils/audio';
import { PixelHeart } from '../pixel/PixelIcons';

interface ScrapbookTabProps {
  memories: MemoryItem[];
  onAddReaction: (memoryId: string) => void;
  darkMode?: boolean;
}

export const ScrapbookTab: React.FC<ScrapbookTabProps> = ({
  memories,
  onAddReaction,
  darkMode = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'photos' | 'notes' | 'doodles'>('all');
  const [activeItem, setActiveItem] = useState<MemoryItem | null>(null);

  const filtered = filterMemories(memories, filter);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, darkMode && styles.titleNight]}>Memory Scrapbook</Text>
          <Text style={[styles.subtitle, darkMode && styles.subtitleNight]}>
            Polaroids, love notes & scribbles saved forever.
          </Text>
        </View>
        <View style={[styles.countBadge, darkMode && styles.countBadgeNight]}>
          <Text style={[styles.countText, darkMode && styles.countTextNight]}>{filtered.length} Items</Text>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['all', 'photos', 'notes', 'doodles'] as const).map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => {
              retroAudio.playClick();
              setFilter(f);
            }}
            style={[
              styles.filterChip,
              darkMode && styles.filterChipNight,
              filter === f && styles.filterChipActive,
            ]}
          >
            <Text
              style={[
                styles.filterChipText,
                darkMode && styles.filterChipTextNight,
                filter === f && { color: '#FFFFFF' },
              ]}
            >
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Polaroid Grid */}
      <View style={styles.grid}>
        {filtered.map((item) => {
          const rot = item.rotation || 0;
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => {
                retroAudio.playClick();
                setActiveItem(item);
              }}
              style={[
                styles.card,
                darkMode && styles.cardNight,
                { transform: [{ rotate: `${rot}deg` }] },
              ]}
            >
              {/* Thumbtack / Tape decoration */}
              <View style={styles.tape} />

              {/* Photo content */}
              {item.type === 'photo' && (
                <View style={styles.photoContainer}>
                  <Image
                    source={{ uri: item.content }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                </View>
              )}

              {/* Doodle content */}
              {item.type === 'doodle' && (
                <View style={[styles.doodleContainer, darkMode && styles.doodleContainerNight]}>
                  {(() => {
                    try {
                      const grid: string[][] = JSON.parse(item.content);
                      return (
                        <View style={styles.doodleBox}>
                          {grid.map((row, r) => (
                            <View key={r} style={{ flexDirection: 'row' }}>
                              {row.map((cell, c) => (
                                <View
                                  key={`${r}-${c}`}
                                  style={{ backgroundColor: cell, width: 8, height: 8 }}
                                />
                              ))}
                            </View>
                          ))}
                        </View>
                      );
                    } catch {
                      return <Text style={[styles.cardFooterText, darkMode && styles.cardFooterTextNight]}>✎ Doodle</Text>;
                    }
                  })()}
                </View>
              )}

              {/* Note / Hug / Poke content */}
              {(item.type === 'note' || item.type === 'hug' || item.type === 'poke') && (
                <View style={[styles.noteContainer, darkMode && styles.noteContainerNight]}>
                  {item.type === 'hug' && <Text style={{ fontSize: 18, marginBottom: 2 }}>🫂</Text>}
                  {item.type === 'poke' && <Text style={{ fontSize: 18, marginBottom: 2 }}>👉</Text>}
                  <Text style={[styles.noteText, darkMode && styles.noteTextNight]} numberOfLines={3}>
                    &ldquo;{item.content}&rdquo;
                  </Text>
                </View>
              )}

              {/* Footer info */}
              <View style={[styles.cardFooter, darkMode && { borderTopColor: 'rgba(255,255,255,0.1)' }]}>
                <Text style={[styles.cardFooterText, darkMode && styles.cardFooterTextNight]} numberOfLines={1}>
                  {item.senderName}
                </Text>
                <Text style={[styles.cardFooterText, darkMode && styles.cardFooterTextNight]}>
                  ♥ {item.likes || 1}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Detail Modal */}
      {activeItem && (
        <Modal
          visible={Boolean(activeItem)}
          transparent
          animationType="fade"
          onRequestClose={() => setActiveItem(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalBox, darkMode && styles.modalBoxNight]}>
              <View style={[styles.modalHeader, darkMode && { borderBottomColor: '#2B304C' }]}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeText}>{activeItem.type.toUpperCase()}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    retroAudio.playClick();
                    setActiveItem(null);
                  }}
                  style={styles.modalCloseBtn}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>✕</Text>
                </TouchableOpacity>
              </View>

              {activeItem.type === 'photo' && (
                <View style={styles.modalPhotoBox}>
                  <Image
                    source={{ uri: activeItem.content }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              )}

              {(activeItem.type === 'note' || activeItem.type === 'hug' || activeItem.type === 'poke') && (
                <View style={[styles.modalNoteBox, darkMode && styles.modalNoteBoxNight]}>
                  <Text style={[styles.modalNoteText, darkMode && styles.modalNoteTextNight]}>
                    &ldquo;{activeItem.content}&rdquo;
                  </Text>
                </View>
              )}

              {activeItem.type === 'doodle' && (
                <View style={styles.modalDoodleBox}>
                  {(() => {
                    try {
                      const grid: string[][] = JSON.parse(activeItem.content);
                      return (
                        <View style={styles.modalDoodleGrid}>
                          {grid.map((row, r) => (
                            <View key={r} style={{ flexDirection: 'row' }}>
                              {row.map((cell, c) => (
                                <View
                                  key={`${r}-${c}`}
                                  style={{
                                    backgroundColor: cell,
                                    width: 20,
                                    height: 20,
                                    borderWidth: 0.5,
                                    borderColor: 'rgba(0,0,0,0.06)',
                                  }}
                                />
                              ))}
                            </View>
                          ))}
                        </View>
                      );
                    } catch {
                      return <Text style={[styles.modalNoteText, darkMode && styles.modalNoteTextNight]}>✎ Pixel Doodle</Text>;
                    }
                  })()}
                </View>
              )}

              <View style={[styles.modalFooter, darkMode && { borderTopColor: '#2B304C' }]}>
                <View>
                  <Text style={[styles.modalAuthorText, darkMode && styles.modalAuthorTextNight]}>
                    Sent by {activeItem.senderName}
                  </Text>
                  <Text style={[styles.modalDateText, darkMode && styles.modalDateTextNight]}>
                    {activeItem.timestamp}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    retroAudio.playHug();
                    onAddReaction(activeItem.id);
                    setActiveItem({
                      ...activeItem,
                      likes: (activeItem.likes || 1) + 1,
                    });
                  }}
                  style={styles.likeBtn}
                >
                  <PixelHeart size={2} color="#FFFFFF" />
                  <Text style={styles.likeBtnText}>{activeItem.likes || 1}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 90,
    width: '100%',
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  countBadge: {
    backgroundColor: '#FFFDF9',
    borderWidth: 2,
    borderColor: '#1E1E24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  countText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(30,30,36,0.4)',
    backgroundColor: '#FAF7EE',
  },
  filterChipActive: {
    backgroundColor: '#FF85A1',
    borderColor: '#1E1E24',
  },
  filterChipText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFDF9',
    borderWidth: 2,
    borderColor: '#1E1E24',
    padding: 8,
    borderRadius: 8,
    position: 'relative',
  },
  tape: {
    position: 'absolute',
    top: -5,
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 8,
    backgroundColor: 'rgba(255, 209, 102, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(30,30,36,0.5)',
  },
  photoContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#E0D8C3',
    borderWidth: 1,
    borderColor: '#1E1E24',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  doodleContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: '#1E1E24',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 6,
  },
  doodleBox: {
    backgroundColor: '#1E1E24',
    padding: 2,
    borderRadius: 2,
  },
  noteContainer: {
    width: '100%',
    minHeight: 70,
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: '#1E1E24',
    borderRadius: 4,
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  noteText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#1E1E24',
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(30,30,36,0.2)',
    paddingTop: 4,
  },
  cardFooterText: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: 'rgba(30,30,36,0.7)',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFDF9',
    borderWidth: 3,
    borderColor: '#1E1E24',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1E1E24',
    paddingBottom: 8,
  },
  typeBadge: {
    backgroundColor: '#8EE4AF',
    borderWidth: 1,
    borderColor: '#1E1E24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  modalCloseBtn: {
    width: 26,
    height: 26,
    backgroundColor: '#FF85A1',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPhotoBox: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalNoteBox: {
    backgroundColor: '#FAF7EE',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modalNoteText: {
    fontFamily: 'monospace',
    fontSize: 16,
    color: '#1E1E24',
    textAlign: 'center',
  },
  modalDoodleBox: {
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDoodleGrid: {
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    padding: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: '#1E1E24',
    paddingTop: 8,
  },
  modalAuthorText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 10,
    color: '#1E1E24',
  },
  modalDateText: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: 'rgba(30,30,36,0.6)',
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF85A1',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  likeBtnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  titleNight: {
    color: '#FAF7EE',
  },
  subtitleNight: {
    color: '#8F96B2',
  },
  countBadgeNight: {
    backgroundColor: '#1E2238',
    borderColor: '#2B304C',
  },
  countTextNight: {
    color: '#FAF7EE',
  },
  filterChipNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  filterChipTextNight: {
    color: '#8F96B2',
  },
  cardNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  doodleContainerNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  noteContainerNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  noteTextNight: {
    color: '#FAF7EE',
  },
  cardFooterTextNight: {
    color: '#8F96B2',
  },
  modalBoxNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  modalNoteBoxNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  modalNoteTextNight: {
    color: '#FAF7EE',
  },
  modalAuthorTextNight: {
    color: '#FAF7EE',
  },
  modalDateTextNight: {
    color: '#8F96B2',
  },
});
