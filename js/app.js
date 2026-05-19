// Elementos del DOM
const chatMessages = document.getElementById('chat-messages');
const chatOptions = document.getElementById('chat-options');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatSubmit = document.getElementById('chat-submit');
const typingIndicator = document.getElementById('typing-indicator');

// Estado del Chatbot
let state = {
    step: 0,
    name: '',
    email: '',
    clientType: '',
    promotions: [],
    awaitingSearch: false,
    currentQuery: '',
    currentResults: []
};

// URL del CSV
const CSV_URL = 'Tabla de promociones para CLAUDIO - V5_6-26_Promociones_POSPAGO_limpio.csv.csv';

// Iniciar Chatbot
async function init() {
    showTyping();
    // Cargar CSV
    Papa.parse(CSV_URL, {
        download: true,
        header: true,
        complete: function(results) {
            state.promotions = results.data;
            console.log('Promociones cargadas:', state.promotions.length);
            hideTyping();
            runStep1();
        },
        error: function(err) {
            console.error('Error cargando CSV:', err);
            hideTyping();
            addBotMessage("Hubo un problema cargando la base de datos de promociones. Por favor, intenta recargar la página.");
        }
    });
}

// Utilidades de UI
function addBotMessage(text, isHTML = false) {
    const div = document.createElement('div');
    div.className = 'message bot';
    div.innerHTML = `<div class="message-bubble">${isHTML ? text : text.replace(/\n/g, '<br>')}</div>`;
    chatMessages.insertBefore(div, typingIndicator);
    scrollToBottom();
}

function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'message user';
    div.innerHTML = `<div class="message-bubble">${text}</div>`;
    chatMessages.insertBefore(div, typingIndicator);
    scrollToBottom();
}

function showTyping() {
    typingIndicator.style.display = 'flex';
    scrollToBottom();
}

function hideTyping() {
    typingIndicator.style.display = 'none';
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderOptions(options) {
    chatOptions.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt.label;
        btn.onclick = () => {
            chatOptions.innerHTML = '';
            addUserMessage(opt.label);
            showTyping();
            setTimeout(() => {
                hideTyping();
                opt.action();
            }, 1800); // Aumentado el tiempo de "pensar" a 1.8 seg
        };
        chatOptions.appendChild(btn);
    });
    chatInput.disabled = true;
    chatSubmit.disabled = true;
}

function requestTextInput(placeholder = "Escribe un mensaje...") {
    chatOptions.innerHTML = '';
    chatInput.disabled = false;
    chatSubmit.disabled = false;
    chatInput.placeholder = placeholder;
    chatInput.focus();
}

// Event Listeners
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    
    addUserMessage(text);
    chatInput.value = '';
    requestTextInput("Procesando...");
    chatInput.disabled = true;
    chatSubmit.disabled = true;

    showTyping();
    // Tiempo de "lectura y escritura" simulado (más natural)
    const delay = Math.min(2500, Math.max(1500, text.length * 50)); 
    setTimeout(() => {
        hideTyping();
        handleUserInput(text);
    }, delay);
});

// Lógica de Validación de Email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Máquina de Estados (Flujo Obligatorio)

function runStep1() {
    // 1. Bienvenida
    addBotMessage("¡Bienvenido/a!\nTe escribe CLAUDIO, asistente de Efraín II Cárdenas Gracia.\n<a href='https://expertotelcel.com' target='_blank'>expertotelcel.com</a>\nEfraín tiene más de 16 años sirviendo a sus clientes en plan de renta mensual. ¡Gracias por tu contacto!", true);
    
    showTyping();
    setTimeout(() => {
        hideTyping();
        addBotMessage("Tenme paciencia, tengo pocos días que me acaban de implementar y es normal que tenga errores, Efraín te dará la información correcta. Lo que si te confirmo es que todos los días me estoy reinventando y cada vez seré más experto en todo lo de Telcel.");
        
        showTyping();
        setTimeout(() => {
            hideTyping();
            runStep2();
        }, 2000);
    }, 2500);
}

function runStep2() {
    // 2. Detectar si es primera vez o chat activo
    addBotMessage("¿Es la primera vez que me contactas o ya tenemos un chat activo?");
    renderOptions([
        { label: "Primera vez", action: runStep4 },
        { label: "Ya hay un chat activo", action: runStep3 }
    ]);
}

