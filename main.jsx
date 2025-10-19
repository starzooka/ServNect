// src/main.jsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client"
import { ApolloProvider } from "@apollo/client/react";
import App from "./App.jsx"
import "./index.css"
import { ThemeProvider } from "./components/ThemeProvider.jsx"
import AuthWrapper from "./components/AuthWrapper.jsx"; // Make sure this is here

// Create an HttpLink instance
const httpLink = new HttpLink({
  uri: 'http://localhost:4000/',
  //
  // THIS IS THE FIX:
  // Tell Apollo to send cookies with every request
  //
  credentials: 'include', 
});

// Update the client to use the 'link' property
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
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
)
