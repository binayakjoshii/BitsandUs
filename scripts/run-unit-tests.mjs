import {
  calculateDaysTogether,
  calculateCountdown,
  areAnswersUnlocked,
  filterMemories,
  formatBatteryLevel,
  generatePairingCode,
} from '../src/utils/helpers.ts';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ ${message}`);
  }
}

console.log('Testing Helper Functions:');

// Test calculateDaysTogether
const fixedNow = new Date('2026-10-24T12:00:00Z');
assert(calculateDaysTogether('2025-10-24', fixedNow) === 365, 'calculateDaysTogether gives 365 days');
assert(calculateDaysTogether('2026-12-25', fixedNow) === 0, 'calculateDaysTogether returns 0 for future date');
assert(calculateDaysTogether('invalid') === 0, 'calculateDaysTogether handles invalid dates');

// Test calculateCountdown
const target = '2026-10-26T14:30:15Z';
const cd = calculateCountdown(target, fixedNow);
assert(cd.isPassed === false, 'calculateCountdown isPassed is false');
assert(cd.days === 2 && cd.hours === 2 && cd.minutes === 30 && cd.seconds === 15, 'calculateCountdown matches days/hours/mins/secs');

const past = calculateCountdown('2026-10-20T10:00:00Z', fixedNow);
assert(past.isPassed === true && past.days === 0, 'calculateCountdown marks past date as passed');

// Test areAnswersUnlocked
assert(areAnswersUnlocked('answer 1', 'answer 2') === true, 'areAnswersUnlocked returns true when both answer');
assert(areAnswersUnlocked('answer 1', '') === false, 'areAnswersUnlocked returns false when partner empty');
assert(areAnswersUnlocked(null, 'answer 2') === false, 'areAnswersUnlocked returns false when user null');

// Test formatBatteryLevel
const batHigh = formatBatteryLevel(85);
assert(batHigh.color === 'mint' && !batHigh.isPulsing, 'battery > 50% is mint and not pulsing');
const batMid = formatBatteryLevel(35);
assert(batMid.color === 'yellow' && !batMid.isPulsing, 'battery 20-50% is yellow');
const batLow = formatBatteryLevel(10);
assert(batLow.color === 'red' && batLow.isPulsing, 'battery <= 20% is red and pulsing');

// Test generatePairingCode
const code = generatePairingCode();
assert(/^BITS-\d{4}$/.test(code), 'generatePairingCode generates BITS-XXXX');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
