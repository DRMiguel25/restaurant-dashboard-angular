import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';
import { Restaurante, RestauranteCreate } from '../../models/restaurante.model';

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

    userName = computed(() => {
        const user = this.authService.getUser();
        return user ? `${user.nombre} ${user.apellidos}` : 'Usuario';
    });

    constructor(
        private restaurantService: RestaurantService,
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
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

        this.restaurantService.listar().subscribe({
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
    }

    saveRestaurante(): void {
        if (!this.formData().nombre) {
            this.showToast('error', 'El nombre es obligatorio');
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
}
