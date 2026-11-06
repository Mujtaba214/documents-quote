"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  FileText,
  Truck,
  Plus,
  Trash2,
  Save,
  FolderOpen,
  Printer,
  RotateCcw,
  ArrowLeftRight,
  Settings2,
  Menu,
  X,
  Download,
  Check,
  ChevronDown,
} from "lucide-react";

const STORE = "coldsky-documents-v1";
const today = () => new Date().toISOString().slice(0, 10);
const emptyCompany = {
  name: "COLD SKY Architectural Contracting Est",
  arabicName: "مؤسسة كولد سكاي للمقاولات المعمارية",
  address: "",
  phone: "",
  email: "",
  crNo: "",
  vatNo: "",
  logo: "",
  stamp: "",
};
const blankQuote = () => ({
  number: `CS-Q-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`,
  date: today(),
  prNo: "",
  address: "",
  customer: "",
  contact: "",
  vatRate: 15,
  notes: "",
  signatory: "",
  title: "",
  items: [
    { id: crypto.randomUUID(), description: "", unit: "Nos", qty: 1, price: 0 },
  ],
});
const blankNote = () => ({
  po: "TG-2026-00030206-1",
  date: today(),
  loc: "197",
  deliveredTo: "",
  items: [{ id: crypto.randomUUID(), description: "", unit: "Nos", qty: 1 }],
});
const money = (n) =>
  Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const safeRead = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || {};
  } catch {
    return {};
  }
};

