import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Mail, Lock, Eye, EyeOff, User, Phone, Shield, 
  ArrowRight, CheckCircle, Users, Zap 
} from 'lucide-react';
import { toast } from 'sonner';
// 1. Service ko import kijiye
import { authService } from '@/services/authService'; 

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'citizen'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validations
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      // 2. Data Mapping (Backend logic ke hisaab se)
      const payload = {
        fullname: formData.name,
        email: formData.email,
        phoneNumber: formData.phone,
        password: formData.password,
        role: 'CITIZEN'
      };

      // 3. Service Call (axios.post ki jagah)
      await authService.register(payload);
      // 4. Success handling
      toast.success('Account created successfully! Please login.');
      navigate('/login'); 
      
    } catch (error: any) {
      // 5. Backend error message nikalna
      const message = error.response?.data?.error || "Registration failed. Try again.";
      toast.error(message);
      console.error("Auth Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-primary/90 via-primary/70 to-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-7xl rounded-3xl shadow-2xl p-8 lg:p-12">
          <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Left Side - Hero Content (Exactly as you had it) */}
            <div className="flex-1 text-white text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
                <div className="h-14 w-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <span className="text-3xl font-bold">Civic Sarthi</span>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-4">Join the Movement</h1>
              <p className="text-xl text-white/80 mb-8 max-w-md mx-auto lg:mx-0">
                Be part of a community that's transforming how cities work.
              </p>

              <div className="hidden lg:block space-y-4">
                {[
                  { icon: Zap, text: 'Instant issue reporting' },
                  { icon: Users, text: 'Community-driven solutions' },
                  { icon: CheckCircle, text: 'Transparent resolution tracking' },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <span className="text-lg text-white/90">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Register Form (Exactly as you had it) */}
            <div className="w-full max-w-md">
              <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl">
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-2xl font-bold text-foreground">Create Account</CardTitle>
                  <CardDescription>Join as a Citizen to report local issues</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} className="pl-11 h-11" required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input id="email" name="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} className="pl-11 h-11" required />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input id="phone" name="phone" type="tel" placeholder="Phone number" value={formData.phone} onChange={handleChange} className="pl-11 h-11" required />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} className="pl-11 h-11" required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} className="pl-11 h-11" required />
                        </div>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base font-semibold gap-2" disabled={isLoading}>
                      {isLoading ? 'Creating account...' : <>Create Account <ArrowRight className="h-4 w-4" /></>}
                    </Button>
                  </form>

                  <div className="mt-6 text-center text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <Link to="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
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
    </div>
  );
}