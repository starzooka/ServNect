import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Wrench, Settings, LogOut, CheckCircle2, Clock, X, Send } from "lucide-react";

// --- IMPORT OUR NEW COMPONENTS ---
import ProStatCards from '@/components/professional/ProStatCards';
import RequestsTab from '@/components/professional/RequestsTab';
import ScheduleTab from '@/components/professional/ScheduleTab';

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const [isOnline, setIsOnline] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  // Notice we added 'reviews' and 'portfolio' to the active tab list!
  const [activeTab, setActiveTab] = useState<'requests' | 'schedule' | 'reviews' | 'portfolio'>('requests');

  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<any[]>([]);
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [proRating, setProRating] = useState({ average: 0, count: 0 });

  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let realtimeSubscription: any;
    let reviewSubscription: any;

    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data: profile } = await supabase.from('professionals').select('*').eq('id', user.id).single();
      if (!profile || !profile.category) return navigate('/onboarding', { replace: true });

      setUserData({ id: user.id, name: user.user_metadata?.full_name || 'Professional', email: user.email || '', verified: profile.verified || false });
      setIsOnline(profile.is_online || false);
      setIsLoadingProfile(false);

      fetchJobs(user.id);
      fetchReviews(user.id);
      
      realtimeSubscription = supabase.channel(`bookings_pro_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `professional_id=eq.${user.id}` }, () => fetchJobs(user.id))
        .subscribe();

      reviewSubscription = supabase.channel(`reviews_pro_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews', filter: `professional_id=eq.${user.id}` }, () => fetchReviews(user.id))
        .subscribe();
    };

    initializeDashboard();
    return () => { 
      if (realtimeSubscription) supabase.removeChannel(realtimeSubscription); 
      if (reviewSubscription) supabase.removeChannel(reviewSubscription); 
    };
  }, [navigate]);

  useEffect(() => {
    let chatSubscription: any;
    if (activeChat) {
      fetchMessages(activeChat.id);
      chatSubscription = supabase.channel(`chat_${activeChat.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'booking_messages', filter: `booking_id=eq.${activeChat.id}` }, payload => {
          setMessages(prev => [...prev, payload.new]);
          scrollToBottom();
        }).subscribe();
    }
    return () => { if (chatSubscription) supabase.removeChannel(chatSubscription); };
  }, [activeChat]);

  const scrollToBottom = () => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

  const fetchJobs = async (proId: string) => {
    const { data, error } = await supabase.from('bookings').select('*').eq('professional_id', proId).order('created_at', { ascending: false });
    if (!error && data) {
      setIncomingRequests(data.filter(job => job.status === 'pending'));
      setScheduledJobs(data.filter(job => job.status === 'accepted'));
      
      const completed = data.filter(job => job.status === 'completed');
      setCompletedJobs(completed);
      
      // SUM UP EARNINGS FOR THE HONOR SYSTEM
      const sum = completed.reduce((total, job) => total + (Number(job.earned_amount) || 0), 0);
      setTotalEarnings(sum);
    }
  };

  const fetchReviews = async (proId: string) => {
    const { data } = await supabase.from('reviews').select('rating').eq('professional_id', proId);
    if (data && data.length > 0) {
      const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
      setProRating({ average: sum / data.length, count: data.length });
    } else {
      setProRating({ average: 0, count: 0 });
    }
  };

  const fetchMessages = async (bookingId: string) => {
    const { data } = await supabase.from('booking_messages').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true });
    if (data) { setMessages(data); scrollToBottom(); }
  };

  const toggleOnlineStatus = async () => {
    if (!userData?.id || isToggling) return;
    setIsToggling(true);
    const newStatus = !isOnline;
    setIsOnline(newStatus); 
    const { error } = await supabase.from('professionals').update({ is_online: newStatus }).eq('id', userData.id);
    if (error) setIsOnline(!newStatus);
    setIsToggling(false);
  };

  const updateJobStatus = async (job: any, newStatus: string) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', job.id);
    if (!error) {
      fetchJobs(userData!.id);
      if (newStatus === 'accepted') { setActiveTab('schedule'); setActiveChat(job); }
    }
  };

  // THE NEW HONOR SYSTEM COMPLETION HANDLER
  const completeJobWithEarnings = async (jobId: string, earnedAmount: number) => {
    const { error } = await supabase.from('bookings').update({ status: 'completed', earned_amount: earnedAmount }).eq('id', jobId);
    if (!error) fetchJobs(userData!.id);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !userData) return;
    const content = newMessage;
    setNewMessage(''); 
    const { error } = await supabase.from('booking_messages').insert([{ booking_id: activeChat.id, customer_id: activeChat.customer_id, professional_id: userData.id, sender_id: userData.id, content }]);
    if (error) setNewMessage(content); 
  };

  if (isLoadingProfile) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading your workspace...</div>;

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* CHAT MODAL */}
      {activeChat && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-700"><AvatarFallback className="bg-amber-500/10 text-amber-500">{activeChat.customer_name[0]}</AvatarFallback></Avatar>
                <div><h3 className="font-bold text-white leading-tight">{activeChat.customer_name}</h3><p className="text-xs text-slate-400">{activeChat.service_type}</p></div>
              </div>
              <button onClick={() => setActiveChat(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
              <div className="text-center pb-4"><Badge variant="outline" className="text-slate-500 border-slate-800 bg-slate-900/50">Job accepted. You can now chat!</Badge></div>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender_id === userData?.id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender_id === userData?.id ? 'bg-amber-500 text-slate-950 rounded-br-sm' : 'bg-slate-800 text-white rounded-bl-sm border border-slate-700'}`}>{msg.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
              <form onSubmit={sendMessage} className="flex gap-2 relative">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="h-12 bg-slate-950 border-slate-800 text-white rounded-xl pr-12" />
                <Button type="submit" disabled={!newMessage.trim()} size="icon" className="absolute right-1 top-1 h-10 w-10 rounded-lg bg-amber-500 text-slate-950"><Send className="w-4 h-4" /></Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="sticky top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-amber-500 p-1.5 rounded-lg shadow-sm"><Wrench className="h-5 w-5 text-slate-950" /></div>
            <span className="text-xl font-bold text-white tracking-tight">ServNect <span className="text-amber-500 font-medium">Partner</span></span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 pl-1.5 pr-4 rounded-full border border-slate-800 hover:bg-slate-900 gap-2.5 text-slate-300">
                <Avatar className="h-8 w-8 border border-slate-700"><AvatarFallback className="bg-amber-500/10 text-amber-500 font-bold text-xs">{userData?.name[0].toUpperCase()}</AvatarFallback></Avatar>
                <span className="text-sm font-semibold hidden sm:block">{userData?.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-2 rounded-2xl border-slate-800 bg-slate-900/95 backdrop-blur-xl mt-1" align="end">
              <DropdownMenuItem onClick={() => navigate('/settings')} className="cursor-pointer font-medium p-3 rounded-xl focus:bg-slate-800 focus:text-amber-500"><Settings className="mr-3 h-4 w-4" /> Account Settings</DropdownMenuItem>
              <div className="h-px bg-slate-800 my-1 mx-2"></div>
              <DropdownMenuItem onClick={() => supabase.auth.signOut().then(() => navigate('/login'))} className="cursor-pointer font-medium p-3 rounded-xl focus:bg-red-500/10 focus:text-red-500"><LogOut className="mr-3 h-4 w-4" /> Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-900 p-6 rounded-3xl border border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, {userData?.name.split(' ')[0]}!</h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">{userData?.verified ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> Verified</> : <><Clock className="w-4 h-4 text-amber-500" /> Pending verification</>}</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-950 p-2 pl-4 rounded-2xl border border-slate-800">
            <div className="flex flex-col"><span className="text-sm font-bold text-white">{isOnline ? 'Online' : 'Offline'}</span><span className="text-xs text-slate-500">{isOnline ? 'Accepting jobs' : 'Not visible'}</span></div>
            <button onClick={toggleOnlineStatus} disabled={isToggling} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${isOnline ? 'bg-green-500' : 'bg-slate-700'}`}>
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition duration-200 ${isOnline ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* TOP STATS COMPONENT */}
        <ProStatCards earnings={totalEarnings} completedCount={completedJobs.length} proRating={proRating} />

        {/* TAB NAVIGATION */}
        <div className="space-y-6">
          <div className="flex gap-2 p-1 bg-slate-900 rounded-xl w-fit border border-slate-800 overflow-x-auto whitespace-nowrap">
            <button onClick={() => setActiveTab('requests')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Requests {incomingRequests.length > 0 && <Badge className="bg-amber-500/20 text-amber-500 border-none">{incomingRequests.length}</Badge>}</button>
            <button onClick={() => setActiveTab('schedule')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Schedule {scheduledJobs.length > 0 && <Badge className="bg-amber-500/20 text-amber-500 border-none">{scheduledJobs.length}</Badge>}</button>
            <button onClick={() => setActiveTab('reviews')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'reviews' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Reviews</button>
            <button onClick={() => setActiveTab('portfolio')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'portfolio' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Portfolio Gallery</button>
          </div>

          {/* TAB CONTENTS */}
          {activeTab === 'requests' && <RequestsTab incomingRequests={incomingRequests} isOnline={isOnline} updateJobStatus={updateJobStatus} />}
          {activeTab === 'schedule' && <ScheduleTab scheduledJobs={scheduledJobs} setActiveChat={setActiveChat} completeJob={completeJobWithEarnings} />}
          {activeTab === 'reviews' && <div className="text-slate-400 p-8 text-center border border-dashed border-slate-800 rounded-2xl">Reviews component coming up next!</div>}
          {activeTab === 'portfolio' && <div className="text-slate-400 p-8 text-center border border-dashed border-slate-800 rounded-2xl">Portfolio component coming up next!</div>}

        </div>
      </main>
    </div>
  );
}