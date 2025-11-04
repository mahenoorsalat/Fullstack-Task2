import React, { useState, useEffect } from 'react'; 
import { Company, Job, JobSeeker } from '../types';
import Modal from './Modal';
import CompanyProfileEdit from './CompanyProfileEdit';
import PostJobForm from './PostJobForm';
import { PencilIcon, PlusCircleIcon, BriefcaseIcon, TrashIcon } from './icons'; // ADDED TrashIcon
import { api } from '../services/apiService';

interface ApplicationData {
    status: 'Shortlisted' | 'Interviewed' | 'Hired' | 'Rejected';
    jobId: string;
    _id: string; 
    seekerId: JobSeeker; 
}

interface CompanyDashboardProps {
    company: Company;
    seekers: JobSeeker[];
    onSaveProfile: (updatedCompany: Company) => void;
    onSaveJob: (job: Omit<Job, 'id' | 'applicants' | 'shortlisted' | 'rejected'> | Job) => void; // Job type added for editing
    // NEW PROP: Function to handle deletion (used for jobs)
    onDelete: (type: 'job' | 'company' | 'seeker' | 'blogPost', id: string) => Promise<void>;
}

const DEFAULT_LOGO_URL = '/assets/default-company-logo.png'; 

// FIX: Provide a default function for onDelete to prevent TypeError if the parent doesn't pass it.
const CompanyDashboard: React.FC<CompanyDashboardProps> = ({ company, seekers, onSaveProfile, onSaveJob, onDelete = async () => {} }) => { 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
    const [viewingApplicantsForJob, setViewingApplicantsForJob] = useState<Job | null>(null);
    const [jobToEdit, setJobToEdit] = useState<Job | null>(null); // State for job being edited
    // NEW STATE: For delete confirmation
    const [deleteConfirmJob, setDeleteConfirmJob] = useState<Job | null>(null);

    const initialLogo = company.logo || (company as any).photoUrl;
    const [logoSrc, setLogoSrc] = useState(initialLogo);

    const [companyJobs, setCompanyJobs] = useState<Job[]>([]);

    const [jobApplications, setJobApplications] = useState<ApplicationData[]>([]);
    const [isLoadingApplicants, setIsLoadingApplicants] = useState(false);
    
    const fetchCompanyJobs = async () => {
        try {
            const jobs = await api.getCompanyJobs(); 
            setCompanyJobs(jobs);
        } catch (error) {
            console.error("Failed to fetch company jobs:", error);
        }
    };

    const fetchApplicationsForJob = async (job: Job) => {
        setIsLoadingApplicants(true);
        setJobApplications([]); 
        setViewingApplicantsForJob(job);

        try {
          
            const applications: ApplicationData[] = await api.getApplicationsForJob(job.id); 
            setJobApplications(applications);
        } catch (error) {
            console.error(`Failed to fetch applications for job ${job.id}:`, error);
        } finally {
            setIsLoadingApplicants(false);
        }
    };

    useEffect(() => {
        const newLogo = company.logo || (company as any).photoUrl;
        setLogoSrc(newLogo);
    }, [company.logo, (company as any).photoUrl]); 
        
        useEffect(() => {
            fetchCompanyJobs();
        }, [company.id]); 

        const handleSaveProfile = (updatedCompany: Company) => {
        setLogoSrc(updatedCompany.logo); 
        
            onSaveProfile(updatedCompany); 
        
            setIsEditModalOpen(false);
        };

    const handleSaveJob = (jobData: Omit<Job, 'id' | 'applicants' | 'shortlisted' | 'rejected'> | Job) => {
        onSaveJob(jobData);
        setIsPostJobModalOpen(false);
        setJobToEdit(null); 
        fetchCompanyJobs(); 
    };
    
    // Function to open the Edit Job Modal
    const handleEditJob = (job: Job) => {
        setJobToEdit(job);
        setIsPostJobModalOpen(true);
    };

    // Function to confirm and perform job deletion
    const handleConfirmDeleteJob = async () => {
        if (deleteConfirmJob) {
            try {
                // Call the onDelete prop, which calls api.deleteEntity in the parent/App.tsx
                await onDelete('job', deleteConfirmJob.id);
                setDeleteConfirmJob(null);
                // Refetch jobs to update the UI
                fetchCompanyJobs(); 
            } catch (error) {
                console.error("Failed to delete job:", error);
                // You would typically show a toast/alert here
            }
        }
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
                  <img 
                        src={logoSrc} 
                        alt={company.name} 
                        className="h-24 w-24 rounded-full mr-6 border-4 border-secondary"
                        onError={(e) => {
                            if (e.currentTarget.src !== DEFAULT_LOGO_URL) {
                                e.currentTarget.onerror = null; // prevents looping
                                e.currentTarget.src = DEFAULT_LOGO_URL;
                            }
                        }}
                    />
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
                        onClick={() => {
                            setJobToEdit(null); // Ensure we are in 'create' mode
                            setIsPostJobModalOpen(true);
                        }}
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
                                <div className="flex items-center space-x-3">
                                    <button 
                                        onClick={() => fetchApplicationsForJob(job)} 
                                        className="text-primary font-semibold hover:underline text-sm"
                                    >
                                        View Applicants ({job.applicants?.length ?? 0})
                                    </button>
                                    <button 
                                        onClick={() => handleEditJob(job)} 
                                        className="text-gray-500 hover:text-primary p-1 rounded-full hover:bg-gray-100"
                                        aria-label="Edit Job"
                                    >
                                        <PencilIcon className="h-5 w-5"/>
                                    </button>
                                    {/* NEW BUTTON: Delete Job */}
                                    <button 
                                        onClick={() => setDeleteConfirmJob(job)} 
                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                        aria-label="Delete Job"
                                    >
                                        <TrashIcon className="h-5 w-5"/>
                                    </button>
                                </div>
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
            
            {/* Post/Edit Job Modal */}
            <Modal
                isOpen={isPostJobModalOpen}
                onClose={() => {
                    setIsPostJobModalOpen(false);
                    setJobToEdit(null);
                }}
                title={jobToEdit ? `Edit Job: ${jobToEdit.title}` : "Post a New Job"}
            >
                <PostJobForm
                    companyId={company.id}
                    onSave={handleSaveJob}
                    onCancel={() => {
                        setIsPostJobModalOpen(false);
                        setJobToEdit(null);
                    }}
                    jobToEdit={jobToEdit} // Pass job object for editing
                />
            </Modal>

            {/* View Applicants Modal */}
            {viewingApplicantsForJob && (
                <Modal
                    isOpen={!!viewingApplicantsForJob}
                    onClose={() => {
                        setViewingApplicantsForJob(null)
                        setJobApplications([])
                    }}
                    title={`Applicants for ${viewingApplicantsForJob.title}`}
                >
                    <div className="space-y-4">
                        {isLoadingApplicants ? (
                            <p>Loading applicants...</p>
                        ) : jobApplications.length > 0 ? (
                            <>
                                <h4 className="font-bold text-neutral">{jobApplications.length} Applications Found</h4>
                                {jobApplications.map((application) => (
                                    <div key={application._id || application.seekerId.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                        <img src={application.seekerId.photoUrl} alt={application.seekerId.name} className="h-12 w-12 rounded-full mr-4"/>
                                        <div>
                                            <p className="font-semibold">{application.seekerId.name} <span className="text-xs text-secondary ml-2">({application.status})</span></p>
                                            <p className="text-sm text-gray-600">{application.seekerId.email}</p>
                                            
                                            {application.seekerId.resumeUrl && application.seekerId.resumeUrl.trim() !== '' ? (
                                                <a href={application.seekerId.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">View Resume</a>
                                            ) : (
                                                <p className="text-sm text-gray-400">Resume not uploaded</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <p>No applicants yet for this position.</p>
                        )}
                    </div>
                </Modal>
            )}

            {/* NEW: Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirmJob} onClose={() => setDeleteConfirmJob(null)} title="Confirm Job Deletion">
                {deleteConfirmJob && (
                    <div className="text-center">
                        <p className="text-lg">Are you sure you want to delete the job: <span className="font-bold">{deleteConfirmJob.title}</span>?</p>
                        <p className="text-sm text-red-600 mt-2">This action cannot be undone and will delete all associated applications.</p>
                        <div className="mt-6 flex justify-center space-x-4">
                            <button onClick={() => setDeleteConfirmJob(null)} className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-6 rounded-md">Cancel</button>
                            <button onClick={handleConfirmDeleteJob} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md">Delete</button>
                        </div>
                    </div>
                )}
            </Modal>
        </main>
    );
};

export default CompanyDashboard;