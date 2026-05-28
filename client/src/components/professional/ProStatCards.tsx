import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, TrendingUp, Star } from "lucide-react";

interface ProStatCardsProps {
  earnings: number;
  completedCount: number;
  proRating: { average: number; count: number };
}

export default function ProStatCards({ earnings, completedCount, proRating }: ProStatCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="bg-slate-900 border-slate-800 shadow-sm rounded-2xl">
        <CardContent className="p-5 flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Total Earned</p>
          <p className="text-2xl font-bold text-white">₹{earnings.toLocaleString()}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-slate-900 border-slate-800 shadow-sm rounded-2xl">
        <CardContent className="p-5 flex flex-col justify-center">
          <p className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Completed</p>
          <p className="text-2xl font-bold text-white">{completedCount} Jobs</p>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-sm rounded-2xl col-span-2 md:col-span-2 bg-gradient-to-br from-amber-600 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 blur-2xl rounded-full"></div>
        <CardContent className="p-5 flex items-center justify-between h-full relative z-10">
          <div>
            <p className="text-amber-100 font-medium mb-1 flex items-center gap-1.5"><Star className="w-4 h-4 fill-amber-100" /> Current Rating</p>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{proRating.count > 0 ? proRating.average.toFixed(1) : 'New'}</p>
              <p className="text-amber-100 text-sm">
                {proRating.count > 0 ? `${proRating.count} ${proRating.count === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}