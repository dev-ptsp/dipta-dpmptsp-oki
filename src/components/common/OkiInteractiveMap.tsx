// DIPTA - Peta Interaktif Administrasi 18 Kecamatan Kabupaten Ogan Komering Ilir
// Menggunakan Poligon Wilayah Administrasi Kecamatan (ADMINISTRASIKECAMATAN_AR_50K.geojson) dengan Warna Berbeda Tiap Kecamatan & Pop-Up Data Pelayanan Berdasarkan Sumber Aplikasi
import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { DiptaRecord } from '../../types';
import {
  OKI_KECAMATAN_GEO,
  OKI_MAP_CENTER,
  OKI_DEFAULT_ZOOM,
  KecamatanGeo,
  resolveKecamatanFromFeatureProps
} from '../../data/okiGeodata';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Navigation,
  Map as MapIcon,
  Eye,
  EyeOff,
  Upload,
  CheckCircle2,
  Clock,
  XCircle,
  Layers,
  Building2,
  FileCheck2,
  Landmark,
  Filter
} from 'lucide-react';

interface OkiInteractiveMapProps {
  records: DiptaRecord[];
  onSelectKecamatan?: (kecamatan: string) => void;
  selectedKecamatan?: string;
}

type BaseMapStyle = 'clean' | 'osm' | 'satellite' | 'blank';

interface KecamatanServiceStats {
  total: number;
  oss: number;
  ossNib: number;
  ossKegiatan: number;
  ossIzin: number;
  sicantik: number;
  simbg: number;
  selesai: number;
  proses: number;
  ditolak: number;
  investasiTotal: number;
}

const CUSTOM_GEOJSON_STORAGE_KEY = 'dipta_custom_kecamatan_geojson_v1';

