import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Search, Star, ShieldCheck, SlidersHorizontal, ChevronDown } from "lucide-react";

const SERVICES = ["All Services", "Plumbing", "Electrician", "Carpentry", "Cleaning"];

export default function DiscoverTab({ 
  firstName, searchQuery, setSearchQuery, locationEnabled, requestLocation, 
  activeCategory, setActiveCategory, filteredPros = [], setSelectedPro 
}: any) {
  
  // NEW: Local state for sorting and pagination
  const [sortBy, setSortBy] = useState('recommended');
  const [visibleCount, setVisibleCount] = useState(6);

  // Apply sorting on top of the parent's filtered data
  let processedPros = [...filteredPros];
  
  if (sortBy === 'rating') {
    processedPros.sort((a, b) => {
      const ratingA = a.avgRating === 'New' ? 0 : parseFloat(a.avgRating);
      const ratingB = b.avgRating === 'New' ? 0 : parseFloat(b.avgRating);
      return ratingB - ratingA;
    });
  } else if (sortBy === 'experience') {
    processedPros.sort((a, b) => (b.completedJobs || 0) - (a.completedJobs || 0));
  }

  // Pagination Logic
  const displayedPros = processedPros.slice(0, visibleCount);
  const hasMore = visibleCount < processedPros.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hey, {firstName || 'there'}! 👋</h1>
          <p className="text-slate-500 mt-1">What do you need help with today?</p>
        </div>
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Search for plumbers, electricians, cleaners..." 
            className="pl-10 h-14 rounded-2xl text-lg shadow-sm border-slate-300 focus-visible:ring-blue-600 bg-white text-slate-900" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      {!locationEnabled && (
        <Card className="bg-blue-50 border-blue-100 shadow-none mt-6">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-blue-900">
              <div className="p-2 bg-blue-100 rounded-full"><MapPin className="h-5 w-5 text-blue-600" /></div>
              <div><p className="font-semibold">Find professionals near you</p><p className="text-sm text-blue-700/80">Enable location services for accurate results and faster bookings.</p></div>
            </div>
            <Button onClick={requestLocation} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0">Enable Location</Button>
          </CardContent>
        </Card>
      )}

      {/* NEW: Filter & Sort Bar */}
      <div className="mt-10 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Professionals
          {locationEnabled && (
            <span className="text-sm text-green-600 font-medium flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
              <MapPin className="h-3 w-3"/> Near you
            </span>
          )}
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Service Filter Dropdown */}
          <div className="relative w-full sm:w-48">
            <select 
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm cursor-pointer"
              value={activeCategory || "All Services"}
              onChange={(e) => {
                setActiveCategory(e.target.value === "All Services" ? null : e.target.value);
                setVisibleCount(6); // Reset pagination on filter change
              }}
            >
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort Dropdown */}
          <div className="relative w-full sm:w-48">
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select 
              className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-9 pr-10 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
      
      {(!displayedPros || displayedPros.length === 0) ? (
        <div className="text-center p-12 border border-dashed border-slate-300 rounded-3xl bg-white text-slate-500">
          <p>No professionals found for your search criteria.</p>
          <Button onClick={() => { setActiveCategory(null); setSearchQuery(''); }} variant="link" className="mt-2 text-blue-600">Clear Filters</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPros.map((pro: any) => (
              <Card key={pro.id} className="border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer bg-white rounded-3xl relative overflow-hidden">
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                  {pro.is_online ? (
                    <Badge className="bg-green-100 text-green-700 border-none shadow-none font-bold text-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" /> Online
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-400 border-slate-200 font-medium text-xs">Offline</Badge>
                  )}
                </div>
                
                <CardContent className="p-6 space-y-5 pt-10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border border-slate-100 shadow-sm">
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-bold text-lg">{pro.full_name?.charAt(0) || 'P'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-lg leading-tight flex items-center gap-1 text-slate-900">
                          {pro.full_name || 'Professional'} {pro.verified && <ShieldCheck className="h-4 w-4 text-blue-600" />}
                        </h3>
                        <p className="text-slate-500 text-sm mt-0.5 font-medium">{pro.category || 'Service'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-100/50 text-sm">
                      <Star className={`h-3.5 w-3.5 ${pro.reviewCount > 0 ? 'fill-amber-500 text-amber-500' : 'fill-amber-200 text-amber-400'}`} /> 
                      {pro.avgRating || 'New'} 
                      {pro.reviewCount > 0 && <span className="text-amber-700/60 font-normal text-xs">({pro.reviewCount})</span>}
                    </div>
                  </div>
                  
                  <Button onClick={() => setSelectedPro(pro)} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-semibold transition-all active:scale-95 h-11 rounded-xl shadow-sm">
                    Request Inspection
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* NEW: Load More Button */}
          {hasMore && (
            <div className="mt-10 text-center">
              <Button 
                onClick={handleLoadMore} 
                variant="outline" 
                className="border-slate-300 text-blue-600 font-bold hover:bg-blue-50 hover:border-blue-200 px-8 h-12 rounded-xl transition-colors"
              >
                Browse More Professionals
              </Button>
            </div>
          )}
        </>
      )}
    </>
  );
}