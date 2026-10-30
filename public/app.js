// Chapter One storefront — plain ES module, no framework, no build step.
// The pure helpers below are exported so tests can check them directly.

/** Escape text before putting it into HTML, so a title like `<b>x</b>` is shown, not run. */
export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Format a numeric price as a dollar string, e.g. 14.9 -> "$14.90". */
export function formatPrice(price) {
  return `$${Number(price).toFixed(2)}`;
}

/** Filter books by title, author, genre, or description. */
export function filterBooks(books, query) {
  const searchTerm = String(query).trim().toLowerCase();
  if (!searchTerm) return books;

  return books.filter((book) =>
    [book.title, book.author, book.genre, book.description].some((field) =>
      field.toLowerCase().includes(searchTerm),
    ),
  );
}

function stockWarningHTML(stock) {
  if (stock <= 0) {
    return '<p class="stock-warning" role="status">Out of stock</p>';
  }
  if (stock <= 3) {
    return `<p class="stock-warning" role="status">Low stock: only ${stock} left</p>`;
  }
  return "";
}

/** One book card for the catalogue grid. Returns an HTML string. */
export function bookCardHTML(book) {
  const title = escapeHtml(book.title);
  const author = escapeHtml(book.author);
  const cover = escapeHtml(book.coverImage);
  return `
    <article class="card" data-id="${escapeHtml(book.id)}">
      <div
        class="cover"
        role="img"
        aria-label="Cover of ${title}"
        style="background-color:#${escapeHtml(book.cover)};background-image:url('${cover}')"
      ></div>
      <h3 class="card-title">${title}</h3>
      <p class="card-author">${author}</p>
      ${stockWarningHTML(book.stock)}
      <div class="card-foot">
        <span class="price">${formatPrice(book.price)}</span>
        <button class="btn view-btn" data-id="${escapeHtml(book.id)}">View Book</button>
      </div>
    </article>`;
}

/** Render the matching books or a message when there are no results. */
export function catalogueResultsHTML(books) {
  if (books.length === 0) {
    return '<p class="catalogue-empty" role="status">No books match your search.</p>';
  }
  return books.map(bookCardHTML).join("");
}

/** The single-book detail view. Returns an HTML string. */
export function bookDetailHTML(book) {
  const title = escapeHtml(book.title);
  const cover = escapeHtml(book.coverImage);
  return `
    <div class="detail">
      <div
        class="detail-cover"
        role="img"
        aria-label="Cover of ${title}"
        style="background-color:#${escapeHtml(book.cover)};background-image:url('${cover}')"
      ></div>
      <div class="detail-body">
        <p class="detail-genre">${escapeHtml(book.genre)}</p>
        <h2>${title}</h2>
        <p class="detail-author">by ${escapeHtml(book.author)}</p>
        <p class="price detail-price">${formatPrice(book.price)}</p>
        ${stockWarningHTML(book.stock)}
        <p class="detail-desc">${escapeHtml(book.description)}</p>
        <button class="btn ghost" id="back-btn">&larr; Back to catalogue</button>
      </div>
    </div>`;
}

// ---- DOM bootstrap: only runs in the browser, never during tests ----
let catalogue = [];

function renderCatalogue(books) {
  document.getElementById("book-grid").innerHTML = catalogueResultsHTML(books);
}

async function loadCatalogue() {
  const res = await fetch("/api/books");
  catalogue = await res.json();
  renderCatalogue(catalogue);
}

async function showDetail(id) {
  const view = document.getElementById("detail-view");
  const grid = document.getElementById("catalogue-view");
  const res = await fetch(`/api/books/${id}`);
  if (!res.ok) return;
  const book = await res.json();
  view.innerHTML = bookDetailHTML(book);
  grid.hidden = true;
  view.hidden = false;
}

function showCatalogue() {
  document.getElementById("detail-view").hidden = true;
  document.getElementById("catalogue-view").hidden = false;
}

/** Switch between the top-level "home" and "about" views. */
function showView(view) {
  const isHome = view === "home";
  document.getElementById("hero").hidden = !isHome;
  document.getElementById("catalogue-view").hidden = !isHome;
  document.getElementById("about-view").hidden = isHome;
  document.getElementById("detail-view").hidden = true;
  document.querySelectorAll(".nav a[data-view]").forEach((link) => {
    link.classList.toggle("active", link.dataset.view === view);
  });
}

function wireEvents() {
  document.getElementById("book-search").addEventListener("input", (event) => {
    renderCatalogue(filterBooks(catalogue, event.currentTarget.value));
  });
  document.querySelector(".nav").addEventListener("click", (e) => {
    const link = e.target.closest("a[data-view]");
    if (!link) return;
    e.preventDefault();
    showView(link.dataset.view);
  });
  document.getElementById("book-grid").addEventListener("click", (e) => {
    const btn = e.target.closest(".view-btn");
    if (btn) showDetail(btn.dataset.id);
  });
  document.getElementById("detail-view").addEventListener("click", (e) => {
    if (e.target.id === "back-btn") showCatalogue();
  });
}

if (typeof document !== "undefined" && document.getElementById("book-grid")) {
  wireEvents();
  loadCatalogue();
}
