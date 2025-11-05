// Based on auth_dto.go
export interface LoginRequest {
    phone: string;
    password: string;
}

export interface RegisterRequest {
    phone: string;
    password: string;
    code: string;
    email?: string; // Optional based on DTO
}

export interface User {
    user_id: number;
    phone: string;
    role: string;
    last_visit_time: string;
}

// Response interface for users list API
export interface UsersListResponse {
    users: User[];
    total: number;
}

// Based on nft_data_dto.go
export interface NftInfo {
    token_id: number;
    name: string;
    description: string;
    cid_v0: string;
    cid_v1: string;
    image: string;
    ipfs_image_link: string;
}

export interface CreateNftDataRequest {
    id: number;
    description: string;
    file: File;
}
