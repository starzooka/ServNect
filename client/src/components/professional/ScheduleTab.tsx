import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MapPin, CalendarDays, MessageSquare, CheckCircle2, Wallet } from "lucide-react";

export default function ScheduleTab({ scheduledJobs, setActiveChat, completeJob }: any) {
  const [jobToComplete, setJobToComplete] = useState<any | null>(null);
  const [earnedAmount, setEarnedAmount] = useState('');

  const handleCompletionSubmit = () => {
    if (!jobToComplete) return;
    completeJob(jobToComplete.id, Number(earnedAmount) || 0);
    setJobToComplete(null);
    setEarnedAmount('');
  };

  return (
    <>
      {/* COMPLETION POPUP (HONOR SYSTEM) */}
      {jobToComplete && (
        <div className="fixed inset-0 z-[110] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4"><Wallet className="w-6 h-6 text-green-500" /></div>
            <h3 className="text-xl font-bold text-white">Log your earnings</h3>
            <p className="text-slate-400 text-sm mt-1 mb-6">Great job! Enter the final amount collected from {jobToComplete.customer_name} to update your total earnings.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Final Amount (₹)</label>
                <Input 
                  type="number" 
                  placeholder="e.g. 1500" 
                  value={earnedAmount}
                  onChange={(e) => setEarnedAmount(e.target.value)}
                  className="mt-1 bg-slate-950 border-slate-800 text-white h-12 text-lg font-bold"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => setJobToComplete(null)} variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</Button>
                <Button onClick={handleCompletionSubmit} className="flex-1 bg-green-500 hover:bg-green-600 text-slate-950 font-bold">Save & Complete</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {scheduledJobs.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-slate-800 rounded-2xl text-slate-500">
            <p>You have no upcoming scheduled jobs.</p>
          </div>
        ) : (
          scheduledJobs.map((job: any) => (
            <Card key={job.id} className="border-slate-800 bg-slate-900 shadow-sm rounded-2xl overflow-hidden relative hover:border-slate-700 transition-colors">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
              <CardContent className="p-5 sm:p-6 pl-6 sm:pl-8">
                <div className="flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">Upcoming</Badge>
                      <span className="text-sm font-semibold text-slate-400 flex items-center gap-1"><CalendarDays className="w-4 h-4"/> {job.scheduled_time}</span>
                    </div>
                    <h3 className="font-bold text-lg text-white mt-2">{job.service_type}</h3>
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-1"><MapPin className="w-4 h-4"/> {job.address}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-10 w-10 border border-slate-700 shadow-sm"><AvatarFallback className="bg-amber-500/10 text-amber-500">{job.customer_name[0]}</AvatarFallback></Avatar>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Customer</p>
                        <p className="text-sm font-bold text-white">{job.customer_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 w-full justify-end">
                      <Button onClick={() => setActiveChat(job)} variant="outline" size="sm" className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-9 px-3">
                        <MessageSquare className="w-4 h-4 sm:mr-1.5" /> <span className="hidden sm:inline">Message</span>
                      </Button>
                      <Button onClick={() => setJobToComplete(job)} size="sm" className="bg-green-500 hover:bg-green-600 text-slate-950 font-bold h-9 px-4 shadow-sm">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Complete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}