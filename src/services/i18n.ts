/**
 * BharatLearn AI — Central Internationalization (i18n) & Localization Engine
 * Provides typed translation dictionaries, fallback cascade, and RTL direction management.
 * Primary Verified Pilot: Odia ('or')
 * Universal Fallback: English ('en')
 * Fast-Follow Tiers: Hindi ('hi'), Urdu ('ur' - RTL)
 */

import type { IndianLanguageCode, TextDirection } from '../types';
import { ALL_SCHEDULED_LANGUAGES } from './registryData';

export type TranslationDictionary = Record<string, string>;

// --- 1. Odia ('or') — Verified Pilot Dictionary ---
const ODIA_TRANSLATIONS: TranslationDictionary = {
  // Navigation & Shell
  'nav.home': 'ମୂଳପୃଷ୍ଠା (Home)',
  'nav.dashboard': 'ଡ୍ୟାସବୋର୍ଡ (Dashboard)',
  'nav.subjects': 'ବିଷୟସମୂହ (Subjects)',
  'nav.companion': 'ଏଆଇ ସାଥୀ (AI Companion)',
  'nav.progress': 'ଅଗ୍ରଗତି (Progress)',
  'nav.parent': 'ଅଭିଭାବକ (Parent)',
  'nav.settings': 'ସେଟିଂସ୍ (Settings)',
  'nav.studySession': 'ଫୋକସ୍ ରୁମ୍ (Focus Room)',
  'nav.logout': 'ପ୍ରସ୍ଥାନ (Sign Out)',

  // Onboarding & Profile
  'onboarding.title': 'ଶିକ୍ଷାର୍ଥୀ ପଞ୍ଜୀକରଣ (Learner Onboarding)',
  'onboarding.subtitle': 'ଆପଣଙ୍କ ଶ୍ରେଣୀ, ବୋର୍ଡ ଓ ଭାଷା ଅନୁଯାୟୀ ବ୍ୟକ୍ତିଗତ ଶିକ୍ଷଣ ପଥ ପ୍ରସ୍ତୁତ କରନ୍ତୁ।',
  'onboarding.step1': '୧. ଶିକ୍ଷାର୍ଥୀ ବର୍ଗ (Cohort)',
  'onboarding.step2': '୨. ଭାଷା ବିନ୍ୟାସ (Languages)',
  'onboarding.step3': '୩. ବିଷୟ ଓ ସିଲାବସ୍ (Syllabus)',
  'onboarding.step4': '୪. ଦୈନିକ ଲକ୍ଷ୍ୟ (Daily Goals)',
  'onboarding.save': 'ସଂରକ୍ଷଣ କରି ଆଗକୁ ବଢ଼ନ୍ତୁ (Save & Proceed)',
  'onboarding.fullName': 'ପୂରା ନାମ (Full Name)',
  'onboarding.class': 'ଶ୍ରେଣୀ (Class)',
  'onboarding.board': 'ବୋର୍ଡ (Board)',
  'onboarding.school': 'ବିଦ୍ୟାଳୟ (School)',
  'onboarding.district': 'ଜିଲ୍ଲା (District)',

  // Dashboard
  'dashboard.greeting': 'ନମସ୍କାର, ଆଜିର ଅଧ୍ୟୟନ ଆରମ୍ଭ କରିବା!',
  'dashboard.streak': 'କ୍ରମାଗତ ଅଧ୍ୟୟନ (Day Streak)',
  'dashboard.overallMastery': 'ସାମଗ୍ରିକ ଦକ୍ଷତା (Overall Mastery)',
  'dashboard.activitiesDone': 'ସମ୍ପନ୍ନ କାର୍ଯ୍ୟ (Activities Done)',
  'dashboard.timeSpent': 'ଅଧ୍ୟୟନ ସମୟ (Study Time)',
  'dashboard.todayTarget': 'ଆଜିର ଲକ୍ଷ୍ୟ (Today Target)',
  'dashboard.resumeLearning': 'ପରବର୍ତ୍ତୀ ପାଠ ଜାରି ରଖନ୍ତୁ (Resume Learning)',
  'dashboard.recommendedChapters': 'ପରାମର୍ଶିତ ଅଧ୍ୟାୟ (Recommended Chapters)',
  'dashboard.recentActivity': 'ସାମ୍ପ୍ରତିକ କାର୍ଯ୍ୟକଳାପ (Recent Activity)',

  // Companion & Agent
  'companion.title': 'ପେଡାଗୋଜିକାଲ୍ ଏଆଇ ଶିକ୍ଷଣ ସାଥୀ (AI Learning Companion)',
  'companion.subtitle': 'BSE Odisha ପାଠ୍ୟକ୍ରମ ଆଧାରିତ ୮-ସ୍ତରୀୟ ସ୍ୱୟଂଚାଳିତ ଶିକ୍ଷଣ ବ୍ୟବସ୍ଥା।',
  'companion.askPlaceholder': 'ଆପଣଙ୍କ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ (ଯଥା: ଆଲୋକ ସଂଶ୍ଳେଷଣରେ ଜଳର କାର୍ଯ୍ୟ କ’ଣ?)...',
  'companion.send': 'ପଚାରନ୍ତୁ (Ask Agent)',
  'companion.depthStandard': 'ପ୍ରମାଣିତ (Standard)',
  'companion.depthSimpler': 'ସରଳ ଉଦାହରଣ (Simpler)',
  'companion.depthDeeper': 'ଗଭୀର ବିଶ୍ଳେଷଣ (Deeper)',
  'companion.askHint': 'ସୂଚନା ମାଗନ୍ତୁ (Ask for Hint)',
  'companion.needPlan': 'ଅଧ୍ୟୟନ ଯୋଜନା (Study Plan)',
  'companion.activityPanel': 'ଏଜେଣ୍ଟ କାର୍ଯ୍ୟଧାରା ପ୍ୟାନେଲ୍ (Agent Activity Panel)',
  'companion.currentStage': 'ବର୍ତ୍ତମାନର ସ୍ଥିତି (Current Stage)',
  'companion.copyExplanation': 'ଅଧ୍ୟୟନ ନୋଟ୍ କପି କରନ୍ତୁ (Copy Note)',
  'companion.copied': 'କପି ହୋଇଗଲା! (Copied)',
  'companion.readAloud': 'ଶୁଣନ୍ତୁ (Read Aloud)',
  'companion.stopAudio': 'ବନ୍ଦ କରନ୍ତୁ (Stop)',

  // Diagnostics & Quizzes
  'quiz.diagnosticTitle': 'ନିଦାନ ଅଭ୍ୟାସ ପ୍ରଶ୍ନ (Diagnostic Practice Drill)',
  'quiz.checkAnswer': 'ଉତ୍ତର ଯାଞ୍ଚ କରନ୍ତୁ (Check Answer)',
  'quiz.submitting': 'ଯାଞ୍ଚ ଚାଲିଛି... (Evaluating...)',
  'quiz.correct': 'ଅତି ଉତ୍ତମ! ଆପଣଙ୍କ ଉତ୍ତର ସଠିକ୍। (Correct Answer)',
  'quiz.incorrect': 'ଭୁଲ୍ ଧାରଣା ଚିହ୍ନଟ ହେଲା (Misconception Detected)',
  'quiz.citation': 'ପାଠ୍ୟପୁସ୍ତକ ପ୍ରମାଣ (Textbook Citation)',
  'quiz.nextQuestion': 'ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ (Next Question)',

  // Parental Control & Locks
  'parent.lockTitle': 'ଅଭିଭାବକ ସମୟ ସୀମା ନିୟନ୍ତ୍ରଣ (Parental Focus Lock)',
  'parent.lockDesc': '୧୦ ମିନିଟ୍ ନିଷ୍କ୍ରିୟତା କିମ୍ବା ଦୈନିକ ସ୍କ୍ରିନ୍-ଟାଇମ୍ ସୀମା ପୂରଣ ହୋଇଛି।',
  'parent.requestUnlock': 'ଅନ୍-ଲକ୍ ଅନୁରୋଧ ପଠାନ୍ତୁ (Request Parent Unlock)',
  'parent.unlockRequested': 'ଅଭିଭାବକଙ୍କୁ ଅନୁରୋଧ ପଠାଗଲା (Unlock Requested)',
  'parent.enterPin': 'ଅଭିଭାବକ PIN ପ୍ରବେଶ କରନ୍ତୁ (Enter Parent PIN)',

  // Settings & Language
  'settings.title': 'ସେଟିଂସ୍ ଓ ଭାଷା ବିନ୍ୟାସ (Settings & Language)',
  'settings.selectLang': 'ଭାଷା ଚୟନ (Select Language)',
  'settings.preview': 'ଇଣ୍ଟରଫେସ୍ ଓ ପାଠ୍ୟ ପ୍ରଦର୍ଶନ (Preview)',
  'settings.save': 'ସଂରକ୍ଷଣ କରନ୍ତୁ (Save Settings)',
  'settings.accessibility': 'ଦୃଶ୍ୟମାନତା ଓ ସୁବିଧା (Accessibility)',
  'settings.highContrast': 'ଉଚ୍ଚ କଣ୍ଟ୍ରାଷ୍ଟ (High Contrast)',
  'settings.fontSize': 'ଅକ୍ଷର ଆକାର (Font Size)',

  // Errors & Fallbacks
  'error.general': 'କୌଣସି ଅପ୍ରତ୍ୟାଶିତ ତ୍ରୁଟି ଘଟିଛି। ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।',
  'error.unauthorized': 'ପ୍ରବେଶ ଅନୁମତି ନାହିଁ। ଦୟାକରି ଲଗଇନ୍ କରନ୍ତୁ।',
  'error.offline': 'ଇଣ୍ଟରନେଟ୍ ସଂଯୋଗ ବିଚ୍ଛିନ୍ନ ଅଛି। ଅଫଲାଇନ୍ ମୋଡ୍‌ରେ କାର୍ଯ୍ୟ କରୁଛି।',
  'error.tierLimitation': 'ଏହି ଭାଷାରେ କେତେକ ଉନ୍ନତ ପ୍ରଶ୍ନ ଇଂରାଜୀ ବା ହିନ୍ଦୀରେ ଅଧିକ ସ୍ପଷ୍ଟ ହୋଇପାରେ।',
};

