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
import { PRODUCT_LABELS } from "@/lib/mock-data";
import { Info, Package } from "lucide-react";

interface TruckVisualizerProps {
  truck: Truck;
  allOrders: Order[];
}

const PRODUCT_COLORS: Record<ProductType, string> = {
  DIESEL: "bg-slate-700",
  SP95: "bg-emerald-600",
  SP98: "bg-cyan-600",
  HEATING_OIL: "bg-orange-600",
};

export function TruckVisualizer({ truck, allOrders }: TruckVisualizerProps) {
  const totalCapacity = truck.compartments.reduce((acc, c) => acc + c.capacity, 0);

  return (
    <div className="flex flex-col gap-2 p-4 border border-border bg-card/50 rounded-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-mono font-bold text-foreground">{truck.name}</h3>
          <p className="text-xs text-muted-foreground font-mono">{truck.licensePlate}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold border-primary/20 hover:bg-primary/10">
                  <Info className="w-3 h-3 mr-1" /> DÉTAILS
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="font-mono text-primary flex items-center gap-2">
                    <Package className="w-5 h-5" /> CHARGEMENT : {truck.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  {truck.compartments.map((comp, idx) => {
                    const loadedOrders = allOrders.filter(o => comp.orderIds.includes(o.id));
                    return (
                      <div key={comp.id} className="p-3 border border-border rounded-sm bg-background/50">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono font-bold">Compartiment #{idx + 1} ({comp.capacity} L)</span>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded uppercase font-bold",
                            comp.productId ? PRODUCT_COLORS[comp.productId] + " text-white" : "bg-slate-800 text-slate-500"
                          )}>
                            {comp.productId ? PRODUCT_LABELS[comp.productId] : "VIDE"}
                          </span>
                        </div>
                        {loadedOrders.length > 0 ? (
                          <div className="space-y-2">
                            {loadedOrders.map(order => (
                              <div key={order.id} className="flex justify-between items-center text-xs p-2 bg-card border border-border/50 rounded-sm">
                                <span className="font-mono">{order.id}</span>
                                <span className="font-medium">{order.customerName}</span>
                                <span className="font-mono text-primary">{comp.capacity} L</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-[10px] text-muted-foreground italic">Aucune commande chargée</div>
                        )}
                      </div>
                    );
                  })}
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
