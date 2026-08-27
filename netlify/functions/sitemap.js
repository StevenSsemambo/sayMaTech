// Live-generated sitemap.xml — always reflects currently published blog posts,
// without needing a redeploy every time a post goes live.

import { createClient } from '@supabase/supabase-js'

const SITE_URL = 'https://saymytech-developers.netlify.app'

function getSupabaseCreds() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return { url, key }
}

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/products', priority: '0.9', changefreq: 'weekly' },
  { path: '/services', priority: '0.8', changefreq: 'monthly' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/faq', priority: '0.5', changefreq: 'monthly' },
  { path: '/contact', priority: '0.6', changefreq: 'monthly' },
]

export const handler = async () => {
  let blogUrls = []

  try {
    const creds = getSupabaseCreds()
    if (creds) {
      const supabase = createClient(creds.url, creds.key)
      const { data } = await supabase
        .from('blog_posts')
        .select('slug, published_at, updated_at')
        .eq('status', 'published')

      blogUrls = (data || []).map((p) => ({
        path: `/blog/${p.slug}`,
        lastmod: (p.updated_at || p.published_at || new Date().toISOString()).slice(0, 10),
        priority: '0.7',
        changefreq: 'monthly',
      }))
    }
  } catch (err) {
    console.error('Sitemap: failed to fetch blog posts', err)
  }

  const staticEntries = STATIC_PAGES.map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join('\n')

  const blogEntries = blogUrls.map(
    (p) => `  <url>
    <loc>${SITE_URL}${p.path}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${blogEntries}
</urlset>`

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    body: xml,
  }
}
