# Theme Switcher with CSS Variables

A theme switcher that changes a card using CSS variables. Pure HTML and CSS — no JavaScript.

Based on the [Theme Switcher](https://roadmap.sh/projects/theme-switcher) challenge from roadmap.sh.

## How to Run

Open `index.html` in your browser.

```bash
git clone https://github.com/Felzeth/roadmap-practice.git
cd roadmap-practice/theme-switcher
open index.html
```

## How It Works

- CSS tokens are defined at `:root` (`--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, etc.)
- Three radio inputs control which theme is active
- `body:has(#theme-dark:checked)` overrides the tokens for each theme
- The same card markup changes appearance based on the selected radio button
- No JavaScript — only CSS `:has()` selector

## Themes

| Theme | Description |
|-------|-------------|
| Light | White card on light gray background, blue accent |
| Dark | Dark card on navy background, blue accent |
| Custom | Cream card on yellow background, green accent |

## Project Structure

```
├── index.html
├── styles.css
└── README.md
```
