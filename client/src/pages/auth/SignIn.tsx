import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, ArrowLeft, Mail, Lock, AlertCircle, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function SignIn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isProDomain = window.location.hostname.startsWith('pro.');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isResetMode, setIsResetMode] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [deletionDate, setDeletionDate] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data.user) {
      if (isProDomain) {
        // --- PRO DOMAIN LOGIC ---
        const { data: proProfile } = await supabase
          .from('professionals')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (proProfile?.deletion_scheduled_at) {
          const deletedOn = new Date(proProfile.deletion_scheduled_at);
          const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
          setDeletionDate(deletedOn.toLocaleDateString(undefined, formatOptions));
          setShowRestoreModal(true);
        } else if (!proProfile || !proProfile.category) {
          // If no fully set up pro profile exists, send to Onboarding
          navigate('/onboarding');
        } else {
          // Fully set up, send to Dashboard
          navigate('/dashboard'); 
        }

      } else {
        // --- CUSTOMER DOMAIN LOGIC ---
        const { data: customerProfile } = await supabase
          .from('customers')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (customerProfile?.deletion_scheduled_at) {
          const deletedOn = new Date(customerProfile.deletion_scheduled_at);
          const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
          setDeletionDate(deletedOn.toLocaleDateString(undefined, formatOptions));
          setShowRestoreModal(true);
        } else {
          // --- SILENT CROSSOVER CREATION ---
          // If a Pro logs into the Customer side for the first time, auto-generate their customer row
          if (!customerProfile) {
            await supabase.from('customers').upsert({
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || '',
              email: data.user.email || '',
              phone: data.user.user_metadata?.phone || null
            });
          }
          navigate('/home'); 
        }
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setErrorMsg("Please enter your email address first.");
    setIsLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
    setIsLoading(false);
    if (error) setErrorMsg(error.message);
    else setResetSuccess(true);
  };

  const handleRestoreAccount = async () => {
    setIsRestoring(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const role = user.user_metadata?.role || 'customer';
      const tableName = role === 'professional' ? 'professionals' : 'customers';
      await supabase.from(tableName).update({ deletion_scheduled_at: null }).eq('id', user.id);
    }
    setIsRestoring(false);
    setShowRestoreModal(false);
    navigate(isProDomain ? '/dashboard' : '/home'); 
  };

  const handleCancelLogin = async () => {
    await supabase.auth.signOut();
    setShowRestoreModal(false);
    setPassword(''); 
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isProDomain ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob ${isProDomain ? 'bg-amber-600' : 'bg-blue-300'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000 ${isProDomain ? 'bg-orange-600' : 'bg-indigo-300'}`}></div>

      {showRestoreModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative text-center ${isProDomain ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${isProDomain ? 'bg-red-500/10' : 'bg-red-50'}`}>
              <ShieldAlert className="w-10 h-10 text-red-500" />
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${isProDomain ? 'text-white' : 'text-slate-900'}`}>Account Scheduled for Deletion</h2>
            <div className={`p-4 rounded-xl text-sm leading-relaxed border mb-6 text-left ${isProDomain ? 'bg-slate-950 text-slate-400 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
              Your account is currently in a deletion cooldown and will be permanently wiped on <strong>{deletionDate}</strong>. <br/><br/>
              Logging in will cancel this deletion process and fully restore your account.
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={handleRestoreAccount} disabled={isRestoring} className={`w-full h-12 text-base font-semibold ${isProDomain ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                {isRestoring ? "Restoring Account..." : "Login and Cancel Deletion"}
              </Button>
              <Button onClick={handleCancelLogin} variant="outline" className={`w-full h-12 text-base font-semibold ${isProDomain ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                Go Back (Do Not Login)
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link to="/" className={`inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors ${isProDomain ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'}`}>
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`${isProDomain ? 'bg-amber-500' : 'bg-blue-600'} p-2 rounded-xl shadow-sm`}><Wrench className={`h-6 w-6 ${isProDomain ? 'text-slate-950' : 'text-white'}`} /></div>
            <span className={`text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isProDomain ? 'from-amber-400 to-orange-500' : 'from-blue-600 to-indigo-600'}`}>
              ServNect {isProDomain && <span className="font-normal text-amber-500">Partner</span>}
            </span>
          </div>
        </div>

        <Card className={`shadow-xl backdrop-blur-xl transition-all duration-300 ${isProDomain ? 'bg-slate-900/95 border-slate-800 shadow-amber-900/10' : 'bg-white/95 border-slate-200/60'}`}>
          
          {resetSuccess ? (
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isProDomain ? 'bg-green-500/10' : 'bg-green-100'}`}>
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h2 className={`text-2xl font-bold ${isProDomain ? 'text-white' : 'text-slate-900'}`}>Check your email</h2>
              <p className={`text-sm leading-relaxed ${isProDomain ? 'text-slate-400' : 'text-slate-500'}`}>
                We've sent a password reset link to <br/><strong className={isProDomain ? 'text-white' : 'text-slate-900'}>{email}</strong>.
              </p>
              <Button 
                onClick={() => { setResetSuccess(false); setIsResetMode(false); }} 
                variant="outline" 
                className={`w-full h-11 mt-4 ${isProDomain ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent' : 'border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                Back to Login
              </Button>
            </CardContent>

          ) : isResetMode ? (
            <>
              <CardHeader className="space-y-2 text-center pb-6">
                <CardTitle className={`text-2xl font-bold ${isProDomain ? 'text-white' : 'text-slate-900'}`}>Reset Password</CardTitle>
                <CardDescription className={isProDomain ? 'text-slate-400' : 'text-slate-500'}>Enter your email and we'll send you a link to reset your password.</CardDescription>
              </CardHeader>
              <CardContent>
                {errorMsg && (
                  <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm animate-in fade-in ${isProDomain ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Email Address</Label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required 
                        className={`pl-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} 
                      />
                    </div>
                  </div>
                  <Button type="submit" className={`w-full h-11 text-base font-semibold mt-2 transition-transform active:scale-95 ${isProDomain ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`} disabled={isLoading}>
                    {isLoading ? "Sending link..." : "Send Reset Link"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setIsResetMode(false); setErrorMsg(null); }} className={`w-full h-11 ${isProDomain ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900'}`}>
                    Cancel
                  </Button>
                </form>
              </CardContent>
            </>

          ) : (
            <>
              <CardHeader className="space-y-2 text-center pb-6">
                <CardTitle className={`text-2xl font-bold ${isProDomain ? 'text-white' : 'text-slate-900'}`}>{isProDomain ? "Welcome back, Partner" : "Welcome back"}</CardTitle>
                <CardDescription className={isProDomain ? 'text-slate-400' : 'text-slate-500'}>Log in to manage your {isProDomain ? 'business' : 'bookings'}.</CardDescription>
              </CardHeader>
              <CardContent>
                {errorMsg && (
                  <div className={`mb-4 p-3 rounded-lg flex items-start gap-2 text-sm animate-in fade-in ${isProDomain ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Email Address</Label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required 
                        className={`pl-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Password</Label>
                      <button type="button" onClick={() => { setIsResetMode(true); setErrorMsg(null); }} className={`text-sm font-medium hover:underline ${isProDomain ? 'text-amber-500 hover:text-amber-400' : 'text-blue-600 hover:text-blue-700'}`}>Forgot password?</button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required 
                        className={`pl-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} 
                      />
                    </div>
                  </div>
                  <Button type="submit" className={`w-full h-11 text-base font-semibold mt-2 transition-transform active:scale-95 ${isProDomain ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`} disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Log In"}
                  </Button>
                  <div className="relative my-6">
                    <div className={`absolute inset-0 flex items-center`}><span className={`w-full border-t ${isProDomain ? 'border-slate-800' : 'border-slate-200'}`} /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className={`px-2 font-medium ${isProDomain ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-500'}`}>Or continue with</span></div>
                  </div>
                  <Button type="button" variant="outline" className={`w-full h-11 font-semibold ${isProDomain ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                    Continue with Google
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
        {!isResetMode && !resetSuccess && <p className="text-center text-sm mt-6 text-slate-500">Don't have an account? <Link to="/signup" className={`font-semibold hover:underline ${isProDomain ? 'text-amber-500 hover:text-amber-400' : 'text-blue-600 hover:text-blue-700'}`}>Sign up</Link></p>}
      </div>
    </div>
  );
}