
import React, { useState, useMemo, useEffect } from 'react';
import { Property } from '../types';
import {
  Building2, Plus, Search, LogOut, MapPin,
  Bed, Bath, Maximize, Edit2, Trash2, User, ChevronRight, LayoutDashboard,
  DollarSign, Home, TrendingUp, Filter, X, ArrowUpDown, Download, ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { IMAGE_BASE_URL } from '../constants/apiUrls';

interface MainPageProps {
  properties: Property[];
  onAdd: () => void;
  onEdit: (p: Property) => void;
  onRemove: (id: string) => void;
  onLogout: () => void;
  onStatusChange: (id: string, status: 'active' | 'inactive' | 'soldout') => void;
}

type ViewType = 'dashboard' | 'properties';

export const MainPage: React.FC<MainPageProps> = ({ properties, onAdd, onEdit, onRemove, onLogout, onStatusChange }) => {
  const [activeView, setActiveView] = useState<ViewType>('properties');
  const [searchTerm, setSearchTerm] = useState('');
  const [bedsFilter, setBedsFilter] = useState('');
  const [bathsFilter, setBathsFilter] = useState('');
  const [sortField, setSortField] = useState<keyof Property | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredProperties = useMemo(() => {
    let filtered = properties.filter(p =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (bedsFilter) filtered = filtered.filter(p => p.no_of_beds === bedsFilter);
    if (bathsFilter) filtered = filtered.filter(p => p.no_of_bath === bathsFilter);
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [properties, searchTerm, bedsFilter, bathsFilter, sortField, sortOrder]);

  const stats = useMemo(() => {
    const total = properties.length;
    const avgPrice = properties.reduce((sum, p) => sum + (parseFloat(p.price?.replace(/[^0-9.-]+/g, '') || '0')), 0) / total || 0;
    const totalValue = properties.reduce((sum, p) => sum + (parseFloat(p.estimated_value?.replace(/[^0-9.-]+/g, '') || '0')), 0);
    return { total, avgPrice, totalValue };
  }, [properties]);

  const handleSort = (field: keyof Property) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredProperties.slice(start, start + itemsPerPage);
  }, [filteredProperties, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProperties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProperties.map(p => p.id)));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Delete ${selectedIds.size} properties?`)) {
      selectedIds.forEach(id => onRemove(id));
      setSelectedIds(new Set());
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Location', 'Price', 'Beds', 'Baths', 'Sq Ft', 'Estimated Value', 'Contact', 'Email'];
    const rows = filteredProperties.map(p => [
      p.id, p.title, p.location, p.price, p.no_of_beds, p.no_of_bath, p.sq_ft, p.estimated_value, p.contact_name, p.email
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'properties.csv';
    a.click();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedProperty) setSelectedProperty(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProperty]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, bedsFilter, bathsFilter]);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 text-slate-800 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-gradient-to-b from-slate-900 to-slate-800 flex flex-col shrink-0 text-slate-300 shadow-2xl animate-slide-in-left">
        <div className="p-4 lg:p-8">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg animate-pulse-slow">
              V
            </div>
            <span className="text-xl lg:text-2xl font-black text-white tracking-tighter">V5C ADMIN</span>
          </div>
        </div>

        <nav className="flex-1 px-2 lg:px-4 py-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Main Menu</div>

          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${activeView === 'dashboard' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/30' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className={`w-5 h-5 transition-transform ${activeView === 'dashboard' ? 'text-white rotate-0' : 'text-slate-400'}`} />
            <span className="font-bold">Dashboard</span>
            {activeView === 'dashboard' && <ChevronRight className="ml-auto w-4 h-4 animate-bounce-x" />}
          </button>

          <button
            onClick={() => setActiveView('properties')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${activeView === 'properties' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-900/30' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Building2 className={`w-5 h-5 transition-transform ${activeView === 'properties' ? 'text-white rotate-0' : 'text-slate-400'}`} />
            <span className="font-bold">View Properties</span>
            {activeView === 'properties' && <ChevronRight className="ml-auto w-4 h-4 animate-bounce-x" />}
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all text-slate-400 group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-500" />
            <span className="font-bold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-sm animate-slide-down">
          <div className="flex items-center gap-4 bg-gradient-to-r from-slate-50 to-indigo-50 px-3 lg:px-4 py-2 rounded-xl w-full lg:w-96 border border-slate-200 hover:border-indigo-300 transition-all focus-within:ring-2 focus-within:ring-indigo-200">
            <Search className="w-4 lg:w-5 h-4 lg:h-5 text-slate-400 animate-pulse-slow" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>

          <div className="hidden lg:flex items-center gap-4 animate-fade-in">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-800">Admin User</p>
              <p className="text-xs text-slate-400">Super Administrator</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full border-2 border-indigo-200 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
              <User className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-full">
            {activeView === 'dashboard' ? (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 animate-slide-in">Dashboard</h2>
                <p className="text-slate-500 text-sm mb-8 animate-slide-in" style={{ animationDelay: '0.1s' }}>Welcome back to your administration overview.</p>

                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:scale-105 hover:border-indigo-200 transition-all duration-300 cursor-pointer animate-scale-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg animate-float">
                        <Home className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-1">Total Properties</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.total}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 animate-slide-in">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Properties Listing</h2>
                    <p className="text-slate-500 text-sm">Manage and view all your property assets ({filteredProperties.length})</p>
                  </div>
                  <div className="flex gap-2">
                    {selectedIds.size > 0 && (
                      <button onClick={handleBulkDelete} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg animate-slide-in">
                        <Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})
                      </button>
                    )}
                    <button onClick={exportToCSV} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg">
                      <Download className="w-4 h-4 animate-bounce-slow" /> Export
                    </button>
                    <button onClick={onAdd} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all transform hover:scale-105 active:scale-95">
                      <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Add
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mb-6">
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select value={bedsFilter} onChange={(e) => setBedsFilter(e.target.value)} className="bg-transparent border-none outline-none text-sm">
                      <option value="">All Beds</option>
                      <option value="1">1 Bed</option>
                      <option value="2">2 Beds</option>
                      <option value="3">3 Beds</option>
                      <option value="4">4+ Beds</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <select value={bathsFilter} onChange={(e) => setBathsFilter(e.target.value)} className="bg-transparent border-none outline-none text-sm">
                      <option value="">All Baths</option>
                      <option value="1">1 Bath</option>
                      <option value="2">2 Baths</option>
                      <option value="3">3+ Baths</option>
                    </select>
                  </div>
                  {(bedsFilter || bathsFilter) && (
                    <button onClick={() => { setBedsFilter(''); setBathsFilter(''); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium transition-colors">
                      Clear Filters
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all duration-300 animate-scale-in">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-4">
                            <input type="checkbox" checked={selectedIds.size === paginatedProperties.length && paginatedProperties.length > 0} onChange={toggleSelectAll} className="w-4 h-4 rounded" />
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">ID</th>
                          <th onClick={() => handleSort('title')} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-indigo-600">
                            <div className="flex items-center gap-1">Title <ArrowUpDown className="w-3 h-3" /></div>
                          </th>
                          <th onClick={() => handleSort('location')} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-indigo-600">
                            <div className="flex items-center gap-1">Location <ArrowUpDown className="w-3 h-3" /></div>
                          </th>
                          <th onClick={() => handleSort('price')} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:text-indigo-600">
                            <div className="flex items-center gap-1">Price <ArrowUpDown className="w-3 h-3" /></div>
                          </th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Beds/Baths</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Sq Ft</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Estimated Val</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Contact</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {paginatedProperties.length === 0 ? (
                          <tr>
                            <td colSpan={11} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center gap-3 text-slate-400">
                                <Building2 className="w-16 h-16 text-slate-300" />
                                <p className="text-lg font-medium">No properties found</p>
                                <p className="text-sm">Try adjusting your filters or search terms</p>
                              </div>
                            </td>
                          </tr>
                        ) : paginatedProperties.map((p, idx) => {
                          const isInactive = p.status === 'inactive';
                          return (
                            <tr key={p.id} className={`hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 group animate-fade-in ${isInactive ? 'opacity-40' : ''}`} style={{ animationDelay: `${idx * 0.05}s` }}>
                              <td className="px-4 py-4">
                                <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="w-4 h-4 rounded" />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-400">#{p.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => setSelectedProperty(p)}>
                                <div className="flex items-center gap-3">
                                  {p.floor_image ? (
                                    <img src={p.floor_image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 group-hover:scale-110 transition-transform" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
                                      {p.title?.charAt(0) || 'P'}
                                    </div>
                                  )}
                                  <span className="font-bold text-slate-700">{p.title}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4 text-slate-400" />
                                  {p.location}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">{p.price}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                  <span className="flex items-center gap-1"><Bed className="w-4 h-4 text-slate-400" /> {p.no_of_beds}</span>
                                  <span className="flex items-center gap-1"><Bath className="w-4 h-4 text-slate-400" /> {p.no_of_bath}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                <div className="flex items-center gap-1">
                                  <Maximize className="w-4 h-4 text-slate-400" />
                                  {p.sq_ft} <span className="text-xs text-slate-400 font-normal ml-1">sq ft</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">{p.estimated_value}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-slate-700">{p.contact_name}</span>
                                  <span className="text-xs text-slate-400">{p.email}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${(p.status || 'active') === 'active' ? 'bg-green-100 text-green-700' :
                                  (p.status || 'active') === 'inactive' ? 'bg-gray-100 text-gray-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                  {(p.status || 'active') === 'active' ? 'Active' :
                                    (p.status || 'active') === 'inactive' ? 'Inactive' : 'Sold Out'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => onEdit(p)}
                                    className="p-2 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all hover:shadow-md transform hover:scale-110"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => onRemove(p.id)}
                                    className="p-2 hover:bg-red-100 text-red-500 rounded-lg transition-all hover:shadow-md transform hover:scale-110"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">Show</span>
                        <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="border border-slate-200 rounded-lg px-2 py-1 text-sm">
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                        </select>
                        <span className="text-sm text-slate-600">per page</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-slate-700">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {selectedProperty && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setSelectedProperty(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Property Details</h3>
              <button onClick={() => setSelectedProperty(null)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedProperty.floor_image && (
                <img src={selectedProperty.floor_image} alt="" className="w-full h-64 object-cover rounded-xl hover:scale-105 transition-transform duration-300" />
              )}
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-slate-500 text-sm">Title:</span><p className="font-bold">{selectedProperty.title}</p></div>
                <div><span className="text-slate-500 text-sm">Location:</span><p className="font-bold">{selectedProperty.location}</p></div>
                <div><span className="text-slate-500 text-sm">Price:</span><p className="font-bold text-indigo-600">{selectedProperty.price}</p></div>
                <div><span className="text-slate-500 text-sm">Estimated Value:</span><p className="font-bold">{selectedProperty.estimated_value}</p></div>
                <div><span className="text-slate-500 text-sm">Bedrooms:</span><p className="font-bold">{selectedProperty.no_of_beds}</p></div>
                <div><span className="text-slate-500 text-sm">Bathrooms:</span><p className="font-bold">{selectedProperty.no_of_bath}</p></div>
                <div><span className="text-slate-500 text-sm">Square Feet:</span><p className="font-bold">{selectedProperty.sq_ft}</p></div>
                <div><span className="text-slate-500 text-sm">Contact:</span><p className="font-bold">{selectedProperty.contact_name}</p></div>
                <div className="col-span-2"><span className="text-slate-500 text-sm">Email:</span><p className="font-bold">{selectedProperty.email}</p></div>
                <div className="col-span-2">
                  <span className="text-slate-500 text-sm">Status:</span>
                  <div className="mt-2">
                    <select
                      value={selectedProperty.status || 'active'}
                      onChange={(e) => onStatusChange(selectedProperty.id, e.target.value as 'active' | 'inactive' | 'soldout')}
                      className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all cursor-pointer w-full ${(selectedProperty.status || 'active') === 'active' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' :
                        (selectedProperty.status || 'active') === 'inactive' ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' :
                          'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                        }`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="soldout">Sold Out</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => { onEdit(selectedProperty); setSelectedProperty(null); }} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 rounded-xl transition-all transform hover:scale-105 active:scale-95">
                  Edit Property
                </button>
                <button onClick={() => { onRemove(selectedProperty.id); setSelectedProperty(null); }} className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2.5 rounded-xl transition-all transform hover:scale-105 active:scale-95">
                  Delete Property
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = `
  @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes slide-in-left { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slide-down { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
  @keyframes bounce-x { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
  @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
  @keyframes pulse-slow { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
  .animate-fade-in { animation: fade-in 0.5s ease-out; }
  .animate-slide-in { animation: slide-in 0.5s ease-out; }
  .animate-slide-in-left { animation: slide-in-left 0.5s ease-out; }
  .animate-slide-down { animation: slide-down 0.4s ease-out; }
  .animate-scale-in { animation: scale-in 0.4s ease-out; }
  .animate-float { animation: float 3s ease-in-out infinite; }
  .animate-bounce-x { animation: bounce-x 1s ease-in-out infinite; }
  .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
  .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
`;

if (typeof document !== 'undefined' && !document.getElementById('main-animations')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'main-animations';
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
