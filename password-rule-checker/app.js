/**
 * Password Checker — interactive UI logic (v2)
 */

const passwordInput = document.getElementById('passwordInput');
const toggleBtn = document.getElementById('toggleVisibility');
const strengthBar = document.getElementById('strengthBar');
const verdictEl = document.getElementById('verdict');
const shieldIcon = document.querySelector('.shield-icon');

const ruleMap = {
  'minimum length':   'rule-min-length',
  'number':           'rule-number',
  'uppercase letter': 'rule-uppercase',
};

const TOTAL_RULES = Object.keys(ruleMap).length;

function updateUI() {
  const password = passwordInput.value;

  // Empty state — reset everything
  if (password === '') {
    document.querySelectorAll('.rule').forEach(el => {
      el.classList.remove('passed', 'failed');
    });
    strengthBar.style.width = '0%';
    strengthBar.style.background = 'var(--text-dim)';
    verdictEl.textContent = '';
    verdictEl.className = 'verdict';
    shieldIcon.classList.remove('all-pass');
    return;
  }

  const result = validatePassword(password);
  const passed = TOTAL_RULES - result.failedRules.length;

  // Update each rule
  for (const [ruleName, elementId] of Object.entries(ruleMap)) {
    const el = document.getElementById(elementId);
    if (result.failedRules.includes(ruleName)) {
      el.classList.remove('passed');
      el.classList.add('failed');
    } else {
      el.classList.remove('failed');
      el.classList.add('passed');
    }
  }

  // Strength bar
  const pct = (passed / TOTAL_RULES) * 100;
  strengthBar.style.width = pct + '%';

  if (result.valid) {
    strengthBar.style.background = 'var(--green)';
    verdictEl.textContent = '✅ Your password is strong!';
    verdictEl.className = 'verdict valid';
    shieldIcon.classList.add('all-pass');
  } else {
    strengthBar.style.background = passed >= 2 ? 'var(--amber)' : 'var(--red)';
    verdictEl.textContent = `Missing ${result.failedRules.length} rule${result.failedRules.length > 1 ? 's' : ''}`;
    verdictEl.className = 'verdict invalid';
    shieldIcon.classList.remove('all-pass');
  }
}

// Real-time validation
passwordInput.addEventListener('input', updateUI);

// Toggle visibility
toggleBtn.addEventListener('click', () => {
  const isPassword = passwordInput.type === 'password';
  passwordInput.type = isPassword ? 'text' : 'password';
  document.body.classList.toggle('password-visible', isPassword);
  passwordInput.focus();
});
