export default function FaqJsonLd() {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Who can join the Data Science Club?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The physical club is primarily open to all students of Panimalar Engineering College, regardless of their department or year. We believe data science is interdisciplinary!',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need prior coding experience to join?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Not at all. We have beginner-friendly sessions starting from the absolute basics of Python and logic building.',
        },
      },
      {
        '@type': 'Question',
        name: 'How often are events conducted?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We conduct hands-on learning sessions every week, and major events like hackathons or guest lectures once a month.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is the Data Science Club open to all departments?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Whether you are from CSE, ECE, Mechanical, or IT, data is everywhere. We highly encourage cross-disciplinary learning.',
        },
      },
      {
        '@type': 'Question',
        name: 'How can I become a core member?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Core member selections are held at the beginning of the academic year based on your past contributions, project showcase, and a short interview.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}
