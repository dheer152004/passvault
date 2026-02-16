import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LoginSession {
  id: string;
  user_id: string;
  browser: string | null;
  device_type: string | null;
  os: string | null;
  ip_address: string | null;
  location: string | null;
  is_primary: boolean;
  logged_in_at: string;
  last_active_at: string;
  session_token: string | null;
  created_at: string;
}

interface DeviceInfo {
  browser: string;
  device_type: string;
  os: string;
}

function getDeviceInfo(): DeviceInfo {
  const ua = navigator.userAgent;
  
  // Detect browser
  let browser = "Unknown";
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  
  // Detect device type
  let device_type = "Desktop";
  if (/Mobi|Android/i.test(ua)) device_type = "Mobile";
  else if (/Tablet|iPad/i.test(ua)) device_type = "Tablet";
  
  // Detect OS
  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  
  return { browser, device_type, os };
}

async function getLocationInfo(): Promise<{ ip: string; location: string }> {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (response.ok) {
      const data = await response.json();
      return {
        ip: data.ip || "Unknown",
        location: data.city && data.country_name 
          ? `${data.city}, ${data.country_name}` 
          : data.country_name || "Unknown"
      };
    }
  } catch (error) {
    console.error("Failed to get location:", error);
  }
  return { ip: "Unknown", location: "Unknown" };
}

export function useLoginSessions() {
  const { user, isAuthenticated } = useAuth();
  const [primarySessions, setPrimarySessions] = useState<LoginSession[]>([]);
  const [secondarySessions, setSecondarySessions] = useState<LoginSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // First, run cleanup to delete old sessions and mark primaries
      await supabase.rpc('cleanup_old_sessions');
      
      // Fetch all sessions
      const { data, error } = await supabase
        .from("login_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_in_at", { ascending: false });
      
      if (error) throw error;
      
      const sessions = data as LoginSession[];
      setPrimarySessions(sessions.filter(s => s.is_primary));
      setSecondarySessions(sessions.filter(s => !s.is_primary));
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const recordSession = useCallback(async () => {
    if (!user) return;
    
    try {
      const deviceInfo = getDeviceInfo();
      const locationInfo = await getLocationInfo();
      const sessionToken = crypto.randomUUID();
      
      const { error } = await supabase
        .from("login_sessions")
        .insert({
          user_id: user.id,
          browser: deviceInfo.browser,
          device_type: deviceInfo.device_type,
          os: deviceInfo.os,
          ip_address: locationInfo.ip,
          location: locationInfo.location,
          session_token: sessionToken,
          is_primary: false,
        });
      
      if (error) throw error;
      
      // Store session token locally
      localStorage.setItem("digilock_session_token", sessionToken);
      
      // Refresh sessions
      await fetchSessions();
    } catch (error) {
      console.error("Failed to record session:", error);
    }
  }, [user, fetchSessions]);

  const terminateSession = useCallback(async (sessionId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("login_sessions")
        .delete()
        .eq("id", sessionId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      await fetchSessions();
    } catch (error) {
      console.error("Failed to terminate session:", error);
    }
  }, [user, fetchSessions]);

  const terminateAllOtherSessions = useCallback(async () => {
    if (!user) return;
    
    const currentToken = localStorage.getItem("digilock_session_token");
    
    try {
      let query = supabase
        .from("login_sessions")
        .delete()
        .eq("user_id", user.id);
      
      if (currentToken) {
        query = query.neq("session_token", currentToken);
      }
      
      const { error } = await query;
      
      if (error) throw error;
      
      await fetchSessions();
    } catch (error) {
      console.error("Failed to terminate other sessions:", error);
    }
  }, [user, fetchSessions]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchSessions();
    }
  }, [isAuthenticated, user, fetchSessions]);

  return {
    primarySessions,
    secondarySessions,
    isLoading,
    recordSession,
    terminateSession,
    terminateAllOtherSessions,
    fetchSessions,
  };
}
