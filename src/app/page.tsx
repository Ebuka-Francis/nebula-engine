import HeroSection from '@/components/hero/Hero';
import WhySection from '@/components/why-section/WhySection';
import CTASection from '@/components/cta-section/CTASection';
import Footer from '@/components/footer/Footer';

export default function Home() {
   return (
      <>
         <HeroSection />
         <WhySection />
         <CTASection />
         <Footer />
      </>
   );
}
