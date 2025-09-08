// src/components/Home.jsx
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function Home() {
  return (
    <section
      id="home"
      className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12"
    >
      {/* Hero Text */}
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-primary mb-4 text-center leading-snug">
        Welcome to <span className="text-primary">ServNect 🚀</span>
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-xl sm:max-w-2xl mb-6 sm:mb-8 text-center">
        A modern service connector platform.  
        Discover categories, connect with services, and get started instantly.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap justify-center mb-10 sm:mb-12 w-full sm:w-auto">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <a href="/categories">Explore Categories</a>
        </Button>
        <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
          <a href="/about">Learn More</a>
        </Button>
      </div>

      {/* Example feature cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 w-full max-w-5xl">
        <Card className="shadow-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Easy Access</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Browse services across multiple categories with a simple interface.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Seamless Connect</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Quickly connect with providers that match your needs.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg sm:text-xl font-semibold mb-2">Trusted Platform</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Built with reliability and security at its core.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
