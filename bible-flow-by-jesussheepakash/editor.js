/**
 * ═════════════════════════════════════════════════════════════
 *  Bible Flow — Verse Editor
 *  Cascading dropdown browser: Language → Testament → Book → Chapter
 *  Uses chrome.storage.local for cross-tab live sync with presentation.
 * ═════════════════════════════════════════════════════════════
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'bibleflow_verses';

  /* ═══════════════════════════════════════════════════
     BOOK DATA — Same as popup.js
     ═══════════════════════════════════════════════════ */

  var BOOKS_BY_TESTAMENT = {
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

  /* ═══════════════════════════════════════════════════
     STATE
     ═══════════════════════════════════════════════════ */

  var state = {
    language: null,
    testament: null,
    bookNumber: null,
    chapter: null,
    hindiBible: null,
    englishBible: null,
    savedVerses: [],
    browserCheckboxes: {},
  };

  /* ═══════════════════════════════════════════════════
     DOM
     ═══════════════════════════════════════════════════ */

  var $ = function(id) { return document.getElementById(id); };

  var DOM = {
    langSelect: $('lang-select'),
    testamentSelect: $('testament-select'),
    bookSelect: $('book-select'),
    chapterSelect: $('chapter-select'),
    verseBrowserArea: $('verse-browser-area'),
    verseList: $('verse-list'),
    countBadge: $('count-badge'),
    clearAllBtn: $('clear-all-btn'),
    presentBtn: $('present-btn'),
    toast: $('toast'),
  };

  /* ═══════════════════════════════════════════════════
     UTILITIES
     ═══════════════════════════════════════════════════ */

  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function generateId() {
    return 'v_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  }

  function showToast(msg) {
    DOM.toast.textContent = msg;
    DOM.toast.classList.add('show');
    setTimeout(function() { DOM.toast.classList.remove('show'); }, 2000);
  }

  function getBookName(book) {
    if (state.language === 'english') return book.english;
    if (state.language === 'hindi') return book.hindi;
    return book.english + ' — ' + book.hindi;
  }

  function getBookNameForVerse(book) {
    if (state.language === 'english') return book.english;
    return book.hindi;
  }

  function findBookInfo(bookNumber) {
    var books = BOOKS_BY_TESTAMENT[state.testament] || [];
    for (var i = 0; i < books.length; i++) {
      if (books[i].number === bookNumber) return books[i];
    }
    return null;
  }

  /* ═══════════════════════════════════════════════════
     DATA LOADING
     ═══════════════════════════════════════════════════ */

  function loadHindiBible() {
    if (state.hindiBible) return Promise.resolve(state.hindiBible);
    return fetch('bible.json')
      .then(function(r) { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(function(data) { state.hindiBible = data; return data; })
      .catch(function(e) { console.error('Hindi Bible load failed:', e); return null; });
  }

  function loadEnglishBible() {
    if (state.englishBible) return Promise.resolve(state.englishBible);
    return fetch('english-bible.json')
      .then(function(r) { if (!r.ok) throw new Error('Failed'); return r.json(); })
      .then(function(data) { state.englishBible = data; return data; })
      .catch(function(e) { console.error('English Bible load failed:', e); return null; });
  }

  function loadRequiredBibles() {
    var promises = [];
    if (state.language === 'hindi' || state.language === 'both') {
      promises.push(loadHindiBible());
    }
    if (state.language === 'english' || state.language === 'both') {
      promises.push(loadEnglishBible());
    }
    return Promise.all(promises);
  }

  /* ═══════════════════════════════════════════════════
     DROPDOWN CASCADE
     ═══════════════════════════════════════════════════ */

  function resetTestament() {
    state.testament = null;
    DOM.testamentSelect.innerHTML = '<option value="">Select Testament</option>';
    DOM.testamentSelect.disabled = true;
    resetBook();
  }

  function resetBook() {
    state.bookNumber = null;
    DOM.bookSelect.innerHTML = '<option value="">Select Book</option>';
    DOM.bookSelect.disabled = true;
    resetChapter();
  }

  function resetChapter() {
    state.chapter = null;
    DOM.chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
    DOM.chapterSelect.disabled = true;
    clearBrowser();
  }

  function populateTestament() {
    DOM.testamentSelect.innerHTML = '<option value="">Select Testament</option>' +
      '<option value="old">Old Testament</option>' +
      '<option value="new">New Testament</option>';
    DOM.testamentSelect.disabled = false;
    resetBook();
  }

  function populateBooks() {
    var books = BOOKS_BY_TESTAMENT[state.testament] || [];
    DOM.bookSelect.innerHTML = '<option value="">Select Book</option>';
    books.forEach(function(book) {
      var opt = document.createElement('option');
      opt.value = book.number;
      opt.textContent = getBookName(book);
      DOM.bookSelect.appendChild(opt);
    });
    DOM.bookSelect.disabled = false;
    resetChapter();
  }

  function populateChapters() {
    if (!state.bookNumber) return;

    var bookIndex = state.bookNumber - 1;
    var data = null;
    if (state.language === 'english') {
      data = state.englishBible;
    } else {
      data = state.hindiBible;
    }

    if (!data || !data.Book || !data.Book[bookIndex]) {
      DOM.chapterSelect.innerHTML = '<option value="">No chapters</option>';
      return;
    }

    var chapters = data.Book[bookIndex].Chapter || [];
    DOM.chapterSelect.innerHTML = '<option value="">Select Chapter</option>';
    for (var i = 0; i < chapters.length; i++) {
      var opt = document.createElement('option');
      opt.value = i + 1;
      opt.textContent = 'Chapter ' + (i + 1);
      DOM.chapterSelect.appendChild(opt);
    }
    DOM.chapterSelect.disabled = false;
    clearBrowser();
  }

  /* ═══════════════════════════════════════════════════
     VERSE BROWSER
     ═══════════════════════════════════════════════════ */

  function clearBrowser() {
    state.browserCheckboxes = {};
    DOM.verseBrowserArea.innerHTML =
      '<div class="verse-browser-empty">' +
        '<div class="icon">📖</div>' +
        '<p>Select a chapter to browse verses.</p>' +
      '</div>';
  }

  function showLoading() {
    DOM.verseBrowserArea.innerHTML = '<div class="loading">Loading verses</div>';
  }

  function getChapterVerses(bibleData, bookNumber, chapter) {
    if (!bibleData || !bibleData.Book) return [];
    var book = bibleData.Book[bookNumber - 1];
    if (!book || !book.Chapter) return [];
    var ch = book.Chapter[chapter - 1];
    if (!ch || !ch.Verse) return [];
    return ch.Verse;
  }

  function renderVerseBrowser() {
    var bookIndex = state.bookNumber - 1;
    var bookInfo = findBookInfo(state.bookNumber);
    if (!bookInfo) return;

    var hindiVerses = [];
    var englishVerses = [];

    if (state.language === 'hindi' || state.language === 'both') {
      hindiVerses = getChapterVerses(state.hindiBible, state.bookNumber, state.chapter);
    }
    if (state.language === 'english' || state.language === 'both') {
      englishVerses = getChapterVerses(state.englishBible, state.bookNumber, state.chapter);
    }

    var verseCount = state.language === 'both'
      ? Math.max(hindiVerses.length, englishVerses.length)
      : (state.language === 'hindi' ? hindiVerses.length : englishVerses.length);

    if (verseCount === 0) {
      DOM.verseBrowserArea.innerHTML =
        '<div class="verse-browser-empty">' +
          '<div class="icon">📄</div>' +
          '<p>No verses found in this chapter.</p>' +
        '</div>';
      return;
    }

    var isBoth = state.language === 'both';
    var refPrefix = getBookNameForVerse(bookInfo) + ' ' + state.chapter + ':';

    var html = '<div class="verse-browser-header">' +
      '<span class="section-title" style="margin-bottom:0">' +
        escHtml(getBookName(bookInfo)) + ' ' + state.chapter +
        ' <span style="color:var(--text-muted);font-weight:400;text-transform:none;letter-spacing:0">(' + verseCount + ' verses)</span>' +
      '</span>' +
      '<div class="verse-browser-actions">' +
        '<button class="btn" id="check-all-btn">Check All</button>' +
        '<button class="btn" id="uncheck-all-btn">Uncheck All</button>' +
        '<button class="btn primary" id="add-selected-btn" disabled>Add Selected (0)</button>' +
      '</div>' +
    '</div>' +
    '<div class="verse-browser" id="verse-browser-list">';

    for (var i = 0; i < verseCount; i++) {
      var verseNum = i + 1;
      var verseKey = state.bookNumber + ':' + state.chapter + ':' + verseNum;
      var hindiText = hindiVerses[i] ? (hindiVerses[i].Verse || '') : '';
      var englishText = englishVerses[i] ? (englishVerses[i].Verse || '') : '';

      html += '<div class="verse-card" data-verse-num="' + verseNum + '" data-key="' + verseKey + '">' +
        '<input type="checkbox" data-key="' + verseKey + '" data-num="' + verseNum + '"' +
          ' data-hindi="' + escHtml(hindiText) + '" data-english="' + escHtml(englishText) + '"' +
        '>' +
        '<div class="verse-card-body">';

      if (isBoth) {
        html += '<div class="verse-card-num">' + refPrefix + verseNum + '</div>' +
          '<div class="verse-card-columns">' +
            '<div>' +
              '<div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:2px;text-transform:uppercase;letter-spacing:.05em">English</div>' +
              '<div class="verse-card-text">' + escHtml(englishText) + '</div>' +
            '</div>' +
            '<div>' +
              '<div style="font-size:11px;font-weight:700;color:var(--accent);margin-bottom:2px;text-transform:uppercase;letter-spacing:.05em">Hindi</div>' +
              '<div class="verse-card-hindi">' + escHtml(hindiText) + '</div>' +
            '</div>' +
          '</div>';
      } else if (state.language === 'english') {
        html += '<div class="verse-card-num">' + refPrefix + verseNum + '</div>' +
          '<div class="verse-card-text">' + escHtml(englishText) + '</div>';
      } else {
        html += '<div class="verse-card-num">' + refPrefix + verseNum + '</div>' +
          '<div class="verse-card-text">' + escHtml(hindiText) + '</div>';
      }

      html += '</div></div>';
    }

    html += '</div>';
    DOM.verseBrowserArea.innerHTML = html;

    bindBrowserEvents();
  }

  /* ═══════════════════════════════════════════════════
     BROWSER EVENT BINDINGS
     ═══════════════════════════════════════════════════ */

  function bindBrowserEvents() {
    var browserList = $('verse-browser-list');
    if (!browserList) return;

    var addBtn = $('add-selected-btn');
    var checkAllBtn = $('check-all-btn');
    var uncheckAllBtn = $('uncheck-all-btn');

    // Checkbox changes
    browserList.addEventListener('change', function(e) {
      if (e.target.type !== 'checkbox') return;
      var card = e.target.closest('.verse-card');
      if (card) card.classList.toggle('checked', e.target.checked);
      updateAddButton();
    });

    // Card click toggles checkbox
    browserList.addEventListener('click', function(e) {
      if (e.target.type === 'checkbox') return;
      var card = e.target.closest('.verse-card');
      if (!card) return;
      var cb = card.querySelector('input[type="checkbox"]');
      if (cb) {
        cb.checked = !cb.checked;
        card.classList.toggle('checked', cb.checked);
        updateAddButton();
      }
    });

    // Check all
    if (checkAllBtn) {
      checkAllBtn.addEventListener('click', function() {
        var cbs = browserList.querySelectorAll('input[type="checkbox"]');
        cbs.forEach(function(cb) { cb.checked = true; });
        browserList.querySelectorAll('.verse-card').forEach(function(c) { c.classList.add('checked'); });
        updateAddButton();
      });
    }

    // Uncheck all
    if (uncheckAllBtn) {
      uncheckAllBtn.addEventListener('click', function() {
        var cbs = browserList.querySelectorAll('input[type="checkbox"]');
        cbs.forEach(function(cb) { cb.checked = false; });
        browserList.querySelectorAll('.verse-card').forEach(function(c) { c.classList.remove('checked'); });
        updateAddButton();
      });
    }

    // Add selected
    if (addBtn) {
      addBtn.addEventListener('click', addSelectedVerses);
    }
  }

  function updateAddButton() {
    var addBtn = $('add-selected-btn');
    if (!addBtn) return;
    var cbs = document.querySelectorAll('#verse-browser-list input[type="checkbox"]:checked');
    var count = cbs.length;
    addBtn.textContent = 'Add Selected (' + count + ')';
    addBtn.disabled = count === 0;
  }

  /* ═══════════════════════════════════════════════════
     ADD / REMOVE VERSES
     ═══════════════════════════════════════════════════ */

  function addSelectedVerses() {
    var checked = document.querySelectorAll('#verse-browser-list input[type="checkbox"]:checked');
    if (checked.length === 0) return;

    var bookInfo = findBookInfo(state.bookNumber);
    if (!bookInfo) return;

    var added = 0;
    checked.forEach(function(cb) {
      var key = cb.dataset.key;
      var num = parseInt(cb.dataset.num);
      var hindiText = cb.dataset.hindi || '';
      var englishText = cb.dataset.english || '';

      // Check for duplicates
      var exists = state.savedVerses.some(function(v) {
        return v.bookNum === state.bookNumber && v.chapter === state.chapter && v.verseNum === num;
      });
      if (exists) return;

      var refHindi = bookInfo.hindi + ' ' + state.chapter + ':' + num;
      var refEnglish = bookInfo.english + ' ' + state.chapter + ':' + num;

      state.savedVerses.push({
        id: generateId(),
        reference: refEnglish,
        referenceHindi: refHindi,
        english: englishText,
        hindi: hindiText,
        bookNum: state.bookNumber,
        chapter: state.chapter,
        verseNum: num,
      });
      added++;
    });

    if (added > 0) {
      saveVerses();
      renderSavedList();
      showToast(added + ' verse' + (added > 1 ? 's' : '') + ' added!');
    } else {
      showToast('Verses already saved');
    }

    // Uncheck all after adding
    var cbs = document.querySelectorAll('#verse-browser-list input[type="checkbox"]');
    cbs.forEach(function(cb) { cb.checked = false; });
    document.querySelectorAll('#verse-browser-list .verse-card').forEach(function(c) { c.classList.remove('checked'); });
    updateAddButton();
  }

  function removeVerse(id) {
    state.savedVerses = state.savedVerses.filter(function(v) { return v.id !== id; });
    saveVerses();
    renderSavedList();
    showToast('Verse removed');
  }

  function clearAll() {
    if (state.savedVerses.length === 0) return;
    if (!confirm('Remove all ' + state.savedVerses.length + ' verses?')) return;
    state.savedVerses = [];
    saveVerses();
    renderSavedList();
    showToast('All verses cleared');
  }

  /* ═══════════════════════════════════════════════════
     SAVED LIST (RIGHT PANEL)
     ═══════════════════════════════════════════════════ */

  function renderSavedList() {
    DOM.countBadge.textContent = state.savedVerses.length + ' verse' + (state.savedVerses.length !== 1 ? 's' : '');

    if (state.savedVerses.length === 0) {
      DOM.verseList.innerHTML =
        '<div class="empty-state">' +
          '<p>No verses saved yet. Browse and add verses from the left panel.</p>' +
        '</div>';
      return;
    }

    DOM.verseList.innerHTML = state.savedVerses.map(function(v) {
      return '<div class="verse-item" data-id="' + escHtml(v.id) + '">' +
        '<div class="verse-body">' +
          '<div class="verse-ref">' + escHtml(v.referenceHindi || v.reference) + '</div>' +
          (v.english ? '<div class="verse-text">' + escHtml(v.english) + '</div>' : '') +
          (v.hindi ? '<div class="verse-hindi">' + escHtml(v.hindi) + '</div>' : '') +
        '</div>' +
        '<div class="verse-actions">' +
          '<button class="icon-btn danger remove-btn" data-id="' + escHtml(v.id) + '" title="Remove">✕</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  /* ═══════════════════════════════════════════════════
     STORAGE
     ═══════════════════════════════════════════════════ */

  function loadVerses() {
    chrome.storage.local.get(STORAGE_KEY, function(result) {
      state.savedVerses = Array.isArray(result[STORAGE_KEY]) ? result[STORAGE_KEY] : [];
      renderSavedList();
    });
  }

  function saveVerses() {
    var data = {};
    data[STORAGE_KEY] = state.savedVerses;
    chrome.storage.local.set(data);
  }

  /* ═══════════════════════════════════════════════════
     EVENT BINDINGS
     ═══════════════════════════════════════════════════ */

  function bindEvents() {
    // Language change
    DOM.langSelect.addEventListener('change', function() {
      var val = DOM.langSelect.value;
      if (!val) {
        state.language = null;
        resetTestament();
        return;
      }
      state.language = val;
      showLoading();

      loadRequiredBibles().then(function() {
        populateTestament();
        DOM.verseBrowserArea.innerHTML =
          '<div class="verse-browser-empty">' +
            '<div class="icon">📖</div>' +
            '<p>Select a chapter to browse verses.</p>' +
          '</div>';
      });
    });

    // Testament change
    DOM.testamentSelect.addEventListener('change', function() {
      var val = DOM.testamentSelect.value;
      if (!val) {
        state.testament = null;
        resetBook();
        return;
      }
      state.testament = val;
      populateBooks();
    });

    // Book change
    DOM.bookSelect.addEventListener('change', function() {
      var val = DOM.bookSelect.value;
      if (!val) {
        state.bookNumber = null;
        resetChapter();
        return;
      }
      state.bookNumber = parseInt(val);
      populateChapters();
    });

    // Chapter change
    DOM.chapterSelect.addEventListener('change', function() {
      var val = DOM.chapterSelect.value;
      if (!val) {
        state.chapter = null;
        clearBrowser();
        return;
      }
      state.chapter = parseInt(val);
      showLoading();
      // Small delay to show loading state
      setTimeout(function() {
        renderVerseBrowser();
      }, 50);
    });

    // Saved verse list — remove button
    DOM.verseList.addEventListener('click', function(e) {
      var btn = e.target.closest('.remove-btn');
      if (btn) removeVerse(btn.dataset.id);
    });

    // Clear all
    DOM.clearAllBtn.addEventListener('click', clearAll);

    // Present — open presentation in new tab
    DOM.presentBtn.addEventListener('click', function() {
      chrome.tabs.create({ url: chrome.runtime.getURL('presenter.html') });
    });
  }

  /* ═══════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════ */

  function init() {
    bindEvents();
    loadVerses();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
