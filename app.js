/**
 * RSAI ExamMaster - Interactive Examination & Diagnostic System
 * Prepared for Weeks 1 - 12 Exam Preparation
 */

// -------------------------------------------------------------
// Global Application State & Storage
// -------------------------------------------------------------
const STORAGE_KEYS = {
  SEEN: 'rsai_seen_question_ids',
  MASTERED: 'rsai_mastered_question_ids',
  WRONG: 'rsai_wrong_question_ids',
  HISTORY: 'rsai_exam_history'
};

const appState = {
  allQuestions: window.ALL_QUESTIONS || [],
  selectedWeeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  currentMode: 'unseen', // 'unseen', 'weakness', 'random', 'all'
  questionCount: 20,
  isTimerEnabled: true,
  isExamMode: true,

  // Active Quiz State
  activeQuiz: {
    questions: [],
    currentIndex: 0,
    userAnswers: {},     // qId -> array of option keys or string for numerical
    flagged: new Set(),
    startTime: null,
    endTime: null,
    timerSeconds: 0,
    timerInterval: null
  },

  // Last completed quiz report
  lastReport: null,

  // Study view state
  studySearchTerm: '',
  studySelectedWeek: 'all',
  studyShowSolutions: false
};

// -------------------------------------------------------------
// LocalStorage Helpers
// -------------------------------------------------------------
function getStorageSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

function saveStorageSet(key, setObj) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(setObj)));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

function getExamHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveExamHistory(historyList) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyList));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// -------------------------------------------------------------
// Initialization & Pool Tracking
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  if (!appState.allQuestions || appState.allQuestions.length === 0) {
    console.warn("ALL_QUESTIONS data not yet ready or empty.");
  }
  
  renderWeekSelector();
  updatePoolStats();
  renderHistoryView();
  initStudyView();
  initKeyboardShortcuts();
});

// Render the 12 Week Selector Pills
function renderWeekSelector() {
  const container = document.getElementById('weeks-selector-grid');
  if (!container) return;

  const seenSet = getStorageSet(STORAGE_KEYS.SEEN);
  let html = '';

  for (let w = 1; w <= 12; w++) {
    const weekQuestions = appState.allQuestions.filter(q => q.week === w);
    const seenInWeek = weekQuestions.filter(q => seenSet.has(q.id)).length;
    const isSelected = appState.selectedWeeks.includes(w);

    html += `
      <div class="week-item ${isSelected ? 'selected' : ''}" id="week-pill-${w}" onclick="toggleWeek(${w})">
        <div class="week-item-header">
          <span class="week-name">Week ${w}</span>
          <input type="checkbox" class="week-checkbox" ${isSelected ? 'checked' : ''} onclick="event.stopPropagation(); toggleWeek(${w})">
        </div>
        <div class="week-count">${weekQuestions.length} Questions (${seenInWeek} seen)</div>
      </div>
    `;
  }
  container.innerHTML = html;
}

function toggleWeek(w) {
  if (appState.selectedWeeks.includes(w)) {
    appState.selectedWeeks = appState.selectedWeeks.filter(x => x !== w);
  } else {
    appState.selectedWeeks.push(w);
    appState.selectedWeeks.sort((a, b) => a - b);
  }
  renderWeekSelector();
  updateAvailableCountBadge();
}

function toggleAllWeeks(selectAll) {
  if (selectAll) {
    appState.selectedWeeks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  } else {
    appState.selectedWeeks = [];
  }
  renderWeekSelector();
  updateAvailableCountBadge();
}

// Update the Top Readiness and Pool Stats Cards
function updatePoolStats() {
  const total = appState.allQuestions.length;
  const seenSet = getStorageSet(STORAGE_KEYS.SEEN);
  const masteredSet = getStorageSet(STORAGE_KEYS.MASTERED);
  const wrongSet = getStorageSet(STORAGE_KEYS.WRONG);

  const seenCount = seenSet.size;
  const unseenCount = Math.max(0, total - seenCount);
  const masteredCount = masteredSet.size;
  const wrongCount = wrongSet.size;

  const statTotal = document.getElementById('stat-total-qs');
  const statUnseen = document.getElementById('stat-unseen-qs');
  const statMastered = document.getElementById('stat-mastered-qs');
  const statWrong = document.getElementById('stat-wrong-qs');

  if (statTotal) statTotal.textContent = total;
  if (statUnseen) statUnseen.textContent = unseenCount;
  if (statMastered) statMastered.textContent = masteredCount;
  if (statWrong) statWrong.textContent = wrongCount;

  // Progress bars
  const barUnseen = document.getElementById('bar-unseen');
  const barMastered = document.getElementById('bar-mastered');
  const barWrong = document.getElementById('bar-wrong');

  if (barUnseen) barUnseen.style.width = `${(unseenCount / total) * 100}%`;
  if (barMastered) barMastered.style.width = `${(masteredCount / total) * 100}%`;
  if (barWrong) barWrong.style.width = `${(wrongCount / total) * 100}%`;

  updateAvailableCountBadge();
}

function updateAvailableCountBadge() {
  const badge = document.getElementById('pool-available-badge');
  if (!badge) return;

  const pool = getCandidateQuestions(appState.currentMode, appState.selectedWeeks);
  badge.textContent = `${pool.length} Available in Scope`;
}

