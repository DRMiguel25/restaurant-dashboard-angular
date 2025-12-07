# 🖥️ Dashboard de Gestión (Angular Standalone)

## 📋 Descripción

Interfaz web moderna para la gestión del sistema, desarrollada con:

- **Angular 17+** — Framework con arquitectura Standalone Components
- **TailwindCSS** — Framework de utilidades CSS
- **daisyUI** — Componentes UI modernos y personalizables

> ✨ Diseño responsivo optimizado para escritorio y dispositivos móviles.

---

## ⚙️ Requisitos

| Herramienta  | Versión Mínima |
|--------------|----------------|
| Node.js      | v18+           |
| Angular CLI  | v17+           |

### Verificar Angular CLI

```bash
ng version
```

Si no tienes Angular CLI instalado:

```bash
npm install -g @angular/cli@17
```

---

## 🚀 Instalación

```bash
# Instalar dependencias del proyecto
npm install
```

### ⚠️ Si hay problemas con los estilos:

En caso de que TailwindCSS o daisyUI no funcionen correctamente, ejecuta:

```bash
npm install -D tailwindcss daisyui
```

---

## ▶️ Ejecución

```bash
ng serve --host 0.0.0.0
```

> ⚠️ **Importante:** El flag `--host 0.0.0.0` permite acceder a la aplicación desde otros dispositivos en la red local.

La aplicación estará disponible en:

```
http://tu-ip-local:4200
```

### Ejecución solo local:

```bash
ng serve
# Accesible en http://localhost:4200
```

---

## 🎨 Stack de Estilos

| Tecnología   | Propósito                              |
|--------------|----------------------------------------|
| TailwindCSS  | Clases de utilidad para estilos rápidos|
| daisyUI      | Componentes pre-diseñados con temas    |

### Configuración de Temas

daisyUI permite cambiar fácilmente entre temas. Consulta `tailwind.config.js` para personalizar.

---

## 📱 Nota sobre Conectividad Móvil

> ⚠️ **IMPORTANTE**

El proyecto está configurado actualmente apuntando a la IP `192.168.1.142` (hardcoded en `environments.ts` y archivos de configuración) para permitir **pruebas desde dispositivos móviles** en la misma red WiFi.

### Si deseas ejecutarlo solo en tu computadora local:

Debes cambiar **manualmente** las IPs en los archivos de configuración por:

```
localhost
```
o
```
127.0.0.1
```

### Archivos a modificar:

```
src/environments/environment.ts
src/environments/environment.prod.ts
```

Ejemplo de cambio:

```typescript
// Antes (para red local)
apiUrl: 'http://192.168.1.142:3003'

// Después (solo local)
apiUrl: 'http://localhost:3003'
```

---

## 📂 Estructura del Proyecto

```
Frontend/
├── src/
│   ├── app/
│   │   ├── components/     # Componentes standalone
│   │   ├── services/       # Servicios HTTP
│   │   └── guards/         # Guards de autenticación
│   ├── environments/       # Configuración de entornos
│   └── styles.css          # Estilos globales (Tailwind)
├── tailwind.config.js      # Configuración de TailwindCSS
├── postcss.config.js       # Configuración de PostCSS
└── angular.json            # Configuración de Angular
```

---

## 🔗 Conexión con Microservicios

Esta aplicación se conecta a los siguientes servicios:

| Servicio          | Puerto | Descripción                    |
|-------------------|--------|--------------------------------|
| Auth Service      | 3003   | Autenticación (Node.js)        |
| Restaurantes API  | 8000   | CRUD de restaurantes (PHP)     |

---

## 🛠️ Scripts Disponibles

| Comando           | Descripción                            |
|-------------------|----------------------------------------|
| `ng serve`        | Servidor de desarrollo                 |
| `ng build`        | Compilar para producción               |
| `ng test`         | Ejecutar tests unitarios               |
| `ng lint`         | Analizar código con linter             |

---

## 🧪 Desarrollo

### Generar nuevo componente:

```bash
ng generate component components/nombre-componente --standalone
```

### Generar nuevo servicio:

```bash
ng generate service services/nombre-servicio
```

---

**Desarrollado con ❤️ usando Angular 17 + TailwindCSS + daisyUI**
# restaurant-dashboard-angular
