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

  // --- Hard code border for top of row 7 ---
  const row7 = newSheet.getRow(7);
    for (let col = 1; col <= 45; col++) {
      const cell = row7.getCell(col);
      cell.border = {
        ...cell.border,
        top: { style: 'medium' },
    };
  }

  // --- Hard code medium border for row 5 between AS and AT ---
  const row5 = newSheet.getRow(5);
    const cellAT = row5.getCell('AS');
    cellAT.border = {
      ...cellAT.border,
      right: { style: 'medium' },
  };

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

  // helper to get cell text
  const getCellText = (cell) => {
    if (!cell || cell.value == null) return "";
    const v = cell.value;
    if (typeof v === "object") {
      if (v.richText) return v.richText.map(t => t.text).join("").trim();
      if (v.text) return v.text.toString().trim();
      return String(v).trim();
    }
    return String(v).trim();
  };

  // --- Build parent map for merged headers (row 5 only) ---
  const parentMap = {};
  const merges = worksheet.model.merges || [];
  merges.forEach((mergeAddress) => {
    const [startAddr, endAddr] = mergeAddress.split(":");
    const startCell = worksheet.getCell(startAddr);
    const endCell = worksheet.getCell(endAddr || startAddr);

    if (startCell.row === 5) {
      const startCol = startCell.col;
      const endCol = endCell.col;
      const parentHeader = getCellText(startCell);
      for (let col = startCol; col <= endCol; col++) {
        parentMap[col] = parentHeader;
      }
    }
  });

  // Include single headers in row 5 (not merged)
  worksheet.getRow(5).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (!parentMap[colNumber] && getCellText(cell)) {
      parentMap[colNumber] = getCellText(cell);
    }
  });

  // --- Build header map from row 6, combine with parent if parent is Shipment or Pressure ---
  const headerMap = {};
  worksheet.getRow(6).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const subHeader = getCellText(cell);
    const parent = parentMap[colNumber];

    if (parent && (parent === "Shipment" || parent === "Pressure") && subHeader) {
      headerMap[`${parent}: ${subHeader}`] = colNumber;
    } else if (subHeader) {
      headerMap[subHeader] = colNumber;
    } else if (parent) {
      // Only parent exists (rare case)
      headerMap[parent] = colNumber;
    }
  });

  // --- Determine target row ---
  const today = new Date();
  const targetRowIndex = 6 + today.getDate(); // row 6 is first data row
  const targetRow = worksheet.getRow(targetRowIndex);

  // --- Map form fields to headers ---
  const dataMap = {
    "Hours On": formData.hoursOn,
    "Hours Down": formData.hoursDown,
    "Reason for Downtime": formData.reason,
    "Total BS&W": formData.bsw,
    "Sand %": formData.sandPercent,
    "Tank Gauge": formData.tankGauge,
    "Prod (m3)": formData.prod,
    "Net Oil (m3)": formData.netOil,
    "Net Sand (m3)": formData.netSand,
    "Net Water (m3)": formData.netWater,
    "Recycle (m3)": formData.recycle,

    // Shipment section (parent: Shipment)
    "Gross Vol": formData.grossVol,
    "BS&W": formData.shipmentBsw,
    "Oil (m3)": formData.shipmentOil,
    "Water (m3)": formData.shipmentWater,
    "Water Loads": formData.waterLoads,
    "Sand (m3)": formData.shipmentSand,

    "Ticket #": formData.ticketNumber,
    "Fluid Out (m3)": formData.fluidOut,
    "Fluid In (m3)": formData.fluidIn,
    "Foam Loss (m3)": formData.foamLoss,

    // Pressure section (parent: Pressure)
    "Pressure: Tbg (kPa)": formData.tbg,
    "Pressure: Csg (kPa)": formData.csg,

    "Propane (%full)": formData.propane,
    "Tank Temp #1": formData.tankTemp,
    "Fluid Level (JTF)": formData.fluidLevel,
    "Pump (RPM)": formData.pump,
    "Efficiency": formData.efficiency,
    "psi Hyd": formData.psi,
    "Comments": formData.comments,
    "Operators Initials": formData.initials,
  };

  // --- Write to non-empty data worksheet ---
  Object.entries(dataMap)
  .filter(([_, value]) => value !== null && value !== undefined && value !== "")
  .forEach(([header, value]) => {
    const colNumber = headerMap[header];
    if (!colNumber) {
      console.warn(`No matching column found for form field: "${header}"`);
      return;
    }
    const writeValue = (val) => {
      if (val === null || val === undefined || val === "") return val;
      // Try converting strings that are numbers to actual numbers
      const num = Number(val);
      return !isNaN(num) ? num : val;
    };

    // Then when writing:
    targetRow.getCell(colNumber).value = writeValue(value);
  });

  targetRow.commit();

  // --- Save workbook ---
  const buffer = await workbook.xlsx.writeBuffer();
  await saveWorkbookToDB(workbookName, buffer, formData.currentUser || "Unknown");
}

module.exports = {
  handleFormSubmission,
};
