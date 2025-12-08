import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';
import { Restaurante, RestauranteCreate } from '../../models/restaurante.model';

// Validation patterns
const PHONE_PATTERN = /^[0-9]{10}$/;

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
    restaurantes = signal<Restaurante[]>([]);
    loading = signal(false);
    searchQuery = signal('');
    private searchTimeout: any = null;

    // Toast notifications
    toast = signal<{ show: boolean; type: 'success' | 'error' | 'info'; message: string }>({
        show: false,
        type: 'info',
        message: ''
    });

    // Modal state
    showModal = signal(false);
    editMode = signal(false);
    currentRestauranteId = signal('');

    // Profile Modal state
    showProfileModal = signal(false);
    profileFormData = signal<{ nombre: string; apellidos: string; telefono: string }>({
        nombre: '',
        apellidos: '',
        telefono: ''
    });
    profilePhoneError = signal('');

    // Form data
    formData = signal<RestauranteCreate>({
        nombre: '',
        direccion: '',
        telefono: '',
        tipo_cocina: '',
        rango_precio: '',
        calificacion: undefined,
        horario_apertura: '',
        horario_cierre: ''
    });

    // Theme
    isDarkMode = signal(false);

    // Validation error signals
    phoneError = signal('');
    calificacionError = signal('');

    // Computed: check if restaurant form is valid
    isRestaurantFormValid = computed(() => {
        const hasName = !!this.formData().nombre;
        const phoneValid = !this.formData().telefono || PHONE_PATTERN.test(this.formData().telefono || '');
        const cal = this.formData().calificacion;
        const calValid = cal === undefined || cal === null || (cal >= 0 && cal <= 5);
        const noErrors = !this.phoneError() && !this.calificacionError();
        return hasName && phoneValid && calValid && noErrors;
    });

    // User name - using signal instead of computed to allow immediate updates
    userName = signal('Usuario');

    private refreshUserName(): void {
        const user = this.authService.getUser();
        this.userName.set(user ? `${user.nombre} ${user.apellidos}` : 'Usuario');
    }

    // Computed Statistics
    totalRestaurantes = computed(() => this.restaurantes().length);

    promedioCalificacion = computed(() => {
        const restaurantes = this.restaurantes();
        if (restaurantes.length === 0) return 0;
        const calificaciones = restaurantes
            .filter(r => r.calificacion !== null && r.calificacion !== undefined)
            .map(r => Number(r.calificacion))
            .filter(cal => !isNaN(cal) && cal > 0);
        if (calificaciones.length === 0) return 0;
        const suma = calificaciones.reduce((acc, cal) => acc + cal, 0);
        const promedio = suma / calificaciones.length;
        return isNaN(promedio) ? 0 : Math.round(promedio * 10) / 10;
    });

    topCocina = computed(() => {
        const restaurantes = this.restaurantes();
        if (restaurantes.length === 0) return 'N/A';
        const conteo: { [key: string]: number } = {};
        restaurantes.forEach(r => {
            if (r.tipo_cocina) {
                conteo[r.tipo_cocina] = (conteo[r.tipo_cocina] || 0) + 1;
            }
        });
        const cocinas = Object.entries(conteo);
        if (cocinas.length === 0) return 'N/A';
        cocinas.sort((a, b) => b[1] - a[1]);
        return cocinas[0][0];
    });

    // Helper for star ratings (returns array of star states: 'full', 'half', 'empty')
    getStarStates(rating: number | undefined): string[] {
        const stars: string[] = [];
        const actualRating = rating || 0;
        for (let i = 1; i <= 5; i++) {
            if (actualRating >= i) {
                stars.push('full');
            } else if (actualRating >= i - 0.5) {
                stars.push('half');
            } else {
                stars.push('empty');
            }
        }
        return stars;
    }

    // Set rating from star click in modal
    setRating(value: number): void {
        this.formData.update(current => ({
            ...current,
            calificacion: value === 0 ? undefined : value
        }));
        this.validateCalificacion();
    }

    constructor(
        private restaurantService: RestaurantService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.refreshUserName();
        this.loadRestaurantes();
        // Check saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.isDarkMode.set(true);
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }

    toggleTheme(): void {
        this.isDarkMode.update(v => !v);
        const theme = this.isDarkMode() ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }

    showToast(type: 'success' | 'error' | 'info', message: string): void {
        this.toast.set({ show: true, type, message });
        setTimeout(() => {
            this.toast.set({ show: false, type: 'info', message: '' });
        }, 4000);
    }

    loadRestaurantes(): void {
        this.loading.set(true);

        this.restaurantService.listar(this.searchQuery()).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (!response.error && response.data) {
                    this.restaurantes.set(response.data);
                } else {
                    this.restaurantes.set([]);
                }
            },
            error: (err) => {
                this.loading.set(false);
                this.showToast('error', 'Error al cargar los restaurantes');
                console.error(err);
            }
        });
    }

    onSearchChange(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchQuery.set(value);

        // Debounce search - wait 400ms before making request
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
        this.searchTimeout = setTimeout(() => {
            this.loadRestaurantes();
        }, 400);
    }

    clearSearch(): void {
        this.searchQuery.set('');
        this.loadRestaurantes();
    }

    openCreateModal(): void {
        this.editMode.set(false);
        this.currentRestauranteId.set('');
        this.resetForm();
        this.showModal.set(true);
    }

    openEditModal(restaurante: Restaurante): void {
        this.editMode.set(true);
        this.currentRestauranteId.set(restaurante.id);
        this.formData.set({
            nombre: restaurante.nombre,
            direccion: restaurante.direccion,
            telefono: restaurante.telefono,
            tipo_cocina: restaurante.tipo_cocina,
            rango_precio: restaurante.rango_precio,
            calificacion: restaurante.calificacion,
            horario_apertura: restaurante.horario_apertura,
            horario_cierre: restaurante.horario_cierre
        });
        this.showModal.set(true);
    }

    closeModal(): void {
        this.showModal.set(false);
        this.resetForm();
    }

    resetForm(): void {
        this.formData.set({
            nombre: '',
            direccion: '',
            telefono: '',
            tipo_cocina: '',
            rango_precio: '',
            calificacion: undefined,
            horario_apertura: '',
            horario_cierre: ''
        });
    }

    updateFormField(field: keyof RestauranteCreate, event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.formData.update(current => ({
            ...current,
            [field]: field === 'calificacion' ? (value ? parseFloat(value) : undefined) : value
        }));

        // Trigger validation on change
        if (field === 'telefono') this.validatePhone();
        if (field === 'calificacion') this.validateCalificacion();
    }

    validatePhone(): void {
        const phone = this.formData().telefono;
        if (!phone) {
            this.phoneError.set('');
        } else if (!PHONE_PATTERN.test(phone)) {
            this.phoneError.set('Debe tener exactamente 10 dígitos numéricos');
        } else {
            this.phoneError.set('');
        }
    }

    validateCalificacion(): void {
        const cal = this.formData().calificacion;
        if (cal === undefined || cal === null) {
            this.calificacionError.set('');
        } else if (isNaN(cal) || cal < 0 || cal > 5) {
            this.calificacionError.set('Debe ser un número entre 0 y 5');
        } else {
            this.calificacionError.set('');
        }
    }

    saveRestaurante(): void {
        // Run validations
        this.validatePhone();
        this.validateCalificacion();

        if (!this.formData().nombre) {
            this.showToast('error', 'El nombre es obligatorio');
            return;
        }

        // Check phone validation
        if (this.formData().telefono && !PHONE_PATTERN.test(this.formData().telefono || '')) {
            this.showToast('error', 'El teléfono debe tener exactamente 10 dígitos numéricos');
            return;
        }

        // Check calificacion validation
        const cal = this.formData().calificacion;
        if (cal !== undefined && (isNaN(cal) || cal < 0 || cal > 5)) {
            this.showToast('error', 'La calificación debe ser un número entre 0 y 5');
            return;
        }

        this.loading.set(true);

        if (this.editMode()) {
            this.restaurantService.editar(this.currentRestauranteId(), this.formData()).subscribe({
                next: (response) => {
                    this.loading.set(false);
                    if (!response.error) {
                        this.showToast('success', '✓ Restaurante actualizado exitosamente');
                        this.closeModal();
                        this.loadRestaurantes();
                    } else {
                        this.showToast('error', response.msg || 'Error al actualizar');
                    }
                },
                error: (err) => {
                    this.loading.set(false);
                    this.showToast('error', 'Error de conexión');
                    console.error(err);
                }
            });
        } else {
            this.restaurantService.crear(this.formData()).subscribe({
                next: (response) => {
                    this.loading.set(false);
                    if (!response.error) {
                        this.showToast('success', '✓ Restaurante creado exitosamente');
                        this.closeModal();
                        this.loadRestaurantes();
                    } else {
                        this.showToast('error', response.msg || 'Error al crear');
                    }
                },
                error: (err) => {
                    this.loading.set(false);
                    this.showToast('error', 'Error de conexión');
                    console.error(err);
                }
            });
        }
    }

    deleteRestaurante(id: string, nombre: string): void {
        if (!confirm(`¿Estás seguro de eliminar "${nombre}"?`)) {
            return;
        }

        this.loading.set(true);

        this.restaurantService.eliminar(id).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (!response.error) {
                    this.showToast('success', '✓ Restaurante eliminado exitosamente');
                    this.loadRestaurantes();
                } else {
                    this.showToast('error', response.msg || 'Error al eliminar');
                }
            },
            error: (err) => {
                this.loading.set(false);
                this.showToast('error', 'Error de conexión');
                console.error(err);
            }
        });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }

    // Profile Modal Methods
    openProfileModal(): void {
        const user = this.authService.getUser();
        if (user) {
            this.profileFormData.set({
                nombre: user.nombre || '',
                apellidos: user.apellidos || '',
                telefono: user.telefono || ''
            });
        }
        this.profilePhoneError.set('');
        this.showProfileModal.set(true);
    }

    closeProfileModal(): void {
        this.showProfileModal.set(false);
        this.profilePhoneError.set('');
    }

    updateProfileField(field: 'nombre' | 'apellidos' | 'telefono', event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.profileFormData.update(current => ({
            ...current,
            [field]: value
        }));
        if (field === 'telefono') {
            this.validateProfilePhone();
        }
    }

    validateProfilePhone(): void {
        const phone = this.profileFormData().telefono;
        if (!phone) {
            this.profilePhoneError.set('');
        } else if (!PHONE_PATTERN.test(phone)) {
            this.profilePhoneError.set('Debe tener exactamente 10 dígitos numéricos');
        } else {
            this.profilePhoneError.set('');
        }
    }

    saveProfile(): void {
        this.validateProfilePhone();

        if (this.profilePhoneError()) {
            this.showToast('error', 'Corrige los errores antes de guardar');
            return;
        }

        const data = this.profileFormData();

        // Check if at least one field has value
        if (!data.nombre && !data.apellidos && !data.telefono) {
            this.showToast('error', 'Debes completar al menos un campo');
            return;
        }

        this.loading.set(true);

        this.authService.updateProfile({
            nombre: data.nombre || undefined,
            apellidos: data.apellidos || undefined,
            telefono: data.telefono || undefined
        }).subscribe({
            next: (response) => {
                this.loading.set(false);
                if (!response.error) {
                    this.refreshUserName(); // Update displayed name immediately
                    this.showToast('success', '✓ Perfil actualizado exitosamente');
                    this.closeProfileModal();
                } else {
                    this.showToast('error', response.msg || 'Error al actualizar perfil');
                }
            },
            error: (err) => {
                this.loading.set(false);
                this.showToast('error', 'Error de conexión');
                console.error(err);
            }
        });
    }

    goToChangePassword(): void {
        // Redirect to forgot-password page which uses Pipedream/.NET for password change
        this.authService.logout();
        this.router.navigate(['/forgot-password']);
    }
}
