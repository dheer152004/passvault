import { 
  Key, 
  FileText, 
  CreditCard, 
  MapPin, 
  Heart,
  Shield,
  PanelLeftClose,
  PanelLeft,
  Users,
  Smartphone,
  IdCard,
  Terminal,
  Bitcoin,
  Landmark,
  Package,
  Wrench
} from "lucide-react";
import { VaultsSection, Vault } from "./VaultsSection";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SectionType = "passwords" | "notes" | "cards" | "addresses" | "totp" | "idcards" | "favorites" | "sharing" | "sshkeys" | "crypto" | "bankinfo" | "software" | "tools";

interface DashboardSidebarProps {
  activeSection: SectionType;
  onSectionChange: (section: SectionType) => void;
  counts: {
    passwords: number;
    notes: number;
    cards: number;
    addresses: number;
    totp: number;
    idcards: number;
    favorites: number;
    sharing: number;
    sshkeys: number;
    crypto: number;
    bankinfo: number;
    software: number;
  };
  vaults: Vault[];
  activeVaultId: string | undefined;
  onVaultSelect: (id: string | undefined) => void;
  onAddVault: (data: { name: string; icon: string; color: string }) => Promise<any>;
  onUpdateVault: (id: string, data: { name?: string; icon?: string; color?: string }) => Promise<void>;
  onDeleteVault: (id: string) => Promise<void>;
  isMobile?: boolean;
}

const quickAccessItems = [
  { id: "passwords" as SectionType, label: "Passwords", icon: Key },
  { id: "notes" as SectionType, label: "Secure Notes", icon: FileText },
  { id: "cards" as SectionType, label: "Payment Cards", icon: CreditCard },
  { id: "idcards" as SectionType, label: "ID Cards", icon: IdCard },
  { id: "addresses" as SectionType, label: "Addresses", icon: MapPin },
  { id: "totp" as SectionType, label: "Authenticator", icon: Smartphone },
  { id: "sshkeys" as SectionType, label: "SSH Keys", icon: Terminal },
  { id: "crypto" as SectionType, label: "Crypto Wallets", icon: Bitcoin },
  { id: "bankinfo" as SectionType, label: "Bank Accounts", icon: Landmark },
  { id: "software" as SectionType, label: "Software Licenses", icon: Package },
  { id: "favorites" as SectionType, label: "Favorites", icon: Heart },
  { id: "sharing" as SectionType, label: "Family Sharing", icon: Users },
];

const toolsItems = [
  { id: "tools" as SectionType, label: "Password Tools", icon: Wrench },
];

export function DashboardSidebar({ 
  activeSection, 
  onSectionChange, 
  counts,
  vaults,
  activeVaultId,
  onVaultSelect,
  onAddVault,
  onUpdateVault,
  onDeleteVault,
  isMobile = false,
}: DashboardSidebarProps) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = !isMobile && state === "collapsed";

  const renderMenuItem = (item: typeof quickAccessItems[0]) => {
    const Icon = item.icon;
    const count = counts[item.id as keyof typeof counts] || 0;
    const isActive = activeSection === item.id;
    
    return (
      <SidebarMenuItem key={item.id}>
        <SidebarMenuButton
          onClick={() => onSectionChange(item.id)}
          tooltip={item.label}
          className={cn(
            "w-full justify-start gap-3 px-4 py-2.5 transition-colors",
            isActive 
              ? "bg-sidebar-accent text-sidebar-primary font-medium" 
              : "text-sidebar-foreground hover:bg-sidebar-accent/50"
          )}
        >
          <Icon 
            className={cn(
              "w-4 h-4 flex-shrink-0",
              isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"
            )} 
            strokeWidth={1.5} 
          />
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.label}</span>
              {count > 0 && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  isActive 
                    ? "bg-sidebar-primary/20 text-sidebar-primary" 
                    : "bg-sidebar-accent text-sidebar-foreground/60"
                )}>
                  {count}
                </span>
              )}
            </>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  // For mobile, render without the Sidebar wrapper (it's inside a Sheet)
  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-sidebar">
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-sidebar-foreground">DigiLock</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-2">
          <div className="mb-4">
            <VaultsSection
              vaults={vaults}
              activeVaultId={activeVaultId}
              onVaultSelect={onVaultSelect}
              onAddVault={onAddVault}
              onUpdateVault={onUpdateVault}
              onDeleteVault={onDeleteVault}
            />
          </div>

          <div className="mb-4">
            <div className="text-xs text-sidebar-foreground/60 uppercase tracking-wider px-4 mb-2">
              Quick Access
            </div>
            <div className="space-y-1">
              {quickAccessItems.map((item) => {
                const Icon = item.icon;
                const count = counts[item.id as keyof typeof counts] || 0;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-primary font-medium" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "w-4 h-4 flex-shrink-0",
                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"
                      )} 
                      strokeWidth={1.5} 
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {count > 0 && (
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        isActive 
                          ? "bg-sidebar-primary/20 text-sidebar-primary" 
                          : "bg-sidebar-accent text-sidebar-foreground/60"
                      )}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-sidebar-foreground/60 uppercase tracking-wider px-4 mb-2">
              Tools
            </div>
            <div className="space-y-1">
              {toolsItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-primary font-medium" 
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "w-4 h-4 flex-shrink-0",
                        isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"
                      )} 
                      strokeWidth={1.5} 
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border hidden md:flex">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-primary-foreground" strokeWidth={1.5} />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-sidebar-foreground">DigiLock</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <VaultsSection
            vaults={vaults}
            activeVaultId={activeVaultId}
            onVaultSelect={onVaultSelect}
            onAddVault={onAddVault}
            onUpdateVault={onUpdateVault}
            onDeleteVault={onDeleteVault}
          />
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs text-sidebar-foreground/60 uppercase tracking-wider px-4">
              Quick Access
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {quickAccessItems.map(renderMenuItem)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs text-sidebar-foreground/60 uppercase tracking-wider px-4">
              Tools
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => onSectionChange(item.id)}
                      tooltip={item.label}
                      className={cn(
                        "w-full justify-start gap-3 px-4 py-2.5 transition-colors",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-primary font-medium" 
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      )}
                    >
                      <Icon 
                        className={cn(
                          "w-4 h-4 flex-shrink-0",
                          isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70"
                        )} 
                        strokeWidth={1.5} 
                      />
                      {!isCollapsed && <span className="flex-1">{item.label}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full justify-center text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {isCollapsed ? (
            <PanelLeft className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4 mr-2" strokeWidth={1.5} />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
