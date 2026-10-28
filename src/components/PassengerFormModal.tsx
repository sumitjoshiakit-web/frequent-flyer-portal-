import React, { useState, useEffect, useRef } from 'react';
import { X, Save } from 'lucide-react';
import { Passenger, PassengerFormData, PassengerValidationErrors } from '../types/passenger';
import { validatePassengerForm } from '../services/validation';

export interface PassengerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PassengerFormData) => Promise<void> | void;
  initialData?: Passenger | null;
  existingMembershipNumbers?: string[];
  isLoading?: boolean;
}

export const PassengerFormModal: React.FC<PassengerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingMembershipNumbers = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PassengerFormData>({
    fullName: '',
    email: '',
    membershipNumber: '',
    tier: 'Bronze',
    points: 0,
    status: 'Active',
  });

  const [errors, setErrors] = useState<PassengerValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Sync initialData on open
  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName,
        email: initialData.email,
        membershipNumber: initialData.membershipNumber,
        tier: initialData.tier,
        points: initialData.points,
        status: initialData.status,
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        membershipNumber: '',
        tier: 'Bronze',
        points: 0,
        status: 'Active',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value,
    }));

    // Clear specific field error on change
    if (errors[name as keyof PassengerValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    const currentNumber = initialData?.membershipNumber;
    const validation = validatePassengerForm(
      formData,
      existingMembershipNumbers,
      currentNumber
    );

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = Boolean(initialData);
  const titleId = 'passenger-form-dialog-title';

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg bg-white rounded-lg shadow-xl border border-neutral-200 overflow-hidden transform transition-all"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50">
          <h2 id={titleId} className="text-base font-semibold text-neutral-900">
            {isEditing ? 'Edit Frequent Flyer Passenger' : 'Add Frequent Flyer Passenger'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-neutral-800 mb-1"
            >
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={firstInputRef}
              id="fullName"
              name="fullName"
              type="text"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Captain Jean-Luc Picard"
              className={`w-full px-3 py-2 text-sm bg-white border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.fullName
                  ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50/20'
                  : 'border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:border-neutral-900'
              }`}
            />
            {errors.fullName && (
              <p id="fullName-error" role="alert" className="mt-1 text-xs text-red-600 font-medium">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-800 mb-1"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. picard@starfleet.org"
              className={`w-full px-3 py-2 text-sm bg-white border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.email
                  ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50/20'
                  : 'border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:border-neutral-900'
              }`}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-xs text-red-600 font-medium">
                {errors.email}
              </p>
            )}
          </div>

          {/* Membership Number */}
          <div>
            <label
              htmlFor="membershipNumber"
              className="block text-sm font-medium text-neutral-800 mb-1"
            >
              Membership Number <span className="text-red-500">*</span>
            </label>
            <input
              id="membershipNumber"
              name="membershipNumber"
              type="text"
              required
              aria-required="true"
              aria-invalid={Boolean(errors.membershipNumber)}
              aria-describedby={errors.membershipNumber ? 'membershipNumber-error' : undefined}
              value={formData.membershipNumber}
              onChange={handleChange}
              placeholder="e.g. FF-100234"
              className={`w-full px-3 py-2 text-sm font-mono bg-white border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.membershipNumber
                  ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50/20'
                  : 'border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:border-neutral-900'
              }`}
            />
            {errors.membershipNumber && (
              <p id="membershipNumber-error" role="alert" className="mt-1 text-xs text-red-600 font-medium">
                {errors.membershipNumber}
              </p>
            )}
          </div>

          {/* Tier & Points Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tier */}
            <div>
              <label
                htmlFor="tier"
                className="block text-sm font-medium text-neutral-800 mb-1"
              >
                Frequent Flyer Tier <span className="text-red-500">*</span>
              </label>
              <select
                id="tier"
                name="tier"
                value={formData.tier}
                onChange={handleChange}
                aria-invalid={Boolean(errors.tier)}
                aria-describedby={errors.tier ? 'tier-error' : undefined}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 ${
                  errors.tier
                    ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
                    : 'border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:border-neutral-900'
                }`}
              >
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
                <option value="Platinum">Platinum</option>
              </select>
              {errors.tier && (
                <p id="tier-error" role="alert" className="mt-1 text-xs text-red-600 font-medium">
                  {errors.tier}
                </p>
              )}
            </div>

            {/* Points */}
            <div>
              <label
                htmlFor="points"
                className="block text-sm font-medium text-neutral-800 mb-1"
              >
                Accumulated Points <span className="text-red-500">*</span>
              </label>
              <input
                id="points"
                name="points"
                type="number"
                min="0"
                step="1"
                required
                aria-required="true"
                aria-invalid={Boolean(errors.points)}
                aria-describedby={errors.points ? 'points-error' : undefined}
                value={formData.points}
                onChange={handleChange}
                className={`w-full px-3 py-2 text-sm font-mono bg-white border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 ${
                  errors.points
                    ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500 bg-red-50/20'
                    : 'border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:border-neutral-900'
                }`}
              />
              {errors.points && (
                <p id="points-error" role="alert" className="mt-1 text-xs text-red-600 font-medium">
                  {errors.points}
                </p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-neutral-800 mb-1"
            >
              Account Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              aria-invalid={Boolean(errors.status)}
              aria-describedby={errors.status ? 'status-error' : undefined}
              className={`w-full px-3 py-2 text-sm bg-white border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 ${
                errors.status
                  ? 'border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
                  : 'border-neutral-300 text-neutral-900 focus:ring-neutral-900 focus:border-neutral-900'
              }`}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            {errors.status && (
              <p id="status-error" role="alert" className="mt-1 text-xs text-red-600 font-medium">
                {errors.status}
              </p>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isLoading}
              className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 disabled:opacity-50"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>{isSubmitting || isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Passenger'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
