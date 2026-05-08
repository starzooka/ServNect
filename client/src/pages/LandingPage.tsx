import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  ShieldCheck, Search, Star, ArrowRight, Wrench, Briefcase, 
  Droplets, Zap, Sparkles, Hammer, Paintbrush, MonitorSmartphone,
  ThumbsUp, CircleDollarSign, BadgeCheck, MapPin, Menu, X, ChevronUp
} from "lucide-react";

// --- CUSTOM ANIMATIONS CSS ---
const animationStyles = `
  @keyframes blob {
    0% { transform: translate(0px, 0px) scale(1); }
    33% { transform: translate(30px, -50px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.9); }
    100% { transform: translate(0px, 0px) scale(1); }
  }
  .animate-blob { animation: blob 7s infinite; }
  .animation-delay-2000 { animation-delay: 2s; }
  .animation-delay-4000 { animation-delay: 4s; }
  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
    100% { transform: translateY(0px); }
  }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-delayed { animation: float 6s ease-in-out 3s infinite; }
  html { scroll-behavior: smooth; }
`;

// --- ANIMATION HELPER COMPONENTS ---
const SERVICES = ["Plumbing?", "Electrical Issues?", "Deep Cleaning?", "Appliance Repair?", "Carpentry?", "Painting?", "Home Repair?"];

function AnimatedServiceText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((current) => (current + 1) % SERVICES.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <span className="inline-grid overflow-hidden relative">
      {SERVICES.map((service, i) => (
        <span
          key={service}
          className={`col-start-1 row-start-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-700 ease-in-out ${
            i === index ? "opacity-100 translate-y-0" : i < index || (index === 0 && i === SERVICES.length - 1) ? "opacity-0 -translate-y-8" : "opacity-0 translate-y-8"
          }`}
        >
          {service}
        </span>
      ))}
    </span>
  );
}

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

