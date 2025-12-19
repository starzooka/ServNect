import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { useAtom } from "jotai";
import { expertAtom } from "../atoms";
import { LogOut } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function AccountPage() {
  const [expert, setExpert] = useAtom(expertAtom);
  const navigate = useNavigate();

  // Local form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    specialty: "",
    bio: "",
    hourlyRate: "",
    location: "",
    avatarUrl: "",
  });

  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  // Sync global atom data to local form state when page loads
  useEffect(() => {
    if (expert) {
      setFormData({
        firstName: expert.firstName || "",
        lastName: expert.lastName || "",
        specialty: expert.specialty || "", // mapped to 'service' or 'title'
        bio: expert.bio || "",
        hourlyRate: expert.hourlyRate || "",
        location: expert.location || "",
        avatarUrl: expert.profileImage || "", 
      });
    }
  }, [expert]);

  // Handle Image Preview
  useEffect(() => {
    if (!avatarFile) return;
    const url = URL.createObjectURL(avatarFile);
    setFormData((prev) => ({ ...prev, avatarUrl: url }));
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (file) setAvatarFile(file);
  }

  // ✅ LOGOUT: Remove Token + Clear State
  async function handleLogout() {
    if (!window.confirm("Are you sure you want to log out?")) return;
    
    // 1. Remove Token
    localStorage.removeItem("expert_token");
    
    // 2. Clear State
    setExpert(null);
    
    // 3. Redirect
    navigate("/signin");
  }

  // ✅ SAVE: Add Auth Header
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    
    // Get token for authorization
    const token = localStorage.getItem("expert_token");

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        specialty: formData.specialty,
        bio: formData.bio,
        hourlyRate: formData.hourlyRate,
        location: formData.location,
      };

      const res = await fetch(`${BACKEND_URL}/experts/me`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // ✅ Attach Token
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      const updatedExpert = await res.json();
      setExpert(updatedExpert); // Update global state with new data
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (!expert) return <div>Loading profile...</div>;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Professional Title</Label>
                <Input 
                  id="specialty" 
                  name="specialty" 
                  value={formData.specialty} 
                  onChange={handleChange} 
                  placeholder="e.g. Business Consultant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly rate ($)</Label>
                <Input 
                  id="hourlyRate" 
                  name="hourlyRate" 
                  value={formData.hourlyRate} 
                  onChange={handleChange} 
                  type="number"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="bio">Short bio</Label>
                <Textarea 
                  id="bio" 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange} 
                  rows={4} 
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  name="location" 
                  value={formData.location} 
                  onChange={handleChange} 
                  placeholder="e.g. Remote, New York, etc."
                />
              </div>

              {/* Avatar Section */}
              <div className="md:col-span-2 flex items-center gap-4 pt-2">
                <div>
                  <Label className="block mb-2">Avatar</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 border">
                      <AvatarImage src={formData.avatarUrl} alt={formData.firstName} className="object-cover" />
                      <AvatarFallback className="text-xl">
                        {formData.firstName?.[0]}{formData.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <input 
                        id="avatar" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                      />
                      <label htmlFor="avatar">
                        <Button type="button" variant="outline" size="sm" asChild>
                          <span>Upload New Photo</span>
                        </Button>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        (Preview only - backend upload needed)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="md:col-span-2 flex items-center justify-between pt-6 border-t mt-4">
                
                {/* Logout Button */}
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>

                {/* Save Button */}
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}