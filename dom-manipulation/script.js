document.addEventListener("DOMContentLoaded", () => {
  // --- Storage keys ---
  const LS_KEY = "dqg_quotes_v1";         // localStorage key for quotes (persist across sessions)
  const SESSION_LAST_IDX = "dqg_last_index"; // sessionStorage key for last shown quote index

  // --- Default quotes if none in storage ---
  const DEFAULT_QUOTES = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Inspiration" },
    { text: "Do not wait for leaders; do it alone, person to person.", category: "Action" }
  ];

  // --- App state ---
  let quotes = loadQuotesFromLocal();
  let filteredCategory = "all";

  // --- DOM refs ---
  const quoteContainer = document.getElementById("quoteDisplay");
  const newQuoteBtn = document.getElementById("newQuote");
  const addQuoteForm = document.getElementById("add-quote-form");
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const exportBtn = document.getElementById("exportBtn");
  const importFileInput = document.getElementById("importFile");
  const importBtn = document.getElementById("importBtn");
  const clearLocalBtn = document.getElementById("clearLocal");
  const categoryFilter = document.getElementById("categoryFilter");
  const formMsg = document.getElementById("formMsg");

  // --- Initialization ---
  populateCategoryFilter();
  showRandomQuote(); // show an initial quote

  // --- Event listeners ---
  newQuoteBtn.addEventListener("click", () => {
    showRandomQuote(true); // true = rotate to new (store last)
  });

  addQuoteForm.addEventListener("submit", (ev) => {
    ev.preventDefault();
    addQuoteFromForm();
  });

  exportBtn.addEventListener("click", exportQuotesToJson);
  importBtn.addEventListener("click", () => importFileInput.click());
  importFileInput.addEventListener("change", importFromJsonFile);
  clearLocalBtn.addEventListener("click", clearLocalStorageSafely);
  categoryFilter.addEventListener("change", (e) => {
    filteredCategory = e.target.value;
    showRandomQuote(false); // show a (possibly filtered) quote
  });

  // --- Functions ---
  function loadQuotesFromLocal() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) {
        localStorage.setItem(LS_KEY, JSON.stringify(DEFAULT_QUOTES));
        return DEFAULT_QUOTES.slice();
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("Invalid quotes format");
      // validate items minimally
      const valid = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
      return valid;
    } catch (err) {
      console.warn("Error reading local storage, falling back to defaults:", err);
      localStorage.removeItem(LS_KEY);
      localStorage.setItem(LS_KEY, JSON.stringify(DEFAULT_QUOTES));
      return DEFAULT_QUOTES.slice();
    }
  }

  function saveQuotesToLocal() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(quotes));
    } catch (err) {
      console.error("Failed to save quotes to localStorage:", err);
      alert("Unable to save quotes: local storage quota may be exceeded.");
    }
  }

  function getAvailableQuotes() {
    if (filteredCategory === "all") return quotes;
    return quotes.filter(q => q.category.toLowerCase() === filteredCategory.toLowerCase());
  }

  function showRandomQuote(storeLast = false) {
    const avail = getAvailableQuotes();
    if (avail.length === 0) {
      quoteContainer.innerHTML = `<p>No quotes available for the selected category. Add one below!</p>`;
      return;
    }

    // Determine index: prefer session-stored index if not forcing new
    let lastIndex = null;
    if (!storeLast) {
      const s = sessionStorage.getItem(SESSION_LAST_IDX);
      if (s !== null) lastIndex = Number(s);
    }

    let idx;
    if (lastIndex === null || isNaN(lastIndex) || lastIndex < 0 || lastIndex >= avail.length) {
      idx = Math.floor(Math.random() * avail.length);
    } else {
      idx = lastIndex;
    }

    const chosen = avail[idx];
    // Render
    quoteContainer.innerHTML = `
      <div>
        <div style="font-size:1.15rem; font-weight:600">"${escapeHtml(chosen.text)}"</div>
        <div class="meta">— ${escapeHtml(chosen.category)}</div>
      </div>
    `;

    // store last shown quote index in session
    const globalIndex = quotes.indexOf(chosen);
    if (storeLast || sessionStorage.getItem(SESSION_LAST_IDX) === null) {
      sessionStorage.setItem(SESSION_LAST_IDX, String(idx));
    }
    // also store the index relative to full quotes array to keep a consistent identity (optional)
    sessionStorage.setItem("dqg_last_global_index", String(globalIndex));
  }

  function addQuoteFromForm() {
    const newText = textInput.value.trim();
    const newCategory = categoryInput.value.trim();

    formMsg.textContent = "";
    if (!newText || !newCategory) {
      formMsg.textContent = "Both quote and category are required.";
      return;
    }

    // Prevent exact duplicates (text + category) — small safeguard
    const exists = quotes.some(q => q.text === newText && q.category.toLowerCase() === newCategory.toLowerCase());
    if (exists) {
      formMsg.textContent = "This quote already exists.";
      textInput.value = "";
      return;
    }

    const newQuote = { text: newText, category: newCategory };
    quotes.push(newQuote);
    saveQuotesToLocal();
    populateCategoryFilter();
    textInput.value = "";
    categoryInput.value = "";
    formMsg.textContent = "Quote added successfully!";
    // show it immediately
    filteredCategory = "all";
    categoryFilter.value = "all";
    showRandomQuote(true);
  }

  function populateCategoryFilter() {
    const categories = Array.from(new Set(quotes.map(q => q.category.trim()).filter(Boolean).map(c => c)));
    // keep 'all' at top
    categoryFilter.innerHTML = `<option value="all">All Categories</option>` + categories.map(c => `<option value="${escapeHtmlAttr(c)}">${escapeHtml(c)}</option>`).join("");
  }

  // --- Export to JSON ---
  function exportQuotesToJson() {
    try {
      const payload = JSON.stringify(quotes, null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, "-");
      a.href = url;
      a.download = `quotes-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export quotes.");
    }
  }

  // --- Import from JSON file (safe) ---
  function importFromJsonFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(String(e.target.result));
        if (!Array.isArray(parsed)) throw new Error("Imported JSON must be an array of quotes.");
        // Validate items and map to clean shape
        const sanitized = parsed
          .map(item => {
            if (!item || typeof item.text !== "string" || typeof item.category !== "string") return null;
            return { text: item.text.trim(), category: item.category.trim() };
          })
          .filter(Boolean);

        if (sanitized.length === 0) {
          alert("No valid quotes found in the imported file.");
          importFileInput.value = ""; // reset
          return;
        }

        // Merge without duplicates
        let added = 0;
        sanitized.forEach(q => {
          const exists = quotes.some(existing => existing.text === q.text && existing.category.toLowerCase() === q.category.toLowerCase());
          if (!exists) {
            quotes.push(q);
            added++;
          }
        });

        if (added > 0) {
          saveQuotesToLocal();
          populateCategoryFilter();
          alert(`Successfully imported ${added} new quote${added > 1 ? "s" : ""}.`);
          showRandomQuote(true);
        } else {
          alert("No new quotes were imported (all were duplicates).");
        }
      } catch (err) {
        console.error("Import error:", err);
        alert("Failed to import JSON. Make sure the file is valid and contains an array of {text, category} objects.");
      } finally {
        importFileInput.value = ""; // reset so same file can be re-imported if needed
      }
    };
    reader.readAsText(file);
  }

  // --- Clear local storage with confirmation ---
  function clearLocalStorageSafely() {
    const ok = confirm("This will remove all saved quotes (localStorage). Defaults will be restored on reload. Continue?");
    if (!ok) return;
    localStorage.removeItem(LS_KEY);
    quotes = loadQuotesFromLocal();
    populateCategoryFilter();
    showRandomQuote(true);
    alert("Saved quotes cleared. Defaults restored.");
  }

  // --- Small utilities ---
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]));
  }
  function escapeHtmlAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }

});
