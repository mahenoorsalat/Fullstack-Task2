/**
 * Mock API Service
 * This file simulates a backend API service using in-memory data.
 * It's designed to be a drop-in replacement for the previous Firebase service,
 * allowing the frontend to function while the Django/PostgreSQL backend is being developed.
 */
import { Job, Company, JobSeeker, Admin, Review, BlogPost, ReactionType, Reaction, Comment, JobType, LocationType } from '../types';
// The import for apiFetch is likely resolved if the files are merged, but kept for context.
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
        // FIX 1: Use the consistent key 'token' (which App.tsx expects)
        localStorage.setItem('token' , token); 
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
      // FIX 1: Use the consistent key 'token' (which App.tsx expects)
      localStorage.setItem('token', token);
      return { user: userData as User, role: userData.role as UserRole };
    }
    throw new Error('Registration Failed: no token received');
  },

  logout: async (): Promise<void>=>{
    // FIX 2: Ensure all login state keys are removed
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // App.tsx relies on removing this key too
    return Promise.resolve();

  },
  // FIX 3: Implement actual profile fetch logic
  getUserProfile : async(uid:string) : Promise<{user: User , role : UserRole} | null>=>{
    // This calls the protected endpoint to get the current user profile from the backend
    const response = await apiFetch('/auth/profile', { method: 'GET' });
    // Assuming backend returns the full user object, which includes the role
    return {user: response as User, role: response.role as UserRole };
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
    return apiFetch ('/blog' , {method:"POST" , body : postData })
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
  // FIXED: Removed unused userId parameter
  addOrUpdateReaction : async(postId : string , type : ReactionType): Promise<BlogPost>=>{
    return apiFetch(`/blog/${postId}/react` , {method:'POST' , body:{type}}) 
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
}


const API_BASE_URL = 'http://localhost:5000/api';

const getToken = () : string | null =>{
    // FIX 4: Retrieve from 'token' key
    return localStorage.getItem('token'); 
}

export const apiFetch = async(endpoint:string , options: RequestInit ={}): Promise<any>=>{
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getToken();

    const headers : HeadersInit = {
        'Content-Type' : 'application/json' , 
        ...options.headers , 
    };

    if(token){
        headers['Authorization'] = `Bearer ${token}`; 
    };
    
    // Logic for sending the request body correctly (fixes potential body bugs in fetch)
    const bodyContent = (options.method === 'POST' || options.method === 'PUT') && options.body 
            ? JSON.stringify(options.body) 
            : undefined;

    const response = await fetch(url , {
        ...options , 
        headers,
        body: bodyContent // Use the correctly stringified body
    });
    if(!response.ok){
      const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);  
    };
    if (response.status === 204) {
        return null;
    }

    return response.json();
}