import React, { useState } from 'react';
import EmployeeLogin from './components/EmployeeLogin';
import EmployeeDashboard from './components/EmployeeDashboard';
import AssignTest from './components/AssignTest';
import QuestionCard from './components/QuestionCard';
import ResultTable from './components/ResultTable';
import EntityTable from './components/EntityTable';
import './App.css';

function App() {
  const [employeeId, setEmployeeId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [testAssigned, setTestAssigned] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [requiredTests, setRequiredTests] = useState([]);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [employeeRoles, setEmployeeRoles] = useState([]);
  const [employeeSkills, setEmployeeSkills] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // Handler for login
  const handleLogin = (data) => {
    setEmployeeId(data.employeeId);
    setIsAdmin(data.isAdmin);
    setRequiredTests(data.requiredTests || []);
    setEmployeeInfo(data.employeeInfo);
    setEmployeeRoles(data.employeeRoles || []);
    setEmployeeSkills(data.employeeSkills || []);
    if (!data.isAdmin) {
      setShowDashboard(true); // Show dashboard after login
      setShowResults(false);
    }
  };

  // Handler for test assignment (admin only)
  const handleAssign = async ({ employeeId, position, level, testName }) => {
    await fetch('http://localhost:5000/assign-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, testName, adminId: employeeId })
    });
    setTestAssigned(true);
    // Fetch questions
    const res = await fetch(`http://localhost:5000/get-test/${employeeId}`);
    const data = await res.json();
    setQuestions(data);
  };

  // Handler for answering questions
  const handleAnswer = (questionId, selectedOption) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  // Handler for submitting test
  const handleSubmit = async () => {
    const answerArr = questions.map(q => ({
      questionId: q.ID,
      selectedOption: answers[q.ID] || '',
      isCorrect: (answers[q.ID] || '') === q.Answer
    }));
    await fetch('http://localhost:5000/submit-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, testId: Date.now(), answers: answerArr })
    });
    // Fetch results
    const res = await fetch(`http://localhost:5000/results/${employeeId}`);
    const data = await res.json();
    setResults(data);
    setShowResults(true);
  };

  // Render admin or employee view based on login
  if (!employeeId) {
    return <EmployeeLogin onLogin={handleLogin} />;
  }

  if (isAdmin) {
    return (
      <div>
        <AssignTest onAssign={handleAssign} />
        <EntityTable entity="employees" columns={["employee_id","name","department","designation"]} title="Employees" />
        <EntityTable entity="roles" columns={["role_id","role_name","min_education","min_experience"]} title="Roles" />
        <EntityTable entity="competencies" columns={["competency_id","competency_name","category","description"]} title="Competencies" />
        <EntityTable entity="employee_roles" columns={["id","employee_id","role_id"]} title="Employee Roles" />
        <EntityTable entity="role_competencies" columns={["id","role_id","competency_id","proficiency_required"]} title="Role Competencies" />
        <EntityTable entity="employee_competencies" columns={["id","employee_id","competency_id","proficiency_level","assessment_date"]} title="Employee Competencies" />
        <EntityTable entity="assessments" columns={["assessment_id","competency_id","test_name","level"]} title="Assessments" />
        <EntityTable entity="employee_assessment_results" columns={["id","employee_id","assessment_id","score","pass_fail","assessment_date"]} title="Assessment Results" />
        <EntityTable entity="qualifications" columns={["qualification_id","employee_id","qualification_type","institution","year"]} title="Qualifications" />
      </div>
    );
  }

  if (showDashboard) {
    return (
      <EmployeeDashboard
        employeeInfo={employeeInfo}
        employeeRoles={employeeRoles}
        employeeSkills={employeeSkills}
        onProceed={() => {
          setShowDashboard(false);
          setShowResults(true);
        }}
      />
    );
  }

  if (showResults) {
    return (
      <div>
        <h2>Required Tests</h2>
        <ul>
          {requiredTests.map((test, idx) => (
            <li key={idx} style={{marginBottom: '10px'}}>
              {test.testName}
              {test.testLink && (
                <a href={test.testLink} target="_blank" rel="noopener noreferrer">
                  <button>Go to Test Link</button>
                </a>
              )}
              <button onClick={async () => {
                // Fetch questions for this test (by test name)
                const res = await fetch(`http://localhost:5000/get-test/${employeeId}/${encodeURIComponent(test.testName)}`);
                const data = await res.json();
                setQuestions(data);
                setShowResults(false); // Hide required tests, show test
              }}>Start Test</button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // For non-admin, show test directly
  return (
    <div>
      <h2>Test</h2>
      {questions.length === 0 ? (
        <button onClick={async () => {
          const res = await fetch(`http://localhost:5000/get-test/${employeeId}`);
          const data = await res.json();
          setQuestions(data);
        }}>Start Test</button>
      ) : (
        <>
          {questions.map((q, idx) => (
            <QuestionCard key={q.ID} question={q} index={idx} onAnswer={handleAnswer} />
          ))}
          <button onClick={handleSubmit}>Submit Test</button>
        </>
      )}
    </div>
  );
}

// Helper component to show test link button
function TestLinkButton({ testName }) {
  const [link, setLink] = React.useState(null);
  React.useEffect(() => {
    fetch(`http://localhost:5000/test-link/${encodeURIComponent(testName)}`)
      .then(res => res.json())
      .then(data => setLink(data.link));
  }, [testName]);
  if (!link) return null;
  return <a href={link} target="_blank" rel="noopener noreferrer"><button>Go to Test Link</button></a>;
}

export default App;
