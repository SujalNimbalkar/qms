import React, { useState } from 'react';

// Simple skill name to code mapping (expand as needed)
const skillNameToCode = {
  '5S': 'sk01',
  // Add more mappings as needed
};

const levelToCode = (level) => `l${level}`;

const EmployeeDashboard = ({ employeeInfo, employeeRoles, employeeSkills, onProceed }) => {
  const [clickedTests, setClickedTests] = useState([]);
  const [testQuestions, setTestQuestions] = useState(null);
  const [testSkill, setTestSkill] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);

  const handleTestClick = async (idx, skill, level) => {
    setClickedTests((prev) => [...prev, idx]);
    setLoadingTest(true);
    setTestSkill(`${skill} (Level ${level})`);
    // Map skill and level to code
    const skillCode = skillNameToCode[skill] || skill;
    const levelCode = levelToCode(level);
    try {
      const res = await fetch(`/api/test/get-test/${encodeURIComponent(skillCode)}/${encodeURIComponent(levelCode)}`);
      const questions = await res.json();
      setTestQuestions(questions);
    } catch (e) {
      setTestQuestions([]);
    }
    setLoadingTest(false);
  };

  const closeTestModal = () => {
    setTestQuestions(null);
    setTestSkill(null);
  };

  return (
    <div style={{ color: 'lightgreen', marginTop: '2em' }}>
      <h2>Welcome!</h2>
      <div>
        <strong>Name:</strong> {employeeInfo?.name || 'N/A'}
      </div>
      <div>
        <strong>Designations/Roles:</strong>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {employeeRoles && employeeRoles.length > 0
            ? employeeRoles.map((role, idx) => <li key={idx}>{role}</li>)
            : <li>{employeeInfo?.department || 'N/A'}</li>}
        </ul>
      </div>
      <div style={{ marginTop: '1em' }}>
        <strong>Required Skills/Tests:</strong>
        <ul>
          {employeeSkills && employeeSkills.length > 0 ? (
            employeeSkills.map((s, idx) => (
              <li key={idx}>
                {s.skill} (Level: {s.level})
                <button
                  style={{ marginLeft: '1em' }}
                  onClick={() => handleTestClick(idx, s.skill, s.level)}
                  disabled={clickedTests.includes(idx) || loadingTest}
                >
                  {clickedTests.includes(idx) ? 'Clicked' : 'Take Test'}
                </button>
              </li>
            ))
          ) : (
            <li>No skills/tests found.</li>
          )}
        </ul>
      </div>
      <button style={{ marginTop: '2em' }} onClick={onProceed}>Proceed to Required Tests</button>

      {/* MCQ Test Modal */}
      {testQuestions && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.7)', color: 'black', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: 24, borderRadius: 8, maxWidth: 600, width: '90%' }}>
            <h3>MCQ Test: {testSkill}</h3>
            {testQuestions.length === 0 ? (
              <div>No questions found for this skill/level.</div>
            ) : (
              <ol>
                {testQuestions.map((q, i) => (
                  <li key={q.QuestionID || i} style={{ marginBottom: 16 }}>
                    <div><strong>{q.Question || q.question}</strong></div>
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                      {[q.Option1, q.Option2, q.Option3, q.Option4].map((opt, j) => (
                        <li key={j}><input type="radio" name={`q${i}`} /> {opt}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
            <button onClick={closeTestModal} style={{ marginTop: 16 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
