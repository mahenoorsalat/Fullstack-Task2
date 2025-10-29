import React, { useState, ChangeEvent } from 'react';
import { JobSeeker } from '../types';
import { ArrowUpTrayIcon } from './icons';

interface JobSeekerProfileEditProps {
  seeker: JobSeeker;
  onSave: (updatedSeeker: JobSeeker) => void;
  onCancel: () => void;
}

const JobSeekerProfileEdit: React.FC<JobSeekerProfileEditProps> = ({ seeker, onSave, onCancel }) => {
    const [formData, setFormData] = useState<JobSeeker>(seeker);
    const [photoPreview, setPhotoPreview] = useState<string | null>(seeker.photoUrl);
    const [resumeFileName, setResumeFileName] = useState<string | null>(null);

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
                if (name === 'photoUrl') {
                    setPhotoPreview(reader.result as string);
                    setFormData(prev => ({ ...prev, photoUrl: reader.result as string }));
                } else if (name === 'resumeUrl') {
                    setResumeFileName(file.name);
                    // In a real app, you'd upload this and get a URL. We'll store the data URL for simulation.
                    setFormData(prev => ({ ...prev, resumeUrl: reader.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSkillsChange = (e: ChangeEvent<HTMLInputElement>) => {
        const skills = e.target.value.split(',').map(skill => skill.trim());
        setFormData(prev => ({ ...prev, skills }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-6">
                <img src={photoPreview || 'https://via.placeholder.com/100'} alt="Profile" className="h-24 w-24 rounded-full object-cover border-4 border-primary" />
                <div>
                    <label htmlFor="photo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                        <span>Change Photo</span>
                        <input id="photo-upload" name="photoUrl" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                    <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div>
                    <label htmlFor="expectedSalary" className="block text-sm font-medium text-gray-700">Expected Salary ($)</label>
                    <input type="number" name="expectedSalary" id="expectedSalary" value={formData.expectedSalary} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
                 <div className="md:col-span-2">
                    <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                    <input type="text" name="skills" id="skills" value={(formData.skills || []).join(', ')} onChange={handleSkillsChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm" />
                </div>
            </div>

             <div>
                <label className="block text-sm font-medium text-gray-700">Resume (PDF)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="resume-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-focus focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                                <span>Upload a file</span>
                                <input id="resume-upload" name="resumeUrl" type="file" accept=".pdf" className="sr-only" onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF up to 10MB</p>
                        {resumeFileName && <p className="text-sm font-semibold text-green-600 mt-2">{resumeFileName}</p>}
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-4">
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

export default JobSeekerProfileEdit;