function runStep3() {
    // 3. Chat activo
    addBotMessage("¿Quieres que yo te siga atendiendo o prefieres que Efraín te atienda?");
    renderOptions([
        { label: "Sígueme atendiendo", action: runStep8 }, // Pasa directo a promociones
        { label: "Espero a Efraín", action: () => {
            addBotMessage("Por el momento, si gustas, ¿te puedo ir platicando de promociones?");
            renderOptions([
                { label: "Sí, platícame", action: runStep8 },
                { label: "No, esperaré", action: () => { addBotMessage("¡Perfecto! Efraín te atenderá pronto."); } }
            ]);
        }}
    ]);
}

function runStep4() {
    // 4. Primera vez - Menú de 6 opciones
    addBotMessage("¿En qué te puedo ayudar hoy?");
    renderOptions([
        { label: "Quiero un equipo con plan (Primera vez)", action: () => { state.clientType = 'primera_vez'; runStep5(); } },
        { label: "Actualizar mi plan (Renovación)", action: () => { state.clientType = 'renovacion'; runStep5(); } },
        { label: "Línea adicional", action: () => { state.clientType = 'adicional'; runStep5(); } },
        { label: "Portabilidad", action: () => { state.clientType = 'portabilidad'; runStep5(); } },
        { label: "Necesito tu ayuda", action: () => { state.clientType = 'ayuda'; runStep5(); } },
        { label: "Quiero platicar con alguien", action: () => { state.clientType = 'platicar'; runStep5(); } }
    ]);
}

function runStep5() {
    // 5. Pedir Nombre y Email (Gate estricto)
    if (state.clientType === 'ayuda' || state.clientType === 'platicar') {
        addBotMessage("¡Con gusto! Cuéntame, ¿en qué te puedo servir?");
        requestTextInput("Escribe tu mensaje...");
        state.step = 'informal';
        return;
    }

    addBotMessage("¡Excelente! Con gusto te ayudo a encontrar el plan y equipo perfecto.\nPara darte seguimiento personalizado, necesito tu nombre y correo electrónico.\n*(No avanzo sin estos datos — son para que Efraín pueda darte atención completa)*", true);
    
    // Inyectar formulario
    const formHtml = `
        <div class="rich-card form-card" id="lead-capture-form">
            <input type="text" id="lead-name" placeholder="Tu Nombre completo" autocomplete="name">
            <input type="email" id="lead-email" placeholder="tu@correo.com" autocomplete="email">
            <button id="lead-submit" class="card-btn">Continuar</button>
            <p id="lead-error" style="color:red; font-size:0.8rem; display:none; margin-top:5px;">Por favor completa tu nombre y un correo válido.</p>
        </div>
    `;
    addBotMessage(formHtml, true);
    
    // Desactivar el input principal para forzar a usar el form
    chatOptions.innerHTML = '';
    chatInput.disabled = true;
    chatSubmit.disabled = true;
    chatInput.placeholder = "Completa el formulario arriba...";

    // Escuchar el botón del formulario
    setTimeout(() => {
        const btn = document.getElementById('lead-submit');
        if(btn) {
            btn.onclick = () => {
                const nameInput = document.getElementById('lead-name').value.trim();
                const emailInput = document.getElementById('lead-email').value.trim();
                const errorP = document.getElementById('lead-error');
                
                if(nameInput.length < 2 || !validateEmail(emailInput)) {
                    errorP.style.display = 'block';
                } else {
                    errorP.style.display = 'none';
                    state.name = nameInput;
                    state.email = emailInput;
                    
                    // Deshabilitar campos
                    document.getElementById('lead-name').disabled = true;
                    document.getElementById('lead-email').disabled = true;
                    btn.style.display = 'none';
                    
                    addUserMessage(`Soy ${nameInput}, mi correo es ${emailInput}`);
                    showTyping();
                    setTimeout(() => {
                        hideTyping();
                        runStep6();
                    }, 1500);
                }
            };
        }
    }, 100);
}

