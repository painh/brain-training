import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW' | 'es';

interface Translations {
  // Common
  back: string;
  settings: string;
  confirm: string;
  clear: string;

  // Menu
  greeting_morning: string;
  greeting_afternoon: string;
  greeting_evening: string;
  start_training: string;
  current_brain_age: string;
  years_old: string;
  app_title: string;
  calc_training: string;
  sudoku: string;
  study_record: string;
  recognition_debug: string;

  // Settings
  use_candidates: string;
  use_candidates_desc: string;
  use_instant_delay: string;
  use_instant_delay_desc: string;
  language: string;

  // Calc Game
  calc_title: string;
  problem_count: string;

  // Sudoku
  sudoku_title: string;
  sudoku_rules: string;
  easy: string;
  medium: string;
  hard: string;
  select_cell: string;
  memo_on: string;
  memo_off: string;
  hint_on: string;
  hint_off: string;
  erase: string;

  // Canvas
  write_number: string;

  // Complete
  training_complete: string;
  accuracy: string;
  time_spent: string;
  measured_brain_age: string;

  // Calendar
  calendar_title: string;
  total_study_days: string;
  days: string;
  this_month: string;

  // Debug
  debug_title: string;
  recognition: string;
  tens_digit: string;
  ones_digit: string;
  candidates: string;
  history: string;
}