export default function Workspace() {
  const [tab, setTab] = useState("quotation");
  const [panel, setPanel] = useState("document");
  const [company, setCompany] = useState(emptyCompany);
  const [quote, setQuote] = useState(blankQuote);
  const [note, setNote] = useState(blankNote);
  const [saved, setSaved] = useState({ quotations: [], notes: [] });
  const [showDrawer, setShowDrawer] = useState(false);
  const [toast, setToast] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = safeRead();
    setCompany({ ...emptyCompany, ...(data.company || {}) });
    if (data.quote) setQuote(data.quote);
    if (data.note) setNote(data.note);
    setSaved(data.saved || { quotations: [], notes: [] });
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(
      STORE,
      JSON.stringify({ company, quote, note, saved }),
    );
  }, [company, quote, note, saved, loaded]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(id);
  }, [toast]);

  const qSub = quote.items.reduce(
    (s, x) => s + Number(x.qty || 0) * Number(x.price || 0),
    0,
  );
  const qVat = (qSub * Number(quote.vatRate || 0)) / 100;
  const qTotal = qSub + qVat;
  const nTotal = note.items.reduce((s, x) => s + Number(x.qty || 0), 0);

  const updateQuote = (key, value) => setQuote((v) => ({ ...v, [key]: value }));
  const updateNote = (key, value) => setNote((v) => ({ ...v, [key]: value }));
  const updateItem = (kind, id, key, value) => {
    const setter = kind === "quote" ? setQuote : setNote;
    setter((v) => ({
      ...v,
      items: v.items.map((item) =>
        item.id === id ? { ...item, [key]: value } : item,
      ),
    }));
  };
  const addItem = (kind) => {
    const setter = kind === "quote" ? setQuote : setNote;
    setter((v) => ({
      ...v,
      items: [
        ...v.items,
        {
          id: crypto.randomUUID(),
          description: "",
          unit: "Nos",
          qty: 1,
          ...(kind === "quote" ? { price: 0 } : {}),
        },
      ],
    }));
  };
  const removeItem = (kind, id) => {
    const setter = kind === "quote" ? setQuote : setNote;
    setter((v) => ({
      ...v,
      items: v.items.length > 1 ? v.items.filter((x) => x.id !== id) : v.items,
    }));
  };
  const notify = (msg) => setToast(msg);

  const saveDocument = () => {
    const key = tab === "quotation" ? "quotations" : "notes";
    const record = tab === "quotation" ? quote : note;
    const label =
      tab === "quotation"
        ? quote.number || "Untitled quotation"
        : note.po || "Untitled delivery note";
    setSaved((v) => ({
      ...v,
      [key]: [
        { id: crypto.randomUUID(), label, date: today(), data: record },
        ...v[key].filter((x) => x.label !== label),
      ],
    }));
    notify("Document saved on this device");
  };
  const loadDocument = () => {
    const key = tab === "quotation" ? "quotations" : "notes";
    const records = saved[key];
    if (!records.length) return notify("No saved documents yet");
    const selected = window.prompt(
      "Enter a saved document number:\n" +
        records.map((r, i) => `${i + 1}. ${r.label}`).join("\n"),
    );
    const index = Number(selected) - 1;
    if (!selected || !records[index]) return;
    tab === "quotation"
      ? setQuote(records[index].data)
      : setNote(records[index].data);
    notify("Document loaded");
  };
  const loadSample = () => {
    if (tab === "quotation")
      setQuote({
        ...blankQuote(),
        number: "CS-Q-2026-00124",
        prNo: "PR-2026-045",
        address: "Riyadh, Saudi Arabia",
        customer: "Al Noor Trading Company",
        contact: "+966 55 123 4567",
        notes: "Prices are valid for 30 days.",
        signatory: "Ahmed Hassan",
        title: "General Manager",
        items: [
          {
            id: crypto.randomUUID(),
            description:
              "Supply and installation of architectural aluminum works",
            unit: "LS",
            qty: 1,
            price: 12500,
          },
          {
            id: crypto.randomUUID(),
            description: "Powder coated aluminum frames",
            unit: "M²",
            qty: 42,
            price: 185,
          },
          {
            id: crypto.randomUUID(),
            description: "Accessories and finishing materials",
            unit: "Set",
            qty: 4,
            price: 350,
          },
        ],
      });
    else
      setNote({
        ...blankNote(),
        po: "TG-2026-00030206-1",
        loc: "197",
        deliveredTo: "Project Site – Riyadh",
        items: [
          {
            id: crypto.randomUUID(),
            description: "Aluminum frames, powder coated",
            unit: "Pcs",
            qty: 42,
          },
          {
            id: crypto.randomUUID(),
            description: "Door hardware accessories",
            unit: "Set",
            qty: 12,
          },
          {
            id: crypto.randomUUID(),
            description: "Installation materials",
            unit: "Box",
            qty: 8,
          },
        ],
      });
    notify("Sample document loaded");
  };
  const newDocument = () => {
    if (
      !window.confirm("Start a new document? Unsaved changes will be replaced.")
    )
      return;
    tab === "quotation" ? setQuote(blankQuote()) : setNote(blankNote());
  };
  const fromQuotation = () => {
    setNote((v) => ({
      ...v,
      items: quote.items.map((x) => ({
        id: crypto.randomUUID(),
        description: x.description,
        unit: x.unit,
        qty: Number(x.qty || 0),
      })),
    }));
    setTab("delivery");
    setPanel("document");
    notify("Quotation items copied to delivery note");
  };
  const uploadAsset = (key, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCompany((v) => ({ ...v, [key]: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">CS</div>
          <div>
            <strong>COLD SKY</strong>
            <span>ARCHITECTURAL CONTRACTING EST</span>
          </div>
        </div>
        {/* <div className="top-actions">
          <span className="local-pill">
            <span /> Local workspace
          </span>
          <button
            className="icon-button mobile-menu"
            onClick={() => setShowDrawer(!showDrawer)}
          >
            <Menu size={19} />
          </button>
        </div> */}
      </header>
      <div className="layout">
        <aside className={`sidebar ${showDrawer ? "open" : ""}`}>
          <div className="side-label">WORKSPACE</div>
          <button
            className={`nav-item ${tab === "quotation" ? "active" : ""}`}
            onClick={() => {
              setTab("quotation");
              setPanel("document");
              setShowDrawer(false);
            }}
          >
            <FileText size={18} /> Quotation <span>عرض سعر</span>
          </button>
          <button
            className={`nav-item ${tab === "delivery" ? "active" : ""}`}
            onClick={() => {
              setTab("delivery");
              setPanel("document");
              setShowDrawer(false);
            }}
          >
            <Truck size={18} /> Delivery Note <span>إذن تسليم</span>
          </button>
          <div className="side-divider" />
          <div className="side-label">CONFIGURATION</div>
          <button
            className={`nav-item ${panel === "company" ? "active" : ""}`}
            onClick={() => {
              setPanel("company");
              setShowDrawer(false);
            }}
          >
            <Building2 size={18} /> Company details
          </button>
          <div className="sidebar-bottom">
            <div className="help-card">
              <div className="help-icon">
                <Settings2 size={17} />
              </div>
              <strong>Document settings</strong>
              <p>Company details are shared across both documents.</p>
              <button onClick={() => setPanel("company")}>
                Manage settings <span>→</span>
              </button>
            </div>
            <small> COLD SKY DOCUMENTS · v1.0</small>
          </div>
        </aside>
        <section className="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                DOCUMENT WORKSPACE /{" "}
                {panel === "company"
                  ? "SETTINGS"
                  : tab === "quotation"
                    ? "SALES"
                    : "LOGISTICS"}
              </div>
              <h1>
                {panel === "company"
                  ? "Company details"
                  : tab === "quotation"
                    ? "Quotation"
                    : "Delivery Note"}{" "}
                {panel !== "company" && (
                  <span className="arabic-title">
                    {tab === "quotation" ? "عرض سعر" : "إذن تسليم"}
                  </span>
                )}
              </h1>
              <p>
                {panel === "company"
                  ? "Manage the company information displayed on every document."
                  : tab === "quotation"
                    ? "Prepare a professional quotation with automatic totals and VAT."
                    : "Prepare a delivery note with item quantities and receiving details."}
              </p>
            </div>
            <div className="heading-actions">
              {panel === "company" ? (
                <button
                  className="primary"
                  onClick={() => {
                    setPanel("document");
                    notify("Company details saved");
                  }}
                >
                  <Check size={16} /> Done
                </button>
              ) : (
                <>
                  <button className="secondary" onClick={loadDocument}>
                    <FolderOpen size={16} /> Load
                  </button>
                  <button className="primary" onClick={saveDocument}>
                    <Save size={16} /> Save document
                  </button>
                </>
              )}
            </div>
          </div>

          {panel === "company" ? (
            <CompanyForm
              company={company}
              setCompany={setCompany}
              uploadAsset={uploadAsset}
            />
          ) : (
            <div className="workspace-grid">
              <section className="editor-column">
                <div className="editor-card">
                  <div className="card-heading">
                    <div>
                      <span className="step-number">01</span>
                      <div>
                        <h2>
                          {tab === "quotation"
                            ? "Quotation details"
                            : "Delivery information"}
                        </h2>
                        <p>Enter the document information below</p>
                      </div>
                    </div>
                    <span className="status-chip">● Draft</span>
                  </div>
                  {tab === "quotation" ? (
                    <div className="form-grid">
                      <Field
                        label="Quotation No."
                        value={quote.number}
                        onChange={(v) => updateQuote("number", v)}
                      />
                      <Field
                        label="Date"
                        type="date"
                        value={quote.date}
                        onChange={(v) => updateQuote("date", v)}
                      />
                      <Field
                        label="PR No."
                        placeholder="Purchase request number"
                        value={quote.prNo}
                        onChange={(v) => updateQuote("prNo", v)}
                      />
                      <Field
                        label="Customer address"
                        value={quote.address}
                        onChange={(v) => updateQuote("address", v)}
                      />
                      <Field
                        label="Customer name"
                        value={quote.customer}
                        onChange={(v) => updateQuote("customer", v)}
                      />
                      <Field
                        label="Contact"
                        placeholder="Phone / contact person"
                        value={quote.contact}
                        onChange={(v) => updateQuote("contact", v)}
                      />
                      <Field
                        label="VAT rate (%)"
                        type="number"
                        value={quote.vatRate}
                        onChange={(v) => updateQuote("vatRate", v)}
                      />
                      <Field
                        label="Signatory"
                        value={quote.signatory}
                        onChange={(v) => updateQuote("signatory", v)}
                      />
                      <Field
                        label="Title / designation"
                        value={quote.title}
                        onChange={(v) => updateQuote("title", v)}
                      />
                      <div className="field full">
                        <label>Notes / terms</label>
                        <textarea
                          value={quote.notes}
                          onChange={(e) => updateQuote("notes", e.target.value)}
                          placeholder="Add terms, conditions or additional notes..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="form-grid">
                      <Field
                        label="Purchase order"
                        value={note.po}
                        onChange={(v) => updateNote("po", v)}
                      />
                      <Field
                        label="Date of delivery"
                        type="date"
                        value={note.date}
                        onChange={(v) => updateNote("date", v)}
                      />
                      <Field
                        label="LOC No. / Name"
                        value={note.loc}
                        onChange={(v) => updateNote("loc", v)}
                      />
                      <Field
                        label="Delivered to"
                        placeholder="Receiver / project site"
                        value={note.deliveredTo}
                        onChange={(v) => updateNote("deliveredTo", v)}
                      />
                    </div>
                  )}
                </div>

                <div className="editor-card items-card">
                  <div className="card-heading">
                    <div>
                      <span className="step-number">02</span>
                      <div>
                        <h2>
                          Line items{" "}
                          <span className="count-badge">
                            {(tab === "quotation" ? quote : note).items.length}
                          </span>
                        </h2>
                        <p>
                          {tab === "quotation"
                            ? "Add products or services and their pricing"
                            : "Add the items included in this delivery"}
                        </p>
                      </div>
                    </div>
                    <button
                      className="text-button"
                      onClick={() =>
                        addItem(tab === "quotation" ? "quote" : "note")
                      }
                    >
                      <Plus size={16} /> Add item
                    </button>
                  </div>
                  <div className="items-table-wrap">
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th className="num">#</th>
                          <th>Description</th>
                          <th>Unit</th>
                          <th>Qty</th>
                          {tab === "quotation" && <th>Unit price</th>}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(tab === "quotation" ? quote : note).items.map(
                          (item, i) => (
                            <tr key={item.id}>
                              <td className="num">
                                {String(i + 1).padStart(2, "0")}
                              </td>
                              <td>
                                <input
                                  className="table-input description"
                                  placeholder="Item description..."
                                  value={item.description}
                                  onChange={(e) =>
                                    updateItem(
                                      tab === "quotation" ? "quote" : "note",
                                      item.id,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="table-input unit"
                                  value={item.unit}
                                  onChange={(e) =>
                                    updateItem(
                                      tab === "quotation" ? "quote" : "note",
                                      item.id,
                                      "unit",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              <td>
                                <input
                                  className="table-input numeric"
                                  type="number"
                                  min="0"
                                  value={item.qty}
                                  onChange={(e) =>
                                    updateItem(
                                      tab === "quotation" ? "quote" : "note",
                                      item.id,
                                      "qty",
                                      e.target.value,
                                    )
                                  }
                                />
                              </td>
                              {tab === "quotation" && (
                                <td>
                                  <input
                                    className="table-input numeric"
                                    type="number"
                                    min="0"
                                    value={item.price}
                                    onChange={(e) =>
                                      updateItem(
                                        "quote",
                                        item.id,
                                        "price",
                                        e.target.value,
                                      )
                                    }
                                  />
                                </td>
                              )}
                              <td>
                                <button
                                  className="remove-button"
                                  title="Remove item"
                                  onClick={() =>
                                    removeItem(
                                      tab === "quotation" ? "quote" : "note",
                                      item.id,
                                    )
                                  }
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="items-footer">
                    <span>
                      {(tab === "quotation" ? quote : note).items.length} item
                      rows
                    </span>
                    <button
                      className="add-row"
                      onClick={() =>
                        addItem(tab === "quotation" ? "quote" : "note")
                      }
                    >
                      <Plus size={15} /> Add another row
                    </button>
                  </div>
                </div>
                <div className="editor-card company-summary">
                  <div className="card-heading">
                    <div>
                      <span className="step-number">03</span>
                      <div>
                        <h2>Company information</h2>
                        <p>Shared details shown on the document</p>
                      </div>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setPanel("company")}
                    >
                      Edit details <span>↗</span>
                    </button>
                  </div>
                  <div className="company-inline">
                    <div className="company-logo">
                      {company.logo ? (
                        <img src={company.logo} alt="Company logo" />
                      ) : (
                        <Building2 size={22} />
                      )}
                    </div>
                    <div>
                      <strong>{company.name || "Company name not set"}</strong>
                      <span>
                        {company.address || "Add company address"} ·{" "}
                        {company.phone || "Add phone"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <aside className="preview-column">
                <div className="preview-toolbar">
                  <div>
                    <span className="live-dot" /> LIVE PREVIEW
                  </div>
                  <button onClick={() => window.print()}>
                    <Printer size={15} /> Print
                  </button>
                </div>
                <div className="paper-wrap">
                  <div className="paper" id="document-preview">
                    <DocumentPreview
                      tab={tab}
                      company={company}
                      quote={quote}
                      note={note}
                      qSub={qSub}
                      qVat={qVat}
                      qTotal={qTotal}
                    />
                  </div>
                </div>
                <div className="preview-actions">
                  {tab === "quotation" ? (
                    <div className="total-box">
                      <span>Estimated cost</span>
                      <strong>SAR {money(qSub)}</strong>
                      <div>
                        <span>VAT ({quote.vatRate || 0}%)</span>
                        <b>SAR {money(qVat)}</b>
                      </div>
                      <div className="grand">
                        <span>Grand total</span>
                        <strong>SAR {money(qTotal)}</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="total-box">
                      <span>Total quantity</span>
                      <strong>
                        {money(nTotal).replace(".00", "")} <small>units</small>
                      </strong>
                      <div className="grand">
                        <span>Line items</span>
                        <strong>{note.items.length}</strong>
                      </div>
                    </div>
                  )}
                  <button
                    className="primary wide"
                    onClick={() => window.print()}
                  >
                    <Printer size={16} /> Print / Save as PDF
                  </button>
                  {tab === "delivery" && (
                    <button className="secondary wide" onClick={fromQuotation}>
                      <ArrowLeftRight size={16} /> Import from quotation
                    </button>
                  )}
                  <button className="secondary wide" onClick={loadSample}>
                    <RotateCcw size={16} /> Load sample data
                  </button>
                  <button className="quiet wide" onClick={newDocument}>
                    Start new document
                  </button>
                </div>
              </aside>
            </div>
          )}
        </section>
      </div>
      {toast && (
        <div className="toast">
          <Check size={16} />
          {toast}
        </div>
      )}
    </main>
  );
}

function Field({ label, value, onChange, placeholder = "", type = "text" }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(type === "number" ? e.target.value : e.target.value)
        }
      />
    </div>
  );
}

function CompanyForm({ company, setCompany, uploadAsset }) {
  const set = (key, value) => setCompany((v) => ({ ...v, [key]: value }));
  return (
    <div className="settings-layout">
      <div className="editor-card">
        <div className="card-heading">
          <div>
            <span className="step-number">01</span>
            <div>
              <h2>Company identity</h2>
              <p>Business name and official identifiers</p>
            </div>
          </div>
        </div>
        <div className="form-grid">
          <Field
            label="Company name (English)"
            value={company.name}
            onChange={(v) => set("name", v)}
          />
          <Field
            label="Company name (Arabic)"
            value={company.arabicName}
            onChange={(v) => set("arabicName", v)}
          />
          <Field
            label="Commercial registration no."
            value={company.crNo}
            onChange={(v) => set("crNo", v)}
          />
          <Field
            label="VAT registration no."
            value={company.vatNo}
            onChange={(v) => set("vatNo", v)}
          />
        </div>
      </div>
      <div className="editor-card">
        <div className="card-heading">
          <div>
            <span className="step-number">02</span>
            <div>
              <h2>Contact information</h2>
              <p>Details printed in the document header</p>
            </div>
          </div>
        </div>
        <div className="form-grid">
          <Field
            label="Company address"
            value={company.address}
            onChange={(v) => set("address", v)}
          />
          <Field
            label="Phone number"
            value={company.phone}
            onChange={(v) => set("phone", v)}
          />
          <Field
            label="Email address"
            value={company.email}
            onChange={(v) => set("email", v)}
          />
        </div>
      </div>
      <div className="editor-card">
        <div className="card-heading">
          <div>
            <span className="step-number">03</span>
            <div>
              <h2>Brand assets</h2>
              <p>Upload the logo and company stamp</p>
            </div>
          </div>
        </div>
        <div className="asset-grid">
          <AssetUpload
            label="Company logo"
            value={company.logo}
            onChange={(f) => uploadAsset("logo", f)}
          />
          <AssetUpload
            label="Company stamp"
            value={company.stamp}
            onChange={(f) => uploadAsset("stamp", f)}
          />
        </div>
      </div>
      <div className="settings-note">
        <Check size={17} />
        <span>
          These details are stored in this browser and automatically reused in
          quotations and delivery notes.
        </span>
      </div>
    </div>
  );
}
function AssetUpload({ label, value, onChange }) {
  return (
    <div className="asset-upload">
      <div className="asset-preview">
        {value ? <img src={value} alt={label} /> : <Building2 size={24} />}
      </div>
      <div>
        <strong>{label}</strong>
        <p>PNG, JPG or SVG image</p>
        <label className="upload-button">
          <Download size={14} /> Choose file
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onChange(e.target.files?.[0])}
          />
        </label>
      </div>
    </div>
  );
}

function DocumentPreview({ tab, company, quote, note, qSub, qVat, qTotal }) {
  const isQ = tab === "quotation";
  const rows = isQ ? quote.items : note.items;
  return (
    <div className="doc-content">
      <div className="doc-header">
        <div className="doc-brand">
          {company.logo ? (
            <img src={company.logo} alt="Logo" />
          ) : (
            <div className="doc-logo-placeholder">CS</div>
          )}
          <div>
            <b>{company.name || "COLD SKY Architectural Contracting Est"}</b>
            <span>{company.arabicName}</span>
          </div>
        </div>
        <div className="doc-title">
          {isQ ? "Quotation" : "Delivery Note"}
          <small>{isQ ? "عرض سعر" : "إذن تسليم"}</small>
        </div>
      </div>
      <div className="doc-company-line">
        <span>{company.address}</span>
        <span>{company.phone}</span>
        <span>{company.email}</span>
      </div>
      <div className="doc-tax-line">
        <span>CR No. {company.crNo}</span>
        <span>VAT No. {company.vatNo}</span>
      </div>
      {isQ ? (
        <>
          <div className="doc-meta">
            <div>
              <b>Quotation No.</b>
              <span>{quote.number}</span>
            </div>
            <div>
              <b>Date</b>
              <span>{quote.date}</span>
            </div>
            <div>
              <b>PR No.</b>
              <span>{quote.prNo}</span>
            </div>
            <div>
              <b>Address</b>
              <span>{quote.address}</span>
            </div>
            <div>
              <b>Name</b>
              <span>{quote.customer}</span>
            </div>
            <div>
              <b>Contact</b>
              <span>{quote.contact}</span>
            </div>
          </div>
          <div className="doc-section-title">
            {company.name} <span>Quotation</span>
          </div>
          <table className="doc-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Items</th>
                <th>Unit</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Sub Total</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.description}</td>
                  <td>{r.unit}</td>
                  <td>{r.qty}</td>
                  <td>{money(r.price)}</td>
                  <td>{money(Number(r.qty || 0) * Number(r.price || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="doc-totals">
            <div>
              <span>Total Estimated Cost</span>
              <b>SAR {money(qSub)}</b>
            </div>
            <div>
              <span>{quote.vatRate}% VAT AMOUNT SAR</span>
              <b>{money(qVat)}</b>
            </div>
            <div className="doc-grand">
              <span>GRAND TOTAL AMOUNT SAR</span>
              <b>{money(qTotal)}</b>
            </div>
          </div>
          {quote.notes && (
            <p className="doc-notes">
              <b>Notes:</b> {quote.notes}
            </p>
          )}
          <div className="doc-sign">
            <div>
              Regards,
              <br />
              <b>{quote.signatory}</b>
              <span>{quote.title}</span>
            </div>
            <div>
              {company.stamp && <img src={company.stamp} alt="Company stamp" />}
              <span>Authorized Signatory</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="doc-meta delivery-meta">
            <div>
              <b>Purchase order</b>
              <span>{note.po}</span>
            </div>
            <div>
              <b>Date of delivery</b>
              <span>{note.date}</span>
            </div>
            <div>
              <b>LOC No./Name</b>
              <span>{note.loc}</span>
            </div>
            <div>
              <b>Delivered to</b>
              <span>{note.deliveredTo}</span>
            </div>
          </div>
          <div className="doc-section-title">
            {company.name} <span>Delivery Note</span>
          </div>
          <table className="doc-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Description</th>
                <th>Unit</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.description}</td>
                  <td>{r.unit}</td>
                  <td>{r.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="doc-delivery-bottom">
            <div>
              <b>Delivered to</b>
              <span>{note.deliveredTo}</span>
            </div>
            <div>
              <b>Received by</b>
              <span />
            </div>
          </div>
          <div className="doc-sign">
            <div>{company.name}</div>
            <div>
              {company.stamp && <img src={company.stamp} alt="Company stamp" />}
              <span>Authorized Signatory</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
