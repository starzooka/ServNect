import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Import UI icons needed for this specific page layout
import { Search, MapPin, Briefcase, Star, MapPinned, CheckCircle2, AlertCircle } from "lucide-react";

// Import the shared icon dictionary
import { ICON_MAP } from '@/lib/iconMap';

export default function DiscoverTab({ 
  firstName, 
  searchQuery, 
  setSearchQuery, 
  locationEnabled, 
  requestLocation, 
  isLocating,
  customerLocation,
  closestProDistance,
  ignoreDistanceFilter,
  setIgnoreDistanceFilter,
  activeCategory, 
  setActiveCategory, 
  filteredPros, 
  setSelectedPro, 
  availableCategories 
}: any) {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- HERO SEARCH SECTION --- */}
      <div className="text-center max-w-2xl mx-auto space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
          Good morning{firstName ? `, ${firstName}` : ''}! <br/>
          <span className="text-blue-600">What do you need help with?</span>
        </h1>
        
        <div className="relative max-w-xl mx-auto shadow-sm">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            type="text" 
            placeholder="Search for a service or professional..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-14 rounded-2xl text-lg border-slate-200 bg-white focus-visible:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Dynamic Location Notice Banners */}
        <div className="flex flex-col items-center gap-2">
          {!locationEnabled && (
            <div className="inline-flex items-center gap-2 p-2 px-4 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
              <MapPin className="w-4 h-4" /> 
              Location off. 
              <button 
                onClick={requestLocation} 
                disabled={isLocating}
                className="underline font-bold hover:text-amber-800 disabled:opacity-50"
              >
                {isLocating ? 'Locating...' : 'Enable to find pros near you'}
              </button>
            </div>
          )}

          {locationEnabled && !ignoreDistanceFilter && closestProDistance > 20 && closestProDistance <= 100 && (
            <div className="inline-flex items-center gap-2 p-3 px-5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium animate-in slide-in-from-top-2">
              <MapPinned className="w-4 h-4" />
              Adjusted search radius up to {Math.ceil(closestProDistance + 5)}km to catch available workers.
            </div>
          )}
        </div>
      </div>

      {/* --- DYNAMIC CATEGORIES GRID --- */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Popular Services</h2>
          {activeCategory && (
            <button onClick={() => setActiveCategory(null)} className="text-sm font-bold text-blue-600 hover:text-blue-800">
              Clear Filter
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {availableCategories.map((cat: any) => {
            const IconCmp = ICON_MAP[cat.icon_name] || Briefcase;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  const targetCat = activeCategory === cat.name ? null : cat.name;
                  setActiveCategory(targetCat);
                }}
                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-200
                  ${activeCategory === cat.name 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
              >
                <div className={`p-4 rounded-full ${activeCategory === cat.name ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                  <IconCmp className="w-8 h-8" />
                </div>
                <span className="font-semibold text-sm text-center">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- REGIONAL MAP ACTION BANNER LINK --- */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm text-left">
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <MapPinned className="w-5 h-5 text-blue-600" />
            Browse Professionals
          </h3>
          <p className="text-sm text-slate-500 max-w-xl">
            Can't find a professional down your street? Access our multi-city browse tool to access range sliders and see professionals across the entire district.
          </p>
        </div>
        <Button 
          onClick={() => navigate(activeCategory ? `/browse?category=${activeCategory}` : '/browse')} 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 px-6 rounded-xl shrink-0 shadow-md shadow-blue-600/10 transition-transform active:scale-95"
        >
          Open Advanced Browse Page
        </Button>
      </div>

      {/* --- PROFESSIONALS LIST --- */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {activeCategory ? `Pros offering ${activeCategory}` : 'Top Rated Professionals'}
        </h2>
        
        {filteredPros.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed max-w-xl mx-auto space-y-4 shadow-sm">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
            
            {customerLocation && !ignoreDistanceFilter ? (
              <>
                <h3 className="text-lg font-bold text-slate-900">No pros found within 100km</h3>
                <p className="text-slate-500 text-sm">There are currently no active professional service members loaded inside your regional zone map cutoff bounds.</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                  <Button onClick={() => setIgnoreDistanceFilter(true)} variant="outline" className="border-slate-200 rounded-xl">
                    Force View All Profiles
                  </Button>
                  <Button onClick={() => navigate('/browse')} className="bg-blue-600 text-white rounded-xl">
                    Fine-tune Distance Slider
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-900">No matching pros found</h3>
                <p className="text-slate-500 text-sm">Try resetting your keywords search box, exploring alternative services, or modifying category settings.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPros.map((pro: any) => (
              <div key={pro.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-3">
                      <Avatar className="h-14 w-14 border border-slate-100 shadow-sm">
                        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-lg">
                          {pro.full_name?.[0] || 'P'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-1">
                          {pro.full_name} 
                          {pro.is_verified && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                        </h3>
                        <p className="text-sm font-medium text-blue-600">{pro.category}</p>
                      </div>
                    </div>
                    {pro.is_online && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 mb-6">
                    <div className="flex items-center gap-1 font-medium bg-slate-50 px-2.5 py-1 rounded-md">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-slate-900">{pro.avgRating}</span>
                      <span className="text-slate-400">({pro.reviewCount})</span>
                    </div>
                    <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-md">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      <span>{pro.completedJobs} jobs</span>
                    </div>

                    {/* DYNAMIC REGIONAL HUB DISTANCE BADGE */}
                    {customerLocation && pro.distanceFromCustomer !== Infinity && (
                      <div className="flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{pro.distanceFromCustomer.toFixed(1)} km away</span>
                      </div>
                    )}

                    {/* RADIUS EXCEEDED STANDARD ERROR DISMISSAL WARNING */}
                    {customerLocation && pro.distanceFromCustomer > pro.maxTravel && (
                      <div className="w-full mt-1">
                        <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 block w-fit">
                          Outside standard delivery zone
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-auto">
                  <Button onClick={() => setSelectedPro(pro)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl">Book Now</Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-slate-200 rounded-xl hover:bg-slate-50"
                    onClick={() => navigate(`/pro/${pro.id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}