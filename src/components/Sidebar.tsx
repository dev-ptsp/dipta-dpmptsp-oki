// DIPTA - Information Architecture Navigation Sidebar (Responsive Mobile Drawer & Desktop Collapsible)
import React from 'react';
import { User } from '../types';
import { DiptaStorageService } from '../services/dataStorage';
import {
  LayoutDashboard,
  Eye,
  BarChart3,
  CheckCircle,
  UploadCloud,
  History,
  Settings,
  ChevronRight,
  Sparkles,
  FileText,
  Database,
  LogOut,
  Globe,
  X,
  PanelLeftClose
} from 'lucide-react';

export type ActiveView =
  | 'executive_dashboard'
  | 'ai_insight'
  | 'monitoring_all'
  | 'monitoring_oss'
  | 'monitoring_sicantik'
  | 'monitoring_simbg'
  | 'analytics_oss'
  | 'analytics_sicantik'
  | 'analytics_simbg'
  | 'laporan_bulanan'
  | 'laporan_mingguan'
  | 'laporan_tanggal'
  | 'data_recap'
  | 'data_quality'
  | 'import_data'
  | 'audit_history'
  | 'administration';

interface SidebarProps {
  activeView: ActiveView;
  onNavigate: (view: ActiveView, tab?: 'USERS' | 'ROLES' | 'MAPPING' | 'KECAMATAN' | 'DATABASE' | 'VERCEL') => void;
  currentUser: User;
  qualityIssuesCount: number;
  onLogout?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isDesktopCollapsed?: boolean;
  onToggleDesktopCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onNavigate,
  currentUser,
  qualityIssuesCount,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
  isDesktopCollapsed = false,
  onToggleDesktopCollapse
}) => {
  const role = currentUser.role_code;
  const canImport = DiptaStorageService.canUser(role, 'import');
  const canAdmin = DiptaStorageService.canUser(role, 'admin');

  const [expandedSections, setExpandedSections] = React.useState<{ [key: string]: boolean }>({
    monitoring: true,
    analytics: false,
    laporan: true
  });

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNavClick = (
    view: ActiveView,
    tab?: 'USERS' | 'ROLES' | 'MAPPING' | 'KECAMATAN' | 'DATABASE' | 'VERCEL'
  ) => {
    onNavigate(view, tab);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const isMonitoringActive = activeView.startsWith('monitoring_');
  const isAnalyticsActive = activeView.startsWith('analytics_');
  const isLaporanActive = activeView.startsWith('laporan_') || activeView === 'data_recap';

  return (
    <>
      {/* Mobile Backdrop Scrim */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        id="dipta-sidebar"
        aria-label="Navigasi Utama DIPTA"
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 transform transition-transform duration-200 ease-out lg:static lg:z-auto lg:min-h-[calc(100vh-4rem)] ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${
          isDesktopCollapsed
            ? 'lg:w-0 lg: -translate-x-full lg:overflow-hidden lg:border-r-0'
            : 'lg:w-64 lg:translate-x-0'
        }`}
      >
        {/* Top Banner Tagline & Official Logo */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <img
                src="/logo-dipta.jpg"
                alt="Logo DIPTA"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('logo-dipta.png')) target.src = '/logo-dipta.png';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white tracking-tight">
                <span>DIPTA</span>
                <span className="text-[10px] text-emerald-400 font-semibold">· OKI</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Dashboard Terpadu DPMPTSP
              </p>
            </div>
          </div>

          {/* Close Button on Mobile / Collapse Button on Desktop */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Tutup Menu Navigasi"
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {onToggleDesktopCollapse && (
            <button
              type="button"
              onClick={onToggleDesktopCollapse}
              title="Sembunyikan Sidebar"
              className="hidden lg:inline-flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Tree (PRD Section 9) */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto text-xs">
          {/* 1. Dashboard Eksekutif */}
          <button
            id="nav-executive-dashboard"
            onClick={() => handleNavClick('executive_dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-medium cursor-pointer ${
              activeView === 'executive_dashboard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dashboard Eksekutif</span>
            </div>
          </button>

          {/* 2. AI Insight Eksekutif */}
          <button
            id="nav-ai-insight"
            onClick={() => handleNavClick('ai_insight')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-medium cursor-pointer ${
              activeView === 'ai_insight'
                ? 'bg-indigo-600 text-white shadow-xs ring-1 ring-indigo-400'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>AI Insight Eksekutif</span>
            </div>
            <span className="text-[10px] text-amber-300 font-semibold">
              AI
            </span>
          </button>

          {/* 3. Monitoring Pelayanan (Accordion) */}
          <div>
            <button
              id="nav-monitoring-parent"
              onClick={() => toggleSection('monitoring')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors font-medium cursor-pointer ${
                isMonitoringActive
                  ? 'bg-slate-800/80 text-emerald-400'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Eye className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Monitoring Pelayanan</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform text-slate-400 ${
                  expandedSections.monitoring ? 'rotate-90' : ''
                }`}
              />
            </button>

            {expandedSections.monitoring && (
              <div className="pl-6 pt-1 pb-1 space-y-1 border-l border-slate-800 ml-5 mt-1">
                <button
                  id="nav-monitoring-all"
                  onClick={() => handleNavClick('monitoring_all')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                    activeView === 'monitoring_all'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>Seluruh Sumber</span>
                </button>
                <button
                  id="nav-monitoring-oss"
                  onClick={() => handleNavClick('monitoring_oss')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                    activeView === 'monitoring_oss'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>OSS-RBA</span>
                </button>
                <button
                  id="nav-monitoring-sicantik"
                  onClick={() => handleNavClick('monitoring_sicantik')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                    activeView === 'monitoring_sicantik'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>SICANTIK Cloud</span>
                </button>
                <button
                  id="nav-monitoring-simbg"
                  onClick={() => handleNavClick('monitoring_simbg')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                    activeView === 'monitoring_simbg'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>SIMBG PBG/SLF</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Analitik Sumber (Accordion) */}
          <div>
            <button
              id="nav-analytics-parent"
              onClick={() => toggleSection('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors font-medium cursor-pointer ${
                isAnalyticsActive
                  ? 'bg-slate-800/80 text-indigo-400'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Analitik Sumber</span>
              </div>
              <ChevronRight
                className={`w-3.5 h-3.5 transition-transform text-slate-400 ${
                  expandedSections.analytics ? 'rotate-90' : ''
                }`}
              />
            </button>

            {expandedSections.analytics && (
              <div className="pl-6 pt-1 pb-1 space-y-1 border-l border-slate-800 ml-5 mt-1">
                <button
                  id="nav-analytics-oss"
                  onClick={() => handleNavClick('analytics_oss')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                    activeView === 'analytics_oss'
                      ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>Analitik OSS (NIB/Proyek/Izin)</span>
                </button>
                <button
                  id="nav-analytics-sicantik"
                  onClick={() => handleNavClick('analytics_sicantik')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                    activeView === 'analytics_sicantik'
                      ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>Analitik SICANTIK & SLA</span>
                </button>
                <button
                  id="nav-analytics-simbg"
                  onClick={() => handleNavClick('analytics_simbg')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                    activeView === 'analytics_simbg'
                      ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>Analitik SIMBG (PBG/SLF)</span>
                </button>
              </div>
            )}
          </div>

          {/* 5. Menu Laporan */}
          <div>
            <div
              className={`w-full flex items-center justify-between rounded-lg transition-colors font-medium ${
                isLaporanActive
                  ? 'bg-emerald-600/20 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <button
                id="nav-laporan-parent"
                type="button"
                onClick={() => {
                  setExpandedSections(prev => ({ ...prev, laporan: true }));
                  handleNavClick('laporan_bulanan');
                }}
                className="flex-1 flex items-center gap-2.5 px-3 py-2.5 text-left cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Laporan Pelayanan</span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection('laporan');
                }}
                aria-label="Toggle Submenu Laporan"
                className="px-2.5 py-2.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform ${
                    expandedSections.laporan ? 'rotate-90' : ''
                  }`}
                />
              </button>
            </div>

            {expandedSections.laporan && (
              <div className="pl-6 pt-1 pb-1 space-y-1 border-l border-slate-800 ml-5 mt-1">
                <button
                  id="nav-laporan-bulanan"
                  onClick={() => handleNavClick('laporan_bulanan')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                    activeView === 'laporan_bulanan'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>Laporan Periode Bulanan</span>
                </button>
                <button
                  id="nav-laporan-mingguan"
                  onClick={() => handleNavClick('laporan_mingguan')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                    activeView === 'laporan_mingguan'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>Laporan Periode Mingguan</span>
                </button>
                <button
                  id="nav-laporan-tanggal"
                  onClick={() => handleNavClick('laporan_tanggal')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                    activeView === 'laporan_tanggal'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>Filter Berdasarkan Tanggal</span>
                </button>
                <button
                  id="nav-data-recap"
                  onClick={() => handleNavClick('data_recap')}
                  className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-xs transition-colors cursor-pointer ${
                    activeView === 'data_recap'
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span>Data & Rekapitulasi Induk</span>
                </button>
              </div>
            )}
          </div>

          {/* 6. Data Quality */}
          <button
            id="nav-data-quality"
            onClick={() => handleNavClick('data_quality')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors font-medium cursor-pointer ${
              activeView === 'data_quality'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Data Quality</span>
            </div>
            {qualityIssuesCount > 0 && (
              <span className="font-mono text-[11px] font-bold text-amber-300">
                {qualityIssuesCount}
              </span>
            )}
          </button>

          {/* 7. Modul Import Data */}
          {canImport ? (
            <button
              id="nav-import-data"
              onClick={() => handleNavClick('import_data')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors font-medium cursor-pointer ${
                activeView === 'import_data'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Import 5 Dataset</span>
            </button>
          ) : (
            <div className="px-3 py-2 text-[11px] text-slate-500 italic flex items-center gap-2 opacity-60">
              <UploadCloud className="w-3.5 h-3.5 shrink-0" />
              <span>Import Data (Terkunci)</span>
            </div>
          )}

          {/* 8. Riwayat Pembaruan */}
          <button
            id="nav-audit-history"
            onClick={() => handleNavClick('audit_history')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors font-medium cursor-pointer ${
              activeView === 'audit_history'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <History className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Riwayat & Audit Trail</span>
          </button>

          {/* 9. Administrasi & RBAC */}
          {canAdmin ? (
            <button
              id="nav-administration"
              onClick={() => handleNavClick('administration')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors font-medium cursor-pointer ${
                activeView === 'administration'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Administrasi & RBAC</span>
            </button>
          ) : (
            <button
              id="nav-administration-view-only"
              onClick={() => handleNavClick('administration')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors font-medium cursor-pointer ${
                activeView === 'administration'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Info Role & Master</span>
            </button>
          )}

          {/* 10. Database Cloud Supabase */}
          <button
            id="nav-database-supabase"
            onClick={() => handleNavClick('administration', 'DATABASE')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white group border border-slate-800/60 mt-1 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-400 group-hover:scale-105 transition-transform shrink-0" />
              <span className="text-[11px]">Database Supabase</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          {/* 11. Deployment Vercel */}
          <button
            id="nav-deployment-vercel"
            onClick={() => handleNavClick('administration', 'VERCEL')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors font-medium text-slate-300 hover:bg-slate-800/70 hover:text-white group border border-slate-800/60 mt-1 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="w-4 h-4 text-indigo-400 group-hover:scale-105 transition-transform shrink-0" />
              <span className="text-[11px]">Domain & Vercel</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
          </button>
        </nav>

        {/* Footer / Authority info & Logout */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 space-y-2.5">
          <div>
            <div className="font-semibold text-slate-300">DPMPTSP Kab. OKI</div>
            <div className="text-slate-400 mt-0.5">Project Leader: Eva Kaparina, S.Sos</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Satu Data · Satu Kendali</div>
          </div>

          {onLogout && (
            <button
              id="sidebar-btn-logout"
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
                onLogout();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors text-xs font-semibold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar / Ganti Akun</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
