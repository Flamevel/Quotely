document.addEventListener("DOMContentLoaded", () => {
  const quoteEl = document.querySelector(".quote");
  const authorEl = document.querySelector(".author");
  const yearEl = document.querySelector(".meta-item:nth-child(1) span");
  const categoryEl = document.querySelector(".meta-item:nth-child(2) span");

  const reloadBtn = document.querySelector(".actions button:nth-child(1)");
  const addBtn = document.querySelector(".actions button:nth-child(2)");
  const bookmarkBtn = document.querySelector(".actions button:nth-child(3)");
  const shareBtn = document.querySelector(".actions button:nth-child(4)");

  let quotes = [];
  let customQuotes = [];
  let currentQuote = null;

  fetch("../data/quotes.json")
    .then((res) => res.json())
    .then((data) => {
      quotes = data;
      showRandomQuote();
    })
    .catch((err) => console.error("Failed to load quotes:", err));

  function showRandomQuote() {
    if (!quotes.length) return;
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    currentQuote = quote;
    displayQuote(quote);
  }

  function displayQuote(quote) {
    quoteEl.textContent = `“${quote.quote}”`;
    authorEl.textContent = `~ ${quote.author}`;
    yearEl.textContent = quote.year || "-";
    categoryEl.textContent = quote.category || "General";
  }

  function addCustomQuote() {
    const quoteText = prompt("Enter the quote:");
    if (!quoteText) return;

    const author = prompt("Enter the author:") || "Unknown";
    const year = prompt("Enter the year:") || "-";
    const category = prompt("Enter category:") || "Uncategorized";

    const newQuote = {
      id: Date.now(),
      quote: quoteText,
      author,
      year,
      category,
      quote_source: "User",
      quote_link: "",
      license: "User-Added"
    };

    customQuotes.push(newQuote);
    currentQuote = newQuote;
    displayQuote(newQuote);
    renderCustomQuotes();
  }

  function saveToBookmarks() {
    if (!currentQuote) return;

    chrome.storage.local.get({ bookmarks: [] }, (data) => {
      const existing = data.bookmarks || [];
      const alreadySaved = existing.some((q) => q.quote === currentQuote.quote);

      if (alreadySaved) {
        alert("Quote is already bookmarked.");
        return;
      }

      const updated = [...existing, currentQuote];
      chrome.storage.local.set({ bookmarks: updated }, () => {
        alert("Quote bookmarked!");
        renderBookmarks();
      });
    });
  }

  function shareQuote() {
    if (!currentQuote) return;

    const text = `“${currentQuote.quote}”\n~ ${currentQuote.author}`;
    navigator.clipboard.writeText(text)
      .then(() => alert("Copied to clipboard!"))
      .catch(() => alert("Copy failed."));
  }

  function renderBookmarks() {
    chrome.storage.local.get({ bookmarks: [] }, (data) => {
      const container = document.querySelector("#bookmarkedQuotes");
      if (!container) return;

      container.innerHTML = "<h3>Bookmarked Quotes</h3>";

      const bookmarks = data.bookmarks || [];

      if (bookmarks.length === 0) {
        container.innerHTML += "<p>No bookmarks yet.</p>";
        return;
      }

      bookmarks.forEach((quote, index) => {
        const div = document.createElement("div");
        div.className = "quote-card";
        div.innerHTML = `
          <p>“${quote.quote}”</p>
          <p>~ ${quote.author}</p>
          <small>${quote.category} • ${quote.year}</small>
          <button class="delete-bookmark" data-index="${index}">🗑 Delete</button>
        `;
        container.appendChild(div);
      });

      container.querySelectorAll(".delete-bookmark").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const index = e.target.dataset.index;
          bookmarks.splice(index, 1);
          chrome.storage.local.set({ bookmarks }, renderBookmarks);
        });
      });
    });
  }

  function renderCustomQuotes() {
    const container = document.querySelector("#customQuotes");
    if (!container) return;

    container.innerHTML = "<h3>Your Quotes</h3>";

    if (customQuotes.length === 0) {
      container.innerHTML += "<p>No custom quotes added yet.</p>";
      return;
    }

    customQuotes.forEach((quote, index) => {
      const div = document.createElement("div");
      div.className = "quote-card";
      div.innerHTML = `
        <p>“${quote.quote}”</p>
        <p>~ ${quote.author}</p>
        <small>${quote.category} • ${quote.year}</small>
        <button class="delete-custom" data-index="${index}">🗑 Delete</button>
      `;
      container.appendChild(div);
    });

    container.querySelectorAll(".delete-custom").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const index = e.target.dataset.index;
        customQuotes.splice(index, 1);
        renderCustomQuotes();
      });
    });
  }

  reloadBtn.addEventListener("click", showRandomQuote);
  addBtn.addEventListener("click", addCustomQuote);
  bookmarkBtn.addEventListener("click", saveToBookmarks);
  shareBtn.addEventListener("click", shareQuote);

  renderBookmarks();
  renderCustomQuotes();
});
  