// --- 2. English ('en') — Universal Fallback Dictionary ---
const ENGLISH_TRANSLATIONS: TranslationDictionary = {
  // Navigation & Shell
  'nav.home': 'Home',
  'nav.dashboard': 'Dashboard',
  'nav.subjects': 'Subjects',
  'nav.companion': 'AI Companion',
  'nav.progress': 'Progress',
  'nav.parent': 'Parent Portal',
  'nav.settings': 'Settings',
  'nav.studySession': 'Focus Room',
  'nav.logout': 'Sign Out',

  // Onboarding & Profile
  'onboarding.title': 'Learner Onboarding',
  'onboarding.subtitle': 'Configure your class, curriculum board, and multilingual preferences.',
  'onboarding.step1': '1. Learner Cohort',
  'onboarding.step2': '2. Language Setup',
  'onboarding.step3': '3. Subjects & Syllabus',
  'onboarding.step4': '4. Daily Goals',
  'onboarding.save': 'Save & Proceed',
  'onboarding.fullName': 'Full Name',
  'onboarding.class': 'Class / Grade',
  'onboarding.board': 'Curriculum Board',
  'onboarding.school': 'School / College',
  'onboarding.district': 'District',

  // Dashboard
  'dashboard.greeting': 'Welcome back! Ready for today’s learning session.',
  'dashboard.streak': 'Day Streak',
  'dashboard.overallMastery': 'Overall Mastery',
  'dashboard.activitiesDone': 'Activities Completed',
  'dashboard.timeSpent': 'Study Time',
  'dashboard.todayTarget': 'Today Target',
  'dashboard.resumeLearning': 'Resume Incomplete Lesson',
  'dashboard.recommendedChapters': 'Recommended Chapters',
  'dashboard.recentActivity': 'Recent Activity',

  // Companion & Agent
  'companion.title': 'Pedagogical AI Learning Companion',
  'companion.subtitle': 'Stateful 8-stage mastery learning engine aligned with verified curriculum.',
  'companion.askPlaceholder': 'Ask your question (e.g. How does photolysis generate oxygen in photosynthesis?)...',
  'companion.send': 'Ask Agent',
  'companion.depthStandard': 'Standard',
  'companion.depthSimpler': 'Simpler Analogy',
  'companion.depthDeeper': 'Exam Depth',
  'companion.askHint': 'Ask for Hint',
  'companion.needPlan': 'Study Plan',
  'companion.activityPanel': 'Agent Activity Panel',
  'companion.currentStage': 'Current Stage',
  'companion.copyExplanation': 'Copy Explanation',
  'companion.copied': 'Copied to Clipboard!',
  'companion.readAloud': 'Read Aloud',
  'companion.stopAudio': 'Stop Audio',

  // Diagnostics & Quizzes
  'quiz.diagnosticTitle': 'Diagnostic Practice Drill',
  'quiz.checkAnswer': 'Check Answer',
  'quiz.submitting': 'Evaluating...',
  'quiz.correct': 'Excellent! Your understanding is correct.',
  'quiz.incorrect': 'Misconception Detected',
  'quiz.citation': 'Textbook Citation',
  'quiz.nextQuestion': 'Next Practice Question',

  // Parental Control & Locks
  'parent.lockTitle': 'Parental Focus & Screen-Time Restriction',
  'parent.lockDesc': 'Study session paused due to 10-minute inactivity limit or daily screen-time quota.',
  'parent.requestUnlock': 'Request Parent Unlock',
  'parent.unlockRequested': 'Unlock Request Submitted to Parent',
  'parent.enterPin': 'Enter Parent PIN to Override',

  // Settings & Language
  'settings.title': 'Settings & Multilingual Architecture',
  'settings.selectLang': 'Language Configuration',
  'settings.preview': 'Interface & Concept Preview',
  'settings.save': 'Save Settings',
  'settings.accessibility': 'Accessibility & Comfort',
  'settings.highContrast': 'High Contrast',
  'settings.fontSize': 'Font Size',

  // Errors & Fallbacks
  'error.general': 'An unexpected error occurred. Please try again.',
  'error.unauthorized': 'Authorization required. Please sign in.',
  'error.offline': 'Working offline. Your completed answers will sync automatically when connected.',
  'error.tierLimitation': 'This language is in Tier 2/3. Scientific formulas and complex equations remain in standard notation.',
};

