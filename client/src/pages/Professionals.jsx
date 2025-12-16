import { useParams, Link } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";

// Dummy data (now includes id)
const professionalsData = {
  electrician: [
    {
      id: "64e1a1a1a1a1a1a1a1a1a101",
      name: "Rahul Sharma",
      experience: "5 years",
      location: "Kolkata",
      contact: "9876543210",
    },
    {
      id: "64e1a1a1a1a1a1a1a1a1a102",
      name: "Anita Verma",
      experience: "3 years",
      location: "Delhi",
      contact: "9123456789",
    },
  ],
  plumber: [
    {
      id: "64e1a1a1a1a1a1a1a1a1a103",
      name: "Ramesh Kumar",
      experience: "7 years",
      location: "Mumbai",
      contact: "9988776655",
    },
  ],
};

// Helper to format category
const formatCategory = (key) =>
  key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function Professionals() {
  const { category } = useParams();
  const professionals = professionalsData[category] || [];
  const categoryLabel = formatCategory(category);

  // ✅ MUST be inside component
  const handleHire = async (expertId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/bookings`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertId,
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Booking failed");
        return;
      }

      alert("Booking request sent successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <section className="px-6 py-16 bg-muted/30 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            {categoryLabel}
          </h2>
          <Button asChild variant="outline">
            <Link to="/explore">← Back to Services</Link>
          </Button>
        </div>

        {professionals.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {professionals.map((pro) => (
              <Card key={pro.id} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle>{pro.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p>
                    <strong>Experience:</strong> {pro.experience}
                  </p>
                  <p>
                    <strong>Location:</strong> {pro.location}
                  </p>
                  <p>
                    <strong>Contact:</strong> {pro.contact}
                  </p>

                  {/* ✅ WORKING BUTTON */}
                  <Button
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => handleHire(pro.id)}
                  >
                    Hire Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No professionals available in this category yet.
          </p>
        )}
      </div>
    </section>
  );
}
