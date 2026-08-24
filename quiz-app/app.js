class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.timer = null;
        this.timeLeft = 60;
        this.results = [];
        this.isAnswered = false;

        // DOM Elements
        this.startScreen = document.getElementById('start-screen');
        this.quizScreen = document.getElementById('quiz-screen');
        this.resultScreen = document.getElementById('result-screen');
        this.startBtn = document.getElementById('start-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.timerElement = document.getElementById('timer');
        this.currentScoreElement = document.getElementById('current-score');
        this.questionNumberElement = document.getElementById('question-number');
        this.questionTextElement = document.getElementById('question-text');
        this.optionsContainer = document.getElementById('options');
        this.finalScoreElement = document.getElementById('final-score');
        this.resultsSummary = document.getElementById('results-summary');

        this.init();
    }

    async init() {
        await this.loadQuestions();
        this.setupEventListeners();
    }

    async loadQuestions() {
        try {
            const response = await fetch('questions.json');
            this.questions = await response.json();
        } catch (error) {
            console.error('Error loading questions:', error);
            // Fallback questions if JSON fails to load
            this.questions = [
                {
                    question: "What is the capital of Japan?",
                    options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
                    correctAnswer: 2
                },
                {
                    question: "Which planet is known as the Red Planet?",
                    options: ["Venus", "Mars", "Jupiter", "Saturn"],
                    correctAnswer: 1
                }
            ];
        }
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startQuiz());
        this.nextBtn.addEventListener('click', () => this.nextQuestion());
        this.restartBtn.addEventListener('click', () => this.restartQuiz());
    }

    startQuiz() {
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.results = [];
        this.updateScore();
        this.showScreen('quiz');
        this.loadQuestion();
    }

    showScreen(screen) {
        this.startScreen.classList.remove('active');
        this.quizScreen.classList.remove('active');
        this.resultScreen.classList.remove('active');

        switch(screen) {
            case 'start':
                this.startScreen.classList.add('active');
                break;
            case 'quiz':
                this.quizScreen.classList.add('active');
                break;
            case 'result':
                this.resultScreen.classList.add('active');
                break;
        }
    }

    loadQuestion() {
        this.isAnswered = false;
        this.nextBtn.disabled = true;
        const question = this.questions[this.currentQuestionIndex];
        
        this.questionNumberElement.textContent = `Question ${this.currentQuestionIndex + 1} of ${this.questions.length}`;
        this.questionTextElement.textContent = question.question;
        
        this.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.textContent = option;
            button.addEventListener('click', () => this.selectAnswer(index));
            this.optionsContainer.appendChild(button);
        });

        this.startTimer();
    }

    startTimer() {
        this.timeLeft = 60;
        this.timerElement.textContent = this.timeLeft;
        this.timerElement.classList.remove('warning');
        
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.timerElement.textContent = this.timeLeft;
            
            if (this.timeLeft <= 10) {
                this.timerElement.classList.add('warning');
            }
            
            if (this.timeLeft <= 0) {
                this.handleTimeout();
            }
        }, 1000);
    }

    handleTimeout() {
        clearInterval(this.timer);
        this.isAnswered = true;
        
        const question = this.questions[this.currentQuestionIndex];
        const options = this.optionsContainer.children;
        
        // Disable all options
        Array.from(options).forEach(option => {
            option.disabled = true;
        });

        // Show correct answer
        options[question.correctAnswer].classList.add('correct');
        
        // Record result
        this.results.push({
            question: question.question,
            userAnswer: null,
            correctAnswer: question.options[question.correctAnswer],
            isCorrect: false,
            isTimeout: true
        });

        this.score = Math.max(0, this.score - 1);
        this.updateScore();
        
        this.nextBtn.disabled = false;
    }

    selectAnswer(selectedIndex) {
        if (this.isAnswered) return;
        
        this.isAnswered = true;
        clearInterval(this.timer);
        
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctAnswer;
        const options = this.optionsContainer.children;
        
        // Disable all options
        Array.from(options).forEach(option => {
            option.disabled = true;
        });

        // Show correct/incorrect
        if (isCorrect) {
            options[selectedIndex].classList.add('correct');
            this.score++;
        } else {
            options[selectedIndex].classList.add('incorrect');
            options[question.correctAnswer].classList.add('correct');
            this.score = Math.max(0, this.score - 1);
        }

        // Record result
        this.results.push({
            question: question.question,
            userAnswer: question.options[selectedIndex],
            correctAnswer: question.options[question.correctAnswer],
            isCorrect: isCorrect,
            isTimeout: false
        });

        this.updateScore();
        this.nextBtn.disabled = false;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResults();
        } else {
            this.loadQuestion();
        }
    }

    updateScore() {
        this.currentScoreElement.textContent = this.score;
    }

    showResults() {
        clearInterval(this.timer);
        this.finalScoreElement.textContent = this.score;
        
        this.resultsSummary.innerHTML = '';
        this.results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            let iconClass = result.isCorrect ? 'correct' : (result.isTimeout ? 'timeout' : 'incorrect');
            let iconSymbol = result.isCorrect ? '✓' : (result.isTimeout ? '⏱' : '✗');
            
            resultItem.innerHTML = `
                <div class="result-icon ${iconClass}">${iconSymbol}</div>
                <div class="result-question">
                    <h3>${index + 1}. ${result.question}</h3>
                    <p>${result.isCorrect ? 'Correct!' : (result.isTimeout ? 'Time expired' : `Your answer: ${result.userAnswer}`)}</p>
                    ${!result.isCorrect ? `<p>Correct answer: ${result.correctAnswer}</p>` : ''}
                </div>
            `;
            
            this.resultsSummary.appendChild(resultItem);
        });

        this.showScreen('result');
    }

    restartQuiz() {
        this.showScreen('start');
    }
}

// Initialize the quiz app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});
