import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";

import App from "./App";
import Login from "./pages/Login";
import Me from "./pages/Me";
import Org from "./pages/Org";
import Team from "./pages/Team";
import ProtectedRoute from "./routes/ProtectedRoute";

const system = createSystem(defaultConfig);

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      { path: "me", element: <Me /> },
      { path: "org", element: <Org /> },
      { path: "team/:id", element: <Team /> },
      { index: true, element: <Me /> },
    ],
  },
]);

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider value={system}>
      <QueryClientProvider client={qc}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>
);
