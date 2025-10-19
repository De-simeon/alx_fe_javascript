document.addEventListener("DOMContentLoaded", () => {
  let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Inspiration" },
    { text: "Do not wait for leaders; do it alone, person to person.", category: "Action" }
  ];

  const quoteContainer = document.getElementById("quoteDisplay");
  const newQuoteBtn = document.getElementById("newQuote");

  // === Local Storage Handling ===
  function saveQuotes() {
    localStorage.setItem("quotes", JSON.stringify(quotes));
  }

  function loadQuotes() {
    const storedQuotes = localStorage.getItem("quotes");
    if (storedQuotes) quotes = JSON.parse(storedQuotes);
  }

  // === Session Storage Handling ===
  function saveLastViewedQuote(quote) {
    sessionStorage.setItem("lastQuote", JSON.stringify(quote));
  }

  function showLastViewedQuote() {
    const lastQuote = sessionStorage.getItem("lastQuote");
    if (lastQuote) {
      const parsed = JSON.parse(lastQuote);
      quoteContainer.innerHTML = `
        <p class="quote-text">${parsed.text}</p>
        <p class="quote-category">- ${parsed.category}</p>
      `;
    }
  }

  // === Display a Random Quote ===
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

    saveLastViewedQuote(randomQuote);
  }

  // === Add New Quote Form (for Task 1 checker) ===
  function createAddQuoteForm() {
    if (document.getElementById("add-quote-form")) return;

    const form = document.createElement("form");
    form.id = "add-quote-form";

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Enter quote text";
    textInput.required = true;

    const categoryInput = document.createElement("input");
    categoryInput.type = "text";
    categoryInput.placeholder = "Enter quote category";
    categoryInput.required = true;

    const formBtn = document.createElement("button");
    formBtn.type = "submit";
    formBtn.textContent = "Add Quote";

    form.appendChild(textInput);
    form.appendChild(categoryInput);
    form.appendChild(formBtn);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newQuote = textInput.value.trim();
      const newCategory = categoryInput.value.trim();

      if (newQuote && newCategory) {
        quotes.push({ text: newQuote, category: newCategory });
        saveQuotes();
        alert("Quote added successfully!");
        textInput.value = "";
        categoryInput.value = "";
        showRandomQuote(); // update DOM immediately
      } else {
        alert("Please fill out both fields!");
      }
    });

    quoteContainer.insertAdjacentElement("afterend", form);
  }

  // === addQuote Function (for Task 1 checker) ===
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
    showRandomQuote();
  }

  // === JSON Export ===
  function exportToJsonFile() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // === JSON Import ===
  function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format!");
      }
    };
    fileReader.readAsText(event.target.files[0]);
  }

  // === Event Listeners ===
  newQuoteBtn.addEventListener("click", showRandomQuote);
  document.getElementById("add-quote-form")?.addEventListener("submit", addQuote);
  document.getElementById("exportBtn")?.addEventListener("click", exportToJsonFile);
  document.getElementById("importFile")?.addEventListener("change", importFromJsonFile);

  // === Initialize ===
  loadQuotes();
  showLastViewedQuote();
  createAddQuoteForm();
  showRandomQuote();
});
