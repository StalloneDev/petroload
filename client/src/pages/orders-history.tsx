import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Order } from "@/lib/types";
import { Header } from "@/components/header";
import { Package, Search, Filter, CheckCircle2, AlertCircle, FileText, BarChart3, Trash2 } from "lucide-react";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function OrdersHistoryPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("LOADED_PAID"); // Default filter

    const { data: dbOrders = [], isLoading } = useQuery<any[]>({
        queryKey: ["/api/orders/all"],
    });

    const orders = useMemo(() => {
        return dbOrders.map(o => ({
            ...o,
            isLoaded: o.isLoaded === 1,
            status: o.status as any
        })) as Order[];
    }, [dbOrders]);

    // KPI Calculations
    const stats = useMemo(() => {
        const total = orders.length;
        const paid = orders.filter(o => o.status === 'PAID').length;
        const unpaid = orders.filter(o => o.status === 'PENDING').length;
        const loaded = orders.filter(o => o.isLoaded).length;

        return { total, paid, unpaid, loaded };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        let result = orders;

        // Apply Status Filter
        if (statusFilter === "LOADED_PAID") {
            result = result.filter(o => o.status === 'PAID' && o.isLoaded);
        } else if (statusFilter === "PAID") {
            result = result.filter(o => o.status === 'PAID');
        } else if (statusFilter === "PENDING") {
            result = result.filter(o => o.status === 'PENDING');
        } else if (statusFilter === "LOADED") {
            result = result.filter(o => o.isLoaded);
        }

        // Apply Search
        if (search) {
            const s = search.toLowerCase();
            result = result.filter(o =>
                o.orderNumber.toLowerCase().includes(s) ||
                o.client.toLowerCase().includes(s) ||
                o.station.toLowerCase().includes(s) ||
                o.zone.toLowerCase().includes(s)
            );
        }

        return result;
    }, [orders, statusFilter, search]);

    const handleClearHistory = async () => {
        if (confirm("Êtes-vous sûr de vouloir vider tout l'historique des commandes ? Cette action est irréversible.")) {
            try {
                const res = await fetch("/api/orders", { method: "DELETE" });
                if (res.ok) {
                    queryClient.invalidateQueries({ queryKey: ["/api/orders/all"] });
                    queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
                }
            } catch (error) {
                console.error("Error clearing history:", error);
            }
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <Header
                title="Historique des Commandes"
                subtitle="Suivi centralisé de toutes les commandes importées"
            >
                <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={handleClearHistory}
                    disabled={orders.length === 0}
                >
                    <Trash2 className="h-4 w-4" /> Vider l'historique
                </Button>
            </Header>


            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-card/50 border-primary/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-muted-foreground mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">Total Commandes</span>
                            <FileText className="h-4 w-4" />
                        </div>
                        <div className="text-3xl font-bold font-mono text-primary">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-emerald-500/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-muted-foreground mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">Réglées (PAID)</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div className="text-3xl font-bold font-mono text-emerald-500">{stats.paid}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-orange-500/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-muted-foreground mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">Non Réglées</span>
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="text-3xl font-bold font-mono text-orange-500">{stats.unpaid}</div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 border-blue-500/20 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-muted-foreground mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider">Chargées</span>
                            <BarChart3 className="h-4 w-4 text-blue-500" />
                        </div>
                        <div className="text-3xl font-bold font-mono text-blue-500">{stats.loaded}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="N°, Client, Station, Zone..."
                        className="pl-10 h-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[280px] h-10">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <SelectValue placeholder="Filtrer par statut" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Toutes les commandes</SelectItem>
                        <SelectItem value="LOADED_PAID">Réglées & Chargées (Défaut)</SelectItem>
                        <SelectItem value="PAID">Toutes les réglées</SelectItem>
                        <SelectItem value="PENDING">Toutes les non réglées</SelectItem>
                        <SelectItem value="LOADED">Toutes les chargées</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="bg-card rounded-md border border-border overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-secondary/30">
                        <TableRow>
                            <TableHead className="font-bold">N° Order</TableHead>
                            <TableHead className="font-bold">Client / Station</TableHead>
                            <TableHead className="font-bold">Produit</TableHead>
                            <TableHead className="font-bold">Quantité</TableHead>
                            <TableHead className="font-bold">Réglement</TableHead>
                            <TableHead className="font-bold">Chargement</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8">Chargement...</TableCell></TableRow>
                        ) : filteredOrders.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Aucune commande trouvée.</TableCell></TableRow>
                        ) : filteredOrders.map((o) => (
                            <TableRow key={o.id} className="hover:bg-secondary/10 transition-colors">
                                <TableCell className="font-mono text-xs font-bold">{o.orderNumber}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm">{o.client}</span>
                                        <span className="text-[10px] text-muted-foreground italic">{o.station} ({o.zone})</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px] font-bold">{o.product}</Badge>
                                </TableCell>
                                <TableCell className="font-mono font-bold">{o.quantity.toLocaleString()} L</TableCell>
                                <TableCell>
                                    {o.status === 'PAID' ? (
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 flex w-fit gap-1 items-center">
                                            <CheckCircle2 className="h-3 w-3" /> RÉGLÉ
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-orange-500 border-orange-500/20 flex w-fit gap-1 items-center">
                                            <AlertCircle className="h-3 w-3" /> EN ATTENTE
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {o.isLoaded ? (
                                        <Badge className="bg-blue-500 text-white font-bold flex w-fit gap-1 items-center">
                                            <BarChart3 className="h-3 w-3" /> CHARGÉ
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="font-bold flex w-fit gap-1 items-center">
                                            EN ATTENTE
                                        </Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
