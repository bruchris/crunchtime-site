interface Props {
  name: string; email: string; company: string; website: string;
  brief: string; language: "no" | "en"; notionUrl: string;
}

export function AdminLeadEmail(p: Props) {
  return (
    <html lang="en"><body style={{ fontFamily: "ui-monospace, Menlo, monospace", color: "#0a0a09" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px" }}>
        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>New Crunchtime lead</h2>
        <table style={{ borderCollapse: "collapse", fontSize: 13 }}><tbody>
          <tr><td><b>Name</b></td><td>{p.name}</td></tr>
          <tr><td><b>Email</b></td><td>{p.email}</td></tr>
          <tr><td><b>Company</b></td><td>{p.company}</td></tr>
          <tr><td><b>Website</b></td><td><a href={p.website}>{p.website}</a></td></tr>
          <tr><td><b>Language</b></td><td>{p.language}</td></tr>
        </tbody></table>
        <h3 style={{ fontSize: 14, margin: "16px 0 4px" }}>Brief</h3>
        <pre style={{ whiteSpace: "pre-wrap", background: "#f5f3ee", padding: "10px", fontSize: 13 }}>{p.brief}</pre>
        {p.notionUrl && <p style={{ marginTop: 16, fontSize: 13 }}>{"-> "}<a href={p.notionUrl}>Open in Notion</a></p>}
      </div>
    </body></html>
  );
}
