// Minimal types for the storefront's pure render helpers, so the TypeScript
// tests can import them. The runtime module is plain JS (public/app.js).
export interface BookLike {
  id: string;
  title: string;
  author: string;
  price: number;
  genre: string;
  stock: number;
  description: string;
  cover: string;
}
export function escapeHtml(value: unknown): string;
export function formatPrice(price: number): string;
export function filterBooks(books: BookLike[], query: string): BookLike[];
export function bookCardHTML(book: BookLike): string;
export function catalogueResultsHTML(books: BookLike[]): string;
export function bookDetailHTML(book: BookLike): string;
