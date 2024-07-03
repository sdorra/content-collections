import { Hero } from "./components/Hero";
import { HmrSection } from "./components/HmrSection";
import { TypeSafeApiSection } from "./components/TypeSafeApiSection";
import { ValidationSection } from "./components/ValidationSection";
import { TransformationSection } from "./components/TransformationSection";
import { FrameworkSection } from "./components/FrameworkSection";
import { Footer } from "@/components/Footer";
import { Layout } from "fumadocs-ui/layout";
import { baseOptions } from "@/app/layout.config";

export default function Home() {
  return (
    <Layout {...baseOptions}>
      <main className="mt-10 flex-grow text-muted-foreground">
        <Hero />
        <HmrSection />
        <TypeSafeApiSection />
        <ValidationSection />
        <TransformationSection />
        <FrameworkSection />
      </main>
      <Footer />
    </Layout>
  );
}
