import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSetAtom } from "jotai";
import { userAtom } from "../atoms";
import { Eye, EyeOff } from "lucide-react";

/* ✅ SAFE BACKEND URL */
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export default function SignInExpert() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
      /* ✅ CORRECT ENDPOINT */
      const res = await fetch(
        `${BACKEND_URL}/auth/expert/login`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Login failed");
        return;
      }

      /* ✅ STORE EXPERT */
      setUser({
        ...data.expert,
        type: "expert",
      });

      /* ✅ REDIRECT TO EXPERT DASHBOARD */
      navigate("/expert");
    } catch (err) {
      console.error(err);
      setErrorMessage("Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90dvh] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl">
            Welcome back 👋
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your services and bookings
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
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

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center mt-4 text-sm">
            Not registered yet?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
