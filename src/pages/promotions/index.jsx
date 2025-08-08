import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FormInput, FormTextarea, ImageUpload, FormButton } from '@/components/forms';
import PageHeader from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { fetchPromotion, upsertPromotion, clearError, clearSuccess } from '@/store/slices/promotionsSlice';
import { toast } from 'react-hot-toast';
import { LoadingSpinner, ErrorMessage, ErrorBoundary, NetworkErrorHandler } from '@/components';
import { isNetworkError, isServerError } from '@/utils/errorHandler';
import { decodeHtmlEntities } from '@/utils/security';
import { getImageUrl } from '@/utils/imageUtils';

export default function Promotions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const shopId = useSelector((state) => state.auth.user?.shopId);
  
  // Redux state
  const promotion = useSelector((state) => state.promotions.current);
  const loading = useSelector((state) => state.promotions.loading);
  const saving = useSelector((state) => state.promotions.saving);
  const error = useSelector((state) => state.promotions.error);
  const success = useSelector((state) => state.promotions.success);
  
  // Form state
  const [promotionImage, setPromotionImage] = useState(null);
  const [promotionHeader, setPromotionHeader] = useState('');
  const [promotionContent, setPromotionContent] = useState('');
  const [promotionLink, setPromotionLink] = useState('');

  // Fetch existing promotion on component mount
  useEffect(() => {
    dispatch(fetchPromotion());
  }, [dispatch]);

  // Populate form with existing data when promotion is loaded
  useEffect(() => {
    if (promotion) {
      setPromotionHeader(promotion.promotion_header || '');
      setPromotionContent(promotion.promotion_content || '');
      
      // Decode HTML entities in the promotion link and remove any backticks
      let decodedLink = decodeHtmlEntities(promotion.promotion_link || '');
      decodedLink = decodedLink.replace(/`/g, '');
      setPromotionLink(decodedLink);
      
      // Handle promotion image based on its type
      console.log('Promotion image data:', promotion.promotion_image);
      
      if (promotion.promotion_image) {
        if (typeof promotion.promotion_image === 'string' && promotion.promotion_image.trim() !== '') {
          // Valid image URL string - let existingImageUrl handle displaying it
          console.log('Valid image URL found:', promotion.promotion_image);
          setPromotionImage(null);
        } else if (typeof promotion.promotion_image === 'object') {
          // Empty object - no image available
          console.log('Empty image object detected');
          setPromotionImage(null);
        } else {
          // Any other case - reset image
          console.log('Invalid image data, resetting');
          setPromotionImage(null);
        }
      } else {
        // No image data at all
        console.log('No image data found');
        setPromotionImage(null);
      }
    }
  }, [promotion]); // Removed promotionImage dependency to avoid infinite loop

  // Handle success and error messages
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const handleSavePromotion = async () => {
    if (!shopId) {
      toast.error('Shop ID not found');
      return;
    }

    // Clean the promotion link by removing any backticks
    const cleanedLink = promotionLink ? promotionLink.replace(/`/g, '') : '';
    console.log('Saving promotion with link:', cleanedLink);

    const formData = new FormData();
    formData.append('shop_id', shopId);
    formData.append('promotion_header', promotionHeader);
    formData.append('promotion_content', promotionContent);
    formData.append('promotion_link', cleanedLink);
    
    // Handle image upload logic
    if (promotionImage && promotionImage instanceof File) {
      // New image being uploaded
      console.log('Uploading new image:', promotionImage.name);
      formData.append('promotion_image', promotionImage);
    } else if (promotion?.promotion_image && typeof promotion.promotion_image === 'string' && promotion.promotion_image.trim() !== '') {
      // Keep existing image - don't need to append anything as backend will preserve it
      console.log('Keeping existing image:', promotion.promotion_image);
      // Don't append anything - the backend will keep the existing image
    } else {
      // No image - explicitly set to empty string to clear any existing image
      console.log('No image to upload or keep, clearing any existing image');
      formData.append('promotion_image', '');
    }

    try {
      const result = await dispatch(upsertPromotion(formData)).unwrap();
      console.log('Promotion saved successfully:', result);
    } catch (err) {
      console.error('Error saving promotion:', err);
      // Error is handled by the slice and displayed via toast
    }
  };

  const handleRetry = () => {
    dispatch(fetchPromotion());
  };

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 pt-16 pb-24">
        <div className="max-w-screen-md mx-auto px-4">
          <PageHeader title="Promotions" onBack={() => navigate(-1)} />
          <LoadingSpinner size="large" message="Loading promotion..." />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 pt-16 pb-24">
        <div className="max-w-screen-md mx-auto px-4">
          <PageHeader title="Promotions" onBack={() => navigate(-1)} />
          <ErrorMessage 
            message={error} 
            isNetworkError={isNetworkError(error)}
            isServerError={isServerError(error)}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <NetworkErrorHandler>
        <div className="min-h-screen bg-blue-50 pt-16 pb-24">
      <div className="max-w-screen-md mx-auto px-4">
        <PageHeader title="Promotions" onBack={() => navigate(-1)} />
        
        {/* Promotion Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md mx-auto">
          <h2 className="text-lg font-bold text-gray-800 mb-6">
            {promotion ? 'Edit Promotion' : 'Create Promotion'}
          </h2>
          
         
          
          {/* Image Upload */}
          <ImageUpload
            label="Promotion Image (1:2 ratio, 853×1280px recommended)"
            value={promotionImage}
            onChange={setPromotionImage}
            onRemove={() => setPromotionImage(null)}
            className="mb-6"
            existingImageUrl={
              promotion?.promotion_image && typeof promotion.promotion_image === 'string' 
                ? getImageUrl(promotion.promotion_image) 
                : null
            }
            aspectRatio={0.5}
            validate={true}
            maxWidth={853}
            maxHeight={1280}
            minWidth={800}
            minHeight={1200}
          />
          
          {/* Debug info for image URL - will be removed in production */}
          {promotion?.promotion_image && typeof promotion.promotion_image === 'string' && (
            <div className="mb-6 text-xs text-gray-500">
              <span className="font-semibold">Image URL:</span> {getImageUrl(promotion.promotion_image)}
            </div>
          )}
          
          {/* Debug info for promotion_image object */}
          {promotion?.promotion_image && typeof promotion.promotion_image === 'object' && (
            <div className="mb-6 text-xs text-gray-500">
              <span className="font-semibold">Image data:</span> Empty object - no image available
            </div>
          )}

          {/* Header Field */}
          <FormInput
            label="Promotion Header"
            placeholder="Enter promotion header"
            value={promotionHeader}
            onChange={(e) => setPromotionHeader(e.target.value)}
            maxLength={100}
            className="mb-6"
            required
          />

          {/* Content Field */}
          <FormTextarea
            label="Promotion Content"
            placeholder="Enter promotion content/description"
            value={promotionContent}
            onChange={(e) => setPromotionContent(e.target.value)}
            maxLength={500}
            className="mb-6"
            required
          />

          {/* Link Field */}
          <FormInput
            label="Promotion Link (Optional)"
            placeholder="Enter promotion link URL"
            value={promotionLink}
            onChange={(e) => setPromotionLink(e.target.value)}
            type="url"
            className="mb-6"
          />
          
          {/* Display the decoded link for reference if it exists */}
          {promotionLink && (
            <div className="mb-6 text-xs text-gray-500">
              <span className="font-semibold">Link Preview:</span> {promotionLink}
            </div>
          )}

          {/* Save Button */}
          <FormButton
            onClick={handleSavePromotion}
            loading={saving}
            fullWidth
            size="lg"
            disabled={!promotionHeader.trim() || !promotionContent.trim()}
          >
            {saving ? 'Saving...' : (promotion ? 'Update Promotion' : 'Save Promotion')}
          </FormButton>
        </div>
        
        {/* Powered by Codeteak */}
        <div className="flex flex-col items-center mt-12 mb-4">
          <span className="text-xs text-blue-500 mb-1">Powered by</span>
          <img src="/assets/codeteak-logo.png" alt="Codeteak Logo" className="h-4 object-contain mt-1 md:mt-2" />
        </div>
      </div>
        </div>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
}