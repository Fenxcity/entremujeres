﻿import { useState, useRef, useEffect } from "react";

const API_URL = "/api/chat";

const C = {
  cream: "#F8F4EF", parchment: "#EDE8E0", gold: "#C09A5B",
  goldLight: "#D4B483", rose: "#B05C5C", roseDeep: "#8C3A3A",
  charcoal: "#2C2A27", slate: "#5A5652", mist: "#9A9590",
};

const SUGERIDAS = [
  "Mi pareja me golpeó. ¿Qué puedo hacer?",
  "El Ministerio Público no me recibió mi denuncia ¿Qué hago?",
  "Publicaron fotos mías íntimas sin mi permiso.",
  "Mi exnovio me violenta psicológicamente.",
];

const DELITOS = [
  // Violencia familiar
  { n: "Violencia Familiar",   d: "Actos de violencia física, psicológica, patrimonial o sexual en el núcleo familiar. Aplica también para novio o exnovio." },
  // Delitos sexuales
  { n: "Violación",            d: "Acceso carnal sin consentimiento. Incluye violación marital y entre conocidos." },
  { n: "Acoso Sexual",         d: "Conducta de naturaleza sexual no deseada en espacios laborales, escolares o públicos." },
  { n: "Ley Olimpia",          d: "Difusión no consentida de imágenes íntimas." },
  { n: "Ciberacoso",           d: "Hostigamiento, intimidación o amenazas a través de medios digitales y redes sociales." },
  // Otros delitos
  { n: "Sustracción de Menor", d: "Retención ilegal de menores. Protección de derechos de custodia y convivencia." },
  { n: "Abandono de Persona",  d: "Incumplimiento de obligación de dar alimentos. Responsabilidad penal y civil." },
  // Delitos graves
  { n: "Trata de Personas",    d: "Explotación sexual, laboral o mendicidad forzada. Derechos reforzados como víctima." },
  { n: "Feminicidio",          d: "Homicidio de mujer por razones de género. Penas agravadas y protocolo especializado." },
];

