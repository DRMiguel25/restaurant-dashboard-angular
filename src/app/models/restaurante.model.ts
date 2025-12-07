export interface Restaurante {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
    tipo_cocina: string;
    rango_precio: string;
    calificacion: number;
    horario_apertura: string;
    horario_cierre: string;
    activo: boolean;
    usuario_registro: string;
    fecha_creacion?: string;
    fecha_actualizacion?: string;
}

export interface RestauranteCreate {
    nombre: string;
    direccion?: string;
    telefono?: string;
    tipo_cocina?: string;
    rango_precio?: string;
    calificacion?: number;
    horario_apertura?: string;
    horario_cierre?: string;
}
