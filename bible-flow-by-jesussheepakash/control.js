/**
 * ═════════════════════════════════════════════════════════════
 *  Bible Flow v5.0 — Control Window
 *  Persistent popup-style window for verse selection.
 *  Sends verse selections to background service worker,
 *  which relays them to the Presenter Tab.
 * ═════════════════════════════════════════════════════════════
 */

'use strict';

/* ═══════════════════════════════════════════════════════════
   SECTION 1: CONFIGURATION
   ═══════════════════════════════════════════════════════════ */

const CONFIG = {
  HINDI_BIBLE_PATH: 'bible.json',
  ENGLISH_BIBLE_PATH: 'english-bible.json',
  API_BASE: 'https://bolls.life',
  API_TRANSLATIONS: ['HINDI', 'HINDCV', 'HINIRV', 'HIN', 'WEB'],
  MAX_HISTORY: 10,
  COPY_BADGE_MS: 2000,
  API_TIMEOUT: 10000,
};


/* ═══════════════════════════════════════════════════════════
   SECTION 2: BOOK DATA ORGANIZED BY TESTAMENT
   ═══════════════════════════════════════════════════════════ */

  const BOOKS_BY_TESTAMENT = {
    old: [
      { number: 1, hindi: 'उत्पत्ति', english: 'Genesis' },
      { number: 2, hindi: 'निर्गमन', english: 'Exodus' },
      { number: 3, hindi: 'लैव्यव्यवस्था', english: 'Leviticus' },
      { number: 4, hindi: 'गिनती', english: 'Numbers' },
      { number: 5, hindi: 'व्यवस्थाविवरण', english: 'Deuteronomy' },
      { number: 6, hindi: 'यहोशू', english: 'Joshua' },
      { number: 7, hindi: 'न्यायियों', english: 'Judges' },
      { number: 8, hindi: 'रूत', english: 'Ruth' },
      { number: 9, hindi: '1 शमूएल', english: '1 Samuel' },
      { number: 10, hindi: '2 शमूएल', english: '2 Samuel' },
      { number: 11, hindi: '1 राजा', english: '1 Kings' },
      { number: 12, hindi: '2 राजा', english: '2 Kings' },
      { number: 13, hindi: '1 इतिहास', english: '1 Chronicles' },
      { number: 14, hindi: '2 इतिहास', english: '2 Chronicles' },
      { number: 15, hindi: 'एज्रा', english: 'Ezra' },
      { number: 16, hindi: 'नहेमायाह', english: 'Nehemiah' },
      { number: 17, hindi: 'एस्तेर', english: 'Esther' },
      { number: 18, hindi: 'अय्यूब', english: 'Job' },
      { number: 19, hindi: 'भजन संहिता', english: 'Psalms' },
      { number: 20, hindi: 'नीतिवचन', english: 'Proverbs' },
      { number: 21, hindi: 'सभोपदेशक', english: 'Ecclesiastes' },
      { number: 22, hindi: 'श्रेष्ठगीत', english: 'Song of Solomon' },
      { number: 23, hindi: 'यशायाह', english: 'Isaiah' },
      { number: 24, hindi: 'यिर्मयाह', english: 'Jeremiah' },
      { number: 25, hindi: 'विलापगीत', english: 'Lamentations' },
      { number: 26, hindi: 'यहेजकेल', english: 'Ezekiel' },
      { number: 27, hindi: 'दानिय्येल', english: 'Daniel' },
      { number: 28, hindi: 'होशे', english: 'Hosea' },
      { number: 29, hindi: 'योएल', english: 'Joel' },
      { number: 30, hindi: 'आमोस', english: 'Amos' },
      { number: 31, hindi: 'ओबद्याह', english: 'Obadiah' },
      { number: 32, hindi: 'योना', english: 'Jonah' },
      { number: 33, hindi: 'मीका', english: 'Micah' },
      { number: 34, hindi: 'नहूम', english: 'Nahum' },
      { number: 35, hindi: 'हबक्कूक', english: 'Habakkuk' },
      { number: 36, hindi: 'सपन्याह', english: 'Zephaniah' },
      { number: 37, hindi: 'हाग्गै', english: 'Haggai' },
      { number: 38, hindi: 'जकर्याह', english: 'Zechariah' },
      { number: 39, hindi: 'मलाकी', english: 'Malachi' },
    ],
    new: [
      { number: 40, hindi: 'मत्ती', english: 'Matthew' },
      { number: 41, hindi: 'मरकुस', english: 'Mark' },
      { number: 42, hindi: 'लूका', english: 'Luke' },
      { number: 43, hindi: 'यूहन्ना', english: 'John' },
      { number: 44, hindi: 'प्रेरितों के काम', english: 'Acts' },
      { number: 45, hindi: 'रोमियों', english: 'Romans' },
      { number: 46, hindi: '1 कुरिन्थियों', english: '1 Corinthians' },
      { number: 47, hindi: '2 कुरिन्थियों', english: '2 Corinthians' },
      { number: 48, hindi: 'गलातियों', english: 'Galatians' },
      { number: 49, hindi: 'इफिसियों', english: 'Ephesians' },
      { number: 50, hindi: 'फिलिप्पियों', english: 'Philippians' },
      { number: 51, hindi: 'कुलुस्सियों', english: 'Colossians' },
      { number: 52, hindi: '1 थिस्सलुनीकियों', english: '1 Thessalonians' },
      { number: 53, hindi: '2 थिस्सलुनीकियों', english: '2 Thessalonians' },
      { number: 54, hindi: '1 तीमुथियुस', english: '1 Timothy' },
      { number: 55, hindi: '2 तीमुथियुस', english: '2 Timothy' },
      { number: 56, hindi: 'तीतुस', english: 'Titus' },
      { number: 57, hindi: 'फिलेमोन', english: 'Philemon' },
      { number: 58, hindi: 'इब्रानियों', english: 'Hebrews' },
      { number: 59, hindi: 'याकूब', english: 'James' },
      { number: 60, hindi: '1 पतरस', english: '1 Peter' },
      { number: 61, hindi: '2 पतरस', english: '2 Peter' },
      { number: 62, hindi: '1 यूहन्ना', english: '1 John' },
      { number: 63, hindi: '2 यूहन्ना', english: '2 John' },
      { number: 64, hindi: '3 यूहन्ना', english: '3 John' },
      { number: 65, hindi: 'यहूदा', english: 'Jude' },
      { number: 66, hindi: 'प्रकाशितवाक्य', english: 'Revelation' },
    ],
  };


