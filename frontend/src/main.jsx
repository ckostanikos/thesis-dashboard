import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react";

import App from "./App";
import Login from "./pages/Login";
import MyCourses from "./pages/MyCourses";
import Library from "./pages/Library";
import Company from "./pages/Company";
import Team from "./pages/Team";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import UserDetail from "./pages/UserDetail";
import Users from "./pages/Users";

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
      { path: "my-courses", element: <MyCourses /> },
      { path: "library", element: <Library /> },
      { path: "company", element: <Company /> },
      { path: "team/:id", element: <Team /> },
      {
        path: "users",
        element: (
          <AdminRoute>
            <Users />
          </AdminRoute>
        ),
      },
      {
        path: "users/:id",
        element: (
          <AdminRoute>
            <UserDetail />
          </AdminRoute>
        ),
      },
      { index: true, element: <MyCourses /> },
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
