import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PartyOrder, PartySession } from '../types/party';

const STORAGE_KEY_PARTY_SESSION = 'mixocraft_party_session';
const STORAGE_KEY_PARTY_ORDERS = 'mixocraft_party_orders';

export const usePartyStore = defineStore('party', () => {
  const savedSession = uni.getStorageSync(STORAGE_KEY_PARTY_SESSION);
  const session = ref<PartySession | null>(
    savedSession ? (savedSession as PartySession) : null
  );

  const savedOrders = uni.getStorageSync(STORAGE_KEY_PARTY_ORDERS);
  const orders = ref<PartyOrder[]>(
    Array.isArray(savedOrders) ? savedOrders : []
  );

  function savePartyState() {
    try {
      uni.setStorageSync(STORAGE_KEY_PARTY_SESSION, session.value);
      uni.setStorageSync(STORAGE_KEY_PARTY_ORDERS, orders.value);
    } catch (e) {
      console.error(e);
    }
  }

  function startParty(title: string, bartenderName: string, activeRecipeIds: string[]) {
    session.value = {
      id: 'party_' + Date.now().toString(36),
      title: title || '今晚微醺吧台',
      bartenderName: bartenderName || '主理调酒师',
      welcomeMessage: '欢迎光临我的私人吧台！今晚酒单已备好，请随意点单~',
      activeRecipeIds: activeRecipeIds.length > 0 ? activeRecipeIds : ['mojito', 'gin_and_tonic'],
      createdAt: Date.now(),
      isOpen: true,
    };
    orders.value = [];
    savePartyState();
  }

  function togglePartyOpen(isOpen: boolean) {
    if (session.value) {
      session.value.isOpen = isOpen;
      savePartyState();
    }
  }

  function closeParty() {
    session.value = null;
    orders.value = [];
    savePartyState();
  }

  function placeOrder(recipeId: string, recipeName: string, customerName: string, notes?: string) {
    const newOrder: PartyOrder = {
      id: 'ord_' + Math.random().toString(36).substring(2, 8),
      recipeId,
      recipeName,
      customerName: customerName || '微醺酒客',
      specialNotes: notes || '',
      status: 'pending',
      createdAt: Date.now(),
    };
    orders.value.unshift(newOrder);
    savePartyState();
    return newOrder;
  }

  function updateOrderStatus(orderId: string, status: PartyOrder['status']) {
    const order = orders.value.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      savePartyState();
    }
  }

  return {
    session,
    orders,
    startParty,
    togglePartyOpen,
    closeParty,
    placeOrder,
    updateOrderStatus,
  };
});
