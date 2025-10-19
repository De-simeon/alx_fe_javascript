document.addEventListener("DOMContentLoaded", () => {
  let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Inspiration" },
    { text: "Do not wait for leaders; do it alone, person to person.", category: "Action" }
  ];

  const quoteContainer = document.getElementById("quoteDisplay");
  const button = document.getElementById("newQuote");

  function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  function loadQuotes() {
    const storedQuotes = localStorage.getItem("quotes");
    if (storedQuotes) quotes = JSON.parse(storedQuotes);
  }

  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteContainer.textContent = "No quotes available. Add one below!";
      return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    quoteContainer.innerHTML = `
      <p class="quote-text">${randomQuote.text}</p>
      <p class="quote-category">- ${randomQuote.category}</p>
    `;

    sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
  }

  function addQuote(event) {
    event.preventDefault();

    const textInput = document.getElementById("newQuoteText");
    const categoryInput = document.getElementById("newQuoteCategory");

    const newText = textInput.value.trim();
    const newCategory = categoryInput.value.trim();

    if (!newText || !newCategory) {
      alert("Please enter both a quote and a category.");
      return;
    }

    quotes.push({ text: newText, category: newCategory });
    saveQuotes();
    alert("Quote added successfully!");
    textInput.value = "";
    categoryInput.value = "";
  }

  // --- JSON Export ---
  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  // --- JSON Import ---
  document.getElementById("importFile").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const importedQuotes = JSON.parse(e.target.result);
        if (Array.isArray(importedQuotes)) {
          quotes.push(...importedQuotes);
          saveQuotes();
          alert("Quotes imported successfully!");
        } else {
          alert("Invalid file format.");
        }
      } catch {
        alert("Error reading file. Please upload a valid JSON.");
      }
    };
    reader.readAsText(file);
  });

  // --- Initialize ---
  loadQuotes();
  showRandomQuote();

  button.addEventListener("click", showRandomQuote);
  document.getElementById("add-quote-form").addEventListener("submit", addQuote);
});
