import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, MapPin, Mail, Trash2, AlertTriangle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function UserManagement() {
  const { customers, professionals, refreshData } = useOutletContext<any>();
  const [activeTab, setActiveTab] = useState<'customers' | 'professionals'>('customers');
  const [searchQuery, setSearchQuery] = useState('');

  // Deletion States
  const [userToDelete, setUserToDelete] = useState<{ id: string, type: 'customer' | 'professional', name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCustomers = customers?.filter((c: any) => 
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredPros = professionals?.filter((p: any) => 
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const executeDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    
    try {
      const table = userToDelete.type === 'customer' ? 'customers' : 'professionals';
      
      // Delete from the public profile table
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', userToDelete.id);

      if (error) throw error;

      // Refresh the data to remove the user from the UI
      refreshData();
      setUserToDelete(null);
    } catch (error: any) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please check permissions.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* DELETION CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
              <h3 className="font-bold text-red-500 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Confirm Deletion
              </h3>
              <button onClick={() => setUserToDelete(null)} disabled={isDeleting} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-slate-300 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-white">{userToDelete.name}</strong> from the platform?
              </p>
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                This action will immediately remove their public profile and they will no longer appear in customer searches.
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setUserToDelete(null)} disabled={isDeleting} className="flex-1 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                  Cancel
                </Button>
                <Button onClick={executeDelete} disabled={isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold">
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER & SEARCH */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
          <p className="text-slate-400 mt-1">View, manage, and remove registered accounts.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input 
            placeholder="Search by name, email, or category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-slate-900 border-slate-800 text-slate-200 focus-visible:ring-indigo-500"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit">
        <button 
          onClick={() => setActiveTab('customers')} 
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'customers' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          Customers ({filteredCustomers.length})
        </button>
        <button 
          onClick={() => setActiveTab('professionals')} 
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'professionals' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
        >
          Professionals ({filteredPros.length})
        </button>
      </div>

      {/* CUSTOMERS LIST */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCustomers.length === 0 ? (
            <p className="text-slate-500 py-8 col-span-full">No customers found.</p>
          ) : filteredCustomers.map((customer: any) => (
            <Card key={customer.id} className="bg-slate-900 border-slate-800">
              <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-slate-700">
                    <AvatarFallback className="bg-slate-800 text-indigo-400 font-bold">{customer.full_name?.[0] || 'C'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-white leading-tight">{customer.full_name || 'Unnamed Customer'}</h3>
                    <div className="flex flex-col text-sm text-slate-400 mt-1">
                      <span className="flex items-center gap-1.5"><Mail className="w-3 h-3" /> {customer.email}</span>
                      {customer.phone && <span className="flex items-center gap-1.5 mt-0.5">📞 {customer.phone}</span>}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setUserToDelete({ id: customer.id, type: 'customer', name: customer.full_name || 'Unnamed Customer' })}
                  className="w-full sm:w-auto border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* PROFESSIONALS LIST */}
      {activeTab === 'professionals' && (
        <div className="grid grid-cols-1 gap-4">
          {filteredPros.length === 0 ? (
            <p className="text-slate-500 py-8">No professionals found.</p>
          ) : filteredPros.map((pro: any) => (
            <Card key={pro.id} className="bg-slate-900 border-slate-800 flex flex-col sm:flex-row justify-between items-center p-5 gap-4">
              <div className="flex items-start gap-4 w-full">
                <Avatar className="h-12 w-12 border border-slate-700 mt-1">
                  <AvatarFallback className="bg-slate-800 text-indigo-400 font-bold">{pro.full_name?.[0] || 'P'}</AvatarFallback>
                </Avatar>
                <div className="space-y-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <h3 className="font-bold text-white text-lg leading-tight">{pro.full_name || 'Unnamed Professional'}</h3>
                    {(pro.is_verified || pro.verified) ? (
                      <Badge className="bg-green-500/10 text-green-500 border-none font-bold text-xs w-fit">Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-500 border-slate-700 font-medium text-xs w-fit">Unverified</Badge>
                    )}
                  </div>
                  <p className="text-sm text-indigo-400 font-medium mt-0.5">{pro.category || 'No Category'}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="text-sm text-slate-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {pro.email}</span>
                    {pro.city && <span className="text-sm text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {pro.city}</span>}
                  </div>
                </div>
              </div>
              
              <div className="w-full sm:w-auto shrink-0 border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-5 flex items-center">
                <Button 
                  variant="outline" 
                  onClick={() => setUserToDelete({ id: pro.id, type: 'professional', name: pro.full_name || 'Unnamed Professional' })}
                  className="w-full sm:w-auto border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Pro
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}