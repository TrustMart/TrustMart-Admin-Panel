import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3_MANDI_CONFIG } from './pdfService';

// Function to upload PDF to S3 and return both public URL and 7-day presigned URL
type UploadResult = { 
  publicUrl: string;  // Direct S3 URL (works if bucket has public read)
  presignedUrl: string; // 7-day signed URL (works even with private bucket)
};

/**
 * Upload Mandi PDF to S3 with automatic 7-day expiration
 * 
 * IMPORTANT: To automatically DELETE files after 7 days, configure S3 Lifecycle Rule:
 * 1. Go to AWS S3 Console → pakricebucket → Management → Lifecycle rules
 * 2. Create rule: "Delete mandi-pdfs after 7 days"
 * 3. Apply to prefix: mandi-pdfs/
 * 4. Set expiration: 7 days after object creation
 * 
 * This will automatically delete PDFs from S3 after 7 days.
 */
export async function uploadMandiPdfToS3(blob: Blob, filename: string): Promise<UploadResult> {
  const s3 = new S3Client({
    region: S3_MANDI_CONFIG.region,
    credentials: {
      accessKeyId: S3_MANDI_CONFIG.accessKeyId,
      secretAccessKey: S3_MANDI_CONFIG.secretAccessKey
    }
  });
  
  // Convert Blob to Buffer/Uint8Array
  const arrayBuffer = await blob.arrayBuffer();
  const fileKey = `${S3_MANDI_CONFIG.folder}${filename}`;

  // Upload PDF to S3 with metadata for 7-day expiration
  await s3.send(new PutObjectCommand({
    Bucket: S3_MANDI_CONFIG.bucketName,
    Key: fileKey,
    Body: new Uint8Array(arrayBuffer),
    ContentType: 'application/pdf',
    // ACL removed - bucket uses bucket policy instead of ACLs
    Metadata: {
      'auto-delete': '7-days',
      'created-at': new Date().toISOString()
    }
  }));

  // Public URL (works if bucket allows public read)
  const publicUrl = `https://${S3_MANDI_CONFIG.bucketName}.s3.${S3_MANDI_CONFIG.region}.amazonaws.com/${fileKey}`;

  // Generate a 7-day presigned URL (works even if bucket is private)
  const presignedUrl = await getSignedUrl(
    s3, 
    new GetObjectCommand({
      Bucket: S3_MANDI_CONFIG.bucketName,
      Key: fileKey
    }), 
    { expiresIn: 7 * 24 * 60 * 60 } // 7 days in seconds
  );

  console.log('✅ PDF uploaded to S3:', publicUrl);
  return { publicUrl, presignedUrl };
}
