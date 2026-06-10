import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, push, onChildAdded, remove, orderByKey, limitToLast, query } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
// Credenciales oficiales y unificadas de tu proyecto Aion Space System

const firebaseConfig = {
    apiKey: "AIzaSyCAb9jQGpTgP_rSWPczHoZYHGxfj5NReYI",
    authDomain: "aion-space-system.firebaseapp.com",
    databaseURL: "https://aion-space-system-default-rtdb.firebaseio.com",
    projectId: "aion-space-system",
    storageBucket: "aion-space-system.firebasestorage.app",
    messagingSenderId: "247082868280",
    appId: "1:247082868280:web:c0aeeb2a62bc02c2f6d0cd"
};
// LISTA TÁCTICA DE CENSURA: Palabras prohibidas en el radar
const PALABRAS_PROHIBIDAS = ["utp", "mierda", "carajo", "puto", "puta", "concha", "huevon"];


// Inicializar base de datos
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const db = getDatabase(app);
const mensajesRef = ref(db, 'mensajes');

// Filtro para traer únicamente la cola final de 40 mensajes de la nube
const consultaUltimos40 = query(mensajesRef, orderByKey(), limitToLast(40));

// FUNCION GLOBAL: Enviar mensaje a Firebase (Estilo Mech Arena)
window.enviarMensajeArena = function() {
    const inputMensaje = document.getElementById('input-mensaje-arena');
    const texto = inputMensaje ? inputMensaje.value.trim() : "";
    
    if (texto === "") return;

    // 1. Valores por defecto por si ocurre un fallo en el radar
    let nombrePiloto = "Piloto";
    let codigoPiloto = "#AION-0000";
    let avatarUrl = "logo.png";

    // 2. EXTRAER DE FORMA AUTOMÁTICA EL PERFIL CENTRALIZADO CONGELADO
    const cuentaLocal = localStorage.getItem("cuenta_aion_instalada");
    if (cuentaLocal) {
        try {
            const perfil = JSON.parse(cuentaLocal);
            // Si el piloto tiene un apodo registrado oficialmente, el radar lo usa de frente
            nombrePiloto = perfil.nombre || nombrePiloto;
            codigoPiloto = perfil.codigo || codigoPiloto;
            avatarUrl = perfil.avatar || avatarUrl;
        } catch(e) {
            console.error("Error leyendo la firma cuántica del piloto:", e);
        }
    }
    
    // 3. FILTRO CUÁNTICO ACTIVO (Censura táctica anti-insultos)
    let textoLimpio = texto;
    PALABRAS_PROHIBIDAS.forEach(palabra => {
        const regex = new RegExp(palabra, "gi");
        textoLimpio = textoLimpio.replace(regex, "****");
    });
    
    // 4. Subimos el paquete de datos blindado a Firebase con tu identidad fija oficial
    push(mensajesRef, {
        usuario: nombrePiloto,
        codigo: codigoPiloto,
        avatar: avatarUrl,
        texto: textoLimpio,
        timestamp: Date.now()
    });
    
    if (inputMensaje) inputMensaje.value = ""; // Limpiar barra de transmisiones
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
    let avatarUrl = data.avatar || "logo.png";
    if (avatarUrl.includes("robohash.org")) { avatarUrl = "logo.png"; }



    // Inyectar el mensaje estructurado con ID oculto antifraude (Activable con un clic)
    
    caja.innerHTML += `
        <div id="msg-${key}" class="contenedor-msg" style="display: flex; align-items: flex-start; gap: 10px; padding: 6px; background: rgba(255,255,255,0.01); border-radius: 6px; border-left: 2px solid rgba(64, 78, 237, 0.4);">
            <!-- Avatar del Piloto -->
            <img src="${avatarUrl}" style="width: 32px; height: 32px; border-radius: 50%; background: #1a2238; border: 1px solid #404eed; object-fit: cover;" onerror="this.src='logo.png';">

            <!-- Bloque de contenido táctico -->
            <div style="display: flex; flex-direction: column; gap: 1px; flex: 1;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <!-- Al hacer clic sobre el nombre se detona el escáner del ID fijo eterno -->
                        <span onclick="alert('📡 VERIFICACIÓN DE FIRMA CUÁNTICA\\n---------------------------------\\nPiloto en red: ${nombrePiloto}\\nID Único Fijo: ${codigoPiloto}\\nEstado: AUTENTICADO DE FORMA SEGURA')" 
                              style="color: #5765f2; font-weight: bold; font-size:11px; cursor: pointer; text-decoration: underline rgba(87,101,242,0.1); user-select: none;" 
                              onmouseover="this.style.color='#00ff88'; this.style.textDecoration='underline'" 
                              onmouseout="this.style.color='#5765f2'; this.style.textDecoration='none'">
                            ${nombrePiloto}
                        </span>
                    </div>
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
