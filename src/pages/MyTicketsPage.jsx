import { useState, useEffect, useRef } from "react";
import { getMyTickets } from "../api";
import { useAuth } from "../context/AuthContext";
import { IconCalendar, IconLocation, IconDownload, IconTicket } from "../components/Icons";
import QRCodeLib from "qrcode";
import jsPDF from "jspdf";

const formatDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
const formatAriary = (a) => `${Number(a).toLocaleString("fr-FR")} Ar`;

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrUrls, setQrUrls] = useState({});
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    getMyTickets().then((data) => {
      if (Array.isArray(data)) {
        const confirmed = data.filter(t => t.status === "confirmed" && t.qrCode);
        setTickets(confirmed);
        // Generate QR codes
        confirmed.forEach(async (t) => {
          const url = await QRCodeLib.toDataURL(t.qrCode, { width: 250, margin: 1, color: { dark: "#000", light: "#fff" } });
          setQrUrls(prev => ({ ...prev, [t.id]: url }));
        });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const downloadTicketPDF = async (ticket) => {
    setDownloading(ticket.id);
    try {
      const qrUrl = qrUrls[ticket.id];
      if (!qrUrl) return;

      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: [100, 220] });
      const W = 100;

      // Background
      doc.setFillColor(6, 9, 20);
      doc.rect(0, 0, W, 220, "F");

      // Gold top stripe
      doc.setFillColor(201, 168, 76);
      doc.rect(0, 0, W, 3, "F");

      // Header section
      doc.setFillColor(15, 23, 41);
      doc.roundedRect(5, 8, 90, 55, 4, 4, "F");
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.4);
      doc.roundedRect(5, 8, 90, 55, 4, 4, "S");

      // KB Events logo text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(201, 168, 76);
      doc.text("KB EVENTS", W / 2, 16, { align: "center" });

      // Event name
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(240, 233, 214);
      const eventName = ticket.event?.title || "Événement";
      const nameLines = doc.splitTextToSize(eventName, 80);
      doc.text(nameLines, W / 2, 26, { align: "center" });

      // Price
      doc.setFontSize(9);
      doc.setTextColor(201, 168, 76);
      doc.text(formatAriary(ticket.event?.price || 0), W / 2, 36, { align: "center" });

      // Meta info
      doc.setFontSize(7);
      doc.setTextColor(138, 150, 176);

      let yMeta = 44;
      if (ticket.event?.date) {
        doc.text(`${formatDate(ticket.event.date)}`, W / 2, yMeta, { align: "center" });
        yMeta += 6;
      }
      if (ticket.event?.location) {
        doc.text(`${ticket.event.location}`, W / 2, yMeta, { align: "center" });
        yMeta += 6;
      }

      // Separator (dashed)
      doc.setDrawColor(201, 168, 76);
      doc.setLineWidth(0.3);
      doc.setLineDashPattern([2, 2], 0);
      doc.line(5, 68, 95, 68);
      // Circles on dashes
      doc.setFillColor(6, 9, 20);
      doc.circle(2, 68, 4, "F");
      doc.circle(98, 68, 4, "F");
      doc.setLineDashPattern([], 0);

      // QR Code section
      doc.setFillColor(15, 23, 41);
      doc.roundedRect(5, 72, 90, 110, 4, 4, "F");
      doc.setDrawColor(201, 168, 76);
      doc.roundedRect(5, 72, 90, 110, 4, 4, "S");

      // QR Code (white background)
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(22, 80, 56, 56, 3, 3, "F");
      doc.addImage(qrUrl, "PNG", 23, 81, 54, 54);

      // Ticket number
      doc.setFontSize(6);
      doc.setTextColor(74, 84, 112);
      doc.text(`N° ${ticket.id.slice(0, 8).toUpperCase()}`, W / 2, 142, { align: "center" });

      // Divider
      doc.setDrawColor(26, 45, 107);
      doc.setLineWidth(0.2);
      doc.line(20, 146, 80, 146);

      // Email
      doc.setFontSize(6.5);
      doc.setTextColor(138, 150, 176);
      doc.text("Titulaire", W / 2, 152, { align: "center" });
      doc.setFontSize(7.5);
      doc.setTextColor(240, 233, 214);
      doc.setFont("helvetica", "bold");
      const emailLines = doc.splitTextToSize(user?.email || "", 80);
      doc.text(emailLines, W / 2, 158, { align: "center" });

      // Status badge
      doc.setFillColor(46, 204, 113);
      doc.roundedRect(30, 166, 40, 8, 2, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(6, 9, 20);
      doc.setFont("helvetica", "bold");
      doc.text("BILLET CONFIRMÉ", W / 2, 171.5, { align: "center" });

      // Footer note
      doc.setFontSize(5.5);
      doc.setTextColor(74, 84, 112);
      doc.setFont("helvetica", "normal");
      doc.text("Ce billet est unique et personnel. Ne le partagez pas.", W / 2, 178, { align: "center" });

      // Gold bottom stripe
      doc.setFillColor(201, 168, 76);
      doc.rect(0, 217, W, 3, "F");

      const filename = `billet-${(ticket.event?.title || "kbevents").replace(/\s+/g, "-").toLowerCase()}-${ticket.id.slice(0, 6)}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error("PDF error:", e);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="section-title">Mes Billets</h1>
        <p className="section-sub">{tickets.length} billet{tickets.length > 1 ? "s" : ""} confirmé{tickets.length > 1 ? "s" : ""}</p>
      </div>

      {tickets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted)" }}>
          <IconTicket size={64} color="var(--text-muted)" />
          <p style={{ marginTop: "1rem", fontSize: "1.1rem" }}>Aucun billet pour le moment</p>
          <p style={{ fontSize: "0.875rem", marginTop: "0.5rem", marginBottom: "1.5rem" }}>Explorez les événements et réservez votre place !</p>
          <a href="/" className="btn-gold">Voir les événements</a>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card no-screenshot">
              <div className="ticket-header">
                <div className="ticket-event-name">{ticket.event?.title || "Événement"}</div>
                <div style={{ color: "var(--gold)", fontWeight: 900, fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                  {formatAriary(ticket.event?.price || 0)}
                </div>
                <div className="ticket-meta">
                  {ticket.event?.date && (
                    <div className="ticket-meta-item">
                      <IconCalendar size={13} color="var(--gold-dim)" />
                      <span>{formatDate(ticket.event.date)}</span>
                    </div>
                  )}
                  {ticket.event?.location && (
                    <div className="ticket-meta-item">
                      <IconLocation size={13} color="var(--gold-dim)" />
                      <span>{ticket.event.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="ticket-body">
                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(46,204,113,0.1)", border: "1px solid rgba(46,204,113,0.3)", borderRadius: "100px", padding: "0.35rem 1rem" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
                  <span style={{ color: "var(--success)", fontSize: "0.8rem", fontWeight: 700, letterSpacing: "0.5px" }}>BILLET CONFIRMÉ</span>
                </div>

                {/* QR Code */}
                <div className="qr-wrapper" onContextMenu={e => e.preventDefault()}>
                  {qrUrls[ticket.id]
                    ? <img src={qrUrls[ticket.id]} alt="QR Code" width={180} height={180} draggable={false} style={{ display: "block" }} />
                    : <div style={{ width: 180, height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}><div className="spinner" /></div>
                  }
                </div>

                {/* Ticket number */}
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", letterSpacing: "1px" }}>
                  N° {ticket.id.slice(0, 8).toUpperCase()}
                </div>

                {/* Email */}
                <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                  {user?.email}
                </div>

                {/* Download */}
                <button
                  className="btn-gold"
                  style={{ width: "100%" }}
                  onClick={() => downloadTicketPDF(ticket)}
                  disabled={downloading === ticket.id || !qrUrls[ticket.id]}
                >
                  {downloading === ticket.id
                    ? <span className="spinner" />
                    : <><IconDownload size={16} color="var(--gold)" /> Télécharger le billet PDF</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
