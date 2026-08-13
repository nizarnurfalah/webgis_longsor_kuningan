/* ============================================
   WebGIS Longsor Kabupaten Kuningan
   Main Application Script — v2 Clean Rewrite
   ============================================ */

// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
    geojsonPath: (() => {
        const base = document.querySelector('meta[name="base-url"]');
        return base ? base.content + '/assets/geojson/' : '/WEBGISLONGSOR/public/assets/geojson/';
    })(),

    mapCenter: [-7.00, 108.53],
    mapZoom: 10.5,
    maxZoom: 18,
    minZoom: 9,

    basemaps: {
        osm: {
            label: 'Jalan',
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attr: '&copy; OpenStreetMap contributors',
            thumb: 'https://tile.openstreetmap.org/5/26/16.png'
        },
        satellite: {
            label: 'Satelit',
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attr: '&copy; Esri',
            thumb: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/5/16/26'
        },
        clean: {
            label: 'Bersih',
            url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            attr: '&copy; CartoDB',
            thumb: 'https://a.basemaps.cartocdn.com/dark_all/5/26/16.png'
        },
        terrain: {
            label: 'Terang (Putih)',
            url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
            attr: '&copy; CartoDB',
            thumb: 'https://a.basemaps.cartocdn.com/light_nolabels/5/26/16.png',
            maxNativeZoom: 19
        }
    },

    layers: {
        // --- Longsor (Mean) ---
        longsor_mean: { 
            category: 'longsor', 
            year: null, 
            file: 'Longsor_Mean_Bappeda.json', 
            field: 'Kelas', 
            label: 'Rata-rata Kerawanan Longsor',
            downloadUrl: 'https://drive.google.com/file/d/1rfIHVRB4JDVdh3DDIKblER4_9lptr9_7/view?usp=drive_link'
        },
        longsor_desa: {
            category: 'longsor',
            year: null,
            file: 'Batas_Wilayah_Desalongsor_With_Kec.json',
            label: 'Kejadian Longsor per Desa',
            isDesaKejadian: true
        },

        // --- Curah Hujan (Mean) ---
        hujan_mean: { 
            category: 'hujan', 
            year: null, 
            file: 'Curah_HujanMeanasli_Bappeda.json', 
            label: 'Rata-rata Curah Hujan',
            downloadUrl: 'https://drive.google.com/file/d/1jQN-vJkdQwLWpscdLn7zdNHcL-RIwTX6/view?usp=drive_link'
        },

        // --- Parameter Fisik ---
        kelerengan: { 
            category: 'kelerengan', 
            year: null, 
            file: 'Kelerengan_Bappeda.json', 
            label: 'Kelerengan',
            downloadUrl: 'https://drive.google.com/file/d/1C39MhVXxNdZdLvWmSwAdxjyyadyzn3Jd/view?usp=drive_link'
        },
        bebatuan: { 
            category: 'bebatuan', 
            year: null, 
            file: 'Jenis_Bebatuan_Bappeda.json', 
            label: 'Jenis Bebatuan',
            downloadUrl: 'https://drive.google.com/file/d/1vnkFYqN-9ddmH4SpkeAgDxz2CFmb0FM0/view?usp=drive_link'
        },
        tanah: { 
            category: 'tanah', 
            year: null, 
            file: 'Jenis_Tanah_Bappeda.json', 
            label: 'Jenis Tanah',
            downloadUrl: 'https://drive.google.com/file/d/109ly38vcatU4O-_KbUft2tFGZXqnOMbj/view?usp=drive_link'
        },
        lahan: { 
            category: 'lahan', 
            year: null, 
            file: 'Tutupan_Lahan_Bappeda.json', 
            label: 'Tutupan Lahan',
            downloadUrl: 'https://drive.google.com/file/d/1ag_yAW4ro2TIruxpTFJRtjwFrd2EkJT_/view?usp=drive_link'
        },

        // --- Batas Wilayah ---
        batas_kabupaten: { category: 'batas', year: null, file: 'Batas_Wilaya_Bappeda.json', label: 'Batas Kabupaten Kuningan' },
        batas_kecamatan: { category: 'batas', year: null, file: 'Batas_Wilayah_Kecamatan_Bappeda.json', label: 'Batas Kecamatan', labelField: 'WADMKC' },

        // --- Evakuasi & Mitigasi ---
        evakuasi_rute: { category: 'evakuasi', year: null, file: 'Rute_Evakuasi_longsor.json', label: 'Jalur Evakuasi', downloadUrl: 'https://drive.google.com/file/d/14_sTpQIsbA_d2FvtFX9nufQ0a7qPA0_0/view?usp=drive_link' },
        evakuasi_potensi: { category: 'evakuasi', year: null, file: 'longsor_rendah_Tinggi.json', label: 'Potensi Longsor (Rendah & Tinggi)', hideMenu: true, isEvakuasiPotensi: true },
        evakuasi_awal: { category: 'evakuasi', year: null, file: 'Titik_awal.json', label: 'Titik Awal', hideMenu: true },
        evakuasi_shelter: { category: 'evakuasi', year: null, file: 'titik_shelter.json', label: 'Shelter Area', hideMenu: true },
        evakuasi_jalan: { category: 'evakuasi', year: null, file: 'data_jalan.json', label: 'Jalan Umum', hideMenu: true },
        evakuasi_kec: { category: 'evakuasi', year: null, file: 'garis_kecamatan.json', label: 'Batas Kecamatan Evakuasi', hideMenu: true },
    },

    // Categories — used for UI panel
    categories: [
        { id: 'longsor', label: 'Kerawanan Longsor', icon: '⛰️' },
        { id: 'hujan',   label: 'Curah Hujan',       icon: '🌧️' },
        { id: 'kelerengan', label: 'Kelerengan',      icon: '📐' },
        { id: 'bebatuan',   label: 'Jenis Bebatuan',  icon: '🪨' },
        { id: 'tanah',      label: 'Jenis Tanah',     icon: '🌱' },
        { id: 'lahan',      label: 'Tutupan Lahan',   icon: '🌳' },
        { id: 'batas',      label: 'Batas Wilayah',   icon: '📍' },
        { id: 'evakuasi',   label: 'Mitigasi & Evakuasi', icon: '🚨' },
    ],

    colors: {
        longsor: {
            'Sangat Rendah': '#1a9850',
            'Rendah': '#91cf60',
            'Sedang': '#fee08b',
            'Tinggi': '#fc8d59',
            'Sangat Tinggi': '#d73027',
        },
        longsor_desa: {
            '0 Kejadian': '#2dd4a0',
            '1 Kejadian': '#fee08b',
            '2 Kejadian': '#fc8d59',
            '3 Kejadian': '#d73027',
            '≥ 4 Kejadian': '#880e4f'
        },
        hujan: {
            '2830 - 3000mm': '#ffff00',
            '3000 - 3988mm': '#ff0000',
        },
        kelerengan: {
            'Datar (0 - 8%)': '#006d2c',
            'Landai (8 - 15%)': '#74c476',
            'Agak Curam (15 - 30%)': '#ffff00',
            'Curam (30 - 45%)': '#fe9929',
            'Sangat Curam (>45%)': '#e31a1c'
        },
        bebatuan: {
            'Batu Aluvial': '#008000',
            'Batu Sedimentasi': '#ffff00',
            'Batu Vulkanik': '#ff0000'
        },
        tanah: {
            'Aluvial, Planosol, Hidromorf': '#004d1a',
            'Latosol': '#74c476',
            'Brown forest soil, Mediterian': '#ffff00',
            'Andosol, Laterit, Grumusol': '#ff9900',
            'Regosol, Litosol, Organosol': '#ff0000'
        },
        lahan: {
            'Tambak, waduk, perairan': '#006400',
            'Kota, Pemukiman, Bandara': '#a8d600',
            'Hutan dan perkebunan': '#ffff00',
            'Semak Belukar': '#ffa500',
            'Tegalan, sawah': '#ff0000'
        }
    }
};

// Mapping label lama GeoJSON → label baru config untuk kelerengan
const KELERENGAN_LABEL_MAP = {
    'Agak Curam (15 - 25%)': 'Agak Curam (15 - 30%)',
    'Curam (25 - 45%)': 'Curam (30 - 45%)'
};
function mapKelerenganLabel(label) {
    return KELERENGAN_LABEL_MAP[label] || label;
}

// Helper: find category config by id
function getCategoryConfig(catId) {
    return CONFIG.categories.find(c => c.id === catId);
}

// ========================================
// STATE
// ========================================
const state = {
    map: null,
    currentBasemap: null,
    activeLayers: [],       // Array of layer keys
    layersInstance: {},      // { key: L.geoJSON instance }
    geojsonCache: {},       // { file: parsed json }
    activeCategory: null,   // for time slider
    panelOpen: false,
    isLoading: false,
    swipeActive: false,
    swipePosition: 50,
    playInterval: null,
    statistikData: null,    // data from csvjson.json
    selectedLandslideYear: 'TOTAL_AKUM', // selected year field for longsor_desa
    activeKecamatan: null,  // currently selected kecamatan for stats
    statsMode: 'potensi',   // 'potensi' | 'kejadian' — sidebar stats display mode
    expandedKecamatan: null, // kecamatan currently expanded in accordion
    charts: {}              // active Chart.js instances
};

// ========================================
// MAP INITIALIZATION
// ========================================
function initMap() {
    state.map = L.map('map', {
        zoomControl: false,
        preferCanvas: true
    }).setView(CONFIG.mapCenter, CONFIG.mapZoom);

    L.control.zoom({ position: 'bottomright' }).addTo(state.map);
    setBasemap('osm');

    // Pastikan popup tertutup jika klik di luar
    state.map.on('click', function() {
        state.map.closePopup();
    });

    // Tombol Home (Reset View)
    const homeControl = L.control({ position: 'bottomright' });
    homeControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        div.style.border = 'none';
        div.style.marginTop = '10px';
        const btn = L.DomUtil.create('a', 'home-control-btn', div);
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>';
        btn.href = '#';
        btn.title = 'Tampilan Awal';
        btn.onclick = function(e) {
            e.preventDefault();
            resetMapView();
        };
        return div;
    };
    homeControl.addTo(state.map);
}

function resetMapView() {
    state.map.setView(CONFIG.mapCenter, CONFIG.mapZoom);
}

// ========================================
// BASEMAP
// ========================================
function setBasemap(name) {
    const bm = CONFIG.basemaps[name];
    if (!bm) return;

    if (state.currentBasemap) {
        state.map.removeLayer(state.currentBasemap);
    }

    const tileOptions = {
        attribution: bm.attr,
        maxZoom: CONFIG.maxZoom,
    };
    if (bm.maxNativeZoom) tileOptions.maxNativeZoom = bm.maxNativeZoom;

    state.currentBasemap = L.tileLayer(bm.url, tileOptions).addTo(state.map);

    document.querySelectorAll('.basemap-option').forEach(el => {
        el.classList.toggle('active', el.dataset.basemap === name);
    });
}