function handleUserInput(text) {
    if (state.awaitingSearch) {
        state.awaitingSearch = false;
        searchAndQuote(text);
        return;
    }

    if (state.step === 'informal') {
        addBotMessage("Entiendo. Si deseas ver promociones de equipos, solo dímelo.");
        renderOptions([{ label: "Ver promociones", action: runStep8 }]);
        return;
    }
    
    // Fallback: Si el usuario escribe cualquier cosa en un momento inesperado
    addBotMessage("Soy un asistente automatizado enfocado en cotizaciones. He guardado tu mensaje para que Efraín te responda personalmente en cuanto se conecte.");
    renderOptions([
        { label: "Cotizar un equipo ahora", action: runStep8 },
        { label: "Dejar otro mensaje", action: () => { requestTextInput("Escribe aquí..."); } }
    ]);
}

function runStep6() {
    // 6. Confirmar Email y Nombre
    addBotMessage(`Perfecto, déjame confirmar.\nNombre: <b>${state.name}</b>\nCorreo: <b>${state.email}</b>\n¿Son correctos tus datos?`, true);
    renderOptions([
        { label: "Sí, son correctos", action: () => {
            addBotMessage(`¡Listo! Te acabo de enviar un correo a ${state.email}\nPor favor contesta ese correo para continuar — es rápido y muy importante.\n\n¿Por qué? Así puedo:\n- Avisarte cuando Efraín esté disponible.\n- Enviarte promociones.\n- Retomar la conversación.\n*(¡Revisa tu spam por si acaso!)*`, true);
            
            showTyping();
            setTimeout(() => {
                hideTyping();
                runStep7();
            }, 3000); // Simulamos más tiempo para que lea el mensaje
        }},
        { label: "No, corregir", action: () => {
            runStep5();
        }}
    ]);
}

function runStep7() {
    // 7. Preguntas de calificación rápidas
    if (state.clientType === 'primera_vez') {
        addBotMessage("Al ser la primera vez que contratas un plan Telcel, es normal que al principio autorice poco crédito, con el tiempo y pagos puntuales te dará más financiamiento.");
    }
    
    showTyping();
    setTimeout(() => {
        hideTyping();
        addBotMessage("Por el momento, si gustas te puedo cotizar promociones, teniendo en cuenta que solo es información no confirmada. Efraín te confirma números exactos accediendo al sistema.");
        
        showTyping();
        setTimeout(() => {
            hideTyping();
            runStep8();
        }, 2000);
    }, 1500);
}

function runStep8() {
    // 8. Equipos de interés + 9. Links Promociones
    addBotMessage("Te invito a mis canales:\n- <a href='https://chat.whatsapp.com/FQltBoPducG3aMLyadGU3g' target='_blank'>Grupo de WhatsApp (766+ miembros)</a>\n- <a href='https://whatsapp.com/channel/0029VaGm9Y14dTnGvkjVLl2a' target='_blank'>Canal WhatsApp</a>\n- <a href='https://t.me/expertotelcelfans' target='_blank'>Grupo Telegram</a>", true);
    
    showTyping();
    setTimeout(() => {
        hideTyping();
        addBotMessage("Te comparto 2 opciones para ver TODAS las promociones:\n1. <b>WEB:</b> <a href='https://expertotelcel.com/tabladepromociones/' target='_blank'>expertotelcel.com</a>\n2. <b>HTML:</b> <a href='https://claudio.efrain-e3e.workers.dev/promatablas' target='_blank'>Versión HTML</a>", true);
        
        showTyping();
        setTimeout(() => {
            hideTyping();
            addBotMessage("¿Te interesa un modelo en especial, marca o presupuesto? Selecciona una de estas opciones o escribe lo que buscas:");
            renderOptions([
                { label: "Apple / iPhone", action: () => { searchAndQuote("apple"); } },
                { label: "Samsung", action: () => { searchAndQuote("samsung"); } },
                { label: "Motorola", action: () => { searchAndQuote("motorola"); } },
                { label: "Xiaomi", action: () => { searchAndQuote("xiaomi"); } },
                { label: "Honor", action: () => { searchAndQuote("honor"); } },
                { label: "Escribir otro...", action: () => { 
                    state.awaitingSearch = true;
                    requestTextInput("Escribe marca o modelo...");
                }}
            ]);
        }, 2500);
    }, 3000);
}

// Función auxiliar para parsear fechas de lanzamiento (DD/MM/YYYY)
function parseLanzamiento(dateStr) {
    if (!dateStr) return 0;
    let parts = String(dateStr).split('/');
    if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
    }
    return 0;
}

