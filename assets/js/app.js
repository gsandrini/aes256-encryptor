'use strict';

const TRANSLATIONS = {
  it: {
    title:          'AES-256-GCM Encryptor',
    labelText:      'Testo',
    placeholder:    'Testo da cifrare, oppure testo cifrato da decifrare…',
    placeholderPwd: 'Password…',
    btnShow:        'mostra',
    btnHide:        'nascondi',
    btnEncrypt:     'Cifra',
    btnDecrypt:     'Decifra',
    btnClear:       'Pulisci',
    btnCopy:        'copia',
    btnCopied:      'copiato ✓',
    labelEncrypted: 'Testo cifrato (base64)',
    labelDecrypted: 'Testo decifrato',
    labelError:     'Errore',
    errNoInput:     'Inserisci il testo da cifrare.',
    errNoInputDec:  'Inserisci il testo cifrato.',
    errNoPwd:       'Inserisci una password.',
    errEncrypt:     'Errore durante la cifratura: ',
    errDecrypt:     'Decifratura fallita - password errata o testo corrotto.',
    madeWith:       'Sviluppata con',
  },
  en: {
    title:          'AES-256-GCM Encryptor',
    labelText:      'Text',
    placeholder:    'Text to encrypt, or encrypted text to decrypt…',
    placeholderPwd: 'Password…',
    btnShow:        'show',
    btnHide:        'hide',
    btnEncrypt:     'Encrypt',
    btnDecrypt:     'Decrypt',
    btnClear:       'Clear',
    btnCopy:        'copy',
    btnCopied:      'copied ✓',
    labelEncrypted: 'Encrypted text (base64)',
    labelDecrypted: 'Decrypted text',
    labelError:     'Error',
    errNoInput:     'Please enter the text to encrypt.',
    errNoInputDec:  'Please enter the encrypted text.',
    errNoPwd:       'Please enter a password.',
    errEncrypt:     'Encryption error: ',
    errDecrypt:     'Decryption failed - wrong password or corrupted text.',
    madeWith:       'Built with',
  },
};

function cryptoApp() {
  return {

    lang: navigator.language.startsWith('it') ? 'it' : 'en',
    get t() { return TRANSLATIONS[this.lang]; },
    toggleLang() { this.lang = this.lang === 'it' ? 'en' : 'it'; },

    input:       '',
    password:    '',
    showPwd:     false,
    output:      null,
    outputLabel: '',
    isError:     false,
    loading:     false,
    copied:      false,

    clear() {
      this.input       = '';
      this.password    = '';
      this.output      = null;
      this.isError     = false;
      this.copied      = false;
    },

    showResult(text, label, error = false) {
      this.output      = text;
      this.outputLabel = label;
      this.isError     = error;
    },

    async copyOutput() {
      if (!this.output || this.isError) return;
      await navigator.clipboard.writeText(this.output);
      this.copied = true;
      setTimeout(() => { this.copied = false; }, 1800);
    },

    /*
     * Convert a Uint8Array to a Base64 string 
     */
    bytesToB64(bytes) {
      let bin = '';
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    },

    /*
     * Convert a Base64 string back to a Uint8Array 
     */
    b64ToBytes(b64) {
      const bin = atob(b64);
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    },

    /* 
     * Derive a 256-bit AES-GCM key from a password and salt using PBKDF2 
     */
    async deriveKey(password, salt) {
      const enc    = new TextEncoder();
      const keyMat = await crypto.subtle.importKey(
        'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
      );
      return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt, iterations: 200_000, hash: 'SHA-256' },
        keyMat,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    },

    /* 
     * Encrypt
     * Output format (Base64 encoded):
     * [ salt (16 bytes) | iv (12 bytes) | ciphertext ]
     */
    async encrypt() {
      const plain = this.input.trim();
      const pwd   = this.password;

      if (!plain) { this.showResult(this.t.errNoInput,  this.t.labelError, true); return; }
      if (!pwd)   { this.showResult(this.t.errNoPwd,    this.t.labelError, true); return; }

      this.loading = true;
      try {
        const salt   = crypto.getRandomValues(new Uint8Array(16));
        const iv     = crypto.getRandomValues(new Uint8Array(12));
        const key    = await this.deriveKey(pwd, salt);
        const cipher = await crypto.subtle.encrypt(
          { name: 'AES-GCM', iv },
          key,
          new TextEncoder().encode(plain)
        );

        /* Pack salt + iv + ciphertext into a single Uint8Array */
        const combined = new Uint8Array(16 + 12 + cipher.byteLength);
        combined.set(salt, 0);
        combined.set(iv, 16);
        combined.set(new Uint8Array(cipher), 28);

        this.showResult(this.bytesToB64(combined), this.t.labelEncrypted);
      } catch (e) {
        this.showResult(this.t.errEncrypt + e.message, this.t.labelError, true);
      } finally {
        this.loading = false;
      }
    },

    /*       
     * Decrypt
     * Expects the Base64 format produced by encrypt()
     */
    async decrypt() {
      const cipherText = this.input.trim();
      const pwd        = this.password;

      if (!cipherText) { this.showResult(this.t.errNoInputDec, this.t.labelError, true); return; }
      if (!pwd)        { this.showResult(this.t.errNoPwd,      this.t.labelError, true); return; }

      this.loading = true;
      try {
        const combined = this.b64ToBytes(cipherText);
        const salt = combined.slice(0, 16);
        const iv   = combined.slice(16, 28);
        const data = combined.slice(28);
        const key  = await this.deriveKey(pwd, salt);
        const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);

        this.showResult(new TextDecoder().decode(plain), this.t.labelDecrypted);
      } catch (e) {
        this.showResult(this.t.errDecrypt, this.t.labelError, true);
      } finally {
        this.loading = false;
      }
    },

  };
}