// ========================================
// LAYER MANAGEMENT
// ========================================
async function loadLayer(key) {
    const config = CONFIG.layers[key];
    if (!config || state.layersInstance[key]) return;

    showLoading(`Memuat ${config.label}...`);

    try {
        let geojsonData;
        if (state.geojsonCache[config.file]) {
            geojsonData = state.geojsonCache[config.file];
        } else {
            const response = await fetch(CONFIG.geojsonPath + config.file);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            geojsonData = await response.json();
            state.geojsonCache[config.file] = geojsonData;
        }

        // Create a dedicated pane + canvas renderer for this layer
        const paneId = `pane-${key}`;
        if (!state.map.getPane(paneId)) {
            state.map.createPane(paneId);
            let zIndex = 410;
            if (key === 'batas_kabupaten') zIndex = 440;
            else if (config.category === 'batas') zIndex = 450;
            else if (config.isEvakuasiPotensi) zIndex = 405; // Put below routes and points
            state.map.getPane(paneId).style.zIndex = zIndex;
        }

        const layer = L.geoJSON(geojsonData, {
            pane: paneId,
            renderer: L.canvas({ pane: paneId }),
            style: (feature) => getLayerStyle(config, feature, key),
            pointToLayer: (feature, latlng) => {
                if (key === 'evakuasi_awal') {
                    return L.marker(latlng, {
                        icon: L.divIcon({
                            html: `<svg width="24" height="24" viewBox="0 0 24 24" style="overflow:visible;"><rect x="12" y="2" width="14" height="14" transform="rotate(45 12 2)" fill="white" stroke="#e65100" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#e65100"/></svg>`,
                            className: '',
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        })
                    });
                } else if (key === 'evakuasi_shelter') {
                    return L.marker(latlng, {
                        icon: L.divIcon({
                            html: `<svg width="24" height="24" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="4" fill="#81d4fa" stroke="#0277bd" stroke-width="2"/><path d="M12 7 L7 16 H17 Z" fill="#01579b"/><path d="M12 7 L12 16" stroke="white" stroke-width="1.5"/></svg>`,
                            className: '',
                            iconSize: [24, 24],
                            iconAnchor: [12, 12]
                        })
                    });
                }
                return L.circleMarker(latlng);
            },
            onEachFeature: (feature, layer) => bindPopup(config, feature, layer),
        });

        layer._webgisKey = key;
        layer._paneId = paneId;
        layer.addTo(state.map);

        // Fade in the entire pane
        const paneEl = state.map.getPane(paneId);
        if (paneEl) {
            paneEl.style.opacity = '1';
        }

        state.layersInstance[key] = layer;
        state.activeLayers.push(key);

        // Batas wilayah always on top visually
        if (config.category === 'batas') {
            layer.bringToFront();
        }

        // Update batas interactivity based on active parameter layers
        updateBatasInteractivity();

        updateLegend();
        updateInfoPanel();
        updateTimeSlider();
        updateCompareButton();
        updateLandslideYearSelector();
        updateSidebarStats();

    } catch (err) {
        console.error(`Error loading ${key}:`, err);
        const cb = document.querySelector(`input[data-layer="${key}"]`);
        if (cb) cb.checked = false;
    } finally {
        hideLoading();
    }
}

function removeLayer(key) {
    if (state.layersInstance[key]) {
        state.map.removeLayer(state.layersInstance[key]);
        delete state.layersInstance[key];
        state.activeLayers = state.activeLayers.filter(k => k !== key);
        updateBatasInteractivity();
        updateLegend();
        updateInfoPanel();
        updateTimeSlider();
        updateCompareButton();
        updateLandslideYearSelector();
        updateSidebarStats();
    }
}

