import { useState } from "react";
import { Student } from "./types/index.js";
import { StudentsListPage } from "./pages/StudentsListPage.js";
import { StudentDetailPage } from "./pages/StudentDetailPage.js";

export function App() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="brand" onClick={() => setSelectedStudent(null)} title="Return to Dashboard">
          <div className="brand-icon">🎓</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span>Student Enrollment</span>
              <span className="brand-tag">v1.0 Pro</span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500, letterSpacing: "normal" }}>
              Tissoura.ai Production Deliverable
            </div>
          </div>
        </div>

        <div className="navbar-actions">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              fontSize: "0.78rem",
              color: "#34d399",
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              padding: "4px 10px",
              borderRadius: "9999px",
              fontWeight: 600,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", display: "inline-block", boxShadow: "0 0 6px #10b981" }} />
            PostgreSQL Connected
          </div>

          <a
            href="https://github.com/ayyatilyes-ship-it/student-enrollment2"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{ fontSize: "0.78rem", padding: "4px 10px" }}
          >
            <span>⭐</span> GitHub Repo
          </a>
        </div>
      </header>

      <main className="main-content">
        {selectedStudent ? (
          <StudentDetailPage
            student={selectedStudent}
            onBack={() => setSelectedStudent(null)}
          />
        ) : (
          <StudentsListPage onSelectStudent={(student) => setSelectedStudent(student)} />
        )}
      </main>
    </div>
  );
}

export default App;
