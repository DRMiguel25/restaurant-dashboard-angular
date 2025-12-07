import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Restaurante, RestauranteCreate } from '../models/restaurante.model';
import { AuthService } from './auth.service';

interface ApiResponse<T> {
    error: boolean;
    msg: string;
    data?: T;
    id?: string;
}

@Injectable({
    providedIn: 'root'
})
export class RestaurantService {
    private apiUrl = environment.apiRestaurantUrl;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'simple': environment.simpleAuthHeader,
            'Authorization': token || ''
        });
    }

    private getSimpleHeaders(): HttpHeaders {
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'simple': environment.simpleAuthHeader
        });
    }

    listar(): Observable<ApiResponse<Restaurante[]>> {
        return this.http.get<ApiResponse<Restaurante[]>>(`${this.apiUrl}/restaurantes`, {
            headers: this.getSimpleHeaders()
        });
    }

    obtenerPorId(id: string): Observable<ApiResponse<Restaurante>> {
        return this.http.get<ApiResponse<Restaurante>>(`${this.apiUrl}/restaurantes/${id}`, {
            headers: this.getSimpleHeaders()
        });
    }

    crear(restaurante: RestauranteCreate): Observable<ApiResponse<null>> {
        return this.http.post<ApiResponse<null>>(`${this.apiUrl}/restaurantes`, restaurante, {
            headers: this.getHeaders()
        });
    }

    editar(id: string, restaurante: Partial<RestauranteCreate>): Observable<ApiResponse<null>> {
        return this.http.put<ApiResponse<null>>(`${this.apiUrl}/restaurantes/${id}`, restaurante, {
            headers: this.getHeaders()
        });
    }

    eliminar(id: string): Observable<ApiResponse<null>> {
        return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/restaurantes/${id}`, {
            headers: this.getHeaders()
        });
    }
}
