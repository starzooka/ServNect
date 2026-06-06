import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, Search, X } from "lucide-react";

const POPULAR_CATEGORIES = [
  "Plumbing", "Electrician", "Carpentry", "Appliance Repair", 
  "AC Service & Repair", "Deep Cleaning", "Sofa Cleaning", "Pest Control",
  "Home Tech Support", "Furniture Assembly", "Dog Walking", "Personal Trainer"
];

// Load the 'places' library outside the component to prevent infinite re-renders
const libraries: ("places")[] = ['places'];

export default function ProOnboarding() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [authData, setAuthData] = useState({ full_name: '', email: '', phone: '' });

  // Google Maps Load Script
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  // Category State
  const [categoryInput, setCategoryInput] = useState('');
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  
  // Location State
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [autocompleteInput, setAutocompleteInput] = useState('');

  const [formData, setFormData] = useState({
    categories: [] as string[],
    experience: '',
    bio: '',
    service_locations: [] as { city: string, lat: number, lng: number }[]
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
      } else {
        setUserId(user.id);
        // Clean up existing phone if it has +91 so it formats nicely in the new input
        const rawPhone = user.user_metadata?.phone || '';
        const cleanPhone = rawPhone.replace(/^\+91/, '').trim();
        
        setAuthData({
          full_name: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: cleanPhone
        });
      }
    };
    checkAuth();
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Category Logic
  const filteredCategories = POPULAR_CATEGORIES.filter(c => 
    c.toLowerCase().includes(categoryInput.toLowerCase()) && !formData.categories.includes(c)
  );

  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !formData.categories.includes(trimmed)) {
      setFormData(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    }
    setCategoryInput('');
    setShowCategorySuggestions(false);
  };

  const removeCategory = (e: React.MouseEvent, catToRemove: string) => {
    e.stopPropagation();
    setFormData(prev => ({ ...prev, categories: prev.categories.filter(c => c !== catToRemove) }));
  };

  // Google Maps Place Selected Logic
  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        // Extract the city name from address components
        let cityName = place.name || autocompleteInput;
        place.address_components?.forEach(component => {
          if (component.types.includes('locality')) {
            cityName = component.long_name;
          }
        });

        // Check if city already added
        if (!formData.service_locations.find(loc => loc.city === cityName)) {
          setFormData(prev => ({ 
            ...prev, 
            service_locations: [...prev.service_locations, { city: cityName, lat, lng }] 
          }));
        }
        
        setAutocompleteInput('');
      }
    }
  };

  const removeLocation = (e: React.MouseEvent, cityToRemove: string) => {
    e.stopPropagation();
    setFormData(prev => ({ 
      ...prev, 
      service_locations: prev.service_locations.filter(loc => loc.city !== cityToRemove) 
    }));
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1 && formData.categories.length === 0) return setErrorMsg("Please add at least one service.");
    if (step === 2 && formData.service_locations.length === 0) return setErrorMsg("Please add at least one operating location.");
    setStep(step + 1);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsLoading(true);
    setErrorMsg(null);

    // --- STRICT INDIAN PHONE NUMBER VALIDATION ---
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(authData.phone)) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
      setIsLoading(false);
      return;
    }
    const finalPhone = `+91${authData.phone}`;

    const cityString = formData.service_locations.map(loc => loc.city).join(', ');

    try {
      // CHANGED: We now use .upsert() instead of .insert() to prevent primary key crashes!
      const { error } = await supabase.from('professionals').upsert([
        {
          id: userId,
          full_name: authData.full_name,
          email: authData.email,
          phone: finalPhone,
          category: formData.categories.join(', '),
          experience: formData.experience,
          bio: formData.bio,
          city: cityString, 
          service_locations: formData.service_locations, 
          is_verified: false,
          is_online: true
        }
      ]);

      if (error) throw error;
      navigate('/dashboard');
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to save profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading Maps...</div>;

  return (
    <div className="min-h-screen flex flex-col items-center pt-20 pb-64 px-4 relative overflow-visible bg-slate-950 text-slate-300">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob bg-amber-600"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000 bg-orange-600"></div>

      <div className="w-full max-w-xl z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Complete your profile</h1>
          <p className="text-slate-400 text-lg">Let customers know what you do and where you work.</p>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl overflow-visible">
          <CardHeader className="border-b border-slate-800/50 pb-6">
            <div className="flex justify-between items-center mb-2">
              <CardTitle className="text-2xl text-white">
                {step === 1 && "What services do you offer?"}
                {step === 2 && "Where do you work?"}
                {step === 3 && "Tell us about yourself"}
              </CardTitle>
              <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/10">Step {step} of 3</Badge>
            </div>
            <CardDescription className="text-slate-400 text-base">
              {step === 1 && "Add the categories of work you specialize in."}
              {step === 2 && "Search and add your operating neighborhoods."}
              {step === 3 && "Add some details to build trust with customers."}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 overflow-visible">
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            {/* STEP 1: SERVICES */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-3 relative">
                  <Label className="text-slate-300">Search Services</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input 
                      placeholder="e.g. Plumbing, Dog Walking..." 
                      className="pl-10 bg-slate-950/50 border-slate-800 focus-visible:ring-amber-500"
                      value={categoryInput}
                      onChange={(e) => {
                        setCategoryInput(e.target.value);
                        setShowCategorySuggestions(true);
                      }}
                      onFocus={() => setShowCategorySuggestions(true)}
                    />
                    
                    {showCategorySuggestions && categoryInput && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map(cat => (
                            <button key={cat} type="button" onClick={() => addCategory(cat)} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:bg-slate-700 transition-colors border-b border-slate-700/50 last:border-0">
                              {cat}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-500">
                            Press Enter to add "{categoryInput}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300"
                    onClick={() => addCategory(categoryInput)}
                    disabled={!categoryInput.trim()}
                  >
                    Add Custom Service
                  </Button>
                </div>

                {!categoryInput && (
                  <div className="space-y-2">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider">Popular Services</Label>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_CATEGORIES.filter(c => !formData.categories.includes(c)).slice(0, 8).map(cat => (
                        <button key={cat} type="button" onClick={() => addCategory(cat)} className="px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-sm hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/50 transition-all">
                          + {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {formData.categories.length > 0 && (
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider mb-3 block">Your Services</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.categories.map(cat => (
                        <Badge key={cat} className="bg-amber-500/20 text-amber-400 border-amber-500/30 pl-3 pr-2 py-1.5 flex items-center gap-2 hover:bg-amber-500/30">
                          {cat}
                          <button type="button" onClick={(e) => removeCategory(e, cat)} className="hover:bg-amber-500/40 rounded-full p-0.5 transition-colors">
                            <X className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button onClick={handleNextStep} className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 text-lg font-medium">Continue</Button>
              </div>
            )}

            {/* STEP 2: MULTI-CITY SELECTION */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-3 relative">
                  <Label className="text-slate-300">Search Operating Locations</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
                    
                    <Autocomplete
                      onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                      onPlaceChanged={handlePlaceChanged}
                      options={{ componentRestrictions: { country: 'in' } }}
                    >
                      <Input 
                        placeholder="Search for a city or neighborhood..." 
                        className="pl-10 bg-slate-950/50 border-slate-800 focus-visible:ring-amber-500 w-full"
                        value={autocompleteInput}
                        onChange={(e) => setAutocompleteInput(e.target.value)}
                      />
                    </Autocomplete>
                  </div>
                  <p className="text-xs text-slate-500">Google Places will automatically fetch exact GPS coordinates for accuracy.</p>
                </div>

                {formData.service_locations.length > 0 && (
                  <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                    <Label className="text-slate-400 text-xs uppercase tracking-wider mb-3 block">Your Service Areas</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.service_locations.map(loc => (
                        <Badge key={loc.city} className="bg-blue-500/20 text-blue-400 border-blue-500/30 pl-3 pr-2 py-1.5 flex items-center gap-2 hover:bg-blue-500/30">
                          <MapPin className="w-3 h-3" />
                          {loc.city}
                          <button type="button" onClick={(e) => removeLocation(e, loc.city)} className="hover:bg-blue-500/40 rounded-full p-0.5 transition-colors">
                            <X className="w-3 h-3 cursor-pointer opacity-70 hover:opacity-100" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="w-1/3 border-slate-700 text-slate-300 hover:bg-slate-800 h-12">Back</Button>
                  <Button onClick={handleNextStep} className="w-2/3 bg-amber-600 hover:bg-amber-700 text-white h-12 text-lg font-medium">Continue</Button>
                </div>
              </div>
            )}

            {/* STEP 3: EXPERIENCE, BIO & PHONE NUMBER */}
            {step === 3 && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                
                <div className="space-y-3">
                  <Label className="text-slate-300">Contact Number</Label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 font-medium text-slate-400 pointer-events-none">
                      +91
                    </div>
                    <Input 
                      type="tel" 
                      maxLength={10}
                      placeholder="98765 43210" 
                      className="pl-12 bg-slate-950/50 border-slate-800 focus-visible:ring-amber-500 tracking-wide font-medium"
                      value={authData.phone} 
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '');
                        setAuthData(prev => ({ ...prev, phone: digitsOnly }));
                      }}
                      required 
                    />
                  </div>
                  <p className="text-xs text-slate-500">Only valid 10-digit Indian numbers are accepted.</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300">Years of Experience</Label>
                  <Input 
                    type="text" 
                    name="experience" 
                    placeholder="e.g. 5 Years" 
                    className="bg-slate-950/50 border-slate-800 focus-visible:ring-amber-500"
                    value={formData.experience} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300">Bio & Skills</Label>
                  <textarea 
                    name="bio" 
                    placeholder="Describe your expertise, past work, and what makes you reliable..." 
                    className="w-full flex min-h-[120px] rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-slate-300"
                    value={formData.bio} 
                    onChange={handleChange} 
                    required 
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="w-1/3 border-slate-700 text-slate-300 hover:bg-slate-800 h-12">Back</Button>
                  <Button type="submit" disabled={isLoading} className="w-2/3 bg-amber-600 hover:bg-amber-700 text-white h-12 text-lg font-medium">
                    {isLoading ? "Saving..." : "Complete Setup"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}