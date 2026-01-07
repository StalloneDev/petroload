import { useQuery } from "@tanstack/react-query";
import { Validation, OrderDB, Truck } from "@shared/schema";
import { Header } from "@/components/header";
import { ClipboardCheck, Search, Eye, Droplets, BarChart, FileSpreadsheet, FileText } from "lucide-react";
import { exportValidationsToExcel, exportValidationsToPDF } from "@/lib/export-utils";
import { useState, useMemo } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function ValidationsPage() {
    const [search, setSearch] = useState("");
    const [selectedValidation, setSelectedValidation] = useState<Validation | null>(null);

    const { data: validations = [], isLoading } = useQuery<Validation[]>({
        queryKey: ["/api/validations"],
    });

    const { data: allOrders = [] } = useQuery<OrderDB[]>({
        queryKey: ["/api/orders/all"],
    });

    const { data: trucks = [] } = useQuery<Truck[]>({
        queryKey: ["/api/trucks"],
    });

    const filteredValidations = useMemo(() => {
        return validations.filter(v =>
            v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
            v.zone.toLowerCase().includes(search.toLowerCase())
        );
    }, [validations, search]);

    // Helper to resolve order details
    const getOrderDetails = (orderId: string) => {
        const order = allOrders.find(o => o.id === orderId);
        return order ? { number: order.orderNumber, client: order.client, station: order.station } : { number: orderId, client: '?', station: '?' };
    };

    // Helper to resolve driver name
    const getDriverName = (licensePlate: string) => {
        // Try to find by license plate since that's what we display validation against
        // Note: Ideally we would use truckId if available and reliable, but license plate is also unique
        const truck = trucks.find(t => t.licensePlate === licensePlate);
        return truck?.driverName || '-';
    };

    // KPI Calculations
    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const todayValidations = validations.filter(v => v.date.startsWith(today));

        const count = todayValidations.length;
        const volume = todayValidations.reduce((sum, v) => sum + v.totalVolume, 0);
        const avgFill = todayValidations.length > 0
            ? Math.round(todayValidations.reduce((sum, v) => sum + v.fillRate, 0) / todayValidations.length)
            : 0;

        return { count, volume, avgFill };
    }, [validations]);

    return (
        <div className="container mx-auto p-6 space-y-8">
            <Header
                title="Mes Validations"
                subtitle="Historique des chargements validés et rapports"
            >
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-600"
                        onClick={() => exportValidationsToExcel(filteredValidations, allOrders, trucks)}
                        disabled={filteredValidations.length === 0}
                    >
                        <FileSpreadsheet className="h-4 w-4" /> Exporter Excel
                    </Button>
                    <Button
                        variant="outline"
                        className="gap-2 border-primary/50 hover:bg-primary/10 text-primary"
                        onClick={() => exportValidationsToPDF(filteredValidations, allOrders, trucks)}
                        disabled={filteredValidations.length === 0}
                    >
                        <FileText className="h-4 w-4" /> Exporter PDF
                    </Button>
                </div>
            </Header>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/50 border-emerald-500/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Validations Jour</div>
                            <ClipboardCheck className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="mt-2 text-3xl font-bold font-mono text-emerald-500">{stats.count}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-blue-500/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Volume Total Chargé</div>
                            <Droplets className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="mt-2 text-3xl font-bold font-mono text-blue-500">
                            {stats.volume.toLocaleString()} <span className="text-sm font-light">L</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-orange-500/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Taux Moyen Occupation</div>
                            <BarChart className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="mt-2 text-3xl font-bold font-mono text-orange-500">
                            {stats.avgFill}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par immatriculation ou zone..."
                        className="pl-10 h-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-card rounded-md border border-border overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-secondary/30">
                        <TableRow>
                            <TableHead className="font-bold">Date</TableHead>
                            <TableHead className="font-bold">Camion</TableHead>
                            <TableHead className="font-bold">Chauffeur</TableHead>
                            <TableHead className="font-bold">Zone</TableHead>
                            <TableHead className="font-bold">Volume Total</TableHead>
                            <TableHead className="font-bold">Remplissage</TableHead>
                            <TableHead className="text-right font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredValidations.map((v) => (
                            <TableRow key={v.id} className="hover:bg-secondary/10 transition-colors">
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {new Date(v.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="font-bold text-primary">{v.licensePlate}</TableCell>
                                <TableCell className="text-sm">{getDriverName(v.licensePlate)}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-semibold">{v.zone}</Badge>
                                </TableCell>
                                <TableCell className="font-mono font-semibold">{v.totalVolume.toLocaleString()} L</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500"
                                                style={{ width: `${v.fillRate}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold">{v.fillRate}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary" onClick={() => setSelectedValidation(v)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!selectedValidation} onOpenChange={() => setSelectedValidation(null)}>
                <DialogContent className="max-w-3xl bg-card border-border">
                    <DialogHeader className="border-b border-border pb-4">
                        <DialogTitle className="text-primary font-mono text-xl flex items-center gap-2">
                            <ClipboardCheck className="w-6 h-6" /> Détails du Chargement - {selectedValidation?.licensePlate}
                        </DialogTitle>
                    </DialogHeader>
                    {selectedValidation && (
                        <div className="space-y-6 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-secondary/20 rounded border border-border/50">
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Volume Total</div>
                                    <div className="text-2xl font-mono font-bold text-foreground">{selectedValidation.totalVolume.toLocaleString()} L</div>
                                </div>
                                <div className="p-4 bg-secondary/20 rounded border border-border/50">
                                    <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Taux de Remplissage</div>
                                    <div className="text-2xl font-mono font-bold text-emerald-500">{selectedValidation.fillRate}%</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 px-1">
                                    <Droplets className="w-3 h-3" /> Répartition par Compartiment
                                </h4>
                                <div className="space-y-3 max-h-[40vh] overflow-auto pr-2">
                                    {JSON.parse(selectedValidation.plan).map((comp: any, idx: number) => {
                                        const compOrders = comp.orders || [];
                                        return (
                                            <div key={idx} className="p-4 border border-border bg-background/50 rounded-sm">
                                                <div className="flex justify-between items-center mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="secondary" className="font-mono h-6 w-8 flex items-center justify-center">#{idx + 1}</Badge>
                                                        <span className="text-sm font-bold font-mono">{comp.capacity} L</span>
                                                    </div>
                                                    <Badge className={comp.product ? "bg-primary/20 text-primary border-primary/20" : "bg-slate-500/10 text-slate-400 border-slate-500/20"}>
                                                        {comp.product || "VIDE"}
                                                    </Badge>
                                                </div>
                                                <div className="flex justify-between items-center text-xs px-1">
                                                    <span className="text-muted-foreground font-medium italic">Volume chargé :</span>
                                                    <span className="font-mono font-bold text-foreground">{comp.load} L</span>
                                                </div>
                                                {compOrders.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-border/30">
                                                        <div className="text-[10px] uppercase font-bold text-muted-foreground mb-2 flex items-center gap-1">
                                                            <Search className="w-2 h-2" /> Commandes liées:
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            {compOrders.map((id: string) => {
                                                                const details = getOrderDetails(id);
                                                                return (
                                                                    <div key={id} className="flex justify-between items-center p-2 bg-secondary/20 rounded border border-border/30">
                                                                        <div className="flex items-center gap-2">
                                                                            <Badge variant="outline" className="text-[10px] font-mono bg-background text-primary border-primary/30">
                                                                                {details.number}
                                                                            </Badge>
                                                                            <span className="text-[10px] text-muted-foreground">{details.client}</span>
                                                                        </div>
                                                                        <span className="text-[9px] font-mono text-muted-foreground">{details.station}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