const translations: Record<Language, Translations> = {
  ko: {
    back: '뒤로',
    settings: '설정',
    confirm: '확인',
    clear: '지우기',

    greeting_morning: '좋은 아침이에요!',
    greeting_afternoon: '좋은 오후에요!',
    greeting_evening: '좋은 저녁이에요!',
    start_training: '오늘도 두뇌 훈련을\n시작해볼까요?',
    current_brain_age: '현재 두뇌 나이',
    years_old: '세',
    app_title: '매일매일 두뇌 훈련',
    calc_training: '계산 훈련',
    sudoku: '스도쿠',
    study_record: '학습 기록',
    recognition_debug: '인식 디버그',

    use_candidates: '후보군 매칭 사용',
    use_candidates_desc: '손글씨 인식 시 상위 3개 후보 중 정답이 있으면 정답 처리',
    use_instant_delay: '정답 확인 딜레이',
    use_instant_delay_desc: '정답일 때 0.1초 기다린 후 제출 (그림 완성 확인용)',
    language: '언어',

    calc_title: '계산 훈련',
    problem_count: '문제',

    sudoku_title: '스도쿠',
    sudoku_rules: '가로줄, 세로줄, 3×3칸에 1~9를 중복 없이 채우세요',
    easy: '쉬움',
    medium: '보통',
    hard: '어려움',
    select_cell: '셀을 선택해주세요',
    memo_on: '메모 ON',
    memo_off: '메모 OFF',
    hint_on: '힌트 ON',
    hint_off: '힌트 OFF',
    erase: '지우기',

    write_number: '숫자를 쓰세요',

    training_complete: '훈련 완료!',
    accuracy: '정답률',
    time_spent: '소요 시간',
    measured_brain_age: '측정된 두뇌 나이',

    calendar_title: '학습 기록',
    total_study_days: '총 학습 일수',
    days: '일',
    this_month: '이번 달',

    debug_title: '인식 디버그',
    recognition: '인식',
    tens_digit: '10의 자리',
    ones_digit: '1의 자리',
    candidates: '후보',
    history: '기록',
  },

  en: {
    back: 'Back',
    settings: 'Settings',
    confirm: 'OK',
    clear: 'Clear',

    greeting_morning: 'Good morning!',
    greeting_afternoon: 'Good afternoon!',
    greeting_evening: 'Good evening!',
    start_training: 'Ready to start\nbrain training?',
    current_brain_age: 'Current Brain Age',
    years_old: '',
    app_title: 'Daily Brain Training',
    calc_training: 'Calculation',
    sudoku: 'Sudoku',
    study_record: 'Progress',
    recognition_debug: 'Debug',

    use_candidates: 'Use Candidate Matching',
    use_candidates_desc: 'Accept answer if it matches any of top 3 recognition candidates',
    use_instant_delay: 'Correct Answer Delay',
    use_instant_delay_desc: 'Wait 0.1s before submitting correct answer (to verify drawing is complete)',
    language: 'Language',

    calc_title: 'Calculation Training',
    problem_count: 'Problem',

    sudoku_title: 'Sudoku',
    sudoku_rules: 'Fill rows, columns, and 3×3 boxes with 1-9 without repeating',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
    select_cell: 'Select a cell',
    memo_on: 'Notes ON',
    memo_off: 'Notes OFF',
    hint_on: 'Hints ON',
    hint_off: 'Hints OFF',
    erase: 'Erase',

    write_number: 'Write a number',

    training_complete: 'Complete!',
    accuracy: 'Accuracy',
    time_spent: 'Time',
    measured_brain_age: 'Your Brain Age',

    calendar_title: 'Progress',
    total_study_days: 'Total Study Days',
    days: 'days',
    this_month: 'This Month',

    debug_title: 'Recognition Debug',
    recognition: 'Result',
    tens_digit: 'Tens',
    ones_digit: 'Ones',
    candidates: 'Candidates',
    history: 'History',
  },

  ja: {
    back: '戻る',
    settings: '設定',
    confirm: '確認',
    clear: '消す',

    greeting_morning: 'おはようございます！',
    greeting_afternoon: 'こんにちは！',
    greeting_evening: 'こんばんは！',
    start_training: '今日も脳トレを\n始めましょう！',
    current_brain_age: '現在の脳年齢',
    years_old: '歳',
    app_title: '毎日脳トレーニング',
    calc_training: '計算',
    sudoku: '数独',
    study_record: '学習記録',
    recognition_debug: 'デバッグ',

    use_candidates: '候補マッチングを使用',
    use_candidates_desc: '手書き認識時、上位3候補に正解があれば正解として処理',
    use_instant_delay: '正解確認ディレイ',
    use_instant_delay_desc: '正解時に0.1秒待ってから送信（描画完了確認用）',
    language: '言語',

    calc_title: '計算トレーニング',
    problem_count: '問題',

    sudoku_title: '数独',
    sudoku_rules: '行・列・3×3ブロックに1〜9を重複なく入れてください',
    easy: 'かんたん',
    medium: 'ふつう',
    hard: 'むずかしい',
    select_cell: 'マスを選択してください',
    memo_on: 'メモ ON',
    memo_off: 'メモ OFF',
    hint_on: 'ヒント ON',
    hint_off: 'ヒント OFF',
    erase: '消す',

    write_number: '数字を書いてください',

    training_complete: 'トレーニング完了！',
    accuracy: '正解率',
    time_spent: '所要時間',
    measured_brain_age: '測定された脳年齢',

    calendar_title: '学習記録',
    total_study_days: '総学習日数',
    days: '日',
    this_month: '今月',

    debug_title: '認識デバッグ',
    recognition: '認識',
    tens_digit: '10の位',
    ones_digit: '1の位',
    candidates: '候補',
    history: '履歴',
  },

  'zh-CN': {
    back: '返回',
    settings: '设置',
    confirm: '确认',
    clear: '清除',

    greeting_morning: '早上好！',
    greeting_afternoon: '下午好！',
    greeting_evening: '晚上好！',
    start_training: '今天也来\n训练大脑吧！',
    current_brain_age: '当前脑年龄',
    years_old: '岁',
    app_title: '每日大脑训练',
    calc_training: '计算训练',
    sudoku: '数独',
    study_record: '学习记录',
    recognition_debug: '调试',

    use_candidates: '使用候选匹配',
    use_candidates_desc: '手写识别时，如果前3个候选中有正确答案则判定为正确',
    use_instant_delay: '正确答案延迟',
    use_instant_delay_desc: '正确时等待0.1秒后提交（确认绘制完成）',
    language: '语言',

    calc_title: '计算训练',
    problem_count: '题目',

    sudoku_title: '数独',
    sudoku_rules: '在行、列、3×3格中填入1-9，不重复',
    easy: '简单',
    medium: '普通',
    hard: '困难',
    select_cell: '请选择单元格',
    memo_on: '笔记 开',
    memo_off: '笔记 关',
    hint_on: '提示 开',
    hint_off: '提示 关',
    erase: '擦除',

    write_number: '请写数字',

    training_complete: '训练完成！',
    accuracy: '正确率',
    time_spent: '用时',
    measured_brain_age: '测量脑年龄',

    calendar_title: '学习记录',
    total_study_days: '总学习天数',
    days: '天',
    this_month: '本月',

    debug_title: '识别调试',
    recognition: '识别',
    tens_digit: '十位',
    ones_digit: '个位',
    candidates: '候选',
    history: '历史',
  },

  'zh-TW': {
    back: '返回',
    settings: '設定',
    confirm: '確認',
    clear: '清除',

    greeting_morning: '早安！',
    greeting_afternoon: '午安！',
    greeting_evening: '晚安！',
    start_training: '今天也來\n訓練大腦吧！',
    current_brain_age: '目前腦年齡',
    years_old: '歲',
    app_title: '每日大腦訓練',
    calc_training: '計算訓練',
    sudoku: '數獨',
    study_record: '學習記錄',
    recognition_debug: '偵錯',

    use_candidates: '使用候選配對',
    use_candidates_desc: '手寫辨識時，若前3個候選中有正確答案則判定為正確',
    use_instant_delay: '正確答案延遲',
    use_instant_delay_desc: '正確時等待0.1秒後提交（確認繪製完成）',
    language: '語言',

    calc_title: '計算訓練',
    problem_count: '題目',

    sudoku_title: '數獨',
    sudoku_rules: '在行、列、3×3格中填入1-9，不重複',
    easy: '簡單',
    medium: '普通',
    hard: '困難',
    select_cell: '請選擇儲存格',
    memo_on: '筆記 開',
    memo_off: '筆記 關',
    hint_on: '提示 開',
    hint_off: '提示 關',
    erase: '擦除',

    write_number: '請寫數字',

    training_complete: '訓練完成！',
    accuracy: '正確率',
    time_spent: '耗時',
    measured_brain_age: '測量腦年齡',

    calendar_title: '學習記錄',
    total_study_days: '總學習天數',
    days: '天',
    this_month: '本月',

    debug_title: '辨識偵錯',
    recognition: '辨識',
    tens_digit: '十位',
    ones_digit: '個位',
    candidates: '候選',
    history: '歷史',
  },

  es: {
    back: 'Volver',
    settings: 'Ajustes',
    confirm: 'Aceptar',
    clear: 'Borrar',

    greeting_morning: '¡Buenos días!',
    greeting_afternoon: '¡Buenas tardes!',
    greeting_evening: '¡Buenas noches!',
    start_training: '¿Listo para entrenar\ntu cerebro?',
    current_brain_age: 'Edad Cerebral',
    years_old: 'años',
    app_title: 'Entrena Tu Cerebro',
    calc_training: 'Cálculo',
    sudoku: 'Sudoku',
    study_record: 'Progreso',
    recognition_debug: 'Depurar',

    use_candidates: 'Usar coincidencia de candidatos',
    use_candidates_desc: 'Aceptar si la respuesta está entre los 3 mejores candidatos de reconocimiento',
    use_instant_delay: 'Retraso de respuesta correcta',
    use_instant_delay_desc: 'Esperar 0.1s antes de enviar respuesta correcta (para verificar dibujo)',
    language: 'Idioma',

    calc_title: 'Entrenamiento de Cálculo',
    problem_count: 'Problema',

    sudoku_title: 'Sudoku',
    sudoku_rules: 'Completa filas, columnas y cuadros 3×3 con 1-9 sin repetir',
    easy: 'Fácil',
    medium: 'Normal',
    hard: 'Difícil',
    select_cell: 'Selecciona una celda',
    memo_on: 'Notas ON',
    memo_off: 'Notas OFF',
    hint_on: 'Pistas ON',
    hint_off: 'Pistas OFF',
    erase: 'Borrar',

    write_number: 'Escribe un número',

    training_complete: '¡Completado!',
    accuracy: 'Precisión',
    time_spent: 'Tiempo',
    measured_brain_age: 'Tu Edad Cerebral',

    calendar_title: 'Progreso',
    total_study_days: 'Días de Estudio',
    days: 'días',
    this_month: 'Este Mes',

    debug_title: 'Depuración',
    recognition: 'Resultado',
    tens_digit: 'Decenas',
    ones_digit: 'Unidades',
    candidates: 'Candidatos',
    history: 'Historial',
  },
};

// Detect browser/OS language
function detectLanguage(): Language {
  const browserLang = navigator.language || (navigator as any).userLanguage || 'en';
  const lang = browserLang.toLowerCase();

  if (lang.startsWith('ko')) return 'ko';
  if (lang.startsWith('ja')) return 'ja';
  if (lang === 'zh-cn' || lang === 'zh-hans') return 'zh-CN';
  if (lang === 'zh-tw' || lang === 'zh-hant' || lang.startsWith('zh')) return 'zh-TW';
  if (lang.startsWith('es')) return 'es';
  return 'en';
}

export const languageNames: Record<Language, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  es: 'Español',
};

interface I18nStore {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      language: detectLanguage(),
      t: translations[detectLanguage()],
      setLanguage: (lang) => set({ language: lang, t: translations[lang] }),
    }),
    {
      name: 'brain-training-i18n',
      partialize: (state) => ({ language: state.language }),
      onRehydrateStorage: () => (state) => {
        // After rehydrating, update translations based on stored language
        if (state) {
          state.t = translations[state.language];
        }
      },
    }
  )
);
