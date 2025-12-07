import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    email = signal('');
    password = signal('');
    loading = signal(false);
    error = signal('');

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    onSubmit(): void {
        if (!this.email() || !this.password()) {
            this.error.set('Por favor complete todos los campos');
            return;
        }

        this.loading.set(true);
        this.error.set('');

        this.authService.login({
            email: this.email(),
            password: this.password()
        }).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (!response.error) {
                    this.router.navigate(['/dashboard']);
                } else {
                    this.error.set(response.msg || 'Error al iniciar sesión');
                }
            },
            error: (err) => {
                this.loading.set(false);
                this.error.set('Error de conexión con el servidor');
                console.error(err);
            }
        });
    }

    updateEmail(event: Event): void {
        this.email.set((event.target as HTMLInputElement).value);
    }

    updatePassword(event: Event): void {
        this.password.set((event.target as HTMLInputElement).value);
    }
}
