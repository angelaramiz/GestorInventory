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
                mostrarMensaje('Inicio de sesión exitoso', 'exito');
                window.location.href = '../index.html';
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
    
                // Validar que las contraseñas coincidan
                if (password !== confirmPassword) {
                    mostrarMensaje('Las contraseñas no coinciden', 'error');
                    return;
                }
    
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
                        window.location.href = 'login.html'; // Redirigir al login después del registro
                    }, 2000);
                } else {
                    mostrarMensaje(data.error || 'Error al registrar el usuario', 'error');
                }
            });
        }
    });