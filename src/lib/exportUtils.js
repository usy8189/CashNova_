import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

export const exportDashboardToPDF = async (elementId = 'dashboard-export-area', filename = 'CashNova_Monthly_Report.pdf') => {
    const element = document.getElementById(elementId);

    if (!element) {
        toast.error("Could not find content to export.");
        return;
    }

    const toastId = toast.loading('Generating PDF report...');

    try {
        // Temporarily modify styles for better render quality if needed
        // For dark mode, it usually renders fine as long as backgrounds are explicit.

        const canvas = await html2canvas(element, {
            scale: 2, // Higher scale for better resolution
            useCORS: true,
            backgroundColor: '#0a0a0a', // Match app background
            logging: false,
            windowWidth: 1200 // Force a specific width so flex layouts don't break on resize
        });

        const imgData = canvas.toDataURL('image/png');

        // A4 Paper Dimensions in mm
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgProps = pdf.getImageProperties(imgData);
        // Calculate height proportionally based on width
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

        // If content is longer than one page, we just add the single continuous image scaled down
        // Or let it flow across pages if we specifically split it, but for a dashboard snapshot, 
        // scaling it onto one page or overflowing to a second is standard.
        // For simplicity and to match requirements gracefully, we create a single long page
        // if imgHeight > pdfHeight, otherwise standard A4.

        if (imgHeight > pdfHeight) {
            // Create custom sized PDF
            const customPdf = new jsPDF('p', 'mm', [pdfWidth, imgHeight]);
            customPdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            customPdf.save(filename);
        } else {
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(filename);
        }

        toast.success('Report exported successfully!', { id: toastId });
    } catch (error) {
        console.error("PDF Export Error: ", error);
        toast.error('Failed to generate report', { id: toastId });
    }
};
