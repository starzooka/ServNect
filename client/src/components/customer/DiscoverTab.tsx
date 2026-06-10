import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// 1. Import only the UI icons needed for this specific page
import { Search, MapPin, Briefcase, Star, MapPinned, CheckCircle2 } from "lucide-react";

// 2. Import the shared icon dictionary!
import { ICON_MAP } from '@/lib/iconMap';

export default function DiscoverTab({ 
  firstName, 
  searchQuery, 
  setSearchQuery, 
  locationEnabled, 
  requestLocation, 
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

        {!locationEnabled && (
          <div className="inline-flex items-center gap-2 p-2 px-4 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
            <MapPin className="w-4 h-4" /> 
            Location off. 
            <button onClick={requestLocation} className="underline font-bold hover:text-amber-800">Enable to find pros near you</button>
          </div>
        )}
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
            // Dynamically select the icon based on the database string
            const IconCmp = ICON_MAP[cat.icon_name] || Briefcase;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
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

      {/* --- PROFESSIONALS LIST --- */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          {activeCategory ? `Pros offering ${activeCategory}` : 'Top Rated Professionals'}
        </h2>
        
        {filteredPros.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed">
            <MapPinned className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No professionals found</h3>
            <p className="text-slate-500">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPros.map((pro: any) => (
              <div key={pro.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
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
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                  <div className="flex items-center gap-1 font-medium">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-slate-900">{pro.avgRating}</span>
                    <span className="text-slate-400">({pro.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>{pro.completedJobs} jobs</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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