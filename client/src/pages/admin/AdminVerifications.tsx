import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  CheckCircle2, Eye, ShieldCheck, Clock, UserCheck,
  XCircle, FileText, AlertTriangle, X, ChevronDown, ChevronUp,
  Download
} from "lucide-react";

type VerificationRequest = {
  id: string;
  pro_id: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  submitted_at?: string;
  professionals: {
    full_name: string;
    email: string;
    category: string;
  };
};

export default function AdminVerifications() {
  const { verificationRequests, refreshData } = useOutletContext<{
    verificationRequests: VerificationRequest[];
    refreshData: () => void;
  }>();

  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [expandedSection, setExpandedSection] = useState<'approved' | 'rejected' | null>(null);

  const pending = verificationRequests?.filter(r => r.status === 'pending') ?? [];
  const approved = verificationRequests?.filter(r => r.status === 'approved') ?? [];
  const rejected = verificationRequests?.filter(r => r.status === 'rejected') ?? [];

  const getDocUrl = (path: string) =>
    supabase.storage.from('verification-docs').getPublicUrl(path).data.publicUrl;

  const handleApprove = async (req: VerificationRequest) => {
    setProcessing(req.id);
    await supabase.from('verification_requests').update({ status: 'approved' }).eq('id', req.id);
    await supabase.from('professionals').update({ is_verified: true }).eq('id', req.pro_id);
    refreshData();
    setProcessing(null);
  };

  const handleRejectSubmit = async (req: VerificationRequest) => {
    if (!rejectionReason.trim()) return;
    setProcessing(req.id);
    await supabase
      .from('verification_requests')
      .update({ status: 'rejected', rejection_reason: rejectionReason.trim() })
      .eq('id', req.id);
    refreshData();
    setProcessing(null);
    setRejectingId(null);
    setRejectionReason('');
  };

  const isImageUrl = (url: string) =>
    /\.(jpg|jpeg|png|webp|gif|bmp)(\?|$)/i.test(url);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-amber-500" />
          Verification Center
        </h1>
        <p className="text-slate-400 mt-1">Review submitted professional identity documents.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: pending.length, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Approved', count: approved.length, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Rejected', count: rejected.length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
        ].map(s => (
          <Card key={s.label} className={`${s.bg} border`}>
            <CardContent className="p-5 text-center">
              <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-slate-400 text-sm font-medium mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Section */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800 pb-4">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Review
            {pending.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">{pending.length}</span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-800">
          {pending.length === 0 ? (
            <div className="p-10 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-500/40 mx-auto mb-2" />
              <p className="text-slate-500 font-medium">All caught up — no pending requests.</p>
            </div>
          ) : pending.map(req => (
            <div key={req.id} className="p-6 space-y-4">
              {/* Pro Info */}
              <div className="flex items-start gap-4">
                <Avatar className="h-11 w-11 border border-slate-700 shrink-0">
                  <AvatarFallback className="bg-slate-800 text-slate-300 font-bold">
                    {req.professionals?.full_name?.[0] ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-white">{req.professionals?.full_name ?? 'Unknown'}</h4>
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs">
                      <Clock className="w-3 h-3 mr-1" /> Pending
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400">{req.professionals?.email}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{req.professionals?.category}</p>
                </div>
              </div>

              {/* Document Preview Strip */}
              <div className="flex items-center gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                <div className="p-2 bg-slate-800 rounded-lg">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-300 truncate">Identity Document</p>
                  <p className="text-xs text-slate-500 truncate">{req.document_url}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => setSelectedDocUrl(getDocUrl(req.document_url))}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> View
                  </Button>
                  <a
                    href={getDocUrl(req.document_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Rejection Reason Input */}
              {rejectingId === req.id && (
                <div className="space-y-2 p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <label className="text-sm font-semibold text-red-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Reason for Rejection
                  </label>
                  <textarea
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500/40"
                    rows={3}
                    placeholder="e.g., Document is blurry, expired ID, name mismatch..."
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                      onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                      disabled={!rejectionReason.trim() || processing === req.id}
                      onClick={() => handleRejectSubmit(req)}
                    >
                      {processing === req.id ? 'Rejecting...' : 'Confirm Reject'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {rejectingId !== req.id && (
                <div className="flex gap-3 pt-1">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    disabled={processing === req.id}
                    onClick={() => handleApprove(req)}
                  >
                    {processing === req.id
                      ? 'Approving...'
                      : <><ShieldCheck className="w-4 h-4 mr-2" /> Approve</>}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/15 hover:text-red-300 font-semibold"
                    onClick={() => setRejectingId(req.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Approved Section (collapsible) */}
      <CollapsibleSection
        title="Approved"
        icon={<UserCheck className="w-5 h-5 text-green-500" />}
        count={approved.length}
        countStyle="bg-green-500/20 text-green-400"
        isOpen={expandedSection === 'approved'}
        onToggle={() => setExpandedSection(expandedSection === 'approved' ? null : 'approved')}
      >
        {approved.length === 0
          ? <p className="p-8 text-center text-slate-500">No approved verifications yet.</p>
          : approved.map(req => (
            <div key={req.id} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-9 w-9 border border-slate-700 shrink-0">
                  <AvatarFallback className="bg-slate-800 text-slate-300 font-bold text-xs">
                    {req.professionals?.full_name?.[0] ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{req.professionals?.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{req.professionals?.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                  onClick={() => setSelectedDocUrl(getDocUrl(req.document_url))}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> View Doc
                </Button>
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                  <UserCheck className="w-3 h-3 mr-1" /> Approved
                </Badge>
              </div>
            </div>
          ))}
      </CollapsibleSection>

      {/* Rejected Section (collapsible) */}
      <CollapsibleSection
        title="Rejected"
        icon={<XCircle className="w-5 h-5 text-red-500" />}
        count={rejected.length}
        countStyle="bg-red-500/20 text-red-400"
        isOpen={expandedSection === 'rejected'}
        onToggle={() => setExpandedSection(expandedSection === 'rejected' ? null : 'rejected')}
      >
        {rejected.length === 0
          ? <p className="p-8 text-center text-slate-500">No rejected verifications.</p>
          : rejected.map(req => (
            <div key={req.id} className="p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0">
                <Avatar className="h-9 w-9 border border-slate-700 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-slate-800 text-slate-300 font-bold text-xs">
                    {req.professionals?.full_name?.[0] ?? '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{req.professionals?.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{req.professionals?.category}</p>
                  {req.rejection_reason && (
                    <p className="text-xs text-red-400/80 mt-1.5 bg-red-500/10 rounded-md px-2 py-1">
                      <span className="font-semibold">Reason:</span> {req.rejection_reason}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-white"
                  onClick={() => setSelectedDocUrl(getDocUrl(req.document_url))}
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" /> View Doc
                </Button>
                <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                  <XCircle className="w-3 h-3 mr-1" /> Rejected
                </Badge>
              </div>
            </div>
          ))}
      </CollapsibleSection>

      {/* Document Viewer Modal */}
      {selectedDocUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedDocUrl(null)}
        >
          <div
            className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span className="font-semibold text-white">Identity Document</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Open in new tab
                </a>
                <button
                  onClick={() => setSelectedDocUrl(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950/50">
              {isImageUrl(selectedDocUrl) ? (
                <img
                  src={selectedDocUrl}
                  alt="Verification document"
                  className="max-w-full max-h-full rounded-lg object-contain shadow-lg"
                />
              ) : (
                <iframe
                  src={selectedDocUrl}
                  className="w-full h-full min-h-[60vh] rounded-lg border border-slate-800"
                  title="Verification document"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Collapsible section wrapper ─────────────────────────────────────── */
function CollapsibleSection({
  title, icon, count, countStyle, isOpen, onToggle, children
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
  countStyle: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader
        className="cursor-pointer select-none border-b border-slate-800 pb-4 hover:bg-slate-800/40 transition-colors rounded-t-xl"
        onClick={onToggle}
      >
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            {icon}
            {title}
            {count > 0 && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${countStyle}`}>{count}</span>
            )}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent className="p-0 divide-y divide-slate-800">
          {children}
        </CardContent>
      )}
    </Card>
  );
}