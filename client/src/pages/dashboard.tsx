import { useState } from "react";
import { TruckVisualizer } from "@/components/truck-visualizer";
import { optimizeFleet } from "@/lib/optimizer";
import { MOCK_TRUCKS, MOCK_ORDERS } from "@/lib/mock-data";
import { Truck, Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart, Activity, Truck as TruckIcon, Package, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [trucks, setTrucks] = useState<Truck[]>(MOCK_TRUCKS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [stats, setStats] = useState({ fillRate: 0, volumeMoved: 0 });
  const { toast } = useToast();

  const handleOptimize = () => {
    const result = optimizeFleet(MOCK_TRUCKS, orders);
    
    // Animate the update
    setTrucks(result.trucks);
    setOrders(result.remainingOrders); // Only show what's left? Or show status update?
    // Ideally we'd keep all orders but mark them as assigned. 
    // But our simplified optimizer returns "remaining".
    // Let's reset orders for the visual if we want to run again, but here we just show the result.
    
    setStats({
      fillRate: Math.round(result.fillRate),
      volumeMoved: result.totalVolumeMoved
    });

    toast({
      title: "Optimization Complete",
      description: `Fleet utilization: ${result.fillRate.toFixed(1)}% | Volume: ${result.totalVolumeMoved}L`,
    });
  };

  const handleReset = () => {
    setTrucks(MOCK_TRUCKS);
    setOrders(MOCK_ORDERS);
    setStats({ fillRate: 0, volumeMoved: 0 });
  };

  // Mock Import
  const handleImport = () => {
    toast({
      title: "Importing Data...",
      description: "Parsing 'orders_export_jan05.xlsx'...",
    });
    setTimeout(() => {
        handleReset(); // Reset to "fresh" data from mock
        toast({
            title: "Data Loaded",
            description: "Successfully imported 20 orders and 3 trucks.",
        });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 font-sans">
      <header className="flex justify-between items-center mb-8 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-primary flex items-center gap-2">
            <Activity className="h-8 w-8" />
            OPTIFLEET <span className="text-foreground/50 text-lg font-light">Logistic Command</span>
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-1">
            Petroleum Transport Optimization System v1.0
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-primary/20 hover:bg-primary/10 text-primary" onClick={handleImport}>
            <Upload className="mr-2 h-4 w-4" /> Import Excel
          </Button>
          <Button onClick={handleOptimize} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
            <Activity className="mr-2 h-4 w-4" /> Run Optimizer
          </Button>
          <Button variant="ghost" onClick={handleReset}>Reset</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Fleet */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">Fleet Fill Rate</div>
                  <BarChart className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-2 text-3xl font-bold font-mono text-primary">
                  {stats.fillRate}%
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">Volume Moved</div>
                  <Package className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="mt-2 text-3xl font-bold font-mono text-emerald-500">
                  {stats.volumeMoved.toLocaleString()} <span className="text-sm text-muted-foreground">L</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">Active Trucks</div>
                  <TruckIcon className="h-4 w-4 text-blue-500" />
                </div>
                <div className="mt-2 text-3xl font-bold font-mono text-blue-500">
                  {trucks.filter(t => t.status !== 'IDLE').length} <span className="text-sm text-muted-foreground">/ {trucks.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fleet Visualization */}
          <Card className="border-border bg-card/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TruckIcon className="h-5 w-5" /> Fleet Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {trucks.map(truck => (
                <TruckVisualizer key={truck.id} truck={truck} />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Orders */}
        <div className="space-y-6">
          <Card className="h-full border-border bg-card/30 flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Pending Orders
                <span className="ml-auto text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground font-mono">
                  {orders.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto max-h-[calc(100vh-250px)] pr-2">
              <div className="space-y-2">
                {orders.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground italic">
                    All orders assigned!
                  </div>
                ) : (
                  orders.map(order => (
                    <motion.div 
                      layout
                      key={order.id} 
                      className="p-3 bg-card border border-border rounded-sm hover:border-primary/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-mono text-xs font-bold text-foreground">{order.id}</span>
                        <span className="text-[10px] px-1.5 rounded bg-green-900/30 text-green-400 border border-green-900/50">
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm font-medium mb-1">{order.customerName}</div>
                      <div className="flex justify-between text-xs text-muted-foreground font-mono">
                        <span>{order.product}</span>
                        <span>{order.quantity.toLocaleString()} L</span>
                      </div>
                      <Separator className="my-2 bg-border/50" />
                      <div className="text-[10px] uppercase tracking-wide text-primary/80 font-bold">
                        {order.zone}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
