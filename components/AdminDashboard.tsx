import React, { useState } from 'react';
import { Job, Company, JobSeeker } from '../types';
import { BriefcaseIcon, BuildingOfficeIcon, PencilIcon, PlusCircleIcon, TrashIcon, UsersIcon } from './icons';
import Modal from './Modal';
import JobSeekerProfileEdit from './JobSeekerProfileEdit';
import CompanyProfileEdit from './CompanyProfileEdit';
import PostJobForm from './PostJobForm';

interface AdminDashboardProps {
  jobs: Job[];
  companies: Company[];
  seekers: JobSeeker[];
  onDelete: (type: 'job' | 'company' | 'seeker' | 'blogPost', id: string) => void;
  onSaveSeeker: (seeker: JobSeeker) => void;
  onSaveCompany: (company: Company) => void;
  onSaveJob: (job: Job | Omit<Job, 'id' | 'applicants' | 'shortlisted' | 'rejected'>) => void;
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-interactive hover:shadow-interactive-lg hover:-translate-y-1 transition-transform-shadow duration-300 flex items-center">
        <div className="p-3 rounded-full bg-primary/10 mr-4">{icon}</div>
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-neutral">{value}</p>
        </div>
    </div>
);

const emptySeeker: JobSeeker = { 
    id: '', 
    name: '', 
    email: '', 
    password: 'password123', 
    phone: '', 
    photoUrl: '', 
    skills: [], 
    resumeUrl: '', 
    expectedSalary: 0, 
    appliedJobs: [],
    jobAlertsEnabled: false,
    jobAlertsPreferences: {
        keywords: [],
        jobTypes: [],
        locationTypes: [],
        minSalary: 0,
    }
};
const emptyCompany: Company = { id: '', name: '', email: '', password: 'password123', logo: '', description: '', website: '', contactInfo: '', officeAddress: '', reviews: [], jobs: [] };

const AdminDashboard: React.FC<AdminDashboardProps> = ({ jobs, companies, seekers, onDelete, onSaveSeeker, onSaveCompany, onSaveJob }) => {
    const [modalState, setModalState] = useState<{ type: 'job' | 'company' | 'seeker' | null, item: any | null, mode: 'add' | 'edit' | null }>({ type: null, item: null, mode: null });
    const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'job' | 'company' | 'seeker' | 'blogPost', id: string, name: string } | null>(null);

    const openModal = (type: 'job' | 'company' | 'seeker', mode: 'add' | 'edit', item: any = null) => {
        let modalItem = item;
        if (mode === 'add') {
            if (type === 'seeker') modalItem = emptySeeker;
            if (type === 'company') modalItem = emptyCompany;
        }
        setModalState({ type, item: modalItem, mode });
    };
    const closeModal = () => setModalState({ type: null, item: null, mode: null });

    const openDeleteConfirm = (type: 'job' | 'company' | 'seeker', item: Job | Company | JobSeeker) => {
        setDeleteConfirm({ type, id: item.id, name: type === 'job' ? (item as Job).title : (item as Company | JobSeeker).name });
    };
    const closeDeleteConfirm = () => setDeleteConfirm(null);

    const handleConfirmDelete = () => {
        if (deleteConfirm) {
            onDelete(deleteConfirm.type, deleteConfirm.id);
            closeDeleteConfirm();
        }
    };
    
    const renderModalContent = () => {
        const { type, item, mode } = modalState;
        if (!type || !mode) return null;

        switch (type) {
            case 'seeker':
                return <JobSeekerProfileEdit seeker={item} onSave={onSaveSeeker} onCancel={closeModal} />;
            case 'company':
                return <CompanyProfileEdit company={item} onSave={onSaveCompany} onCancel={closeModal} />;
            case 'job':
                return <PostJobForm onSave={onSaveJob} onCancel={closeModal} jobToEdit={item} companies={companies} />;
            default:
                return null;
        }
    };

    return (
        <main className="container mx-auto p-4 md:p-8 space-y-8">
            <h2 className="text-3xl font-bold text-neutral">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Jobs" value={jobs.length} icon={<BriefcaseIcon className="h-8 w-8 text-primary"/>} />
                <StatCard title="Total Companies" value={companies.length} icon={<BuildingOfficeIcon className="h-8 w-8 text-primary"/>} />
                <StatCard title="Total Job Seekers" value={seekers.length} icon={<UsersIcon className="h-8 w-8 text-primary"/>} />
            </div>

            {/* Tables */}
            <div className="space-y-8">
                <TableSection title="Manage Jobs" onAdd={() => openModal('job', 'add')}>
                    {jobs.map(job => (
                        <TableRow key={job.id} title={job.title} subtitle={companies.find(c => c.id === job.companyId)?.name} onEdit={() => openModal('job', 'edit', job)} onDelete={() => openDeleteConfirm('job', job)} />
                    ))}
                </TableSection>
                <TableSection title="Manage Companies" onAdd={() => openModal('company', 'add')}>
                    {companies.map(company => (
                        <TableRow key={company.id} title={company.name} subtitle={company.website} onEdit={() => openModal('company', 'edit', company)} onDelete={() => openDeleteConfirm('company', company)} />
                    ))}
                </TableSection>
                <TableSection title="Manage Job Seekers" onAdd={() => openModal('seeker', 'add')}>
                    {seekers.map(seeker => (
                        <TableRow key={seeker.id} title={seeker.name} subtitle={seeker.email} onEdit={() => openModal('seeker', 'edit', seeker)} onDelete={() => openDeleteConfirm('seeker', seeker)} />
                    ))}
                </TableSection>
            </div>

            {/* Generic Edit/Add Modal */}
            <Modal isOpen={!!modalState.mode} onClose={closeModal} title={`${modalState.mode === 'edit' ? 'Edit' : 'Add'} ${modalState.type}`}>
                {renderModalContent()}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={closeDeleteConfirm} title="Confirm Deletion">
                {deleteConfirm && (
                    <div className="text-center">
                        <p className="text-lg">Are you sure you want to delete <span className="font-bold">{deleteConfirm.name}</span>?</p>
                        <p className="text-sm text-red-600 mt-2">This action cannot be undone.</p>
                        <div className="mt-6 flex justify-center space-x-4">
                            <button onClick={closeDeleteConfirm} className="bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-6 rounded-md">Cancel</button>
                            <button onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md">Delete</button>
                        </div>
                    </div>
                )}
            </Modal>
        </main>
    );
};

const TableSection: React.FC<{ title: string, onAdd: () => void, children: React.ReactNode }> = ({ title, onAdd, children }) => (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-interactive">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-neutral">{title}</h3>
            <button onClick={onAdd} className="flex items-center bg-primary hover:bg-primary-focus text-white font-bold py-2 px-4 rounded-md transition-colors">
                <PlusCircleIcon className="h-5 w-5 mr-2"/> Add New
            </button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">{children}</div>
    </div>
);

const TableRow: React.FC<{ title: string, subtitle?: string, onEdit: () => void, onDelete: () => void }> = ({ title, subtitle, onEdit, onDelete }) => (
    <div className="flex justify-between items-center p-2 rounded hover:bg-gray-50/50">
        <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={onEdit} className="text-primary hover:text-primary-focus p-2 rounded-full hover:bg-primary/10"><PencilIcon className="h-5 w-5"/></button>
            <button onClick={onDelete} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100"><TrashIcon className="h-5 w-5"/></button>
        </div>
    </div>
);

export default AdminDashboard;