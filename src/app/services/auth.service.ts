import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
    LoginRequest,
    SignupRequest,
    AuthResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    User
} from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiAuthUrl;

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'simple': environment.simpleAuthHeader
        });
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials, {
            headers: this.getHeaders()
        }).pipe(
            tap(response => {
                if (!response.error && response.token) {
                    this.setToken(response.token);
                    if (response.user) {
                        this.setUser(response.user);
                    }
                }
            })
        );
    }

    signup(data: SignupRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, data, {
            headers: this.getHeaders()
        });
    }

    forgotPassword(data: ForgotPasswordRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, data, {
            headers: this.getHeaders()
        });
    }

    resetPassword(data: ResetPasswordRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password`, data, {
            headers: this.getHeaders()
        });
    }

    setToken(token: string): void {
        localStorage.setItem('jwt_token', token);
    }

    getToken(): string | null {
        return localStorage.getItem('jwt_token');
    }

    setUser(user: User): void {
        localStorage.setItem('current_user', JSON.stringify(user));
    }

    getUser(): User | null {
        const user = localStorage.getItem('current_user');
        return user ? JSON.parse(user) : null;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    logout(): void {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('current_user');
    }
}
