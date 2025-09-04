// src/components/Home.jsx
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <section
      id="home"
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-6 py-12"
    >
      {/* Hero Text */}
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-4 text-center">
        Welcome to <span className="text-primary">Servnect 🚀</span>
      </h1>

      <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 text-center">
        A modern service connector platform.  
        Discover categories, connect with services, and get started instantly.
      </p>

      {/* CTA Buttons */}
      <div className="flex gap-4 flex-wrap justify-center mb-12">
        <Button asChild size="lg">
          <a href="#categories">Explore Categories</a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a href="#about">Learn More</a>
        </Button>
      </div>

      {/* Example feature cards */}
      <div className="grid gap-6 md:grid-cols-3 w-full max-w-5xl">
        <Card className="shadow-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Easy Access</h2>
            <p className="text-muted-foreground">
              Browse services across multiple categories with a simple interface.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Seamless Connect</h2>
            <p className="text-muted-foreground">
              Quickly connect with providers that match your needs.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Trusted Platform</h2>
            <p className="text-muted-foreground">
              Built with reliability and security at its core.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
