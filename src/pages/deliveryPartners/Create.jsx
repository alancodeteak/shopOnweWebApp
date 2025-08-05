import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPartner, generatePartnerId } from '@/store/slices/deliveryPartnerSlice';
import { PageContainer, PageHeader, ErrorMessage, ErrorBoundary, NetworkErrorHandler } from '@/components';
import { FormInput, FormTextarea, FormButton, ImageUpload } from '@/components/forms';
import { isNetworkError, isServerError } from '@/utils/errorHandler';
import { Eye, RefreshCw } from 'lucide-react';
import Lottie from 'lottie-react';
import toast from 'react-hot-toast';

const ageOptions = Array.from({ length: 43 }, (_, i) => 18 + i);

export default function CreateDeliveryPartner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopId = useSelector((state) => state.auth.user?.shopId);
  const { generatedId, loading, error, created } = useSelector((state) => state.deliveryPartners);

  // Stepper state
  const [step, setStep] = useState(1);

  // Basic Info
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [basicInfo, setBasicInfo] = useState({
    first_name: "",
    last_name: "",
    age: "",
    phone1: "",
    email: "",
    address: "",
  });

  // Documents
  const [licenseNo, setLicenseNo] = useState("");
  const [dlFront, setDlFront] = useState(null);
  const [dlBack, setDlBack] = useState(null);
  const [aadhaarFront, setAadhaarFront] = useState(null);
  const [aadhaarBack, setAadhaarBack] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [partnerId, setPartnerId] = useState("");
  const [animationData, setAnimationData] = useState(null);
  const [animationError, setAnimationError] = useState(null);

  useEffect(() => {
    if (shopId) {
      dispatch(generatePartnerId(shopId));
    }
  }, [dispatch, shopId]);

  // Load animation data
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        const response = await fetch('/animations/Delivery.json');
        if (!response.ok) {
          throw new Error(`Failed to load animation: ${response.status}`);
        }
        const data = await response.json();
        setAnimationData(data);
        setAnimationError(null);
      } catch (error) {
        setAnimationError(error.message);
      }
    };
    
    loadAnimation();
  }, []);

  useEffect(() => {
    if (generatedId) {
      setPartnerId(generatedId);
    }
  }, [generatedId]);
  
  // Success state for showing animation after creation
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
      if (created) {
          setShowSuccess(true);
          // Show animation for 3 seconds before redirecting
          setTimeout(() => {
              toast.success("Delivery partner created successfully!");
              navigate("/delivery-partners");
          }, 3000);
      }
  }, [created, navigate]);

  // Validation
  const isBasicInfoValid =
    profilePhoto &&
    basicInfo.first_name.trim() &&
    basicInfo.last_name.trim() &&
    basicInfo.age &&
    basicInfo.phone1.trim().length === 10 &&
    basicInfo.address.trim();


  const isDocumentsValid =
    licenseNo.trim() &&
    dlFront &&
    dlBack &&
    password.length >= 8 &&
    password === confirmPassword &&
    partnerId;

  // Handlers
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (isBasicInfoValid) setStep(2);
    else toast.error("Please fill all required fields and upload a profile photo.");
  };

  const handleBack = () => setStep(1);

  const handleGenerateId = () => {
    if (shopId) {
      dispatch(generatePartnerId(shopId));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isDocumentsValid) {
      toast.error("Please fill all required fields and upload documents.");
      return;
    }
    const data = new FormData();
    data.append("first_name", basicInfo.first_name);
    data.append("last_name", basicInfo.last_name);
    data.append("age", basicInfo.age);
    data.append("phone1", basicInfo.phone1);
    data.append("email", basicInfo.email);
    data.append("address", basicInfo.address);
    data.append("photo", profilePhoto);
    data.append("license_no", licenseNo);
    
    // Append license images as individual files (matching Details.jsx pattern)
    if (dlFront) data.append("license_image", dlFront);
    if (dlBack) data.append("license_image", dlBack);
    
    // Append government ID images as individual files
    if (aadhaarFront) data.append("govt_id_image", aadhaarFront);
    if (aadhaarBack) data.append("govt_id_image", aadhaarBack);
    
    data.append("password", password);
    data.append("delivery_partner_id", partnerId);
    data.append("shop_id", shopId);
    
    
    dispatch(createPartner(data));
  };

    // Show success animation after creating partner
  if (showSuccess) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-white rounded-lg shadow-md p-8">
          <div className="w-80 h-80 mb-8">
            {animationError ? (
              <div className="flex items-center justify-center h-full text-red-500">
                <p>Animation failed to load: {animationError}</p>
              </div>
            ) : animationData ? (
              <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
              />
            ) : (
              <LoadingSpinner size="medium" showMessage={false} />
            )}
          </div>
          <h3 className="text-2xl font-bold text-green-600 mb-4">🎉 Delivery Partner Created!</h3>
          <p className="text-gray-600 text-center max-w-md mb-6">
            Your delivery partner account has been successfully created and is ready to start delivering orders.
          </p>
          <div className="flex items-center gap-2 text-blue-600">
            <LoadingSpinner size="small" message="Redirecting to delivery partners list..." showMessage={false} />
            <span className="text-sm">Redirecting to delivery partners list...</span>
          </div>
        </div>
      </PageContainer>
    );
  }

  // Show loading spinner when creating partner
  if (loading && step === 2) {
    return (
      <PageContainer>
        <PageHeader title="Add Partner" onBack={() => navigate(-1)} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-lg shadow-md p-8">
          <LoadingSpinner size="large" message="Creating Delivery Partner" />
          <p className="text-gray-600 text-center max-w-md mt-4">
            Please wait while we create your delivery partner account. This may take a few moments.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <ErrorBoundary>
      <NetworkErrorHandler>
        <PageContainer>
      <PageHeader title="Add Partner" onBack={() => (step === 1 ? navigate(-1) : handleBack())} />
      
      {/* Stepper */}
      <FormStepper
        steps={['Basic Info', 'Documents']}
        currentStep={step}
      />

      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-4 bg-white p-6 rounded-lg shadow-md">

          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center mb-2">
            <ImageUpload
              label="Profile Photo"
              value={profilePhoto}
              onChange={setProfilePhoto}
              onRemove={() => setProfilePhoto(null)}
              required
              previewHeight="h-24 w-24"
              className="flex flex-col items-center"
            />
            {!profilePhoto && <div className="text-xs text-red-500 mt-2">Profile photo is required</div>}
          </div>

          {/* Input Fields */}
          <FormInput
            icon={User}
            name="first_name"
            placeholder="First Name"
            value={basicInfo.first_name}
            onChange={handleBasicChange}
            required
          />
          {!basicInfo.first_name.trim() && <div className="text-xs text-red-500 -mt-2">First name is required</div>}

          <FormInput
            icon={User}
            name="last_name"
            placeholder="Last Name"
            value={basicInfo.last_name}
            onChange={handleBasicChange}
            required
          />
          {!basicInfo.last_name.trim() && <div className="text-xs text-red-500 -mt-2">Last name is required</div>}

          <div className="relative">
            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
            <select
              name="age"
              value={basicInfo.age}
              onChange={handleBasicChange}
              className="pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Age (18-60)</option>
              {ageOptions.map(age => <option key={age} value={age}>{age}</option>)}
            </select>
          </div>
          {!basicInfo.age && <div className="text-xs text-red-500 -mt-2">Age is required</div>}

          <FormInput
            icon={Phone}
            name="phone1"
            type="tel"
            placeholder="Phone Number"
            value={basicInfo.phone1}
            onChange={handleBasicChange}
            required
            maxLength={10}
          />
          {basicInfo.phone1.trim().length !== 10 && basicInfo.phone1.trim() && <div className="text-xs text-red-500 -mt-2">Phone number must be 10 digits</div>}
          {!basicInfo.phone1.trim() && <div className="text-xs text-red-500 -mt-2">Phone number is required</div>}

          <FormInput
            icon={Mail}
            name="email"
            type="text"
            placeholder="Email (Optional)"
            value={basicInfo.email}
            onChange={handleBasicChange}
          />

          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 9.75V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9.75M12 3v10.25"/>
                <path d="M12 3l7 6.75M12 3L5 9.75"/>
              </svg>
            </span>
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={basicInfo.address}
              onChange={handleBasicChange}
              className="pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {!basicInfo.address.trim() && <div className="text-xs text-red-500 -mt-2">Address is required</div>}

          {/* Validation Summary */}
          {!isBasicInfoValid && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="text-sm font-medium text-red-800 mb-2">Please complete the following:</div>
              <ul className="text-xs text-red-700 space-y-1">
                {!profilePhoto && <li>• Upload a profile photo</li>}
                {!basicInfo.first_name.trim() && <li>• Enter first name</li>}
                {!basicInfo.last_name.trim() && <li>• Enter last name</li>}
                {!basicInfo.age && <li>• Select age</li>}
                {!basicInfo.phone1.trim() && <li>• Enter phone number</li>}
                {basicInfo.phone1.trim() && basicInfo.phone1.trim().length !== 10 && <li>• Phone number must be 10 digits</li>}
                {!basicInfo.address.trim() && <li>• Enter address</li>}
              </ul>
            </div>
          )}

          <FormButton
            type="submit"
            disabled={!isBasicInfoValid}
            fullWidth
            className={isBasicInfoValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-200 cursor-not-allowed'}
          >
            Next
          </FormButton>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">

          <FormInput
            icon={IdCard}
            label="License Number"
            placeholder="License Number"
            value={licenseNo}
            onChange={(e) => setLicenseNo(e.target.value)}
            required
          />

          {/* Driving License Uploads */}
          <div>
            <div className="font-semibold mb-1">Driving License (DL)</div>
            <div className="grid grid-cols-2 gap-3">
              {[dlFront, dlBack].map((img, i) => (
                <ImageUpload
                  key={i}
                  label={i === 0 ? 'Front' : 'Back'}
                  value={img}
                  onChange={(file) => {
                    if (i === 0) setDlFront(file);
                    else setDlBack(file);
                  }}
                  onRemove={() => {
                    if (i === 0) setDlFront(null);
                    else setDlBack(null);
                  }}
                  previewHeight="h-28"
                  required
                />
              ))}
            </div>
          </div>

          {/* Aadhaar Card Uploads */}
          <div>
            <div className="font-semibold mb-1">Aadhaar Card (Optional)</div>
            <div className="grid grid-cols-2 gap-3">
              {[aadhaarFront, aadhaarBack].map((img, i) => (
                <ImageUpload
                  key={i}
                  label={i === 0 ? 'Front' : 'Back'}
                  value={img}
                  onChange={(file) => {
                    if (i === 0) setAadhaarFront(file);
                    else setAadhaarBack(file);
                  }}
                  onRemove={() => {
                    if (i === 0) setAadhaarFront(null);
                    else setAadhaarBack(null);
                  }}
                  previewHeight="h-28"
                />
              ))}
            </div>
          </div>

          {/* Passwords */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              className="pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <span className="absolute left-3 top-3 text-gray-400">
              <Eye size={18} onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer' }} />
            </span>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <span className="absolute left-3 top-3 text-gray-400">
              <Eye size={18} onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: 'pointer' }} />
            </span>
          </div>

          {/* Partner ID */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={partnerId}
              readOnly
              placeholder="Delivery Partner ID"
              className="flex-1 rounded-md border bg-gray-100 shadow-sm px-3 py-2"
            />
            <FormButton
              type="button"
              onClick={handleGenerateId}
              variant="outline"
              icon={RefreshCw}
            >
              Generate ID
            </FormButton>
          </div>

          <FormButton
            type="submit"
            disabled={!isDocumentsValid}
            fullWidth
            className={isDocumentsValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-200 cursor-not-allowed'}
          >
            {loading ? 'Creating Partner...' : 'Submit'}
          </FormButton>
          
          {error && (
            <div className="mt-4">
              <ErrorMessage 
                message={error} 
                isNetworkError={isNetworkError(error)}
                isServerError={isServerError(error)}
                onRetry={() => {
                  // Retry logic for create partner would go here
                  // For now, just clear the error
                }}
              />
            </div>
          )}
        </form>
      )}
      
      {/* Powered by Codeteak */}
      <div className="flex flex-col items-center mt-12 mb-4">
        <span className="text-xs text-blue-500 mb-1">Powered by</span>
        <img src="/assets/codeteak-logo.png" alt="Codeteak Logo" className="h-4 object-contain mt-1 md:mt-2" />
      </div>
        </PageContainer>
      </NetworkErrorHandler>
    </ErrorBoundary>
  );
} 