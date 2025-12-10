import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfettiService } from '../../services/confetti.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css'
})
export class RegisterComponent {
    nombre = signal('');
    apellidos = signal('');
    email = signal('');
    password = signal('');
    confirmPassword = signal('');
    telefono = signal('');
    loading = signal(false);
    error = signal('');
    success = signal('');

    // Validation error signals
    emailError = signal('');
    phoneError = signal('');
    passwordError = signal('');

    // Validation patterns
    private phonePattern = /^[0-9]{10}$/;
    private emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Error message translations
    private errorMessages: { [key: string]: string } = {
        'email_already_exists': 'Este correo ya está registrado. ¿Ya tienes una cuenta?',
        'empty_params': 'Por favor completa todos los campos requeridos',
        'incorrect_insert': 'Error al crear la cuenta. Intenta de nuevo.',
    };;

    // Computed: check if form is valid
    isFormValid = computed(() => {
        const hasRequiredFields = this.nombre() && this.apellidos() && this.email() && this.password();
        const noErrors = !this.emailError() && !this.phoneError() && !this.passwordError();
        const passwordsMatch = this.password() === this.confirmPassword();
        const phoneValid = !this.telefono() || this.phonePattern.test(this.telefono());
        return hasRequiredFields && noErrors && passwordsMatch && phoneValid;
    });

    constructor(
        private authService: AuthService,
        private router: Router,
        private confettiService: ConfettiService
    ) { }

    private translateError(errorCode: string): string {
        return this.errorMessages[errorCode] || 'Error al crear la cuenta. Intenta de nuevo.';
    }

    validateEmail(): void {
        const email = this.email();
        if (!email) {
            this.emailError.set('');
        } else if (!this.emailPattern.test(email)) {
            this.emailError.set('Ingresa un correo electrónico válido');
        } else {
            this.emailError.set('');
        }
    }

    validatePhone(): void {
        const phone = this.telefono();
        if (!phone) {
            this.phoneError.set(''); // Optional field
        } else if (!this.phonePattern.test(phone)) {
            this.phoneError.set('Debe tener exactamente 10 dígitos numéricos (sin espacios ni guiones)');
        } else {
            this.phoneError.set('');
        }
    }

    validatePassword(): void {
        const password = this.password();
        if (!password) {
            this.passwordError.set('');
        } else if (password.length < 6) {
            this.passwordError.set('La contraseña debe tener al menos 6 caracteres');
        } else {
            this.passwordError.set('');
        }
    }

    onSubmit(): void {
        this.error.set('');
        this.success.set('');

        // Run all validations
        this.validateEmail();
        this.validatePhone();
        this.validatePassword();

        if (!this.nombre() || !this.apellidos() || !this.email() || !this.password()) {
            this.error.set('Por favor complete todos los campos obligatorios');
            return;
        }

        if (this.password() !== this.confirmPassword()) {
            this.error.set('Las contraseñas no coinciden');
            return;
        }

        if (this.emailError() || this.phoneError() || this.passwordError()) {
            this.error.set('Por favor corrija los errores en el formulario');
            return;
        }

        // Validate phone if provided
        if (this.telefono() && !this.phonePattern.test(this.telefono())) {
            this.error.set('El teléfono debe tener exactamente 10 dígitos numéricos');
            return;
        }

        this.loading.set(true);

        this.authService.signup({
            nombre: this.nombre(),
            apellidos: this.apellidos(),
            email: this.email(),
            password: this.password(),
            telefono: this.telefono() || undefined
        }).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (!response.error) {
                    // 🎉 Launch confetti celebration!
                    this.confettiService.launch();
                    this.success.set('¡Cuenta creada exitosamente! Redirigiendo al login...');
                    setTimeout(() => {
                        this.router.navigate(['/login']);
                    }, 2500);
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

    updateField(field: 'nombre' | 'apellidos' | 'email' | 'password' | 'confirmPassword' | 'telefono', event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this[field].set(value);

        // Trigger validation on change
        if (field === 'email') this.validateEmail();
        if (field === 'telefono') this.validatePhone();
        if (field === 'password') this.validatePassword();
    }
}
