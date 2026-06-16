const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#fffdfa"/>
  <path d="M14 39c2-11 5-17 9-17 3 0 5 4 6 12 2-8 5-12 9-12 5 0 8 6 10 17" fill="none" stroke="#ad7066" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M14 46h34" stroke="#252822" stroke-width="4" stroke-linecap="round"/>
</svg>`;

export function GET() {
  return new Response(favicon, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
}
