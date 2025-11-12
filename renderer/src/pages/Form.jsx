import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import "../styles/form.css";
import "../styles/global.css";
import Sidebar from "../components/Sidebar";

const Form = ({ goTo, page }) => {
  // --- Form states ---
  const [dayOfMonth, setDayOfMonth] = useState("");
  useEffect(() => setDayOfMonth(new Date().getDate().toString()), []);
  const makeAndSize = 15;

  const handleNumericInput = (e, setter, options = {}) => {
    const raw = e.target.value;
    if (raw === "") return setter("");
    let val = parseFloat(raw);
    if (isNaN(val)) return;
    if (options.min !== undefined) val = Math.max(options.min, val);
    if (options.max !== undefined) val = Math.min(options.max, val);
    setter(val);
  };

  // Worksheet name info
  const [quadrantLSD, setQuadrantLSD] = useState("");
  const [section, setSection] = useState("");
  const [township, setTownship] = useState("");
  const [range, setRange] = useState("");
  const [meridian, setMeridian] = useState("");
  // Operational hours info
  const [hoursOn, setHoursOn] = useState("");
  const hoursDown = hoursOn !== "" ? 24 - Number(hoursOn) : "";
  const [reason, setReason] = useState("");
  // Fluid quality metrics info
  const [bsw, setBsw] = useState("");
  const [sandPercent, setSandPercent] = useState("");
  // Production volumes info
  const [prod, setProd] = useState("");
  const netOil = prod && bsw 
            ? Number((prod * (1 - bsw / 100)).toFixed(1)) 
            : "";
  const netSand = prod && sandPercent && hoursOn !== "" 
            ? Number(((prod * sandPercent) / 100).toFixed(1)) 
            : "";
  const netWater = prod && bsw && sandPercent && hoursOn !== ""
            ? Number((prod * (bsw / 100 - sandPercent / 100)).toFixed(1))
            : "";
  const [recycle, setRecycle] = useState("");
  // Shipments info
  const [grossVol, setGrossVol] = useState("");
  const [shipmentBsw, setShipmentBsw] = useState("");
  const shipmentOil = grossVol && shipmentBsw 
            ? Number((grossVol * (1 - shipmentBsw / 100)).toFixed(1)) 
            : "";
  const shipmentWater = grossVol && shipmentBsw 
            ? Number(((grossVol * shipmentBsw) / 100).toFixed(1)) 
            : "";
  const [waterLoads, setWaterLoads] = useState("");
  const [shipmentSand, setShipmentSand] = useState("");
  // Fluid info
  const [fluidOut, setFluidOut] = useState("");
  const [fluidIn, setFluidIn] = useState("");
  const [foamLoss, setFoamLoss] = useState("");
  const tankGauge =
        hoursOn !== ""
            ? Math.round(
                  (Number(initialTankGauge || 0) +
                      Number(prod || 0) -
                      (Number(grossVol || 0) +
                          Number(waterLoads || 0) +
                          Number(shipmentSand || 0) +
                          (Number(fluidOut || 0) - Number(fluidIn || 0)) +
                          Number(foamLoss || 0))) *
                      10
              ) / 10
            : "";
  // Tank and equipment readings info
  const [propane, setPropane] = useState("");
  const [tankTemp, setTankTemp] = useState("");
  const [fluidLevel, setFluidLevel] = useState("");
  const [pump, setPump] = useState("");
  const efficiency =
        prod && makeAndSize && pump
            ? Number(((prod / (makeAndSize * (rpm / 100))) * 100).toFixed(0))
            : '';
  const [psi, setPsi] = useState("");
  // Pressure info
  const [tbg, setTbg] = useState("");
  const [csg, setCsg] = useState("");
  // Closing section info
  const [ticketNumber, setTicketNumber] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      dayOfMonth,
      hoursOn,
      hoursDown,
      reason,
      bsw,
      sandPercent,
      prod,
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

        {/* Workbook Name */}
        <fieldset className="form-section">
        <h2>WORKBOOK NAME</h2>
        <div className="form-row">
            <input placeholder="Year (YY)" value={year} onChange={e => setYear(e.target.value)} />
            <span>—</span>
            <input placeholder="Month (MM)" value={month} onChange={e => setMonth(e.target.value)} />
            <input placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} />
            <span>.xlsx</span>
        </div>
        </fieldset>

        {/* Worksheet Name */}
        <fieldset className="form-section">
        <h2>WORKSHEET NAME</h2>
        <div className="form-row">
            <input placeholder="Quadrant/LSD" value={quadrantLSD} onChange={e => setQuadrantLSD(e.target.value)} />
            <span>—</span>
            <input placeholder="Section" value={section} onChange={e => setSection(e.target.value)} />
            <span>—</span>
            <input placeholder="Township" value={township} onChange={e => setTownship(e.target.value)} />
            <span>—</span>
            <input placeholder="Range" value={range} onChange={e => setRange(e.target.value)} />
            <span>—</span>
            <input placeholder="Meridian" value={meridian} onChange={e => setMeridian(e.target.value)} />
        </div>
        </fieldset>

        {/* Operational Hours */}
        <fieldset className="form-section">
        <h2>OPERATIONAL HOURS</h2>
        <div className="form-row">
            <input type="number" step="any" placeholder="Hours On" value={hoursOn} onChange={e => handleNumericInput(e, setHoursOn, { min: 0, max: 24 })} />
            <input type="number" placeholder="Hours Down" value={hoursDown} disabled />
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
            <input type="number" placeholder="Prod (m³)" value={prod} onChange={e => setProd(parseFloat(e.target.value))} />
            <input placeholder="Net Oil (m³)" value={netOil || ""} disabled />
            <input placeholder="Net Sand (m³)" value={netSand || ""} disabled />
            <input placeholder="Net Water (m³)" value={netWater || ""} disabled />
            <input type="number" placeholder="Recycle (m³)" value={recycle} onChange={e => setProd(parseFloat(e.target.value))} />
        </div>
        </fieldset>

        {/* Shipments */}
        <fieldset className="form-section">
        <h2>SHIPMENTS</h2>
        <div className="form-row">
            <input type="number" placeholder="Gross (Vol)" value={grossVol} onChange={e => setGrossVol(parseFloat(e.target.value))} />
            <input type="number" placeholder="BS&W (%)" value={shipmentBsw} onChange={e => setShipmentBsw(parseFloat(e.target.value))} />
            <input placeholder="Net Oil (m³)" value={shipmentOil || ""} disabled />
            <input placeholder="Net Water (m³)" value={shipmentWater || ""} disabled />
            <input type="number" placeholder="Water Loads" value={waterLoads} onChange={e => setWaterLoads(parseFloat(e.target.value))} />
            <input type="number" placeholder="Sand (m³)" value={shipmentSand} onChange={e => setShipmentSand(parseFloat(e.target.value))} />
        </div>
        </fieldset>

        {/* Fluids */}
        <fieldset className="form-section">
        <h2>FLUIDS</h2>
        <div className="form-row">
            <input type="number" placeholder="Fluid Out (m³)" value={fluidOut} onChange={e => setFluidOut(parseFloat(e.target.value))} />
            <input type="number" placeholder="Fluid In (m³)" value={fluidIn} onChange={e => setFluidIn(parseFloat(e.target.value))} />
            <input type="number" placeholder="Foam Loss" value={foamLoss} onChange={e => setFoamLoss(parseFloat(e.target.value))} />
        </div>
        </fieldset>

        {/* Pressure */}
        <fieldset className="form-section">
        <h2>PRESSURE</h2>
        <div className="form-row">
            <input type="number" placeholder="Tbg (kPa)" value={tbg} onChange={e => setTbg(parseFloat(e.target.value))} />
            <input type="number" placeholder="Csg (kPa)" value={csg} onChange={e => setCsg(parseFloat(e.target.value))} />
        </div>
        </fieldset>

        {/* Tank & Equipment Readings */}
        <fieldset className="form-section">
        <h2>TANK & EQUIPMENT READINGS</h2>
        <div className="form-row">
            <input type="number" placeholder="Propane (% full)" value={propane} onChange={e => setPropane(parseFloat(e.target.value))} />
            <input type="number" placeholder="Tank Temp" value={tankTemp} onChange={e => setTankTemp(parseFloat(e.target.value))} />
            <input type="number" placeholder="Fluid Level (JTF)" value={fluidLevel} onChange={e => setFluidLevel(parseFloat(e.target.value))} />
            <input type="number" placeholder="Pump (RPM)" value={pump} onChange={e => setPump(parseFloat(e.target.value))} />
            <input placeholder="Efficiency" value={efficiency || ""} disabled />
            <input type="number" placeholder="psi (Hyd)" value={psi} onChange={e => setPsi(parseFloat(e.target.value))} />
        </div>
        </fieldset>

        {/* Closing Section */}
        <fieldset className="form-section">
        <h2>CLOSING SECTION</h2>
        <div className="form-row">
            <input placeholder="Ticket Number" value={ticketNumber} onChange={e => setTicketNumber(parseFloat(e.target.value))} />
            <textarea placeholder="Comments" value={comments} onChange={e => setComments(e.target.value)} />
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
