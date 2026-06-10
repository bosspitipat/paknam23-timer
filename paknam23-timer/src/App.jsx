import { useState, useEffect, useRef } from "react";

const COURTS = Array.from({ length: 7 }, (_, i) => ({ id: i + 1, name: `คอร์ท ${i + 1}` }));

const PRICING = {
  rate: 160,
};

function getPricePerHour() {
  return PRICING.rate;
}

function formatTime(sec) {
  const h = Math.floor(sec / 3600).toString().padStart(2, "0");
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function formatClock(date) {
  return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

function calcCost(seconds, rate) {
  return Math.ceil((seconds / 3600) * rate);
}

// ---- Court Timer Card ----
function CourtCard({ court, session, onCheckin, onCheckout }) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (session?.active) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - session.startTime) / 1000));
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
      setElapsed(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [session?.active, session?.startTime]);

  const isActive = session?.active;
  const rate = isActive ? session.rate : getPricePerHour();
  const cost = isActive ? calcCost(elapsed, session.rate) : 0;

  return (
    <div style={{
      background: isActive ? "#0a0a0a" : "#111",
      border: isActive ? "1.5px solid #c8f135" : "1.5px solid #222",
      borderRadius: 16,
      padding: "20px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      transition: "border 0.3s",
      position: "relative",
      overflow: "hidden",
    }}>
      {isActive && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, #c8f135, #6ef0a0)",
          animation: "pulse 2s ease-in-out infinite",
        }} />
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: isActive ? "#c8f135" : "#555", letterSpacing: 1 }}>
          {court.name.toUpperCase()}
        </span>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: 1,
          color: isActive ? "#c8f135" : "#444",
          background: isActive ? "#c8f13520" : "#ffffff08",
          padding: "3px 10px", borderRadius: 20,
          border: `1px solid ${isActive ? "#c8f13540" : "#333"}`,
        }}>
          {isActive ? "● กำลังเล่น" : "ว่าง"}
        </span>
      </div>

      {/* Timer */}
      {isActive ? (
        <>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 38, fontWeight: 700, color: "#fff",
              letterSpacing: 2, lineHeight: 1,
            }}>
              {formatTime(elapsed)}
            </div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 6 }}>
              เริ่ม {formatClock(new Date(session.startTime))} น.
            </div>
          </div>

          <div style={{
            background: "#ffffff08", borderRadius: 10, padding: "10px 14px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: 13, color: "#888" }}>{rate} บ./ชม.</span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: "#c8f135" }}>
              ฿{cost.toLocaleString()}
            </span>
          </div>

          <button
            onClick={() => onCheckout(court.id, elapsed, cost)}
            style={{
              background: "#c8f135", color: "#000", border: "none",
              borderRadius: 10, padding: "13px 0", fontWeight: 700,
              fontSize: 15, cursor: "pointer", letterSpacing: 0.5,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            หยุดเล่น / คิดเงิน
          </button>
        </>
      ) : (
        <>
          <div style={{ textAlign: "center", padding: "4px 0" }}>
            <div style={{ fontSize: 13, color: "#555" }}>ราคา {rate} บ./ชม.</div>
          </div>
          <button
            onClick={() => onCheckin(court.id)}
            style={{
              background: "transparent", color: "#c8f135",
              border: "1.5px solid #c8f13560", borderRadius: 10,
              padding: "13px 0", fontWeight: 700,
              fontSize: 15, cursor: "pointer", letterSpacing: 0.5,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            เริ่มเล่น
          </button>
        </>
      )}
    </div>
  );
}

// ---- Checkout Modal ----
function CheckoutModal({ data, onClose }) {
  if (!data) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000cc",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20,
    }}>
      <div style={{
        background: "#111", border: "1.5px solid #333",
        borderRadius: 20, padding: "32px 28px", width: "100%", maxWidth: 360,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 13, color: "#c8f135", letterSpacing: 2, marginBottom: 8 }}>
          {data.court.toUpperCase()}
        </div>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, color: "#888", marginBottom: 4 }}>
          เวลาที่เล่น
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
          {formatTime(data.elapsed)}
        </div>

        <div style={{
          background: "#c8f13515", border: "1px solid #c8f13540",
          borderRadius: 12, padding: "16px 20px", marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>ยอดรวม</div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 44, fontWeight: 700, color: "#c8f135" }}>
            ฿{data.cost.toLocaleString()}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: "#c8f135", color: "#000", border: "none",
            borderRadius: 10, padding: "14px 0", width: "100%",
            fontWeight: 700, fontSize: 16, cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          รับชำระแล้ว ✓
        </button>
      </div>
    </div>
  );
}

