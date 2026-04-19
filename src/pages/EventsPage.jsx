import { useState, useEffect, useCallback } from "react";
import { getEvents, initiatePayment, checkPendingPayment, getMyTickets } from "../api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { IconCalendar, IconLocation, IconTicket, IconWarning, IconCheck } from "../components/Icons";
import PaymentWaitingPage from "./PaymentWaitingPage";

const formatAriary = (a) => `${Number(a).toLocaleString("fr-FR")} Ar`;
const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";

export default function EventsPage() {
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [legalModal, setLegalModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [phone, setPhone] = useState("");
  const [paying, setPaying] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showWaiting, setShowWaiting] = useState(false);
  const [error, setError] = useState("");
  const [expandedDescs, setExpandedDescs] = useState({});

  const toggleDesc = (eventId) =>
    setExpandedDescs(prev => ({ ...prev, [eventId]: !prev[eventId] }));

  const loadData = useCallback(async () => {
    try {
      const evts = await getEvents();
      if (Array.isArray(evts)) setEvents(evts);
    } catch {}
    if (isAuth) {
      try {
        const tickets = await getMyTickets();
        if (Array.isArray(tickets)) setMyTickets(tickets);
      } catch {}
    }
    setLoading(false);
  }, [isAuth]);

  useEffect(() => { loadData(); }, [loadData]);

  const hasTicket = (eventId) =>
    myTickets.some((t) => t.eventId === eventId && (t.status === "confirmed" || t.qrCode));

  const onBuyPress = async (event) => {
    if (!isAuth) { navigate("/login"); return; }
    try {
      const { hasPending, payment } = await checkPendingPayment(event.id);
      if (hasPending && payment) {
        setPaymentData(payment);
        setSelectedEvent(event);
        setShowWaiting(true);
        return;
      }
    } catch {}
    setSelectedEvent(event);
    setLegalModal(true);
  };

  const onAcceptLegal = () => { setLegalModal(false); setPayModal(true); };

  const handlePay = async () => {
    const cleanPhone = phone.replace(/\s/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      setError("Entrez un numéro valide (min. 9 chiffres)");
      return;
    }
    setError("");
    setPaying(true);
    try {
      const data = await initiatePayment(selectedEvent.id, phone, "Orange Money");
      if (data.payment) {
        setPayModal(false);
        setPaymentData(data.payment);
        setShowWaiting(true);
        setPhone("");
      } else {
        setError(data.message || "Erreur de paiement");
      }
    } catch {
      setError("Connexion impossible. Réessayez.");
    } finally {
      setPaying(false);
    }
  };

  const closePayModal = () => {
    setPayModal(false); setPhone(""); setSelectedEvent(null); setError("");
  };

  const closeWaiting = () => {
    setShowWaiting(false); setPaymentData(null); setSelectedEvent(null); loadData();
  };

  const legalItems = [
    { icon: <IconTicket size={16} color="var(--gold)" />, title: "Billet unique et personnel", text: "Chaque billet est unique et lié à votre compte. Il n'est pas transférable." },
    { icon: <IconWarning size={16} color="var(--gold)" />, title: "Perte ou vol non couverts", text: "En cas de perte ou de vol, nous déclinons toute responsabilité." },
    { icon: <IconWarning size={16} color="var(--gold)" />, title: "Fraude interdite", text: "Toute tentative de fraude ou duplication engage votre responsabilité légale." },
    { icon: <IconWarning size={16} color="var(--gold)" />, title: "Délai de paiement : 30 minutes", text: "Vous disposez de 30 minutes pour finaliser votre paiement. Passé ce délai, la commande sera automatiquement annulée et vous devrez recommencer un nouvel achat. Tout transfert effectué après l'expiration du délai ne pourra pas être pris en charge par l'application." },
  ];

  if (showWaiting && paymentData) {
    return (
      <PaymentWaitingPage
        payment={paymentData}
        onSuccess={() => closeWaiting()}
        onExpired={() => closeWaiting()}
        onCancel={() => closeWaiting()}
      />
    );
  }

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-eyebrow">✦ Réservez vos places ✦</div>
        <h1 className="hero-title">
          Vivez des moments<br /><span>inoubliables</span>
        </h1>
        <div className="hero-title-underline" />
        <p className="hero-desc">
          Découvrez les meilleurs événements de Madagascar et réservez vos billets en quelques secondes via Orange Money.
        </p>

        {/* Stats bar */}
        {events.length > 0 && (
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">{events.length}</div>
              <div className="hero-stat-label">Événements</div>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <div className="hero-stat-value">100%</div>
              <div className="hero-stat-label">Sécurisé</div>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat">
              <div className="hero-stat-value">Orange</div>
              <div className="hero-stat-label">Money</div>
            </div>
          </div>
        )}

        {!isAuth && (
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/register" className="btn-gold">Créer un compte</a>
            <a href="/login" className="btn-gold" style={{ background: "transparent", border: "1.5px solid var(--border-gold)", color: "var(--text-secondary)" }}>
              Se connecter
            </a>
          </div>
        )}
      </div>

      {/* APK Banner */}
      <div className="apk-banner">
        <div className="apk-text">
          <h3>Application Mobile disponible</h3>
          <p>Téléchargez l'app KB Events sur Android pour une expérience optimale</p>
        </div>
        <a href="/kb-events.apk" download className="btn-gold" style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
          ↓ Télécharger l'APK
        </a>
      </div>

      {/* Events header */}
      <div style={{ marginBottom: "0.5rem" }}>
        <h2 className="section-title">Événements à venir</h2>
        {events.length > 0 && (
          <p className="section-sub">{events.length} événement{events.length > 1 ? "s" : ""} disponible{events.length > 1 ? "s" : ""}</p>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)" }}>
          <IconCalendar size={64} color="var(--text-muted)" />
          <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>Aucun événement pour le moment</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>Revenez bientôt !</p>
        </div>
      ) : (
        <div className="events-grid">
          {events.map((event) => {
            const bought = hasTicket(event.id);
            const isExpanded = expandedDescs[event.id];
            const longDesc = event.description && event.description.length > 100;
            return (
              <div key={event.id} className="event-card">
                <div className="event-card-header">
                  {bought && <div className="event-badge-bought">✓ Acheté</div>}
                  <div className="event-card-title">{event.title}</div>
                  <div className="event-card-price-badge">
                    <span>{formatAriary(event.price)}</span>
                    <small>/ billet</small>
                  </div>
                </div>

                <div className="event-card-body">
                  <div className="event-meta">
                    {event.date && (
                      <div className="event-meta-item">
                        <IconCalendar size={14} color="var(--gold-dim)" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="event-meta-item">
                        <IconLocation size={14} color="var(--gold-dim)" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>

                  {event.description && (
                    <div style={{ marginBottom: "1.25rem" }}>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.65 }}>
                        {longDesc && !isExpanded
                          ? event.description.slice(0, 100) + "…"
                          : event.description}
                      </p>
                      {longDesc && (
                        <button
                          onClick={() => toggleDesc(event.id)}
                          style={{
                            background: "none", border: "none", cursor: "pointer",
                            color: "var(--gold)", fontSize: "0.8rem", fontWeight: 700,
                            padding: "0.35rem 0", fontFamily: "var(--font-body)", letterSpacing: "0.3px",
                          }}
                        >
                          {isExpanded ? "▲ Voir moins" : "▼ Voir plus"}
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    className="btn-gold"
                    style={{ width: "100%" }}
                    onClick={() => onBuyPress(event)}
                    disabled={bought}
                  >
                    {bought
                      ? <><IconCheck size={16} color="var(--success)" /> Billet obtenu</>
                      : <><IconTicket size={16} color="var(--gold)" /> Acheter un billet</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legal Modal */}
      {legalModal && (
        <div className="modal-overlay" onClick={() => setLegalModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(243,156,18,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <IconWarning size={28} color="var(--warning)" />
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: "1.5rem" }}>Informations importantes</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              {legalItems.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(26,45,107,0.5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.2rem" }}>{item.title}</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem", lineHeight: 1.6 }}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-gold" style={{ width: "100%", marginBottom: "0.5rem" }} onClick={onAcceptLegal}>
              <IconCheck size={16} color="var(--gold)" /> J'accepte et je continue
            </button>
            <button className="btn-ghost" style={{ width: "100%" }} onClick={() => setLegalModal(false)}>Annuler</button>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payModal && selectedEvent && (
        <div className="modal-overlay bottom">
          <div className="modal-box sheet">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <IconTicket size={22} color="var(--gold)" />
              <h2 style={{ color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 900 }}>Paiement Orange Money</h2>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>{selectedEvent.title}</p>
            <p style={{ color: "var(--gold)", fontSize: "1.8rem", fontWeight: 900, marginBottom: "1.5rem" }}>{formatAriary(selectedEvent.price)}</p>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Votre numéro de téléphone Orange</label>
              <div style={{ display: "flex", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", background: "rgba(26,45,107,0.3)", padding: "0 0.875rem", borderRight: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem", fontWeight: 600 }}>+261</span>
                </div>
                <input
                  className="form-input"
                  style={{ border: "none", borderRadius: 0 }}
                  placeholder="34 00 000 00"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  type="tel"
                  maxLength={13}
                />
              </div>
            </div>

            <button className="btn-gold" style={{ width: "100%", marginBottom: "0.5rem" }} onClick={handlePay} disabled={paying}>
              {paying ? <span className="spinner" /> : <><IconCheck size={16} color="var(--gold)" /> Confirmer le paiement</>}
            </button>
            <button className="btn-ghost" style={{ width: "100%" }} onClick={closePayModal}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
