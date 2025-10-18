import { useState } from "react"
import { Link, useNavigate } from "react-router-dom" // NEW: Import useNavigate
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { gql} from "@apollo/client"
import { useMutation } from "@apollo/client/react"
// NEW: Define the GraphQL mutation
const CREATE_USER_MUTATION = gql`
  mutation CreateAUser($name: String!, $email: String!, $password: String!) {
    createUser(name: $name, email: $email, password: $password) {
      id
      name
      email
    }
  }
`

const GoogleIcon = (props) => (
  <svg
    className="mr-2 h-4 w-4"
    viewBox="0 0 533.5 544.3"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <title>Google</title>
    <path
      d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 34.6-25.7 63.7-58.4 83.1v68h87.7c51.5-47.4 81.6-117.4 81.6-201.1z"
      fill="#4285F4"
    />
    <path
      d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26.5-92.6 26.5-71 0-131.2-47.9-153.8-112.3H28.9v69.7c46.7 92.9 160.8 162 243.2 162z"
      fill="#34A853"
    />
    <path
      d="M118.3 324.3c-11.3-33.8-11.3-70.1 0-103.9V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l89.4-69.1z"
      fill="#FBBC05"
    />
    <path
      d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.9l77.7-77.7c-45.4-42.1-103.1-68.1-182.1-68.1-82.4 0-196.5 69.1-243.2 162l89.4 69.7c22.6-64.4 82.8-112.3 153.8-112.3z"
      fill="#EA4335"
    />
  </svg>
)

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const navigate = useNavigate() // NEW: Hook for redirection

  // NEW: Initialize the mutation
  // We rename 'error' from the hook to 'mutationError' to avoid conflicts
  const [createUser, { loading, error: mutationError }] = useMutation(
    CREATE_USER_MUTATION,
    {
      onCompleted: (data) => {
        console.log("User created successfully:", data)
        // Redirect to sign-in page on success
        navigate("/signin")
      },
      onError: (error) => {
        // Set the error state with the message from the server
        setError(error.message)
      },
    }
  )

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
    setError("") // Clear errors on any input change
  }

  // NEW: Updated handleSubmit to be async and call the mutation
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match. Please try again.")
      return
    }

    try {
      // Call the mutation function with variables from the form state
      await createUser({
        variables: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
      })
    } catch (e) {
      // The onError handler above will catch and display GraphQL errors,
      // but this catch block is good for other potential issues.
      console.error("Submission error", e)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
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
            {/* ... (Your Input fields for name, email, password remain the same) ... */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" type="text" placeholder="Your Name" required value={formData.name} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="your@mail.com" required value={formData.email} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" required value={formData.password} onChange={handleChange} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" placeholder="Re-enter your password" required value={formData.confirmPassword} onChange={handleChange} />
            </div>

            {/* Error Message Display (now handles GraphQL errors too) */}
            {(error || mutationError) && (
              <p className="text-sm text-red-600 text-center">
                {error || mutationError.message}
              </p>
            )}

            {/* Sign Up Button (now disabled during loading) */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>

          {/* ... (The rest of your JSX for Google sign-in and the footer link remains the same) ... */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Button variant="outline" className="w-full">
            <GoogleIcon />
            Google
          </Button>
          <div className="mt-4 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}