import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  Wrench, Settings, LogOut, ShieldAlert, MapPin, Clock, CheckCircle2, 
  TrendingUp, Star, CalendarDays, BellRing, X, Send, MessageSquare 
} from "lucide-react";

export default function ProfessionalDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<{id: string, name: string, email: string, verified: boolean} | null>(null);
  
  const [isOnline, setIsOnline] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests' | 'schedule'>('requests');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [scheduledJobs, setScheduledJobs] = useState<any[]>([]);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [deletionDates, setDeletionDates] = useState({ scheduledAt: '', deletedOn: '' });

  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let realtimeSubscription: any;
    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data: profile } = await supabase.from('professionals').select('*').eq('id', user.id).single();
      if (!profile || !profile.category || profile.category.trim() === '') return navigate('/onboarding', { replace: true });

      setUserData({ id: user.id, name: user.user_metadata?.full_name || 'Professional', email: user.email || '', verified: profile.verified || false });
      setIsOnline(profile.is_online || false);
      setIsLoadingProfile(false);

      if (profile.deletion_scheduled_at) {
        const startDate = new Date(profile.deletion_scheduled_at);
        const startDateOriginal = new Date(startDate);
        startDateOriginal.setDate(startDateOriginal.getDate() - 30);
        setDeletionDates({ scheduledAt: startDateOriginal.toLocaleDateString(), deletedOn: startDate.toLocaleDateString() });
        setShowRestoreModal(true);
      }

      fetchJobs(user.id);
      
      // FIX: Removed "payload =>" and replaced with "() =>"
      realtimeSubscription = supabase.channel(`bookings_pro_${Date.now()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `professional_id=eq.${user.id}` }, () => {
          fetchJobs(user.id); 
        }).subscribe();
    };

    initializeDashboard();
    return () => { if (realtimeSubscription) supabase.removeChannel(realtimeSubscription); };
  }, [navigate]);

  useEffect(() => {
    let chatSubscription: any;
    if (activeChat) {
      fetchMessages(activeChat.id);
      chatSubscription = supabase.channel(`chat_${activeChat.id}_${Date.now()}`)
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
    }
  };

  const fetchMessages = async (bookingId: string) => {
    const { data } = await supabase.from('booking_messages').select('*').eq('booking_id', bookingId).order('created_at', { ascending: true });
    if (data) {
      setMessages(data);
      scrollToBottom();
    }
  };

  const toggleOnlineStatus = async () => {
    if (!userData?.id || isToggling) return;
    setIsToggling(true);
    const newStatus = !isOnline;
    setIsOnline(newStatus); 

    const { error } = await supabase.from('professionals').update({ is_online: newStatus }).eq('id', userData.id);
    if (error) { setIsOnline(!newStatus); alert("Could not update status."); }
    setIsToggling(false);
  };

  const updateJobStatus = async (job: any, newStatus: string) => {
    const { error } = await supabase.from('bookings').update({ status: newStatus }).eq('id', job.id);
    if (!error) {
      fetchJobs(userData!.id);
      if (newStatus === 'accepted') { setActiveTab('schedule'); setActiveChat(job); }
    } else alert("Failed to update job status.");
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || !userData) return;
    const messageContent = newMessage;
    setNewMessage(''); 

    const { error } = await supabase.from('booking_messages').insert([{
      booking_id: activeChat.id,
      customer_id: activeChat.customer_id,
      professional_id: userData.id,
      sender_id: userData.id,
      content: messageContent
    }]);

    if (error) {
      alert("Failed to send message: " + error.message);
      setNewMessage(messageContent); 
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleRestoreAccount = async () => {
    if (userData?.id) {
      await supabase.from('professionals').update({ deletion_scheduled_at: null }).eq('id', userData.id);
      setShowRestoreModal(false);
    }
  };

  if (isLoadingProfile) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading your workspace...</div>;
  const firstName = userData?.name ? userData.name.split(' ')[0] : 'there';

  if (showRestoreModal) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-2"><ShieldAlert className="w-10 h-10 text-red-500" /></div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Account Pending Deletion</h2>
            <div className="bg-slate-950 text-slate-400 p-4 rounded-xl text-sm leading-relaxed border border-slate-800 mt-4 text-left">
              Your account is currently under deletion since <strong className="text-white">{deletionDates.scheduledAt}</strong> and will be permanently deleted on <strong className="text-white">{deletionDates.deletedOn}</strong>.
            </div>
          </div>
          <div className="space-y-3 pt-4">
            <Button onClick={handleRestoreAccount} className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 h-12 text-base font-bold">Login and cancel deletion</Button>
            <Button onClick={handleLogout} variant="outline" className="w-full border-slate-700 text-slate-300 font-semibold h-12 hover:bg-slate-800 hover:text-white bg-transparent">Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 selection:bg-amber-500/30 selection:text-amber-200 relative overflow-hidden">
      
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4"><LogOut className="w-8 h-8 text-red-500 ml-1" /></div>
            <h2 className="text-2xl font-bold text-white mb-2">Log Out?</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Are you sure you want to log out of your partner account?</p>
            <div className="flex flex-col gap-3">
              <Button onClick={handleLogout} className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 text-white transition-all active:scale-95">Yes, Log Out</Button>
              <Button onClick={() => setShowLogoutModal(false)} variant="outline" className="w-full h-12 text-base font-semibold border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors bg-transparent">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {activeChat && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full h-[85vh] shadow-2xl animate-in zoom-in-95 duration-300 relative flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-slate-700"><AvatarFallback className="bg-amber-500/10 text-amber-500">{activeChat.customer_name[0]}</AvatarFallback></Avatar>
                <div><h3 className="font-bold text-white leading-tight">{activeChat.customer_name}</h3><p className="text-xs text-slate-400">{activeChat.service_type}</p></div>
              </div>
              <button onClick={() => setActiveChat(null)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
              <div className="text-center pb-4"><Badge variant="outline" className="text-slate-500 border-slate-800 bg-slate-900/50">Job accepted. You can now chat!</Badge></div>
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === userData?.id;
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-amber-500 text-slate-950 rounded-br-sm' : 'bg-slate-800 text-white rounded-bl-sm border border-slate-700'}`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
              <form onSubmit={sendMessage} className="flex gap-2 relative">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="h-12 bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500 rounded-xl pr-12" />
                <Button type="submit" disabled={!newMessage.trim()} size="icon" className="absolute right-1 top-1 h-10 w-10 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 shrink-0"><Send className="w-4 h-4" /></Button>
              </form>
            </div>
          </div>
        </div>
      )}

      <nav className="sticky top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="bg-amber-500 p-1.5 rounded-lg shadow-sm"><Wrench className="h-5 w-5 text-slate-950" /></div>
            <span className="text-xl font-bold text-white tracking-tight">ServNect <span className="text-amber-500 font-medium">Partner</span></span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-11 pl-1.5 pr-4 rounded-full border border-slate-800 hover:bg-slate-900 gap-2.5 transition-all outline-none text-slate-300 hover:text-white">
                <Avatar className="h-8 w-8 border border-slate-700"><AvatarFallback className="bg-amber-500/10 text-amber-500 font-bold text-xs">{userData?.name ? userData.name[0].toUpperCase() : 'P'}</AvatarFallback></Avatar>
                <span className="text-sm font-semibold hidden sm:block">{userData?.name || 'Loading...'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-2 rounded-2xl border-slate-800 shadow-xl bg-slate-900/95 backdrop-blur-xl mt-1 text-slate-300" align="end" forceMount>
              <DropdownMenuItem onClick={() => navigate('/settings')} className="group cursor-pointer font-medium p-3 rounded-xl focus:bg-slate-800 focus:text-amber-500 transition-colors"><Settings className="mr-3 h-4 w-4 text-slate-500 group-focus:text-amber-500 transition-colors" /> Account Settings</DropdownMenuItem>
              <div className="h-px bg-slate-800 my-1 mx-2"></div>
              <DropdownMenuItem onClick={() => setShowLogoutModal(true)} className="group cursor-pointer font-medium p-3 rounded-xl focus:bg-red-500/10 focus:text-red-500 transition-colors"><LogOut className="mr-3 h-4 w-4 text-red-500 transition-colors" /> Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Welcome back, {firstName}!</h1>
            <p className="text-slate-400 mt-1 flex items-center gap-2">{userData?.verified ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> Verified Professional</> : <><Clock className="w-4 h-4 text-amber-500" /> Profile pending verification</>}</p>
          </div>
          <div className="flex items-center gap-4 bg-slate-950 p-2 pl-4 rounded-2xl border border-slate-800 shrink-0">
            <div className="flex flex-col"><span className="text-sm font-bold text-white">{isOnline ? 'Online' : 'Offline'}</span><span className="text-xs text-slate-500 font-medium">{isOnline ? 'Accepting jobs' : 'Not visible'}</span></div>
            <button onClick={toggleOnlineStatus} disabled={isToggling} className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${isOnline ? 'bg-green-500' : 'bg-slate-700'}`}>
              <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOnline ? 'translate-x-3' : '-translate-x-3'}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800 shadow-sm rounded-2xl"><CardContent className="p-5 flex flex-col justify-center"><p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> This Week</p><p className="text-2xl font-bold text-white">₹0</p></CardContent></Card>
          <Card className="bg-slate-900 border-slate-800 shadow-sm rounded-2xl"><CardContent className="p-5 flex flex-col justify-center"><p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Completed</p><p className="text-2xl font-bold text-white">0 Jobs</p></CardContent></Card>
          <Card className="border-none shadow-sm rounded-2xl col-span-2 md:col-span-2 bg-gradient-to-br from-amber-600 to-orange-600 text-white relative overflow-hidden"><div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 blur-2xl rounded-full"></div><CardContent className="p-5 flex items-center justify-between h-full relative z-10"><div><p className="text-amber-100 font-medium mb-1 flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-100" /> Current Rating</p><div className="flex items-baseline gap-2"><p className="text-3xl font-bold">New</p><p className="text-amber-100 text-sm">No reviews yet</p></div></div></CardContent></Card>
        </div>

        <div className="space-y-6">
          <div className="flex gap-2 p-1 bg-slate-900 rounded-xl w-fit border border-slate-800">
            <button onClick={() => setActiveTab('requests')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'requests' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>New Requests {incomingRequests.length > 0 && <Badge variant="secondary" className={`${activeTab === 'requests' ? 'bg-amber-500/20 text-amber-500 border-none' : 'bg-slate-800 text-slate-500 border-none'}`}>{incomingRequests.length}</Badge>}</button>
            <button onClick={() => setActiveTab('schedule')} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>Upcoming Schedule{scheduledJobs.length > 0 && <Badge variant="secondary" className={`${activeTab === 'schedule' ? 'bg-amber-500/20 text-amber-500 border-none' : 'bg-slate-800 text-slate-500 border-none'}`}>{scheduledJobs.length}</Badge>}</button>
          </div>

          {activeTab === 'requests' && (
            <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {!isOnline && (<div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-start gap-3"><BellRing className="w-5 h-5 shrink-0 mt-0.5" /><p className="text-sm font-medium">You are currently offline. Toggle your status to Online above to receive live requests from customers in your area.</p></div>)}
              {incomingRequests.length === 0 ? (<div className="text-center p-12 border border-dashed border-slate-800 rounded-2xl text-slate-500"><p>No new requests right now.</p></div>) : (
                incomingRequests.map((req) => (
                  <Card key={req.id} className="border-slate-800 bg-slate-900 shadow-sm hover:border-slate-700 transition-colors rounded-2xl overflow-hidden">
                    <div className="w-full h-1 bg-amber-500"></div>
                    <CardContent className="p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12 border border-slate-700"><AvatarFallback className="bg-amber-500/10 text-amber-500">{req.customer_name[0]}</AvatarFallback></Avatar>
                          <div><h3 className="font-bold text-lg text-white leading-tight">{req.service_type}</h3><p className="text-slate-400 text-sm font-medium mt-0.5">{req.customer_name}</p><div className="flex items-center gap-4 mt-3"><span className="text-xs font-semibold text-slate-300 flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md"><MapPin className="w-3.5 h-3.5"/> {req.address}</span><span className="text-xs font-semibold text-slate-300 flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md"><Clock className="w-3.5 h-3.5"/> {req.scheduled_time}</span></div></div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-3 sm:gap-0 justify-between">
                          <div className="text-left sm:text-right"><p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Est. Budget</p><p className="text-xl font-bold text-amber-500">{req.est_budget}</p></div>
                          <div className="flex gap-2 w-full sm:w-auto mt-2"><Button variant="outline" onClick={() => updateJobStatus(req, 'declined')} className="flex-1 sm:flex-none border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-10 px-4 bg-transparent">Decline</Button><Button onClick={() => updateJobStatus(req, 'accepted')} className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold h-10 px-6 shadow-sm"><MessageSquare className="w-4 h-4 mr-2" /> Accept & Chat</Button></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {scheduledJobs.length === 0 ? (<div className="text-center p-12 border border-dashed border-slate-800 rounded-2xl text-slate-500"><p>You have no upcoming scheduled jobs.</p></div>) : (
                scheduledJobs.map((job) => (
                  <Card key={job.id} className="border-slate-800 bg-slate-900 shadow-sm rounded-2xl overflow-hidden relative hover:border-slate-700 transition-colors">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
                    <CardContent className="p-5 sm:p-6 pl-6 sm:pl-8">
                      <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                        <div>
                          <div className="flex items-center gap-2 mb-1"><Badge variant="secondary" className="bg-green-500/10 text-green-500 border border-green-500/20 font-bold">Upcoming</Badge><span className="text-sm font-semibold text-slate-400 flex items-center gap-1"><CalendarDays className="w-4 h-4"/> {job.scheduled_time}</span></div>
                          <h3 className="font-bold text-lg text-white mt-2">{job.service_type}</h3><p className="text-slate-400 text-sm mt-1 flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.address}</p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-950 p-3 rounded-xl border border-slate-800">
                          <Avatar className="h-10 w-10 border border-slate-700 shadow-sm"><AvatarFallback className="bg-amber-500/10 text-amber-500">{job.customer_name[0]}</AvatarFallback></Avatar>
                          <div><p className="text-xs text-slate-500 font-medium">Customer</p><p className="text-sm font-bold text-white">{job.customer_name}</p></div>
                          <Button onClick={() => setActiveChat(job)} variant="outline" size="sm" className="ml-2 bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-8"><MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}