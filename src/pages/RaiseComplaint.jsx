import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createComplaint } from '../services/complaints';
import { ArrowLeft, Upload, FileImage, X, Check } from 'lucide-react';

export const RaiseComplaint = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    category: 'Water Leakage',
    description: '',
  });
  
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const categories = [
    'Water Leakage',
    'Electricity',
    'Lift',
    'Parking',
    'Security',
    'Garbage',
    'Cleaning',
    'Others',
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, photo: 'Only image files are allowed.' });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, photo: 'Image size should not exceed 5MB.' });
        return;
      }

      setPhotoFile(file);
      setErrors({ ...errors, photo: '' });

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.description.trim()) {
      tempErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      tempErrors.description = 'Description must be at least 20 characters long';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      await createComplaint({
        residentId: user.id,
        category: formData.category,
        description: formData.description,
        photoFile,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/resident/complaints');
      }, 2000);
    } catch (err) {
      console.error(err);
      setErrors({ api: err.message || 'Failed to submit complaint. Please try again.' });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button and page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 active:scale-95 transition-all-300"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Raise a Complaint</h1>
          <p className="text-xs text-slate-400">File a ticket for resolution by the society management</p>
        </div>
      </div>

      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 flex items-center gap-2.5 animate-fade-in shadow-xs">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white font-bold">
            <Check className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold text-sm">Complaint Registered Successfully!</p>
            <p className="text-xs text-emerald-700/80">Redirecting to your complaints dashboard...</p>
          </div>
        </div>
      )}

      {errors.api && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-800 text-sm animate-fade-in">
          {errors.api}
        </div>
      )}

      {/* Main card form */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Complaint Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="block w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Detailed Description (min 20 characters)
            </label>
            <textarea
              name="description"
              rows={5}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the issue in detail, specifying the location or urgency..."
              className={`block w-full rounded-lg border py-2.5 px-3 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 transition-all duration-200 ${
                errors.description
                  ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/10'
                  : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
              }`}
            />
            {errors.description && (
              <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.description}</p>
            )}
            <p className="mt-1.5 text-[11px] text-slate-400 text-right">
              {formData.description.trim().length} / 20 characters minimum
            </p>
          </div>

          {/* Image Upload Block */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Optional Photo Upload
            </label>

            {photoPreview ? (
              /* Photo Preview Overlay card */
              <div className="relative rounded-lg border border-slate-200 overflow-hidden bg-slate-50 p-2">
                <img
                  src={photoPreview}
                  alt="Preview upload"
                  className="aspect-video w-full rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/60 text-white hover:bg-slate-900/80 active:scale-90 transition-all"
                  title="Remove Image"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              /* Custom File Upload Container */
              <div className="flex justify-center rounded-lg border-2 border-dashed border-slate-300/80 px-6 py-8 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200">
                <div className="text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm border border-slate-200/50">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="mt-4 flex text-sm text-slate-600 justify-center">
                    <label className="relative cursor-pointer rounded-md font-semibold text-primary-600 hover:text-primary-700 focus-within:outline-hidden">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
                </div>
              </div>
            )}
            {errors.photo && <p className="mt-1.5 text-xs text-rose-600 font-medium">{errors.photo}</p>}
          </div>

          {/* Submit Action */}
          <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="flex items-center justify-center rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white shadow-md shadow-primary-500/20 hover:bg-primary-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
            >
              {loading ? 'Submitting Ticket...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RaiseComplaint;
