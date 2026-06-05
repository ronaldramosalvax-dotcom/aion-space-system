import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, orderByKey, limitToLast, query } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";
// Credenciales oficiales y unificadas de tu proyecto Aion Space System

const firebaseConfig = {
    apiKey: "AIzaSyCAb9jQGpTgP_rSWPczHoZYHGxfj5NReYI",
    authDomain: "aion-space-system.firebaseapp.com",
    databaseURL: "https://aion-space-system.firebaseio.com",
    projectId: "aion-space-system",
    storageBucket: "aion-space-system.firebasestorage.app",
    messagingSenderId: "247082868280",
    appId: "1:247082868280:web:c0aeeb2a62bc02c2f6d0cd"
};
// LISTA TÁCTICA DE CENSURA: Palabras prohibidas en el radar
const PALABRAS_PROHIBIDAS = ["utp", "mierda", "carajo", "puto", "puta", "concha", "huevon"];


// Inicializar base de datos
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const mensajesRef = ref(db, 'mensajes');

// Filtro para traer únicamente la cola final de 40 mensajes de la nube
const consultaUltimos40 = query(mensajesRef, orderByKey(), limitToLast(40));

// FUNCION GLOBAL: Enviar mensaje a Firebase (Estilo Mech Arena)
window.enviarMensajeArena = function() {
    const inputMensaje = document.getElementById('input-mensaje-arena');
    const inputApodo = document.getElementById('nombre-usuario-arena'); // Casilla de la izquierda
    const texto = inputMensaje ? inputMensaje.value.trim() : "";
    
    if (texto === "") return;

    // Valores por defecto para evitar bloqueos en el radar
    let nombrePiloto = "Piloto";
    let codigoPiloto = "#AION-" + Math.floor(1000 + Math.random() * 9000);
    let avatarUrl = `https://robohash.org{codigoPiloto}.png?set=set1`;

    // 1. Intentar recuperar la cuenta de Google si existe
    const cuentaLocal = localStorage.getItem("cuenta_aion_instalada");
    if (cuentaLocal) {
        try {
            const perfil = JSON.parse(cuentaLocal);
            nombrePiloto = perfil.nombre || nombrePiloto;
            codigoPiloto = perfil.codigo || codigoPiloto;
            avatarUrl = perfil.avatar || avatarUrl;
        } catch(e) {
            console.log("Lectura de perfil alternativa activa.");
        }
    }

    // 2. PRIORIDAD MÁXIMA: Si el piloto escribió un apodo manual, se usa ese nombre
    if (inputApodo && inputApodo.value.trim() !== "") {
        nombrePiloto = inputApodo.value.trim();
    }
    
    // --- FILTRO CUÁNTICO ACTIVO ---
    let textoLimpio = texto;
    PALABRAS_PROHIBIDAS.forEach(palabra => {
        const regex = new RegExp(palabra, "gi");
        textoLimpio = textoLimpio.replace(regex, "****");
    });
    
    // Subimos el paquete de datos blindado a Firebase con el texto censurado
    push(mensajesRef, {
        usuario: nombrePiloto,
        codigo: codigoPiloto,
        avatar: avatarUrl,
        texto: textoLimpio,
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
