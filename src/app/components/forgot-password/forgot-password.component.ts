import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
    step = signal(1); // 1: email, 2: code + new password
    email = signal('');
    codigo = signal('');
    newPassword = signal('');
    confirmPassword = signal('');
    loading = signal(false);
    error = signal('');
    success = signal('');

    // Error message translations
    private errorMessages: { [key: string]: string } = {
        'no_user': 'Este correo no está registrado en el sistema.',
        'invalid_code': 'El código de verificación es incorrecto o ha expirado.',
        'pipedream_error': 'Error al enviar el correo. Intenta de nuevo en unos minutos.',
        'error_updating_password': 'Error al actualizar la contraseña. Intenta de nuevo.',
        'empty_params': 'Por favor completa todos los campos',
    };

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    private translateError(errorCode: string): string {
        return this.errorMessages[errorCode] || 'Ocurrió un error. Intenta de nuevo.';
    }

    requestCode(): void {
        if (!this.email()) {
            this.error.set('Por favor ingrese su correo electrónico');
            return;
        }

        this.loading.set(true);
        this.error.set('');

        this.authService.forgotPassword({ email: this.email() }).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (!response.error) {
                    this.success.set('Se ha enviado un código de recuperación a tu correo');
                    this.step.set(2);
                } else {
                    this.error.set(this.translateError(response.msg));
                }
            },
            error: (err) => {
                this.loading.set(false);
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

    resetPassword(): void {
        this.error.set('');

        if (!this.codigo() || !this.newPassword()) {
            this.error.set('Por favor complete todos los campos');
            return;
        }

        if (this.newPassword() !== this.confirmPassword()) {
            this.error.set('Las contraseñas no coinciden');
            return;
        }

        if (this.newPassword().length < 6) {
            this.error.set('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        this.loading.set(true);

        this.authService.resetPassword({
            email: this.email(),
            codigo: this.codigo(),
            newPassword: this.newPassword()
        }).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (!response.error) {
                    this.success.set('Contraseña actualizada exitosamente. Redirigiendo...');
                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 2000);
                } else {
                    this.error.set(this.translateError(response.msg));
                }
            },
            error: (err) => {
                this.loading.set(false);
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

    updateField(field: 'email' | 'codigo' | 'newPassword' | 'confirmPassword', event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this[field].set(value);
    }

    goBack(): void {
        this.step.set(1);
        this.error.set('');
        this.success.set('');
    }
}
