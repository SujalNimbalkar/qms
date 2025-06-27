// save as scripts/generate_passwords.js
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const employeesFile = path.join(__dirname, "../excel_data/employees.csv");
const outputFile = path.join(__dirname, "../backend/employee_passwords.json");

const passwords = {};

fs.createReadStream(employeesFile)
  .pipe(csv())
  .on("data", (row) => {
    const id =
      row.employee_id || row.id || row.ID || row.EmployeeID || row.Employee_Id;
    if (id) {
      // Generate a random 5-digit password
      const password = Math.floor(10000 + Math.random() * 90000).toString();
      passwords[id] = password;
    }
  })
  .on("end", () => {
    fs.writeFileSync(outputFile, JSON.stringify(passwords, null, 2));
    console.log("Passwords generated and saved to", outputFile);
  });
