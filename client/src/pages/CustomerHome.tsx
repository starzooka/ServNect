import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MapPin, Search, Star, Wrench, Settings, LogOut, ShieldCheck, Zap, Droplets, Hammer, Paintbrush, ShieldAlert
} from "lucide-react";

const NEARBY_PROS = [
  { id: 1, name: "Rahul Sharma", service: "Plumbing", rating: 4.9, reviews: 124, rate: "₹450/hr", distance: "1.2 km", verified: true, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul" },
  { id: 2, name: "Amit Patel", service: "Electrical", rating: 4.8, reviews: 89, rate: "₹500/hr", distance: "2.5 km", verified: true, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit" },
  { id: 3, name: "Priya Singh", service: "Deep Cleaning", rating: 5.0, reviews: 210, rate: "₹300/hr", distance: "3.0 km", verified: true, img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
];

const CATEGORIES = [
  { name: "Plumbing", icon: Droplets },
  { name: "Electrical", icon: Zap },
  { name: "Carpentry", icon: Hammer },
  { name: "Painting", icon: Paintbrush },
];

export default function CustomerHome() {
  const navigate = useNavigate();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [userData, setUserData] = useState<{name: string, email: string} | null>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [deletionDates, setDeletionDates] = useState({ scheduledAt: '', deletedOn: '' });

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserData({
          name: user.user_metadata?.full_name || 'Customer',
          email: user.email || ''
        });

        const role = user.user_metadata?.role || 'customer';
        const tableName = role === 'professional' ? 'professionals' : 'customers';

        const { data } = await supabase.from(tableName).select('deletion_scheduled_at').eq('id', user.id).single();
        
        if (data?.deletion_scheduled_at) {
          const startDate = new Date(data.deletion_scheduled_at);
          const startDateOriginal = new Date(startDate);
          startDateOriginal.setDate(startDateOriginal.getDate() - 30); // Show when they requested it

          const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
          
          setDeletionDates({
            scheduledAt: startDateOriginal.toLocaleDateString(undefined, formatOptions),
            deletedOn: startDate.toLocaleDateString(undefined, formatOptions)
          });
          
          setShowRestoreModal(true);
        }
        
      } else {
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleRestoreAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const role = user.user_metadata?.role || 'customer';
      const tableName = role === 'professional' ? 'professionals' : 'customers';
      await supabase.from(tableName).update({ deletion_scheduled_at: null }).eq('id', user.id);
    }
    setShowRestoreModal(false);
  };

  const requestLocation = () => setLocationEnabled(true);
  const firstName = userData?.name ? userData.name.split(' ')[0] : 'there';

  if (showRestoreModal) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Account Pending Deletion</h2>
            <div className="bg-slate-50 text-slate-700 p-4 rounded-xl text-sm leading-relaxed border border-slate-200 mt-4 text-left">
              Your account is currently under deletion since <strong>{deletionDates.scheduledAt}</strong> and will be permanently deleted on <strong>{deletionDates.deletedOn}</strong>.
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <Button onClick={handleRestoreAccount} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold">
              Login and cancel deletion
            </Button>
            <Button onClick={handleLogout} variant="outline" className="w-full border-slate-300 text-slate-700 font-semibold h-12 hover:bg-slate-50">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm"><Wrench className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">ServNect</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-200">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                    {userData?.name ? userData.name[0].toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-slate-900">{userData?.name || 'Loading...'}</p>
                  <p className="text-xs leading-none text-slate-500">{userData?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer text-slate-700 font-medium">
                <Settings className="mr-2 h-4 w-4" /> Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 font-medium">
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Good morning, {firstName}! 👋</h1>
            <p className="text-slate-500 mt-1">What do you need help with today?</p>
          </div>
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input type="text" placeholder="Search for plumbers, electricians, cleaners..." className="pl-10 h-14 rounded-2xl text-lg shadow-sm border-slate-300 focus-visible:ring-blue-600 bg-white text-slate-900" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {!locationEnabled && (
          <Card className="bg-blue-50 border-blue-100 shadow-none">
            <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-blue-900">
                <div className="p-2 bg-blue-100 rounded-full"><MapPin className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="font-semibold">Find professionals near you</p>
                  <p className="text-sm text-blue-700/80">Enable location services for accurate results and faster bookings.</p>
                </div>
              </div>
              <Button onClick={requestLocation} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shrink-0">Enable Location</Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold">Categories</h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat, i) => (
              <button key={i} className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-200 transition-all shrink-0 font-medium text-slate-700">
                <cat.icon className="h-5 w-5 text-blue-600" /> {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recommended Professionals</h2>
            {locationEnabled && <span className="text-sm text-green-600 font-medium flex items-center gap-1"><MapPin className="h-3 w-3"/> Near you</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {NEARBY_PROS.map((pro) => (
              <Card key={pro.id} className="border-slate-200 hover:shadow-lg transition-shadow group cursor-pointer bg-white">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14 border border-slate-100 shadow-sm"><AvatarImage src={pro.img} /><AvatarFallback>{pro.name[0]}</AvatarFallback></Avatar>
                      <div>
                        <h3 className="font-bold text-lg leading-tight flex items-center gap-1 text-slate-900">{pro.name} {pro.verified && <ShieldCheck className="h-4 w-4 text-blue-600" />}</h3>
                        <p className="text-slate-500 text-sm">{pro.service}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-semibold">{pro.rate}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> {pro.rating} <span className="text-amber-700/60 font-normal">({pro.reviews})</span>
                    </div>
                    {locationEnabled ? <span className="text-slate-500 flex items-center gap-1"><MapPin className="h-3 w-3"/> {pro.distance}</span> : null}
                  </div>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-transform active:scale-95">View Profile</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}