export interface User {
    id: string;
    nombre: string;
    apellidos: string;
    email: string;
    telefono?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    nombre: string;
    apellidos: string;
    email: string;
    password: string;
    telefono?: string;
}

export interface AuthResponse {
    error: boolean;
    msg: string;
    token?: string;
    user?: User;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    codigo: string;
    newPassword: string;
}
