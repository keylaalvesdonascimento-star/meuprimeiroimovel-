import { 
    collection, 
    getDocs, 
    addDoc, 
    deleteDoc, 
    doc, 
    query, 
    orderBy,
    updateDoc
  } from 'firebase/firestore';
  import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
  } from 'firebase/storage';
  import { db, storage } from '../firebase-config';
  import { Property } from '../types';
  
  const PROPERTIES_COLLECTION = 'properties';
  
  // Buscar todos os imóveis do banco de dados
  export const getProperties = async (): Promise<Property[]> => {
    try {
      const q = query(collection(db, PROPERTIES_COLLECTION), orderBy('price', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any)
      } as Property));
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      return [];
    }
  };
  
  // Fazer upload de uma imagem para o Firebase Storage com Timeout Curto
  export const uploadPropertyImage = async (file: File): Promise<string> => {
    if (!file) throw new Error("Nenhum arquivo selecionado");
    
    if (file.size > 5 * 1024 * 1024) {
        throw new Error(`Arquivo muito grande (Máx 5MB).`);
    }

    try {
        const uniqueSuffix = Math.random().toString(36).substring(2, 9);
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}_${uniqueSuffix}_${sanitizedName}`;
        
        const storageRef = ref(storage, `properties/${fileName}`);
        
        // Timeout agressivo de 10 segundos
        const uploadTask = uploadBytes(storageRef, file);
        
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("O upload demorou muito. O Firebase Storage pode estar bloqueado. Tente usar 'Colar Link' ao invés de upload.")), 10000);
        });

        const snapshot = await Promise.race([uploadTask, timeoutPromise]);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
    } catch (error: any) {
        console.error("Erro no upload da imagem:", error);
        if (error.code === 'storage/unauthorized') {
            throw new Error("Sem permissão no Storage. Use 'Colar Link' ou verifique as regras do Firebase.");
        }
        throw error;
    }
  };
  
  export const addProperty = async (property: Omit<Property, 'id'>): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, PROPERTIES_COLLECTION), property);
      return docRef.id;
    } catch (error) {
      console.error("Erro ao adicionar imóvel:", error);
      throw error;
    }
  };

  export const updateProperty = async (id: string, property: Partial<Property>): Promise<void> => {
    try {
      const docRef = doc(db, PROPERTIES_COLLECTION, id);
      await updateDoc(docRef, property);
    } catch (error) {
      console.error("Erro ao atualizar imóvel:", error);
      throw error;
    }
  };
  
  export const deleteProperty = async (id: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, PROPERTIES_COLLECTION, id));
    } catch (error) {
      console.error("Erro ao deletar imóvel:", error);
      throw error;
    }
  };