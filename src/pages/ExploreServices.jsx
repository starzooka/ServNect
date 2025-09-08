// src/components/Categories.jsx
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Wrench, Droplets, Hammer, Paintbrush, Laptop, Home } from "lucide-react"

const categories = [
  { label: "Electrician", icon: Wrench, description: "Expert electrical solutions for home and office." },
  { label: "Plumber", icon: Droplets, description: "Fix leaks, installations, and all plumbing needs." },
  { label: "Carpenter", icon: Hammer, description: "Custom furniture, repairs, and woodwork." },
  { label: "Painter", icon: Paintbrush, description: "Professional painting for homes and commercial spaces." },
  { label: "IT Support", icon: Laptop, description: "Tech help, system setup, and troubleshooting." },
  { label: "Housekeeping", icon: Home, description: "Cleaning, maintenance, and daily assistance." },
]

export default function ExploreServices() {
  return (
    <section id="categories" className="px-6 py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-6 text-primary">
          Service Categories
        </h2>
        <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
          Choose from a wide range of trusted professionals to get your work done with ease.
        </p>

        {/* Categories Grid */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {categories.map((category, index) => (
            <Card key={index} className="hover:shadow-lg transition">
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
