import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/**
 * ServicesPage.jsx
 * - Simple CRUD for services stored in localStorage (expert_services_demo)
 * - Create: opens a compact form overlay
 * - Delete: confirmation prompt
 * - Pause / Resume: toggle active state
 *
 * Fields: title (what service), location, minCharge (USD)
 */

const STORAGE_KEY = "expert_services_demo"

// small helper to generate ids
function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: "", location: "", minCharge: "" })
  const [error, setError] = useState("")

  // load on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        setServices(JSON.parse(raw))
      } catch {
        setServices([])
      }
    } else {
      // seed with a couple of common services
      const seed = [
        { id: uid(), title: "Electrician — General wiring & repairs", location: "Local area", minCharge: "30", active: true },
        { id: uid(), title: "Plumbing — Leaks & pipe repair", location: "Local area", minCharge: "40", active: true },
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
      setServices(seed)
    }
  }, [])

  // persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
  }, [services])

  function openForm() {
    setForm({ title: "", location: "", minCharge: "" })
    setError("")
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setError("")
  }

  function handleInput(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setError("")

    // simple validation
    if (!form.title.trim()) {
      setError("Please enter a service name/description.")
      return
    }
    if (!form.location.trim()) {
      setError("Please enter a location.")
      return
    }
    if (!form.minCharge.toString().trim() || Number.isNaN(Number(form.minCharge))) {
      setError("Please enter a valid minimum charge.")
      return
    }

    setSaving(true)
    // simulate a short network delay
    await new Promise((r) => setTimeout(r, 400))

    const newItem = {
      id: uid(),
      title: form.title.trim(),
      location: form.location.trim(),
      minCharge: String(Number(form.minCharge)),
      active: true,
      createdAt: new Date().toISOString(),
    }

    setServices((s) => [newItem, ...s])
    setSaving(false)
    setShowForm(false)
  }

  function toggleActive(id) {
    setServices((s) => s.map((item) => (item.id === id ? { ...item, active: !item.active } : item)))
  }

  function handleDelete(id) {
    const item = services.find((s) => s.id === id)
    if (!item) return
    const confirmed = window.confirm(`Delete service "${item.title}"? This cannot be undone.`)
    if (!confirmed) return
    setServices((s) => s.filter((x) => x.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Your Services</h2>
          <p className="text-sm text-muted-foreground">Create and manage services you provide (electrician, plumbing, appliance repair, etc.).</p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={openForm}>Create New Service</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.length === 0 ? (
          <Card>
            <CardContent>
              <div className="text-sm text-muted-foreground">No services yet — create one to get started.</div>
            </CardContent>
          </Card>
        ) : (
          services.map((svc) => (
            <Card key={svc.id}>
              <CardContent>
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="font-semibold">{svc.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">{svc.location}</div>
                    <div className="text-sm text-muted-foreground mt-2">Minimum charge: ${svc.minCharge}</div>
                    <div className="text-xs mt-2">{new Date(svc.createdAt).toLocaleString()}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant={svc.active ? "secondary" : "outline"} onClick={() => toggleActive(svc.id)}>
                        {svc.active ? "Pause" : "Resume"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(svc.id)}>Delete</Button>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded ${svc.active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {svc.active ? "Active" : "Paused"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Inline small form overlay */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeForm} />

          <div className="relative w-full max-w-md mx-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Service</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="grid gap-3">
                  <div>
                    <Label htmlFor="title">Service (what you provide)</Label>
                    <Input id="title" name="title" value={form.title} onChange={handleInput} placeholder="e.g. Electrician — wiring & repairs" />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" value={form.location} onChange={handleInput} placeholder="City or service area" />
                  </div>

                  <div>
                    <Label htmlFor="minCharge">Minimum charge (USD)</Label>
                    <Input id="minCharge" name="minCharge" value={form.minCharge} onChange={handleInput} placeholder="e.g. 30" inputMode="numeric" />
                  </div>

                  {error && <div className="text-sm text-destructive">{error}</div>}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button variant="ghost" onClick={closeForm} type="button">Cancel</Button>
                    <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Create"}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
