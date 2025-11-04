
const API_BASE_URL = 'http://localhost:5000/api';

const getToken = () : string | null =>{
    return localStorage.getItem('userToken');
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
    const response = await fetch(url , {
        ...options , 
        headers,
        body: (options.method === 'POST' || options.method === 'PUT') && options.body 
            ? JSON.stringify(options.body) 
            : undefined
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