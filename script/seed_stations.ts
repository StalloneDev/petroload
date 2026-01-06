
import 'dotenv/config';
import { db } from "../server/db";
import { stations } from "../shared/schema";

const stationsData = [
    { clientName: "SOCICA BENIN", name: "ABOMEY", contact: "CC4468", zone: "ZONE 3" },
    { clientName: "HOME DESIGN BY LADY D", name: "ADJAGBO", contact: "CC6165", zone: "ZONE 2" },
    { clientName: "NONVI", name: "ADJARRA DOCODJI", contact: "CC7433", zone: "ZONE 3" },
    { clientName: "HOPA SARL", name: "AGLA HLAZOUNTO", contact: "CC3024", zone: "ZONE 1" },
    { clientName: "NOUROU DISTRIBUTION", name: "AGLA PYLONES", contact: "CC6784", zone: "ZONE 1" },
    { clientName: "MONNOUMI", name: "AIBATIN", contact: "CC4994", zone: "ZONE 1" },
    { clientName: "SEXTANT", name: "AKASSATO", contact: "CC3025", zone: "ZONE 2" },
    { clientName: "MARJOREL SERVICES", name: "AKASSATO PAVE KEREKOU", contact: "CC8169", zone: "ZONE 2" },
    { clientName: "HOME DESIGN BY LADY D", name: "AKOGBATO", contact: "CC6462", zone: "ZONE 1" },
    { clientName: "SOCIETE DE DISTRIBUTION", name: "AKPAKPA SODJEATIME", contact: "CC6094", zone: "ZONE 1" },
    { clientName: "PUISSANCE GLORIEUSE", name: "ATROKPOCODJI", contact: "CC4993", zone: "ZONE 2" },
    { clientName: "GIBLAND COMPAGNY", name: "ATTAKE", contact: "CC2616", zone: "ZONE 3" },
    { clientName: "SOCIETE NOUVELLE SIGNA", name: "ATTOGON", contact: "CC3026", zone: "ZONE 2" },
    { clientName: "SOMAT GROUP", name: "AVOGBANNAN", contact: "CC3027", zone: "ZONE 3" },
    { clientName: "VANECOM", name: "AZOVE", contact: "CC7375", zone: "ZONE 3" },
    { clientName: "GB-OIL", name: "BANIKOARA", contact: "CC4912", zone: "ZONE 4" },
    { clientName: "AGRO-ALBIO SARL UNIPERS", name: "BANTE", contact: "CC7425", zone: "ZONE 3" },
    { clientName: "YTRYFA", name: "BEAU RIVAGE", contact: "CC4328", zone: "ZONE 3" },
    { clientName: "ETS DU COURAGE", name: "BOHICON", contact: "CC3021", zone: "ZONE 3" },
    { clientName: "JOHAND'S MARKET", name: "BOHICON MARCHE", contact: "CC7540", zone: "ZONE 3" },
    { clientName: "DOSSMARC PLUS SARL", name: "CADJEHOUN", contact: "CC3893", zone: "ZONE 1" },
    { clientName: "SOCIETE DE DISTRIBUTION", name: "CADJEHOUN (ex-SONACOP)", contact: "CC8122", zone: "ZONE 1" },
    { clientName: "NONVI", name: "CANAL DOVONOU", contact: "CC7858", zone: "ZONE 1" },
    { clientName: "TRYFA", name: "CICA TOYOTA", contact: "CC3023", zone: "ZONE 1" },
    { clientName: "LE REVEIL TOSSOU ET FILS", name: "COME", contact: "CC8203", zone: "ZONE 3" },
    { clientName: "SOGETRAS", name: "CINE LE BORGOU (Ex SONACOP)", contact: "CC8003", zone: "ZONE 4" },
    { clientName: "2M ASSOCIES", name: "COMMISSARIAT CENTRAL", contact: "CC3018", zone: "ZONE 1" },
    { clientName: "SOGETRAS", name: "COPARGO (Ex SONACOP)", contact: "CC8015", zone: "ZONE 4" },
    { clientName: "ETS SCHIBA", name: "DASSA 1 ISSALOU", contact: "CC4828", zone: "ZONE 3" },
    { clientName: "SOUDURE CONSTRUCTION", name: "DASSA 2", contact: "CC7560", zone: "ZONE 3" },
    { clientName: "LGA", name: "DEGUE GARE", contact: "CC7456", zone: "ZONE 3" },
    { clientName: "GOZA GROUP", name: "DJAKOTOMEY", contact: "CC5433", zone: "ZONE 3" },
    { clientName: "SEXTANT", name: "DJOUGOU", contact: "CC7713", zone: "ZONE 4" },
    { clientName: "HGB CONTINENTAL", name: "DJOUGOU BANQUE", contact: "CC7926", zone: "ZONE 4" },
    { clientName: "ISSIFOU ET FILS", name: "DJOUGOU TAIFA", contact: "CC5470", zone: "ZONE 4" },
    { clientName: "CHRIS GERME", name: "DOWA", contact: "CC8106", zone: "ZONE 3" },
    { clientName: "EFTA CONSULTING SARL", name: "FIFADJI", contact: "CC1498", zone: "ZONE 1" },
    { clientName: "ELONMEX", name: "FIYEGNON", contact: "CC8656", zone: "ZONE 1" },
    { clientName: "RATEL ET COMPAGNIE", name: "GBEDJROMEDE 2", contact: "CC5971", zone: "ZONE 1" },
    { clientName: "SH EXECUTIVE MANAGEMENT", name: "GBEDJROMEDE", contact: "CC4348", zone: "ZONE 1" },
    { clientName: "BONON", name: "GBEGAMEY", contact: "CC7603", zone: "ZONE 1" },
    { clientName: "SOGETRAS", name: "GBEGAMEY (EX SONACOP)", contact: "CC8131", zone: "ZONE 1" },
    { clientName: "NICE DREAM SARL", name: "GBEWA", contact: "CC2758", zone: "ZONE 1" },
    { clientName: "SAVOIR PETROLEUM", name: "COCOCODJI", contact: "CC8810", zone: "ZONE 2" },
    { clientName: "SAVOIR PETROLEUM", name: "GBODJE", contact: "CC7331", zone: "ZONE 2" },
    { clientName: "JB-CAR SARL", name: "GODOMEY CENTRE", contact: "CC3028", zone: "ZONE 2" },
    { clientName: "GB-OIL", name: "GUEMAN", contact: "CC2445", zone: "ZONE 4" },
    { clientName: "RATEL ET COMPAGNIE", name: "HEVIE", contact: "CC8934", zone: "ZONE 2" },
    { clientName: "BIBARIZ", name: "HLACOMEY", contact: "CC4473", zone: "ZONE 2" },
    { clientName: "ASG GROUP", name: "HOUNDJROTO", contact: "CC7564", zone: "ZONE 3" },
    { clientName: "ALPHA MARINE", name: "IITA", contact: "CC1922", zone: "ZONE 2" },
    { clientName: "PETRO BUSINESS", name: "JONQUET", contact: "CC7909", zone: "ZONE 1" },
    { clientName: "NICE DREAM SARL", name: "KANDI", contact: "CC2759", zone: "ZONE 4" },
    { clientName: "AGBADJAGAN BOKO ROMAIN", name: "KETOU", contact: "CC7369", "zone": "ZONE 3" },
    { clientName: "BOROU ET FILS", name: "KILIBO", contact: "CC8106", "zone": "ZONE 3" },
    { clientName: "2M ASSOCIES", name: "LA MARINA", contact: "CC6471", "zone": "ZONE 1" },
    { clientName: "HEEL ENERGY", name: "LEGBA", contact: "CC7283", "zone": "ZONE 1" },
    { clientName: "TTA ENERGIES & RESEAUX", name: "LOBOZOUNKPA", contact: "CC6783", "zone": "ZONE 2" },
    { clientName: "AYODELE BUSINESS", name: "LOKOSSA", contact: "CC7872", "zone": "ZONE 3" },
    { clientName: "SEXTANT", name: "MALANVILLE", contact: "CC2595", "zone": "ZONE 4" },
    { clientName: "BOROU ET FILS", name: "MATERI", contact: "CC7812", "zone": "ZONE 4" },
    { clientName: "SOGETRAS", name: "MISSERETE", contact: "CC5791", "zone": "ZONE 3" },
    { clientName: "SOGETRAS", name: "NATITINGOU", contact: "CC3046", "zone": "ZONE 4" },
    { clientName: "SOGETRAS", name: "NATITINGOU 3 (Ex SONACOP)", contact: "CC8038", "zone": "ZONE 4" },
    { clientName: "Ets A I", name: "NATITINGOU II", contact: "CC5522", "zone": "ZONE 4" },
    { clientName: "TONI ET FILS", name: "NDALI", contact: "CC2650", "zone": "ZONE 4" },
    { clientName: "WASHIMAC RESOURCES", name: "NIKKI BOUKA SOUA", contact: "CC5316", "zone": "ZONE 4" },
    { clientName: "JM PETRO (JMP)", name: "NIKKI Gah-Maro", contact: "CC7451", "zone": "ZONE 4" },
    { clientName: "ESSENAM OIL", name: "NOTRE DAME GANHI", contact: "CC7281", "zone": "ZONE 1" },
    { clientName: "SOGETRAS", name: "OUAKE (Ex SONACOP)", contact: "CC8014", "zone": "ZONE 4" },
    { clientName: "LE FILON INTERNATIONAL", name: "SOUEDO", contact: "CC6516", "zone": "ZONE 2" },
    { clientName: "AYODELE BUSINESS", name: "OUIDAH", contact: "CC2614", "zone": "ZONE 2" },
    { clientName: "HYDROCARBURE DISTRIBUTION", name: "PAHOU", contact: "CC7030", "zone": "ZONE 2" },
    { clientName: "ETS SCHIBA", name: "PAOUIGNAN", contact: "CC3029", "zone": "ZONE 3" },
    { clientName: "MAGNIFISCENCE", name: "POBE", contact: "CC7186", "zone": "ZONE 3" },
    { clientName: "SOGETRAS", name: "SAVALOU (Ex SONACOP)", contact: "CC8002", "zone": "ZONE 3" },
    { clientName: "SOGETRAS", name: "SAVE ex sonacop", contact: "CC6231", "zone": "ZONE 3" },
    { clientName: "GB-OIL", name: "SINANGOUROU", contact: "CC4196", "zone": "ZONE 4" },
    { clientName: "SOGETRAS", name: "SINENDE", contact: "CC8121", "zone": "ZONE 4" },
    { clientName: "IKEOLORUN SARL", name: "SOBETEX", contact: "CC3022", "zone": "ZONE 1" },
    { clientName: "PIMAD GROUP", name: "STE CECILE", contact: "CC3022", "zone": "ZONE 1" },
    { clientName: "ADOUNI PLUS", name: "SURU LERE (EX-SONACOP)", contact: "CC6791", "zone": "ZONE 1" },
    { clientName: "BOROU", "name": "TANGUIETA", contact: "CC7558", "zone": "ZONE 4" },
    { clientName: "YEL AFRIQUE", "name": "TANKPE", contact: "CC8008", "zone": "ZONE 2" },
    { clientName: "GB-OIL", "name": "TCHETTI", contact: "CC7954", "zone": "ZONE 3" },
    { clientName: "AKINOLA AND CO", "name": "TOGBA", contact: "CC7553", "zone": "ZONE 2" },
    { clientName: "NETZACH DE AZ & FILS", "name": "TOKAN", contact: "CC4720", "zone": "ZONE 2" },
    { clientName: "SAVOIR PETROLEUM", "name": "TORI", contact: "CC7754", "zone": "ZONE 2" },
    { clientName: "ETS DU COURAGE", "name": "ZANGNANANDO", contact: "CC6482", "zone": "ZONE 3" },
    { clientName: "BENI DISTRIBUTION ET SERVICE", "name": "ZE", "contact": "CC7346", "zone": "ZONE 2" },
    { clientName: "LINARCEL", "name": "ZOGBO", "contact": "CC7401", "zone": "ZONE 1" },
    { clientName: "JABABIAH ET LECABEL", "name": "ZOUNGBONOU", "contact": "CC7783", "zone": "ZONE 3" }
];

async function seedStations() {
    console.log("Seeding stations...");
    try {
        await db.delete(stations);
        for (const station of stationsData) {
            await db.insert(stations).values(station);
        }
        console.log(`Seeded ${stationsData.length} stations successfully.`);
    } catch (error) {
        console.error("Error seeding stations:", error);
    } finally {
        process.exit(0);
    }
}

seedStations();
