import { Footer } from "@/components/Footer";
import { FrameworkSection } from "../components/FrameworkSection";
import { Hero } from "../components/Hero";
import { HmrSection } from "../components/HmrSection";
import { TransformationSection } from "../components/TransformationSection";
import { TypeSafeApiSection } from "../components/TypeSafeApiSection";
import { ValidationSection } from "../components/ValidationSection";

export default function Home() {
  return (
    <>
      <main className="text-muted-foreground mt-10 flex-grow">
        <Hero />
        <HmrSection />
        <TypeSafeApiSection />
        <ValidationSection />
        <TransformationSection />
        <FrameworkSection />
      </main>
      <Footer />
    </>
  );
}
