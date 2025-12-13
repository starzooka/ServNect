import { useAtom } from "jotai";
import { userAtom } from "../atoms";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export default function Profile() {
  const [user, setUser] = useAtom(userAtom);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  if (!user) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  const initials =
    (user.firstName?.[0] || "") + (user.lastName?.[0] || "");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BACKEND_URL}/users/me`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Update failed");
        return;
      }

      setUser(data);
      setEditMode(false);
      setMessage("Profile updated successfully ✅");
    } catch {
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordMessage("");

    if (!currentPassword || !newPassword) {
      setPasswordMessage("Please fill all password fields");
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/auth/change-password`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordMessage(data.message || "Password update failed");
        return;
      }

      setPasswordMessage("Password updated successfully ✅");
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setPasswordMessage("Server error");
    }
  };

  return (
    <div className="flex justify-center py-10 px-4">
      <Card className="w-full max-w-xl">
        <CardHeader className="flex flex-col items-center gap-3">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary">
            {initials.toUpperCase()}
          </div>

          <CardTitle className="text-2xl">
            {user.firstName} {user.lastName}
          </CardTitle>

          <p className="text-sm text-muted-foreground">
            {user.email}
          </p>
        </CardHeader>

        <CardContent>
          {/* VIEW MODE */}
          {!editMode ? (
            <>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    First Name
                  </span>
                  <span className="font-medium">
                    {user.firstName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Last Name
                  </span>
                  <span className="font-medium">
                    {user.lastName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Phone
                  </span>
                  <span className="font-medium">
                    {user.phone || (
                      <span className="italic text-muted-foreground">
                        Add phone
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">
                    Bio
                  </span>
                  <span
                    className={`font-medium text-right max-w-[60%] ${
                      !user.bio
                        ? "italic text-muted-foreground cursor-pointer"
                        : ""
                    }`}
                    onClick={() => {
                      if (!user.bio) setEditMode(true);
                    }}
                  >
                    {user.bio || "Add bio"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link to="/bookings">My Bookings</Link>
                </Button>
              </div>
            </>
          ) : (
            /* EDIT MODE */
            <>
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 bg-background"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {message && (
            <p className="mt-4 text-sm text-center">
              {message}
            </p>
          )}

          {/* CHANGE PASSWORD */}
          <hr className="my-6" />

          <h3 className="font-semibold mb-3">
            Change Password
          </h3>

          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(e.target.value)
              }
            />

            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) =>
                setNewPassword(e.target.value)
              }
            />

            <Button onClick={handleChangePassword}>
              Change Password
            </Button>

            {passwordMessage && (
              <p className="text-sm">{passwordMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
