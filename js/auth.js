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
                localStorage.setItem('supabase.auth.token', JSON.stringify(data.user)); // Guardar el objeto completo
                localStorage.setItem('usuario_id', data.user.id); // Guarda el usuario_id
                
                mostrarMensaje('Inicio de sesión exitoso', 'exito');
                window.location.href = './plantillas/main.html';
            } else {
                mostrarMensaje(data.error, 'error');
            }
        });
    }
});

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

function isTokenExpired(token) {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convertir a milisegundos
    return Date.now() > expirationTime;
}

export function getToken() {
    const tokenData = localStorage.getItem('supabase.auth.token');
    if (!tokenData) return null;

    try {
        const parsedTokenData = JSON.parse(tokenData);
        const token = parsedTokenData?.access_token || parsedTokenData?.currentSession?.access_token;
        if (isTokenExpired(token)) {
            mostrarMensaje("La sesión ha expirado. Por favor, inicia sesión nuevamente", "error");
            return null;
        }
        return token;
    } catch (error) {
        console.error("Error al procesar el token de autenticación:", error);
        mostrarMensaje("Error al procesar el token de autenticación", "error");
        return null;
    }
}
