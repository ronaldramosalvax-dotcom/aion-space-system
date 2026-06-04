import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, orderByKey, limitToLast, query } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

// Credenciales oficiales de tu proyecto Aion
const firebaseConfig = {
    apiKey: "AIzaSyAj3xOG2R6C-fMqpByP0BBlR_8CgV8wH_g",
    authDomain: "aion-chat-utp.firebaseapp.com",
    databaseURL: "https://aion-chat-utp-default-rtdb.firebaseio.com",
    projectId: "aion-chat-utp",
    storageBucket: "aion-chat-utp.firebasestorage.app",
    messagingSenderId: "744552027801",
    appId: "1:744552027801:web:30a3b2f245eb145e1c4a08"
};

// Inicializar base de datos
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const mensajesRef = ref(db, 'mensajes');

// Filtro para traer únicamente la cola final de 40 mensajes de la nube
const consultaUltimos40 = query(mensajesRef, orderByKey(), limitToLast(40));

// FUNCION GLOBAL: Enviar mensaje a Firebase (Estilo Mech Arena)
window.enviarMensajeArena = function() {
    const inputMensaje = document.getElementById('input-mensaje-arena');
    const texto = inputMensaje ? inputMensaje.value.trim() : "";
    
    if (texto === "") return;

    // Recuperamos de forma segura la cuenta del celular
    const cuentaLocal = localStorage.getItem("cuenta_aion_instalada");
    if (!cuentaLocal) {
        alert("🚨 Error: No se encontró perfil de piloto en este dispositivo.");
        return;
    }
    const perfil = JSON.parse(cuentaLocal);
    
    // Subimos el paquete de datos blindado a Firebase
    push(mensajesRef, {
        usuario: perfil.nombre,
        codigo: perfil.codigo,
        avatar: perfil.avatar, // Almacena la URL del Mecha
        texto: texto,
        timestamp: Date.now()
    });
    
    if (inputMensaje) inputMensaje.value = ""; // Limpiar barra de texto
}

// FUNCION GLOBAL: Detectar el envío con la tecla Enter
window.detectarEnter = function(event) {
    if (event.key === 'Enter') { 
        window.enviarMensajeArena(); 
    }
}

// ESCUCHADOR EN TIEMPO REAL: Muestra los mensajes en tu contenedor con diseño Mech Arena
onChildAdded(consultaUltimos40, (snapshot) => {
    const data = snapshot.val();
    const key = snapshot.key;
    const caja = document.getElementById('caja-mensajes-arena') || document.getElementById('chatContainer');
    
    if (!caja) return;

    // Validar datos por si existen mensajes antiguos guardados con la estructura vieja
    const nombrePiloto = data.usuario || "Anónimo";
    const codigoPiloto = data.codigo || "#0000";
    const avatarUrl = data.avatar || `https://robohash.org{nombrePiloto}.png?set=set1`;

    // Inyectar el mensaje estructurado con la nueva estética
    caja.innerHTML += `
        <div id="msg-${key}" class="contenedor-msg" style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; padding: 6px; background: rgba(255,255,255,0.02); border-radius: 6px;">
            <!-- Avatar Redondo del Mecha -->
            <img src="${avatarUrl}" style="width: 38px; height: 38px; border-radius: 50%; background: #1a2238; border: 1px solid #404eed; object-fit: cover;">
            
            <!-- Bloque de contenido -->
            <div style="display: flex; flex-direction: column; gap: 2px;">
                <div>
                    <span style="color: #3ba55d; font-weight: bold; font-size:12px;">${nombrePiloto}</span>
                    <span style="color: #72767d; font-size: 10px; font-family: monospace; margin-left: 5px;">${codigoPiloto}</span>
                </div>
                <span style="word-break: break-word; color: #ffffff; font-size: 12px; line-height: 1.4;">${data.texto}</span>
            </div>
        </div>
    `;
    
    caja.scrollTop = caja.scrollHeight; // Auto-scroll abajo

    // Contar los elementos cargados en la pantalla
    const mensajesActuales = caja.querySelectorAll('.contenedor-msg');

    // Cola circular estricta FIFO
    if (mensajesActuales.length > 40) {
        const mensajeAntiguoHTML = mensajesActuales[0];
        mensajeAntiguoHTML.remove(); // Borrado visual

        const idFirebase = mensajeAntiguoHTML.id.replace('msg-', '');
        const referenciaMensajeBorrar = ref(db, `mensajes/${idFirebase}`);
        remove(referenciaMensajeBorrar); // Borrado en la base de datos
    }
});
