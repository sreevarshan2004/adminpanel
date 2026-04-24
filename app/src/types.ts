export interface ListItem {
  name: string;
  value?: string;
  website?: string;
}

export interface FloorPlan {
  floor_bedroom: number;
  floor_image: string;
  title?: string;   // e.g. "Type A"
  unit?: string;   // e.g. "2 Bedroom Apartment"
  suite?: string;   // indoor/suite area  e.g. "1,200 sq ft"
  balcony?: string;   // balcony area        e.g. "150 sq ft"
  total?: string;   // total area          e.g. "1,350 sq ft"
}

export type PropertyStatus = 'active' | 'inactive' | 'soldout';


export interface Property {
  id?: number | string;

  // ── Media ────────────────────────────────────────────────────────────────
  images: string[];
  blueprint: string;
  blueprints?: string[];
  // ── Virtual tour ─────────────────────────────────────────────────────────
  virtual_tour_url?: string;

  // ── Lists ─────────────────────────────────────────────────────────────────
  company: ListItem[];
  connectivity: ListItem[];
  lifestyle: ListItem[];

  // ── Features (comma-separated or plain text) ──────────────────────────────
  features?: string;

  // ── Contact ──────────────────────────────────────────────────────────────
  contact_name: string;
  email: string;
  phone: string;

  // ── Basic info ────────────────────────────────────────────────────────────
  title: string;
  description: string;
  location: string;

  // ── Numeric fields ────────────────────────────────────────────────────────
  estimated_value: number | null;
  price: number | null;
  size: string | null;
  sq_ft: number | null;
  no_of_beds: number | null;
  no_of_bath: number | null;

  // ── Floor plans ───────────────────────────────────────────────────────────
  floor_bedroom: number | null;
  floor_image: string;
  floor_plans: FloorPlan[];

  status?: PropertyStatus;
}