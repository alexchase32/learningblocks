class LessonPlayer {
  constructor() {
    this.lesson = JSON.parse(localStorage.getItem('currentLesson'));
    this.currentBlockIndex = 0;
    this.score = 0;
    this.initialize();
  }

  initialize() {
    if (!this.lesson) {
      document.getElementById('lessonInfo').innerHTML = '<div class="alert alert-warning">No lesson available. Please create a lesson in the Teacher View first.</div>';
      return;
    }

    document.getElementById('lessonInfo').innerHTML = `
      <h2>${this.lesson.name}</h2>
      <p>Date: ${this.lesson.date}</p>
      <p>Total Score: <span id="totalScore">0</span></p>
    `;

    this.playCurrentBlock();
  }

  playCurrentBlock() {
    const block = this.lesson.blocks[this.currentBlockIndex];
    if (!block) {
      document.getElementById('exerciseContainer').innerHTML = '<div class="alert alert-success">Lesson completed!</div>';
      return;
    }

    if (block.type === 'flashcard') {
      this.renderFlashcardExercise(block);
    } else if (block.type === 'translation') {
      this.renderTranslationExercise(block);
    } else if (block.type === 'hotspot') {
      this.renderHotspotExercise(block);
    } else if (block.type === 'highlight') {
      this.renderHighlightExercise(block);
    } else if (block.type === 'imageclick') {
      this.renderImageClickExercise(block);
    } else if (block.type === 'dialogue') {
      this.renderDialogueExercise(block);
    } else if (block.type === 'singlephrase') {
      this.renderSinglePhraseExercise(block);
    } else if (block.type === 'sentencematch') {
      this.renderSentenceMatchExercise(block);
    } else if (block.type === 'pickpicture') {
      this.renderPickPictureExercise(block);
    } else if (block.type === 'accent') {
      this.renderAccentExercise(block);
    } else if (block.type === 'spelling') {
      this.renderSpellingExercise(block);
    }
  }

  renderFlashcardExercise(block) {
    const container = document.getElementById('exerciseContainer');
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${block.config.instructions}</h5>
          <p>Time Remaining: <span id="timeRemaining"></span></p>
          <div class="card-container" id="cardContainer">
            <div class="card" id="flashcard">
              <div class="card-side card-front" id="cardFront"></div>
              <div class="card-side card-back" id="cardBack"></div>
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-primary" onclick="lessonPlayer.flipCard()">Flip Card</button>
            <button class="btn btn-success" onclick="lessonPlayer.showFlashcardInput()">I Know It</button>
          </div>
          <div id="answerInput" class="mt-3" style="display: none;">
            <input type="text" class="form-control" id="userAnswer" placeholder="Type your answer...">
            <button class="btn btn-primary mt-2" onclick="lessonPlayer.checkFlashcardAnswer()">Submit</button>
          </div>
        </div>
      </div>
    `;

    this.currentCard = 0;
    this.displayFlashcard();
    this.startTimer(block.config.timeLimit);
  }

  renderTranslationExercise(block) {
    const container = document.getElementById('exerciseContainer');
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${block.config.instructions}</h5>
          <p>Sentence: ${block.config.sentence}</p>
          <div class="vocabulary mb-3">
            <h6>Vocabulary:</h6>
            ${block.config.vocabulary.map(word => `<span class="badge bg-secondary me-2">${word}</span>`).join('')}
          </div>
          <input type="text" class="form-control" id="translationAnswer" placeholder="Enter your translation">
          <button class="btn btn-primary mt-3" onclick="lessonPlayer.checkTranslationAnswer()">Submit</button>
        </div>
      </div>
    `;
  }

  renderHotspotExercise(block) {
    const container = document.getElementById('exerciseContainer');
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${block.config.instructions}</h5>
          <div class="image-container" style="position: relative; width: 600px; height: 400px; margin: 0 auto;">
            <div class="hotspot-image" style="width: 100%; height: 100%; 
              background-image: url('${block.config.imageUrl}');
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;">
              ${block.config.hotspots.map((hotspot, index) => `
                <div class="hotspot" style="position: absolute; left: ${hotspot.x}%; top: ${hotspot.y}%;"
                  data-index="${index}">?</div>
              `).join('')}
            </div>
          </div>
          <div id="quizArea" class="mt-3" style="display: none;">
            <h6 id="quizQuestion"></h6>
            <div id="quizOptions" class="btn-group-vertical w-100"></div>
          </div>
          <div id="feedback" class="mt-3"></div>
        </div>
      </div>
    `;

    // Add event listeners to hotspots
    const hotspots = container.querySelectorAll('.hotspot');
    hotspots.forEach(spot => {
      spot.addEventListener('click', () => this.showHotspotQuiz(block, parseInt(spot.dataset.index)));
    });
  }

  flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
  }

  displayFlashcard() {
    const block = this.lesson.blocks[this.currentBlockIndex];
    const card = block.config.cards[this.currentCard];
    document.getElementById('cardFront').textContent = card.english;
    document.getElementById('cardBack').textContent = card.spanish;
    document.getElementById('flashcard').classList.remove('flipped');
  }

  showFlashcardInput() {
    document.getElementById('answerInput').style.display = 'block';
    document.getElementById('userAnswer').focus();
  }

  checkFlashcardAnswer() {
    const block = this.lesson.blocks[this.currentBlockIndex];
    const card = block.config.cards[this.currentCard];
    const userAnswer = document.getElementById('userAnswer').value.trim().toLowerCase();
    
    if (userAnswer === card.spanish.toLowerCase()) {
      this.score++;
      document.getElementById('totalScore').textContent = this.score;
    }

    this.currentCard++;
    if (this.currentCard < block.config.cards.length) {
      document.getElementById('answerInput').style.display = 'none';
      document.getElementById('userAnswer').value = '';
      this.displayFlashcard();
    } else {
      this.currentBlockIndex++;
      this.playCurrentBlock();
    }
  }

  checkTranslationAnswer() {
    const block = this.lesson.blocks[this.currentBlockIndex];
    const userAnswer = document.getElementById('translationAnswer').value.trim().toLowerCase();
    
    if (userAnswer === block.config.correctAnswer.toLowerCase()) {
      this.score++;
      document.getElementById('totalScore').textContent = this.score;
    }

    this.currentBlockIndex++;
    this.playCurrentBlock();
  }

  showHotspotQuiz(block, index) {
    const hotspot = block.config.hotspots[index];
    const quizArea = document.getElementById('quizArea');
    const quizQuestion = document.getElementById('quizQuestion');
    const quizOptions = document.getElementById('quizOptions');
    
    quizArea.style.display = 'block';
    quizQuestion.textContent = `What is this?`;
    
    // Combine correct answer and wrong options, shuffle them
    const options = [hotspot.answer, ...hotspot.wrongOptions];
    options.sort(() => Math.random() - 0.5);
    
    quizOptions.innerHTML = options.map(option => `
      <button class="btn btn-outline-primary mb-2" onclick="lessonPlayer.checkHotspotAnswer('${option}', '${hotspot.answer}', ${index})">
        ${option}
      </button>
    `).join('');
  }

  checkHotspotAnswer(selected, correct, index) {
    const hotspots = document.querySelectorAll('.hotspot');
    const feedback = document.getElementById('feedback');
    const quizArea = document.getElementById('quizArea');
    
    if (selected === correct) {
      this.score++;
      document.getElementById('totalScore').textContent = this.score;
      hotspots[index].className = 'hotspot correct';
      hotspots[index].textContent = '✓';
      feedback.innerHTML = '<div class="alert alert-success">Correct!</div>';
    } else {
      hotspots[index].className = 'hotspot incorrect';
      hotspots[index].textContent = '✗';
      feedback.innerHTML = `<div class="alert alert-danger">Incorrect. The correct answer is: ${correct}</div>`;
    }
    
    quizArea.style.display = 'none';
    
    // Check if all hotspots have been attempted
    const remaining = Array.from(hotspots).filter(spot => spot.textContent === '?').length;
    if (remaining === 0) {
      this.currentBlockIndex++;
      setTimeout(() => this.playCurrentBlock(), 1500);
    }
  }

  startTimer(duration) {
    let timeLeft = duration;
    const timerDisplay = document.getElementById('timeRemaining');
    
    const timer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      if (--timeLeft < 0) {
        clearInterval(timer);
        this.currentBlockIndex++;
        this.playCurrentBlock();
      }
    }, 1000);
  }

  renderHighlightExercise(block) {
    this.currentExercise = 0;
    this.selectedWords = new Set();
    
    const container = document.getElementById('exerciseContainer');
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${block.config.instructions}</h5>
          <div id="highlightContent"></div>
          <button class="btn btn-primary mt-3" onclick="lessonPlayer.checkHighlightAnswer()">Submit Answer</button>
        </div>
      </div>
    `;

    this.displayHighlightExercise(block);
  }

  displayHighlightExercise(block) {
    const exercise = block.config.exercises[this.currentExercise];
    const content = document.getElementById('highlightContent');
    
    content.innerHTML = `
      <p class="highlight-text">
        ${exercise.text.split(' ').map(word => 
          `<span class="highlight-word" onclick="lessonPlayer.toggleWord(this)">${word}</span>`
        ).join(' ')}
      </p>
      <p class="mt-3">${exercise.question}</p>
    `;
  }

  toggleWord(element) {
    element.classList.toggle('selected');
  }

  checkHighlightAnswer() {
    const block = this.lesson.blocks[this.currentBlockIndex];
    const exercise = block.config.exercises[this.currentExercise];
    const selectedWords = Array.from(document.querySelectorAll('.highlight-word.selected')).map(el => el.textContent);
    
    const correctWords = exercise.correctWords;
    const correctCount = selectedWords.filter(word => correctWords.includes(word)).length;
    const incorrectCount = selectedWords.filter(word => !correctWords.includes(word)).length;
    
    if (correctCount === correctWords.length && incorrectCount === 0) {
      this.score += 1;
    } else if (correctCount >= correctWords.length - 1 && incorrectCount === 0) {
      this.score += 0.75;
    } else if (correctCount === 1 && correctWords.includes(selectedWords[0]) && incorrectCount === 0) {
      this.score += 0.5;
    }
    
    document.getElementById('totalScore').textContent = this.score;
    
    this.currentExercise++;
    if (this.currentExercise < block.config.exercises.length) {
      this.displayHighlightExercise(block);
    } else {
      this.currentBlockIndex++;
      this.playCurrentBlock();
    }
  }

  renderImageClickExercise(block) {
    this.currentQuestion = 0;
    this.selectedImage = null;
    this.filledBoxes = new Array(5).fill(null);
    
    const container = document.getElementById('exerciseContainer');
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${block.config.instructions}</h5>
          <div class="image-grid">
            ${[1,2,3,4,5].map(i => `
              <img src="${block.config['image'+i]}" class="source-image" 
                   onclick="lessonPlayer.selectImage(${i-1})" data-index="${i-1}">
            `).join('')}
          </div>
          <div id="questionContent"></div>
          <div class="target-boxes">
            ${[1,2,3,4,5].map(i => `
              <div class="target-box" onclick="lessonPlayer.placeImage(${i-1})" data-index="${i-1}"></div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    this.displayImageClickQuestion(block);
  }

  displayImageClickQuestion(block) {
    const question = block.config.questions[this.currentQuestion];
    document.getElementById('questionContent').innerHTML = `
      <p class="mt-3 mb-3">${question.text}</p>
    `;
    
    // Highlight current target box
    document.querySelectorAll('.target-box').forEach((box, index) => {
      box.classList.toggle('current', index === question.correctBox - 1);
    });
  }

  selectImage(index) {
    document.querySelectorAll('.source-image').forEach(img => 
      img.classList.toggle('selected', img.dataset.index == index));
    this.selectedImage = index;
  }

  placeImage(boxIndex) {
    const block = this.lesson.blocks[this.currentBlockIndex];
    const question = block.config.questions[this.currentQuestion];
    
    if (this.selectedImage !== null && boxIndex === question.correctBox - 1) {
      const isCorrect = this.selectedImage === question.correctImage - 1;
      if (isCorrect) {
        this.score += 1;
        document.getElementById('totalScore').textContent = this.score;
      }
      
      this.filledBoxes[boxIndex] = this.selectedImage;
      const box = document.querySelector(`.target-box[data-index="${boxIndex}"]`);
      box.style.backgroundImage = `url(${block.config['image'+(this.selectedImage+1)]})`;
      box.classList.add('filled');
      
      this.currentQuestion++;
      this.selectedImage = null;
      document.querySelectorAll('.source-image').forEach(img => 
        img.classList.remove('selected'));
      
      if (this.currentQuestion < block.config.questions.length) {
        this.displayImageClickQuestion(block);
      } else {
        this.currentBlockIndex++;
        setTimeout(() => this.playCurrentBlock(), 1000);
      }
    }
  }

  renderDialogueExercise(block) {
    const container = document.getElementById('exerciseContainer');
    this.currentDialogue = 0;
  
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${block.config.instructions}</h5>
          <div class="dialogue-container">
            <div class="dialogue-instructions" id="dialogueInstructions"></div>
            <div class="speaker-box">
              <div class="speaker-left">
                <button class="mic-btn" id="speakerABtn">
                  <i class="fas fa-microphone"></i>
                </button>
                <div class="answer-text" id="speakerAText"></div>
              </div>
              <div class="speaker-right">
                <div class="answer-text" id="speakerBText"></div>
                <button class="mic-btn" id="speakerBBtn">
                  <i class="fas fa-microphone"></i>
                </button>
              </div>
            </div>
            <div class="text-center mt-3">
              <button class="submit-btn" id="submitA">Submit Speaker A</button>
              <button class="submit-btn" id="submitB">Submit Speaker B</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.displayDialogue(block);
    this.setupSpeechRecognition();
  }

  displayDialogue(block) {
    const dialogue = block.config.dialogues[this.currentDialogue];
    const instructions = document.getElementById('dialogueInstructions');
  
    instructions.innerHTML = `
      <p><strong>Speaker A:</strong> ${dialogue.speakerAEng}</p>
      <p><strong>Speaker B:</strong> ${dialogue.speakerBEng}</p>
    `;
  }

  setupSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    const speakerABtn = document.getElementById('speakerABtn');
    const speakerBBtn = document.getElementById('speakerBBtn');
    const submitABtn = document.getElementById('submitA');
    const submitBBtn = document.getElementById('submitB');

    speakerABtn.addEventListener('click', () => this.startRecognition(recognition, 'A'));
    speakerBBtn.addEventListener('click', () => this.startRecognition(recognition, 'B'));
  
    submitABtn.addEventListener('click', () => this.submitSpeakerAnswer('A'));
    submitBBtn.addEventListener('click', () => this.submitSpeakerAnswer('B'));

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      const speaker = recognition.speaker;
      const textElement = document.getElementById(`speaker${speaker}Text`);
      textElement.textContent = transcript;
    };
  }

  startRecognition(recognition, speaker) {
    recognition.speaker = speaker;
    recognition.start();
  }

  submitSpeakerAnswer(speaker) {
    const block = this.lesson.blocks[this.currentBlockIndex];
    const dialogue = block.config.dialogues[this.currentDialogue];
    const transcript = document.getElementById(`speaker${speaker}Text`).textContent.toLowerCase();
    const correct = transcript === dialogue[`speaker${speaker}Spa`].toLowerCase().replace(/[¿?,]/g, '');
  
    const speakerBox = document.querySelector('.speaker-box');
    speakerBox.classList.add(correct ? 'correct' : 'incorrect');
  
    const micBtn = document.getElementById(`speaker${speaker}Btn`);
    const submitBtn = document.getElementById(`submit${speaker}`);
    micBtn.disabled = true;
    submitBtn.disabled = true;

    if (correct) {
      this.score++;
      document.getElementById('totalScore').textContent = this.score;
    }

    // Check if both speakers are done
    if (document.getElementById('submitA').disabled && document.getElementById('submitB').disabled) {
      this.currentDialogue++;
      if (this.currentDialogue < block.config.dialogues.length) {
        setTimeout(() => {
          speakerBox.classList.remove('correct', 'incorrect');
          this.displayDialogue(block);
          this.resetDialogueButtons();
        }, 1500);
      } else {
        this.currentBlockIndex++;
        setTimeout(() => this.playCurrentBlock(), 1500);
      }
    }
  }

  resetDialogueButtons() {
    const elements = ['speakerABtn', 'speakerBBtn', 'submitA', 'submitB', 'speakerAText', 'speakerBText'];
    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element.tagName === 'BUTTON') {
        element.disabled = false;
      } else {
        element.textContent = '';
      }
    });
  }

  renderSinglePhraseExercise(block) {
    const container = document.getElementById('exerciseContainer');
    this.currentPhrase = 0;
    
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${block.config.instructions}</h5>
          <div class="single-phrase-container">
            <div class="phrase-question" id="phraseQuestion"></div>
            <div class="phrase-transcription" id="phraseTranscription"></div>
            <button class="phrase-mic-btn" id="phraseMicBtn">
              <i class="fas fa-microphone"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    this.setupPhraseRecognition(block);
    this.displayPhrase(block);
  }

  setupPhraseRecognition(block) {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;

    const micBtn = document.getElementById('phraseMicBtn');
    const transcription = document.getElementById('phraseTranscription');

    micBtn.addEventListener('click', () => {
      recognition.start();
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      transcription.textContent = transcript;
      
      const phrase = block.config.phrases[this.currentPhrase];
      if (transcript === phrase.answer.toLowerCase()) {
        this.score++;
        document.getElementById('totalScore').textContent = this.score;
        this.currentPhrase++;
        
        if (this.currentPhrase < block.config.phrases.length) {
          setTimeout(() => this.displayPhrase(block), 1000);
        } else {
          this.currentBlockIndex++;
          setTimeout(() => this.playCurrentBlock(), 1000);
        }
      } else {
        transcription.style.backgroundColor = '#ffebee';
        setTimeout(() => {
          transcription.style.backgroundColor = 'rgba(190, 242, 100, 0.1)';
          transcription.textContent = '';
        }, 2000);
      }
    };
  }

  displayPhrase(block) {
    const phrase = block.config.phrases[this.currentPhrase];
    document.getElementById('phraseQuestion').textContent = phrase.prompt;
    document.getElementById('phraseTranscription').textContent = '';
  }

  renderSentenceMatchExercise(block) {
    const container = document.getElementById('exerciseContainer');
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${block.config.instructions}</h5>
          <div id="sentence-match-container"></div>
          <div id="score"></div>
        </div>
      </div>
    `;

    this.displaySentenceMatch(block.config.sentences);
  }

  displaySentenceMatch(sentences) {
    const container = document.getElementById('sentence-match-container');
    container.innerHTML = '';
    
    sentences.forEach((sentence, index) => {
      // Create green card
      const greenCard = document.createElement('div');
      greenCard.className = 'card green-card mb-2';
      greenCard.textContent = sentence.greenCard;
      greenCard.onclick = () => this.handleGreenCardClick(index);
      container.appendChild(greenCard);

      // Create row for white cards
      const whiteCardsRow = document.createElement('div');
      whiteCardsRow.className = 'row mb-4';
      sentence.whiteCards.forEach((whiteCard, wIndex) => {
        const whiteCardElement = document.createElement('div');
        whiteCardElement.className = 'col card white-card';
        whiteCardElement.textContent = whiteCard;
        whiteCardElement.onclick = () => this.handleWhiteCardClick(index, wIndex);
        whiteCardsRow.appendChild(whiteCardElement);
      });
      container.appendChild(whiteCardsRow);
    });
  }

  handleGreenCardClick(index) {
    this.selectedGreenCard = index;
    document.querySelectorAll('.green-card').forEach((card, i) => {
      card.classList.toggle('selected', i === index);
    });
  }

  handleWhiteCardClick(sentenceIndex, cardIndex) {
    if (this.selectedGreenCard === sentenceIndex) {
      const card = document.querySelectorAll('.white-card')[cardIndex];
      card.classList.add('correct');
      this.score++;
      document.getElementById('totalScore').textContent = this.score;
      
      // Check if all cards are matched
      const remainingCards = document.querySelectorAll('.white-card:not(.correct)').length;
      if (remainingCards === 0) {
        this.currentBlockIndex++;
        setTimeout(() => this.playCurrentBlock(), 1500);
      }
    } else {
      const card = document.querySelectorAll('.white-card')[cardIndex];
      card.classList.add('incorrect');
      setTimeout(() => card.classList.remove('incorrect'), 1000);
    }
  }

  renderPickPictureExercise(block) {
    this.currentExercise = 0;
    const container = document.getElementById('exerciseContainer');
    container.innerHTML = `
      <div class="quiz-container">
        <div class="quiz-header">Pick the picture</div>
        <div class="quiz-instructions">${block.config.instructions}</div>
        <div id="question-container"></div>
        <button class="submit-btn" onclick="lessonPlayer.checkPictureAnswers()">Submit</button>
        <div class="score-display">Current Score: ${this.score}</div>
      </div>
    `;

    this.displayPictureExercise(block);
  }

  displayPictureExercise(block) {
    const exercise = block.config.exercises[this.currentExercise];
    if (!exercise) {
      document.getElementById('question-container').innerHTML = '<div class="completed-message">Exercise Completed!</div>';
      document.querySelector(".submit-btn").style.display = "none";
      this.currentBlockIndex++;
      setTimeout(() => this.playCurrentBlock(), 1500);
      return;
    }

    const questionContainer = document.getElementById('question-container');
    questionContainer.innerHTML = `
      <div class="verb-display">${exercise.verb}</div>
      <div class="images-container">
        ${exercise.images.map((imgUrl, index) => `
          <div class="image-wrapper">
            <img src="${imgUrl}" data-index="${index}" onclick="lessonPlayer.toggleImageSelection(this)">
          </div>
        `).join('')}
      </div>
    `;
  }

  toggleImageSelection(img) {
    img.classList.toggle('selected');
  }

  checkPictureAnswers() {
    const block = this.lesson.blocks[this.currentBlockIndex];
    const exercise = block.config.exercises[this.currentExercise];
    
    const selectedImages = document.querySelectorAll(".images-container img.selected");
    const selectedIndices = Array.from(selectedImages).map(img => parseInt(img.dataset.index));
    
    if (JSON.stringify(selectedIndices.sort()) === JSON.stringify(exercise.correctAnswers.sort())) {
      this.score++;
      document.querySelector('.score-display').textContent = `Current Score: ${this.score}`;
    }
    
    this.currentExercise++;
    this.displayPictureExercise(block);
  }

  renderAccentExercise(block) {
    const container = document.getElementById('exerciseContainer');
    this.currentSentence = 0;
    this.selectedIndices = new Set();
    
    container.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${block.config.instructions}</h5>
          <div id="sentence-container" class="mb-3"></div>
          <button class="btn btn-primary" id="submit-btn">Submit Answer</button>
          <button class="btn btn-success" id="next-btn" style="display:none;">Next Sentence</button>
        </div>
      </div>
    `;

    document.getElementById('submit-btn').addEventListener('click', () => this.checkAccentAnswer());
    document.getElementById('next-btn').addEventListener('click', () => this.nextAccentSentence());
    
    this.displayAccentSentence(block);
  }

  displayAccentSentence(block) {
    const sentence = block.config.sentences[this.currentSentence];
    const container = document.getElementById('sentence-container');
    container.innerHTML = '';
    this.selectedIndices.clear();

    const words = sentence.text.split(' ');
    words.forEach((word, wordIndex) => {
      for (let i = 0; i < word.length; i++) {
        const span = document.createElement('span');
        span.textContent = word[i];
        span.classList.add('letter');
        const globalIndex = sentence.text.indexOf(word) + i;
        span.dataset.index = globalIndex;
        span.addEventListener('click', () => {
          if (span.classList.contains('selected')) {
            span.classList.remove('selected');
            this.selectedIndices.delete(globalIndex);
          } else {
            span.classList.add('selected');
            this.selectedIndices.add(globalIndex);
          }
        });
        container.appendChild(span);
      }
      if (wordIndex < words.length - 1) {
        container.appendChild(document.createTextNode(' '));
      }
    });
  }

  checkAccentAnswer() {
    const block = this.lesson.blocks[this.currentBlockIndex];
    const sentence = block.config.sentences[this.currentSentence];
    const correctIndices = new Set(sentence.corrections.map(c => c.index));
    let isCorrect = true;

    if (this.selectedIndices.size !== correctIndices.size) {
      isCorrect = false;
    } else {
      for (let idx of this.selectedIndices) {
        if (!correctIndices.has(Number(idx))) {
          isCorrect = false;
          break;
        }
      }
    }

    const letters = document.querySelectorAll('.letter');
    letters.forEach(letter => {
      const idx = Number(letter.dataset.index);
      if (correctIndices.has(idx)) {
        if (letter.classList.contains('selected')) {
          const correction = sentence.corrections.find(c => c.index === idx);
          letter.textContent = correction.accent;
          letter.classList.add('correct');
          letter.classList.remove('selected');
        } else {
          letter.classList.add('wrong');
        }
      } else {
        if (letter.classList.contains('selected')) {
          letter.classList.add('wrong');
        }
      }
      letter.style.pointerEvents = 'none';
    });

    if (isCorrect) {
      this.score++;
      document.getElementById('totalScore').textContent = this.score;
    }

    document.getElementById('submit-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'inline-block';
  }

  nextAccentSentence() {
    const block = this.lesson.blocks[this.currentBlockIndex];
    this.currentSentence++;
    
    if (this.currentSentence < block.config.sentences.length) {
      this.displayAccentSentence(block);
      document.getElementById('submit-btn').style.display = 'inline-block';
      document.getElementById('next-btn').style.display = 'none';
    } else {
      this.currentBlockIndex++;
      this.playCurrentBlock();
    }
  }

  renderSpellingExercise(block) {
    this.currentExercise = 0;
    this.userAnswer = [];
    
    const container = document.getElementById('exerciseContainer');
    container.innerHTML = `
      <div class="spelling-container">
        <div class="title">${block.config.instructions}</div>
        <div class="question">Look at the incomplete Spanish word. Click on the missing letter(s) in correct order to complete it.</div>
        <div class="word" id="spellWord"></div>
        <div class="options" id="spellOptions"></div>
        <div id="spellScore">Score: ${this.score}</div>
      </div>
    `;

    this.displaySpellingExercise(block);
  }

  displaySpellingExercise(block) {
    const exercise = block.config.exercises[this.currentExercise];
    if (!exercise) {
      this.currentBlockIndex++;
      this.playCurrentBlock();
      return;
    }

    const word = exercise.word;
    const hint = word.split('').map((letter, index) => 
      exercise.missingIndices.includes(index) ? '_' : letter
    ).join('');

    document.getElementById('spellWord').innerText = hint;
    
    // Create options from missing letters plus some decoys
    const options = [...new Set([
      ...exercise.missingIndices.map(i => word[i]),
      ...this.getRandomLetters(4 - exercise.missingIndices.length)
    ])];
    this.shuffleArray(options);

    const optionsContainer = document.getElementById('spellOptions');
    optionsContainer.innerHTML = '';
    options.forEach(option => {
      const button = document.createElement('button');
      button.classList.add('option');
      button.innerText = option;
      button.addEventListener('click', () => this.checkSpellingAnswer(option, block));
      optionsContainer.appendChild(button);
    });
    
    this.userAnswer = [];
  }

  getRandomLetters(count) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(letters[Math.floor(Math.random() * letters.length)]);
    }
    return result;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  checkSpellingAnswer(option, block) {
    const exercise = block.config.exercises[this.currentExercise];
    const currentHint = document.getElementById('spellWord').innerText;
    this.userAnswer.push(option);
    
    document.getElementById('spellWord').innerText = currentHint.replace(/_/, option);

    if (this.userAnswer.length === exercise.missingIndices.length) {
      const isCorrect = exercise.missingIndices.every((index, i) => 
        this.userAnswer[i] === exercise.word[index]
      );

      document.getElementById('spellWord').classList.add(isCorrect ? 'correct' : 'incorrect');

      if (isCorrect) {
        this.score++;
        document.getElementById('totalScore').textContent = this.score;
      }

      setTimeout(() => {
        document.getElementById('spellWord').classList.remove('correct', 'incorrect');
        this.currentExercise++;
        this.displaySpellingExercise(block);
      }, 1500);
    }
  }
}

const lessonPlayer = new LessonPlayer();