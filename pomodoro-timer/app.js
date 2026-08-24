class PomodoroTimer {
    constructor() {
        // Default settings
        this.settings = {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLong: 4
        };

        // State
        this.currentSession = 'work'; // 'work', 'short', 'long'
        this.timeLeft = this.settings.workDuration * 60;
        this.totalTime = this.settings.workDuration * 60;
        this.isRunning = false;
        this.timer = null;
        this.completedSessions = 0;
        this.soundEnabled = true;

        // Audio context for notification sounds
        this.audioContext = null;

        // DOM Elements
        this.timerTime = document.getElementById('timer-time');
        this.timerLabel = document.getElementById('timer-label');
        this.timerProgress = document.getElementById('timer-progress');
        this.timerCircle = document.getElementById('timer-circle');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.skipBtn = document.getElementById('skip-btn');
        this.sessionCount = document.getElementById('session-count');
        this.sessionDots = document.getElementById('session-dots');
        this.settingsToggle = document.getElementById('settings-toggle');
        this.settingsPanel = document.getElementById('settings-panel');
        this.saveSettingsBtn = document.getElementById('save-settings');
        this.resetSettingsBtn = document.getElementById('reset-settings');
        this.soundToggle = document.getElementById('sound-toggle');
        this.soundIcon = document.getElementById('sound-icon');

        // Settings inputs
        this.workDurationInput = document.getElementById('work-duration');
        this.shortDurationInput = document.getElementById('short-duration');
        this.longDurationInput = document.getElementById('long-duration');
        this.sessionsBeforeLongInput = document.getElementById('sessions-before-long');

        // Tabs
        this.tabs = document.querySelectorAll('.tab');

        this.init();
    }

    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.updateDisplay();
        this.updateSessionTracker();
        this.updateProgress();
    }

    setupEventListeners() {
        // Timer controls
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.skipBtn.addEventListener('click', () => this.skipToNext());

        // Session tabs
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchSession(tab.dataset.session));
            tab.addEventListener('keydown', (e) => this.handleTabKeyboard(e, tab));
        });

        // Settings
        this.settingsToggle.addEventListener('click', () => this.toggleSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.resetSettingsBtn.addEventListener('click', () => this.resetSettings());

        // Sound toggle
        this.soundToggle.addEventListener('change', () => this.toggleSound());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // Timer Controls
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;

        // Disable tabs while running
        this.tabs.forEach(tab => tab.disabled = true);

        this.timer = setInterval(() => {
            this.timeLeft--;

            if (this.timeLeft <= 0) {
                this.sessionComplete();
            } else {
                this.updateDisplay();
                this.updateProgress();
            }
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        clearInterval(this.timer);
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;

        // Re-enable tabs
        this.tabs.forEach(tab => tab.disabled = false);
    }

    reset() {
        this.pause();
        this.timeLeft = this.totalTime;
        this.updateDisplay();
        this.updateProgress();
    }

    skipToNext() {
        this.pause();
        this.moveToNextSession();
    }

    // Session Management
    sessionComplete() {
        this.pause();
        this.playNotificationSound();

        if (this.currentSession === 'work') {
            this.completedSessions++;
            this.updateSessionTracker();

            // Check if we should do a long break
            if (this.completedSessions >= this.settings.sessionsBeforeLong) {
                this.switchSession('long');
            } else {
                this.switchSession('short');
            }
        } else {
            // After break, go back to work
            this.switchSession('work');
        }
    }

    moveToNextSession() {
        if (this.currentSession === 'work') {
            if (this.completedSessions >= this.settings.sessionsBeforeLong - 1) {
                this.switchSession('long');
            } else {
                this.switchSession('short');
            }
        } else {
            this.switchSession('work');
        }
    }

    switchSession(session) {
        this.currentSession = session;

        // Update tabs
        this.tabs.forEach(tab => {
            const isActive = tab.dataset.session === session;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', isActive);
        });

        // Update time based on session
        switch (session) {
            case 'work':
                this.totalTime = this.settings.workDuration * 60;
                this.timerLabel.textContent = 'Work Session';
                this.timerCircle.className = 'timer-circle session-work';
                break;
            case 'short':
                this.totalTime = this.settings.shortBreakDuration * 60;
                this.timerLabel.textContent = 'Short Break';
                this.timerCircle.className = 'timer-circle session-short';
                break;
            case 'long':
                this.totalTime = this.settings.longBreakDuration * 60;
                this.timerLabel.textContent = 'Long Break';
                this.timerCircle.className = 'timer-circle session-long';
                break;
        }

        this.timeLeft = this.totalTime;
        this.updateDisplay();
        this.updateProgress();
    }

    // Display Updates
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerTime.textContent = display;

        // Update page title
        document.title = `${display} - ${this.timerLabel.textContent}`;
    }

    updateProgress() {
        const circumference = 2 * Math.PI * 90; // radius = 90
        const progress = this.timeLeft / this.totalTime;
        const offset = circumference * (1 - progress);
        this.timerProgress.style.strokeDasharray = circumference;
        this.timerProgress.style.strokeDashoffset = offset;
    }

    updateSessionTracker() {
        this.sessionCount.textContent = `${this.completedSessions} / ${this.settings.sessionsBeforeLong}`;

        const dots = this.sessionDots.children;
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove('completed', 'active');
            if (i < this.completedSessions) {
                dots[i].classList.add('completed');
            } else if (i === this.completedSessions) {
                dots[i].classList.add('active');
            }
        }
    }

    // Settings
    toggleSettings() {
        const isOpen = this.settingsPanel.classList.toggle('open');
        this.settingsToggle.setAttribute('aria-expanded', isOpen);
    }

    saveSettings() {
        const work = parseInt(this.workDurationInput.value) || 25;
        const short = parseInt(this.shortDurationInput.value) || 5;
        const long = parseInt(this.longDurationInput.value) || 15;
        const sessions = parseInt(this.sessionsBeforeLongInput.value) || 4;

        this.settings = {
            workDuration: Math.max(1, Math.min(90, work)),
            shortBreakDuration: Math.max(1, Math.min(30, short)),
            longBreakDuration: Math.max(1, Math.min(60, long)),
            sessionsBeforeLong: Math.max(1, Math.min(10, sessions))
        };

        // Update inputs with validated values
        this.workDurationInput.value = this.settings.workDuration;
        this.shortDurationInput.value = this.settings.shortBreakDuration;
        this.longDurationInput.value = this.settings.longBreakDuration;
        this.sessionsBeforeLongInput.value = this.settings.sessionsBeforeLong;

        // Save to localStorage
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.settings));

        // Reset timer with new settings
        this.completedSessions = 0;
        this.updateSessionTracker();
        this.switchSession(this.currentSession);
        this.toggleSettings();
    }

    resetSettings() {
        this.settings = {
            workDuration: 25,
            shortBreakDuration: 5,
            longBreakDuration: 15,
            sessionsBeforeLong: 4
        };

        this.workDurationInput.value = this.settings.workDuration;
        this.shortDurationInput.value = this.settings.shortBreakDuration;
        this.longDurationInput.value = this.settings.longBreakDuration;
        this.sessionsBeforeLongInput.value = this.settings.sessionsBeforeLong;

        localStorage.removeItem('pomodoroSettings');

        this.completedSessions = 0;
        this.updateSessionTracker();
        this.switchSession(this.currentSession);
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            this.settings = JSON.parse(saved);
            this.workDurationInput.value = this.settings.workDuration;
            this.shortDurationInput.value = this.settings.shortBreakDuration;
            this.longDurationInput.value = this.settings.longBreakDuration;
            this.sessionsBeforeLongInput.value = this.settings.sessionsBeforeLong;
        }
    }

    // Sound
    toggleSound() {
        this.soundEnabled = this.soundToggle.checked;
        this.soundIcon.textContent = this.soundEnabled ? '🔔' : '🔕';
    }

    playNotificationSound() {
        if (!this.soundEnabled) return;

        try {
            // Create audio context on first user interaction
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Play a pleasant notification chime
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            
            notes.forEach((freq, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.value = freq;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + index * 0.15);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + index * 0.15 + 0.05);
                gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + index * 0.15 + 0.3);

                oscillator.start(this.audioContext.currentTime + index * 0.15);
                oscillator.stop(this.audioContext.currentTime + index * 0.15 + 0.3);
            });
        } catch (e) {
            console.log('Audio not supported');
        }
    }

    // Keyboard Navigation
    handleKeyboard(e) {
        // Space to start/pause
        if (e.code === 'Space' && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            if (this.isRunning) {
                this.pause();
            } else {
                this.start();
            }
        }

        // R to reset
        if (e.code === 'KeyR' && e.target.tagName !== 'INPUT') {
            this.reset();
        }

        // S to skip
        if (e.code === 'KeyS' && e.target.tagName !== 'INPUT') {
            this.skipToNext();
        }

        // Number keys to switch sessions
        if (e.code === 'Digit1' && e.target.tagName !== 'INPUT') {
            this.switchSession('work');
        }
        if (e.code === 'Digit2' && e.target.tagName !== 'INPUT') {
            this.switchSession('short');
        }
        if (e.code === 'Digit3' && e.target.tagName !== 'INPUT') {
            this.switchSession('long');
        }
    }

    handleTabKeyboard(e, tab) {
        const tabs = Array.from(this.tabs);
        const currentIndex = tabs.indexOf(tab);

        if (e.code === 'ArrowRight') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % tabs.length;
            tabs[nextIndex].focus();
            tabs[nextIndex].click();
        }

        if (e.code === 'ArrowLeft') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            tabs[prevIndex].focus();
            tabs[prevIndex].click();
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
