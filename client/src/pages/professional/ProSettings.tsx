import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, ShieldAlert, KeyRound, Eye, EyeOff, CheckCircle2, 
  AlertCircle, X, User, Briefcase, MapPin, ShieldCheck, Search, UploadCloud,
  Smartphone, QrCode, Copy, Check, FileText, Clock, CalendarDays
} from "lucide-react";

const POPULAR_CATEGORIES = [
  "AC Service & Repair", "Plumbing", "Electrician", "Carpentry", 
  "Appliance Repair", "Deep Cleaning", "Mobile Car Wash", "Pest Control",
  "At-Home Salon", "Massage Therapy", "Personal Trainer", "Yoga Instructor",
  "Furniture Assembly", "Home Tech Support", "Dog Walking", "Home Tutor"
];

const libraries: ("places")[] = ['places'];

export default function ProSettings() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const [activeTab, setActiveTab] = useState<'security' | 'business' | 'locations' | 'verification'>('security');

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  // --- USER PROFILE STATE ---
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState(''); 

  // --- PRO PROFILE STATE ---
  const [proData, setProData] = useState({
    categories: [] as string[],
    experience: '', 
    bio: '', 
    service_locations: [] as { city: string, lat: number, lng: number }[],
    isVerified: false
  });
  
  const [categoryInput, setCategoryInput] = useState('');
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [autocompleteInput, setAutocompleteInput] = useState('');

  // --- VERIFICATION STATE ---
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [verificationReq, setVerificationReq] = useState<{
    id: string;
    status: string;
    url: string;
    created_at: string;
    rejection_reason: string | null;
  } | null>(null);

  // --- SECURITY STATE ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- 2FA STATE ---
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [hasCopied, setHasCopied] = useState(false);

  // --- DELETION STATE ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/login'); return; }
      
      setUserId(user.id);
      setUserEmail(user.email || '');
      setUserName(user.user_metadata?.full_name || 'N/A');

      const { data: profile } = await supabase.from('professionals').select('*').eq('id', user.id).single();
      if (profile) {
        setProData({
          categories: profile.category ? profile.category.split(',').map((c:string) => c.trim()).filter(Boolean) : [],
          experience: profile.experience || '',
          bio: profile.bio || '',
          service_locations: profile.service_locations || [], 
          isVerified: profile.is_verified || profile.verified || false
        });
        const rawPhone = profile.phone || user.user_metadata?.phone || '';
        setUserPhone(rawPhone.replace(/^\+91/, '').trim());
      }

      // Fetch latest verification request — includes rejection_reason
      const { data: vReq } = await supabase
        .from('verification_requests')
        .select('id, status, document_url, created_at, rejection_reason')
        .eq('pro_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (vReq) {
        const { data: urlData } = supabase.storage.from('verification-docs').getPublicUrl(vReq.document_url);
        setVerificationReq({
          id: vReq.id,
          status: vReq.status,
          url: urlData.publicUrl,
          created_at: vReq.created_at,
          rejection_reason: vReq.rejection_reason ?? null,
        });
      }

      const { data: mfaData, error } = await supabase.auth.mfa.listFactors();
      if (!error && mfaData) {
        const verifiedTotp = mfaData.totp.find((factor: any) => factor.status === 'verified');
        if (verifiedTotp) { setIs2FAEnabled(true); setFactorId(verifiedTotp.id); }
      }
    };
    
    fetchInitialData();
  }, [navigate]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setGlobalMessage({ type, text });
    setTimeout(() => setGlobalMessage(null), 5000);
  };

  const handleUpdatePersonalInfo = async () => {
    if (!userId) return;
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(userPhone)) return showMsg('error', "Please enter a valid 10-digit Indian mobile number.");
    const finalPhone = `+91${userPhone}`;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('professionals').update({ phone: finalPhone }).eq('id', userId);
      if (error) throw error;
      showMsg('success', 'Personal information updated successfully!');
    } catch (err: any) { showMsg('error', err.message); } finally { setIsProcessing(false); }
  };

  const handleUpdateBusinessProfile = async () => {
    if (!userId) return;
    if (proData.categories.length === 0) return showMsg('error', 'You must select at least one service category.');
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('professionals').update({
        category: proData.categories.join(', '), experience: proData.experience, bio: proData.bio
      }).eq('id', userId);
      if (error) throw error;
      showMsg('success', 'Business profile updated successfully!');
    } catch (err: any) { showMsg('error', err.message); } finally { setIsProcessing(false); }
  };

  const handleUpdateLocations = async () => {
    if (!userId) return;
    if (proData.service_locations.length === 0) return showMsg('error', 'You must add at least one operating location.');
    setIsProcessing(true);
    try {
      const cityString = proData.service_locations.map(loc => loc.city).join(', ');
      const { error } = await supabase.from('professionals').update({
        city: cityString, service_locations: proData.service_locations 
      }).eq('id', userId);
      if (error) throw error;
      showMsg('success', 'Service locations updated successfully!');
    } catch (err: any) { showMsg('error', err.message); } finally { setIsProcessing(false); }
  };

  const handleDocumentUpload = async () => {
    if (!uploadFile || !userId) return showMsg('error', 'Please select a document first.');
    setIsUploading(true);
    try {
      const fileExt = uploadFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('verification-docs').upload(fileName, uploadFile);
      if (uploadError) throw uploadError;

      if (verificationReq?.status === 'pending') {
        // REPLACE: update the existing pending row instead of inserting a new one
        const { error: dbError } = await supabase
          .from('verification_requests')
          .update({ document_url: fileName })
          .eq('id', verificationReq.id);
        if (dbError) throw dbError;
      } else {
        // NEW submission: insert a fresh row
        const { error: dbError } = await supabase
          .from('verification_requests')
          .insert([{ pro_id: userId, document_url: fileName, status: 'pending' }]);
        if (dbError) throw dbError;
      }

      const { data: urlData } = supabase.storage.from('verification-docs').getPublicUrl(fileName);
      setVerificationReq({
        id: verificationReq?.id ?? 'new-temp-id',
        status: 'pending',
        url: urlData.publicUrl,
        created_at: new Date().toISOString(),
        rejection_reason: null,
      });

      showMsg('success', 'Document submitted! It may take up to 72 hours to verify.');
      setUploadFile(null);
    } catch (err: any) { showMsg('error', err.message); } finally { setIsUploading(false); }
  };

  // --- CALC REJECTION COOLDOWN ---
  let canReapply = true;
  let daysRemaining = 0;
  if (verificationReq?.status === 'rejected') {
    const rejectDate = new Date(verificationReq.created_at).getTime();
    const diffDays = (Date.now() - rejectDate) / (1000 * 3600 * 24);
    if (diffDays < 7) {
      canReapply = false;
      daysRemaining = Math.ceil(7 - diffDays);
    }
  }

  // --- PRO MULTI-SELECT HELPERS ---
  const filteredCategories = POPULAR_CATEGORIES.filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()) && !proData.categories.includes(c));
  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !proData.categories.includes(trimmed)) setProData(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    setCategoryInput(''); setShowCategorySuggestions(false);
  };
  const removeCategory = (catToRemove: string) => setProData(prev => ({ ...prev, categories: prev.categories.filter(c => c !== catToRemove) }));

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        let cityName = place.name || autocompleteInput;
        place.address_components?.forEach(c => { if (c.types.includes('locality')) cityName = c.long_name; });
        if (!proData.service_locations.find(loc => loc.city === cityName)) {
          setProData(prev => ({ ...prev, service_locations: [...prev.service_locations, { city: cityName, lat, lng }] }));
        }
        setAutocompleteInput('');
      }
    }
  };
  const removeLocation = (cityToRemove: string) => setProData(prev => ({ ...prev, service_locations: prev.service_locations.filter(loc => loc.city !== cityToRemove) }));

  // --- ACCOUNT SECURITY LOGIC ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showMsg('error', "New passwords do not match.");
    if (newPassword.length < 6) return showMsg('error', "New password must be at least 6 characters.");
    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
        if (signInError) throw new Error("Incorrect current password.");
      }
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;
      showMsg('success', "Password updated successfully.");
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) { showMsg('error', error.message); } finally { setIsProcessing(false); }
  };

  const start2FAEnrollment = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setFactorId(data.id); setQrCodeSvg(data.totp.qr_code); setTotpSecret(data.totp.secret);
      setVerifyCode(''); setOtp(['', '', '', '', '', '']); setShow2FAModal(true);
    } catch (err: any) { showMsg('error', err.message); } finally { setIsProcessing(false); }
  };

  const verifyAndEnable2FA = async () => {
    setIsProcessing(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: factorId! });
      if (challenge.error) throw challenge.error;
      const verify = await supabase.auth.mfa.verify({ factorId: factorId!, challengeId: challenge.data.id, code: verifyCode });
      if (verify.error) throw verify.error;
      setIs2FAEnabled(true); setShow2FAModal(false); showMsg('success', "Two-Factor Authentication is now enabled!");
    } catch (err: any) { showMsg('error', "Invalid verification code. Please try again."); } finally { setIsProcessing(false); }
  };

  const disable2FA = async () => {
    if (!factorId) return;
    if (!window.confirm("Are you sure you want to disable 2FA?")) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      setIs2FAEnabled(false); setFactorId(null); showMsg('success', "2FA disabled.");
    } catch (err: any) { showMsg('error', err.message); } finally { setIsProcessing(false); }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; 
    const newOtp = [...otp]; newOtp[index] = value.slice(-1); setOtp(newOtp); setVerifyCode(newOtp.join(''));
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const newOtp = [...otp]; for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i];
    setOtp(newOtp); setVerifyCode(newOtp.join('')); inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };
  const copyToClipboard = () => { navigator.clipboard.writeText(totpSecret); setHasCopied(true); setTimeout(() => setHasCopied(false), 2000); };

  const executeAccountDeletion = async () => {
    setIsProcessing(true);
    const deletionDate = new Date(); deletionDate.setDate(deletionDate.getDate() + 30);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('professionals').update({ deletion_scheduled_at: deletionDate.toISOString() }).eq('id', user.id);
      if (!error) { await supabase.auth.signOut(); navigate('/login'); return; }
    }
    showMsg('error', "Failed to schedule deletion."); setIsProcessing(false);
  };

  if (!isLoaded) return <div className="min-h-screen pt-20 px-4 text-center text-slate-300 font-medium">Loading Workspace...</div>;

  return (
    <div className="min-h-screen font-sans pt-10 pb-64 px-4 bg-slate-950 text-slate-300">
      
      {/* --- 2FA SETUP MODAL --- */}
      {show2FAModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative border bg-slate-900 border-slate-800">
            <button onClick={() => setShow2FAModal(false)} className="absolute top-4 right-4 p-2 rounded-full transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800"><X className="h-5 w-5" /></button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-500/10"><QrCode className="w-8 h-8 text-blue-500" /></div>
              <h2 className="text-2xl font-bold mb-2 text-white">Set up 2FA</h2>
              <p className="text-sm leading-relaxed text-slate-400">Scan this QR code with your authenticator app, or copy the manual entry code below.</p>
            </div>
            <div className="flex justify-center mb-6 p-4 rounded-2xl border overflow-hidden bg-white border-slate-200">
               <div className="[&>svg]:w-40 [&>svg]:h-40 flex justify-center items-center mix-blend-multiply" dangerouslySetInnerHTML={{ __html: qrCodeSvg.replace(/^data:image\/svg\+xml;utf-8,/, '') }} />
            </div>
            <div className="mb-8">
              <p className="text-[11px] mb-1.5 uppercase font-bold tracking-wider ml-1 text-slate-500">Manual Entry Code</p>
              <div className="flex items-center justify-between p-1.5 pl-4 rounded-xl border bg-slate-950 border-slate-800">
                <code className="font-mono text-sm tracking-widest font-semibold truncate text-slate-300">{totpSecret}</code>
                <Button onClick={copyToClipboard} variant="ghost" size="sm" className={`h-8 w-8 p-0 rounded-lg hover:bg-slate-800 ${hasCopied ? 'text-green-500' : 'text-slate-500'}`}>
                  {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium ml-1 text-slate-300">Enter 6-digit code from app</Label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input key={index} ref={(el) => { inputRefs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} onPaste={handleOtpPaste} className="w-12 h-14 text-center text-xl font-bold rounded-xl transition-all bg-slate-950 border-slate-800 text-white focus-visible:ring-amber-500"/>
                  ))}
                </div>
              </div>
              <Button onClick={verifyAndEnable2FA} disabled={isProcessing || verifyCode.length !== 6} className="w-full h-12 text-base font-semibold transition-all active:scale-95 mt-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950">
                {isProcessing ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETION CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative border bg-slate-900 border-slate-800">
            <button onClick={() => {setShowDeleteModal(false); setDeleteConfirmation('');}} className="absolute top-4 right-4 p-2 rounded-full transition-colors text-slate-400 hover:text-slate-200 hover:bg-slate-800"><X className="h-5 w-5" /></button>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-red-500/10"><ShieldAlert className="w-8 h-8 text-red-500" /></div>
            <h2 className="text-2xl font-bold mb-2 text-white">Delete Account?</h2>
            <div className="p-4 rounded-xl text-sm leading-relaxed mb-6 border bg-red-500/10 border-red-500/20 text-red-400">Your account will be deactivated and placed into a <strong>30-day cooldown</strong>. If you do not log back in during this time, your account and all associated data will be permanently wiped.</div>
            <div className="space-y-3 mb-8">
              <Label htmlFor="confirm_delete" className="text-slate-300">To proceed, please type <span className="font-bold select-all px-1 rounded bg-slate-800 text-white">Delete my account</span> below:</Label>
              <Input id="confirm_delete" type="text" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} placeholder="Delete my account" className="h-12 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-red-500" />
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={executeAccountDeletion} disabled={isProcessing || deleteConfirmation !== "Delete my account"} className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:bg-red-500 transition-all">
                {isProcessing ? "Processing..." : "Sign Out & Schedule Deletion"}
              </Button>
              <Button onClick={() => {setShowDeleteModal(false); setDeleteConfirmation('');}} variant="outline" className="w-full h-12 text-base font-semibold transition-colors border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 bg-transparent">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium mb-4 transition-colors text-slate-400 hover:text-slate-200"><ArrowLeft className="h-4 w-4" /> Back</button>
          <h1 className="text-3xl font-bold tracking-tight text-white">Account Settings</h1>
          <p className="text-slate-400">Manage your business profile, service areas, and security preferences.</p>
        </div>

        {globalMessage && (
          <div className={`p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 border ${globalMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {globalMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
            <p className="font-medium text-sm">{globalMessage.text}</p>
          </div>
        )}

        {/* --- TABS NAV --- */}
        <div className="flex overflow-x-auto gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl scrollbar-hide">
          {[
            { id: 'security', icon: KeyRound, label: 'Account & Security' },
            { id: 'business', icon: Briefcase, label: 'Business Profile' },
            { id: 'locations', icon: MapPin, label: 'Service Areas' },
            { id: 'verification', icon: ShieldCheck, label: 'Verification' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* =========================================
            TAB 1: ACCOUNT & SECURITY
            ========================================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            <Card className="shadow-sm overflow-visible bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white"><User className="h-5 w-5 text-amber-500"/> Personal Information</CardTitle>
                <CardDescription className="text-slate-400">Your core account details and secure contact information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 max-w-md overflow-visible">
                <div className="space-y-2">
                  <Label className="font-medium text-slate-300">Full Name</Label>
                  <Input value={userName} readOnly className="cursor-not-allowed h-11 focus-visible:ring-0 bg-slate-950 border-slate-800 text-slate-500" />
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-slate-300">Email Address</Label>
                  <Input value={userEmail} readOnly className="cursor-not-allowed h-11 focus-visible:ring-0 bg-slate-950 border-slate-800 text-slate-500" />
                </div>
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <Label className="font-medium text-slate-300">Verified Contact Number</Label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 font-medium text-slate-400 pointer-events-none">+91</div>
                    <Input 
                      type="tel" maxLength={10} placeholder="98765 43210"
                      className="pl-12 h-11 bg-slate-950 border-slate-800 text-white focus-visible:ring-amber-500 font-medium tracking-wide"
                      value={userPhone} 
                      onChange={(e) => setUserPhone(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <p className="text-xs text-slate-500">Only valid 10-digit Indian numbers are accepted.</p>
                </div>
                <Button onClick={handleUpdatePersonalInfo} disabled={isProcessing} className="w-full h-11 font-semibold transition-transform active:scale-95 bg-amber-500 hover:bg-amber-600 text-slate-950">
                  {isProcessing ? "Saving..." : "Save Contact Info"}
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-sm overflow-visible bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white"><KeyRound className="h-5 w-5 text-amber-500"/> Change Password</CardTitle>
                <CardDescription className="text-slate-400">Ensure your account is using a long, random password.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
                <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                  <div className="space-y-2">
                    <Label className="font-medium text-slate-300">Current Password</Label>
                    <div className="relative flex items-center">
                      <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="pr-10 h-11 bg-slate-950 border-slate-800 text-white focus-visible:ring-amber-500" />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 text-slate-400 hover:text-slate-500">{showCurrent ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium text-slate-300">New Password</Label>
                    <div className="relative flex items-center">
                      <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="pr-10 h-11 bg-slate-950 border-slate-800 text-white focus-visible:ring-amber-500" />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 text-slate-400 hover:text-slate-500">{showNew ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium text-slate-300">Confirm New Password</Label>
                    <div className="relative flex items-center">
                      <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="pr-10 h-11 bg-slate-950 border-slate-800 text-white focus-visible:ring-amber-500" />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 text-slate-400 hover:text-slate-500">{showConfirm ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}</button>
                    </div>
                  </div>
                  <Button type="submit" disabled={isProcessing} className="w-full h-11 font-semibold transition-transform active:scale-95 bg-slate-800 hover:bg-slate-700 text-white">
                    {isProcessing && currentPassword ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="shadow-sm overflow-visible bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white"><Smartphone className="h-5 w-5 text-amber-500"/> Two-Factor Authentication</CardTitle>
                <CardDescription className="text-slate-400">Add an extra layer of security to your account.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-slate-200">{is2FAEnabled ? "2FA is currently enabled" : "2FA is currently disabled"}</p>
                    <p className="text-sm text-slate-400">{is2FAEnabled ? "Your account is secured with an extra step." : "We highly recommend enabling this."}</p>
                  </div>
                  <Button onClick={is2FAEnabled ? disable2FA : start2FAEnrollment} disabled={isProcessing} className={is2FAEnabled ? "h-11 font-semibold transition-colors bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 border" : "h-11 font-semibold transition-all active:scale-95 bg-amber-500 hover:bg-amber-600 text-slate-950"}>
                    {isProcessing && !show2FAModal ? "Loading..." : is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm overflow-visible bg-slate-900 border-red-900/30">
              <CardHeader><CardTitle className="text-red-500 flex items-center gap-2"><ShieldAlert className="h-5 w-5"/> Danger Zone</CardTitle></CardHeader>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-visible">
                <div>
                  <p className="font-medium text-slate-200">Delete Account</p>
                  <p className="text-sm max-w-md mt-1 text-slate-400">Permanently remove your account and data. This initiates a 30-day cooldown.</p>
                </div>
                <Button onClick={() => setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-8">Delete Account</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================
            TAB 2: BUSINESS PROFILE
            ========================================= */}
        {activeTab === 'business' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            <Card className="shadow-sm bg-slate-900 border-slate-800 overflow-visible">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white"><Briefcase className="h-5 w-5 text-amber-500"/> Service Details</CardTitle>
                <CardDescription className="text-slate-400">Update the services you offer and your bio to attract customers.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-3 relative overflow-visible">
                    <Label className="font-medium text-slate-300">Services Offered</Label>
                    {proData.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {proData.categories.map(cat => (
                          <Badge key={cat} variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-500 border-amber-500/20">
                            {cat} 
                            <button type="button" onClick={() => removeCategory(cat)} className="hover:text-red-400 transition-colors focus:outline-none ml-1"><X className="w-3.5 h-3.5 cursor-pointer" /></button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="relative flex items-center w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                      <Input 
                        value={categoryInput} 
                        onChange={(e) => { setCategoryInput(e.target.value); setShowCategorySuggestions(true); }}
                        onFocus={() => setShowCategorySuggestions(true)} 
                        onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(categoryInput); } }}
                        placeholder="Add another service..." 
                        className="w-full pl-10 h-11 pr-24 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500" 
                      />
                      <Button type="button" size="sm" onClick={() => addCategory(categoryInput)} className="absolute right-1.5 h-8 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950">Add</Button>
                    </div>
                    {showCategorySuggestions && categoryInput && filteredCategories.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 rounded-xl shadow-xl max-h-48 overflow-y-auto border bg-slate-800 border-slate-700">
                        {filteredCategories.map(cat => (
                          <div key={cat} onMouseDown={() => addCategory(cat)} className="p-3 text-sm cursor-pointer transition-colors text-slate-300 hover:bg-slate-700 hover:text-white">{cat}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium text-slate-300">Years of Experience</Label>
                    <Input value={proData.experience} onChange={(e) => setProData({...proData, experience: e.target.value})} placeholder="e.g. 5 Years" className="h-11 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-medium text-slate-300">Professional Bio</Label>
                    <textarea 
                      value={proData.bio} onChange={(e) => setProData({...proData, bio: e.target.value})} placeholder="Tell customers a bit about your expertise..." 
                      className="w-full min-h-[120px] p-3 rounded-xl border focus:outline-none focus:ring-2 text-sm resize-none bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:ring-amber-500"
                    />
                  </div>
                  <Button onClick={handleUpdateBusinessProfile} disabled={isProcessing} className="h-11 px-8 font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950">
                    {isProcessing ? "Saving..." : "Save Business Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================
            TAB 3: LOCATIONS
            ========================================= */}
        {activeTab === 'locations' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            <Card className="shadow-sm bg-slate-900 border-slate-800 overflow-visible">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white"><MapPin className="h-5 w-5 text-amber-500"/> Target Neighborhoods</CardTitle>
                <CardDescription className="text-slate-400">Search and configure your verified operating areas.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-3 relative overflow-visible">
                    <Label className="font-medium text-slate-300">Active Service Locations</Label>
                    {proData.service_locations.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {proData.service_locations.map(loc => (
                          <Badge key={loc.city} variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400 border-blue-500/20">
                            <MapPin className="w-3.5 h-3.5 opacity-70" />
                            {loc.city} 
                            <button type="button" onClick={() => removeLocation(loc.city)} className="hover:text-red-400 transition-colors focus:outline-none ml-1"><X className="w-3.5 h-3.5 cursor-pointer" /></button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 italic mb-4">No locations added. You will not appear in local searches.</div>
                    )}
                    <div className="relative flex items-center w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none z-10" />
                      <div className="w-full">
                        <Autocomplete
                          onLoad={(autocomplete) => { autocompleteRef.current = autocomplete; }}
                          onPlaceChanged={handlePlaceChanged}
                          options={{ componentRestrictions: { country: 'in' } }}
                        >
                          <Input 
                            placeholder="Search for a neighborhood or city via Google Places..." 
                            className="pl-10 h-11 w-full bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500"
                            value={autocompleteInput}
                            onChange={(e) => setAutocompleteInput(e.target.value)}
                          />
                        </Autocomplete>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Google Maps will instantly geocode your selections for exact proximity matches.</p>
                  </div>
                  <Button onClick={handleUpdateLocations} disabled={isProcessing || proData.service_locations.length === 0} className="h-11 px-8 font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950">
                    {isProcessing ? "Saving..." : "Save Locations"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================
            TAB 4: VERIFICATION
            ========================================= */}
        {activeTab === 'verification' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2">

            {/* 1. Fully Verified */}
            {proData.isVerified && (
              <Card className="shadow-sm border overflow-visible bg-green-500/10 border-green-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500/20 rounded-full">
                      <CheckCircle2 className="w-8 h-8 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-green-500 mb-1">Account Verified</h3>
                      <p className="text-green-400/80 text-sm">
                        Your identity has been confirmed. You now display a verification badge to customers, building trust and boosting your ranking.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 2. Pending */}
            {!proData.isVerified && verificationReq?.status === 'pending' && (
              <Card className="shadow-sm border overflow-visible bg-amber-500/10 border-amber-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-full">
                      <Clock className="w-6 h-6 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-amber-500 mb-1">Verification in Progress</h3>
                      <p className="text-amber-400/80 text-sm mb-5">
                        Your document has been safely received. Please allow up to 72 hours for our team to manually review your submission.
                      </p>
                      <div className="p-4 bg-slate-950/50 rounded-xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-slate-400" />
                          <div>
                            <p className="font-medium text-slate-200">Submitted Document</p>
                            <a href={verificationReq.url} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline flex items-center gap-1 mt-0.5">
                              <Eye className="w-3 h-3" /> View Submitted File
                            </a>
                          </div>
                        </div>
                        <Button variant="outline" onClick={() => document.getElementById('replace-doc-input')?.click()} className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 w-full sm:w-auto">
                          Replace File
                        </Button>
                        <input id="replace-doc-input" type="file" className="hidden" accept="image/*, application/pdf" onChange={(e) => { if(e.target.files) setUploadFile(e.target.files[0]); }} />
                      </div>
                      {uploadFile && (
                        <div className="mt-4 p-4 border border-slate-700 rounded-xl bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in zoom-in-95">
                          <span className="text-sm text-slate-300 font-medium truncate w-full sm:max-w-xs">{uploadFile.name}</span>
                          <div className="flex gap-2 w-full sm:w-auto">
                            <Button size="sm" variant="ghost" onClick={() => setUploadFile(null)} className="flex-1 sm:flex-none">Cancel</Button>
                            <Button size="sm" onClick={handleDocumentUpload} disabled={isUploading} className="flex-1 sm:flex-none bg-amber-500 text-black hover:bg-amber-600">
                              {isUploading ? "Uploading..." : "Confirm Replacement"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 3. Rejected — cooldown still active */}
            {!proData.isVerified && verificationReq?.status === 'rejected' && !canReapply && (
              <Card className="shadow-sm border overflow-visible bg-red-500/10 border-red-500/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/20 rounded-full">
                      <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-red-500 mb-1">Verification Rejected</h3>
                      <p className="text-red-400/80 text-sm mb-4">
                        Your document submission was rejected by our review team. Please read the reason below before reapplying.
                      </p>

                      {/* Rejection reason */}
                      {verificationReq.rejection_reason ? (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-0.5">Reason given by reviewer</p>
                            <p className="text-sm text-red-300">{verificationReq.rejection_reason}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 p-3 bg-slate-800/60 border border-slate-700 rounded-xl text-sm text-slate-400">
                          No specific reason was provided. Please ensure your document is clear, valid, and fully visible.
                        </div>
                      )}

                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 rounded-lg text-red-400 font-medium text-sm">
                        <CalendarDays className="w-4 h-4" />
                        You can reapply in {daysRemaining} day{daysRemaining === 1 ? '' : 's'}.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 4. Upload form — no request yet, or cooldown expired */}
            {!proData.isVerified && (!verificationReq || verificationReq.status === 'none' || (verificationReq.status === 'rejected' && canReapply)) && (
              <Card className="shadow-sm bg-slate-900 border-slate-800 overflow-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ShieldCheck className="h-5 w-5 text-amber-500"/> Submit Identity Proof
                  </CardTitle>
                  <CardDescription className="text-slate-400">Accepted documents: PAN Card, Driving License, or Passport.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-visible">
                  <div className="max-w-xl space-y-6">

                    {verificationReq?.status === 'rejected' && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-sm">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div className="text-red-400">
                          <p className="font-semibold mb-0.5">Previous application was rejected.</p>
                          {verificationReq.rejection_reason ? (
                            <p>Reason: <span className="italic">"{verificationReq.rejection_reason}"</span></p>
                          ) : (
                            <p>Please ensure your new document is clear, valid, and fully visible.</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:bg-slate-800/50 transition-colors relative cursor-pointer">
                      <input type="file" accept="image/*, application/pdf" onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                      <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      {uploadFile ? (
                        <div className="text-amber-500 font-medium">{uploadFile.name}</div>
                      ) : (
                        <>
                          <div className="font-semibold text-slate-300">Click to upload or drag and drop</div>
                          <div className="text-sm text-slate-500 mt-1">Image or PDF (max. 5MB)</div>
                        </>
                      )}
                    </div>
                    <Button onClick={handleDocumentUpload} disabled={!uploadFile || isUploading} className="w-full h-11 font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950">
                      {isUploading ? "Uploading..." : "Submit for Verification"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        )}

      </div>
    </div>
  );
}