import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Wrench, Settings, LogOut, ShieldAlert, X, Send, Star } from "lucide-react";

// --- IMPORT OUR CUSTOMER COMPONENTS ---
import BookingModal from '@/components/customer/BookingModal';
import DiscoverTab from '@/components/customer/DiscoverTab';
import BookingsTab from '@/components/customer/BookingsTab';

// --- FIXED IMPORT PATH FOR DISTANCE UTILS ---
import { calculateDistance, parseTravelRadius } from '@/lib/distance';

export default function CustomerHome() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'discover';
  const setActiveTab = (tab: string) => setSearchParams({ tab });

  // --- LOCATION STATES ---
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [customerLocation, setCustomerLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [ignoreDistanceFilter, setIgnoreDistanceFilter] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);

  const [userData, setUserData] = useState<any>(null);
  const [pros, setPros] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deletionDates, setDeletionDates] = useState({ scheduledAt: '', deletedOn: '' });

  const [selectedPro, setSelectedPro] = useState<any | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ issue: '', address: '', scheduled_time: '' });

  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);

  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [reviewBooking, setReviewBooking] = useState<any | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // --- GPS LOCATION HANDLER ---
  const handleRequestLocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCustomerLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationEnabled(true);
          setIgnoreDistanceFilter(false); 
          setIsLocating(false);
        },
        () => {
          alert("Location access denied or unavailable. Please browse all professionals.");
          setIsLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });
    
    if (!error && data) {
      setAvailableCategories(data);
    }
  };

  const fetchProfessionals = async () => {
    const { data, error } = await supabase.from('professionals').select('*, reviews(rating), bookings(status)');
    if (!error && data) {
      const enrichedPros = data.map((pro: any) => {
        const reviews = pro.reviews || [];
        const avgRating = reviews.length > 0 ? (reviews.reduce((acc: any, curr: any) => acc + curr.rating, 0) / reviews.length).toFixed(1) : 'New';
        const completedJobs = (pro.bookings || []).filter((b: any) => b.status === 'completed').length;
        return { ...pro, avgRating, reviewCount: reviews.length, completedJobs };
      });
      setPros(enrichedPros);
    }
  };

  const fetchMyBookings = async (customerId: string) => {
    const { data, error } = await supabase.from('bookings').select(`*, professional:professionals(full_name, category)`).eq('customer_id', customerId).order('created_at', { ascending: false });
    if (!error && data) setMyBookings(data);
  };

  const fetchMessages = async (bookingId: string) => {
    const { data } = await supabase.from('booking_messages').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true });
    if (data) { 
      setMessages(data); 
      scrollToBottom(); 
    }
  };

  useEffect(() => {
    let realtimeSubscription: any;
    
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      setUserData({ id: user.id, name: user.user_metadata?.full_name || 'Customer', email: user.email || '' });
      const role = user.user_metadata?.role || 'customer';
      const tableName = role === 'professional' ? 'professionals' : 'customers';
      const { data: profileData } = await supabase.from(tableName).select('deletion_scheduled_at').eq('id', user.id).single();
      
      if (profileData?.deletion_scheduled_at) {
        const startDate = new Date(profileData.deletion_scheduled_at);
        const startDateOriginal = new Date(startDate);
        startDateOriginal.setDate(startDateOriginal.getDate() - 30);
        setDeletionDates({ scheduledAt: startDateOriginal.toLocaleDateString(), deletedOn: startDate.toLocaleDateString() });
        setShowRestoreModal(true);
      }

      fetchCategories();
      fetchProfessionals();
      fetchMyBookings(user.id);

      realtimeSubscription = supabase.channel(`bookings_customer_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `customer_id=eq.${user.id}` }, () => {
          fetchMyBookings(user.id); 
        }).subscribe();
    };

    fetchInitialData();
    return () => { if (realtimeSubscription) supabase.removeChannel(realtimeSubscription); };
  }, [navigate]);

  useEffect(() => {
    let chatSubscription: any;
    if (activeChat) {
      fetchMessages(activeChat.id);
      chatSubscription = supabase.channel(`chat_customer_${activeChat.id}`)
        // FIXED: Added strict (payload: any) typing here
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'booking_messages', filter: `booking_id=eq.${activeChat.id}` }, (payload: any) => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }).subscribe();
    }
    return () => { if (chatSubscription) supabase.removeChannel(chatSubscription); };
  }, [activeChat]);

  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.id || !selectedPro) return;
    setIsBooking(true);
    
    const { error } = await supabase.from('bookings').insert([{
      customer_id: userData.id, 
      professional_id: selectedPro.id, 
      customer_name: userData.name,
      service_type: bookingForm.issue, 
      scheduled_time: bookingForm.scheduled_time || 'Flexible', 
      address: bookingForm.address,
      est_budget: 'Quote on inspection', 
      status: 'pending'
    }]);

    setIsBooking(false);
    if (error) {
      alert("Failed to send booking request.");
    } else {
      fetchMyBookings(userData.id);
      setSelectedPro(null); 
      setBookingForm({ issue: '', address: '', scheduled_time: '' }); 
      setActiveTab('bookings'); 
    }
  };

  const executeCancelRequest = async () => {
    if (!cancelBookingId) return;
    const { error } = await supabase.from('bookings').delete().eq('id', cancelBookingId);
    if (!error && userData?.id) fetchMyBookings(userData.id);
    setCancelBookingId(null);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !userData) return;
    const content = newMessage;
    setNewMessage(''); 
    const { error } = await supabase.from('booking_messages').insert([{ booking_id: activeChat.id, customer_id: userData.id, professional_id: activeChat.professional_id, sender_id: userData.id, content }]);
    if (error) setNewMessage(content);
  };

  const submitReview = async () => {
    if (!reviewBooking || !userData) return;
    setIsSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert([{ booking_id: reviewBooking.id, customer_id: userData.id, professional_id: reviewBooking.professional_id, rating: reviewRating, comment: reviewComment }]);
    setIsSubmittingReview(false);
    if (!error) { setReviewBooking(null); fetchProfessionals(); }
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

  // --- DISTANCE CALCULATION & FILTERING ---
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

  const filteredPros = processedPros.filter(pro => {
    if (userData && pro.id === userData.id) return false;
    if (!pro.full_name || !pro.category) return false;

    const matchesSearch = pro.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pro.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory ? pro.category.toLowerCase().includes(activeCategory.toLowerCase()) : true;
    
    const isWithin100km = (!customerLocation || ignoreDistanceFilter) ? true : pro.distanceFromCustomer <= 100;

    return matchesSearch && matchesCategory && isWithin100km;
  }).sort((a, b) => {
    if (customerLocation && !ignoreDistanceFilter && a.distanceFromCustomer !== b.distanceFromCustomer) {
       return a.distanceFromCustomer - b.distanceFromCustomer;
    }
    return (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0);
  });

  const closestProDistance = filteredPros.length > 0 ? filteredPros[0].distanceFromCustomer : Infinity;

  if (showRestoreModal) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-2"><ShieldAlert className="w-10 h-10 text-red-600" /></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Account Pending Deletion</h2>
            <div className="bg-slate-50 text-slate-700 p-4 rounded-xl text-sm leading-relaxed border border-slate-200 mt-4 text-left">
              Your account is currently under deletion since <strong>{deletionDates.scheduledAt}</strong> and will be permanently deleted on <strong>{deletionDates.deletedOn}</strong>.
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <Button onClick={handleRestoreAccount} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold">Login and cancel deletion</Button>
            <Button onClick={handleLogout} variant="outline" className="w-full border-slate-300 text-slate-700 font-semibold h-12 hover:bg-slate-50">Log Out</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      
      <BookingModal selectedPro={selectedPro} setSelectedPro={setSelectedPro} bookingForm={bookingForm} setBookingForm={setBookingForm} handleBookService={handleBookService} isBooking={isBooking} />
      
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

      {cancelBookingId && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Cancel Request?</h2>
            <p className="text-slate-500 text-sm mb-6">Are you sure you want to cancel this booking request?</p>
            <div className="flex flex-col gap-3">
              <Button onClick={executeCancelRequest} className="bg-red-600 hover:bg-red-700 text-white">Yes, Cancel Request</Button>
              <Button onClick={() => setCancelBookingId(null)} variant="outline">No, Keep It</Button>
            </div>
          </div>
        </div>
      )}

      {reviewBooking && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 text-center relative">
            <button onClick={() => setReviewBooking(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X className="h-5 w-5" /></button>
            <h2 className="text-2xl font-bold mb-2">Rate your Pro</h2>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => <Star key={star} onClick={() => setReviewRating(star)} className={`w-10 h-10 cursor-pointer ${reviewRating >= star ? 'text-amber-500 fill-amber-500' : 'text-slate-200 fill-slate-200'}`} />)}
            </div>
            <div className="mb-6 text-left">
              <Label>Leave a comment (Optional)</Label>
              <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} className="w-full mt-2 min-h-[80px] p-3 rounded-xl border border-slate-200 bg-slate-50" />
            </div>
            <Button onClick={submitReview} disabled={isSubmittingReview} className="w-full bg-amber-500 hover:bg-amber-600">{isSubmittingReview ? "Submitting..." : "Submit Review"}</Button>
          </div>
        </div>
      )}

      {activeChat && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                {/* FIXED: Safe chaining for full_name array indexing */}
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-blue-100 text-blue-600">{activeChat.professional?.full_name?.[0] || 'P'}</AvatarFallback></Avatar>
                <div><h3 className="font-bold">{activeChat.professional?.full_name}</h3></div>
              </div>
              <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              <div className="text-center pb-4"><Badge variant="outline">Job accepted. You can now chat!</Badge></div>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender_id === userData?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender_id === userData?.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 border shadow-sm'}`}>{msg.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-white shrink-0">
              <form onSubmit={sendMessage} className="flex gap-2 relative">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="h-12 bg-slate-50 pr-12" />
                <Button type="submit" disabled={!newMessage.trim()} size="icon" className="absolute right-1 top-1 h-10 w-10 bg-blue-600"><Send className="w-4 h-4" /></Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/home')}>
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm"><Wrench className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">ServNect</span>
          </div>
          <div className="hidden sm:flex bg-slate-100/80 p-1 rounded-full border border-slate-200 mx-4">
            <button onClick={() => setActiveTab('discover')} className={`px-5 py-2 text-sm font-bold rounded-full ${activeTab === 'discover' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>Discover</button>
            <button onClick={() => setActiveTab('bookings')} className={`px-5 py-2 text-sm font-bold rounded-full flex items-center gap-2 ${activeTab === 'bookings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>My Bookings {myBookings.some(b => b.status === 'accepted') && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}</button>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 pl-1.5 pr-4 rounded-full border bg-white hover:bg-slate-50 hover:text-blue-600 transition-colors">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-blue-600 text-white">{userData?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback></Avatar>
                <span className="text-sm font-semibold ml-2 hidden sm:block">{userData?.name || 'Account'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-2 rounded-2xl bg-white border border-slate-200 shadow-lg text-slate-700" align="end">
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:text-blue-600 rounded-xl px-3 py-2.5 transition-colors">
                <Settings className="mr-3 h-4 w-4 text-slate-500" /> <span className="font-medium">Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLogoutModal(true)} className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 rounded-xl px-3 py-2.5 transition-colors">
                <LogOut className="mr-3 h-4 w-4" /> <span className="font-medium">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* --- MAIN TABS --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'discover' && (
          <DiscoverTab
            firstName={userData?.name?.split(' ')[0]}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            locationEnabled={locationEnabled}
            requestLocation={handleRequestLocation}
            isLocating={isLocating}
            customerLocation={customerLocation}
            closestProDistance={closestProDistance}
            ignoreDistanceFilter={ignoreDistanceFilter}
            setIgnoreDistanceFilter={setIgnoreDistanceFilter}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            filteredPros={filteredPros}
            setSelectedPro={setSelectedPro}
            availableCategories={availableCategories}
          />
        )}
        {activeTab === 'bookings' && (
          <BookingsTab
            myBookings={myBookings}
            setActiveTab={setActiveTab}
            setActiveChat={setActiveChat}
            setCancelBookingId={setCancelBookingId}
            setReviewBooking={setReviewBooking}
            setReviewRating={setReviewRating}
            setReviewComment={setReviewComment}
          />
        )}
      </main>
    </div>
  );
}