interface Props { name: string; brief: string; }
const wrap: React.CSSProperties = { fontFamily: "system-ui, sans-serif", color: "#0a0a09", lineHeight: 1.5 };
const card: React.CSSProperties = { maxWidth: 560, margin: "0 auto", padding: "32px 24px" };
const quote: React.CSSProperties = { borderLeft: "2px solid #d4ef3a", padding: "8px 14px", margin: 0, background: "#f5f3ee", fontStyle: "italic" };

export function LeadAckNo({ name, brief }: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <html lang="no"><body style={wrap}><div style={card}>
      <p style={{ fontSize: 14, color: "#8a8a82", margin: 0 }}>Crunchtime</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "16px 0" }}>Hei {firstName}, vi har fått brifen din.</h1>
      <p style={{ margin: "0 0 16px" }}>Plan kommer på e-post innen 30 min. Vi ser litt på bedriften din først.</p>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#5a5a52" }}>Du sendte oss:</p>
      <blockquote style={quote}>{brief}</blockquote>
      <p style={{ margin: "24px 0 0", fontSize: 14, color: "#5a5a52" }}>Svar på denne e-posten hvis det haster.</p>
      <p style={{ margin: "8px 0 0", fontSize: 14 }}>— Christian, Crunchtime</p>
    </div></body></html>
  );
}
