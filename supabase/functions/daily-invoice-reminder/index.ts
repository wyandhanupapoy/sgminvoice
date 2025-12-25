import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Invoice {
  id: string;
  transaction_number: string;
  customer_name?: string;
  supplier_name?: string;
  grand_total: number;
  due_date: string;
  status: string;
  customer_id?: string;
  supplier_id?: string;
  type: 'sales' | 'purchase';
}

interface Customer {
  id: string;
  email: string | null;
}

interface Supplier {
  id: string;
  email: string | null;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getDaysUntilDue = (dueDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// Mask email for logging (e.g., "jo***@example.com")
const maskEmail = (email: string): string => {
  const [local, domain] = email.split('@');
  if (!domain) return '***@***.***';
  const maskedLocal = local.length > 2 
    ? local.substring(0, 2) + '***' 
    : '***';
  return `${maskedLocal}@${domain}`;
};

const generateEmailContent = (invoice: Invoice, daysUntilDue: number): { subject: string; html: string } => {
  const name = invoice.customer_name || invoice.supplier_name || 'Pelanggan';
  const isOverdue = daysUntilDue < 0;
  const isDueToday = daysUntilDue === 0;

  let subject: string;
  let urgencyText: string;
  let urgencyColor: string;

  if (isOverdue) {
    subject = `⚠️ TERLAMBAT: Faktur ${invoice.transaction_number} sudah jatuh tempo`;
    urgencyText = `Faktur ini sudah terlambat ${Math.abs(daysUntilDue)} hari`;
    urgencyColor = '#dc2626';
  } else if (isDueToday) {
    subject = `🔔 HARI INI: Faktur ${invoice.transaction_number} jatuh tempo hari ini`;
    urgencyText = 'Faktur ini jatuh tempo HARI INI';
    urgencyColor = '#ea580c';
  } else {
    subject = `📅 Pengingat: Faktur ${invoice.transaction_number} akan jatuh tempo dalam ${daysUntilDue} hari`;
    urgencyText = `Faktur ini akan jatuh tempo dalam ${daysUntilDue} hari`;
    urgencyColor = '#ca8a04';
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Pengingat Pembayaran</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
            Kepada Yth. <strong>${name}</strong>,
          </p>
          
          <div style="background: ${urgencyColor}15; border-left: 4px solid ${urgencyColor}; padding: 15px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: ${urgencyColor}; font-weight: 600;">${urgencyText}</p>
          </div>
          
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Nomor Faktur</td>
                <td style="padding: 10px 0; color: #1e293b; font-weight: 600; text-align: right;">${invoice.transaction_number}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Total Tagihan</td>
                <td style="padding: 10px 0; color: #1e293b; font-weight: 600; text-align: right; font-size: 18px;">${formatCurrency(invoice.grand_total || 0)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Jatuh Tempo</td>
                <td style="padding: 10px 0; color: ${urgencyColor}; font-weight: 600; text-align: right;">${new Date(invoice.due_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">
            Mohon segera lakukan pembayaran untuk menghindari keterlambatan. 
            Jika pembayaran sudah dilakukan, mohon abaikan email ini.
          </p>
          
          <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
            Terima kasih atas perhatian dan kerjasamanya.
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            Email ini dikirim secara otomatis oleh sistem.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

const CRON_SECRET = Deno.env.get("CRON_SECRET");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify cron secret for authentication
    const authHeader = req.headers.get("Authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");
    
    if (!CRON_SECRET || providedSecret !== CRON_SECRET) {
      console.error("Unauthorized: Invalid or missing cron secret");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Starting daily invoice reminder cron job (authenticated)");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get today's date and calculate date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get invoices due within 7 days (including overdue up to 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    // Fetch sales with pending status and due dates
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id, transaction_number, customer_name, customer_id, grand_total, due_date, status')
      .eq('status', 'pending')
      .not('due_date', 'is', null)
      .gte('due_date', thirtyDaysAgo.toISOString().split('T')[0])
      .lte('due_date', sevenDaysFromNow.toISOString().split('T')[0]);

    if (salesError) {
      console.error("Error fetching sales data");
      throw salesError;
    }

    // Fetch purchases with pending status and due dates
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('id, transaction_number, supplier_name, supplier_id, grand_total, due_date, status')
      .eq('status', 'pending')
      .not('due_date', 'is', null)
      .gte('due_date', thirtyDaysAgo.toISOString().split('T')[0])
      .lte('due_date', sevenDaysFromNow.toISOString().split('T')[0]);

    if (purchasesError) {
      console.error("Error fetching purchases data");
      throw purchasesError;
    }

    // Fetch customers with emails
    const customerIds = sales?.map(s => s.customer_id).filter(Boolean) || [];
    const { data: customers } = await supabase
      .from('customers')
      .select('id, email')
      .in('id', customerIds);

    // Fetch suppliers with emails
    const supplierIds = purchases?.map(p => p.supplier_id).filter(Boolean) || [];
    const { data: suppliers } = await supabase
      .from('suppliers')
      .select('id, email')
      .in('id', supplierIds);

    const customerEmailMap = new Map((customers || []).map(c => [c.id, c.email]));
    const supplierEmailMap = new Map((suppliers || []).map(s => [s.id, s.email]));

    let emailsSent = 0;
    let emailsFailed = 0;

    // Process sales invoices
    for (const sale of sales || []) {
      const email = sale.customer_id ? customerEmailMap.get(sale.customer_id) : null;
      if (!email) continue;

      const daysUntilDue = getDaysUntilDue(sale.due_date);
      
      // Only send for overdue, due today, or due in 1, 3, or 7 days
      if (![0, 1, 3, 7].includes(daysUntilDue) && daysUntilDue >= 0) continue;
      if (daysUntilDue < -30) continue; // Don't send for invoices overdue more than 30 days

      const { subject, html } = generateEmailContent({
        ...sale,
        type: 'sales'
      } as Invoice, daysUntilDue);

      try {
        await resend.emails.send({
          from: "Invoice Reminder <onboarding@resend.dev>",
          to: [email],
          subject,
          html,
        });

        console.log(`Reminder sent for invoice ${sale.id} to ${maskEmail(email)}`);
        emailsSent++;
      } catch (error: any) {
        console.error(`Failed to send reminder for invoice ${sale.id}`);
        emailsFailed++;
      }
    }

    // Process purchase invoices
    for (const purchase of purchases || []) {
      const email = purchase.supplier_id ? supplierEmailMap.get(purchase.supplier_id) : null;
      if (!email) continue;

      const daysUntilDue = getDaysUntilDue(purchase.due_date);
      
      // Only send for overdue, due today, or due in 1, 3, or 7 days
      if (![0, 1, 3, 7].includes(daysUntilDue) && daysUntilDue >= 0) continue;
      if (daysUntilDue < -30) continue;

      const { subject, html } = generateEmailContent({
        ...purchase,
        type: 'purchase'
      } as Invoice, daysUntilDue);

      try {
        await resend.emails.send({
          from: "Invoice Reminder <onboarding@resend.dev>",
          to: [email],
          subject,
          html,
        });

        console.log(`Reminder sent for invoice ${purchase.id} to ${maskEmail(email)}`);
        emailsSent++;
      } catch (error: any) {
        console.error(`Failed to send reminder for invoice ${purchase.id}`);
        emailsFailed++;
      }
    }

    console.log(`Daily reminder job completed. Sent: ${emailsSent}, Failed: ${emailsFailed}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Daily invoice reminder completed`,
        emailsSent,
        emailsFailed
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in daily invoice reminder");
    return new Response(
      JSON.stringify({ 
        success: false,
        error: "Internal server error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
