import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateItem from "./pages/CreateItem";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";

import ItemDetails from "./pages/items/ItemDetails";

import GuestRoute from "./components/GuestRoute";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />

      <Route path="/items/:id" element={<ItemDetails />} />

      {/* Authentication */}

      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      <Route
        path="/verify-email"
        element={
          <GuestRoute>
            <VerifyEmail />
          </GuestRoute>
        }
      />
      <Route path="/create-item" element={<CreateItem />} />
    </Routes>
  );
}

export default App;