// Control batas wilayah interactivity:
// When a parameter layer is active, disable pointer-events on batas panes
// so clicks pass through to parameter layers underneath.
// When no parameter layer is active, re-enable batas pointer-events.
function updateBatasInteractivity() {
    const paramCategories = ['hujan', 'kelerengan', 'bebatuan', 'tanah', 'lahan'];
    const hasParamLayer = state.activeLayers.some(k => {
        const c = CONFIG.layers[k];
        if (!c) return false;
        // For longsor, only passthrough when longsor_desa is active
        // (user needs to click desa features directly).
        // longsor_mean does NOT need passthrough because batas popup
        // already shows the kerawanan longsor chart.
        if (c.isDesaKejadian) return true;
        return paramCategories.includes(c.category);
    });

    if (!document.getElementById('batas-passthrough-css')) {
        const style = document.createElement('style');
        style.id = 'batas-passthrough-css';
        style.innerHTML = `
            .batas-passthrough, .batas-passthrough * {
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Update pointer-events for all batas panes
    ['batas_kabupaten', 'batas_kecamatan'].forEach(bKey => {
        const pane = state.map.getPane(`pane-${bKey}`);
        if (pane) {
            if (hasParamLayer) {
                pane.classList.add('batas-passthrough');
            } else {
                pane.classList.remove('batas-passthrough');
            }
        }
    });
}

// Toggle a layer on or off
async function toggleLayer(key) {
    // Helper: check if a layer key is "exclusive" (not batas wilayah)
    function isExclusiveLayer(k) {
        const c = CONFIG.layers[k];
        return c && c.category !== 'batas';
    }

    // Helper: remove all exclusive layers (including evakuasi sub-layers)
    function removeAllExclusiveLayers() {
        const evakuasiSubKeys = ['evakuasi_potensi', 'evakuasi_kec', 'evakuasi_jalan', 'evakuasi_awal', 'evakuasi_shelter'];
        const toRemove = [...state.activeLayers].filter(k => isExclusiveLayer(k));
        toRemove.forEach(k => {
            removeLayer(k);
            const cb = document.querySelector(`input[data-layer="${k}"]`);
            if (cb) cb.checked = false;
        });
        // Also remove evakuasi sub-layers that may not be in activeLayers tracking
        evakuasiSubKeys.forEach(k => {
            if (state.layersInstance[k]) {
                removeLayer(k);
            }
        });
    }

    if (key === 'evakuasi_rute') {
        const subKeys = ['evakuasi_potensi', 'evakuasi_kec', 'evakuasi_jalan', 'evakuasi_awal', 'evakuasi_shelter'];
        if (state.activeLayers.includes(key)) {
            // Turn off evakuasi
            removeLayer(key);
            subKeys.forEach(k => removeLayer(k));
            const cb = document.querySelector(`input[data-layer="${key}"]`);
            if (cb) cb.checked = false;
        } else {
            // Turn off all other exclusive layers first
            removeAllExclusiveLayers();
            await loadLayer(key);
            for (let k of subKeys) await loadLayer(k);
            const cb = document.querySelector(`input[data-layer="${key}"]`);
            if (cb) cb.checked = true;
        }
        return;
    }

    const config = CONFIG.layers[key];
    if (!config) return;

    // Already active? Remove it.
    if (state.activeLayers.includes(key)) {
        removeLayer(key);
        const cb = document.querySelector(`input[data-layer="${key}"]`);
        if (cb) cb.checked = false;
        return;
    }

    // Single-layer mode: if this is an exclusive layer, remove all other exclusive layers
    if (isExclusiveLayer(key)) {
        removeAllExclusiveLayers();
    }

    // Load the new layer
    await loadLayer(key);
    const cb = document.querySelector(`input[data-layer="${key}"]`);
    if (cb) cb.checked = true;
}

// ========================================
// STYLING ENGINE
// ========================================
function getLayerStyle(config, feature, key) {
    if (key === 'evakuasi_rute') {
        return { color: '#00bfff', weight: 3, opacity: 1 };
    }
    if (key === 'evakuasi_jalan') {
        return { color: '#a0a0a0', weight: 1, opacity: 0.8 };
    }
    if (key === 'evakuasi_kec') {
        return { color: '#666666', weight: 1, fillOpacity: 0, dashArray: '5, 5' };
    }

    const props = feature.properties;

    if (config.category === 'batas') {
        return {
            color: '#222222',
            weight: 2.5,
            fill: false,
            dashArray: '5, 5'
        };
    }

    if (config.isEvakuasiPotensi) {
        const kelas = props['Kelas'] || '';
        let color = '#cccccc';
        if (kelas === 'Sangat Tinggi') color = '#d73027'; // Merah
        else if (kelas === 'Rendah') color = '#91cf60'; // Hijau
        return { fillColor: color, weight: 1, opacity: 0.8, color: 'rgba(255,255,255,0.4)', fillOpacity: 0.6 };
    }

    if (config.isDesaKejadian) {
        const yearField = state.selectedLandslideYear || 'TOTAL_AKUM';
        const count = parseInt(props[yearField] ?? 0);
        let color = '#2dd4a0'; // 0
        if (count === 1) color = '#fee08b'; // 1
        else if (count === 2) color = '#fc8d59'; // 2
        else if (count === 3) color = '#d73027'; // 3
        else if (count >= 4) color = '#880e4f'; // 4+
        
        return { 
            fillColor: color, 
            weight: 1, 
            opacity: 0.9, 
            color: 'rgba(255,255,255,0.4)', 
            fillOpacity: 0.75 
        };
    }

    if (config.category === 'longsor') {
        const kelas = props[config.field] || props['Kelas'] || props['KelasAkhir'] || '';
        const color = CONFIG.colors.longsor[kelas] || '#cccccc';
        return { fillColor: color, weight: 0.8, opacity: 0.8, color: 'rgba(255,255,255,0.3)', fillOpacity: 0.75 };
    }

    if (config.category === 'hujan') {
        const kelas = props['Kelas_FCH'] || '';
        const color = CONFIG.colors.hujan[kelas] || '#cccccc';
        return { fillColor: color, weight: 0.8, opacity: 0.8, color: 'rgba(255,255,255,0.3)', fillOpacity: 0.75 };
    }

    if (config.category === 'kelerengan') {
        const kelas = mapKelerenganLabel(props['Kelas_FKL'] || '');
        const color = CONFIG.colors.kelerengan[kelas] || '#cccccc';
        return { fillColor: color, weight: 0.8, opacity: 0.8, color: 'rgba(255,255,255,0.3)', fillOpacity: 0.75 };
    }

    if (config.category === 'bebatuan') {
        const kelas = props['Kelas_FJB'] || '';
        const color = CONFIG.colors.bebatuan[kelas] || '#cccccc';
        return { fillColor: color, weight: 0.8, opacity: 0.8, color: 'rgba(255,255,255,0.3)', fillOpacity: 0.75 };
    }

    if (config.category === 'tanah') {
        const kelas = props['Kelas_FJT'] || '';
        const color = CONFIG.colors.tanah[kelas] || '#cccccc';
        return { fillColor: color, weight: 0.8, opacity: 0.8, color: 'rgba(255,255,255,0.3)', fillOpacity: 0.75 };
    }

    if (config.category === 'lahan') {
        const kelas = props['Kelas_FPL'] || '';
        const color = CONFIG.colors.lahan[kelas] || '#d9d9d9';
        return { fillColor: color, weight: 0.8, opacity: 0.8, color: 'rgba(255,255,255,0.3)', fillOpacity: 0.75 };
    }

    return { fillColor: '#3388ff', weight: 1, color: '#3388ff', fillOpacity: 0.5 };
}

// ========================================
// POPUP BINDING
// ========================================
function bindPopup(config, feature, layer) {
    const props = feature.properties;
    let content = `<strong>${config.label}</strong><br>`;

    if (config.isDesaKejadian) {
        const yearField = state.selectedLandslideYear || 'TOTAL_AKUM';
        const yearLabel = {
            'TOTAL_LONG': '2021',
            'TOTAL_LO_1': '2022',
            'TOTAL_LO_2': '2023',
            'TOTAL_LO_3': '2024',
            'TOTAL_LO_4': '2025',
            'TOTAL_AKUM': 'Total (2021-2025)'
        }[yearField];
        
        const count = props[yearField] ?? 0;
        content = `<strong>Desa: ${props.NAMOBJ}</strong><br>
                   Kecamatan: <strong>${props.WADMKC || '-'}</strong><br>
                   <hr style="border:none; border-top:1px solid rgba(255,255,255,0.15); margin:6px 0;">
                   Kejadian Longsor (${yearLabel}): <strong>${count} kali</strong><br>
                   <span style="font-size:11px; color:var(--text-muted); display:block; margin-top:4px;">Klik desa untuk melihat statistik di sidebar</span>`;
    } else if (config.category === 'batas') {
        content += `Kecamatan: <strong>${props.WADMKC || props.WADMKK || 'Kuningan'}</strong>`;
        if (props.WADMKC) {
            const safeId = props.WADMKC.replace(/\s+/g, '-');
            content += `<div class="chart-wrapper" style="width: 200px; height: 180px; margin-top: 12px; position: relative; overflow: hidden;">
                            <canvas id="chart-${safeId}"></canvas>
                        </div>
                        <div id="table-${safeId}" style="margin-top: 8px;"></div>`;
        }
    } else if (config.category === 'longsor') {
        const kelas = props[config.field] || props['Kelas'] || '-';
        layer._longsorInfo = { configLabel: config.label, kelas: kelas };
    } else if (['hujan', 'kelerengan', 'bebatuan', 'tanah', 'lahan'].includes(config.category)) {
        // Parameter layers — will be populated dynamically on click with kecamatan info
        const paramLabels = {
            hujan: 'Curah Hujan',
            kelerengan: 'Kelerengan',
            bebatuan: 'Jenis Batuan',
            tanah: 'Jenis Tanah',
            lahan: 'Tutupan Lahan'
        };
        const paramFields = {
            hujan: { kelas: 'Kelas_FCH', skor: 'Skor_FCH' },
            kelerengan: { kelas: 'Kelas_FKL', skor: 'Skor_FKL' },
            bebatuan: { kelas: 'Kelas_FJB', skor: 'Skor_FJB' },
            tanah: { kelas: 'Kelas_FJT', skor: 'Skor_FJT' },
            lahan: { kelas: 'Kelas_FPL', skor: 'Skor_FPL' }
        };
        const fields = paramFields[config.category];
        const paramLabel = paramLabels[config.category];
        let kelasVal = props[fields.kelas] || 'N/A';
        const skorVal = props[fields.skor] || 'N/A';
        // Map old GeoJSON kelerengan labels to new labels
        if (config.category === 'kelerengan') {
            kelasVal = mapKelerenganLabel(kelasVal);
        }
        // Content will be built dynamically on click to include kecamatan
        layer._paramInfo = { category: config.category, label: paramLabel, kelas: kelasVal, skor: skorVal, configLabel: config.label };
    }

    if (config.category === 'batas' || config.isDesaKejadian) {
        // Boundaries use click for popup
        layer.bindPopup(content, { className: 'webgis-popup custom-chart-popup', minWidth: 200 });
        layer.on('mouseover', function() {
            this.setStyle({ weight: 3, color: '#ffeb3b' });
        });
        layer.on('mouseout', function() {
            this.setStyle(getLayerStyle(config, feature));
        });
        
        if (config.isDesaKejadian) {
            layer.on('click', function() {
                if (props.WADMKC) {
                    // Switch sidebar to Kejadian mode and expand kecamatan in accordion
                    if (state.statsMode !== 'kejadian') {
                        state.statsMode = 'kejadian';
                        const cb = document.getElementById('statsModeCheckbox');
                        if (cb) cb.checked = true;
                        const lp = document.getElementById('toggleLabelPotensi');
                        const lk = document.getElementById('toggleLabelKejadian');
                        if (lp) lp.classList.remove('active');
                        if (lk) lk.classList.add('active');
                    }
                    state.expandedKecamatan = props.WADMKC;
                    renderStatsSidebar();
                    // Auto-open sidebar if closed
                    const sidebar = document.getElementById('statSidebar');
                    if (sidebar && !sidebar.classList.contains('open')) toggleStatSidebar();
                }
            });
        } else {
            layer.on('popupopen', function() {
                if (props.WADMKC) {
                    // Show different popup chart based on active layer
                    if (state.activeLayers.includes('longsor_desa')) {
                        renderPopupKejadianChart(props.WADMKC);
                    } else {
                        renderPopupChart(props.WADMKC);
                    }
                }
            });
        }
    } else if (layer._paramInfo) {
        // Parameter layers — click popup with kecamatan stats
        layer.bindPopup('<div style="text-align:center; padding:10px;">Memuat data...</div>', { 
            className: 'webgis-popup custom-chart-popup', 
            minWidth: 220 
        });
        
        layer.on('popupopen', function(e) {
            const popup = e.popup;
            const latlng = popup.getLatLng();
            const info = this._paramInfo;
            const kecamatan = findKecamatan(latlng);
            const kecLabel = kecamatan || 'Tidak diketahui';
            const safeId = (kecLabel + '-' + info.category).replace(/[\s,]+/g, '-');

            let popupContent = `<strong>${info.configLabel}</strong><br>`;
            popupContent += `Kecamatan: <strong>${kecLabel}</strong>`;
            popupContent += `<hr style="border:none; border-top:1px solid rgba(255,255,255,0.15); margin:6px 0;">`;
            popupContent += `${info.label}: <strong>${info.kelas}</strong> | Skor: <strong>${info.skor}</strong>`;

            if (kecamatan) {
                popupContent += `<div class="chart-wrapper" style="width: 200px; height: 180px; margin-top: 12px; position: relative; overflow: hidden;">
                    <canvas id="chart-${safeId}"></canvas>
                </div>
                <div id="table-${safeId}" style="margin-top: 8px;"></div>`;
            }

            popup.setContent(popupContent);

            if (kecamatan) {
                // Wait for DOM to render, then build chart
                setTimeout(() => {
                    renderPopupParameterChart(kecamatan, info.category, safeId);
                }, 100);
            }
        });
        layer.on('mouseover', function() {
            this.setStyle({ weight: 2.5, color: '#fff', fillOpacity: 0.9 });
        });
        layer.on('mouseout', function() {
            this.setStyle(getLayerStyle(config, feature));
        });
    } else if (layer._longsorInfo) {
        // Longsor layers — click popup with kecamatan stats
        layer.bindPopup('<div style="text-align:center; padding:10px;">Memuat data...</div>', { 
            className: 'webgis-popup custom-chart-popup', 
            minWidth: 220 
        });
        
        layer.on('popupopen', function(e) {
            const popup = e.popup;
            const latlng = popup.getLatLng();
            const info = this._longsorInfo;
            const kecamatan = findKecamatan(latlng);
            const kecLabel = kecamatan || 'Tidak diketahui';
            const safeId = kecLabel.replace(/\s+/g, '-');

            let popupContent = `<strong>${info.configLabel}</strong><br>`;
            popupContent += `Kecamatan: <strong>${kecLabel}</strong>`;
            popupContent += `<hr style="border:none; border-top:1px solid rgba(255,255,255,0.15); margin:6px 0;">`;
            popupContent += `Tingkat Kerawanan: <strong>${info.kelas}</strong>`;

            if (kecamatan) {
                popupContent += `<div class="chart-wrapper" style="width: 200px; height: 180px; margin-top: 12px; position: relative; overflow: hidden;">
                    <canvas id="chart-${safeId}"></canvas>
                </div>
                <div id="table-${safeId}" style="margin-top: 8px;"></div>`;
            }

            popup.setContent(popupContent);

            if (kecamatan) {
                // Use the original renderPopupChart which expects the kecamatan name
                setTimeout(() => {
                    renderPopupChart(kecamatan);
                }, 100);
            }
        });

        layer.on('mouseover', function(e) {
            this.setStyle({ weight: 2.5, color: '#fff', fillOpacity: 0.9 });
        });
        layer.on('mouseout', function() {
            this.setStyle(getLayerStyle(config, feature));
        });
    } else {
        // Fallback for any other layers
        layer.bindPopup(content, { className: 'webgis-popup' });
        layer.on('mouseover', function(e) {
            this.openPopup(e.latlng);
            this.setStyle({ weight: 2.5, color: '#fff', fillOpacity: 0.9 });
        });
        layer.on('mouseout', function() {
            this.closePopup();
            this.setStyle(getLayerStyle(config, feature));
        });
    }
}

// ========================================
// DATA STATISTIK & SIDEBAR
// ========================================
function toggleStatSidebar() {
    const sidebar = document.getElementById('statSidebar');
    const toggleBtn = document.getElementById('statToggleBtn');
    
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        toggleBtn.classList.remove('hidden');
        document.body.classList.remove('sidebar-open');
    } else {
        sidebar.classList.add('open');
        toggleBtn.classList.add('hidden');
        document.body.classList.add('sidebar-open');

        // Close bottom info panel if open
        const bottomPanel = document.getElementById('bottomInfoPanel');
        if (bottomPanel) bottomPanel.classList.remove('open');

        // Close layer panel if open
        if (state.panelOpen) {
            state.panelOpen = false;
            document.getElementById('layerPanel').classList.remove('open');
            document.querySelector('.menu-btn').classList.remove('active');
            
            // Shift compare button, basemap switcher, and leaflet controls back
            const rightGroup = document.querySelector('.top-bar-right');
            const basemapSwitcher = document.getElementById('basemapSwitcher');
            const leafletRight = document.querySelector('.leaflet-bottom.leaflet-right');
            if (rightGroup) rightGroup.style.transform = 'translateX(0)';
            if (basemapSwitcher) basemapSwitcher.style.transform = 'translateX(0)';
            if (leafletRight) leafletRight.style.transform = 'translateX(0)';
        }
    }
}

async function loadStatistik() {
    try {
        const response = await fetch(CONFIG.geojsonPath + 'csvjson.json');
        if (!response.ok) throw new Error('Gagal memuat statistik');
        state.statistikData = await response.json();
        renderStatsSidebar();

        // Background load village-level landslide data for statistics dashboard
        fetch(CONFIG.geojsonPath + 'Batas_Wilayah_Desalongsor_With_Kec.json')
            .then(res => {
                if (res.ok) return res.json();
                throw new Error('Gagal memuat GeoJSON desa');
            })
            .then(data => {
                state.geojsonCache['Batas_Wilayah_Desalongsor_With_Kec.json'] = data;
                // If landslide layer is active, refresh leaderboard stats
                if (state.activeLayers.includes('longsor_desa')) {
                    renderGlobalStats();
                }
            })
            .catch(err => console.error('Error background loading desa stats:', err));
    } catch (err) {
        console.error('Error loading statistik:', err);
        state.statistikData = [];
    }
}

// ========================================
// STATISTIK SIDEBAR — REDESIGNED (Accordion + Toggle)
// ========================================

window.setStatsTab = async function(mode) {
    state.statsMode = mode;
    state.expandedKecamatan = null;
    const tabPotensi = document.getElementById('tabBtnPotensi');
    const tabKejadian = document.getElementById('tabBtnKejadian');
    if (tabPotensi) tabPotensi.classList.toggle('active', mode === 'potensi');
    if (tabKejadian) tabKejadian.classList.toggle('active', mode === 'kejadian');

    if (mode === 'potensi') {
        if (state.activeLayers.includes('longsor_desa')) await toggleLayer('longsor_desa');
        if (!state.activeLayers.includes('longsor_mean')) await toggleLayer('longsor_mean');
    } else if (mode === 'kejadian') {
        if (state.activeLayers.includes('longsor_mean')) await toggleLayer('longsor_mean');
        if (!state.activeLayers.includes('longsor_desa')) await toggleLayer('longsor_desa');
    }

    renderStatsSidebar();
}

function renderStatsSidebar() {
    if (typeof Chart === 'undefined') return;
    // Remove old back button if present
    const oldBack = document.getElementById('statBackBtn');
    if (oldBack) oldBack.remove();

    if (state.statsMode === 'potensi') {
        if (!state.statistikData) { _showStatLoading('Memuat data kerawanan...'); return; }
        _renderPotensiStats();
    } else {
        const desaGeojson = state.geojsonCache['Batas_Wilayah_Desalongsor_With_Kec.json'];
        if (!desaGeojson) { _showStatLoading('Memuat data kejadian longsor...'); return; }
        _renderKejadianStats();
    }
}

function _showStatLoading(msg) {
    const ph = document.getElementById('statPlaceholder');
    const ct = document.getElementById('statDataContainer');
    if (ph) { ph.style.display = 'block'; ph.innerHTML = `<span style="font-size:24px;display:inline-block;animation:spin 2s linear infinite;">🔄</span><br>${msg}`; }
    if (ct) ct.style.display = 'none';
}

function _showStatsContainer(title) {
    document.getElementById('statPlaceholder').style.display = 'none';
    document.getElementById('statDataContainer').style.display = 'block';
    document.getElementById('statTitle').innerHTML = title;
}

// ─── POTENSI MODE ───
function _renderPotensiStats() {
    const kecDataMap = {};
    state.statistikData.forEach(item => {
        const kec = item.WADMKC;
        if (!kecDataMap[kec]) kecDataMap[kec] = 0;
        if (item.KelasAkhir === 'Tinggi' || item.KelasAkhir === 'Sangat Tinggi') {
            const s = typeof item.SUM_Luas_Km2 === 'string' ? item.SUM_Luas_Km2.replace(',', '.') : item.SUM_Luas_Km2;
            kecDataMap[kec] += parseFloat(s) || 0;
        }
    });
    const sorted = Object.entries(kecDataMap).map(([kec, total]) => ({ kec, total })).sort((a, b) => b.total - a.total);
    _showStatsContainer('Peringkat Kerawanan Wilayah');
    _renderPotensiChart(sorted);
    _renderAccordionPotensi(sorted);
}

function _renderPotensiChart(sorted) {
    const chartId = 'statChartCanvas';
    const ctx = document.getElementById(chartId);
    if (!ctx) return;
    if (state.charts[chartId]) state.charts[chartId].destroy();
    const oldLegend = document.getElementById('chartGradientLegend');
    if (oldLegend) oldLegend.remove();

    // Horizontal bar chart: all kecamatan ranking
    const reversed = [...sorted].reverse();
    const labels = reversed.map(s => s.kec);
    const data = reversed.map(s => s.total);
    const maxVal = Math.max(...data, 1);
    const bgColors = data.map(v => { const r=v/maxVal; return `rgb(${Math.round(254+(215-254)*r)},${Math.round(224+(48-224)*r)},${Math.round(139+(39-139)*r)})`; });
    ctx.parentElement.style.height = (labels.length * 22 + 40) + 'px';
    Chart.defaults.color = '#a0a0b8'; Chart.defaults.font.family = "'Inter', sans-serif";
    if (!document.getElementById('chartGradientLegend')) {
        ctx.parentElement.insertAdjacentHTML('afterend', `<div id="chartGradientLegend"><div class="chart-gradient-legend"></div><div class="chart-gradient-labels"><span>Sangat Rendah</span><span>Sangat Tinggi</span></div></div>`);
    }
    state.charts[chartId] = new Chart(ctx, {
        type: 'bar', data: { labels, datasets: [{ data, backgroundColor: bgColors, borderWidth: 0, borderRadius: 2 }] },
        options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,15,26,0.95)', titleColor: '#f0f0f5', bodyColor: '#f0f0f5', padding: 10, callbacks: { label: c => ` ${c.raw.toFixed(2)} km²` } } },
            scales: { x: { display: false, max: maxVal }, y: { grid: { display: false }, ticks: { color: '#f0f0f5', font: { size: 10 } } } } }
    });
}

function _renderAccordionPotensi(sorted) {
    const maxVal = Math.max(...sorted.map(s => s.total), 1);
    let html = `<table class="stat-accordion"><tr class="kec-header-row"><th>Kecamatan</th><th style="text-align:right;">Luas Tinggi (km²)</th></tr>`;
    sorted.forEach(({ kec, total }) => {
        const r = total/maxVal;
        const vc = `rgb(${Math.round(254+(215-254)*r)},${Math.round(224+(48-224)*r)},${Math.round(139+(39-139)*r)})`;
        const sk = kec.replace(/'/g, "\\'");
        html += `<tr class="kec-row" onclick="window.flyToKecamatan('${sk}')" title="Klik untuk zoom ke kecamatan"><td>${kec}</td><td style="text-align:right;color:${vc};font-weight:700;">${total.toFixed(1)}</td></tr>`;
    });
    html += '</table>';
    document.getElementById('statTableContainer').innerHTML = html;
}

// ─── KEJADIAN MODE ───
function _renderKejadianStats() {
    const desaGeojson = state.geojsonCache['Batas_Wilayah_Desalongsor_With_Kec.json'];
    const yearField = state.selectedLandslideYear || 'TOTAL_AKUM';
    const yearLabel = {'TOTAL_LONG':'2021','TOTAL_LO_1':'2022','TOTAL_LO_2':'2023','TOTAL_LO_3':'2024','TOTAL_LO_4':'2025','TOTAL_AKUM':'Total 2021-2025'}[yearField];
    const kecDataMap = {};
    desaGeojson.features.forEach(f => {
        const kec = f.properties.WADMKC?.trim();
        if (!kec) return;
        if (!kecDataMap[kec]) kecDataMap[kec] = { total: 0, desas: [] };
        const cnt = parseInt(f.properties[yearField] ?? 0);
        kecDataMap[kec].total += cnt;
        kecDataMap[kec].desas.push({ 
            name: f.properties.NAMOBJ, 
            count: cnt,
            c21: parseInt(f.properties['TOTAL_LONG'] ?? 0),
            c22: parseInt(f.properties['TOTAL_LO_1'] ?? 0),
            c23: parseInt(f.properties['TOTAL_LO_2'] ?? 0),
            c24: parseInt(f.properties['TOTAL_LO_3'] ?? 0),
            c25: parseInt(f.properties['TOTAL_LO_4'] ?? 0)
        });
    });
    const sorted = Object.entries(kecDataMap)
        .map(([kec, d]) => ({ kec, total: d.total, desas: d.desas.sort((a, b) => b.count - a.count) }))
        .sort((a, b) => b.total - a.total);
    _showStatsContainer(`Kejadian Longsor (${yearLabel})`);
    _renderKejadianChart(sorted, desaGeojson, yearField);
    _renderAccordionKejadian(sorted);
}

function _renderKejadianChart(sorted, desaGeojson, yearField) {
    const chartId = 'statChartCanvas';
    const ctx = document.getElementById(chartId);
    if (!ctx) return;
    if (state.charts[chartId]) state.charts[chartId].destroy();
    const oldLegend = document.getElementById('chartGradientLegend');
    if (oldLegend) oldLegend.remove();

    if (state.expandedKecamatan) {
        // Line chart: yearly trend for selected kecamatan
        const desas = desaGeojson.features.filter(f => f.properties.WADMKC?.trim().toUpperCase() === state.expandedKecamatan.trim().toUpperCase());
        const ys = {2021:0,2022:0,2023:0,2024:0,2025:0};
        desas.forEach(d => { ys[2021]+=parseInt(d.properties['TOTAL_LONG']??0); ys[2022]+=parseInt(d.properties['TOTAL_LO_1']??0); ys[2023]+=parseInt(d.properties['TOTAL_LO_2']??0); ys[2024]+=parseInt(d.properties['TOTAL_LO_3']??0); ys[2025]+=parseInt(d.properties['TOTAL_LO_4']??0); });
        ctx.parentElement.style.height = '180px';
        state.charts[chartId] = new Chart(ctx, {
            type: 'line',
            data: { labels: ['2021','2022','2023','2024','2025'], datasets: [{ label: 'Kejadian Longsor', data: [ys[2021],ys[2022],ys[2023],ys[2024],ys[2025]], borderColor: '#fc8d59', backgroundColor: 'rgba(252,141,89,0.15)', borderWidth: 2.5, fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: '#fc8d59' }] },
            options: { responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,15,26,0.95)', titleColor: '#f0f0f5', bodyColor: '#f0f0f5', padding: 10 } },
                scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a0b8', font: { size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a0b8', stepSize: 1, font: { size: 11 } } } } }
        });
    } else {
        // Horizontal bar chart: all kecamatan ranking
        const reversed = [...sorted].reverse();
        const labels = reversed.map(s => s.kec);
        const data = reversed.map(s => s.total);
        const maxVal = Math.max(...data, 1);
        const bgColors = data.map(v => { const r=v/maxVal; return `rgb(${Math.round(254+(136-254)*r)},${Math.round(224+(14-224)*r)},${Math.round(139+(79-139)*r)})`; });
        ctx.parentElement.style.height = (labels.length * 22 + 40) + 'px';
        Chart.defaults.color = '#a0a0b8'; Chart.defaults.font.family = "'Inter', sans-serif";
        state.charts[chartId] = new Chart(ctx, {
            type: 'bar', data: { labels, datasets: [{ data, backgroundColor: bgColors, borderWidth: 0, borderRadius: 2 }] },
            options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                onClick: (e, el) => { if (el.length > 0) window.toggleAccordionKec(labels[el[0].index]); },
                onHover: (e, el) => { e.native.target.style.cursor = el.length ? 'pointer' : 'default'; },
                plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(15,15,26,0.95)', titleColor: '#f0f0f5', bodyColor: '#f0f0f5', padding: 10, callbacks: { label: c => ` ${c.raw} kali kejadian` } } },
                scales: { x: { display: false, max: maxVal }, y: { grid: { display: false }, ticks: { color: '#f0f0f5', font: { size: 10 } } } } }
        });
    }
}

function _renderAccordionKejadian(sorted) {
    const expandedKec = state.expandedKecamatan;
    const maxVal = Math.max(...sorted.map(s => s.total), 1);
    const yearField = state.selectedLandslideYear || 'TOTAL_AKUM';
    const yearLabel = {'TOTAL_LONG':'2021','TOTAL_LO_1':'2022','TOTAL_LO_2':'2023','TOTAL_LO_3':'2024','TOTAL_LO_4':'2025','TOTAL_AKUM':'Total 2021-2025'}[yearField];
    const grandTotal = sorted.reduce((sum, s) => sum + s.total, 0);

    let html = `<table class="stat-accordion"><tr class="kec-header-row"><th>Kecamatan</th><th style="text-align:right;">Kejadian</th></tr>`;
    sorted.forEach(({ kec, total, desas }) => {
        const isExpanded = expandedKec === kec;
        const r = total/maxVal;
        const cc = `rgb(${Math.round(254+(136-254)*r)},${Math.round(224+(14-224)*r)},${Math.round(139+(79-139)*r)})`;
        const sk = kec.replace(/'/g, "\\'");
        html += `<tr class="kec-row" onclick="window.toggleAccordionKec('${sk}')"><td><span class="kec-chevron ${isExpanded?'open':''}">▶</span>${kec}</td><td style="text-align:right;color:${cc};font-weight:700;">${total} kali</td></tr>`;
        if (isExpanded) {
            const desasWithData = desas.filter(d => d.count > 0);
            if (desasWithData.length > 0) {
                html += `<tr class="desa-subheader"><td colspan="2" style="padding:6px 8px 4px 28px;font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Daftar Desa (${desasWithData.length} desa)</td></tr>`;
                desasWithData.forEach(d => { 
                    html += `<tr class="desa-row" onclick="window.flyToDesa('${d.name.replace(/'/g,"\\'")}')" title="Klik untuk zoom ke desa">
                        <td colspan="2">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <span>📍 ${d.name}</span>
                                <span style="color:var(--accent-light); font-weight:700;">${d.count} kali Total Kejadian</span>
                            </div>
                            <div class="yearly-grid">
                                <div class="yearly-cell"><span class="yearly-year">2021</span><span class="yearly-count ${d.c21===0?'zero':''}">${d.c21}</span></div>
                                <div class="yearly-cell"><span class="yearly-year">2022</span><span class="yearly-count ${d.c22===0?'zero':''}">${d.c22}</span></div>
                                <div class="yearly-cell"><span class="yearly-year">2023</span><span class="yearly-count ${d.c23===0?'zero':''}">${d.c23}</span></div>
                                <div class="yearly-cell"><span class="yearly-year">2024</span><span class="yearly-count ${d.c24===0?'zero':''}">${d.c24}</span></div>
                                <div class="yearly-cell"><span class="yearly-year">2025</span><span class="yearly-count ${d.c25===0?'zero':''}">${d.c25}</span></div>
                            </div>
                        </td>
                    </tr>`;
                });
            } else {
                html += `<tr class="desa-subheader"><td colspan="2" style="padding:8px 8px 8px 28px;font-size:11px;color:var(--text-muted);font-style:italic;">Tidak ada kejadian longsor</td></tr>`;
            }
        }
    });
    html += `<tr class="kec-header-row" style="background: rgba(255,255,255,0.05); border-top: 1px solid rgba(255,255,255,0.1);"><td style="font-weight: 700; font-size: 11px;">Total Longsor (${yearLabel})</td><td style="text-align:right; font-weight: 700; color: #fc8d59;">${grandTotal} kali</td></tr>`;
    html += '</table>';
    document.getElementById('statTableContainer').innerHTML = html;
}

