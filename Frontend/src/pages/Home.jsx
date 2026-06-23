import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";

const Home = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
    </div>
  );
};

export default Home;

// import { useEffect, useState } from "react";
// import API from "../api/axios";

// const Home = () => {
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const res = await API.get("/products/get-products");

//         setProducts(res.data.allProducts || []);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//       }
//     };

//     fetchProducts();
//   }, []);

//   return (
//     <div>
//       <h1 className="text-3xl font-bold text-red-500">
//         Tailwind is working 🚀
//       </h1>
//       <h1>Products</h1>

//       {products.length === 0 ? (
//         <p>No products found</p>
//       ) : (
//         products.map((p) => (
//           <div key={p._id}>
//             <h3>{p.title}</h3>
//             <img src={p.image} width="150" />
//             <p>₦{p.price}</p>
//           </div>
//         ))
//       )}
//     </div>
//   );
// };

// export default Home;
