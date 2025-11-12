const ExcelJS = require("exceljs");
const { db } = require("./db");

function checkReportExists(workbookName) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM reports WHERE name = ?", [workbookName], (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

function saveWorkbookToDB(workbookName, buffer, uploaded_by) {
  return new Promise((resolve, reject) => {
    checkReportExists(workbookName)
      .then((existing) => {
        if (existing) {
          db.run(
            "UPDATE reports SET data = ?, uploaded_at = CURRENT_TIMESTAMP, uploaded_by = ? WHERE id = ?",
            [buffer, uploaded_by, existing.id],
            function (err) {
              if (err) reject(err);
              else resolve();
            }
          );
        } else {
          const stmt = db.prepare(`
            INSERT INTO reports (name, data, uploaded_at, uploaded_by)
            VALUES (?, ?, CURRENT_TIMESTAMP, ?)
          `);
          stmt.run(workbookName, buffer, uploaded_by, (err) => {
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
    workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(existingReport.data);
  } else {
    workbook = new ExcelJS.Workbook();
  }

  const wsName = `${formData.configLocation}`;
  const worksheet = workbook.addWorksheet(wsName);

  worksheet.columns = Object.keys(formData).map((key) => ({
    header: key,
    key: key,
    width: 20,
  }));

  worksheet.addRow(formData);

  const buffer = await workbook.xlsx.writeBuffer();

  const uploaded_by = formData.currentUser;

  await saveWorkbookToDB(workbookName, buffer, uploaded_by);
}

module.exports = {
  handleFormSubmission,
};
