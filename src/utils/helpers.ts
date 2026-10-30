/**
 * Pure helper functions for Bits & Us app
 */

export interface MemoryItem {
  id: string;
  type: 'photo' | 'note' | 'doodle' | 'hug' | 'poke' | 'mood';
  title?: string;
  content: string; // text note, image URL / base64, or doodle matrix
  timestamp: string;
  sender: 'you' | 'partner';
  senderName: string;
  rotation?: number; // deg for scrapbook Polaroid angle
  tag?: string;
  likes?: number;
}

/**
 * Calculates total days together given a start date string (YYYY-MM-DD)
 */
export function calculateDaysTogether(startDateStr: string, now: Date = new Date()): number {
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return 0;
  
  // Set times to midnight UTC to compare full calendar days accurately
  const startUtc = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const nowUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffMs = nowUtc - startUtc;
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

/**
 * Calculates live countdown to the next date night
 */
export function calculateCountdown(targetDateStr: string, now: Date = new Date()): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPassed: boolean;
  totalSeconds: number;
} {
  const target = new Date(targetDateStr);
  if (isNaN(target.getTime())) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true, totalSeconds: 0 };
  }
  
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true, totalSeconds: 0 };
  }
  
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return {
    days,
    hours,
    minutes,
    seconds,
    isPassed: false,
    totalSeconds,
  };
}

/**
 * Checks if both answers are sealed and can now be unlocked
 */
export function areAnswersUnlocked(
  userAnswer: string | null | undefined,
  partnerAnswer: string | null | undefined
): boolean {
  const u = (userAnswer || '').trim();
  const p = (partnerAnswer || '').trim();
  return u.length > 0 && p.length > 0;
}

/**
 * Filters memory timeline items by category
 */
export function filterMemories(
  memories: MemoryItem[],
  filter: 'all' | 'photos' | 'notes' | 'doodles'
): MemoryItem[] {
  if (filter === 'all') return memories;
  if (filter === 'photos') return memories.filter((m) => m.type === 'photo');
  if (filter === 'notes') return memories.filter((m) => m.type === 'note' || m.type === 'hug' || m.type === 'poke');
  if (filter === 'doodles') return memories.filter((m) => m.type === 'doodle');
  return memories;
}

/**
 * Formats battery level according to retro game status guidelines:
 * - mint above 50%
 * - yellow at 20-50%
 * - red at 20% or below with pulsing heart
 */
export function formatBatteryLevel(level: number): {
  percent: number;
  segments: number; // 0 to 10
  color: 'mint' | 'yellow' | 'red';
  colorHex: string;
  isPulsing: boolean;
  statusText: string;
} {
  const percent = Math.min(100, Math.max(0, Math.round(level)));
  const segments = Math.round((percent / 100) * 10);
  
  if (percent > 50) {
    return {
      percent,
      segments,
      color: 'mint',
      colorHex: '#8EE4AF',
      isPulsing: false,
      statusText: 'Charged & Happy',
    };
  } else if (percent > 20) {
    return {
      percent,
      segments,
      color: 'yellow',
      colorHex: '#FFD166',
      isPulsing: false,
      statusText: 'Needs a Hug Soon',
    };
  } else {
    return {
      percent,
      segments,
      color: 'red',
      colorHex: '#FF5A79',
      isPulsing: true,
      statusText: 'Low Battery! Send Love',
    };
  }
}

/**
 * Generates an authentic retro pairing code like BITS-4982
 */
export function generatePairingCode(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `BITS-${num}`;
}
