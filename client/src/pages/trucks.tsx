import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Truck, InsertTruck } from "@shared/schema";
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
import { Pencil, Trash2, Plus, Truck as TruckIcon, RefreshCcw, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function TrucksPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [editingTruck, setEditingTruck] = useState<Truck | null>(null);

    const { data: trucks = [], isLoading } = useQuery<Truck[]>({
        queryKey: ["/api/trucks"],
    });

    const createMutation = useMutation({
        mutationFn: async (newTruck: InsertTruck) => {
            const res = await fetch("/api/trucks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTruck),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
            setIsOpen(false);
            toast({ title: "Succès", description: "Camion ajouté avec succès" });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (truck: Truck) => {
            const res = await fetch(`/api/trucks/${truck.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(truck),
            });
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
            setIsOpen(false);
            setEditingTruck(null);
            toast({ title: "Succès", description: "Camion mis à jour" });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await fetch(`/api/trucks/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/trucks"] });
            toast({ title: "Succès", description: "Camion supprimé" });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const capacityStr = formData.get("capacity") as string;
        const capacity = capacityStr.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

        const data: InsertTruck = {
            licensePlate: formData.get("licensePlate") as string,
            capacity: capacity,
            driverName: (formData.get("driverName") as string) || null,
            driverPhone: (formData.get("driverPhone") as string) || null,
            status: (formData.get("status") as string) || (editingTruck?.status ?? 'AVAILABLE'),
        };

        if (editingTruck) {
            const updateData = { ...data, id: editingTruck.id, status: data.status ?? 'AVAILABLE' };
            updateMutation.mutate(updateData as unknown as Truck);
        } else {
            createMutation.mutate(data);
        }
    };

    const openEdit = (truck: Truck) => {
        setEditingTruck(truck);
        setIsOpen(true);
    };

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const filteredTrucks = trucks.filter(truck =>
        (statusFilter === "ALL" || truck.status === statusFilter) &&
        (truck.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (truck.driverName && truck.driverName.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <div className="container mx-auto p-6 space-y-8">
            <Header
                title={
                    <>
                        <TruckIcon className="h-8 w-8" /> Flotte & Chauffeurs
                    </>
                }
                subtitle="Gérez vos camions et conducteurs"
            >
                <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setEditingTruck(null); }}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary text-primary-foreground font-bold">
                            <Plus className="mr-2 h-4 w-4" /> Nouveau Camion
                        </Button>
                    </DialogTrigger>

                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingTruck ? "Modifier Camion" : "Ajouter Nouveau Camion"}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="licensePlate">Immatriculation</Label>
                                <Input id="licensePlate" name="licensePlate" defaultValue={editingTruck?.licensePlate} required placeholder="Ex: AA-123-BB" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="capacity">Capacités (séparées par virgule)</Label>
                                <Input id="capacity" name="capacity" defaultValue={editingTruck?.capacity.join(', ')} required placeholder="Ex: 5000, 10000, 5000" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="driverName">Nom Conducteur</Label>
                                <Input id="driverName" name="driverName" defaultValue={editingTruck?.driverName || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="driverPhone">Contact</Label>
                                <Input id="driverPhone" name="driverPhone" defaultValue={editingTruck?.driverPhone || ''} />
                            </div>
                            {editingTruck && (
                                <div className="space-y-2">
                                    <Label htmlFor="status">Statut</Label>
                                    <Select name="status" defaultValue={editingTruck.status}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Changer le statut" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="AVAILABLE">Disponible</SelectItem>
                                            <SelectItem value="IN_TRANSIT">En Transit</SelectItem>
                                            <SelectItem value="MAINTENANCE">En Maintenance</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            <DialogFooter>
                                <Button type="submit" className="w-full">Enregistrer</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </Header>

            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-1/3">
                    <Input
                        placeholder="Rechercher par immatriculation ou chauffeur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-[200px]">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tous les statuts</SelectItem>
                            <SelectItem value="AVAILABLE">Disponible</SelectItem>
                            <SelectItem value="IN_TRANSIT">En Transit</SelectItem>
                            <SelectItem value="MAINTENANCE">En Maintenance</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="bg-card rounded-md border border-border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Immatriculation</TableHead>
                            <TableHead>Capacités</TableHead>
                            <TableHead>Chauffeur</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTrucks.map((truck) => (
                            <TableRow key={truck.id}>
                                <TableCell className="font-bold text-lg font-mono">{truck.licensePlate}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-1 overflow-x-auto max-w-[300px] flex-wrap">
                                            {truck.capacity.map((cap, i) => (
                                                <span key={i} className="bg-secondary text-xs px-2 py-1 rounded-sm border border-secondary font-mono">
                                                    {cap}L
                                                </span>
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-muted-foreground font-mono">
                                            Total: {truck.capacity.reduce((a, b) => a + b, 0)}L
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{truck.driverName || '-'}</div>
                                    <div className="text-xs text-muted-foreground">{truck.driverPhone}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={truck.status === 'AVAILABLE' ? 'secondary' : 'outline'}
                                        className={cn(
                                            "font-medium",
                                            truck.status === 'AVAILABLE' ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20" :
                                                truck.status === 'MAINTENANCE' ? "bg-destructive/10 text-destructive border-destructive/20" :
                                                    "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                        )}
                                    >
                                        {truck.status === 'AVAILABLE' ? 'Disponible' :
                                            truck.status === 'MAINTENANCE' ? 'Maintenance' : 'En Transit'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <TooltipProvider>
                                        {truck.status === 'IN_TRANSIT' && (
                                            <>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                                                            onClick={() => updateMutation.mutate({ ...truck, status: 'AVAILABLE' })}
                                                        >
                                                            <RefreshCcw className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Rendre Disponible</TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/5"
                                                            onClick={() => updateMutation.mutate({ ...truck, status: 'MAINTENANCE' })}
                                                        >
                                                            <Wrench className="h-4 w-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Mettre en Maintenance</TooltipContent>
                                                </Tooltip>
                                            </>
                                        )}
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => openEdit(truck)}>
                                                    <Pencil className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Modifier</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(truck.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Supprimer</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredTrucks.length === 0 && !isLoading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    Aucun camion trouvé.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
