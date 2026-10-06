// GeoData untuk 18 Kecamatan di Kabupaten Ogan Komering Ilir, Sumatera Selatan
// Terintegrasi dengan Peta Administrasi Kecamatan (ADMINISTRASIKECAMATAN_AR_50K.geojson)

export interface KecamatanGeo {
  id: string;
  name: string;
  capital: string;
  center: [number, number]; // [lat, lng]
  areaKm2: number;
  color: string; // Warna unik masing-masing kecamatan pada peta administrasi
  borderColor: string;
  description: string;
}

export const OKI_MAP_CENTER: [number, number] = [-3.3938, 105.1800];
export const OKI_DEFAULT_ZOOM = 9;

export const OKI_KECAMATAN_GEO: KecamatanGeo[] = [
  {
    id: 'KEC-01',
    name: 'Kayu Agung',
    capital: 'Kutaraya / Cintaraja',
    center: [-3.3938, 104.8407],
    areaKm2: 224.6,
    color: '#10b981', // Emerald
    borderColor: '#047857',
    description: 'Ibu kota dan pusat administrasi pemerintahan Kabupaten Ogan Komering Ilir.'
  },
  {
    id: 'KEC-02',
    name: 'Sirah Pulau Padang',
    capital: 'Terate',
    center: [-3.2975, 104.8497],
    areaKm2: 110.4,
    color: '#3b82f6', // Blue
    borderColor: '#1d4ed8',
    description: 'Kecamatan di sepanjang aliran Sungai Komering, sebelah utara Kayu Agung.'
  },
  {
    id: 'KEC-03',
    name: 'Pampangan',
    capital: 'Pampangan',
    center: [-3.2576, 104.9961],
    areaKm2: 485.2,
    color: '#f59e0b', // Amber
    borderColor: '#b45309',
    description: 'Sentra peternakan kerbau rawa pampangan dan pertanian lebak lebung.'
  },
  {
    id: 'KEC-04',
    name: 'Pangkalan Lampam',
    capital: 'Pangkalan Lampam',
    center: [-3.0972, 105.1527],
    areaKm2: 1092.3,
    color: '#8b5cf6', // Violet
    borderColor: '#6d28d9',
    description: 'Wilayah ekosistem rawa gambut dan perikanan air tawar di utara OKI.'
  },
  {
    id: 'KEC-05',
    name: 'Air Sugihan',
    capital: 'Kertamukti',
    center: [-2.6086, 105.3446],
    areaKm2: 1928.0,
    color: '#06b6d4', // Cyan
    borderColor: '#0e7490',
    description: 'Kecamatan pesisir dan muara perairan yang berbatasan langsung dengan Selat Bangka.'
  },
  {
    id: 'KEC-06',
    name: 'Tulung Selapan',
    capital: 'Tulung Selapan',
    center: [-3.2461, 105.6902],
    areaKm2: 4853.4,
    color: '#14b8a6', // Teal
    borderColor: '#0f766e',
    description: 'Salah satu kecamatan terluas di OKI dengan potensi perkebunan dan perikanan tambak laut.'
  },
  {
    id: 'KEC-07',
    name: 'Cengal',
    capital: 'Cengal',
    center: [-3.4484, 105.6006],
    areaKm2: 3223.7,
    color: '#f97316', // Orange
    borderColor: '#c2410c',
    description: 'Wilayah timur OKI dengan peninggalan sejarah Sriwijaya dan potensi perkebunan sawit.'
  },
  {
    id: 'KEC-08',
    name: 'Sungai Menang',
    capital: 'Sungai Menang',
    center: [-3.8367, 105.5242],
    areaKm2: 1993.4,
    color: '#ec4899', // Pink
    borderColor: '#be185d',
    description: 'Kecamatan pesisir tenggara OKI, sentra perikanan laut dan perkebunan.'
  },
  {
    id: 'KEC-09',
    name: 'Pedamaran',
    capital: 'Menang Raya',
    center: [-3.4840, 104.9326],
    areaKm2: 381.6,
    color: '#84cc16', // Lime
    borderColor: '#4d7c0f',
    description: 'Kecamatan perajin anyaman tikar purun dan penyangga kota Kayu Agung.'
  },
  {
    id: 'KEC-10',
    name: 'Pedamaran Timur',
    capital: 'Sumber Hidup',
    center: [-3.5686, 105.1809],
    areaKm2: 667.8,
    color: '#6366f1', // Indigo
    borderColor: '#4338ca',
    description: 'Pemekaran Pedamaran dengan pertumbuhan sentra agrobisnis dan perkebunan.'
  },
  {
    id: 'KEC-11',
    name: 'Tanjung Lubuk',
    capital: 'Tanjung Lubuk',
    center: [-3.5686, 104.7168],
    areaKm2: 221.2,
    color: '#ef4444', // Red
    borderColor: '#b91c1c',
    description: 'Kecamatan lintas Komering di selatan, perbatasan dengan Ogan Ilir dan OKU Timur.'
  },
  {
    id: 'KEC-12',
    name: 'Teluk Gelam',
    capital: 'Serapek',
    center: [-3.5836, 104.7816],
    areaKm2: 151.1,
    color: '#0ea5e9', // Sky
    borderColor: '#0369a1',
    description: 'Kawasan wisata Danau Teluk Gelam dan jalur transit utama Jalan Lintas Timur Sumatera.'
  },
  {
    id: 'KEC-13',
    name: 'Lempuing',
    capital: 'Tugumulyo',
    center: [-3.9071, 104.9080],
    areaKm2: 295.6,
    color: '#22c55e', // Green
    borderColor: '#15803d',
    description: 'Kawasan ekonomi agropolitan dan perdagangan terpadu Tugumulyo yang sangat pesat.'
  },
  {
    id: 'KEC-14',
    name: 'Lempuing Jaya',
    capital: 'Lubuk Seberuk',
    center: [-3.7191, 104.9077],
    areaKm2: 504.6,
    color: '#a855f7', // Purple
    borderColor: '#7e22ce',
    description: 'Sentra persawahan padi, peternakan, dan UMKM di jalur penghubung lintas timur.'
  },
  {
    id: 'KEC-15',
    name: 'Mesuji',
    capital: 'Surya Adi',
    center: [-3.9714, 105.1258],
    areaKm2: 673.8,
    color: '#eab308', // Yellow
    borderColor: '#a16207',
    description: 'Kecamatan di perbatasan Provinsi Lampung dengan komoditas kelapa sawit dan karet.'
  },
  {
    id: 'KEC-16',
    name: 'Mesuji Raya',
    capital: 'Sukamaju',
    center: [-3.7371, 105.1003],
    areaKm2: 521.5,
    color: '#f43f5e', // Rose
    borderColor: '#be123c',
    description: 'Kawasan perkebunan besar kelapa sawit swasta dan plasma di wilayah tengah selatan OKI.'
  },
  {
    id: 'KEC-17',
    name: 'Mesuji Makmur',
    capital: 'Bina Karsa',
    center: [-4.1474, 104.8819],
    areaKm2: 512.4,
    color: '#d946ef', // Fuchsia
    borderColor: '#a21caf',
    description: 'Kawasan transmigrasi sukses dengan produksi perkebunan karet, sawit, dan palawija.'
  },
  {
    id: 'KEC-18',
    name: 'Jejawi',
    capital: 'Jejawi',
    center: [-3.1714, 104.8269],
    areaKm2: 227.6,
    color: '#2dd4bf', // Turquoise
    borderColor: '#0f766e',
    description: 'Kecamatan di bagian barat laut OKI yang berbatasan langsung dengan Kota Palembang.'
  }
];

