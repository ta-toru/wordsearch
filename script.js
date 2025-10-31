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

// ======== 指定位置から文字を拾う ========
function pickLetters(word, positions) {
  let chars = [];
  for (let p of positions) {
    if (p >= 1 && p <= word.length) {
      chars.push(word[p - 1]);
    }
  }
  return chars.join("");
}

// ======== 「?」パターンを正規表現に変換 ========
function patternToRegex(pattern) {
  // 例: "??a?" → /^..a.$/
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // 正規表現用にエスケープ
  const regexStr = "^" + escaped.replace(/\?/g, ".") + "$";
  return new RegExp(regexStr, "u"); // u フラグ：Unicode対応
}

// ======== メイン処理 ========
document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const lang = document.getElementById("lang").value;
  const patternInput = document.getElementById("pattern").value.trim();
  const resultDiv = document.getElementById("result");

  if (!patternInput) {
    resultDiv.innerHTML = "<p>パターンを入力してください。</p>";
    return;
  }

  // 辞書をロード
  const dictionary = await loadDictionary(lang);
  let results = [];

  // ======== 「?」検索モード ========
  if (patternInput.includes("?")) {
    const regex = patternToRegex(patternInput);
    results = dictionary.filter(w => regex.test(w));

  // ======== 数字による拾いモード ========
  } else {
    const positions = patternInput
      .split(",")
      .map(p => parseInt(p.trim()))
      .filter(n => !isNaN(n));

    for (const word of dictionary) {
      const picked = pickLetters(word, positions);
      if (dictionary.includes(picked) && picked !== word) {
        results.push(`${word} → ${picked}`);
      }
    }
  }

  // ======== 結果表示 ========
  if (results.length > 0) {
    let html = `
      <h2>結果（${lang === "en" ? "英語" : "日本語"}）</h2>
      <table>
        <tr><th>単語</th></tr>
        ${results.map(r => `<tr><td>${r}</td></tr>`).join("")}
      </table>
    `;
    resultDiv.innerHTML = html;
  } else {
    resultDiv.innerHTML = `<p>一致する単語は見つかりませんでした。</p>`;
  }
});
