import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { ParsedMandiData } from './openaiService';

export interface MandiListDocument {
  id?: string;
  market: string;
  date: string;
  source: string;
  pdfUrl: string;
  pdfFilename: string;
  totalItems: number;
  createdAt: Date;
  expiresAt: Date; // 7 days from creation
}

export class MandiListService {
  private static readonly COLLECTION_NAME = 'mandilist';

  /**
   * Save mandi list metadata with S3 PDF URL to Firestore
   * Note: Categories are NOT stored - only essential metadata. Full data is in the PDF.
   */
  static async saveMandiList(
    parsedData: ParsedMandiData,
    pdfUrl: string,
    pdfFilename: string
  ): Promise<string> {
    try {
      const totalItems = parsedData.categories.reduce(
        (sum, cat) => sum + cat.items.length,
        0
      );

      const createdAt = new Date();
      const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

      // Store ONLY essential metadata - no categories array
      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        createdAt,
        date: parsedData.date,
        expiresAt,
        market: parsedData.market,
        pdfFilename,
        pdfUrl,
        source: parsedData.source || '',
        totalItems,
      });

      console.log('✅ Mandi list saved to Firestore:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error saving mandi list:', error);
      throw new Error('Failed to save mandi list to database');
    }
  }

  /**
   * Get recent mandi lists (for display in app)
   */
  static async getRecentMandiLists(limitCount: number = 10): Promise<MandiListDocument[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const mandiLists: MandiListDocument[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        mandiLists.push({
          id: doc.id,
          createdAt: data.createdAt?.toDate() || new Date(),
          date: data.date,
          expiresAt: data.expiresAt?.toDate() || new Date(),
          market: data.market,
          pdfFilename: data.pdfFilename,
          pdfUrl: data.pdfUrl,
          source: data.source,
          totalItems: data.totalItems,
        });
      });

      return mandiLists;
    } catch (error) {
      console.error('❌ Error getting mandi lists:', error);
      throw new Error('Failed to get mandi lists');
    }
  }
}

