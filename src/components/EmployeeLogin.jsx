import React, { useState } from 'react';

const EmployeeLogin = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [employeeRoles, setEmployeeRoles] = useState([]); // New state for roles
  const [employeeSkills, setEmployeeSkills] = useState([]); // New state for skills/tests
  const [loginData, setLoginData] = useState(null); // Store login data for onLogin
  const [showContinue, setShowContinue] = useState(false); // Show continue button after info

  const handleLogin = async () => {
    if (!employeeId) return setError("Please enter Employee ID");

    try {
      const res = await fetch(`http://localhost:5000/employee-exists/${employeeId}`);
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Employee not found");
        } else {
          throw new Error("Backend is currently unavailable. Please try again later.");
        }
      }

      const data = await res.json();
      let requiredTests = [];
      if (!data.isAdmin) {
        if (employeeId === "26") {
          const testsRes = await fetch(`http://localhost:5000/employee/26/tests`);
          const testsData = await testsRes.json();
          requiredTests = testsData.tests || [];
        } else {
          const testsRes = await fetch(`http://localhost:5000/employee/${employeeId}/required-tests`);
          const testsData = await testsRes.json();
          requiredTests = testsData.tests || [];
        }
      }

      // Fetch employee info (name and department/designation)
      const infoRes = await fetch(`http://localhost:5000/employee/${employeeId}`);
      if (infoRes.ok) {
        const infoData = await infoRes.json();
        setEmployeeInfo(infoData);
        // Fetch roles by name (using new API)
        if (infoData.name) {
          const rolesRes = await fetch(`http://localhost:5000/api/employee/roles?name=${encodeURIComponent(infoData.name)}`);
          if (rolesRes.ok) {
            const rolesData = await rolesRes.json();
            setEmployeeRoles(rolesData.roles || []);
            // Fetch all skills for these roles from the JSON file
            const skillsRes = await fetch('http://localhost:5000/excel_data/employee_skills_levels.json');
            if (skillsRes.ok) {
              const allSkills = await skillsRes.json();
              const userSkills = allSkills.find(e => e.Employee === infoData.name);
              setEmployeeSkills(userSkills ? userSkills.Skills : []);
            } else {
              setEmployeeSkills([]);
            }
          } else {
            setEmployeeRoles([]);
            setEmployeeSkills([]);
          }
        }
      } else {
        setEmployeeInfo(null);
        setEmployeeRoles([]);
        setEmployeeSkills([]);
      }

      // Store login data and show continue button
      setLoginData({ employeeId, isAdmin: data.isAdmin, requiredTests });
      setShowContinue(true);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleContinue = () => {
    if (loginData) {
      onLogin(loginData.employeeId, loginData.isAdmin, loginData.requiredTests);
    }
  };

  return (
    <div>
      <h2>Employee Login</h2>
      <input
        type="text"
        placeholder="Enter Employee ID"
        value={employeeId}
        onChange={e => setEmployeeId(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>
      {error && <div style={{color:'red'}}>{error}</div>}
      {employeeInfo && (
        <div style={{marginTop: '1em', color: 'lightgreen'}}>
          <div><strong>Name:</strong> {employeeInfo.name || 'N/A'}</div>
          {/* Show all designations/roles in one place for clarity */}
          <div><strong>Designations/Roles:</strong>
            <ul style={{margin: 0, paddingLeft: 20}}>
              {employeeRoles.length > 0
                ? employeeRoles.map((role, idx) => <li key={idx}>{role}</li>)
                : <li>{employeeInfo.department || 'N/A'}</li>}
            </ul>
          </div>
        </div>
      )}
      {employeeSkills.length > 0 && (
        <div style={{marginTop: '1em'}}>
          <strong>Required Skills/Tests:</strong>
          <ul>
            {employeeSkills.map((s, idx) => (
              <li key={idx}>{s.skill} (Level: {s.level})</li>
            ))}
          </ul>
        </div>
      )}
      {showContinue && (
        <button style={{marginTop: '1em'}} onClick={handleContinue}>Continue</button>
      )}
    </div>
  );
};

export default EmployeeLogin;
