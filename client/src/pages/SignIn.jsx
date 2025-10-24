import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useSetAtom } from "jotai";
import { userAtom } from "../atoms";
import { Eye, EyeOff } from "lucide-react"; // Import icons

// GraphQL mutation
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        firstName
        lastName
        email
      }
    }
  }
`;

const GoogleIcon = (props) => (
  <svg
    className="mr-2 h-4 w-4"
    viewBox="0 0 533.5 544.3"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Google</title>
    <path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 34.6-25.7 63.7-58.4 83.1v68h87.7c51.5-47.4 81.6-117.4 81.6-201.1z" fill="#4285F4" />
    <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26.5-92.6 26.5-71 0-131.2-47.9-153.8-112.3H28.9v69.7c46.7 92.9 160.8 162 243.2 162z" fill="#34A853" />
    <path d="M118.3 324.3c-11.3-33.8-11.3-70.1 0-103.9V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l89.4-69.1z" fill="#FBBC05" />
    <path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.9l77.7-77.7c-45.4-42.1-103.1-68.1-182.1-68.1-82.4 0-196.5 69.1-243.2 162l89.4 69.7c22.6-64.4 82.8-112.3 153.8-112.3z" fill="#EA4335" />
  </svg>
);

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State for visibility
  const setUser = useSetAtom(userAtom);
  const navigate = useNavigate();

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      // Set the user in global state
      setUser(data.login.user);

      // Navigate to home page without full reload
      navigate("/");
    },
    onError: (error) => {
      console.error("GraphQL login error:", error);

      if (
        error.message.includes("Invalid email or password") ||
        error.message.toLowerCase().includes("invalid credentials")
      ) {
        setErrorMessage("Invalid credentials. Please check your email and password.");
      } else if (error.graphQLErrors?.length > 0) {
        const msg = error.graphQLErrors[0].message || "Login failed.";
        if (msg.includes("Invalid email or password")) {
          setErrorMessage("Invalid credentials. Please check your email and password.");
        } else {
          setErrorMessage(msg);
        }
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    },
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrorMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    login({
      variables: {
        email: formData.email.trim(),
        password: formData.password,
      },
    });
  };

  return (
    <div className="flex items-center justify-center min-h-[90dvh] bg-background px-4">
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@mail.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-col gap-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"} // Dynamic type
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                className="pr-10" // Padding for icon
              />
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="absolute right-0 top-6 w-10 h-10 p-2.5" // Positioned button
                onClick={() => setShowPassword(prev => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600 text-center font-medium">
                {errorMessage}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <GoogleIcon />
            Google
          </Button>

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Don't have an account?{" "}
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
  );
}