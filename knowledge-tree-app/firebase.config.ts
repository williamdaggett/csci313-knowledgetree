// Mock Firebase implementation for development without Firebase credentials

// Mock data stores
const mockTreeStore: { [id: string]: any } = {};
const mockDiagramStore: { [id: string]: any } = {};
const mockUserStore: { [uid: string]: any } = {};
const mockContentStore: { [id: string]: any } = {};

let nextId = 1000;

function generateId(): string {
  return `${Date.now()}-${++nextId}`;
}

// Mock Authentication
export const auth = {
  currentUser: null as any,
};

// Mock Database reference
export const db = {};

// Mock collection and doc references
export function collection(db: any, ...path: string[]): any {
  return { type: 'collection', path: path.join('/') };
}

export function doc(db: any, ...path: string[]): any {
  return { type: 'doc', path: path.join('/') };
}

// Mock query
export function query(ref: any, ...constraints: any[]): any {
  return { ...ref, constraints };
}

// Mock where clause
export function where(field: string, operator: string, value: any): any {
  return { field, operator, value };
}

// Mock addDoc - adds a document and returns the ID
export async function addDoc(ref: any, data: any): Promise<any> {
  const id = generateId();
  const pathSegments = ref.path.split('/');
  const collectionName = pathSegments[0];

  if (collectionName === 'trees') {
    mockTreeStore[id] = { id, ...data };
  } else if (collectionName === 'diagrams') {
    mockDiagramStore[id] = { id, ...data };
  } else if (collectionName === 'nodeContent') {
    mockContentStore[id] = { id, ...data };
  } else if (collectionName === 'users') {
    mockUserStore[id] = { uid: id, ...data };
  }

  return {
    id,
    ref,
  };
}

// Mock getDoc - gets a single document
export async function getDoc(ref: any): Promise<any> {
  const pathSegments = ref.path.split('/');
  const id = pathSegments[pathSegments.length - 1];
  const collectionName = pathSegments[0];

  let data = null;
  if (collectionName === 'trees') {
    data = mockTreeStore[id];
  } else if (collectionName === 'diagrams') {
    data = mockDiagramStore[id];
  } else if (collectionName === 'nodeContent') {
    data = mockContentStore[id];
  } else if (collectionName === 'users') {
    data = mockUserStore[id];
  }

  return {
    exists: () => !!data,
    data: () => data,
    id,
  };
}

// Mock getDocs - gets multiple documents from a collection
export async function getDocs(ref: any): Promise<any> {
  const collectionName = ref.path.split('/')[0];
  let store = null;

  if (collectionName === 'trees') {
    store = mockTreeStore;
  } else if (collectionName === 'diagrams') {
    store = mockDiagramStore;
  } else if (collectionName === 'nodeContent') {
    store = mockContentStore;
  } else if (collectionName === 'users') {
    store = mockUserStore;
  }

  const docs = Object.values(store || {}).map((data: any) => ({
    id: data.id,
    data: () => data,
  }));

  return {
    docs,
    empty: docs.length === 0,
  };
}

// Mock updateDoc - updates a document
export async function updateDoc(ref: any, data: any): Promise<void> {
  const pathSegments = ref.path.split('/');
  const id = pathSegments[pathSegments.length - 1];
  const collectionName = pathSegments[0];

  let store = null;
  if (collectionName === 'trees') {
    store = mockTreeStore;
  } else if (collectionName === 'diagrams') {
    store = mockDiagramStore;
  } else if (collectionName === 'nodeContent') {
    store = mockContentStore;
  } else if (collectionName === 'users') {
    store = mockUserStore;
  }

  if (store && store[id]) {
    Object.assign(store[id], data);
  }
}

// Mock setDoc - sets a document (overwrites)
export async function setDoc(ref: any, data: any): Promise<void> {
  const pathSegments = ref.path.split('/');
  const id = pathSegments[pathSegments.length - 1];
  const collectionName = pathSegments[0];

  let store = null;
  if (collectionName === 'trees') {
    store = mockTreeStore;
  } else if (collectionName === 'diagrams') {
    store = mockDiagramStore;
  } else if (collectionName === 'nodeContent') {
    store = mockContentStore;
  } else if (collectionName === 'users') {
    store = mockUserStore;
  }

  if (store) {
    store[id] = { id, ...data };
  }
}

// Mock deleteDoc - deletes a document
export async function deleteDoc(ref: any): Promise<void> {
  const pathSegments = ref.path.split('/');
  const id = pathSegments[pathSegments.length - 1];
  const collectionName = pathSegments[0];

  let store = null;
  if (collectionName === 'trees') {
    store = mockTreeStore;
  } else if (collectionName === 'diagrams') {
    store = mockDiagramStore;
  } else if (collectionName === 'nodeContent') {
    store = mockContentStore;
  } else if (collectionName === 'users') {
    store = mockUserStore;
  }

  if (store && store[id]) {
    delete store[id];
  }
}

// Mock onSnapshot - listens for real-time updates
export function onSnapshot(ref: any, callback: (snapshot: any) => void): () => void {
  // Call immediately with current data
  if (ref.type === 'collection') {
    const collectionName = ref.path.split('/')[0];
    let store = null;

    if (collectionName === 'trees') {
      store = mockTreeStore;
    } else if (collectionName === 'diagrams') {
      store = mockDiagramStore;
    } else if (collectionName === 'nodeContent') {
      store = mockContentStore;
    } else if (collectionName === 'users') {
      store = mockUserStore;
    }

    const docs = Object.values(store || {}).map((data: any) => ({
      id: data.id,
      data: () => data,
    }));

    callback({
      docs,
      empty: docs.length === 0,
    });
  } else if (ref.type === 'doc') {
    const pathSegments = ref.path.split('/');
    const id = pathSegments[pathSegments.length - 1];
    const collectionName = pathSegments[0];

    let store = null;
    if (collectionName === 'trees') {
      store = mockTreeStore;
    } else if (collectionName === 'diagrams') {
      store = mockDiagramStore;
    } else if (collectionName === 'nodeContent') {
      store = mockContentStore;
    } else if (collectionName === 'users') {
      store = mockUserStore;
    }

    const data = store ? store[id] : null;
    callback({
      exists: () => !!data,
      data: () => data,
      id,
    });
  }

  // Return unsubscribe function (no-op for mock)
  return () => {};
}