/**
 * Helper to match any GeoJSON feature property (NAMOBJ, WADMKC, district, etc.) to official KecamatanGeo
 */
export function resolveKecamatanFromFeatureProps(props: Record<string, any> | undefined | null): KecamatanGeo | undefined {
  if (!props) return undefined;
  const rawCandidates = [
    props.NAMOBJ,
    props.WADMKC,
    props.district,
    props.KECAMATAN,
    props.kecamatan,
    props.NAME_3,
    props.nama_kecamatan,
    props.name
  ]
    .filter(Boolean)
    .map(v => String(v).trim());

  for (const raw of rawCandidates) {
    const clean = raw
      .toLowerCase()
      .replace(/^kecamatan\s+/i, '')
      .replace(/^kec\.?\s+/i, '')
      .replace(/^kota\s+/i, '')
      .replace(/pangkalan\s+lapam/i, 'pangkalan lampam')
      .replace(/kayuagung/i, 'kayu agung')
      .replace(/sirahpulaupadang/i, 'sirah pulau padang')
      .trim();

    const exact = OKI_KECAMATAN_GEO.find(k => k.name.toLowerCase() === clean);
    if (exact) return exact;

    const fuzzy = OKI_KECAMATAN_GEO.find(
      k => clean.includes(k.name.toLowerCase()) || k.name.toLowerCase().includes(clean)
    );
    if (fuzzy) return fuzzy;
  }

  return undefined;
}

