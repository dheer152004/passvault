import { useState } from "react";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Clock, 
  MapPin, 
  Shield,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useLoginSessions, LoginSession } from "@/hooks/useLoginSessions";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

function getDeviceIcon(deviceType: string | null) {
  switch (deviceType?.toLowerCase()) {
    case "mobile":
      return <Smartphone className="w-4 h-4" strokeWidth={1.5} />;
    case "tablet":
      return <Tablet className="w-4 h-4" strokeWidth={1.5} />;
    default:
      return <Monitor className="w-4 h-4" strokeWidth={1.5} />;
  }
}

function SessionRow({ 
  session, 
  isCurrentSession,
  onTerminate 
}: { 
  session: LoginSession;
  isCurrentSession: boolean;
  onTerminate: (id: string) => void;
}) {
  const timeAgo = formatDistanceToNow(new Date(session.logged_in_at), { addSuffix: true });
  
  return (
    <TableRow className={isCurrentSession ? "bg-primary/5" : ""}>
      <TableCell>
        <div className="flex items-center gap-2">
          {getDeviceIcon(session.device_type)}
          <div>
            <div className="font-medium text-sm">
              {session.browser || "Unknown"} on {session.os || "Unknown"}
            </div>
            <div className="text-xs text-muted-foreground">
              {session.device_type || "Unknown Device"}
            </div>
          </div>
          {isCurrentSession && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Current
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-3 h-3" />
          {session.location || "Unknown"}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock className="w-3 h-3" />
          {timeAgo}
        </div>
      </TableCell>
      <TableCell>
        {!isCurrentSession && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Terminate Session?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will log out the device associated with this session. They will need to sign in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onTerminate(session.id)}>
                  Terminate
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </TableCell>
    </TableRow>
  );
}

export function LoginSessionsSection() {
  const { 
    primarySessions, 
    secondarySessions, 
    isLoading, 
    terminateSession,
    terminateAllOtherSessions 
  } = useLoginSessions();
  
  const [showSecondary, setShowSecondary] = useState(false);
  const currentToken = localStorage.getItem("digilock_session_token");
  
  const handleTerminate = async (sessionId: string) => {
    await terminateSession(sessionId);
    toast.success("Session terminated successfully");
  };
  
  const handleTerminateAll = async () => {
    await terminateAllOtherSessions();
    toast.success("All other sessions terminated");
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const allSessions = [...primarySessions, ...secondarySessions];
  
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="text-lg font-medium text-foreground">Active Sessions</h3>
        </div>
        {allSessions.length > 1 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Sign Out All Other Devices
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign Out All Other Devices?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will terminate all sessions except your current one. Other devices will need to sign in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleTerminateAll}>
                  Sign Out All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        Monitor and manage devices that are logged into your account. Sessions older than 7 days are automatically removed.
      </p>
      
      {/* Primary Sessions (Last 10) */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-primary" strokeWidth={1.5} />
          <span className="text-sm font-medium text-foreground">Recent Sessions</span>
          <Badge variant="outline" className="ml-1">{primarySessions.length}</Badge>
        </div>
        
        {primarySessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No active sessions found
          </p>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {primarySessions.map((session) => (
                  <SessionRow
                    key={session.id}
                    session={session}
                    isCurrentSession={session.session_token === currentToken}
                    onTerminate={handleTerminate}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      
      {/* Secondary Sessions (History) */}
      {secondarySessions.length > 0 && (
        <div>
          <button
            onClick={() => setShowSecondary(!showSecondary)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            {showSecondary ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>Session History</span>
            <Badge variant="secondary" className="ml-1">{secondarySessions.length}</Badge>
          </button>
          
          {showSecondary && (
            <div className="mt-3 border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {secondarySessions.map((session) => (
                    <SessionRow
                      key={session.id}
                      session={session}
                      isCurrentSession={session.session_token === currentToken}
                      onTerminate={handleTerminate}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

