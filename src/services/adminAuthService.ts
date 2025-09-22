import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Admin {
  id?: string;
  email: string;
  password: string;
  name?: string;
  role?: string;
  isActive?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
}

export class AdminAuthService {
  private static readonly COLLECTION_NAME = 'admins';
  
  // Collections that exist in the TrustMart app
  private static readonly EXISTING_COLLECTIONS = {
    USERS: 'users',
    PRODUCTS: 'products', 
    BIDS: 'bids',
    CHATS: 'chats',
    REVIEWS: 'reviews',
    TEST: 'test'
  };

  // Create a new admin
  static async createAdmin(adminData: Omit<Admin, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...adminData,
        createdAt: new Date(),
        isActive: true,
        role: adminData.role || 'admin'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw new Error('Failed to create admin');
    }
  }

  // Authenticate admin login
  static async authenticateAdmin(email: string, password: string): Promise<Admin | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('email', '==', email),
        where('password', '==', password),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const adminDoc = querySnapshot.docs[0];
      const adminData = adminDoc.data() as Admin;
      
      // Update last login
      await this.updateLastLogin(adminDoc.id);
      
      return {
        id: adminDoc.id,
        ...adminData
      };
    } catch (error) {
      console.error('Error authenticating admin:', error);
      throw new Error('Failed to authenticate admin');
    }
  }

  // Get admin by email
  static async getAdminByEmail(email: string): Promise<Admin | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('email', '==', email)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const adminDoc = querySnapshot.docs[0];
      return {
        id: adminDoc.id,
        ...adminDoc.data() as Admin
      };
    } catch (error) {
      console.error('Error getting admin by email:', error);
      throw new Error('Failed to get admin');
    }
  }

  // Get all admins
  static async getAllAdmins(): Promise<Admin[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.COLLECTION_NAME));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Admin
      }));
    } catch (error) {
      console.error('Error getting all admins:', error);
      throw new Error('Failed to get admins');
    }
  }

  // Update admin
  static async updateAdmin(adminId: string, updates: Partial<Admin>): Promise<void> {
    try {
      const adminRef = doc(db, this.COLLECTION_NAME, adminId);
      await updateDoc(adminRef, updates);
    } catch (error) {
      console.error('Error updating admin:', error);
      throw new Error('Failed to update admin');
    }
  }

  // Update last login
  static async updateLastLogin(adminId: string): Promise<void> {
    try {
      const adminRef = doc(db, this.COLLECTION_NAME, adminId);
      await updateDoc(adminRef, {
        lastLogin: new Date()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for last login update failure
    }
  }

  // Deactivate admin
  static async deactivateAdmin(adminId: string): Promise<void> {
    try {
      const adminRef = doc(db, this.COLLECTION_NAME, adminId);
      await updateDoc(adminRef, {
        isActive: false
      });
    } catch (error) {
      console.error('Error deactivating admin:', error);
      throw new Error('Failed to deactivate admin');
    }
  }

  // Delete admin
  static async deleteAdmin(adminId: string): Promise<void> {
    try {
      const adminRef = doc(db, this.COLLECTION_NAME, adminId);
      await deleteDoc(adminRef);
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw new Error('Failed to delete admin');
    }
  }

  // Initialize default admin (for development)
  static async initializeDefaultAdmin(): Promise<void> {
    try {
      // Check if any admins exist
      const admins = await this.getAllAdmins();
      
      if (admins.length === 0) {
        // Create default admin
        await this.createAdmin({
          email: 'admin@trustmart.com',
          password: 'admin123',
          name: 'Default Admin',
          role: 'super_admin'
        });
        console.log('Default admin created: admin@trustmart.com / admin123');
      }
    } catch (error) {
      console.error('Error initializing default admin:', error);
    }
  }
}
