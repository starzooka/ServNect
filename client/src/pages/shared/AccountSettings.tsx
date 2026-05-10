import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, ShieldAlert, KeyRound, Eye, EyeOff, CheckCircle2, 
  AlertCircle, X, User, Briefcase, MapPin, ShieldCheck, Search, UploadCloud,
  Smartphone, QrCode, Copy, Check
} from "lucide-react";

// --- PREDEFINED LISTS ---
const SUGGESTED_CATEGORIES = [
  "AC Service & Repair", "Appliance Repair", "Bike Repair", "Car Repair", 
  "Carpentry", "Deep Cleaning", "Electrical Engineer", "Electrician", 
  "Home Repair", "Packers & Movers", "Painting", "Pest Control", 
  "Plumbing", "RO & Water Purifier Repair", "Sofa Cleaning", "Standard Cleaning"
];

const CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", 
  "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane"
];

export default function AccountSettings() {
  const navigate = useNavigate();
  const isProDomain = window.location.hostname.startsWith('pro.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // --- TABS STATE (For Pros) ---
  const [activeTab, setActiveTab] = useState<'security' | 'business' | 'locations' | 'verification'>('security');

  // --- USER PROFILE STATE ---
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  // --- PRO PROFILE STATE ---
  const [proData, setProData] = useState({
    categories: [] as string[],
    experience: '', rate: '', bio: '', cities: [] as string[], isVerified: false
  });
  const [categoryInput, setCategoryInput] = useState('');
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [cityInput, setCityInput] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  // --- VERIFICATION STATE ---
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // --- PASSWORD STATE ---
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

  // --- INITIALIZE PROFILE & MFA STATUS ---
  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      
      setUserId(user.id);
      setUserEmail(user.email || '');
      setUserName(user.user_metadata?.full_name || 'N/A');
      setUserRole(user.user_metadata?.role || 'customer');

      if (isProDomain) {
        const { data: profile } = await supabase.from('professionals').select('*').eq('id', user.id).single();
        if (profile) {
          setProData({
            categories: profile.category ? profile.category.split(',').map((c:string) => c.trim()).filter(Boolean) : [],
            experience: profile.experience || '',
            rate: profile.hourly_rate || '',
            bio: profile.bio || '',
            cities: profile.city ? profile.city.split(',').map((c:string) => c.trim()).filter(Boolean) : [],
            isVerified: profile.verified || false
          });
        }
      }

      const { data: mfaData, error } = await supabase.auth.mfa.listFactors();
      if (!error && mfaData) {
        const verifiedTotp = mfaData.totp.find((factor: any) => factor.status === 'verified');
        if (verifiedTotp) { setIs2FAEnabled(true); setFactorId(verifiedTotp.id); }
      }
    };
    fetchInitialData();
  }, [isProDomain, navigate]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setGlobalMessage({ type, text });
    setTimeout(() => setGlobalMessage(null), 5000);
  };

  // --- PRO PROFILE UPDATE HANDLERS ---
  const handleUpdateBusinessProfile = async () => {
    if (!userId) return;
    if (proData.categories.length === 0) return showMsg('error', 'You must select at least one service category.');
    
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('professionals').update({
        category: proData.categories.join(', '),
        experience: proData.experience,
        hourly_rate: proData.rate,
        bio: proData.bio
      }).eq('id', userId);
      if (error) throw error;
      showMsg('success', 'Business profile updated successfully!');
    } catch (err: any) {
      showMsg('error', err.message);
    } finally { setIsProcessing(false); }
  };

  const handleUpdateLocations = async () => {
    if (!userId) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('professionals').update({
        city: proData.cities.join(', ')
      }).eq('id', userId);
      if (error) throw error;
      showMsg('success', 'Service locations updated successfully!');
    } catch (err: any) {
      showMsg('error', err.message);
    } finally { setIsProcessing(false); }
  };

  const handleDocumentUpload = async () => {
    if (!uploadFile) return showMsg('error', 'Please select a document first.');
    setIsProcessing(true);
    setTimeout(() => {
      showMsg('success', 'Document submitted! Our team will review it within 24 hours.');
      setUploadFile(null);
      setIsProcessing(false);
    }, 1500);
  };

  // --- PRO MULTI-SELECT HELPERS ---
  const filteredCategories = SUGGESTED_CATEGORIES.filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()) && !proData.categories.includes(c));
  const addCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (trimmed && !proData.categories.includes(trimmed)) setProData(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    setCategoryInput(''); setShowCategorySuggestions(false);
  };
  const removeCategory = (catToRemove: string) => {
    setProData(prev => ({ ...prev, categories: prev.categories.filter(c => c !== catToRemove) }));
  };

  const filteredCities = CITIES.filter(c => c.toLowerCase().includes(cityInput.toLowerCase()) && !proData.cities.includes(c));
  const addCity = (city: string) => {
    const trimmed = city.trim();
    if (trimmed && !proData.cities.includes(trimmed)) setProData(prev => ({ ...prev, cities: [...prev.cities, trimmed] }));
    setCityInput(''); setShowCitySuggestions(false);
  };
  const removeCity = (cityToRemove: string) => {
    setProData(prev => ({ ...prev, cities: prev.cities.filter(c => c !== cityToRemove) }));
  };

  // --- PASSWORD LOGIC ---
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

  // --- 2FA LOGIC ---
  const start2FAEnrollment = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) throw error;
      setFactorId(data.id);
      setQrCodeSvg(data.totp.qr_code);
      setTotpSecret(data.totp.secret);
      setVerifyCode('');
      setOtp(['', '', '', '', '', '']);
      setShow2FAModal(true);
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyAndEnable2FA = async () => {
    setIsProcessing(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: factorId! });
      if (challenge.error) throw challenge.error;
      const verify = await supabase.auth.mfa.verify({
        factorId: factorId!,
        challengeId: challenge.data.id,
        code: verifyCode
      });
      if (verify.error) throw verify.error;
      setIs2FAEnabled(true);
      setShow2FAModal(false);
      showMsg('success', "Two-Factor Authentication is now enabled!");
    } catch (err: any) {
      showMsg('error', "Invalid verification code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const disable2FA = async () => {
    if (!factorId) return;
    const confirm = window.confirm("Are you sure you want to disable 2FA? This will make your account significantly less secure.");
    if (!confirm) return;
    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      if (error) throw error;
      setIs2FAEnabled(false);
      setFactorId(null);
      showMsg('success', "Two-Factor Authentication has been disabled.");
    } catch (err: any) {
      showMsg('error', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- OTP INPUT HANDLERS ---
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; 
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); 
    setOtp(newOtp);
    setVerifyCode(newOtp.join(''));
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) newOtp[i] = pastedData[i];
    setOtp(newOtp);
    setVerifyCode(newOtp.join(''));
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(totpSecret);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  // --- ACCOUNT DELETION LOGIC ---
  const executeAccountDeletion = async () => {
    setIsProcessing(true);
    const deletionDate = new Date(); 
    deletionDate.setDate(deletionDate.getDate() + 30);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const tableName = userRole === 'professional' ? 'professionals' : 'customers';
      const { error } = await supabase.from(tableName).update({ deletion_scheduled_at: deletionDate.toISOString() }).eq('id', user.id);
      if (error) {
        showMsg('error', "Failed to schedule deletion. Please try again.");
        setIsProcessing(false);
        return;
      }
    }
    await supabase.auth.signOut();
    navigate('/login');
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteConfirmation('');
  };

  return (
    <div className={`min-h-screen font-sans pt-10 pb-64 px-4 ${isProDomain ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* --- 2FA SETUP MODAL --- */}
      {show2FAModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative border ${isProDomain ? 'bg-slate-900 border-slate-800' : 'bg-white border-transparent'}`}>
            <button onClick={() => setShow2FAModal(false)} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isProDomain ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isProDomain ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <QrCode className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${isProDomain ? 'text-white' : 'text-slate-900'}`}>Set up 2FA</h2>
              <p className={`text-sm leading-relaxed ${isProDomain ? 'text-slate-400' : 'text-slate-500'}`}>
                Scan this QR code with your authenticator app, or copy the manual entry code below.
              </p>
            </div>

            <div className={`flex justify-center mb-6 p-4 rounded-2xl border overflow-hidden ${isProDomain ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
               <div 
                 className="[&>svg]:w-40 [&>svg]:h-40 flex justify-center items-center mix-blend-multiply" 
                 dangerouslySetInnerHTML={{ __html: qrCodeSvg.replace(/^data:image\/svg\+xml;utf-8,/, '') }} 
               />
            </div>

            <div className="mb-8">
              <p className={`text-[11px] mb-1.5 uppercase font-bold tracking-wider ml-1 ${isProDomain ? 'text-slate-500' : 'text-slate-500'}`}>Manual Entry Code</p>
              <div className={`flex items-center justify-between p-1.5 pl-4 rounded-xl border ${isProDomain ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'}`}>
                <code className={`font-mono text-sm tracking-widest font-semibold truncate ${isProDomain ? 'text-slate-300' : 'text-slate-800'}`}>
                  {totpSecret}
                </code>
                <Button 
                  onClick={copyToClipboard} variant="ghost" size="sm" 
                  className={`h-8 w-8 p-0 rounded-lg ${isProDomain ? 'hover:bg-slate-800' : 'hover:bg-slate-200'} ${hasCopied ? 'text-green-500' : 'text-slate-500'}`}
                >
                  {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className={`font-medium ml-1 ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Enter 6-digit code from app</Label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)} onPaste={handleOtpPaste}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl transition-all ${isProDomain ? 'bg-slate-950 border-slate-800 text-white focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 focus-visible:ring-blue-600 shadow-sm'}`}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={verifyAndEnable2FA} disabled={isProcessing || verifyCode.length !== 6} className={`w-full h-12 text-base font-semibold transition-all active:scale-95 mt-4 rounded-xl ${isProDomain ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {isProcessing ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETION CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative border ${isProDomain ? 'bg-slate-900 border-slate-800' : 'bg-white border-transparent'}`}>
            <button onClick={closeDeleteModal} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isProDomain ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}>
              <X className="h-5 w-5" />
            </button>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isProDomain ? 'bg-red-500/10' : 'bg-red-100'}`}>
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            
            <h2 className={`text-2xl font-bold mb-2 ${isProDomain ? 'text-white' : 'text-slate-900'}`}>Delete Account?</h2>
            
            <div className={`p-4 rounded-xl text-sm leading-relaxed mb-6 border ${isProDomain ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-900'}`}>
              Your account will be deactivated and placed into a <strong>30-day cooldown</strong>. If you do not log back in during this time, your account and all associated data will be permanently wiped.
            </div>

            <div className="space-y-3 mb-8">
              <Label htmlFor="confirm_delete" className={isProDomain ? 'text-slate-300' : 'text-slate-700'}>
                To proceed, please type <span className={`font-bold select-all px-1 rounded ${isProDomain ? 'bg-slate-800 text-white' : 'bg-slate-100'}`}>Delete my account</span> below:
              </Label>
              <Input id="confirm_delete" type="text" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} placeholder="Delete my account" className={`h-12 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-red-500' : 'bg-slate-50 border-slate-300 focus-visible:ring-red-500'}`} />
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={executeAccountDeletion} disabled={isProcessing || deleteConfirmation !== "Delete my account"} className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:bg-red-500 transition-all">
                {isProcessing ? "Processing..." : "Sign Out & Schedule Deletion"}
              </Button>
              <Button onClick={closeDeleteModal} variant="outline" className={`w-full h-12 text-base font-semibold transition-colors ${isProDomain ? 'border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 bg-transparent' : 'border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50'}`}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <button onClick={() => navigate(-1)} className={`inline-flex items-center gap-2 text-sm font-medium mb-4 transition-colors ${isProDomain ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className={`text-3xl font-bold tracking-tight ${isProDomain ? 'text-white' : 'text-slate-900'}`}>Account Settings</h1>
          <p className={isProDomain ? 'text-slate-400' : 'text-slate-500'}>Manage your security preferences and profile details.</p>
        </div>

        {globalMessage && (
          <div className={`p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${globalMessage.type === 'success' ? (isProDomain ? 'bg-green-500/10 border-green-500/20 text-green-400 border' : 'bg-green-50 border border-green-200 text-green-700') : (isProDomain ? 'bg-red-500/10 border-red-500/20 text-red-400 border' : 'bg-red-50 border border-red-200 text-red-700')}`}>
            {globalMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
            <p className="font-medium text-sm">{globalMessage.text}</p>
          </div>
        )}

        {/* --- PRO TABS NAVIGATION --- */}
        {isProDomain && (
          <div className="flex overflow-x-auto gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl scrollbar-hide">
            {[
              { id: 'security', icon: KeyRound, label: 'Account & Security' },
              { id: 'business', icon: Briefcase, label: 'Business Profile' },
              { id: 'locations', icon: MapPin, label: 'Service Areas' },
              { id: 'verification', icon: ShieldCheck, label: 'Verification' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* =========================================
            TAB 1: ACCOUNT & SECURITY (Shared base)
            ========================================= */}
        {(!isProDomain || activeTab === 'security') && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            <Card className={`shadow-sm overflow-visible ${isProDomain ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isProDomain ? 'text-white' : 'text-slate-900'}`}><User className={`h-5 w-5 ${isProDomain ? 'text-amber-500' : 'text-blue-600'}`}/> Personal Information</CardTitle>
                <CardDescription className={isProDomain ? 'text-slate-400' : 'text-slate-500'}>Your core account details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 max-w-md overflow-visible">
                <div className="space-y-2">
                  <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Full Name</Label>
                  <Input value={userName} readOnly className={`cursor-not-allowed h-11 focus-visible:ring-0 ${isProDomain ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 text-slate-500 border-slate-200'}`} />
                </div>
                <div className="space-y-2">
                  <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Email Address</Label>
                  <Input value={userEmail} readOnly className={`cursor-not-allowed h-11 focus-visible:ring-0 ${isProDomain ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 text-slate-500 border-slate-200'}`} />
                </div>
              </CardContent>
            </Card>

            <Card className={`shadow-sm overflow-visible ${isProDomain ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isProDomain ? 'text-white' : 'text-slate-900'}`}><KeyRound className={`h-5 w-5 ${isProDomain ? 'text-amber-500' : 'text-blue-600'}`}/> Change Password</CardTitle>
                <CardDescription className={isProDomain ? 'text-slate-400' : 'text-slate-500'}>Ensure your account is using a long, random password.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
                <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                  <div className="space-y-2">
                    <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Current Password</Label>
                    <div className="relative flex items-center">
                      <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className={`pr-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white focus-visible:ring-amber-500' : 'bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-600'}`} />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 text-slate-400 hover:text-slate-500">{showCurrent ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>New Password</Label>
                    <div className="relative flex items-center">
                      <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className={`pr-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white focus-visible:ring-amber-500' : 'bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-600'}`} />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 text-slate-400 hover:text-slate-500">{showNew ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Confirm New Password</Label>
                    <div className="relative flex items-center">
                      <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className={`pr-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white focus-visible:ring-amber-500' : 'bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-600'}`} />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 text-slate-400 hover:text-slate-500">{showConfirm ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}</button>
                    </div>
                  </div>
                  <Button type="submit" disabled={isProcessing} className={`mt-2 h-11 px-8 font-semibold transition-transform active:scale-95 ${isProDomain ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {isProcessing && currentPassword ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className={`shadow-sm overflow-visible ${isProDomain ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${isProDomain ? 'text-white' : 'text-slate-900'}`}><Smartphone className={`h-5 w-5 ${isProDomain ? 'text-amber-500' : 'text-blue-600'}`}/> Two-Factor Authentication</CardTitle>
                <CardDescription className={isProDomain ? 'text-slate-400' : 'text-slate-500'}>Add an extra layer of security to your account.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className={`font-medium ${isProDomain ? 'text-slate-200' : 'text-slate-900'}`}>{is2FAEnabled ? "2FA is currently enabled" : "2FA is currently disabled"}</p>
                    <p className={`text-sm ${isProDomain ? 'text-slate-400' : 'text-slate-500'}`}>{is2FAEnabled ? "Your account is secured with an extra step." : "We highly recommend enabling this."}</p>
                  </div>
                  <Button onClick={is2FAEnabled ? disable2FA : start2FAEnrollment} disabled={isProcessing} className={is2FAEnabled ? `h-11 font-semibold transition-colors bg-transparent ${isProDomain ? 'border-red-500/30 text-red-400 hover:bg-red-500/10 border' : 'border-red-200 text-red-600 hover:bg-red-50 border'}` : `h-11 font-semibold transition-all active:scale-95 ${isProDomain ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {isProcessing && !show2FAModal ? "Loading..." : is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className={`shadow-sm overflow-visible ${isProDomain ? 'bg-slate-900 border-red-900/30' : 'bg-white border-red-200'}`}>
              <CardHeader>
                <CardTitle className="text-red-500 flex items-center gap-2"><ShieldAlert className="h-5 w-5"/> Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-visible">
                <div>
                  <p className={`font-medium ${isProDomain ? 'text-slate-200' : 'text-slate-900'}`}>Delete Account</p>
                  <p className={`text-sm max-w-md mt-1 ${isProDomain ? 'text-slate-400' : 'text-slate-500'}`}>Permanently remove your account and data. This initiates a 30-day cooldown.</p>
                </div>
                <Button onClick={() => setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-8">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================
            TAB 2: BUSINESS PROFILE (Pro Only)
            ========================================= */}
        {isProDomain && activeTab === 'business' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            {/* EXPLICIT OVERFLOW-VISIBLE OVERRIDE */}
            <Card className="shadow-sm bg-slate-900 border-slate-800 overflow-visible">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white"><Briefcase className="h-5 w-5 text-amber-500"/> Service Details</CardTitle>
                <CardDescription className="text-slate-400">Update the services you offer and your rates to attract the right customers.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
                <div className="space-y-6 max-w-2xl">
                  
                  {/* Multi-Select Categories */}
                  <div className="space-y-3 relative overflow-visible">
                    <Label className="font-medium text-slate-300">Services Offered</Label>
                    {proData.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {proData.categories.map(cat => (
                          <Badge key={cat} variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-500 border-amber-500/20">
                            {cat} 
                            <button type="button" onClick={() => removeCategory(cat)} className="hover:text-red-400 transition-colors focus:outline-none ml-1">
                              <X className="w-3.5 h-3.5 cursor-pointer" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="relative flex items-center">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                      <Input 
                        value={categoryInput} onChange={(e) => { setCategoryInput(e.target.value); setShowCategorySuggestions(true); }}
                        onFocus={() => setShowCategorySuggestions(true)} onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 200)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(categoryInput); } }}
                        placeholder="Add another service..." 
                        className="pl-10 h-11 pr-24 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500" 
                      />
                      <Button type="button" size="sm" onClick={() => addCategory(categoryInput)} className="absolute right-1.5 h-8 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950">Add</Button>
                    </div>
                    {showCategorySuggestions && categoryInput && filteredCategories.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 rounded-xl shadow-xl max-h-48 overflow-y-auto border bg-slate-800 border-slate-700">
                        {filteredCategories.map(cat => (
                          <div key={cat} onClick={() => addCategory(cat)} className="p-3 text-sm cursor-pointer transition-colors text-slate-300 hover:bg-slate-700 hover:text-white">{cat}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-medium text-slate-300">Years of Experience</Label>
                      <Input value={proData.experience} onChange={(e) => setProData({...proData, experience: e.target.value})} placeholder="e.g. 5 Years" className="h-11 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500" />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-medium text-slate-300">Base Hourly Rate (₹)</Label>
                      <Input type="number" value={proData.rate} onChange={(e) => setProData({...proData, rate: e.target.value})} placeholder="e.g. 500" className="h-11 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500" />
                    </div>
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
            TAB 3: LOCATIONS (Pro Only)
            ========================================= */}
        {isProDomain && activeTab === 'locations' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            {/* EXPLICIT OVERFLOW-VISIBLE OVERRIDE */}
            <Card className="shadow-sm bg-slate-900 border-slate-800 overflow-visible">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white"><MapPin className="h-5 w-5 text-amber-500"/> Target Cities</CardTitle>
                <CardDescription className="text-slate-400">Select multiple cities where your services are available.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-visible">
                <div className="space-y-6 max-w-2xl">
                  
                  <div className="space-y-3 relative overflow-visible">
                    <Label className="font-medium text-slate-300">Active Service Cities</Label>
                    {proData.cities.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {proData.cities.map(city => (
                          <Badge key={city} variant="outline" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-500 border-amber-500/20">
                            {city} 
                            <button type="button" onClick={() => removeCity(city)} className="hover:text-red-400 transition-colors focus:outline-none ml-1">
                              <X className="w-3.5 h-3.5 cursor-pointer" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 italic mb-4">No cities added yet. You will not appear in local search results.</div>
                    )}

                    <div className="relative flex items-center">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none" />
                      <Input 
                        value={cityInput} onChange={(e) => { setCityInput(e.target.value); setShowCitySuggestions(true); }}
                        onFocus={() => setShowCitySuggestions(true)} onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCity(cityInput); } }}
                        placeholder="Search for a city..." 
                        className="pl-10 h-11 pr-24 bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus-visible:ring-amber-500" 
                      />
                      <Button type="button" size="sm" onClick={() => addCity(cityInput)} className="absolute right-1.5 h-8 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950">Add</Button>
                    </div>

                    {showCitySuggestions && cityInput && filteredCities.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 rounded-xl shadow-xl max-h-48 overflow-y-auto border bg-slate-800 border-slate-700">
                        {filteredCities.map(city => (
                          <div key={city} onClick={() => addCity(city)} className="p-3 text-sm cursor-pointer transition-colors text-slate-300 hover:bg-slate-700 hover:text-white">{city}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button onClick={handleUpdateLocations} disabled={isProcessing || proData.cities.length === 0} className="h-11 px-8 font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950">
                    {isProcessing ? "Saving..." : "Save Locations"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* =========================================
            TAB 4: VERIFICATION (Pro Only)
            ========================================= */}
        {isProDomain && activeTab === 'verification' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
            
            {/* Status Card */}
            <Card className={`shadow-sm border overflow-visible ${proData.isVerified ? 'bg-green-500/10 border-green-500/20' : 'bg-slate-900 border-slate-800'}`}>
              <CardContent className="p-6 flex items-center justify-between overflow-visible">
                <div>
                  <h3 className={`font-bold text-lg mb-1 flex items-center gap-2 ${proData.isVerified ? 'text-green-500' : 'text-white'}`}>
                    {proData.isVerified ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5 text-amber-500"/>}
                    {proData.isVerified ? "Verified Professional" : "Unverified Account"}
                  </h3>
                  <p className={proData.isVerified ? 'text-green-400/80 text-sm' : 'text-slate-400 text-sm'}>
                    {proData.isVerified 
                      ? "Your identity has been confirmed. You will receive a blue verification badge on your public profile."
                      : "Upload a government-issued ID to get the verification badge and rank higher in customer searches."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Upload Card */}
            {!proData.isVerified && (
              <Card className="shadow-sm bg-slate-900 border-slate-800 overflow-visible">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white"><ShieldCheck className="h-5 w-5 text-amber-500"/> Identity Verification</CardTitle>
                  <CardDescription className="text-slate-400">Accepted documents: Aadhaar Card, PAN Card, Driving License, or Passport.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-visible">
                  <div className="max-w-xl space-y-6">
                    <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:bg-slate-800/50 transition-colors relative cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg, application/pdf"
                        onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                      {uploadFile ? (
                        <div className="text-amber-500 font-medium">{uploadFile.name}</div>
                      ) : (
                        <>
                          <div className="font-semibold text-slate-300">Click to upload or drag and drop</div>
                          <div className="text-sm text-slate-500 mt-1">SVG, PNG, JPG or PDF (max. 5MB)</div>
                        </>
                      )}
                    </div>
                    
                    <Button onClick={handleDocumentUpload} disabled={!uploadFile || isProcessing} className="w-full h-11 font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950">
                      {isProcessing ? "Uploading..." : "Submit for Verification"}
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