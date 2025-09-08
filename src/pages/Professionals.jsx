// src/pages/Professionals.jsx
import { useParams, Link } from "react-router-dom"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

// Dummy data – in real case, this could come from an API or database
const professionalsData = {
  Electrician: [
    { name: "Rahul Sharma", experience: "5 years", location: "Kolkata", contact: "9876543210" },
    { name: "Anita Verma", experience: "3 years", location: "Delhi", contact: "9123456789" },
  ],
  Plumber: [
    { name: "Ramesh Kumar", experience: "7 years", location: "Mumbai", contact: "9988776655" },
  ],
  Carpenter: [
    { name: "Suresh Gupta", experience: "4 years", location: "Bangalore", contact: "8877665544" },
  ],
  Painter: [
    { name: "Vikram Singh", experience: "6 years", location: "Hyderabad", contact: "7766554433" },
  ],
  "IT Support": [
    { name: "Priya Iyer", experience: "2 years", location: "Chennai", contact: "6655443322" },
  ],
  Housekeeping: [
    { name: "Manoj Das", experience: "8 years", location: "Pune", contact: "5544332211" },
  ],
}

export default function Professionals() {
  const { category } = useParams()
  const professionals = professionalsData[category] || []

  return (
    <section className="px-6 py-16 bg-muted/30 min-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary">
            {category} Professionals
          </h2>
          <Button asChild variant="outline">
            <Link to="/explore">← Back to Services</Link>
          </Button>
        </div>

        {professionals.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {professionals.map((pro, index) => (
              <Card key={index} className="hover:shadow-lg transition">
                <CardHeader>
                  <CardTitle>{pro.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-muted-foreground">
                  <p><strong>Experience:</strong> {pro.experience}</p>
                  <p><strong>Location:</strong> {pro.location}</p>
                  <p><strong>Contact:</strong> {pro.contact}</p>
                  <Button size="sm" className="mt-2 w-full">Hire Now</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No professionals available in this category yet.</p>
        )}
      </div>
    </section>
  )
}
