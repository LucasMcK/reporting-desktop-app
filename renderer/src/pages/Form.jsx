import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import "../styles/form.css";
import "../styles/global.css";
import Sidebar from "../components/Sidebar";

const Form = ({ goTo, page }) => {
  // --- Form states ---
  const [dayOfMonth, setDayOfMonth] = useState("");
  useEffect(() => setDayOfMonth(new Date().getDate().toString()), []);

  const handleNumericInput = (e, setter, options = {}) => {
    const raw = e.target.value;
    if (raw === "") return setter("");
    let val = parseFloat(raw);
    if (isNaN(val)) return;
    if (options.min !== undefined) val = Math.max(options.min, val);
    if (options.max !== undefined) val = Math.min(options.max, val);
    setter(val);
  };

  const [quadrantLSD, setQuadrantLSD] = useState("");
  const [section, setSection] = useState("");
  const [township, setTownship] = useState("");
  const [range, setRange] = useState("");
  const [meridian, setMeridian] = useState("");
  const [hoursOn, setHoursOn] = useState("");
  const [reason, setReason] = useState("");
  const [bsw, setBsw] = useState("");
  const [sandPercent, setSandPercent] = useState("");
  const [prodM3, setProdM3] = useState("");
  const [grossVol, setGrossVol] = useState("");
  const [shipmentBsw, setShipmentBsw] = useState("");
  const [comments, setComments] = useState("");
  const [initials, setInitials] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [location, setLocation] = useState("");

  const configLocation = `${quadrantLSD}-${section}-${township}-${range}-${meridian}`;

  const [monthYear, setMonthYear] = useState("");
  useEffect(() => {
    const d = new Date();
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];
    setMonthYear(`${months[d.getMonth()]}-${d.getFullYear().toString().slice(-2)}`);
  }, []);

  const hoursDown = hoursOn !== "" ? 24 - Number(hoursOn) : "";
  const netOil = prodM3 && bsw ? Number((prodM3 * (1 - bsw / 100)).toFixed(1)) : "";
  const shipmentOil = grossVol && shipmentBsw ? Number((grossVol * (1 - shipmentBsw / 100)).toFixed(1)) : "";
  const shipmentWater = grossVol && shipmentBsw ? Number(((grossVol * shipmentBsw) / 100).toFixed(1)) : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const workbookName = `${year}-${month} ${location}.xlsx`;
    const formData = {
      dayOfMonth,
      hoursOn,
      hoursDown,
      reason,
      bsw,
      sandPercent,
      prodM3,
      grossVol,
      shipmentBsw,
      shipmentOil,
      shipmentWater,
      configLocation,
      monthYear,
      year,
      month,
      location,
      quadrantLSD,
      section,
      township,
      range,
      meridian,
      comments,
      initials,
    };

    if (!window.versions?.submitForm) {
        console.error("submitForm is undefined!");
        return;
    }

    const result = await window.versions.submitForm(formData);

    if (result.success) {
        alert("Form submitted successfully!");
    } else {
        alert("Error submitting form: " + result.error);
    }
  };

  return (
    <>
    <Sidebar goTo={goTo} page={page} />
    <div className="content">
        <div className="form-header">
          <h1>Production Form</h1>
          <p>Manually input data to populate the specified workbook and worksheet.</p>
        </div>

        {/* Property & Well Information */}
        <fieldset className="form-section">
        <h2>PROPERTY & WELL INFORMATION</h2>
        <div className="form-row">
            <input placeholder="Year" value={year} onChange={e => setYear(e.target.value)} />
            <input placeholder="Month" value={month} onChange={e => setMonth(e.target.value)} />
        </div>
        <div className="form-row">
            <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
            <input placeholder="Quadrant/LSD" value={quadrantLSD} onChange={e => setQuadrantLSD(e.target.value)} />
        </div>
        <div className="form-row">
            <input placeholder="Section" value={section} onChange={e => setSection(e.target.value)} />
            <input placeholder="Township" value={township} onChange={e => setTownship(e.target.value)} />
        </div>
        <div className="form-row">
            <input placeholder="Range" value={range} onChange={e => setRange(e.target.value)} />
            <input placeholder="Meridian" value={meridian} onChange={e => setMeridian(e.target.value)} />
        </div>
        </fieldset>

        {/* Operational Hours */}
        <fieldset className="form-section">
        <h2>OPERATIONAL HOURS</h2>
        <div className="form-row">
            <input type="number" step="any" placeholder="Hours On" value={hoursOn} onChange={e => handleNumericInput(e, setHoursOn, { min: 0, max: 24 })} />
            <input type="number" placeholder="Hours Down" value={hoursDown} disabled />
        </div>
        <div className="form-row">
            <textarea placeholder="Reason for Downtime" value={reason} onChange={e => setReason(e.target.value)} disabled={hoursDown <= 0} />
        </div>
        </fieldset>

        {/* Fluid Quality */}
        <fieldset className="form-section">
        <h2>FLUID QUALITY METRICS</h2>
        <div className="form-row">
            <input type="number" step="any" placeholder="Total BS&W (%)" value={bsw} onChange={e => setBsw(parseFloat(e.target.value))} />
            <input type="number" step="any" placeholder="Sand (%)" value={sandPercent} onChange={e => setSandPercent(parseFloat(e.target.value))} />
        </div>
        </fieldset>

        {/* Production Volumes */}
        <fieldset className="form-section">
        <h2>PRODUCTION VOLUMES</h2>
        <div className="form-row">
            <input type="number" placeholder="Prod (m³)" value={prodM3} onChange={e => setProdM3(parseFloat(e.target.value))} />
            <input placeholder="Net Oil (m³)" value={netOil || ""} disabled />
        </div>
        </fieldset>

        {/* Shipments */}
        <fieldset className="form-section">
        <h2>SHIPMENTS</h2>
        <div className="form-row">
            <input type="number" placeholder="Gross (Vol)" value={grossVol} onChange={e => setGrossVol(parseFloat(e.target.value))} />
            <input type="number" placeholder="BS&W (%)" value={shipmentBsw} onChange={e => setShipmentBsw(parseFloat(e.target.value))} />
        </div>
        <div className="form-row">
            <input placeholder="Oil (m³)" value={shipmentOil || ""} disabled />
            <input placeholder="Water (m³)" value={shipmentWater || ""} disabled />
        </div>
        </fieldset>

        {/* Closing Section */}
        <fieldset className="form-section">
        <h2>CLOSING SECTION</h2>
        <div className="form-row">
            <textarea placeholder="Comments" value={comments} onChange={e => setComments(e.target.value)} />
        </div>
        <div className="form-row">
            <input placeholder="Operator Initials" value={initials} onChange={e => setInitials(e.target.value.toUpperCase())} maxLength={2} />
        </div>
        </fieldset>

        <Button type="submit" variant="primary" onClick={handleSubmit}>
            Submit
        </Button>
    </div>
    </>
  );
};

export default Form;
