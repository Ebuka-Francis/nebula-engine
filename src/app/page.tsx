import HeroSection from '@/components/hero/Hero';
import CTASection from '@/components/cta-section/CTASection';
import Footer from '@/components/footer/Footer';
import LiveTournaments from '@/components/tournaments/LiveTournaments';
import TrendingPredictions from '@/components/trending-prediction/';

export default function Home() {
   return (
      <>
         <HeroSection />
         <LiveTournaments />
         <TrendingPredictions />
         {/* <WhySection /> */}
         <CTASection />
         <Footer />
      </>
   );
}
