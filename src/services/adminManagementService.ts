import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface TrustMartUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'shop' | 'admin';
  profileImage?: string;
  phone?: string;
  address?: string;
  cnic?: string;
  gender?: 'Male' | 'Female';
  isApproved: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrustMartProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  isActive: boolean;
  isApproved: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrustMartBid {
  id: string;
  productId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  message?: string;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class AdminManagementService {
  // Get all users with pagination
  static async getUsers(pageSize: number = 20, lastDoc?: QueryDocumentSnapshot): Promise<{
    users: TrustMartUser[];
    lastDoc?: QueryDocumentSnapshot;
    hasMore: boolean;
  }> {
    try {
      let q = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(pageSize + 1)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const users: TrustMartUser[] = [];
      let hasMore = false;

      let index = 0;
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        if (index < pageSize) {
          const data = doc.data();
          users.push({
            id: doc.id,
            email: data.email || '',
            name: data.name || '',
            role: data.role || 'user',
            profileImage: data.profileImage || '',
            phone: data.phone || '',
            address: data.address || '',
            cnic: data.cnic || '',
            gender: data.gender || 'Male',
            isApproved: data.isApproved || false,
            averageRating: data.averageRating || 0,
            totalReviews: data.totalReviews || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          });
        } else {
          hasMore = true;
        }
        index++;
      });

      return {
        users,
        lastDoc: hasMore ? querySnapshot.docs[pageSize - 1] : undefined,
        hasMore
      };
    } catch (error) {
      console.error('Error getting users:', error);
      throw new Error('Failed to get users');
    }
  }

  // Get users by role
  static async getUsersByRole(role: string): Promise<TrustMartUser[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', role),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const users: TrustMartUser[] = [];

      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        users.push({
          id: doc.id,
          email: data.email || '',
          name: data.name || '',
          role: data.role || 'user',
          profileImage: data.profileImage || '',
          phone: data.phone || '',
          address: data.address || '',
          cnic: data.cnic || '',
          gender: data.gender || 'Male',
          isApproved: data.isApproved || false,
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return users;
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw new Error('Failed to get users by role');
    }
  }

  // Approve/Disapprove user
  static async updateUserApproval(userId: string, isApproved: boolean): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isApproved,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating user approval:', error);
      throw new Error('Failed to update user approval');
    }
  }

  // Get all products with pagination
  static async getProducts(pageSize: number = 20, lastDoc?: QueryDocumentSnapshot): Promise<{
    products: TrustMartProduct[];
    lastDoc?: QueryDocumentSnapshot;
    hasMore: boolean;
  }> {
    try {
      let q = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc'),
        limit(pageSize + 1)
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const products: TrustMartProduct[] = [];
      let hasMore = false;

      let index = 0;
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        if (index < pageSize) {
          const data = doc.data();
          products.push({
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            price: data.price || 0,
            category: data.category || '',
            images: data.images || [],
            sellerId: data.sellerId || '',
            sellerName: data.sellerName || '',
            isActive: data.isActive !== false, // Default to true if undefined
            isApproved: data.isApproved || false,
            averageRating: data.averageRating || 0,
            totalReviews: data.totalReviews || 0,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
        } else {
          hasMore = true;
        }
        index++;
      });

      return {
        products,
        lastDoc: hasMore ? querySnapshot.docs[pageSize - 1] : undefined,
        hasMore
      };
    } catch (error) {
      console.error('Error getting products:', error);
      throw new Error('Failed to get products');
    }
  }

  // Approve/Disapprove product
  static async updateProductApproval(productId: string, isApproved: boolean): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        isApproved,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating product approval:', error);
      throw new Error('Failed to update product approval');
    }
  }

  // Activate/Deactivate product
  static async updateProductStatus(productId: string, isActive: boolean): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        isActive,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating product status:', error);
      throw new Error('Failed to update product status');
    }
  }

  // Get all bids
  static async getBids(): Promise<TrustMartBid[]> {
    try {
      const q = query(
        collection(db, 'bids'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const bids: TrustMartBid[] = [];

      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        bids.push({
          id: doc.id,
          productId: data.productId || '',
          bidderId: data.bidderId || '',
          bidderName: data.bidderName || '',
          amount: data.amount || 0,
          message: data.message || '',
          isAccepted: data.isAccepted || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      });

      return bids;
    } catch (error) {
      console.error('Error getting bids:', error);
      throw new Error('Failed to get bids');
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(): Promise<{
    totalUsers: number;
    totalProducts: number;
    totalBids: number;
    pendingApprovals: number;
    activeUsers: number;
    activeProducts: number;
  }> {
    try {
      const [usersSnapshot, productsSnapshot, bidsSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'bids'))
      ]);

      const users = usersSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          ...data,
          isApproved: data.isApproved || false
        };
      });
      
      const products = productsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          ...data,
          isActive: data.isActive !== false, // Default to true if undefined
          isApproved: data.isApproved || false
        };
      });

      const totalUsers = users.length;
      const totalProducts = products.length;
      const totalBids = bidsSnapshot.size;
      const pendingApprovals = users.filter(user => !user.isApproved).length;
      const activeUsers = users.filter(user => user.isApproved).length;
      
      const activeProducts = products.filter(product => product.isActive).length;

      return {
        totalUsers,
        totalProducts,
        totalBids,
        pendingApprovals,
        activeUsers,
        activeProducts
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to get dashboard statistics');
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Delete product
  static async deleteProduct(productId: string): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('Failed to delete product');
    }
  }
}
