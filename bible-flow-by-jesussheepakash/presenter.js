/**
 * Bible Flow — Presenter Tab
 * Displays verses with word-level highlight, annotation tools,
 * move/drag tool, text/shape/image tools, vertical scroll,
 * previous/next navigation, and sidebar toggle.
 */
(function() {
  'use strict';

  var STORAGE_KEY = 'bibleflow_presenter_verses';
  var HL_STORAGE_KEY = 'bibleflow_word_highlights';

  /* ═══════════════════════════════════════════════════
     STATE
     ═══════════════════════════════════════════════════ */

  var state = {
    verses: [],
    activeIndex: 0,
    drawMode: false,
    tool: 'pen',
    color: '#FFD700',
    highlightColor: '#FFEB3B',
    sidebarVisible: true,
    strokes: [],
    currentStroke: null,
    wordHighlights: {},
    moveTarget: null,
    moveOffset: null,
  };

  /* ═══════════════════════════════════════════════════
     DOM
     ═══════════════════════════════════════════════════ */

  var $ = function(id) { return document.getElementById(id); };

  var DOM = {
    verseCount: $('verse-count'),
    sidebar: $('sidebar'),
    sidebarList: $('sidebar-list'),
    sidebarEmpty: $('sidebar-empty'),
    verseDisplay: $('verse-display'),
    versePlaceholder: $('verse-placeholder'),
    verseContent: $('verse-content'),
    verseRef: $('verse-ref'),
    verseText: $('verse-text'),
    verseHindi: $('verse-hindi'),
    canvas: $('annotation-canvas'),
    displayArea: $('display-area'),
    textInput: $('canvas-text-input'),
    btnToggleSidebar: $('btn-toggle-sidebar'),
    btnPrev: $('btn-prev'),
    btnNext: $('btn-next'),
    navLabel: $('nav-label'),
    navGroup: $('nav-group'),
    btnHighlight: $('btn-highlight'),
    highlightColors: $('highlight-colors'),
    btnDrawMode: $('btn-draw-mode'),
    btnPen: $('btn-pen'),
    btnHighlighter: $('btn-highlighter'),
    btnEraser: $('btn-eraser'),
    btnTextTool: $('btn-text-tool'),
    btnRect: $('btn-rect'),
    btnLine: $('btn-line'),
    btnMove: $('btn-move'),
    btnClearDrawing: $('btn-clear-drawing'),
    btnCapture: $('btn-capture'),
    btnRemoveVerse: $('btn-remove-verse'),
    btnClearAll: $('btn-clear-all'),
    toolGroup: $('tool-group'),
    colorSwatches: $('color-swatches'),
    statusDraw: $('status-draw'),
    statusText: $('status-text'),
  };

  /* ═══════════════════════════════════════════════════
     CANVAS SETUP
     ═══════════════════════════════════════════════════ */

  var ctx = DOM.canvas.getContext('2d');
  var canvasDrawing = false;

  function resizeCanvas() {
    var rect = DOM.displayArea.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    DOM.canvas.width = rect.width * dpr;
    DOM.canvas.height = rect.height * dpr;
    DOM.canvas.style.width = rect.width + 'px';
    DOM.canvas.style.height = rect.height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redrawCanvas();
  }

  function redrawCanvas() {
    ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
    state.strokes.forEach(function(stroke) {
      drawStroke(stroke);
    });
  }

  function drawStroke(stroke) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 30;
      ctx.beginPath();
      stroke.points.forEach(function(p, i) {
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    } else if (stroke.tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 24;
      ctx.beginPath();
      stroke.points.forEach(function(p, i) {
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    } else if (stroke.tool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      stroke.points.forEach(function(p, i) {
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    } else if (stroke.tool === 'rect') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 3;
      if (stroke.points.length >= 2) {
        var s = stroke.points[0];
        var e = stroke.points[stroke.points.length - 1];
        ctx.strokeRect(s.x, s.y, e.x - s.x, e.y - s.y);
      }
    } else if (stroke.tool === 'line') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = 3;
      if (stroke.points.length >= 2) {
        var s = stroke.points[0];
        var e = stroke.points[stroke.points.length - 1];
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(e.x, e.y);
        ctx.stroke();
      }
    } else if (stroke.tool === 'text') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = stroke.color;
      ctx.font = (stroke.fontSize || 24) + 'px "Segoe UI", system-ui, sans-serif';
      if (stroke.points.length > 0) {
        ctx.fillText(stroke.text || '', stroke.points[0].x, stroke.points[0].y);
      }
    } else if (stroke.tool === 'image') {
      ctx.globalCompositeOperation = 'source-over';
      if (stroke.imgEl && stroke.points.length > 0) {
        var p = stroke.points[0];
        ctx.drawImage(stroke.imgEl, p.x, p.y, stroke.imgW || 200, stroke.imgH || 200);
      }
    }

    ctx.restore();
  }

  /* ═══════════════════════════════════════════════════
     STROKE BOUNDING BOX (for hit-testing)
     ═══════════════════════════════════════════════════ */

  function getStrokeBBox(stroke) {
    if (!stroke || !stroke.points || stroke.points.length === 0) return null;

    if (stroke.tool === 'text') {
      var p = stroke.points[0];
      var w = (stroke.text || '').length * (stroke.fontSize || 24) * 0.6;
      var h = (stroke.fontSize || 24) * 1.3;
      return { x: p.x, y: p.y - h, w: w, h: h };
    }

    if (stroke.tool === 'image') {
      var p = stroke.points[0];
      return { x: p.x, y: p.y, w: stroke.imgW || 200, h: stroke.imgH || 200 };
    }

    if (stroke.tool === 'rect') {
      var s = stroke.points[0];
      var e = stroke.points[stroke.points.length - 1];
      var x = Math.min(s.x, e.x);
      var y = Math.min(s.y, e.y);
      return { x: x, y: y, w: Math.abs(e.x - s.x), h: Math.abs(e.y - s.y) };
    }

    if (stroke.tool === 'line') {
      var s = stroke.points[0];
      var e = stroke.points[stroke.points.length - 1];
      var x = Math.min(s.x, e.x);
      var y = Math.min(s.y, e.y);
      return { x: x, y: y, w: Math.abs(e.x - s.x) || 10, h: Math.abs(e.y - s.y) || 10 };
    }

    // pen / highlighter / eraser — bounding box of all points
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    stroke.points.forEach(function(p) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    });
    var pad = stroke.tool === 'eraser' ? 15 : (stroke.tool === 'highlighter' ? 12 : 5);
    return { x: minX - pad, y: minY - pad, w: (maxX - minX) + pad * 2, h: (maxY - minY) + pad * 2 };
  }

  function pointInBBox(x, y, bbox) {
    if (!bbox) return false;
    return x >= bbox.x && x <= bbox.x + bbox.w && y >= bbox.y && y <= bbox.y + bbox.h;
  }

  function hitTestStroke(x, y) {
    for (var i = state.strokes.length - 1; i >= 0; i--) {
      var bbox = getStrokeBBox(state.strokes[i]);
      if (pointInBBox(x, y, bbox)) return i;
    }
    return -1;
  }

  /* ═══════════════════════════════════════════════════
     CANVAS POINTER EVENTS
     ═══════════════════════════════════════════════════ */

  function getCanvasPos(e) {
    var rect = DOM.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function onPointerDown(e) {
    if (!state.drawMode) return;
    e.preventDefault();
    var pos = getCanvasPos(e);

    if (state.tool === 'text') {
      showTextInput(pos.x, pos.y);
      return;
    }

    if (state.tool === 'move') {
      var idx = hitTestStroke(pos.x, pos.y);
      if (idx >= 0) {
        state.moveTarget = idx;
        state.moveOffset = { x: pos.x, y: pos.y };
        canvasDrawing = true;
      }
      return;
    }

    if (state.tool === 'rect' || state.tool === 'line') {
      canvasDrawing = true;
      state.currentStroke = {
        tool: state.tool,
        color: state.color,
        points: [pos],
      };
      return;
    }

    canvasDrawing = true;
    state.currentStroke = {
      tool: state.tool,
      color: state.color,
      points: [pos],
    };
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function onPointerMove(e) {
    if (!canvasDrawing) return;
    e.preventDefault();
    var pos = getCanvasPos(e);

    // Move tool — drag existing stroke
    if (state.tool === 'move' && state.moveTarget !== null && state.moveOffset) {
      var dx = pos.x - state.moveOffset.x;
      var dy = pos.y - state.moveOffset.y;
      var stroke = state.strokes[state.moveTarget];
      if (stroke && stroke.points) {
        stroke.points.forEach(function(p) {
          p.x += dx;
          p.y += dy;
        });
        state.moveOffset = { x: pos.x, y: pos.y };
        redrawCanvas();
      }
      return;
    }

    if (!state.currentStroke) return;

    if (state.tool === 'rect' || state.tool === 'line') {
      state.currentStroke.points[1] = pos;
      redrawCanvas();
      drawStroke(state.currentStroke);
      return;
    }

    state.currentStroke.points.push(pos);

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (state.currentStroke.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.lineWidth = 30;
    } else if (state.currentStroke.tool === 'highlighter') {
      ctx.globalAlpha = 0.3;
      ctx.strokeStyle = state.currentStroke.color;
      ctx.lineWidth = 24;
    } else {
      ctx.strokeStyle = state.currentStroke.color;
      ctx.lineWidth = 3;
    }

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.restore();
  }

  function onPointerUp(e) {
    if (!canvasDrawing) return;
    canvasDrawing = false;

    // Move tool — finalize
    if (state.tool === 'move') {
      state.moveTarget = null;
      state.moveOffset = null;
      return;
    }

    if (state.currentStroke) {
      state.strokes.push(state.currentStroke);
      state.currentStroke = null;
    }
  }

  /* ═══════════════════════════════════════════════════
     TEXT TOOL
     ═══════════════════════════════════════════════════ */

  function showTextInput(x, y) {
    DOM.textInput.style.display = 'block';
    DOM.textInput.style.left = x + 'px';
    DOM.textInput.style.top = y + 'px';
    DOM.textInput.style.color = state.color;
    DOM.textInput.value = '';
    DOM.textInput.focus();
  }

  function commitTextInput() {
    var text = DOM.textInput.value.trim();
    if (!text) {
      DOM.textInput.style.display = 'none';
      return;
    }

    var x = parseInt(DOM.textInput.style.left) || 0;
    var y = parseInt(DOM.textInput.style.top) || 0;

    state.strokes.push({
      tool: 'text',
      color: state.color,
      text: text,
      fontSize: 24,
      points: [{ x: x, y: y + 24 }],
    });

    DOM.textInput.style.display = 'none';
    DOM.textInput.value = '';
    redrawCanvas();
  }

  /* ═══════════════════════════════════════════════════
     IMAGE PASTE
     ═══════════════════════════════════════════════════ */

  function onPaste(e) {
    var items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        var blob = items[i].getAsFile();
        var reader = new FileReader();
        reader.onload = function(ev) {
          var img = new Image();
          img.onload = function() {
            var cx = DOM.displayArea.offsetWidth / 2 - 100;
            var cy = DOM.displayArea.offsetHeight / 2 - 100;
            var maxDim = 400;
            var w = img.width;
            var h = img.height;
            if (w > maxDim || h > maxDim) {
              var scale = maxDim / Math.max(w, h);
              w = Math.round(w * scale);
              h = Math.round(h * scale);
            }
            state.strokes.push({
              tool: 'image',
              color: '#ffffff',
              imgEl: img,
              imgW: w,
              imgH: h,
              points: [{ x: cx, y: cy }],
            });
            redrawCanvas();
          };
          img.src = ev.target.result;
        };
        reader.readAsDataURL(blob);
        break;
      }
    }
  }

  /* ═══════════════════════════════════════════════════
     VERSE QUEUE MANAGEMENT
     ═══════════════════════════════════════════════════ */

  function verseKey(v) {
    return v.key || (v.bookNum + ':' + v.chapter + ':' + v.verseNum);
  }

  function addVerse(verse) {
    var key = verseKey(verse);
    var exists = state.verses.some(function(v) { return verseKey(v) === key; });
    if (exists) return;

    state.verses.push({
      key: key,
      bookNum: verse.bookNum,
      chapter: verse.chapter,
      verseNum: verse.verseNum,
      text: verse.text || '',
      bookName: verse.bookName || '',
      english: verse.english || '',
      hindi: verse.hindi || '',
    });

    if (state.verses.length === 1) {
      state.activeIndex = 0;
    }

    render();
    saveToStorage();
  }

  function removeVerseByKey(key) {
    var idx = state.verses.findIndex(function(v) { return verseKey(v) === key; });
    if (idx === -1) return;

    state.verses.splice(idx, 1);
    delete state.wordHighlights[key];

    if (state.verses.length === 0) {
      state.activeIndex = 0;
    } else if (state.activeIndex >= state.verses.length) {
      state.activeIndex = state.verses.length - 1;
    } else if (idx < state.activeIndex) {
      state.activeIndex--;
    } else if (idx === state.activeIndex && state.activeIndex > 0) {
      state.activeIndex--;
    }

    render();
    saveToStorage();
  }

  function clearAllVerses() {
    state.verses = [];
    state.activeIndex = 0;
    state.wordHighlights = {};
    clearDrawing();
    render();
    saveToStorage();
  }

  function removeActiveVerse() {
    if (state.verses.length === 0) return;
    var key = verseKey(state.verses[state.activeIndex]);
    removeVerseByKey(key);
  }

  function setActive(index) {
    if (index < 0 || index >= state.verses.length) return;
    state.activeIndex = index;
    clearDrawing();
    render();
  }

  function goNext() {
    if (state.activeIndex < state.verses.length - 1) {
      setActive(state.activeIndex + 1);
    }
  }

  function goPrev() {
    if (state.activeIndex > 0) {
      setActive(state.activeIndex - 1);
    }
  }

  function syncVerses(verses) {
    state.verses = verses || [];
    if (state.activeIndex >= state.verses.length) {
      state.activeIndex = Math.max(0, state.verses.length - 1);
    }
    render();
    saveToStorage();
  }

  /* ═══════════════════════════════════════════════════
     WORD-LEVEL HIGHLIGHT
     ═══════════════════════════════════════════════════ */

  function highlightSelectedWords() {
    if (state.verses.length === 0) return;
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;

    var range = sel.getRangeAt(0);
    var verseContent = DOM.verseContent;
    if (!verseContent.contains(range.commonAncestorContainer)) return;

    var text = range.toString().trim();
    if (!text) return;

    var key = verseKey(state.verses[state.activeIndex]);
    if (!state.wordHighlights[key]) {
      state.wordHighlights[key] = [];
    }

    // Check if this exact text is already highlighted — if so, remove it
    var existing = state.wordHighlights[key].findIndex(function(h) { return h.text === text; });
    if (existing >= 0) {
      state.wordHighlights[key].splice(existing, 1);
    } else {
      state.wordHighlights[key].push({ text: text, color: state.highlightColor });
    }

    sel.removeAllRanges();
    applyWordHighlights();
    saveToStorage();
  }

  function applyWordHighlights() {
    if (state.verses.length === 0) return;
    var key = verseKey(state.verses[state.activeIndex]);
    var highlights = state.wordHighlights[key] || [];

    // Reset both verse elements to plain text first
    DOM.verseText.textContent = DOM.verseText.textContent;
    DOM.verseHindi.textContent = DOM.verseHindi.textContent;

    if (highlights.length === 0) return;

    // Apply highlights to both verse text elements
    [DOM.verseText, DOM.verseHindi].forEach(function(el) {
      if (!el.textContent) return;
      var html = el.textContent;

      highlights.forEach(function(hl) {
        // Escape the highlight text for use in regex
        var escaped = hl.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        var regex = new RegExp('(' + escaped + ')', 'gi');
        html = html.replace(regex, '<mark class="word-hl" style="background:' + hl.color + ';color:#000;padding:1px 3px;border-radius:3px">$1</mark>');
      });

      el.innerHTML = html;
    });
  }

  function clearHighlights() {
    if (state.verses.length === 0) return;
    var key = verseKey(state.verses[state.activeIndex]);
    delete state.wordHighlights[key];
    applyWordHighlights();
    saveToStorage();
  }

  /* ═══════════════════════════════════════════════════
     SIDEBAR TOGGLE
     ═══════════════════════════════════════════════════ */

  function toggleSidebar() {
    state.sidebarVisible = !state.sidebarVisible;
    DOM.sidebar.classList.toggle('hidden', !state.sidebarVisible);
    setTimeout(resizeCanvas, 300);
  }

  /* ═══════════════════════════════════════════════════
     RENDERING
     ═══════════════════════════════════════════════════ */

  function render() {
    renderSidebar();
    renderActiveVerse();
    renderNav();
    DOM.verseCount.textContent = state.verses.length + ' verse' + (state.verses.length !== 1 ? 's' : '');
  }

  function renderNav() {
    var hasMultiple = state.verses.length > 1;
    DOM.navGroup.style.display = hasMultiple ? 'flex' : 'none';
    DOM.navLabel.textContent = (state.verses.length > 0 ? (state.activeIndex + 1) : 0) + ' / ' + state.verses.length;
  }

  function renderSidebar() {
    if (state.verses.length === 0) {
      DOM.sidebarEmpty.style.display = 'block';
      var items = DOM.sidebarList.querySelectorAll('.queue-item');
      items.forEach(function(item) { item.remove(); });
      return;
    }

    DOM.sidebarEmpty.style.display = 'none';

    var html = '';
    state.verses.forEach(function(v, i) {
      var isActive = i === state.activeIndex;
      var displayText = v.english || v.text || '';
      html += '<div class="queue-item' + (isActive ? ' active' : '') + '" data-index="' + i + '">' +
        '<div class="queue-ref">† ' + escHtml(v.bookName) + ' ' + v.chapter + ':' + v.verseNum + ' †</div>' +
        '<div class="queue-text">' + escHtml(displayText) + '</div>' +
      '</div>';
    });

    var scrollTop = DOM.sidebarList.scrollTop;
    var items = DOM.sidebarList.querySelectorAll('.queue-item');
    items.forEach(function(item) { item.remove(); });
    DOM.sidebarList.insertAdjacentHTML('beforeend', html);
    DOM.sidebarList.scrollTop = scrollTop;
  }

  function renderActiveVerse() {
    if (state.verses.length === 0) {
      DOM.versePlaceholder.style.display = 'block';
      DOM.verseContent.style.display = 'none';
      return;
    }

    DOM.versePlaceholder.style.display = 'none';
    DOM.verseContent.style.display = 'block';

    var v = state.verses[state.activeIndex];
    DOM.verseRef.textContent = '† ' + v.bookName + ' ' + v.chapter + ':' + v.verseNum + ' †';
    DOM.verseText.textContent = v.english || v.text || '';
    DOM.verseHindi.textContent = v.hindi || '';
    DOM.verseHindi.style.display = v.hindi ? 'block' : 'none';

    applyWordHighlights();
  }

  /* ═══════════════════════════════════════════════════
     DRAWING CONTROLS
     ═══════════════════════════════════════════════════ */

  function toggleDrawMode() {
    state.drawMode = !state.drawMode;
    DOM.canvas.classList.toggle('draw-mode', state.drawMode);
    DOM.btnDrawMode.classList.toggle('active', state.drawMode);
    DOM.toolGroup.style.display = state.drawMode ? 'flex' : 'none';
    DOM.colorSwatches.style.display = state.drawMode ? 'flex' : 'none';
    DOM.btnClearDrawing.style.display = state.drawMode ? 'inline-flex' : 'none';
    DOM.statusDraw.style.display = state.drawMode ? 'inline' : 'none';

    // Enable vertical scroll when draw mode is ON
    if (state.drawMode) {
      DOM.displayArea.style.overflowY = 'auto';
    } else {
      DOM.displayArea.style.overflowY = 'hidden';
      DOM.displayArea.scrollTop = 0;
    }
    setTimeout(resizeCanvas, 50);
  }

  function setTool(tool) {
    state.tool = tool;
    DOM.btnPen.classList.toggle('active', tool === 'pen');
    DOM.btnHighlighter.classList.toggle('active', tool === 'highlighter');
    DOM.btnEraser.classList.toggle('active', tool === 'eraser');
    DOM.btnTextTool.classList.toggle('active', tool === 'text');
    DOM.btnRect.classList.toggle('active', tool === 'rect');
    DOM.btnLine.classList.toggle('active', tool === 'line');
    DOM.btnMove.classList.toggle('active', tool === 'move');

    if (tool === 'eraser') {
      DOM.canvas.style.cursor = 'cell';
    } else if (tool === 'text') {
      DOM.canvas.style.cursor = 'text';
    } else if (tool === 'move') {
      DOM.canvas.style.cursor = 'grab';
    } else {
      DOM.canvas.style.cursor = 'crosshair';
    }
  }

  function setColor(color) {
    state.color = color;
    var swatches = DOM.colorSwatches.querySelectorAll('.swatch');
    swatches.forEach(function(s) {
      s.classList.toggle('active', s.dataset.color === color);
    });
  }

  function clearDrawing() {
    state.strokes = [];
    state.currentStroke = null;
    ctx.clearRect(0, 0, DOM.canvas.width, DOM.canvas.height);
  }

  /* ═══════════════════════════════════════════════════
     CAPTURE
     ═══════════════════════════════════════════════════ */

  function captureTab() {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, function(dataUrl) {
      if (chrome.runtime.lastError) {
        DOM.statusText.textContent = 'Capture failed: ' + chrome.runtime.lastError.message;
        return;
      }
      var a = document.createElement('a');
      a.href = dataUrl;
      var ref = state.verses.length > 0
        ? state.verses[state.activeIndex].bookName + '_' + state.verses[state.activeIndex].chapter + ':' + state.verses[state.activeIndex].verseNum
        : 'verse';
      a.download = 'bible-flow-' + ref.replace(/\s+/g, '-') + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      DOM.statusText.textContent = 'Screenshot saved!';
      setTimeout(function() { DOM.statusText.textContent = 'Ready'; }, 2000);
    });
  }

  /* ═══════════════════════════════════════════════════
     STORAGE
     ═══════════════════════════════════════════════════ */

  function saveToStorage() {
    var toSave = state.verses.map(function(v) {
      var copy = {};
      for (var k in v) { if (v.hasOwnProperty(k) && k !== 'imgEl') copy[k] = v[k]; }
      return copy;
    });
    chrome.storage.local.set({
      [STORAGE_KEY]: toSave,
      [HL_STORAGE_KEY]: state.wordHighlights,
    });
  }

  function loadFromStorage(callback) {
    chrome.runtime.sendMessage({ type: 'REQUEST_VERSES' }, function(response) {
      if (chrome.runtime.lastError || !response) {
        chrome.storage.local.get([STORAGE_KEY, HL_STORAGE_KEY], function(result) {
          var verses = result[STORAGE_KEY];
          if (Array.isArray(verses) && verses.length > 0) {
            state.verses = verses;
            state.activeIndex = 0;
          }
          if (result[HL_STORAGE_KEY]) {
            state.wordHighlights = result[HL_STORAGE_KEY];
          }
          render();
          if (callback) callback();
        });
        return;
      }
      if (response && Array.isArray(response.verses) && response.verses.length > 0) {
        state.verses = response.verses;
        state.activeIndex = 0;
      }
      chrome.storage.local.get(HL_STORAGE_KEY, function(result) {
        if (result[HL_STORAGE_KEY]) {
          state.wordHighlights = result[HL_STORAGE_KEY];
        }
        render();
        if (callback) callback();
      });
    });
  }

  /* ═══════════════════════════════════════════════════
     CHROME MESSAGING
     ═══════════════════════════════════════════════════ */

  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if (msg.type === 'ADD_VERSE') {
      addVerse(msg.verse);
      sendResponse({ ok: true });
    } else if (msg.type === 'REMOVE_VERSE') {
      removeVerseByKey(msg.key);
      sendResponse({ ok: true });
    } else if (msg.type === 'CLEAR_VERSES') {
      clearAllVerses();
      sendResponse({ ok: true });
    } else if (msg.type === 'SYNC_VERSES') {
      syncVerses(msg.verses);
      sendResponse({ ok: true });
    }
  });

  /* ═══════════════════════════════════════════════════
     UTILS
     ═══════════════════════════════════════════════════ */

  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }

  /* ═══════════════════════════════════════════════════
     EVENT BINDINGS
     ═══════════════════════════════════════════════════ */

  function bindEvents() {
    DOM.btnToggleSidebar.addEventListener('click', toggleSidebar);

    DOM.btnPrev.addEventListener('click', goPrev);
    DOM.btnNext.addEventListener('click', goNext);

    DOM.btnHighlight.addEventListener('click', highlightSelectedWords);
    DOM.highlightColors.addEventListener('click', function(e) {
      var swatch = e.target.closest('.hl-swatch');
      if (!swatch) return;
      state.highlightColor = swatch.dataset.hl;
      DOM.highlightColors.querySelectorAll('.hl-swatch').forEach(function(s) {
        s.classList.toggle('active', s.dataset.hl === state.highlightColor);
      });
    });

    DOM.sidebarList.addEventListener('click', function(e) {
      var item = e.target.closest('.queue-item');
      if (!item) return;
      var idx = parseInt(item.dataset.index);
      setActive(idx);
    });

    DOM.btnDrawMode.addEventListener('click', toggleDrawMode);
    DOM.btnPen.addEventListener('click', function() { setTool('pen'); });
    DOM.btnHighlighter.addEventListener('click', function() { setTool('highlighter'); });
    DOM.btnEraser.addEventListener('click', function() { setTool('eraser'); });
    DOM.btnTextTool.addEventListener('click', function() { setTool('text'); });
    DOM.btnRect.addEventListener('click', function() { setTool('rect'); });
    DOM.btnLine.addEventListener('click', function() { setTool('line'); });
    DOM.btnMove.addEventListener('click', function() { setTool('move'); });
    DOM.btnClearDrawing.addEventListener('click', clearDrawing);
    DOM.btnCapture.addEventListener('click', captureTab);
    DOM.btnRemoveVerse.addEventListener('click', removeActiveVerse);
    DOM.btnClearAll.addEventListener('click', clearAllVerses);

    DOM.colorSwatches.addEventListener('click', function(e) {
      var swatch = e.target.closest('.swatch');
      if (!swatch) return;
      setColor(swatch.dataset.color);
    });

    DOM.textInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        commitTextInput();
      } else if (e.key === 'Escape') {
        DOM.textInput.style.display = 'none';
        DOM.textInput.value = '';
      }
      e.stopPropagation();
    });
    DOM.textInput.addEventListener('blur', function() {
      commitTextInput();
    });

    DOM.canvas.addEventListener('pointerdown', onPointerDown);
    DOM.canvas.addEventListener('pointermove', onPointerMove);
    DOM.canvas.addEventListener('pointerup', onPointerUp);
    DOM.canvas.addEventListener('pointerleave', onPointerUp);

    document.addEventListener('paste', onPaste);

    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'd': case 'D':
          toggleDrawMode();
          break;
        case 'b': case 'B':
          toggleSidebar();
          break;
        case 'c':
          if (!e.ctrlKey && !e.metaKey) captureTab();
          break;
        case 'h': case 'H':
          highlightSelectedWords();
          DOM.highlightColors.classList.toggle('visible');
          break;
        case '1': setTool('pen'); break;
        case '2': setTool('highlighter'); break;
        case '3': setTool('eraser'); break;
        case '4': setTool('text'); break;
        case '5': setTool('rect'); break;
        case '6': setTool('line'); break;
        case '7': setTool('move'); break;
        case 'm': case 'M':
          setTool('move');
          break;
        case 'ArrowLeft': case 'ArrowUp':
          e.preventDefault();
          setActive(state.activeIndex - 1);
          break;
        case 'ArrowRight': case 'ArrowDown':
          e.preventDefault();
          setActive(state.activeIndex + 1);
          break;
        case 'Delete': case 'Backspace':
          if (state.drawMode) break;
          removeActiveVerse();
          break;
      }
    });

    window.addEventListener('resize', resizeCanvas);
  }

  /* ═══════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════ */

  function init() {
    bindEvents();
    DOM.toolGroup.style.display = 'none';
    DOM.colorSwatches.style.display = 'none';
    DOM.btnClearDrawing.style.display = 'none';
    DOM.navGroup.style.display = 'none';
    DOM.displayArea.style.overflowY = 'hidden';

    loadFromStorage(function() {
      resizeCanvas();
      DOM.statusText.textContent = 'Ready — ' + state.verses.length + ' verse(s) loaded';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
