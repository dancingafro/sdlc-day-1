import { describe, it, expect } from "vitest";
import {
  escapeHtml,
  formatPrice,
  filterBooks,
  bookCardHTML,
  catalogueResultsHTML,
  bookDetailHTML,
} from "../public/app.js";

const sample = {
  id: "quiet-orbit",
  title: "Quiet Orbit",
  author: "Samuel Reyes",
  price: 15.99,
  genre: "Sci-Fi",
  stock: 8,
  description: "A maintenance crew learns the silence is listening back.",
  cover: "2A2456",
  coverImage: "covers/quiet-orbit.jpg",
};

describe("formatPrice", () => {
  it("formats to two decimals with a dollar sign", () => {
    expect(formatPrice(15.9)).toBe("$15.90");
  });
});

describe("filterBooks", () => {
  it("matches title, author, genre, and description without case sensitivity", () => {
    for (const query of ["quiet", "SAMUEL", "sci-fi", "LISTENING"]) {
      expect(filterBooks([sample], query)).toEqual([sample]);
    }
  });

  it("trims whitespace and returns all books for a blank query", () => {
    expect(filterBooks([sample], "  QUIET  ")).toEqual([sample]);
    expect(filterBooks([sample], "   ")).toEqual([sample]);
  });

  it("returns no books when the query does not match", () => {
    expect(filterBooks([sample], "unmatched title")).toEqual([]);
  });
});

describe("catalogueResultsHTML", () => {
  it("renders an accessible empty state when there are no matching books", () => {
    expect(catalogueResultsHTML([])).toContain(
      '<p class="catalogue-empty" role="status">No books match your search.</p>',
    );
  });
});

describe("escapeHtml", () => {
  it("escapes HTML-significant characters", () => {
    expect(escapeHtml('<script>"x"')).toBe("&lt;script&gt;&quot;x&quot;");
  });
});

describe("bookCardHTML", () => {
  it("includes the title, author and formatted price", () => {
    const html = bookCardHTML(sample);
    expect(html).toContain("Quiet Orbit");
    expect(html).toContain("Samuel Reyes");
    expect(html).toContain("$15.99");
  });

  it("escapes a dangerous title instead of emitting raw markup", () => {
    const html = bookCardHTML({ ...sample, title: "<img src=x onerror=alert(1)>" });
    // The angle brackets must be escaped, so no real <img ...> tag appears.
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;img");
  });
});

describe("stock warnings", () => {
  it("warns in the card and detail view when stock is low", () => {
    const lowStockBook = { ...sample, stock: 3 };

    expect(bookCardHTML(lowStockBook)).toContain("Low stock: only 3 left");
    expect(bookDetailHTML(lowStockBook)).toContain("Low stock: only 3 left");
  });

  it("does not show a warning when stock is above the low-stock threshold", () => {
    const html = bookCardHTML({ ...sample, stock: 4 });

    expect(html).not.toContain("stock-warning");
  });

  it("marks a book with no stock as out of stock", () => {
    const html = bookDetailHTML({ ...sample, stock: 0 });

    expect(html).toContain("Out of stock");
  });
});
