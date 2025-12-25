import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceReminderRequest {
  invoices: Array<{
    transactionNumber: string;
    customerName: string;
    customerEmail: string;
    dueDate: string;
    amount: number;
    type: 'sales' | 'purchase';
  }>;
  companyName: string;
  companyEmail: string;
}

const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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

const handler = async (req: Request): Promise<Response> => {
  console.log("Processing invoice reminder request");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client and verify user
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication failed");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Request authenticated for user ${user.id}`);

    const { invoices, companyName, companyEmail }: InvoiceReminderRequest = await req.json();

    console.log(`Processing ${invoices.length} invoice reminders`);

    if (!invoices || invoices.length === 0) {
      return new Response(
        JSON.stringify({ error: "No invoices provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const results: Array<{ success: boolean; invoiceId: string; error?: string }> = [];

    for (const invoice of invoices) {
      if (!invoice.customerEmail) {
        console.log(`Skipping invoice - no email provided`);
        results.push({
          success: false,
          invoiceId: invoice.transactionNumber,
          error: 'No email address'
        });
        continue;
      }

      const dueDate = new Date(invoice.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      let subject: string;
      let urgencyText: string;
      let urgencyColor: string;

      if (daysUntilDue < 0) {
        subject = `⚠️ TERLAMBAT: Faktur ${invoice.transactionNumber} - ${companyName}`;
        urgencyText = `Faktur ini sudah terlambat ${Math.abs(daysUntilDue)} hari!`;
        urgencyColor = '#dc3545';
      } else if (daysUntilDue === 0) {
        subject = `📅 JATUH TEMPO HARI INI: Faktur ${invoice.transactionNumber} - ${companyName}`;
        urgencyText = 'Faktur ini jatuh tempo hari ini!';
        urgencyColor = '#ffc107';
      } else {
        subject = `🔔 Pengingat: Faktur ${invoice.transactionNumber} akan jatuh tempo - ${companyName}`;
        urgencyText = `Faktur ini akan jatuh tempo dalam ${daysUntilDue} hari`;
        urgencyColor = '#17a2b8';
      }

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; }
            .urgency-box { background: ${urgencyColor}; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px; font-weight: bold; }
            .invoice-details { background: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
            .detail-label { color: #6c757d; }
            .detail-value { font-weight: 600; }
            .amount { font-size: 24px; color: #1a365d; text-align: center; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">${companyName}</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Pengingat Faktur</p>
            </div>
            <div class="content">
              <div class="urgency-box">
                ${urgencyText}
              </div>
              
              <p>Yth. <strong>${invoice.customerName}</strong>,</p>
              
              <p>Kami ingin mengingatkan tentang faktur berikut:</p>
              
              <div class="invoice-details">
                <div class="detail-row">
                  <span class="detail-label">No. Faktur</span>
                  <span class="detail-value">${invoice.transactionNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Tanggal Jatuh Tempo</span>
                  <span class="detail-value">${new Date(invoice.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div class="amount">
                  ${formatRupiah(invoice.amount)}
                </div>
              </div>
              
              <p style="margin-top: 20px;">Mohon segera melakukan pembayaran untuk menghindari keterlambatan. Jika Anda sudah melakukan pembayaran, harap abaikan email ini.</p>
              
              <p>Terima kasih atas perhatian dan kerjasamanya.</p>
              
              <p>Hormat kami,<br><strong>${companyName}</strong></p>
            </div>
            <div class="footer">
              <p>Email ini dikirim secara otomatis. Jika ada pertanyaan, silakan hubungi kami.</p>
              ${companyEmail ? `<p>Email: ${companyEmail}</p>` : ''}
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        console.log(`Sending reminder for invoice ${invoice.transactionNumber} to ${maskEmail(invoice.customerEmail)}`);
        
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: `${companyName} <onboarding@resend.dev>`,
            to: [invoice.customerEmail],
            subject: subject,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          throw new Error(errorData.message || "Failed to send email");
        }

        console.log(`Email sent successfully for invoice ${invoice.transactionNumber}`);
        
        results.push({
          success: true,
          invoiceId: invoice.transactionNumber
        });
      } catch (emailError: any) {
        console.error(`Failed to send email for invoice ${invoice.transactionNumber}`);
        results.push({
          success: false,
          invoiceId: invoice.transactionNumber,
          error: "Email delivery failed"
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Completed: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failCount,
        results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invoice-reminder function");
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
