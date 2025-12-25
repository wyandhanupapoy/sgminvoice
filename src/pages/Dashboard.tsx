import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Package, 
  FileText,
  DollarSign,
  AlertTriangle,
  Clock,
  ChevronRight,
  Settings,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { formatRupiah } from '@/utils/formatters';
import { useSalesData } from '@/hooks/useSalesData';
import { usePurchaseData } from '@/hooks/usePurchaseData';
import { DateRangePicker } from '@/components/shared/DateRangePicker';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const StatCard = ({ title, value, change, icon, trend }: StatCardProps) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="glass-card rounded-2xl p-6 relative overflow-hidden group transition-all duration-300"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-500" />
    <div className="flex items-start justify-between relative z-10">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold mt-2 truncate tracking-tight text-foreground">{value}</p>
        
        <div className="flex items-center gap-1.5 mt-4">
          {change !== undefined && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold",
              trend === 'up' ? 'bg-success/10 text-success' : 
              trend === 'down' ? 'bg-destructive/10 text-destructive' : 
              'bg-muted text-muted-foreground'
            )}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              <span>{change > 0 ? '+' : ''}{change}%</span>
            </div>
          )}
          {change === undefined && <div className="h-5" />}
          <span className="text-[10px] font-medium text-muted-foreground">vs bulan lalu</span>
        </div>
      </div>
      <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
    </div>
  </motion.div>
);

const CHART_COLORS = {
  sales: 'hsl(230, 75%, 60%)',
  purchases: 'hsl(142, 76%, 36%)',
};

const PIE_COLORS = ['hsl(230, 75%, 60%)', 'hsl(142, 76%, 36%)', 'hsl(215, 25%, 27%)', 'hsl(0, 84%, 60%)'];

