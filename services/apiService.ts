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

const MOCK_DELAY = 200; // ms

// --- MOCK DATABASE ---

// let mockCompanies: Company[] = [
//   {
//     id: 'company1',
//     name: 'Innovate Inc.',
//     email: 'contact@innovate.com',
//     logo: `https://i.pravatar.cc/150?u=contact@innovate.com`,
//     description: 'A leading tech company focused on innovative solutions for the modern world. We value creativity, collaboration, and cutting-edge technology.',
//     website: 'https://innovate.com',
//     contactInfo: '555-0101',
//     officeAddress: '123 Tech Avenue, Silicon Valley, CA',
//     reviews: [
//       { id: 'review1', authorId: 'seeker1', reviewerName: 'Alex Doe', rating: 5, comment: 'Great company culture and challenging projects!', date: new Date(Date.now() - 86400000 * 5).toISOString() },
//     ],
//     jobs: ['job1', 'job2'],
//   },
//   {
//     id: 'company2',
//     name: 'Creative Solutions',
//     email: 'hr@creative.com',
//     logo: `https://i.pravatar.cc/150?u=hr@creative.com`,
//     description: 'We are a design-focused agency that helps brands tell their stories. Our team is passionate about design, strategy, and user experience.',
//     website: 'https://creative.com',
//     contactInfo: '555-0102',
//     officeAddress: '456 Design Blvd, New York, NY',
//     reviews: [
//         { id: 'review2', authorId: 'some-other-user', reviewerName: 'Jane Smith', rating: 4, comment: 'Good work-life balance, but management can be a bit disorganized.', date: new Date(Date.now() - 86400000 * 10).toISOString() },
//     ],
//     jobs: ['job3'],
//   },
// ];

// let mockSeekers: JobSeeker[] = [
//   {
//     id: 'seeker1',
//     name: 'Alex Doe',
//     email: 'alex.doe@example.com',
//     phone: '123-456-7890',
//     photoUrl: `https://i.pravatar.cc/150?u=alex.doe@example.com`,
//     skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
//     resumeUrl: '#',
//     expectedSalary: 90000,
//     appliedJobs: ['job1'],
//     jobAlertsEnabled: true,
//     jobAlertsPreferences: {
//       keywords: ['react', 'frontend'],
//       jobTypes: [JobType.FullTime],
//       locationTypes: [LocationType.Remote, LocationType.Hybrid],
//       minSalary: 80000,
//     }
//   },
// ];

// let mockAdmins: Admin[] = [
//     { id: 'admin1', email: 'admin@jobexecutive.com' }
// ];

// let mockJobs: Job[] = [
//   {
//     id: 'job1',
//     companyId: 'company1',
//     title: 'Senior Frontend Developer',
//     description: 'We are looking for an experienced Frontend Developer to join our team. You will be responsible for building the client-side of our web applications. You should be able to translate our company and customer needs into functional and appealing interactive applications.',
//     location: 'Remote',
//     experienceLevel: 'Senior',
//     salaryMin: 120000,
//     salaryMax: 150000,
//     jobType: JobType.FullTime,
//     locationType: LocationType.Remote,
//     applicants: ['seeker1'],
//     shortlisted: [],
//     rejected: [],
//   },
//   {
//     id: 'job2',
//     companyId: 'company1',
//     title: 'Product Manager',
//     description: 'As a Product Manager, you will be responsible for the product planning and execution throughout the Product Lifecycle, including: gathering and prioritizing product and customer requirements, defining the product vision, and working closely with engineering, sales, marketing and support to ensure revenue and customer satisfaction goals are met.',
//     location: 'Silicon Valley, CA',
//     experienceLevel: 'Mid-Level',
//     salaryMin: 100000,
//     salaryMax: 130000,
//     jobType: JobType.FullTime,
//     locationType: LocationType.Onsite,
//     applicants: [],
//     shortlisted: [],
//     rejected: [],
//   },
//   {
//     id: 'job3',
//     companyId: 'company2',
//     title: 'UI/UX Designer',
//     description: 'We are seeking a talented UI/UX Designer to create amazing user experiences. The ideal candidate should have an eye for clean and artful design, possess superior UI skills and be able to translate high-level requirements into interaction flows and artifacts, and transform them into beautiful, intuitive, and functional user interfaces.',
//     location: 'New York, NY',
//     experienceLevel: 'Entry-Level',
//     salaryMin: 60000,
//     salaryMax: 80000,
//     jobType: JobType.Contract,
//     locationType: LocationType.Hybrid,
//     applicants: [],
//     shortlisted: [],
//     rejected: [],
//   },
// ];