// Reset Pool History if user wants a clean slate
function resetPoolHistory() {
  if (confirm("Reset your question history? This will clear all seen/mastered/mistake records and treat all 141 questions as fresh.")) {
    localStorage.removeItem(STORAGE_KEYS.SEEN);
    localStorage.removeItem(STORAGE_KEYS.MASTERED);
    localStorage.removeItem(STORAGE_KEYS.WRONG);
    updatePoolStats();
    renderWeekSelector();
    alert("Question history has been reset! All 141 questions are now fresh.");
  }
}

// -------------------------------------------------------------
// Mode and Count Selection
// -------------------------------------------------------------
function selectMode(mode) {
  appState.currentMode = mode;
  document.querySelectorAll('.mode-option').forEach(el => {
    if (el.getAttribute('data-mode') === mode) {
      el.classList.add('selected');
    } else {
      el.classList.remove('selected');
    }
  });
  updateAvailableCountBadge();
}

function selectCount(count) {
  appState.questionCount = count;
  document.querySelectorAll('#count-pills .pill-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  event.target.classList.add('selected');
}

// Filter candidate questions based on mode and selected weeks
function getCandidateQuestions(mode, weeks) {
  // First filter by selected weeks
  const weekFiltered = appState.allQuestions.filter(q => weeks.includes(q.week));
  const seenSet = getStorageSet(STORAGE_KEYS.SEEN);
  const wrongSet = getStorageSet(STORAGE_KEYS.WRONG);

  if (mode === 'unseen') {
    const unseen = weekFiltered.filter(q => !seenSet.has(q.id));
    // If all questions in selected weeks were seen, fallback to all so user isn't stuck
    return unseen.length > 0 ? unseen : weekFiltered;
  } else if (mode === 'weakness') {
    const weak = weekFiltered.filter(q => wrongSet.has(q.id));
    return weak.length > 0 ? weak : weekFiltered;
  } else {
    // random or all
    return weekFiltered;
  }
}

// Shuffle array using Fisher-Yates
function shuffleArray(arr) {
  const array = [...arr];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// -------------------------------------------------------------
// Starting a Quiz (Smart Randomized Selection)
// -------------------------------------------------------------
function startQuiz() {
  if (appState.selectedWeeks.length === 0) {
    alert("Please select at least one week (1–12) to include in your quiz!");
    return;
  }

  const pool = getCandidateQuestions(appState.currentMode, appState.selectedWeeks);

  if (pool.length === 0) {
    alert("No questions found matching your criteria. Try selecting more weeks or resetting history.");
    return;
  }

  // Shuffle pool for true randomness
  const shuffled = shuffleArray(pool);

  let targetCount = appState.questionCount;
  if (targetCount === 'max' || appState.currentMode === 'all') {
    targetCount = shuffled.length;
  } else {
    targetCount = Math.min(Number(targetCount), shuffled.length);
  }

  const chosenQuestions = shuffled.slice(0, targetCount);

  // Settings
  const timerToggle = document.getElementById('setting-timer');
  const examToggle = document.getElementById('setting-exam-mode');
  appState.isTimerEnabled = timerToggle ? timerToggle.checked : true;
  appState.isExamMode = examToggle ? examToggle.checked : true;

  // Initialize active quiz state
  appState.activeQuiz = {
    questions: chosenQuestions,
    currentIndex: 0,
    userAnswers: {},
    flagged: new Set(),
    startTime: Date.now(),
    endTime: null,
    timerSeconds: chosenQuestions.length * 60, // 60s per question
    timerInterval: null
  };

  // Start timer if enabled
  clearInterval(appState.activeQuiz.timerInterval);
  if (appState.isTimerEnabled) {
    document.getElementById('quiz-timer-box').style.display = 'flex';
    updateTimerDisplay();
    appState.activeQuiz.timerInterval = setInterval(() => {
      appState.activeQuiz.timerSeconds--;
      updateTimerDisplay();
      if (appState.activeQuiz.timerSeconds <= 0) {
        clearInterval(appState.activeQuiz.timerInterval);
        alert("⏰ Time is up! Submitting exam automatically...");
        submitQuiz();
      }
    }, 1000);
  } else {
    document.getElementById('quiz-timer-box').style.display = 'none';
  }

  // Switch to quiz view
  switchView('quiz');
  renderCurrentQuestion();
}

function updateTimerDisplay() {
  const timerText = document.getElementById('quiz-timer-text');
  const timerBox = document.getElementById('quiz-timer-box');
  if (!timerText) return;

  const secs = appState.activeQuiz.timerSeconds;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  timerText.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  if (secs <= 60) {
    timerBox.classList.add('timer-warning');
  } else {
    timerBox.classList.remove('timer-warning');
  }
}

// -------------------------------------------------------------
// Rendering Active Question
// -------------------------------------------------------------
function renderCurrentQuestion() {
  const quiz = appState.activeQuiz;
  const q = quiz.questions[quiz.currentIndex];
  if (!q) return;

  // Progress indicators
  const currentNum = quiz.currentIndex + 1;
  const totalNum = quiz.questions.length;
  const progressPct = ((currentNum) / totalNum) * 100;

  document.getElementById('quiz-progress-text').textContent = `${currentNum}/${totalNum}`;
  document.getElementById('quiz-progress-bar').style.width = `${progressPct}%`;

  // Badges
  document.getElementById('quiz-badge-week').textContent = `Week ${q.week} · Q${q.q_number}`;
  
  const typeBadge = document.getElementById('quiz-badge-type');
  if (q.is_numerical) {
    typeBadge.textContent = 'Numerical Answer';
  } else if (q.is_multiple_choice) {
    typeBadge.textContent = 'Multi-Select (Choose all that apply)';
  } else {
    typeBadge.textContent = 'Single Choice';
  }

  const flaggedBadge = document.getElementById('quiz-badge-flagged');
  const flagBtn = document.getElementById('btn-flag-q');
  const isFlagged = quiz.flagged.has(q.id);
  if (flaggedBadge) flaggedBadge.style.display = isFlagged ? 'inline-flex' : 'none';
  if (flagBtn) {
    if (isFlagged) {
      flagBtn.classList.add('active');
      flagBtn.innerHTML = '🚩 Flagged';
    } else {
      flagBtn.classList.remove('active');
      flagBtn.innerHTML = '🚩 Flag';
    }
  }

  // Question Prompt
  document.getElementById('question-text').textContent = `${currentNum}. ${q.question}`;

  // Image Display (e.g. Week 8 Q8)
  const imgContainer = document.getElementById('question-image-container');
  const imgElement = document.getElementById('question-image');
  if (q.image) {
    imgElement.src = q.image;
    imgContainer.style.display = 'flex';
  } else {
    imgContainer.style.display = 'none';
  }

  // Options vs Numerical
  const optionsContainer = document.getElementById('options-container');
  const numericalContainer = document.getElementById('numerical-container');
  const numericalInput = document.getElementById('numerical-input');
  const inQuizExp = document.getElementById('in-quiz-explanation');
  inQuizExp.style.display = 'none';

  const userPick = quiz.userAnswers[q.id] || [];

  if (q.is_numerical) {
    optionsContainer.style.display = 'none';
    numericalContainer.style.display = 'flex';
    numericalInput.value = userPick.length ? userPick[0] : '';
    numericalInput.focus();
  } else {
    optionsContainer.style.display = 'flex';
    numericalContainer.style.display = 'none';

    let optionsHtml = '';
    const optionKeys = ['A', 'B', 'C', 'D', 'E'];

    q.options.forEach((opt, idx) => {
      const isSelected = userPick.includes(opt.id);
      const letter = optionKeys[idx] || opt.id.toUpperCase();

      optionsHtml += `
        <div class="option-item ${isSelected ? 'selected' : ''}" onclick="handleOptionSelect('${opt.id}')">
          <div class="option-key">${letter}</div>
          <div class="option-text">${opt.text}</div>
        </div>
      `;
    });
    optionsContainer.innerHTML = optionsHtml;
  }

  // If Practice Mode (Exam Mode is OFF), reveal answer if already answered
  if (!appState.isExamMode && userPick.length > 0) {
    showInQuizExplanation(q, userPick);
  }

  // Navigation button states
  document.getElementById('btn-prev-q').disabled = (quiz.currentIndex === 0);
  const nextBtn = document.getElementById('btn-next-q');
  if (quiz.currentIndex === totalNum - 1) {
    nextBtn.style.display = 'none';
  } else {
    nextBtn.style.display = 'inline-flex';
  }

  // Update Navigator Grid if opened
  renderNavGrid();
}

// Handle Option Clicks
function handleOptionSelect(optId) {
  const quiz = appState.activeQuiz;
  const q = quiz.questions[quiz.currentIndex];
  if (!q) return;

  if (q.is_multiple_choice) {
    // Multi select
    let current = quiz.userAnswers[q.id] || [];
    if (current.includes(optId)) {
      current = current.filter(x => x !== optId);
    } else {
      current.push(optId);
    }
    quiz.userAnswers[q.id] = current;
  } else {
    // Single select
    quiz.userAnswers[q.id] = [optId];
  }

  playSubtleSound('select');
  renderCurrentQuestion();
}

function handleNumericalInput(val) {
  const quiz = appState.activeQuiz;
  const q = quiz.questions[quiz.currentIndex];
  if (!q) return;
  quiz.userAnswers[q.id] = val.trim() ? [val.trim()] : [];
}

function toggleCurrentFlag() {
  const quiz = appState.activeQuiz;
  const q = quiz.questions[quiz.currentIndex];
  if (!q) return;

  if (quiz.flagged.has(q.id)) {
    quiz.flagged.delete(q.id);
  } else {
    quiz.flagged.add(q.id);
  }
  renderCurrentQuestion();
}

function navigateQuestion(delta) {
  const quiz = appState.activeQuiz;
  const newIndex = quiz.currentIndex + delta;
  if (newIndex >= 0 && newIndex < quiz.questions.length) {
    quiz.currentIndex = newIndex;
    renderCurrentQuestion();
  }
}

// In-quiz solution reveal (Practice mode only)
function showInQuizExplanation(q, userPick) {
  const panel = document.getElementById('in-quiz-explanation');
  const title = document.getElementById('in-quiz-exp-title');
  const body = document.getElementById('in-quiz-exp-body');

  let isCorrect = false;
  if (q.is_numerical) {
    isCorrect = (userPick[0] === q.numerical_answer);
  } else {
    const correctSorted = [...q.correct_answers].sort().join(',');
    const userSorted = [...userPick].sort().join(',');
    isCorrect = (correctSorted === userSorted);
  }

  panel.className = `explanation-panel ${isCorrect ? 'correct' : 'incorrect'}`;
  title.innerHTML = isCorrect ? '✅ Correct Answer!' : '❌ Incorrect';
  body.innerHTML = `<strong>Official Solution:</strong> ${q.explanation || 'No detailed note provided.'}`;
  panel.style.display = 'block';
}

// -------------------------------------------------------------
// Question Navigation Modal Grid
// -------------------------------------------------------------
function toggleNavGrid(show) {
  const modal = document.getElementById('grid-modal');
  if (modal) {
    if (show) {
      renderNavGrid();
      modal.classList.add('active');
    } else {
      modal.classList.remove('active');
    }
  }
}

function renderNavGrid() {
  const container = document.getElementById('modal-nav-grid');
  if (!container) return;

  const quiz = appState.activeQuiz;
  let html = '';

  quiz.questions.forEach((q, idx) => {
    const isCurrent = (idx === quiz.currentIndex);
    const hasAnswered = quiz.userAnswers[q.id] && quiz.userAnswers[q.id].length > 0;
    const isFlagged = quiz.flagged.has(q.id);

    let classes = ['q-nav-dot'];
    if (isCurrent) classes.push('current');
    if (hasAnswered) classes.push('answered');
    if (isFlagged) classes.push('flagged');

    html += `
      <div class="${classes.join(' ')}" onclick="jumpToQuestion(${idx})">
        ${idx + 1}
      </div>
    `;
  });

  container.innerHTML = html;
}

function jumpToQuestion(idx) {
  appState.activeQuiz.currentIndex = idx;
  toggleNavGrid(false);
  renderCurrentQuestion();
}

// -------------------------------------------------------------
// Submitting Quiz & Generating Diagnostic Report
// (THE USER'S CORE REQUIREMENT)
// -------------------------------------------------------------
function confirmSubmitQuiz() {
  const quiz = appState.activeQuiz;
  const answeredCount = Object.keys(quiz.userAnswers).filter(k => quiz.userAnswers[k] && quiz.userAnswers[k].length > 0).length;
  const total = quiz.questions.length;

  if (answeredCount < total) {
    const remaining = total - answeredCount;
    if (!confirm(`You still have ${remaining} unanswered question(s)! Are you sure you want to finish and generate your report?`)) {
      return;
    }
  }
  submitQuiz();
}

function submitQuiz() {
  clearInterval(appState.activeQuiz.timerInterval);
  appState.activeQuiz.endTime = Date.now();

  const quiz = appState.activeQuiz;
  const totalQuestions = quiz.questions.length;
  let score = 0;

  // Track sets
  const seenSet = getStorageSet(STORAGE_KEYS.SEEN);
  const masteredSet = getStorageSet(STORAGE_KEYS.MASTERED);
  const wrongSet = getStorageSet(STORAGE_KEYS.WRONG);

  // Week by week aggregator
  const weekStats = {};
  for (let w = 1; w <= 12; w++) {
    weekStats[w] = { week: w, asked: 0, correct: 0, incorrect: 0, questions: [] };
  }

  const reviewQuestions = [];

  quiz.questions.forEach(q => {
    seenSet.add(q.id); // mark as seen so future quizzes can offer brand new questions!

    const userPick = quiz.userAnswers[q.id] || [];
    let isCorrect = false;

    if (q.is_numerical) {
      isCorrect = (userPick.length > 0 && userPick[0].trim().toLowerCase() === q.numerical_answer.trim().toLowerCase());
    } else {
      const correctSorted = [...q.correct_answers].sort().join(',');
      const userSorted = [...userPick].sort().join(',');
      isCorrect = (correctSorted.length > 0 && correctSorted === userSorted);
    }

    if (isCorrect) {
      score++;
      masteredSet.add(q.id);
      wrongSet.delete(q.id);
    } else {
      wrongSet.add(q.id);
      masteredSet.delete(q.id);
    }

    // Add to week breakdown
    weekStats[q.week].asked++;
    if (isCorrect) {
      weekStats[q.week].correct++;
    } else {
      weekStats[q.week].incorrect++;
    }

    weekStats[q.week].questions.push({
      question: q,
      userPick: userPick,
      isCorrect: isCorrect
    });

    reviewQuestions.push({
      question: q,
      userPick: userPick,
      isCorrect: isCorrect,
      isFlagged: quiz.flagged.has(q.id)
    });
  });

  // Save updated knowledge tracking to storage
  saveStorageSet(STORAGE_KEYS.SEEN, seenSet);
  saveStorageSet(STORAGE_KEYS.MASTERED, masteredSet);
  saveStorageSet(STORAGE_KEYS.WRONG, wrongSet);

  // Time calculation
  const timeElapsedMs = appState.activeQuiz.endTime - appState.activeQuiz.startTime;
  const timeElapsedSec = Math.floor(timeElapsedMs / 1000);
  const m = Math.floor(timeElapsedSec / 60);
  const s = timeElapsedSec % 60;
  const timeFormatted = `${m}m ${s}s`;

  const accuracyPct = Math.round((score / totalQuestions) * 100);

  // Filter only weeks that had questions asked
  const activeWeeks = Object.values(weekStats).filter(w => w.asked > 0);
  activeWeeks.forEach(w => {
    w.accuracy = Math.round((w.correct / w.asked) * 100);
  });

  // Sort weeks for the User's core report requirement:
  // "which week gain more marks user and which week need more prepation"
  const sortedByAccuracyDesc = [...activeWeeks].sort((a, b) => b.accuracy - a.accuracy || b.correct - a.correct);
  
  // Strongest weeks: high accuracy (>= 75% or top 3)
  const strongWeeks = sortedByAccuracyDesc.filter(w => w.accuracy >= 75);
  // If none >= 75%, take the top week
  const finalStrongWeeks = strongWeeks.length > 0 ? strongWeeks : [sortedByAccuracyDesc[0]];

  // Weakest weeks: low accuracy (< 75% or with wrong answers)
  const sortedByAccuracyAsc = [...activeWeeks].sort((a, b) => a.accuracy - b.accuracy || a.correct - b.correct);
  const weakWeeks = sortedByAccuracyAsc.filter(w => w.accuracy < 75 || w.incorrect > 0);

  const report = {
    id: 'attempt_' + Date.now(),
    date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString(),
    score: score,
    total: totalQuestions,
    accuracy: accuracyPct,
    timeTaken: timeFormatted,
    activeWeeks: activeWeeks,
    strongWeeks: finalStrongWeeks,
    weakWeeks: weakWeeks,
    reviewQuestions: reviewQuestions
  };

  appState.lastReport = report;

  // Save in history
  const history = getExamHistory();
  history.unshift({
    id: report.id,
    date: report.date,
    score: score,
    total: totalQuestions,
    accuracy: accuracyPct,
    timeTaken: timeFormatted
  });
  saveExamHistory(history);

  // Trigger celebration confetti if score is high!
  if (accuracyPct >= 80) {
    triggerConfetti();
    playSubtleSound('win');
  } else {
    playSubtleSound('finish');
  }

  // Render and show report
  renderDiagnosticReport(report);
  updatePoolStats();
  renderHistoryView();
  switchView('report');
}

// -------------------------------------------------------------
// Rendering the Diagnostic Report
// -------------------------------------------------------------
function renderDiagnosticReport(rep) {
  // Score & Verdict
  document.getElementById('report-score-display').textContent = `${rep.score} / ${rep.total}`;
  document.getElementById('report-accuracy-text').textContent = `${rep.accuracy}%`;
  document.getElementById('report-correct-text').textContent = rep.score;
  document.getElementById('report-incorrect-text').textContent = (rep.total - rep.score);
  document.getElementById('report-time-text').textContent = rep.timeTaken;

  const mistakesBtn = document.getElementById('btn-retest-mistakes');
  const mistakesCount = rep.total - rep.score;
  document.getElementById('report-mistakes-count').textContent = mistakesCount;
  if (mistakesBtn) {
    mistakesBtn.style.display = (mistakesCount > 0) ? 'inline-flex' : 'none';
  }

  const badge = document.getElementById('report-verdict-badge');
  const verdictText = document.getElementById('report-verdict-text');

  if (rep.accuracy >= 85) {
    badge.className = 'report-verdict-badge verdict-mastery';
    badge.textContent = '🌟 Exam Ready! High Mastery';
    verdictText.textContent = 'Phenomenal work! You have strong command across the Responsible & Safe AI material for tomorrow.';
  } else if (rep.accuracy >= 65) {
    badge.className = 'report-verdict-badge verdict-average';
    badge.textContent = '👍 Solid Progress · Minor Gaps';
    verdictText.textContent = 'Good foundation! Review the recommended weak weeks below to achieve top marks tomorrow.';
  } else {
    badge.className = 'report-verdict-badge verdict-critical';
    badge.textContent = '⚠️ Needs Focused Revision';
    verdictText.textContent = 'Target the weak weeks highlighted below and retry with fresh questions to solidify concepts!';
  }

  // 1. POPULATE STRONGEST WEEKS (Where user gained more marks)
  const strongContainer = document.getElementById('report-strong-list');
  let strongHtml = '';
  if (rep.strongWeeks.length === 0) {
    strongHtml = `<div style="color: var(--text-muted); font-size: 0.9rem;">No weeks with high mastery yet. Keep practicing!</div>`;
  } else {
    rep.strongWeeks.forEach(w => {
      strongHtml += `
        <div class="diag-week-pill pill-strong-item">
          <div>
            <strong>Week ${w.week}</strong>: ${getWeekTopic(w.week)}
          </div>
          <div class="diag-score-badge" style="color: #34d399;">
            ${w.correct}/${w.asked} (${w.accuracy}%)
          </div>
        </div>
      `;
    });
  }
  strongContainer.innerHTML = strongHtml;

  // 2. POPULATE NEEDS MORE PREPARATION (Weeks needing study)
  const weakContainer = document.getElementById('report-weak-list');
  const practiceWeakBtn = document.getElementById('btn-practice-weak-weeks');
  let weakHtml = '';

  if (rep.weakWeeks.length === 0) {
    weakHtml = `<div style="color: #34d399; font-size: 0.9rem; padding: 10px;">🎉 Perfect score! No weak weeks detected in this test session.</div>`;
    if (practiceWeakBtn) practiceWeakBtn.style.display = 'none';
  } else {
    if (practiceWeakBtn) practiceWeakBtn.style.display = 'block';
    rep.weakWeeks.forEach(w => {
      weakHtml += `
        <div class="diag-week-pill pill-weak-item">
          <div>
            <strong>Week ${w.week}</strong>: ${getWeekTopic(w.week)}
            <div style="font-size: 0.75rem; color: #fca5a5; margin-top: 2px;">
              Missed ${w.incorrect} question(s)
            </div>
          </div>
          <div class="diag-score-badge" style="color: #f87171;">
            ${w.correct}/${w.asked} (${w.accuracy}%)
          </div>
        </div>
      `;
    });
  }
  weakContainer.innerHTML = weakHtml;

  // 3. FULL WEEK-BY-WEEK VISUAL PROGRESS TABLE
  const breakdownContainer = document.getElementById('report-breakdown-rows');
  let breakdownHtml = '';

  rep.activeWeeks.sort((a, b) => a.week - b.week).forEach(w => {
    let barColor = '#10b981';
    let statusBadge = '<span class="status-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399;">Mastered</span>';

    if (w.accuracy < 50) {
      barColor = '#ef4444';
      statusBadge = '<span class="status-badge" style="background: rgba(239, 68, 68, 0.15); color: #f87171;">Critical</span>';
    } else if (w.accuracy < 80) {
      barColor = '#f59e0b';
      statusBadge = '<span class="status-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24;">Review</span>';
    }

    breakdownHtml += `
      <div class="breakdown-row">
        <div style="font-weight: 700;">Week ${w.week}</div>
        <div class="bar-container">
          <div class="bar-fill" style="width: ${w.accuracy}%; background: ${barColor};"></div>
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-weight: 700;">
          ${w.correct}/${w.asked} (${w.accuracy}%)
        </div>
        <div class="breakdown-status">
          ${statusBadge}
        </div>
      </div>
    `;
  });
  breakdownContainer.innerHTML = breakdownHtml;

  // 4. DETAILED QUESTION REVIEW ACCORDION
  renderReviewList('all');
}

// Topic descriptors for each week in the course
function getWeekTopic(w) {
  const topics = {
    1: 'Systemic Safety & AGI Risks',
    2: 'Reward Gaming & Alignment',
    3: 'Machine Unlearning & SISA Framework',
    4: 'Fairness, Bias & Representation',
    5: 'Word Association & Demographic Bias',
    6: 'Differential Privacy & Randomized Response',
    7: 'Exponential Mechanism & Privacy Budgets',
    8: 'Model Interpretability & LIME',
    9: 'Explainability & Probing Representations',
    10: 'AI Governance & Risk Mitigation',
    11: 'EU AI Act, OECD Principles & SaGE',
    12: 'Topological Deep Learning & FORGE'
  };
  return topics[w] || 'Core AI Concept';
}

// -------------------------------------------------------------
// Detailed Review Tab Filtering
// -------------------------------------------------------------
function filterReview(tab) {
  document.querySelectorAll('.filter-tab').forEach(b => {
    if (b.getAttribute('data-filter') === tab) {
      b.classList.add('active');
    } else {
      b.classList.remove('active');
    }
  });
  renderReviewList(tab);
}

function renderReviewList(filter) {
  const container = document.getElementById('report-review-list');
  if (!container || !appState.lastReport) return;

  const questions = appState.lastReport.reviewQuestions;

  // Update count tabs
  const allCount = questions.length;
  const wrongCount = questions.filter(x => !x.isCorrect).length;
  const correctCount = questions.filter(x => x.isCorrect).length;
  const flaggedCount = questions.filter(x => x.isFlagged).length;

  document.getElementById('filter-count-all').textContent = allCount;
  document.getElementById('filter-count-wrong').textContent = wrongCount;
  document.getElementById('filter-count-correct').textContent = correctCount;
  document.getElementById('filter-count-flagged').textContent = flaggedCount;

  let filtered = questions;
  if (filter === 'wrong') {
    filtered = questions.filter(x => !x.isCorrect);
  } else if (filter === 'correct') {
    filtered = questions.filter(x => x.isCorrect);
  } else if (filter === 'flagged') {
    filtered = questions.filter(x => x.isFlagged);
  }

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-muted);">No questions match this filter.</div>`;
    return;
  }

  let html = '';
  filtered.forEach((item, idx) => {
    const q = item.question;
    const isCorrect = item.isCorrect;
    const userPick = item.userPick;

    let optionsHtml = '';
    if (q.is_numerical) {
      optionsHtml = `
        <div class="review-opt ${isCorrect ? 'is-correct-ans' : 'is-user-picked'}">
          Your Answer: <strong>${userPick.length ? userPick[0] : '(Skipped)'}</strong> 
          ${isCorrect ? '✅ Correct' : `❌ (Correct Answer is: <strong>${q.numerical_answer}</strong>)`}
        </div>
      `;
    } else {
      q.options.forEach((opt) => {
        const isPicked = userPick.includes(opt.id);
        const isRightAns = q.correct_answers.includes(opt.id);

        let optClass = 'review-opt';
        let badge = '';

        if (isRightAns && isPicked) {
          optClass += ' is-correct-ans';
          badge = '✅ (Your Pick - Correct)';
        } else if (isRightAns && !isPicked) {
          optClass += ' is-correct-ans';
          badge = '✓ (Correct Answer)';
        } else if (isPicked && !isRightAns) {
          optClass += ' is-user-picked';
          badge = '❌ (Your Pick - Wrong)';
        }

        optionsHtml += `
          <div class="${optClass}">
            <span style="font-weight: 700; text-transform: uppercase;">${opt.id}.</span>
            <span style="flex-grow: 1;">${opt.text}</span>
            <span style="font-size: 0.75rem; font-weight: 700;">${badge}</span>
          </div>
        `;
      });
    }

    // Explanation Diagram/Image if present
    let expImgHtml = '';
    if (q.explanation_image) {
      expImgHtml = `
        <div class="review-exp-img">
          <img src="${q.explanation_image}" alt="Solution Working Diagram">
        </div>
      `;
    }

    // Question Image if present
    let qImgHtml = '';
    if (q.image) {
      qImgHtml = `
        <div class="question-image-box" style="margin-bottom: 12px; max-width: 450px;">
          <img src="${q.image}" alt="Question Diagram">
        </div>
      `;
    }

    html += `
      <div class="review-card ${isCorrect ? 'correct' : 'incorrect'}">
        <div class="review-header">
          <div class="review-tags">
            <span class="badge-pill badge-week">Week ${q.week} · Q${q.q_number}</span>
            ${isCorrect 
              ? '<span class="badge-pill" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">✓ Correct</span>' 
              : '<span class="badge-pill" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">✕ Incorrect</span>'}
          </div>
          <div style="font-size: 0.75rem; color: var(--text-dim);">
            ID: ${q.id}
          </div>
        </div>

        <div class="review-q-text">${q.question}</div>
        ${qImgHtml}

        <div class="review-options">
          ${optionsHtml}
        </div>

        <div class="review-explanation">
          <strong>Official Solution & Context:</strong>
          <p style="margin-top: 4px;">${q.explanation || 'Refer to lecture slides for detailed analysis.'}</p>
          ${expImgHtml}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// -------------------------------------------------------------
// Action Helpers: Retake New Questions / Mistakes / Weak Weeks
// -------------------------------------------------------------
function retryWithNewQuestions() {
  // Set mode to 'unseen' to guarantee brand new questions
  appState.currentMode = 'unseen';
  startQuiz();
}

function retryMistakesOnly() {
  if (!appState.lastReport) return;
  const missedQuestions = appState.lastReport.reviewQuestions
    .filter(x => !x.isCorrect)
    .map(x => x.question);

  if (missedQuestions.length === 0) {
    alert("You have no missed questions in this attempt! Great job!");
    return;
  }

  appState.activeQuiz = {
    questions: shuffleArray(missedQuestions),
    currentIndex: 0,
    userAnswers: {},
    flagged: new Set(),
    startTime: Date.now(),
    endTime: null,
    timerSeconds: missedQuestions.length * 60,
    timerInterval: null
  };

  switchView('quiz');
  renderCurrentQuestion();
}

function practiceWeakWeeks() {
  if (!appState.lastReport || appState.lastReport.weakWeeks.length === 0) return;
  const weakWeekNums = appState.lastReport.weakWeeks.map(w => w.week);
  appState.selectedWeeks = weakWeekNums;
  appState.currentMode = 'unseen';
  renderWeekSelector();
  startQuiz();
}

// -------------------------------------------------------------
// View Switching
// -------------------------------------------------------------
function switchView(viewName) {
  document.querySelectorAll('.view-panel').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const viewEl = document.getElementById(`view-${viewName}`);
  const navBtn = document.getElementById(`nav-${viewName}`);

  if (viewEl) viewEl.classList.add('active');
  if (navBtn) navBtn.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (viewName === 'study') {
    renderStudyList();
  }
}

// -------------------------------------------------------------
// History View
// -------------------------------------------------------------
function renderHistoryView() {
  const container = document.getElementById('history-container');
  if (!container) return;

  const history = getExamHistory();
  if (history.length === 0) {
    container.innerHTML = `
      <div style="background: var(--bg-card); border-radius: var(--radius-lg); padding: 40px; text-align: center; border: 1px solid var(--border-subtle); color: var(--text-muted);">
        <div style="font-size: 2.5rem; margin-bottom: 12px;">📊</div>
        <p>No test attempts yet! Complete your first test to start tracking your progress over time.</p>
        <button class="primary-btn" onclick="switchView('dashboard')" style="margin-top: 16px; padding: 10px 24px; font-size: 0.9rem;">
          Take Your First Exam
        </button>
      </div>
    `;
    return;
  }

  let html = '<div style="display: flex; flex-direction: column; gap: 14px;">';
  history.forEach((h, idx) => {
    let badgeColor = '#10b981';
    if (h.accuracy < 50) badgeColor = '#ef4444';
    else if (h.accuracy < 80) badgeColor = '#f59e0b';

    html += `
      <div style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <div style="font-weight: 700; font-size: 1rem;">Attempt #${history.length - idx}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">${h.date} · Time: ${h.timeTaken}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="text-align: right;">
            <div style="font-family: 'JetBrains Mono', monospace; font-size: 1.25rem; font-weight: 800; color: ${badgeColor};">
              ${h.score} / ${h.total} (${h.accuracy}%)
            </div>
            <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">Final Score</div>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

// -------------------------------------------------------------
// Study Mode (All 141 Questions Browser)
// -------------------------------------------------------------
function initStudyView() {
  renderStudyList();
}

function handleStudySearch(term) {
  appState.studySearchTerm = term.toLowerCase().trim();
  renderStudyList();
}

function filterStudyByWeek(val) {
  appState.studySelectedWeek = val;
  renderStudyList();
}

function toggleStudySolutions() {
  appState.studyShowSolutions = !appState.studyShowSolutions;
  const btn = document.getElementById('study-toggle-solutions');
  if (btn) {
    btn.textContent = appState.studyShowSolutions ? '🙈 Hide Solutions' : '👁️ Reveal All Answers';
  }
  renderStudyList();
}

function renderStudyList() {
  const container = document.getElementById('study-questions-list');
  if (!container) return;

  let list = appState.allQuestions;

  // Week filter
  if (appState.studySelectedWeek !== 'all') {
    const w = Number(appState.studySelectedWeek);
    list = list.filter(q => q.week === w);
  }

  // Keyword Search
  if (appState.studySearchTerm) {
    const s = appState.studySearchTerm;
    list = list.filter(q => {
      const inQ = q.question.toLowerCase().includes(s);
      const inOpts = q.options.some(o => o.text.toLowerCase().includes(s));
      const inExp = (q.explanation || '').toLowerCase().includes(s);
      return inQ || inOpts || inExp;
    });
  }

  if (list.length === 0) {
    container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">No questions found matching your search.</div>`;
    return;
  }

  let html = '';
  list.forEach(q => {
    let optionsHtml = '';

    if (q.is_numerical) {
      optionsHtml = `
        <div class="review-opt" style="border-left: 3px solid #38bdf8;">
          Numerical Value: <strong>${appState.studyShowSolutions ? q.numerical_answer : '??? (Click Reveal Solutions)'}</strong>
        </div>
      `;
    } else {
      q.options.forEach(opt => {
        const isCorrect = q.correct_answers.includes(opt.id);
        const shouldHighlight = appState.studyShowSolutions && isCorrect;

        optionsHtml += `
          <div class="review-opt ${shouldHighlight ? 'is-correct-ans' : ''}">
            <span style="font-weight: 700; text-transform: uppercase;">${opt.id}.</span>
            <span style="flex-grow: 1;">${opt.text}</span>
            ${shouldHighlight ? '<span style="font-size: 0.75rem; font-weight: 700;">✓ Correct</span>' : ''}
          </div>
        `;
      });
    }

    let expImgHtml = '';
    if (q.explanation_image && appState.studyShowSolutions) {
      expImgHtml = `
        <div class="review-exp-img">
          <img src="${q.explanation_image}" alt="Solution Working">
        </div>
      `;
    }

    let qImgHtml = '';
    if (q.image) {
      qImgHtml = `
        <div class="question-image-box" style="margin-bottom: 12px; max-width: 450px;">
          <img src="${q.image}" alt="Question Diagram">
        </div>
      `;
    }

    html += `
      <div class="review-card" style="border-left: 4px solid #6366f1;">
        <div class="review-header">
          <div class="review-tags">
            <span class="badge-pill badge-week">Week ${q.week} · Q${q.q_number}</span>
            <span class="badge-pill badge-type">${getWeekTopic(q.week)}</span>
          </div>
          <span style="font-size: 0.75rem; color: var(--text-dim);">${q.id}</span>
        </div>

        <div class="review-q-text">${q.question}</div>
        ${qImgHtml}

        <div class="review-options">
          ${optionsHtml}
        </div>

        ${appState.studyShowSolutions ? `
          <div class="review-explanation">
            <strong>Solution Note:</strong>
            <p style="margin-top: 4px;">${q.explanation || 'No lecture note.'}</p>
            ${expImgHtml}
          </div>
        ` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

// -------------------------------------------------------------
// Keyboard Shortcuts
// -------------------------------------------------------------
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Only in active quiz view
    const quizView = document.getElementById('view-quiz');
    if (!quizView || !quizView.classList.contains('active')) return;

    // Ignore if typing in numerical input
    if (document.activeElement && document.activeElement.tagName === 'INPUT') {
      if (e.key === 'Enter') {
        navigateQuestion(1);
      }
      return;
    }

    const key = e.key.toLowerCase();
    const optMap = { '1': 'a', '2': 'b', '3': 'c', '4': 'd', '5': 'e', 'a': 'a', 'b': 'b', 'c': 'c', 'd': 'd', 'e': 'e' };

    if (optMap[key]) {
      handleOptionSelect(optMap[key]);
    } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
      navigateQuestion(1);
    } else if (e.key === 'ArrowLeft') {
      navigateQuestion(-1);
    } else if (key === 'f') {
      toggleCurrentFlag();
    }
  });
}

// -------------------------------------------------------------
// Audio Feedback (Synthesized Web Audio API)
// -------------------------------------------------------------
function playSubtleSound(type) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'select') {
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === 'win') {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.frequency.setValueAtTime(freq, now + i * 0.1);
        g.gain.setValueAtTime(0.08, now + i * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
        o.start(now + i * 0.1);
        o.stop(now + i * 0.1 + 0.25);
      });
    }
  } catch (e) {
    // Audio context may require user interaction or not supported
  }
}

// -------------------------------------------------------------
// Confetti Animation for Celebrations
// -------------------------------------------------------------
function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const confettiCount = 120;
  const pieces = [];
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#38bdf8', '#fbbf24'];

  for (let i = 0; i < confettiCount; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -canvas.height,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 6 - 3
    });
  }

  let animationFrame;
  let frames = 0;

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frames++;

    pieces.forEach(p => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();
    });

    if (frames < 240) {
      animationFrame = requestAnimationFrame(loop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  loop();
}
