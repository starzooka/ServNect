import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

// ExpertDashboard.jsx
// A single-file dashboard page for service providers built with Vite + React + Tailwind + shadcn UI.
// - Local mock persistence uses localStorage so you can test profile updates without a backend.
// - Replace the mock save/load functions with real API calls when integrating.

export default function ExpertDashboard() {
  // Mock profile state
  const [profile, setProfile] = useState({
    name: "",
    title: "",
    bio: "",
    hourlyRate: "",
    location: "",
    availability: true,
    avatarUrl: "",
  })

  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    // load from localStorage for demo
    const saved = localStorage.getItem("expert_profile_demo")
    if (saved) {
      setProfile(JSON.parse(saved))
    } else {
      // seed with example data
      setProfile((p) => ({
        ...p,
        name: "Alex Johnson",
        title: "Business Consultant",
        bio: "Helping startups with go-to-market and product strategy.",
        hourlyRate: "50",
        location: "Remote",
        availability: true,
        avatarUrl: "",
      }))
    }
  }, [])

  useEffect(() => {
    if (!avatarFile) return
    const url = URL.createObjectURL(avatarFile)
    setProfile((p) => ({ ...p, avatarUrl: url }))

    return () => URL.revokeObjectURL(url)
  }, [avatarFile])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setProfile((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }))
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (file) setAvatarFile(file)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage("")

    try {
      // simulate network latency
      await new Promise((r) => setTimeout(r, 700))

      // In a real app, upload avatarFile to storage and save profile to backend.
      // Example:
      // const formData = new FormData();
      // formData.append('avatar', avatarFile)
      // formData.append('profile', JSON.stringify(profile))
      // await fetch('/api/expert/profile', { method: 'POST', body: formData })

      // local persistence for demo
      localStorage.setItem("expert_profile_demo", JSON.stringify(profile))

      setMessage("Profile saved successfully")
    } catch (err) {
      console.error(err)
      setMessage("Failed to save profile")
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(""), 3000)
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] p-6 sm:p-8 lg:p-12 bg-background">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            {profile.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            ) : (
              <AvatarFallback>{profile.name?.split(" ")[0]?.[0]}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold leading-tight">{profile.name || "Your Name"}</h1>
            <p className="text-sm text-muted-foreground">{profile.title || "Your Title"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-sm text-muted-foreground">Availability</span>
            <div className="flex items-center gap-2">
              <Switch checked={profile.availability} onCheckedChange={(val) => setProfile((p) => ({ ...p, availability: val }))} />
              <span className="text-sm">{profile.availability ? "Available" : "Offline"}</span>
            </div>
          </div>

          <Button asChild>
            <Link to="/expert/bookings">View Bookings</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Profile Form */}
        <section className="lg:col-span-2">
          <Card className="shadow">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" name="name" value={profile.name} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Professional Title</Label>
                  <Input id="title" name="title" value={profile.title} onChange={handleChange} />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="bio">Short bio</Label>
                  <Textarea id="bio" name="bio" value={profile.bio} onChange={handleChange} rows={4} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Hourly rate (USD)</Label>
                  <Input id="hourlyRate" name="hourlyRate" value={profile.hourlyRate} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" value={profile.location} onChange={handleChange} />
                </div>

                <div className="md:col-span-2 flex items-center gap-4">
                  <div>
                    <Label className="block mb-1">Avatar</Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        {profile.avatarUrl ? (
                          <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                        ) : (
                          <AvatarFallback>{profile.name?.split(" ")[0]?.[0]}</AvatarFallback>
                        )}
                      </Avatar>

                      <div>
                        <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        <label htmlFor="avatar">
                          <Button variant="outline" size="sm">Upload</Button>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 flex items-center justify-between gap-4 pt-4">
                  <div className="text-sm text-muted-foreground">Tip: Keep your bio short and highlight 1–2 outcomes you deliver.</div>
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
                    <Button variant="ghost" onClick={() => {
                      localStorage.removeItem("expert_profile_demo")
                      setMessage("Reset profile demo. Reload to re-seed.")
                    }}>Reset</Button>
                  </div>
                </div>

                {message && (
                  <div className="md:col-span-2 text-sm text-success">{message}</div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Services preview */}
          <Card className="mt-6 shadow">
            <CardHeader>
              <CardTitle>Your Services</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Create, edit and manage the services you offer. This is a placeholder section — wire up your services CRUD here.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div className="p-4 border rounded">
                  <h3 className="font-semibold">Business Strategy Session</h3>
                  <p className="text-sm text-muted-foreground">$120 — 60 min</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm">Edit</Button>
                    <Button size="sm" variant="outline">Pause</Button>
                  </div>
                </div>

                <div className="p-4 border rounded">
                  <h3 className="font-semibold">Pitch Deck Review</h3>
                  <p className="text-sm text-muted-foreground">$80 — 45 min</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm">Edit</Button>
                    <Button size="sm" variant="outline">Pause</Button>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Button asChild>
                  <Link to="/expert/services">Manage Services</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Right column: quick stats */}
        <aside className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground">Earnings (this month)</div>
                <div className="text-lg font-semibold mt-1">$1,240</div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>New: 3</div>
                <div className="mt-1">Booked: 5</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div>
              <div className="text-xs text-muted-foreground">Profile Views (7d)</div>
              <div className="text-lg font-semibold mt-1">342</div>
            </div>
          </Card>

          <Card className="p-4">
            <div>
              <div className="text-xs text-muted-foreground">Rating</div>
              <div className="text-lg font-semibold mt-1">4.8 / 5</div>
              <div className="text-sm text-muted-foreground mt-1">Based on 48 reviews</div>
            </div>
          </Card>
        </aside>
      </div>
    </main>
  )
}
