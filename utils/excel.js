const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");
const { db } = require("./db");

// ------------------- DB FUNCTIONS -------------------
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

// ------------------- CLONE WORKSHEET -------------------
function cloneWorksheet(workbook, templateSheetName, newSheetName) {
  const templateSheet = workbook.getWorksheet(templateSheetName);
  if (!templateSheet) {
    throw new Error(`Template worksheet "${templateSheetName}" not found`);
  }

  const newSheet = workbook.addWorksheet(newSheetName);

  // Copy column info
  templateSheet.columns.forEach(col => {
    const newCol = newSheet.getColumn(col.number);
    newCol.key = col.key;
    newCol.header = col.header;
    newCol.width = col.width || 20;
  });

  // Copy rows
  templateSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const newRow = newSheet.getRow(rowNumber);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const newCell = newRow.getCell(colNumber);
      newCell.value = cell.value;
      newCell.style = { ...cell.style };
      newCell.numFmt = cell.numFmt;
    });
    newRow.height = row.height;
  });

  return newSheet;
}

// ------------------- MAIN HANDLER -------------------
async function handleFormSubmission(formData, templatePath) {
  const workbookName = `${formData.year}-${formData.month} ${formData.location}.xlsx`;
  const existingReport = await checkReportExists(workbookName);

  const workbook = new ExcelJS.Workbook();

  if (existingReport) {
    await workbook.xlsx.load(existingReport.data);
  } else {
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found at ${templatePath}`);
    }
    await workbook.xlsx.readFile(templatePath);
  }

  const wsName = formData.configLocation;
  let worksheet = workbook.getWorksheet(wsName);

  if (!worksheet) {
    worksheet = cloneWorksheet(workbook, "Well Template", wsName);
  }

  worksheet.addRow(formData);

  const buffer = await workbook.xlsx.writeBuffer();
  await saveWorkbookToDB(workbookName, buffer, formData.currentUser);
}


module.exports = {
  handleFormSubmission,
};
