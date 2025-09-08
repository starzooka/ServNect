// src/pages/SignIn.jsx
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Welcome Back
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to continue to ServNect
          </p>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
              >
                Get Started
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
