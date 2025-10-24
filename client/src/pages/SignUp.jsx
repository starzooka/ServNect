import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Eye, EyeOff } from "lucide-react"; // Make sure this is imported

const CREATE_USER_MUTATION = gql`
  # MODIFIED: Updated arguments
  mutation CreateAUser(
    $firstName: String!, 
    $lastName: String!, 
    $email: String!, 
    $password: String!
  ) {
    createUser(
      firstName: $firstName, 
      lastName: $lastName, 
      email: $email, 
      password: $password
    ) {
      id
      email
      firstName
      lastName
    }
  }
`;

export default function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [createUser, { loading, error: mutationError }] = useMutation(
    CREATE_USER_MUTATION,
    {
      onCompleted: (data) => {
        console.log("User created successfully:", data);
        navigate("/signin");
      },
      // ✅ UPDATED THIS FUNCTION
      onError: (error) => {
        if (error.message.includes("User already exists")) {
          setError("An account with this email already exists. Please sign in.");
        } else {
          setError(error.message);
        }
      },
    }
  );

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setError(NULL);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      return;
    }

    try {
      await createUser({
        variables: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        },
      });
    } catch (e) {
      console.error("Submission error", e);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[90dvh] bg-background px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl border">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Create an Account
          </CardTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Join ServNect and get started
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Your first name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Your last name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@mail.com" required value={formData.email} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Password */}
              <div className="flex flex-col gap-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  required 
                  value={formData.password} 
                  onChange={handleChange}
                  className="pr-10" // Add padding for icon
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

              {/* Confirm Password */}
              <div className="flex flex-col gap-2 relative">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? "text" : "password"} 
                  placeholder="Re-enter your password" 
                  required 
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  className="pr-10" // Add padding for icon
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-6 w-10 h-10 p-2.5" // Positioned button
                  onClick={() => setShowConfirmPassword(prev => !prev)}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {(error || mutationError) && (
              <p className="text-sm text-red-600 text-center">
                {/* Now displays the custom message or the mutationError message */}
                {error || mutationError.message} 
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/signin"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
      
    </div>
  )
}