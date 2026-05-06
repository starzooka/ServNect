import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, ArrowLeft, Mail, Lock, AlertCircle, ShieldAlert } from "lucide-react";

export default function CustomerSignIn() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // --- FORM STATE ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- INTERCEPTOR STATE ---
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [deletionDate, setDeletionDate] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    // 1. Verify credentials with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data.user) {
      // 2. Figure out if they are a customer or professional to check the right table
      const role = data.user.user_metadata?.role || 'customer';
      const tableName = role === 'professional' ? 'professionals' : 'customers';

      // 3. ACTUALLY fetch the deletion status from the database
      const { data: profile, error: profileError } = await supabase
        .from(tableName)
        .select('deletion_scheduled_at')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
      }

      // 4. Check if a deletion date exists
      if (profile?.deletion_scheduled_at) {
        // Calculate and format the exact deletion date
        const deletedOn = new Date(profile.deletion_scheduled_at);
        const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        setDeletionDate(deletedOn.toLocaleDateString(undefined, formatOptions));

        // Pause the login routing and show the interceptor modal
        setShowRestoreModal(true);
      } else {
        // Normal login flow
        navigate('/home'); 
      }
    }
  };

  const handleRestoreAccount = async () => {
    setIsRestoring(true);
    
    // 1. Get the user to find out their role
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const role = user.user_metadata?.role || 'customer';
      const tableName = role === 'professional' ? 'professionals' : 'customers';

      // 2. Wipe the deletion date from the database
      await supabase
        .from(tableName)
        .update({ deletion_scheduled_at: null })
        .eq('id', user.id);
    }
    
    setIsRestoring(false);
    setShowRestoreModal(false);
    navigate('/home'); // Let them into the app!
  };

  const handleCancelLogin = async () => {
    // If they back out, sign them out immediately to preserve the deletion countdown
    await supabase.auth.signOut();
    setShowRestoreModal(false);
    setPassword(''); // Clear the password field for security
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>

      {/* --- ACCOUNT RESTORATION INTERCEPTOR MODAL --- */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-300 relative text-center">
            
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Scheduled for Deletion</h2>
            
            <div className="bg-slate-50 text-slate-700 p-4 rounded-xl text-sm leading-relaxed border border-slate-200 mb-6 text-left">
              Your account is currently in a deletion cooldown and will be permanently wiped on <strong>{deletionDate}</strong>. 
              <br/><br/>
              Logging in will cancel this deletion process and fully restore your account.
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleRestoreAccount} 
                disabled={isRestoring}
                className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isRestoring ? "Restoring Account..." : "Login and Cancel Deletion"}
              </Button>
              <Button 
                onClick={handleCancelLogin} 
                variant="outline" 
                className="w-full h-12 text-base font-semibold border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              >
                Go Back (Do Not Login)
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* --- STANDARD LOGIN UI --- */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-xl shadow-sm">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              ServNect
            </span>
          </div>
        </div>

        <Card className="border-slate-200/60 shadow-xl bg-white/95 backdrop-blur-xl">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold text-slate-900">Welcome back</CardTitle>
            <CardDescription className="text-slate-500">
              Log in to manage your bookings and messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start gap-2 text-sm animate-in fade-in">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 font-medium">Email Address</Label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com" 
                    required 
                    className="pl-10 h-11 bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-blue-600" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-900 font-medium">Password</Label>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">Forgot password?</a>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    required 
                    className="pl-10 h-11 bg-white text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:ring-blue-600" 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold mt-2 transition-transform active:scale-95" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500 font-medium">Or continue with</span>
                </div>
              </div>

              <Button type="button" className="w-full h-11 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-semibold border border-slate-300 shadow-sm transition-colors">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-600 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}