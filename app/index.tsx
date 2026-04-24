import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { LoginPage } from './src/components/Login';
import { MainPage } from './src/components/MainPage';
import { PropertyForm } from './src/components/PropertyForm';
import { Property } from './src/types';
import { X } from 'lucide-react';
import { PROPERTIES_URL, ADD_PROPERTY_URL, UPDATE_PROPERTY_URL, IMAGE_BASE_URL, GET_PROPERTY_DETAIL_URL, STATUS_URL } from './src/constants/apiUrls';

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-50 rounded-[2rem] w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl animate-in border border-white">
        <div className="px-8 py-6 flex justify-between items-center bg-white sticky top-0 rounded-t-[2rem] z-10 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Property Management Console</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-500 hover:text-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProperties();
    }
  }, [isLoggedIn]);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(PROPERTIES_URL, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      const data = await response.json();
      console.log('Fetched properties:', data);

      let propertiesList = [];
      if (Array.isArray(data)) {
        propertiesList = data;
      } else if (data.properties && Array.isArray(data.properties)) {
        propertiesList = data.properties;
      } else if (data.data && Array.isArray(data.data)) {
        propertiesList = data.data;
      }

      // ── Helper: resolve relative paths → full URL, and strip trailing whitespace ──
      const toFullUrl = (path: string): string => {
        if (!path) return '';
        const cleaned = path.trim(); // ← strips \n, \r\n, spaces from API responses
        if (cleaned.startsWith('http') || cleaned.startsWith('data:')) return cleaned;
        let clean = cleaned.replace(/^\/+/, '');
        if (clean.startsWith('api/')) clean = clean.slice(4);
        return IMAGE_BASE_URL + clean;
      };

      const parseStatus = (s: any): string => {
        if (s === 1 || s === '1') return 'active';
        if (s === 2 || s === '2') return 'inactive';
        if (s === 3 || s === '3') return 'soldout';
        return typeof s === 'string' ? s : 'active';
      };

      const parseJsonArray = (val: any): any[] => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') { try { return JSON.parse(val || '[]'); } catch { return []; } }
        return [];
      };

      const mappedProperties = propertiesList.map((p: any) => {
        // ── Helper: extract URL from string or object ────────────────────
        const getRawUrl = (val: any): string => {
          if (typeof val === 'string') return val;
          if (val && typeof val === 'object' && val.url) return String(val.url);
          if (val && typeof val === 'object' && val.image) return String(val.image);
          if (val && typeof val === 'object' && val.file) return String(val.file);
          return '';
        };

        // ── Images: handle both string arrays and object arrays ──────────
        let imagesList: string[] = [];
        const rawImages = p.images || p.blueprints || [];
        if (Array.isArray(rawImages)) {
          imagesList = rawImages
            .map(img => getRawUrl(img))
            .filter(url => url.trim().length > 0)
            .map(url => toFullUrl(url));
        } else if (typeof rawImages === 'string' && rawImages.trim().length > 0) {
          imagesList = [toFullUrl(rawImages)];
        }

        // ── Floor image: safe string extraction ──────────────────────────
        let floorImageUrl = '';
        const rawFloor = p.floor_image || p.floorImage;
        const floorStr = getRawUrl(rawFloor);

        if (floorStr.trim().length > 0) {
          floorImageUrl = toFullUrl(floorStr);
        } else if (imagesList.length > 0) {
          floorImageUrl = imagesList[0];
        }

        // ── Blueprint: safe string extraction ────────────────────────────
        let blueprintUrl = '';
        const rawBP = p.blueprint || (Array.isArray(p.blueprints) ? p.blueprints[0] : '');
        const bpStr = getRawUrl(rawBP);
        if (bpStr.trim().length > 0) {
          blueprintUrl = toFullUrl(bpStr);
        }

        // ── Floor plans: safe image extraction ───────────────────────────
        const floorPlans = parseJsonArray(p.floor_plans).map((fp: any) => ({
          ...fp,
          floor_image: fp.floor_image ? toFullUrl(getRawUrl(fp.floor_image)) : ''
        }));


        return {
          ...p,
          id: String(p.id),
          contact_name: p.contact_name || p.contactname || '',
          estimated_value: p.estimated_value || p.estimatedvalue || null,
          status: parseStatus(p.status),
          floor_image: floorImageUrl,
          blueprint: blueprintUrl,
          floor_plans: floorPlans,
          company: parseJsonArray(p.company),
          connectivity: parseJsonArray(p.connectivity),
          lifestyle: parseJsonArray(p.lifestyle),
          images: imagesList,
          features: p.features || '',
          virtual_tour_url: p.virtual_tour_url || '',
        };
      });

      console.log('Mapped properties:', mappedProperties);
      console.log('Properties count:', mappedProperties.length);
      setProperties(mappedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    }
  };

  /** Convert a File object to a base64-encoded data string (with MIME prefix). */
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleSaveProperty = async (property: Property, files: { blueprint?: File; floor_image?: File; images?: File[] }) => {
    try {
      const url = editingProperty ? UPDATE_PROPERTY_URL : ADD_PROPERTY_URL;
      const token = localStorage.getItem('token');

      // ── Convert every image file to a base64 string ──────────────────────
      let imagesBase64: string[] = [];
      if (files.images && files.images.length > 0) {
        imagesBase64 = await Promise.all(files.images.map(fileToBase64));
      }

      // Convert other files to base64 if present
      const blueprintBase64 = files.blueprint ? await fileToBase64(files.blueprint) : '';
      const floorImageBase64 = files.floor_image ? await fileToBase64(files.floor_image) : '';

      // ── Build JSON payload using EXACT field names the API returns ────────
      //
      // ── Helper: strip base URL and trim whitespace to keep DB paths relative ─
      const cleanPath = (url: any): string => {
        if (typeof url !== 'string' || !url) return '';
        let clean = url.trim();
        if (clean.startsWith(IMAGE_BASE_URL)) {
          clean = clean.replace(IMAGE_BASE_URL, '');
        }
        return clean;
      };

      // Clean existing images and blueprints of any trailing newlines/whitespace.
      // Filter out 'blob:' URLs which were only for local preview.
      const cleanExistingImages = (property.images || [])
        .filter(img => typeof img === 'string' && !img.startsWith('blob:'))
        .map(cleanPath);

      const cleanExistingBlueprints = (Array.isArray(property.blueprints) ? property.blueprints : [property.blueprint])
        .filter(b => b && typeof b === 'string' && !b.startsWith('blob:'))
        .map(cleanPath);

      // Clean floor plan images back to relative paths
      const cleanFloorPlans = (property.floor_plans || []).map(fp => ({
        ...fp,
        floor_image: cleanPath(fp.floor_image)
      }));

      const payload = {
        id: String(property.id || ''),
        title: property.title || '',
        location: property.location || '',
        price: property.price !== null ? String(property.price) : "0",
        no_of_beds: property.no_of_beds ?? 0,
        no_of_bath: property.no_of_bath ?? 0,
        sq_ft: property.sq_ft ?? 0,
        description: property.description || '',
        floor_bedroom: property.floor_bedroom ?? 0,
        size: String(property.size || ''),
        contact_name: property.contact_name || '',
        email: property.email || '',
        phone: property.phone || '',
        estimated_value: property.estimated_value !== null ? String(property.estimated_value) : "0",
        virtual_tour_url: property.virtual_tour_url || '',
        features: property.features || '',
        status: property.status === 'active' ? 1 : property.status === 'inactive' ? 2 : 3,

        // ── Array fields: Send as actual arrays in the JSON body ────────────────
        company: Array.isArray(property.company) ? property.company : [],
        connectivity: Array.isArray(property.connectivity) ? property.connectivity : [],
        lifestyle: Array.isArray(property.lifestyle) ? property.lifestyle : [],
        floor_plans: cleanFloorPlans,

        // ── File fields ─────────────────────────────────────────────────────
        images: [...cleanExistingImages, ...imagesBase64],
        blueprint: blueprintBase64 || (cleanExistingBlueprints.length > 0 ? cleanExistingBlueprints[0] : ''),
        blueprints: blueprintBase64 ? [blueprintBase64, ...cleanExistingBlueprints] : cleanExistingBlueprints,

        floor_image: floorImageBase64 || cleanPath(property.floor_image),
        floorImage: floorImageBase64 || cleanPath(property.floor_image),
      };

      console.group('🚀 API Request Debug');
      console.log('Endpoint:', url);
      console.log('Final Payload (JSON):', JSON.stringify(payload, null, 2));
      console.log('Images Count:', imagesBase64.length + cleanExistingImages.length);
      console.groupEnd();

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Save response:', data);

      if (response.ok || data.status) {
        if (editingProperty && property.status && property.id && property.status !== editingProperty.status) {
          await handleStatusChange(String(property.id), property.status);
        }

        alert(editingProperty ? 'Property updated successfully!' : 'Property added successfully!');
        setIsModalOpen(false);
        setEditingProperty(null);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchProperties();
      } else {
        console.error('Save failed:', data);
        alert('Failed to save property: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Error: ' + error);
    }
  };

  const handleStatusChange = async (id: string, status: 'active' | 'inactive' | 'soldout') => {
    setProperties(properties.map(p => p.id === id ? { ...p, status } : p));

    try {
      const token = localStorage.getItem('token');

      let statusNumber = 1;
      if (status === 'active') statusNumber = 1;
      else if (status === 'inactive') statusNumber = 2;
      else if (status === 'soldout') statusNumber = 3;

      console.log('Changing status for ID:', id, 'to:', status, 'number:', statusNumber);

      const response = await fetch(STATUS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token || ''
        },
        body: JSON.stringify({ id, status: statusNumber })
      });

      const data = await response.json();
      console.log('Status change response:', data);

      if (!response.ok && !data.status) {
        console.warn('Backend status update failed, but frontend updated:', data.message);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleRemoveProperty = async (id: string) => {
    if (confirm('Are you sure you want to remove this property?')) {
      setProperties(properties.filter(p => p.id !== id));
    }
  };

  const handleEditClick = async (p: Property) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${GET_PROPERTY_DETAIL_URL}?id=${p.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      const data = await response.json();
      console.log('Single property data:', data);

      const propertyData = data.property || data.data || (Array.isArray(data) ? data[0] : data);

      let statusString = 'active';
      if (propertyData.status === 1 || propertyData.status === '1') statusString = 'active';
      else if (propertyData.status === 2 || propertyData.status === '2') statusString = 'inactive';
      else if (propertyData.status === 3 || propertyData.status === '3') statusString = 'soldout';
      else if (typeof propertyData.status === 'string') statusString = propertyData.status;


      // ── Helper: resolve path to full URL and strip trailing whitespace ──────
      const toFullUrl = (path: string): string => {
        if (!path) return '';
        const cleaned = path.trim(); // strips \n, \r\n
        if (cleaned.startsWith('http') || cleaned.startsWith('data:')) return cleaned;
        let clean = cleaned.replace(/^\/+/, '');
        if (clean.startsWith('api/')) clean = clean.slice(4);
        return IMAGE_BASE_URL + clean;
      };

      const getRawUrl = (val: any): string => {
        if (typeof val === 'string') return val;
        if (val && typeof val === 'object' && val.url) return String(val.url);
        if (val && typeof val === 'object' && val.image) return String(val.image);
        if (val && typeof val === 'object' && val.file) return String(val.file);
        return '';
      };

      const parseArr = (val: any): any[] => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') { try { return JSON.parse(val || '[]'); } catch { return []; } }
        return [];
      };

      // ── Images: prefer 'images', fallback to 'blueprints', trim whitespace ──
      const rawImgs = propertyData.images || propertyData.blueprints || [];
      const editImages: string[] = Array.isArray(rawImgs)
        ? rawImgs
          .map(img => getRawUrl(img))
          .filter(url => url.trim().length > 0)
          .map(url => toFullUrl(url))
        : [];

      // ── Blueprint: prefer 'blueprint', fallback to first of 'blueprints' ──
      const rawBP = propertyData.blueprint || (Array.isArray(propertyData.blueprints) ? propertyData.blueprints[0] : '');
      const editBlueprint = getRawUrl(rawBP) ? toFullUrl(getRawUrl(rawBP)) : '';

      // ── Floor image ───────────────────────────────────────────────────────
      const getFloorImage = (p: any) => {
        const raw = p.floor_image || p.floorImage;
        const str = getRawUrl(raw);
        if (str.trim().length > 0) return toFullUrl(str);
        return editImages.length > 0 ? editImages[0] : '';
      };

      const editFloorImage = getFloorImage(propertyData);

      const mappedProperty = {
        ...propertyData,
        contact_name: propertyData.contact_name || propertyData.contactname || '',
        estimated_value: propertyData.estimated_value || propertyData.estimatedvalue || 0,
        status: statusString,
        floor_image: editFloorImage,
        blueprint: editBlueprint,
        virtual_tour_url: propertyData.virtual_tour_url || '',
        features: propertyData.features || '',
        floor_plans: parseArr(propertyData.floor_plans).map((fp: any) => ({
          ...fp,
          floor_image: fp.floor_image ? toFullUrl(getRawUrl(fp.floor_image)) : ''
        })),
        company: parseArr(propertyData.company),
        connectivity: parseArr(propertyData.connectivity),
        lifestyle: parseArr(propertyData.lifestyle),
        images: editImages,
      };

      setEditingProperty(mappedProperty);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching single property:', error);
      setEditingProperty(p);
      setIsModalOpen(true);
    }
  };

  const handleAddClick = () => {
    setEditingProperty(null);
    setIsModalOpen(true);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <>
      <MainPage
        properties={properties}
        onAdd={handleAddClick}
        onEdit={handleEditClick}
        onRemove={handleRemoveProperty}
        onStatusChange={handleStatusChange}
        onLogout={() => {
          setIsLoggedIn(false);
          localStorage.removeItem('token');
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProperty ? "Update Property" : "Add New Property"}
      >
        <PropertyForm
          initialData={editingProperty}
          onSubmit={handleSaveProperty}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
