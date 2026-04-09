export const dynamic = 'force-dynamic';

import Navbar from './components/Navbar';
import ScrollNarrative from './components/ScrollNarrative';
import WaitlistForm from './components/WaitlistForm';
import Footer from './components/Footer';

export default function WaitlistPage() {
  return (
    <main>
      <Navbar />
      <ScrollNarrative />
      <WaitlistForm />
      <Footer />
    </main>
  );
}
