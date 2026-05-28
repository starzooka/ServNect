import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, BellRing, MessageSquare } from "lucide-react";

export default function RequestsTab({ incomingRequests, isOnline, updateJobStatus }: any) {
  return (
    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {!isOnline && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-start gap-3">
          <BellRing className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">You are currently offline. Toggle your status to Online above to receive live requests.</p>
        </div>
      )}
      
      {incomingRequests.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-slate-800 rounded-2xl text-slate-500">
          <p>No new requests right now.</p>
        </div>
      ) : (
        incomingRequests.map((req: any) => (
          <Card key={req.id} className="border-slate-800 bg-slate-900 shadow-sm hover:border-slate-700 transition-colors rounded-2xl overflow-hidden">
            <div className="w-full h-1 bg-amber-500"></div>
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 border border-slate-700"><AvatarFallback className="bg-amber-500/10 text-amber-500">{req.customer_name[0]}</AvatarFallback></Avatar>
                  <div>
                    <h3 className="font-bold text-lg text-white leading-tight">{req.service_type}</h3>
                    <p className="text-slate-400 text-sm font-medium mt-0.5">{req.customer_name}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md"><MapPin className="w-3.5 h-3.5"/> {req.address}</span>
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md"><Clock className="w-3.5 h-3.5"/> {req.scheduled_time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:items-end gap-3 sm:gap-0 justify-between">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Est. Budget</p>
                    <p className="text-xl font-bold text-amber-500">{req.est_budget}</p>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto mt-2">
                    <Button variant="outline" onClick={() => updateJobStatus(req, 'declined')} className="flex-1 sm:flex-none border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-10 px-4 bg-transparent">Decline</Button>
                    <Button onClick={() => updateJobStatus(req, 'accepted')} className="flex-1 sm:flex-none bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold h-10 px-6 shadow-sm"><MessageSquare className="w-4 h-4 mr-2" /> Accept & Chat</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}