// ---- History Panel ----
function HistoryPanel({ history }) {
  if (!history.length) return (
    <div style={{ textAlign: "center", color: "#444", padding: "40px 0", fontSize: 14 }}>
      ยังไม่มีรายการวันนี้
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[...history].reverse().map((h, i) => (
        <div key={i} style={{
          background: "#111", border: "1px solid #222", borderRadius: 10,
          padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{h.court}</div>
            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>
              {formatClock(new Date(h.start))} – {formatClock(new Date(h.end))} · {formatTime(h.elapsed)}
            </div>
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: "#c8f135" }}>
            ฿{h.cost.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---- Main App ----
export default function App() {
  const [tab, setTab] = useState("courts");
  const [sessions, setSessions] = useState({});
  const [history, setHistory] = useState([]);
  const [modal, setModal] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const activeCourts = Object.values(sessions).filter(s => s.active).length;
  const todayRevenue = history.reduce((sum, h) => sum + h.cost, 0);

  const handleCheckin = (courtId) => {
    setSessions(s => ({
      ...s,
      [courtId]: { active: true, startTime: Date.now(), rate: getPricePerHour() },
    }));
  };

  const handleCheckout = (courtId, elapsed, cost) => {
    const session = sessions[courtId];
    setModal({
      court: `คอร์ท ${courtId}`,
      elapsed,
      cost,
      courtId,
      session,
    });
  };

  const confirmCheckout = () => {
    const { courtId, session, elapsed, cost } = modal;
    setHistory(h => [...h, {
      court: `คอร์ท ${courtId}`,
      start: session.startTime,
      end: Date.now(),
      elapsed,
      cost,
    }]);
    setSessions(s => {
      const next = { ...s };
      delete next[courtId];
      return next;
    });
    setModal(null);
  };

  return (
    <div style={{
      background: "#000", minHeight: "100vh", color: "#fff",
      fontFamily: "'Inter', sans-serif",
      maxWidth: 480, margin: "0 auto",
    }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=Space+Mono:wght@400;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.5 } }
      `}</style>

      {/* Header */}
      <div style={{ padding: "20px 20px 0", position: "sticky", top: 0, background: "#000", zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#c8f135", letterSpacing: 3, fontWeight: 600 }}>PAKNAM 23</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginTop: 2 }}>
              จัดการสนาม
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 20, fontWeight: 700, color: "#c8f135" }}>
              {now.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
            </div>
            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>
              {now.toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "short" })}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16,
        }}>
          {[
            { label: "คอร์ทที่กำลังใช้", value: `${activeCourts}/7`, accent: activeCourts > 0 },
            { label: "รายได้วันนี้", value: `฿${todayRevenue.toLocaleString()}`, accent: true },
          ].map((s, i) => (
            <div key={i} style={{
              background: "#111", border: "1px solid #222", borderRadius: 12,
              padding: "12px 14px",
            }}>
              <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: s.accent ? "#c8f135" : "#fff" }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#111", borderRadius: 10, padding: 4, marginBottom: 4 }}>
          {[{ id: "courts", label: "คอร์ท" }, { id: "history", label: `ประวัติ (${history.length})` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "9px 0",
              background: tab === t.id ? "#c8f135" : "transparent",
              color: tab === t.id ? "#000" : "#666",
              border: "none", borderRadius: 7, fontWeight: 700, fontSize: 14,
              cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
              transition: "all 0.2s",
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "12px 20px 40px" }}>
        {tab === "courts" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {COURTS.map(court => (
              <div key={court.id} style={{ gridColumn: court.id === 7 ? "1 / -1" : undefined }}>
                <CourtCard
                  court={court}
                  session={sessions[court.id]}
                  onCheckin={handleCheckin}
                  onCheckout={handleCheckout}
                />
              </div>
            ))}
          </div>
        ) : (
          <HistoryPanel history={history} />
        )}
      </div>

      <CheckoutModal data={modal} onClose={confirmCheckout} />
    </div>
  );
}
