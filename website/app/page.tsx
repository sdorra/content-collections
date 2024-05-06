import { Hero } from "./components/Hero";
import { HmrSection } from "./components/HmrSection";
import { TypeSafeApiSection } from "./components/TypeSafeApiSection";
import { ValidationSection } from "./components/ValidationSection";
import { TransformationSection } from "./components/TransformationSection";
import { FrameworkSection } from "./components/FrameworkSection";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Main } from "@/components/Main";

export default function Home() {
  return (
    <>
      <Header />
      <Main>
        <Hero />
        <HmrSection />
        <TypeSafeApiSection />
        <ValidationSection />
        <TransformationSection />
        <FrameworkSection />
      </Main>
      <Footer />
    </>
  );
}
