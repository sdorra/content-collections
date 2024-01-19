
import { FeaturesSection } from "./components/FeaturesSection";
import { Hero } from "./components/Hero";
import { SeeItInActionSection } from "./components/SeeItInActionSection";

export default function Home() {
  return (
    <main className="min-h-svh">
      <Hero />
      <FeaturesSection />
      <SeeItInActionSection />
    </main>
  );
}