// Función auxiliar para normalizar precios del CSV
function parsePrice(val) {
    if (!val || val === 'INCLUIDO') return 0;
    let numStr = val.replace(/[$,]/g, '');
    let num = parseFloat(numStr);
    // Si el CSV dice "$1.40" y es < 100, usualmente significa 1,400.
    if (num < 100 && numStr.includes('.')) {
        num = num * 1000;
    }
    return isNaN(num) ? 0 : num;
}

// Función auxiliar para limpiar nombres de modelos
function cleanModelName(name) {
    if (!name) return "";
    let cleaned = name.toUpperCase()
        .replace(/\b(LTE|5G|4G)\b/gi, '')
        .replace(/\bSM-[A-Z0-9]+\b/gi, '') // Modelos Samsung (ej. SM-A042M)
        .replace(/\bXT[A-Z0-9-]+\b/gi, '') // Modelos Motorola
        .replace(/\b[A-Z0-9]{4,5}-[A-Z0-9]+\b/gi, '') // Otros códigos raros (ej. ALI-NX3)
        .replace(/\bV[0-9]{4}\b/gi, '') // Modelos Vivo
        .replace(/\s+/g, ' ').trim();
    
    // Convertir a Title Case, preservando GB/MB y la I mayúscula en iPhone
    return cleaned.toLowerCase().split(' ').map(word => {
        if (word.match(/^[0-9]+(gb|mb|tb)$/i)) return word.toUpperCase();
        if (word === 'iphone') return 'iPhone';
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

// 10. Cotizador Básico
function searchAndQuote(query) {
    const q = query.toLowerCase();
    
    // Filtrar resultados
    let results = state.promotions.filter(row => {
        return row.MODELO && row.MODELO.toLowerCase().includes(q);
    });

    if (results.length === 0) {
        addBotMessage(`No encontré "${query}" en la tabla actual. Intenta con otra marca (ej. OPPO, XIAOMI).`);
        state.awaitingSearch = true;
        requestTextInput("Buscar otro...");
        return;
    }

    // ORDENAR POR FECHA DE LANZAMIENTO (Más reciente primero)
    results.sort((a, b) => parseLanzamiento(b.Lanzamiento) - parseLanzamiento(a.Lanzamiento));

    // Tomar los primeros 3 para no saturar el chat
    state.currentResults = results.slice(0, 3);
    state.currentQuery = query;
    
    let html = `Encontré estos modelos para "<b>${query}</b>" (ordenados por novedad):<br><br>`;
    
    state.currentResults.forEach(item => {
        let prepagoRaw = item.PREPAGO;
        let isCombo = !prepagoRaw || (item['Tipo Dispositivo'] && item['Tipo Dispositivo'].toLowerCase() !== 'telefono');
        let prepago = parsePrice(prepagoRaw);
        let prepagoText = (isCombo && prepago === 0) ? "Promoción Especial" : `$${prepago.toLocaleString('es-MX')}`;
        let modelo = cleanModelName(item.MODELO);
        
        html += `• <b>${modelo}</b><br><span style="font-size:0.85rem; color:#555;">Precio en Telcel prepago: ${prepagoText}</span><br><br>`;
    });
    
    html += `¿Te gustaría ver el financiamiento en planes (principales planes Libre y Ultra)? Para calcularte cómo quedaría, <b>¿aproximadamente de cuánto es tu presupuesto al mes?</b>`;
    
    addBotMessage(html, true);
    
    showTyping();
    setTimeout(() => {
        hideTyping();
        renderOptions([
            { label: "Menos de $500", action: () => showPlansForBudget('low') },
            { label: "De $500 a $800", action: () => showPlansForBudget('medium') },
            { label: "Más de $800 (Premium)", action: () => showPlansForBudget('high') }
        ]);
    }, 1500);
}

function showPlansForBudget(budget) {
    let planes = [];
    if (budget === 'low') {
        planes = [
            { nombre: "LIBRE 2 ($319)", col: "LIBRE2_$319" },
            { nombre: "ULTRA 3 ($349)", col: "ULTRA3_$349" },
            { nombre: "LIBRE 3 ($399)", col: "LIBRE3_$399" },
            { nombre: "ULTRA 4 ($449)", col: "ULTRA4_$449" },
            { nombre: "LIBRE 4 ($499)", col: "LIBRE4_$499" }
        ];
    } else if (budget === 'medium') {
        planes = [
            { nombre: "ULTRA 5 ($549)", col: "ULTRA5_$549" },
            { nombre: "LIBRE 5 ($599)", col: "LIBRE5_$599" },
            { nombre: "LIBRE 6 ($699)", col: "LIBRE6_$699" },
            { nombre: "ULTRA 7 ($749)", col: "ULTRA7_$749" },
            { nombre: "LIBRE 7 ($799)", col: "LIBRE7_$799" }
        ];
    } else {
        planes = [
            { nombre: "ULTRA 9 ($949)", col: "ULTRA9_$949" },
            { nombre: "LIBRE 9 ($999)", col: "LIBRE9_$999" },
            { nombre: "LIBRE 12 ($1299)", col: "LIBRE12_$1299" },
            { nombre: "ILIMITADO ($1349)", col: "ILIMITADO_$1349" },
            { nombre: "VIP ($1499)", col: "VIP_$1499" }
        ];
    }

    let html = `Mostrando planes para <b>${state.currentQuery}</b> en el rango seleccionado:<br><br>`;
    
    state.currentResults.forEach(item => {
        let modelo = cleanModelName(item.MODELO);
        let prepago = parsePrice(item.PREPAGO);
        
        html += `<div class="rich-card">
            <h3>${modelo}</h3>`;
            
        let planesMostrados = 0;
            
        planes.forEach(plan => {
            if(item[plan.col] && String(item[plan.col]).trim() !== '') {
                planesMostrados++;
                let planValueStr = String(item[plan.col]).trim().toUpperCase();
                let precioPlan = parsePrice(item[plan.col]);
                let labelPlan = "";

                // Si dice 0, INCLUIDO o $0
                if (precioPlan === 0 || planValueStr === 'INCLUIDO' || planValueStr === '0' || planValueStr === '$0') {
                    labelPlan = `<b>${plan.nombre}:</b> Equipo <span style="color:green; font-weight:bold;">INCLUIDO</span> (Sin costo inicial).`;
                } else {
                    let mensualidadFinanciamiento = precioPlan / 24;
                    let diff = prepago > 0 ? prepago - precioPlan : 0;
                    let etiqueta = prepago > 0 ? (diff >= 0 ? `<span style="color:green">A favor ($${diff.toLocaleString('es-MX')})</span>` : `<span style="color:red">Sobreprecio ($${Math.abs(diff).toLocaleString('es-MX')})</span>`) : `<span style="color:#00a4e4">Combo</span>`;
                    
                    labelPlan = `<b>${plan.nombre}:</b><br>
                    Pago Inicial: $${precioPlan.toLocaleString('es-MX')} (${etiqueta})<br>
                    Financiamiento: $${mensualidadFinanciamiento.toLocaleString('es-MX', {maximumFractionDigits:2})} x 24 meses.`;
                }
                
                html += `<p style="font-size:0.8rem; margin-top:8px; border-bottom:1px solid #eee; padding-bottom:5px;">${labelPlan}</p>`;
            }
        });
        
        if (planesMostrados === 0) {
            html += `<p style="font-size:0.8rem; color:#888;">No hay promociones registradas en este rango de precio.</p>`;
        }
        
        html += `</div>`;
    });
    
    html += `<br><p><i>Cotización tentativa. Efraín confirma accediendo al sistema.</i></p>`;
    
    addBotMessage(html, true);
    
    showTyping();
    setTimeout(() => {
        hideTyping();
        addBotMessage("Con la asesoría de Efraín, él te confirmará la cotización final y te dirá qué plan conviene más. ¡Pide tu asesoría!");
        renderOptions([
            { label: "Pedir cotización final con Efraín", action: () => {
                addBotMessage("¡Excelente! En cuanto Efraín esté disponible, revisará este chat y te enviará la cotización definitiva. ¡Gracias por contactarnos!");
            }},
            { label: "Ver otros planes para este equipo", action: () => {
                renderOptions([
                    { label: "Menos de $500", action: () => showPlansForBudget('low') },
                    { label: "De $500 a $800", action: () => showPlansForBudget('medium') },
                    { label: "Más de $800 (Premium)", action: () => showPlansForBudget('high') }
                ]);
            }},
            { label: "Buscar otro equipo", action: () => {
                state.awaitingSearch = true;
                requestTextInput("Buscar otro...");
            }}
        ]);
    }, 4000);
}

// Iniciar aplicación
document.addEventListener('DOMContentLoaded', init);
