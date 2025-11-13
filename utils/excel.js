const ExcelJS = require("exceljs");
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
const cloneWorksheet = (workbook, templateSheetName, newSheetName) => {
  const templateSheet = workbook.getWorksheet(templateSheetName);
  if (!templateSheet) throw new Error(`Template worksheet "${templateSheetName}" not found`);

  const newSheet = workbook.addWorksheet(newSheetName);

  // --- Copy columns ---
  templateSheet.columns.forEach((col) => {
    const newCol = newSheet.getColumn(col.number);
    newCol.key = col.key;
    newCol.header = col.header;
    newCol.width = col.width || 20;
  });

  // --- Copy rows and cells ---
  templateSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const newRow = newSheet.getRow(rowNumber);
    newRow.height = row.height;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const newCell = newRow.getCell(colNumber);

      // Only set value for master cell if merged
      if (!cell.isMerged || cell.address === cell.master.address) {
        newCell.value = cell.value;
      }

      // Copy style, number format, fill
      newCell.style = { ...cell.style };
      newCell.numFmt = cell.numFmt;
      if (cell.fill) newCell.fill = { ...cell.fill };
      if (cell.font) newCell.font = { ...cell.font };
      if (cell.alignment) newCell.alignment = { ...cell.alignment };
      if (cell.border) newCell.border = { ...cell.border };
    });
  });

  // --- Copy merged cells ---
  if (templateSheet.model.merges) {
    templateSheet.model.merges.forEach((mergeAddress) => {
      newSheet.mergeCells(mergeAddress);
    });
  }

  // --- Copy images ---
  const images = templateSheet.getImages();
  images.forEach(({ imageId, range }) => {
    newSheet.addImage(imageId, range);
  });

  return newSheet;
};

// ------------------- MAIN HANDLER -------------------
async function handleFormSubmission(formData = {}, templatePath) {
  const workbookName = `${formData.year || ""}-${formData.month || ""} ${formData.location || ""}.xlsx`;
  const existingReport = await checkReportExists(workbookName);

  const workbook = new ExcelJS.Workbook();

  if (existingReport) {
    await workbook.xlsx.load(existingReport.data);
  } else {
    if (!fs.existsSync(templatePath)) throw new Error(`Template not found at ${templatePath}`);
    await workbook.xlsx.readFile(templatePath);
  }

  const wsName = formData.configLocation;
  let worksheet = workbook.getWorksheet(wsName);
  if (!worksheet) worksheet = cloneWorksheet(workbook, "Well Template", wsName);

  // --- Build header map from rows 5 ---
  const headerMap = {};
  const headerRow = worksheet.getRow(5); // top row of merged header

  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    let header = "";

    if (cell.value) {
      if (typeof cell.value === "object") {
        if (cell.value.richText) {
          header = cell.value.richText.map(t => t.text).join("").trim();
        } else if (cell.value.text) {
          header = cell.value.text.trim();
        }
      } else {
        header = cell.value.toString().trim();
      }
    }

    if (header) headerMap[header] = colNumber;
  });

  // --- Determine target row (day of month) ---
  const today = new Date();
  const dayOfTheMonth = today.getDate();
  const targetRowIndex = 6 + dayOfTheMonth;
  const targetRow = worksheet.getRow(targetRowIndex);

  // --- Map form fields to headers ---
  const dataMap = {
    "Hours On": formData.hoursOn ?? "",
    "Hours Down": formData.hoursDown ?? "",
    "Reason": formData.reason ?? "",
    "BS&W (%)": formData.bsw ?? "",
    "Sand (%)": formData.sandPercent ?? "",
    "Prod (m3)": formData.prod ?? "",
    "Net Oil (m3)": formData.netOil ?? "",
    "Net Sand (m3)": formData.netSand ?? "",
    "Net Water (m3)": formData.netWater ?? "",
    "Recycle (m3)": formData.recycle ?? "",
    "Gross (Vol)": formData.grossVol ?? "",
    "Shipment BS&W (%)": formData.shipmentBsw ?? "",
    "Shipment Oil (m3)": formData.shipmentOil ?? "",
    "Shipment Water (m3)": formData.shipmentWater ?? "",
    "Water Loads": formData.waterLoads ?? "",
    "Sand (m3)": formData.shipmentSand ?? "",
    "Fluid Out (m3)": formData.fluidOut ?? "",
    "Fluid In (m3)": formData.fluidIn ?? "",
    "Foam Loss": formData.foamLoss ?? "",
    "Tank Gauge": formData.tankGauge ?? "",
    "Propane (%full)": formData.propane ?? "",
    "Tank Temp #1": formData.tankTemp ?? "",
    "Fluid Level (JTF)": formData.fluidLevel ?? "",
    "Pump (RPM)": formData.pump ?? "",
    "Efficiency": formData.efficiency ?? "",
    "psi Hyd": formData.psi ?? "",
    "Tbg (kPa)": formData.tbg ?? "",
    "Csg (kPa)": formData.csg ?? "",
    "Ticket Number": formData.ticketNumber ?? "",
    "Comments": formData.comments ?? "",
    "Operator Initials": formData.initials ?? "",
  };

  // --- Write data to worksheet ---
  Object.entries(dataMap).forEach(([header, value]) => {
    const colNumber = headerMap[header];
    if (colNumber) targetRow.getCell(colNumber).value = value ?? "";
  });

  targetRow.commit();

  // --- Save workbook ---
  const buffer = await workbook.xlsx.writeBuffer();
  await saveWorkbookToDB(workbookName, buffer, formData.currentUser || "Unknown");
}

module.exports = {
  handleFormSubmission,
};
