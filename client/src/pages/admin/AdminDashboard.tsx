import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ShieldCheck, CheckCircle2, Clock, FileText } from "lucide-react";

export default function AdminDashboard() {
  const { pendingPros, refreshData } = useOutletContext<any>();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleVerifyPro = async (proId: string) => {
    setIsProcessing(proId);
    const { error } = await supabase.from('professionals').update({ verified: true }).eq('id', proId);

    if (error) {
      alert("Failed to verify professional.");
    } else {
      refreshData();
    }
    
    setIsProcessing(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Pending Verifications</h1>
        <p className="text-slate-400 mt-1">Review and approve newly registered professionals.</p>
      </div>

      {pendingPros.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center bg-slate-900/30">
          <CheckCircle2 className="w-12 h-12 text-green-500/50 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">All caught up!</h3>
          <p className="text-slate-500">There are no professionals waiting for verification right now.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingPros.map((pro: any) => (
            <Card key={pro.id} className="bg-slate-900 border-slate-800 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6 flex flex-col sm:flex-row items-start gap-5">
                    <Avatar className="h-14 w-14 border border-slate-700">
                      <AvatarFallback className="bg-slate-800 text-slate-300 text-lg font-bold">{pro.full_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-white leading-none">{pro.full_name || 'Incomplete Profile'}</h3>
                        <Badge className="bg-amber-500/10 text-amber-500 border-none font-bold text-xs"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                      </div>
                      <p className="text-slate-400 text-sm font-medium">{pro.category || 'No category set'}</p>
                      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-800">
                        <div><p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">Email</p><p className="text-sm font-medium">{pro.email || 'N/A'}</p></div>
                        <div><p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">Phone</p><p className="text-sm font-medium">{pro.phone || 'N/A'}</p></div>
                        <div><p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-0.5">City</p><p className="text-sm font-medium">{pro.city || 'N/A'}</p></div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-6 md:w-72 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col justify-center gap-3">
                    <Button variant="outline" className="w-full bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"><FileText className="w-4 h-4 mr-2" /> View Documents</Button>
                    <Button onClick={() => handleVerifyPro(pro.id)} disabled={isProcessing === pro.id} className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold transition-transform active:scale-95">
                      {isProcessing === pro.id ? "Approving..." : <><ShieldCheck className="w-4 h-4 mr-2" /> Approve Pro</>}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}