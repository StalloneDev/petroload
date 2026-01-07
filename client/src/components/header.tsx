import { Menu, LogOut, LayoutDashboard, Truck, MapPin, ClipboardCheck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "wouter";
import { ModeToggle } from "@/components/mode-toggle";

interface HeaderProps {
    title?: React.ReactNode;
    subtitle?: string;
    children?: React.ReactNode;
}

export function Header({ title, subtitle, children }: HeaderProps) {
    const [location] = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.reload();
    };

    return (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-border pb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tighter text-primary flex items-center gap-3">
                    <img src="/favicon.png" alt="OptiFleet Logo" className="h-24 w-auto mr-3" />
                    <span className="text-foreground/50 text-lg font-light hidden sm:inline">| {title || "Commande Logistique"}</span>
                </h1>
                <p className="text-muted-foreground font-mono text-xs mt-1">
                    {subtitle || "Système d'Optimisation du Transport Pétrolier v1.0"}
                </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
                {/* Page Specific Actions */}
                {children}

                <ModeToggle />

                {/* Navigation Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Menu</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {(() => {
                            const userStr = localStorage.getItem("user");
                            const user = userStr ? JSON.parse(userStr) : null;
                            const isTransporteur = user?.role === "transporteur";

                            if (isTransporteur) {
                                return (
                                    <Link href="/trucks">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Truck className="mr-2 h-4 w-4" /> Camion
                                        </DropdownMenuItem>
                                    </Link>
                                );
                            }

                            return (
                                <>
                                    <Link href="/">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <LayoutDashboard className="mr-2 h-4 w-4" /> Tableau de bord
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/stations">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <MapPin className="mr-2 h-4 w-4" /> Station
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/trucks">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Truck className="mr-2 h-4 w-4" /> Camion
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/validations">
                                        <DropdownMenuItem className="cursor-pointer text-emerald-500">
                                            <ClipboardCheck className="mr-2 h-4 w-4" /> Mes Validations
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/orders-history">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Package className="mr-2 h-4 w-4 text-primary" /> Commandes
                                        </DropdownMenuItem>
                                    </Link>
                                </>
                            );
                        })()}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon" onClick={handleLogout} title="Déconnexion">
                    <LogOut className="h-4 w-4 text-destructive" />
                </Button>
            </div>
        </header>
    );
}
