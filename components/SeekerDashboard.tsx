import React, { useState, useMemo } from 'react';
import { Job, Company, JobSeeker, Review, JobType } from '../types';
import JobCard from './JobCard';
import Modal from './Modal';
import JobDetails from './JobDetails';
import ResumeBooster from './ResumeBooster';
import LeaveReviewForm from './LeaveReviewForm';
import JobSeekerProfileEdit from './JobSeekerProfileEdit';
import { PencilIcon, MagnifyingGlassIcon } from './icons';
import JobAlertsManager from './JobAlertsManager';

interface SeekerDashboardProps {
  seeker: JobSeeker;
  jobs: Job[];
  companies: Company[];
  onAddReview: (companyId: string, review: Omit<Review, 'id' | 'date' | 'authorId'>) => void;
  onSaveProfile: (updatedSeeker: JobSeeker) => void;
}

const SeekerDashboard: React.FC<SeekerDashboardProps> = ({ seeker, jobs, companies, onAddReview, onSaveProfile }) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [appliedJobs, setAppliedJobs] = useState<string[]>(seeker.appliedJobs);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingCompany, setReviewingCompany] = useState<Company | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobType, setSelectedJobType] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [minSalary, setMinSalary] = useState(0);

  const handleViewDetails = (jobId: string) => {
    setSelectedJobId(jobId);
  };
  
  const handleCloseModal = () => {
    setSelectedJobId(null);
  };
  
  const handleApply = (jobId: string) => {
    if (!appliedJobs.includes(jobId)) {
        const updatedAppliedJobs = [...appliedJobs, jobId];
        setAppliedJobs(updatedAppliedJobs);
        onSaveProfile({ ...seeker, appliedJobs: updatedAppliedJobs });
    }
  };

  const handleLeaveReview = (companyId: string) => {
    const companyToReview = companies.find(c => c.id === companyId);
    if (companyToReview) {
        setSelectedJobId(null); // Close details modal first
        setReviewingCompany(companyToReview);
        setIsReviewModalOpen(true);
    }
  };

  const handleSubmitReview = (review: Omit<Review, 'id' | 'date' | 'authorId'>) => {
    if (reviewingCompany) {
        onAddReview(reviewingCompany.id, { ...review, reviewerName: seeker.name });
        setIsReviewModalOpen(false);
        setReviewingCompany(null);
    }
  };

  const handleSaveProfile = (updatedSeeker: JobSeeker) => {
    onSaveProfile(updatedSeeker);
    setIsEditModalOpen(false);
  };
  
  const experienceLevels = useMemo(() => [...new Set(jobs.map(j => j.experienceLevel))], [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const company = companies.find(c => c.id === job.companyId);
      if (!company) return false;

      const matchesQuery = searchQuery.toLowerCase() === '' ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesJobType = selectedJobType === '' || job.jobType === selectedJobType;
      
      const matchesExperience = selectedExperience === '' || job.experienceLevel === selectedExperience;

      const matchesSalary = job.salaryMin >= minSalary;

      return matchesQuery && matchesJobType && matchesExperience && matchesSalary;
    });
  }, [jobs, companies, searchQuery, selectedJobType, selectedExperience, minSalary]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedJobType('');
    setSelectedExperience('');
    setMinSalary(0);
  }

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const selectedJobCompany = selectedJob ? companies.find(c => c.id === selectedJob.companyId) : null;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-interactive relative">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="absolute top-4 right-4 p-2 text-gray-500 hover:text-primary transition-colors"
                aria-label="Edit Profile"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-bold text-neutral mb-4">Welcome, {seeker.name}!</h3>
              <img src={seeker.photoUrl} alt={seeker.name} className="h-24 w-24 rounded-full mx-auto mb-4 border-4 border-primary"/>
              <p className="text-center text-gray-600">{seeker.email}</p>
          </div>
          <JobAlertsManager seeker={seeker} onSave={onSaveProfile} />
          <ResumeBooster />
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-interactive mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2 lg:col-span-4">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by Title, Company, Location</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input type="text" id="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g., 'React Developer' or 'Innovate Inc.'" className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                </div>
                <div>
                    <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">Job Type</label>
                    <select id="jobType" value={selectedJobType} onChange={(e) => setSelectedJobType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm">
                        <option value="">All</option>
                        {Object.values(JobType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experience</label>
                    <select id="experience" value={selectedExperience} onChange={(e) => setSelectedExperience(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm">
                        <option value="">All</option>
                        {experienceLevels.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Min Salary: ${minSalary.toLocaleString()}</label>
                    <input type="range" id="salary" min="0" max="200000" step="10000" value={minSalary} onChange={(e) => setMinSalary(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2" />
                </div>
                <div>
                    <button onClick={handleResetFilters} className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500">Reset</button>
                </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-neutral mb-6">Open Positions ({filteredJobs.length})</h2>
          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.map(job => {
                  const company = companies.find(c => c.id === job.companyId);
                  if (!company) return null;
                  return (
                    <JobCard 
                      key={job.id}
                      job={job}
                      company={company}
                      onApply={handleApply}
                      onViewDetails={handleViewDetails}
                      isApplied={appliedJobs.includes(job.id)}
                    />
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl">
                <p className="text-lg font-semibold text-neutral">No Jobs Found</p>
                <p className="text-gray-500 mt-2">Try adjusting your search filters.</p>
            </div>
          )}
        </div>
      </div>

      {selectedJob && selectedJobCompany && (
        <Modal 
          isOpen={!!selectedJobId} 
          onClose={handleCloseModal} 
          title="Job Details"
        >
          <JobDetails 
            job={selectedJob} 
            company={selectedJobCompany}
            onApply={handleApply}
            isApplied={appliedJobs.includes(selectedJob.id)}
            userRole="seeker"
            onLeaveReview={handleLeaveReview}
          />
        </Modal>
      )}

      {reviewingCompany && (
        <Modal
            isOpen={isReviewModalOpen}
            onClose={() => setIsReviewModalOpen(false)}
            title={`Leave a review for ${reviewingCompany.name}`}
        >
            <LeaveReviewForm
                companyName={reviewingCompany.name}
                onSubmit={handleSubmitReview}
                onCancel={() => setIsReviewModalOpen(false)}
            />
        </Modal>
      )}

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Your Profile"
      >
        <JobSeekerProfileEdit
          seeker={seeker}
          onSave={handleSaveProfile}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </main>
  );
};

export default SeekerDashboard;