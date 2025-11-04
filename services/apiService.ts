// services/apiService.ts

/**
 * Mock API Service
 * This file simulates a backend API service using in-memory data.
 * It's designed to be a drop-in replacement for the previous Firebase service,
 * allowing the frontend to function while the Django/PostgreSQL backend is being developed.
 */
// FIX: Added 'Application' to the import list to resolve "Application is not defined" error.
import { Job, Company, JobSeeker, Admin, Review, BlogPost, ReactionType, Reaction, Comment, JobType, LocationType, Application } from '../types';
import { apiFetch } from './apiClient'

// NEW: Define the type for the status update parameter
export type ApplicationStatus = Application['status']; // Reuses the type from Application interface

// NEW: Define the search parameters interface (needed for getJobs, included for completeness)
interface JobSearchParams {
    keyword?: string; 
    location?: string;
    type?: JobType | string;
    minSalary?: number;
    companyName?: string; 
}


type UserRole = 'seeker' | 'company' | 'admin';
type User = JobSeeker | Company | Admin;

// --- API FUNCTIONS ---
export const api = {
    authenticateUser: async (email: String , password : String , role : UserRole): Promise<{ user: User , role: UserRole}>  =>{
       const response = await apiFetch('/auth/login' , {
        method : 'POST' , 
        body: {email , password , role}, 
        headers : { 'Content-Type' : 'application/json'}
       });

       const { token , ...userData} = response; 
       if(token) {
        localStorage.setItem('userToken' , token);
        return{user : userData as User , role : userData.role as UserRole };
       }
       // FIX: The compiler expects this 'throw' statement here, correctly outside the 'if' block.
       throw new Error ('Login Failed : no token received')
     }, // This closing brace and comma end the authenticateUser method.

      registerUser: async (name: string, email: string, password: string, role: UserRole): Promise<{ user: User, role: UserRole }> => {
        const response = await apiFetch('/auth/register', {
          method: 'POST',
          body: { name, email, password, role },
          headers: { 'Content-Type': 'application/json' }
        });

        const { token, ...userData } = response;
        if (token) {
          localStorage.setItem('userToken', token);
          return { user: userData as User, role: userData.role as UserRole };
        }
        throw new Error('Registration Failed: no token received');
      },

    logout: async (): Promise<void>=>{
        localStorage.removeItem('userToken'); 
        return Promise.resolve();
    },

    getUserProfile : async(uid:string) : Promise<{user: User , role : UserRole} | null>=>{
        try {
            const user = await api.getProfile(); 
            if (user) {
                return { user: user as User, role: user.role as UserRole };
            }
            return null;
        } catch (error) {
            console.error("Failed to fetch user profile for re-hydration:", error);
            await api.logout(); 
            return null;
        }
    } ,
    getSeekers: async() : Promise<JobSeeker[]>=>{
        return apiFetch('/user?role=seeker' , { method : 'GET'})
      },
      getCompanies : async(): Promise<Company[]>=>{
        return apiFetch('/user?role=company' , { method : 'GET'})
      },
      // FIX: Updated getJobs to accept search params
      getJobs : async(params: JobSearchParams = {}): Promise<Job[]>=>{
        const query = new URLSearchParams(params as Record<string, any>).toString();
         const endpoint = query ? `/jobs?${query}` : '/jobs';
        return apiFetch(endpoint , {method:'GET'})
      },
     getJobById: async (jobId: string): Promise<Job> => {
    // This calls the GET /api/v1/jobs/:id endpoint you set up on the backend
    return apiFetch(`/jobs/${jobId}`, { method: 'GET' });
},
      getCompanyJobs: async (): Promise<Job[]> => {
        return apiFetch('/jobs/employer/jobs', { method: 'GET' });
      },
    applyToJob: async (jobId: string): Promise<any> => {
        return apiFetch(`/applications/job/${jobId}`, { method: 'POST' }); 
    },
    // NEW FUNCTION: For Job Seeker to get all their applications
    getSeekerApplications: async (): Promise<Application[]> => {
        // Corresponds to the backend GET /api/applications/
        return apiFetch('/applications', { method: 'GET' });
    },
    
    // NEW FUNCTION: For Company/Admin to update application status
    updateApplicationStatus: async (applicationId: string, status: ApplicationStatus): Promise<Application> => {
        // Corresponds to the backend PUT /api/applications/:id/status
        return apiFetch(`/applications/${applicationId}/status`, { 
            method: 'PUT',
            body: { status } // Pass the new status in the request body
        });
    },
    getProfile: async (): Promise<User> => {
        const user = await apiFetch('/auth/profile', { method: 'GET' }); 
        
        if (user.role === 'company') {
            const companyUser = user as Company;

            const robustName = companyUser.name || companyUser.description || companyUser.website || 'Your Company Profile';
            companyUser.name = robustName;

            if (!companyUser.photoUrl) {
                // If photoUrl is missing/empty, use logo, or a placeholder based on the name
                const fallbackPhotoUrl = companyUser.logo 
                    || `https://ui-avatars.com/api/?name=${encodeURIComponent(robustName)}&background=0D83DD&color=fff&size=128`;
                
                (user as any).photoUrl = fallbackPhotoUrl; // Assign to photoUrl for consistency
            }
        }
        return user; 
    },
      saveSeeker:async(seekerData: JobSeeker) : Promise<JobSeeker>=>{
        return apiFetch('/auth/profile' , {method : 'PUT' , body : seekerData})
      },
       saveCompany:async(companyData: Company) : Promise<Company>=>{
        return apiFetch('/auth/profile' , {method : 'PUT' , body : companyData})
      },
     saveJob: async(jobData: Job | Omit<Job, 'id' | 'applicants' | 'shortlisted' | 'rejected'>): Promise<Job> => {
        if ('id' in jobData && jobData.id) { // Update
            // PUT /jobs/:id
            return apiFetch(`/jobs/${jobData.id}`, { method: 'PUT', body: jobData });
        } else { // Create
            // POST /jobs
            return apiFetch('/jobs', { method: 'POST', body: jobData });
        }
      }, 
      getBlogPosts: async() : Promise<BlogPost[]>=>{
        return apiFetch('/blog' , {method:'GET'})
      } , 
 addBlogPost:async(postData:Omit<BlogPost , 'id' | 'timestamp' | 'reactions' | 'comments'>):Promise<BlogPost>=>{
        // The body parameter here sends the full JSON object including 'content'
        const response = await apiFetch ('/blog' , {method:"POST" , body : postData });
        
        if (response && response.post) {
            return response.post as BlogPost; 
        }
        
        return response as BlogPost;
      } ,
      updateBlogPost : async (postId:string , content:string):Promise<BlogPost>=>{
        return apiFetch(`/blog/${postId}` , {method:'PUT' , body:{content}})
      },
  deleteBlogPost: async (postId: string): Promise<boolean> => {
        return api.deleteEntity('blogPost', postId);
    },

    // FIX 2 & 3: Final implementation for entity deletion (resolves job, user, and general deletion issues)
    deleteEntity : async(type:'job'|'company'| 'seeker' | 'blogPost' , id:string) : Promise<boolean>=>{
        if(type === 'blogPost'){
            // DELETE /blog/:id
            await apiFetch(`/blog/${id}` , {method : 'DELETE'});
            return true ; 
        }
        if (type === 'seeker' || type === 'company') {
            // DELETE /user/admin/users/:id (Used by AdminDashboard)
            await apiFetch(`/user/admin/users/${id}`, { method: 'DELETE' }); 
            return true;
        }
        if (type === 'job') {
            // DELETE /jobs/:id (Used by CompanyDashboard and AdminDashboard)
            await apiFetch(`/jobs/${id}`, { method: 'DELETE' }); 
            return true;
        }
        return false ; 
    },
   addOrUpdateReaction: async (postId: string, reactionType: ReactionType): Promise<BlogPost> => {
    return apiFetch(`/blog/${postId}/react`, { method: 'PUT', body: { type: reactionType } }); 
},

      addComment : async(postId : string , content : string): Promise<BlogPost>=>{
        return apiFetch(`/blog/${postId}/comment` , {method:'POST' , body:{content}})
      },
     updateComment:async(postId : string , commentId : string , content : string): Promise<BlogPost>=>{
       return apiFetch(`/blog/${postId}/comment/${commentId}` , {method:"PUT" , body:{content}})
      }
      ,
      deleteComment: async(postId: string , commentId:string ): Promise<BlogPost>=>{
        return apiFetch(`/blog/${postId}/comment/${commentId}` , {method : 'DELETE'} );
      },
    // NEW: Function to fetch all users for Admin
    getAdminUsers: async (): Promise<User[]> => {
        // GET /user/admin/users
        return apiFetch('/user/admin/users', { method: 'GET' });
    },
getApplicationsForJob: async (jobId: string): Promise<Application[]> => {
    return apiFetch(`/applications/job/${jobId}`, { method: 'GET' });
},
}