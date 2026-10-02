export default function manifest() {
  return {
    name: 'Data Science Club — Panimalar Engineering College',
    short_name: 'DS Club PEC',
    description:
      'The official Data Science Club of the Department of AI & Data Science at Panimalar Engineering College, Chennai. Hackathons, workshops, coding challenges & more.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#38bdf8',
    icons: [
      {
        src: '/ds logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any',
      },
    ],
  };
}
