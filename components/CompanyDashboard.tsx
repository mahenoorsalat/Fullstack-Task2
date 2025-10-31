import React, { useState, useEffect } from 'react'; // ADDED useEffect
import { Company, Job, JobSeeker } from '../types';
import Modal from './Modal';
import CompanyProfileEdit from './CompanyProfileEdit';
import PostJobForm from './PostJobForm';
import { PencilIcon, PlusCircleIcon, BriefcaseIcon } from './icons';
import { api } from '../services/apiService'; // ADDED api import

interface CompanyDashboardProps {
  company: Company;
  // REMOVED: jobs: Job[]; // Jobs are now fetched locally
  seekers: JobSeeker[];
  onSaveProfile: (updatedCompany: Company) => void;
  onSaveJob: (job: Omit<Job, 'id' | 'applicants' | 'shortlisted' | 'rejected'>) => void;
}

const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ company, seekers, onSaveProfile, onSaveJob }) => { // Removed jobs from destructuring
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [viewingApplicantsForJob, setViewingApplicantsForJob] = useState<Job | null>(null);

  // NEW STATE: Manage company jobs locally
  const [companyJobs, setCompanyJobs] = useState<Job[]>([]);
  
  // NEW FUNCTION: Dedicated fetch for company jobs
  const fetchCompanyJobs = async () => {
    try {
      // Calls the new API function
      const jobs = await api.getCompanyJobs(); 
      setCompanyJobs(jobs);
    } catch (error) {
      console.error("Failed to fetch company jobs:", error);
    }
  };

  // NEW EFFECT: Fetch jobs on mount/company change
  useEffect(() => {
    fetchCompanyJobs();
  }, [company.id]); // Re-run if company ID changes

  // REMOVED: const companyJobs = jobs.filter(job => job.companyId === company.id);

  const handleSaveProfile = (updatedCompany: Company) => {
    onSaveProfile(updatedCompany);
    setIsEditModalOpen(false);
    // The useEffect above handles re-fetching jobs if the profile save triggers an outer re-render
  };

  const handleSaveJob = (job: Omit<Job, 'id' | 'applicants' | 'shortlisted' | 'rejected'>) => {
    onSaveJob(job);
    setIsPostJobModalOpen(false);
    // CRITICAL FIX: Manually re-fetch the job list after a successful post
    fetchCompanyJobs();
  };
  
  const getApplicants = (job: Job) => {
    return seekers.filter(seeker =>( job.applicants ?? []).includes(seeker.id));
  };

  return (
    <main className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-interactive relative">
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-secondary transition-colors"
          aria-label="Edit Profile"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <div className="flex items-center">
          <img src={company.logo} alt={company.name} className="h-24 w-24 rounded-full mr-6 border-4 border-secondary"/>
          <div>
            <h2 className="text-3xl font-bold text-neutral">{company.name}</h2>
            <p className="text-gray-600">{company.website}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-interactive">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-neutral flex items-center">
              <BriefcaseIcon className="h-6 w-6 mr-2" />
              Your Job Postings
            </h3>
            <button 
              onClick={() => setIsPostJobModalOpen(true)}
              className="flex items-center bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              <PlusCircleIcon className="h-5 w-5 mr-2"/>
              Post New Job
            </button>
        </div>
<div className="space-y-4">
          {companyJobs.length > 0 ? companyJobs.map((job, index) => (
            <div key={job.id || index} className="p-4 border rounded-lg hover:shadow-sm bg-white/50">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-lg">{job.title}</h4>
                  <p className="text-sm text-gray-500">{job.location}</p>
                </div>
                <button 
                  onClick={() => setViewingApplicantsForJob(job)}
                  className="text-primary font-semibold hover:underline"
                >
                  View Applicants ({job.applicants?.length ?? 0})
                </button>
              </div>
            </div>
          )) : <p className="text-gray-500">You haven't posted any jobs yet.</p>}
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Company Profile"
      >
        <CompanyProfileEdit
          company={company}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
      
      {/* Post Job Modal */}
      <Modal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        title="Post a New Job"
      >
        <PostJobForm
          companyId={company.id}
          onSave={handleSaveJob}
          onCancel={() => setIsPostJobModalOpen(false)}
        />
      </Modal>

      {/* View Applicants Modal */}
    {viewingApplicantsForJob && (
        <Modal
          isOpen={!!viewingApplicantsForJob}
          onClose={() => setViewingApplicantsForJob(null)}
          title={`Applicants for ${viewingApplicantsForJob.title}`}
        >
          <div className="space-y-4">
            {getApplicants(viewingApplicantsForJob).length > 0 ? getApplicants(viewingApplicantsForJob).map((seeker, index) => (
              <div key={seeker.id || index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <img src={seeker.photoUrl} alt={seeker.name} className="h-12 w-12 rounded-full mr-4"/>
                <div>
                  <p className="font-semibold">{seeker.name}</p>
                  <p className="text-sm text-gray-600">{seeker.email}</p>
                  <a href={seeker.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View Resume</a>
                </div>
              </div>
            )) : <p>No applicants yet for this position.</p>}
          </div>
        </Modal>
      )}

    </main>
  );
};

export default CompanyDashboard;