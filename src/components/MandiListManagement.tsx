import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  SmartToy,
  PictureAsPdf,
  Clear,
  ExpandMore,
  Info,
} from '@mui/icons-material';
import { parseMandiMessage, ParsedMandiData, estimateTokens } from '../services/openaiService';
import { generateMandiPDF, S3_MANDI_CONFIG } from '../services/pdfService';
import { uploadMandiPdfToS3 } from '../services/pdfS3Service';
import { MandiListService } from '../services/mandiListService';

const MandiListManagement: React.FC = () => {
  const [rawText, setRawText] = useState('');
  const [parsedData, setParsedData] = useState<ParsedMandiData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [firestoreId, setFirestoreId] = useState<string | null>(null);

  const handleClear = () => {
    setRawText('');
    setParsedData(null);
    setError(null);
    setSuccess(null);
    setPdfUrl(null);
    setFirestoreId(null);
  };

  const handleProcess = async () => {
    if (!rawText.trim()) {
      setError('Please enter WhatsApp message text');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('📝 Processing message...');
      const data = await parseMandiMessage(rawText);
      
      setParsedData(data);
      setSuccess(`✅ Successfully extracted ${data.categories.reduce((sum, cat) => sum + cat.items.length, 0)} items from ${data.categories.length} categories!`);
      
      console.log('✅ Parsing complete:', data);
    } catch (err: any) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to process message. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (!parsedData) {
      setError('No data to generate PDF');
      return;
    }
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);
      setPdfUrl(null);
      setFirestoreId(null);
      
      // Step 1: Generate PDF blob
      const { blob, filename } = await generateMandiPDF(parsedData);
      setSuccess('📤 Uploading PDF to S3...');
      
      // Step 2: Upload PDF to S3 (7-day expiration)
      const { publicUrl, presignedUrl } = await uploadMandiPdfToS3(blob, filename);
      setPdfUrl(presignedUrl); // Use presigned URL (works without bucket policy)
      setSuccess('💾 Saving to Firestore database...');
      
      // Step 3: Save to Firestore collection 'mandilist'
      // Using presignedUrl - works even if bucket is private (expires in 7 days)
      const docId = await MandiListService.saveMandiList(parsedData, presignedUrl, filename);
      setFirestoreId(docId);
      
      setSuccess('✅ PDF uploaded & saved! Link valid for 7 days. PDF will auto-delete from S3 after 7 days (requires S3 Lifecycle Rule).');
    } catch (err: any) {
      setError(err.message || 'Failed to generate/upload PDF');
    } finally {
      setLoading(false);
    }
  };

  const tokenEstimate = estimateTokens(rawText);
  const estimatedCost = tokenEstimate > 0 ? ((tokenEstimate / 1000) * 0.00015).toFixed(5) : '0.00000';

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2, 
        mb: 3,
        pb: 2,
        borderBottom: '2px solid rgba(255, 213, 161, 0.3)'
      }}>
        <Typography variant="h4" sx={{ color: '#5D4037', fontWeight: 700 }}>
          🌾 Mandi List Management - غلہ منڈی رپورٹ
        </Typography>
      </Box>

      {/* Info Card */}
      <Card sx={{ mb: 3, bgcolor: 'rgba(100, 181, 246, 0.1)', border: '1px solid #64B5F6' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Info sx={{ color: '#64B5F6' }} />
            <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 600 }}>
              How it works
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#8D6E63', lineHeight: 1.6 }}>
            1. Paste your WhatsApp mandi message (Urdu/English) in the text area below<br />
            2. Click "Process with AI" to extract structured data using ChatGPT<br />
            3. Review the parsed data in the preview table<br />
            4. Click "Generate PDF" to download a professional report
          </Typography>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)' }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 600, mb: 2 }}>
            📱 Paste WhatsApp Message
          </Typography>
          
          <TextField
            multiline
            rows={12}
            fullWidth
            placeholder="بسْــــــــــــــمِ ﷲِالرَّحْمن الرَّحِيم&#10;🌽🌾*غلہ منڈی عارفوالا&#10;22.09.2025&#10;نیو دھان 1509+1692&#10;خشک مال 4400 سے4800&#10;..."
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                direction: 'rtl', // Right-to-left for Urdu
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Chip 
                label={`${rawText.length} characters`} 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`~${tokenEstimate} tokens`} 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`Estimated cost: $${estimatedCost}`} 
                size="small" 
                color="success"
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <SmartToy />}
              onClick={handleProcess}
              disabled={loading || !rawText.trim()}
              sx={{
                bgcolor: '#8BC34A',
                '&:hover': { bgcolor: '#689F38' },
                '&:disabled': { bgcolor: '#e0e0e0' }
              }}
            >
              {loading ? 'Processing...' : 'Process with AI'}
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<Clear />}
              onClick={handleClear}
              disabled={loading}
              sx={{
                borderColor: '#E57373',
                color: '#E57373',
                '&:hover': { borderColor: '#D32F2F', bgcolor: 'rgba(229, 115, 115, 0.1)' }
              }}
            >
              Clear
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* PDF URL and Firestore Info */}
      {pdfUrl && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              📄 PDF Successfully Published
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                S3 Presigned URL (valid for 7 days):
              </Typography>
              <Box 
                sx={{ 
                  bgcolor: 'rgba(0,0,0,0.05)', 
                  p: 1, 
                  borderRadius: 1, 
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem'
                }}
              >
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2' }}>
                  {pdfUrl}
                </a>
              </Box>
            </Box>

            {firestoreId && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Firestore Document ID:
                </Typography>
                <Chip 
                  label={firestoreId} 
                  size="small" 
                  color="success"
                  sx={{ fontFamily: 'monospace' }}
                />
              </Box>
            )}

            <Divider sx={{ my: 2 }} />
            
            <Typography variant="caption" sx={{ color: '#666' }}>
              ⚠️ <strong>Important:</strong> PDF link expires in 7 days. To auto-delete PDFs from S3 after 7 days, configure S3 Lifecycle Rule in AWS Console.
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Preview Section */}
      {parsedData && (
        <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 600, direction: 'rtl', textAlign: 'right' }}>
                  📊 ڈیٹا کا جائزہ
                </Typography>
                <Typography variant="body2" sx={{ color: '#8D6E63', mt: 0.5, direction: 'rtl', textAlign: 'right' }}>
                  منڈی: {parsedData.market} | تاریخ: {parsedData.date} | {parsedData.categories.length} قسمیں
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <PictureAsPdf />}
                onClick={handleGeneratePDF}
                disabled={loading}
                sx={{
                  bgcolor: '#E57373',
                  '&:hover': { bgcolor: '#D32F2F' },
                  '&:disabled': { bgcolor: '#e0e0e0' },
                  direction: 'rtl'
                }}
              >
                {loading ? 'PDF تیار ہو رہا ہے...' : 'PDF بنائیں'}
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {/* Categories Accordion */}
            {parsedData.categories.map((category, catIndex) => (
              <Accordion key={catIndex} defaultExpanded={catIndex === 0}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography sx={{ fontWeight: 600, color: '#5D4037', direction: 'rtl', width: '100%', textAlign: 'right' }}>
                    {category.category} ({category.items.length} اشیاء)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#FEFCF8' }}>
                          <TableCell sx={{ fontWeight: 600, direction: 'rtl', textAlign: 'right' }}>مصنوعات کا نام</TableCell>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>قیمت</TableCell>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>وزن</TableCell>
                          <TableCell sx={{ fontWeight: 600, direction: 'rtl', textAlign: 'right' }}>تفصیلات</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {category.items.map((item, itemIndex) => (
                          <TableRow key={itemIndex} hover>
                            <TableCell sx={{ direction: 'rtl', textAlign: 'right', fontSize: '1.1rem' }}>
                              {item.nameUrdu}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              {item.price ? (
                                <Chip label={`${item.price} روپے`} size="small" color="success" />
                              ) : (
                                <Chip label={`${item.priceMin}-${item.priceMax} روپے`} size="small" color="info" />
                              )}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>{item.unit}</TableCell>
                            <TableCell sx={{ direction: 'rtl', textAlign: 'right' }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'flex-end' }}>
                                {item.moisture && (
                                  <Chip label={`نمی: ${item.moisture}`} size="small" />
                                )}
                                {item.mixture && (
                                  <Chip label={`آمیزش: ${item.mixture}`} size="small" />
                                )}
                                {item.quality && (
                                  <Chip label={item.quality} size="small" color="primary" />
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MandiListManagement;


