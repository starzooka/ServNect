import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MapPin, Search, Star, Wrench, Settings, LogOut, ShieldCheck, Zap, Droplets, Hammer, Paintbrush, ShieldAlert, X, Clock, IndianRupee, CalendarDays, CheckCircle2
} from "lucide-react";

const CATEGORIES = [
  { name: "Plumbing", icon: Droplets },
  { name: "Electrician", icon: Zap },
  { name: "Carpentry", icon: Hammer },
  { name: "Cleaning", icon: Paintbrush },
];

export default function CustomerHome() {
  const navigate = useNavigate();
  
  // --- NEW: URL-BASED TAB STATE ---
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'discover';

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };
  
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const [userData, setUserData] = useState<{id: string, name: string, email: string} | null>(null);
  const [pros, setPros] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  
  // Modal States
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deletionDates, setDeletionDates] = useState({ scheduledAt: '', deletedOn: '' });

  // Booking Modal States
  const [selectedPro, setSelectedPro] = useState<any | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ issue: '', time: '', address: '', budget: '' });

  useEffect(() => {
    let realtimeSubscription: any;

    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      setUserData({
        id: user.id,
        name: user.user_metadata?.full_name || 'Customer',
        email: user.email || ''
      });

      // Check deletion status
      const role = user.user_metadata?.role || 'customer';
      const tableName = role === 'professional' ? 'professionals' : 'customers';
      const { data: profileData } = await supabase.from(tableName).select('deletion_scheduled_at').eq('id', user.id).single();
      
      if (profileData?.deletion_scheduled_at) {
        const startDate = new Date(profileData.deletion_scheduled_at);
        const startDateOriginal = new Date(startDate);
        startDateOriginal.setDate(startDateOriginal.getDate() - 30);
        const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        setDeletionDates({ scheduledAt: startDateOriginal.toLocaleDateString(undefined, formatOptions), deletedOn: startDate.toLocaleDateString(undefined, formatOptions) });
        setShowRestoreModal(true);
      }

      fetchProfessionals();
      fetchMyBookings(user.id);

      // --- SUPABASE REALTIME LISTENER FOR CUSTOMER BOOKINGS ---
      realtimeSubscription = supabase
        .channel(`bookings_customer_${Date.now()}`) 
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `customer_id=eq.${user.id}` 
        }, payload => {
          console.log("Booking update received!", payload);
          fetchMyBookings(user.id); 
        })
        .subscribe();
    };

    fetchInitialData();

    return () => {
      if (realtimeSubscription) supabase.removeChannel(realtimeSubscription);
    };
  }, [navigate]);

  const fetchProfessionals = async () => {
    const { data, error } = await supabase.from('professionals').select('*');
    if (!error && data) setPros(data);
  };

  const fetchMyBookings = async (customerId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        professional:professionals(full_name, category)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMyBookings(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleRestoreAccount = async () => {
    if (userData?.id) {
      const { data: { user } } = await supabase.auth.getUser();
      if(user) {
         const role = user.user_metadata?.role || 'customer';
         const tableName = role === 'professional' ? 'professionals' : 'customers';
         await supabase.from(tableName).update({ deletion_scheduled_at: null }).eq('id', user.id);
      }
    }
    setShowRestoreModal(false);
  };

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.id || !selectedPro) return;

    setIsBooking(true);
    
    const { error } = await supabase.from('bookings').insert([{
      customer_id: userData.id,
      professional_id: selectedPro.id,
      customer_name: userData.name,
      service_type: bookingForm.issue,
      scheduled_time: bookingForm.time,
      address: bookingForm.address,
      est_budget: bookingForm.budget,
      status: 'pending'
    }]);

    setIsBooking(false);

    if (error) {
      alert("Failed to send booking request. Please try again.");
    } else {
      setSelectedPro(null);
      setBookingForm({ issue: '', time: '', address: '', budget: '' }); 
      setActiveTab('bookings'); // Instantly changes URL to ?tab=bookings
    }
  };

  const requestLocation = () => setLocationEnabled(true);
  const firstName = userData?.name ? userData.name.split(' ')[0] : 'there';

  const filteredPros = pros.filter(pro => {
    if (!pro.full_name || !pro.category) return false;
    const matchesSearch = pro.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pro.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? pro.category.toLowerCase().includes(activeCategory.toLowerCase()) : true;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0));

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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      
      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4"><LogOut className="w-8 h-8 text-red-600 ml-1" /></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Log Out?</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Are you sure you want to log out of your account?</p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleLogout} className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 text-white transition-all active:scale-95">Yes, Log Out</Button>
              <Button onClick={() => setShowLogoutModal(false)} variant="outline" className="w-full h-12 text-base font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* --- BOOKING MODAL --- */}
      {selectedPro && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button onClick={() => setSelectedPro(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X className="h-5 w-5" /></button>
            
            <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
              <Avatar className="h-14 w-14 border border-slate-100 shadow-sm">
                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{selectedPro.full_name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Book {selectedPro.full_name.split(' ')[0]}</h2>
                <p className="text-sm text-slate-500">{selectedPro.category}</p>
              </div>
            </div>

            <form onSubmit={handleBookService} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">What is the issue?</Label>
                <div className="relative flex items-center">
                  <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input required value={bookingForm.issue} onChange={(e) => setBookingForm({...bookingForm, issue: e.target.value})} placeholder="e.g. Leaking kitchen sink" className="pl-9 h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">When do you need them?</Label>
                <div className="relative flex items-center">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input required value={bookingForm.time} onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})} placeholder="e.g. Today, 4:00 PM" className="pl-9 h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Your Address</Label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input required value={bookingForm.address} onChange={(e) => setBookingForm({...bookingForm, address: e.target.value})} placeholder="e.g. Apt 4B, Green Valley" className="pl-9 h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Estimated Budget (Optional)</Label>
                <div className="relative flex items-center">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={bookingForm.budget} onChange={(e) => setBookingForm({...bookingForm, budget: e.target.value})} placeholder="e.g. ₹500" className="pl-9 h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600" />
                </div>
              </div>

              <Button type="submit" disabled={isBooking} className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 mt-2">
                {isBooking ? "Sending Request..." : "Confirm Booking Request"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* --- TOP NAVIGATION --- */}
      <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm"><Wrench className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">ServNect</span>
          </div>

          <div className="hidden sm:flex bg-slate-100/80 backdrop-blur-sm p-1 rounded-full border border-slate-200 shadow-inner mx-4">
            <button onClick={() => setActiveTab('discover')} className={`px-5 py-2 text-sm font-bold rounded-full transition-all ${activeTab === 'discover' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Discover</button>
            <button onClick={() => setActiveTab('bookings')} className={`px-5 py-2 text-sm font-bold rounded-full transition-all flex items-center gap-2 ${activeTab === 'bookings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
              My Bookings
              {myBookings.some(b => b.status === 'accepted') && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 pl-1.5 pr-4 rounded-full border border-slate-200 hover:bg-slate-50 gap-2.5 transition-all outline-none">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-600 text-white font-bold text-xs">{userData?.name ? userData.name[0].toUpperCase() : 'U'}</AvatarFallback></Avatar>
                <span className="text-sm font-semibold text-slate-700 hidden sm:block">{userData?.name || 'Account'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-2 rounded-2xl border-slate-200 shadow-xl bg-white/95 backdrop-blur-xl mt-1" align="end" forceMount>
              {/* Mobile Only Tab Switchers inside Dropdown */}
              <div className="sm:hidden block">
                 <DropdownMenuItem onClick={() => setActiveTab('discover')} className="font-medium p-3 rounded-xl focus:bg-slate-50 text-slate-700">Find Pros</DropdownMenuItem>
                 <DropdownMenuItem onClick={() => setActiveTab('bookings')} className="font-medium p-3 rounded-xl focus:bg-slate-50 text-slate-700">My Bookings</DropdownMenuItem>
                 <div className="h-px bg-slate-100 my-1 mx-2"></div>
              </div>

              <DropdownMenuItem onClick={() => navigate('/settings')} className="group cursor-pointer text-slate-700 font-medium p-3 rounded-xl focus:bg-slate-50 focus:text-blue-600 transition-colors">
                <Settings className="mr-3 h-4 w-4 text-slate-500 group-focus:text-blue-600 transition-colors" /> Account Settings
              </DropdownMenuItem>
              <div className="h-px bg-slate-100 my-1 mx-2"></div>
              <DropdownMenuItem onClick={() => setShowLogoutModal(true)} className="group cursor-pointer text-red-600 font-medium p-3 rounded-xl focus:bg-red-50 focus:text-red-700 transition-colors">
                <LogOut className="mr-3 h-4 w-4 text-red-600 group-focus:text-red-700 transition-colors" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
        
        {/* --- TAB 1: DISCOVER PROFESSIONALS --- */}
        {activeTab === 'discover' && (
          <>
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
                <button 
                  onClick={() => setActiveCategory(null)} 
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all shrink-0 font-medium ${!activeCategory ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
                >
                  All Services
                </button>
                {CATEGORIES.map((cat, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all shrink-0 font-medium ${activeCategory === cat.name ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'}`}
                  >
                    <cat.icon className={`h-5 w-5 ${activeCategory === cat.name ? 'text-white' : 'text-blue-600'}`} /> {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recommended Professionals</h2>
                {locationEnabled && <span className="text-sm text-green-600 font-medium flex items-center gap-1"><MapPin className="h-3 w-3"/> Near you</span>}
              </div>
              
              {filteredPros.length === 0 ? (
                <div className="text-center p-12 border border-dashed border-slate-300 rounded-3xl bg-white text-slate-500">
                  <p>No professionals found for your search criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPros.map((pro) => (
                    <Card key={pro.id} className="border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer bg-white rounded-3xl relative overflow-hidden">
                      
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        {pro.is_online ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none font-bold text-xs"><span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" /> Online</Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 border-slate-200 font-medium text-xs">Offline</Badge>
                        )}
                      </div>

                      <CardContent className="p-6 space-y-4 pt-10">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border border-slate-100 shadow-sm">
                              <AvatarFallback className="bg-blue-50 text-blue-700 font-bold">{pro.full_name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-bold text-lg leading-tight flex items-center gap-1 text-slate-900">
                                {pro.full_name} {pro.verified && <ShieldCheck className="h-4 w-4 text-blue-600" />}
                              </h3>
                              <p className="text-slate-500 text-sm truncate max-w-[150px]">{pro.category}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 font-medium text-slate-700 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                            <IndianRupee className="h-3.5 w-3.5 text-slate-400" /> {pro.hourly_rate || 'N/A'}/hr
                          </div>
                          <div className="flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-md">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" /> 4.9 <span className="text-amber-700/60 font-normal">(New)</span>
                          </div>
                        </div>
                        
                        <Button onClick={() => setSelectedPro(pro)} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-semibold transition-all active:scale-95 h-11 rounded-xl shadow-sm">
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* --- TAB 2: MY BOOKINGS --- */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Activity</h1>
              <p className="text-slate-500 mt-1">Track the status of your service requests.</p>
            </div>

            {myBookings.length === 0 ? (
              <div className="text-center p-12 border border-dashed border-slate-300 rounded-3xl bg-white text-slate-500">
                <p>You haven't made any booking requests yet.</p>
                <Button onClick={() => setActiveTab('discover')} variant="outline" className="mt-4 border-slate-300 text-blue-600 font-bold hover:bg-slate-50">Browse Professionals</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => {
                  let statusBadge;
                  switch(booking.status) {
                    case 'pending': statusBadge = <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none font-bold"><Clock className="w-3.5 h-3.5 mr-1" /> Pending Pro Approval</Badge>; break;
                    case 'accepted': statusBadge = <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none font-bold"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accepted! Pro is scheduled</Badge>; break;
                    case 'declined': statusBadge = <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none shadow-none font-bold"><X className="w-3.5 h-3.5 mr-1" /> Declined by Pro</Badge>; break;
                    default: statusBadge = <Badge variant="outline">{booking.status}</Badge>;
                  }

                  return (
                    <Card key={booking.id} className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                      <div className={`w-full h-1 ${booking.status === 'accepted' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-amber-400' : 'bg-red-500'}`}></div>
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <div className="mb-3">{statusBadge}</div>
                            <h3 className="font-bold text-lg text-slate-900 leading-tight">{booking.service_type}</h3>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md"><CalendarDays className="w-3.5 h-3.5"/> {booking.scheduled_time}</span>
                              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md"><IndianRupee className="w-3.5 h-3.5"/> {booking.est_budget || 'Not specified'}</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center sm:min-w-[200px]">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Assigned Professional</p>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border border-slate-200 shadow-sm">
                                <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{booking.professional?.full_name[0] || 'P'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-bold text-slate-900 text-sm leading-tight">{booking.professional?.full_name || 'Loading...'}</p>
                                <p className="text-slate-500 text-xs">{booking.professional?.category || 'Professional'}</p>
                              </div>
                            </div>
                            {booking.status === 'accepted' && (
                              <Button className="w-full mt-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold h-9 shadow-none text-sm">Message Pro</Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}