// --- 3. Hindi ('hi') — Fast-Follow Tier 1 Dictionary ---
const HINDI_TRANSLATIONS: TranslationDictionary = {
  'nav.home': 'मुख्य पृष्ठ (Home)',
  'nav.dashboard': 'डैशबोर्ड (Dashboard)',
  'nav.subjects': 'विषय (Subjects)',
  'nav.companion': 'एआई साथी (AI Companion)',
  'nav.progress': 'प्रगति (Progress)',
  'nav.parent': 'अभिभावक (Parent)',
  'nav.settings': 'सेटिंग्स (Settings)',
  'nav.studySession': 'फोकस रूम (Focus Room)',
  'nav.logout': 'लॉग आउट (Sign Out)',

  'onboarding.title': 'शिक्षार्थी पंजीकरण (Onboarding)',
  'onboarding.subtitle': 'अपनी कक्षा और भाषा के अनुसार व्यक्तिगत शिक्षण योजना बनाएं।',
  'onboarding.save': 'सहेजें और आगे बढ़ें (Save & Proceed)',
  'onboarding.fullName': 'पूरा नाम (Full Name)',

  'dashboard.greeting': 'नमस्ते! आज का अध्ययन सत्र शुरू करें।',
  'dashboard.streak': 'दैनिक अध्ययन (Streak)',
  'dashboard.overallMastery': 'समग्र दक्षता (Overall Mastery)',
  'dashboard.activitiesDone': 'पूर्ण गतिविधियां (Activities Done)',
  'dashboard.resumeLearning': 'अधूरा पाठ जारी रखें (Resume Learning)',

  'companion.title': 'शिक्षा एआई शिक्षण साथी (AI Learning Companion)',
  'companion.subtitle': 'एनसीईआरटी पाठ्यक्रम पर आधारित 8-चरणीय बुद्धिमत्तापूर्ण शिक्षण प्रणाली।',
  'companion.askPlaceholder': 'अपना प्रश्न पूछें (उदा: प्रकाश संश्लेषण में ऑक्सीजन कैसे निकलती है?)...',
  'companion.send': 'पूछें (Ask Agent)',
  'companion.depthStandard': 'मानक (Standard)',
  'companion.depthSimpler': 'सरल उदाहरण (Simpler)',
  'companion.depthDeeper': 'गहन विश्लेषण (Deeper)',
  'companion.askHint': 'संकेत मांगें (Ask for Hint)',
  'companion.activityPanel': 'एजेंट कार्य प्रगति पैनल (Agent Activity Panel)',
  'companion.copyExplanation': 'नोट कॉपी करें (Copy Note)',
  'companion.copied': 'कॉपी हो गया! (Copied)',
  'companion.readAloud': 'सुनें (Read Aloud)',

  'quiz.diagnosticTitle': 'अभ्यास प्रश्न (Practice Drill)',
  'quiz.checkAnswer': 'उत्तर जांचें (Check Answer)',
  'quiz.correct': 'बहुत बढ़िया! आपका उत्तर सही है।',
  'quiz.incorrect': 'गलत धारणा की पहचान हुई (Misconception Detected)',

  'parent.lockTitle': 'अभिभावक नियंत्रण (Parental Lock)',
  'parent.lockDesc': '10 मिनट की निष्क्रियता या स्क्रीन समय सीमा पूरी हो चुकी है।',
  'parent.requestUnlock': 'अनलॉक का अनुरोध भेजें (Request Unlock)',

  'settings.title': 'सेटिंग्स और भाषा (Settings & Language)',
  'settings.save': 'सहेजें (Save)',
  'error.general': 'त्रुटि हुई। कृपया पुनः प्रयास करें।',
  'error.offline': 'आप ऑफलाइन हैं। इंटरनेट आने पर उत्तर सिंक हो जाएंगे।',
};

