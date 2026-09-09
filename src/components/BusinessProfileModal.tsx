import React, { useState, useEffect, useRef } from 'react';
import { Building2, X, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { BusinessProfile, STORAGE_PROFILE_KEY, DEFAULT_BUSINESS_PROFILE } from '../types';

interface BusinessProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: BusinessProfile) => void;
}

export default function BusinessProfileModal({
  isOpen,
  onClose,
  onSave,
}: BusinessProfileModalProps) {
  const [profile, setProfile] = useState<BusinessProfile>(DEFAULT_BUSINESS_PROFILE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing profile from localStorage whenever modal opens
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(STORAGE_PROFILE_KEY);
        if (saved) {
          setProfile(JSON.parse(saved));
        } else {
          setProfile(DEFAULT_BUSINESS_PROFILE);
        }
      } catch (e) {
        console.error('Failed to load profile defaults:', e);
        setProfile(DEFAULT_BUSINESS_PROFILE);
      }
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (
    field: keyof BusinessProfile,
    value: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Support PNG, JPEG, WEBP
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile((prev) => ({ ...prev, logo: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so same file can be re-selected if needed
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    setProfile((prev) => ({ ...prev, logo: '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    } catch (err) {
      console.error('Failed to save profile defaults:', err);
    }
    onSave(profile);
    onClose();
  };

  return (
    <div
      className="profile-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-profile-modal-title"
    >
      <div
        className="profile-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="profile-modal-header">
          <div className="profile-modal-title-group">
            <div className="profile-modal-icon-badge" aria-hidden="true">
              <Building2 size={22} />
            </div>
            <div>
              <h2 id="business-profile-modal-title" className="profile-modal-title">
                Business Profile Defaults
              </h2>
              <p className="profile-modal-subtitle">
                Auto-fills when creating new bills and invoices
              </p>
            </div>
          </div>

          <button
            type="button"
            className="profile-modal-close-btn"
            onClick={onClose}
            aria-label="Close Business Profile Modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="profile-modal-form">
          {/* Business Logo Field */}
          <div className="profile-form-group">
            <label className="profile-form-label">Business Logo</label>
            <div className="profile-logo-row">
              <div className="profile-logo-box">
                {profile.logo ? (
                  <img
                    src={profile.logo}
                    alt="Company logo preview"
                    className="profile-logo-img"
                  />
                ) : (
                  <ImageIcon size={22} className="profile-logo-placeholder-icon" />
                )}
              </div>

              <div className="profile-logo-actions">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="profile-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} />
                  <span>Upload</span>
                </button>

                {profile.logo && (
                  <button
                    type="button"
                    className="profile-remove-logo-btn"
                    onClick={handleRemoveLogo}
                    title="Remove Logo"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
            <span className="profile-logo-helper">
              PNG or JPG, appears on your bills &amp; invoices
            </span>
          </div>

          {/* Business / Company Name */}
          <div className="profile-form-group">
            <label htmlFor="prof-company-name" className="profile-form-label">
              Business / Company Name
            </label>
            <input
              id="prof-company-name"
              type="text"
              className="profile-form-input"
              placeholder="e.g. Apex Corporate Solutions"
              value={profile.companyName}
              onChange={(e) => handleInputChange('companyName', e.target.value)}
            />
          </div>

          {/* Email and Phone 2-Column */}
          <div className="profile-two-col">
            <div className="profile-form-group">
              <label htmlFor="prof-email" className="profile-form-label">
                Email
              </label>
              <input
                id="prof-email"
                type="email"
                className="profile-form-input"
                placeholder="billing@company.com"
                value={profile.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="prof-phone" className="profile-form-label">
                Phone
              </label>
              <input
                id="prof-phone"
                type="text"
                className="profile-form-input"
                placeholder="+91 98765 43210"
                value={profile.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          {/* Business Address */}
          <div className="profile-form-group">
            <label htmlFor="prof-address" className="profile-form-label">
              Business Address
            </label>
            <textarea
              id="prof-address"
              className="profile-form-textarea"
              rows={2}
              placeholder="101 Cyber Towers, Mumbai 400051"
              value={profile.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>

          {/* GST / PAN Number & Bank / UPI ID 2-Column */}
          <div className="profile-two-col">
            <div className="profile-form-group">
              <label htmlFor="prof-gst" className="profile-form-label">
                GST / PAN Number
              </label>
              <input
                id="prof-gst"
                type="text"
                className="profile-form-input"
                placeholder="27AAAAA0000A1Z5"
                value={profile.gstPanNumber}
                onChange={(e) => handleInputChange('gstPanNumber', e.target.value)}
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="prof-bank-upi" className="profile-form-label">
                Bank / UPI ID
              </label>
              <input
                id="prof-bank-upi"
                type="text"
                className="profile-form-input"
                placeholder="UPI: company@upi"
                value={profile.bankUpiId}
                onChange={(e) => handleInputChange('bankUpiId', e.target.value)}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="profile-modal-footer">
            <button
              type="button"
              className="profile-btn-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="profile-btn-save"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
