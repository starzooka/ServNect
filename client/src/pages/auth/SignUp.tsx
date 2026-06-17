import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase'; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, ArrowLeft, Mail, Lock, User, Phone, AlertCircle, CheckCircle2, Calendar } from "lucide-react";

export default function SignUp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const isProDomain = window.location.hostname.startsWith('pro.');
  const requestedRole = isProDomain || searchParams.get('role') === 'professional' ? 'professional' : 'customer';

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Added dob to the state
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '', dob: '' });

  // Calculate today's date for the max attribute (prevents picking future dates)
  const todayISO = new Date().toISOString().split('T')[0];

  // --- REAL-TIME INPUT RESTRICTION ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const numbersOnly = value.replace(/[^0-9]/g, '');
      if (numbersOnly.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: numbersOnly }));
      }
      return; 
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    // --- PRE-PROCESSING ---
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();

    // --- SUBMIT VALIDATION ---
    
    // 0. Manual Required Check
    if (!cleanName || !cleanEmail || !formData.password || !formData.dob || (requestedRole === 'professional' && !formData.phone)) {
      setErrorMsg("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    // 1. Name Validation
    if (/\d/.test(cleanName)) {
      setErrorMsg("Your name cannot contain numbers.");
      setIsLoading(false);
      return;
    }
    if (cleanName.length > 80) {
      setErrorMsg("Name cannot be longer than 80 characters. If your name is longer, please remove your middle names.");
      setIsLoading(false);
      return;
    }

    // 2. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg("The email format is invalid.");
      setIsLoading(false);
      return;
    }

    // 3. Age Validation (Must be 18 or older)
    const dobDate = new Date(formData.dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }
    if (age < 18) {
      setErrorMsg("You must be at least 18 years old to create an account.");
      setIsLoading(false);
      return;
    }

    // 4. Phone Validation (Enhanced for India)
    if (requestedRole === 'professional' && formData.phone) {
      if (formData.phone.length !== 10) {
        setErrorMsg("Please enter a valid 10-digit phone number.");
        setIsLoading(false);
        return;
      }
      if (!/^[6-9]/.test(formData.phone)) {
        setErrorMsg("Please enter a valid Indian mobile number (must start with 6, 7, 8, or 9).");
        setIsLoading(false);
        return;
      }
    }

    // 5. Password Length Validation
    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: cleanEmail, 
        password: formData.password,
        options: { 
          data: { full_name: cleanName, role: requestedRole, phone: formData.phone, dob: formData.dob } 
        }
      });

      if (authError) throw authError;

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        throw new Error("already registered");
      }

      if (data.user) {
        const tableName = requestedRole === 'professional' ? 'professionals' : 'customers';
        const profileData = { 
          id: data.user.id,
          full_name: cleanName,
          email: cleanEmail,
          phone: formData.phone || null,
          dob: formData.dob // Save DOB to database
        };
        
        const { error: dbError } = await supabase.from(tableName).upsert([profileData]);
        if (dbError) throw dbError;
      }

      setSuccessMsg("Account created successfully! Please check your email to verify your account.");
      setTimeout(() => navigate('/login'), 3000);
      
    } catch (error: any) {
      const errorStr = error.message?.toLowerCase() || "";

      if (errorStr.includes('already registered')) {
        if (isProDomain) {
          setErrorMsg("Great news! You already have a Customer account with this email. You don't need to sign up again—just click 'Log in' below using your existing password to set up your Partner profile.");
        } else {
          setErrorMsg("It looks like you already have a Partner account with us! You can use the exact same email and password to log in as a Customer. Just click 'Log in' below.");
        }
      } else if (errorStr.includes('email')) {
        setErrorMsg("The email format is invalid.");
      } else {
        setErrorMsg(error.message);
      }
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
                {errorMsg && <div className={`mb-6 p-3 rounded-lg flex items-start gap-2 text-sm animate-in fade-in ${isProDomain ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}><AlertCircle className="h-5 w-5 shrink-0 mt-0.5" /><span>{errorMsg}</span></div>}
                
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    
                    <div className="space-y-2">
                      <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Full Name</Label>
                      <div className="relative flex items-center">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        <Input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required className={`pl-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Email Address</Label>
                      <div className="relative flex items-center">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        <Input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required className={`pl-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} />
                      </div>
                    </div>

                    {/* NEW DOB FIELD */}
                    <div className="space-y-2">
                      <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Date of Birth</Label>
                      <div className="relative flex items-center">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        <Input 
                          name="dob" 
                          type="date" 
                          value={formData.dob} 
                          onChange={handleChange} 
                          max={todayISO}
                          required 
                          className={`pl-10 h-11 cursor-pointer ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} 
                        />
                      </div>
                    </div>

                    {requestedRole === 'professional' && (
                      <div className="space-y-2">
                        <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Phone Number</Label>
                        <div className="relative flex items-center">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                          <span className={`absolute left-10 top-1/2 -translate-y-1/2 font-medium pointer-events-none ${isProDomain ? 'text-slate-400' : 'text-slate-500'}`}>
                            +91
                          </span>
                          <Input 
                            name="phone" 
                            type="tel" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            placeholder="9876543210" 
                            maxLength={10} 
                            required 
                            className={`pl-20 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} 
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label className={`font-medium ${isProDomain ? 'text-slate-300' : 'text-slate-900'}`}>Password</Label>
                      <div className="relative flex items-center">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                        <Input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required minLength={6} className={`pl-10 h-11 ${isProDomain ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus-visible:ring-amber-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus-visible:ring-blue-600'}`} />
                      </div>
                    </div>

                  </div>
                  
                  <div className="pt-2">
                    <Button type="submit" disabled={isLoading} className={`w-full h-12 text-base font-semibold transition-transform active:scale-95 ${isProDomain ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                      {isLoading ? "Processing..." : "Create Account"}
                    </Button>
                  </div>
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