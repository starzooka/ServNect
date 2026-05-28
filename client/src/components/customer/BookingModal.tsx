import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { X, Wrench, MapPin, CalendarDays, MessageSquare } from "lucide-react";

export default function BookingModal({ selectedPro, setSelectedPro, bookingForm, setBookingForm, handleBookService, isBooking }: any) {
  if (!selectedPro) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
        <button onClick={() => setSelectedPro(null)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"><X className="h-5 w-5" /></button>
        
        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
          <Avatar className="h-14 w-14 border border-slate-100 shadow-sm">
            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{selectedPro.full_name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Book {selectedPro.full_name.split(' ')[0]}</h2>
            <p className="text-sm text-slate-500">{selectedPro.category}</p>
          </div>
        </div>

        <form onSubmit={handleBookService} className="space-y-4">
          <div className="space-y-2">
            <Label>What is the issue?</Label>
            <div className="relative flex items-center">
              <Wrench className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input required value={bookingForm.issue} onChange={(e) => setBookingForm({...bookingForm, issue: e.target.value})} placeholder="e.g. Leaking kitchen sink" className="pl-9 h-11" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Preferred Date & Time</Label>
            <div className="relative flex items-center">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input required value={bookingForm.scheduled_time} onChange={(e) => setBookingForm({...bookingForm, scheduled_time: e.target.value})} placeholder="e.g. Tomorrow at 2:00 PM" className="pl-9 h-11" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Your Address</Label>
            <div className="relative flex items-center">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input required value={bookingForm.address} onChange={(e) => setBookingForm({...bookingForm, address: e.target.value})} placeholder="e.g. Apt 4B, Green Valley" className="pl-9 h-11" />
            </div>
          </div>
          
          <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 flex items-start gap-3 mt-4">
            <MessageSquare className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 leading-relaxed">
              <strong>Assessment First:</strong> The professional will review your request and inspect the issue. The final price will be quoted after discussion.
            </p>
          </div>

          <Button type="submit" disabled={isBooking} className="w-full h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white mt-2">
            {isBooking ? "Sending Request..." : "Request Inspection"}
          </Button>
        </form>
      </div>
    </div>
  );
}