import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { generatePartnerId, createPartner } from "@/store/slices/deliveryPartnerSlice";
import { toast } from "react-toastify";
import { User, Mail, Phone, Calendar, Eye, EyeOff, Camera, ArrowLeft, RefreshCw, IdCard } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const ageOptions = Array.from({ length: 43 }, (_, i) => 18 + i);

export default function CreateDeliveryPartner() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const shopId = useSelector((state) => state.auth.user?.shopId);
  // Debug: Log shopId and generatedId
  console.log('shopId:', shopId);
  const { generatedId, loading, error, created } = useSelector((state) => state.deliveryPartners);
  console.log('generatedId:', generatedId, 'loading:', loading, 'error:', error);

  // Stepper state
  const [step, setStep] = useState(1);

  // Basic Info
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [basicInfo, setBasicInfo] = useState({
    first_name: "",
    last_name: "",
    age: "",
    phone1: "",
    phone2: "",
    email: "",
    address: "",
  });
  const [basicTouched, setBasicTouched] = useState({});

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

  useEffect(() => {
    if (shopId) {
      console.log('Dispatching generatePartnerId with shopId:', shopId);
      dispatch(generatePartnerId(shopId));
    } else {
      console.warn('No shopId found, not dispatching generatePartnerId');
    }
  }, [dispatch, shopId]);

  useEffect(() => {
    if (generatedId) {
      setPartnerId(generatedId);
    }
  }, [generatedId]);
  
  useEffect(() => {
      if (created) {
          toast.success("Delivery partner created successfully!");
          navigate("/delivery-partners");
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
    setBasicTouched((prev) => ({ ...prev, [name]: true }));
  };
  const handleProfilePhoto = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
    setProfilePhotoUrl(file ? URL.createObjectURL(file) : "");
  };
  const handleNext = (e) => {
    e.preventDefault();
    if (isBasicInfoValid) setStep(2);
    else toast.error("Please fill all required fields and upload a profile photo.");
  };
  const handleBack = () => setStep(1);
  const handleGenerateId = () => {
    if (shopId) {
      console.log('Manually generating partner ID with shopId:', shopId);
      dispatch(generatePartnerId(shopId));
    } else {
      console.warn('No shopId found for manual ID generation');
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
    data.append("phone2", basicInfo.phone2);
    data.append("email", basicInfo.email);
    data.append("address", basicInfo.address);
    data.append("photo", profilePhoto);
    data.append("license_no", licenseNo);
    data.append("license_image", JSON.stringify([dlFront, dlBack]));
    data.append("govt_id_image", JSON.stringify([aadhaarFront, aadhaarBack]));
    data.append("password", password);
    data.append("delivery_partner_id", partnerId);
    data.append("shop_id", shopId);
    dispatch(createPartner(data));
  };

  return (
    <div className="max-w-screen-md mx-auto px-4 pt-16 pb-24">
      <PageHeader title="Add Partner" onBack={() => (step === 1 ? navigate(-1) : handleBack())} />
      {/* Stepper */}
      <div className="flex items-center justify-center gap-8 mb-6">
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
          <span className={`text-xs mt-1 ${step === 1 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>Basic Info</span>
        </div>
        <div className="flex-1 h-1 bg-gray-200 rounded mx-2" style={{ maxWidth: 60 }}>
          <div className={`h-1 rounded bg-blue-500 transition-all duration-300`} style={{ width: step === 2 ? '100%' : '50%' }} />
        </div>
        <div className="flex flex-col items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === 2 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
          <span className={`text-xs mt-1 ${step === 2 ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>Documents</span>
        </div>
      </div>
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center mb-2">
            <label htmlFor="profilePhoto" className="relative cursor-pointer">
              <img
                src={profilePhotoUrl || 'https://ui-avatars.com/api/?name=DP'}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 shadow"
              />
              <span className="absolute bottom-2 right-2 bg-white p-1 rounded-full border shadow">
                <Camera size={20} className="text-gray-500" />
              </span>
              <input
                type="file"
                id="profilePhoto"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePhoto}
              />
            </label>
            {!profilePhoto && <div className="text-xs text-red-500 mt-2">Profile photo is required</div>}
          </div>
          {/* Input Fields */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={basicInfo.first_name}
              onChange={handleBasicChange}
              className="pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={basicInfo.last_name}
              onChange={handleBasicChange}
              className="pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
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
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="tel"
              name="phone1"
              placeholder="Phone Number"
              value={basicInfo.phone1}
              onChange={handleBasicChange}
              className="pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
              maxLength={10}
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="tel"
              name="phone2"
              placeholder="Secondary Phone Number (Optional)"
              value={basicInfo.phone2}
              onChange={handleBasicChange}
              className="pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
              maxLength={10}
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={basicInfo.email}
              onChange={handleBasicChange}
              className="pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9.75V19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9.75M12 3v10.25"/><path d="M12 3l7 6.75M12 3L5 9.75"/></svg>
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
          <button
            type="submit"
            className={`w-full py-2 rounded-full font-bold text-white ${isBasicInfoValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-200 cursor-not-allowed'}`}
            disabled={!isBasicInfoValid}
          >
            Next
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700">License Number</label>
            <div className="relative">
              <IdCard className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                value={licenseNo}
                onChange={e => setLicenseNo(e.target.value)}
                placeholder="License Number"
                className="pl-10 pr-3 py-2 rounded-md border w-full shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          {/* Driving License Uploads */}
        <div>
            <div className="font-semibold mb-1">Driving License (DL)</div>
            <div className="grid grid-cols-2 gap-3">
              {[dlFront, dlBack].map((img, i) => (
                <label key={i} className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-28 cursor-pointer bg-gray-50">
                  {img ? (
                    <img src={URL.createObjectURL(img)} alt={`DL ${i === 0 ? 'Front' : 'Back'}`} className="object-cover w-full h-full rounded-lg" />
                  ) : (
                    <>
                      <Camera size={28} className="text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">{i === 0 ? 'Front' : 'Back'}</span>
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
            <div className="font-semibold mb-1">Aadhaar Card (Optional)</div>
            <div className="grid grid-cols-2 gap-3">
              {[aadhaarFront, aadhaarBack].map((img, i) => (
                <label key={i} className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-28 cursor-pointer bg-gray-50">
                  {img ? (
                    <img src={URL.createObjectURL(img)} alt={`Aadhaar ${i === 0 ? 'Front' : 'Back'}`} className="object-cover w-full h-full rounded-lg" />
                  ) : (
                    <>
                      <Camera size={28} className="text-gray-400 mb-1" />
                      <span className="text-xs text-gray-400">{i === 0 ? 'Front' : 'Back'}</span>
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
            <button type="button" onClick={handleGenerateId} className="bg-blue-100 text-blue-600 px-3 py-2 rounded-md flex items-center gap-1 font-semibold">
              <RefreshCw size={18} /> Generate ID
            </button>
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-full font-bold text-white ${isDocumentsValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-200 cursor-not-allowed'}`}
            disabled={!isDocumentsValid}
          >
            Submit
          </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
      )}
      
      {/* Powered by Codeteak */}
      <div className="flex flex-col items-center mt-12 mb-4">
        <span className="text-xs text-blue-500 mb-1">Powered by</span>
        <img src="/assets/codeteak-logo.png" alt="Codeteak Logo" className="h-4 object-contain mt-1 md:mt-2" />
      </div>
    </div>
  );
} 