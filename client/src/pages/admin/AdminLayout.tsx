import { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, Users, LayoutDashboard, LogOut } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [adminRole, setAdminRole] = useState<string | null>(null);

  const [pendingPros, setPendingPros] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<any[]>([]);

  useEffect(() => {
    const initializeDashboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');

      const { data: adminData, error } = await supabase
        .from('internal_users')
        .select('role')
        .eq('id', user.id)
        .single();
      if (error || !adminData) return navigate('/home');

      setAdminRole(adminData.role);
      await fetchAllData();
      setIsLoading(false);
    };

    initializeDashboard();
  }, [navigate]);

  const fetchAllData = async () => {
    // Pending pros (basic activation, not document-verified yet)
    const { data: pending } = await supabase
      .from('professionals')
      .select('*')
      .eq('verified', false)
      .order('created_at', { ascending: false });
    if (pending) setPendingPros(pending);

    // All customers
    const { data: custs } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (custs) setCustomers(custs);

    // All professionals
    const { data: pros } = await supabase
      .from('professionals')
      .select('*')
      .order('created_at', { ascending: false });
    if (pros) setProfessionals(pros);

    // All verification requests with pro info joined
    const { data: verReqs } = await supabase
      .from('verification_requests')
      .select(`*, professionals (full_name, email, category)`)
      .order('created_at', { ascending: false });
    if (verReqs) setVerificationRequests(verReqs);
  };

  const refreshData = () => {
    fetchAllData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const pendingVerificationCount = verificationRequests.filter(r => r.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 font-medium">
        Verifying Credentials & Loading Database...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300 selection:bg-indigo-500/30">

      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <ShieldCheck className="w-6 h-6 text-indigo-500 mr-2" />
          <span className="font-bold text-white text-lg tracking-tight">
            ServNect <span className="text-indigo-500">Admin</span>
          </span>
        </div>

        <div className="p-4 flex-1 space-y-1">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-2 mt-4">Operations</div>

          <button
            onClick={() => navigate('/admin')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
              location.pathname === '/admin'
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>

          <button
            onClick={() => navigate('/admin/verifications')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
              location.pathname === '/admin/verifications'
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            Verifications
            {pendingVerificationCount > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                {pendingVerificationCount}
              </span>
            )}
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-colors ${
              location.pathname === '/admin/users'
                ? 'bg-indigo-500/10 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" /> User Management
          </button>
        </div>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-9 w-9 border border-slate-700">
              <AvatarFallback className="bg-indigo-500/20 text-indigo-400 font-bold text-xs">AD</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold text-white leading-tight">Admin Portal</p>
              <p className="text-xs text-slate-500 capitalize">{adminRole?.replace('_', ' ')}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full bg-transparent border-slate-700 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-4 md:hidden shrink-0">
          <div className="flex items-center">
            <ShieldCheck className="w-5 h-5 text-indigo-500 mr-2" />
            <span className="font-bold text-white tracking-tight">ServNect Admin</span>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet context={{ pendingPros, customers, professionals, verificationRequests, refreshData }} />
        </div>
      </main>
    </div>
  );
}