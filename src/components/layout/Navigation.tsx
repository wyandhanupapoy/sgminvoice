import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  FileText, 
  Settings,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSalesData } from '@/hooks/useSalesData';
import { usePurchaseData } from '@/hooks/usePurchaseData';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { sales } = useSalesData();
  const { purchases } = usePurchaseData();

  const overdueCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isOverdue = (dueDate: string | null, status: string): boolean => {
      if (!dueDate || status === 'paid') return false;
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    };

    const overdueSales = (sales || []).filter(s => isOverdue(s.due_date, s.status)).length;
    const overduePurchases = (purchases || []).filter(p => isOverdue(p.due_date, p.status)).length;
    
    return overdueSales + overduePurchases;
  }, [sales, purchases]);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard, badge: 0 },
    { path: '/sales', label: 'Penjualan', icon: ShoppingCart, badge: 0 },
    { path: '/purchases', label: 'Pembelian', icon: Package, badge: 0 },
    { path: '/invoices', label: 'Faktur', icon: FileText, badge: overdueCount },
    { path: '/settings', label: 'Setelan', icon: Settings, badge: 0 },
  ];

  return (
    <nav className="sticky top-[64px] sm:top-[72px] z-30 w-full glass-header py-1">
      <div className="container mx-auto px-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'relative px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-sm font-semibold transition-all duration-300',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 relative z-10", isActive && "text-primary")} />
                <span className="relative z-10">{item.label}</span>
                {item.badge > 0 && (
                  <Badge variant="destructive" className="relative z-10 ml-0.5 h-4.5 min-w-[18px] px-1 text-[10px] font-bold">
                    {item.badge}
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Menu className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">Navigasi Utama</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-primary/5 text-primary active:scale-90 transition-transform"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200',
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                          : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-semibold">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-[10px] font-bold">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight className={cn("w-4 h-4 opacity-50", isActive && "opacity-100")} />
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
