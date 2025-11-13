import { getCookie } from "cookies-next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// ====== Interfaces ======
export interface AuthResponse {
  token: string;
  user: {
    user_id: string;
    name: string;
    email: string;
  };
  company: {
    company_id: string;
    name: string;
    slug: string;
  };
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  company?: {
    company_id: string;
    name: string;
    slug: string;
  };
}

export interface Company {
  company_id: string;
  website: string;
  name: string;
  slug: string;
  user_id: string;
  description?: string;
  logo_url?: {
    url?: any;
    name?: any;
    mimetype?: any;
  };

  banner_url?: {
    url?: any;
    name?: any;
    mimetype?: any;
  };
  culture_video_url?: {
    url?: any;
    name?: any;
    mimetype?: any;
  };
  theme?: {
    primary_color?: string;
    secondary_color?: string;
    text_color?: string;
    background_color?: string;
  };
  sections?: any[];
  published?: string;
  created_at?: string;
  updated_at?: string;
}

// ====== Helper ======
async function handleResponse(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API Error");
  }
  return res.json();
}

// ====== Auth API ======
export const authAPI = {
  register: async (
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    return handleResponse(res);
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  getUserById: async (userId: string): Promise<User> => {
    const res = await fetch(`${API_URL}/users/?user_id=${userId}`, {
      method: "GET",
      // bearer token
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("token")}`,
      },
    });
    return handleResponse(res);
  },
};

// ====== Company API ======
export const companyAPI = {
  getBySlug: async (slug: string): Promise<Company> => {
    const res = await fetch(`${API_URL}/company/?slug=${slug}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("token")}`,
      },
    });
    return handleResponse(res);
  },
  getById: async (id: string): Promise<Company> => {
    const res = await fetch(`${API_URL}/company/details?company_id=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("token")}`,
      },
    });
    return handleResponse(res);
  },

  create: async (data: any): Promise<Company> => {
    const res = await fetch(`${API_URL}/company/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (
    companyId: string,
    data: Partial<Company>
  ): Promise<Company> => {
    const res = await fetch(`${API_URL}/company/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: JSON.stringify({ ...data, company_id: companyId }),
    });
    return handleResponse(res);
  },

  getAll: async (): Promise<Company[]> => {
    const res = await fetch(`${API_URL}/company`);
    return handleResponse(res);
  },
};

// ====== Job API ======
// ===== Interfaces =====
export interface Job {
  job_id: string;
  company_id: string;
  title: string;
  description: string;
  location?: string;
  work_policy?: "Remote" | "Hybrid" | "Onsite";
  department?: string;
  employment_type?: string;
  experience_level?: string;
  job_type?: string;
  salary_type?: "CONFIDENTIAL" | "RANGE" | "FIXED";
  salary_frequency?: "MONTHLY" | "YEARLY";
  min_salary?: number;
  max_salary?: number;
  salary_fixed?: number;
  currency?: string;
  posted_at?: string;
  status?: "OPEN" | "CLOSED";
}
export interface JobFilters {
  job_id?: string;
  company_id: string;
  search?: string;
  work_policy?: string;
  department?: string;
  employment_type?: string;
  experience_level?: string;
  job_type?: string;
  salary_type?: string;
  location?: string;
  status?: string;
  skip?: number;
  limit?: number;
  sort_by?: string;
}
export interface JobListResponse {
  result: Job[];
  metadata: {
    totalCount: number;
    openJobs: number;
    closedJobs: number;
  };
}

// ===== Job API =====
export const jobAPI = {
  // 🟢 Create a new job
  create: async (data: Omit<Job, "job_id">): Promise<Job> => {
    const res = await fetch(`${API_URL}/jobs/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // 🟠 Update a job
  update: async (jobId: string, data: Partial<Job>): Promise<Job> => {
    const res = await fetch(`${API_URL}/jobs/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: JSON.stringify({ ...data, job_id: jobId }),
    });
    return handleResponse(res);
  },

  // 🟣 Get all jobs (with optional filters/pagination)
  getAllJobs: async (filters: JobFilters): Promise<JobListResponse> => {
    // ✅ Build query params dynamically
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const res = await fetch(`${API_URL}/jobs/list?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
    });

    return handleResponse(res);
  },

  // 🔵 Get job by ID
  getById: async (jobId: string): Promise<Job> => {
    const res = await fetch(`${API_URL}/jobs?job_id=${jobId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
    });
    return handleResponse(res);
  },

  // 🔴 Delete a job
  delete: async (jobId: string): Promise<{ success: boolean }> => {
    const res = await fetch(`${API_URL}/jobs/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: JSON.stringify({ job_id: jobId }),
    });
    return handleResponse(res);
  },
};

export const filesAPI = {
  upload: async (
    formData: FormData,
    folderPath?: string
  ): Promise<{
    url: string;
    name: string;
    mime_type: string;
    folder?: string;
    key?: string;
  }> => {
    if (folderPath) formData.append("folder", folderPath);

    const res = await fetch(`${API_URL}/files/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "File upload failed");
    }

    // ✅ Return parsed JSON directly
    const data = await res.json();
    return data;
  },
};
