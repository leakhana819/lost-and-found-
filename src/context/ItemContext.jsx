// context/ItemContext.jsx — CampusConnect (Supabase)
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase.js';

const ItemContext = createContext(null);

export function ItemProvider({ children }) {
  const [items, setItems] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── FETCH ALL ITEMS ──────────────────────────────────────
  const fetchItems = useCallback(async () => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { console.error('fetchItems error:', error); return; }
    // Normalize snake_case → camelCase for compatibility with existing UI
    setItems((data || []).map(normalizeItem));
  }, []);

  // ─── FETCH NOTIFICATIONS ──────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { console.error('fetchNotifications error:', error); return; }
    setNotifications((data || []).map(normalizeNotification));
  }, []);

  // Initial load
  useEffect(() => {
    Promise.all([fetchItems(), fetchNotifications()]).finally(() => setLoading(false));
  }, [fetchItems, fetchNotifications]);

  // ─── ADD ITEM ─────────────────────────────────────────────
  const addItem = useCallback(async (itemData) => {
    const { data, error } = await supabase
      .from('items')
      .insert({
        title: itemData.title,
        type: itemData.type,
        category: itemData.category,
        description: itemData.description,
        location: itemData.location,
        date: itemData.date,
        contact_info: itemData.contactInfo,
        images: itemData.images || [],
        reported_by: itemData.reportedBy,
        reported_by_name: itemData.reportedByName,
      })
      .select()
      .single();

    if (error) { console.error('addItem error:', error); throw error; }

    const newItem = normalizeItem(data);

    // ─── MATCHING LOGIC ───
    // Query Supabase directly instead of using stale `items` state
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
    const { data: matchData } = await supabase
      .from('items')
      .select('*')
      .eq('type', oppositeType)
      .eq('category', newItem.category)
      .eq('resolved', false)
      .neq('reported_by', newItem.reportedBy);

    const matches = (matchData || []).map(normalizeItem);

    if (matches.length > 0) {
      // Notify the new poster that matches exist
      await supabase.from('notifications').insert({
        type: 'match',
        message: `🎉 Good news! There ${matches.length === 1 ? 'is' : 'are'} ${matches.length} potential match${matches.length === 1 ? '' : 'es'} for your ${newItem.type} item "${newItem.title}". Check the browse page!`,
        item_id: newItem.id,
        from_user: null,
        from_user_name: 'CampusConnect System',
        to_user: newItem.reportedBy,
      });

      // Notify each existing item owner that a new match arrived
      for (const match of matches) {
        await supabase.from('notifications').insert({
          type: 'match',
          message: `💡 A new ${newItem.type} item "${newItem.title}" was just posted that might match your ${match.type} item "${match.title}". Check it out!`,
          item_id: newItem.id,
          from_user: null,
          from_user_name: 'CampusConnect System',
          to_user: match.reportedBy,
        });
      }
    }

    await fetchItems();
    await fetchNotifications();
    return newItem;
  }, [fetchItems, fetchNotifications]);

  // ─── EDIT ITEM ────────────────────────────────────────────
  const editItem = useCallback(async (id, updates) => {
    // Convert camelCase fields to snake_case for Supabase
    const dbUpdates = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.resolved !== undefined) dbUpdates.resolved = updates.resolved;
    if (updates.claimedBy !== undefined) dbUpdates.claimed_by = updates.claimedBy;
    if (updates.claimRequests !== undefined) dbUpdates.claim_requests = updates.claimRequests;
    if (updates.comments !== undefined) dbUpdates.comments = updates.comments;
    if (updates.contactInfo !== undefined) dbUpdates.contact_info = updates.contactInfo;
    dbUpdates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) { console.error('editItem error:', error); throw error; }
    await fetchItems();
  }, [fetchItems]);

  // ─── REMOVE ITEM ──────────────────────────────────────────
  const removeItem = useCallback(async (id) => {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) { console.error('removeItem error:', error); throw error; }
    await fetchItems();
  }, [fetchItems]);

  const refreshItems = useCallback(() => fetchItems(), [fetchItems]);

  // ─── SEND CLAIM REQUEST ───────────────────────────────────
  const sendClaimRequest = useCallback(async (itemId, claimantId, claimantName, message, ownerId) => {
    // Insert claim
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .insert({ item_id: itemId, claimant_id: claimantId, claimant_name: claimantName, message, owner_id: ownerId })
      .select()
      .single();

    if (claimError) { console.error('sendClaimRequest error:', claimError); throw claimError; }

    // Add notification for owner
    await supabase.from('notifications').insert({
      type: 'claim',
      message: `${claimantName} sent a claim request for your item.`,
      item_id: itemId,
      from_user: claimantId,
      from_user_name: claimantName,
      to_user: ownerId,
    });

    // Update item's claim_requests array
    const item = items.find(i => i.id === itemId);
    if (item) {
      const existing = item.claimRequests || [];
      await supabase
        .from('items')
        .update({ claim_requests: [...existing, claimantId], updated_at: new Date().toISOString() })
        .eq('id', itemId);
    }

    await fetchItems();
    await fetchNotifications();
    return claim;
  }, [items, fetchItems, fetchNotifications]);

  // ─── RESOLVE ITEM ─────────────────────────────────────────
  const resolveItem = useCallback(async (itemId, claimedBy) => {
    await editItem(itemId, { resolved: true, claimedBy: claimedBy || null });
  }, [editItem]);

  // ─── REFRESH NOTIFICATIONS ────────────────────────────────
  const refreshNotifications = useCallback(() => fetchNotifications(), [fetchNotifications]);

  // ─── NOTIFICATION ACTIONS ────────────────────────────────
  const markNotificationRead = useCallback(async (id) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    await fetchNotifications();
  }, [fetchNotifications]);

  const markAllNotificationsRead = useCallback(async (userId) => {
    await supabase.from('notifications').update({ read: true }).eq('to_user', userId).eq('read', false);
    await fetchNotifications();
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id) => {
    await supabase.from('notifications').delete().eq('id', id);
    await fetchNotifications();
  }, [fetchNotifications]);

  // ─── GET ITEM BY ID ───────────────────────────────────────
  const getItemById = useCallback(async (id) => {
    const { data, error } = await supabase.from('items').select('*').eq('id', id).single();
    if (error || !data) return null;
    return normalizeItem(data);
  }, []);

  return (
    <ItemContext.Provider value={{
      items, loading, addItem, editItem, removeItem, refreshItems,
      sendClaimRequest, resolveItem,
      notifications, refreshNotifications,
      markNotificationRead, markAllNotificationsRead, deleteNotification,
      getItemById,
    }}>
      {children}
    </ItemContext.Provider>
  );
}

export const useItems = () => {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error('useItems must be used within ItemProvider');
  return ctx;
};

// ─── NORMALIZERS (snake_case → camelCase) ─────────────────────
function normalizeItem(row) {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    category: row.category,
    description: row.description,
    location: row.location,
    date: row.date,
    contactInfo: row.contact_info,
    images: row.images || [],
    reportedBy: row.reported_by,
    reportedByName: row.reported_by_name,
    resolved: row.resolved,
    claimedBy: row.claimed_by,
    claimRequests: row.claim_requests || [],
    comments: row.comments || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeNotification(row) {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    itemId: row.item_id,
    fromUser: row.from_user,
    fromUserName: row.from_user_name,
    toUser: row.to_user,
    read: row.read,
    createdAt: row.created_at,
  };
}
