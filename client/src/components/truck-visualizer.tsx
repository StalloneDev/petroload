import { Truck, Compartment, ProductType, Order } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PRODUCT_LABELS } from "../lib/mock-data";
import { Info, Package, Truck as TruckIcon, User, Droplets, Hash, MapPin, CheckCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface TruckVisualizerProps {
  truck: Truck;
  allOrders: Order[];
  onValidate?: (truck: Truck) => void;
  isValidating?: boolean;
}

const PRODUCT_COLORS: Record<ProductType, string> = {
  DIESEL: "bg-slate-700",
  SP95: "bg-emerald-600",
  SP98: "bg-cyan-600",
  HEATING_OIL: "bg-orange-600",
};

const PRODUCT_TEXT_COLORS: Record<ProductType, string> = {
  DIESEL: "text-slate-400",
  SP95: "text-emerald-400",
  SP98: "text-cyan-400",
  HEATING_OIL: "text-orange-400",
};

export function TruckVisualizer({ truck, allOrders, onValidate, isValidating }: TruckVisualizerProps) {
  const totalCapacity = truck.compartments.reduce((acc, c) => acc + c.capacity, 0);
  const totalLoad = truck.compartments.reduce((acc, c) => acc + c.currentLoad, 0);
  const fillRate = Math.round((totalLoad / totalCapacity) * 100);

  return (
    <div className="flex flex-col gap-2 p-4 border border-border bg-card/50 rounded-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-mono font-bold text-foreground flex items-center gap-2">
            <TruckIcon className="w-4 h-4 text-primary" /> {truck.name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono">{truck.licensePlate}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            {truck.status === 'OPTIMIZED' && (
              fillRate === 100 ? (
                <Button
                  size="sm"
                  className="h-7 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  onClick={() => onValidate?.(truck)}
                  disabled={isValidating}
                >
                  <CheckCircle className="w-3 h-3 mr-1" /> VALIDER
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="h-7 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                  onClick={() => onValidate?.(truck)}
                  disabled={isValidating}
                >
                  <AlertTriangle className="w-3 h-3 mr-1" /> FORCER VALIDATION
                </Button>
              )
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold border-primary/20 hover:bg-primary/10">
                  <Info className="w-3 h-3 mr-1" /> DÉTAILS PREMIUM
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl bg-card border-border max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b border-border pb-4">
                  <div className="flex justify-between items-start pr-8">
                    <div>
                      <DialogTitle className="font-mono text-xl text-primary flex items-center gap-2">
                        <TruckIcon className="w-6 h-6" /> FICHE DE CHARGEMENT
                      </DialogTitle>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        Véhicule: {truck.name} | Immat: {truck.licensePlate}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-mono font-bold text-primary">{fillRate}%</div>
                      <div className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest">Taux de Remplissage</div>
                    </div>
                  </div>
                  <div className="mt-4 px-1">
                    <Progress value={fillRate} className="h-1.5 bg-slate-800" />
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto py-6 space-y-6">
                  {/* Section 2: Détails des Compartiments */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                      <Droplets className="w-3 h-3" /> État des Compartiments
                    </h4>
                    <Accordion type="multiple" className="space-y-3">
                      {truck.compartments.map((comp, idx) => {
                        const loadedOrders = allOrders.filter(o => comp.orderIds.includes(o.id));
                        const isEmpty = comp.currentLoad === 0;
                        const spaceLeft = comp.capacity - comp.currentLoad;

                        return (
                          <AccordionItem key={comp.id} value={comp.id} className="border border-border bg-background/30 rounded-sm px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                              <div className="flex flex-1 items-center justify-between pr-4 text-left">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold">
                                    #{idx + 1}
                                  </div>
                                  <div>
                                    <div className="text-sm font-mono font-bold">{comp.capacity} L</div>
                                    <div className="text-[10px] text-muted-foreground uppercase tracking-tighter">Capacité Nominale</div>
                                  </div>
                                </div>
                                <div className="hidden sm:flex flex-col items-end">
                                  <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded uppercase font-bold mb-1",
                                    comp.productId ? PRODUCT_COLORS[comp.productId] + " text-white" : "bg-slate-800 text-slate-500"
                                  )}>
                                    {comp.productId ? PRODUCT_LABELS[comp.productId] : "VIDE"}
                                  </span>
                                  <div className="text-[10px] font-mono text-muted-foreground">
                                    {comp.currentLoad} L chargés
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4 pt-2 border-t border-border/50">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-border/30">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Volume Occupé</span>
                                    <span className="font-mono text-sm font-bold text-foreground">{comp.currentLoad} L</span>
                                  </div>
                                  <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-border/30">
                                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Espace Vide (Creux)</span>
                                    <span className={cn("font-mono text-sm font-bold", spaceLeft > 0 ? "text-orange-500" : "text-green-500")}>
                                      {spaceLeft} L
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground px-1">Commandes Assignées</span>
                                  {loadedOrders.length > 0 ? (
                                    loadedOrders.map(order => (
                                      <div key={order.id} className="p-2 bg-slate-900/30 border border-border/30 rounded flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Hash className="w-3 h-3 text-primary" />
                                          <span className="text-xs font-mono">{order.orderNumber}</span>
                                        </div>
                                        <span className="text-xs font-bold text-primary">{comp.currentLoad} L</span>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-center py-4 text-[10px] text-muted-foreground italic border border-dashed border-border/50 rounded">
                                      Aucune commande
                                    </div>
                                  )}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  </div>

                  {/* Section 3: Détails Commerciaux */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                      <User className="w-3 h-3" /> Détails Commerciaux des Livraisons
                    </h4>
                    <div className="space-y-2">
                      {Array.from(new Set(truck.compartments.flatMap(c => c.orderIds))).map(orderId => {
                        const order = allOrders.find(o => o.id === orderId);
                        if (!order) return null;
                        const volumeInTruck = truck.compartments
                          .filter(c => c.orderIds.includes(orderId))
                          .reduce((acc, c) => acc + c.currentLoad, 0);

                        return (
                          <div key={orderId} className="p-4 bg-background border border-border rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="bg-primary/10 p-2 rounded">
                                <Package className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <div className="text-sm font-bold">{order.client}</div>
                                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                                  <span className="text-primary font-bold">{order.orderNumber}</span>
                                  <Separator orientation="vertical" className="h-2" />
                                  <MapPin className="w-2 h-2" /> {order.zone}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 text-right">
                              <div>
                                <div className={cn("text-[10px] font-bold uppercase", PRODUCT_TEXT_COLORS[order.product])}>
                                  {PRODUCT_LABELS[order.product]}
                                </div>
                                <div className="text-lg font-mono font-bold">{volumeInTruck} L</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {truck.assignedZone && (
              <div className="text-[10px] font-mono text-primary mt-1">
                Zone: {truck.assignedZone}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative h-24 w-full bg-slate-900/50 rounded-lg border-2 border-slate-800 flex overflow-hidden">
        <div className="absolute -left-4 top-2 bottom-2 w-4 bg-slate-800 rounded-l-md" />
        {truck.compartments.map((comp) => {
          const widthPercent = (comp.capacity / totalCapacity) * 100;
          const isFilled = comp.currentLoad > 0;
          return (
            <div
              key={comp.id}
              style={{ width: `${widthPercent}%` }}
              className={cn(
                "relative h-full border-r border-slate-800 last:border-r-0 flex flex-col justify-center items-center group transition-all duration-500"
              )}
            >
              {isFilled && comp.productId && (
                <motion.div
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className={cn("absolute bottom-0 w-full opacity-80", PRODUCT_COLORS[comp.productId])}
                />
              )}
              <div className="z-10 text-xs font-mono font-bold drop-shadow-md text-white/90">{comp.capacity / 1000}k</div>
              {isFilled && comp.productId && (
                <div className="z-10 text-[10px] font-mono text-white/70 uppercase">{PRODUCT_LABELS[comp.productId].split(' ')[0]}</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between px-8 -mt-2 opacity-50">
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700" />
          <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700" />
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700" />
      </div>
    </div>
  );
}
