
import 'dotenv/config';
import { db } from "../server/db";
import { trucks } from "../shared/schema";

const trucksData = [
    { licensePlate: "BP 8169 RB", capacity: [2000, 3000, 4000, 5000, 4000], driverName: "AKONDO MBRDU M", driverPhone: "01 55 54 85 62" },
    { licensePlate: "CA 5628 RB", capacity: [2000, 3000, 5000, 5000], driverName: "AKONDO Parfait", driverPhone: "01 64 40 55 13" },
    { licensePlate: "CA 3592 RB", capacity: [3000, 1000, 8000, 7000], driverName: "NKERSSIMA Sylvain", driverPhone: "01 62 83 11 19" },
    { licensePlate: "BT 2964 RB", capacity: [2000, 2000, 3000, 2000, 3000, 3000, 4000], driverName: "TROUCOU Mohamed", driverPhone: "01 44 09 11 18" },
    { licensePlate: "BJ 3594 RB", capacity: [4000, 4000, 4000, 4000, 3000], driverName: "AHESSOU Eric", driverPhone: "01 62 16 05 38" },
    { licensePlate: "BU 2497 RB", capacity: [2000, 3000, 7000, 8000], driverName: "HOUNKPATIN Tanguy", driverPhone: "01 40 11 39 86" },
    { licensePlate: "BT 4030 RB", capacity: [2000, 4000, 4000, 5000, 5000], driverName: "SADAM Hadi", driverPhone: "01 55 59 84 55" },
    { licensePlate: "BX 0732 RB", capacity: [2000, 3000, 4000, 5000, 6000], driverName: "AMATA A Mouhammer", driverPhone: "96279607" },
    { licensePlate: "CF 3173 RB / CF 5905 RB", capacity: [5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000], driverName: "OUOTOKORRO Kabirou", driverPhone: "01 61 86 68 16" },
    { licensePlate: "BS 8091 RB", capacity: [2000, 3000, 4000, 5000, 6000], driverName: "ALISSOU IDRISSOU", driverPhone: "01 61 57 45 13" },
    { licensePlate: "BN 3828 RB / AH 7912 RB", capacity: [1000, 2000, 3000, 4000, 5000, 6000, 7000, 7000], driverName: "HOUNKPATIN Tanguy", driverPhone: "01 40 11 39 86" },
    { licensePlate: "CC 1712 RB / BV 5814 RB", capacity: [6000, 4000, 2000, 3000, 5000, 7000, 3000, 2000, 6000], driverName: "IMHENTO Mathias", driverPhone: "0162022907" },
    { licensePlate: "CC 1704 RB / BZ 4340 RB", capacity: [6000, 4000, 2000, 3000, 5000, 3000, 7000, 2000, 6000], driverName: "AGBANDA Jean", driverPhone: "01 60 97 75" },
    { licensePlate: "CF 3246 RB / CF 3277 RB", capacity: [10000, 5000, 5000, 4000, 5000, 10000], driverName: "CODIIA CLAUDE", driverPhone: "01 95 25 60 68" },
    { licensePlate: "BZ 6565 RB / CE 2935 RB", capacity: [10000, 5000, 5000, 5000, 5000, 10000], driverName: "ALAVO EDO Jules", driverPhone: "01 65 09 01 40" },
    { licensePlate: "CA 5565 RB / CE 2940 RB", capacity: [10000, 5000, 5000, 5000, 5000, 5000, 10000], driverName: "ADENANOUKON Datio", driverPhone: "01 94 77 09 13" },
    { licensePlate: "ED 7863 RB / CE 3159 RB", capacity: [10000, 5000, 5000, 5000, 5000, 10000], driverName: "BOUCARI Mahamoudou", driverPhone: "01 47 36 24 93" },
    { licensePlate: "BT 5259 RB / BT 5261 RB", capacity: [10000, 11000, 12000, 12000], driverName: "ALAKPATA Octave", driverPhone: "01 57 48 17 15" }
];

async function seedTrucks() {
    console.log("Seeding trucks...");
    try {
        await db.delete(trucks);
        for (const truck of trucksData) {
            await db.insert(trucks).values({
                ...truck,
                status: 'AVAILABLE'
            });
        }
        console.log(`Seeded ${trucksData.length} trucks successfully.`);
    } catch (error) {
        console.error("Error seeding trucks:", error);
    } finally {
        process.exit(0);
    }
}

seedTrucks();
