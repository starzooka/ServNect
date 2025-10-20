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
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";

const navigationLinks = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/about", label: "About" },
];

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

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      setUser(null); // Clear the global state
      navigate("/signin"); // Navigate without reloading
    },
    onError: (err) => {
      console.error("Logout failed:", err);
      setUser(null);
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
      <div className="flex h-16 items-center justify-between">
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

        {/* Desktop NavLinks */}
        <NavigationMenu className="hidden md:block">
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

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-2">
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

        {/* Mobile Hamburger */}
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

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col gap-4 py-4 border-t">
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
                <Button asChild variant="ghost" size="sm" className="w-full">
                  <Link
                    to="/signin"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </Button>
                <Button asChild size="sm" className="w-full">
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
      )}
    </header>
  );
}