// ─── ACCORDION TOGGLE (kecamatan expand/collapse + fly to) ───
window.toggleAccordionKec = function(kecName) {
    if (state.expandedKecamatan === kecName) {
        state.expandedKecamatan = null;
    } else {
        state.expandedKecamatan = kecName;
        flyToKecamatan(kecName); // Fly to kecamatan bounds (Opsi A)
    }
    renderStatsSidebar();
}

// ─── LEGACY STUB (kept for compatibility) ───
function renderGlobalStats() { renderStatsSidebar(); }

/* ─── End of stats redesign block ─── */


window.flyToKecamatan = async function(kecamatan) {
    if (!state.activeLayers.includes('batas_kecamatan')) {
        await loadLayer('batas_kecamatan');
        const cb = document.querySelector('input[data-layer="batas_kecamatan"]');
        if (cb) cb.checked = true;
    }

    const layerGroup = state.layersInstance['batas_kecamatan'];
    if (!layerGroup) return;

    let targetLayer = null;
    const normalizedInput = kecamatan.replace(/\s+/g, '').toLowerCase();
    layerGroup.eachLayer(layer => {
        const wadmkc = layer.feature.properties.WADMKC;
        if (wadmkc && wadmkc.replace(/\s+/g, '').toLowerCase() === normalizedInput) {
            targetLayer = layer;
        }
    });

    if (targetLayer) {
        state.map.flyToBounds(targetLayer.getBounds(), { duration: 1.5, padding: [50, 50] });
        // Open popup after fly animation completes
        setTimeout(() => {
            targetLayer.openPopup(targetLayer.getBounds().getCenter());
        }, 1600);
    }
}

