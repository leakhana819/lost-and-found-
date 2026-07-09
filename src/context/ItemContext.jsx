// context/ItemContext.jsx — CampusConnect
import { createContext, useContext, useState, useCallback } from 'react';
import {
  getItems, createItem, updateItem, deleteItem,
  getNotifications, createNotification,
  createClaim, getClaims,
} from '../utils/localStorage.js';

const ItemContext = createContext(null);

export function ItemProvider({ children }) {
  const [items, setItems] = useState(getItems);
  const [notifications, setNotifications] = useState(getNotifications);

  // ─── ITEMS CRUD ───────────────────────
  const addItem = useCallback((itemData) => {
    const item = createItem(itemData);
    setItems(getItems());
    return item;
  }, []);

  const editItem = useCallback((id, updates) => {
    const item = updateItem(id, updates);
    setItems(getItems());
    return item;
  }, []);

  const removeItem = useCallback((id) => {
    deleteItem(id);
    setItems(getItems());
  }, []);

  const refreshItems = useCallback(() => {
    setItems(getItems());
  }, []);

  // ─── CLAIMS ──────────────────────────
  const sendClaimRequest = useCallback((itemId, claimantId, claimantName, message, ownerId) => {
    // Create claim record
    const claim = createClaim({ itemId, claimantId, claimantName, message, ownerId });

    // Create notification for item owner
    const notif = createNotification({
      type: 'claim',
      message: `${claimantName} sent a claim request for your item.`,
      itemId,
      fromUser: claimantId,
      fromUserName: claimantName,
      toUser: ownerId,
    });

    setNotifications(getNotifications());

    // Update item claimRequests list
    const item = items.find(i => i.id === itemId);
    if (item) {
      editItem(itemId, {
        claimRequests: [...(item.claimRequests || []), claim.id],
      });
    }

    return { claim, notif };
  }, [items, editItem]);

  // ─── RESOLVE ITEM ─────────────────────
  const resolveItem = useCallback((itemId, claimedBy) => {
    editItem(itemId, { resolved: true, claimedBy });
  }, [editItem]);

  // ─── NOTIFICATIONS ────────────────────
  const refreshNotifications = useCallback(() => {
    setNotifications(getNotifications());
  }, []);

  return (
    <ItemContext.Provider value={{
      items, addItem, editItem, removeItem, refreshItems,
      sendClaimRequest, resolveItem,
      notifications, refreshNotifications,
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
