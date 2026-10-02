export const metadata = {
  title: 'Club Leaderboard',
  description:
    'Live rankings of Data Science Club members by competition points, hackathon victories, and quiz scores. See who leads the pack in real time.',
  openGraph: {
    title: 'Club Leaderboard | Data Science Club – PEC',
    description:
      'Live rankings of DS Club members — competition points, hackathon wins & quiz scores.',
    url: 'https://dsc-panimalar-ads.in/leaderboard',
    type: 'website',
  },
  twitter: {
    title: 'Club Leaderboard | Data Science Club – PEC',
    description:
      'Live rankings of DS Club members — competition points, hackathon wins & quiz scores.',
  },
  alternates: {
    canonical: 'https://dsc-panimalar-ads.in/leaderboard',
  },
};

import BreadcrumbJsonLd from '../../components/molecules/BreadcrumbJsonLd/BreadcrumbJsonLd';

export default function LeaderboardLayout({ children }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://dsc-panimalar-ads.in' },
          { name: 'Club Leaderboard', item: 'https://dsc-panimalar-ads.in/leaderboard' },
        ]}
      />
      {children}
    </>
  );
}
