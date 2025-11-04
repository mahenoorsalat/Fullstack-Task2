import React, { useState } from 'react';
import { Job, Company } from '../types';
import { BriefcaseIcon, CurrencyDollarIcon, MapPinIcon } from './icons';

interface JobDetailsProps {
  job: Job;
  company: Company;
  onApply: (jobId: string) => Promise<void>;
  isApplied: boolean;
  userRole: 'seeker' | 'company' | 'admin';
  onLeaveReview: (companyId: string) => void;
  // NEW PROP: To display the application status
  applicationStatus: string | undefined;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, company, onApply, isApplied, userRole, onLeaveReview, applicationStatus }) => {
    const [isApplying, setIsApplying] = useState(false);

    // Helper function to determine the color/badge for status
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Shortlisted': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
            case 'Interviewed': return 'bg-indigo-100 text-indigo-800 border-indigo-500';
            case 'Hired': return 'bg-green-100 text-green-800 border-green-500';
            case 'Rejected': return 'bg-red-100 text-red-800 border-red-500';
            case 'Applied': 
            default: return 'bg-blue-100 text-blue-800 border-blue-500';
        }
    }

    const getCompanyLogoUrl = (company: Company) => {
        return company.logo 
            || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name || 'Company')}&background=4F46E5&color=fff&size=80`;
    };
    
    const handleApply = async () => {
        if (isApplied || isApplying) return;

        setIsApplying(true);
        try {
            await onApply(job.id);

        } catch (error) {
            console.error("Job application failed:", error);
        } finally {
            setIsApplying(false);
        }
    };
    
  return (
    <div className="space-y-6">
      <div className="flex items-start">
        <img 
          src={getCompanyLogoUrl(company)} 
          alt={`${company.name} logo`} 
          className="h-20 w-20 rounded-lg mr-6 object-cover border" 
        />
        <div>
          <h2 className="text-3xl font-bold text-neutral">{job.title}</h2>
          <p className="text-xl text-primary font-semibold">{company.name}</p>
          {/* NEW: Display Application Status in Details Modal */}
          {applicationStatus && (
            <div className={`mt-2 inline-flex items-center rounded-lg border-2 px-4 py-1 text-sm font-semibold ${getStatusBadge(applicationStatus)}`}>
              Application Status: {applicationStatus}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
          <MapPinIcon className="h-6 w-6 mr-3 text-secondary" />
          <div>
            <p className="font-semibold">Location</p>
            <p>{job.location} ({job.locationType})</p>
          </div>
        </div>
        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
          <CurrencyDollarIcon className="h-6 w-6 mr-3 text-secondary" />
           <div>
            <p className="font-semibold">Salary</p>
            <p>${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center bg-gray-50 p-3 rounded-lg">
          <BriefcaseIcon className="h-6 w-6 mr-3 text-secondary" />
            <div>
            <p className="font-semibold">Experience</p>
            <p>{job.experienceLevel}</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-neutral mb-2">Job Description</h3>
        <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
      </div>

       <div className="border-t pt-6 flex justify-between items-center">
         {userRole === 'seeker' && (
            <button 
                onClick={() => onLeaveReview(company.id)}
                className="text-secondary font-semibold hover:underline"
            >
                Leave a Review
            </button>
         )}
         <div className={userRole !== 'seeker' ? 'w-full text-right' : ''}>
            <button
            onClick={handleApply}
            disabled={isApplied || isApplying}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
                isApplied || isApplying
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
            }`}
            >
            {isApplied ? 'Already Applied' : isApplying ? 'Applying...' : 'Apply Now'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default JobDetails;