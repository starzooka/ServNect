import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, ArrowLeft, Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export default function CustomerSignUp() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getEmailProviderUrl = (emailAddress: string) => {
    const lowerEmail = emailAddress.toLowerCase();
    if (lowerEmail.includes('@gmail.com')) return 'https://mail.google.com/';
    if (lowerEmail.includes('@outlook.com') || lowerEmail.includes('@hotmail.com')) return 'https://outlook.live.com/mail/';
    if (lowerEmail.includes('@yahoo.com')) return 'https://mail.yahoo.com/';
    if (lowerEmail.includes('@icloud.com')) return 'https://www.icloud.com/mail';
    return null; 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: 'customer' 
        }
      }
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data.user) {
      if (data.session) {
        navigate('/home');
      } else {
        setIsSuccess(true);
      }
    }
  };

  if (isSuccess) {
    const mailUrl = getEmailProviderUrl(email);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
        <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-slate-200/60 shadow-xl bg-white/95 backdrop-blur-xl text-center py-8">
            <CardContent className="space-y-6 flex flex-col items-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                <Mail className="h-10 w-10 text-blue-600 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">Check your email</h2>
                <p className="text-slate-500 text-lg">We sent a verification link to <br/><span className="font-semibold text-slate-800">{email}</span></p>
              </div>
              {mailUrl ? (
                <Button onClick={() => window.open(mailUrl, '_blank')} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold mt-4 rounded-xl shadow-lg shadow-blue-600/30">
                  Open Mail Inbox <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <p className="text-sm text-slate-400 bg-slate-50 p-4 rounded-lg mt-4 border border-slate-100">Please open your email app to verify your account.</p>
              )}
              <div className="pt-6 mt-6 border-t border-slate-100 w-full text-slate-500 text-sm">
                Didn't receive the email? Check your spam folder or <br/>
                <button onClick={() => setIsSuccess(false)} className="text-blue-600 font-semibold hover:underline mt-1">try a different email address</button>.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-sm"><Wrench className="h-6 w-6 text-white" /></div>
            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">ServNect</span>
          </div>
        </div>

        <Card className="border-slate-200/60 shadow-xl bg-white/95 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900">Create an account</CardTitle>
            <CardDescription className="text-slate-500">Find and book trusted local professionals in seconds.</CardDescription>
          </CardHeader>
          <CardContent>
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start gap-2 text-sm animate-in fade-in zoom-in-95">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-900 font-medium">Full Name</Label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required className="pl-10 h-11 bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 font-medium">Email Address</Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" required className="pl-10 h-11 bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-900 font-medium">Password</Label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="pl-10 h-11 bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-blue-600" />
                </div>
              </div>
              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold mt-2 transition-all active:scale-95" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-500 font-medium">Or continue with</span></div>
              </div>
              <Button type="button" variant="white" className="w-full h-11 font-semibold">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
                Continue with Google
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-slate-600 mt-6">Already have an account? <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">Log in</Link></p>
      </div>
    </div>
  );
}