
import React from 'react';
import { Job, Company } from '../types';
import { BriefcaseIcon, CurrencyDollarIcon, MapPinIcon } from './icons';

interface JobDetailsProps {
  job: Job;
  company: Company;
  onApply: (jobId: string) => void;
  isApplied: boolean;
  userRole: 'seeker' | 'company' | 'admin';
  onLeaveReview: (companyId: string) => void;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, company, onApply, isApplied, userRole, onLeaveReview }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start">
        <img src={company.logo} alt={`${company.name} logo`} className="h-20 w-20 rounded-lg mr-6 object-cover border" />
        <div>
          <h2 className="text-3xl font-bold text-neutral">{job.title}</h2>
          <p className="text-xl text-primary font-semibold">{company.name}</p>
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
            onClick={() => onApply(job.id)}
            disabled={isApplied}
            className={`px-6 py-3 rounded-lg font-bold text-white transition-colors duration-300 ${
                isApplied
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
            }`}
            >
            {isApplied ? 'Already Applied' : 'Apply Now'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default JobDetails;