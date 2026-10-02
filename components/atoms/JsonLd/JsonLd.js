export default function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Data Science Club',
    alternateName: [
      'DSC PEC',
      'Top Club in Panimalar',
      'Top Club in Panimalar Engineering College',
      'Best Club in Panimalar Engineering College',
      'Best Club in Panimalar',
    ],
    slogan: 'The Top Club in Panimalar and Best Club in Panimalar Engineering College',
    url: 'https://dsc-panimalar-ads.in',
    logo: 'https://dsc-panimalar-ads.in/ds logo.jpg',
    description:
      'The Top Club in Panimalar and Best Club in Panimalar Engineering College — The official Data Science Club of the Department of AI & Data Science at Panimalar Engineering College, Chennai. Turning curiosity into data-driven innovation through hackathons, workshops, and coding challenges.',
    foundingDate: '2021-03-18',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Panimalar Engineering College',
      addressLocality: 'Chennai',
      postalCode: '600123',
      addressRegion: 'Tamil Nadu',
      addressCountry: 'IN',
    },
    parentOrganization: {
      '@type': 'CollegeOrUniversity',
      name: 'Panimalar Engineering College',
      url: 'https://www.panimalar.ac.in',
    },
    sameAs: [
      'https://www.linkedin.com/company/datascienceclubpec',
      'https://www.instagram.com/datascienceclub_pec',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'pecdatascienceclub@gmail.com',
      contactType: 'general',
    },
    keywords: [
      'data science',
      'artificial intelligence',
      'machine learning',
      'hackathon',
      'coding challenges',
      'Panimalar Engineering College',
      'top club in panimalar',
      'top club in panimalar engineering college',
      'best club in panimalar engineering college',
      'best club in panimalar',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
