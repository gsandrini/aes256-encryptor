# AES-256-GCM Encryptor

A minimal tool to encrypt and decrypt text directly in the browser using AES-256-GCM.

🌐 **[Live demo](https://gsandrini.github.io/aes256-encryptor/)**

---

## Features

- **AES-256-GCM** authenticated encryption
- **PBKDF2** key derivation - 200 000 iterations, SHA-256
- Random **salt** (16 bytes) and **IV** (12 bytes) generated for every encryption
- 100% client-side - built on the native [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- Dark mode support
- Bilingual interface: 🇮🇹 Italian / 🇬🇧 English (auto-detected from browser language)
- Zero runtime dependencies beyond Alpine.js (bundled locally)

---

## How it works

Each encryption produces a single Base64 string containing:

```
[ salt (16 bytes) | IV (12 bytes) | ciphertext ]
```

The same password + this blob is all that is needed to decrypt. The salt and IV are unique per message, so encrypting the same text twice produces different outputs.

---

## Usage

### As a web app

Open the [live demo](https://gsandrini.github.io/aes256-encryptor/) in any modern browser

### Install

The app is available as a **Progressive Web App (PWA)** and can be installed directly on your device

1. Open the [live demo](https://gsandrini.github.io/aes256-encryptor/) in your browser
2. Look for the **install icon** in the address bar, or open the browser menu and select **"Install app"** / **"Add to Home Screen"**
3. Confirm the installation - the app will appear on your desktop or home screen and work just like a native app, even offline

---

## Tech stack

| Tool | Role |
|------|------|
| [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) | AES-256-GCM + PBKDF2 |
| [Alpine.js](https://alpinejs.dev) | Reactive UI (bundled locally) |
| [Tailwind CSS](https://tailwindcss.com) | Styling (compiled locally) |
| [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Typography |

---

## Security notes

- The password never leaves your device
- A fresh random salt and IV are generated on every encryption - identical plaintexts produce different ciphertexts
- AES-GCM provides both confidentiality and authenticity - a wrong password or tampered ciphertext is detected and rejected
- The Web Crypto API is implemented natively by the browser and is not controllable by this page's JavaScript

---

## Built with

This project was built with the support of [Claude](https://claude.ai) by Anthropic.

---

## Contributing

This repository is published for personal use / GitHub Pages only.
Pull requests and issues will not be reviewed or accepted.

---

## License

This project is licensed under the **GNU General Public License v3.0**.
See the [LICENSE](LICENSE) file for details.
