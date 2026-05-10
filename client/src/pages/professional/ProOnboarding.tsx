import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, Search, X } from "lucide-react";

const SUGGESTED_CATEGORIES = ["AC Service & Repair", "Appliance Repair", "Electrical Engineer", "Electrician", "Deep Cleaning", "Plumbing", "Carpentry"];
const RADIUS_OPTIONS = ["5 km", "10 km", "20 km", "Citywide"];

export default function ProOnboarding() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [authData, setAuthData] = useState({ full_name: '', email: '', phone: '' });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');

  const [formData, setFormData] = useState({
    categories: [] as string[],
    experience: '', rate: '', bio: '', city: '', radius: '10 km'
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        setUserId(user.id);
        setAuthData({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || ''
        });
      }
    };
    checkAuth();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const setRadius = (rad: string) => setFormData({ ...formData, radius: rad });

  const filteredCategories = SUGGESTED_CATEGORIES.filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()) && !formData.categories.includes(c));

  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !formData.categories.includes(trimmed)) setFormData(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    setCategoryInput('');
    setShowSuggestions(false);
  };
  const removeCategory = (catToRemove: string) => setFormData(prev => ({ ...prev, categories: prev.categories.filter(c => c !== catToRemove) }));

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1 && (formData.categories.length === 0 || !formData.rate)) return setErrorMsg("Please add at least one service and your hourly rate.");
    setStep(2);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.from('professionals').upsert({
        id: userId,
        full_name: authData.full_name,
        email: authData.email,
        phone: authData.phone,
        category: formData.categories.join(', '),
        experience: formData.experience, 
        hourly_rate: formData.rate, 
        bio: formData.bio, 
        city: formData.city, 
        service_radius: formData.radius
      });

      if (error) throw error;
      navigate('/dashboard', { replace: true });

    } catch (error: any) {
      setErrorMsg(error.message);
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-64 px-4 relative overflow-x-hidden bg-slate-950 text-slate-300">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob bg-amber-600"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000 bg-orange-600"></div>

      <div className="w-full max-w-xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <button onClick={handleLogout} className="absolute -top-12 right-0 text-sm font-medium text-slate-500 hover:text-slate-300 transition-colors">
          Log out
        </button>

        {/* EXPLICIT OVERFLOW-VISIBLE OVERRIDE */}
        <Card className="bg-slate-900/95 border-slate-800 shadow-xl shadow-amber-900/10 backdrop-blur-xl mt-8 overflow-visible">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white">Complete Your Account</CardTitle>
            <CardDescription className="text-slate-400">
              {step === 1 ? "Step 1 of 2: Your Business Details" : "Step 2 of 2: Your Service Area"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="overflow-visible">
            {errorMsg && (
              <div className="mb-6 p-3 rounded-lg flex items-start gap-2 text-sm animate-in fade-in bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /><span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleUpdateProfile} className="space-y-5">
              
              {/* --- STEP 1: SERVICES --- */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-3 relative overflow-visible">
                    <Label className="font-medium text-slate-300">Service Categories</Label>
                    
                    {formData.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.categories.map(cat => (
                          <Badge key={cat} variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-500 border-amber-500/20">
                            {cat} 
                            <button type="button" onClick={() => removeCategory(cat)} className="hover:text-red-400 transition-colors focus:outline-none ml-1">
                              <X className="w-3.5 h-3.5 cursor-pointer" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="relative flex items-center">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <Input 
                        value={categoryInput} onChange={(e) => { setCategoryInput(e.target.value); setShowSuggestions(true); }}
                        onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(categoryInput); } }}
                        placeholder="Type a service and press Enter..." autoComplete="off"
                        className="pl-10 h-11 pr-24 bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500" 
                      />
                      <Button type="button" size="sm" onClick={() => addCategory(categoryInput)} className="absolute right-1.5 h-8 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950">Add</Button>
                    </div>

                    {showSuggestions && categoryInput && filteredCategories.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 rounded-xl shadow-xl max-h-48 overflow-y-auto border bg-slate-900 border-slate-800">
                        {filteredCategories.map(cat => (
                          <div key={cat} onClick={() => addCategory(cat)} className="p-3 text-sm cursor-pointer transition-colors text-slate-300 hover:bg-slate-800 hover:text-white">{cat}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-medium text-slate-300">Experience</Label>
                      <Input name="experience" value={formData.experience} onChange={handleChange} placeholder="e.g. 5 Years" className="h-11 bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium text-slate-300">Hourly Rate (₹)</Label>
                      <Input name="rate" type="number" value={formData.rate} onChange={handleChange} placeholder="e.g. 500" required className="h-11 bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* --- STEP 2: LOCATION --- */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-2">
                    <Label className="font-medium text-slate-300">Base City / Region</Label>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <Input name="city" value={formData.city} onChange={handleChange} placeholder="e.g. Mumbai" required className="pl-10 h-11 bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="font-medium text-slate-300">Service Radius</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {RADIUS_OPTIONS.map(rad => (
                        <button key={rad} type="button" onClick={() => setRadius(rad)} className={`px-3 py-3 rounded-xl text-sm font-medium border transition-all ${formData.radius === rad ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm' : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'}`}>
                          {rad}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 flex gap-3">
                {step === 2 && <Button type="button" variant="outline" onClick={() => setStep(1)} className="h-12 px-6 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">Back</Button>}
                <Button type="submit" disabled={isLoading} className="w-full h-12 text-base font-semibold transition-transform active:scale-95 bg-amber-500 hover:bg-amber-600 text-slate-950">
                  {isLoading ? "Saving..." : step === 1 ? "Next Step" : "Go to Dashboard"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}