// let mockBlogPosts: BlogPost[] = [
//   {
//     id: 'post1',
//     authorId: 'seeker1',
//     authorName: 'Alex Doe',
//     authorRole: 'seeker',
//     authorPhotoUrl: mockSeekers[0].photoUrl,
//     content: "Just had a great interview experience with Innovate Inc. Very professional team!",
//     timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
//     reactions: [
//       { userId: 'company1', type: 'like' },
//     ],
//     comments: [
//       { id: 'comment1', authorId: 'company1', authorName: 'Innovate Inc.', authorPhotoUrl: mockCompanies[0].logo, content: 'Glad to hear that, Alex! We enjoyed our conversation as well.', timestamp: new Date(Date.now() - 86400000).toISOString() },
//     ],
//   },
// ];


// --- API FUNCTIONS ---
// const findUser = (email: string, role: UserRole) => {
//     if (role === 'seeker') return mockSeekers.find(u => u.email === email);
//     if (role === 'company') return mockCompanies.find(u => u.email === email);
//     if (role === 'admin') return mockAdmins.find(u => u.email === email);
//     return null;
// }

// export const api = {
//   authenticateUser: async (email: string, password: string, role: UserRole): Promise<{ user: User; role: UserRole } | null> => {
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         const user = findUser(email, role);
//         if (user) {
//           resolve({ user, role });
//         } else {
//           // In this mock, we don't handle user creation on login, just failure.
//           reject(new Error('User not found. Please check your email and role.'));
//         }
//       }, MOCK_DELAY);
//     });
//   },

//   logout: async (): Promise<void> => {
//     return Promise.resolve();
//   },
  
//   getUserProfile: async (uid: string): Promise<{ user: User; role: UserRole } | null> => {
//      return new Promise(resolve => {
//         setTimeout(() => {
//             let user: User | undefined;
//             let role: UserRole | undefined;

//             user = mockSeekers.find(u => u.id === uid);
//             if (user) role = 'seeker';
            
//             if (!user) {
//                 user = mockCompanies.find(u => u.id === uid);
//                 if(user) role = 'company';
//             }

//             if (!user) {
//                 user = mockAdmins.find(u => u.id === uid);
//                  if(user) role = 'admin';
//             }
            
//             if(user && role) {
//                 resolve({ user, role });
//             } else {
//                 resolve(null);
//             }
//         }, MOCK_DELAY)
//      })
//   },

//   getSeekers: async (): Promise<JobSeeker[]> => Promise.resolve([...mockSeekers]),
//   getCompanies: async (): Promise<Company[]> => Promise.resolve([...mockCompanies]),
//   getJobs: async (): Promise<Job[]> => Promise.resolve([...mockJobs]),
//   getBlogPosts: async (): Promise<BlogPost[]> => Promise.resolve([...mockBlogPosts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())),

//   saveSeeker: async (seekerData: JobSeeker): Promise<JobSeeker> => {
//       mockSeekers = mockSeekers.map(s => s.id === seekerData.id ? seekerData : s);
//       return Promise.resolve(seekerData);
//   },
  
//   saveCompany: async (companyData: Company): Promise<Company> => {
//       mockCompanies = mockCompanies.map(c => c.id === companyData.id ? companyData : c);
//       return Promise.resolve(companyData);
//   },

//   addReview: async(companyId: string, review: Omit<Review, 'id' | 'date'>): Promise<Company> => {
//       const company = mockCompanies.find(c => c.id === companyId);
//       if (!company) throw new Error("Company not found");
//       const newReview: Review = { 
//           ...review, 
//           id: `review-${Date.now()}`,
//           date: new Date().toISOString() 
//       };
//       company.reviews.push(newReview);
//       return Promise.resolve({ ...company });
//   },

//   saveJob: async(jobData: Job | Omit<Job, 'id' | 'applicants' | 'shortlisted' | 'rejected'>): Promise<Job> => {
//     if ('id' in jobData && jobData.id) { // Update
//         mockJobs = mockJobs.map(j => j.id === jobData.id ? jobData as Job : j);
//         return Promise.resolve(jobData as Job);
//     } else { // Create
//         const newJob: Job = {
//             id: `job-${Date.now()}`,
//             ...jobData,
//             applicants: [],
//             shortlisted: [],
//             rejected: []
//         };
//         mockJobs.unshift(newJob);
//         return Promise.resolve(newJob);
//     }
//   },
  