/* ── Markdown ── */
function md(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    // headings
    .replace(/^### (.+)$/gm, "<strong style=\"font-size:13px;color:#2C2A27;\">$1</strong>")
    .replace(/^## (.+)$/gm, "<strong style=\"font-size:14px;color:#2C2A27;letter-spacing:0.04em;\">$1</strong>")
    .replace(/^# (.+)$/gm, "<strong style=\"font-size:15px;color:#2C2A27;letter-spacing:0.06em;\">$1</strong>")
    // bold
    .replace(/\*\*(.+?)\*\*/gs, "<strong>$1</strong>")
    // italic: *texto* o _texto_
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/_([^_\n]+)_/g, "<em>$1</em>")
    // separadores --- → línea visual sutil
    .replace(/^-{3,}$/gm, '<hr style="border:none;border-top:1px solid #EDE8E0;margin:8px 0;">')
    // saltos de línea
    .replace(/\n/g, "<br>")
    // quitar <br> pegados al <hr> para evitar espacios dobles
    .replace(/(<br>)+(<hr[^>]*>)/g, "$2")
    .replace(/(<hr[^>]*>)(<br>)+/g, "$1");
}

const INITIAL_MSG = {
  role: "assistant",
  content: "Hola, bienvenida a **Entre Mujeres Legal**.\n\nSoy tu asesora jurídica virtual. Puedo orientarte sobre violencia familiar, acoso sexual, Ley Olimpia y más.\n\n¿En qué puedo ayudarte hoy?",
};

/* ── CHAT PANEL ── */
function ChatPanel({ messages, loading, send, clearChat, open, onClose, errorMsg }) {
  const [input, setInput] = useState("");
  const chatRef     = useRef(null);
  const textareaRef = useRef(null);
  const lastMsgRef  = useRef(null);

  useEffect(() => {
    if (loading) {
      if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    } else if (lastMsgRef.current) {
      lastMsgRef.current.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = (texto) => {
    const t = (texto ?? input).trim();
    if (!t) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    send(t);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  const showSuggestions = messages.length === 1 && messages[0].role === "assistant";

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(44,42,39,0.7)", backdropFilter: "blur(4px)",
        display: open ? "flex" : "none", alignItems: "flex-end", justifyContent: "center",
      }}
    >
      <div style={{
        width: "100%", maxWidth: "620px", height: "92dvh", maxHeight: "100dvh",
        background: C.cream, display: "flex", flexDirection: "column",
        borderRadius: "16px 16px 0 0", overflow: "hidden",
        boxShadow: "0 -8px 40px rgba(0,0,0,0.3)",
      }}>

        {/* Header */}
        <div style={{
          background: C.charcoal, padding: "18px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "13px", letterSpacing: "0.15em", color: C.gold, textTransform: "uppercase" }}>
              Entre Mujeres Legal · Asesora IA
            </div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "12px", color: C.mist, marginTop: "3px", fontStyle: "italic" }}>
              Confidencial · Disponible 24 horas
            </div>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button onClick={clearChat} title="Nueva conversación" style={{ background: "none", border: `1px solid ${C.slate}`, color: C.mist, fontSize: "11px", letterSpacing: "0.08em", padding: "4px 10px", cursor: "pointer", fontFamily: "Georgia,serif" }}>Nueva sesión</button>
            <button onClick={onClose} style={{ background: "none", border: "none", color: C.mist, fontSize: "24px", cursor: "pointer", lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Emergencia */}
        <div style={{ background: C.roseDeep, padding: "8px 20px", textAlign: "center", fontFamily: "Georgia,serif", fontSize: "12px", color: "#fff", flexShrink: 0 }}>
          🆘 Peligro inmediato: <strong>911</strong> · Línea VIDA: <strong>800-911-2000</strong>
        </div>

        {/* Mensajes */}
        <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>

          {/* Sugerencias en estado inicial */}
          {showSuggestions && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "6px" }}>
              {SUGERIDAS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  style={{
                    background: C.parchment, border: `1px solid ${C.gold}44`,
                    borderRadius: "8px", padding: "10px 14px",
                    fontFamily: "Georgia,serif", fontSize: "13px",
                    color: C.charcoal, cursor: "pointer", textAlign: "left",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.goldLight + "33"}
                  onMouseLeave={e => e.currentTarget.style.background = C.parchment}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} ref={i === messages.length - 1 ? lastMsgRef : null} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div
                dangerouslySetInnerHTML={{ __html: md(m.content) }}
                style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  fontFamily: "Georgia,serif",
                  fontSize: "13px",
                  lineHeight: "1.65",
                  background: m.role === "user" ? C.charcoal : "#fff",
                  color:      m.role === "user" ? C.cream    : C.charcoal,
                  border:     m.role === "user" ? "none" : `1px solid ${C.parchment}`,
                  borderLeft: m.role === "assistant" ? `3px solid ${C.gold}` : undefined,
                  borderRadius: "2px",
                }}
              />
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ padding: "10px 16px", background: "#fff", border: `1px solid ${C.parchment}`, borderLeft: `3px solid ${C.gold}`, display: "flex", gap: "6px", alignItems: "center" }}>
                {[0, 150, 300].map(d => (
                  <span key={d} style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, display: "inline-block", animation: `bounce 0.9s ${d}ms infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {errorMsg && (
          <div style={{
            padding: "10px 20px", background: "#fff5f5",
            borderTop: `1px solid ${C.rose}44`, flexShrink: 0,
            fontFamily: "Georgia,serif", fontSize: "12px",
            color: C.roseDeep, textAlign: "center", lineHeight: "1.6",
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: "12px 16px 16px", background: C.cream, display: "flex", gap: "10px", alignItems: "flex-end", borderTop: `1px solid ${C.mist}33`, flexShrink: 0 }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize(e); }}
            onKeyDown={handleKey}
            placeholder="Escribe tu consulta aquí…"
            rows={2}
            style={{
              flex: 1, resize: "none", border: `1px solid ${C.mist}66`,
              borderRadius: "10px", padding: "10px 14px",
              fontFamily: "Georgia,serif", fontSize: "14px",
              color: C.charcoal, background: C.parchment,
              outline: "none", lineHeight: "1.5", maxHeight: "100px",
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            style={{
              background: loading || !input.trim() ? C.mist : C.gold,
              color: "#fff", border: "none", borderRadius: "10px",
              padding: "10px 18px", fontFamily: "Georgia,serif", fontSize: "13px",
              cursor: loading || !input.trim() ? "default" : "pointer",
              transition: "background 0.2s", whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            Enviar
          </button>
        </div>

        {/* Aviso asesoría telefónica */}
        <div style={{ background: C.cream, padding: "8px 24px", textAlign: "center", fontFamily: "Georgia,serif", fontSize: "11px", color: C.slate, borderTop: `1px solid ${C.mist}22`, flexShrink: 0, lineHeight: "1.5" }}>
          ¿Tienes dudas con el chat? Llama al{" "}
          <a href="tel:+522228633646" style={{ color: C.gold, textDecoration: "none", fontWeight: "bold" }}>222 863 3646</a>
          {" "}— primera asesoría telefónica gratuita.
        </div>

        {/* Disclaimer */}
        <div style={{ background: C.parchment, padding: "6px 24px", paddingBottom: "max(6px, env(safe-area-inset-bottom, 6px))", fontFamily: "Georgia,serif", fontSize: "10px", color: C.mist, borderTop: `1px solid ${C.mist}33`, flexShrink: 0 }}>
          Orientación general · No constituye patrocinio legal ni relación abogado-cliente
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

/* ── BOTÓN FLOTANTE (LAUNCHER) ── */
function ChatLauncher({ onOpen }) {
  return (
    <div style={{
      position: "fixed", bottom: "24px", right: "24px", zIndex: 9998,
      display: "flex", alignItems: "center", gap: "12px",
    }}>
      {/* Etiqueta */}
      <div className="eml-launcher-label" style={{
        background: C.charcoal, color: C.cream,
        fontFamily: "Georgia,serif", fontSize: "13px", fontStyle: "italic",
        padding: "8px 14px", borderRadius: "20px 20px 4px 20px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)", whiteSpace: "nowrap",
      }}>
        ¿Necesitas ayuda? <span style={{ color: C.goldLight }}>Chatea conmigo</span>
      </div>

      {/* Avatar / botón */}
      <button
        onClick={onOpen}
        aria-label="Abrir chat con la asesora virtual"
        style={{
          position: "relative", width: "66px", height: "66px",
          borderRadius: "50%", border: "none", padding: 0, cursor: "pointer",
          background: "transparent", flexShrink: 0,
          filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.35))",
        }}
      >
        {/* Anillo pulsante */}
        <span style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: `2px solid ${C.gold}`, animation: "eml-pulse 2s infinite",
          pointerEvents: "none",
        }} />

        {/* Ilustración animada de la asesora */}
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", display: "block" }}>
          <defs><clipPath id="emlAvatarClip"><circle cx="100" cy="100" r="96" /></clipPath></defs>
          <circle cx="100" cy="100" r="96" fill="#2C2A27" />
          <g clipPath="url(#emlAvatarClip)">

            {/* Respiración: todo el cuerpo sube y baja suavemente */}
            <g>
              <animateTransform attributeName="transform" type="translate"
                values="0 0; 0 -2.5; 0 0" keyTimes="0;0.5;1" dur="3.6s"
                calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                repeatCount="indefinite" />

              {/* Saco, blusa y cuello */}
              <path d="M40 205 C40 158 64 140 100 140 C136 140 160 158 160 205 Z" fill="#3a3835" />
              <path d="M100 142 L90 205 L110 205 Z" fill="#F8F4EF" />
              <rect x="92" y="120" width="16" height="26" rx="8" fill="#E8B796" />

              {/* Cabeza: leve balanceo */}
              <g>
                <animateTransform attributeName="transform" type="rotate"
                  values="-2 100 124; 2 100 124; -2 100 124" keyTimes="0;0.5;1" dur="6s"
                  calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                  repeatCount="indefinite" />

                <circle cx="100" cy="98" r="30" fill="#F0C5A6" />
                <path d="M68 100 C66 70 88 58 100 58 C112 58 134 70 132 100 C130 84 120 80 120 80 C118 92 116 96 116 96 C116 78 108 74 100 74 C92 74 84 78 84 96 C84 96 82 92 80 80 C80 80 70 84 68 100 Z" fill="#4a3528" />
                <path d="M72 96 A28 28 0 0 1 128 96" fill="none" stroke="#C09A5B" strokeWidth="5" />
                <rect x="67" y="92" width="9" height="15" rx="4" fill="#C09A5B" />
                <path d="M72 100 C66 116 80 122 90 120" fill="none" stroke="#C09A5B" strokeWidth="4" strokeLinecap="round" />
                <circle cx="91" cy="120" r="3" fill="#C09A5B" />

                {/* Ojos */}
                <circle cx="91" cy="98" r="2.5" fill="#2C2A27" />
                <circle cx="109" cy="98" r="2.5" fill="#2C2A27" />

                {/* Párpados (parpadeo) */}
                <ellipse cx="91" cy="98" rx="3.4" ry="0" fill="#F0C5A6">
                  <animate attributeName="ry" values="0;0;3.4;0" keyTimes="0;0.93;0.965;1" dur="4.5s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="109" cy="98" rx="3.4" ry="0" fill="#F0C5A6">
                  <animate attributeName="ry" values="0;0;3.4;0" keyTimes="0;0.93;0.965;1" dur="4.5s" repeatCount="indefinite" />
                </ellipse>

                {/* Boca: sutil movimiento al "hablar" */}
                <path fill="none" stroke="#9a5b4a" strokeWidth="2.5" strokeLinecap="round" d="M93 108 Q100 113 107 108">
                  <animate attributeName="d"
                    values="M93 108 Q100 113 107 108; M93 108 Q100 116 107 108; M93 108 Q100 113 107 108"
                    keyTimes="0;0.5;1" dur="2.8s" repeatCount="indefinite" />
                </path>
              </g>
            </g>
          </g>
          <circle cx="100" cy="100" r="93" fill="none" stroke="#C09A5B" strokeWidth="3" />
        </svg>

        {/* Punto "en línea" */}
        <span style={{
          position: "absolute", top: "3px", right: "3px",
          width: "14px", height: "14px", borderRadius: "50%",
          background: "#4CAF7D", border: "2px solid #fff", pointerEvents: "none",
        }} />
      </button>

      <style>{`
        @keyframes eml-pulse {
          0%   { transform: scale(1);    opacity: 0.7; }
          70%  { transform: scale(1.4);  opacity: 0;   }
          100% { transform: scale(1.4);  opacity: 0;   }
        }
        @media (max-width: 640px) {
          .eml-launcher-label { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ── APP PRINCIPAL ── */
export default function App() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [loading, setLoading]   = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const clearChat = () => { setMessages([INITIAL_MSG]); setErrorMsg(null); };

  const send = async (t) => {
    if (!t || loading) return;
    const userMsg    = { role: "user", content: t };
    const prevMessages = messages;
    const history    = [...messages, userMsg];
    setMessages(history);
    setErrorMsg(null);
    setLoading(true);
    try {
      const res  = await fetch(API_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history.map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: data.reply ?? "Sin respuesta.",
        }]);
      } else {
        setMessages(prevMessages);
        setErrorMsg(
          data.error === "Conversación demasiado larga"
            ? "La conversación alcanzó su límite. Inicia una nueva sesión para continuar."
            : "Ocurrió un error al procesar tu consulta. Intenta de nuevo."
        );
      }
    } catch {
      setMessages(prevMessages);
      setErrorMsg("No pude conectarme al servidor. Verifica tu conexión.");
    }
    setLoading(false);
  };

  return (
    <div style={{ fontFamily: "Georgia,serif", background: C.cream, minHeight: "100vh" }}>

      {/* Banner emergencia */}
      <div style={{
        background: C.roseDeep, color: "#fff",
        textAlign: "center", padding: "11px 24px",
        fontFamily: "Georgia,serif", fontSize: "13px",
        letterSpacing: "0.04em", lineHeight: "1.5",
      }}>
        🆘 Peligro inmediato — llama al <strong>911</strong> · Línea VIDA: <strong>800-911-2000</strong>
      </div>

      {/* Nav */}
      <nav className="eml-nav" style={{
        background: C.cream, borderBottom: `1px solid ${C.parchment}`,
        padding: "20px 48px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: "14px", letterSpacing: "0.25em", color: C.gold, textTransform: "uppercase" }}>
          Entre Mujeres Legal
        </div>
        <a
          href="https://wa.me/522228633646"
          target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: "Georgia,serif", fontSize: "12px",
            letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase",
            textDecoration: "none", border: `1px solid ${C.gold}`, padding: "8px 22px",
          }}
        >
          Consulta con Nosotros
        </a>
      </nav>

      {/* Hero */}
      <section className="eml-hero" style={{
        minHeight: "86vh", padding: "60px 32px",
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", textAlign: "center", gap: "32px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: "500px", height: "500px", borderRadius: "50%",
          background: `radial-gradient(circle, ${C.goldLight}18 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        <div className="eml-badge" style={{
          border: `1px solid ${C.mist}`, padding: "7px 22px",
          fontFamily: "Georgia,serif", fontSize: "11px",
          letterSpacing: "0.2em", color: C.rose, textTransform: "uppercase",
        }}>
          Especialistas · Violencia de Género · Sistema Penal Acusatorio
        </div>

        <h1 style={{
          fontFamily: "Georgia,serif", fontSize: "clamp(38px,6vw,72px)",
          fontWeight: "400", color: C.charcoal,
          lineHeight: "1.15", margin: 0, maxWidth: "760px",
        }}>
          Justicia al alcance de <em style={{ fontStyle: "italic" }}>todas</em> las{" "}
          <span style={{ color: C.gold }}>mujeres</span>
        </h1>

        <p style={{
          fontFamily: "Georgia,serif", fontSize: "17px",
          color: C.slate, fontStyle: "italic",
          maxWidth: "500px", margin: 0, lineHeight: "1.7",
        }}>
          Asesoría jurídica especializada en violencia de género, disponible las 24 horas.
        </p>

        <button
          onClick={() => setOpen(true)}
          style={{
            background: C.charcoal, color: C.cream, border: "none",
            padding: "16px 48px", fontFamily: "Georgia,serif", fontSize: "13px",
            letterSpacing: "0.12em", textTransform: "uppercase",
            cursor: "pointer", width: "100%", maxWidth: "420px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
          }}
        >
          INICIAR ASESORÍA GRATIS
          <span style={{ fontSize: "11px", letterSpacing: "0.06em", color: C.goldLight, textTransform: "none", fontStyle: "italic" }}>
            Abrir chat — gratuito y anónimo
          </span>
        </button>

        <p
          onClick={() => setOpen(true)}
          style={{
            fontFamily: "Georgia,serif", fontSize: "13px",
            color: C.rose, fontStyle: "italic", cursor: "pointer",
            margin: 0, textDecoration: "underline",
            textDecorationColor: `${C.rose}66`, textUnderlineOffset: "3px",
          }}
        >
          <span style={{display:"block", marginBottom:"8px"}}>¿No sabes dónde denunciar?</span><span style={{display:"block", marginBottom:"8px"}}>¿El Ministerio Público no te recibió tu denuncia?</span><span style={{display:"block"}}>Pregúntale al chatbot de Entre Mujeres Legal</span>
        </p>

        <a
          href="https://wa.me/522228633646"
          target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: "Georgia,serif", fontSize: "12px",
            letterSpacing: "0.1em", color: C.gold, textTransform: "uppercase",
            textDecoration: "none", border: `1px solid ${C.gold}`,
            padding: "12px 40px", width: "100%", maxWidth: "420px",
            textAlign: "center", display: "inline-block", boxSizing: "border-box",
          }}
        >
          Consulta con Nosotros
        </a>
      </section>

      {/* Áreas de Especialidad */}
      <section className="eml-section" style={{ background: C.parchment, padding: "48px 48px" }}>
        <h2 style={{
          fontFamily: "Georgia,serif", fontSize: "12px",
          letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase",
          marginBottom: "40px", textAlign: "center",
        }}>
          Áreas de Especialidad
        </h2>
        <div className="eml-delitos-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)",
          gap: "1px", background: `${C.mist}44`,
        }}>
          {DELITOS.map(d => (
            <div key={d.n} style={{ background: C.cream, padding: "32px 28px" }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "16px", color: C.rose, marginBottom: "8px" }}>
                {d.n}
              </div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "13px", color: C.slate, lineHeight: "1.6" }}>
                {d.d}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Servicios */}
      <section className="eml-section" style={{ background: C.cream, padding: "48px 48px" }}>
        <div className="eml-servicios-grid" style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

          {/* Escritos Urgentes */}
          <div style={{ border: `1px solid ${C.mist}`, padding: "40px 36px" }}>
            <div style={{
              fontFamily: "Georgia,serif", fontSize: "12px",
              letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: "16px",
            }}>
              Escritos Urgentes
            </div>
            <p style={{ fontFamily: "Georgia,serif", fontSize: "15px", color: C.charcoal, lineHeight: "1.8", marginBottom: "20px" }}>
              Redactamos por ti los documentos legales que necesitas, en el menor tiempo posible:
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Escritos de denuncia penal",
                "Solicitud de copias de carpeta de investigación",
                "Escritos de medidas de protección",
                "Recursos y promociones ante fiscalía",
                "Otros escritos urgentes",
              ].map(item => (
                <li key={item} style={{
                  fontFamily: "Georgia,serif", fontSize: "13px", color: C.slate,
                  padding: "7px 0", borderBottom: `1px solid ${C.parchment}`,
                  display: "flex", gap: "10px", alignItems: "flex-start",
                }}>
                  <span style={{ color: C.rose, flexShrink: 0 }}>—</span> {item}
                </li>
              ))}
            </ul>
            <a
              href="https://wa.me/522228633646?text=Hola%20buen%20d%C3%ADa,%20quisiera%20solicitar%20un%20escrito%20urgente"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "inline-block", marginTop: "28px",
                fontFamily: "Georgia,serif", fontSize: "12px",
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: C.gold, textDecoration: "none",
                borderBottom: `1px solid ${C.gold}`, paddingBottom: "2px",
              }}
            >
              Solicitar escrito →
            </a>
          </div>

          {/* Videoconsulta */}
          <div style={{ border: `1px solid ${C.gold}`, padding: "40px 36px", background: C.parchment }}>
            <div style={{
              fontFamily: "Georgia,serif", fontSize: "12px",
              letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: "16px",
            }}>
              Asesoría por Videollamada
            </div>
            <p style={{ fontFamily: "Georgia,serif", fontSize: "15px", color: C.charcoal, lineHeight: "1.8", marginBottom: "16px" }}>
              Consulta personalizada con personal jurídico especializado en violencia de género, desde la comodidad de tu hogar.
            </p>
            <p style={{ fontFamily: "Georgia,serif", fontSize: "13px", color: C.slate, lineHeight: "1.7", marginBottom: "28px" }}>
              Atención confidencial, sin necesidad de trasladarte. Revisamos tu caso a detalle y te orientamos sobre los pasos a seguir.
            </p>
            <div style={{ background: C.cream, border: `1px solid ${C.parchment}`, padding: "16px 14px", marginBottom: "28px", borderRadius: "4px" }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "11px", letterSpacing: "0.12em", color: C.gold, textTransform: "uppercase", marginBottom: "12px" }}>
                Incluye:
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {["Seguimiento por 48 horas post-consulta", "Acceso a recursos y contactos en Puebla"].map(item => (
                  <li key={item} style={{
                    fontFamily: "Georgia,serif", fontSize: "12px", color: C.slate,
                    padding: "6px 0", display: "flex", gap: "8px",
                  }}>
                    <span style={{ color: C.rose, flexShrink: 0 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ borderTop: `1px solid ${C.gold}55`, paddingTop: "24px", display: "flex", justifyContent: "flex-end" }}>
              <a
                href="https://wa.me/522228633646?text=Hola%20buen%20d%C3%ADa,%20quisiera%20agendar%20una%20videoconsulta"
                target="_blank" rel="noopener noreferrer"
                style={{
                  background: C.charcoal, color: C.cream, textDecoration: "none",
                  fontFamily: "Georgia,serif", fontSize: "12px",
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  padding: "14px 22px", display: "inline-block",
                }}
              >
                Agendar →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="eml-section" style={{ background: C.cream, padding: "48px 48px", display: "flex", justifyContent: "center" }}>
        <div style={{ maxWidth: "580px" }}>
          <h2 style={{
            fontFamily: "Georgia,serif", fontSize: "12px",
            letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: "20px",
          }}>
            Entre Mujeres Legal
          </h2>
          <p style={{ fontFamily: "Georgia,serif", fontSize: "17px", color: C.charcoal, lineHeight: "1.8", marginBottom: "14px" }}>
            Despacho especializado en derecho penal y violencia de género. Puebla, México.
          </p>
          <p style={{ fontFamily: "Georgia,serif", fontSize: "14px", color: C.slate, lineHeight: "1.7", fontStyle: "italic" }}>
            Comprometidas con la protección de los derechos de las mujeres y el acceso a la justicia.
          </p>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="eml-section" style={{ background: C.cream, padding: "40px 48px" }}>
        <div className="eml-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "16px", maxWidth: "800px", margin: "0 auto" }}>
          {[
            { num: "500+", label: "Víctimas atendidas" },
            { num: "300+", label: "Casos de éxito" },
            { num: "24h",  label: "Disponibilidad" },
          ].map(s => (
            <div key={s.label} style={{ border: `1px solid ${C.gold}`, padding: "28px 16px", textAlign: "center" }}>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "36px", color: C.gold }}>{s.num}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase", color: C.slate, marginTop: "8px" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="eml-footer-grid" style={{
        background: C.charcoal, color: C.mist, padding: "52px 48px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px",
      }}>
        <div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "12px", letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: "20px" }}>Contacto</div>
          {[
            { text: "Puebla, Pue., México", href: null },
            { text: "222 863 3646", href: "tel:+522228633646" },
            { text: "entremujereslegal@gmail.com", href: "mailto:entremujereslegal@gmail.com" },
            { text: "Disponible 24 horas", href: null },
          ].map(({ text, href }) => (
            href
              ? <a key={text} href={href} style={{ display: "block", fontFamily: "Georgia,serif", fontSize: "13px", color: C.mist, marginBottom: "9px", textDecoration: "none" }}>{text}</a>
              : <div key={text} style={{ fontFamily: "Georgia,serif", fontSize: "13px", color: C.mist, marginBottom: "9px" }}>{text}</div>
          ))}
          <div style={{ marginTop: "14px", fontFamily: "Georgia,serif", fontSize: "13px", color: C.rose }}>
            🆘 Línea VIDA: 800-911-2000
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "12px", letterSpacing: "0.2em", color: C.gold, textTransform: "uppercase", marginBottom: "20px" }}>Delitos</div>
          {DELITOS.map(d => (
            <div key={d.n} style={{ fontFamily: "Georgia,serif", fontSize: "13px", color: C.mist, marginBottom: "9px" }}>{d.n}</div>
          ))}
        </div>
        <div style={{ gridColumn: "1/-1", borderTop: "1px solid #3a3835", paddingTop: "20px", fontFamily: "Georgia,serif", fontSize: "11px", color: "#5a5650", lineHeight: "1.7" }}>
          © 2026 Entre Mujeres Legal · Todos los derechos reservados.<br />
          <em>
            La asesoría automatizada es orientación general y no constituye
            patrocinio legal ni relación abogado-cliente. Para casos específicos
            se recomienda la consulta personal.
          </em>
        </div>
      </footer>

      <style>{`
        @media (max-width: 640px) {
          .eml-nav   { padding: 14px 20px !important; }
          .eml-hero  { padding: 40px 20px !important; gap: 22px !important; }
          .eml-badge { font-size: 9px !important; letter-spacing: 0.08em !important; padding: 6px 12px !important; }
          .eml-section { padding: 48px 20px !important; }
          .eml-servicios-grid { grid-template-columns: 1fr !important; }
          .eml-delitos-grid { grid-template-columns: 1fr !important; }
          .eml-stats-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
          .eml-footer-grid { grid-template-columns: 1fr !important; padding: 40px 20px !important; }
        }
      `}</style>

      {!open && <ChatLauncher onOpen={() => setOpen(true)} />}

      <ChatPanel
        messages={messages} loading={loading} send={send} clearChat={clearChat}
        open={open} onClose={() => setOpen(false)} errorMsg={errorMsg}
      />
    </div>
  );
}

