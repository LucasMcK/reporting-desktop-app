const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const { db } = require("./db");

function checkReportExists(workbookName) {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT * FROM reports WHERE name = ?",
      [workbookName],
      (err, row) => {
        if (err) reject(err);
        else resolve(row || null);
      }
    );
  });
}

function saveWorkbookToDB(workbookName, buffer) {
  return new Promise((resolve, reject) => {
    checkReportExists(workbookName)
      .then((existing) => {
        if (existing) {
          // Update existing report
          db.run(
            "UPDATE reports SET data = ?, uploaded_at = CURRENT_TIMESTAMP WHERE id = ?",
            [buffer, existing.id],
            function (err) {
              if (err) reject(err);
              else resolve();
            }
          );
        } else {
          // Insert new report
          const stmt = db.prepare(`
            INSERT INTO reports (name, data, uploaded_at, uploaded_by)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?)
          `);
          stmt.run(workbookName, buffer, "System", (err) => {
            if (err) reject(err);
            else resolve();
          });
        }
      })
      .catch(reject);
  });
}

async function handleFormSubmission(formData) {
  const workbookName = `${formData.year}-${formData.month} ${formData.location}.xlsx`;
  const existingReport = await checkReportExists(workbookName);

  let workbook;
  if (existingReport) {
    // Load existing workbook from SQLite
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(existingReport.data);
  } else {
    workbook = new ExcelJS.Workbook();
  }

  // Create a new worksheet
  const wsName = `Entry ${workbook.worksheets.length + 1}`;
  const worksheet = workbook.addWorksheet(wsName);

  // Add headers
  worksheet.columns = Object.keys(formData).map((key) => ({
    header: key,
    key: key,
    width: 20,
  }));

  // Add data row
  worksheet.addRow(formData);

  // Save workbook to buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Save buffer to SQLite
  await saveWorkbookToDB(workbookName, buffer);
}

module.exports = {
  handleFormSubmission,
};
