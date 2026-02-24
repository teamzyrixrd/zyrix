/* assistant.js - Asistente Virtual Zyrix con NLP Avanzado */

(function() {
  let panelOpen = false;

  function init() {
    const assistantBtn = document.querySelector('.assistant-btn');
    if (!assistantBtn) return;
    assistantBtn.addEventListener('click', toggleAssistant);
  }

  function toggleAssistant() {
    panelOpen ? closeAssistant() : openAssistant();
  }

  function openAssistant() {
    let panel = document.querySelector('.assistant-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'assistant-panel';
      panel.innerHTML = `
        <div class="assistant-header">
          <h4 style="margin: 0; font-size: 14px;">🤖 Asistente Zyrix</h4>
          <button style="background: transparent; border: none; color: var(--text-secondary); cursor: pointer; font-size: 18px; padding: 0; width: 24px; height: 24px;" onclick="closeAssistantPanel()">×</button>
        </div>
        <div class="assistant-messages" id="assistantMessages"></div>
        <div class="assistant-input">
          <input id="assistantInput" type="text" placeholder="Di algo..." onkeypress="if(event.key==='Enter') sendAssistantMessage()" />
          <button class="btn btn-primary" style="padding: 10px 14px; font-size: 12px;" onclick="sendAssistantMessage()">➤</button>
        </div>
      `;
      document.body.appendChild(panel);
      
      const messagesEl = panel.querySelector('#assistantMessages');
      const msg = document.createElement('div');
      msg.className = 'message assistant';
      msg.innerHTML = '<div class="message-bubble">¡Hola! 👋 Soy el asistente de Zyrix. ¿En qué puedo ayudarte hoy?</div>';
      messagesEl.appendChild(msg);
    }

    panel.style.display = 'flex';
    panelOpen = true;
    document.getElementById('assistantInput').focus();
  }

  function closeAssistant() {
    const panel = document.querySelector('.assistant-panel');
    if (panel) panel.style.display = 'none';
    panelOpen = false;
  }

  function sendMessage() {
    const input = document.getElementById('assistantInput');
    if (!input) return;

    const question = input.value.trim();
    if (!question) return;

    const messagesEl = document.getElementById('assistantMessages');
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    userMsg.innerHTML = `<div class="message-bubble">${escapeHtml(question)}</div>`;
    messagesEl.appendChild(userMsg);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    input.value = '';

    const response = getResponse(question);
    setTimeout(() => {
      const assistMsg = document.createElement('div');
      assistMsg.className = 'message assistant';
      assistMsg.innerHTML = `<div class="message-bubble">${response}</div>`;
      messagesEl.appendChild(assistMsg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }, 600);
  }

  function getResponse(q) {
    const ql = q.toLowerCase();

    // Saludos
    if (ql.match(/^(hola|hey|buenos dias|buenas noches|¿qué tal|saludos)/)) {
      const greetings = [
        '¡Hola! 👋 Bienvenido a Zyrix. ¿Cómo puedo asistirte?',
        'Hola 😊 ¿En qué te puedo ayudar?',
        '¡Qué tal! 🚀 Dime si necesitas algo específico.',
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // STEM Racing / Quiénes somos
    if (ql.match(/(quién|quiénes|zyrix|escudería|somos|about)/)) {
      return '🏁 Zyrix es una Escudería Nacional de STEM Racing con 10+ años de experiencia. Competimos internacionalmente, innovamos en tecnología automotriz e impartimos educación especializada. ¡Somos 500+ miembros apasionados por la ingeniería!';
    }

    // Registro y Membership
    if (ql.match(/(registr|unirse|miembro|afil|join|cuenta|crear cuenta)/)) {
      return '📋 Para registrarte, haz clic en "Registrarse" en la esquina superior derecha. Solo necesitas: nombre, correo, teléfono (xxx-xxx) y una contraseña segura. ¡Luego recibirás un código de verificación!';
    }

    // Tienda y Compras
    if (ql.match(/(comprar|tienda|producto|precio|mercancía|shop|store)/)) {
      return '🛒 Nuestra tienda tiene mercancía oficial, software especializado y productos de tecnología. Puedes agregar artículos al carrito y completar la compra con un modal seguro. ¡Envíos disponibles en todo el país!';
    }

    // Patrocinios
    if (ql.match(/(patrocinio|patrocinador|sponsor|alianza|partnership|colaboración)/)) {
      return '🤝 ¿Interesado en patrocinar Zyrix? Ir a la sección "Patrocinadores" y completa el formulario con tus datos. Nuestro equipo revisará tu solicitud y se contactará pronto. ¡Valoramos cada alianza!';
    }

    // Descargas y Software
    if (ql.match(/(descarga|software|programa|download|archivo|herramientas)/)) {
      return '📥 Tenemos software exclusivo en nuestra sección Descargas: análisis aerodinámico, suite CAD, simulador autónomo y librerías embebidas. Debes estar logueado y verificado para acceder.';
    }

    // Verificación y Seguridad
    if (ql.match(/(verificación|código|verificar|email|correo|confirmación|autenticación)/)) {
      return '✅ Al registrarte, enviamos un código de verificación (formato: ABC-123). Ingresalo en el modal de verificación. Si no lo recibes, intenta más tarde o contacta soporte.';
    }

    // Problemas de Contraseña
    if (ql.match(/(contraseña|password|olvid|reset|recuper|acceso|login)/)) {
      return '🔐 Si olvidaste tu contraseña, contacta a nuestro equipo de soporte. Usa el botón "Contáctanos" en inicio. Por seguridad, no hacemos reset automático de contraseñas.';
    }

    // Pagos y Checkout
    if (ql.match(/(pago|pagar|checkout|pedir|orden|compra|carrito)/)) {
      return '💰 Agregadatos al carrito desde la tienda. En checkout, verifica tus datos y cantidad. Luego recibirás un PDF con tu orden. Aceptamos pago en efectivo (requiere coordinación).';
    }

    // Contacto y Soporte
    if (ql.match(/(contacto|soporte|ayuda|help|support|email|teléfono|teléfono)/)) {
      return '📞 Contáctanos desde el botón de inicio, sección "Contáctanos". Cuéntanos tu asunto (patrocinio, alianza, voluntariado, etc.) y nos comunicaremos en 24-48 horas.';
    }

    // Equipo y Recursos
    if (ql.match(/(equipo|miembros|ingenieros|programadores|técnicos|staff)/)) {
      return '👥 Zyrix cuenta con 500+ miembros: ingenieros, programadores, mecánicos, diseñadores y estudiantes. Todos comprometidos con la excelencia en STEM Racing e innovación tecnológica.';
    }

    // Competiciones
    if (ql.match(/(competencia|competición|carrera|evento|racing|compet)/)) {
      return '🏆 Participamos en 15+ competiciones internacionales anuales con tasa de éxito del 89%. Nuestros vehículos están equipados con tecnología de punta en automatización y aerodinámica.';
    }

    // Horarios y Disponibilidad
    if (ql.match(/(horario|disponib|abierto|cerrado|horas|cuándo)/)) {
      return '⏰ Zyrix está disponible 24/7 en línea. La plataforma siempre está activa para navegación, compras y soporte. Respuesta de soporte: 24-48 horas.';
    }

    // Educación y Talleres
    if (ql.match(/(educación|taller|curso|capacit|aprendiz|seminario|training)/)) {
      return '📚 Ofrecemos talleres y cursos especializados en ingeniería, programación, CAD, sistemas autónomos y liderazgo. 500+ estudiantes capacitados anualmente. ¡Próximos cursos en febrero!';
    }

    // Precios y Planes
    if (ql.match(/(precio|costo|valor|plan|presupuesto|tarifa)/)) {
      return '💳 Nuestros precios comienzan desde DOP 500 en merchandise hasta DOP 50,000 en software especializado. Ofertas de patrocinio personalizadas. ¡Revisa la tienda para ver todos los productos!';
    }

    // Casos de usos y Recursos
    if (ql.match(/(recursos|documentación|requisito|especificación|manual)/)) {
      return '📖 Contamos con documentación completa, tutoriales y recursos. Accede a la sección Descargas para software y guías. ¡También puedes contactar a soporte para recursos específicos!';
    }

    // Ubicación y Localización
    if (ql.match(/(ubicación|dónde|dirección|localiz|región|país|dominicana)/)) {
      return '📍 Zyrix es una Escudería Nacional con presencia en todo el país. Trabajamos con sinergias a nivel internacional. ¡Envíos disponibles! Contáctanos para más detalles de ubicación específica.';
    }

    // Redes Sociales e Integración
    if (ql.match(/(redes|instagram|facebook|twitter|youtube|social|síguenos)/)) {
      return '📱 Síguenos en redes sociales para actualizaciones en vivo, resultados de competiciones y contenido educativo. Busca "Zyrix STEM Racing" en todas las plataformas.';
    }

    // Default - Fallback
    return '🤔 Pregunta interesante: "' + q.substring(0, 40) + '..." Puedo ayudarte con: registro, tienda, patrocinios, descargas, verificación, contacto, equipo, competiciones, educación y mucho más. ¡Pregunta algo específico!';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Global functions
  window.closeAssistantPanel = closeAssistant;
  window.sendAssistantMessage = sendMessage;
  window.openAssistant = openAssistant;

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
