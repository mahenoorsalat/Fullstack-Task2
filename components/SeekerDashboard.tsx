import React, { useState, useMemo } from 'react';
import { Job, Company, JobSeeker, Review, JobType } from '../types.ts'; // Explicit .ts extension
import JobCard from './JobCard.tsx'; // Explicit .tsx extension
import Modal from './Modal.tsx'; // Explicit .tsx extension
import JobDetails from './JobDetails.tsx'; // Explicit .tsx extension
import ResumeBooster from './ResumeBooster.tsx'; // Explicit .tsx extension
import LeaveReviewForm from './LeaveReviewForm.tsx'; // Explicit .tsx extension
import JobSeekerProfileEdit from './JobSeekerProfileEdit.tsx'; // Explicit .tsx extension
import { PencilIcon, MagnifyingGlassIcon } from './icons.tsx'; // Explicit .tsx extension
import JobAlertsManager from './JobAlertsManager.tsx'; // Explicit .tsx extension

// NEW PROP INTERFACES
interface FilterState {
    searchQuery: string;
    companyQuery: string;
    selectedJobType: string;
    selectedExperience: string;
    minSalary: number;
}
interface SetFilterState {
    setSearchQuery: (s: string) => void;
    setCompanyQuery: (s: string) => void;
    setSelectedJobType: (s: string) => void;
    setSelectedExperience: (s: string) => void;
    setMinSalary: (n: number) => void;
}

interface SeekerDashboardProps {
  seeker: JobSeeker;
  jobs: Job[]; // Now the pre-filtered result from the server
  companies: Company[];
  onAddReview: (companyId: string, review: Omit<Review, 'id' | 'date' | 'authorId'>) => void;
  onSaveProfile: (updatedSeeker: JobSeeker) => void;
  onApplyJob: (jobId: string) => void; 
  // NEW PROPS
  filterState: FilterState;
  setFilterState: SetFilterState;
}

const SeekerDashboard: React.FC<SeekerDashboardProps> = ({ 
    seeker, 
    jobs, // jobs is now pre-filtered from server
    companies, 
    onAddReview, 
    onSaveProfile, 
    onApplyJob,
    filterState, // NEW
    setFilterState // NEW
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  const appliedJobs = seeker.appliedJobs ?? [];

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingCompany, setReviewingCompany] = useState<Company | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // DESTRUCTURE FILTER PROPS FOR USE
  const { searchQuery, companyQuery, selectedJobType, selectedExperience, minSalary } = filterState;
  const { setSearchQuery, setCompanyQuery, setSelectedJobType, setSelectedExperience, setMinSalary } = setFilterState;


  const handleViewDetails = (jobId: string) => {
    setSelectedJobId(jobId);
  };
  
  const handleCloseModal = () => {
    setSelectedJobId(null);
  };
  
  const handleApply = (jobId: string) => {
    // FIX: Call the parent's API handler (onApplyJob) and let the parent update the seeker state.
    if (!appliedJobs.includes(jobId)) {
        onApplyJob(jobId);
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
  
  // experienceLevels calculation remains
  const experienceLevels = useMemo(() => [...new Set(jobs.map(j => j.experienceLevel))], [jobs]);

  // REMOVED: The entire 'filteredJobs' useMemo hook for client-side filtering.
  
  const handleResetFilters = () => {
    setSearchQuery('');
    setCompanyQuery('');
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
<img 

                 src={seeker.photoUrl || 'https://placehold.co/96x96/4F46E5/FFFFFF?text=P'} 
                 alt={seeker.name} 
                 className="h-24 w-24 rounded-full mx-auto mb-4 border-4 border-primary"
              />              <p className="text-center text-gray-600">{seeker.email}</p>
          </div>
          <JobAlertsManager seeker={seeker} onSave={onSaveProfile} />
          <ResumeBooster />
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-interactive mb-6">
            {/* Filter inputs use the destructured setters from props */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                {/* 1. Title/Location Search (Spans 2 columns on large screens) */}
                <div className="md:col-span-2 lg:col-span-2">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search Title or Location</label>
                    <div className="relative mt-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input type="text" id="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g., 'React Developer', 'London'" className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                </div>
                {/* 2. Company Name Search (Spans 1 column) */}
                <div className="md:col-span-2 lg:col-span-1">
                    <label htmlFor="company-search" className="block text-sm font-medium text-gray-700">Company Name</label>
                    <div className="relative mt-1">
                        <input type="text" id="company-search" value={companyQuery} onChange={(e) => setCompanyQuery(e.target.value)} placeholder="e.g., 'Innovate Inc.'" className="block w-full rounded-md border-gray-300 shadow-sm py-2 px-3 focus:border-primary focus:ring-primary sm:text-sm" />
                    </div>
                </div>
                {/* 3. Job Type */}
                <div>
                    <label htmlFor="jobType" className="block text-sm font-medium text-gray-700">Job Type</label>
                    <select id="jobType" value={selectedJobType} onChange={(e) => setSelectedJobType(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm">
                        <option value="">All</option>
                        {Object.values(JobType).map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                </div>
                {/* 4. Experience */}
                <div>
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experience</label>
                    <select id="experience" value={selectedExperience} onChange={(e) => setSelectedExperience(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm">
                        <option value="">All</option>
                        {experienceLevels.map(level => <option key={level} value={level}>{level}</option>)}
                    </select>
                </div>
                {/* 5. Min Salary */}
                <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Min Salary: ${minSalary.toLocaleString()}</label>
                    <input type="range" id="salary" min="0" max="200000" step="10000" value={minSalary} onChange={(e) => setMinSalary(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2" />
                </div>
                {/* 6. Reset (Spans 1 column on large screens) */}
                <div className="md:col-span-2 lg:col-span-1">
                    <button onClick={handleResetFilters} className="w-full rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500">Reset</button>
                </div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-neutral mb-6">Open Positions ({jobs.length}) </h2>
          
          {jobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs // Use the jobs prop directly, as it's already filtered
                    .filter(job => companies.find(c => c.id === job.companyId))
                    .map(job => {
                      const company = companies.find(c => c.id === job.companyId);
                      return (
                          <JobCard 
                              key={job._id || job.id}
                              job={job}
                              company={company!}
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