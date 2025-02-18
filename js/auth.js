import { mostrarMensaje } from './logs.js';

document.addEventListener('DOMContentLoaded', () => {
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('https://gestorinventory-backend-production.up.railway.app/productos/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                // Guardar token JWT
                localStorage.setItem('supabase.auth.token', data.user.access_token); // <-- Línea clave
                localStorage.setItem('usuario_id', data.user.id); // Guarda el usuario_id
                
                mostrarMensaje('Inicio de sesión exitoso', 'exito');
                window.location.href = './plantillas/main.html';
            } else {
                mostrarMensaje(data.error, 'error');
            }
        });
    }
});

export async function verificarToken() {
    const tokenData = localStorage.getItem('supabase.auth.token');
    if (!tokenData) {
        mostrarMensaje("No se encontró el token de autenticación", "error");
        return false;
    }

    let token;
    try {
        const parsedTokenData = JSON.parse(tokenData);
        token = parsedTokenData?.currentSession?.access_token;
    } catch (error) {
        mostrarMensaje("Error al procesar el token de autenticación", "error");
        return false;
    }

    if (!token) {
        mostrarMensaje("Token de autenticación no válido", "error");
        return false;
    }

    try {
        const response = await fetch("https://gestorinventory-backend-production.up.railway.app/productos/verificar-token", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        if (data.success) {
            mostrarMensaje("Token válido", "exito");
            return true;
        } else {
            mostrarMensaje("Token no válido", "error");
            return false;
        }
    } catch (error) {
        mostrarMensaje(`Error al verificar el token: ${error.message}`, "error");
        return false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Obtener los valores del formulario
            const nombre = document.getElementById('nombre').value; 
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            // Validar que no haya campos vacíos
            if (!nombre || !email || !password) {
                mostrarMensaje('Todos los campos son obligatorios', 'error');
                return;
            }
            // Validar que las contraseñas coincidan
            if (password !== confirmPassword) {
                mostrarMensaje('Las contraseñas no coinciden', 'error');
                return;
            }
            console.log({ nombre, email, password });
            // Enviar los datos al backend
            const response = await fetch('https://gestorinventory-backend-production.up.railway.app/productos/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, email, password })
            });

            const data = await response.json();

            // Mostrar mensaje de éxito o error
            if (data.success) {
                mostrarMensaje('Registro exitoso. Redirigiendo...', 'exito');
                setTimeout(() => {
                    window.location.href = './index.html'; // Redirigir al login después del registro
                }, 2000);
            } else {
                mostrarMensaje(data.error || 'Error al registrar el usuario', 'error');
            }
        });
    }
});
