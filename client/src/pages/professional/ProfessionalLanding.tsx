import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, Wrench, Briefcase, DollarSign, CalendarDays, 
  MessageSquare, ShieldCheck, TrendingUp
} from "lucide-react";

// --- ANIMATION HELPER ---
function FadeInOnScroll({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function ProfessionalLanding() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-950 overflow-x-hidden text-slate-300 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* --- NAVIGATION BAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-slate-950/80 backdrop-blur-md shadow-sm border-b border-slate-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-amber-500 p-2 rounded-xl shadow-sm">
              <Wrench className="h-5 w-5 text-slate-950" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              ServNect <span className="text-amber-500 font-normal">Partner</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800 hidden sm:flex" onClick={() => navigate('/login')}>
              Log In
            </Button>
            {/* Navigates to signup but passes a URL parameter we can use later */}
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-full px-6" onClick={() => navigate('/signup?role=professional')}>
              Apply Now
            </Button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-40 pb-24 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Dark Mode Glowing Background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-600/20 rounded-[100%] blur-[120px] pointer-events-none"></div>

        <FadeInOnScroll className="relative z-10 max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-amber-400 text-sm font-semibold mx-auto">
            <Briefcase className="h-4 w-4" /> Built for Independent Professionals
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Keep 100% of what <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">you earn.</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Stop giving away your hard-earned money to middleman platforms. ServNect connects you directly with customers, letting you set your own rates and schedule.
          </p>

          <div className="pt-8">
            <Button 
              onClick={() => navigate('/signup?role=professional')} 
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-lg font-bold px-10 py-7 rounded-full transition-all duration-300 shadow-[0_0_40px_rgba(245,158,11,0.2)] hover:shadow-[0_0_60px_rgba(245,158,11,0.3)] hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              Start Your Application
              <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="text-sm text-slate-500 mt-4">Takes less than 3 minutes to apply.</p>
          </div>
        </FadeInOnScroll>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-24 px-6 border-t border-slate-800/50 bg-slate-950/50 relative">
        <div className="max-w-7xl mx-auto">
          <FadeInOnScroll>
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Your business, your rules.</h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">Everything you need to manage and grow your independent service business.</p>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: DollarSign, title: "Zero Commissions", desc: "You agree on a price directly with the customer. We never take a cut of your earnings." },
              { icon: MessageSquare, title: "Direct Chat", desc: "Communicate securely with clients to request photos, details, and confirm pricing before you travel." },
              { icon: CalendarDays, title: "Total Flexibility", desc: "Work when you want. Toggle your availability on or off with a single tap in your dashboard." },
              { icon: TrendingUp, title: "Build Your Reputation", desc: "Collect verified reviews from customers to stand out and justify higher hourly rates." },
              { icon: ShieldCheck, title: "Verified Leads", desc: "We verify customer phone numbers so you spend less time dealing with fake requests." },
              { icon: Briefcase, title: "Free Digital Portfolio", desc: "Upload photos of your past work and list your specialized skills to attract higher-paying clients." }
            ].map((feature, index) => (
              <FadeInOnScroll key={index} delay={index * 100}>
                <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors h-full">
                  <CardContent className="p-8 space-y-4">
                    <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 mb-6">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-xl text-white">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                  </CardContent>
                </Card>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <FadeInOnScroll className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">How to get started</h2>
          </FadeInOnScroll>

          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
            {[
              { step: "01", title: "Submit Application", desc: "Provide your basic details, the services you offer, and your base hourly rate." },
              { step: "02", title: "Get Verified", desc: "Our team will quickly verify your identity to ensure a safe environment for our customers." },
              { step: "03", title: "Go Live & Get Matched", desc: "Your profile becomes visible to local customers actively searching for your skills." },
              { step: "04", title: "Chat & Get Paid", desc: "Accept jobs, negotiate directly in the app, do the work, and get paid your full rate." }
            ].map((item, index) => (
              <FadeInOnScroll key={index} delay={index * 150} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-950 bg-amber-500 text-slate-950 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_0_4px_rgba(15,23,42,1)] z-10">
                  {item.step}
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm transition-all hover:border-slate-700">
                  <h3 className="font-bold text-white text-lg mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}