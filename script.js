class ManualRSA {
  constructor() {
    this.n = null;
    this.e = null;
    this.d = null;
    this.initCharMaps();
  }

  initCharMaps() {
    this.charMap = new Map();
    this.reverseMap = new Map();

    const chars = [];

    for (let i = 1040; i <= 1103; i++) chars.push(String.fromCharCode(i));

    for (let i = 65; i <= 90; i++) chars.push(String.fromCharCode(i));
    for (let i = 97; i <= 122; i++) chars.push(String.fromCharCode(i));

    for (let i = 48; i <= 57; i++) chars.push(String.fromCharCode(i));

    const symbols = " .!?,;:\"'()[]{}<>@#$%^&*+-=/\\|`~";
    for (const char of symbols) chars.push(char);

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const code = i + 1;
      this.charMap.set(char, code);
      this.reverseMap.set(code, char);
    }
  }

  encodeChar(char) {
    return this.charMap.get(char) || this.charMap.get(" ") || 1;
  }

  decodeChar(code) {
    return this.reverseMap.get(code) || " ";
  }

  isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;

    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }

  getRandomPrime() {
    const primes = [
      13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83,
      89, 97,
    ];
    return primes[Math.floor(Math.random() * primes.length)];
  }

  gcd(a, b) {
    while (b !== 0) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  modInverse(e, phi) {
    for (let d = 3; d < phi; d++) {
      if ((e * d) % phi === 1) {
        return d;
      }
    }
    return 1;
  }

  modPow(base, exponent, modulus) {
    if (modulus === 1) return 0;
    let result = 1;
    base = base % modulus;

    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = (result * base) % modulus;
      }
      exponent = Math.floor(exponent / 2);
      base = (base * base) % modulus;
    }

    return result;
  }

  generateKeys() {
    try {
      let p, q;

      do {
        p = this.getRandomPrime();
        q = this.getRandomPrime();
      } while (p === q);

      const n = p * q;
      const phi = (p - 1) * (q - 1);

      const possibleE = [3, 5, 7, 11, 13, 17, 19, 23, 29, 31];
      let e = 17;

      for (const eCandidate of possibleE) {
        if (this.gcd(eCandidate, phi) === 1) {
          e = eCandidate;
          break;
        }
      }

      let d = this.modInverse(e, phi);

      if ((e * d) % phi !== 1) {
        for (d = 2; d < phi; d++) {
          if ((e * d) % phi === 1) {
            break;
          }
        }
      }

      this.n = n;
      this.e = e;
      this.d = d;

      return {
        n: n,
        e: e,
        d: d,
        p: p,
        q: q,
        phi: phi,
      };
    } catch (error) {
      const demoKeys = [
        { n: 3233, e: 17, d: 2753 },
        { n: 3127, e: 3, d: 2011 },
        { n: 4087, e: 5, d: 2693 },
        { n: 4699, e: 7, d: 2743 },
        { n: 5561, e: 11, d: 3251 },
      ];

      const randomKey = demoKeys[Math.floor(Math.random() * demoKeys.length)];
      this.n = randomKey.n;
      this.e = randomKey.e;
      this.d = randomKey.d;

      return randomKey;
    }
  }

  encryptMessage(message) {
    if (!this.n || !this.e) {
      throw new Error("Ключи не инициализированы");
    }

    const encrypted = [];

    for (let i = 0; i < message.length; i++) {
      const char = message[i];
      const encodedValue = this.encodeChar(char);
      const encryptedValue = this.modPow(encodedValue, this.e, this.n);
      encrypted.push(encryptedValue);
    }

    return encrypted;
  }

  decryptMessage(encryptedArray) {
    if (!this.n || !this.d) {
      throw new Error("Ключи не инициализированы");
    }

    let result = "";

    for (let i = 0; i < encryptedArray.length; i++) {
      try {
        const encryptedValue = encryptedArray[i];
        const encodedValue = this.modPow(encryptedValue, this.d, this.n);
        const char = this.decodeChar(encodedValue);
        result += char;
      } catch (error) {
        result += "�";
      }
    }

    return result;
  }
}

let rsa = new ManualRSA();
let currentKeys = null;

function showStatus(message, type = "info") {
  const statusEl = document.getElementById("status");
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
}

function updateKeyDisplay() {
  if (currentKeys) {
    document.getElementById("key-n").textContent = currentKeys.n;
    document.getElementById("key-e").textContent = currentKeys.e;
    document.getElementById("key-d").textContent = currentKeys.d;

    document.getElementById("encrypt-btn").disabled = false;
    document.getElementById("decrypt-btn").disabled = false;
  }
}

function clearResults() {
  document.getElementById("encrypt-result").textContent =
    'Нажмите "Зашифровать сообщение"';
  document.getElementById("decrypt-result").textContent =
    "Сначала сгенерируйте ключи и зашифруйте сообщение";
}

function generateKeys() {
  try {
    const btn = document.getElementById("generate-btn");
    btn.textContent = "⏳ Генерация...";

    showStatus("Генерация новых ключей...", "info");

    setTimeout(() => {
      try {
        currentKeys = rsa.generateKeys();
        updateKeyDisplay();
        clearResults();

        showStatus(
          "✅ Новые ключи сгенерированы! Теперь можно шифровать сообщения.",
          "success"
        );

        btn.textContent = "🔄 Сгенерировать ключи";
      } catch (error) {
        showStatus(`❌ Ошибка генерации: ${error.message}`, "error");
        btn.textContent = "🔄 Сгенерировать ключи";
      }
    }, 100);
  } catch (error) {
    showStatus(`❌ Ошибка: ${error.message}`, "error");
    document.getElementById("generate-btn").textContent =
      "🔄 Сгенерировать ключи";
  }
}