// --- 4. Urdu ('ur') — Fast-Follow Tier 2 RTL Dictionary ---
const URDU_TRANSLATIONS: TranslationDictionary = {
  'nav.home': 'ہوم (Home)',
  'nav.dashboard': 'ڈیش بورڈ (Dashboard)',
  'nav.subjects': 'مضامین (Subjects)',
  'nav.companion': 'اے آئی ساتھی (AI Companion)',
  'nav.progress': 'پیش رفت (Progress)',
  'nav.parent': 'والدین (Parent)',
  'nav.settings': 'ترتیبات (Settings)',
  'nav.studySession': 'فوکس روم (Focus Room)',
  'nav.logout': 'لاگ آؤٹ (Sign Out)',

  'onboarding.title': 'طالب علم کا اندراج (Onboarding)',
  'onboarding.subtitle': 'اپنی جماعت اور زبان کے مطابق تعلیمی منصوبہ بنائیں۔',
  'onboarding.save': 'محفوظ کریں اور آگے بڑھیں (Save)',

  'dashboard.greeting': 'خوش آمدید! آج کا مطالعہ شروع کریں۔',
  'dashboard.streak': 'مسلسل مطالعہ (Streak)',
  'dashboard.overallMastery': 'مجموعی مہارت (Overall Mastery)',
  'dashboard.activitiesDone': 'مکمل سرگرمیاں (Activities Done)',
  'dashboard.resumeLearning': 'سبق جاری رکھیں (Resume Lesson)',

  'companion.title': 'تعلیمی اے آئی تدریسی ساتھی (AI Learning Companion)',
  'companion.subtitle': 'این سی ای آر ٹی نصاب کے مطابق 8 مرحلہ وار رہنمائی۔',
  'companion.askPlaceholder': 'اپنا سوال پوچھیں (مثلاً: ضیائی تالیف میں آکسیجن کیسے خارج ہوتی ہے؟)...',
  'companion.send': 'پوچھیں (Ask Agent)',
  'companion.depthStandard': 'معیاری (Standard)',
  'companion.depthSimpler': 'آسان مثال (Simpler)',
  'companion.depthDeeper': 'تفصیلی (Deeper)',
  'companion.askHint': 'اشارہ مانگیں (Ask for Hint)',
  'companion.activityPanel': 'ایجنٹ کی سرگرمی کا پینل (Activity Panel)',
  'companion.copyExplanation': 'کاپی کریں (Copy)',
  'companion.copied': 'کاپی ہو گیا! (Copied)',
  'companion.readAloud': 'سنیں (Read Aloud)',

  'quiz.diagnosticTitle': 'تشخیصی مشق (Diagnostic Drill)',
  'quiz.checkAnswer': 'جواب چیک کریں (Check Answer)',
  'quiz.correct': 'بہت خوب! آپ کا جواب درست ہے۔',
  'quiz.incorrect': 'غلط فہمی کی نشاندہی ہوئی (Misconception Detected)',

  'parent.lockTitle': 'والدین کی پابندی (Parental Lock)',
  'parent.lockDesc': '10 منٹ کی غیر حاضری یا وقت کی حد پوری ہو گئی ہے۔',
  'parent.requestUnlock': 'ان لاک کی درخواست بھیجیں (Request Unlock)',

  'settings.title': 'ترتیبات اور زبان (Settings & Language)',
  'settings.save': 'محفوظ کریں (Save)',
  'error.general': 'کوئی خرابی پیش آ گئی۔ دوبارہ کوشش کریں۔',
  'error.offline': 'آپ آف لائن ہیں۔ انٹرنیٹ آنے پر کام خودکار طور پر سنک ہو جائے گا۔',
};