// Legacy stub for any remaining references
window.showKecamatanStats = function(kecName) {
    state.expandedKecamatan = kecName;
    renderStatsSidebar();
}

// ========================================
// POPUP KEJADIAN CHART (Contoh 2 style)
// ========================================
function renderPopupKejadianChart(wadmokc) {
    const desaGeojson = state.geojsonCache['Batas_Wilayah_Desalongsor_With_Kec.json'];
    if (!desaGeojson || typeof Chart === 'undefined') return;

    const yearField = state.selectedLandslideYear || 'TOTAL_AKUM';
    const yearLabel = { 'TOTAL_LONG':'2021','TOTAL_LO_1':'2022','TOTAL_LO_2':'2023','TOTAL_LO_3':'2024','TOTAL_LO_4':'2025','TOTAL_AKUM':'Total' }[yearField];
    const safeId = wadmokc.replace(/\s+/g, '-');
    const chartId = 'chart-' + safeId;
    const tableId = 'table-' + safeId;
    const ctx = document.getElementById(chartId);
    if (!ctx) return;

    if (state.charts[chartId]) state.charts[chartId].destroy();

    const allDesas = desaGeojson.features
        .filter(f => f.properties.WADMKC && f.properties.WADMKC.replace(/\s+/g, '').toUpperCase() === wadmokc.replace(/\s+/g, '').toUpperCase())
        .sort((a, b) => parseInt(b.properties[yearField] || 0) - parseInt(a.properties[yearField] || 0));

    const desasWithData = allDesas.filter(f => parseInt(f.properties[yearField] || 0) > 0);
    const labels = desasWithData.map(f => f.properties.NAMOBJ);
    const data = desasWithData.map(f => parseInt(f.properties[yearField] || 0));
    const palette = ['#4dc9f6','#f67019','#f53794','#537bc4','#acc236','#166a8f','#00a950','#58595b','#8549ba','#fc8d59','#2dd4a0','#e34f1c'];
    const bgColors = labels.map(function(_, i) { return palette[i % palette.length]; });

    if (data.length === 0) {
        const tableEl = document.getElementById(tableId);
        if (tableEl) tableEl.innerHTML = '<div style="text-align:center;padding:10px;color:var(--text-muted);font-size:11px;">Tidak ada kejadian longsor pada periode ini</div>';
        return;
    }

    Chart.defaults.color = '#a0a0b8';
    state.charts[chartId] = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: labels, datasets: [{ data: data, backgroundColor: bgColors, borderWidth: 1, borderColor: 'rgba(15,15,26,0.9)', hoverOffset: 4 }] },
        options: {
            responsive: true, maintainAspectRatio: false, cutout: '60%',
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: 'rgba(15,15,26,0.95)', titleColor: '#f0f0f5', bodyColor: '#f0f0f5', padding: 8, callbacks: { label: function(c) { return ' ' + c.label + ': ' + c.raw + ' kali'; } } }
            }
        }
    });

    var tableHtml = '<table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:11px;">';
    tableHtml += '<tr style="border-bottom:1px solid var(--glass-border);">';
    tableHtml += '<th style="text-align:left;padding:5px 3px;color:var(--text-secondary);font-weight:600;">DESA</th>';
    tableHtml += '<th style="text-align:right;padding:5px 3px;color:var(--text-secondary);font-weight:600;">KEJ. (' + yearLabel + ')</th>';
    tableHtml += '</tr>';

    desasWithData.forEach(function(f, idx) {
        var count = parseInt(f.properties[yearField] || 0);
        var dotColor = bgColors[idx % bgColors.length];
        tableHtml += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">';
        tableHtml += '<td style="padding:4px 3px;"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:' + dotColor + ';margin-right:5px;vertical-align:middle;"></span>' + f.properties.NAMOBJ + '</td>';
        tableHtml += '<td style="text-align:right;padding:4px 3px;font-weight:700;color:#f0f0f5;">' + count + '</td>';
        tableHtml += '</tr>';
    });
    tableHtml += '</table>';

    var tableEl = document.getElementById(tableId);
    if (tableEl) tableEl.innerHTML = tableHtml;
}
window.flyToDesa = function(desaName) {
    const layerGroup = state.layersInstance['longsor_desa'];
    if (!layerGroup) return;

    let targetLayer = null;
    layerGroup.eachLayer(layer => {
        if (layer.feature.properties.NAMOBJ && layer.feature.properties.NAMOBJ.toLowerCase() === desaName.toLowerCase()) {
            targetLayer = layer;
        }
    });

    if (targetLayer) {
        state.map.flyToBounds(targetLayer.getBounds(), {
            duration: 1.5,
            padding: [50, 50]
        });
        setTimeout(() => {
            targetLayer.openPopup();
        }, 800);
    }
}

function updateSidebarStats() {
    renderStatsSidebar();
}

function updateLandslideYearSelector() {
    let selector = document.getElementById('landslideYearSelector');
    const isDesaActive = state.activeLayers.includes('longsor_desa');

    if (!isDesaActive) {
        if (selector) selector.style.display = 'none';
        return;
    }

    if (!selector) {
        selector = document.createElement('div');
        selector.id = 'landslideYearSelector';
        selector.className = 'landslide-year-selector';
        document.body.appendChild(selector);
    }

    selector.style.display = 'flex';

    const years = [
        { field: 'TOTAL_LONG', label: '2021' },
        { field: 'TOTAL_LO_1', label: '2022' },
        { field: 'TOTAL_LO_2', label: '2023' },
        { field: 'TOTAL_LO_3', label: '2024' },
        { field: 'TOTAL_LO_4', label: '2025' },
        { field: 'TOTAL_AKUM', label: 'Semua (Akumulasi)' }
    ];

    const currentField = state.selectedLandslideYear || 'TOTAL_AKUM';

    selector.innerHTML = `
        <div class="selector-title">Pilih Tahun:</div>
        <div class="selector-buttons">
            ${years.map(y => `
                <button class="selector-btn ${y.field === currentField ? 'active' : ''}" 
                        onclick="setLandslideYear('${y.field}')">${y.label}</button>
            `).join('')}
        </div>
    `;
}

