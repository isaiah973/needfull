import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import CreateItem from "./pages/CreateItem";
import EditItem from "./pages/EditItem";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";

import ItemDetails from "./pages/items/ItemDetails";

import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />

      <Route path="/items/:id" element={<ItemDetails />} />
      <Route path="/users/:id" element={<PublicProfile />} />

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
      <Route
        path="/create-item"
        element={
          <ProtectedRoute>
            <CreateItem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/items/:id/edit"
        element={
          <ProtectedRoute>
            <EditItem />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
