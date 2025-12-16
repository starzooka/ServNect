import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import tishaImg from "@/assets/team/Tisha3.jpg";
import shubhradeepImg from "@/assets/team/Shubhradeep.jpg";
import rittwikImg from "@/assets/team/Rittwik.jpg";
import anikImg from "@/assets/team/Anik.jpg";

const sections = {
  vision: {
    title: "Our Vision",
    content: `
ServNect envisions a future where finding reliable service professionals
is effortless, transparent, and trustworthy.

We aim to create a unified digital ecosystem where users can seamlessly
connect with skilled experts for their daily service needs.

Our vision is to remove uncertainty, delays, and inefficiency from
traditional service discovery.
    `,
  },

  mission: {
    title: "Our Mission",
    content: `
Our mission is to simplify the discovery, booking, and management of
professional services through a secure digital platform.

We focus on empowering users with verified professionals and enabling
service providers to grow through visibility and trust.
    `,
  },

  values: {
    title: "Our Core Values",
    content: `
• Trust – Secure and transparent interactions
• Reliability – Consistent service experience
• Accessibility – Simple and intuitive UI
• Innovation – Modern full-stack technology
• User-first mindset

These values guide every feature we build.
    `,
  },

  history: {
    title: "Our Journey",
    content: `
ServNect started as a college minor project to solve a real-world problem.

The idea grew through research, collaboration, and hands-on development,
resulting in a fully functional service connector platform.
    `,
  },
};

const team = [
  {
    name: "Shubhradeep Lodh",
    role: "Frontend Developer",
    img: shubhradeepImg,
  },
  {
    name: "Tisha Banerjee",
    role: "Backend Developer",
    img: tishaImg,
  },
  {
    name: "Anik Paul",
    role: "Development & Design",
    img: anikImg,
  },
  {
    name: "Rittwik Mitra",
    role: "Documentation & Testing",
    img:  rittwikImg,
  },
];

export default function About() {
  const [active, setActive] = useState("vision");

  return (
    <section className="min-h-screen px-6 py-16 bg-background">
      <div className="max-w-5xl mx-auto space-y-12">

        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            About ServNect
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A modern service connector platform designed to connect users
            with trusted professionals efficiently.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          {Object.keys(sections).map((key) => (
            <Button
              key={key}
              variant={active === key ? "default" : "outline"}
              onClick={() => setActive(key)}
              className="capitalize"
            >
              {key}
            </Button>
          ))}
        </div>

        {/* Section Content */}
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">
              {sections[active].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
              {sections[active].content}
            </p>
          </CardContent>
        </Card>

        {/* Team Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-primary">
            Meet Our Team
          </h2>

          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition">
                <CardContent className="pt-6 space-y-3">
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-24 h-24 mx-auto rounded-full object-cover border"
                  />
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-muted-foreground text-sm">
                    {member.role}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground">
          ServNect is a college minor project showcasing full-stack development,
          authentication, booking workflows, and real-world problem solving.
        </p>

      </div>
    </section>
  );
}
