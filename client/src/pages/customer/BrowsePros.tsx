import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, Search, MapPin, Star, Briefcase, 
  SlidersHorizontal, CheckCircle2, AlertCircle, MapPinned, Eye
} from "lucide-react";

import { calculateDistance, parseTravelRadius } from '@/lib/distance';

export default function BrowsePros() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // App states
  const [pros, setPros] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Geolocation states
  const [customerLocation, setCustomerLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [maxRadius, setMaxRadius] = useState<number>(100); // Dynamic radius selector slider
  const [showAllNationwide, setShowAllNationwide] = useState(false);

  // Filter states (Pre-fill category from URL if clicked from home screen)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'All');

  useEffect(() => {
    // Attempt automatic geolocation grab on mount
    grabLocation();
    fetchPlatformData();
  }, []);

  const grabLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCustomerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  const fetchPlatformData = async () => {
    setIsLoading(true);
    
    // Fetch all active categories
    const { data: catData } = await supabase
      .from('service_categories')
      .select('name')
      .eq('is_active', true);
    if (catData) setCategories(catData);

    // Fetch professionals
    const { data: proData } = await supabase
      .from('professionals')
      .select('*, reviews(rating), bookings(status)');
      
    if (proData) {
      const enriched = proData.map((pro: any) => {
        const reviews = pro.reviews || [];
        const avgRating = reviews.length > 0 
          ? (reviews.reduce((acc: any, curr: any) => acc + curr.rating, 0) / reviews.length).toFixed(1) 
          : 'New';
        const completedJobs = (pro.bookings || []).filter((b: any) => b.status === 'completed').length;
        return { ...pro, avgRating, reviewCount: reviews.length, completedJobs };
      });
      setPros(enriched);
    }
    setIsLoading(false);
  };

  // --- DISTANCE TRANSFORMATION PIPELINE ---
  const processedPros = pros.map(pro => {
    let closestDistance = Infinity;

    if (customerLocation && pro.service_locations && pro.service_locations.length > 0) {
      pro.service_locations.forEach((loc: any) => {
        const dist = calculateDistance(customerLocation.lat, customerLocation.lng, loc.lat, loc.lng);
        if (dist < closestDistance) closestDistance = dist;
      });
    }

    return {
      ...pro,
      distanceFromCustomer: closestDistance,
      maxTravel: parseTravelRadius(pro.travel_radius)
    };
  });

  // Filter professionals sequentially
  const finalFilteredPros = processedPros.filter(pro => {
    const matchesSearch = pro.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pro.category?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || pro.category === selectedCategory;

    // Radius boundary logic setup
    const isWithinRadiusBoundary = customerLocation && pro.distanceFromCustomer !== Infinity
      ? pro.distanceFromCustomer <= maxRadius
      : true;

    if (showAllNationwide) return matchesSearch && matchesCategory; // Ignore geography constraint
    return matchesSearch && matchesCategory && isWithinRadiusBoundary;
  }).sort((a, b) => {
    if (customerLocation && !showAllNationwide && a.distanceFromCustomer !== b.distanceFromCustomer) {
      return a.distanceFromCustomer - b.distanceFromCustomer;
    }
    return (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0);
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">
      
      {/* HEADER UTILITY BAR */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/home')} className="rounded-full hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Find Local Professionals</h1>
            <p className="text-xs text-slate-500">Scanning regional hubs within {maxRadius} km</p>
          </div>
          <Button 
            onClick={grabLocation} 
            disabled={isLocating}
            variant="outline" 
            className="text-xs font-bold border-slate-200 hover:bg-slate-50 h-9 rounded-xl text-blue-600 shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 mr-1" />
            {isLocating ? "Syncing..." : customerLocation ? "Location Synced" : "Track Location"}
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* SIDEBAR: CONTROLS & FILTER MODULE */}
        <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-3xl p-5 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-3">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h3>Filter Criteria</h3>
          </div>

          {/* Search Input Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Search Keyword</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Name or service type..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-50 border-slate-200 rounded-xl h-10 text-sm"
              />
            </div>
          </div>

          {/* Dropdown Category Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skill Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full h-10 px-3 text-sm rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Classifications</option>
              {categories.map(c => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Dynamic Radius Range Slider Control */}
          {customerLocation && !showAllNationwide && (
            <div className="space-y-2 animate-in fade-in duration-300">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Distance Range</span>
                <span className="text-blue-600 font-extrabold normal-case text-sm">{maxRadius} km</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={maxRadius}
                onChange={(e) => setMaxRadius(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>5km</span>
                <span>50km</span>
                <span>100km</span>
              </div>
            </div>
          )}

          {/* Fallback View Mode Toggle Box */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Nationwide Mode</p>
              <p className="text-[11px] text-slate-400">Bypass distance limitations</p>
            </div>
            <input 
              type="checkbox" 
              checked={showAllNationwide}
              onChange={(e) => setShowAllNationwide(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer accent-blue-600"
            />
          </div>
        </div>

        {/* RIGHT COLUMN: CORE PROFESSIONALS CARD FEED */}
        <div className="lg:col-span-3 space-y-4">
          {isLoading ? (
            <div className="text-center py-20 text-slate-400 font-medium">Querying local nodes...</div>
          ) : finalFilteredPros.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 max-w-xl mx-auto space-y-4 shadow-sm">
              <MapPinned className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No professionals found within limits</h3>
              <p className="text-slate-500 text-sm">There are currently no matching active service partners loaded inside this localized radius boundary.</p>
              {!showAllNationwide && (
                <Button onClick={() => setShowAllNationwide(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  <Eye className="w-4 h-4 mr-2" /> View All Nationwide Pros
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {finalFilteredPros.map((pro) => (
                <Card key={pro.id} className="bg-white border-slate-200/70 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between">
                  <CardContent className="p-5 space-y-4">
                    
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <Avatar className="h-12 w-12 border shadow-sm">
                          <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-md">
                            {pro.full_name?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-bold text-slate-900 flex items-center gap-1">
                            {pro.full_name}
                            {(pro.is_verified || pro.verified) && <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50" />}
                          </h4>
                          <p className="text-xs font-semibold text-blue-600">{pro.category}</p>
                        </div>
                      </div>
                      {pro.is_online && <span className="h-2.5 w-2.5 rounded-full bg-green-500 ring-4 ring-green-100 block"></span>}
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {pro.avgRating} ({pro.reviewCount})
                      </span>
                      <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {pro.completedJobs} completed jobs
                      </span>
                      
                      {/* DISTANCE ACCELERATION INDICATOR */}
                      {customerLocation && pro.distanceFromCustomer !== Infinity && (
                        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold">
                          <MapPin className="w-3.5 h-3.5" /> {pro.distanceFromCustomer.toFixed(1)} km away
                        </span>
                      )}
                    </div>

                    {customerLocation && pro.distanceFromCustomer > pro.maxTravel && (
                      <div className="p-2 text-[11px] bg-amber-50 border border-amber-100 text-amber-700 rounded-lg flex items-center gap-1.5 font-medium leading-none">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Outside regular dispatch radius. Travel adjustments may apply.</span>
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <Button onClick={() => navigate(`/pro/${pro.id}`)} className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs">
                        View Full Profile
                      </Button>
                    </div>

                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}