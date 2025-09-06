// src/config/routes.js
import Home from "@/pages/Home"
import Categories from "@/pages/Categories"
import About from "@/pages/About" // create this page if not already made

export const appRoutes = [
  { path: "/", label: "Home", element: <Home /> },
  { path: "/categories", label: "Categories", element: <Categories /> },
  { path: "/about", label: "About", element: <About /> },
]
