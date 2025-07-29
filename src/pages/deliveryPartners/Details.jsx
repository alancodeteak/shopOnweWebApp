import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchPartnerById, updatePartner } from '@/store/slices/deliveryPartnerSlice';
import AppSpinner from '@/components/AppSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { ArrowLeft, RefreshCw, Phone, Trash2, Edit2, Truck, BadgeCheck, User, Circle, Camera, Calendar, IdCard, Mail } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

// Helper function to construct proper image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // If it's a relative path, construct the full URL
  return `${import.meta.env.VITE_API_BASE_URL}${imagePath}`;
};

export default function DeliveryPartnerDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isEdit = location.pathname.endsWith('/edit');
  const partner = useSelector((state) => state.deliveryPartners.current);
  const loading = useSelector((state) => state.deliveryPartners.loading);
  const error = useSelector((state) => state.deliveryPartners.error);

  // Early return for loading and error states
  if (loading) return <AppSpinner label={isEdit ? "Loading partner for edit..." : "Loading partner details..."} />;
  if (error) return <ErrorMessage message={error} />;
  if (!partner) return <div>No partner selected.</div>;

  // Editable state for edit mode
  const [step, setStep] = React.useState(1);
  const [profilePhoto, setProfilePhoto] = React.useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = React.useState("");
  const [basicInfo, setBasicInfo] = React.useState({
    first_name: '',
    last_name: '',
    age: '',
    phone1: '',
    phone2: '',
    email: '',
    address: '',
  });
  const [licenseNo, setLicenseNo] = React.useState("");
  const [dlFront, setDlFront] = React.useState(null);
  const [dlBack, setDlBack] = React.useState(null);
  const [aadhaarFront, setAadhaarFront] = React.useState(null);
  const [aadhaarBack, setAadhaarBack] = React.useState(null);
  const [partnerId, setPartnerId] = React.useState("");

  React.useEffect(() => {
    if (id) {
      dispatch(fetchPartnerById(id));
    }
  }, [dispatch, id]);

  // Pre-fill form in edit mode
  React.useEffect(() => {
    if (isEdit && partner) {
      setBasicInfo({
        first_name: partner.first_name || '',
        last_name: partner.last_name || '',
        age: partner.age ? String(partner.age) : '',
        phone1: partner.phone1 ? String(partner.phone1) : '',
        phone2: partner.phone2 ? String(partner.phone2) : '',
        email: partner.email || '',
        address: partner.address || '',
      });
      setProfilePhotoUrl(partner.photo_url || '');
      setLicenseNo(partner.license_no || '');
      setPartnerId(partner.delivery_partner_id || '');
      try {
        const license = partner.license_image ? JSON.parse(partner.license_image) : [];
        setDlFront(license[0] || null);
        setDlBack(license[1] || null);
      } catch { setDlFront(null); setDlBack(null); }
      try {
        const aadhaar = partner.govt_id_image ? JSON.parse(partner.govt_id_image) : [];
        setAadhaarFront(aadhaar[0] || null);
        setAadhaarBack(aadhaar[1] || null);
      } catch { setAadhaarFront(null); setAadhaarBack(null); }
    }
  }, [isEdit, partner]);

  // Validation (reuse from Create)
  const isBasicInfoValid =
    (profilePhotoUrl || partner.photo_url) &&
    basicInfo.first_name.trim() &&
    basicInfo.last_name.trim() &&
    basicInfo.age &&
    basicInfo.phone1.trim().length === 10 &&
    basicInfo.address.trim();
  const isDocumentsValid =
    licenseNo.trim() &&
    (dlFront || partner?.license_image) &&
    (dlBack || partner?.license_image) &&
    partnerId;

  // Handlers for edit mode
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({ ...prev, [name]: value }));
  };
  const handleProfilePhoto = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
    setProfilePhotoUrl(file ? URL.createObjectURL(file) : partner.photo_url || '');
  };
  const handleNext = (e) => {
    e.preventDefault();
    if (isBasicInfoValid) setStep(2);
  };
  const handleBack = () => setStep(1);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isDocumentsValid) return;
    const data = new FormData();
    data.append("first_name", basicInfo.first_name);
    data.append("last_name", basicInfo.last_name);
    data.append("age", basicInfo.age);
    data.append("phone1", basicInfo.phone1);
    data.append("phone2", basicInfo.phone2);
    data.append("email", basicInfo.email);
    data.append("address", basicInfo.address);
    if (profilePhoto) data.append("photo", profilePhoto);
    data.append("license_no", licenseNo);
    data.append("license_image", JSON.stringify([dlFront || '', dlBack || '']));
    data.append("govt_id_image", JSON.stringify([aadhaarFront || '', aadhaarBack || '']));
    data.append("delivery_partner_id", partnerId);
    dispatch(updatePartner({ id, formData: data })).then(() => {
      navigate(`/delivery-partners/${id}`);
    });
  };

  if (isEdit) {
    // Editable form (like Create)
    return (
      <div className="max-w-screen-md mx-auto px-2 sm:px-4 pt-6 pb-8">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <button onClick={() => (step === 1 ? navigate(-1) : handleBack())} className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-full">
            <ArrowLeft size={20} className="sm:w-[22px] sm:h-[22px]" />
          </button>
          <h1 className="text-xl sm:text-2xl font-bold flex-1 text-center">EDIT PARTNER</h1>
        </div>
        {/* Stepper */}
        <div className="flex items-center justify-center gap-6 sm:gap-8 mb-4 sm:mb-6">
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${step === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
            <span className={`text-[10px] sm:text-xs mt-1 ${step === 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>Basic Info</span>
          </div>
          <div className="flex-1 h-1 bg-gray-200 rounded mx-2" style={{ maxWidth: 50 }}>
            <div className={`h-1 rounded bg-blue-500 transition-all duration-300`} style={{ width: step === 2 ? '100%' : '50%' }} />
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${step === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <span className={`text-[10px] sm:text-xs mt-1 ${step === 2 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>Documents</span>
          </div>
        </div>
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-3 sm:space-y-4 bg-white p-4 sm:p-6 rounded-lg shadow-md">
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center mb-2 sm:mb-2">
              <label htmlFor="profilePhoto" className="relative cursor-pointer">
                <img
                  src={profilePhotoUrl || 'https://ui-avatars.com/api/?name=DP'}
                  alt="Profile"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-gray-200 shadow"
                />
                <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-white p-1 rounded-full border shadow">
                  <Camera size={18} className="text-gray-500 sm:w-5 sm:h-5" />
                </span>
                <input
                  type="file"
                  id="profilePhoto"
                  accept="image/*"
                  className="hidden"
                  onChange={handleProfilePhoto}
                />
              </label>
            </div>
            {/* Input Fields */}
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                name="first_name"
                placeholder="First Name"
                value={basicInfo.first_name}
                onChange={handleBasicChange}
                className="pl-9 sm:pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                name="last_name"
                placeholder="Last Name"
                value={basicInfo.last_name}
                onChange={handleBasicChange}
                className="pl-9 sm:pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
              <select
                name="age"
                value={basicInfo.age}
                onChange={handleBasicChange}
                className="pl-9 sm:pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              >
                <option value="">Age (18-60)</option>
                {Array.from({ length: 43 }, (_, i) => 18 + i).map(age => <option key={age} value={age}>{age}</option>)}
              </select>
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="tel"
                name="phone1"
                placeholder="Phone Number"
                value={basicInfo.phone1}
                onChange={handleBasicChange}
                className="pl-9 sm:pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
                maxLength={10}
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="tel"
                name="phone2"
                placeholder="Secondary Phone Number (Optional)"
                value={basicInfo.phone2}
                onChange={handleBasicChange}
                className="pl-9 sm:pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                maxLength={10}
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={basicInfo.email}
                onChange={handleBasicChange}
                className="pl-9 sm:pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9.75V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9.75M12 3v10.25"/><path d="M12 3l7 6.75M12 3L5 9.75"/></svg>
              </span>
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={basicInfo.address}
                onChange={handleBasicChange}
                className="pl-9 sm:pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2 rounded-full font-bold text-white text-sm ${isBasicInfoValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-200 cursor-not-allowed'}`}
              disabled={!isBasicInfoValid}
            >
              Next
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700">License Number</label>
              <div className="relative">
                <IdCard className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  value={licenseNo}
                  onChange={e => setLicenseNo(e.target.value)}
                  placeholder="License Number"
                  className="pl-9 sm:pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
            </div>
            {/* Driving License Uploads */}
            <div>
              <div className="font-semibold mb-1 text-sm">Driving License (DL)</div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[dlFront, dlBack].map((img, i) => (
                  <label key={i} className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-24 sm:h-28 cursor-pointer bg-gray-50">
                    {img ? (
                      <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={`DL ${i === 0 ? 'Front' : 'Back'}`} className="object-cover w-full h-full rounded-lg" />
                    ) : (
                      <>
                        <Camera size={24} className="text-gray-400 mb-1 sm:w-7 sm:h-7" />
                        <span className="text-[10px] sm:text-xs text-gray-400">{i === 0 ? 'Front' : 'Back'}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files[0];
                      if (i === 0) setDlFront(file);
                      else setDlBack(file);
                    }} />
                  </label>
                ))}
              </div>
            </div>
            {/* Aadhaar Card Uploads */}
            <div>
              <div className="font-semibold mb-1 text-sm">Aadhaar Card (Optional)</div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {[aadhaarFront, aadhaarBack].map((img, i) => (
                  <label key={i} className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-24 sm:h-28 cursor-pointer bg-gray-50">
                    {img ? (
                      <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={`Aadhaar ${i === 0 ? 'Front' : 'Back'}`} className="object-cover w-full h-full rounded-lg" />
                    ) : (
                      <>
                        <Camera size={24} className="text-gray-400 mb-1 sm:w-7 sm:h-7" />
                        <span className="text-[10px] sm:text-xs text-gray-400">{i === 0 ? 'Front' : 'Back'}</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                      const file = e.target.files[0];
                      if (i === 0) setAadhaarFront(file);
                      else setAadhaarBack(file);
                    }} />
                  </label>
                ))}
              </div>
            </div>
            {/* Partner ID (read only) */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={partnerId}
                readOnly
                placeholder="Delivery Partner ID"
                className="flex-1 rounded-md border bg-gray-100 shadow-sm px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2 rounded-full font-bold text-white text-sm ${isDocumentsValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-200 cursor-not-allowed'}`}
              disabled={!isDocumentsValid}
            >
              Save Changes
            </button>
            {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
          </form>
        )}
      </div>
    );
  }

  // Parse images if needed
  let licenseImages = [];
  let govtIdImages = [];
  
  // Use correct field names from API response
  licenseImages = partner.license_images || [];
  govtIdImages = partner.govt_id_images || [];
  
  // Alternative parsing for different response formats
  if (licenseImages.length === 0 && partner.license_image) {
    // Try parsing as string array or single string
    if (typeof partner.license_image === 'string') {
      if (partner.license_image.includes('[')) {
        try { licenseImages = JSON.parse(partner.license_image); } catch {}
      } else {
        licenseImages = [partner.license_image];
      }
    } else if (Array.isArray(partner.license_image)) {
      licenseImages = partner.license_image;
    }
  }
  
  if (govtIdImages.length === 0 && partner.govt_id_image) {
    // Try parsing as string array or single string
    if (typeof partner.govt_id_image === 'string') {
      if (partner.govt_id_image.includes('[')) {
        try { govtIdImages = JSON.parse(partner.govt_id_image); } catch {}
      } else {
        govtIdImages = [partner.govt_id_image];
      }
    } else if (Array.isArray(partner.govt_id_image)) {
      govtIdImages = partner.govt_id_image;
    }
  }
  
  // Debug logging for image URLs
  console.log('Partner photo URL:', partner.photo_url);
  console.log('License images:', licenseImages);
  console.log('Government ID images:', govtIdImages);
  console.log('Full partner object:', partner);
  console.log('License images raw:', partner.license_images);
  console.log('Government ID images raw:', partner.govt_id_images);
  console.log('Alternative photo fields:', {
    profile_photo: partner.profile_photo,
    profile_image: partner.profile_image,
    image: partner.image,
    avatar: partner.avatar
  });
  console.log('Alternative license fields:', {
    license_images: partner.license_images,
    driving_license: partner.driving_license,
    dl_images: partner.dl_images
  });
  console.log('Alternative govt ID fields:', {
    govt_id_images: partner.govt_id_images,
    aadhaar: partner.aadhaar,
    aadhaar_images: partner.aadhaar_images
  });
  // Use actual images from API response, no fallback to sample images
  const displayGovtIdImages = govtIdImages.filter(img => img && img.trim() !== '');
  const displayLicenseImages = licenseImages.filter(img => img && img.trim() !== '');
  
  // Use correct field name for profile photo from API
  const apiProfilePhotoUrl = partner.photo_url;

  return (
    <div className="bg-pink-50 min-h-screen pt-16 pb-24 px-2 sm:px-4">
      <PageHeader
        title="Delivery Partner Details"
        onBack={() => navigate(-1)}
        onRefresh={() => dispatch(fetchPartnerById(id))}
        isLoading={loading}
      />
      <main className="max-w-screen-md mx-auto space-y-4 sm:space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5 flex flex-col items-center relative">
          <div className="relative">
            <img 
              src={getImageUrl(apiProfilePhotoUrl) || 'https://ui-avatars.com/api/?name=DP'} 
              alt={partner.first_name} 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow" 
              onError={e => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=DP'; }} 
            />
            {partner.online_status === 'online' && (
              <span className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div className="mt-2 text-center">
            <div className="text-lg sm:text-xl font-bold">{partner.first_name} {partner.last_name}</div>
            <div className="text-gray-500 text-xs sm:text-sm">Age: {partner.age || '-'}</div>
            <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full mt-1 text-[10px] sm:text-xs font-semibold">
              <BadgeCheck size={12} className="sm:w-[14px] sm:h-[14px]" /> {partner.delivery_partner_id}
            </div>
          </div>
          <div className="flex gap-1.5 sm:gap-2 w-full mt-3 sm:mt-4">
            <button className="flex-1 bg-blue-600 text-white py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 font-bold shadow hover:bg-blue-700 text-xs sm:text-sm" onClick={() => window.open(`tel:${partner.phone1}`)}>
              <Phone size={14} className="sm:w-[18px] sm:h-[18px]" /> Call
            </button>
            <button className="flex-1 bg-red-500 text-white py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 font-bold shadow hover:bg-red-600 text-xs sm:text-sm">
              <Trash2 size={14} className="sm:w-[18px] sm:h-[18px]" /> Delete
            </button>
            <button className="flex-1 bg-blue-500 text-white py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 font-bold shadow hover:bg-blue-600 text-xs sm:text-sm" onClick={() => navigate(`/delivery-partners/${id}/edit`)}>
              <Edit2 size={14} className="sm:w-[18px] sm:h-[18px]" /> Edit
            </button>
          </div>
          <div className="w-full mt-3 sm:mt-4 bg-blue-50 rounded-lg flex items-center justify-center py-1.5 sm:py-2 font-semibold text-blue-700 gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Truck size={14} className="sm:w-[18px] sm:h-[18px]" /> Total Orders: {partner.order_count || 0}
          </div>
        </div>

        {/* Status Information Card */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
          <div className="font-bold mb-2 text-sm sm:text-base">Status Information</div>
          <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400 sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm">Current Status</span>
              <span className="ml-auto bg-blue-100 text-blue-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold">{partner.current_status}</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle size={12} className="text-gray-400 sm:w-[14px] sm:h-[14px]" />
              <span className="text-xs sm:text-sm">Online Status</span>
              <span className="ml-auto bg-green-100 text-green-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold">{partner.online_status}</span>
            </div>
            <div className="flex items-center gap-2">
              <BadgeCheck size={14} className="text-gray-400 sm:w-[16px] sm:h-[16px]" />
              <span className="text-xs sm:text-sm">License Number</span>
              <span className="ml-auto bg-blue-100 text-blue-700 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold">{partner.license_no}</span>
            </div>
          </div>
        </div>

        {/* Government ID Images */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
          <div className="font-bold mb-2 text-sm sm:text-base">Government ID Images</div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {displayGovtIdImages.length > 0 ? (
              displayGovtIdImages.map((img, i) => (
                <img 
                  key={i} 
                  src={getImageUrl(img)} 
                  alt={`Govt ID ${i+1}`} 
                  className="rounded-lg object-cover w-full h-24 sm:h-28" 
                  onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-400 py-6 sm:py-8">
                <IdCard size={40} className="mx-auto mb-2 text-gray-300 sm:w-12 sm:h-12" />
                <p className="text-xs sm:text-sm">No government ID images available</p>
              </div>
            )}
          </div>
        </div>

        {/* License Images */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
          <div className="font-bold mb-2 text-sm sm:text-base">License Images</div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {displayLicenseImages.length > 0 ? (
              displayLicenseImages.map((img, i) => (
                <img 
                  key={i} 
                  src={getImageUrl(img)} 
                  alt={`License ${i+1}`} 
                  className="rounded-lg object-cover w-full h-24 sm:h-28" 
                  onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                />
              ))
            ) : (
              <div className="col-span-2 text-center text-gray-400 py-6 sm:py-8">
                <IdCard size={40} className="mx-auto mb-2 text-gray-300 sm:w-12 sm:h-12" />
                <p className="text-xs sm:text-sm">No license images available</p>
              </div>
            )}
          </div>
        </div>

        {/* Bonus & Penalty Summary */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="font-bold text-sm sm:text-base">Bonus & Penalty Summary</div>
            <button className="bg-orange-400 text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg flex items-center gap-1 font-semibold hover:bg-orange-500 text-xs sm:text-sm">
              <RefreshCw size={14} className="sm:w-4 sm:h-4" /> Reset
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-2">
            <div className="bg-green-50 text-green-700 rounded-lg p-2 sm:p-3 text-center font-bold text-xs sm:text-sm">Bonus Points<br/>{partner.total_bonus || 0}</div>
            <div className="bg-red-50 text-red-700 rounded-lg p-2 sm:p-3 text-center font-bold text-xs sm:text-sm">Penalty Points<br/>{partner.total_penalty || 0}</div>
            </div>
        </div>
        
        {/* Powered by Codeteak */}
        <div className="flex flex-col items-center mt-8 sm:mt-12 mb-4">
          <span className="text-[10px] sm:text-xs text-blue-500 mb-1">Powered by</span>
          <img src="/assets/codeteak-logo.png" alt="Codeteak Logo" className="h-3 sm:h-4 object-contain mt-1 md:mt-2" />
        </div>
      </main>
    </div>
  );
}
