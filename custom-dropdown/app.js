/**
 * Custom Dropdown — interactive logic
 */

const dropdown = document.getElementById('dropdown');
const trigger = document.getElementById('dropdownTrigger');
const menu = document.getElementById('dropdownMenu');
const valueEl = document.getElementById('dropdownValue');
const items = menu.querySelectorAll('.dropdown-item');

let selectedValue = null;

// ── Toggle Open / Close ────────────────────────

function openDropdown() {
  dropdown.classList.add('open');
  trigger.setAttribute('aria-expanded', 'true');
}

function closeDropdown() {
  dropdown.classList.remove('open');
  trigger.setAttribute('aria-expanded', 'false');
}

function toggleDropdown() {
  if (dropdown.classList.contains('open')) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

// ── Select Item ────────────────────────────────

function selectItem(item) {
  const value = item.getAttribute('data-value');

  // Deselect previous
  items.forEach(i => i.classList.remove('selected'));

  // Select new
  item.classList.add('selected');
  selectedValue = value;
  valueEl.textContent = value;

  closeDropdown();
}

// ── Events ─────────────────────────────────────

trigger.addEventListener('click', toggleDropdown);

items.forEach(item => {
  item.addEventListener('click', () => selectItem(item));
});

// Close when clicking outside
document.addEventListener('click', (e) => {
  if (!dropdown.contains(e.target)) {
    closeDropdown();
  }
});

// Keyboard support
trigger.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDropdown();
  }
});
