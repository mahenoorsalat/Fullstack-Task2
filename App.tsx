import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SeekerDashboard from './components/SeekerDashboard';
import CompanyDashboard from './components/CompanyDashboard';
import AdminDashboard from './components/AdminDashboard';
import { JobSeeker, Company, Admin, Job, Review, BlogPost, ReactionType, Comment } from './types';
import { api } from './services/apiService';
import BlogPage from './components/BlogPage';
import { BriefcaseIcon, NewspaperIcon } from './components/icons';

type User = JobSeeker | Company | Admin;
type UserRole = 'seeker' | 'company' | 'admin';
type ActiveView = 'dashboard' | 'blog';

const Notification = ({ message, onClose }: { message: string; onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-5 right-5 bg-secondary text-white py-3 px-5 rounded-lg shadow-lg z-50 animate-fade-in-down flex items-center space-x-3">
          <span className="font-bold">Success!</span>
          <span>{message}</span>
          <button onClick={onClose} className="text-white/80 hover:text-white font-bold text-2xl leading-none">&times;</button>
           <style>{`
            @keyframes fade-in-down {
              0% { opacity: 0; transform: translateY(-20px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in-down { animation: fade-in-down 0.5s ease-out forwards; }
          `}</style>
        </div>
    );
};


const App: React.FC = () => {
    // Data State
    const [seekers, setSeekers] = useState<JobSeeker[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    
    // Auth State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // UI State
    const [activeView, setActiveView] = useState<ActiveView>('dashboard');
    const [notification, setNotification] = useState<string | null>(null);

    // Initial data load
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            const [seekersData, companiesData, jobsData, postsData] = await Promise.all([
                api.getSeekers(),
                api.getCompanies(),
                api.getJobs(),
                api.getBlogPosts(),
            ]);
            setSeekers(seekersData);
            setCompanies(companiesData);
            setJobs(jobsData);
            setBlogPosts(postsData);
            setIsLoading(false);
        };

        if (currentUser) {
            loadData();
        } else {
            // Clear data on logout
            setSeekers([]);
            setCompanies([]);
            setJobs([]);
            setBlogPosts([]);
        }
    }, [currentUser]); // Reload data when user changes


    const handleLogin = async (email: string, password: string, role: UserRole) => {
        setAuthError(null);
        setIsLoading(true);
        try {
            const userProfile = await api.authenticateUser(email, password, role);
             if (userProfile) {
                setCurrentUser(userProfile.user);
                setCurrentUserRole(userProfile.role);
            } else {
                throw new Error("Invalid credentials or role.");
            }
        } catch (error: any) {
            setAuthError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await api.logout();
        setCurrentUser(null);
        setCurrentUserRole(null);
    };
    
    const handleSaveSeekerProfile = async (updatedSeeker: JobSeeker) => {
      const savedSeeker = await api.saveSeeker(updatedSeeker);
      setSeekers(seekers.map(s => s.id === savedSeeker.id ? savedSeeker : s));
      setCurrentUser(savedSeeker);
    }

    const handleSaveCompanyProfile = async (updatedCompany: Company) => {
      const savedCompany = await api.saveCompany(updatedCompany);
      setCompanies(companies.map(c => c.id === savedCompany.id ? savedCompany : c));
      setCurrentUser(savedCompany);
    }

    const handleAddReview = async (companyId: string, review: Omit<Review, 'id' | 'date'>) => {
      const updatedCompany = await api.addReview(companyId, review);
      setCompanies(companies.map(c => c.id === companyId ? updatedCompany : c));
      
      // Automatically create a blog post from the review
      if (currentUser && currentUserRole === 'seeker') {
          const seeker = currentUser as JobSeeker;
          const company = companies.find(c => c.id === companyId);
          if (company) {
              const content = `New review for ${company.name}!\n\nI gave them a ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)} rating.\n\nMy thoughts: "${review.comment}"`;
              
              const newPostData: Omit<BlogPost, 'id' | 'timestamp' | 'reactions' | 'comments'> = {
                  authorId: seeker.id,
                  authorName: seeker.name,
                  authorRole: 'seeker',
                  authorPhotoUrl: seeker.photoUrl,
                  content,
              };
              const savedPost = await api.addBlogPost(newPostData);
              setBlogPosts(prev => [savedPost, ...prev]);
              
              // Show notification
              setNotification(`Your review for ${company.name} is now live on the blog!`);
          }
      }
    }
    
    const handleCompanySaveJob = async (jobData: Omit<Job, 'id' | 'applicants' | 'shortlisted' | 'rejected'>) => {
        const newJob = await api.saveJob(jobData);
        setJobs(prev => [newJob, ...prev]);
    }
    
    const handleAdminDelete = async (type: 'job' | 'company' | 'seeker' | 'blogPost', id: string) => {
        if (await api.deleteEntity(type, id)) {
            if (type === 'job') setJobs(jobs.filter(j => j.id !== id));
            if (type === 'seeker') setSeekers(seekers.filter(s => s.id !== id));
            if (type === 'company') {
                setCompanies(companies.filter(c => c.id !== id));
                // Also remove jobs associated with that company
                setJobs(jobs.filter(j => j.companyId !== id));
            }
             if (type === 'blogPost') setBlogPosts(blogPosts.filter(p => p.id !== id));
        }
    }

    const handleAdminSaveSeeker = async (seeker: JobSeeker) => {
        const savedSeeker = await api.saveSeeker(seeker);
        if (seekers.some(s => s.id === savedSeeker.id)) {
            setSeekers(seekers.map(s => s.id === savedSeeker.id ? savedSeeker : s));
        } else {
            setSeekers([...seekers, savedSeeker]);
        }
    };

    const handleAdminSaveCompany = async (company: Company) => {
        const savedCompany = await api.saveCompany(company);
        if (companies.some(c => c.id === savedCompany.id)) {
            setCompanies(companies.map(c => c.id === savedCompany.id ? savedCompany : c));
        } else {
            setCompanies([...companies, savedCompany]);
        }
    };
    
    const handleAdminSaveJob = async (job: Job | Omit<Job, 'id' | 'applicants' | 'shortlisted' | 'rejected'>) => {
        const savedJob = await api.saveJob(job);
        if (jobs.some(j => j.id === savedJob.id)) {
            setJobs(jobs.map(j => j.id === savedJob.id ? savedJob : j));
        } else {
            setJobs([savedJob, ...jobs]);
        }
    };
    
    const handleAddBlogPost = async (content: string) => {
        if (!currentUser || !currentUserRole) return;

        let authorName = 'Admin';
        let authorPhotoUrl = `https://i.pravatar.cc/150?u=admin`;

        if (currentUserRole === 'seeker') {
            authorName = (currentUser as JobSeeker).name;
            authorPhotoUrl = (currentUser as JobSeeker).photoUrl;
        } else if (currentUserRole === 'company') {
            authorName = (currentUser as Company).name;
            authorPhotoUrl = (currentUser as Company).logo;
        }

        const newPostData: Omit<BlogPost, 'id' | 'timestamp' | 'reactions' | 'comments'> = {
            authorId: currentUser.id,
            authorName,
            authorRole: currentUserRole,
            authorPhotoUrl,
            content,
        };

        const savedPost = await api.addBlogPost(newPostData);
        setBlogPosts(prev => [savedPost, ...prev]);
    };

    const handleUpdateBlogPost = async (postId: string, content: string) => {
        const updatedPost = await api.updateBlogPost(postId, content);
        setBlogPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
    };

    const handleDeleteBlogPost = async (postId: string) => {
        if (await api.deleteEntity('blogPost', postId)) {
            setBlogPosts(posts => posts.filter(p => p.id !== postId));
        }
    };
    
    const handlePostReaction = async (postId: string, reactionType: ReactionType) => {
        if (!currentUser) return;
        const updatedPost = await api.addOrUpdateReaction(postId, currentUser.id, reactionType);
        setBlogPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
    };

    const handleAddComment = async (postId: string, content: string) => {
        if (!currentUser || !currentUserRole) return;
        
        const authorId = currentUser.id;
        let authorName = 'User';
        let authorPhotoUrl = 'https://i.pravatar.cc/150';

        if(currentUserRole === 'seeker') {
            authorName = (currentUser as JobSeeker).name;
            authorPhotoUrl = (currentUser as JobSeeker).photoUrl;
        } else if (currentUserRole === 'company') {
            authorName = (currentUser as Company).name;
            authorPhotoUrl = (currentUser as Company).logo;
        } else { // Admin
            authorName = 'Admin';
            authorPhotoUrl = 'https://i.pravatar.cc/150?u=admin';
        }

        const commentData: Omit<Comment, 'id' | 'timestamp'> = {
            authorId,
            authorName,
            authorPhotoUrl,
            content
        };

        const updatedPost = await api.addComment(postId, commentData);
        setBlogPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
    };

    const handleUpdateComment = async (postId: string, commentId: string, content: string) => {
        const updatedPost = await api.updateComment(postId, commentId, content);
        setBlogPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        const updatedPost = await api.deleteComment(postId, commentId);
        setBlogPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
    };


    if (isLoading && !currentUser) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-primary">Loading Job Executive...</div>;
    }

    if (!currentUser || !currentUserRole) {
        return <LoginPage onLogin={handleLogin} error={authError} />;
    }

    const renderDashboard = () => {
        switch (currentUserRole) {
            case 'seeker':
                return <SeekerDashboard 
                    seeker={currentUser as JobSeeker}
                    jobs={jobs}
                    companies={companies}
                    onAddReview={handleAddReview}
                    onSaveProfile={handleSaveSeekerProfile}
                />;
            case 'company':
                return <CompanyDashboard 
                    company={currentUser as Company}
                    jobs={jobs}
                    seekers={seekers}
                    onSaveProfile={handleSaveCompanyProfile}
                    onSaveJob={handleCompanySaveJob}
                />;
            case 'admin':
                return <AdminDashboard 
                    jobs={jobs}
                    companies={companies}
                    seekers={seekers}
                    onDelete={handleAdminDelete}
                    onSaveSeeker={handleAdminSaveSeeker}
                    onSaveCompany={handleAdminSaveCompany}
                    onSaveJob={handleAdminSaveJob}
                />;
            default:
                return <LoginPage onLogin={handleLogin} error={authError} />;
        }
    }
    
    let currentUserName = 'Admin';
    let currentUserPhoto = `https://i.pravatar.cc/150?u=admin`;
    if (currentUserRole === 'seeker') {
        currentUserName = (currentUser as JobSeeker).name;
        currentUserPhoto = (currentUser as JobSeeker).photoUrl;
    } else if (currentUserRole === 'company') {
        currentUserName = (currentUser as Company).name;
        currentUserPhoto = (currentUser as Company).logo;
    }

    return (
        <div className="min-h-screen">
            {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
            <header className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-primary">Job Executive</h1>
                        </div>
                         <div className="hidden sm:block">
                            <div className="flex space-x-4">
                               <NavButton isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<BriefcaseIcon className="h-5 w-5 mr-2"/>}>Dashboard</NavButton>
                               <NavButton isActive={activeView === 'blog'} onClick={() => setActiveView('blog')} icon={<NewspaperIcon className="h-5 w-5 mr-2"/>}>Community Blog</NavButton>
                            </div>
                        </div>
                        <div>
                           <button onClick={handleLogout} className="font-semibold text-neutral hover:text-primary transition-colors">Logout</button>
                        </div>
                    </div>
                </nav>
            </header>
            
             <div className="sm:hidden p-2 bg-white/80 backdrop-blur-sm shadow-md">
                 <div className="flex justify-around">
                     <NavButton isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<BriefcaseIcon className="h-5 w-5"/>}><span className="sr-only">Dashboard</span></NavButton>
                     <NavButton isActive={activeView === 'blog'} onClick={() => setActiveView('blog')} icon={<NewspaperIcon className="h-5 w-5"/>}><span className="sr-only">Blog</span></NavButton>
                 </div>
            </div>

            {activeView === 'dashboard' ? renderDashboard() : (
                <BlogPage 
                    posts={blogPosts}
                    onAddPost={handleAddBlogPost}
                    onUpdatePost={handleUpdateBlogPost}
                    onDeletePost={handleDeleteBlogPost}
                    onPostReaction={handlePostReaction}
                    onAddComment={handleAddComment}
                    onUpdateComment={handleUpdateComment}
                    onDeleteComment={handleDeleteComment}
                    currentUserId={currentUser.id}
                    currentUserRole={currentUserRole}
                    currentUserName={currentUserName}
                    currentUserPhoto={currentUserPhoto}
                />
            )}
        </div>
    );
};

const NavButton = ({ isActive, onClick, children, icon }: {isActive: boolean, onClick: () => void, children: React.ReactNode, icon: React.ReactNode}) => (
    <button
        onClick={onClick}
        className={`inline-flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
                ? 'bg-primary/10 text-primary'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
         aria-current={isActive ? 'page' : undefined}
    >
        {icon}{children}
    </button>
);


export default App;