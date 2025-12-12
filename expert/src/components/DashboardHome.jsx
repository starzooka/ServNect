import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function DashboardHome() {
  const [contacts, setContacts] = useState([])
  const [stats, setStats] = useState({ earningsMonth: 1240, views7d: 342, rating: 4.8 })

  useEffect(() => {
    const saved = localStorage.getItem("expert_contacts_demo")
    if (saved) setContacts(JSON.parse(saved))
    else {
      const seed = [
        { id: 1, name: "John Doe", message: "Interested in a 1-hour strategy session.", date: "2025-12-10" },
        { id: 2, name: "Priya Sharma", message: "Can you review my pitch deck next week?", date: "2025-12-09" },
      ]
      localStorage.setItem("expert_contacts_demo", JSON.stringify(seed))
      setContacts(seed)
    }
  }, [])

  function markHandled(id) {
    const updated = contacts.filter((x) => x.id !== id)
    setContacts(updated)
    localStorage.setItem("expert_contacts_demo", JSON.stringify(updated))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Earnings (this month)</div>
          <div className="text-2xl font-semibold mt-1">${stats.earningsMonth}</div>
          <div className="text-sm text-muted-foreground mt-2">New: 3 • Booked: 5</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Profile Views (7d)</div>
          <div className="text-2xl font-semibold mt-1">{stats.views7d}</div>
          <div className="text-sm text-muted-foreground mt-2">Conversion: 2.3%</div>
        </Card>

        <Card className="p-4">
          <div className="text-xs text-muted-foreground">Rating</div>
          <div className="text-2xl font-semibold mt-1">{stats.rating} / 5</div>
          <div className="text-sm text-muted-foreground mt-2">Based on 48 reviews</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Incoming Contact Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <div className="text-sm text-muted-foreground">No new requests</div>
            ) : (
              <ul className="space-y-3">
                {contacts.map((c) => (
                  <li key={c.id} className="p-3 border rounded flex justify-between items-start gap-3">
                    <div>
                      <div className="font-medium">{c.name} <span className="text-xs text-muted-foreground">• {c.date}</span></div>
                      <div className="text-sm text-muted-foreground mt-1">{c.message}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={() => alert(`Open conversation with ${c.name}`)}>Reply</Button>
                      <Button variant="outline" size="sm" onClick={() => markHandled(c.id)}>Mark handled</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link to="/expert/services">Create new service</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/expert/bookings">Manage bookings</Link>
              </Button>
              <Button variant="ghost" onClick={() => alert("Exporting reports (demo)")}>Export report</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
