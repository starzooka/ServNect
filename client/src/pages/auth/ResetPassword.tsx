import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Wrench } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check if we actually have a session (they clicked a valid link)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setErrorMsg("Your password reset link is invalid or has expired. Please request a new one.");
      }
    });
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setIsSuccess(true);
      // Automatically sign them out so they can log in normally with their new password
      await supabase.auth.signOut();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-sm"><Wrench className="h-6 w-6 text-white" /></div>
            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">ServNect</span>
          </div>
        </div>

        <Card className="border-slate-200/60 shadow-xl bg-white/95 backdrop-blur-xl">
          {isSuccess ? (
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Password Updated!</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Your password has been successfully changed. You can now log in with your new credentials.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white mt-4">
                Go to Login
              </Button>
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-2 text-center pb-6">
                <CardTitle className="text-2xl font-bold text-slate-900">Create New Password</CardTitle>
                <CardDescription className="text-slate-500">Please enter a strong password for your account.</CardDescription>
              </CardHeader>
              <CardContent>
                {errorMsg && (
                  <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start gap-2 text-sm animate-in fade-in">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}
                
                <form onSubmit={handleUpdatePassword} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-900 font-medium">New Password</Label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10 pr-10 h-11 bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-600" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-400 hover:text-slate-600">
                        {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm_password" className="text-slate-900 font-medium">Confirm New Password</Label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      <Input id="confirm_password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="pl-10 pr-10 h-11 bg-white text-slate-900 border-slate-300 focus-visible:ring-blue-600" />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold mt-2 transition-transform active:scale-95" disabled={isLoading}>
                    {isLoading ? "Updating Password..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}