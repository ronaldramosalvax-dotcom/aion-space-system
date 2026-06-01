import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, remove, orderByKey, limitToLast, query } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";


// !!! REEMPLAZA ESTO CON TUS CREDENCIALES COPIADAS DE FIREBASE !!!
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

// Filtro para traer únicamente la cola final de 50 mensajes de la nube
const consultaUltimos50 = query(mensajesRef, orderByKey(), limitToLast(50));

// FUNCION GLOBAL: Enviar mensaje al presionar el botón
window.enviarMensajeArena = function() {
    const inputMsg = document.getElementById('input-mensaje-arena');
    const inputUser = document.getElementById('nombre-usuario-arena');
    
    const usuario = inputUser.value.trim() || "Cachimbo_Anonimo";
    const texto = inputMsg.value.trim();
    
    if (texto !== "") {
        push(mensajesRef, {
            usuario: usuario,
            texto: texto,
            timestamp: Date.now()
        });
        inputMsg.value = ""; // Limpiar barra
    }
}

// FUNCION GLOBAL: Detectar el envío con la tecla Enter
window.detectarEnter = function(e) {
    if (e.key === 'Enter') { window.enviarMensajeArena(); }
}

// ESCUCHADOR EN TIEMPO REAL: Cola circular FIFO (Límite 50)
onChildAdded(consultaUltimos50, (snapshot) => {
    const data = snapshot.val();
    const key = snapshot.key;
    const caja = document.getElementById('caja-mensajes-arena');
    
    // Obtener la letra inicial para el avatar
    const inicial = data.usuario.charAt(0).toUpperCase();
    
    // Inyectar el mensaje estructurado con avatar al contenedor
    caja.innerHTML += `
        <div id="msg-${key}" class="contenedor-msg">
            <div class="avatar-aion">${inicial}</div>
            <div>
                <span style="color: #5765f2; font-weight: bold; font-size:11px;">${data.usuario}</span><br>
                <span style="word-break: break-all;">${data.texto}</span>
            </div>
        </div>
    `;
    caja.scrollTop = caja.scrollHeight; // Auto-scroll abajo

    // Contar los elementos cargados en la pantalla
    const mensajesActuales = caja.querySelectorAll('.contenedor-msg');

    // Si supera los 50, se elimina el primero (el más antiguo) de la pantalla y de la nube
    if (mensajesActuales.length > 50) {
        const mensajeAntiguoHTML = mensajesActuales[0];
        mensajeAntiguoHTML.remove(); // Borrado visual

        const idFirebase = mensajeAntiguoHTML.id.replace('msg-', '');
        const referenciaMensajeBorrar = ref(db, `mensajes/${idFirebase}`);
        remove(referenciaMensajeBorrar); // Borrado en la base de datos
    }
});
