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

// FUNCION GLOBAL: Enviar mensaje a Firebase
window.enviarMensajeArena = function() {
    const inputUsuario = document.getElementById('nombre-usuario-arena');
    const inputMensaje = document.getElementById('input-mensaje-arena');
    
    const usuario = inputUsuario ? inputUsuario.value.trim() : "Cachimbo_Anonimo";
    const texto = inputMensaje ? inputMensaje.value.trim() : "";
    
    if (usuario !== "" && texto !== "") {
        push(mensajesRef, {
            usuario: usuario,
            texto: texto, // Sincronizado como 'texto'
            timestamp: Date.now()
        });
        if (inputMensaje) inputMensaje.value = ""; // Limpiar barra de texto
    } else {
        alert("Por favor, ingresa tu usuario y mensaje.");
    }
}

// FUNCION GLOBAL: Detectar el envío con la tecla Enter
window.detectarEnter = function(event) {
    if (event.key === 'Enter') { 
        window.enviarMensajeArena(); 
    }
}

// ESCUCHADOR EN TIEMPO REAL: Muestra los mensajes en tu contenedor
onChildAdded(consultaUltimos40, (snapshot) => {
    const data = snapshot.val();
    const key = snapshot.key;
    const caja = document.getElementById('caja-mensajes-arena') || document.getElementById('chatContainer');
    
    if (!caja) return;

    // Obtener la letra inicial para el avatar
    const inicial = data.usuario ? data.usuario.charAt(0).toUpperCase() : "?";
    
    // Inyectar el mensaje estructurado con avatar al contenedor
    caja.innerHTML += `
        <div id="msg-${key}" class="contenedor-msg">
            <div class="avatar-aion">${inicial}</div>
            <div>
                <span style="color: #5765f2; font-weight: bold; font-size:11px;">${data.usuario}</span><br>
                <span style="word-break: break-all; color: #00ff00;">${data.texto}</span>
            </div>
        </div>
    `;
    caja.scrollTop = caja.scrollHeight; // Auto-scroll abajo

    // Contar los elementos cargados en la pantalla
    const mensajesActuales = caja.querySelectorAll('.contenedor-msg');

    // Cola circular estricta FIFO: Si supera los 40, borra el viejo de la pantalla y la nube
    if (mensajesActuales.length > 40) {
        const mensajeAntiguoHTML = mensajesActuales[0];
        mensajeAntiguoHTML.remove(); // Borrado visual

        const idFirebase = mensajeAntiguoHTML.id.replace('msg-', '');
        const referenciaMensajeBorrar = ref(db, `mensajes/${idFirebase}`);
        remove(referenciaMensajeBorrar); // Borrado en la base de datos
    }
});