// Translation registry map
const TRANSLATION_MAP: Partial<Record<IndianLanguageCode, TranslationDictionary>> = {
  or: ODIA_TRANSLATIONS,
  en: ENGLISH_TRANSLATIONS,
  hi: HINDI_TRANSLATIONS,
  ur: URDU_TRANSLATIONS,
};

/**
 * Universal Translation Function with safe fallback cascade:
 * Selected Language -> English Fallback -> Default Parameter String
 */
export function t(
  key: string,
  lang: IndianLanguageCode = 'or',
  fallbackText?: string
): string {
  const primaryDict = TRANSLATION_MAP[lang];
  if (primaryDict && primaryDict[key]) {
    return primaryDict[key];
  }

  // Fallback to English dictionary
  const enDict = TRANSLATION_MAP['en'];
  if (enDict && enDict[key]) {
    return enDict[key];
  }

  // Final fallback to provided text or key name
  return fallbackText || key;
}

/**
 * Returns text direction ('ltr' or 'rtl') for any given language code.
 */
export function getTextDirection(lang: IndianLanguageCode): TextDirection {
  const meta = ALL_SCHEDULED_LANGUAGES.find((l) => l.code === lang);
  return meta?.direction || 'ltr';
}

/**
 * Automatically applies or clears RTL direction attribute on root HTML document.
 */
export function applyDocumentDirection(lang: IndianLanguageCode): void {
  if (typeof document === 'undefined') return;
  const direction = getTextDirection(lang);
  document.documentElement.dir = direction;
  document.documentElement.lang = lang;
  if (direction === 'rtl') {
    document.documentElement.classList.add('rtl-active');
  } else {
    document.documentElement.classList.remove('rtl-active');
  }
}
