import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function PrintableInvoice({ invoice, projectName }) {
  const [loading, setLoading] = useState(false)

  async function handlePrint() {
    setLoading(true)
    const { data: settings } = await supabase.from('business_settings').select('*').eq('id', 1).maybeSingle().catch(() => ({ data: null }))
    setLoading(false)

    const businessName = settings?.business_name || 'SayMyTech Developers'
    const address = settings?.address || ''
    const email = settings?.contact_email || ''

    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>${invoice.invoice_number}</title>
          <style>
            body { font-family: -apple-system, sans-serif; padding: 48px; color: #0B1F1A; max-width: 640px; margin: 0 auto; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            .meta { color: #666; font-size: 13px; margin-bottom: 32px; }
            .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
            .total { font-size: 20px; font-weight: bold; margin-top: 16px; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; text-transform: uppercase; background: ${invoice.status === 'paid' ? '#1B6B4A22' : '#F2B70522'}; color: ${invoice.status === 'paid' ? '#1B6B4A' : '#F2B705'}; }
          </style>
        </head>
        <body>
          <h1>${businessName}</h1>
          <div class="meta">${address}${address && email ? ' · ' : ''}${email}</div>
          <h2>Invoice ${invoice.invoice_number}</h2>
          <p class="status">${invoice.status}</p>
          <div class="row"><span>Project</span><span>${projectName}</span></div>
          <div class="row"><span>Date</span><span>${new Date(invoice.created_at).toLocaleDateString()}</span></div>
          ${invoice.paid_at ? `<div class="row"><span>Paid on</span><span>${new Date(invoice.paid_at).toLocaleDateString()}</span></div>` : ''}
          <div class="total">Total: ${invoice.amount != null ? `$${Number(invoice.amount).toLocaleString()}` : 'To be confirmed'}</div>
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <button
      onClick={handlePrint}
      disabled={loading}
      className="focus-ring flex items-center gap-1 text-xs text-savanna hover:underline disabled:opacity-50"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
      Download / Print
    </button>
  )
}
