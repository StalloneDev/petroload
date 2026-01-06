
import * as XLSX from 'xlsx';
import { Order } from './types';
import { Station } from '@shared/schema';

// Mapping:
// Contact -> Station Name (Lookup Zone from fetched Stations)
// Nom du client -> Client
// Qté à expédier -> Quantity (Clean spaces)
// Description -> Product
// Réglé -> isPaid (Statut)
// N° -> OrderNumber

export async function parseExcel(file: File, stations: Station[]): Promise<Order[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                // Convert to JSON with header row
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                const orders: Order[] = (jsonData.map((row: any, index: number) => {
                    // 1. Resolve Station and Zone
                    const excelContact = row['Contact']?.toString().trim();
                    const excelClient = row['Nom du client']?.toString().trim();

                    // Helper to normalize strings for comparison
                    const normalize = (str: any) => {
                        if (!str) return "";
                        return str.toString().toLowerCase()
                            .replace(/^station\s+/i, "") // Remove "STATION " prefix
                            .replace(/\b(sainte|saint)\b/gi, "ste") // Canonize SAINTE/SAINT -> STE
                            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
                            .replace(/[^\w\s]/g, " ") // Replace punctuation with space
                            .replace(/\s+/g, " ") // Collapse multiple spaces
                            .trim();
                    };

                    const searchContact = normalize(excelContact);
                    const searchClient = normalize(excelClient);

                    // 1. debug
                    if (index === 0) console.log("Excel Row Headers:", Object.keys(row));
                    if (index < 5) console.log(`Row ${index} - Contact: "${excelContact}" (Norm: "${searchContact}"), Client: "${excelClient}" (Norm: "${searchClient}")`);

                    // 3. Robust matching: Try to match against Station Name, Station Contact Code, OR Station Client Name
                    const matchingStation = stations.find(s => {
                        const sName = normalize(s.name);
                        const sContact = normalize(s.contact || "");
                        const sClient = normalize(s.clientName);

                        return (searchContact && (sName === searchContact || sContact === searchContact || sClient === searchContact || sName.includes(searchContact))) ||
                            (searchClient && (sName === searchClient || sContact === searchClient || sClient === searchClient || sName.includes(searchClient)));
                    });

                    if (index < 5 && !matchingStation) {
                        console.warn(`No match found row ${index}. Tried: "${searchContact}" and "${searchClient}"`);
                    }

                    const zone = matchingStation ? matchingStation.zone : 'Zone Inconnue';
                    const stationName = matchingStation ? matchingStation.name : (excelContact || excelClient || 'Station Inconnue');

                    // 2. Parse Quantity (remove spaces, e.g. "10 000" -> 10000)
                    const rawQty = row['Qté à expédier'];
                    const quantity = typeof rawQty === 'string'
                        ? parseInt(rawQty.replace(/\s/g, ''), 10)
                        : (typeof rawQty === 'number' ? rawQty : 0);

                    // 3. Status
                    const isPaid = row['Réglé'] === 'Oui';

                    // 4. Map Product
                    let product = row['Description'] || 'DIESEL'; // Default
                    const desc = product.toUpperCase();
                    if (desc.includes("GASOIL")) product = "DIESEL";
                    else if (desc.includes("ESSENCE") || desc.includes("SUPER") || desc.includes("SANS PLOMB")) product = "SP95";
                    else if (desc.includes("FIOUL")) product = "HEATING_OIL";

                    return {
                        id: `ORD-${Date.now()}-${index}`,
                        orderNumber: row['N°']?.toString() || `UNK-${index}`,
                        client: excelClient || 'Client Inconnu',
                        station: stationName,
                        zone: zone === 'Zone Inconnue' ? 'Zone 1' : zone,
                        product: product,
                        quantity: isNaN(quantity) ? 0 : quantity,
                        remainingQuantity: isNaN(quantity) ? 0 : quantity, // Initially full
                        status: isPaid ? 'PAID' : 'PENDING',
                        isLoaded: 0
                    };
                }) as Order[]);

                resolve(orders);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
}
