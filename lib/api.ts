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
  createdAt?: string;
}

export interface Job {
  job_id: string;
  company_id: string;
  title: string;
  location: string;
  work_policy: string;
  department: string;
  employment_type: string;
  experience_level: string;
  job_type: string;
  salary_range: string;
  description: string;
  status: "active" | "archived";
  createdAt: string;
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

  getByUserId: async (userId: string): Promise<Company> => {
    const res = await fetch(`${API_URL}/company/user/${userId}`);
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
export const jobAPI = {
  getByCompanyId: async (companyId: string): Promise<Job[]> => {
    const res = await fetch(`${API_URL}/jobs/company/${companyId}`);
    return handleResponse(res);
  },

  getById: async (jobId: string): Promise<Job> => {
    const res = await fetch(`${API_URL}/jobs/${jobId}`);
    return handleResponse(res);
  },

  create: async (
    companyId: string,
    jobData: Omit<Job, "job_id" | "company_id" | "createdAt">,
    token: string
  ): Promise<Job> => {
    const res = await fetch(`${API_URL}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ company_id: companyId, ...jobData }),
    });
    return handleResponse(res);
  },

  update: async (
    jobId: string,
    data: Partial<Job>,
    token: string
  ): Promise<Job> => {
    const res = await fetch(`${API_URL}/jobs/${jobId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (jobId: string, token: string): Promise<void> => {
    const res = await fetch(`${API_URL}/jobs/${jobId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to delete job");
  },

  uploadDoc: async (data: any, folderPath?: any): Promise<any> => {
    if (folderPath !== undefined) data.append("folder", folderPath);
    // return userService.post("/media/upload-doc", data, {
    //   headers: {
    //     "Content-Type": "multipart/form-data",
    //     Authorization: `Bearer ` + getCookie("token"),
    //   },
    // });
    return fetch(`${API_URL}/files/upload-doc`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${getCookie("token")}`,
      },
      body: data,
    });
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
