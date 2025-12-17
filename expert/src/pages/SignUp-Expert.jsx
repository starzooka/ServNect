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

  // 🔍 Calculate Age from DD/MM/YYYY
  function calculateAge(dobString) {
    const [day, month, year] = dobString.split("/").map(Number);
    const dob = new Date(year, month - 1, day);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    const dayDiff = today.getDate() - dob.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    // Password match check
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    // DOB format check
    const dobRegex =
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!dobRegex.test(formData.dob)) {
      setErrorMessage("Date of birth must be in DD/MM/YYYY format");
      setLoading(false);
      return;
    }

    // 🔞 Age validation (must be 18 or older)
    const age = calculateAge(formData.dob);
    if (age < 18) {
      setErrorMessage("You must be at least 18 years old to register.");
      setLoading(false);
      return;
    }

    // Submit to backend
    try {
      const res = await fetch(`${BACKEND_URL}/auth/expert/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMessage(data?.message || "Sign up failed. Try again.");
        return;
      }

      navigate("/signin");
    } catch {
      setErrorMessage("Server error. Try again.");
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
            Create your profile and start connecting with customers
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

            {/* Service Dropdown */}
            <div className="space-y-1.5">
              <Label>Service Provided</Label>
              <Select
                value={formData.service}
                onValueChange={(val) =>
                  setFormData((prev) => ({ ...prev, service: val }))
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

            {/* Date of Birth (DD/MM/YYYY + calendar picker) */}
            <div className="space-y-1.5">
              <Label>Date of Birth</Label>

              <div className="relative">
                {/* User-typed visible input */}
                <Input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={formData.dob}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");

                    if (val.length > 8) val = val.slice(0, 8);
                    if (val.length >= 5) {
                      val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(
                        4
                      )}`;
                    } else if (val.length >= 3) {
                      val = `${val.slice(0, 2)}/${val.slice(2)}`;
                    }

                    setFormData((prev) => ({ ...prev, dob: val }));
                  }}
                  className="pr-10"
                />

                {/* Calendar icon */}
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("dob-hidden").showPicker()
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Open calendar"
                >
                  <Calendar className="h-4 w-4" />
                </button>

                {/* Hidden input to trigger native calendar */}
                <input
                  id="dob-hidden"
                  type="date"
                  className="absolute inset-0 opacity-0"
                  onChange={(e) => {
                    const [year, month, day] = e.target.value.split("-");
                    setFormData((prev) => ({
                      ...prev,
                      dob: `${day}/${month}/${year}`,
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
                  onClick={() => setShowConfirmPassword((p) => !p)}
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

            {/* Submit button */}
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
