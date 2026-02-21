import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { encrypt, decrypt, deriveKey, generateSalt } from "@/lib/crypto";
import { toast } from "sonner";

export interface SharedItem {
  id: string;
  senderId: string;
  recipientId: string;
  itemType: string;
  itemId: string;
  itemName: string;
  encryptedData: string;
  shareKeyHint?: string;
  sharedAt: string;
  expiresAt?: string;
  isAccepted: boolean;
  senderName?: string;
}

export interface RecipientInfo {
  userId: string;
  displayName: string | null;
  username: string | null;
}

export function useSharing() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [sentItems, setSentItems] = useState<SharedItem[]>([]);
  const [receivedItems, setReceivedItems] = useState<SharedItem[]>([]);
  const [newShareCount, setNewShareCount] = useState(0);
  const processedIdsRef = useRef<Set<string>>(new Set());

  // Find user by username or email
  const findRecipient = useCallback(async (identifier: string): Promise<RecipientInfo | null> => {
    try {
      const { data, error } = await supabase.rpc('find_user_by_identifier', {
        p_identifier: identifier.trim()
      });

      if (error) {
        console.error('Error finding recipient:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const result = data[0];
      return {
        userId: result.user_id,
        displayName: result.display_name,
        username: result.username
      };
    } catch (error) {
      console.error('Error finding recipient:', error);
      return null;
    }
  }, []);

  // Decrypt shared item data with share password (or decode if no password was used)
  const decryptSharedItem = useCallback(async (
    encryptedData: string,
    sharePassword?: string
  ): Promise<Record<string, unknown> | null> => {
    try {
      // Check if item was shared without password protection
      if (encryptedData.startsWith('NOPASS:')) {
        const base64Data = encryptedData.substring(7);
        return JSON.parse(atob(base64Data));
      }
      
      // Password-protected share
      if (!sharePassword) {
        return null;
      }
      
      // Generate a fixed salt for share passwords (we use the first 16 chars of encrypted data as salt identifier)
      // This is a simplified approach - the salt is embedded in the encrypted data format
      const salt = encryptedData.substring(0, 24); // First 24 base64 chars = 18 bytes, we use as pseudo-salt
      const key = await deriveKey(sharePassword, salt);
      const decrypted = await decrypt(encryptedData.substring(24), key);
      
      if (decrypted === '[Decryption failed]') {
        return null;
      }
      
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Error decrypting shared item:', error);
      return null;
    }
  }, []);

  // Share an item with another user, optionally with a share password
  const shareItem = useCallback(async (
    itemType: string,
    itemId: string,
    itemName: string,
    itemData: Record<string, unknown>,
    recipientId: string,
    sharePassword?: string,
    shareKeyHint?: string,
    expiresIn?: number // days
  ): Promise<boolean> => {
    if (!user?.id) {
      toast.error("You must be logged in to share items");
      return false;
    }

    if (sharePassword && sharePassword.length < 4) {
      toast.error("Share password must be at least 4 characters");
      return false;
    }

    setIsLoading(true);
    try {
      let encryptedData: string;
      
      if (sharePassword) {
        // Generate a salt and derive encryption key from share password
        const salt = await generateSalt();
        const shareKey = await deriveKey(sharePassword, salt);
        
        // Encrypt the item data
        const dataString = JSON.stringify(itemData);
        const encryptedContent = await encrypt(dataString, shareKey);
        
        // Prepend salt to encrypted data so recipient can derive the same key
        encryptedData = salt + encryptedContent;
      } else {
        // No password - store as base64 encoded JSON (still not plain text, but easily readable by recipient)
        encryptedData = 'NOPASS:' + btoa(JSON.stringify(itemData));
      }

      const expiresAt = expiresIn
        ? new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase.from('shared_items').insert({
        sender_id: user.id,
        recipient_id: recipientId,
        item_type: itemType,
        item_id: itemId,
        item_name: itemName,
        encrypted_data: encryptedData,
        share_key_hint: shareKeyHint || null,
        expires_at: expiresAt
      });

      if (error) {
        console.error('Error sharing item:', error);
        toast.error("Failed to share item");
        return false;
      }

      toast.success(`Successfully shared ${itemName}. Share the password with the recipient securely.`);
      await fetchSentItems();
      return true;
    } catch (error) {
      console.error('Error sharing item:', error);
      toast.error("Failed to share item");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch items sent by current user
  const fetchSentItems = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('shared_items')
        .select('*')
        .eq('sender_id', user.id)
        .order('shared_at', { ascending: false });

      if (error) {
        console.error('Error fetching sent items:', error);
        return;
      }

      const items: SharedItem[] = (data || []).map(item => ({
        id: item.id,
        senderId: item.sender_id,
        recipientId: item.recipient_id,
        itemType: item.item_type,
        itemId: item.item_id,
        itemName: item.item_name,
        encryptedData: item.encrypted_data,
        shareKeyHint: item.share_key_hint || undefined,
        sharedAt: item.shared_at,
        expiresAt: item.expires_at || undefined,
        isAccepted: item.is_accepted || false
      }));

      setSentItems(items);
    } catch (error) {
      console.error('Error fetching sent items:', error);
    }
  }, [user?.id]);

  // Fetch sender info helper
  const fetchSenderName = useCallback(async (senderId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, username')
        .eq('user_id', senderId)
        .single();

      if (error || !data) return 'Someone';
      return data.display_name || data.username || 'Someone';
    } catch {
      return 'Someone';
    }
  }, []);

  // Fetch items shared with current user
  const fetchReceivedItems = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('shared_items')
        .select('*')
        .eq('recipient_id', user.id)
        .order('shared_at', { ascending: false });

      if (error) {
        console.error('Error fetching received items:', error);
        return;
      }

      // Fetch sender names for each item
      const items: SharedItem[] = await Promise.all((data || []).map(async item => {
        const senderName = await fetchSenderName(item.sender_id);
        return {
          id: item.id,
          senderId: item.sender_id,
          recipientId: item.recipient_id,
          itemType: item.item_type,
          itemId: item.item_id,
          itemName: item.item_name,
          encryptedData: item.encrypted_data,
          shareKeyHint: item.share_key_hint || undefined,
          sharedAt: item.shared_at,
          expiresAt: item.expires_at || undefined,
          isAccepted: item.is_accepted || false,
          senderName
        };
      }));

      // Track existing IDs so we know which ones are new later
      items.forEach(item => processedIdsRef.current.add(item.id));

      setReceivedItems(items);
    } catch (error) {
      console.error('Error fetching received items:', error);
    }
  }, [user?.id, fetchSenderName]);

  // Revoke a shared item
  const revokeShare = useCallback(async (shareId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('shared_items')
        .delete()
        .eq('id', shareId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('Error revoking share:', error);
        toast.error("Failed to revoke share");
        return false;
      }

      toast.success("Share access revoked");
      await fetchSentItems();
      return true;
    } catch (error) {
      console.error('Error revoking share:', error);
      toast.error("Failed to revoke share");
      return false;
    }
  }, [user?.id, fetchSentItems]);

  // Accept a shared item
  const acceptShare = useCallback(async (shareId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('shared_items')
        .update({ is_accepted: true })
        .eq('id', shareId)
        .eq('recipient_id', user.id);

      if (error) {
        console.error('Error accepting share:', error);
        toast.error("Failed to accept share");
        return false;
      }

      toast.success("Share accepted");
      await fetchReceivedItems();
      return true;
    } catch (error) {
      console.error('Error accepting share:', error);
      toast.error("Failed to accept share");
      return false;
    }
  }, [user?.id, fetchReceivedItems]);

  // Subscribe to realtime updates for new shared items
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('shared_items_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shared_items',
          filter: `recipient_id=eq.${user.id}`
        },
        async (payload) => {
          const newItem = payload.new as {
            id: string;
            sender_id: string;
            item_name: string;
            item_type: string;
          };

          // Skip if we've already processed this item
          if (processedIdsRef.current.has(newItem.id)) {
            return;
          }

          // Mark as processed
          processedIdsRef.current.add(newItem.id);

          // Fetch sender name for notification
          const senderName = await fetchSenderName(newItem.sender_id);
          
          // Show notification toast
          toast.info(`${senderName} shared a ${newItem.item_type} with you: "${newItem.item_name}"`, {
            duration: 5000,
            action: {
              label: "View",
              onClick: () => {
                // Refresh received items to show the new share
                fetchReceivedItems();
              }
            }
          });

          // Update new share count
          setNewShareCount(prev => prev + 1);

          // Refresh received items
          fetchReceivedItems();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchSenderName, fetchReceivedItems]);

  // Clear new share count when received items are viewed
  const clearNewShareCount = useCallback(() => {
    setNewShareCount(0);
  }, []);

  return {
    isLoading,
    sentItems,
    receivedItems,
    newShareCount,
    findRecipient,
    shareItem,
    fetchSentItems,
    fetchReceivedItems,
    revokeShare,
    acceptShare,
    decryptSharedItem,
    clearNewShareCount
  };
}
