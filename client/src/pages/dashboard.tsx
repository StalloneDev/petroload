import { useState, useMemo } from "react";
import { TruckVisualizer } from "@/components/truck-visualizer";
import { optimizeFleet } from "@/lib/optimizer";
import { MOCK_TRUCKS, MOCK_ORDERS, PRODUCT_LABELS } from "@/lib/mock-data";
import { Truck, Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Activity, 
  Truck as TruckIcon, 
  Package, 
  Upload, 
  Plus,
  RotateCcw
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Dashboard() {
  const [trucks, setTrucks] = useState<Truck[]>(MOCK_TRUCKS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set(MOCK_ORDERS.map(o => o.id)));
  const [stats, setStats] = useState({ fillRate: 0, volumeMoved: 0 });
  const { toast } = useToast();

  // Add Truck State
  const [newTruck, setNewTruck] = useState({ name: '', plate: '', comps: '5000,10000,15000' });

  const handleOptimize = () => {
    const ordersToOptimize = orders.filter(o => selectedOrderIds.has(o.id));
    if (ordersToOptimize.length === 0) {
      toast({ title: "Erreur", description: "Veuillez sélectionner au moins une commande.", variant: "destructive" });
      return;
    }

    const result = optimizeFleet(trucks.map(t => ({ ...t, status: 'IDLE', assignedZone: null, compartments: t.compartments.map(c => ({ ...c, currentLoad: 0, productId: null, orderIds: [] })) })), ordersToOptimize);
    
    setTrucks(result.trucks);
    setStats({
      fillRate: Math.round(result.fillRate),
      volumeMoved: result.totalVolumeMoved
    });

    toast({
      title: "Optimisation Terminée",
      description: `Taux de remplissage : ${result.fillRate.toFixed(1)}% | Volume : ${result.totalVolumeMoved}L`,
    });
  };

  const handleReset = () => {
    setTrucks(MOCK_TRUCKS);
    setOrders(MOCK_ORDERS);
    setSelectedOrderIds(new Set(MOCK_ORDERS.map(o => o.id)));
    setStats({ fillRate: 0, volumeMoved: 0 });
  };

  const handleAddTruck = () => {
    const capacities = newTruck.comps.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    if (!newTruck.name || capacities.length === 0) return;

    const truck: Truck = {
      id: `T-${Date.now()}`,
      name: newTruck.name,
      licensePlate: newTruck.plate,
      maxWeight: capacities.reduce((a, b) => a + b, 0) * 0.8, // Estimate
      status: 'IDLE',
      assignedZone: null,
      compartments: capacities.map((cap, i) => ({
        id: `c-${Date.now()}-${i}`,
        capacity: cap,
        currentLoad: 0,
        productId: null,
        orderIds: []
      }))
    };

    setTrucks([...trucks, truck]);
    setNewTruck({ name: '', plate: '', comps: '5000,10000,15000' });
    toast({ title: "Camion Ajouté", description: `${truck.name} a été ajouté à la flotte.` });
  };

  const toggleOrder = (id: string) => {
    const next = new Set(selectedOrderIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedOrderIds(next);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 font-sans bg-grid-pattern">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-primary flex items-center gap-3">
            <Activity className="h-8 w-8" />
            OPTIFLEET <span className="text-foreground/50 text-lg font-light hidden sm:inline">| Commande Logistique</span>
          </h1>
          <p className="text-muted-foreground font-mono text-xs mt-1">
            Système d'Optimisation du Transport Pétrolier v1.0
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground" onClick={handleLogout}>
            Déconnexion
          </Button>
          <Button variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary" onClick={() => toast({ title: "Importation", description: "Simulation de lecture de fichier Excel..." })}>
            <Upload className="mr-2 h-4 w-4" /> Importer Excel
          </Button>
          <Button onClick={handleOptimize} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_0_15px_rgba(251,146,60,0.3)]">
            <Activity className="mr-2 h-4 w-4" /> Lancer l'Optimiseur
          </Button>
          <Button variant="ghost" size="icon" onClick={handleReset} title="Réinitialiser">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Taux de Remplissage</div>
                  <BarChart className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 text-3xl font-bold font-mono text-primary">{stats.fillRate}%</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Volume Déplacé</div>
                  <Package className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-3xl font-bold font-mono text-emerald-500">
                  {stats.volumeMoved.toLocaleString()} <span className="text-sm font-light">L</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/20 relative group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Camions Actifs</div>
                  <div className="flex items-center gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full hover:bg-primary/20 text-primary">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border">
                            <DialogHeader>
                                <DialogTitle className="font-mono text-primary">Ajouter un Camion</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Nom du Camion</Label>
                                    <Input placeholder="Ex: Titan-1" value={newTruck.name} onChange={e => setNewTruck({...newTruck, name: e.target.value})} className="bg-background border-border" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Plaque d'Immatriculation</Label>
                                    <Input placeholder="Ex: AA-123-BB" value={newTruck.plate} onChange={e => setNewTruck({...newTruck, plate: e.target.value})} className="bg-background border-border" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Configuration Compartiments (Capacités en L, séparées par virgule)</Label>
                                    <Input placeholder="5000, 10000, 15000" value={newTruck.comps} onChange={e => setNewTruck({...newTruck, comps: e.target.value})} className="bg-background border-border" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddTruck} className="bg-primary text-primary-foreground w-full">Enregistrer le Camion</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <TruckIcon className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <div className="mt-2 text-3xl font-bold font-mono text-blue-500">
                  {trucks.filter(t => t.status !== 'IDLE').length} <span className="text-sm font-light">/ {trucks.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border bg-card/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest font-mono">
                <TruckIcon className="h-5 w-5 text-primary" /> Statut de la Flotte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[600px] overflow-auto pr-2">
              {trucks.map(truck => (
                <TruckVisualizer key={truck.id} truck={truck} allOrders={MOCK_ORDERS} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-full border-border bg-card/30 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-widest font-mono">
                <Package className="h-5 w-5 text-primary" /> Commandes en Attente
                <span className="ml-auto text-[10px] bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">
                  {orders.length} TOTAL
                </span>
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Button variant="ghost" className="text-[10px] h-6 p-0 hover:bg-transparent" onClick={() => setSelectedOrderIds(new Set(orders.map(o => o.id)))}>Tout Sélectionner</Button>
                <Separator orientation="vertical" className="h-3" />
                <Button variant="ghost" className="text-[10px] h-6 p-0 hover:bg-transparent" onClick={() => setSelectedOrderIds(new Set())}>Désélectionner</Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto max-h-[calc(100vh-320px)] pr-2">
              <div className="space-y-2">
                <AnimatePresence>
                  {orders.map(order => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={order.id} 
                      className={cn(
                        "p-3 bg-card border rounded-sm transition-all flex items-start gap-3",
                        selectedOrderIds.has(order.id) ? "border-primary/50 bg-primary/5" : "border-border opacity-60"
                      )}
                    >
                      <Checkbox 
                        id={order.id} 
                        checked={selectedOrderIds.has(order.id)} 
                        onCheckedChange={() => toggleOrder(order.id)}
                        className="mt-1"
                      />
                      <label htmlFor={order.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-mono text-[10px] font-bold text-primary">{order.id}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{order.zone.replace('Zone ', '')}</span>
                        </div>
                        <div className="text-xs font-bold mb-1">{order.customerName}</div>
                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                          <span>{PRODUCT_LABELS[order.product]}</span>
                          <span className="text-foreground">{order.quantity.toLocaleString()} L</span>
                        </div>
                      </label>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
