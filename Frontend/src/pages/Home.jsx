import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ItemsSection from "../components/items/ItemSection";

const Home = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      <Navbar />
      <Hero />
      <ItemsSection />
    </div>
  );
};

export default Home;
