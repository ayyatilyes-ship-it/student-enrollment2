import { useState } from "react";
import { Student } from "./types/index.js";
import { StudentsListPage } from "./pages/StudentsListPage.js";
import { StudentDetailPage } from "./pages/StudentDetailPage.js";

export function App() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="brand" onClick={() => setSelectedStudent(null)}>
          <div className="brand-icon">🎓</div>
          <span>Student Enrollment System</span>
        </div>
        <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
          Tissoura.ai Test Deliverable
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
