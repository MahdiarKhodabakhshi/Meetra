export const dynamic = 'force-dynamic';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProblemSection from './components/ProblemSection';
import HowItWorks from './components/HowItWorks';
import WhoIsItFor from './components/WhoIsItFor';
import WhyMeetraSection from './components/WhyMeetra';
import WaitlistForm from './components/WaitlistForm';
import Footer from './components/Footer';

export default function WaitlistPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <WhoIsItFor />
      <WhyMeetraSection />
      <WaitlistForm />
      <Footer />
    </main>
  );
}
