// src/components/ExploreServices.jsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Wrench, Droplets, Hammer, Paintbrush, Laptop, Home } from "lucide-react"
import { useNavigate } from "react-router-dom"

const categories = [
  { key: "electrician", label: "Electrician", icon: Wrench, description: "Expert electrical solutions for home and office." },
  { key: "plumber", label: "Plumber", icon: Droplets, description: "Fix leaks, installations, and all plumbing needs." },
  { key: "carpenter", label: "Carpenter", icon: Hammer, description: "Custom furniture, repairs, and woodwork." },
  { key: "painter", label: "Painter", icon: Paintbrush, description: "Professional painting for homes and commercial spaces." },
  { key: "it-support", label: "IT Support", icon: Laptop, description: "Tech help, system setup, and troubleshooting." },
  { key: "housekeeping", label: "Housekeeping", icon: Home, description: "Cleaning, maintenance, and daily assistance." },
]

export default function ExploreServices() {
  const navigate = useNavigate()

  return (
    <section id="categories" className="px-6 py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-primary">
          Explore Services
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Choose from a wide range of trusted professionals to get your work done with ease.
        </p>

        {/* Categories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((category) => (
            <Card
              key={category.key}
              className="hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/professionals/${category.key}`)} // ✅ updated route
            >
              <CardHeader className="flex flex-col items-center">
                <category.icon className="w-10 h-10 text-primary mb-2" />
                <CardTitle>{category.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground">
                {category.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
