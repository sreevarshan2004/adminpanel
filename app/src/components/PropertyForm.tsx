import React, { useState, useEffect } from 'react';
import { Property, ListItem, FloorPlan, PropertyStatus } from '../types';
import {
  Home, MapPin, Image as ImageIcon, Plus, Trash2, Layers, Users, Phone,
  Save, Sparkles, Building2, Map, ChevronDown, ChevronUp, Globe
} from 'lucide-react';

interface PropertyFormProps {
  initialData?: Property | null;
  onSubmit: (
    p: Property,
    files: { blueprint?: File; floor_image?: File; images?: File[] }
  ) => void;
  onCancel: () => void;
}

// ── Reusable styles ────────────────────────────────────────────────────────────
const label = 'block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5';
const input = 'w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all';
const card = 'bg-white border border-slate-100 rounded-2xl p-6 shadow-sm';
const secHead = 'flex items-center gap-3 mb-5 border-b border-slate-100 pb-3';

// ── Section wrapper with collapse ─────────────────────────────────────────────
const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  badge?: string;
  children: React.ReactNode;
}> = ({ icon, title, badge, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className={card}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 mb-0 text-left group"
      >
        <span className="text-indigo-600">{icon}</span>
        <span className="flex-1 text-base font-bold text-slate-800">{title}</span>
        {badge && (
          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
        {open ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>
      {open && <div className="mt-5">{children}</div>}
    </div>
  );
};

// ── Connectivity / Lifestyle options ──────────────────────────────────────────
const connectivityOptions = [
  'Airport', 'Metro Station', 'Bus Stop', 'Shopping Mall', 'Hospital',
  'School', 'Beach', 'City Center', 'Highway', 'Train Station', 'Park', 'Restaurant',
];
const distanceOptions = [
  '500m', '1km', '2km', '3km', '5km', '10km', '15km', '20km', '25km', '30km',
];
const lifestyleOptions = [
  'Swimming Pool', 'Gym', 'Spa', 'Garden', 'Playground',
  'BBQ Area', 'Tennis Court', 'Basketball Court', 'Jogging Track',
  'Kids Play Area', 'Sauna', 'Jacuzzi', 'Yoga Studio', 'Coworking Space',
  'Parking', 'Security 24/7', 'Concierge', 'Pet Friendly',
];
const companyOptions = ['EMAAR', 'MERAAS', 'SHOBHA', 'AZIZI', 'DAMAC', 'NAKHEEL'];

// ════════════════════════════════════════════════════════════════════════════════
export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialData, onSubmit, onCancel,
}) => {

  const blank: Partial<Property> = {
    images: [], blueprint: '', contact_name: '', email: '',
    phone: '',
    lifestyle: [], connectivity: [], company: [], floor_plans: [],
  };

  const [form, setForm] = useState<Partial<Property>>(initialData || blank);
  const [files, setFiles] = useState<{
    blueprint?: File; floor_image?: File; images?: File[];
  }>({});

  // Floor plan builder
  const [curFloor, setCurFloor] = useState<FloorPlan>({
    floor_bedroom: 1, floor_image: '', title: '', unit: '',
    suite: '', balcony: '', total: '',
  });

  // List builders
  const [newCompany, setNewCompany] = useState<ListItem>({ name: '', website: '' });
  const [newConnectivity, setNewConnectivity] = useState<ListItem>({ name: '', value: '' });
  const [newLifestyle, setNewLifestyle] = useState<ListItem>({ name: '' });

  useEffect(() => { if (initialData) setForm(initialData); }, [initialData]);

  const isFormValid = Boolean(
    form.title &&
    form.location &&
    form.price &&
    form.no_of_beds !== null && form.no_of_beds !== undefined &&
    form.description &&
    form.contact_name &&
    form.phone &&
    form.email &&
    form.images && form.images.length > 0
  );

  // ── Generic text / number change ───────────────────────────────────────────
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm(p => ({
      ...p,
      [name]: type === 'number' ? (value === '' ? null : parseFloat(value)) : value,
    }));
  };

  // ── File helpers ───────────────────────────────────────────────────────────
  const onSingleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'blueprint' | 'floor_image'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles(p => ({ ...p, [field]: file }));
    setForm(p => ({ ...p, [field]: file.name }));
  };

  const onMultiImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const imgs = Array.from(list) as File[];
    const previews = imgs.map(f => URL.createObjectURL(f));
    setFiles(p => ({ ...p, images: [...(p.images || []), ...imgs] }));
    setForm(p => ({ ...p, images: [...(p.images || []), ...previews] }));
  };

  // ── List helpers ───────────────────────────────────────────────────────────
  const addList = (
    key: 'company' | 'connectivity' | 'lifestyle',
    item: ListItem,
    reset: () => void,
  ) => {
    if (!item.name) return;
    setForm(p => ({ ...p, [key]: [...(p[key] as ListItem[]), item] }));
    reset();
  };

  const removeList = (
    key: 'company' | 'connectivity' | 'lifestyle' | 'images' | 'floor_plans',
    idx: number,
  ) => {
    setForm(p => ({
      ...p,
      [key]: (p[key] as any[]).filter((_, i) => i !== idx),
    }));
    if (key === 'images') {
      setFiles(p => ({ ...p, images: p.images?.filter((_, i) => i !== idx) }));
    }
  };

  // ── Floor plan helpers ─────────────────────────────────────────────────────
  const addFloor = () => {
    if (!curFloor.floor_bedroom) return;
    const newFloor: FloorPlan = {
      floor_bedroom: Number(curFloor.floor_bedroom),
      floor_image: curFloor.floor_image || '',
      title: curFloor.title || '',
      unit: curFloor.unit || '',
      suite: curFloor.suite || '',
      balcony: curFloor.balcony || '',
      total: curFloor.total || '',
    };
    setForm(prev => ({
      ...prev,
      floor_plans: [...(prev.floor_plans || []), newFloor]
    }));
    setCurFloor({ floor_bedroom: '', floor_image: '', title: '', unit: '', suite: '', balcony: '', total: '' });
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Property = {
      id: (initialData as any)?.id || Date.now(),
      title: form.title || '',
      location: form.location || '',
      price: (form.price !== null && form.price !== undefined) ? form.price : null,
      no_of_beds: form.no_of_beds ?? 0,
      no_of_bath: null,
      sq_ft: null,
      size: null,
      estimated_value: null,
      description: form.description || '',
      floor_bedroom: form.floor_bedroom || 0,
      floor_image: form.floor_image || '',
      contact_name: form.contact_name || '',
      email: form.email || '',
      phone: form.phone || '',
      blueprint: form.blueprint || '',
      status: (form.status as PropertyStatus) || 'active',
      images: Array.isArray(form.images) ? form.images : [],
      floor_plans: Array.isArray(form.floor_plans) ? form.floor_plans : [],
      company: Array.isArray(form.company) ? form.company : [],
      connectivity: Array.isArray(form.connectivity) ? form.connectivity : [],
      lifestyle: Array.isArray(form.lifestyle) ? form.lifestyle : [],
    };
    onSubmit(payload, files);
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={onSubmitForm} className="space-y-6 pb-10">

      {/* ── Sticky header bar ─────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-lg border-b border-slate-100 -mx-8 px-8 py-4 mb-2">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? '✏️ Edit Property' : '➕ Add New Property'}
          </h2>
          {/* Status toggle */}
          <div className="flex gap-4">
            {(['active', 'inactive', 'soldout'] as PropertyStatus[]).map(s => (
              <label key={s} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio" name="status" value={s}
                  checked={form.status === s}
                  onChange={onChange}
                  className="w-4 h-4"
                />
                <span className={`text-sm font-semibold capitalize ${s === 'active' ? 'text-green-600' :
                  s === 'inactive' ? 'text-slate-500' : 'text-red-500'
                  }`}>{s === 'soldout' ? 'Sold Out' : s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 + 3 — Hero Images / Gallery
      ════════════════════════════════════════════════════════════════════ */}
      <Section icon={<ImageIcon size={18} />} title="1 · Hero Images & Gallery"
        badge={`${(form.images || []).length} photo(s)`}>
        <p className="text-xs text-slate-400 mb-3">
          The first image is used as the full-screen hero banner. All images appear in the gallery carousel.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {(form.images || []).map((src, i) => (
            <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border-2 border-slate-200 bg-slate-100">
              <img src={src} className="w-full h-full object-cover" alt="" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                  HERO
                </span>
              )}
              <button
                type="button"
                onClick={() => removeList('images', i)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
            <input type="file" multiple accept="image/*" onChange={onMultiImages} className="hidden" />
            <Plus size={22} className="text-slate-400 mb-1" />
            <span className="text-[10px] font-bold text-slate-400 uppercase">Add Photos</span>
          </label>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — Overview / Description
      ════════════════════════════════════════════════════════════════════ */}
      <Section icon={<Home size={18} />} title="2 · Overview & Description">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="md:col-span-2">
            <label className={label}>Property Title</label>
            <input name="title" value={form.title || ''} onChange={onChange}
              placeholder="e.g. Pinnacle Tower Residences" className={input} required />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Location / Address</label>
            <input name="location" value={form.location || ''} onChange={onChange}
              placeholder="e.g. Downtown Dubai, UAE" className={input} />
          </div>
          <div>
            <label className={label}>Price</label>
            <input name="price" value={form.price ?? ''} onChange={onChange}
              placeholder="e.g. AED 1,200,000" className={input} />
          </div>
          <div>
            <label className={label}>Bedrooms</label>
            <input type="number" name="no_of_beds" step="0.1" value={form.no_of_beds ?? ''} onChange={onChange} className={input} />
          </div>


          <div>
            <label className={label}>Main Floor Bedroom Count</label>
            <input type="number" name="floor_bedroom" step="0.1" value={form.floor_bedroom ?? ''} onChange={onChange}
              placeholder="e.g. 1.5" className={input} />
          </div>
        </div>

        <div className="mb-5">
          <label className={label}>Description</label>
          <textarea name="description" value={form.description || ''} onChange={onChange}
            rows={5} placeholder="Full property description shown in the Overview section…"
            className={input} />
        </div>


        {/* Blueprint image */}
        <div>
          <label className={label}>Blueprint / Master Plan Image</label>
          <p className="text-xs text-slate-400 mb-2">Shown on the left side of the Overview section.</p>
          <label className="flex items-center gap-3 p-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all">
            <input type="file" accept="image/*" onChange={e => onSingleFile(e, 'blueprint')} className="hidden" />
            <Layers size={16} className="text-indigo-500 shrink-0" />
            <span className="text-sm text-slate-600 truncate">
              {files.blueprint?.name || form.blueprint || 'Click to upload blueprint image'}
            </span>
          </label>
          {(files.blueprint || form.blueprint) && (
            <img
              src={files.blueprint ? URL.createObjectURL(files.blueprint) : (form.blueprint || '')}
              className="mt-2 h-28 rounded-xl object-cover border border-slate-200"
              alt="blueprint preview"
            />
          )}
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — Floor Plans
      ════════════════════════════════════════════════════════════════════ */}
      <Section icon={<Building2 size={18} />} title="3 · Floor Plans"
        badge={`${(form.floor_plans || []).length} plan(s)`}>
        <p className="text-xs text-slate-400 mb-4">
          Plans are grouped by bedroom count into tabs (1 BR, 2 BR…). Each plan can have area breakdowns and an image.
        </p>

        {/* Existing plans */}
        <div className="space-y-3 mb-5">
          {(form.floor_plans || []).map((fp, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
              {fp.floor_image && (
                <img src={fp.floor_image} className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0" alt="" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-700">
                  {fp.floor_bedroom} BR{fp.title ? ` — ${fp.title}` : ''}
                </p>
                {fp.unit && <p className="text-xs text-slate-500">Unit: {fp.unit}</p>}
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-400">
                  {fp.suite && <span>Suite: {fp.suite}</span>}
                  {fp.balcony && <span>Balcony: {fp.balcony}</span>}
                  {fp.total && <span>Total: {fp.total}</span>}
                </div>
              </div>
              <button type="button" onClick={() => removeList('floor_plans', i)}
                className="text-red-400 hover:text-red-600 shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>

        {/* Add floor plan */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-4">
          <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Add Floor Plan</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Bedrooms *</label>
              <input type="number" min="0" step="0.1" value={curFloor.floor_bedroom}
                onChange={e => setCurFloor(f => ({ ...f, floor_bedroom: parseFloat(e.target.value) || 0 }))}
                className={input} />
            </div>
            <div>
              <label className={label}>Plan Title</label>
              <input placeholder="e.g. Type A" value={curFloor.title || ''}
                onChange={e => setCurFloor(f => ({ ...f, title: e.target.value }))}
                className={input} />
            </div>
            <div>
              <label className={label}>Unit / Type</label>
              <input placeholder="e.g. 2BR Apartment" value={curFloor.unit || ''}
                onChange={e => setCurFloor(f => ({ ...f, unit: e.target.value }))}
                className={input} />
            </div>
            <div>
              <label className={label}>Suite / Indoor Area</label>
              <input placeholder="e.g. 1,200 sq ft" value={curFloor.suite || ''}
                onChange={e => setCurFloor(f => ({ ...f, suite: e.target.value }))}
                className={input} />
            </div>
            <div>
              <label className={label}>Balcony Area</label>
              <input placeholder="e.g. 150 sq ft" value={curFloor.balcony || ''}
                onChange={e => setCurFloor(f => ({ ...f, balcony: e.target.value }))}
                className={input} />
            </div>
            <div>
              <label className={label}>Total Area</label>
              <input placeholder="e.g. 1,350 sq ft" value={curFloor.total || ''}
                onChange={e => setCurFloor(f => ({ ...f, total: e.target.value }))}
                className={input} />
            </div>
          </div>
          {/* Floor plan image */}
          <div>
            <label className={label}>Floor Plan Image</label>
            <label className="flex items-center gap-3 p-3 bg-white border-2 border-dashed border-indigo-200 rounded-xl cursor-pointer hover:border-indigo-400 transition-all">
              <input type="file" accept="image/*" className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  // Convert to Base64 immediately so it's ready for the JSON payload
                  const reader = new FileReader();
                  reader.onload = () => {
                    setCurFloor(f => ({ ...f, floor_image: reader.result as string }));
                  };
                  reader.readAsDataURL(file);
                }} />
              <Layers size={14} className="text-indigo-400 shrink-0" />
              <span className="text-sm text-slate-500 truncate">
                {curFloor.floor_image ? '✓ Image selected' : 'Click to upload floor plan image'}
              </span>
            </label>
            {curFloor.floor_image && (
              <img src={curFloor.floor_image} className="mt-2 h-24 rounded-xl object-contain border border-indigo-100" alt="" />
            )}
          </div>
          <button type="button" onClick={addFloor}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all">
            <Plus size={15} /> Add Floor Plan
          </button>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — Amenities / Lifestyle
      ════════════════════════════════════════════════════════════════════ */}
      <Section icon={<Sparkles size={18} />} title="4 · Amenities / Lifestyle"
        badge={`${(form.lifestyle || []).length} item(s)`}>
        <p className="text-xs text-slate-400 mb-3">
          Type any amenity name (e.g. <span className="font-mono">CALISTHENIC GYM</span>, <span className="font-mono">LEISURE POOL</span>) or pick a suggestion. Press <kbd className="bg-slate-200 px-1 rounded text-xs">Enter</kbd> or click <strong>+</strong> to add.
        </p>
        {/* Added  tags */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
          {(form.lifestyle || []).length === 0 && (
            <span className="text-xs text-slate-400 italic">No amenities added yet — type below and press Enter or +</span>
          )}
          {(form.lifestyle || []).map((item, i) => (
            <span key={i}
              className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {(item as ListItem).name}
              <button type="button" onClick={() => removeList('lifestyle', i)}
                className="hover:text-red-500 transition-colors ml-1">
                <Trash2 size={11} />
              </button>
            </span>
          ))}
        </div>
        {/* FREE TEXT input with datalist suggestions */}
        <datalist id="lifestyle-suggestions">
          {lifestyleOptions.map(o => <option key={o} value={o} />)}
        </datalist>
        <div className="flex gap-2">
          <input
            list="lifestyle-suggestions"
            value={newLifestyle.name}
            onChange={e => setNewLifestyle({ name: e.target.value })}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addList('lifestyle', newLifestyle, () => setNewLifestyle({ name: '' }));
              }
            }}
            placeholder="Type amenity name, e.g. LEISURE POOL, CALISTHENIC GYM…"
            className={input}
          />
          <button type="button"
            onClick={() => addList('lifestyle', newLifestyle, () => setNewLifestyle({ name: '' }))}
            title="Add amenity"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-xl shrink-0 transition-all flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — Connectivity
      ════════════════════════════════════════════════════════════════════ */}
      <Section icon={<MapPin size={18} />} title="5 · Connectivity / Nearby"
        badge={`${(form.connectivity || []).length} item(s)`}>
        <p className="text-xs text-slate-400 mb-3">
          Type the location name (e.g. <span className="font-mono">JEBEL ALI METRO STATION</span>) and distance (e.g. <span className="font-mono">2 MINUTES</span>). Press <kbd className="bg-slate-200 px-1 rounded text-xs">Enter</kbd> or click <strong>+</strong> to add.
        </p>
        {/* Added rows */}
        <div className="space-y-2 mb-4 min-h-[2rem]">
          {(form.connectivity || []).length === 0 && (
            <p className="text-xs text-slate-400 italic">No connectivity items added yet — type below and press Enter or +</p>
          )}
          {(form.connectivity || []).map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl text-sm">
              <span className="font-semibold text-blue-700 flex-1">{(item as ListItem).name}</span>
              {(item as ListItem).value && (
                <span className="text-blue-500 text-xs bg-blue-100 px-2 py-0.5 rounded-full">{(item as ListItem).value}</span>
              )}
              <button type="button" onClick={() => removeList('connectivity', i)}
                className="text-red-400 hover:text-red-600 ml-1">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        {/* FREE TEXT inputs */}
        <datalist id="connectivity-name-suggestions">
          {connectivityOptions.map(o => <option key={o} value={o} />)}
        </datalist>
        <datalist id="connectivity-dist-suggestions">
          {distanceOptions.map(o => <option key={o} value={o} />)}
        </datalist>
        <div className="flex gap-2">
          <input
            list="connectivity-name-suggestions"
            value={newConnectivity.name}
            onChange={e => setNewConnectivity(c => ({ ...c, name: e.target.value }))}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addList('connectivity', newConnectivity, () => setNewConnectivity({ name: '', value: '' }));
              }
            }}
            placeholder="Location name, e.g. JEBEL ALI METRO STATION"
            className={input}
          />
          <input
            list="connectivity-dist-suggestions"
            value={newConnectivity.value || ''}
            onChange={e => setNewConnectivity(c => ({ ...c, value: e.target.value }))}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addList('connectivity', newConnectivity, () => setNewConnectivity({ name: '', value: '' }));
              }
            }}
            placeholder="Distance, e.g. 2 MINUTES"
            className={`${input} max-w-[160px]`}
          />
          <button type="button"
            onClick={() => addList('connectivity', newConnectivity, () => setNewConnectivity({ name: '', value: '' }))}
            title="Add location"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shrink-0 transition-all flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
      </Section>
      {/* ════════════════════════════════════════════════════════════════════
          SECTION 6 — Location Map
      ════════════════════════════════════════════════════════════════════ */}
      <Section icon={<Map size={18} />} title="6 · Location Map">
        <p className="text-xs text-slate-400 mb-2">
          The location address field (set in Overview) is used to generate the Google Maps embed.
          Current value: <strong>{form.location || '—'}</strong>
        </p>
        {form.location && (
          <div className="rounded-xl overflow-hidden border border-slate-200 h-48">
            <iframe
              title="Location preview"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(form.location)}&output=embed`}
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        )}
      </Section>


      {/* ════════════════════════════════════════════════════════════════════
          SECTION — Company
      ════════════════════════════════════════════════════════════════════ */}
      <Section icon={<Users size={18} />} title="Developer / Company"
        badge={`${(form.company || []).length}`}>
        <div className="flex flex-wrap gap-2 mb-4">
          {(form.company || []).map((c, i) => (
            <span key={i}
              className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {(c as ListItem).name}
              {(c as ListItem).website && (
                <a href={(c as ListItem).website} target="_blank" rel="noreferrer"
                  className="text-orange-400 hover:text-orange-600">
                  <Globe size={10} />
                </a>
              )}
              <button type="button" onClick={() => removeList('company', i)}
                className="hover:text-red-500"><Trash2 size={11} /></button>
            </span>
          ))}
        </div>
        <datalist id="company-suggestions">
          {companyOptions.map(o => <option key={o} value={o} />)}
        </datalist>
        <div className="flex gap-2">
          <input
            list="company-suggestions"
            value={newCompany.name}
            onChange={e => setNewCompany(c => ({ ...c, name: e.target.value }))}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addList('company', newCompany, () => setNewCompany({ name: '', website: '' }));
              }
            }}
            placeholder="Developer name, e.g. SOBHA, EMAAR, NAKHEEL…"
            className={input}
          />
          <input
            placeholder="Website (optional)"
            value={newCompany.website || ''}
            onChange={e => setNewCompany(c => ({ ...c, website: e.target.value }))}
            className={`${input} max-w-[180px]`}
          />
          <button type="button"
            onClick={() => addList('company', newCompany, () => setNewCompany({ name: '', website: '' }))}
            title="Add developer"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shrink-0 transition-all flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>

      </Section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 7 — Contact Info
      ════════════════════════════════════════════════════════════════════ */}
      <Section icon={<Phone size={18} />} title="7 · Contact Info">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={label}>Contact Name</label>
            <input name="contact_name" value={form.contact_name || ''} onChange={onChange}
              placeholder="Agent / Developer name" className={input} />
          </div>
          <div>
            <label className={label}>Phone Number</label>
            <input name="phone" value={form.phone || ''} onChange={onChange}
              placeholder="+971 50 000 0000" className={input} />
          </div>
          <div className="md:col-span-2">
            <label className={label}>Email Address</label>
            <input type="email" name="email" value={form.email || ''} onChange={onChange}
              placeholder="contact@example.com" className={input} />
          </div>
        </div>
      </Section>

      {/* ── Action buttons ────────────────────────────────────────────────── */}
      <div className="flex gap-3 pt-2">
        <button type="submit"
          disabled={!isFormValid}
          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none">
          <Save size={20} />
          {initialData ? 'Update Property' : 'Publish Property'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-8 bg-white text-slate-600 font-bold py-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
};
