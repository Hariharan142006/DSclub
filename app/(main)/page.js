import Hero from '@/components/pages/Hero/Hero';
import About from '@/components/pages/About/About';
import WhyJoinUs from '@/components/pages/WhyJoinUs/WhyJoinUs';
import Domains from '@/components/pages/Domains/Domains';
import Events from '@/components/pages/Events/Events';
import Workshops from '@/components/pages/Workshops/Workshops';
import Gallery from '@/components/pages/Gallery/Gallery';
import Team from '@/components/pages/Team/Team';
import Achievements from '@/components/pages/Achievements/Achievements';
import FAQ from '@/components/pages/FAQ/FAQ';
import Contact from '@/components/pages/Contact/Contact';

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <WhyJoinUs />
      <Domains />
      <Events />
      <Workshops />
      <Gallery />
      <Team />
      <Achievements />
      <FAQ />
      <Contact />
    </>
  );
}
