import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Heart,
  AlertTriangle,
  Phone,
  ShieldCheck,
  MapPin,
  Stethoscope,
  Plus,
  Trash2,
  Save,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

export const ProfilePage = ({ onOpenCareCircle }) => {
  const { user, selectedElderlyId, refreshUser } = useAuth();
  const targetId = user?.role === 'elderly' ? user.id : selectedElderlyId;

  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bloodGroup: 'O+',
    gender: 'female',
    dateOfBirth: '1949-04-18',
    allergies: [],
    medicalConditions: [],
    emergencyContacts: [],
    primaryPhysician: { name: '', phone: '', clinic: '', email: '' },
    address: { street: '', city: '', state: '', zip: '' },
    notes: ''
  });

  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProfile = async () => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.getProfile(targetId);
      if (res.success && res.profile) {
        setProfile(res.profile);
        setFormData({
          name: res.profile.userId?.name || '',
          phone: res.profile.userId?.phone || '',
          bloodGroup: res.profile.bloodGroup || 'O+',
          gender: res.profile.gender || 'female',
          dateOfBirth: res.profile.dateOfBirth ? res.profile.dateOfBirth.split('T')[0] : '1949-04-18',
          allergies: res.profile.allergies || [],
          medicalConditions: res.profile.medicalConditions || [],
          emergencyContacts: res.profile.emergencyContacts || [],
          primaryPhysician: res.profile.primaryPhysician || { name: '', phone: '', clinic: '', email: '' },
          address: res.profile.address || { street: '', city: '', state: '', zip: '' },
          notes: res.profile.notes || ''
        });
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  const handleAddAllergy = () => {
    if (!newAllergy.trim()) return;
    setFormData((prev) => ({
      ...prev,
      allergies: [...prev.allergies, newAllergy.trim()]
    }));
    setNewAllergy('');
  };

  const handleRemoveAllergy = (index) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    setFormData((prev) => ({
      ...prev,
      medicalConditions: [...prev.medicalConditions, newCondition.trim()]
    }));
    setNewCondition('');
  };

  const handleRemoveCondition = (index) => {
    setFormData((prev) => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter((_, i) => i !== index)
    }));
  };

  const handleAddEmergencyContact = () => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: [
        ...prev.emergencyContacts,
        { name: '', relationship: 'Family', phone: '', isPrimary: false }
      ]
    }));
  };

  const handleUpdateContact = (index, field, value) => {
    const updated = [...formData.emergencyContacts];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, emergencyContacts: updated }));
  };

  const handleRemoveContact = (index) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      await api.updateProfile(targetId, formData);
      setSuccessMsg('Healthcare profile updated successfully!');
      await fetchProfile();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(`Error saving profile: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <User className="w-12 h-12 text-brand-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <User className="w-8 h-8 text-brand-600" />
            Healthcare Profile Management
          </h1>
          <p className="text-sm text-slate-600 font-medium mt-1">
            Emergency contacts, medical alerts, allergies & primary physician records
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === 'elderly' && (
            <button
              type="button"
              onClick={onOpenCareCircle}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Manage Care Circle
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Personal Information */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-brand-600" />
            Personal & Identification Info
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Blood Group (Emergency ID)
              </label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-sm text-slate-800"
              >
                <option value="O+">O Positive (O+)</option>
                <option value="O-">O Negative (O-)</option>
                <option value="A+">A Positive (A+)</option>
                <option value="A-">A Negative (A-)</option>
                <option value="B+">B Positive (B+)</option>
                <option value="B-">B Negative (B-)</option>
                <option value="AB+">AB Positive (AB+)</option>
                <option value="AB-">AB Negative (AB-)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chronic Conditions & Allergies */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Allergies */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Known Medical Allergies
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="e.g. Penicillin, Peanuts"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
              />
              <button
                type="button"
                onClick={handleAddAllergy}
                className="px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {formData.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold text-xs flex items-center gap-1.5"
                >
                  {allergy}
                  <button type="button" onClick={() => handleRemoveAllergy(i)} className="text-red-500 hover:text-red-700">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-blue-500" />
              Chronic Medical Conditions
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                placeholder="e.g. Hypertension, Type 2 Diabetes"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
              />
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {formData.medicalConditions.map((cond, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center gap-1.5"
                >
                  {cond}
                  <button type="button" onClick={() => handleRemoveCondition(i)} className="text-blue-500 hover:text-blue-700">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-rose-600" />
              Emergency Contacts
            </h3>
            <button
              type="button"
              onClick={handleAddEmergencyContact}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Contact
            </button>
          </div>

          <div className="space-y-3">
            {formData.emergencyContacts.map((contact, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Contact Name"
                  required
                  value={contact.name}
                  onChange={(e) => handleUpdateContact(index, 'name', e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="Relationship (Son, Daughter, Nurse)"
                  value={contact.relationship}
                  onChange={(e) => handleUpdateContact(index, 'relationship', e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  required
                  value={contact.phone}
                  onChange={(e) => handleUpdateContact(index, 'phone', e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold"
                />
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={contact.isPrimary}
                      onChange={(e) => handleUpdateContact(index, 'isPrimary', e.target.checked)}
                      className="rounded"
                    />
                    Primary
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(index)}
                    className="p-1.5 text-slate-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Primary Physician & Home Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-brand-600" />
              Primary Physician
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Doctor Full Name"
                value={formData.primaryPhysician.name}
                onChange={(e) => setFormData({ ...formData, primaryPhysician: { ...formData.primaryPhysician, name: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold"
              />
              <input
                type="text"
                placeholder="Clinic Name & Address"
                value={formData.primaryPhysician.clinic}
                onChange={(e) => setFormData({ ...formData, primaryPhysician: { ...formData.primaryPhysician, clinic: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium"
              />
              <input
                type="tel"
                placeholder="Doctor Office Phone"
                value={formData.primaryPhysician.phone}
                onChange={(e) => setFormData({ ...formData, primaryPhysician: { ...formData.primaryPhysician, phone: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Home Address (For Paramedics/SOS)
            </h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Street Address & Apt Number"
                value={formData.address.street}
                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-medium"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                  className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                  className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium"
                />
                <input
                  type="text"
                  placeholder="Zip"
                  value={formData.address.zip}
                  onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zip: e.target.value } })}
                  className="bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Records...' : 'Save Healthcare Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
