(function () {
  "use strict";
  const h = React.createElement;
  const STORAGE_KEY = "studyly_react_student_records";
  const PASS_MARK = 40;

  const starterStudents = [
    { id: "demo-1", name: "Student 1", marks: 86 },
    { id: "demo-2", name: "Student 2", marks: 72 },
    { id: "demo-3", name: "Student 3", marks: 58 },
    { id: "demo-4", name: "Student 4", marks: 39 },
    { id: "demo-5", name: "Student 5", marks: 91 }
  ];

  function readStudents() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (Array.isArray(saved)) return saved;
    } catch (error) {
      console.warn("Could not read React student records:", error);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(starterStudents));
    return starterStudents;
  }

  function Header({ count, average }) {
    return h("section", { className: "card react-student-hero" },
      h("div", { className: "react-student-eyebrow" }, "STUDYLY / STUDENT RECORDS"),
      h("h2", null, "Student Management"),
      h("p", { className: "muted" }, "Add students, record marks and instantly view pass/fail results."),
      h("div", { className: "react-student-stats" },
        h("div", null, h("strong", null, count), h("span", null, "Total students")),
        h("div", null, h("strong", null, average + "%"), h("span", null, "Class average")),
        h("div", null, h("strong", null, PASS_MARK + "+"), h("span", null, "Pass mark"))
      )
    );
  }

  function StudentList({ students, onDelete, canManage }) {
    if (!students.length) {
      return h("div", { className: "card react-student-empty" }, "No student records yet. Add the first student above.");
    }
    return h("div", { className: "card react-student-table-card" },
      h("div", { className: "section-head" },
        h("h3", null, "Student List"),
        h("span", { className: "react-student-count" }, students.length + " records")
      ),
      h("div", { className: "react-student-table-wrap" },
        h("table", { className: "react-student-table" },
          h("thead", null, h("tr", null,
            h("th", null, "S.No"), h("th", null, "Student Name"),
            h("th", null, "Marks"), h("th", null, "Result"),
            canManage ? h("th", null, "Action") : null
          )),
          h("tbody", null, students.map((student, index) => {
            const passed = Number(student.marks) >= PASS_MARK;
            return h("tr", { key: student.id },
              h("td", null, String(index + 1).padStart(2, "0")),
              h("td", { className: "react-student-name" }, student.name),
              h("td", null, student.marks + " / 100"),
              h("td", null, h("span", { className: "react-result-pill " + (passed ? "is-pass" : "is-fail") }, passed ? "PASS" : "FAIL")),
              canManage ? h("td", null, h("button", {
                type: "button", className: "react-delete-btn",
                onClick: () => onDelete(student.id), "aria-label": "Delete " + student.name
              }, "Remove")) : null
            );
          }))
        )
      )
    );
  }

  function Footer({ total, passed }) {
    return h("footer", { className: "react-student-footer" },
      h("span", null, "Studyly React Components"),
      h("span", null, passed + " passed · " + (total - passed) + " failed")
    );
  }

  function StudentManagementApp({ role }) {
    const [students, setStudents] = React.useState(readStudents);
    const [name, setName] = React.useState("");
    const [marks, setMarks] = React.useState("");
    const [error, setError] = React.useState("");
    const canManage = role === "admin" || role === "principal";
    const totalMarks = students.reduce((sum, student) => sum + Number(student.marks || 0), 0);
    const average = students.length ? Math.round(totalMarks / students.length) : 0;
    const passed = students.filter(student => Number(student.marks) >= PASS_MARK).length;

    function persist(next) {
      setStudents(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }

    function addStudent(event) {
      event.preventDefault();
      const cleanName = name.trim();
      const numericMarks = Number(marks);
      if (cleanName.length < 2) return setError("Enter a student name with at least 2 characters.");
      if (marks === "" || !Number.isFinite(numericMarks) || numericMarks < 0 || numericMarks > 100) {
        return setError("Enter marks between 0 and 100.");
      }
      persist([...students, { id: "student-" + Date.now() + "-" + Math.random().toString(16).slice(2), name: cleanName, marks: numericMarks }]);
      setName("");
      setMarks("");
      setError("");
    }

    function removeStudent(studentId) {
      if (!window.confirm("Remove this student record?")) return;
      persist(students.filter(student => student.id !== studentId));
    }

    return h("div", { className: "react-student-page" },
      h(Header, { count: students.length, average }),
      canManage ? h("section", { className: "card react-student-form-card" },
        h("div", { className: "section-head" }, h("h3", null, "Add New Student"), h("span", { className: "react-student-count" }, "Admin / Principal")),
        h("form", { className: "react-student-form", onSubmit: addStudent },
          h("label", null, "Student name",
            h("input", { value: name, onChange: e => setName(e.target.value), placeholder: "Enter student name", maxLength: 70 })
          ),
          h("label", null, "Marks (out of 100)",
            h("input", { value: marks, onChange: e => setMarks(e.target.value), type: "number", min: 0, max: 100, placeholder: "e.g. 85" })
          ),
          h("button", { className: "primary", type: "submit" }, "＋ Add Student")
        ),
        error ? h("p", { className: "react-student-error", role: "alert" }, error) : null
      ) : h("div", { className: "card react-student-readonly-note" }, "You are viewing the student records in read-only mode."),
      h(StudentList, { students, onDelete: removeStudent, canManage }),
      h(Footer, { total: students.length, passed })
    );
  }

  window.renderReactStudentManagement = function (mountNode, role) {
    if (!mountNode || !window.React || !window.ReactDOM) return;
    if (!mountNode.__studylyReactRoot) mountNode.__studylyReactRoot = ReactDOM.createRoot(mountNode);
    mountNode.__studylyReactRoot.render(h(StudentManagementApp, { role: role || "student" }));
  };
})();