/* ═══════════════════════════════════════════════════════════
   SECTION 3: APPLICATION STATE
   ═══════════════════════════════════════════════════════════ */

const state = {
  bibleData: null,
  hindiBibleData: null,
  englishBibleData: null,
  apiTranslation: null,
  chapterCache: new Map(),
  currentBook: null,
  currentChapter: null,
  currentVerses: [],
  selectedVerses: new Map(),
  history: [],
  autoCopy: true,
  darkMode: true,
  language: 'hindi',
  presentTheme: 'warm-paper',
  presentDisplayMode: 'toggle',
};


/* ═══════════════════════════════════════════════════════════
   SECTION 4: DOM ELEMENTS
   ═══════════════════════════════════════════════════════════ */

const $ = (id) => document.getElementById(id);

const DOM = {
  testamentSelect: $('testament-select'),
  bookSelect: $('book-select'),
  chapterSelect: $('chapter-select'),
  versesSection: $('verses-section'),
  versesTitle: $('verses-title'),
  versesList: $('verses-list'),
  selectAllBtn: $('select-all-btn'),
  clearAllBtn: $('clear-all-btn'),
  copySelectedBtn: $('copy-selected-btn'),
  copiedCardSection: $('copied-card-section'),
  copiedCard: $('copied-card'),
  historySection: $('history-section'),
  historyList: $('history-list'),
  clearHistoryBtn: $('clear-history-btn'),
  themeToggle: $('theme-toggle'),
  autoCopyTgl: $('auto-copy-toggle'),
  languageToggle: $('language-toggle'),
  openPresenterBtn: $('open-presenter-btn'),
  settingsBtn: $('settings-btn'),
  settingsPanel: $('settings-panel'),
  settingsCloseBtn: $('settings-close-btn'),
  presentThemeSelect: $('present-theme-select'),
  presentDisplaySelect: $('present-display-select'),
  badgeCopied: $('badge-copied'),
};


