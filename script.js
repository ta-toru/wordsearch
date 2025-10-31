// ======== 辞書ファイル読み込み ========
async function loadDictionary(lang) {
  const file = lang === "en" ? "words_en.txt" : "words_ja.txt";
  const response = await fetch(file);
  const text = await response.text();
  return text
    .split(/\r?\n/)
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length > 0);
}

// ======== 「?」パターンを正規表現に変換 ========
function patternToRegex(pattern) {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regexStr = "^" + escaped.replace(/\?/g, ".") + "$";
  return new RegExp(regexStr, "u");
}

// ======== 入力文字・ボタン関連 ========
const patternInput = document.getElementById("pattern");
const charButtonsDiv = document.getElementById("char-buttons");
const selectedDiv = document.getElementById("selected-chars");

// 選択された文字の順序
let selectedChars = [];

// 入力欄の監視（数字除外）
patternInput.addEventListener("input", () => {
  // 数字を削除
  patternInput.value = patternInput.value.replace(/[0-9]/g, "");

  // 文字をボタン化
  const chars = patternInput.value.split("");
  charButtonsDiv.innerHTML = chars
    .map((c, idx) => `<button type="button" class="char-btn" data-index="${idx}">${c}</button>`)
    .join("");

  selectedChars = [];
  updateSelectedDisplay();

  // ボタンクリックイベントを設定
  document.querySelectorAll(".char-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const char = btn.textContent;
      selectedChars.push(char);
      updateSelectedDisplay();
    });
  });
});

function updateSelectedDisplay() {
  selectedDiv.innerHTML = selectedChars
    .map(c => `<button type="button" class="selected-btn">${c}</button>`)
    .join("");
}

// ======== メイン検索処理 ========
document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const lang = document.getElementById("lang").value;
  const pattern = patternInput.value.trim();
  const resultDiv = document.getElementById("result");

  if (!pattern && selectedChars.length === 0) {
    resultDiv.innerHTML = "<p>文字を入力または選択してください。</p>";
    return;
  }

  // 辞書をロード
  const dictionary = await loadDictionary(lang);
  let results = [];

  // ======== 「?」パターン検索 ========
  if (pattern.includes("?")) {
    const regex = patternToRegex(pattern);
    results = dictionary.filter(w => regex.test(w));

  // ======== 選択された文字順検索 ========
  } else if (selectedChars.length > 0) {
    const pickedWord = selectedChars.join("").toLowerCase();
    results = dictionary.filter(w => w === pickedWord);
  }

  // ======== 結果表示 ========
  if (results.length > 0) {
    resultDiv.innerHTML = `
      <h2>結果（${lang === "en" ? "英語" : "日本語"}）</h2>
      <table>
        <tr><th>単語</th></tr>
        ${results.map(r => `<tr><td>${r}</td></tr>`).join("")}
      </table>
    `;
  } else {
    resultDiv.innerHTML = `<p>一致する単語は見つかりませんでした。</p>`;
  }
});
