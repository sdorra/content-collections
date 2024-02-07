import { Hero } from "./components/Hero";
import { HmrSection } from "./components/HmrSection";
import { TypeSafeApiSection } from "./components/TypeSafeApiSection";
import { ValidationSection } from "./components/ValidationSection";
import { TransformationSection } from "./components/TransformationSection";
import { FrameworkSection } from "./components/FrameworkSection";

export default function Home() {
  return (
    <>
      <Hero />
      <HmrSection />
      <TypeSafeApiSection />
      <ValidationSection />
      <TransformationSection />
      <FrameworkSection />
    </>
  );
}
