// Utilitário para gerenciar o armazenamento offline usando IndexedDB
const DB_NAME = 'AppFinancasOffline';
const DB_VERSION = 1;
const STORE_NAME = 'pending_transactions';

export async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineTransaction(transaction) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction_db = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction_db.objectStore(STORE_NAME);
    
    // Adiciona um timestamp para saber quando foi criada offline
    const offlineData = {
      ...transaction,
      offline_created_at: new Date().toISOString(),
      synced: false
    };

    const request = store.add(offlineData);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflineTransactions() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction_db = db.transaction([STORE_NAME], 'readonly');
    const store = transaction_db.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function clearSyncedTransactions(ids) {
  const db = await openDB();
  const transaction_db = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction_db.objectStore(STORE_NAME);

  ids.forEach(id => {
    store.delete(id);
  });

  return new Promise((resolve, reject) => {
    transaction_db.oncomplete = () => resolve();
    transaction_db.onerror = () => reject(transaction_db.error);
  });
}

export async function syncOfflineData(onSyncSuccess) {
  if (!navigator.onLine) return;

  const offlineTx = await getOfflineTransactions();
  if (offlineTx.length === 0) return;

  console.log(`Sincronizando ${offlineTx.length} transações offline...`);
  const syncedIds = [];

  for (const tx of offlineTx) {
    try {
      // Remove campos internos do IndexedDB antes de enviar
      const { id, offline_created_at, synced, ...cleanTx } = tx;
      
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanTx)
      });

      if (res.ok) {
        syncedIds.push(tx.id);
      }
    } catch (error) {
      console.error('Erro ao sincronizar transação individual:', error);
    }
  }

  if (syncedIds.length > 0) {
    await clearSyncedTransactions(syncedIds);
    if (onSyncSuccess) onSyncSuccess();
    return syncedIds.length;
  }
  
  return 0;
}
