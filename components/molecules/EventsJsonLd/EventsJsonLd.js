export default function EventsJsonLd() {
  const eventsData = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Event',
          name: 'DATAXSCAPE 2K26 — National Level Data Science Hackathon',
          description:
            'A 24-hour National Level Data Science Hackathon in collaboration with HEXAWARE, where participants collaborate to solve real-world problems using data-driven approaches, coding, and innovative solutions. Hosted by the Top Club in Panimalar.',
          startDate: '2026-01-21T09:00:00+05:30',
          endDate: '2026-01-22T17:00:00+05:30',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: {
            '@type': 'Place',
            name: 'Panimalar Engineering College',
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Bangalore Trunk Road, Varadharajapuram, Poonamallee',
              addressLocality: 'Chennai',
              addressRegion: 'Tamil Nadu',
              postalCode: '600123',
              addressCountry: 'IN',
            },
          },
          image: ['https://dsc-panimalar-ads.in/Events/DATAXSCAPE%202K26.jpeg'],
          organizer: {
            '@type': 'EducationalOrganization',
            name: 'Data Science Club, Panimalar Engineering College',
            url: 'https://dsc-panimalar-ads.in',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Event',
          name: 'Unlocking Creativity with Generative AI Workshop',
          description:
            'A workshop on leveraging generative AI for data science tasks — visualization, synthetic data generation, automated insights, and intelligent content creation.',
          startDate: '2024-08-20T10:00:00+05:30',
          endDate: '2024-08-20T16:00:00+05:30',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: {
            '@type': 'Place',
            name: 'Panimalar Engineering College Campus',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Chennai',
              addressRegion: 'Tamil Nadu',
              addressCountry: 'IN',
            },
          },
          image: ['https://dsc-panimalar-ads.in/Events/Unlocking%20Creativity%20with%20Generative%20AI.png'],
          organizer: {
            '@type': 'EducationalOrganization',
            name: 'Data Science Club, Panimalar Engineering College',
            url: 'https://dsc-panimalar-ads.in',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Event',
          name: 'NextGen AI Project Expo',
          description:
            'An exhibition of student-developed AI and data science projects — machine learning models, data analytics solutions, and real-world problem-solving.',
          startDate: '2024-08-20T09:00:00+05:30',
          endDate: '2024-08-20T17:00:00+05:30',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: {
            '@type': 'Place',
            name: 'Panimalar Engineering College Campus',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Chennai',
              addressRegion: 'Tamil Nadu',
              addressCountry: 'IN',
            },
          },
          image: ['https://dsc-panimalar-ads.in/Events/NextGen%20AI%20Project%20Expo.jpg'],
          organizer: {
            '@type': 'EducationalOrganization',
            name: 'Data Science Club, Panimalar Engineering College',
            url: 'https://dsc-panimalar-ads.in',
          },
        },
      },
      {
        '@type': 'ListItem',
        position: 4,
        item: {
          '@type': 'Event',
          name: 'Code Battle — Data Science Club Competition',
          description:
            'A blind coding competition testing programming logic, accuracy, and problem-solving skills under constraints.',
          startDate: '2025-07-22T10:00:00+05:30',
          endDate: '2025-07-22T16:00:00+05:30',
          eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
          eventStatus: 'https://schema.org/EventScheduled',
          location: {
            '@type': 'Place',
            name: 'AI&DS Lab, Panimalar Engineering College',
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Chennai',
              addressRegion: 'Tamil Nadu',
              addressCountry: 'IN',
            },
          },
          image: ['https://dsc-panimalar-ads.in/Events/Code%20Battle.jpg'],
          organizer: {
            '@type': 'EducationalOrganization',
            name: 'Data Science Club, Panimalar Engineering College',
            url: 'https://dsc-panimalar-ads.in',
          },
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsData) }}
    />
  );
}