/* ═══════════════════════════════════════════════════════════
   SECTION 4B: SAFE MESSAGING TO BACKGROUND SERVICE WORKER
   ═══════════════════════════════════════════════════════════ */

function sendToPresenter(message) {
  chrome.runtime.sendMessage(message, () => {
    // Silently ignore errors (e.g. background worker not ready, presenter tab not open)
    if (chrome.runtime.lastError) {
      console.debug('Presenter not ready:', chrome.runtime.lastError.message);
    }
  });
}


/* ═══════════════════════════════════════════════════════════
   SECTION 5: UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

function saveState() {
  localStorage.setItem('bibleflow_state', JSON.stringify({
    history: state.history.slice(0, CONFIG.MAX_HISTORY),
    autoCopy: state.autoCopy,
    darkMode: state.darkMode,
    language: state.language,
    presentTheme: state.presentTheme,
    presentDisplayMode: state.presentDisplayMode,
  }));
}

function loadState() {
  try {
    const data = JSON.parse(localStorage.getItem('bibleflow_state'));
    if (data) {
      state.history = data.history || [];
      state.autoCopy = data.autoCopy !== false;
      state.darkMode = data.darkMode !== false;
      state.language = data.language || 'hindi';
      state.presentTheme = data.presentTheme || 'warm-paper';
      state.presentDisplayMode = data.presentDisplayMode || 'toggle';
    }
  } catch (e) {
    // Ignore
  }
}

function relTime(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function flashBadge() {
  DOM.badgeCopied.classList.add('show');
  setTimeout(() => DOM.badgeCopied.classList.remove('show'), CONFIG.COPY_BADGE_MS);
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', state.darkMode ? 'dark' : 'light');
  DOM.themeToggle.textContent = state.darkMode ? '🌙' : '☀️';
}

function applyAutoCopyToggle() {
  DOM.autoCopyTgl.classList.toggle('active', state.autoCopy);
}

function applyLanguageToggle() {
  if (state.language === 'hindi') {
    DOM.languageToggle.textContent = 'हिंदी';
  } else if (state.language === 'english') {
    DOM.languageToggle.textContent = 'EN';
  } else {
    DOM.languageToggle.textContent = 'Both';
  }
}

function getCurrentBiblePath() {
  if (state.language === 'both') return CONFIG.HINDI_BIBLE_PATH;
  return state.language === 'english' ? CONFIG.ENGLISH_BIBLE_PATH : CONFIG.HINDI_BIBLE_PATH;
}

function renderHistory() {
  if (!state.history.length) {
    DOM.historySection.hidden = true;
    return;
  }

  DOM.historySection.hidden = false;
  DOM.historyList.innerHTML = state.history.map((h, i) => `
    <div class="history-item" data-index="${i}">
      <span class="ref">${h.hindiRef}</span>
      <span class="time">${relTime(h.timestamp)}</span>
    </div>
  `).join('');
}


/* ═══════════════════════════════════════════════════════════
   SECTION 6: BIBLE DATA LOADING
   ═══════════════════════════════════════════════════════════ */

