/**
 * Mock API Service
 * This file simulates a backend API service using in-memory data.
 * It's designed to be a drop-in replacement for the previous Firebase service,
 * allowing the frontend to function while the Django/PostgreSQL backend is being developed.
 */
import { Job, Company, JobSeeker, Admin, Review, BlogPost, ReactionType, Reaction, Comment, JobType, LocationType } from '../types';
import { apiFetch } from './apiClient'
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
       throw new Error ('Login Failed : no token received')
      },

      // NEW/FIXED: registerUser function is correctly defined here
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
      getJobs : async(): Promise<Job[]>=>{
        return apiFetch('/jobs' , {method:'GET'})
      },
     
      getCompanyJobs: async (): Promise<Job[]> => {
        return apiFetch('/jobs/employer/jobs', { method: 'GET' });
      },
applyToJob: async (jobId: string): Promise<any> => {
        return apiFetch(`/applications/job/${jobId}`, { method: 'POST' }); 
    },
    getProfile: async (): Promise<User> => {
        return apiFetch('/auth/profile', { method: 'GET' }); 
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
        const response = await apiFetch ('/blog' , {method:"POST" , body : postData });
        
        // FIX: We must explicitly return the 'post' property from the response object.
        if (response && response.post) {
            return response.post as BlogPost; // <--- This is the essential change
        }
        
        // Fallback (should not be reached if backend fix is applied)
        return response as BlogPost;
      } ,
      updateBlogPost : async (postId:string , content:string):Promise<BlogPost>=>{
        return apiFetch(`/blog/${postId}` , {method:'PUT' , body:{content}})
      },
      deleteEntity : async(type:'job'|'company'| 'seeker' | 'blogPost' , id:string) : Promise<boolean>=>{
        if(type === 'blogPost'){
          await apiFetch(`/blog/${id}` , {method : 'DELETE'});
          return true ; 
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
        await apiFetch(`/blog/${postId}/comment/${commentId}` , {method : 'DELETE'} );
        return apiFetch(`/blog/${postId}` , {method  : 'GET'});
      },
    getApplicationsForJob: async (jobId: string): Promise<Application[]> => {
    return apiFetch(`/applications/job/${jobId}`, { method: 'GET' });
},
}