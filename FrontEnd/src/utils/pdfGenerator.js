import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDFInvoice = (order) => {
    try {
        if (!order) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // 1. Company Header
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(33, 33, 33);
        doc.text("MASCLE", 14, 22);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("123 Fashion Street, Style City, SC 12345", 14, 30);
        doc.text("Email: support@mascle.com", 14, 35);
        doc.text("Phone: +1 234 567 8900", 14, 40);

        // 2. Invoice Details
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(33, 33, 33);
        doc.text("INVOICE", pageWidth - 14, 22, { align: "right" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const orderId = order.id || order.orderId || "N/A";
        const date = new Date(order.createdAt || order.orderDate || new Date()).toLocaleDateString();
        
        doc.text(`Invoice Number: #INV-${orderId}`, pageWidth - 14, 30, { align: "right" });
        doc.text(`Order Date: ${date}`, pageWidth - 14, 35, { align: "right" });
        doc.text(`Payment Method: ${(order.paymentMethod || 'Online').toUpperCase()}`, pageWidth - 14, 40, { align: "right" });

        // 3. Billing / Shipping Details
        doc.setDrawColor(200, 200, 200);
        doc.line(14, 48, pageWidth - 14, 48); // separator

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text("Billed To:", 14, 58);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const sInfo = order.shippingInfo || {};
        doc.text(`${sInfo.fullName || 'Customer Name'}`, 14, 65);
        doc.text(`${sInfo.address || 'Address N/A'}`, 14, 70);
        doc.text(`${sInfo.city || ''}, ${sInfo.state || ''} - ${sInfo.zipCode || ''}`, 14, 75);
        doc.text(`${sInfo.phone || ''}`, 14, 80);
        doc.text(`${sInfo.email || ''}`, 14, 85);

        // 4. Products Table
        const tableData = (order.items || []).map(item => [
            item.productName || 'Unknown Product',
            item.selectedSize || '-',
            item.quantity || 1,
            `Rs. ${item.price || 0}`
        ]);

        autoTable(doc, {
            startY: 95,
            head: [['Product Description', 'Size', 'Qty', 'Unit Price']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [33, 33, 33], textColor: 255 },
            styles: { fontSize: 9, cellPadding: 5 },
            columnStyles: { 
                0: { cellWidth: 80 }, 
                2: { halign: 'center' }, 
                3: { halign: 'right' } 
            }
        });

        // 5. Totals
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 120;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        const subtotal = order.total || 0; 
        doc.text(`Subtotal:`, pageWidth - 50, finalY);
        doc.text(`Rs. ${subtotal}`, pageWidth - 14, finalY, { align: "right" });

        doc.setFont("helvetica", "bold");
        doc.text(`Total Amount:`, pageWidth - 50, finalY + 8);
        doc.text(`Rs. ${subtotal}`, pageWidth - 14, finalY + 8, { align: "right" });

        // 6. Footer
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(150, 150, 150);
        doc.text("Thank you for shopping with MASCLE!", pageWidth / 2, 280, { align: "center" });

        // Download PDF
        doc.save(`Invoice_${orderId}.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF Invoice:", error);
        alert("Sorry, failed to download invoice. Check console for details.");
    }
};
