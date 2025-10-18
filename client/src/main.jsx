// src/main.jsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
// NEW: Import HttpLink
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client" 
import { ApolloProvider } from "@apollo/client/react";
import App from "./App.jsx"
import "./index.css"
import { ThemeProvider } from "./components/ThemeProvider.jsx"

// NEW: Create an HttpLink instance
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/', 
});

// NEW: Update the client to use the 'link' property
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ApolloProvider client={client}>
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="my-app-theme">
      <App />
    </ThemeProvider>
    </BrowserRouter>
    </ApolloProvider>
  </StrictMode>
)