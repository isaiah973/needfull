import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import "./index.css";
import "@fontsource/inter";

import App from "./App";
import queryClient from "./services/queryClient";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
