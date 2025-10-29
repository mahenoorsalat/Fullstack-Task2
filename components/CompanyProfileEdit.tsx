import React, { useState, ChangeEvent } from 'react';
import { Company } from '../types';

interface CompanyProfileEditProps {
  company: Company;
  onSave: (updatedCompany: Company) => void;
  onCancel: () => void;
}

const CompanyProfileEdit: React.FC<CompanyProfileEditProps> = ({ company, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Company>(company);
    const [logoPreview, setLogoPreview] = useState<string | null>(company.logo);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (name === 'logo') {
                    const result = reader.result as string;
                    setLogoPreview(result);
                    setFormData(prev => ({ ...prev, logo: result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-6">
                <img src={logoPreview || 'https://via.placeholder.com/100'} alt="Company Logo" className="h-24 w-24 rounded-full object-cover border-4 border-secondary" />
                <div>
                    <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        <span>Change Logo</span>
                        <input id="logo-upload" name="logo" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    </label>
                </div>
            </div>

            <div className="space-y-4">
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Company Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"></textarea>
                </div>
                 <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                    <input type="text" name="website" id="website" value={formData.website} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Contact Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">Phone Number / Contact Info</label>
                    <input type="text" name="contactInfo" id="contactInfo" value={formData.contactInfo} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="officeAddress" className="block text-sm font-medium text-gray-700">Office Address</label>
                    <textarea name="officeAddress" id="officeAddress" value={formData.officeAddress} onChange={handleChange} rows={2} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"></textarea>
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Cancel
                </button>
                <button type="submit" className="bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-md transition-colors">
                    Save Changes
                </button>
            </div>
        </form>
    );
};

export default CompanyProfileEdit;