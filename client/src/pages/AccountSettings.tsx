import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ShieldAlert, Smartphone, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, X, QrCode, Copy, Check } from "lucide-react";

export default function AccountSettings() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // --- PASSWORD STATE ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // --- 2FA STATE ---
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccess, setMfaSuccess] = useState<string | null>(null);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [hasCopied, setHasCopied] = useState(false);

  // --- DELETION STATE ---
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // --- INITIALIZE MFA STATUS ---
  useEffect(() => {
    const checkMFAStatus = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) return;
      const verifiedTotp = data.totp.find((factor: any) => factor.status === 'verified');
      if (verifiedTotp) {
        setIs2FAEnabled(true);
        setFactorId(verifiedTotp.id);
      }
    };
    checkMFAStatus();
  }, []);

  // --- PASSWORD LOGIC ---
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters.");
      return;
    }

    setIsProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (signInError) throw new Error("Incorrect current password.");
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      setPassSuccess("Your password has been successfully updated.");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPassError(error.message || "An error occurred while updating your password.");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- 2FA LOGIC ---
  const start2FAEnrollment = async () => {
    setIsProcessing(true);
    setMfaError(null);
    setMfaSuccess(null);
    
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    setIsProcessing(false);
    
    if (error) {
      setMfaError(error.message);
      return;
    }

    setFactorId(data.id);
    setQrCodeSvg(data.totp.qr_code);
    setTotpSecret(data.totp.secret);
    
    setVerifyCode('');
    setOtp(['', '', '', '', '', '']);
    setShow2FAModal(true);
  };

  const verifyAndEnable2FA = async () => {
    setIsProcessing(true);
    setMfaError(null);
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
      setMfaSuccess("Two-Factor Authentication is now enabled!");
    } catch (err: any) {
      setMfaError("Invalid verification code. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const disable2FA = async () => {
    if (!factorId) return;
    const confirm = window.confirm("Are you sure you want to disable 2FA? This will make your account significantly less secure.");
    if (!confirm) return;

    setIsProcessing(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setIsProcessing(false);

    if (error) {
      setMfaError(error.message);
    } else {
      setIs2FAEnabled(false);
      setFactorId(null);
      setMfaSuccess("Two-Factor Authentication has been disabled.");
    }
  };

  // --- OTP INPUT HANDLERS ---
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; 
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); 
    setOtp(newOtp);
    setVerifyCode(newOtp.join(''));

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
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

  // --- DELETION LOGIC ---
  const executeAccountDeletion = async () => {
    setIsProcessing(true);
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const role = user.user_metadata?.role || 'customer';
      const tableName = role === 'professional' ? 'professionals' : 'customers';

      const { error } = await supabase
        .from(tableName)
        .update({ deletion_scheduled_at: deletionDate.toISOString() })
        .eq('id', user.id);

      if (error) {
        console.error("Error scheduling deletion:", error);
        alert("Failed to schedule deletion. Please try again.");
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 py-10 px-4">
      
      {/* --- 2FA SETUP MODAL --- */}
      {show2FAModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button onClick={() => setShow2FAModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Set up 2FA</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Scan this QR code with your authenticator app, or copy the manual entry code below.
              </p>
            </div>

            <div className="flex justify-center mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner overflow-hidden">
               <div 
                 className="[&>svg]:w-40 [&>svg]:h-40 flex justify-center items-center mix-blend-multiply" 
                 dangerouslySetInnerHTML={{ __html: qrCodeSvg.replace(/^data:image\/svg\+xml;utf-8,/, '') }} 
               />
            </div>

            <div className="mb-8">
              <p className="text-[11px] text-slate-500 mb-1.5 uppercase font-bold tracking-wider ml-1">Manual Entry Code</p>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-1.5 pl-4 rounded-xl shadow-sm">
                <code className="text-slate-800 font-mono text-sm tracking-widest font-semibold truncate">
                  {totpSecret}
                </code>
                <Button 
                  onClick={copyToClipboard} variant="ghost" size="sm" 
                  className={`h-8 w-8 p-0 rounded-lg hover:bg-slate-200 ${hasCopied ? 'text-green-600 hover:text-green-700' : 'text-slate-500'}`}
                >
                  {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {mfaError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2 text-sm animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="font-medium">{mfaError}</p>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-900 font-medium ml-1">Enter 6-digit code from app</Label>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)} onPaste={handleOtpPaste}
                      className="w-12 h-14 text-center text-xl font-bold bg-white border-slate-300 focus-visible:ring-blue-600 rounded-xl shadow-sm transition-all"
                    />
                  ))}
                </div>
              </div>
              <Button onClick={verifyAndEnable2FA} disabled={isProcessing || verifyCode.length !== 6} className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 mt-4 rounded-xl">
                {isProcessing ? "Verifying..." : "Verify & Enable"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- CUSTOM DELETION MODAL WITH TEXT CONFIRMATION --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative">
            <button onClick={closeDeleteModal} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Delete Account?</h2>
            
            <div className="bg-red-50 text-red-900 p-4 rounded-xl text-sm leading-relaxed mb-6 border border-red-100">
              Your account will be deactivated and placed into a <strong>30-day cooldown</strong>. If you do not log back in during this time, your account and all associated data will be permanently wiped.
            </div>

            <div className="space-y-3 mb-8">
              <Label htmlFor="confirm_delete" className="text-slate-700">
                To proceed, please type <span className="font-bold select-all bg-slate-100 px-1 rounded">Delete my account</span> below:
              </Label>
              <Input id="confirm_delete" type="text" value={deleteConfirmation} onChange={(e) => setDeleteConfirmation(e.target.value)} placeholder="Delete my account" className="h-12 border-slate-300 focus-visible:ring-red-500 bg-slate-50" />
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={executeAccountDeletion} disabled={isProcessing || deleteConfirmation !== "Delete my account"} className="w-full h-12 text-base font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:bg-red-400 transition-all">
                {isProcessing ? "Processing..." : "Sign Out & Schedule Deletion"}
              </Button>
              <Button onClick={closeDeleteModal} variant="outline" className="w-full h-12 text-base font-semibold border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <div>
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-slate-500">Manage your security preferences and account status.</p>
        </div>

        {/* --- CHANGE PASSWORD CARD --- */}
        <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-blue-600"/> Change Password</CardTitle>
            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
          </CardHeader>
          <CardContent>
            {passSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="font-medium text-sm">{passSuccess}</p>
              </div>
            )}
            {passError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="font-medium text-sm">{passError}</p>
              </div>
            )}
            <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="current_password" className="text-slate-900 font-medium">Current Password</Label>
                <div className="relative flex items-center">
                  <Input id="current_password" type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="pr-10 bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-600 h-11" />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 text-slate-400 hover:text-slate-600">
                    {showCurrent ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_password" className="text-slate-900 font-medium">New Password</Label>
                <div className="relative flex items-center">
                  <Input id="new_password" type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="pr-10 bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-600 h-11" />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 text-slate-400 hover:text-slate-600">
                    {showNew ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm_password" className="text-slate-900 font-medium">Confirm New Password</Label>
                <div className="relative flex items-center">
                  <Input id="confirm_password" type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="pr-10 bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-600 h-11" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 text-slate-400 hover:text-slate-600">
                    {showConfirm ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white mt-2 h-11 px-8 font-semibold transition-transform active:scale-95">
                {isProcessing && currentPassword ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* --- TWO-FACTOR AUTH CARD --- */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Smartphone className="h-5 w-5 text-blue-600"/> Two-Factor Authentication (2FA)</CardTitle>
            <CardDescription>Add an extra layer of security to your account using an authenticator app.</CardDescription>
          </CardHeader>
          <CardContent>
            {mfaSuccess && !show2FAModal && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                <p className="font-medium text-sm">{mfaSuccess}</p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-slate-900">{is2FAEnabled ? "2FA is currently enabled" : "2FA is currently disabled"}</p>
                <p className="text-sm text-slate-500">{is2FAEnabled ? "Your account is secured with an extra step." : "We highly recommend enabling this."}</p>
              </div>
              <Button onClick={is2FAEnabled ? disable2FA : start2FAEnrollment} disabled={isProcessing} className={is2FAEnabled ? "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold h-11 transition-colors" : "bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 transition-all active:scale-95"}>
                {isProcessing && !show2FAModal ? "Loading..." : is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- DANGER ZONE CARD --- */}
        <Card className="border-red-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2"><ShieldAlert className="h-5 w-5"/> Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="font-medium text-slate-900">Delete Account</p>
              <p className="text-sm text-slate-500 max-w-md mt-1">
                Permanently remove your account and all of your data from ServNect. This will initiate a 30-day deletion cooldown.
              </p>
            </div>
            <Button onClick={() => setShowDeleteModal(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-8 rounded-lg shadow-sm shrink-0">
              Delete Account
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}