import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, ShieldAlert, KeyRound, Eye, EyeOff, CheckCircle2, 
  AlertCircle, X, User, Smartphone, QrCode, Copy, Check
} from "lucide-react";

export default function CustomerSettings() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // --- USER PROFILE STATE ---
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

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
    } finally { setIsProcessing(false); }
  };

  const verifyAndEnable2FA = async () => {
    setIsProcessing(true);
    try {
      const challenge = await supabase.auth.mfa.challenge({ factorId: factorId! });
      if (challenge.error) throw challenge.error;
      const verify = await supabase.auth.mfa.verify({ factorId: factorId!, challengeId: challenge.data.id, code: verifyCode });
      if (verify.error) throw verify.error;
      setIs2FAEnabled(true);
      setShow2FAModal(false);
      showMsg('success', "Two-Factor Authentication is now enabled!");
    } catch (err: any) {
      showMsg('error', "Invalid verification code. Please try again.");
    } finally { setIsProcessing(false); }
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
    } catch (err: any) { showMsg('error', err.message); } finally { setIsProcessing(false); }
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

  return (
    <div className="min-h-screen font-sans pt-10 pb-64 px-4 bg-slate-50 text-slate-900">
      
      {/* --- 2FA SETUP MODAL --- */}
      {show2FAModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative border bg-white border-transparent">
            <button onClick={() => setShow2FAModal(false)} className="absolute top-4 right-4 p-2 rounded-full transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-50"><QrCode className="w-8 h-8 text-blue-500" /></div>
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Set up 2FA</h2>
              <p className="text-sm leading-relaxed text-slate-500">Scan this QR code with your authenticator app, or copy the manual entry code below.</p>
            </div>
            <div className="flex justify-center mb-6 p-4 rounded-2xl border overflow-hidden bg-slate-50 border-slate-200 shadow-inner">
               <div className="[&>svg]:w-40 [&>svg]:h-40 flex justify-center items-center mix-blend-multiply" dangerouslySetInnerHTML={{ __html: qrCodeSvg.replace(/^data:image\/svg\+xml;utf-8,/, '') }} />
            </div>
            <div className="mb-8">
              <p className="text-[11px] mb-1.5 uppercase font-bold tracking-wider ml-1 text-slate-500">Manual Entry Code</p>
              <div className="flex items-center justify-between p-1.5 pl-4 rounded-xl border bg-slate-50 border-slate-200 shadow-sm">
                <code className="font-mono text-sm tracking-widest font-semibold truncate text-slate-800">{totpSecret}</code>
                <Button onClick={copyToClipboard} variant="ghost" size="sm" className={`h-8 w-8 p-0 rounded-lg hover:bg-slate-200 ${hasCopied ? 'text-green-500' : 'text-slate-500'}`}>
                  {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-medium ml-1 text-slate-900">Enter 6-digit code from app</Label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input key={index} ref={(el) => { inputRefs.current[index] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleOtpChange(index, e.target.value)} onKeyDown={(e) => handleOtpKeyDown(index, e)} onPaste={handleOtpPaste} className="w-12 h-14 text-center text-xl font-bold rounded-xl transition-all bg-white border-slate-300 text-slate-900 focus-visible:ring-blue-600 shadow-sm"/>
                  ))}
                </div>
              </div>
              <Button onClick={verifyAndEnable2FA} disabled={isProcessing || verifyCode.length !== 6} className="w-full h-12 text-base font-semibold transition-all active:scale-95 mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white">
                {isProcessing ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETION CONFIRMATION MODAL --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative border bg-white border-transparent">
            <button onClick={() => {setShowDeleteModal(false); setDeleteConfirmation('');}} className="absolute top-4 right-4 p-2 rounded-full transition-colors text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-red-100"><ShieldAlert className="w-8 h-8 text-red-500" /></div>
            <h2 className="text-2xl font-bold mb-2 text-slate-900">Delete Account?</h2>
            <div className="p-4 rounded-xl text-sm leading-relaxed mb-6 border bg-red-50 border-red-100 text-red-900">Your account will be deactivated and placed into a <strong>30-day cooldown</strong>. If you do not log back in during this time, your account and all associated data will be permanently wiped.</div>
            <div className="space-y-3 mb-8">
              <Label htmlFor="confirm_delete" className="text-slate-700">To proceed, please type <span className="font-bold select-all px-1 rounded bg-slate-100">Delete my account</span> below:</Label>
              <Input id="confirm_delete" type="text" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} placeholder="Delete my account" className="h-12 bg-slate-50 border-slate-300 focus-visible:ring-red-500" />
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={executeAccountDeletion} disabled={isProcessing || deleteConfirmation !== "Delete my account"} className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:bg-red-500 transition-all">
                {isProcessing ? "Processing..." : "Sign Out & Schedule Deletion"}
              </Button>
              <Button onClick={() => {setShowDeleteModal(false); setDeleteConfirmation('');}} variant="outline" className="w-full h-12 text-base font-semibold transition-colors border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium mb-4 transition-colors text-slate-500 hover:text-slate-900"><ArrowLeft className="h-4 w-4" /> Back</button>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Settings</h1>
          <p className="text-slate-500">Manage your security preferences and profile details.</p>
        </div>

        {globalMessage && (
          <div className={`p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${globalMessage.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
            {globalMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
            <p className="font-medium text-sm">{globalMessage.text}</p>
          </div>
        )}

        <div className="space-y-6">
          <Card className="shadow-sm overflow-visible bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900"><User className="h-5 w-5 text-blue-600"/> Personal Information</CardTitle>
              <CardDescription className="text-slate-500">Your core account details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 max-w-md overflow-visible">
              <div className="space-y-2">
                <Label className="font-medium text-slate-900">Full Name</Label>
                <Input value={userName} readOnly className="cursor-not-allowed h-11 focus-visible:ring-0 bg-slate-50 text-slate-500 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-slate-900">Email Address</Label>
                <Input value={userEmail} readOnly className="cursor-not-allowed h-11 focus-visible:ring-0 bg-slate-50 text-slate-500 border-slate-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm overflow-visible bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900"><KeyRound className="h-5 w-5 text-blue-600"/> Change Password</CardTitle>
              <CardDescription className="text-slate-500">Ensure your account is using a long, random password.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-visible">
              <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
                <div className="space-y-2">
                  <Label className="font-medium text-slate-900">Current Password</Label>
                  <div className="relative flex items-center">
                    <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="pr-10 h-11 bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-600" />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 text-slate-400 hover:text-slate-500">{showCurrent ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-slate-900">New Password</Label>
                  <div className="relative flex items-center">
                    <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="pr-10 h-11 bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-600" />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 text-slate-400 hover:text-slate-500">{showNew ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-medium text-slate-900">Confirm New Password</Label>
                  <div className="relative flex items-center">
                    <Input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="pr-10 h-11 bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-600" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 text-slate-400 hover:text-slate-500">{showConfirm ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}</button>
                  </div>
                </div>
                <Button type="submit" disabled={isProcessing} className="mt-2 h-11 px-8 font-semibold transition-transform active:scale-95 bg-blue-600 hover:bg-blue-700 text-white">
                  {isProcessing && currentPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="shadow-sm overflow-visible bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900"><Smartphone className="h-5 w-5 text-blue-600"/> Two-Factor Authentication</CardTitle>
              <CardDescription className="text-slate-500">Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-visible">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-900">{is2FAEnabled ? "2FA is currently enabled" : "2FA is currently disabled"}</p>
                  <p className="text-sm text-slate-500">{is2FAEnabled ? "Your account is secured with an extra step." : "We highly recommend enabling this."}</p>
                </div>
                <Button onClick={is2FAEnabled ? disable2FA : start2FAEnrollment} disabled={isProcessing} className={is2FAEnabled ? "h-11 font-semibold transition-colors bg-transparent border-red-200 text-red-600 hover:bg-red-50 border" : "h-11 font-semibold transition-all active:scale-95 bg-blue-600 hover:bg-blue-700 text-white"}>
                  {isProcessing && !show2FAModal ? "Loading..." : is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm overflow-visible bg-white border-red-200">
            <CardHeader><CardTitle className="text-red-500 flex items-center gap-2"><ShieldAlert className="h-5 w-5"/> Danger Zone</CardTitle></CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-visible">
              <div>
                <p className="font-medium text-slate-900">Delete Account</p>
                <p className="text-sm max-w-md mt-1 text-slate-500">Permanently remove your account and data. This initiates a 30-day cooldown.</p>
              </div>
              <Button onClick={() => setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-8">Delete Account</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}