async function loadLocalBible() {
  if (state.language === 'both') {
    if (state.hindiBibleData && state.englishBibleData) return state.hindiBibleData;
    try {
      const [hindiRes, englishRes] = await Promise.all([
        fetch(CONFIG.HINDI_BIBLE_PATH),
        fetch(CONFIG.ENGLISH_BIBLE_PATH),
      ]);
      if (hindiRes.ok) state.hindiBibleData = await hindiRes.json();
      if (englishRes.ok) state.englishBibleData = await englishRes.json();
      state.bibleData = state.hindiBibleData;
      return state.hindiBibleData;
    } catch (e) {
      console.warn('Both Bible load failed:', e.message);
      return null;
    }
  }

  const biblePath = getCurrentBiblePath();
  if (state.bibleData) return state.bibleData;

  try {
    const response = await fetch(biblePath);
    if (!response.ok) throw new Error('Failed');

    state.bibleData = await response.json();
    return state.bibleData;
  } catch (e) {
    console.warn('Local Bible load failed:', e.message);
    return null;
  }
}

async function detectTranslation() {
  if (state.apiTranslation) return state.apiTranslation;

  for (const code of CONFIG.API_TRANSLATIONS) {
    try {
      const res = await fetch(`${CONFIG.API_BASE}/get-books/${code}/`, {
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          state.apiTranslation = code;
          return code;
        }
      }
    } catch (e) {
      // Continue
    }
  }
  return null;
}


/* ═══════════════════════════════════════════════════════════
   SECTION 7: DROPDOWN FUNCTIONS
   ═══════════════════════════════════════════════════════════ */

function populateTestamentDropdown() {
  // Already populated
}

function populateBookDropdown(testament) {
  const books = BOOKS_BY_TESTAMENT[testament] || [];

  DOM.bookSelect.innerHTML = '<option value="">Select Book</option>';

  books.forEach(book => {
    const option = document.createElement('option');
    option.value = book.number;
    if (state.language === 'english') {
      option.textContent = book.english;
    } else {
      option.textContent = `${book.hindi} (${book.english})`;
    }
    DOM.bookSelect.appendChild(option);
  });

  DOM.bookSelect.disabled = false;
  DOM.chapterSelect.innerHTML = '<option value="">Select Book First</option>';
  DOM.chapterSelect.disabled = true;
  DOM.versesSection.hidden = true;
}

function populateChapterDropdown(bookNumber) {
  if (!state.bibleData) return;

  const bookIndex = bookNumber - 1;
  const book = state.bibleData.Book?.[bookIndex];

  if (!book || !book.Chapter) {
    DOM.chapterSelect.innerHTML = '<option value="">No chapters found</option>';
    return;
  }

  const numChapters = book.Chapter.length;

  DOM.chapterSelect.innerHTML = '<option value="">Select Chapter</option>';

  for (let i = 1; i <= numChapters; i++) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `Chapter ${i}`;
    DOM.chapterSelect.appendChild(option);
  }

  DOM.chapterSelect.disabled = false;
  DOM.versesSection.hidden = true;
}

