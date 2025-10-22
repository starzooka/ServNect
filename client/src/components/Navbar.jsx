import { useState, useEffect } from "react";
import ThemeToggleButton from "./ui/theme-toggle-button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Menu, X } from "lucide-react";
// src/components/Navbar.jsx
import { useAtom, useAtomValue } from "jotai";
import { userAtom, authLoadingAtom } from "../atoms";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

const navigationLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/about", label: "About" },
];

// ✅ This definition was missing from my previous snippet
const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [user, setUser] = useAtom(userAtom);
  const authLoading = useAtomValue(authLoadingAtom);

  // ✅ Get `client` from useMutation
  const [logout, { client }] = useMutation(LOGOUT_MUTATION, {
    onCompleted: async () => {
      setUser(null); // Clear the global state
      await client.resetStore(); // Reset the Apollo cache
      navigate("/signin"); // Navigate after reset
    },
    onError: async (err) => {
      console.error("Logout failed:", err);
      setUser(null);
      await client.resetStore(); // Also reset on error
      navigate("/signin");
    },
  });

  const handleLogout = () => logout();

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const handleMobileLinkClick = (to) => {
    setActiveLink(to);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b px-4 md:px-6 bg-background sticky top-0 z-50">
      
      {/* --- MODIFIED --- */}
      {/* On mobile (default), it's 'flex justify-between'.
        On desktop (md:), it becomes a 3-column grid to force true centering.
        'md:justify-normal' resets the 'justify-between' from flex.
      */}
      <div className="flex md:grid md:grid-cols-3 h-16 items-center justify-between md:justify-normal">
        
        {/* Logo (Stays in 1st column) */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-primary hover:text-primary/90 font-bold text-2xl"
            onClick={() => setActiveLink("/")}
          >
            ServNect
          </Link>
        </div>

        {/* --- MODIFIED --- */}
        {/* Desktop NavLinks (Forced to center of 2nd column) */}
        <NavigationMenu className="hidden md:block justify-self-center">
          <NavigationMenuList className="flex gap-6">
            {navigationLinks.map((link, index) => (
              <NavigationMenuItem key={index}>
                <NavigationMenuLink asChild>
                  <Link
                    to={link.to}
                    onClick={() => setActiveLink(link.to)}
                    className={`py-1.5 font-medium text-xl ${
                      activeLink === link.to
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* --- MODIFIED --- */}
        {/* Desktop Auth Buttons (Forced to end of 3rd column) */}
        <div className="hidden md:flex items-center gap-2 justify-self-end">
          <ThemeToggleButton />
          {authLoading ? (
            <div className="h-9 w-36 rounded-md bg-muted animate-pulse" />
          ) : user ? (
            <>
              <span className="text-sm font-medium text-muted-foreground">
                Welcome, {user.firstName}!
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Hamburger (This is 'md:hidden', so it's removed 
          from the grid layout on desktop and doesn't interfere) 
        */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggleButton />
          <button
            className="p-2 text-muted-foreground hover:text-primary focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (No changes here) */}
      <div
        className={`
          md:hidden flex flex-col gap-4 py-4 border-t
          absolute top-16 left-0 w-full bg-background z-40
          transition-all duration-300 ease-in-out
          ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          }
        `}
      >
        {navigationLinks.map((link, index) => (
          <Link
            key={index}
            to={link.to}
            onClick={() => handleMobileLinkClick(link.to)}
            className={`px-2 py-2 rounded-md font-medium ${
              activeLink === link.to
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-primary"
            }`}
          >
            {link.label}
          </Link>
        ))}

        <div className="border-t pt-4 mt-2 flex flex-col gap-2 px-2">
          {authLoading ? (
            <div className="h-9 w-full rounded-md bg-muted animate-pulse" />
          ) : user ? (
            <>
              <span className="text-sm font-medium text-muted-foreground px-2 py-2">
                Welcome, {user.firstName}!
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="w-all">
                <Link
                  to="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              </Button>
              <Button asChild size="sm" className="w-all">
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}