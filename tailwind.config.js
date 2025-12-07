/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{html,ts}",
    ],
    theme: {
        extend: {
            colors: {
                "text-primary": "#0f172a",    // Texto principal - alto contraste
                "text-secondary": "#64748b",  // Timestamps y labels
            },
        },
    },
    plugins: [
        require('daisyui'),
    ],
    daisyui: {
        themes: [
            {
                light: {
                    "primary": "#2563eb",     // Azul Confianza - Botones Login/Editar
                    "secondary": "#f97316",   // Naranja Energía - Crear restaurante
                    "success": "#10b981",     // Verde Éxito - Emails/Hash
                    "warning": "#f59e0b",     // Amarillo Atención - Olvidé contraseña
                    "base-100": "#ffffff",    // Surface/Blanco - Tarjetas y componentes
                    "base-200": "#f8fafc",    // Background/Gris claro - Fondo Dashboard
                    "neutral": "#0f172a",     // Texto Primario - Alto contraste
                },
            },
            "dark",
        ],
        darkTheme: "dark",
        base: true,
        styled: true,
        utils: true,
        prefix: "",
        logs: true,
        themeRoot: ":root",
    },
}
