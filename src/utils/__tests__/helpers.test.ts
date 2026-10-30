import {
  calculateDaysTogether,
  calculateCountdown,
  areAnswersUnlocked,
  filterMemories,
  formatBatteryLevel,
  generatePairingCode,
  MemoryItem,
} from '../helpers';

describe('Bits & Us Helper Functions', () => {
  describe('calculateDaysTogether', () => {
    it('calculates days correctly between 2025-10-24 and 2026-10-24', () => {
      const fixedNow = new Date('2026-10-24T12:00:00Z');
      const days = calculateDaysTogether('2025-10-24', fixedNow);
      expect(days).toBe(365);
    });

    it('returns 0 for future dates', () => {
      const fixedNow = new Date('2026-10-24T12:00:00Z');
      const days = calculateDaysTogether('2026-12-25', fixedNow);
      expect(days).toBe(0);
    });

    it('handles invalid dates gracefully', () => {
      expect(calculateDaysTogether('invalid-date')).toBe(0);
    });
  });

  describe('calculateCountdown', () => {
    it('calculates remaining days, hours, minutes, seconds', () => {
      const now = new Date('2026-10-24T12:00:00Z');
      const target = '2026-10-26T14:30:15Z';
      const result = calculateCountdown(target, now);

      expect(result.isPassed).toBe(false);
      expect(result.days).toBe(2);
      expect(result.hours).toBe(2);
      expect(result.minutes).toBe(30);
      expect(result.seconds).toBe(15);
    });

    it('marks isPassed when target date is in the past', () => {
      const now = new Date('2026-10-24T12:00:00Z');
      const target = '2026-10-20T10:00:00Z';
      const result = calculateCountdown(target, now);

      expect(result.isPassed).toBe(true);
      expect(result.days).toBe(0);
      expect(result.seconds).toBe(0);
    });
  });

  describe('areAnswersUnlocked', () => {
    it('returns false when neither or only one partner has answered', () => {
      expect(areAnswersUnlocked('', '')).toBe(false);
      expect(areAnswersUnlocked('I loved our walk', '')).toBe(false);
      expect(areAnswersUnlocked(null, 'Star gazing')).toBe(false);
      expect(areAnswersUnlocked('   ', 'Stargazing')).toBe(false);
    });

    it('returns true only when both have answered', () => {
      expect(areAnswersUnlocked('Our rainy cafe date', 'When we baked cookies')).toBe(true);
    });
  });

  describe('filterMemories', () => {
    const mockMemories: MemoryItem[] = [
      { id: '1', type: 'photo', content: 'pic.jpg', timestamp: '1', sender: 'you', senderName: 'You' },
      { id: '2', type: 'note', content: 'Love you!', timestamp: '2', sender: 'partner', senderName: 'Juno' },
      { id: '3', type: 'doodle', content: '..grid..', timestamp: '3', sender: 'you', senderName: 'You' },
      { id: '4', type: 'hug', content: 'Hug sent', timestamp: '4', sender: 'partner', senderName: 'Juno' },
    ];

    it('returns all items when filter is "all"', () => {
      expect(filterMemories(mockMemories, 'all')).toHaveLength(4);
    });

    it('filters photos only', () => {
      const filtered = filterMemories(mockMemories, 'photos');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe('photo');
    });

    it('filters notes and interactions', () => {
      const filtered = filterMemories(mockMemories, 'notes');
      expect(filtered).toHaveLength(2);
    });

    it('filters doodles', () => {
      const filtered = filterMemories(mockMemories, 'doodles');
      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe('doodle');
    });
  });

  describe('formatBatteryLevel', () => {
    it('returns mint for > 50%', () => {
      const res = formatBatteryLevel(85);
      expect(res.color).toBe('mint');
      expect(res.isPulsing).toBe(false);
    });

    it('returns yellow for 20-50%', () => {
      const res = formatBatteryLevel(45);
      expect(res.color).toBe('yellow');
      expect(res.isPulsing).toBe(false);
    });

    it('returns red and pulsing for <= 20%', () => {
      const res = formatBatteryLevel(15);
      expect(res.color).toBe('red');
      expect(res.isPulsing).toBe(true);
    });
  });

  describe('generatePairingCode', () => {
    it('generates a code starting with BITS- followed by 4 digits', () => {
      const code = generatePairingCode();
      expect(code).toMatch(/^BITS-\d{4}$/);
    });
  });
});
