import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, Search, X, ChevronRight } from "lucide-react";

const RADIUS_OPTIONS = ["5 km", "10 km", "20 km", "Citywide"];

// Load the 'places' library safely outside the component
const libraries: ("places")[] = ['places'];

export default function ProOnboarding() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [authData, setAuthData] = useState({ full_name: '', email: '', phone: '' });

  // --- DYNAMIC PLATFORM CATEGORIES ---
  const [platformCategories, setPlatformCategories] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');

  const [formData, setFormData] = useState({
    categories: [] as string[],
    experience: '',
    bio: '',
    city: '',
    lat: 0,
    lng: 0,
    travel_radius: '10 km'
  });

  // Google Maps Load Script
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [autocompleteInput, setAutocompleteInput] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      setUserId(user.id);
      setAuthData({
        full_name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || ''
      });

      // --- FETCH DYNAMIC CATEGORIES ---
      // This pulls the live list of active services you created in the Admin Dashboard
      const { data: catData, error } = await supabase
        .from('service_categories')
        .select('name')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (!error && catData) {
        setPlatformCategories(catData.map(c => c.name));
      }
    };
    checkSession();
  }, [navigate]);

  // --- DYNAMIC SUGGESTIONS FILTER ---
  const filteredCategories = platformCategories.filter(c => 
    c.toLowerCase().includes(categoryInput.toLowerCase()) && !formData.categories.includes(c)
  );

  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !formData.categories.includes(trimmed)) {
      setFormData(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    }
    setCategoryInput(''); 
    setShowSuggestions(false);
  };

  const removeCategory = (catToRemove: string) => {
    setFormData(prev => ({ ...prev, categories: prev.categories.filter(c => c !== catToRemove) }));
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        
        let cityName = place.name || autocompleteInput;
        place.address_components?.forEach(component => {
          if (component.types.includes('locality')) {
            cityName = component.long_name;
          }
        });

        setFormData(prev => ({ ...prev, city: cityName, lat, lng }));
        setAutocompleteInput(cityName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!formData.city || formData.lat === 0) {
      return setErrorMsg("Please select a valid city from the Google Maps suggestions.");
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Build the JSONB array for the database
      const service_locations = [{
        city: formData.city,
        lat: formData.lat,
        lng: formData.lng
      }];

      const { error } = await supabase
        .from('professionals')
        .update({
          category: formData.categories.join(', '),
          experience: formData.experience,
          bio: formData.bio,
          city: formData.city,
          service_locations: service_locations,
          travel_radius: formData.travel_radius,
          onboarding_completed: true
        })
        .eq('id', userId);

      if (error) throw error;

      navigate('/dashboard');
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">Loading maps...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-8">
        
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white tracking-tight">Complete your profile</h1>
          <p className="text-slate-400">Welcome, {authData.full_name}! Let's set up your business.</p>
        </div>

        {errorMsg && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm">{errorMsg}</p>
          </div>
        )}

        <Card className="border-slate-800 bg-slate-900 shadow-xl overflow-visible">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-500">Step {step} of 2</Badge>
              <span className="text-sm text-slate-500 font-medium">
                {step === 1 ? 'Services & Expertise' : 'Service Area'}
              </span>
            </div>
            <CardTitle className="text-xl text-white">
              {step === 1 ? 'What services do you offer?' : 'Where do you work?'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {step === 1 ? 'Select all categories that apply to your skills.' : 'Help local customers find you.'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="overflow-visible">
            
            {/* STEP 1: SERVICES & EXPERIENCE */}
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); if (formData.categories.length > 0) setStep(2); }} className="space-y-6 overflow-visible">
                
                <div className="space-y-3 relative overflow-visible">
                  <Label className="text-slate-300">Selected Services</Label>
                  
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

                  <div className="relative flex items-center w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                    <Input 
                      value={categoryInput} 
                      onChange={(e) => { setCategoryInput(e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)} 
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(categoryInput); } }}
                      placeholder="Type to search services..." 
                      className="w-full pl-10 h-12 pr-24 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500" 
                    />
                    <Button type="button" size="sm" onClick={() => addCategory(categoryInput)} className="absolute right-1.5 h-9 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold">
                      Add
                    </Button>
                  </div>

                  {/* DYNAMIC SUGGESTIONS DROPDOWN */}
                  {showSuggestions && categoryInput && filteredCategories.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 rounded-xl shadow-xl max-h-48 overflow-y-auto border bg-slate-800 border-slate-700">
                      {filteredCategories.map(cat => (
                        <div key={cat} onMouseDown={() => addCategory(cat)} className="p-3 text-sm cursor-pointer transition-colors text-slate-300 hover:bg-slate-700 hover:text-white border-b border-slate-700/50 last:border-0">
                          {cat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300">Years of Experience</Label>
                  <Input 
                    placeholder="e.g. 5 Years" 
                    className="h-12 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                    value={formData.experience} 
                    onChange={(e) => setFormData({...formData, experience: e.target.value})} 
                    required 
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300">Professional Bio</Label>
                  <textarea 
                    placeholder="Describe your expertise, past work, and what makes you reliable..." 
                    className="w-full min-h-[120px] rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-white resize-none"
                    value={formData.bio} 
                    onChange={(e) => setFormData({...formData, bio: e.target.value})} 
                    required 
                  />
                </div>

                <Button type="submit" disabled={formData.categories.length === 0} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 h-12 text-lg font-bold">
                  Continue <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </form>
            )}

            {/* STEP 2: SERVICE AREA */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-6 overflow-visible">
                
                <div className="space-y-3 relative overflow-visible w-full">
                  <Label className="text-slate-300">Base City / Neighborhood</Label>
                  <div className="relative flex items-center w-full">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 z-10" />
                    <div className="w-full">
                      <Autocomplete
                        onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                        onPlaceChanged={handlePlaceChanged}
                        options={{ componentRestrictions: { country: 'in' } }}
                      >
                        <Input 
                          placeholder="Search for your city via Google Places..." 
                          className="pl-10 h-12 w-full bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                          value={autocompleteInput}
                          onChange={(e) => setAutocompleteInput(e.target.value)}
                          required
                        />
                      </Autocomplete>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-slate-300">How far are you willing to travel?</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {RADIUS_OPTIONS.map((radius) => (
                      <div 
                        key={radius}
                        onClick={() => setFormData({...formData, travel_radius: radius})}
                        className={`flex items-center justify-center h-12 rounded-xl border cursor-pointer transition-all font-medium text-sm ${
                          formData.travel_radius === radius 
                            ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        {radius}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-12">
                    Back
                  </Button>
                  <Button type="submit" disabled={isLoading || !formData.city} className="w-2/3 bg-amber-500 hover:bg-amber-600 text-slate-950 h-12 text-lg font-bold">
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