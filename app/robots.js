export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://dsc-panimalar-ads.in/sitemap.xml',
    host: 'https://dsc-panimalar-ads.in',
  };
}
