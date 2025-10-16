document.addEventListener("DOMContentLoaded", () => {
  let quotes = [
    {
      text: "The only limit to our realization of tomorrow is our doubts of today.",
      category: "Motivation"
    },
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      category: "Inspiration"
    },
    {
      text: "Do not wait for leaders; do it alone, person to person.",
      category: "Action"
    }
  ];

  const quoteContainer = document.getElementById("quoteDisplay");
  const button = document.getElementById("newQuote");

  function showRandomQuote() {
    if (quotes.length === 0) {
      quoteContainer.textContent = "No quotes available. Add one below!";
      return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];

    quoteContainer.innerHTML = `
      <p class="quote-text"> ${randomQuote.text}</p>
      <p class="quote-category">- ${randomQuote.category}</p>
    `
  }

  function createAddQuoteForm() {
    if (document.getElementById("add-quote-form")) return;

    // Creating the form "<form id='add-quote-form'></form>"
    const form = document.createElement("form");
    form.id = "add-quote-form";

    // Creating the input section "<input type='text' placeholder='Enter quote text' required>"
    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = "Enter quote text";


    // Creating the input section "<input type='text' placeholder='Enter quote category' required>"
    const categoryInput = document.createElement("input");
    categoryInput.type = "text";
    categoryInput.placeholder = "Enter quote category";

    // Creating button "<buton type='submit'>Add Quote</button>"
    const formBtn = document.createElement("button");
    formBtn.type = "submit";
    formBtn.textContent = "Add Quote";

    form.append(textInput, categoryInput, formBtn);

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const newQuote = textInput.value.trim();
      const newCategory = categoryInput.value.trim();

      if (newQuote && newCategory) {
        quotes.push({ text: newQuote, category: newCategory });
        alert("Quote added successfully!");
        textInput.value = "";
        categoryInput.value = "";
      }else{
        alert("Please fill out both fields!")
      }

    });

    quoteContainer.insertAdjacentElement("afterend", form);

  }
  button.addEventListener("click", showRandomQuote);
  createAddQuoteForm();
  showRandomQuote();
});