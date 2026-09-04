import React, { useState } from 'react';
import { X, Printer, CheckCircle, Store, Globe, MapPin, Phone, Mail, MessageCircle, Download, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import logo from '../assets/logo.png';
import toast from 'react-hot-toast';
import { confirmPosStock } from '../services/api';

const InvoiceModal = ({ order, onClose }) => {
  const [generatingPdf, setGeneratingPdf] = useState(false);

  if (!order) return null;

  // Helper to decrement stock ONLY when invoice is shared, downloaded, or printed
  const ensureStockConfirmed = async () => {
    if (order.orderType === 'pos') {
      try {
        await confirmPosStock(order._id);
      } catch (err) {
        console.warn('Stock confirmation notice:', err.message);
      }
    }
  };

  const handlePrint = async () => {
    window.print();
    await ensureStockConfirmed();
  };

  const handleDownloadPDF = async () => {
    const filename = `Invoice_${order.invoiceNumber || order._id?.slice(-8).toUpperCase() || 'Bill'}.pdf`;

    try {
      setGeneratingPdf(true);
      toast.loading('Generating PDF Invoice...', { id: 'pdf-toast' });

      // Stream native PDF from backend PDFKit service (100% bug-free)
      const pdfEndpoint = `${window.location.protocol}//${window.location.hostname}:5000/api/orders/${order._id}/pdf`;
      const response = await fetch(pdfEndpoint);
      if (!response.ok) {
        throw new Error('Failed to generate PDF on server');
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      // Decrement stock ONLY AFTER successful PDF download
      await ensureStockConfirmed();
      toast.success('PDF Invoice downloaded!', { id: 'pdf-toast' });
    } catch (err) {
      console.error('PDF error:', err);
      toast.error('Failed to download PDF (Stock was NOT reduced)', { id: 'pdf-toast' });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleSendWhatsAppPDF = async () => {
    const rawPhone = order.phoneNumber || '';
    let cleanPhone = rawPhone.replace(/\D/g, '');
    
    if (!cleanPhone) {
      toast.error('No phone number specified for WhatsApp message');
      return;
    }

    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    const customerName = order.customerName || order.user?.name || 'Valued Customer';
    const invoiceNo = order.invoiceNumber || `MW-INV-${order._id?.slice(-8).toUpperCase()}`;
    const filename = `Invoice_${invoiceNo}.pdf`;

    try {
      setGeneratingPdf(true);
      toast.loading('Preparing PDF Invoice...', { id: 'pdf-toast' });

      // Fetch server-generated native PDF Blob
      const pdfEndpoint = `${window.location.protocol}//${window.location.hostname}:5000/api/orders/${order._id}/pdf`;
      const response = await fetch(pdfEndpoint);
      if (!response.ok) {
        throw new Error('Failed to generate PDF on server');
      }

      const pdfBlob = await response.blob();
      const pdfFile = new File([pdfBlob], filename, { type: 'application/pdf' });

      // 1. Try Native Web Share API if supported (Mobile)
      let sharedSuccessfully = false;
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        try {
          await navigator.share({
            files: [pdfFile],
            title: `Invoice ${invoiceNo}`,
            text: `My Wearables Tax Invoice ${invoiceNo} for ${customerName}`
          });
          sharedSuccessfully = true;
          await ensureStockConfirmed();
          toast.success('PDF Invoice shared successfully!', { id: 'pdf-toast' });
          return;
        } catch (shareErr) {
          console.warn('Web share cancelled or unsupported, falling back to download & WhatsApp link:', shareErr);
        }
      }

      // 2. Fallback for Desktop: Download PDF file and open WhatsApp chat
      if (!sharedSuccessfully) {
        const downloadUrl = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        const pdfUrl = `${window.location.protocol}//${window.location.hostname}:5000/invoices/${invoiceNo}.pdf`;

        const message = 
`🛍️ *MY WEARABLES - OFFICIAL TAX INVOICE*
----------------------------------------
Hello *${customerName}*,

📄 Your official Tax Invoice (*${invoiceNo}*) has been generated in PDF format.
💰 *Total Amount:* ₹${(order.totalPrice || 0).toFixed(2)} (PAID)

⬇️ *Click link to view & download PDF file:*
${pdfUrl}

📍 *Store:* F-7, Gajanan Complex, Station Road, Sachin, Surat 394230
📞 *Support:* +91 8200141826

Thank you for shopping at *My Wearables*! ✨`;

        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // Decrement stock AFTER successful share/download trigger
        await ensureStockConfirmed();
        toast.success(`PDF downloaded! Opening WhatsApp for +${cleanPhone}`, { id: 'pdf-toast' });
      }
    } catch (err) {
      console.error('PDF Generation Error:', err);
      toast.error('Failed to generate PDF (Stock was NOT reduced)', { id: 'pdf-toast' });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const isPos = order.orderType === 'pos';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto font-sans">
      {/* CSS for printing only the invoice */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-invoice, #printable-invoice * {
              visibility: visible;
            }
            #printable-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
              box-shadow: none !important;
              border: none !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="bg-white w-full max-w-3xl rounded-[32px] shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200 bg-gray-50 no-print">
          <div className="flex items-center gap-3">
            <FileText size={22} className="text-black" />
            <h3 className="text-lg font-black text-gray-900 tracking-tight">Order Invoice / Tax Bill</h3>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleSendWhatsAppPDF}
              className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md active:scale-95 border border-black"
              title="Download PDF & send to WhatsApp chat"
            >
              <MessageCircle size={16} />
              Send WhatsApp PDF
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={generatingPdf}
              className="flex items-center gap-2 bg-gray-100 text-gray-900 border border-gray-300 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
              title="Download high quality PDF file"
            >
              <Download size={16} />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md active:scale-95"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-black hover:bg-gray-200 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE CONTENT */}
        <div id="printable-invoice" className="p-8 sm:p-10 overflow-y-auto space-y-8 bg-white text-gray-900">
          
          {/* Header Branding & Invoice Meta */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-200 pb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={logo} alt="My Wearables" className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-gray-900">MY WEARABLES</h1>
                  <p className="text-[11px] font-extrabold uppercase tracking-widest text-gray-500">Wear It With Style</p>
                </div>
              </div>
              <div className="text-xs text-gray-500 space-y-1 font-medium leading-relaxed">
                <p className="flex items-center gap-1.5"><MapPin size={12} className="text-gray-400 shrink-0" /> F-7, Gajanan Complex, Station Road, Sachin, Surat 394230</p>
                <p className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400 shrink-0" /> +91 8200141826</p>
                <p className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400 shrink-0" /> support@mywearables.com</p>
              </div>
            </div>

            <div className="sm:text-right space-y-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                isPos ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-900 border-gray-300'
              }`}>
                {isPos ? <Store size={14} /> : <Globe size={14} />}
                {isPos ? 'Offline Counter Bill' : 'Online Store Purchase'}
              </span>

              <div className="text-xs space-y-1 pt-1">
                <p className="font-extrabold text-gray-900">
                  <span className="text-gray-400 uppercase tracking-wider text-[10px]">Invoice No: </span>
                  {order.invoiceNumber || `MW-INV-${order._id?.slice(-8).toUpperCase()}`}
                </p>
                <p className="font-medium text-gray-600">
                  <span className="text-gray-400 uppercase tracking-wider text-[10px]">Date: </span>
                  {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Customer & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-xs">
            <div className="space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Billed To</p>
              <p className="text-sm font-black text-gray-900">{order.customerName || order.user?.name || 'Customer'}</p>
              <p className="font-semibold text-gray-600">Phone: {order.phoneNumber || 'N/A'}</p>
              <p className="font-medium text-gray-500 leading-relaxed">
                Address: {order.shippingAddress || 'Counter Pickup (In-Store)'}
              </p>
            </div>

            <div className="space-y-1.5 sm:text-right border-t sm:border-t-0 sm:border-l border-gray-200 pt-4 sm:pt-0 sm:pl-6">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payment Details</p>
              <p className="text-sm font-black text-gray-900">Method: {order.paymentMethod || 'Razorpay Online'}</p>
              <div className="flex sm:justify-end items-center gap-1.5 text-black font-extrabold text-xs">
                <CheckCircle size={14} className="text-black" />
                Status: PAID
              </div>
              {order.paidAt && (
                <p className="text-gray-400 text-[11px]">
                  Paid on {new Date(order.paidAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 uppercase tracking-wider text-[10px] font-black">
                <tr>
                  <th className="py-3.5 px-4">#</th>
                  <th className="py-3.5 px-4">Item & Description</th>
                  <th className="py-3.5 px-4 text-center">Size</th>
                  <th className="py-3.5 px-4 text-center">Qty</th>
                  <th className="py-3.5 px-4 text-right">Price</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-medium">
                {order.orderItems?.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3.5 px-4 text-gray-400 font-bold">{index + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-gray-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-700">{item.selectedSize || 'Standard'}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-900">{item.qty}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-gray-600">₹{item.price}</td>
                    <td className="py-3.5 px-4 text-right font-black text-gray-900">₹{(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-200 gap-4">
            <div className="text-[11px] text-gray-400 font-medium space-y-1">
              <p>• Goods once sold can be returned/exchanged within 7 days with valid receipt.</p>
              <p>• Computer generated bill, no signature required.</p>
            </div>

            <div className="w-full sm:w-64 space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal:</span>
                <span>₹{(order.totalPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Taxes & GST (Incl.):</span>
                <span>₹0.00</span>
              </div>
              <div className="flex justify-between text-gray-900 font-black text-base border-t border-gray-200 pt-2 mt-1">
                <span>Total Paid:</span>
                <span>₹{(order.totalPrice || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center border-t border-dashed border-gray-200 pt-6 space-y-4">
            <p className="text-xs font-black uppercase tracking-widest text-gray-900">Thank you for shopping at My Wearables!</p>
            <p className="text-[11px] text-gray-500 font-medium">Visit again for latest high-quality fashion collection.</p>
            
            <div className="pt-2 no-print flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleSendWhatsAppPDF}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                <MessageCircle size={18} />
                Send PDF to WhatsApp (+{order.phoneNumber || 'N/A'})
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={generatingPdf}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-100 text-gray-900 border border-gray-300 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
              >
                <Download size={18} />
                Download PDF File
              </button>
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95"
              >
                <Printer size={18} />
                Print Physical Bill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceModal;
