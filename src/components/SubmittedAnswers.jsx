import React, { useEffect, useState } from 'react';

const SubmittedAnswers = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mcq/submitted-answers')
      .then(res => res.json())
      .then(data => {
        setSubmissions(data.submissions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>All Submitted Answers</h2>
      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Employee Position</th>
            <th>Question</th>
            <th>Options</th>
            <th>Submitted Option</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s, idx) => (
            <tr key={idx}>
              <td>{s.employee_id}</td>
              <td>{s.employee_name}</td>
              <td>{s.employee_position}</td>
              <td>{s.question_text}</td>
              <td>
                <ol type="A">
                  {s.options && s.options.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ol>
              </td>
              <td>{s.submitted_letter}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmittedAnswers; 