window.setLandslideYear = function(field) {
    state.selectedLandslideYear = field;
    updateLandslideYearSelector();

    const layer = state.layersInstance['longsor_desa'];
    if (layer) {
        layer.setStyle(feature => getLayerStyle(CONFIG.layers['longsor_desa'], feature));
        layer.eachLayer(subLayer => {
            bindPopup(CONFIG.layers['longsor_desa'], subLayer.feature, subLayer);
        });
    }

    updateLegend();
    updateSidebarStats();
}

function renderPopupChart(wadmokc) {
    if (!state.statistikData || typeof Chart === 'undefined') return;
    const normalizedInput = wadmokc.replace(/\s+/g, '').toLowerCase();
    const dataKec = state.statistikData.filter(d => d.WADMKC.replace(/\s+/g, '').toLowerCase() === normalizedInput);
    if (dataKec.length === 0) return;

    const safeId = wadmokc.replace(/\s+/g, '-');
    const chartId = `chart-${safeId}`;
    const tableId = `table-${safeId}`;
    const ctx = document.getElementById(chartId);
    if (!ctx) return;

    if (state.charts[chartId]) state.charts[chartId].destroy();

    const order = ['Sangat Rendah', 'Rendah', 'Sedang', 'Tinggi', 'Sangat Tinggi'];
    dataKec.sort((a, b) => order.indexOf(a.KelasAkhir) - order.indexOf(b.KelasAkhir));

    let totalLuas = 0;
    dataKec.forEach(item => {
        const luasStr = typeof item.SUM_Luas_Km2 === 'string' ? item.SUM_Luas_Km2.replace(',', '.') : item.SUM_Luas_Km2;
        totalLuas += parseFloat(luasStr) || 0;
    });

    const labels = [];
    const dataPercent = [];
    const bgColors = [];

    let tableHtml = `<table class="statistik-table" style="width:100%; border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--glass-border);"><th style="text-align:left; padding:6px 4px; font-size:11px; color:var(--text-secondary);">Kerawanan</th><th style="text-align:right; padding:6px 4px; font-size:11px; color:var(--text-secondary);">Luas</th></tr>`;

    dataKec.forEach(item => {
        const kelas = item.KelasAkhir;
        const luasStr = typeof item.SUM_Luas_Km2 === 'string' ? item.SUM_Luas_Km2.replace(',', '.') : item.SUM_Luas_Km2;
        const luas = parseFloat(luasStr) || 0;
        const percent = totalLuas > 0 ? (luas / totalLuas) * 100 : 0;

        labels.push(kelas);
        dataPercent.push(percent);
        const color = CONFIG.colors.longsor[kelas] || '#cccccc';
        bgColors.push(color);

        tableHtml += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:6px 4px; font-size:12px; display:flex; align-items:center; gap:6px;">
                <span style="display:inline-block; width:10px; height:10px; border-radius:2px; background:${color}"></span>
                <span style="color:var(--text-primary);">${kelas}</span>
            </td>
            <td style="text-align:right; padding:6px 4px; font-size:12px; font-weight:600; color:var(--accent-light);">${luas.toFixed(1)}</td>
        </tr>`;
    });
    tableHtml += `</table>`;

    document.getElementById(tableId).innerHTML = tableHtml;

    Chart.defaults.color = '#a0a0b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    state.charts[chartId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: dataPercent,
                backgroundColor: bgColors,
                borderWidth: 1,
                borderColor: 'rgba(15, 15, 26, 0.9)',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 26, 0.95)',
                    titleColor: '#f0f0f5',
                    bodyColor: '#f0f0f5',
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

// ========================================
// KECAMATAN SPATIAL LOOKUP
// ========================================
async function preloadKecamatanData() {
    try {
        const file = 'Batas_Wilayah_Kecamatan_Bappeda.json';
        if (!state.geojsonCache[file]) {
            const response = await fetch(CONFIG.geojsonPath + file);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            state.geojsonCache[file] = await response.json();
        }
        console.log('✅ Kecamatan data preloaded for spatial lookup');
    } catch (err) {
        console.warn('⚠️ Failed to preload kecamatan data:', err);
    }
}

function findKecamatan(latlng) {
    const kecGeoJSON = state.geojsonCache['Batas_Wilayah_Kecamatan_Bappeda.json'];
    if (!kecGeoJSON || typeof turf === 'undefined') return null;
    const point = turf.point([latlng.lng, latlng.lat]);
    for (const feature of kecGeoJSON.features) {
        try {
            if (turf.booleanPointInPolygon(point, feature)) {
                return feature.properties.WADMKC || null;
            }
        } catch (e) { continue; }
    }
    return null;
}

// ========================================
// PARAMETER POPUP CHART (per Kecamatan)
// Uses point-sampling for robust area estimation
// ========================================

// Cache for computed area estimates: key = "kecamatan|category" → { classAreas }
const _paramAreaCache = {};
// Cache for simplified parameter features per category
const _simplifiedParamCache = {};

function renderPopupParameterChart(kecamatan, category, safeId) {
    const chartId = 'chart-' + safeId;
    const tableId = 'table-' + safeId;
    const ctx = document.getElementById(chartId);
    if (!ctx) return;

    if (state.charts[chartId]) state.charts[chartId].destroy();

    // Find the active layer's GeoJSON data for this category
    const activeKey = state.activeLayers.find(k => CONFIG.layers[k]?.category === category);
    if (!activeKey) return;
    const config = CONFIG.layers[activeKey];
    const geojsonData = state.geojsonCache[config.file];
    if (!geojsonData) return;

    // Field mappings for each category
    const fieldMap = {
        hujan: 'Kelas_FCH',
        kelerengan: 'Kelas_FKL',
        bebatuan: 'Kelas_FJB',
        tanah: 'Kelas_FJT',
        lahan: 'Kelas_FPL'
    };
    const kelasField = fieldMap[category];
    if (!kelasField) return;

    // Get kecamatan polygon
    const kecGeoJSON = state.geojsonCache['Batas_Wilayah_Kecamatan_Bappeda.json'];
    if (!kecGeoJSON || typeof turf === 'undefined') return;

    let kecFeature = null;
    for (const f of kecGeoJSON.features) {
        if (f.properties.WADMKC && f.properties.WADMKC.trim().toUpperCase() === kecamatan.trim().toUpperCase()) {
            kecFeature = f;
            break;
        }
    }
    if (!kecFeature) return;

    // Check cache first
    const cacheKey = kecamatan.trim().toUpperCase() + '|' + category;
    let classAreas = _paramAreaCache[cacheKey];

    if (!classAreas) {
        try {
            classAreas = _computeAreasBySampling(kecFeature, geojsonData, kelasField, category);
        } catch (e) {
            console.warn('Area sampling failed for', kecamatan, category, e);
            classAreas = {};
        }
        _paramAreaCache[cacheKey] = classAreas;
    }

    const colors = CONFIG.colors[category] || {};
    const entries = Object.entries(classAreas).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
        const tableEl = document.getElementById(tableId);
        if (tableEl) tableEl.innerHTML = '<div style="text-align:center;padding:10px;color:var(--text-muted);font-size:11px;">Tidak ada data di kecamatan ini</div>';
        return;
    }

    const totalArea = entries.reduce((sum, [, area]) => sum + area, 0);
    const labels = entries.map(([k]) => k);
    const data = entries.map(([, v]) => v);
    const bgColors = entries.map(([k]) => colors[k] || '#cccccc');

    // Build table with area in km²
    let tableHtml = `<table class="statistik-table" style="width:100%; border-collapse:collapse;">
        <tr style="border-bottom:1px solid var(--glass-border);">
            <th style="text-align:left; padding:6px 4px; font-size:11px; color:var(--text-secondary);">Kelas</th>
            <th style="text-align:right; padding:6px 4px; font-size:11px; color:var(--text-secondary);">Luas (km²)</th>
            <th style="text-align:right; padding:6px 4px; font-size:11px; color:var(--text-secondary);">%</th>
        </tr>`;

    entries.forEach(([kelas, area]) => {
        const percent = totalArea > 0 ? ((area / totalArea) * 100).toFixed(1) : '0.0';
        const color = colors[kelas] || '#cccccc';
        tableHtml += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
            <td style="padding:6px 4px; font-size:12px; display:flex; align-items:center; gap:6px;">
                <span style="display:inline-block; width:10px; height:10px; border-radius:2px; background:${color}"></span>
                <span style="color:var(--text-primary);">${kelas}</span>
            </td>
            <td style="text-align:right; padding:6px 4px; font-size:12px; font-weight:600; color:var(--accent-light);">${area.toFixed(2)}</td>
            <td style="text-align:right; padding:6px 4px; font-size:12px; color:var(--text-muted);">${percent}%</td>
        </tr>`;
    });
    tableHtml += '</table>';

    const tableEl = document.getElementById(tableId);
    if (tableEl) tableEl.innerHTML = tableHtml;

    // Render doughnut chart with area data
    Chart.defaults.color = '#a0a0b8';
    Chart.defaults.font.family = "'Inter', sans-serif";

    state.charts[chartId] = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: bgColors,
                borderWidth: 1,
                borderColor: 'rgba(15, 15, 26, 0.9)',
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 15, 26, 0.95)',
                    titleColor: '#f0f0f5',
                    bodyColor: '#f0f0f5',
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            const areaKm2 = context.raw.toFixed(2);
                            const pct = totalArea > 0 ? ((context.raw / totalArea) * 100).toFixed(1) : '0.0';
                            return ` ${context.label}: ${areaKm2} km² (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Compute area per class using point-grid sampling.
 * Much faster and more robust than polygon intersection for complex geometries.
 */
function _computeAreasBySampling(kecFeature, geojsonData, kelasField, category) {
    // Total kecamatan area in km²
    const kecAreaKm2 = turf.area(kecFeature) / 1e6;

    // Simplify kecamatan for faster point-in-polygon checks
    let kecSimple;
    try {
        kecSimple = turf.simplify(kecFeature, { tolerance: 0.0005, highQuality: false });
    } catch (e) {
        kecSimple = kecFeature;
    }

    // Generate a sampling grid within kecamatan bbox (~500m spacing)
    const bbox = turf.bbox(kecFeature);
    const grid = turf.pointGrid(bbox, 0.5, { units: 'kilometers' });

    // Filter to points actually inside the kecamatan
    const insidePoints = [];
    for (const pt of grid.features) {
        try {
            if (turf.booleanPointInPolygon(pt, kecSimple)) {
                insidePoints.push(pt);
            }
        } catch (e) { /* skip */ }
    }

    if (insidePoints.length === 0) return {};

    // Get or create simplified parameter features (cached per category)
    if (!_simplifiedParamCache[category]) {
        _simplifiedParamCache[category] = geojsonData.features.map(f => {
            let simplified;
            try {
                simplified = turf.simplify(f, { tolerance: 0.001, highQuality: false });
            } catch (e) {
                simplified = f;
            }
            return {
                feature: simplified,
                kelas: category === 'kelerengan' ? mapKelerenganLabel(f.properties[kelasField] || 'Lainnya') : (f.properties[kelasField] || 'Lainnya'),
                bbox: turf.bbox(f)
            };
        });
    }
    const paramFeatures = _simplifiedParamCache[category];

    // For each sample point, determine which parameter class it falls into
    const classCounts = {};
    for (const pt of insidePoints) {
        const coord = pt.geometry.coordinates;
        for (const { feature, kelas, bbox: fBbox } of paramFeatures) {
            // Quick bbox check for the point
            if (coord[0] < fBbox[0] || coord[0] > fBbox[2] ||
                coord[1] < fBbox[1] || coord[1] > fBbox[3]) {
                continue;
            }
            try {
                if (turf.booleanPointInPolygon(pt, feature)) {
                    classCounts[kelas] = (classCounts[kelas] || 0) + 1;
                    break; // Point classified, move to next
                }
            } catch (e) { continue; }
        }
    }

    // Convert point counts to area estimates (proportional to kecamatan area)
    const totalSampled = Object.values(classCounts).reduce((s, v) => s + v, 0);
    const classAreas = {};
    if (totalSampled > 0) {
        for (const k in classCounts) {
            classAreas[k] = (classCounts[k] / totalSampled) * kecAreaKm2;
        }
    }

    return classAreas;
}


// ========================================
// LEGEND
// ========================================
function updateLegend() {
    const panel = document.getElementById('legendPanel');
    const activeDataLayers = state.activeLayers.filter(k => CONFIG.layers[k] && CONFIG.layers[k].category !== 'batas');

    if (activeDataLayers.length === 0) {
        panel.classList.remove('visible');
        return;
    }

    let html = '<div class="legend-title">Legenda</div>';

    // Build legend per-layer (not per-category) so longsor_desa shows kejadian colors
    activeDataLayers.forEach(layerKey => {
        const layerConf = CONFIG.layers[layerKey];
        if (layerConf.category === 'evakuasi' && layerKey !== 'evakuasi_rute') return;

        html += `<div class="legend-subtitle">${layerConf.label}</div>`;

        if (layerKey === 'evakuasi_rute') {
            html += `<div class="legend-item">
                <div class="legend-color" style="background: #00bfff; height: 3px; margin-top: 8px;"></div>
                <span class="legend-label">Jalur Evakuasi</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #a0a0a0; height: 1px; margin-top: 8px;"></div>
                <span class="legend-label">Jalan Umum</span>
            </div>
            <div class="legend-item" style="display:flex; align-items:center; gap:8px; padding-left: 2px;">
                <svg width="18" height="18" viewBox="0 0 24 24" style="overflow:visible;"><rect x="12" y="2" width="14" height="14" transform="rotate(45 12 2)" fill="white" stroke="#e65100" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#e65100"/></svg>
                <span class="legend-label">Titik Awal</span>
            </div>
            <div class="legend-item" style="display:flex; align-items:center; gap:8px;">
                <svg width="22" height="22" viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="4" fill="#81d4fa" stroke="#0277bd" stroke-width="2"/><path d="M12 7 L7 16 H17 Z" fill="#01579b"/><path d="M12 7 L12 16" stroke="white" stroke-width="1.5"/></svg>
                <span class="legend-label">Shelter Area</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #d73027; border: 1px solid rgba(255,255,255,0.4);"></div>
                <span class="legend-label">Potensi Sangat Tinggi</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #91cf60; border: 1px solid rgba(255,255,255,0.4);"></div>
                <span class="legend-label">Potensi Rendah</span>
            </div>`;
            return;
        }

        let colors = null;
        if (layerConf.isDesaKejadian) {
            colors = CONFIG.colors.longsor_desa;
        } else {
            colors = CONFIG.colors[layerConf.category];
        }

        // Mapping skor untuk semua layer parameter
        const skorMapping = {
            lahan: {
                'Tambak, waduk, perairan': 1,
                'Kota, Pemukiman, Bandara': 2,
                'Hutan dan perkebunan': 3,
                'Semak Belukar': 4,
                'Tegalan, sawah': 5
            },
            tanah: {
                'Aluvial, Planosol, Hidromorf': 1,
                'Latosol': 2,
                'Brown forest soil, Mediterian': 3,
                'Andosol, Laterit, Grumusol': 4,
                'Regosol, Litosol, Organosol': 5
            },
            bebatuan: {
                'Batu Aluvial': 1,
                'Batu Sedimentasi': 2,
                'Batu Vulkanik': 3
            },
            kelerengan: {
                'Datar (0 - 8%)': 1,
                'Landai (8 - 15%)': 2,
                'Agak Curam (15 - 30%)': 3,
                'Curam (30 - 45%)': 4,
                'Sangat Curam (>45%)': 5
            },
            hujan: {
                '2830 - 3000mm': 4,
                '3000 - 3988mm': 5
            }
        };

        const skorMap = skorMapping[layerConf.category] || null;

        if (colors) {
            for (const [label, color] of Object.entries(colors)) {
                const skorText = (skorMap && skorMap[label] !== undefined) 
                    ? ` <span style="opacity:0.7;">(Skor: ${skorMap[label]})</span>` 
                    : '';
                html += `<div class="legend-item">
                    <div class="legend-color" style="background: ${color}"></div>
                    <span class="legend-label">${label}${skorText}</span>
                </div>`;
            }
        }
    });

    panel.innerHTML = html;
    panel.classList.add('visible');
}

// ========================================
// INFO PANEL
// ========================================
function updateInfoPanel() {
    const panel = document.getElementById('infoPanel');
    const activeKeys = state.activeLayers.filter(k => {
        const config = CONFIG.layers[k];
        return config && config.category !== 'batas' && !config.hideMenu;
    });

    if (activeKeys.length === 0) {
        panel.classList.remove('visible');
        return;
    }

    let html = '<div class="info-panel-title">Layer Aktif</div>';

    activeKeys.forEach(key => {
        const config = CONFIG.layers[key];
        html += `<div class="info-panel-name" style="margin-bottom: 6px;">${config.label}</div>`;
    });

    panel.innerHTML = html;
    panel.classList.add('visible');
}

// ========================================
// TIME SLIDER
// ========================================
function updateTimeSlider() {
    const container = document.getElementById('timeSlider');
    if (!container) return; // Time Slider HTML removed

    // Find which yearly category has active layers
    let activeYearCategory = null;
    for (const key of state.activeLayers) {
        const config = CONFIG.layers[key];
        if (config && config.year && (config.category === 'longsor' || config.category === 'hujan')) {
            activeYearCategory = config.category;
            break;
        }
    }

    if (!activeYearCategory) {
        container.classList.remove('visible');
        state.activeCategory = null;
        return;
    }

    state.activeCategory = activeYearCategory;
    const catConfig = getCategoryConfig(activeYearCategory);

    if (!catConfig || !catConfig.years) {
        container.classList.remove('visible');
        return;
    }

    // Find current year
    const activeYearKey = state.activeLayers.find(k => CONFIG.layers[k]?.category === activeYearCategory);
    const currentYear = CONFIG.layers[activeYearKey]?.year || catConfig.years[0];

    // Update slider UI
    const slider = document.getElementById('timeSliderInput');
    const yearDisplay = document.getElementById('timeSliderYear');
    const yearLabel = document.getElementById('timeSliderLabel');

    slider.min = 0;
    slider.max = catConfig.years.length - 1;
    slider.value = catConfig.years.indexOf(currentYear);
    yearDisplay.textContent = currentYear;
    yearLabel.textContent = catConfig.label;

    // Update year markers
    const markers = document.getElementById('timeSliderYears');
    markers.innerHTML = catConfig.years.map((y, i) =>
        `<span class="${y === currentYear ? 'active' : ''}" onclick="setTimeSliderYear(${i})">${y}</span>`
    ).join('');

    container.classList.add('visible');
}

function onTimeSliderChange(index) {
    if (!state.activeCategory) return;

    const catConfig = getCategoryConfig(state.activeCategory);
    if (!catConfig || !catConfig.years) return;

    const year = catConfig.years[index];
    if (!year) return;

    document.getElementById('timeSliderYear').textContent = year;

    document.querySelectorAll('#timeSliderYears span').forEach((el, i) => {
        el.classList.toggle('active', i === parseInt(index));
    });

    // Remove current layer of this category, add new one
    const oldKey = state.activeLayers.find(k => CONFIG.layers[k]?.category === state.activeCategory);
    const newKey = `${state.activeCategory}_${year}`;

    if (oldKey === newKey) return;

    if (oldKey) {
        removeLayer(oldKey);
        const oldCb = document.querySelector(`input[data-layer="${oldKey}"]`);
        if (oldCb) oldCb.checked = false;
    }

    loadLayer(newKey);
    const newCb = document.querySelector(`input[data-layer="${newKey}"]`);
    if (newCb) newCb.checked = true;
}

function setTimeSliderYear(index) {
    const slider = document.getElementById('timeSliderInput');
    slider.value = index;
    onTimeSliderChange(index);
}

function togglePlay() {
    const btn = document.getElementById('timeSliderPlay');
    if (state.playInterval) {
        clearInterval(state.playInterval);
        state.playInterval = null;
        btn.textContent = '▶';
        return;
    }

    btn.textContent = '⏸';
    const slider = document.getElementById('timeSliderInput');
    const max = parseInt(slider.max);

    state.playInterval = setInterval(() => {
        let current = parseInt(slider.value);
        current = (current + 1) > max ? 0 : current + 1;
        slider.value = current;
        onTimeSliderChange(current);

        if (current === max) {
            clearInterval(state.playInterval);
            state.playInterval = null;
            btn.textContent = '▶';
        }
    }, 2000);
}

// ========================================
// SWIPE COMPARE TOOL
// ========================================
function initSwipeTool() {
    const handle = document.getElementById('swipeHandle');
    let isDragging = false;

    handle.addEventListener('mousedown', (e) => { isDragging = true; e.preventDefault(); });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !state.swipeActive) return;
        const mapEl = document.getElementById('map');
        const rect = mapEl.getBoundingClientRect();
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        x = Math.max(5, Math.min(95, x));
        setSwipePosition(x);
    });
    document.addEventListener('mouseup', () => { isDragging = false; });

    handle.addEventListener('touchstart', (e) => { isDragging = true; e.preventDefault(); });
    document.addEventListener('touchmove', (e) => {
        if (!isDragging || !state.swipeActive) return;
        const touch = e.touches[0];
        const mapEl = document.getElementById('map');
        const rect = mapEl.getBoundingClientRect();
        let x = ((touch.clientX - rect.left) / rect.width) * 100;
        x = Math.max(5, Math.min(95, x));
        setSwipePosition(x);
    });
    document.addEventListener('touchend', () => { isDragging = false; });
}

function setSwipePosition(percent) {
    state.swipePosition = percent;
    const handle = document.getElementById('swipeHandle');
    handle.style.left = percent + '%';

    const keys = state.activeLayers.filter(k => CONFIG.layers[k]?.category !== 'batas');
    if (keys.length >= 2) {
        // Clip the first layer's pane so the second layer shows through
        const firstLayer = state.layersInstance[keys[0]];
        if (firstLayer && firstLayer._paneId) {
            const pane = state.map.getPane(firstLayer._paneId);
            if (pane) {
                pane.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
            }
        }
    }

    const lblLeft = document.getElementById('swipeLabelLeft');
    const lblRight = document.getElementById('swipeLabelRight');
    if (lblLeft) lblLeft.style.right = `calc(${100 - percent}% + 20px)`;
    if (lblRight) lblRight.style.left = `calc(${percent}% + 20px)`;
}

function enableSwipe() {
    const keys = state.activeLayers.filter(k => CONFIG.layers[k]?.category !== 'batas');
    if (keys.length < 2) return;

    state.swipeActive = true;
    document.getElementById('swipeHandle').classList.add('active');
    document.getElementById('swipeLabelLeft').classList.add('active');
    document.getElementById('swipeLabelRight').classList.add('active');

    document.getElementById('swipeLabelLeft').textContent = CONFIG.layers[keys[0]].label;
    document.getElementById('swipeLabelRight').textContent = CONFIG.layers[keys[1]].label;

    setSwipePosition(50);
}

function disableSwipe() {
    state.swipeActive = false;
    document.getElementById('swipeHandle').classList.remove('active');
    document.getElementById('swipeLabelLeft').classList.remove('active');
    document.getElementById('swipeLabelRight').classList.remove('active');

    // Remove clip from all layer panes
    Object.values(state.layersInstance).forEach(layer => {
        if (layer && layer._paneId) {
            const pane = state.map.getPane(layer._paneId);
            if (pane) pane.style.clipPath = '';
        }
    });
}

function toggleCompare() {
    const btn = document.getElementById('compareToggle');
    if (!btn) return;
    if (state.swipeActive) {
        disableSwipe();
        btn.classList.remove('active');
    } else {
        const dataKeys = state.activeLayers.filter(k => CONFIG.layers[k]?.category !== 'batas');
        if (dataKeys.length >= 2) {
            enableSwipe();
            btn.classList.add('active');
        }
    }
}

function updateCompareButton() {
    const btn = document.getElementById('compareToggle');
    if (!btn) return;
    const dataKeys = state.activeLayers.filter(k => CONFIG.layers[k]?.category !== 'batas');
    if (dataKeys.length >= 2) {
        btn.classList.add('visible');
    } else {
        btn.classList.remove('visible');
        if (state.swipeActive) disableSwipe();
        btn.classList.remove('active');
    }
}

// ========================================
// UI CONTROLLER
// ========================================
function togglePanel() {
    state.panelOpen = !state.panelOpen;
    document.getElementById('layerPanel').classList.toggle('open', state.panelOpen);
    document.querySelector('.menu-btn').classList.toggle('active', state.panelOpen);

    // Close stat sidebar if opening layer panel
    if (state.panelOpen) {
        const statSidebar = document.getElementById('statSidebar');
        if (statSidebar && statSidebar.classList.contains('open')) {
            statSidebar.classList.remove('open');
            document.getElementById('statToggleBtn').classList.remove('hidden');
            document.body.classList.remove('sidebar-open');
        }

        // Close bottom info panel if open
        const bottomPanel = document.getElementById('bottomInfoPanel');
        if (bottomPanel) bottomPanel.classList.remove('open');
    }

    // Shift compare button, basemap switcher, and zoom controls to avoid overlap
    const shift = state.panelOpen ? 'translateX(-348px)' : 'translateX(0)';
    const rightGroup = document.querySelector('.top-bar-right');
    const basemapSwitcher = document.getElementById('basemapSwitcher');
    const leafletRight = document.querySelector('.leaflet-bottom.leaflet-right');
    
    if (rightGroup) rightGroup.style.transform = shift;
    if (basemapSwitcher) basemapSwitcher.style.transform = shift;
    if (leafletRight) leafletRight.style.transform = shift;
}

function toggleCategory(el) {
    el.closest('.layer-category').classList.toggle('expanded');
}

function showLoading(text) {
    state.isLoading = true;
    const overlay = document.getElementById('loadingOverlay');
    overlay.querySelector('.loading-text').textContent = text || 'Memuat...';
    overlay.classList.add('active');
}

function hideLoading() {
    state.isLoading = false;
    document.getElementById('loadingOverlay').classList.remove('active');
}

// ========================================
// BUILD LAYER PANEL HTML
// ========================================
function buildLayerPanel() {
    const body = document.getElementById('layerPanelBody');
    let html = '';

    CONFIG.categories.forEach(catConfig => {
        const catKey = catConfig.id;
        html += `<div class="layer-category" id="cat-${catKey}">
            <div class="layer-category-header" onclick="toggleCategory(this)">
                <span class="layer-category-icon">${catConfig.icon}</span>
                <span class="layer-category-label">${catConfig.label}</span>
                <span class="layer-category-chevron">▼</span>
            </div>
            <div class="layer-category-items">`;

        // Find layers in this category
        Object.entries(CONFIG.layers).forEach(([layerKey, layerConfig]) => {
            if (layerConfig.category !== catKey) return;
            if (layerConfig.hideMenu) return;
            const yearLabel = layerConfig.year ? layerConfig.year : '';
            const displayLabel = layerConfig.year ? `Tahun ${layerConfig.year}` : layerConfig.label;

            const downloadHtml = layerConfig.downloadUrl 
                ? `<a href="${layerConfig.downloadUrl}" target="_blank" class="layer-download-btn" title="Unduh Peta Tematik / GIS Data" onclick="event.stopPropagation();">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="download-icon">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                    </svg>
                   </a>`
                : '';

            html += `<div class="layer-item" data-key="${layerKey}" onclick="toggleLayer('${layerKey}')">
                <label class="layer-checkbox">
                    <input type="checkbox" data-layer="${layerKey}">
                    <span class="checkmark"></span>
                </label>
                <span class="layer-item-label">${displayLabel}</span>
                ${yearLabel ? `<span class="layer-item-badge">${yearLabel}</span>` : ''}
                ${downloadHtml}
            </div>`;
        });

        html += `</div></div>`;
    });

    body.innerHTML = html;
}

// ========================================
// BASEMAP THUMBNAILS
// ========================================
function buildBasemapSwitcher() {
    const container = document.getElementById('basemapSwitcher');
    let html = '';
    Object.entries(CONFIG.basemaps).forEach(([key, bm]) => {
        html += `<div class="basemap-option ${key === 'osm' ? 'active' : ''}" 
                      data-basemap="${key}" 
                      data-label="${bm.label}"
                      style="background-image: url('${bm.thumb}')"
                      onclick="setBasemap('${key}')"></div>`;
    });
    container.innerHTML = html;
}

// ========================================
// INITIALIZATION
// ========================================
function init() {
    initMap();
    buildLayerPanel();
    buildBasemapSwitcher();
    initSwipeTool();
    loadStatistik();
    preloadKecamatanData();

    // Auto-load batas kabupaten + batas kecamatan + longsor_mean on startup
    setTimeout(() => {
        loadLayer('batas_kabupaten');
        const cb = document.querySelector('input[data-layer="batas_kabupaten"]');
        if (cb) cb.checked = true;

        // Auto-load batas kecamatan
        loadLayer('batas_kecamatan');
        const cbKec = document.querySelector('input[data-layer="batas_kecamatan"]');
        if (cbKec) cbKec.checked = true;

        // Auto-load longsor_mean
        loadLayer('longsor_mean');
        const cbLongsor = document.querySelector('input[data-layer="longsor_mean"]');
        if (cbLongsor) cbLongsor.checked = true;
    }, 500);
}

document.addEventListener('DOMContentLoaded', init);

// ========================================
// BOTTOM INFO PANEL
// ========================================
window.toggleBottomPanel = function() {
    const panel = document.getElementById('bottomInfoPanel');
    if (panel) {
        panel.classList.toggle('open');
    }
};

// ========================================
// CUSTOM TOAST NOTIFICATION
// ========================================
function showToast(title, message, type = 'info') {
    // Remove existing toast if any
    const existing = document.getElementById('webgisToast');
    if (existing) existing.remove();

    const icons = { warning: '⚠️', info: 'ℹ️', success: '✅', error: '❌' };
    const colors = {
        warning: 'linear-gradient(135deg, rgba(30,25,10,0.95), rgba(40,30,10,0.92))',
        info: 'linear-gradient(135deg, rgba(15,15,35,0.95), rgba(20,18,40,0.92))',
        success: 'linear-gradient(135deg, rgba(10,30,25,0.95), rgba(12,35,28,0.92))',
        error: 'linear-gradient(135deg, rgba(35,10,10,0.95), rgba(40,12,12,0.92))'
    };
    const borderColors = { warning: 'rgba(245,158,11,0.4)', info: 'rgba(108,99,255,0.4)', success: 'rgba(45,212,160,0.4)', error: 'rgba(239,68,68,0.4)' };

    const toast = document.createElement('div');
    toast.id = 'webgisToast';
    toast.innerHTML = `
        <div class="toast-icon">${icons[type] || icons.info}</div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
        <div class="toast-progress"></div>
    `;

    Object.assign(toast.style, {
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%) translateY(-120%)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '16px 20px',
        minWidth: '360px',
        maxWidth: '480px',
        background: colors[type] || colors.info,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${borderColors[type] || borderColors.info}`,
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        fontFamily: "'Inter', sans-serif",
        color: '#f0f0f5',
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease',
        opacity: '0',
        overflow: 'hidden',
    });

    // Icon style
    const iconEl = toast.querySelector('.toast-icon');
    Object.assign(iconEl.style, { fontSize: '28px', flexShrink: '0' });

    // Body
    const bodyEl = toast.querySelector('.toast-body');
    Object.assign(bodyEl.style, { flex: '1', minWidth: '0' });

    const titleEl = toast.querySelector('.toast-title');
    Object.assign(titleEl.style, { fontWeight: '700', fontSize: '14px', marginBottom: '3px', color: '#ffffff' });

    const msgEl = toast.querySelector('.toast-message');
    Object.assign(msgEl.style, { fontSize: '12.5px', color: '#d0d0e0', lineHeight: '1.4' });

    // Close button
    const closeEl = toast.querySelector('.toast-close');
    Object.assign(closeEl.style, {
        background: 'transparent',
        border: 'none',
        color: '#6b6b80',
        fontSize: '14px',
        cursor: 'pointer',
        padding: '4px',
        flexShrink: '0',
        transition: 'color 0.2s',
    });
    closeEl.onmouseenter = () => closeEl.style.color = '#f0f0f5';
    closeEl.onmouseleave = () => closeEl.style.color = '#6b6b80';

    // Progress bar
    const progressEl = toast.querySelector('.toast-progress');
    Object.assign(progressEl.style, {
        position: 'absolute',
        bottom: '0',
        left: '0',
        height: '3px',
        width: '100%',
        background: borderColors[type] || borderColors.info,
        borderRadius: '0 0 16px 16px',
        animation: 'toastProgress 4s linear forwards',
    });

    // Add keyframes if not already added
    if (!document.getElementById('toastKeyframes')) {
        const style = document.createElement('style');
        style.id = 'toastKeyframes';
        style.textContent = `@keyframes toastProgress { from { width: 100%; } to { width: 0%; } }`;
        document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        toast.style.transform = 'translateX(-50%) translateY(0)';
        toast.style.opacity = '1';
    });

    // Auto dismiss after 4s
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(-120%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}