const Dashboard = () => {
  const navigate = useNavigate();
  const { sales } = useSalesData();
  const { purchases } = usePurchaseData();

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const clearDateFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const filteredSales = useMemo(() => {
    return (sales || []).filter(sale => {
      const saleDate = new Date(sale.transaction_date);
      const matchesStart = !startDate || saleDate >= startDate;
      const matchesEnd = !endDate || saleDate <= endDate;
      return matchesStart && matchesEnd;
    });
  }, [sales, startDate, endDate]);

  const filteredPurchases = useMemo(() => {
    return (purchases || []).filter(purchase => {
      const purchaseDate = new Date(purchase.transaction_date);
      const matchesStart = !startDate || purchaseDate >= startDate;
      const matchesEnd = !endDate || purchaseDate <= endDate;
      return matchesStart && matchesEnd;
    });
  }, [purchases, startDate, endDate]);

  const totalSales = filteredSales.reduce((sum, s) => sum + Number(s.grand_total), 0);
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + Number(p.grand_total), 0);
  const pendingInvoices = filteredSales.filter(s => s.status === 'pending').length + 
                          filteredPurchases.filter(p => p.status === 'pending').length;

  const getDueDateStatus = (dueDate: string | null, status: string) => {
    if (!dueDate || status === 'paid') return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 7) return 'due-soon';
    return null;
  };

  const overdueInvoices = useMemo(() => {
    const overdueList: any[] = [];
    
    (sales || []).forEach(s => {
      if (getDueDateStatus(s.due_date, s.status) === 'overdue') {
        overdueList.push({ ...s, type: 'sales', amount: Number(s.grand_total) });
      }
    });
    
    (purchases || []).forEach(p => {
      if (getDueDateStatus(p.due_date, p.status) === 'overdue') {
        overdueList.push({ ...p, type: 'purchase', amount: Number(p.grand_total) });
      }
    });
    
    return overdueList;
  }, [sales, purchases]);

  const dueSoonInvoices = useMemo(() => {
    const dueSoonList: any[] = [];
    
    (sales || []).forEach(s => {
      if (getDueDateStatus(s.due_date, s.status) === 'due-soon') {
        dueSoonList.push({ ...s, type: 'sales', amount: Number(s.grand_total) });
      }
    });
    
    (purchases || []).forEach(p => {
      if (getDueDateStatus(p.due_date, p.status) === 'due-soon') {
        dueSoonList.push({ ...p, type: 'purchase', amount: Number(p.grand_total) });
      }
    });
    
    return dueSoonList;
  }, [sales, purchases]);

  const monthlyData = useMemo(() => {
    const months: Record<string, any> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { month: monthNames[date.getMonth()], penjualan: 0, pembelian: 0 };
    }

    filteredSales.forEach(sale => {
      const date = new Date(sale.transaction_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) months[key].penjualan += Number(sale.grand_total);
    });

    filteredPurchases.forEach(purchase => {
      const date = new Date(purchase.transaction_date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) months[key].pembelian += Number(purchase.grand_total);
    });

    return Object.values(months);
  }, [filteredSales, filteredPurchases]);

  const recentTransactions = useMemo(() => {
    const combined = [
      ...filteredSales.map(s => ({ ...s, type: 'sales', amount: Number(s.grand_total) })),
      ...filteredPurchases.map(p => ({ ...p, type: 'purchase', amount: Number(p.grand_total) }))
    ].sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
    
    return combined.slice(0, 6);
  }, [filteredSales, filteredPurchases]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Ringkasan <span className="text-gradient">Bisnis</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base font-medium">
            Monitor performa perdagangan PT. Sumber Ganda Mekar
          </p>
        </div>
        <div className="glass-card rounded-2xl p-1 shadow-sm">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onClear={clearDateFilter}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Penjualan"
          value={formatRupiah(totalSales)}
          change={12}
          trend="up"
          icon={<ShoppingCart className="w-6 h-6" />}
        />
        <StatCard
          title="Total Pembelian"
          value={formatRupiah(totalPurchases)}
          change={5}
          trend="down"
          icon={<Truck className="w-6 h-6" />}
        />
        <StatCard
          title="Piutang Aktif"
          value={pendingInvoices}
          icon={<FileText className="w-6 h-6" />}
        />
        <StatCard
          title="Arus Kas Transaksi"
          value={sales.length + purchases.length}
          icon={<DollarSign className="w-6 h-6" />}
        />
      </motion.div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold">Analisis Keuangan</h2>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-1">Perbandingan Penjualan vs Pembelian</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs font-bold text-muted-foreground">Penjualan</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-xs font-bold text-muted-foreground">Pembelian</span>
                </div>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                      </linearGradient>
                      <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 500 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
                      tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}jt` : value}
                    />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--primary) / 0.05)', radius: 10 }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="glass-card border-none rounded-2xl p-4 shadow-2xl">
                              <p className="text-sm font-bold mb-3">{label}</p>
                              <div className="space-y-2">
                                {payload.map((entry: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color ?? 'transparent' }} />
                                      <span className="text-xs font-medium text-muted-foreground">{entry.name}</span>
                                    </div>
                                    <span className="text-xs font-bold">{formatRupiah(entry.value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="penjualan" name="Penjualan" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={32} />
                    <Bar dataKey="pembelian" name="Pembelian" fill="url(#successGradient)" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground bg-muted/20 rounded-2xl border-2 border-dashed">
                  Menunggu data terkumpul...
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions refined */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { href: '/sales', label: 'Buat Penjualan', icon: ShoppingCart, color: 'text-primary' },
              { href: '/purchases', label: 'Buat Pembelian', icon: Truck, color: 'text-success' },
              { href: '/invoices', label: 'Kelola Faktur', icon: FileText, color: 'text-blue-500' },
              { href: '/settings', label: 'Data Master', icon: Settings, color: 'text-slate-500' },
            ].map((action) => (
              <Link 
                key={action.href}
                to={action.href}
                className="glass-card rounded-2xl p-5 flex flex-col items-center gap-3 hover:scale-105 transition-all duration-300 group shadow-sm hover:shadow-xl hover:bg-primary/5 border-none"
              >
                <div className={cn("p-4 rounded-2xl bg-muted group-hover:bg-white group-hover:shadow-lg transition-all duration-300", action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-center tracking-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Info Column */}
        <motion.div variants={itemVariants} className="space-y-8">
          {/* Overdue Alerts refinement */}
          {(overdueInvoices.length > 0 || dueSoonInvoices.length > 0) && (
            <div className="glass-card rounded-3xl p-6 bg-gradient-to-br from-destructive/10 to-transparent border-none">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <h3 className="font-bold text-destructive">Perhatian Penting</h3>
                </div>
                <Badge variant="destructive" className="animate-pulse">{overdueInvoices.length + dueSoonInvoices.length}</Badge>
              </div>
              <p className="text-xs font-medium text-muted-foreground mb-4">Ada beberapa faktur yang membutuhkan perhatian Anda segera.</p>
              
              <div className="space-y-3">
                {overdueInvoices.slice(0, 3).map(invoice => (
                  <div key={invoice.id} className="p-3 bg-white/50 rounded-xl flex items-center justify-between border border-destructive/10 group hover:border-destructive/30 transition-colors">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-destructive uppercase tracking-widest leading-none mb-1">Terlambat</p>
                      <p className="text-xs font-bold truncate">{invoice.transaction_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">{formatRupiah(invoice.amount)}</p>
                      <p className="text-[10px] text-muted-foreground">{invoice.due_date}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 rounded-xl border-destructive/20 text-destructive hover:bg-destructive hover:text-white transition-all duration-300"
                onClick={() => navigate('/invoices')}
              >
                Lihat Semua <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Activity Feed Refined */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Aktivitas Terkini
            </h3>
            <div className="space-y-6">
              {recentTransactions.map((tx, idx) => (
                <div key={tx.id} className="flex gap-4 relative">
                  {idx !== recentTransactions.length - 1 && (
                    <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-muted" />
                  )}
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10",
                    tx.type === 'sales' ? "bg-primary/20 text-primary" : "bg-success/20 text-success"
                  )}>
                    {tx.type === 'sales' ? <ShoppingCart className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-xs font-bold truncate pr-2">
                        {tx.type === 'sales' ? (tx as any).customer_name : (tx as any).supplier_name}
                      </p>
                      <span className="text-[10px] font-bold text-muted-foreground shrink-0">{tx.transaction_date}</span>
                    </div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">{tx.transaction_number}</p>
                    <p className="text-xs font-extrabold">{formatRupiah(tx.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
