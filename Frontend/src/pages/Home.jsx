import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ItemsSection from "../components/items/ItemSection";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash !== "#items") return;

    const frame = window.requestAnimationFrame(() => {
      document.getElementById("items")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [location.hash, location.key, location.search]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <Hero />
      <ItemsSection />
    </div>
  );
};

export default Home;