// --- MAIN LANDING PAGE ---
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // New States for Scroll Tracking
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // 1. Detect scroll for Navbar shadow & Scroll-to-Top Button
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowScrollTop(window.scrollY > 500); // Show button after scrolling 500px
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Intersection Observer to spy on which section is active AND update the URL Hash
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const currentId = entry.target.id;
            setActiveSection(currentId);
            
            // --- NEW LOGIC: Update URL Hash Silently ---
            if (currentId === 'home') {
              // If we scroll back to the very top, clean the URL
              window.history.replaceState(null, '', window.location.pathname);
            } else {
              // Otherwise, update the URL with the section hash
              window.history.replaceState(null, '', `#${currentId}`);
            }
          }
        });
      },
      { rootMargin: "-100px 0px -60% 0px" } // Triggers slightly before the section hits the top
    );

    // Observe all sections that have an ID
    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Clear the URL hash explicitly when using the button
    window.history.replaceState(null, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 overflow-x-hidden text-slate-900 selection:bg-blue-200 selection:text-blue-900">
      <style>{animationStyles}</style>

      {/* --- NAVIGATION BAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={scrollToTop}>
            <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              ServNect
            </span>
          </div>

          {/* Desktop Links - Dynamically updated active state */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#home" className={`transition-colors ${activeSection === 'home' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'}`}>Home</a>
            <a href="#services" className={`transition-colors ${activeSection === 'services' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'}`}>Services</a>
            <a href="#advantage" className={`transition-colors ${activeSection === 'advantage' ? 'text-blue-600 font-bold' : 'text-slate-600 hover:text-blue-600'}`}>Why ServNect</a>
            <a href="#pro" className={`transition-colors ${activeSection === 'pro' ? 'text-amber-500 font-bold' : 'text-amber-600 hover:text-amber-500'}`}>Become a Pro</a>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" className="text-slate-600 hover:text-blue-600 hover:bg-slate-100" onClick={() => navigate('/login')}>
              Log In
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 transition-transform active:scale-95" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6 text-slate-600" /> : <Menu className="h-6 w-6 text-slate-600" />}
            </Button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="fixed top-20 left-0 w-full bg-white border-b border-slate-200 shadow-lg z-40 flex flex-col p-4 animate-in slide-in-from-top-2 md:hidden">
            <a href="#home" onClick={() => setMobileMenuOpen(false)} className={`p-4 font-medium border-b border-slate-100 ${activeSection === 'home' ? 'text-blue-600' : 'text-slate-600'}`}>Home</a>
            <a href="#services" onClick={() => setMobileMenuOpen(false)} className={`p-4 font-medium border-b border-slate-100 ${activeSection === 'services' ? 'text-blue-600' : 'text-slate-600'}`}>Services</a>
            <a href="#advantage" onClick={() => setMobileMenuOpen(false)} className={`p-4 font-medium border-b border-slate-100 ${activeSection === 'advantage' ? 'text-blue-600' : 'text-slate-600'}`}>Why ServNect</a>
            <a href="#pro" onClick={() => setMobileMenuOpen(false)} className={`p-4 font-medium border-b border-slate-100 ${activeSection === 'pro' ? 'text-amber-500' : 'text-amber-600'}`}>Become a Pro</a>
            <div className="flex flex-col gap-3 pt-4">
              <Button variant="default" className="w-full h-11" onClick={() => navigate('/login')}>Log In</Button>
              <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate('/signup')}>Sign Up</Button>
            </div>
          </div>
        )}
      </nav>

      {/* --- 1. HERO SECTION --- */}
      <section id="home" className="relative flex flex-col items-center justify-center px-6 pt-40 pb-24 md:pt-48 md:pb-32 text-center min-h-[95vh] overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-1/2 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

        <FadeInOnScroll className="relative z-10 max-w-5xl space-y-8 w-full">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 text-blue-700 text-sm font-semibold mb-4 mx-auto shadow-sm">
            <Sparkles className="h-4 w-4 text-amber-500" /> The open marketplace for services
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Need help with <br className="hidden md:block"/>
            <span className="block mt-2 h-[1.2em]">
              <AnimatedServiceText />
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-light">
            Skip the middlemen. Connect instantly with independent, community-rated professionals in your area.
          </p>

          {/* Glassmorphic Search Bar */}
          <form 
            onSubmit={(e) => { e.preventDefault(); navigate('/signup'); }} 
            className="max-w-2xl mx-auto mt-12 bg-white/70 backdrop-blur-xl p-2.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex items-center transition-all duration-500 hover:shadow-[0_8px_40px_rgb(37,99,235,0.12)] focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:bg-white"
          >
            <div className="pl-5 hidden sm:flex items-center">
              <Search className="text-slate-400 h-5 w-5" />
            </div>
            <Input 
              type="text" 
              placeholder="What do you need help with? (e.g. AC Repair)" 
              className="border-0 shadow-none focus-visible:ring-0 text-lg w-full px-4 bg-transparent placeholder:text-slate-400"
            />
            <Button 
              type="submit" 
              className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-8 py-7 text-lg font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/30 active:scale-95"
            >
              Search Pros
            </Button>
          </form>

          <div className="flex flex-wrap justify-center gap-8 pt-10 text-sm md:text-base text-slate-600 font-medium">
            <div className="flex items-center gap-2.5"><ShieldCheck className="text-blue-500 h-5 w-5" /> Vetted Professionals</div>
            <div className="flex items-center gap-2.5"><Star className="text-amber-500 h-5 w-5" /> 4.9/5 Average Rating</div>
          </div>
        </FadeInOnScroll>
      </section>

      {/* --- 2. POPULAR SERVICES GRID --- */}
      <section id="services" className="scroll-mt-24 py-32 px-6 border-t border-slate-200/50 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <FadeInOnScroll>
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Services at your doorstep</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">Browse thousands of independent experts ready to help.</p>
            </div>
          </FadeInOnScroll>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Droplets, name: "Plumbing", desc: "Leaks, pipes, and fixtures" },
              { icon: Zap, name: "Electrical", desc: "Wiring, panels, and lighting" },
              { icon: Sparkles, name: "Cleaning", desc: "Deep cleans and regular upkeep" },
              { icon: Hammer, name: "Carpentry", desc: "Furniture assembly and repairs" },
              { icon: MonitorSmartphone, name: "Appliance", desc: "ACs, washing machines, ovens" },
              { icon: Paintbrush, name: "Painting", desc: "Interiors, exteriors, touch-ups" }
            ].map((service, index) => (
              <FadeInOnScroll key={index} delay={index * 100}>
                <div 
                  onClick={() => navigate('/signup')} 
                  className="group p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-start gap-5 relative overflow-hidden"
                >
                  <div className="p-4 bg-slate-50 text-slate-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm group-hover:shadow-blue-500/25">
                    <service.icon className="h-7 w-7" />
                  </div>
                  <div className="space-y-1 relative z-10">
                    <h3 className="font-bold text-xl">{service.name}</h3>
                    <p className="text-slate-500 text-sm hidden md:block">{service.desc}</p>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* --- 3. THE SERVNECT ADVANTAGE --- */}
      <section id="advantage" className="scroll-mt-24 py-32 px-6 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            
            <FadeInOnScroll className="flex-1 space-y-10 order-2 lg:order-1">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
                  Why thousands trust <br/><span className="text-blue-600">ServNect</span> for their homes.
                </h2>
                <p className="text-xl text-slate-600 font-light">
                  We empower you to choose. Chat directly with professionals, compare transparent prices, and hire with confidence.
                </p>
              </div>

              <div className="space-y-8">
                {[
                  { icon: BadgeCheck, title: "Verified Identity", desc: "Every Pro is verified so you know exactly who is coming to your home." },
                  { icon: CircleDollarSign, title: "Direct Negotiation", desc: "No middleman fees. You agree on the price directly with the Pro." },
                  { icon: ThumbsUp, title: "Community Rated", desc: "Read honest reviews from your neighbors before you make a decision." }
                ].map((item, index) => (
                  <div key={index} className="flex gap-5 group">
                    <div className="mt-1 bg-white shadow-sm border border-slate-100 p-3 rounded-2xl h-fit group-hover:bg-blue-50 transition-colors">
                      <item.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-xl">{item.title}</h4>
                      <p className="text-slate-500 text-base">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeInOnScroll>

            {/* Premium UI Mockup Composition */}
            <FadeInOnScroll delay={300} className="flex-1 w-full relative order-1 lg:order-2 h-[500px]">
              <div className="absolute inset-0 bg-white rounded-[3rem] border border-slate-200 overflow-hidden flex items-center justify-center shadow-sm">
                {/* Decorative background element inside the box */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-indigo-50/50"></div>
                
                {/* Floating Card 1: Pro Profile */}
                <div className="absolute top-10 right-10 lg:-right-10 animate-float z-10">
                  <Card className="w-72 shadow-xl border-slate-100 bg-white/95 backdrop-blur-md rounded-3xl p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                           <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Pro" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">Rahul S.</h4>
                        <p className="text-sm text-slate-500 flex items-center gap-1"><MapPin className="w-3 h-3"/> 2km away</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm font-semibold bg-amber-50 text-amber-700 w-fit px-2.5 py-1 rounded-lg">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" /> 4.9 (120 reviews)
                    </div>
                  </Card>
                </div>

                {/* Floating Card 2: Chat Interface Mockup */}
                <div className="absolute bottom-10 left-0 lg:-left-10 animate-float-delayed z-20">
                  <Card className="w-80 shadow-2xl border-slate-100 bg-white/95 backdrop-blur-md rounded-3xl p-6">
                     <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-full"><Zap className="w-5 h-5" /></div>
                        <h4 className="font-bold text-lg">Direct Chat</h4>
                     </div>
                     <div className="space-y-3">
                        <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl rounded-tl-none text-sm w-4/5">
                          I can fix the AC leak today at 4 PM. My rate is ₹500.
                        </div>
                        <div className="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-none text-sm w-4/5 ml-auto">
                          Sounds perfect. See you then!
                        </div>
                     </div>
                  </Card>
                </div>

              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* --- 4. PROFESSIONAL CTA SECTION (DARK MODE) --- */}
      <section id="pro" className="scroll-mt-24 relative overflow-hidden group">
        <div className="absolute inset-0 bg-slate-950"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-900 to-slate-950"></div>
        
        <FadeInOnScroll>
          <div className="max-w-6xl mx-auto px-6 py-28 md:py-36 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
            
            <div className="space-y-6 max-w-2xl text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/50 backdrop-blur-sm text-amber-400 text-sm font-semibold border border-slate-700/50">
                <Briefcase className="h-4 w-4" /> For Professionals
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                Stay Independent.<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Grow Your Business.</span>
              </h2>
              <p className="text-xl text-slate-400 font-light">
                List your skills on our marketplace to get discovered by nearby customers. You are in full control—negotiate directly and run your business your way.
              </p>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto mt-8 md:mt-0">
              <Button 
                onClick={() => {
  // If testing locally, go to pro.localhost. If in production, go to pro.servnect.in
  const isLocal = window.location.hostname.includes('localhost');
  window.location.href = isLocal 
    ? 'http://pro.localhost:5173' 
    : 'https://pro.servnect.in';
}} 
                className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-lg font-bold px-10 py-8 rounded-2xl transition-all duration-300 shadow-[0_0_40px_rgba(245,158,11,0.25)] hover:shadow-[0_0_60px_rgba(245,158,11,0.4)] hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 border border-amber-300/50"
              >
                Apply as a Partner
                <ArrowRight className="h-6 w-6" />
              </Button>
            </div>
            
          </div>
        </FadeInOnScroll>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={scrollToTop}>
            <Wrench className="h-5 w-5 text-slate-500 hover:text-white transition-colors" />
            <span className="text-xl font-bold text-white">ServNect</span>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} ServNect. All rights reserved.
          </div>
        </div>
      </footer>

      {/* --- FLOATING BACK TO TOP BUTTON --- */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="fixed bottom-8 right-8 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/30 z-50 animate-in fade-in zoom-in duration-300 hover:-translate-y-1 transition-all"
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}

    </div>
  );
}