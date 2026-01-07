import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Station, InsertStation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, MapPin, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { useMemo } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function StationsPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingStation, setEditingStation] = useState<Station | null>(null);

    const { data: stations = [], isLoading } = useQuery<Station[]>({
        queryKey: ["/api/stations"],
    });

    const createMutation = useMutation({
        mutationFn: async (newStation: InsertStation) => {
            const res = await fetch("/api/stations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newStation),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/stations"] });
            setIsOpen(false);
            toast({ title: "Succès", description: "Station créée avec succès" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (station: Station) => {
            const res = await fetch(`/api/stations/${station.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(station),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/stations"] });
            setIsOpen(false);
            setEditingStation(null);
            toast({ title: "Succès", description: "Station mise à jour" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/stations/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/stations"] });
            toast({ title: "Succès", description: "Station supprimée" });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data: InsertStation = {
            clientName: formData.get("clientName") as string,
            name: formData.get("name") as string,
            contact: (formData.get("contact") as string) || null,
            zone: formData.get("zone") as string,
        } as InsertStation;

        if (editingStation) {
            const updateData = { ...data, id: editingStation.id, contact: data.contact ?? null };
            updateMutation.mutate(updateData as unknown as Station);
        } else {
            createMutation.mutate(data);
        }
    };

    const openEdit = (station: Station) => {
        setEditingStation(station);
        setIsOpen(true);
    };

    const getZoneColor = (zone: string) => {
        if (zone.toLowerCase().includes("zone 1")) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        if (zone.toLowerCase().includes("zone 2")) return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
        if (zone.toLowerCase().includes("zone 3")) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        if (zone.toLowerCase().includes("zone 4")) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
        return "bg-secondary text-secondary-foreground";
    };

    const [search, setSearch] = useState("");
    const [zoneFilter, setZoneFilter] = useState("all");

    const zones = useMemo(() => {
        const uniqueZones = Array.from(new Set(stations.map(s => s.zone)));
        return uniqueZones.sort();
    }, [stations]);

    const filteredStations = stations.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.clientName.toLowerCase().includes(search.toLowerCase());
        const matchesZone = zoneFilter === "all" || s.zone === zoneFilter;
        return matchesSearch && matchesZone;
    });

    return (
        <div className="container mx-auto p-6 space-y-8">
            <Header
                title="Répertoire Stations"
                subtitle="Gérez vos points de livraison et clients"
            >
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingStation(null); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary text-primary-foreground font-bold">
                            <Plus className="mr-2 h-4 w-4" /> Nouvelle Station
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingStation ? "Modifier Station" : "Ajouter Nouvelle Station"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="clientName">Nom Client</Label>
                                <Input id="clientName" name="clientName" defaultValue={editingStation?.clientName} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Station</Label>
                                <Input id="name" name="name" defaultValue={editingStation?.name} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="zone">Zone</Label>
                                <Input id="zone" name="zone" defaultValue={editingStation?.zone} required placeholder="Ex: Zone 1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contact">Contact</Label>
                                <Input id="contact" name="contact" defaultValue={editingStation?.contact || ''} />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="w-full">Enregistrer</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </Header>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une station..."
                        className="pl-10 bg-card border-border"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={zoneFilter} onValueChange={setZoneFilter}>
                    <SelectTrigger className="w-[200px] bg-card border-border text-foreground">
                        <SelectValue placeholder="Filtrer par Zone" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        <SelectItem value="all">Toutes les Zones</SelectItem>
                        {zones.map(z => (
                            <SelectItem key={z} value={z}>{z}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-card rounded-md border border-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom Client</TableHead>
                            <TableHead>Station</TableHead>
                            <TableHead>Zone</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredStations.map((station) => (
                            <TableRow key={station.id}>
                                <TableCell className="font-bold">{station.clientName}</TableCell>
                                <TableCell>{station.name}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getZoneColor(station.zone)}>
                                        {station.zone}
                                    </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-sm text-muted-foreground">{station.contact || '-'}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => openEdit(station)}>
                                        <Pencil className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(station.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredStations.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Aucune station trouvée.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