//   addBlogPost: async(postData: Omit<BlogPost, 'id' | 'timestamp' | 'reactions' | 'comments'>): Promise<BlogPost> => {
//       const newPost: BlogPost = {
//           ...postData,
//           id: `post-${Date.now()}`,
//           timestamp: new Date().toISOString(),
//           reactions: [],
//           comments: [],
//       };
//       mockBlogPosts.unshift(newPost);
//       return Promise.resolve(newPost);
//   },
  
//   updateBlogPost: async(postId: string, content: string): Promise<BlogPost> => {
//     const post = mockBlogPosts.find(p => p.id === postId);
//     if (!post) throw new Error("Post not found");
//     post.content = content;
//     return Promise.resolve({ ...post });
//   },
  
//   addOrUpdateReaction: async(postId: string, userId: string, type: ReactionType): Promise<BlogPost> => {
//     const post = mockBlogPosts.find(p => p.id === postId);
//     if (!post) throw new Error("Post not found");

//     const existingIndex = post.reactions.findIndex(r => r.userId === userId);
//     if (existingIndex > -1) {
//         if (post.reactions[existingIndex].type === type) {
//             // Same reaction, so remove it (toggle off)
//             post.reactions.splice(existingIndex, 1);
//         } else {
//             // Different reaction, so update it
//             post.reactions[existingIndex].type = type;
//         }
//     } else {
//         // No existing reaction, so add it
//         post.reactions.push({ userId, type });
//     }
//     return Promise.resolve({ ...post });
//   },

//   addComment: async(postId: string, commentData: Omit<Comment, 'id' | 'timestamp'>): Promise<BlogPost> => {
//     const post = mockBlogPosts.find(p => p.id === postId);
//     if (!post) throw new Error("Post not found");
//     const newComment: Comment = {
//       ...commentData,
//       id: `comment-${Date.now()}`,
//       timestamp: new Date().toISOString()
//     };
//     post.comments.push(newComment);
//     return Promise.resolve({ ...post });
//   },

//   updateComment: async(postId: string, commentId: string, content: string): Promise<BlogPost> => {
//     const post = mockBlogPosts.find(p => p.id === postId);
//     if (!post) throw new Error("Post not found");
//     const comment = post.comments.find(c => c.id === commentId);
//     if (!comment) throw new Error("Comment not found");
//     comment.content = content;
//     return Promise.resolve({ ...post });
//   },

//   deleteComment: async(postId: string, commentId: string): Promise<BlogPost> => {
//     const post = mockBlogPosts.find(p => p.id === postId);
//     if (!post) throw new Error("Post not found");
//     post.comments = post.comments.filter(c => c.id !== commentId);
//     return Promise.resolve({ ...post });
//   },

//   deleteEntity: async(type: 'job' | 'company' | 'seeker' | 'blogPost', id: string): Promise<boolean> => {
//     if (type === 'job') mockJobs = mockJobs.filter(j => j.id !== id);
//     if (type === 'company') {
//         mockCompanies = mockCompanies.filter(c => c.id !== id);
//         mockJobs = mockJobs.filter(j => j.companyId !== id);
//     }
//     if (type === 'seeker') mockSeekers = mockSeekers.filter(s => s.id !== id);
//     if (type === 'blogPost') mockBlogPosts = mockBlogPosts.filter(p => p.id !== id);
//     return Promise.resolve(true);
//   }
// };

export const api = {
authenticateUser: async (email: String , password : String , role : UserRole): Promise<{ user: User , role: UserRole}>  =>{
   const response = await apiFetch('/auth/login' , { // Corrected endpoint: /auth/login
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
    // Calls the POST /api/auth/register endpoint
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
    localStorage.removeItem('token');
    return Promise.resolve();

  },
  getUserProfile : async(uid:string) : Promise<{user: User , role : UserRole} | null>=>{
    return null
  } , 
getSeekers: async() : Promise<JobSeeker[]>=>{
    return apiFetch('/user?role=seeker' , { method : 'GET'})
  },
  getCompanies : async(): Promise<Company[]>=>{
    return apiFetch('/user?role=company' , { method : 'GET'}) // <--- FIX 9: Added leading slash
  },
  getJobs : async(): Promise<Job[]>=>{
    return apiFetch('/jobs' , {method:'GET'})
  },
  getBlogPosts: async() : Promise<BlogPost[]>=>{
    return [];
  } , 

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
}
