import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"

function useLocalProfile() {
  const [profile, setProfile] = useState({
    name: "Alex Johnson",
    title: "Business Consultant",
    bio: "Helping startups with go-to-market and product strategy.",
    hourlyRate: "50",
    location: "Remote",
    availability: true,
    avatarUrl: "",
  })

  useEffect(() => {
    const saved = localStorage.getItem("expert_profile_demo")
    if (saved) setProfile(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem("expert_profile_demo", JSON.stringify(profile))
  }, [profile])

  return [profile, setProfile]
}

export default function AccountPage() {
  const [profile, setProfile] = useLocalProfile()
  const [avatarFile, setAvatarFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()

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
    await new Promise((r) => setTimeout(r, 600))
    setSaving(false)
    alert("Profile saved (demo)")
    navigate("/expert")
  }

  return (
    // make the page area full-height, and center the inner container
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      {/* Centered container keeps the same max width but is centered in viewport */}
      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
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
                      {profile.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt={profile.name} /> : <AvatarFallback>{profile.name?.split(" ")[0]?.[0]}</AvatarFallback>}
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

              <div className="md:col-span-2 flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">Update your contact details and profile to convert more clients.</div>
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
                  <Button variant="ghost" onClick={() => { localStorage.removeItem("expert_profile_demo"); window.location.reload() }}>Reset</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
