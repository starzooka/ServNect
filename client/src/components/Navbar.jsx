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
import { useAtom, useAtomValue } from "jotai";
import { userAtom, authLoadingAtom } from "../atoms";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const navigationLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/about", label: "About" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [user, setUser] = useAtom(userAtom);
  const authLoading = useAtomValue(authLoadingAtom);

  const handleLogout = async () => {
    // 1. Clear Local Storage
    localStorage.removeItem("user_token");

    // 2. Clear Global State
    setUser(null);

    // 3. Optional: Notify Backend (Stateless, but good practice)
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        // credentials: "include", // ❌ REMOVED
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      navigate("/signin");
    }
  };

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const handleMobileLinkClick = (to) => {
    setActiveLink(to);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b px-4 md:px-6 bg-background sticky top-0 z-50">
      <div className="flex md:grid md:grid-cols-3 h-16 items-center justify-between md:justify-normal">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-primary hover:text-primary/90 font-bold text-2xl"
            onClick={() => setActiveLink("/")}
          >
            ServNect
          </Link>
        </div>

        {/* Desktop nav links */}
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

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-2 justify-self-end">
          <ThemeToggleButton />
          {authLoading ? (
            <div className="h-9 w-36 rounded-md bg-muted animate-pulse" />
          ) : user ? (
            <>
              <span className="text-sm font-medium text-muted-foreground">
                Welcome, {user.firstName}!
              </span>

              <Button asChild variant="ghost" size="sm">
                <Link to="/profile">Profile</Link>
              </Button>

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

        {/* Mobile hamburger */}
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

      {/* Mobile menu */}
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

        {/* CHANGED: Profile button instead of Become Expert */}
        {user && (
          <Button asChild variant="outline" size="sm">
            <Link
              to="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Profile
            </Link>
          </Button>
        )}

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
              {user?.role === "admin" && (
                <Button asChild variant="outline">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}