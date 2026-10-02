export const metadata = {
  title: 'Challenges Arena',
  description:
    'Solve coding challenges, attempt quizzes, and earn XP points on the Data Science Club challenge platform. Compete with fellow members and climb the leaderboard.',
  openGraph: {
    title: 'Challenges Arena | Data Science Club – PEC',
    description:
      'Solve coding challenges, attempt quizzes, and earn XP on the Data Science Club challenge platform.',
    url: 'https://dsc-panimalar-ads.in/challenges',
    type: 'website',
  },
  twitter: {
    title: 'Challenges Arena | Data Science Club – PEC',
    description:
      'Solve coding challenges, attempt quizzes, and earn XP on the Data Science Club challenge platform.',
  },
  alternates: {
    canonical: 'https://dsc-panimalar-ads.in/challenges',
  },
};

import BreadcrumbJsonLd from '../../components/molecules/BreadcrumbJsonLd/BreadcrumbJsonLd';

export default function ChallengesLayout({ children }) {
  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', item: 'https://dsc-panimalar-ads.in' },
          { name: 'Challenges Arena', item: 'https://dsc-panimalar-ads.in/challenges' },
        ]}
      />
      {children}
    </>
  );
}
