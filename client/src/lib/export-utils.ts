import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Validation, OrderDB, Truck } from '@shared/schema';

const getOrderInfo = (orderId: string, orders: OrderDB[]) => {
    const order = orders.find(o => o.id === orderId);
    return order ? { number: order.orderNumber, client: order.client, station: order.station } : { number: orderId, client: '?', station: '?' };
};

const getDriverName = (licensePlate: string, trucks: Truck[]) => {
    const truck = trucks.find(t => t.licensePlate === licensePlate);
    return truck?.driverName || '-';
};

export const exportValidationsToExcel = (validations: Validation[], orders: OrderDB[], trucks: Truck[]) => {
    const data = validations.map(v => {
        const plan = JSON.parse(v.plan);
        const orderIds = Array.from(new Set(plan.flatMap((p: any) => p.orders || []))) as string[];

        const details = orderIds.map(id => getOrderInfo(id, orders));

        const orderNumbers = details.map(d => d.number).join(', ');
        const clients = Array.from(new Set(details.map(d => d.client))).join(', ');
        const stations = Array.from(new Set(details.map(d => d.station))).join(', ');

        // Format compartment details correctly: "Comp 1 (Product): Load L"
        const formattedPlan = plan.map((p: any, idx: number) => {
            const product = p.product || 'VIDE';
            return `Comp ${idx + 1} (${product}): ${p.load}L`;
        }).join(' | ');

        return {
            'Date': new Date(v.date).toLocaleDateString(),
            'Immatriculation': v.licensePlate,
            'Chauffeur': getDriverName(v.licensePlate, trucks),
            'Zone': v.zone,
            'N° Commandes': orderNumbers || 'N/A',
            'Clients': clients || 'N/A',
            'Stations': stations || 'N/A',
            'Volume Total (L)': v.totalVolume,
            'Taux de Remplissage (%)': v.fillRate,
            'Détails du Plan': formattedPlan
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Validations');

    // Set column widths
    const wscols = [
        { wch: 15 }, // Date
        { wch: 15 }, // Immatriculation
        { wch: 20 }, // Chauffeur
        { wch: 15 }, // Zone
        { wch: 30 }, // N° Commandes
        { wch: 20 }, // Clients
        { wch: 20 }, // Stations
        { wch: 15 }, // Volume
        { wch: 20 }, // Remplissage
        { wch: 100 } // Détails
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Validations_PetroOptimiser_${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportValidationsToPDF = (validations: Validation[], orders: OrderDB[], trucks: Truck[]) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const today = new Date().toLocaleDateString();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.text('Rapport des Validations - Petro-Optimiser', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le : ${today}`, 14, 30);

    const tableData = validations.map(v => {
        const plan = JSON.parse(v.plan);
        const orderIds = Array.from(new Set(plan.flatMap((p: any) => p.orders || []))) as string[];

        const details = orderIds.map(id => getOrderInfo(id, orders));

        const orderNumbers = details.map(d => d.number).join(', ');
        const clients = Array.from(new Set(details.map(d => d.client))).join(', ');
        const stations = Array.from(new Set(details.map(d => d.station))).join(', ');

        // Format plan for PDF (simplified or multiline if needed, but keeping it inline for now)
        const formattedPlan = plan.map((p: any, idx: number) => {
            const product = p.product || 'VIDE';
            return `C${idx + 1}(${product}):${p.load}L`;
        }).join(' | ');

        return [
            new Date(v.date).toLocaleDateString(),
            v.licensePlate,
            getDriverName(v.licensePlate, trucks),
            v.zone,
            orderNumbers || '-',
            clients || '-',
            stations || '-',
            `${v.totalVolume.toLocaleString()} L`,
            `${v.fillRate}%`,
            formattedPlan
        ];
    });

    autoTable(doc, {
        startY: 40,
        head: [['Date', 'Camion', 'Chauffeur', 'Zone', 'Commandes', 'Clients', 'Stations', 'Volume', 'Remplissage', 'Détails']],
        body: tableData,
        headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { fontSize: 8, cellPadding: 2 },
    });

    doc.save(`Validations_PetroOptimiser_${new Date().toISOString().split('T')[0]}.pdf`);
};
