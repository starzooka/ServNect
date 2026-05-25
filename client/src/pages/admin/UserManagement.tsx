import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MapPin, Mail, Phone, CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UserManagement() {
  const { customers, professionals } = useOutletContext<any>();
  const [activeTab, setActiveTab] = useState<'customers' | 'professionals'>('customers');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter((c: any) => c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || c.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPros = professionals.filter((p: any) => p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.email?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-slate-400 mt-1">View and manage all registered accounts.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input placeholder="Search name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-slate-900 border-slate-800 text-white focus-visible:ring-indigo-500"/>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-900 rounded-xl w-fit border border-slate-800">
        <button onClick={() => setActiveTab('customers')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'customers' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
          Customers <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-none ml-1">{customers.length}</Badge>
        </button>
        <button onClick={() => setActiveTab('professionals')} className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'professionals' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}>
          Professionals <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-none ml-1">{professionals.length}</Badge>
        </button>
      </div>

      {activeTab === 'customers' && (
        <div className="grid gap-4">
          {filteredCustomers.length === 0 ? <p className="text-slate-500 text-center py-10">No customers found.</p> : filteredCustomers.map((customer: any) => (
            <Card key={customer.id} className="bg-slate-900 border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-slate-700"><AvatarFallback className="bg-slate-800 text-slate-300 font-bold">{customer.full_name?.[0] || 'C'}</AvatarFallback></Avatar>
                  <div>
                    <h3 className="font-bold text-white text-lg">{customer.full_name || 'Unnamed Customer'}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className="text-sm text-slate-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {customer.email}</span>
                      {customer.phone && <span className="text-sm text-slate-400 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {customer.phone}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Joined</p>
                  <p className="text-sm font-medium text-slate-300 flex items-center gap-1.5 justify-end"><CalendarDays className="w-3.5 h-3.5" /> {new Date(customer.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'professionals' && (
        <div className="grid gap-4">
          {filteredPros.length === 0 ? <p className="text-slate-500 text-center py-10">No professionals found.</p> : filteredPros.map((pro: any) => (
            <Card key={pro.id} className="bg-slate-900 border-slate-800 shadow-sm hover:border-slate-700 transition-colors">
              <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-slate-700"><AvatarFallback className="bg-indigo-500/10 text-indigo-400 font-bold">{pro.full_name?.[0] || 'P'}</AvatarFallback></Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-lg">{pro.full_name || 'Unnamed Pro'}</h3>
                      {pro.verified ? <Badge className="bg-green-500/10 text-green-500 border-none font-bold text-xs">Verified</Badge> : <Badge variant="outline" className="text-slate-500 border-slate-700 font-medium text-xs">Unverified</Badge>}
                    </div>
                    <p className="text-sm text-indigo-400 font-medium mt-0.5">{pro.category || 'No Category'}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="text-sm text-slate-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {pro.email}</span>
                      {pro.city && <span className="text-sm text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {pro.city}</span>}
                    </div>
                  </div>
                </div>
                <div className="text-left sm:text-right mt-2 sm:mt-0 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Status</p>
                  <p className="text-sm font-medium flex items-center gap-1.5 sm:justify-end">
                    {pro.is_online ? <><span className="w-2 h-2 rounded-full bg-green-500"></span> <span className="text-white">Online</span></> : <><span className="w-2 h-2 rounded-full bg-slate-600"></span> <span className="text-slate-400">Offline</span></>}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}