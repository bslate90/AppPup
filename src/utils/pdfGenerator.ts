import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { PuppyProfile, HealthScheduleEntry, WeightEntry, VitalsEntry } from '../types';

export const generateVetReportPDF = (
    profile: PuppyProfile | null,
    healthSchedule: HealthScheduleEntry[],
    weightLog: WeightEntry[],
    vitalsLog: VitalsEntry[]
) => {
    const doc = new jsPDF();
    const puppyName = profile?.name || 'Puppy';
    const dateStr = format(new Date(), 'MMMM d, yyyy');

    // --- Header ---
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80); // Dark blue-grey
    doc.text('Puppy Health & Vaccination Report', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(127, 140, 141); // Grey
    doc.text(`Generated on ${dateStr}`, 14, 28);

    // --- Profile Section ---
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Puppy Profile', 14, 40);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const profileData = [
        ['Name:', puppyName],
        ['Breed:', profile?.breed || 'N/A'],
        ['Birth Date:', profile?.birthDate ? format(new Date(profile.birthDate), 'MMM d, yyyy') : 'N/A'],
        ['Color:', profile?.color || 'N/A'],
        ['Microchip ID:', profile?.microchipId || 'N/A'],
    ];

    autoTable(doc, {
        startY: 45,
        body: profileData,
        theme: 'plain',
        styles: { cellPadding: 1, fontSize: 11 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 40 } },
    });

    // --- Vaccination History ---
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Vaccination & Health Schedule', 14, (doc as any).lastAutoTable.finalY + 15);

    const healthData = healthSchedule
        .filter(entry => entry.administered)
        .map(entry => [
            format(new Date(entry.administeredDate || entry.dueDate), 'MMM d, yyyy'),
            entry.type.replace('_', ' '),
            entry.description,
            entry.administrator || 'N/A',
            entry.lotNumber || 'N/A'
        ]);

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Date', 'Type', 'Description', 'Administered By', 'Lot #']],
        body: healthData,
        headStyles: { fillColor: [52, 152, 219] }, // Blue
        styles: { fontSize: 9 },
    });

    // --- Weight History ---
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Weight History', 14, (doc as any).lastAutoTable.finalY + 15);

    const weightData = [...weightLog]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 15) // Last 15 entries
        .map(entry => [
            format(new Date(entry.date), 'MMM d, yyyy'),
            `${entry.weightGrams}g`,
            entry.notes || ''
        ]);

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Date', 'Weight', 'Notes']],
        body: weightData,
        headStyles: { fillColor: [46, 204, 113] }, // Green
        styles: { fontSize: 9 },
    });

    // --- Vitals History ---
    if (vitalsLog.length > 0) {
        doc.setFontSize(16);
        doc.setTextColor(44, 62, 80);
        doc.text('Vitals History', 14, (doc as any).lastAutoTable.finalY + 15);

        const vitalsData = [...vitalsLog]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10) // Last 10 entries
            .map(entry => [
                format(new Date(entry.date), 'MMM d, yyyy'),
                entry.gumColor || 'N/A',
                entry.temperature ? `${entry.temperature}°F` : 'N/A',
                entry.fecalScore ? `Score: ${entry.fecalScore}` : 'N/A',
                entry.notes || ''
            ]);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 20,
            head: [['Date', 'Gum Color', 'Temp', 'Fecal', 'Notes']],
            body: vitalsData,
            headStyles: { fillColor: [230, 126, 34] }, // Orange
            styles: { fontSize: 9 },
        });
    }

    // --- Footer ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `AppPup - Chihuahua Health Command Center | Page ${i} of ${pageCount}`,
            doc.internal.pageSize.getWidth() / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );
    }

    doc.save(`${puppyName.toLowerCase()}_vet_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
