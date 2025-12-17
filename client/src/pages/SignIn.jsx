import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSetAtom } from "jotai";
import { userAtom } from "../atoms";
import { Eye, EyeOff } from "lucide-react";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setUser = useSetAtom(userAtom);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      // 1. LOGIN REQUEST (Corrected URL)
      const res = await fetch(`${BACKEND_URL}/auth/user/login`, {
        method: "POST",
        credentials: "include", // Essential for setting the cookie
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        // ignore
      }

      if (!res.ok) {
        setErrorMessage(
          data?.message || data?.error || "Login failed. Please try again."
        );
        return;
      }

      // 2. FETCH USER PROFILE (Because login only returns a cookie)
      // We must manually fetch the user details to update the UI
      const userRes = await fetch(`${BACKEND_URL}/users/me`, {
        credentials: "include",
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData); // Update Global State
        navigate("/");     // Redirect to Home
      } else {
        setErrorMessage("Login successful, but failed to load user data.");
      }

    } catch (err) {
      console.error("Login request error:", err);
      setErrorMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90dvh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>

            {errorMessage && (
              <p className="text-red-600 text-sm">{errorMessage}</p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center mt-4 text-sm">
            No account? <Link to="/signup">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}