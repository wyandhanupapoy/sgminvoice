import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

import { motion } from 'framer-motion';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signIn } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      loginSchema.parse(loginData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
        return;
      }
    }

    setIsLoading(true);
    const { error } = await signIn(loginData.email, loginData.password);
    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: error.message === 'Invalid login credentials' 
          ? 'Email atau password salah' 
          : error.message,
      });
    } else {
      toast({
        title: 'Login Berhasil',
        description: 'Selamat datang kembali!',
      });
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[420px] relative z-10"
      >
        {/* Branding */}
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="p-4 rounded-3xl glass-card bg-white/20 shadow-2xl">
              <img 
                src="/company-logo.png" 
                alt="Logo" 
                className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-2xl"
              />
            </div>
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            INVOICE <span className="text-gradient">SGM</span>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-[0.2em] mt-3">
            PT. Sumber Ganda Mekar
          </p>
        </div>

        {/* Login Form */}
        <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 shadow-3xl border-white/40 ring-1 ring-white/20">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Selamat Datang</h2>
            <p className="text-sm text-muted-foreground mt-1">Silakan masuk untuk melanjutkan akses.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider ml-1">Email Bisnis</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="nama@perusahaan.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="pl-12 h-12 bg-white/50 border-none rounded-2xl ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary/50 transition-all font-medium"
                />
              </div>
              {errors.email && (
                <p className="text-[10px] font-bold text-destructive uppercase tracking-wide ml-1">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider">Kata Sandi</Label>
                <button type="button" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tight bg-transparent border-none p-0 cursor-pointer">Lupa Sandi?</button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="pl-12 h-12 bg-white/50 border-none rounded-2xl ring-1 ring-border focus-visible:ring-2 focus-visible:ring-primary/50 transition-all font-medium"
                />
              </div>
              {errors.password && (
                <p className="text-[10px] font-bold text-destructive uppercase tracking-wide ml-1">{errors.password}</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-95 transition-all" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </div>
              ) : 'Masuk Sekarang'}
            </Button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-white/20 text-center">
            <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
              &copy; {new Date().getFullYear()} PT. Sumber Ganda Mekar.<br />
              Seluruh Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;