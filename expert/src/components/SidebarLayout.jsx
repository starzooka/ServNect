import React, { useState } from "react"
import { Link, NavLink, Outlet } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Icons } from "@/components/icons"
import { useAtomValue } from "jotai" // ✅ Import Jotai
import { expertAtom } from "../atoms.js" // ✅ Import Atom

export default function SidebarLayout() {
  const [isOpen, setIsOpen] = useState(false)
  const expert = useAtomValue(expertAtom) // ✅ Get dynamic data

  const navItems = [
    { to: "", label: "Dashboard", icon: Icons.grid },
    { to: "bookings", label: "Bookings", icon: Icons.calendar },
    { to: "messages", label: "Messages", icon: Icons.chat },
    { to: "account", label: "Account", icon: Icons.user },
  ]

  // Helper to get initials (e.g., "Alex Johnson" -> "AJ")
  const getInitials = (first, last) => {
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase();
  }

  // Fallback if expert data is missing for some reason
  if (!expert) return null; 

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar: full-bleed left, fixed width, won't shrink */}
      <aside className="bg-card border-r border-border w-72 p-4 hidden lg:flex flex-col flex-shrink-0 h-screen overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="w-12 h-12">
            {/* ✅ Dynamic Image (if you have one) */}
            <AvatarImage src={expert.profileImage} alt={expert.firstName} />
            {/* ✅ Dynamic Initials */}
            <AvatarFallback>{getInitials(expert.firstName, expert.lastName)}</AvatarFallback>
          </Avatar>
          <div>
            {/* ✅ Dynamic Name */}
            <div className="font-semibold">{expert.firstName} {expert.lastName}</div>
            {/* ✅ Dynamic Specialty/Title */}
            <div className="text-xs text-muted-foreground capitalize">
              {expert.service || "Expert Consultant"}
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ""}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent/50 transition-all text-sm ${
                    isActive ? "bg-accent/20 font-medium" : ""
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto">
          <Button asChild size="sm" className="w-full">
            <Link to="/explore">Visit marketplace</Link>
          </Button>
        </div>
      </aside>

      {/* Page content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-md"
              onClick={() => setIsOpen((s) => !s)}
              aria-label="toggle menu"
            >
              <Icons.menu className="w-5 h-5" />
            </button>
            <div className="text-lg font-bold">Expert Dashboard</div>
          </div>
          <div className="flex items-center gap-3">
             {/* ✅ Added Avatar to Mobile Header too */}
             <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {getInitials(expert.firstName, expert.lastName)}
                </AvatarFallback>
             </Avatar>
          </div>
        </div>

        {/* Mobile collapsible nav */}
        {isOpen && (
          <div className="lg:hidden bg-card p-3 border-b border-border">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2 rounded-md hover:bg-accent/50"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}