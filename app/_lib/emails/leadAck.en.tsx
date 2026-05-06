interface Props { name: string; brief: string; }
const wrap: React.CSSProperties = { fontFamily: "system-ui, sans-serif", color: "#0a0a09", lineHeight: 1.5 };
const card: React.CSSProperties = { maxWidth: 560, margin: "0 auto", padding: "32px 24px" };
const quote: React.CSSProperties = { borderLeft: "2px solid #d4ef3a", padding: "8px 14px", margin: 0, background: "#f5f3ee", fontStyle: "italic" };

export function LeadAckEn({ name, brief }: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <html lang="en"><body style={wrap}><div style={card}>
      <p style={{ fontSize: 14, color: "#8a8a82", margin: 0 }}>Crunchtime</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "16px 0" }}>Hi {firstName}, we got your brief.</h1>
      <p style={{ margin: "0 0 16px" }}>A plan lands in your inbox within 30 minutes. We are looking at your company first.</p>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#5a5a52" }}>You sent us:</p>
      <blockquote style={quote}>{brief}</blockquote>
      <p style={{ margin: "24px 0 0", fontSize: 14, color: "#5a5a52" }}>Reply to this email if it is urgent.</p>
      <p style={{ margin: "8px 0 0", fontSize: 14 }}>— Christian, Crunchtime</p>
    </div></body></html>
  );
}
