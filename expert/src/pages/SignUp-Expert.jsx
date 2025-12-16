import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

const SERVICES = [
  "Electrician",
  "Plumber",
  "Mechanic",
  "Carpenter",
  "AC Technician",
  "Painter",
  "Cleaner",
  "Tutor",
  "Appliance Repair",
  "Other",
];

export default function ExpertSignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    service: "",
    dob: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  function handleChange(e) {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrorMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const {
      firstName,
      lastName,
      email,
      phone,
      service,
      dob,
      location,
      password,
      confirmPassword,
    } = formData;

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/auth/expert/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: email.trim(),
          phone,
          service,
          dob,
          location,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMessage(data?.message || "Sign up failed. Try again.");
        return;
      }

      navigate("/signin");
    } catch (err) {
      console.error("Expert sign up error:", err);
      setErrorMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[90dvh] px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            Expert Registration
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First name */}
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={formData.firstName} onChange={handleChange} />
            </div>

            {/* Last name */}
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={formData.lastName} onChange={handleChange} />
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={handleChange} />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} />
            </div>

            {/* Service dropdown */}
            <div>
              <Label>Service Provided</Label>
              <Select
                value={formData.service}
                onValueChange={(val) =>
                  setFormData((p) => ({ ...p, service: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DOB */}
            <div>
  <Label htmlFor="dob">Date of Birth</Label>

  <div className="relative">
    <Input
      id="dob"
      type="date"
      value={formData.dob}
      onChange={handleChange}
      className="pr-10"
    />

    {/* Calendar icon */}
    <Calendar
      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
    />
  </div>
</div>


            {/* Location */}
            <div>
              <Label htmlFor="location">Service Location</Label>
              <Input
                id="location"
                placeholder="City / Area"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            {errorMessage && (
              <p className="sm:col-span-2 text-red-600 text-sm">
                {errorMessage}
              </p>
            )}

            <div className="sm:col-span-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Creating Account..." : "Register as Expert"}
              </Button>
            </div>
          </form>

          <p className="text-center mt-4 text-sm">
            Already registered? <Link to="/signin">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
