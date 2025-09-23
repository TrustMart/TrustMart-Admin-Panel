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
  getDoc,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface TrustMartUser {
  id: string;
  email: string;
  name: string;
  role: 'company' | 'shop' | 'commissioner' | 'user';
  profileImage: string;
  phone: string;
  address: string;
  cnic: string;
  gender: 'Male' | 'Female';
  isApproved: boolean;
  isFeatured: boolean;
  averageRating: number;
  totalReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrustMartProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  images: string[];
  video?: string | null;
  category: string;
  status: 'Active' | 'Sold' | 'Inactive' | 'Blocked';
  userId: string;
  userName: string;
  remainingBags: number;
  weightPerBag: string;
  dateAdded: string;
  bids: number;
  averageRating?: number;
  totalReviews?: number;
  ratingBreakdown?: {
    [key: number]: number; // rating -> count
  };
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
            isApproved: data.isApproved !== undefined ? data.isApproved : true,
            isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
            averageRating: data.averageRating || 0,
            totalReviews: data.totalReviews || 0,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
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
            isApproved: data.isApproved !== undefined ? data.isApproved : true,
            isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
            averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
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
            name: data.name || '',
            description: data.description || '',
            price: data.price || '',
            images: data.images || [],
            video: data.video || null,
            category: data.category || '',
            status: data.status || 'Active',
            userId: data.userId || '',
            userName: data.userName || '',
            remainingBags: data.remainingBags || 0,
            weightPerBag: data.weightPerBag || '',
            dateAdded: data.dateAdded || '',
            bids: data.bids || 0,
            averageRating: data.averageRating || 0,
            totalReviews: data.totalReviews || 0,
            ratingBreakdown: data.ratingBreakdown || {},
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString(),
          });
          
          // Debug logging for product status
          console.log(`Product ${doc.id}: status="${data.status}", mapped status="${data.status || 'Active'}"`);
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

  // Block/Unblock product (admin action)
  static async updateProductStatus(productId: string, isBlocked: boolean): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      
      // Get current product to determine new status
      const productDoc = await getDoc(productRef);
      if (!productDoc.exists()) {
        throw new Error('Product not found');
      }
      
      const currentData = productDoc.data();
      const currentStatus = currentData.status || 'Active';
      
      let newStatus: string;
      if (isBlocked) {
        // Block the product - set to Blocked regardless of current status (Active/Inactive)
        newStatus = 'Blocked';
      } else {
        // Unblock the product - restore to Active
        newStatus = 'Active';
      }
      
      await updateDoc(productRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      console.log(`✅ Product ${productId} status updated in Firebase: ${currentStatus} → ${newStatus}`);
    } catch (error) {
      console.error('Error updating product status:', error);
      throw new Error('Failed to update product status');
    }
  }

  // Update product category
  static async updateProductCategory(productId: string, category: string): Promise<void> {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        category,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating product category:', error);
      throw new Error('Failed to update product category');
    }
  }

  // Update shop featured status
  static async updateShopFeaturedStatus(userId: string, isFeatured: boolean): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isFeatured,
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Shop ${userId} featured status updated: ${isFeatured}`);
    } catch (error) {
      console.error('Error updating shop featured status:', error);
      throw new Error('Failed to update shop featured status');
    }
  }

  // Get featured shops only
  static async getFeaturedShops(): Promise<TrustMartUser[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('isFeatured', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const shops: TrustMartUser[] = [];
      
      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        shops.push({
          id: doc.id,
          email: data.email || '',
          name: data.name || '',
          role: data.role || 'user',
          profileImage: data.profileImage || '',
          phone: data.phone || '',
          address: data.address || '',
          cnic: data.cnic || '',
          gender: data.gender || 'Male',
          isApproved: data.isApproved !== undefined ? data.isApproved : true,
          isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
      });
      
      // Sort by createdAt in JavaScript
      shops.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      return shops;
    } catch (error) {
      console.error('Error getting featured shops:', error);
      throw new Error('Failed to get featured shops');
    }
  }

  // Get all virtual shops (all users since every user is a virtual shop)
  static async getShops(limitCount: number = 50): Promise<{ shops: TrustMartUser[]; hasMore: boolean }> {
    try {
      const q = query(
        collection(db, 'users'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const shops: TrustMartUser[] = [];

      snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        shops.push({
          id: doc.id,
          email: data.email || '',
          name: data.name || '',
          role: data.role || 'user',
          profileImage: data.profileImage || '',
          phone: data.phone || '',
          address: data.address || '',
          cnic: data.cnic || '',
          gender: data.gender || 'Male',
          isApproved: data.isApproved !== undefined ? data.isApproved : true,
          isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
          averageRating: data.averageRating || 0,
          totalReviews: data.totalReviews || 0,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
        });
      });

      // Sort by createdAt in JavaScript instead of Firebase query
      shops.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return { shops, hasMore: snapshot.size === limitCount };
    } catch (error) {
      console.error('Error getting shops:', error);
      throw new Error('Failed to get shops');
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
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
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
    featuredShops: number;
    roleStats: {
      users: number;
      shops: number;
      companies: number;
      commissioners: number;
    };
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
           id: doc.id,
           role: data.role || 'user',
           isApproved: data.isApproved !== undefined ? data.isApproved : true,
           isFeatured: data.isFeatured !== undefined ? data.isFeatured : false
         };
       });
      
      const products = productsSnapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          ...data,
          isActive: data.status === 'Active' || data.isActive !== false, // Use status field from TrustMart
          isApproved: data.isApproved || false
        };
      });

      const totalUsers = users.length;
      const totalProducts = products.length;
      const totalBids = bidsSnapshot.size;
      const pendingApprovals = users.filter(user => !user.isApproved).length;
      const activeUsers = users.filter(user => user.isApproved).length;
      
      const activeProducts = products.filter(product => product.isActive).length;
      const featuredShops = users.filter(user => user.isFeatured).length;

      // Role-based statistics
      const roleStats = {
        users: users.filter(user => user.role === 'user').length,
        shops: users.filter(user => user.role === 'shop').length,
        companies: users.filter(user => user.role === 'company').length,
        commissioners: users.filter(user => user.role === 'commissioner').length,
      };

      return {
        totalUsers,
        totalProducts,
        totalBids,
        pendingApprovals,
        activeUsers,
        activeProducts,
        featuredShops,
        roleStats
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