async function showVerses(bookNumber, chapter) {
  state.currentBook = bookNumber;
  state.currentChapter = chapter;

  const testament = bookNumber <= 39 ? 'old' : 'new';
  const books = BOOKS_BY_TESTAMENT[testament];
  const bookInfo = books.find(b => b.number === bookNumber);

  const titleBookName = state.language === 'both'
    ? bookInfo.hindi + ' (' + bookInfo.english + ')'
    : state.language === 'english' ? bookInfo.english : bookInfo.hindi;
  DOM.versesTitle.textContent = `${titleBookName} ${chapter}`;

  const bible = await loadLocalBible();

  if (!bible) {
    DOM.versesList.innerHTML = '<div class="verse-item">Failed to load Bible data</div>';
    DOM.versesSection.hidden = false;
    return;
  }

  const bookIndex = bookNumber - 1;
  const book = state.bibleData.Book?.[bookIndex];

  if (!book) {
    DOM.versesList.innerHTML = '<div class="verse-item">Book not found in data</div>';
    DOM.versesSection.hidden = false;
    return;
  }

  const chapterData = book?.Chapter?.[chapter - 1];

  if (!chapterData) {
    DOM.versesList.innerHTML = '<div class="verse-item">Chapter not found</div>';
    DOM.versesSection.hidden = false;
    return;
  }

  const verses = chapterData.Verse || [];

  if (verses.length === 0) {
    try {
      const trans = await detectTranslation();
      if (trans) {
        const url = `${CONFIG.API_BASE}/get-chapter/${trans}/${bookNumber}/${chapter}/`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          state.currentVerses = data;
          renderVersesList(data, chapter);
          return;
        }
      }
    } catch (e) {
      console.warn('API fallback failed:', e.message);
    }

    DOM.versesList.innerHTML = '<div class="verse-item">No verses found</div>';
    return;
  }

  state.currentVerses = verses;
  renderVersesList(verses, chapter);
}

function renderVersesList(verses, chapter) {
  DOM.versesList.innerHTML = '';
  DOM.copiedCardSection.hidden = true;

  state.currentVersesData = verses;

  const testament = state.currentBook <= 39 ? 'old' : 'new';
  const books = BOOKS_BY_TESTAMENT[testament];
  const bookInfo = books.find(b => b.number === state.currentBook);
  const bookName = state.language === 'english' ? bookInfo.english : bookInfo.hindi;

  // For 'both' mode, get English verses too
  let englishVerses = null;
  if (state.language === 'both' && state.englishBibleData) {
    const engBook = state.englishBibleData.Book?.[state.currentBook - 1];
    const engChapter = engBook?.Chapter?.[chapter - 1];
    englishVerses = engChapter?.Verse || null;
  }

  verses.forEach((v, idx) => {
    const verseid = v.Verseid || v.verse;
    const hindiText = v.Verse || v.text || '';

    const verseNum = verseid % 1000;
    if (verseNum === 0) return;

    const verseItem = document.createElement('div');
    verseItem.className = 'verse-item-card';
    verseItem.dataset.verse = verseNum;
    verseItem.dataset.vid = verseid;
    verseItem.dataset.book = state.currentBook;
    verseItem.dataset.chapter = chapter;

    const verseKey = `${state.currentBook}:${chapter}:${verseNum}`;
    const isChecked = state.selectedVerses.has(verseKey);

    let displayText = '';
    let subText = '';

    if (state.language === 'both' && englishVerses) {
      const engVerse = englishVerses[idx];
      const engText = engVerse?.Verse || engVerse?.text || '';
      displayText = hindiText;
      subText = engText;
    } else if (state.language === 'english') {
      displayText = hindiText;
    } else {
      displayText = hindiText;
    }

    verseItem.innerHTML = `
      <label class="verse-checkbox-label">
        <input type="checkbox" class="verse-checkbox" aria-label="Select verse ${verseNum}" ${isChecked ? 'checked' : ''}>
        <span class="checkmark"></span>
      </label>
      <div class="verse-body">
        <div class="verse-text">${displayText}</div>
        ${subText ? `<div class="verse-subtext">${subText}</div>` : ''}
        <div class="verse-ref">† ${bookName} ${chapter}:${verseNum} †</div>
      </div>
    `;

    if (isChecked) {
      verseItem.classList.add('selected');
    }

    let suppressCheckboxChange = false;

    // Build verse data for both handlers
    const engText = subText;
    const bookNameBoth = bookInfo.hindi + ' (' + bookInfo.english + ')';
    function getVerseData() {
      const data = {
        bookNum: state.currentBook,
        chapter,
        verseNum,
        text: hindiText,
        bookName: state.language === 'both' ? bookNameBoth : bookName,
      };
      if (state.language === 'both') {
        data.hindi = hindiText;
        data.english = engText;
      }
      return data;
    }

    verseItem.addEventListener('click', (e) => {
      if (e.target.closest('.verse-checkbox-label')) return;

      const checkbox = verseItem.querySelector('.verse-checkbox');
      checkbox.checked = !checkbox.checked;
      suppressCheckboxChange = true;
      toggleVerseSelection(verseKey, checkbox.checked, verseItem, getVerseData());
      suppressCheckboxChange = false;
    });

    const checkbox = verseItem.querySelector('.verse-checkbox');
    checkbox.addEventListener('change', () => {
      if (suppressCheckboxChange) return;
      toggleVerseSelection(verseKey, checkbox.checked, verseItem, getVerseData());
    });

    DOM.versesList.appendChild(verseItem);
  });

  DOM.versesSection.hidden = false;
}

