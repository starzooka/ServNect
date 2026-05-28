import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, CheckCircle2, X, CalendarDays, IndianRupee, MessageSquare, Star } from "lucide-react";

export default function BookingsTab({ 
  myBookings, setActiveTab, setActiveChat, setCancelBookingId, 
  setReviewBooking, setReviewRating, setReviewComment 
}: any) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Activity</h1>
        <p className="text-slate-500 mt-1">Track the status of your service requests.</p>
      </div>
      
      {myBookings.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-slate-300 rounded-3xl bg-white text-slate-500">
          <p>You haven't made any booking requests yet.</p>
          <Button onClick={() => setActiveTab('discover')} variant="outline" className="mt-4 border-slate-300 text-blue-600 font-bold hover:bg-slate-50">Browse Professionals</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {myBookings.map((booking: any) => {
            let statusBadge;
            switch(booking.status) {
              case 'pending': statusBadge = <Badge className="bg-amber-100 text-amber-700 border-none shadow-none font-bold"><Clock className="w-3.5 h-3.5 mr-1" /> Pending Pro Approval</Badge>; break;
              case 'accepted': statusBadge = <Badge className="bg-green-100 text-green-700 border-none shadow-none font-bold"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Accepted! Pro is scheduled</Badge>; break;
              case 'declined': statusBadge = <Badge className="bg-red-100 text-red-700 border-none shadow-none font-bold"><X className="w-3.5 h-3.5 mr-1" /> Declined by Pro</Badge>; break;
              case 'completed': statusBadge = <Badge className="bg-blue-100 text-blue-700 border-none shadow-none font-bold"><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Job Completed</Badge>; break;
              default: statusBadge = <Badge variant="outline">{booking.status}</Badge>;
            }
            return (
              <Card key={booking.id} className="border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                <div className={`w-full h-1 ${booking.status === 'accepted' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-amber-400' : booking.status === 'completed' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
                <CardContent className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="mb-3">{statusBadge}</div>
                      <h3 className="font-bold text-lg text-slate-900 leading-tight">{booking.service_type}</h3>
                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md"><CalendarDays className="w-3.5 h-3.5"/> {booking.scheduled_time}</span>
                        <span className="text-xs font-semibold text-slate-600 flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md text-amber-600"><IndianRupee className="w-3.5 h-3.5"/> {booking.est_budget}</span>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center sm:min-w-[200px]">
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Assigned Professional</p>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200 shadow-sm"><AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{booking.professional?.full_name[0] || 'P'}</AvatarFallback></Avatar>
                        <div>
                          <p className="font-bold text-slate-900 text-sm leading-tight">{booking.professional?.full_name || 'Loading...'}</p>
                          <p className="text-slate-500 text-xs">{booking.professional?.category || 'Professional'}</p>
                        </div>
                      </div>
                      
                      {booking.status === 'accepted' && (
                        <Button onClick={() => setActiveChat(booking)} className="w-full mt-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold h-9 shadow-none text-sm transition-colors"><MessageSquare className="w-3.5 h-3.5 mr-1.5" /> Message Pro</Button>
                      )}

                      {booking.status === 'pending' && (
                        <Button onClick={() => setCancelBookingId(booking.id)} variant="outline" className="w-full mt-3 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold h-9 shadow-none text-sm transition-colors">
                          Cancel Request
                        </Button>
                      )}

                      {booking.status === 'completed' && (
                        <Button onClick={() => { setReviewBooking(booking); setReviewRating(5); setReviewComment(''); }} className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold h-9 shadow-sm text-sm transition-colors">
                          <Star className="w-3.5 h-3.5 mr-1.5 fill-current" /> Rate Service
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}