// DIPTA - Unified Global Filter Bar (Responsive Mobile Collapsible & Desktop Grid)
import React, { useState } from 'react';
import { GlobalFilter } from '../../types';
import { OKI_KECAMATAN_LIST } from '../../data/initialData';
import {
  Filter,
  Search,
  RotateCcw,
  Calendar,
  Layers,
  Activity,
  MapPin,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface GlobalFilterBarProps {
  filters: GlobalFilter;
  onFilterChange: (newFilters: GlobalFilter) => void;
  availableServices?: string[];
  totalFilteredCount: number;
  totalAllCount: number;
}

export const GlobalFilterBar: React.FC<GlobalFilterBarProps> = ({
  filters,
  onFilterChange,
  availableServices = [],
  totalFilteredCount,
  totalAllCount
}) => {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const handleReset = () => {
    onFilterChange({
      periode_start: '',
      periode_end: '',
      sumber_aplikasi: 'SEMUA',
      jenis_layanan: 'SEMUA',
      status_dipta: 'SEMUA',
      kecamatan: 'SEMUA',
      search_query: ''
    });
  };

  const isFiltered =
    filters.sumber_aplikasi !== 'SEMUA' ||
    filters.status_dipta !== 'SEMUA' ||
    filters.jenis_layanan !== 'SEMUA' ||
    filters.kecamatan !== 'SEMUA' ||
    Boolean(filters.periode_start) ||
    Boolean(filters.periode_end) ||
    Boolean(filters.search_query);

  return (
    <div
      id="global-filter-container"
      className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs mb-4 sm:mb-6 transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-slate-800 font-semibold text-xs sm:text-sm">
          <Filter className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Filter Data Konsolidasi</span>
          {isFiltered && (
            <span className="text-[11px] font-medium text-emerald-700">
              · Menampilkan {totalFilteredCount} dari {totalAllCount} transaksi
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isFiltered && (
            <button
              id="btn-reset-filters"
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors font-medium px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Mobile Toggle Button for Filter Controls */}
          <button
            type="button"
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="md:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer"
          >
            <span>{isMobileExpanded ? 'Tutup Filter' : 'Buka Filter'}</span>
            {isMobileExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Quick Search on Mobile when Collapsed */}
      {!isMobileExpanded && (
        <div className="pt-2.5 md:hidden">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filters.search_query || ''}
              onChange={e => onFilterChange({ ...filters, search_query: e.target.value })}
              placeholder="Cari NIB, ID permohonan, nama pemohon, atau kecamatan..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-700"
            />
          </div>
        </div>
      )}

      <div
        className={`${
          isMobileExpanded ? 'grid' : 'hidden md:grid'
        } grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3`}
      >
        {/* Periode Bulan */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Periode Data</span>
          </label>
          <div className="flex gap-1.5">
            <input
              id="filter-periode-start"
              type="month"
              value={filters.periode_start || ''}
              onChange={e => onFilterChange({ ...filters, periode_start: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-700"
              placeholder="Dari"
            />
          </div>
        </div>

        {/* Sumber Aplikasi */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Sumber Aplikasi</span>
          </label>
          <select
            id="filter-sumber-aplikasi"
            value={filters.sumber_aplikasi}
            onChange={e => onFilterChange({ ...filters, sumber_aplikasi: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-700"
          >
            <option value="SEMUA">Semua Sumber</option>
            <option value="OSS-RBA">OSS-RBA</option>
            <option value="SICANTIK">SICANTIK Cloud</option>
            <option value="SIMBG">SIMBG PBG/SLF</option>
          </select>
        </div>

        {/* Status DIPTA */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>Status DIPTA</span>
          </label>
          <select
            id="filter-status-dipta"
            value={filters.status_dipta}
            onChange={e => onFilterChange({ ...filters, status_dipta: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-700"
          >
            <option value="SEMUA">Semua Status</option>
            <option value="SELESAI_TERBIT">Selesai / Terbit</option>
            <option value="DALAM_PROSES">Dalam Proses</option>
            <option value="DITOLAK">Ditolak</option>
            <option value="BELUM_DIKLASIFIKASIKAN">Belum Diklasifikasikan</option>
          </select>
        </div>

        {/* Kecamatan di OKI */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>Kecamatan (OKI)</span>
          </label>
          <select
            id="filter-kecamatan"
            value={filters.kecamatan}
            onChange={e => onFilterChange({ ...filters, kecamatan: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-700"
          >
            <option value="SEMUA">Semua Kecamatan</option>
            {OKI_KECAMATAN_LIST.map(kec => (
              <option key={kec} value={kec}>
                {kec}
              </option>
            ))}
          </select>
        </div>

        {/* Jenis Layanan */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
            <span>Jenis Layanan</span>
          </label>
          <select
            id="filter-jenis-layanan"
            value={filters.jenis_layanan}
            onChange={e => onFilterChange({ ...filters, jenis_layanan: e.target.value })}
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-700 truncate"
          >
            <option value="SEMUA">Semua Jenis Layanan</option>
            {availableServices.map(srv => (
              <option key={srv} value={srv}>
                {srv}
              </option>
            ))}
          </select>
        </div>

        {/* Pencarian Teks */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mb-1">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Cari ID / Nama / No</span>
          </label>
          <div className="relative">
            <input
              id="filter-search-query"
              type="text"
              value={filters.search_query || ''}
              onChange={e => onFilterChange({ ...filters, search_query: e.target.value })}
              placeholder="Cari NIB, ID, nama..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
