import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../api/apiClient';
import { useToast } from '../contexts/ToastContext';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const initial = useMemo(() => {
    const firstName = user?.firstName || '';
    const lastName = user?.lastName || '';
    const phone = user?.phone || '';
    const email = user?.email || '';

    return {
      firstName,
      lastName,
      phone,
      email
    };
  }, [user]);

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.firstName || form.firstName.trim().length < 2) {
      next.firstName = 'First name must be at least 2 characters';
    }
    if (!form.lastName || form.lastName.trim().length < 2) {
      next.lastName = 'Last name must be at least 2 characters';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isSaving) return;

    if (!validate()) {
      showError('Validation Error', 'Please fix the highlighted fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim()
      };

      const res = await apiClient.patch('/users/profile', payload);
      const updatedUser = res?.data?.data?.user;

      if (!updatedUser) {
        throw new Error('Profile updated, but user data was not returned');
      }

      setUser(updatedUser);
      showSuccess('Profile Updated', 'Your profile details have been saved');
      navigate(-1);
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to update profile';
      showError('Update Failed', message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full bg-gray-50">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-grub-red to-red-600 px-5 py-4 text-white sm:px-6 sm:py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold sm:text-xl">Edit Profile</h1>
                <p className="mt-1 truncate text-xs text-white/80 sm:text-sm">Update your personal details</p>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Back
              </button>
            </div>
          </div>

          <form onSubmit={onSubmit} className="px-5 py-5 sm:px-6 sm:py-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-grub-red/50 ${
                    errors.firstName ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter first name"
                />
                {errors.firstName && <p className="mt-1 text-xs font-medium text-red-600">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-grub-red/50 ${
                    errors.lastName ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter last name"
                />
                {errors.lastName && <p className="mt-1 text-xs font-medium text-red-600">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  value={form.email}
                  readOnly
                  disabled
                  className="mt-1 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                />
                <p className="mt-1 text-xs text-gray-500">Email can’t be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  readOnly
                  disabled
                  className="mt-1 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600"
                />
                <p className="mt-1 text-xs text-gray-500">Phone can’t be changed</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-60 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-lg bg-grub-red px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-grub-red disabled:opacity-60 sm:w-auto"
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
