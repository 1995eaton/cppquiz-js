(function() {

  'use strict';

  var currentQuestion;

  var el = (function(e) {
    var elements = {};
    for (var k in e) {
      elements[k] = document.querySelector(e[k]);
    }
    return elements;
  })({
    code:             '#code',
    select:           '#question-number',
    difficulty:       '#difficulty',
    answer:           '#answer-container',
    answerInput:      '#answer-input',
    answerOutput:     '#answer',
    reasonOutput:     '#reason',
    choices:          '#choices',
    isCorrect:        '#is-correct',
    checkAnswer:      '#check-answer',
    showAnswer:       '#show-answer',
    previousQuestion: '#previous-question',
    nextQuestion:     '#next-question'
  });

  var fetchJSON = function(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'data.json');
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        callback(JSON.parse(xhr.responseText));
      }
    };
    xhr.send();
  };

  var loadQuestion = function(question) {
    document.querySelector('input[name="answer"]').checked = true;
    el.answerOutput.parentElement.style.display = 'none';
    el.isCorrect.textContent = '';
    el.choices.style.display = 'block';
    el.showAnswer.style.display = 'inline';
    el.checkAnswer.style.display = 'inline';
    el.difficulty.textContent = question.difficulty;
    el.answerOutput.textContent = question.answer;
    el.reasonOutput.innerHTML = question.reason;
    el.code.textContent = question.code;
    hljs.configure({
      classPrefix: 'cpp'
    });
    hljs.highlightBlock(el.code);
  };

  var addOptions = function(n) {
    for (var i = 0; i < n; i++) {
      var option = document.createElement('option');
      option.text = i;
      el.select.appendChild(option);
    }
  };

  var selectOption = function(text) {
    [].slice.call(el.select.options).forEach(function(e) {
      if (e.value === text) {
        e.selected = true;
      }
    });
  };

  fetchJSON(function(data) {
    addOptions(data.length);
    el.select.addEventListener('change', function(event) {
      currentQuestion = data[event.target.value];
      window.location.hash = event.target.value;
      selectOption(window.location.hash.slice(1));
      loadQuestion(currentQuestion);
    });
    var hashLoad = function() {
      window.location.hash = window.location.hash || 0;
      currentQuestion = data[window.location.hash.slice(1)];
      if (!currentQuestion) {
        currentQuestion = data[0];
        window.location.hash = 0;
      }
      selectOption(window.location.hash.slice(1));
      loadQuestion(currentQuestion);
    };
    hashLoad();
    window.addEventListener('hashchange', hashLoad);
    el.previousQuestion.addEventListener('click', function() {
      if (window.location.hash !== '#0') {
        window.location.hash = +window.location.hash.slice(1) - 1;
      }
    });
    el.nextQuestion.addEventListener('click', function() {
      if (+window.location.hash.slice(1) + 1 < data.length) {
        window.location.hash = +window.location.hash.slice(1) + 1;
      }
    });
  });

  var checkAnswer = function() {
    document.activeElement.blur();
    var answer = el.choices.querySelector(':checked');
    var result;
    if (answer) {
      if (answer.nextElementSibling) {
        result = answer.nextElementSibling.value;
        answer.nextElementSibling.value = '';
        if (currentQuestion.output === result) {
          el.isCorrect.textContent = 'correct';
        } else {
          el.isCorrect.textContent = 'incorrect';
        }
      } else {
        if (new RegExp(answer.nextSibling.data.replace(/.*\s([a-zA-Z]+)\s*$/, '$1') + '.$').test(currentQuestion.answer)) {
          el.isCorrect.textContent = 'correct';
        } else {
          el.isCorrect.textContent = 'incorrect';
        }
      }
    }
  };

  el.checkAnswer.addEventListener('click', checkAnswer);
  el.answerInput.addEventListener('keydown', function(event) {
    if (event.which === 13) {
      checkAnswer();
    }
  });

  el.showAnswer.addEventListener('click', function() {
    el.answer.style.display = 'block';
    el.choices.style.display = 'none';
    el.checkAnswer.style.display = 'none';
    el.isCorrect.textContent = '';
    el.showAnswer.style.display = 'none';
  });

})();
