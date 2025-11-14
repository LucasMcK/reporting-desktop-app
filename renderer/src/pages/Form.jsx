import React, { useState, useEffect, useRef } from "react";
import Button from "../components/Button";
import "../styles/form.css";
import "../styles/global.css";
import Sidebar from "../components/Sidebar";

const Form = ({ goTo, page }) => {
  // --- Helper to prevent NaN in inputs ---
  const safeNumber = (n) => (isNaN(n) || n === null ? "" : n);

  // --- Form states ---
  const yearRef = useRef(null);
  const monthRef = useRef(null);
  
  const quadrantLSDRef = useRef(null);
  const sectionRef = useRef(null);
  const townshipRef = useRef(null);
  const rangeRef = useRef(null);
  const meridianRef = useRef(null);

  const hoursOnRef = useRef(null);
  const reasonRef = useRef(null);

  const bswRef = useRef(null);
  const sandPercentRef = useRef(null);

  const tbgRef = useRef(null);
  const csgRef = useRef(null);

  const prodRef = useRef(null);
  const recycleRef = useRef(null);

  const grossVolRef = useRef(null);
  const shipmentBswRef = useRef(null);
  const waterLoadsRef = useRef(null);
  const shipmentSandRef = useRef(null);

  const fluidOutRef = useRef(null);
  const fluidInRef = useRef(null);
  const foamLossRef = useRef(null);

  const propaneRef = useRef(null);
  const tankTempRef = useRef(null);
  const fluidLevelRef = useRef(null);
  const pumpRef = useRef(null);
  const psiRef = useRef(null);

  const ticketNumberRef = useRef(null);
  const initialsRef = useRef(null);
  const commentsRef = useRef(null);

  const makeAndSize = 15; // DEFAULT VALUE FOR TESTING—CHANGE LATER
  const initialTankGauge = 207; // DEFAULT VALUE FOR TESTING—CHANGE LATER
  const currentUser = localStorage.getItem("username");

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
  const [reason, setReason] = useState("");

  // Fluid quality metrics
  const [bsw, setBsw] = useState("");
  const [sandPercent, setSandPercent] = useState("");

  // Production volumes
  const [prod, setProd] = useState("");
  const [recycle, setRecycle] = useState("");

  // Shipments
  const [grossVol, setGrossVol] = useState("");
  const [shipmentBsw, setShipmentBsw] = useState("");
  const [waterLoads, setWaterLoads] = useState("");
  const [shipmentSand, setShipmentSand] = useState("");

  // Fluids
  const [fluidOut, setFluidOut] = useState("");
  const [fluidIn, setFluidIn] = useState("");
  const [foamLoss, setFoamLoss] = useState("");

  // Tank & Equipment
  const [propane, setPropane] = useState("");
  const [tankTemp, setTankTemp] = useState("");
  const [fluidLevel, setFluidLevel] = useState("");
  const [pump, setPump] = useState("");
  const [psi, setPsi] = useState("");

  // Pressure
  const [tbg, setTbg] = useState("");
  const [csg, setCsg] = useState("");

  // Closing section
  const [ticketNumber, setTicketNumber] = useState("");
  const [comments, setComments] = useState("");
  const [initials, setInitials] = useState("");

  // Workbook meta
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [location, setLocation] = useState("");

  const configLocation = `${quadrantLSD}-${section}-${township}-${range}-${meridian}`;

  useEffect(() => {
    const preventScrollOnNumber = (e) => {
        if (document.activeElement?.type === "number") {
        // Only prevent default on the number input itself
        e.preventDefault();
        }
    };

    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach((input) => {
        input.addEventListener("wheel", preventScrollOnNumber, { passive: false });
    });

    return () => {
        numberInputs.forEach((input) => {
        input.removeEventListener("wheel", preventScrollOnNumber);
        });
    };
  }, []);

  // --- Derived values ---
  const hoursDown = safeNumber(hoursOn !== "" ? 24 - Number(hoursOn) : "");
  const netOil = safeNumber(prod && bsw ? Number((prod * (1 - bsw / 100)).toFixed(1)) : "");
  const netSand = safeNumber(prod && sandPercent && hoursOn !== "" ? Number(((prod * sandPercent) / 100).toFixed(1)) : "");
  const netWater = safeNumber(prod && bsw && sandPercent && hoursOn !== "" ? Number((prod * (bsw / 100 - sandPercent / 100)).toFixed(1)) : "");

  const shipmentOil = safeNumber(grossVol && shipmentBsw ? Number((grossVol * (1 - shipmentBsw / 100)).toFixed(1)) : "");
  const shipmentWater = safeNumber(grossVol && shipmentBsw ? Number((grossVol * (shipmentBsw / 100)).toFixed(1)) : "");

  const efficiency = safeNumber(prod && makeAndSize && pump ? Number(((prod / (makeAndSize * (pump / 100))) * 100).toFixed(0)) : "");

  const tankGauge = safeNumber(hoursOn !== "" ? Math.round(
    (Number(initialTankGauge || 0) +
     Number(prod || 0) -
     (Number(grossVol || 0) +
      Number(waterLoads || 0) +
      Number(shipmentSand || 0) +
      (Number(fluidOut || 0) - Number(fluidIn || 0)) +
      Number(foamLoss || 0))) * 10
  ) / 10 : "");

  // --- Submit handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = {
        currentUser,
        year,
        month,
        location,
        monthYear,
        dayOfMonth,
        quadrantLSD,
        section,
        township,
        range,
        meridian,
        configLocation,
        hoursOn,
        hoursDown,
        reason,
        bsw,
        sandPercent,
        prod,
        netOil,
        netSand,
        netWater,
        recycle,
        grossVol,
        shipmentBsw,
        shipmentOil,
        shipmentWater,
        waterLoads,
        shipmentSand,
        fluidOut,
        fluidIn,
        foamLoss,
        tankGauge,
        propane,
        tankTemp,
        fluidLevel,
        pump,
        efficiency,
        psi,
        tbg,
        csg,
        ticketNumber,
        comments,
        initials,
    };

    if (!window.versions?.submitForm) {
        console.error("submitForm is undefined!");
        return;
    }

    const result = await window.versions.submitForm(formDataToSend);

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

        {/* --- Workbook Name --- */}
        <fieldset className="form-section">
          <h2>WORKBOOK NAME</h2>
          <div className="form-row">
            <input
                ref={yearRef}
                placeholder="Year (YY)"
                value={year}
                onChange={e => {
                    setYear(e.target.value);
                    if (e.target.value.length === 2) {
                        monthRef.current.focus();
                    }
                }}
             />
            <span>—</span>
            <input
                ref={monthRef}
                placeholder="Month (MM)"
                value={month}
                onChange={e => {
                    setMonth(e.target.value);
                    if (e.target.value.length === 2) {
                        quadrantLSDRef.current.focus();
                    }
                }}
            />
            <select
                value={location}
                onChange={e => setLocation(e.target.value)}
                className={location === "" ? "placeholder" : ""}
            >
                <option value="" disabled hidden>
                    Select Location
                </option>
                <option value="Edam">Edam</option>
                <option value="Rushlake">Rushlake</option>
                <option value="Greenstreet">Greenstreet</option>
                <option value="Other">Other</option>
            </select>
            <span>.xlsx</span>
          </div>
        </fieldset>

        {/* --- Worksheet Name --- */}
        <fieldset className="form-section">
          <h2>WORKSHEET NAME</h2>
          <div className="form-row">
            <input 
                ref={quadrantLSDRef}
                placeholder="Quadrant/LSD" 
                value={quadrantLSD} 
                onChange={e => {
                    setQuadrantLSD(e.target.value);
                    if (e.target.value.length === 2) {
                        sectionRef.current.focus();
                    }
                }}
            />
            <span>—</span>
            <input 
                ref={sectionRef}
                placeholder="Section" 
                value={section} 
                onChange={e => {
                    setSection(e.target.value);
                    if (e.target.value.length === 2) {
                        townshipRef.current.focus();
                    }
                }}
            />
            <span>—</span>
            <input 
                ref={townshipRef}
                placeholder="Township" 
                value={township} 
                onChange={e => {
                    setTownship(e.target.value);
                    if (e.target.value.length === 2) {
                        rangeRef.current.focus();
                    }
                }} 
            />
            <span>—</span>
            <input 
                ref={rangeRef}
                placeholder="Range" 
                value={range} 
                onChange={e => {
                    setRange(e.target.value);
                    if (e.target.value.length === 2) {
                        meridianRef.current.focus();
                    }
                }} 
            />
            <span>—</span>
            <input 
                ref={meridianRef}
                placeholder="Meridian" 
                value={meridian} 
                onChange={e => {
                    setMeridian(e.target.value);
                    if (e.target.value.length === 2) {
                        hoursOnRef.current.focus();
                    }
                }} 
            />
          </div>
        </fieldset>

        {/* --- Operational Hours --- */}
        <fieldset className="form-section">
          <h2>OPERATIONAL HOURS</h2>
          <div className="form-row">
            <input 
                ref={hoursOnRef} 
                type="number" 
                step="any" 
                placeholder="Hours On" 
                value={hoursOn} 
                onChange={e => {
                    handleNumericInput(e, setHoursOn, { min: 0, max: 24 });

                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                    if (val === 24) {
                        bswRef.current.focus();
                    } else {
                        reasonRef.current.focus();
                    }
                    }
                }}
            />
            <input type="number" placeholder="Hours Down" value={hoursDown} disabled />
          </div>
          <div className="form-row">
            <textarea 
                ref={reasonRef}
                placeholder="Reason for Downtime" 
                value={reason} 
                onChange={e => {
                    setReason(e.target.value);
                }}
                disabled={hoursDown <= 0} 
            />
          </div>
        </fieldset>

        {/* --- Fluid Quality and Pressure --- */}
        <div className="form-section-row">
        <fieldset className="form-section">
            <h2>FLUID QUALITY METRICS</h2>
            <div className="form-row">
            <input
                ref={bswRef}
                type="number"
                step="any"
                placeholder="Total BS&W (%)"
                value={bsw}
                onChange={e => {
                    setBsw(parseFloat(e.target.value));
                    if (e.target.value.length === 2) {
                        sandPercentRef.current.focus();
                    }
                }}
            />
            <input
                ref={sandPercentRef}
                type="number"
                step="any"
                placeholder="Sand (%)"
                value={sandPercent}
                onChange={e => {
                    setSandPercent(parseFloat(e.target.value));
                    if (e.target.value.length === 1) {
                        tbgRef.current.focus();
                    }
                }}
            />
            </div>
        </fieldset>

        <fieldset className="form-section">
            <h2>PRESSURE</h2>
            <div className="form-row">
            <input
                ref={tbgRef}
                type="number"
                placeholder="Tbg (kPa)"
                value={tbg}
                onChange={e => {
                    setTbg(parseFloat(e.target.value));
                    if (e.target.value.length === 2) {
                        csgRef.current.focus();
                    }
                }}
            />
            <input
                ref={csgRef}
                type="number"
                placeholder="Csg (kPa)"
                value={csg}
                onChange={e => {
                    setCsg(parseFloat(e.target.value));
                    if (e.target.value.length === 2) {
                        prodRef.current.focus();
                    }
                }}
            />
            </div>
        </fieldset>
        </div>

        {/* --- Production Volumes --- */}
        <fieldset className="form-section">
          <h2>PRODUCTION VOLUMES</h2>
          <div className="form-row">
            <input 
                ref={prodRef}
                type="number" 
                placeholder="Prod (m³)" 
                value={prod} 
                onChange={e => {
                    setProd(parseFloat(e.target.value));
                    if (e.target.value.length === 2) {
                        recycleRef.current.focus();
                    }
                }} 
            />
            <input placeholder="Net Oil (m³)" value={netOil} disabled />
            <input placeholder="Net Sand (m³)" value={netSand} disabled />
            <input placeholder="Net Water (m³)" value={netWater} disabled />
            <input 
                ref={recycleRef}
                type="number" 
                placeholder="Recycle (m³)" 
                value={recycle} 
                onChange={e => {
                    setRecycle(parseFloat(e.target.value));
                    if (e.target.value.length === 1) {
                        grossVolRef.current.focus();
                    }
                }} />
          </div>
        </fieldset>

        {/* --- Shipments --- */}
        <fieldset className="form-section">
          <h2>SHIPMENTS</h2>
          <div className="form-row">
            <input 
                ref={grossVolRef}
                type="number" 
                placeholder="Gross (Vol)" 
                value={grossVol} 
                onChange={e => {
                    setGrossVol(parseFloat(e.target.value));
                    if (e.target.value.length === 2) {
                        shipmentBswRef.current.focus();
                    }
                }} />
            <input 
                ref={shipmentBswRef}
                type="number" 
                placeholder="BS&W (%)" 
                value={shipmentBsw} 
                onChange={e => {
                    setShipmentBsw(parseFloat(e.target.value));
                    if (e.target.value.length === 1) {
                        waterLoadsRef.current.focus();
                    }
                }} />
            <input placeholder="Net Oil (m³)" value={shipmentOil} disabled />
            <input placeholder="Net Water (m³)" value={shipmentWater} disabled />
            <input 
                ref={waterLoadsRef}
                type="number" 
                placeholder="Water Loads" 
                value={waterLoads} 
                onChange={e => {
                    setWaterLoads(parseFloat(e.target.value));
                    if (e.target.value.length === 2) {
                        shipmentSandRef.current.focus();
                    }
                }}
            />
            <input 
                ref={shipmentSandRef}
                type="number" 
                placeholder="Sand (m³)" 
                value={shipmentSand} 
                onChange={e => {
                    setShipmentSand(parseFloat(e.target.value));
                    if (e.target.value.length === 1) {
                        fluidOutRef.current.focus();
                    }
                }}
            />
          </div>
        </fieldset>

        {/* --- Fluids --- */}
        <fieldset className="form-section">
          <h2>FLUIDS</h2>
          <div className="form-row">
            <input 
                ref={fluidOutRef}
                type="number" 
                placeholder="Fluid Out (m³)" 
                value={fluidOut} 
                onChange={e => {
                    setFluidOut(parseFloat(e.target.value));
                    if (e.target.value.length === 1) {
                        fluidInRef.current.focus();
                    }
                }} 
            />
            <input 
                ref={fluidInRef}
                type="number" 
                placeholder="Fluid In (m³)" 
                value={fluidIn} 
                onChange={e => {
                    setFluidIn(parseFloat(e.target.value));
                    if (e.target.value.length === 1) {
                        foamLossRef.current.focus();
                    }
                }} 
            />
            <input 
                ref={foamLossRef}
                type="number" 
                placeholder="Foam Loss" 
                value={foamLoss} 
                onChange={e => {
                    setFoamLoss(parseFloat(e.target.value));
                    if (e.target.value.length === 1) {
                        propaneRef.current.focus();
                    }
                }}
            />
            <input placeholder="Tank Gauge" value={tankGauge} disabled />
          </div>
        </fieldset>

        {/* --- Tank & Equipment Readings --- */}
        <fieldset className="form-section">
          <h2>TANK & EQUIPMENT READINGS</h2>
          <div className="form-row">
            <input 
                ref={propaneRef}
                type="number" 
                placeholder="Propane (% full)" 
                value={propane} 
                onChange={e => {
                    setPropane(parseFloat(e.target.value));
                    if (e.target.value.length === 5) {
                        tankTempRef.current.focus();
                    }
                }} 
            />
            <input 
                ref={tankTempRef}
                type="number" 
                placeholder="Tank Temp" 
                value={tankTemp} 
                onChange={e => {
                    setTankTemp(parseFloat(e.target.value));
                    if (e.target.value.length === 5) {
                        fluidLevelRef.current.focus();
                    }
                }}
            />
            <input 
                ref={fluidLevelRef}
                type="number" 
                placeholder="Fluid Level (JTF)" 
                value={fluidLevel} 
                onChange={e => {
                    setFluidLevel(parseFloat(e.target.value));
                    if (e.target.value.length === 2) {
                        pumpRef.current.focus();
                    }
                }} 
            />
            <input 
            ref={pumpRef}
            type="number" 
            placeholder="Pump (RPM)" 
            value={pump} 
            onChange={e => {
                    setPump(parseFloat(e.target.value))
                    if (e.target.value.length === 2) {
                        psiRef.current.focus();
                    }
                }} 
            />
            <input placeholder="Efficiency" value={efficiency} disabled />
            <input 
                ref={psiRef}
                type="number" 
                placeholder="psi (Hyd)" 
                value={psi} 
                onChange={e => {
                    setPsi(parseFloat(e.target.value));
                    if (e.target.value.length === 3) {
                        ticketNumberRef.current.focus();
                    }
                }} 
            />
          </div>
        </fieldset>

        {/* --- Closing Section --- */}
        <fieldset className="form-section">
          <h2>CLOSING SECTION</h2>
          <div className="form-row">
            <input 
                ref={ticketNumberRef}
                placeholder="Ticket Number" 
                value={ticketNumber}
                onChange={e => {
                    setTicketNumber(parseFloat(e.target.value))
                    if (e.target.value.length === 6) {
                        initialsRef.current.focus();
                    }
                }} 
            />
            <input 
                ref={initialsRef}
                placeholder="Operator Initials" 
                value={initials} 
                onChange={e => {
                    setInitials(e.target.value.toUpperCase());
                    if (e.target.value.length === 2) {
                        commentsRef.current.focus();
                    }
                }} 
                maxLength={2} 
            />
          </div>
          <div className="form-row">
            <textarea 
                ref={commentsRef}
                placeholder="Comments" 
                value={comments} 
                onChange={e => setComments(e.target.value)} 
            />
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