function encryptMessage() {
  if (!currentKeys) {
    showStatus("❌ Сначала сгенерируйте ключи", "warning");
    return;
  }

  try {
    const message = document.getElementById("encrypt-message").value;

    if (!message.trim()) {
      showStatus("❌ Введите сообщение для шифрования", "warning");
      return;
    }

    showStatus("Шифрование сообщения...", "info");

    setTimeout(() => {
      try {
        const encryptedArray = rsa.encryptMessage(message);
        const encryptedString = encryptedArray.join(" ");

        let output = "ИСПОЛЬЗОВАННЫЕ КЛЮЧИ:\n";
        output += "═".repeat(30) + "\n";
        output += `n = ${currentKeys.n}\n`;
        output += `e = ${currentKeys.e}\n\n`;

        output += "ИСХОДНОЕ СООБЩЕНИЕ:\n";
        output += "═".repeat(30) + "\n";
        output += `"${message}"\n\n`;

        output += "ЗАШИФРОВАННОЕ СООБЩЕНИЕ:\n";
        output += "═".repeat(30) + "\n";
        output += encryptedString + "\n\n";

        output += `${message.length} символов зашифровано\n`;
        output += `Для расшифрования нужны те же ключи`;

        document.getElementById("encrypt-result").textContent = output;
        document.getElementById("decrypt-cipher").value = encryptedString;
        document.getElementById("decrypt-result").textContent =
          'Нажмите "Расшифровать сообщение"';

        showStatus(
          `✅ Сообщение зашифровано! ${message.length} символов`,
          "success"
        );
      } catch (error) {
        showStatus(`❌ Ошибка шифрования: ${error.message}`, "error");
        document.getElementById(
          "encrypt-result"
        ).textContent = `Ошибка: ${error.message}`;
      }
    }, 100);
  } catch (error) {
    showStatus(`❌ Ошибка: ${error.message}`, "error");
  }
}

function decryptMessage() {
  if (!currentKeys) {
    showStatus("❌ Сначала сгенерируйте ключи", "warning");
    return;
  }

  try {
    const cipherText = document.getElementById("decrypt-cipher").value.trim();

    if (!cipherText) {
      showStatus("❌ Введите зашифрованное сообщение", "warning");
      return;
    }

    const encryptedArray = cipherText.split(/\s+/).map((num) => {
      const n = parseInt(num);
      if (isNaN(n)) throw new Error(`"${num}" не является числом`);
      return n;
    });

    if (encryptedArray.length === 0) {
      showStatus("❌ Нет чисел для расшифрования", "warning");
      return;
    }

    showStatus("Расшифрование сообщения...", "info");

    setTimeout(() => {
      try {
        const decrypted = rsa.decryptMessage(encryptedArray);

        let output = "ИСПОЛЬЗОВАННЫЕ КЛЮЧИ:\n";
        output += "═".repeat(30) + "\n";
        output += `n = ${currentKeys.n}\n`;
        output += `d = ${currentKeys.d}\n\n`;

        output += "РАСШИФРОВАННОЕ СООБЩЕНИЕ:\n";
        output += "═".repeat(30) + "\n";
        output += `"${decrypted}"\n\n`;

        if (decrypted.includes("�")) {
          output += "⚠️ Некоторые символы не удалось расшифровать\n";
          output += "   Возможно, сообщение зашифровано другими ключами\n";
        } else {
          output += `✅ ${decrypted.length} символов успешно расшифровано`;
        }

        document.getElementById("decrypt-result").textContent = output;
        showStatus("✅ Сообщение расшифровано!", "success");
      } catch (error) {
        showStatus(`❌ Ошибка расшифрования: ${error.message}`, "error");
        document.getElementById(
          "decrypt-result"
        ).textContent = `Ошибка: ${error.message}\n\nВозможно, это сообщение было зашифровано другими ключами.\nСгенерируйте нужные ключи и зашифруйте сообщение заново.`;
      }
    }, 100);
  } catch (error) {
    showStatus(`❌ Ошибка: ${error.message}`, "error");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("generate-btn").disabled = false;
  document.getElementById("encrypt-btn").disabled = true;
  document.getElementById("decrypt-btn").disabled = true;

  // Автоматическая генерация ключей при загрузке
  setTimeout(generateKeys, 300);

  document
    .getElementById("encrypt-message")
    .addEventListener("input", function () {
      const length = this.value.length;
      if (length > 0 && currentKeys) {
        showStatus(`Готово к шифрованию: ${length} символов`, "info");
      }
    });

  document
    .getElementById("decrypt-cipher")
    .addEventListener("click", function () {
      if (
        !this.value.trim() &&
        document
          .getElementById("encrypt-result")
          .textContent.includes("ЗАШИФРОВАННОЕ СООБЩЕНИЕ:")
      ) {
        const lines = document
          .getElementById("encrypt-result")
          .textContent.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes("═".repeat(30))) {
            const nextLine = lines[i + 1];
            if (nextLine && nextLine.trim()) {
              this.value = nextLine.trim();
              break;
            }
          }
        }
      }
    });
});

window.ManualRSA = ManualRSA;
window.generateKeys = generateKeys;
window.encryptMessage = encryptMessage;
window.decryptMessage = decryptMessage;

console.log("🔐 RSA Шифрование инициализировано!");
