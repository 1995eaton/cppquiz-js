var createHTML = function(data) {
  html = document.implementation.createHTMLDocument();
  html.body.innerHTML = data;
  return html;
};

var getAttempts = function(data) {
  var html = createHTML(data);
  var attempts = html.querySelector('.disabled') || 3;
  if (attempts !== 3) {
    attempts = 3 - window.parseInt(attempts.textContent.split(/\D+/).join(''), 10);
  }
  return attempts;
};

var canGetAnswer = function(id, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://cppquiz.org/quiz/question/' + id + '?result=OK&answer=&did_answer=Answer');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      callback(getAttempts(xhr.responseText) === 3);
    }
  };
  xhr.send();
};

var parseAnswer = function(html) {

  var headers = [].slice.call(html.querySelectorAll('h3')).map(function(e) {
    return e.nextElementSibling;
  });

  var questionNumber = +headers[0].querySelector('a').textContent.split(/\D+/).join('');
  var difficulty = +headers[0].querySelector('img').src.split(/\D+/).join('');
  var code = html.querySelector('pre[class^="sh_"]');
  code = code ? code.textContent : '';
  var answer = headers[1].textContent;
  var output = '';
  if (headers[1].nextElementSibling) {
    if (headers[1].nextElementSibling.textContent.indexOf('Its output is') === 0) {
      answer += ' ' + headers[1].nextElementSibling.textContent;
      output = headers[1].nextElementSibling.textContent.replace(/.* /, '').replace(/[".]/g, '');
    }
  }
  var reason = headers[2].innerHTML;

  return {
    id: questionNumber,
    difficulty: difficulty,
    code: code,
    answer: answer,
    output: output,
    reason: reason
  };

};

var getAnswer = function(id, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://cppquiz.org/quiz/giveup/' + id);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      callback(createHTML(xhr.responseText));
    }
  };
  xhr.send();
};

var getQuestionInfo = function(id, callback, attempts) {
  attempts |= 0;
  canGetAnswer(id, function(response) {
    if (response === true) {
      getAnswer(id, function(response) {
        callback(parseAnswer(response));
      });
    } else {
      callback(getQuestionInfo(id, callback, attempts + 1));
    }
  });
};

var data = {};

mapData = function() {
  return JSON.stringify(data, null, 2);
};


// min > 0, max < 133
getData = function(min, max) {
  max = max || min + 1;
  for (var i = min; i < max; i++) {
    getQuestionInfo(i, function(response) {
      var id = response.id;
      delete response.id;
      data[id] = response;
    });
  }
};
