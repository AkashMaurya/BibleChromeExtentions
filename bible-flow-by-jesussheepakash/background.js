'use strict';

console.log('[BG] Bible Flow background script loaded');

const CONTROL_URL = 'control.html';
const PRESENTER_URL = 'presenter.html';

let controlWindowId = null;
let presenterTabId = null;
let presenterVerses = [];

chrome.action.onClicked.addListener(async (tab) => {
  console.log('[BG] Icon clicked');

  try {
    if (controlWindowId !== null) {
      try {
        const win = await chrome.windows.get(controlWindowId);
        if (win) {
          console.log('[BG] Focusing existing control window', controlWindowId);
          await chrome.windows.update(controlWindowId, { focused: true });
        } else {
          controlWindowId = null;
        }
      } catch (_) {
        controlWindowId = null;
      }
    }

    if (controlWindowId === null) {
      const url = chrome.runtime.getURL(CONTROL_URL);
      console.log('[BG] Creating control window with URL:', url);
      const win = await chrome.windows.create({
        type: 'popup',
        url: url,
        width: 480,
        height: 760,
        focused: true,
      });
      controlWindowId = win.id;
      console.log('[BG] Control window created, id:', controlWindowId);
    }
  } catch (e) {
    console.error('[BG] Failed to open control window:', e.message, e);
  }

  try {
    if (presenterTabId !== null) {
      try {
        const tab = await chrome.tabs.get(presenterTabId);
        if (tab) {
          console.log('[BG] Focusing existing presenter tab', presenterTabId);
          await chrome.tabs.update(presenterTabId, { active: true });
          await chrome.windows.update(tab.windowId, { focused: true });
        } else {
          presenterTabId = null;
        }
      } catch (_) {
        presenterTabId = null;
      }
    }

    if (presenterTabId === null) {
      const url = chrome.runtime.getURL(PRESENTER_URL);
      console.log('[BG] Creating presenter tab with URL:', url);
      const tab = await chrome.tabs.create({ url: url });
      presenterTabId = tab.id;
      console.log('[BG] Presenter tab created, id:', presenterTabId);
    }
  } catch (e) {
    console.error('[BG] Failed to open presenter tab:', e.message, e);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const type = message.type;
  console.log('[BG] Received message:', type);

  if (type === 'ADD_VERSE' || type === 'REMOVE_VERSE' || type === 'CLEAR_VERSES' || type === 'SYNC_VERSES' || type === 'SET_THEME') {
    forwardToPresenter(message);
    if (type === 'SET_THEME') {
      sendResponse({ ok: true });
      return false;
    }
    handleVerseMessage(message);
    sendResponse({ ok: true });
    return false;
  }

  if (type === 'REQUEST_VERSES') {
    sendResponse({ verses: presenterVerses });
    return false;
  }

  if (type === 'OPEN_PRESENTER') {
    chrome.tabs.create({ url: chrome.runtime.getURL(PRESENTER_URL) }).then((tab) => {
      presenterTabId = tab.id;
      sendResponse({ ok: true });
    }).catch((e) => {
      console.error('[BG] OPEN_PRESENTER failed:', e.message);
      sendResponse({ ok: false, error: e.message });
    });
    return true;
  }
});

function handleVerseMessage(message) {
  const type = message.type;

  if (type === 'ADD_VERSE' && message.verse) {
    const key = message.verse.key || `${message.verse.bookNum}:${message.verse.chapter}:${message.verse.verseNum}`;
    const exists = presenterVerses.some(v => (v.key || `${v.bookNum}:${v.chapter}:${v.verseNum}`) === key);
    if (!exists) {
      presenterVerses.push(message.verse);
    }
  } else if (type === 'REMOVE_VERSE' && message.key) {
    presenterVerses = presenterVerses.filter(v => (v.key || `${v.bookNum}:${v.chapter}:${v.verseNum}`) !== message.key);
  } else if (type === 'CLEAR_VERSES') {
    presenterVerses = [];
  } else if (type === 'SYNC_VERSES' && message.verses) {
    presenterVerses = message.verses;
  }
  console.log('[BG] Verses now:', presenterVerses.length);
}

function forwardToPresenter(message) {
  if (presenterTabId === null) return;
  chrome.tabs.sendMessage(presenterTabId, message).catch(() => {});
}

chrome.windows.onRemoved.addListener((windowId) => {
  if (controlWindowId === windowId) {
    console.log('[BG] Control window closed, id:', windowId);
    controlWindowId = null;
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (presenterTabId === tabId) {
    console.log('[BG] Presenter tab closed, id:', tabId);
    presenterTabId = null;
  }
});
