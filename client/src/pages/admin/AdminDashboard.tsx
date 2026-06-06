import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck, Clock, Users, Briefcase,
  ArrowRight, FileText, UserCheck
} from "lucide-react";

export default function AdminDashboard() {
  const { customers, professionals, verificationRequests } = useOutletContext<any>();
  const navigate = useNavigate();

  // Correctly derived stats
  const totalCustomers = customers?.length ?? 0;
  const totalPros = professionals?.length ?? 0;
  const verifiedPros = professionals?.filter((p: any) => p.is_verified || p.verified)?.length ?? 0;
  const pendingVerifications = verificationRequests?.filter((r: any) => r.status === 'pending') ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-1">Platform overview and pending actions.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Customers</p>
                <p className="text-4xl font-black text-white">{totalCustomers}</p>
              </div>
              <div className="p-2.5 bg-blue-500/10 rounded-xl">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Total registered customers</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Professionals</p>
                <p className="text-4xl font-black text-white">{totalPros}</p>
              </div>
              <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                <Briefcase className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Total registered pros</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Verified Pros</p>
                <p className="text-4xl font-black text-white">{verifiedPros}</p>
              </div>
              <div className="p-2.5 bg-green-500/10 rounded-xl">
                <UserCheck className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              {totalPros > 0 ? `${Math.round((verifiedPros / totalPros) * 100)}% of all pros` : 'No pros yet'}
            </p>
          </CardContent>
        </Card>

        <Card
          className={`border transition-colors cursor-pointer ${
            pendingVerifications.length > 0
              ? 'bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
          onClick={() => pendingVerifications.length > 0 && navigate('/admin/verifications')}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${pendingVerifications.length > 0 ? 'text-amber-500/70' : 'text-slate-500'}`}>
                  Pending Reviews
                </p>
                <p className={`text-4xl font-black ${pendingVerifications.length > 0 ? 'text-amber-400' : 'text-white'}`}>
                  {pendingVerifications.length}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${pendingVerifications.length > 0 ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                <ShieldCheck className={`w-5 h-5 ${pendingVerifications.length > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
              </div>
            </div>
            <p className={`text-xs mt-3 ${pendingVerifications.length > 0 ? 'text-amber-500/60' : 'text-slate-500'}`}>
              {pendingVerifications.length > 0 ? 'Click to review now →' : 'All caught up'}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Pending Verification Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Pending Verification Requests</h2>
            <p className="text-sm text-slate-500 mt-0.5">Professionals waiting for document review</p>
          </div>
          {pendingVerifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/verifications')}
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white gap-1.5"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {pendingVerifications.length === 0 ? (
          <Card className="bg-slate-900/50 border-dashed border-slate-800">
            <CardContent className="p-10 text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6 text-green-500/60" />
              </div>
              <h3 className="font-bold text-white mb-1">All clear!</h3>
              <p className="text-slate-500 text-sm">No pending verification requests right now.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {pendingVerifications.slice(0, 5).map((req: any) => (
              <Card key={req.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10 border border-slate-700 shrink-0">
                        <AvatarFallback className="bg-slate-800 text-slate-300 font-bold text-sm">
                          {req.professionals?.full_name?.[0] ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-white truncate">{req.professionals?.full_name ?? 'Unknown'}</p>
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs shrink-0">
                            <Clock className="w-2.5 h-2.5 mr-1" /> Pending
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-400 truncate">{req.professionals?.category ?? 'No category'}</p>
                        <p className="text-xs text-slate-500 truncate">{req.professionals?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <FileText className="w-4 h-4 text-slate-400" />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate('/admin/verifications')}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {pendingVerifications.length > 5 && (
              <button
                onClick={() => navigate('/admin/verifications')}
                className="w-full py-3 text-sm font-semibold text-slate-400 hover:text-white border border-dashed border-slate-800 hover:border-slate-700 rounded-xl transition-colors"
              >
                +{pendingVerifications.length - 5} more — View all in Verifications
              </button>
            )}
          </div>
        )}
      </div>

      {/* Platform Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recent Customers */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Recent Customers
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/users')}
                className="text-slate-400 hover:text-white text-xs gap-1"
              >
                All <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-3">
              {customers?.slice(0, 4).map((c: any) => (
                <div key={c.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-slate-700 shrink-0">
                    <AvatarFallback className="bg-slate-800 text-slate-300 font-bold text-xs">
                      {c.full_name?.[0] ?? 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{c.full_name || 'Unnamed'}</p>
                    <p className="text-xs text-slate-500 truncate">{c.email}</p>
                  </div>
                  <p className="text-xs text-slate-600 shrink-0">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                  </p>
                </div>
              ))}
              {(!customers || customers.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">No customers yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Pros */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" /> Recent Professionals
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/users')}
                className="text-slate-400 hover:text-white text-xs gap-1"
              >
                All <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-3">
              {professionals?.slice(0, 4).map((p: any) => (
                <div key={p.id} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 border border-slate-700 shrink-0">
                    <AvatarFallback className="bg-indigo-500/10 text-indigo-400 font-bold text-xs">
                      {p.full_name?.[0] ?? 'P'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{p.full_name || 'Unnamed'}</p>
                    <p className="text-xs text-slate-500 truncate">{p.category || 'No category'}</p>
                  </div>
                  {(p.is_verified || p.verified) ? (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs shrink-0">Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 border-slate-700 text-xs shrink-0">Unverified</Badge>
                  )}
                </div>
              ))}
              {(!professionals || professionals.length === 0) && (
                <p className="text-sm text-slate-500 text-center py-4">No professionals yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}