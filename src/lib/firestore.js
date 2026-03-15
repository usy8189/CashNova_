import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

// Helper to standardise responses
const handleResponse = (data) => ({ success: true, data });
const handleError = (error) => {
    console.error("Firestore Error:", error);
    return { success: false, error: error.message };
};

// Generic Collection Operations
export const firestoreService = {
    // Basic CRUD
    async create(collectionName, data, customId = null) {
        try {
            if (customId) {
                const docRef = doc(db, collectionName, customId);
                await setDoc(docRef, { ...data, createdAt: new Date().toISOString() });
                return handleResponse({ id: customId, ...data });
            } else {
                const colRef = collection(db, collectionName);
                const docRef = await addDoc(colRef, { ...data, createdAt: new Date().toISOString() });
                return handleResponse({ id: docRef.id, ...data });
            }
        } catch (error) {
            return handleError(error);
        }
    },

    async getById(collectionName, id) {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return handleResponse({ id: docSnap.id, ...docSnap.data() });
            }
            return handleError(new Error("Document not found"));
        } catch (error) {
            return handleError(error);
        }
    },

    async update(collectionName, id, data) {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
            return handleResponse({ id, ...data });
        } catch (error) {
            return handleError(error);
        }
    },

    async delete(collectionName, id) {
        try {
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
            return handleResponse({ success: true });
        } catch (error) {
            return handleError(error);
        }
    },

    // Specific Queries
    async getByUserId(collectionName, userId, orderByField = 'createdAt', orderDirection = 'desc') {
        try {
            const q = query(
                collection(db, collectionName),
                where("userId", "==", userId),
                orderBy(orderByField, orderDirection)
            );
            const querySnapshot = await getDocs(q);
            const results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return handleResponse(results);
        } catch (error) {
            return handleError(error);
        }
    }
};
