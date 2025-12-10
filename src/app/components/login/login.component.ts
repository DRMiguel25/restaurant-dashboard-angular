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

    // Error message translations
    private errorMessages: { [key: string]: string } = {
        'no_user': 'Este correo no está registrado. ¿Quieres crear una cuenta?',
        'invalid_credentials': 'La contraseña es incorrecta. Intenta de nuevo.',
        'empty_params': 'Por favor completa todos los campos',
        'not_token': 'Error de autenticación. Intenta de nuevo.',
        'account_deleted': 'Esta cuenta ha sido eliminada. Puedes registrarte nuevamente.',
    };

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    private translateError(errorCode: string): string {
        return this.errorMessages[errorCode] || 'Error al iniciar sesión. Intenta de nuevo.';
    }

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
                    // Translate backend error codes to user-friendly messages
                    this.error.set(this.translateError(response.msg));
                }
            },
            error: (err) => {
                this.loading.set(false);
                // Handle HTTP errors
                if (err.status === 400 && err.error?.msg) {
                    this.error.set(this.translateError(err.error.msg));
                } else if (err.status === 0) {
                    this.error.set('No se pudo conectar al servidor. Verifica tu conexión.');
                } else {
                    this.error.set('Error de conexión con el servidor');
                }
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
