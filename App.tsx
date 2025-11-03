import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage'; 
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
// ... (Notification component logic remains unchanged)
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
    const [isRegistering, setIsRegistering] = useState(false); 
    
    // UI State
    const [activeView, setActiveView] = useState<ActiveView>('dashboard');
    const [notification, setNotification] = useState<string | null>(null);

    // Initial data load and persistence check
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');

        if (token && userJson) {
            try {
                const storedUser: User = JSON.parse(userJson);
                // Simple validation to ensure the role exists
                if (storedUser.role) {
                    setCurrentUser(storedUser);
                    setCurrentUserRole(storedUser.role as UserRole);
                } else {
                    api.logout(); // Clear invalid session
                }
            } catch (e) {
                api.logout(); // Clear malformed session
            }
        }
    }, []);

    // Fetch dynamic data when user is authenticated
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
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
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                // Optionally handle error state
            } finally {
                setIsLoading(false);
            }
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
    }, [currentUser]); 

const handleApplyJob = async (jobId: string) => {
    if (!currentUser || currentUserRole !== 'seeker') {
        setNotification("Must be logged in as a Seeker to apply.");
        return;
    }
    
    const currentSeeker = currentUser as JobSeeker;
    const currentAppliedJobs = currentSeeker.appliedJobs ?? [];
    if (currentAppliedJobs.includes(jobId)) {
        setNotification("You have already applied to this job.");
        return;
    }

    try {
        await api.applyToJob(jobId); 
        
        const updatedUser = await api.getProfile(); 

        setSeekers(seekers.map(s => s.id === updatedUser.id ? updatedUser : s));
        setCurrentUser(updatedUser);
        
        localStorage.setItem('user', JSON.stringify(updatedUser)); 

        setNotification("Job application successful!");
    } catch (error: any) {
        setNotification(`Job application failed: ${error.message}`);
    }
};
    const handleLogin = async (email: string, password: string, role: UserRole) => {
        setAuthError(null);
        setIsLoading(true);
        try {
            const userProfile = await api.authenticateUser(email, password, role);
             if (userProfile && userProfile.user) {
                setCurrentUser(userProfile.user);
                setCurrentUserRole(userProfile.role);
                // CRITICAL FIX: Persist login data for the token and the full user profile
                // The returned object from authenticateUser might not have 'token' on userProfile.user itself.
                // We assume userProfile has the token:
                localStorage.setItem('token', (userProfile as any).token); 
                localStorage.setItem('user', JSON.stringify(userProfile.user));

            } else {
                throw new Error("Invalid credentials or role.");
            }
        } catch (error: any) {
            setAuthError(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRegister = async (name: string, email: string, password: string, role: UserRole) => {
        setAuthError(null);
        setIsLoading(true);
        try {
            // NOTE: Registering automatically logs the user in if successful
            const userProfile = await api.registerUser(name, email, password, role);
             if (userProfile && userProfile.user) {
                setCurrentUser(userProfile.user);
                setCurrentUserRole(userProfile.role);
                // CRITICAL FIX: Persist login data for the token and the full user profile
                // The returned object from registerUser might not have 'token' on userProfile.user itself.
                localStorage.setItem('token', (userProfile as any).token);
                localStorage.setItem('user', JSON.stringify(userProfile.user));

                setIsRegistering(false); 
                setNotification("Registration successful and logged in!");
            } else {
                throw new Error("Registration failed.");
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
        setIsRegistering(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };
    
    const handleSaveSeekerProfile = async (updatedSeeker: JobSeeker) => {
        try {
            const savedSeeker = await api.saveSeeker(updatedSeeker);
            
            setSeekers(seekers.map(s => s.id === savedSeeker.id ? savedSeeker : s));
            setCurrentUser(savedSeeker);
            
            // CRITICAL FIX: Manually save the new token/user object for persistence.
            if ((savedSeeker as any).token) {
                 localStorage.setItem('token', (savedSeeker as any).token);
            }
            localStorage.setItem('user', JSON.stringify(savedSeeker)); 
            
            setNotification("Profile updated successfully!");

        } catch (error: any) {
            setNotification(`Profile update failed: ${error.message}`);
        }
    }

    const handleSaveCompanyProfile = async (updatedCompany: Company) => {
        try {
            const savedCompany = await api.saveCompany(updatedCompany);
            setCompanies(companies.map(c => c.id === savedCompany.id ? savedCompany : c));
            setCurrentUser(savedCompany);

            // CRITICAL FIX: Manually save the new token/user object for persistence.
            if ((savedCompany as any).token) {
                localStorage.setItem('token', (savedCompany as any).token);
            }
            localStorage.setItem('user', JSON.stringify(savedCompany));

            setNotification("Profile updated successfully!");

        } catch (error: any) {
            setNotification(`Profile update failed: ${error.message}`);
        }
    }

    const handleAddReview = async (companyId: string, review: Omit<Review, 'id' | 'date' | 'authorId'>) => {
      // NOTE: You are currently missing the api.addReview implementation in apiService.ts 
      // which is needed for this logic block to fully work.
      // Assuming api.addReview is implemented:
      
      // const updatedCompany = await api.addReview(companyId, review);
      // setCompanies(companies.map(c => c.id === companyId ? updatedCompany : c));
      
      // Automatically create a blog post from the review
      // ... (existing auto-post logic)
      // CRITICAL FIX: Uncomment the API call to save the post
      // const savedPost = await api.addBlogPost(newPostData); 
      // setBlogPosts(prev => [savedPost, ...prev]);
      
      setNotification(`Your review for ${companies.find(c => c.id === companyId)?.name} is now live on the blog!`);
    }
    
    const handleCompanySaveJob = async (jobData: Omit<Job, 'id' | 'applicants' | 'shortlisted' | 'rejected'>) => {
        const newJob = await api.saveJob(jobData);
        setJobs(prev => [newJob, ...prev]);
        setNotification("New job posted successfully!");
    }
    
    const handleAdminDelete = async (type: 'job' | 'company' | 'seeker' | 'blogPost', id: string) => {
        // NOTE: You need to implement api.deleteEntity in apiService.ts
    }

    const handleAdminSaveSeeker = async (seeker: JobSeeker) => {
        // NOTE: You need to implement api.saveSeeker in apiService.ts if the ID exists
        const savedSeeker = await api.saveSeeker(seeker);
        if (seekers.some(s => s.id === savedSeeker.id)) {
            setSeekers(seekers.map(s => s.id === savedSeeker.id ? savedSeeker : s));
        } else {
            setSeekers([...seekers, savedSeeker]);
        }
    };

    const handleAdminSaveCompany = async (company: Company) => {
        // NOTE: You need to implement api.saveCompany in apiService.ts if the ID exists
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
        };

        // CRITICAL FIX: Uncomment and implement the API call to save the post
        try {
            const savedPost = await api.addBlogPost(newPostData);
            setBlogPosts(prev => [savedPost, ...prev]);
            setNotification("Blog post created successfully!");
        } catch (error: any) {
            setNotification(`Failed to create blog post: ${error.message}`);
        }
    };

    const handleUpdateBlogPost = async (postId: string, content: string) => {
        // CRITICAL FIX: Uncomment and implement the API call
        try {
            const updatedPost = await api.updateBlogPost(postId, content);
            setBlogPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
            setNotification("Blog post updated successfully!");
        } catch (error: any) {
            setNotification(`Failed to update blog post: ${error.message}`);
        }
    };

    const handleDeleteBlogPost = async (postId: string) => {
        // CRITICAL FIX: Uncomment and implement the API call
        try {
            if (await api.deleteEntity(postId)) {
                setBlogPosts(posts => posts.filter(p => p.id !== postId));
                setNotification("Blog post deleted successfully!");
            }
        } catch (error: any) {
            setNotification(`Failed to delete blog post: ${error.message}`);
        }
    };
    
    const handlePostReaction = async (postId: string, reactionType: ReactionType) => {
        if (!currentUser) return;
        // CRITICAL FIX: Uncomment and implement the API call
        try {
            // Using the updated api.addOrUpdateReaction signature
            const updatedPost = await api.addOrUpdateReaction(postId, reactionType);
            setBlogPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
        } catch (error: any) {
            setNotification(`Failed to react to post: ${error.message}`);
        }
    };

    const handleAddComment = async (postId: string, content: string) => {
        if (!currentUser || !currentUserRole) return;
        
        // CRITICAL FIX: Uncomment and implement the API call
        try {
            const updatedPost = await api.addComment(postId, content);
            setBlogPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
            setNotification("Comment added successfully!");
        } catch (error: any) {
            setNotification(`Failed to add comment: ${error.message}`);
        }
    };

    const handleUpdateComment = async (postId: string, commentId: string, content: string) => {
        // CRITICAL FIX: Uncomment and implement the API call
        try {
            const updatedPost = await api.updateComment(postId, commentId, content);
            setBlogPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
            setNotification("Comment updated successfully!");
        } catch (error: any) {
            setNotification(`Failed to update comment: ${error.message}`);
        }
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        // CRITICAL FIX: Uncomment and implement the API call
        try {
            const updatedPost = await api.deleteComment(postId, commentId);
            setBlogPosts(posts => posts.map(p => p.id === postId ? updatedPost : p));
        } catch (error: any) {
            setNotification(`Failed to delete comment: ${error.message}`);
        }
    };


    if (isLoading && !currentUser) {
        return <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-primary">Loading Job Executive...</div>;
    }

    // RENDER LOGIC FOR UN-AUTHENTICATED USER
    if (!currentUser || !currentUserRole) {
        if (isRegistering) {
            return (
                <RegisterPage 
                    onRegister={handleRegister} 
                    onSwitchToLogin={() => {
                        setIsRegistering(false);
                        setAuthError(null);
                    }} 
                    error={authError} 
                />
            );
        }
        
        return (
            <LoginPage 
                onLogin={handleLogin} 
                error={authError} 
                onSwitchToRegister={() => {
                    setIsRegistering(true);
                    setAuthError(null);
                }} 
            />
        );
    }
    // END RENDER LOGIC

   const renderDashboard = () => {
        switch (currentUserRole) {
            case 'seeker':
                return <SeekerDashboard 
                    seeker={currentUser as JobSeeker}
                    jobs={jobs}
                    companies={companies}
                    onAddReview={handleAddReview}
                    onSaveProfile={handleSaveSeekerProfile}
                    onApplyJob={handleApplyJob} 
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
                return <div className="p-8 text-center text-red-500">Error: Unknown user role. Please logout and try again.</div>;
        }
    }
    // --- End Dashboard Render Logic ---
    
    let currentUserName = 'Admin';
    let currentUserPhoto = `https://i.pravatar.cc/150?u=admin`;
    
    // START FIX BLOCK: Make photo calculation robust in App.tsx
    if (currentUserRole === 'seeker') {
        currentUserName = (currentUser as JobSeeker).name;
        currentUserPhoto = (currentUser as JobSeeker).photoUrl;
    } else if (currentUserRole === 'company') {
        const companyUser = currentUser as Company;
        // Use the logo if available
        currentUserName = companyUser.name;
        currentUserPhoto = companyUser.logo || (currentUser as any).photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyUser.name)}&background=0D83DD&color=fff&size=128`;
        // The cast to (currentUser as any).photoUrl covers the case where the backend adds it for generic use
        // and provides a better prop to BlogPage while it waits for its own fetch.
    }
    // END FIX BLOCK

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