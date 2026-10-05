// DIPTA - Header Component (Responsive Mobile & Desktop with Sidebar Toggle)
import React from 'react';
import { User } from '../types';
import { DiptaStorageService } from '../services/dataStorage';
import {
  Shield,
  AlertTriangle,
  UserCheck,
  ChevronDown,
  Trash2,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Globe,
  Database
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onUserChange: (user: User) => void;
  openIssuesCount: number;
  onNavigateToQuality: () => void;
  onResetData: () => void;
  onOpenDatabase?: () => void;
  onOpenVercel?: () => void;
  onLogout?: () => void;
  isMobileSidebarOpen?: boolean;
  isDesktopSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onUserChange,
  openIssuesCount,
  onNavigateToQuality,
  onResetData,
  onOpenDatabase,
  onOpenVercel,
  onLogout,
  isMobileSidebarOpen = false,
  isDesktopSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const allUsers = DiptaStorageService.getAllUsers();
  const [showUserDropdown, setShowUserDropdown] = React.useState(false);

  return (
    <header
      id="dipta-header"
      className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Left: Sidebar Toggle Button + Logo & Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {onToggleSidebar && (
              <button
                id="header-btn-toggle-sidebar"
                type="button"
                onClick={onToggleSidebar}
                aria-label="Toggle Menu Navigasi Sidebar"
                title="Buka / Tutup Menu Navigasi Sidebar"
                className="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 transition-colors shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600"
              >
                {/* Mobile icon */}
                <span className="lg:hidden">
                  {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </span>
                {/* Desktop icon */}
                <span className="hidden lg:inline-flex">
                  {isDesktopSidebarCollapsed ? (
                    <PanelLeftOpen className="w-5 h-5" />
                  ) : (
                    <PanelLeftClose className="w-5 h-5" />
                  )}
                </span>
              </button>
            )}

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shadow-xs p-0.5 shrink-0">
              <img
                src="/logo-dipta.jpg"
                alt="Logo DIPTA DPMPTSP OKI"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('logo-dipta.png')) {
                    target.src = '/logo-dipta.png';
                  }
                }}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
                  DIPTA
                </h1>
                <span className="hidden md:inline-block text-[11px] text-emerald-700 font-medium">
                  · Kabupaten Ogan Komering Ilir
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-none mt-0.5 truncate">
                Dashboard Integrasi Pelayanan Terpadu DPMPTSP
              </p>
            </div>
          </div>

          {/* Right: Info & User Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick Deploy Vercel & GitHub Button */}
            {onOpenVercel && (
              <button
                id="header-btn-vercel"
                type="button"
                onClick={onOpenVercel}
                title="Buka Pusat Deployment GitHub & Domain Publik Vercel"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold text-indigo-800 transition-colors cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span className="hidden sm:inline">Deploy (Vercel & GitHub)</span>
              </button>
            )}

            {/* Quick Database Cloud Button */}
            {onOpenDatabase && (
              <button
                id="header-btn-database"
                type="button"
                onClick={onOpenDatabase}
                title="Buka Konfigurasi & Sinkronisasi Supabase Cloud"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden md:inline">Supabase</span>
              </button>
            )}

            {/* Open Data Quality Alert Button */}
            {openIssuesCount > 0 && (
              <button
                id="header-btn-quality-alert"
                onClick={onNavigateToQuality}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-xs font-semibold text-amber-800 transition-colors cursor-pointer"
                title="Lihat data yang memerlukan verifikasi"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="hidden sm:inline">Perlu Verifikasi:</span>
                <span className="font-mono font-bold text-amber-900">
                  {openIssuesCount}
                </span>
              </button>
            )}

            {/* Quick Clear Dummy Data */}
            <button
              id="header-btn-reset-data"
              onClick={onResetData}
              title="Hapus / Kosongkan Seluruh Data Dummy & Hasil Import"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* RBAC Role Switcher & User Profile */}
            <div className="relative">
              <button
                id="header-btn-user-profile"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold text-xs shrink-0">
                  {currentUser.full_name.charAt(0)}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-slate-800 leading-tight max-w-[140px] truncate">
                    {currentUser.full_name}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5" />
                    <span className="truncate max-w-[120px]">{currentUser.role_name}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div
                    id="user-switch-dropdown"
                    className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-lg border border-slate-200 p-2 z-50 text-xs"
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-700">
                        Simulasi Pengguna / Role (RBAC)
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Pilih profil untuk menguji batasan hak akses sesuai PRD:
                      </p>
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1 space-y-1">
                      {allUsers.map(u => {
                        const isSelected = u.user_id === currentUser.user_id;
                        return (
                          <button
                            key={u.user_id}
                            id={`select-user-${u.username}`}
                            onClick={() => {
                              onUserChange(u);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-start gap-2 ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-900 font-medium border border-emerald-200'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className="mt-0.5">
                              {isSelected ? (
                                <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{u.full_name}</div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {u.role_name} · {u.jabatan}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {onLogout && (
                      <div className="pt-2 mt-1 border-t border-slate-100">
                        <button
                          id="header-btn-logout"
                          onClick={() => {
                            setShowUserDropdown(false);
                            onLogout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg text-rose-700 hover:bg-rose-50 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Keluar dari Sistem (Logout)</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Quick Header Logout Button */}
            {onLogout && (
              <button
                id="header-quick-logout"
                onClick={onLogout}
                title="Keluar dari Sistem (Logout)"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
