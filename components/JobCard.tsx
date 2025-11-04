import React from 'react';
import { Job, Company } from '../types';
import { MapPinIcon, CurrencyDollarIcon, UsersIcon } from './icons';

interface JobCardProps {
  job: Job;
  company: Company;
  isApplied: boolean;
  onViewDetails: (jobId: string) => void;
  onApply: (jobId: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, company, isApplied, onViewDetails, onApply }) => {
  const applicantsCount = job.applicants?.length ?? 0;

  // FIX: Add a robust function for logo URL with a name-based avatar fallback
  const getCompanyLogoUrl = (company: Company) => {
      return company.logo 
          || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name || 'Company')}&background=4F46E5&color=fff&size=48`;
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <img 
            // FIX: Use the robust helper function for the src
            src={getCompanyLogoUrl(company)} 
            alt={company.name} 
            className="h-12 w-12 rounded-full mr-4 object-cover border border-gray-200"
            // REMOVED: The generic onError handler is no longer needed
          />
          <div>
            <h3 className="text-xl font-bold text-neutral truncate">{job.title}</h3>
            <p className="text-sm text-primary font-medium">{company.name}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{job.jobType}</p>
        </div>
      </div>

      <div className="mt-4 text-sm space-y-2 text-gray-600">
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center">
          <CurrencyDollarIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / year</span>
        </div>
        <div className="flex items-center">
          <UsersIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span>{applicantsCount} applicants</span>
        </div>
        <p className="text-xs font-semibold text-gray-700">Experience: {job.experienceLevel}</p>
      </div>

      <div className="mt-6 flex justify-between space-x-3">
        <button 
          onClick={() => onViewDetails(job._id || job.id)}
          className="flex-1 px-4 py-2 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          View Details
        </button>
        <button 
          onClick={() => onApply(job._id || job.id)}
          disabled={isApplied}
          className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            isApplied 
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
              : 'bg-secondary text-white hover:bg-secondary-focus'
          }`}
        >
          {isApplied ? 'Applied' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

export default JobCard;