// src/components/Navbar.jsx
import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"
import { Menu, X } from "lucide-react"

const navigationLinks = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
]

export default function Navbar() {
  const location = useLocation()
  const [activeLink, setActiveLink] = useState(location.pathname)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between">
        {/* Left side (Logo) */}
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-primary hover:text-primary/90 font-bold text-lg"
            onClick={() => setActiveLink("/")}
          >
            Servnect
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
                    className={`py-1.5 font-medium ${
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

        {/* Right side (Desktop buttons) */}
        <div className="hidden md:flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-sm">
            <Link to="/signin">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="text-sm">
            <Link to="/get-started">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-primary focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col gap-4 py-4 border-t">
          {navigationLinks.map((link, index) => (
            <Link
              key={index}
              to={link.to}
              onClick={() => {
                setActiveLink(link.to)
                setIsMobileMenuOpen(false)
              }}
              className={`px-2 py-2 rounded-md font-medium ${
                activeLink === link.to
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex flex-col gap-2 px-2">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link to="/signin">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="w-full">
              <Link to="/get-started">Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
