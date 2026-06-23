import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
// import ProductDetails from "./pages/ProductDetails";
// import Checkout from "./pages/Checkout";
// import PaymentVerify from "./pages/PaymentVerify";
// import MyOrders from "./pages/MyOrders";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/verify" element={<PaymentVerify />} />
        <Route path="/my-orders" element={<MyOrders />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
