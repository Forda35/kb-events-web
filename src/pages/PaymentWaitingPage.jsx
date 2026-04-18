import { useState, useEffect, useRef } from "react";
import { API_URL, confirmOrangePayment } from "../api";
import { IconInfo, IconApp, IconUSSD, IconCopy, IconCheck } from "../components/Icons";
import QRCodeLib from "qrcode";

const formatAriary = (a) => `${Number(a).toLocaleString("fr-FR")} Ar`;

export default function PaymentWaitingPage({ payment, onSuccess, onExpired, onCancel }) {
  const [status, setStatus] = useState("pending");
  const [ticket, setTicket] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const pollingRef = useRef(null);
  const timerRef = useRef(null);

  const getInitialTimeLeft = () => {
    if (payment?.motifExpiry) {
      return Math.max(0, Math.floor((new Date(payment.motifExpiry) - new Date()) / 1000));
    }
    return 30 * 60;
  };
  const [timeLeft, setTimeLeft] = useState(getInitialTimeLeft);

  const stopPolling = () => {
    clearInterval(pollingRef.current);
    clearInterval(timerRef.current);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(payment?.merchantCode || "");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenApp = () => {
    const pkg = "com.orange.orangemoneyafrique";
    const intentUrl = `intent:#Intent;package=${pkg};end`;
    try { window.location.href = intentUrl; } catch {}
  };

  const handleUSSD = () => {
    const numero = payment?.merchantCode?.replace(/\s/g, "") || "";
    const montant = Math.round(payment?.amount) || "";
    const ussdCode = `#144*1*1*${numero}*${numero}*${montant}*2#`;
    window.location.href = `tel:${ussdCode.replace(/#/g, "%23")}`;
  };

  const handleOrangeConfirm = async () => {
    const trimmed = transactionId.trim();
    if (trimmed.length < 4) {
      alert("Veuillez saisir votre Transaction ID reçu par SMS.");
      return;
    }
    setConfirmLoading(true);
    try {
      const res = await confirmOrangePayment(payment.id, trimmed);
      if (res.ticket) {
        stopPolling();
        setStatus("completed");
        setTicket(res.ticket);
        onSuccess(res.ticket);
      } else {
        alert(res.message || "Confirmation impossible.");
      }
    } catch {
      alert("Problème de connexion.");
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);

    const poll = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/payments/status/${payment.id}`, {
          headers: { Authorization: "Bearer " + token },
        });
        const data = await res.json();
        if (data.status === "completed" && data.ticket) {
          stopPolling();
          setStatus("completed");
          setTicket(data.ticket);
          onSuccess(data.ticket);
        } else if (data.status === "expired") {
          stopPolling();
          setStatus("expired");
          onExpired();
        }
      } catch {}
    };

    pollingRef.current = setInterval(poll, 5000);
    return () => stopPolling();
  }, []);

  // Generate QR for success screen
  useEffect(() => {
    if (ticket?.qrCode) {
      QRCodeLib.toDataURL(ticket.qrCode, { width: 200, margin: 1 }).then(setQrDataUrl).catch(() => {});
    }
  }, [ticket]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  if (status === "completed" && ticket) {
    return (
      <div className="page" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1.5rem" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(46,204,113,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconCheck size={36} color="var(--success)" />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", color: "var(--gold)", fontSize: "2rem" }}>Billet confirmé !</h2>
        <div className="qr-wrapper no-screenshot">
          {qrDataUrl && <img src={qrDataUrl} alt="QR Code" width={180} height={180} />}
        </div>
        <button className="btn-gold" onClick={() => onSuccess(ticket)}>Voir mes billets</button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="payment-waiting">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <button className="btn-ghost" onClick={onCancel} style={{ padding: "0.5rem" }}>←</button>
          <h1 style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 800 }}>Paiement en attente</h1>
        </div>

        <div className="timer-display">
          <div className={`timer-value ${timeLeft < 300 ? "urgent" : ""}`}>{formatTime(timeLeft)}</div>
          <div className="timer-label">restant</div>
        </div>

        <div className="info-banner">
          <IconInfo size={18} color="var(--gold)" />
          <span>Notez votre Transaction ID après le transfert, copiez-le et collez-le ci-dessous. Vous pouvez utiliser l'application ou le code USSD.</span>
        </div>

        <div className="instruct-card">
          <div className="instruct-row">
            <span className="instruct-label">Numéro Orange</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="instruct-value">{payment.merchantCode}</span>
              <button className="copy-btn" onClick={copyCode}>
                {copiedCode ? <IconCheck size={11} color="var(--success)" /> : <IconCopy size={11} color="var(--gold)" />}
                {copiedCode ? "OK" : "Copier"}
              </button>
            </div>
          </div>
          <div className="instruct-divider" />
          <div className="instruct-row">
            <span className="instruct-label">Montant</span>
            <span style={{ color: "var(--success)", fontWeight: 900, fontSize: "1.1rem" }}>{formatAriary(payment.amount)}</span>
          </div>
        </div>

        <div className="action-btns">
          <button className="action-btn" onClick={handleOpenApp}>
            <IconApp size={22} color="var(--gold)" />
            App Orange
          </button>
          <button className="action-btn" onClick={handleUSSD}>
            <IconUSSD size={22} color="var(--gold)" />
            Lancer USSD
          </button>
        </div>

        <div className="orange-confirm-box">
          <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.875rem" }}>
            Collez ici le Transaction ID reçu par SMS :
          </p>
          <input
            className="form-input"
            placeholder="Ex: MP250101.1234.A000"
            value={transactionId}
            onChange={e => setTransactionId(e.target.value.toUpperCase())}
            style={{ marginBottom: "0.875rem", fontWeight: 700, letterSpacing: "0.5px" }}
          />
          <button className="btn-gold" style={{ width: "100%" }} onClick={handleOrangeConfirm} disabled={confirmLoading}>
            {confirmLoading ? <span className="spinner" /> : "Vérifier mon paiement"}
          </button>
        </div>

        <div className="polling-indicator">
          <span className="spinner" style={{ width: 14, height: 14 }} />
          <span>Vérification automatique...</span>
        </div>
      </div>
    </div>
  );
}
