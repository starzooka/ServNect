// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider.jsx";
import AuthWrapper from "./components/AuthWrapper.jsx";

// Get backend URL from environment
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Create Apollo Client
const client = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:5050",
    fetchOptions: { // ✅ Wrap credentials in fetchOptions
      credentials: "include", // send cookies with requests
    },
  }),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <AuthWrapper>
          <ThemeProvider defaultTheme="dark" storageKey="my-app-theme">
            <App />
          </ThemeProvider>
        </AuthWrapper>
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>
);
