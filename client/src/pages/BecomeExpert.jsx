import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

export default function BecomeExpert() {
  const [form, setForm] = useState({
    category: "",
    experience: "",
    location: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/experts/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("You are now an expert 🎉");
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 border rounded-xl space-y-4"
      >
        <h1 className="text-2xl font-bold">Become an Expert</h1>

        <div>
          <Label>Category</Label>
          <Input
            name="category"
            placeholder="Electrician, Plumber, IT Support"
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>Experience (years)</Label>
          <Input
            name="experience"
            type="number"
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>Location</Label>
          <Input
            name="location"
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>Phone</Label>
          <Input
            name="phone"
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Register as Expert"}
        </Button>
      </form>
    </div>
  );
}