function toggleVerseSelection(key, isSelected, cardElement, verseData) {
  if (isSelected) {
    state.selectedVerses.set(key, verseData);
    cardElement.classList.add('selected');
    sendToPresenter({ type: 'ADD_VERSE', verse: verseData });
  } else {
    state.selectedVerses.delete(key);
    cardElement.classList.remove('selected');
    sendToPresenter({ type: 'REMOVE_VERSE', key: key });
  }
  updateCopyButton();
  if (state.autoCopy && state.selectedVerses.size > 0) {
    copySelectedVerses();
  }
}

function showCopiedCard(selectedVersesMap) {
  if (selectedVersesMap.size === 0) {
    DOM.copiedCardSection.hidden = true;
    return;
  }

  const crossSymbol = '†';
  const versesContent = Array.from(selectedVersesMap.values()).map(v => {
    let verseText = v.text;
    if (state.language === 'both' && v.hindi && v.english) {
      verseText = v.hindi + '<br><span style="color:var(--text-2);font-size:0.9em">' + v.english + '</span>';
    }
    return `${verseText}<br><span class="copied-ref">${crossSymbol} ${v.bookName} ${v.chapter}:${v.verseNum} ${crossSymbol}</span>`;
  }).join('<br><br>');

  DOM.copiedCard.innerHTML = `<div class="copied-verse-text">${versesContent}</div>`;
  DOM.copiedCardSection.hidden = false;
}

function updateCopyButton() {
  const count = state.selectedVerses.size;
  DOM.copySelectedBtn.disabled = count === 0;
  DOM.copySelectedBtn.textContent = count > 0
    ? `📋 Copy ${count} Verse${count > 1 ? 's' : ''}`
    : '📋 Copy Selected Verses';
}

function selectAllVerses() {
  const items = DOM.versesList.querySelectorAll('.verse-item-card');
  items.forEach(item => {
    const verseNum = parseInt(item.dataset.verse);
    const bookNum = parseInt(item.dataset.book);
    const chapter = parseInt(item.dataset.chapter);
    const verseKey = `${bookNum}:${chapter}:${verseNum}`;
    const hindiText = item.querySelector('.verse-text')?.textContent || '';
    const engText = item.querySelector('.verse-subtext')?.textContent || '';
    const testament = bookNum <= 39 ? 'old' : 'new';
    const books = BOOKS_BY_TESTAMENT[testament];
    const bookInfo = books.find(b => b.number === bookNum);
    const bookName = state.language === 'english' ? bookInfo.english : bookInfo.hindi;
    const bookNameBoth = bookInfo.hindi + ' (' + bookInfo.english + ')';

    const data = {
      bookNum, chapter, verseNum,
      text: hindiText,
      bookName: state.language === 'both' ? bookNameBoth : bookName,
    };
    if (state.language === 'both') {
      data.hindi = hindiText;
      data.english = engText;
    }

    state.selectedVerses.set(verseKey, data);
    item.classList.add('selected');
    const checkbox = item.querySelector('.verse-checkbox');
    if (checkbox) checkbox.checked = true;
  });
  updateCopyButton();
  sendToPresenter({ type: 'SYNC_VERSES', verses: Array.from(state.selectedVerses.values()) });
  if (state.autoCopy && state.selectedVerses.size > 0) {
    copySelectedVerses();
  }
}

