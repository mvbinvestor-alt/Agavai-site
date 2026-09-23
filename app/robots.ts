import type { MetadataRoute } from 'next';

const SITE_URL = 'https://agavai.in';
const DISALLOW = ['/admin', '/admin/*', '/cart', '/checkout', '/order/*', '/api/*'];

// Known AI crawlers/answer-engine bots, explicitly allowed (same rules as
// everyone else) rather than left to the general wildcard — some hosts or
// CDNs default to blocking these, so being explicit avoids accidentally
// keeping Agavai out of AI-generated answers and citations.
const AI_BOTS = [
  'GPTBot', // OpenAI / ChatGPT
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot', // Anthropic
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot', // Perplexity
  'Google-Extended', // Google AI (Gemini, AI Overviews)
  'Applebot-Extended', // Apple Intelligence
  'Bytespider', // ByteDance / TikTok
  'CCBot', // Common Crawl (feeds many AI training sets)
  'Amazonbot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      ...AI_BOTS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
