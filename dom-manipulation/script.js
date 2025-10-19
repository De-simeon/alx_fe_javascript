// ===== Global Variables =====
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Inspiration" },
  { text: "Do not wait for leaders; do it alone, person to person.", category: "Action" }
];

// ===== Display a Random Quote =====
function displayRandomQuote() {
  const quoteContainer = document.getElementById("quoteDisplay");

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

  // Save the last viewed quote to session storage
  sessionStorage.setItem("lastViewedQuote", JSON.stringify(randomQuote));
}

// ===== Add a New Quote =====
function addQuote(event) {
  event.preventDefault();

  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText === "" || newCategory === "") {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();
  displayRandomQuote();
  textInput.value = "";
  categoryInput.value = "";
}

// ===== Save Quotes to Local Storage =====
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ===== Export Quotes to JSON File =====
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// ===== Import Quotes from JSON File =====
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ===== Event Listeners =====
document.addEventListener("DOMContentLoaded", () => {
  const showQuoteBtn = document.getElementById("newQuote");
  const addQuoteForm = document.getElementById("add-quote-form");

  showQuoteBtn.addEventListener("click", displayRandomQuote);
  addQuoteForm.addEventListener("submit", addQuote);

  // Display last viewed quote if it exists
  const lastQuote = sessionStorage.getItem("lastViewedQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById("quoteDisplay").innerHTML = `
      <p class="quote-text">${quote.text}</p>
      <p class="quote-category">- ${quote.category}</p>
    `;
  } else {
    displayRandomQuote();
  }
});
