import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, ArrowLeft, Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const isProDomain = window.location.hostname.startsWith('pro.');
  const requestedRole = isProDomain || searchParams.get('role') === 'professional' ? 'professional' : 'customer';

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email, password: formData.password,
        options: { data: { full_name: formData.name, role: requestedRole, phone: formData.phone } }
      });

      if (authError) throw authError;

      // --- THE SUPABASE FAKE SUCCESS CATCHER ---
      // If identities is empty, it means the user already exists in the system!
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error("This email is already registered! Please click 'Log in' below.");
      }

      // --- USE UPSERT TO PREVENT PRIMARY KEY CRASHES ---
      if (data.user) {
        const tableName = requestedRole === 'professional' ? 'professionals' : 'customers';
        const profileData = { 
          id: data.user.id,
          full_name: formData.name,
          email: formData.email,
          phone: formData.phone || null
        };
        
        // .upsert() will gracefully overwrite if the row exists (like on a double-click)
        const { error: dbError } = await supabase.from(tableName).upsert([profileData]);
        if (dbError) throw dbError;
      }

      setSuccessMsg("Account created successfully! Please check your email to verify your account.");
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (error: any) {
      if (error.message?.toLowerCase().includes('already registered')) {
        setErrorMsg("This email is already registered! Please click 'Log in' below to access your account or complete your Partner profile.");
      } else setErrorMsg(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${isProDomain ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob ${isProDomain ? 'bg-amber-600' : 'bg-blue-300'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-2000 ${isProDomain ? 'bg-orange-600' : 'bg-indigo-300'}`}></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <button onClick={() => navigate(-1)} className={`inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors ${isProDomain ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'}`}><ArrowLeft className="h-4 w-4" /> Go back</button>

        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className={`${isProDomain ? 'bg-amber-500' : 'bg-blue-600'} p-2 rounded-xl shadow-sm`}><Wrench className={`h-6 w-6 ${isProDomain ? 'text-slate-950' : 'text-white'}`} /></div>
            <span className={`text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${isProDomain ? 'from-amber-400 to-orange-500' : 'from-blue-600 to-indigo-600'}`}>
              ServNect {requestedRole === 'professional' && <span className="font-normal text-amber-500">Partner</span>}
            </span>
          </div>
        </div>

        <Card className={`shadow-xl backdrop-blur-xl transition-all duration-300 ${isProDomain ? 'bg-slate-900/95 border-slate-800 shadow-amber-900/10' : 'bg-white/95 border-slate-200/60'}`}>
          {successMsg ? (
            <CardContent className="pt-8 pb-8 text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${isProDomain ? 'bg-green-500/10' : 'bg-green-100'}`}><CheckCircle2 className="h-8 w-8 text-green-500" /></div>
              <h2 className={`text-2xl font-bold ${isProDomain ? 'text-white' : 'text-slate-900'}`}>Verify your email</h2>
              <p className={`text-sm leading-relaxed ${isProDomain ? 'text-slate-400' : 'text-slate-500'}`}>{successMsg}</p>
              <Button onClick={() => navigate('/login')} className={`w-full h-11 mt-4 ${isProDomain ? 'bg-amber-500 text-slate-950 hover:bg-amber-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>Go to Login</Button>
            </CardContent>
          ) : (
            <>
              <CardHeader className="space-y-2 text-center pb-6">
                <CardTitle className={`text-2xl font-bold ${isProDomain ? 'text-white' : 'text-slate-900'}`}>{requestedRole === 'professional' ? 'Join as a Professional' : 'Create an account'}</CardTitle>
                <CardDescription className={isProDomain ? 'text-slate-400' : 'text-slate-500'}>Get started in seconds.</CardDescription>
              </CardHeader>
              <CardContent>
                {errorMsg && <div className={`mb-6 p-3 rounded-lg flex items-start gap-2 text-sm animate-in fade-in ${isProDomain ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}><AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /><span>{errorMsg}</span></div>}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="space-y-2">
                      <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Full Name</Label>
                      <div className="relative flex items-center"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" /><Input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required className={`pl-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} /></div>
                    </div>
                    <div className="space-y-2">
                      <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Email Address</Label>
                      <div className="relative flex items-center"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" /><Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required className={`pl-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} /></div>
                    </div>
                    {requestedRole === 'professional' && (
                      <div className="space-y-2">
                        <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Phone Number</Label>
                        <div className="relative flex items-center"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" /><Input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" required className={`pl-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} /></div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Password</Label>
                      <div className="relative flex items-center"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" /><Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required minLength={6} className={`pl-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} /></div>
                    </div>
                  </div>
                  <div className="pt-2"><Button type="submit" disabled={isLoading} className={`w-full h-12 text-base font-semibold transition-transform active:scale-95 ${isProDomain ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>{isLoading ? "Processing..." : "Create Account"}</Button></div>
                </form>
              </CardContent>
            </>
          )}
        </Card>
        {!successMsg && <p className="text-center text-sm mt-6 text-slate-500">Already have an account? <Link to="/login" className={`font-semibold hover:underline ${isProDomain ? 'text-amber-500 hover:text-amber-400' : 'text-blue-600 hover:text-blue-700'}`}>Log in</Link></p>}
      </div>
    </div>
  );
}