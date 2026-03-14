/**
 * 電氣佈線工中工 筆試溫習 Web App
 * Revision mode: 20 statements
 * Test mode: 10 random MC questions, 6 to pass
 */

(function () {
  'use strict';

  const VIEW_IDS = ['view-home', 'view-revision', 'view-test-intro', 'view-test', 'view-result'];
  let currentQuestions = [];
  let userAnswers = [];
  let currentQuestionIndex = 0;

  function showView(viewId) {
    VIEW_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.toggle('active', id === viewId);
    });
  }

  function initRevision() {
    const list = document.getElementById('statements-list');
    if (!list) return;
    list.innerHTML = '';
    STATEMENTS.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      list.appendChild(li);
    });
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function startTest() {
    const pool = shuffleArray(MOCK_QUESTIONS);
    currentQuestions = pool.slice(0, EXAM_TOTAL_QUESTIONS);
    userAnswers = currentQuestions.map(() => null);
    currentQuestionIndex = 0;
    renderQuestion();
    updateTestProgress();
    showView('view-test');
  }

  function renderQuestion() {
    const container = document.getElementById('question-container');
    if (!container || !currentQuestions.length) return;

    const q = currentQuestions[currentQuestionIndex];
    const labels = ['A', 'B', 'C', 'D'];
    const selected = userAnswers[currentQuestionIndex];

    container.innerHTML = `
      <div class="question-block">
        <p class="question-number">第 ${currentQuestionIndex + 1} 題</p>
        <p class="question-text">${escapeHtml(q.question)}</p>
        <ul class="options-list" role="radiogroup" aria-label="請選擇答案">
          ${q.options.map((opt, i) => `
            <li>
              <label class="option ${selected === i ? 'selected' : ''}">
                <input type="radio" name="q" value="${i}" ${selected === i ? 'checked' : ''}>
                <span class="option-label">${labels[i]}.</span>
                <span class="option-text">${escapeHtml(opt)}</span>
              </label>
            </li>
          `).join('')}
        </ul>
      </div>
    `;

    container.querySelectorAll('input[name="q"]').forEach((radio, i) => {
      radio.addEventListener('change', () => {
        userAnswers[currentQuestionIndex] = i;
        radio.closest('.option').classList.add('selected');
        radio.closest('ul').querySelectorAll('.option').forEach((o, j) => {
          if (j !== i) o.classList.remove('selected');
        });
      });
    });
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function updateTestProgress() {
    const total = currentQuestions.length;
    const current = currentQuestionIndex + 1;
    const textEl = document.getElementById('test-progress-text');
    const fillEl = document.getElementById('progress-fill');
    if (textEl) textEl.textContent = `第 ${current} / ${total} 題`;
    if (fillEl) fillEl.style.width = `${(current / total) * 100}%`;

    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');
    if (btnPrev) btnPrev.disabled = currentQuestionIndex === 0;
    if (btnNext) btnNext.style.display = currentQuestionIndex === total - 1 ? 'none' : 'inline-block';
    if (btnSubmit) btnSubmit.style.display = currentQuestionIndex === total - 1 ? 'inline-block' : 'none';
  }

  function showResult() {
    let correct = 0;
    currentQuestions.forEach((q, i) => {
      if (userAnswers[i] === q.correctIndex) correct++;
    });

    const passed = correct >= EXAM_PASS_SCORE;
    const scoreEl = document.getElementById('result-score');
    const msgEl = document.getElementById('result-message');
    const reviewEl = document.getElementById('result-review');

    if (scoreEl) {
      scoreEl.innerHTML = `<span class="result-number">${correct}</span> / ${currentQuestions.length}`;
      scoreEl.className = 'result-score ' + (passed ? 'pass' : 'fail');
    }
    if (msgEl) {
      msgEl.textContent = passed ? '合格 ✓' : '未達合格（需答對 6 題或以上）';
      msgEl.className = 'result-message ' + (passed ? 'pass' : 'fail');
    }

    if (reviewEl) {
      const labels = ['A', 'B', 'C', 'D'];
      reviewEl.innerHTML = '<h3>答案對照</h3>' + currentQuestions.map((q, i) => {
        const u = userAnswers[i];
        const right = u === q.correctIndex;
        const your = u != null ? labels[u] + '. ' + q.options[u] : '未作答';
        const ans = labels[q.correctIndex] + '. ' + q.options[q.correctIndex];
        return `
          <div class="review-item ${right ? 'correct' : 'wrong'}">
            <p class="review-q">${i + 1}. ${escapeHtml(q.question)}</p>
            <p class="review-your">你的答案：${escapeHtml(your)}</p>
            ${!right ? `<p class="review-correct">正確答案：${escapeHtml(ans)}</p>` : ''}
          </div>
        `;
      }).join('');
    }

    showView('view-result');
  }

  function bindEvents() {
    document.querySelectorAll('[data-view]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const view = el.getAttribute('data-view');
        if (view === 'revision') {
          initRevision();
          showView('view-revision');
        } else if (view === 'test') {
          const introTotal = document.getElementById('intro-total');
          if (introTotal) introTotal.textContent = EXAM_TOTAL_QUESTIONS;
          showView('view-test-intro');
        }
      });
    });

    document.querySelectorAll('[data-back]').forEach(el => {
      el.addEventListener('click', () => showView('view-home'));
    });

    const btnStart = document.getElementById('btn-start-test');
    if (btnStart) btnStart.addEventListener('click', startTest);

    const btnExit = document.getElementById('btn-exit-test');
    if (btnExit) {
      btnExit.addEventListener('click', () => {
        if (confirm('確定放棄本次測驗？')) showView('view-home');
      });
    }

    const btnPrev = document.getElementById('btn-prev');
    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
          currentQuestionIndex--;
          renderQuestion();
          updateTestProgress();
        }
      });
    }

    const btnNext = document.getElementById('btn-next');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (currentQuestionIndex < currentQuestions.length - 1) {
          currentQuestionIndex++;
          renderQuestion();
          updateTestProgress();
        }
      });
    }

    const btnSubmit = document.getElementById('btn-submit');
    if (btnSubmit) btnSubmit.addEventListener('click', showResult);
  }

  function init() {
    initRevision();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
