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


const navigationLinks = [
  { to: "/", label: "Home" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
]

export default function Navbar() {
  const location = useLocation()
  const [activeLink, setActiveLink] = useState(location.pathname)

  return (
    <header className="border-b px-4 md:px-6">
      <div className="flex h-16 items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Logo */}
          <Link
            to="/"
            className="text-primary hover:text-primary/90 font-bold text-lg"
            onClick={() => setActiveLink("/")}
          >
            Servnect
          </Link>
        </div>

        {/* Center NavLinks */}
        <NavigationMenu>
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

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="text-sm">
            <Link to="/signin">Sign In</Link>
          </Button>
          <Button asChild size="sm" className="text-sm">
            <Link to="/get-started">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
