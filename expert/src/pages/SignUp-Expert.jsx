import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// ✅ IMPORT ATOMS TO UPDATE STATE
import { useSetAtom } from "jotai";
import { expertAtom } from "../atoms"; 

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
  const navigate = useNavigate();
  // ✅ GET SETTER FOR GLOBAL STATE
  const setExpert = useSetAtom(expertAtom);

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

  function handleChange(e) {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrorMessage("");
  }

  // 🔢 Age calculation
  function calculateAge(dobString) {
    const [day, month, year] = dobString.split("/").map(Number);
    const dob = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Password match
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    // DOB format
    const dobRegex =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!dobRegex.test(formData.dob)) {
      setErrorMessage("Date of birth must be in DD/MM/YYYY format");
      setLoading(false);
      return;
    }

    // Age check
    if (calculateAge(formData.dob) < 18) {
      setErrorMessage("You must be at least 18 years old to register.");
      setLoading(false);
      return;
    }

    // ❗ Remove confirmPassword before sending
    const { confirmPassword, ...payload } = formData;

    try {
      // ✅ CHANGED URL: /auth/expert/register (singular 'expert')
      const res = await fetch(
        `${BACKEND_URL}/auth/expert/register`,
        {
          method: "POST",
          // credentials: "include", // ❌ REMOVED: No longer using cookies
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Registration failed");
        return;
      }

      // ✅ NEW: Handle Token & Auto-Login
      if (data.token) {
        // 1. Save Token
        localStorage.setItem("expert_token", data.token);
        
        // 2. Update Global State
        setExpert(data.expert);
        
        // 3. Redirect to Dashboard
        navigate("/expert");
      } else {
        // Fallback if no token sent
        navigate("/signin");
      }

    } catch (err) {
      setErrorMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[90dvh] px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">
            Join as a Service Professional
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create your expert profile and start getting customers
          </p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* First Name */}
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Service */}
            <div className="space-y-1.5">
              <Label>Service Provided</Label>
              <Select
                value={formData.service}
                onValueChange={(val) =>
                  setFormData((p) => ({ ...p, service: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your service" />
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
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.dob}
                  onChange={(e) => {
                    let v = e.target.value.replace(/\D/g, "");
                    if (v.length > 8) v = v.slice(0, 8);
                    if (v.length >= 5)
                      v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
                    else if (v.length >= 3)
                      v = `${v.slice(0, 2)}/${v.slice(2)}`;
                    setFormData((p) => ({ ...p, dob: v }));
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("dob-hidden").showPicker()
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <Calendar className="h-4 w-4" />
                </button>
                <input
                  id="dob-hidden"
                  type="date"
                  className="absolute inset-0 opacity-0"
                  onChange={(e) => {
                    const [y, m, d] = e.target.value.split("-");
                    setFormData((p) => ({
                      ...p,
                      dob: `${d}/${m}/${y}`,
                    }));
                  }}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="location">Service Location</Label>
              <Input
                id="location"
                placeholder="City / Area"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a secure password"
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
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1"
                  onClick={() =>
                    setShowConfirmPassword((p) => !p)
                  }
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>

            {errorMessage && (
              <p className="sm:col-span-2 text-sm text-red-600">
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