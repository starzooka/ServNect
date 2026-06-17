import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowLeft, Star, MapPin, Briefcase, Clock, Award,
  ShieldCheck, Calendar, User, MessageSquare, AlertCircle, X
} from "lucide-react";

export default function ProProfile() {
  const { proId } = useParams();
  const navigate = useNavigate();
  const [pro, setPro] = useState<any>(null);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customerUser, setCustomerUser] = useState<any>(null);

  // Booking states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({ issue: '', address: '', scheduled_time: '' });
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileAndReviews = async () => {
      setIsLoading(true);
      
      // 1. Fetch current logged-in customer session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCustomerUser({
          id: user.id,
          name: user.user_metadata?.full_name || 'Customer'
        });
      }

      // 2. Fetch specific professional details
      const { data: proData, error: proError } = await supabase
        .from('professionals')
        .select('*')
        .eq('id', proId)
        .maybeSingle();
      
      if (proError || !proData) {
        setIsLoading(false);
        return;
      }

      // 3. Fetch comprehensive review list left for this pro
      const { data: revData } = await supabase
        .from('reviews')
        .select('*')
        .eq('professional_id', proId)
        .order('created_at', { ascending: false });

      const reviews = revData || [];
      const avgRating = reviews.length > 0 
        ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) 
        : 'New';

      setPro({ ...proData, avgRating, reviewCount: reviews.length });
      setReviewsList(reviews);
      setIsLoading(false);
    };

    fetchProfileAndReviews();
  }, [proId]);

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerUser?.id || !pro) return;
    if (!bookingForm.issue.trim() || !bookingForm.address.trim()) {
      setBookingError("Please fill in all required fields.");
      return;
    }

    setIsBooking(true);
    setBookingError(null);
    
    try {
      const { error } = await supabase.from('bookings').insert([{
        customer_id: customerUser.id, 
        professional_id: pro.id, 
        customer_name: customerUser.name,
        service_type: bookingForm.issue.trim(), 
        scheduled_time: bookingForm.scheduled_time || 'Flexible', 
        address: bookingForm.address.trim(),
        est_budget: 'Quote on inspection', 
        status: 'pending'
      }]);

      if (error) throw error;

      setShowBookingModal(false);
      setBookingForm({ issue: '', address: '', scheduled_time: '' });
      alert("Booking request transmitted successfully!");
      navigate('/home?tab=bookings'); 
    } catch (err: any) {
      setBookingError(err.message || "Failed to finalize booking.");
    } finally {
      setIsBooking(false);
    }
  };

  // --- DYNAMIC EXPERIENCE FORMATTER ---
  // Converts "2018-05-12" to "Working since 2018"
  const getExperienceDisplay = (dateString: string | null) => {
    if (!dateString) return 'New Member';
    const year = new Date(dateString).getFullYear();
    // Fallback just in case an invalid date gets passed
    if (isNaN(year)) return 'New Member'; 
    return `Working since ${year}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-medium">
        Syncing marketplace portfolio details...
      </div>
    );
  }

  if (!pro) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="text-xl font-bold text-slate-900">Professional Profile Offline</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">This profile may have been deactivated or removed.</p>
        <Button onClick={() => navigate('/home')} className="bg-blue-600 text-white">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-32">
      
      {/* LIVE CHECKOUT MODAL SHEET */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowBookingModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-900 mb-1">Book Appointment</h2>
            <p className="text-sm text-slate-500 mb-4">Scheduling service with <span className="font-semibold text-slate-900">{pro.full_name}</span></p>

            {bookingError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{bookingError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium">Describe the Work Needed *</Label>
                <textarea 
                  value={bookingForm.issue}
                  onChange={(e) => setBookingForm({...bookingForm, issue: e.target.value})}
                  placeholder="Provide specific information regarding your request (e.g., Leaking pipe under bathroom sink)..."
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-slate-50 min-h-[90px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium">Service Delivery Address *</Label>
                <Input 
                  placeholder="Flat number, building name, street address" 
                  value={bookingForm.address}
                  onChange={(e) => setBookingForm({...bookingForm, address: e.target.value})}
                  className="h-11 bg-slate-50 border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-700 font-medium">Preferred Schedule Time (Optional)</Label>
                <Input 
                  type="text" 
                  placeholder="e.g. Today evening 5 PM, Tomorrow morning" 
                  value={bookingForm.scheduled_time}
                  onChange={(e) => setBookingForm({...bookingForm, scheduled_time: e.target.value})}
                  className="h-11 bg-slate-50 border-slate-200"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Button type="submit" disabled={isBooking} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl">
                  {isBooking ? "Transmitting Request..." : "Confirm Booking Request"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowBookingModal(false)} className="w-full h-11 border-none text-slate-500">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Cover Header */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600 relative shrink-0">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-white/10 text-white hover:bg-white/20 transition-all rounded-full flex items-center justify-center">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* LEFT SECTION: MAIN PROFILE BRIEF CARD */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 overflow-visible relative">
              <div className="flex justify-between items-start">
                <Avatar className="h-24 w-24 border-4 border-white shadow-md bg-white -mt-16">
                  <AvatarFallback className="text-3xl font-extrabold bg-blue-50 text-blue-600">
                    {pro.full_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {(pro.is_verified || pro.verified) ? (
                  <Badge className="bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1 font-bold text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 fill-blue-600 text-blue-50" /> Verified Pro
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-400 border-slate-200 px-2 py-0.5 text-xs">
                    Standard Profile
                  </Badge>
                )}
              </div>

              <div className="mt-4 space-y-1">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{pro.full_name}</h1>
                <p className="text-base font-bold text-blue-600">{pro.category}</p>
              </div>

              {/* Core metrics badges horizontal bar */}
              <div className="grid grid-cols-3 gap-4 border-y border-slate-100 my-6 py-4 text-center">
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Rating Score</p>
                  <p className="text-base font-extrabold text-slate-900 mt-1 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {pro.avgRating}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Experience</p>
                  {/* UPDATED: DYNAMIC EXPERIENCE DISPLAY */}
                  <p className="text-[13px] font-extrabold text-slate-900 mt-1.5 flex items-center justify-center gap-1">
                    <Award className="w-4 h-4 text-slate-400" /> {getExperienceDisplay(pro.experience_start_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Primary Hub</p>
                  <p className="text-base font-extrabold text-slate-900 mt-1 flex items-center justify-center gap-1 truncate max-w-full px-1">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> {pro.city?.split(',')?.[0] || 'India'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" /> Profile Biography
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {pro.bio || 'This professional has not drafted an extended public biography introduction record yet.'}
                </p>
              </div>
            </div>

            {/* LIVE SOCIAL PROOF FEED: REVIEWS BLOCK */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-slate-400" /> 
                Customer Feedback Logs ({reviewsList.length})
              </h3>

              <div className="space-y-4">
                {reviewsList.length === 0 ? (
                  <p className="text-slate-400 text-sm italic py-4 text-center">No reviews have been left for this profile yet.</p>
                ) : (
                  reviewsList.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`w-3.5 h-3.5 ${
                                rev.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(rev.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {rev.comment && <p className="text-slate-600 text-sm leading-relaxed">{rev.comment}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION: SIDEBAR BOOKING TRIGGER PANEL */}
          <div className="lg:col-span-1 space-y-4 sticky top-20">
            <Card className="border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
              <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile Status</span>
                {pro.is_online ? (
                  <Badge className="bg-green-100 text-green-700 border-none font-bold text-xs flex items-center gap-1 px-2.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online Now
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-slate-400 border-slate-200 text-xs">
                    Away
                  </Badge>
                )}
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800">Operating Scope</p>
                      <p className="text-slate-500 mt-0.5 leading-normal">{pro.city || 'Not declared'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-800">Dispatch Window</p>
                      <p className="text-slate-500 mt-0.5 leading-normal">
                         {pro.travel_radius ? `Within ${pro.travel_radius}` : 'Regional Area Support'}
                      </p>
                    </div>
                  </div>
                </div>

                <Button onClick={() => setShowBookingModal(true)} className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm shadow-blue-600/10 active:scale-[0.98]">
                  Hire {pro.full_name?.split(' ')?.[0]}
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
      
      {/* Mobile Sticky Booking Dock */}
      <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-slate-200/80 bg-white/95 backdrop-blur-md shadow-lg flex items-center justify-between md:hidden z-40">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium">Expert Score</span>
          <span className="font-extrabold text-slate-900 flex items-center gap-1 mt-0.5">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {pro.avgRating}
          </span>
        </div>
        <Button onClick={() => setShowBookingModal(true)} className="px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-sm active:scale-[0.97]">
          Book Appointment
        </Button>
      </div>

    </div>
  );
}