const HOST_URL = process.env.NEXT_FRONTEND_BASE_URL;
console.log(HOST_URL, "HOST_URL");

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blogs/'],
        disallow: ['/api/', '/admin/', '/private/', '/tmp/', '/cdn-cgi/'],
      },
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'PerplexityBot'],
        allow: '/',
      },
      {
        userAgent: ['HTTrack', 'WebCopier', 'Offline Explorer', 'EmailCollector', 'EmailSiphon', 'EmailWolf'],
        disallow: '/',
      }
    ],
    sitemap: `${HOST_URL}/sitemap.xml`,
    host: HOST_URL,
  };
}
