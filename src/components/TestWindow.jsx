import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const TestWindow = () => {
  const location = useLocation();
  const { skill, level, employeeInfo } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skillMap, setSkillMap] = useState({});
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Fetch skill code map from backend
  useEffect(() => {
    fetch('/excel_data/skill_code_map.csv')
      .then(res => res.text())
      .then(csv => {
        const lines = csv.trim().split('\n');
        const map = {};
        for (let i = 1; i < lines.length; i++) {
          const [code, name] = lines[i].split(',');
          map[name.trim()] = code.trim();
        }
        setSkillMap(map);
      });
  }, []);

  useEffect(() => {
    if (skill && level && Object.keys(skillMap).length > 0) {
      const skill_id = skillMap[skill] || skill;
      fetch(`http://localhost:5000/api/mcq/questions?skill_id=${encodeURIComponent(skill_id)}&level=${level}`)
        .then(res => res.json())
        .then(data => {
          console.log("Requested skill_id:", skill_id, "difficulty:", level);
          console.log("Found", data.questions.length, "matching questions");
          setQuestions(data.questions || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (!skill || !level) {
      setLoading(false);
    }
  }, [skill, level, skillMap]);

  const handleOptionChange = (qIdx, option) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just log the answers. You can send to backend here.
    console.log('Submitted answers:', selectedAnswers);
    alert('Answers submitted! (Check console for details)');
  };

  if (loading) return <div>Loading...</div>;
  if (!questions.length) return <div>No questions found for this skill/level.</div>;

  return (
    <div>
      <h2>Test: {skill} (Level {level})</h2>
      <form onSubmit={handleSubmit}>
        <ol>
          {questions.map((q, i) => (
            <li key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                {q.question_text}
              </div>
              <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {q.options.map((opt, j) => (
                  <li key={j} style={{ marginBottom: 2 }}>
                    <label>
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={opt}
                        checked={selectedAnswers[i] === opt}
                        onChange={() => handleOptionChange(i, opt)}
                        required
                      />{' '}
                      {opt}
                    </label>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default TestWindow;