function clearAllVerses() {
  const items = DOM.versesList.querySelectorAll('.verse-item-card');
  items.forEach(item => {
    item.classList.remove('selected');
    const checkbox = item.querySelector('.verse-checkbox');
    if (checkbox) checkbox.checked = false;
  });
  state.selectedVerses.clear();
  DOM.copiedCardSection.hidden = true;
  updateCopyButton();
  sendToPresenter({ type: 'CLEAR_VERSES' });
}

async function copySelectedVerses() {
  if (state.selectedVerses.size === 0) return;

  const lines = [];
  const crossSymbol = '†';

  state.selectedVerses.forEach((v) => {
    let verseText = v.text;
    if (state.language === 'both' && v.hindi && v.english) {
      verseText = v.hindi + '\n' + v.english;
    }
    lines.push(`${verseText}\n${crossSymbol} ${v.bookName} ${v.chapter}:${v.verseNum} ${crossSymbol}`);
  });

  const clipboardText = lines.join('\n\n');

  try {
    await navigator.clipboard.writeText(clipboardText);
    flashBadge();
    showCopiedCard(state.selectedVerses);

    const refLabel = state.language === 'english' ? 'verses' : state.language === 'both' ? 'verses' : 'आयतें';

    const groups = new Map();
    state.selectedVerses.forEach((v) => {
      const groupKey = `${v.bookNum}:${v.chapter}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, { bookName: v.bookName, chapter: v.chapter, count: 0 });
      }
      groups.get(groupKey).count++;
    });

    groups.forEach((g, groupKey) => {
      const historyRef = `${g.bookName} ${g.chapter} (${g.count} ${refLabel})`;
      addToHistory(groupKey, historyRef);
    });
  } catch (e) {
    console.error('Copy failed:', e);
  }
}

function addToHistory(reference, hindiRef) {
  state.history = state.history.filter(h => h.reference !== reference);
  state.history.unshift({
    reference,
    hindiRef,
    timestamp: Date.now(),
  });

  if (state.history.length > CONFIG.MAX_HISTORY) {
    state.history.length = CONFIG.MAX_HISTORY;
  }

  saveState();
  renderHistory();
}


/* ═══════════════════════════════════════════════════════════
   SECTION 8: EVENT HANDLERS
   ═══════════════════════════════════════════════════════════ */

function bindEvents() {
  DOM.testamentSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      populateBookDropdown(e.target.value);
    } else {
      DOM.bookSelect.innerHTML = '<option value="">Select Book First</option>';
      DOM.bookSelect.disabled = true;
      DOM.chapterSelect.innerHTML = '<option value="">Select Book First</option>';
      DOM.chapterSelect.disabled = true;
      DOM.versesSection.hidden = true;
    }
  });

  DOM.bookSelect.addEventListener('change', (e) => {
    const bookNumber = parseInt(e.target.value);
    if (bookNumber) {
      state.currentBook = bookNumber;
      populateChapterDropdown(bookNumber);
    } else {
      DOM.chapterSelect.innerHTML = '<option value="">Select Book First</option>';
      DOM.chapterSelect.disabled = true;
      DOM.versesSection.hidden = true;
    }
  });

  DOM.chapterSelect.addEventListener('change', (e) => {
    const chapter = parseInt(e.target.value);
    if (chapter && state.currentBook) {
      showVerses(state.currentBook, chapter);
    } else {
      DOM.versesSection.hidden = true;
    }
  });

  DOM.selectAllBtn.addEventListener('click', selectAllVerses);
  DOM.clearAllBtn.addEventListener('click', clearAllVerses);
  DOM.copySelectedBtn.addEventListener('click', copySelectedVerses);

  DOM.themeToggle.addEventListener('click', () => {
    state.darkMode = !state.darkMode;
    applyTheme();
    saveState();
  });

  DOM.autoCopyTgl.addEventListener('click', () => {
    state.autoCopy = !state.autoCopy;
    applyAutoCopyToggle();
    saveState();
  });

  DOM.languageToggle.addEventListener('click', async () => {
    if (state.language === 'hindi') {
      state.language = 'english';
    } else if (state.language === 'english') {
      state.language = 'both';
    } else {
      state.language = 'hindi';
    }
    applyLanguageToggle();
    state.bibleData = null;
    state.hindiBibleData = null;
    state.englishBibleData = null;
    state.currentVerses = [];
    state.selectedVerses.clear();
    DOM.versesSection.hidden = true;
    sendToPresenter({ type: 'CLEAR_VERSES' });
    await loadLocalBible();
    if (DOM.testamentSelect.value) {
      populateBookDropdown(DOM.testamentSelect.value);
    }
    saveState();
  });

  // Open Presenter Tab button
  if (DOM.openPresenterBtn) {
    DOM.openPresenterBtn.addEventListener('click', () => {
      sendToPresenter({ type: 'OPEN_PRESENTER' });
    });
  }

  // Settings
  DOM.settingsBtn.addEventListener('click', () => {
    DOM.settingsPanel.classList.toggle('hidden');
  });

  DOM.settingsCloseBtn.addEventListener('click', () => {
    DOM.settingsPanel.classList.add('hidden');
  });

  DOM.presentThemeSelect.addEventListener('change', (e) => {
    state.presentTheme = e.target.value;
    saveState();
  });

  DOM.presentDisplaySelect.addEventListener('change', (e) => {
    state.presentDisplayMode = e.target.value;
    saveState();
  });

  // History click
  DOM.historyList.addEventListener('click', (e) => {
    const item = e.target.closest('.history-item');
    if (item) {
      const index = parseInt(item.dataset.index);
      const entry = state.history[index];
      if (entry) {
        const [bookNum, chapter] = entry.reference.split(':').map(Number);

        const testament = bookNum <= 39 ? 'old' : 'new';
        DOM.testamentSelect.value = testament;
        populateBookDropdown(testament);
        DOM.bookSelect.value = bookNum;
        populateChapterDropdown(bookNum);

        setTimeout(() => {
          DOM.chapterSelect.value = chapter;
          showVerses(bookNum, chapter);
        }, 100);
      }
    }
  });

  // Clear history
  DOM.clearHistoryBtn.addEventListener('click', () => {
    state.history = [];
    saveState();
    renderHistory();
  });
}


/* ═══════════════════════════════════════════════════════════
   SECTION 9: INITIALIZATION
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  const overlay = document.getElementById('loading-overlay');
  const retryBtn = document.getElementById('loading-retry-btn');

  function hideOverlay() {
    if (!overlay) return;
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s';
    setTimeout(() => overlay.remove(), 350);
  }

  function showError(msg) {
    if (!overlay) return;
    overlay.classList.add('error');
    const msgEl = overlay.querySelector('.msg');
    if (msgEl) msgEl.textContent = msg || 'Failed to load. Click Retry.';
  }

  if (retryBtn) retryBtn.addEventListener('click', () => location.reload());

  const failTimer = setTimeout(() => showError('Failed to load. Click Retry.'), 8000);

  loadState();

  applyTheme();
  applyAutoCopyToggle();
  applyLanguageToggle();
  renderHistory();

  DOM.presentThemeSelect.value = state.presentTheme;
  DOM.presentDisplaySelect.value = state.presentDisplayMode;

  bindEvents();

  populateTestamentDropdown();

  await loadLocalBible();

  clearTimeout(failTimer);
  hideOverlay();

  console.log('✝ Bible Flow Control Window v5.0 ready');
});
