import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/hero/Hero';
import ProblemSection from '@/components/problem/ProblemSection';
import SolutionsSection from '@/components/solutions/SolutionsSection';
import ProcessSection from '@/components/process/ProcessSection';
import AiNativeSection from '@/components/ai-native/AiNativeSection';
import CoreSection from '@/components/core/CoreSection';
import WorkSection from '@/components/work/WorkSection';
import CaseStudySection from '@/components/case-study/CaseStudySection';
import TechnologySection from '@/components/technology/TechnologySection';
import ContactSection from '@/components/contact/ContactSection';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <SolutionsSection />
        <ProcessSection />
        <AiNativeSection />
        <CoreSection />
        <WorkSection />
        <CaseStudySection />
        <TechnologySection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