export const OkiInteractiveMap: React.FC<OkiInteractiveMapProps> = ({
  records,
  onSelectKecamatan,
  selectedKecamatan
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const labelMarkersRef = useRef<L.Marker[]>([]);
  const layerByKecNameRef = useRef<Record<string, L.Layer>>({});

  const [geoJsonData, setGeoJsonData] = useState<any | null>(null);
  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(true);
  const [geoSourceLabel, setGeoSourceLabel] = useState<string>('ADMINISTRASIKECAMATAN_AR_50K.geojson');
  const [baseMapStyle, setBaseMapStyle] = useState<BaseMapStyle>('clean');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [fillOpacity, setFillOpacity] = useState<number>(0.68);
  const [activeKecamatan, setActiveKecamatan] = useState<KecamatanGeo | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Aggregate service data per Kecamatan broken down by Sumber Aplikasi (OSS-RBA, SICANTIK, SIMBG) & Status DIPTA
  const statsByKecamatan = useMemo(() => {
    const stats: Record<string, KecamatanServiceStats> = {};

    OKI_KECAMATAN_GEO.forEach(k => {
      stats[k.name] = {
        total: 0,
        oss: 0,
        ossNib: 0,
        ossKegiatan: 0,
        ossIzin: 0,
        sicantik: 0,
        simbg: 0,
        selesai: 0,
        proses: 0,
        ditolak: 0,
        investasiTotal: 0
      };
    });

    records.forEach(r => {
      const rawKec = r.kecamatan?.trim() || '';
      const matchedGeo = resolveKecamatanFromFeatureProps({ name: rawKec });
      const kecKey = matchedGeo ? matchedGeo.name : rawKec;

      if (kecKey && stats[kecKey]) {
        stats[kecKey].total += 1;

        if (r.sumber_aplikasi === 'OSS-RBA') {
          stats[kecKey].oss += 1;
          if (r.jenis_dataset === 'OSS_NIB') stats[kecKey].ossNib += 1;
          else if (r.jenis_dataset === 'OSS_KEGIATAN') stats[kecKey].ossKegiatan += 1;
          else if (r.jenis_dataset === 'OSS_IZIN') stats[kecKey].ossIzin += 1;
        } else if (r.sumber_aplikasi === 'SICANTIK') {
          stats[kecKey].sicantik += 1;
        } else if (r.sumber_aplikasi === 'SIMBG') {
          stats[kecKey].simbg += 1;
        }

        if (r.status_dipta === 'SELESAI_TERBIT') stats[kecKey].selesai += 1;
        else if (r.status_dipta === 'DALAM_PROSES') stats[kecKey].proses += 1;
        else if (r.status_dipta === 'DITOLAK') stats[kecKey].ditolak += 1;

        if (r.investasi_rupiah && Number.isFinite(Number(r.investasi_rupiah))) {
          stats[kecKey].investasiTotal += Number(r.investasi_rupiah);
        }
      }
    });

    return stats;
  }, [records]);

  // Build HTML popup content when a Kecamatan polygon is clicked
  const buildPopupHtml = useCallback(
    (kec: KecamatanGeo, st: KecamatanServiceStats, extraProps?: Record<string, any>) => {
      const ossPct = st.total > 0 ? Math.round((st.oss / st.total) * 100) : 0;
      const sicantikPct = st.total > 0 ? Math.round((st.sicantik / st.total) * 100) : 0;
      const simbgPct = st.total > 0 ? Math.round((st.simbg / st.total) * 100) : 0;
      const jumlahDesa = extraProps?.JUMLAH_DESA ? `${extraProps.JUMLAH_DESA} Desa/Kelurahan` : `Ibu Kota: ${kec.capital}`;

      return `
        <div style="font-family: Inter, system-ui, sans-serif; color: #0f172a;">
          <!-- Header Warna Kecamatan -->
          <div style="background: linear-gradient(135deg, ${kec.color}, ${kec.borderColor}); color: #ffffff; padding: 12px 14px;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-right: 18px;">
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; background: rgba(255,255,255,0.22); padding: 2px 7px; border-radius: 999px;">
                Wilayah Kecamatan
              </span>
              <span style="font-size: 10px; opacity: 0.92; font-weight: 600;">
                ${kec.areaKm2} km²
              </span>
            </div>
            <div style="font-size: 15px; font-weight: 800; margin-top: 5px; line-height: 1.2;">
              Kec. ${kec.name}
            </div>
            <div style="font-size: 11px; opacity: 0.9; margin-top: 2px;">
              ${jumlahDesa} • Kab. Ogan Komering Ilir
            </div>
          </div>

          <!-- Body Statistik Berdasarkan Sumber Aplikasi -->
          <div style="padding: 12px 14px; background: #ffffff;">
            <!-- Total Pelayanan Banner -->
            <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 11px; margin-bottom: 10px;">
              <span style="font-size: 11px; font-weight: 700; color: #334155;">Total Data Pelayanan</span>
              <span style="font-size: 14px; font-weight: 800; color: ${kec.borderColor};">
                ${st.total.toLocaleString('id-ID')} Berkas
              </span>
            </div>

            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 6px;">
              Rincian Berdasarkan Sumber Aplikasi:
            </div>

            <!-- 1. OSS-RBA -->
            <div style="border: 1px solid #d1fae5; background: #ecfdf5; border-radius: 8px; padding: 7px 10px; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
                <span style="font-weight: 700; color: #065f46; display: flex; align-items: center; gap: 5px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
                  1. OSS-RBA (Perizinan Berusaha)
                </span>
                <strong style="color: #047857; font-size: 12px;">${st.oss.toLocaleString('id-ID')} (${ossPct}%)</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 10px; color: #047857; margin-top: 3px; padding-left: 13px;">
                <span>NIB: <b>${st.ossNib}</b></span>
                <span>Kegiatan: <b>${st.ossKegiatan}</b></span>
                <span>Izin: <b>${st.ossIzin}</b></span>
              </div>
            </div>

            <!-- 2. SICANTIK Cloud -->
            <div style="border: 1px solid #e0f2fe; background: #f0f9ff; border-radius: 8px; padding: 7px 10px; margin-bottom: 6px;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
                <span style="font-weight: 700; color: #075985; display: flex; align-items: center; gap: 5px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #0284c7; display: inline-block;"></span>
                  2. SICANTIK Cloud (Non-Berusaha)
                </span>
                <strong style="color: #0369a1; font-size: 12px;">${st.sicantik.toLocaleString('id-ID')} (${sicantikPct}%)</strong>
              </div>
            </div>

            <!-- 3. SIMBG -->
            <div style="border: 1px solid #fef3c7; background: #fffbeb; border-radius: 8px; padding: 7px 10px; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px;">
                <span style="font-weight: 700; color: #92400e; display: flex; align-items: center; gap: 5px;">
                  <span style="width: 8px; height: 8px; border-radius: 50%; background: #d97706; display: inline-block;"></span>
                  3. SIMBG (Bangunan Gedung PBG/SLF)
                </span>
                <strong style="color: #b45309; font-size: 12px;">${st.simbg.toLocaleString('id-ID')} (${simbgPct}%)</strong>
              </div>
            </div>

            <!-- Status DIPTA Mini Row -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; text-align: center; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 10px;">
              <div>
                <div style="color: #64748b;">Terbit</div>
                <div style="font-weight: 800; color: #059669; font-size: 11px;">${st.selesai}</div>
              </div>
              <div style="border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                <div style="color: #64748b;">Proses</div>
                <div style="font-weight: 800; color: #d97706; font-size: 11px;">${st.proses}</div>
              </div>
              <div>
                <div style="color: #64748b;">Ditolak</div>
                <div style="font-weight: 800; color: #e11d48; font-size: 11px;">${st.ditolak}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    },
    []
  );

  // Load default ADMINISTRASIKECAMATAN_AR_50K.geojson (or user-uploaded custom GeoJSON if saved)
  useEffect(() => {
    let isMounted = true;
    const loadGeoJson = async () => {
      setIsLoadingGeo(true);
      try {
        const savedCustom = localStorage.getItem(CUSTOM_GEOJSON_STORAGE_KEY);
        if (savedCustom) {
          const parsed = JSON.parse(savedCustom);
          if (parsed && Array.isArray(parsed.features) && parsed.features.length > 0) {
            if (isMounted) {
              setGeoJsonData(parsed);
              setGeoSourceLabel('Data Wilayah Kustom (ADMINISTRASIKECAMATAN_AR_50K.geojson)');
              setIsLoadingGeo(false);
            }
            return;
          }
        }
      } catch {
        // Ignore and load default public file
      }

      try {
        const res = await fetch('/ADMINISTRASIKECAMATAN_AR_50K.geojson');
        if (!res.ok) throw new Error('Gagal memuat ADMINISTRASIKECAMATAN_AR_50K.geojson');
        const data = await res.json();
        if (isMounted) {
          setGeoJsonData(data);
          setGeoSourceLabel('ADMINISTRASIKECAMATAN_AR_50K.geojson (18 Kecamatan Kab. OKI)');
        }
      } catch (err) {
        console.error('Failed loading GeoJSON:', err);
      } finally {
        if (isMounted) {
          setIsLoadingGeo(false);
        }
      }
    };

    loadGeoJson();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize Leaflet Map instance once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: OKI_MAP_CENTER,
      zoom: OKI_DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: true
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Manage Base Tile Layer switching
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }

    if (baseMapStyle === 'blank') {
      return;
    }

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    let attribution = '&copy; OpenStreetMap &copy; CARTO | Peta Administrasi Kecamatan Kab. OKI';

    if (baseMapStyle === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; OpenStreetMap contributors | Peta Administrasi Kecamatan Kab. OKI';
    } else if (baseMapStyle === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri | Peta Administrasi Kecamatan Kab. OKI';
    }

    const layer = L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution
    });
    layer.addTo(map);
    layer.bringToBack();
    tileLayerRef.current = layer;
  }, [baseMapStyle]);

  // Render GeoJSON Polygons with Distinct Kecamatan Colors + Click Popups + Labels
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !geoJsonData) return;

    // Remove previous GeoJSON layer & label markers
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
      geoJsonLayerRef.current = null;
    }
    labelMarkersRef.current.forEach(m => map.removeLayer(m));
    labelMarkersRef.current = [];
    layerByKecNameRef.current = {};

    const defaultZeroStats: KecamatanServiceStats = {
      total: 0,
      oss: 0,
      ossNib: 0,
      ossKegiatan: 0,
      ossIzin: 0,
      sicantik: 0,
      simbg: 0,
      selesai: 0,
      proses: 0,
      ditolak: 0,
      investasiTotal: 0
    };

    const geoLayer = L.geoJSON(geoJsonData, {
      style: (feature) => {
        const kec = resolveKecamatanFromFeatureProps(feature?.properties) || OKI_KECAMATAN_GEO[0];
        const isSelected =
          (selectedKecamatan && selectedKecamatan !== 'SEMUA' && selectedKecamatan === kec.name) ||
          activeKecamatan?.name === kec.name;

        return {
          fillColor: kec.color,
          fillOpacity: isSelected ? Math.min(fillOpacity + 0.2, 0.92) : fillOpacity,
          color: isSelected ? '#0f172a' : '#ffffff',
          weight: isSelected ? 3 : 1.6,
          opacity: 1,
          dashArray: isSelected ? '' : '1'
        };
      },
      onEachFeature: (feature, layer) => {
        const kec = resolveKecamatanFromFeatureProps(feature?.properties);
        if (!kec) return;

        layerByKecNameRef.current[kec.name] = layer;
        const st = statsByKecamatan[kec.name] || defaultZeroStats;

        // Bind rich popup showing service data by source application
        layer.bindPopup(buildPopupHtml(kec, st, feature.properties), {
          className: 'dipta-kecamatan-popup',
          maxWidth: 310,
          minWidth: 280,
          autoPanPadding: [24, 24]
        });

        // Bind hover tooltip
        layer.bindTooltip(
          `<div>
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${kec.color};margin-right:5px;"></span>
            <strong>Kec. ${kec.name}</strong> • ${st.total} Berkas (OSS: ${st.oss} | SICANTIK: ${st.sicantik} | SIMBG: ${st.simbg})
          </div>`,
          {
            sticky: true,
            direction: 'top',
            className: 'dipta-kecamatan-tooltip'
          }
        );

        layer.on({
          mouseover: (e) => {
            const target = e.target;
            target.setStyle({
              weight: 3,
              color: '#0f172a',
              fillOpacity: Math.min(fillOpacity + 0.18, 0.92)
            });
            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
              target.bringToFront();
            }
          },
          mouseout: (e) => {
            const isSelected =
              (selectedKecamatan && selectedKecamatan !== 'SEMUA' && selectedKecamatan === kec.name) ||
              activeKecamatan?.name === kec.name;
            e.target.setStyle({
              fillColor: kec.color,
              fillOpacity: isSelected ? Math.min(fillOpacity + 0.2, 0.92) : fillOpacity,
              color: isSelected ? '#0f172a' : '#ffffff',
              weight: isSelected ? 3 : 1.6
            });
          },
          click: (e) => {
            setActiveKecamatan(kec);
            const updatedStats = statsByKecamatan[kec.name] || defaultZeroStats;
            layer.setPopupContent(buildPopupHtml(kec, updatedStats, feature.properties));
            layer.openPopup(e.latlng);
            if (onSelectKecamatan) {
              onSelectKecamatan(kec.name);
            }
          }
        });
      }
    });

    geoLayer.addTo(map);
    geoJsonLayerRef.current = geoLayer;

    // Add interactive centroid badges for each of the 18 Kecamatan
    if (showLabels) {
      OKI_KECAMATAN_GEO.forEach(kec => {
        const st = statsByKecamatan[kec.name] || defaultZeroStats;
        const isSelected =
          (selectedKecamatan && selectedKecamatan !== 'SEMUA' && selectedKecamatan === kec.name) ||
          activeKecamatan?.name === kec.name;

        const icon = L.divIcon({
          className: 'dipta-kec-label-icon',
          html: `
            <div style="
              transform: translate(-50%, -50%);
              display: inline-flex;
              align-items: center;
              gap: 4px;
              padding: 2px 7px;
              border-radius: 999px;
              background: ${isSelected ? '#0f172a' : 'rgba(255, 255, 255, 0.94)'};
              color: ${isSelected ? '#ffffff' : '#0f172a'};
              border: 1.5px solid ${kec.borderColor};
              box-shadow: 0 2px 6px rgba(15, 23, 42, 0.18);
              font-family: Inter, system-ui, sans-serif;
              font-size: 10px;
              font-weight: 700;
              white-space: nowrap;
              cursor: pointer;
            ">
              <span style="width: 7px; height: 7px; border-radius: 50%; background: ${kec.color}; display: inline-block; flex-shrink: 0;"></span>
              <span>${kec.name}</span>
              <span style="
                background: ${kec.color};
                color: #ffffff;
                padding: 0px 5px;
                border-radius: 999px;
                font-size: 9px;
                font-weight: 800;
              ">${st.total}</span>
            </div>
          `,
          iconSize: [0, 0]
        });

        const marker = L.marker([kec.center[0], kec.center[1]], { icon });
        marker.on('click', () => {
          setActiveKecamatan(kec);
          const polyLayer: any = layerByKecNameRef.current[kec.name];
          if (polyLayer) {
            if (polyLayer.getBounds) {
              map.fitBounds(polyLayer.getBounds(), { padding: [40, 40], maxZoom: 11 });
            }
            polyLayer.setPopupContent(buildPopupHtml(kec, st));
            polyLayer.openPopup([kec.center[0], kec.center[1]]);
          } else {
            map.setView([kec.center[0], kec.center[1]], 11);
          }
          if (onSelectKecamatan) {
            onSelectKecamatan(kec.name);
          }
        });

        marker.addTo(map);
        labelMarkersRef.current.push(marker);
      });
    }
  }, [geoJsonData, statsByKecamatan, showLabels, fillOpacity, selectedKecamatan, activeKecamatan, buildPopupHtml, onSelectKecamatan]);

  // Fit bounds on initial GeoJSON load
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = geoJsonLayerRef.current;
    if (!map || !layer) return;
    try {
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [18, 18] });
      }
    } catch {
      // Ignore bounds error
    }
  }, [geoJsonData]);

  // Focus & open popup when user clicks a Kecamatan from the quick list below the map
  const handleSelectKecamatanFromList = (kec: KecamatanGeo) => {
    setActiveKecamatan(kec);
    const map = mapInstanceRef.current;
    const polyLayer: any = layerByKecNameRef.current[kec.name];
    const st = statsByKecamatan[kec.name] || {
      total: 0,
      oss: 0,
      ossNib: 0,
      ossKegiatan: 0,
      ossIzin: 0,
      sicantik: 0,
      simbg: 0,
      selesai: 0,
      proses: 0,
      ditolak: 0,
      investasiTotal: 0
    };

    if (map && polyLayer) {
      if (polyLayer.getBounds) {
        map.fitBounds(polyLayer.getBounds(), { padding: [45, 45], maxZoom: 11 });
      }
      polyLayer.setPopupContent(buildPopupHtml(kec, st));
      polyLayer.openPopup([kec.center[0], kec.center[1]]);
    } else if (map) {
      map.setView([kec.center[0], kec.center[1]], 11);
    }

    if (onSelectKecamatan) {
      onSelectKecamatan(kec.name);
    }
  };

  // Allow user to upload a custom GeoJSON file directly if they want to replace/update the polygon boundaries
  const handleUploadGeoJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = String(evt.target?.result || '');
        const parsed = JSON.parse(text);
        if (!parsed || !Array.isArray(parsed.features)) {
          setUploadFeedback('Format file bukan FeatureCollection GeoJSON yang valid.');
          return;
        }
        setGeoJsonData(parsed);
        setGeoSourceLabel(`${file.name} (${parsed.features.length} Poligon Wilayah)`);
        try {
          localStorage.setItem(CUSTOM_GEOJSON_STORAGE_KEY, text);
        } catch {
          // Ignore if GeoJSON is larger than localStorage quota
        }
        setUploadFeedback(`Berhasil memuat peta wilayah "${file.name}" (${parsed.features.length} poligon kecamatan)!`);
        setTimeout(() => setUploadFeedback(null), 5000);
      } catch (err: any) {
        setUploadFeedback(`Gagal membaca file GeoJSON: ${err?.message || 'File rusak'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const activeStats = activeKecamatan ? statsByKecamatan[activeKecamatan.name] : null;

  return (
    <div className="space-y-3">
      {/* Top Header & Map Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <MapIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                Peta Interaktif Administrasi 18 Kecamatan — Kabupaten Ogan Komering Ilir
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                18 Warna Wilayah Kecamatan
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sumber Geospasial: <strong className="text-slate-700">{geoSourceLabel}</strong> — Klik wilayah kecamatan pada peta untuk melihat pop-up rincian data pelayanan per sumber aplikasi.
            </p>
          </div>
        </div>

        {/* Layer & Upload Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <select
              value={baseMapStyle}
              onChange={e => setBaseMapStyle(e.target.value as BaseMapStyle)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="clean">Peta Dasar Terang (Fokus Warna Kecamatan)</option>
              <option value="osm">OpenStreetMap Standar</option>
              <option value="satellite">Citra Satelit + Poligon Kecamatan</option>
              <option value="blank">Kanvas Poligon Murni (Tanpa Latar)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
              showLabels
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {showLabels ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
            <span>Label & Angka Kecamatan</span>
          </button>

          <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-semibold transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>Upload GeoJSON Wilayah</span>
            <input
              type="file"
              accept=".geojson,.json"
              onChange={handleUploadGeoJsonFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploadFeedback && (
        <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center justify-between">
          <span>{uploadFeedback}</span>
          <button
            type="button"
            onClick={() => setUploadFeedback(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold text-xs"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Interactive Opacity & Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>OSS-RBA: {records.filter(r => r.sumber_aplikasi === 'OSS-RBA').length}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-semibold text-[11px]">
            <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
            <span>SICANTIK: {records.filter(r => r.sumber_aplikasi === 'SICANTIK').length}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-semibold text-[11px]">
            <Landmark className="w-3.5 h-3.5 text-amber-600" />
            <span>SIMBG: {records.filter(r => r.sumber_aplikasi === 'SIMBG').length}</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[11px] text-slate-600 font-medium">Ketebalan Warna Wilayah:</span>
          <input
            type="range"
            min="0.3"
            max="0.9"
            step="0.05"
            value={fillOpacity}
            onChange={e => setFillOpacity(Number(e.target.value))}
            className="w-24 accent-emerald-600 cursor-pointer"
          />
          <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            {Math.round(fillOpacity * 100)}%
          </span>
        </div>
      </div>

      {/* Main Leaflet Map Canvas */}
      <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-100">
        {isLoadingGeo && (
          <div className="absolute inset-0 z-30 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-700">
                Memuat Poligon Peta Administrasi 18 Kecamatan Kab. OKI...
              </p>
            </div>
          </div>
        )}

        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Custom Zoom & Reset Controls */}
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 bg-white rounded-xl shadow-md border border-slate-200 p-1">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Perbesar Peta"
            className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Perkecil Peta"
            className="p-1.5 hover:bg-slate-100 text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-[1px] bg-slate-200 my-0.5" />
          <button
            type="button"
            onClick={() => {
              setActiveKecamatan(null);
              const map = mapInstanceRef.current;
              const layer = geoJsonLayerRef.current;
              if (map) {
                map.closePopup();
                if (layer && layer.getBounds().isValid()) {
                  map.fitBounds(layer.getBounds(), { padding: [18, 18] });
                } else {
                  map.setView(OKI_MAP_CENTER, OKI_DEFAULT_ZOOM);
                }
              }
              if (onSelectKecamatan) {
                onSelectKecamatan('SEMUA');
              }
            }}
            title="Reset Fokus ke Seluruh Wilayah Kabupaten OKI"
            className="p-1.5 hover:bg-slate-100 text-emerald-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom-Left Instruction Legend */}
        <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-lg border border-slate-200 text-[10px] text-slate-700 max-w-[265px] space-y-1.5">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>Petunjuk Interaksi Peta Kecamatan</span>
          </div>
          <p className="text-[10px] text-slate-600 leading-relaxed">
            Setiap kecamatan memiliki warna wilayah berbeda. <strong>Klik poligon kecamatan</strong> untuk menampilkan pop-up rincian data pelayanan dari <strong>OSS-RBA</strong>, <strong>SICANTIK Cloud</strong>, dan <strong>SIMBG</strong>.
          </p>
        </div>

        {/* Active Kecamatan Floating Detail Card at Bottom-Right */}
        {activeKecamatan && activeStats && (
          <div className="hidden md:block absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-xs p-3.5 rounded-xl shadow-lg border border-slate-200 text-xs text-slate-800 w-72 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 border border-white shadow-xs"
                  style={{ backgroundColor: activeKecamatan.color }}
                />
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Kecamatan Aktif
                  </span>
                  <h5 className="font-bold text-slate-900 text-sm leading-tight">
                    {activeKecamatan.name}
                  </h5>
                </div>
              </div>
              <span
                className="font-extrabold px-2 py-0.5 rounded-full text-[11px] text-white"
                style={{ backgroundColor: activeKecamatan.borderColor }}
              >
                {activeStats.total} Berkas
              </span>
            </div>

            <div className="space-y-1.5 mb-2.5">
              <div className="flex items-center justify-between text-[11px] bg-emerald-50/80 border border-emerald-200/70 px-2.5 py-1 rounded-lg">
                <span className="font-semibold text-emerald-900">1. OSS-RBA</span>
                <strong className="text-emerald-700">{activeStats.oss} berkas</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] bg-sky-50/80 border border-sky-200/70 px-2.5 py-1 rounded-lg">
                <span className="font-semibold text-sky-900">2. SICANTIK Cloud</span>
                <strong className="text-sky-700">{activeStats.sicantik} berkas</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] bg-amber-50/80 border border-amber-200/70 px-2.5 py-1 rounded-lg">
                <span className="font-semibold text-amber-900">3. SIMBG (PBG/SLF)</span>
                <strong className="text-amber-700">{activeStats.simbg} berkas</strong>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center text-[10px] bg-slate-50 p-1.5 rounded-lg border border-slate-200 mb-2">
              <div>
                <span className="text-slate-500 block">Terbit</span>
                <strong className="text-emerald-700">{activeStats.selesai}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Proses</span>
                <strong className="text-amber-600">{activeStats.proses}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Ditolak</span>
                <strong className="text-rose-600">{activeStats.ditolak}</strong>
              </div>
            </div>

            {onSelectKecamatan && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onSelectKecamatan(activeKecamatan.name)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Filter className="w-3 h-3" />
                  <span>Filter Kecamatan Ini</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveKecamatan(null);
                    mapInstanceRef.current?.closePopup();
                    if (onSelectKecamatan) onSelectKecamatan('SEMUA');
                  }}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Color Legend & Quick Selector for All 18 Kecamatan */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold text-slate-800">
            Legenda Warna & Direktori 18 Kecamatan Kabupaten Ogan Komering Ilir (Klik untuk Fokus & Buka Pop-Up Data Pelayanan)
          </span>
          {selectedKecamatan && selectedKecamatan !== 'SEMUA' && (
            <button
              type="button"
              onClick={() => {
                setActiveKecamatan(null);
                mapInstanceRef.current?.closePopup();
                if (onSelectKecamatan) onSelectKecamatan('SEMUA');
              }}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer self-start sm:self-auto"
            >
              Tampilkan Semua Kecamatan
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5 text-xs">
          {OKI_KECAMATAN_GEO.map(k => {
            const st = statsByKecamatan[k.name] || { total: 0, oss: 0, sicantik: 0, simbg: 0 };
            const isSelected =
              (selectedKecamatan && selectedKecamatan !== 'SEMUA' && selectedKecamatan === k.name) ||
              activeKecamatan?.name === k.name;

            return (
              <button
                key={k.id}
                type="button"
                onClick={() => handleSelectKecamatanFromList(k)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm scale-[1.02]'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 border border-white/80 shadow-2xs"
                      style={{ backgroundColor: k.color }}
                    />
                    <span className="truncate font-bold text-[11px]">{k.name}</span>
                  </div>
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold text-white shrink-0"
                    style={{ backgroundColor: k.borderColor }}
                  >
                    {st.total}
                  </span>
                </div>
                <div
                  className={`flex items-center justify-between text-[9px] mt-1 pt-1 border-t ${
                    isSelected ? 'border-slate-700 text-slate-300' : 'border-slate-200/80 text-slate-500'
                  }`}
                >
                  <span>OSS: {st.oss}</span>
                  <span>SIC: {st.sicantik}</span>
                  <span>PBG: {st.simbg}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
