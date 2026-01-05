import { Truck, Compartment, ProductType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface TruckVisualizerProps {
  truck: Truck;
}

const PRODUCT_COLORS: Record<ProductType, string> = {
  DIESEL: "bg-slate-700",
  SP95: "bg-emerald-600",
  SP98: "bg-cyan-600",
  HEATING_OIL: "bg-orange-600",
};

const PRODUCT_LABELS: Record<ProductType, string> = {
  DIESEL: "Diesel",
  SP95: "SP95",
  SP98: "SP98",
  HEATING_OIL: "Fioul",
};

export function TruckVisualizer({ truck }: TruckVisualizerProps) {
  const totalCapacity = truck.compartments.reduce((acc, c) => acc + c.capacity, 0);

  return (
    <div className="flex flex-col gap-2 p-4 border border-border bg-card/50 rounded-sm">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-mono font-bold text-foreground">{truck.name}</h3>
          <p className="text-xs text-muted-foreground font-mono">{truck.licensePlate}</p>
        </div>
        <div className="text-right">
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-bold",
            truck.status === 'IDLE' ? "bg-slate-800 text-slate-400" : "bg-primary/20 text-primary"
          )}>
            {truck.status}
          </span>
          {truck.assignedZone && (
            <div className="text-xs font-mono text-primary mt-1">
              Destination: {truck.assignedZone}
            </div>
          )}
        </div>
      </div>

      {/* Tanker Chassis */}
      <div className="relative h-24 w-full bg-slate-900/50 rounded-lg border-2 border-slate-800 flex overflow-hidden">
        {/* Cab (Abstract) */}
        <div className="absolute -left-4 top-2 bottom-2 w-4 bg-slate-800 rounded-l-md" />

        {truck.compartments.map((comp, idx) => {
          const widthPercent = (comp.capacity / totalCapacity) * 100;
          const isFilled = comp.currentLoad > 0;
          
          return (
            <div
              key={comp.id}
              style={{ width: `${widthPercent}%` }}
              className={cn(
                "relative h-full border-r border-slate-800 last:border-r-0 flex flex-col justify-center items-center group transition-all duration-500",
                !isFilled && "bg-transparent"
              )}
            >
              {/* Liquid Fill */}
              {isFilled && comp.productId && (
                <motion.div
                  initial={{ height: "0%" }}
                  animate={{ height: "100%" }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className={cn(
                    "absolute bottom-0 w-full opacity-80",
                    PRODUCT_COLORS[comp.productId]
                  )}
                />
              )}

              {/* Info Overlay */}
              <div className="z-10 text-xs font-mono font-bold drop-shadow-md text-white/90">
                {comp.capacity / 1000}k
              </div>
              {isFilled && comp.productId && (
                <div className="z-10 text-[10px] font-mono text-white/70 uppercase">
                  {PRODUCT_LABELS[comp.productId]}
                </div>
              )}
              
              {/* Tooltip-ish Details on Hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-1 text-center">
                <span className="text-[10px] text-white font-mono">
                   {isFilled ? 'FULL' : 'EMPTY'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Wheels (Visual Decoration) */}
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
