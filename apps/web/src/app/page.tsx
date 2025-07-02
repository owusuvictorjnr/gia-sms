export default function HomePage() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
        Welcome to EduConnect+
      </h1>
      <p style={{ marginTop: "1rem", color: "#4A5568" }}>
        The frontend web application is running!
      </p>
      <p style={{ marginTop: "0.5rem", color: "green" }}>
        Backend API status:{" "}
        <span style={{ fontWeight: "bold" }}>Connected</span>
      </p>
    </main>
  );
}
