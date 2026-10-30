import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { calculateDaysTogether, calculateCountdown, areAnswersUnlocked } from '../../utils/helpers';
import { retroAudio } from '../../utils/audio';
import { PixelHeart } from '../pixel/PixelIcons';

interface CoupleHubTabProps {
  startDateStr: string;
  onUpdateStartDate: (date: string) => void;
  nextDateNightStr: string;
  onUpdateNextDateNight: (date: string) => void;
  userName: string;
  partnerName: string;
  userQuestionAnswer: string;
  partnerQuestionAnswer: string;
  onSaveUserAnswer: (ans: string) => void;
  onSimulatePartnerAnswer: (ans: string) => void;
  darkMode?: boolean;
}

export const CoupleHubTab: React.FC<CoupleHubTabProps> = ({
  startDateStr,
  onUpdateStartDate,
  nextDateNightStr,
  onUpdateNextDateNight,
  userName,
  partnerName,
  userQuestionAnswer,
  partnerQuestionAnswer,
  onSaveUserAnswer,
  onSimulatePartnerAnswer,
  darkMode = false,
}) => {
  const [countdown, setCountdown] = useState(calculateCountdown(nextDateNightStr));
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDateStr);
  const [tempDateNight, setTempDateNight] = useState(nextDateNightStr);

  const [myAnswerInput, setMyAnswerInput] = useState(userQuestionAnswer);
  const isUnlocked = areAnswersUnlocked(userQuestionAnswer, partnerQuestionAnswer);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateCountdown(nextDateNightStr));
    }, 1000);
    return () => clearInterval(timer);
  }, [nextDateNightStr]);

  const [prevUserAnswer, setPrevUserAnswer] = useState(userQuestionAnswer);
  if (userQuestionAnswer !== prevUserAnswer) {
    setPrevUserAnswer(userQuestionAnswer);
    setMyAnswerInput(userQuestionAnswer);
  }

  const [prevStartDate, setPrevStartDate] = useState(startDateStr);
  if (startDateStr !== prevStartDate) {
    setPrevStartDate(startDateStr);
    setTempStartDate(startDateStr);
  }

  const [prevDateNight, setPrevDateNight] = useState(nextDateNightStr);
  if (nextDateNightStr !== prevDateNight) {
    setPrevDateNight(nextDateNightStr);
    setTempDateNight(nextDateNightStr);
  }

  const daysTogether = calculateDaysTogether(startDateStr);

  const handleSaveDates = () => {
    retroAudio.playSuccess();
    onUpdateStartDate(tempStartDate);
    onUpdateNextDateNight(tempDateNight);
    setIsEditingDates(false);
  };

  const handleSealMyAnswer = () => {
    if (!myAnswerInput.trim()) return;
    retroAudio.playSuccess();
    onSaveUserAnswer(myAnswerInput.trim());
  };

  const handleSimulateJuno = () => {
    retroAudio.playHug();
    onSimulatePartnerAnswer("When we sat on the porch drinking hot cocoa while listening to the rain! ☕🌧️");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, darkMode && styles.titleNight]}>Couple Hub & Milestones</Text>
          <Text style={[styles.subtitle, darkMode && styles.subtitleNight]}>
            Cherishing our journey together, one bit at a time.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            retroAudio.playClick();
            setIsEditingDates(!isEditingDates);
          }}
          style={[styles.editDateBtn, darkMode && styles.editDateBtnNight]}
        >
          <Text style={[styles.editDateText, darkMode && styles.editDateTextNight]}>
            {isEditingDates ? 'Cancel' : 'Edit Dates ✎'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Dates Modal / Accordion */}
      {isEditingDates && (
        <View style={[styles.cardBox, darkMode && styles.cardBoxNight]}>
          <Text style={[styles.cardHeaderTitle, darkMode && styles.cardHeaderTitleNight]}>
            Edit Anniversary & Date Night
          </Text>
          <View style={{ gap: 4 }}>
            <Text style={[styles.inputLabel, darkMode && styles.inputLabelNight]}>Together Since (YYYY-MM-DD):</Text>
            <TextInput
              value={tempStartDate}
              onChangeText={setTempStartDate}
              style={[styles.textInput, darkMode && styles.textInputNight]}
            />
          </View>
          <View style={{ gap: 4 }}>
            <Text style={[styles.inputLabel, darkMode && styles.inputLabelNight]}>Next Date Night (YYYY-MM-DDTHH:MM):</Text>
            <TextInput
              value={tempDateNight}
              onChangeText={setTempDateNight}
              style={[styles.textInput, darkMode && styles.textInputNight]}
            />
          </View>
          <TouchableOpacity onPress={handleSaveDates} style={styles.saveDatesBtn}>
            <Text style={styles.saveDatesBtnText}>Save Dates ✓</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Days Together Counter Card */}
      <View style={[styles.daysCard, darkMode && styles.daysCardNight]}>
        <View style={{ gap: 4 }}>
          <Text style={[styles.daysCardLabel, darkMode && { color: '#8F96B2' }]}>DAYS TOGETHER</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Text style={[styles.daysCount, darkMode && styles.daysCountNight]}>{daysTogether}</Text>
            <Text style={styles.daysUnit}>cozy days</Text>
          </View>
          <Text style={[styles.daysSubtext, darkMode && styles.daysSubtextNight]}>
            Since {startDateStr} with {partnerName}
          </Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <PixelHeart size={4} color="#FF85A1" />
          <View style={[styles.foreverBadge, darkMode && { backgroundColor: '#20243B', borderColor: '#2B304C' }]}>
            <Text style={[styles.foreverText, darkMode && { color: '#FAF7EE' }]}>Forever</Text>
          </View>
        </View>
      </View>

      {/* Date Night Live Countdown Card */}
      <View style={[styles.cardBox, darkMode && styles.cardBoxNight]}>
        <View style={[styles.cardHeader, darkMode && { borderBottomColor: '#2B304C' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>🕯️</Text>
            <Text style={[styles.cardHeaderTitle, darkMode && styles.cardHeaderTitleNight]}>Next Date Night</Text>
          </View>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownBadgeText}>Countdown</Text>
          </View>
        </View>

        {countdown.isPassed ? (
          <View style={{ paddingVertical: 8, alignItems: 'center' }}>
            <Text style={styles.dateNightNowText}>🎉 It&apos;s Date Night Right Now!</Text>
          </View>
        ) : (
          <View style={styles.countdownRow}>
            {[
              { label: 'DAYS', val: countdown.days },
              { label: 'HRS', val: countdown.hours },
              { label: 'MINS', val: countdown.minutes },
              { label: 'SECS', val: countdown.seconds },
            ].map((unit) => (
              <View key={unit.label} style={[styles.countdownTile, darkMode && styles.countdownTileNight]}>
                <Text style={[styles.countdownVal, darkMode && styles.countdownValNight]}>
                  {String(unit.val).padStart(2, '0')}
                </Text>
                <Text style={[styles.countdownLabel, darkMode && styles.countdownLabelNight]}>{unit.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Daily Couple Question Card */}
      <View style={[styles.cardBox, darkMode && styles.cardBoxNight]}>
        <View style={[styles.cardHeader, darkMode && { borderBottomColor: '#2B304C' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>💌</Text>
            <Text style={[styles.cardHeaderTitle, darkMode && styles.cardHeaderTitleNight]}>Daily Couple Question</Text>
          </View>
          <View style={[styles.countdownBadge, { backgroundColor: '#8EE4AF' }]}>
            <Text style={styles.countdownBadgeText}>Sealed Game</Text>
          </View>
        </View>

        <View style={[styles.questionBox, darkMode && styles.questionBoxNight]}>
          <Text style={[styles.questionText, darkMode && styles.questionTextNight]}>
            &ldquo;What&apos;s one tiny moment with me you wish you could replay?&rdquo;
          </Text>
        </View>

        {isUnlocked ? (
          <View style={{ gap: 8 }}>
            <View style={[styles.unlockedHeader, darkMode && { backgroundColor: '#20243B' }]}>
              <Text style={styles.unlockedHeaderText}>🔓 UNLOCKED! REVEALED TOGETHER</Text>
            </View>

            <View style={[styles.answerCard, darkMode && styles.answerCardNight]}>
              <Text style={[styles.answerAuthor, darkMode && { color: '#8EE4AF' }]}>{userName}&apos;s Answer:</Text>
              <Text style={[styles.answerBody, darkMode && styles.answerBodyNight]}>&ldquo;{userQuestionAnswer}&rdquo;</Text>
            </View>

            <View style={[styles.answerCard, darkMode ? { backgroundColor: '#38222B', borderColor: '#FF85A1' } : { backgroundColor: '#FFE8EE' }]}>
              <Text style={[styles.answerAuthor, { color: '#FF85A1' }]}>{partnerName}&apos;s Answer:</Text>
              <Text style={[styles.answerBody, darkMode && styles.answerBodyNight]}>&ldquo;{partnerQuestionAnswer}&rdquo;</Text>
            </View>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={[styles.statusBox, darkMode && styles.statusBoxNight]}>
                <Text style={[styles.statusBoxName, darkMode && styles.statusBoxNameNight]}>{userName}</Text>
                <Text style={[styles.statusBoxStatus, { color: userQuestionAnswer ? '#5CDB95' : '#FF85A1' }]}>
                  {userQuestionAnswer ? '✓ Sealed' : '⌛ Not yet'}
                </Text>
              </View>
              <View style={[styles.statusBox, darkMode && styles.statusBoxNight]}>
                <Text style={[styles.statusBoxName, darkMode && styles.statusBoxNameNight]}>{partnerName}</Text>
                <Text style={[styles.statusBoxStatus, { color: partnerQuestionAnswer ? '#5CDB95' : '#FF85A1' }]}>
                  {partnerQuestionAnswer ? '✓ Sealed' : '⌛ Waiting...'}
                </Text>
              </View>
            </View>

            {!userQuestionAnswer ? (
              <View style={{ gap: 6 }}>
                <TextInput
                  multiline
                  numberOfLines={2}
                  maxLength={120}
                  value={myAnswerInput}
                  onChangeText={setMyAnswerInput}
                  placeholder="Type your secret answer here... (stays hidden until both answer)"
                  placeholderTextColor={darkMode ? '#707798' : '#888888'}
                  style={[styles.answerInput, darkMode && styles.answerInputNight]}
                />
                <TouchableOpacity
                  onPress={handleSealMyAnswer}
                  disabled={!myAnswerInput.trim()}
                  style={[styles.sealBtn, !myAnswerInput.trim() && { opacity: 0.4 }]}
                >
                  <Text style={styles.sealBtnText}>🔒 Seal My Answer</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={[styles.sealedMessage, darkMode && styles.sealedMessageNight]}>
                <Text style={[styles.sealedMessageText, darkMode && styles.sealedMessageTextNight]}>
                  🔒 Your answer is sealed! Waiting for {partnerName}...
                </Text>
              </View>
            )}

            {!partnerQuestionAnswer && (
              <TouchableOpacity onPress={handleSimulateJuno} style={styles.simulateBtn}>
                <Text style={styles.simulateBtnText}>✦ Simulate Juno&apos;s Reply (Demo)</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
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
  editDateBtn: {
    backgroundColor: '#FFFDF9',
    borderWidth: 2,
    borderColor: '#1E1E24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  editDateText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
  },
  cardBox: {
    backgroundColor: '#FFFDF9',
    borderWidth: 3,
    borderColor: '#1E1E24',
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderBottomColor: '#1E1E24',
    paddingBottom: 6,
  },
  cardHeaderTitle: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  inputLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: '#1E1E24',
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#1E1E24',
    backgroundColor: '#FFFFFF',
  },
  saveDatesBtn: {
    backgroundColor: '#8EE4AF',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  saveDatesBtnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#1E1E24',
  },
  daysCard: {
    backgroundColor: '#FAF7EE',
    borderWidth: 3,
    borderColor: '#1E1E24',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  daysCardLabel: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: 'rgba(30,30,36,0.7)',
  },
  daysCount: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 32,
    color: '#1E1E24',
  },
  daysUnit: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 12,
    color: '#FF85A1',
  },
  daysSubtext: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: 'rgba(30,30,36,0.8)',
  },
  foreverBadge: {
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: '#1E1E24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  foreverText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 7,
    color: '#1E1E24',
  },
  countdownBadge: {
    backgroundColor: '#FFD166',
    borderWidth: 1,
    borderColor: '#1E1E24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  countdownBadgeText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 7,
    color: '#1E1E24',
  },
  dateNightNowText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#FF85A1',
  },
  countdownRow: {
    flexDirection: 'row',
    gap: 8,
  },
  countdownTile: {
    flex: 1,
    backgroundColor: '#FAF7EE',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  countdownVal: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1E1E24',
  },
  countdownLabel: {
    fontFamily: 'monospace',
    fontSize: 7,
    color: 'rgba(30,30,36,0.6)',
    marginTop: 2,
  },
  questionBox: {
    backgroundColor: '#FAF7EE',
    borderWidth: 2,
    borderColor: '#1E1E24',
    padding: 10,
    borderRadius: 10,
  },
  questionText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 11,
    color: '#1E1E24',
    textAlign: 'center',
  },
  unlockedHeader: {
    backgroundColor: '#1E1E24',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  unlockedHeaderText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#8EE4AF',
  },
  answerCard: {
    backgroundColor: '#FAF7EE',
    borderWidth: 2,
    borderColor: '#1E1E24',
    padding: 10,
    borderRadius: 10,
    gap: 4,
  },
  answerAuthor: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: 'rgba(30,30,36,0.7)',
  },
  answerBody: {
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#1E1E24',
  },
  statusBox: {
    flex: 1,
    backgroundColor: '#FAF7EE',
    borderWidth: 1,
    borderColor: '#1E1E24',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusBoxName: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: '#1E1E24',
  },
  statusBoxStatus: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    marginTop: 2,
  },
  answerInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 8,
    padding: 8,
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#1E1E24',
  },
  sealBtn: {
    backgroundColor: '#FF85A1',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  sealBtnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#FFFFFF',
  },
  sealedMessage: {
    backgroundColor: '#FAF7EE',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  sealedMessageText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
  },
  simulateBtn: {
    backgroundColor: '#8EE4AF',
    borderWidth: 2,
    borderColor: '#1E1E24',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  simulateBtnText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 8,
    color: '#1E1E24',
  },
  titleNight: {
    color: '#FAF7EE',
  },
  subtitleNight: {
    color: '#8F96B2',
  },
  editDateBtnNight: {
    backgroundColor: '#1E2238',
    borderColor: '#2B304C',
  },
  editDateTextNight: {
    color: '#FAF7EE',
  },
  cardBoxNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  cardHeaderTitleNight: {
    color: '#FAF7EE',
  },
  inputLabelNight: {
    color: '#FAF7EE',
  },
  textInputNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
    color: '#FAF7EE',
  },
  daysCardNight: {
    backgroundColor: '#16192A',
    borderColor: '#2B304C',
  },
  daysCountNight: {
    color: '#FAF7EE',
  },
  daysSubtextNight: {
    color: '#8F96B2',
  },
  countdownTileNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  countdownValNight: {
    color: '#FAF7EE',
  },
  countdownLabelNight: {
    color: '#8F96B2',
  },
  questionBoxNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  questionTextNight: {
    color: '#FAF7EE',
  },
  answerCardNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  answerAuthorNight: {
    color: '#8EE4AF',
  },
  answerBodyNight: {
    color: '#FAF7EE',
  },
  statusBoxNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  statusBoxNameNight: {
    color: '#FAF7EE',
  },
  answerInputNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
    color: '#FAF7EE',
  },
  sealedMessageNight: {
    backgroundColor: '#101321',
    borderColor: '#2B304C',
  },
  sealedMessageTextNight: {
    color: '#FAF7EE',
  },
});
