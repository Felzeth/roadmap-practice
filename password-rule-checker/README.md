# 🔐 Password Rule Checker

A real, interactive password strength checker. Type any password and instantly see which security rules pass or fail — no sample output, just live validation.

![Open in Browser](https://img.shields.io/badge/Open-in_Browser-blue?style=for-the-badge)

## 🚀 Try It Live

Simply open `index.html` in your browser — no server or build step required.

```bash
git clone https://github.com/YOUR_USERNAME/password-rule-checker.git
cd password-rule-checker
open index.html        # macOS
xdg-open index.html    # Linux
start index.html       # Windows
```

Or **[click here to try it live](https://YOUR_USERNAME.github.io/password-rule-checker/)** once you've enabled GitHub Pages.

## ✅ Validation Rules

| Rule | Description |
|------|-------------|
| Minimum length | At least 8 characters |
| Number | Contains at least one digit (0–9) |
| Uppercase letter | Contains at least one uppercase letter (A–Z) |

## 🧩 How It Works

1. Type a password in the input field
2. Watch the rules update in real time — green ✅ for passed, red ❌ for failed
3. Toggle visibility with the eye icon to review your password

## 📁 Project Structure

```
password-rule-checker/
├── index.html              # Main page with the UI
├── styles.css              # Dark-theme styles
├── app.js                  # Interactive UI logic
├── passwordValidator.js    # Core validation functions
└── README.md
```

## 🛠️ Development

The project is pure HTML, CSS, and JavaScript — no frameworks or build tools needed.

To preview changes, just refresh the browser after editing any file.

## 🌐 Deploy to GitHub Pages

1. Push your code to GitHub
2. Go to **Settings → Pages**
3. Set **Source** to "Deploy from a branch"
4. Select the `main` branch and `/ (root)` folder
5. Your site will be live at `https://YOUR_USERNAME.github.io/password-rule-checker/`

## 📜 License

MIT
