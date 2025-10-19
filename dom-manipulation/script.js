document.addEventListener("DOMContentLoaded", () => {
  let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
  const lastViewedQuote = sessionStorage.getItem("lastViewedQuote");
  const categoryFilter = document.getElementById("categoryFilter");
  const quoteContainer = document.getElementById("quoteContainer");
  const addQuoteBtn = document.getElementById("addQuoteBtn");
  const showQuoteBtn = document.getElementById("showQuoteBtn");
  const exportBtn = document.getElementById("exportBtn");
  const importInput = document.getElementById("importInput");
  const syncStatus = document.getElementById("syncStatus"); // for conflict notifications

  // --------------------- Existing Core Logic ---------------------
  function saveQuotesToLocalStorage() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  function showRandomQuote() {
    let filteredQuotes = getFilteredQuotes();
    if (filteredQuotes.length === 0) {
      quoteContainer.textContent = "No quotes available for this category.";
      return;
    }
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const quote = filteredQuotes[randomIndex];
    quoteContainer.textContent = `"${quote.text}" - [${quote.category}]`;
    sessionStorage.setItem("lastViewedQuote", quote.text);
  }

  function getFilteredQuotes() {
    const selectedCategory = categoryFilter.value;
    if (selectedCategory === "all") return quotes;
    return quotes.filter(q => q.category === selectedCategory);
  }

  function addQuote(text, category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    saveQuotesToLocalStorage();
    populateCategories();
    showRandomQuote();
    syncWithServer("POST", newQuote); // sync new quote
  }

  function createAddQuoteForm() {
    const form = document.createElement("form");
    form.innerHTML = `
      <input type="text" id="newQuoteText" placeholder="Enter quote" required>
      <input type="text" id="newQuoteCategory" placeholder="Enter category" required>
      <button type="submit">Add Quote</button>
    `;
    form.addEventListener("submit", e => {
      e.preventDefault();
      const text = document.getElementById("newQuoteText").value.trim();
      const category = document.getElementById("newQuoteCategory").value.trim();
      if (text && category) {
        addQuote(text, category);
        form.reset();
      }
    });
    quoteContainer.insertAdjacentElement("afterend", form);
  }

  // --------------------- Category System ---------------------
  function populateCategories() {
    const uniqueCategories = [...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
    uniqueCategories.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categoryFilter.appendChild(option);
    });

    const savedCategory = localStorage.getItem("selectedCategory");
    if (savedCategory) {
      categoryFilter.value = savedCategory;
    }
  }

  function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem("selectedCategory", selectedCategory);
    showRandomQuote();
  }

  // --------------------- Import/Export ---------------------
  function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const importedQuotes = JSON.parse(e.target.result);
        if (Array.isArray(importedQuotes)) {
          quotes = importedQuotes;
          saveQuotesToLocalStorage();
          populateCategories();
          showRandomQuote();
          syncWithServer("POST", importedQuotes); // push to server after import
        }
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  }

  // --------------------- Simulated Server Sync ---------------------
  const SERVER_URL = "https://jsonplaceholder.typicode.com/posts"; // mock server endpoint

  async function syncWithServer(method = "GET", payload = null) {
    try {
      if (method === "POST" && payload) {
        await fetch(SERVER_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        showSyncMessage("✅ Quotes synced to server.");
      } else if (method === "GET") {
        const response = await fetch(SERVER_URL);
        const serverData = await response.json();
        handleServerData(serverData);
      }
    } catch (err) {
      showSyncMessage("⚠️ Sync failed. Will retry later.");
    }
  }

  function handleServerData(serverQuotes) {
    if (!Array.isArray(serverQuotes)) return;

    // simulate server containing quotes array
    const serverQuoteList = serverQuotes.map(item => ({
      text: item.title || item.text,
      category: item.category || "General"
    }));

    const localTexts = new Set(quotes.map(q => q.text));
    let conflicts = [];

    serverQuoteList.forEach(sq => {
      if (!localTexts.has(sq.text)) {
        quotes.push(sq);
      } else {
        // conflict: prefer server data
        const localIdx = quotes.findIndex(q => q.text === sq.text);
        if (localIdx !== -1 && quotes[localIdx].category !== sq.category) {
          quotes[localIdx] = sq;
          conflicts.push(sq.text);
        }
      }
    });

    if (conflicts.length > 0) {
      showSyncMessage(`⚡ Conflicts resolved using server data: ${conflicts.join(", ")}`);
    } else {
      showSyncMessage("🔁 Local quotes updated from server.");
    }

    saveQuotesToLocalStorage();
    populateCategories();
    showRandomQuote();
  }

  function showSyncMessage(message) {
    if (!syncStatus) return;
    syncStatus.textContent = message;
    syncStatus.style.opacity = "1";
    setTimeout(() => (syncStatus.style.opacity = "0.6"), 4000);
  }

  // periodic sync every 30 seconds
  setInterval(() => syncWithServer("GET"), 30000);

  // --------------------- Event Listeners ---------------------
  showQuoteBtn.addEventListener("click", showRandomQuote);
  addQuoteBtn.addEventListener("click", createAddQuoteForm);
  exportBtn.addEventListener("click", exportToJsonFile);
  importInput.addEventListener("change", importFromJsonFile);
  categoryFilter.addEventListener("change", filterQuotes);

  // --------------------- Initialize ---------------------
  populateCategories();
  showRandomQuote();
  syncWithServer("GET");
});
