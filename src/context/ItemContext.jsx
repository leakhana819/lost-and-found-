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
    const allItems = getItems();
    setItems(allItems);

    // ─── MATCHING LOGIC ───
    const oppositeType = item.type === 'lost' ? 'found' : 'lost';
    
    // Find active items of opposite type in the same category
    const matches = allItems.filter(i => 
      i.id !== item.id && 
      i.type === oppositeType && 
      i.category === item.category &&
      !i.resolved
    );

    // Simple keyword match in title (words > 3 chars)
    const getKeywords = (str) => (str || '').toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const itemKeywords = getKeywords(item.title);

    matches.forEach(match => {
      const matchKeywords = getKeywords(match.title);
      const hasOverlap = itemKeywords.some(kw => matchKeywords.includes(kw));
      
      if (hasOverlap) {
        // We found a match!
        
        // Message for the person who LOST the item
        const lostMsg = "Congratulations! We found a potential match for your lost item. Please check here.";
        // Message for the person who FOUND the item
        const foundMsg = "We found a potential match for the item you reported found. Please check here.";

        // 1. Notify the owner of the existing item
        createNotification({
          type: 'system',
          message: match.type === 'lost' ? lostMsg : foundMsg,
          itemId: item.id,
          fromUser: null,
          fromUserName: 'CampusConnect System',
          toUser: match.reportedBy,
        });

        // 2. Notify the creator of the new item
        createNotification({
          type: 'system',
          message: item.type === 'lost' ? lostMsg : foundMsg,
          itemId: match.id,
          fromUser: null,
          fromUserName: 'CampusConnect System',
          toUser: item.reportedBy,
        });
      }
    });

    // Refresh notifications state if any were added
    if (matches.length > 0) {
      setNotifications(getNotifications());
    }

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
