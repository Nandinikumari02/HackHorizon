import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
 
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await authService.forgotPassword(forgotEmail);
      toast.success('OTP sent to your email!');
      setForgotStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await authService.resetPassword({ email: forgotEmail, otp, newPassword });
      toast.success('Password updated successfully!');
      setForgotStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const role = storedUser.role;
      const fullname = storedUser.fullname || 'User';
      toast.success(`Welcome back, ${fullname}!`);

      setTimeout(() => {
        switch (role) {
          case 'CITIZEN': navigate('/citizen'); break;
          case 'STAFF': navigate('/staff'); break;
          case 'DEPARTMENT_ADMIN': navigate('/departments'); break;
          case 'SUPER_ADMIN': navigate('/superadmin'); break;
          default: navigate('/');
        }
      }, 50);
    } catch (error: any) {
      toast.error(error.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary/90 via-primary/70 to-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-7xl rounded-3xl shadow-2xl p-8 lg:p-12">
          <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            <div className="flex-1 text-white text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <span className="text-4xl font-bold">Civic Sarthi</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">Your City, Your Voice</h1>
              <p className="text-xl text-white/80 mb-8 max-w-md mx-auto lg:mx-0">
                Report civic issues, track resolutions, and build a better community together.
              </p>
              <div className="hidden lg:block space-y-4 mb-8">
                {['Report issues in seconds with photo evidence', 'Real-time tracking of issue resolution', 'Earn rewards for civic participation'].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-white/90">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full max-w-md">
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-foreground">Welcome Back</CardTitle>
                  <CardDescription className="text-base">Sign in to your account to continue</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-11 h-12 text-base" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                        <button type="button" onClick={() => { setForgotOpen(true); setForgotStep(1); setForgotEmail(email); }} className="text-sm text-primary hover:underline font-medium">
                          Forgot password?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-11 pr-11 h-12 text-base" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="remember" className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                      <Label htmlFor="remember" className="text-sm font-medium">Remember me</Label>
                    </div>
                    <Button type="submit" className="w-full h-12 text-base font-semibold gap-2 group" disabled={isLoading}>
                      {isLoading ? 'Signing in...' : <>Sign In <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
                    </Button>
                  </form>
                  <div className="mt-6 text-center">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Link to="/register" className="text-primary hover:underline font-semibold">Create account</Link>
                  </div>
                </CardContent>
              </Card>
              <p className="text-center text-sm text-black/80 mt-6">
                <Link to="/" className="hover:text-white transition-colors inline-flex items-center gap-1">← Back to Home</Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog  */}
      <Dialog open={forgotOpen} onOpenChange={(open) => { setForgotOpen(open); if (!open) setForgotStep(1); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{forgotStep === 1 ? "Reset Password" : forgotStep === 2 ? "Verify OTP" : "Success!"}</DialogTitle>
            <DialogDescription>
              {forgotStep === 1 ? "Enter your email address to receive an OTP." : forgotStep === 2 ? "Enter the 6-digit OTP and your new password." : "Your password has been reset successfully."}
            </DialogDescription>
          </DialogHeader>
          {forgotStep === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <Input type="email" placeholder="Email Address" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={forgotLoading}>{forgotLoading ? "Sending..." : "Send OTP"}</Button>
            </form>
          )}
          {forgotStep === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={forgotLoading}>{forgotLoading ? "Updating..." : "Update Password"}</Button>
            </form>
          )}
          {forgotStep === 3 && (
            <Button className="w-full" onClick={() => setForgotOpen(false)}>Back to Login</Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}