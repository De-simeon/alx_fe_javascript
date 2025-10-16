document.addEventListener("DOMContentLoaded", () => {
  let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Inspiration" },
    { text: "Do not wait for leaders; do it alone, person to person.", category: "Action" }
  ];

  const quoteContainer = document.getElementById("quoteDisplay");
  const newQuoteBtn = document.getElementById("newQuote");
  const addquoteForm = document.getElementById("add-quote-form");

  // --- Display a random quote ---
  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteContainer.textContent = "No quotes available. Add one below!";
      return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    quoteContainer.innerHTML = `
      <p class="quote-text">"${randomQuote.text}"</p>
      <p class="quote-category">— ${randomQuote.category}</p>
    `;
  }

  // --- Add a new quote ---
  function addquote(event) {
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
    textInput.value = "";
    categoryInput.value = "";

    quoteContainer.innerHTML = `<p>New quote added successfully!</p>`;
  }

  // --- Event Listeners ---
  newQuoteBtn.addEventListener("click", showRandomQuote);
  addquoteForm.addEventListener("submit", addquote);

  // Show one quote by default
  showRandomQuote();
});
