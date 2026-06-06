/**
 * SiteBuilder AI - Core Logic
 * Modern professional website generation with split-screen live preview.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const elements = {
        previewContent: document.getElementById('preview-content'),
        previewContainer: document.getElementById('preview-iframe-container'),
        generateBtn: document.getElementById('generate-btn'),
        publishBtn: document.getElementById('publish-btn'),
        inputs: {
            businessName: document.getElementById('business-name'),
            nameColor: document.getElementById('name-color'),
            description: document.getElementById('description'),
            heroImgFile: document.getElementById('hero-img-file'),
            phone: document.getElementById('business-phone'),
            address: document.getElementById('business-address'),
            email: document.getElementById('business-email'),
            businessLogoFile: document.getElementById('business-logo-file'),
            headerBgFile: document.getElementById('header-bg-file'),
            fontDropdown: document.getElementById('font-dropdown'),
            fontTrigger: document.getElementById('font-trigger-text'),
            fontItems: document.querySelectorAll('.font-item'),
            activeFontName: document.getElementById('active-font-name'),
            headerOpacity: document.getElementById('header-opacity'),
            headerOpacityVal: document.getElementById('header-opacity-val'),
            bgHeight: document.getElementById('bg-height'),
            bgWidth: document.getElementById('bg-width'),
            social: {
                platformSelect: document.getElementById('platform-select'),
                icon: document.getElementById('active-platform-icon'),
                input: document.getElementById('social-input')
            },
            templateSelect: document.getElementById('template-select'),
            customBusinessGroup: document.getElementById('custom-business-group'),
            customBusinessType: document.getElementById('custom-business-type'),
            serviceList: document.getElementById('service-list'),
            addServiceBtn: document.getElementById('add-service-btn'),
            snapshotBtn: document.getElementById('take-snapshot-btn'),
            clearSnapshotsBtn: document.getElementById('clear-snapshots-btn'),
            snapshotList: document.getElementById('snapshot-list'),
            resetBtn: document.getElementById('reset-app-btn'),
            exportBtn: document.getElementById('export-json-btn'),
            importFile: document.getElementById('import-json-file'),
            saveStatus: document.getElementById('save-status'),
            loader: document.getElementById('app-loader'),
            loaderStatus: document.getElementById('loader-status')
        },
        themeOptions: document.querySelectorAll('.theme-option'),
        viewportBtns: document.querySelectorAll('.control-btn'),
        publishToWebBtn: document.getElementById('publish-to-web-btn'),
        publishModal: document.getElementById('publish-modal'),
        liveUrlInput: document.getElementById('live-url-input'),
        copyBtn: document.getElementById('copy-link-btn'),
        closeModalBtn: document.getElementById('close-publish-modal')
    };

    // --- Snapshot Manager Logic ---
    const renderSnapshots = () => {
        const raw = localStorage.getItem('siteBuilderSnapshots');
        const snapshots = JSON.parse(raw || '[]');
        elements.inputs.snapshotList.innerHTML = '';

        if (snapshots.length === 0) {
            elements.inputs.snapshotList.innerHTML = '<div style="font-size:0.65rem; color:var(--sidebar-muted); text-align:center; padding: 0.5rem; border: 1px dashed var(--glass-border); border-radius: 6px;">No saved points yet</div>';
            return;
        }

        [...snapshots].reverse().forEach((s, idx) => {
            const originalIndex = snapshots.length - 1 - idx;
            const item = document.createElement('div');
            item.style = 'background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); border-radius: 6px; padding: 0.4rem 0.6rem; display: flex; justify-content: space-between; align-items: center; transition: 0.2s; margin-bottom: 0.4rem;';
            item.innerHTML = `
                <div style="display: flex; flex-direction: column; gap: 0.1rem; flex: 1; cursor: pointer;" class="restore-snapshot">
                    <span style="font-size: 0.75rem; color: white; font-weight: 700;">${s.name}</span>
                    <span style="font-size: 0.6rem; color: var(--sidebar-muted);">${s.time}</span>
                </div>
                <button class="delete-snapshot" style="background:transparent; border:none; color:#ef4444; font-size:0.65rem; cursor:pointer; padding: 0.2rem;"><i class="fas fa-trash"></i></button>
            `;

            item.querySelector('.restore-snapshot').onclick = () => {
                if (confirm(`Restore project to point: "${s.name}"? Current unsaved changes will be lost.`)) {
                    localStorage.setItem('premiumSiteState', JSON.stringify(s.data));
                    location.reload();
                }
            };

            item.querySelector('.delete-snapshot').onclick = (e) => {
                e.stopPropagation();
                const snaps = JSON.parse(localStorage.getItem('siteBuilderSnapshots') || '[]');
                snaps.splice(originalIndex, 1);
                localStorage.setItem('siteBuilderSnapshots', JSON.stringify(snaps));
                renderSnapshots();
            };
            elements.inputs.snapshotList.appendChild(item);
        });
    };

    if (elements.inputs.snapshotBtn) {
        elements.inputs.snapshotBtn.addEventListener('click', () => {
            forceSaveNow();
            const name = prompt('Name this save point:', `Backup ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
            if (!name) return;

            const snapshots = JSON.parse(localStorage.getItem('siteBuilderSnapshots') || '[]');
            const data = JSON.parse(localStorage.getItem('premiumSiteState'));

            snapshots.push({
                name: name.substring(0, 25),
                time: new Date().toLocaleString(),
                data: data
            });

            if (snapshots.length > 5) snapshots.shift();

            const trySaveSnapshots = (snaps) => {
                try {
                    localStorage.setItem('siteBuilderSnapshots', JSON.stringify(snaps));
                    renderSnapshots();
                    elements.inputs.snapshotBtn.innerHTML = '<i class="fas fa-check"></i> SAVED';
                    elements.inputs.snapshotBtn.style.background = '#10b981';
                    setTimeout(() => {
                        elements.inputs.snapshotBtn.innerHTML = '<i class="fas fa-save"></i> SAVE CURRENT';
                        elements.inputs.snapshotBtn.style.background = 'var(--primary)';
                    }, 2000);
                    return true;
                } catch (e) {
                    if (snaps.length > 1) {
                        snaps.shift(); // Remove oldest to make room
                        return trySaveSnapshots(snaps);
                    }
                    alert('CRITICAL: Browser storage is completely full. Please manually delete history items or export/import your project to reset memory.');
                    return false;
                }
            };

            trySaveSnapshots(snapshots);
        });
    }
    if (elements.inputs.clearSnapshotsBtn) {
        elements.inputs.clearSnapshotsBtn.addEventListener('click', () => {
            if (confirm('Permanently delete ALL previous Version History save points? This will free up storage space and cannot be undone.')) {
                localStorage.removeItem('siteBuilderSnapshots');
                renderSnapshots();
            }
        });
    }
    renderSnapshots();

    // --- State Management ---
    let state = {
        template: 'bakery',
        accent: '#4f46e5',
        nameColor: '#0f172a',
        heroImg: '',
        businessLogo: '',
        headerBgImg: '',
        nameFont: "'Outfit', sans-serif",
        headerOpacity: 85,
        bgHeight: 100,
        bgWidth: 100,
        heroTitle: '',
        heroSub: '',
        viewport: '100%',
        customServices: null,
        socialLinks: {
            whatsapp: '',
            instagram: '',
            facebook: '',
            'x-twitter': '',
            linkedin: '',
            youtube: '',
            tiktok: '',
            telegram: ''
        },
        sections: [
            { id: 'home', enabled: true },
            { id: 'services', enabled: true },
            { id: 'products', enabled: true },
            { id: 'gallery', enabled: true },
            { id: 'about', enabled: true },
            { id: 'contact', enabled: true }
        ]
    };

    // --- Monetization State ---
    let user = {
        isPaid: localStorage.getItem('siteBuilderPremium') === 'true'
    };

    // --- Theme Configurations ---
    const configs = {
        bakery: {
            accent: '#e67e22',
            font: "'Outfit', sans-serif",
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'], // Fixed links to match IDs
            services: [
                { title: 'Fresh Breads', desc: 'Sourdough and rye baked daily in our stone ovens.' },
                { title: 'Artisan Pastries', desc: 'Hand-crafted croissants using premium French butter.' },
                { title: 'Custom Cakes', desc: 'Designed specifically for your most special occasions.' }
            ]
        },
        school: {
            accent: '#2980b9',
            font: "'Outfit', sans-serif",
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'],
            services: [
                { title: 'Academic Excellence', desc: 'Structured learning environments for all age groups.' },
                { title: 'Creative Labs', desc: 'Exploring art, music, and technology through hands-on work.' },
                { title: 'Global Programs', desc: 'International curriculum focused on future success.' }
            ]
        },
        fashion: {
            accent: '#1a1a1a',
            font: "'Outfit', sans-serif",
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'],
            services: [
                { title: 'Summer Capsule', desc: 'Light fabrics meeting timeless silhouettes.' },
                { title: 'Custom Tailoring', desc: 'Measured and stitched to perfection for your body.' },
                { title: 'Sustainable Silk', desc: 'Eco-friendly luxury that feels like a second skin.' }
            ]
        },
        pos: {
            accent: '#27ae60',
            font: "'Outfit', sans-serif",
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'],
            services: [
                { title: 'Inventory Logic', desc: 'Smart tracking with automated restocking alerts.' },
                { title: 'Omnisync', desc: 'Real-time synchronization between online and offline sales.' },
                { title: 'Deep Data', desc: 'Advanced analytics to understand your customers better.' }
            ]
        },
        car_lots: {
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'],
            accent: '#2563eb',
            font: "'Outfit', sans-serif",
            services: [
                { title: 'Quality Vehicles', desc: 'Pre-owned cars with full certified inspection.' },
                { title: 'Easy Finance', desc: 'Flexible payment plans for all budgets.' },
                { title: 'Trade-In', desc: 'Get the best value for your current car.' }
            ]
        },
        estate: {
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'],
            accent: '#059669',
            font: "'Outfit', sans-serif",
            services: [
                { title: 'Property Management', desc: 'We take the stress out of managing your rentals.' },
                { title: 'Sales & Leasing', desc: 'Helping you buy or rent your dream home.' },
                { title: 'Valuation', desc: 'Expert appraisal for accurate property pricing.' }
            ]
        },
        tech: {
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'],
            accent: '#4f46e5',
            font: "'Outfit', sans-serif",
            services: [
                { title: 'Latest Tech', desc: 'Cutting-edge gadgets from top global brands.' },
                { title: 'Repair Center', desc: 'Professional repair and software support.' },
                { title: 'Accessories', desc: 'Premium cases, chargers, and peripherals.' }
            ]
        },
        grocery: {
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'],
            accent: '#16a34a',
            font: "'Outfit', sans-serif",
            services: [
                { title: 'Organic Produce', desc: 'Farm-fresh fruits and vegetables delivered daily.' },
                { title: 'Bakery & Dairy', desc: 'Fresh local milk and daily baked goods.' },
                { title: 'Home Delivery', desc: 'Save time with our fast doorstep service.' }
            ]
        },
        pharmacy: {
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'],
            accent: '#0891b2',
            font: "'Outfit', sans-serif",
            services: [
                { title: 'Prescriptions', desc: 'Accurate and fast medication fulfillment.' },
                { title: 'Health Consult', desc: 'Expert advice from certified pharmacists.' },
                { title: 'Wellness Store', desc: 'Vitamins, supplements, and skin care.' }
            ]
        },
        hospital: {
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'],
            accent: '#dc2626',
            font: "'Outfit', sans-serif",
            services: [
                { title: 'Emergency Care', desc: '24/7 critical care and ambulance services.' },
                { title: 'Specialized Depts', desc: 'Cardiology, Pediatrics, and Maternity care.' },
                { title: 'Lab Diagnostics', desc: 'Advanced testing and imaging technology.' }
            ]
        },
        supermart: {
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'],
            accent: '#ca8a04',
            font: "'Outfit', sans-serif",
            services: [
                { title: 'Bulk Deals', desc: 'Save more with our wholesale-sized offers.' },
                { title: 'Electronics', desc: 'Major home appliances and smart devices.' },
                { title: 'Lifestyle', desc: 'Fashion, home goods, and kitchenware.' }
            ]
        },
        custom: {
            sections: ['Home', 'Services', 'Products', 'Gallery', 'About', 'Contact'],
            accent: '#4f46e5',
            font: "'Outfit', sans-serif",
            services: [
                { title: 'Custom Feature 1', desc: 'Click here in the preview area to describe your unique service.' },
                { title: 'Custom Feature 2', desc: 'Craft a professional outline of what your business offers.' },
                { title: 'Custom Feature 3', desc: 'Keep your customers informed with clear, concise feature lists.' }
            ]
        }
    };

    const flashSaveStatus = () => {
        if (!elements.inputs.saveStatus) return;
        elements.inputs.saveStatus.style.opacity = '1';
        setTimeout(() => { elements.inputs.saveStatus.style.opacity = '0'; }, 2000);
    };

    // --- Performance Debounce Wrappers (Safe Mode) ---
    let renderTimeout;
    const compressImage = (base64, maxWidth = 1200, quality = 0.5) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = base64;
        });
    };

    const handleFileUpload = async (e, stateKey, callback) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (re) => {
            elements.inputs.loader.classList.remove('hidden');
            elements.inputs.loaderStatus.innerText = 'Optimizing image...';

            const compressed = await compressImage(re.target.result);
            state[stateKey] = compressed;

            elements.inputs.loader.classList.add('hidden');
            if (callback) callback(compressed);
            safeSave();
            updatePreview();
        };
        reader.readAsDataURL(file);
    };

    function safeUpdatePreview() {
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(() => {
            updatePreview();
        }, 100);
    }

    let saveTimeout;
    function safeSave() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveToLocalStorage();
        }, 300);
    }

    function forceSaveNow() {
        clearTimeout(saveTimeout);
        saveToLocalStorage();
    }

    /**
     * Saves application state to local storage
     */
    const saveToLocalStorage = () => {
        try {
            const data = {
                template: state.template,
                accent: state.accent,
                nameColor: state.nameColor,
                headerImg: state.heroImg,
                headerBgImg: state.headerBgImg,
                nameFont: state.nameFont,
                headerOpacity: state.headerOpacity,
                bgHeight: state.bgHeight,
                bgWidth: state.bgWidth,
                heroTitle: state.heroTitle,
                heroSub: state.heroSub,
                customServices: state.customServices,
                sections: state.sections,
                inputs: {
                    name: elements.inputs.businessName.value,
                    nameColor: elements.inputs.nameColor.value,
                    desc: elements.inputs.description.value,
                    phone: elements.inputs.phone.value,
                    address: elements.inputs.address.value,
                    email: elements.inputs.email.value,
                    businessLogo: state.businessLogo,
                    customType: elements.inputs.customBusinessType.value,
                    social: state.socialLinks
                }
            };
            localStorage.setItem('premiumSiteState', JSON.stringify(data));
            flashSaveStatus();
        } catch (e) { console.warn('Storage failed'); }
    };

    /**
     * Loads state from local storage
     */
    const loadFromLocalStorage = () => {
        try {
            const saved = localStorage.getItem('premiumSiteState');
            if (!saved) return;
            const data = JSON.parse(saved);

            state.template = data.template || 'bakery';
            state.accent = data.accent || '#4f46e5';
            state.nameColor = data.nameColor || '#0f172a';
            state.heroImg = data.heroImg || '';
            state.headerBgImg = data.headerBgImg || '';
            state.nameFont = data.nameFont || "'Outfit', sans-serif";
            state.headerOpacity = data.headerOpacity || 85,
                state.bgHeight = data.bgHeight || 100;
            state.bgWidth = data.bgWidth || 100;
            state.heroTitle = data.heroTitle || '';
            state.heroSub = data.heroSub || '';
            state.customServices = data.customServices || null;
            state.sections = state.sections.map(defaultS => {
                const savedS = (data.sections || []).find(s => s.id === defaultS.id);
                return savedS ? { ...defaultS, ...savedS } : defaultS;
            });

            if (data.inputs) {
                elements.inputs.businessName.value = data.inputs.name || '';
                elements.inputs.nameColor.value = data.inputs.nameColor || '#0f172a';
                elements.inputs.description.value = data.inputs.desc || '';
                elements.inputs.phone.value = data.inputs.phone || '';
                elements.inputs.address.value = data.inputs.address || '';
                elements.inputs.email.value = data.inputs.email || '';
                state.businessLogo = data.inputs.businessLogo || '';
                elements.inputs.customBusinessType.value = data.inputs.customType || '';
                if (data.inputs.social) {
                    state.socialLinks = data.inputs.social;
                    elements.inputs.social.input.value = state.socialLinks.whatsapp || '';
                }
            }
            updateUIStates();
            renderServiceList();
        } catch (e) { localStorage.removeItem('premiumSiteState'); }
    };

    const updateUIStates = () => {
        if (elements.inputs.templateSelect) {
            elements.inputs.templateSelect.value = state.template;
            if (elements.inputs.customBusinessGroup) {
                elements.inputs.customBusinessGroup.style.display = (state.template === 'custom') ? 'flex' : 'none';
            }
        }
        elements.inputs.fontItems.forEach(opt => {
            const isActive = opt.dataset.font === state.nameFont;
            opt.classList.toggle('active', isActive);
            if (isActive && elements.inputs.activeFontName) {
                elements.inputs.activeFontName.innerText = opt.innerText;
            }
        });
        elements.themeOptions.forEach(opt => opt.classList.toggle('active', opt.dataset.color === state.accent));
        if (elements.inputs.headerOpacity) {
            elements.inputs.headerOpacityVal.innerText = `${state.headerOpacity}%`;
        }
        if (elements.inputs.bgHeight) elements.inputs.bgHeight.value = state.bgHeight;
        if (elements.inputs.bgWidth) elements.inputs.bgWidth.value = state.bgWidth;

        // Sync Section Visibility checkboxes
        document.querySelectorAll('#section-controls input').forEach(input => {
            const id = input.dataset.section;
            const section = state.sections.find(s => s.id === id);
            if (section) input.checked = section.enabled;
        });

        renderServiceList();
    };

    /**
     * Renders the service manager items in sidebar
     */
    const renderServiceList = () => {
        const services = getActiveServices();
        elements.inputs.serviceList.innerHTML = '';

        services.forEach((s, idx) => {
            const item = document.createElement('div');
            item.className = 'service-list-item';
            item.style = 'background: rgba(255,255,255,0.05); padding: 0.8rem; border-radius: 8px; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 0.4rem;';
            item.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size: 0.75rem; color: var(--sidebar-muted);">SERVICE CARD #${idx + 1}</span>
                    <button class="delete-service" data-index="${idx}" style="background:transparent; border:none; color:#ef4444; cursor:pointer; font-size:0.75rem;"><i class="fas fa-trash"></i></button>
                </div>
                <input type="text" class="service-title-input" data-index="${idx}" placeholder="Service Title..." value="${s.title}" style="background:var(--glass-bg); border:1px solid var(--glass-border); color:white; padding:0.5rem; border-radius:8px; font-size:0.75rem;">
                <div style="display:flex; align-items:center; gap:0.5rem; margin-top:0.1rem;">
                    <label class="s-image-label">
                        <i class="fas fa-camera"></i> ${s.image ? 'CHANGE IMAGE' : 'UPLOAD IMAGE'}
                        <input type="file" class="service-img-file" data-index="${idx}" accept="image/*" style="display:none;">
                    </label>
                    ${s.image ? `<div class="s-thumbnail-preview"><img src="${s.image}" style="width:100%;height:100%;object-fit:cover;"></div>` : ''}
                </div>
                <div style="display:flex; flex-direction:column; gap:0.2rem; margin-top:0.4rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <label style="font-size:0.65rem; color:var(--sidebar-muted);">ZOOM / SCALE</label>
                        <span style="font-size:0.65rem; color:var(--sidebar-muted);">${Math.round((s.imgScale || 1) * 100)}%</span>
                    </div>
                    <input type="range" class="service-img-scale" data-index="${idx}" min="0.5" max="5" step="0.01" value="${s.imgScale || 1}" style="accent-color: var(--primary); cursor: pointer; height:4px;">
                </div>
            `;
            elements.inputs.serviceList.appendChild(item);
        });

        // Add listeners to new inputs
        elements.inputs.serviceList.querySelectorAll('.service-img-scale').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = e.target.dataset.index;
                ensureCustomServices();
                state.customServices[state.template][idx].imgScale = parseFloat(e.target.value);
                updatePreview();
                // No save here to keep slider smooth, save happens on change if needed or periodically
            });
            input.addEventListener('change', () => { safeSave(); });
        });

        elements.inputs.serviceList.querySelectorAll('.service-img-file').forEach(input => {
            input.addEventListener('change', (e) => {
                const idx = e.target.dataset.index;
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = async (re) => {
                    elements.inputs.loader.classList.remove('hidden');
                    elements.inputs.loaderStatus.innerText = 'Optimizing service image...';

                    try {
                        const compressed = await compressImage(re.target.result, 800, 0.45);
                        ensureCustomServices();
                        state.customServices[state.template][idx].image = compressed;
                        renderServiceList();
                        safeUpdatePreview();
                        safeSave();
                    } catch (err) {
                        console.error('Compression failed:', err);
                    } finally {
                        elements.inputs.loader.classList.add('hidden');
                    }
                };
                reader.readAsDataURL(file);
            });
        });

        elements.inputs.serviceList.querySelectorAll('.service-title-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx = e.target.dataset.index;
                ensureCustomServices();
                state.customServices[state.template][idx].title = e.target.value;
                updatePreview();
            });
            input.addEventListener('focus', (e) => {
                const idx = e.target.dataset.index;
                const target = elements.previewContent.querySelector(`.card[data-index="${idx}"]`);
                if (target) {
                    elements.previewContent.scrollTo({
                        top: target.offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });

        elements.inputs.serviceList.querySelectorAll('.delete-service').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = btn.dataset.index;
                ensureCustomServices();
                state.customServices[state.template].splice(idx, 1);
                renderServiceList();
                updatePreview();
            });
        });
    };

    const getActiveServices = () => {
        if (state.customServices && state.customServices[state.template]) {
            return state.customServices[state.template];
        }
        return configs[state.template].services;
    };

    const ensureCustomServices = () => {
        if (!state.customServices) state.customServices = {};
        if (!state.customServices[state.template]) {
            state.customServices[state.template] = JSON.parse(JSON.stringify(configs[state.template].services));
        }
    };

    function isSectionEnabled(id) {
        return state.sections.find(s => s.id === id)?.enabled;
    }

    /**
     * Generates the dynamic preview HTML
     */
    const generatePreviewHTML = () => {
        const config = configs[state.template] || configs.bakery;
        const name = elements.inputs.businessName.value || 'Your Business';
        const nameColor = (elements.inputs.nameColor ? elements.inputs.nameColor.value : null) || state.nameColor || '#0f172a';
        const desc = elements.inputs.description.value || 'Professional solutions designed for your success.';
        const accent = state.accent;

        // Handle custom business type for logo/title if template is 'custom'
        const displayType = (state.template === 'custom' && elements.inputs.customBusinessType.value)
            ? elements.inputs.customBusinessType.value
            : null;

        const logoText = displayType ? `${name} | ${displayType}` : name;

        // Use custom services if they exist for this template, otherwise use defaults
        const services = (state.customServices && state.customServices[state.template])
            ? state.customServices[state.template]
            : config.services;

        const styles = `
            <style>
                @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
                
                #preview-content { 
                    --accent: ${accent}; 
                    --text: #0f172a; 
                    --name-color: ${nameColor}; 
                    --muted: #64748b; 
                    --bg-soft: #f8fafc;
                    color: var(--text); 
                    background: white; 
                    line-height: 1.6; 
                    font-size: 1rem;
                    -webkit-font-smoothing: antialiased;
                }
                
                #preview-content * { margin:0; padding:0; box-sizing: border-box; font-family: 'Outfit', sans-serif; }
                
                /* Responsive Nav */
                #preview-content .nav { 
                    display:flex; 
                    flex-direction: column;
                    position: sticky; 
                    top: 0; 
                    background: ${state.headerBgImg ? `linear-gradient(rgba(255,255,255,${state.headerOpacity / 100}), rgba(255,255,255,${state.headerOpacity / 100})), url('${state.headerBgImg}')` : 'rgba(255,255,255,0.95)'};
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    background-size: cover;
                    background-position: center;
                    z-index: 1000;
                    box-shadow: 0 1px 0 rgba(0,0,0,0.05);
                    width: 100%;
                }
                
                #preview-content .nav-container {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: space-between;
                    align-items: center;
                    padding: clamp(1rem, 3vw, 1.5rem) 5%;
                    gap: 1.5rem;
                }
                
                #preview-content .logo-only { 
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                #preview-content .main-logo-img {
                    height: clamp(40px, 10vw, 55px);
                    width: auto;
                    border-radius: 8px;
                }
                
                #preview-content .brand-name-straight { 
                    color: var(--name-color); 
                    font-family: ${state.nameFont};
                    font-size: clamp(1.25rem, 4vw, 1.75rem);
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }
                
                #preview-content .nav-links { 
                    display: flex; 
                    list-style: none; 
                    gap: clamp(1rem, 3vw, 2.5rem); 
                    flex-wrap: wrap;
                    justify-content: center;
                }
                
                #preview-content .nav-links a { 
                    text-decoration: none; 
                    color: var(--text); 
                    font-weight: 600; 
                    font-size: clamp(0.85rem, 2vw, 0.95rem); 
                    transition: 0.2s; 
                }
                
                #preview-content .nav-links a:hover { color: var(--accent); }
                
                /* Hero Section */
                #preview-content .hero { 
                    padding: clamp(4rem, 15vh, 10rem) 5%; 
                    text-align: center; 
                    background: ${state.heroImg ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url('${state.heroImg}')` : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'};
                    background-size: cover;
                    background-position: center;
                    color: ${state.heroImg ? 'white' : 'var(--text)'};
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 50vh;
                }
                
                #preview-content .hero h1 { 
                    font-size: clamp(2.25rem, 8vw, 4.5rem); 
                    font-weight: 800;
                    margin-bottom: 1.5rem; 
                    line-height: 1.1; 
                    color: ${state.heroImg ? 'white' : 'var(--name-color)'} !important;
                    max-width: 900px;
                    letter-spacing: -0.04em;
                    overflow-wrap: break-word;
                }
                
                #preview-content .hero p { 
                    font-size: clamp(1.1rem, 3vw, 1.25rem); 
                    color: ${state.heroImg ? 'rgba(255,255,255,0.9)' : 'var(--muted)'}; 
                    max-width: 650px; 
                    margin: 0 auto 3rem; 
                    line-height: 1.6;
                }
                
                /* Layout Sections */
                #preview-content section { 
                    padding: clamp(4rem, 10vh, 8rem) 5%; 
                    scroll-margin-top: 5rem;
                    width: 100%;
                }
                
                #preview-content .section-title {
                    font-size: clamp(1.75rem, 6vw, 2.75rem);
                    font-weight: 800;
                    text-align: center;
                    margin-bottom: clamp(3rem, 8vh, 5rem);
                    letter-spacing: -0.02em;
                }
                
                #preview-content .grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); 
                    gap: 2rem; 
                    max-width: 1200px;
                    margin: 0 auto;
                }
                
                /* Service/Product Cards */
                #preview-content .card { 
                    background: white; 
                    border: 1px solid #e2e8f0; 
                    border-radius: 24px; 
                    transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    height: 100%;
                }
                
                #preview-content .card-img-container {
                    width: 100%;
                    aspect-ratio: 4/3;
                    overflow: hidden;
                    background: var(--bg-soft);
                }
                
                #preview-content .card-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scale(var(--img-scale, 1));
                    transition: 0.5s ease;
                }
                
                #preview-content .card-body { 
                    padding: 2rem; 
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                
                #preview-content .card h3 { font-size: 1.35rem; font-weight: 700; color: var(--text); }
                #preview-content .card p { color: var(--muted); font-size: 1rem; line-height: 1.6; }
                
                /* Footer & Social */
                #preview-content .footer { 
                    background: var(--bg-soft); 
                    padding: clamp(4rem, 8vh, 6rem) 5%; 
                    text-align: center;
                    border-top: 1px solid #e2e8f0;
                }
                
                /* Contact & 3D Logost */
                #preview-content .contact-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr)); 
                    gap: 1.5rem; 
                    max-width: 1100px; 
                    margin-left: auto; 
                    margin-right: auto;
                }
                #preview-content .contact-card {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 1.2rem;
                    background: white;
                    border-radius: 20px;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: left;
                    position: relative;
                    overflow: hidden;
                    text-decoration: none;
                }
                #preview-content .contact-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
                    border-color: var(--accent);
                }
                #preview-content .contact-3d-logo {
                    width: clamp(36px, 10vw, 42px);
                    height: clamp(36px, 10vw, 42px);
                    border-radius: 12px;
                    object-fit: cover;
                    flex-shrink: 0;
                    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
                    background: #f1f5f9;
                    border: 1.5px solid white;
                    transition: transform 0.3s;
                }
                #preview-content .contact-card:hover .contact-3d-logo {
                    transform: scale(1.1) rotate(5deg);
                }
                #preview-content .contact-card-content {
                    display: flex;
                    flex-direction: column;
                    gap: 0.2rem;
                }
                #preview-content .contact-card-label {
                    font-size: 0.7rem;
                    color: var(--accent);
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                }
                #preview-content .contact-card-value {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--text);
                    word-break: break-all;
                }
                #preview-content .contact-card i {
                    position: absolute;
                    bottom: -10px;
                    right: -10px;
                    font-size: 4rem;
                    color: var(--accent);
                    opacity: 0.03;
                    transform: rotate(-15deg);
                }

                /* Watermark Styling */
                #preview-content .free-watermark {
                    position: fixed;
                    bottom: 1.5rem;
                    right: 1.5rem;
                    background: rgba(15, 23, 42, 0.9);
                    backdrop-filter: blur(8px);
                    color: white;
                    padding: 0.6rem 1rem;
                    border-radius: 50px;
                    font-size: 0.65rem;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    z-index: 9999;
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                #preview-content .free-watermark i { color: #facc15; }

                @media (max-width: 768px) {
                    #preview-content .hero h1 { font-size: 2.2rem; }
                    #preview-content .nav-container { 
                        flex-direction: column; 
                        gap: 1rem; 
                        text-align: center; 
                        padding: 1rem;
                    }
                    #preview-content .logo-only {
                        width: 100%;
                        justify-content: center;
                    }
                    #preview-content .main-logo-img {
                        height: 45px;
                    }
                    #preview-content .brand-name-straight {
                        font-size: 1.4rem;
                    }
                    #preview-content .nav-links {
                        flex-wrap: wrap;
                        justify-content: center;
                        gap: 0.75rem;
                        font-size: 0.8rem;
                    }
                    #preview-content .nav-links a { font-size: 0.8rem; }
                    #preview-content .contact-card { padding: 0.75rem 1rem; }
                    #preview-content .contact-3d-logo { width: 32px; height: 32px; border-radius: 8px; }
                    #preview-content .contact-card-value { font-size: 0.85rem; }
                }
            </style>
        `;

        const platformColors = {
            whatsapp: '#25D366',
            instagram: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
            facebook: '#1877F2',
            'x-twitter': '#000000',
            linkedin: '#0A66C2',
            youtube: '#FF0000',
            tiktok: '#010101',
            telegram: '#26A5E4'
        };

        const platformLogos = {
            whatsapp: 'https://cdn.simpleicons.org/whatsapp/25D366',
            instagram: 'https://cdn.simpleicons.org/instagram/E4405F',
            facebook: 'https://cdn.simpleicons.org/facebook/1877F2',
            'x-twitter': 'https://cdn.simpleicons.org/x/000000',
            linkedin: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
            youtube: 'https://cdn.simpleicons.org/youtube/FF0000',
            tiktok: 'https://cdn.simpleicons.org/tiktok/000000',
            telegram: 'https://cdn.simpleicons.org/telegram/26A5E4'
        };

        const platformVectorLogos = {
            whatsapp: 'https://www.vectorlogo.zone/logos/whatsapp/whatsapp-icon.svg',
            facebook: 'https://www.vectorlogo.zone/logos/facebook/facebook-official.svg',
            linkedin: 'https://www.vectorlogo.zone/logos/linkedin/linkedin-icon.svg',
            instagram: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg',
            'x-twitter': 'https://www.vectorlogo.zone/logos/twitter/twitter-official.svg',
            youtube: 'https://www.vectorlogo.zone/logos/youtube/youtube-icon.svg',
            phone: 'https://img.icons8.com/color/144/phone.png',
            email: 'https://www.vectorlogo.zone/logos/gmail/gmail-icon.svg',
            address: 'https://www.vectorlogo.zone/logos/google_maps/google_maps-icon.svg'
        };

        const socialHTML = `
            <div class="social" style="display: flex; gap: 1.5rem; flex-wrap: wrap; justify-content: center; margin-top: 2rem;">
                ${Object.entries(state.socialLinks)
                .filter(([_, val]) => val.trim() !== '')
                .map(([key, val]) => {
                    const logoUrl = platformVectorLogos[key] || `https://www.vectorlogo.zone/logos/${key}/${key}-icon.svg`;

                    let finalUrl = val.trim();
                    if (!finalUrl.startsWith('http')) {
                        const bases = {
                            whatsapp: 'https://wa.me/',
                            instagram: 'https://instagram.com/',
                            facebook: 'https://facebook.com/',
                            'x-twitter': 'https://x.com/',
                            linkedin: 'https://linkedin.com/in/',
                            youtube: 'https://youtube.com/@',
                            tiktok: 'https://tiktok.com/@',
                            telegram: 'https://t.me/'
                        };
                        finalUrl = (bases[key] || '') + finalUrl;
                    }

                    return `
                        <a href="${finalUrl}" target="_blank" class="soc-link" data-id="${key}" title="${key}" style="display: flex; align-items: center; gap: 0.75rem; background: white; padding: 0.6rem 1.2rem; border-radius: 10px; border: 1px solid #e2e8f0; text-decoration: none; box-shadow: 0 4px 8px rgba(0,0,0,0.04); transition: 0.4s;">
                            <img src="${logoUrl}" alt="${key}" style="width: clamp(18px, 4vw, 22px); height: clamp(18px, 4vw, 22px); object-fit: contain;">
                            <span style="font-size: 0.85rem; color: var(--text); font-weight: 700; text-transform: capitalize;">${key}</span>
                        </a>`;
                }).join('')}
            </div>
        `;

        return `
            ${styles}
            <button class="back-to-top-preview" id="back-to-top" title="Scroll to Top">
                <i class="fas fa-chevron-up"></i>
            </button>
            ${isSectionEnabled('home') ? `
            <div id="home">
                <nav class="nav">
                    <div class="nav-container">
                        <div class="logo-only">
                            ${state.businessLogo ? `<img src="${state.businessLogo}" alt="Logo" class="main-logo-img">` : `<img src="assets/icon.png" alt="3D Logo" class="main-logo-img">`}
                            <h1 class="brand-name-straight">${logoText}</h1>
                        </div>
                        <ul class="nav-links">
                            ${config.sections.filter(s => isSectionEnabled(s.toLowerCase())).map(s => `<li><a href="#${s.toLowerCase()}">${s}</a></li>`).join('')}
                        </ul>
                    </div>
                </nav>
                <header class="hero">
                    <p contenteditable="true" id="edit-hero-sub">${state.heroSub || desc}</p>
                    <div style="display:flex; justify-content:center;">
                        <a href="#services" class="btn" style="background:var(--accent); color:white; padding:1.2rem 2.5rem; border-radius:40px; text-decoration:none; font-weight:700;">Explore Services</a>
                    </div>
                </header>
            </div>` : ''}


            ${isSectionEnabled('services') ? `
            <section class="services" id="services">
                <div class="grid">
                    ${services.map((s, idx) => `
                        <div class="card" data-index="${idx}">
                            <span class="edit-hint"><i class="fas fa-edit"></i> Click to edit</span>
                            <div class="card-img-container">
                                ${s.image ? `<img src="${s.image}" class="card-img" alt="${s.title}" style="--img-scale: ${s.imgScale || 1};">` : '<div class="card-img" style="display:flex; align-items:center; justify-content:center; color:#cbd5e1;"><i class="fas fa-image fa-2x"></i></div>'}
                            </div>
                            <div class="card-body">
                                <h3 contenteditable="true" data-field="title">${s.title}</h3>
                                <p contenteditable="true" data-field="desc">${s.desc}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>` : ''}

            ${isSectionEnabled('products') ? `
            <section class="products" id="products">
                <h2 class="section-title">Our Products</h2>
                <div class="grid">
                    ${services.map((s, idx) => `
                        <div class="card" data-index="${idx}">
                            <div class="card-img-container">
                                ${s.image ? `<img src="${s.image}" class="card-img" alt="${s.title}" style="--img-scale: ${s.imgScale || 1};">` : '<div class="card-img" style="display:flex; align-items:center; justify-content:center; color:#cbd5e1;"><i class="fas fa-box fa-2x"></i></div>'}
                            </div>
                            <div class="card-body">
                                <h3 contenteditable="true" data-field="title">${s.title}</h3>
                                <p contenteditable="true" data-field="desc">${s.desc}</p>
                                <div style="margin-top: auto; padding-top: 1.5rem;">
                                    <a href="#contact" style="display: block; text-align: center; background: var(--accent); color: white; padding: 0.8rem; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 0.9rem; transition: 0.3s; border: 1px solid var(--accent);">Order Now</a>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </section>` : ''}

            ${isSectionEnabled('gallery') ? `
            <section class="gallery" id="gallery" style="padding: 80px 5%; background: #f8fafc;">
                <div style="max-width: 1200px; margin: 0 auto;">
                    <h2 style="font-size: 2.5rem; text-align: center; margin-bottom: 3rem; color: var(--text);">Gallery</h2>
                    <div class="grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap: 1rem;">
                        ${services.filter(s => s.image).map((s, idx) => `
                            <div style="aspect-ratio: 1/1; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 4px solid white;">
                                <img src="${s.image}" alt="${s.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>` : ''}

            ${isSectionEnabled('about') ? `
            <section class="about" id="about" style="padding: 5rem 10%; background: white;">
                <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                    <h2 style="font-size: 2.5rem; margin-bottom: 1.5rem; color: var(--text);">About Us</h2>
                    <p contenteditable="true" style="font-size: 1.1rem; line-height: 1.8; color: var(--muted);">${desc}</p>
                </div>
            </section>` : ''}

            ${isSectionEnabled('contact') ? `
            <footer class="footer" id="contact">
                <div class="contact-grid">
                    ${(elements.inputs.phone && elements.inputs.phone.value) ? `
                        <a href="tel:${elements.inputs.phone.value}" class="contact-card">
                            <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
                                <img src="${platformVectorLogos.phone}" alt="Phone" style="width: 38px; height: 38px;">
                            </div>
                            <div class="contact-card-content">
                                <span class="contact-card-label" style="color: #16a34a;">Call Now</span>
                                <span class="contact-card-value">${elements.inputs.phone.value}</span>
                            </div>
                        </a>` : ''}
                    ${(elements.inputs.email && elements.inputs.email.value) ? `
                        <a href="mailto:${elements.inputs.email.value}" class="contact-card">
                            <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
                                <img src="${platformVectorLogos.email}" alt="Email" style="width: 38px; height: 38px;">
                            </div>
                            <div class="contact-card-content">
                                <span class="contact-card-label" style="color: #ea4335;">Message Us</span>
                                <span class="contact-card-value">${elements.inputs.email.value}</span>
                            </div>
                        </a>` : ''}
                    ${(elements.inputs.address && elements.inputs.address.value) ? `
                        <a href="https://www.google.com/maps?q=${encodeURIComponent(elements.inputs.address.value)}" target="_blank" class="contact-card">
                            <div style="width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
                                <img src="${platformVectorLogos.address}" alt="Address" style="width: 38px; height: 38px;">
                            </div>
                            <div class="contact-card-content">
                                <span class="contact-card-label" style="color: #4285f4;">Find Us</span>
                                <span class="contact-card-value">${elements.inputs.address.value}</span>
                            </div>
                        </a>` : ''}
                </div>
                ${socialHTML}
                <p style="color:var(--muted); font-size:0.85rem; margin-top: 3rem;">Liberty Self Site Builder v1.0 | &copy; 2026 <span class="brand-name" style="color: ${nameColor};">${name}</span>.</p>
            </footer>` : ''}

            ${!user.isPaid ? `
            <div class="free-watermark">
                <i class="fas fa-crown"></i>
                BUILT WITH LIBERTY SELF FREE
            </div>` : ''}
        `;
    };

    /**
     * Updates the preview container
     */
    const updatePreview = () => {
        // Save current scroll position to avoid jumping on rerender
        const scrollContainer = elements.previewContent;
        const currentScroll = scrollContainer ? scrollContainer.scrollTop : 0;
        const winScroll = window.scrollY; // Handle mobile view where body scrolls

        elements.previewContent.innerHTML = generatePreviewHTML();

        // Restore scroll position
        if (scrollContainer) scrollContainer.scrollTop = currentScroll;
        if (window.innerWidth <= 1024) window.scrollTo(0, winScroll);


        // Handle anchor clicks within preview
        elements.previewContent.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') { e.preventDefault(); return; }
                try {
                    const targetId = href.substring(1);
                    const target = elements.previewContent.querySelector('#' + targetId);
                    if (target) {
                        e.preventDefault();
                        scrollContainer.scrollTo({
                            top: target.offsetTop,
                            behavior: 'smooth'
                        });
                    }
                } catch (err) { console.warn('Invalid scroll target'); }
            });
        });

        // Back to Top Button Logic
        const btt = elements.previewContent.querySelector('#back-to-top');
        if (btt && scrollContainer) {
            scrollContainer.addEventListener('scroll', () => {
                if (scrollContainer.scrollTop > 300) {
                    btt.classList.add('visible');
                } else {
                    btt.classList.remove('visible');
                }
            });
            btt.addEventListener('click', () => {
                scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }

        // Hero Inline Edits
        const h1 = elements.previewContent.querySelector('#edit-hero-title');
        const hp = elements.previewContent.querySelector('#edit-hero-sub');

        if (h1) h1.addEventListener('input', () => { state.heroTitle = h1.innerText; safeSave(); });
        if (hp) hp.addEventListener('input', () => { state.heroSub = hp.innerText; safeSave(); });

        // Service Card Inline Edits
        const cards = elements.previewContent.querySelectorAll('.card');
        cards.forEach(card => {
            const index = parseInt(card.dataset.index);
            const titleEl = card.querySelector('[data-field="title"]');
            const descEl = card.querySelector('[data-field="desc"]');

            const updateStateFromPreview = () => {
                ensureCustomServices();
                state.customServices[state.template][index].title = titleEl.innerText.trim();
                state.customServices[state.template][index].desc = descEl.innerText.trim();
                safeSave();
                renderServiceList();
            };

            if (titleEl) titleEl.addEventListener('input', updateStateFromPreview);
            if (descEl) descEl.addEventListener('input', updateStateFromPreview);
        });
        safeSave();
    };

    // --- One-Click Publish System ---
    const publishToWeb = async () => {
        if (!user.isPaid) {
            alert('🚀 UPGRADE TO PREMIUM\n\nPublishing and live hosting are premium features. Upgrade to unlock one-click publishing and remove watermarks!');
            return;
        }
        const btn = elements.publishToWebBtn;
        if (!btn) return;

        // Reset button state to "Publishing..."
        const originalContent = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
        btn.style.opacity = '0.7';

        // Simulate deployment network delay (1.5s - 2.5s)
        const delay = 1500 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Generate simulated public URL
        const siteId = Math.random().toString(36).substring(2, 10);
        const businessSlug = (elements.inputs.businessName.value || 'my-site')
            .toLowerCase()
            .replace(/ /g, '-')
            .replace(/[^\w-]/g, '');
        const publicUrl = `https://${businessSlug}-${siteId}.netlify.app`;

        // Save state
        try {
            const publishedData = {
                published: true,
                url: publicUrl,
                date: new Date().toISOString()
            };
            localStorage.setItem('siteBuilderPublished', JSON.stringify(publishedData));
        } catch (e) { }

        // Show Success UI
        elements.liveUrlInput.value = publicUrl;
        elements.publishModal.style.display = 'flex';

        // Reset Button
        btn.disabled = false;
        btn.innerHTML = originalContent;
        btn.style.opacity = '1';
    };

    if (elements.publishToWebBtn) {
        elements.publishToWebBtn.addEventListener('click', publishToWeb);
    }

    if (elements.copyBtn) {
        elements.copyBtn.addEventListener('click', () => {
            elements.liveUrlInput.select();
            document.execCommand('copy');
            const originalText = elements.copyBtn.innerHTML;
            elements.copyBtn.innerHTML = '<i class="fas fa-check"></i> COPIED!';
            elements.copyBtn.style.background = '#10b981';
            setTimeout(() => {
                elements.copyBtn.innerHTML = originalText;
                elements.copyBtn.style.background = '#0f172a';
            }, 2000);
        });
    }

    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', () => {
            elements.publishModal.style.display = 'none';
        });
    }

    if (elements.publishBtn) {
        elements.publishBtn.addEventListener('click', () => {
            if (!user.isPaid) {
                alert('🚀 PREMIUM FEATURE\n\nDownloading the complete HTML source code is a premium feature. Please upgrade to unlock exports!');
                return;
            }
            const html = document.documentElement.outerHTML;
            const blob = new Blob([html], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'my-professional-site.html';
            a.click();
        });
    }

    // --- Paystack Integration ---
    const upgradeToPremium = () => {
        // We'll use the user's provided email if available, otherwise a default
        const userEmail = elements.inputs.email.value || "user@email.com";

        let handler = PaystackPop.setup({
            key: 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with real key
            email: userEmail,
            amount: 300000, // ₦3000 in kobo
            currency: "NGN",

            callback: function (response) {
                // Payment Successful
                alert('🎉 Payment Successful! Reference: ' + response.reference);

                user.isPaid = true;
                localStorage.setItem('siteBuilderPremium', 'true');

                // Refresh UI and remove paywall
                updatePreview();
                const upBtn = document.getElementById('sidebar-upgrade-btn');
                if (upBtn) upBtn.style.display = 'none';
            },

            onClose: function () {
                alert('Checkout cancelled. Upgrade anytime to unlock professional features.');
            }
        });

        handler.openIframe();
    };

    const upBtn = document.getElementById('sidebar-upgrade-btn');
    if (upBtn) {
        if (user.isPaid) upBtn.style.display = 'none';
        upBtn.addEventListener('click', upgradeToPremium);
    }

    // --- Done-For-You System Logic ---
    const hireBtn = document.getElementById('hireMeBtn');
    const hireModal = document.getElementById('hireModal');
    const closeHire = document.getElementById('closeHire');
    const submitHire = document.getElementById('submitHire');

    if (hireBtn) {
        hireBtn.addEventListener('click', () => {
            hireModal.classList.remove('hidden');
        });
    }

    if (closeHire) {
        closeHire.addEventListener('click', () => {
            hireModal.classList.add('hidden');
        });
    }

    if (submitHire) {
        submitHire.addEventListener('click', () => {
            const name = document.getElementById('clientName').value.trim();
            const business = document.getElementById('clientBusiness').value.trim();
            const phone = document.getElementById('clientPhone').value.trim();
            const details = document.getElementById('clientDetails').value.trim();

            if (!name || !business || !phone || !details) {
                alert('⚠️ Please fill in all fields so I can better understand your needs.');
                return;
            }

            alert("📝 A small commitment fee may be required before the official project starts.\n\nRedirecting to WhatsApp to finalize your order...");

            const message = `🚀 NEW DFY REQUEST\n\nHello, I'd like you to build my website for me.\n\n👤 Name: ${name}\n🏢 Business: ${business}\n📞 Phone: ${phone}\n💬 Details: ${details}\n\n--- Shared via Liberty Self Site Builder ---`;
            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/2348023008857?text=${encodedMessage}`;

            window.open(whatsappURL, '_blank');
            hireModal.classList.add('hidden');
        });
    }

    // --- Initialization ---

    // Generate Button (Instant Update)
    elements.generateBtn.addEventListener('click', () => {
        updatePreview();
        // Visual feedback
        elements.generateBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Generating...';
        setTimeout(() => {
            elements.generateBtn.innerHTML = '<i class="fas fa-magic" style="margin-right: 0.5rem;"></i> Generate Site';
        }, 800);
    });

    // High-performance Name Color Sync (Direct DOM update)
    if (elements.inputs.nameColor) {
        elements.inputs.nameColor.addEventListener('input', (e) => {
            const color = e.target.value;
            state.nameColor = color;
            if (elements.previewContent) {
                // Update CSS variable for the container
                elements.previewContent.style.setProperty('--name-color', color);

                // Unified Branding Sync: Update both logos, hero titles, footer names and social icons
                const brandElements = elements.previewContent.querySelectorAll('.brand-name-straight, .brand-name, #edit-hero-title');
                const socialLinks = elements.previewContent.querySelectorAll('.social a');

                brandElements.forEach(el => el.style.setProperty('color', color, 'important'));
                socialLinks.forEach(el => el.style.setProperty('color', color, 'important'));
            }
            saveToLocalStorage();
        });
    }

    // Option Selectors
    if (elements.inputs.templateSelect) {
        elements.inputs.templateSelect.addEventListener('change', (e) => {
            state.template = e.target.value;
            state.accent = configs[state.template].accent;
            updateUIStates();
            updatePreview();
        });
    }

    if (elements.inputs.businessLogoFile) {
        elements.inputs.businessLogoFile.addEventListener('change', (e) => handleFileUpload(e, 'businessLogo'));
    }

    if (elements.inputs.headerBgFile) {
        elements.inputs.headerBgFile.addEventListener('change', (e) => handleFileUpload(e, 'headerBgImg'));
    }

    if (elements.inputs.heroImgFile) {
        elements.inputs.heroImgFile.addEventListener('change', (e) => handleFileUpload(e, 'heroImg'));
    }

    if (elements.inputs.addServiceBtn) {
        elements.inputs.addServiceBtn.addEventListener('click', () => {
            ensureCustomServices();
            state.customServices[state.template].push({
                title: 'New Service',
                desc: 'Describe your professional offering here...',
                image: ''
            });
            renderServiceList();
            updatePreview();
            setTimeout(() => syncScrollTo('services'), 100);
        });
    }

    if (elements.inputs.customBusinessType) {
        elements.inputs.customBusinessType.addEventListener('input', () => {
            safeUpdatePreview();
        });
    }

    // Social Links Logic
    if (elements.inputs.social.platformSelect) {
        elements.inputs.social.platformSelect.addEventListener('change', (e) => {
            const platform = e.target.value;
            // Update input value from state
            elements.inputs.social.input.value = state.socialLinks[platform] || '';
            // Update icon
            elements.inputs.social.icon.className = `fab fa-${platform}`;
        });
    }

    if (elements.inputs.social.input) {
        elements.inputs.social.input.addEventListener('input', (e) => {
            const platform = elements.inputs.social.platformSelect.value;
            state.socialLinks[platform] = e.target.value;
            safeUpdatePreview();
        });
        elements.inputs.social.input.addEventListener('focus', () => { syncScrollTo('contact'); });
    }

    elements.themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            state.accent = opt.dataset.color;
            updateUIStates();
            updatePreview();
        });
    });

    // Viewport Controls & Proportional Scaling Engine
    const updateViewportScale = () => {
        const viewport = document.querySelector('.preview-viewport');
        const frame = document.getElementById('preview-iframe-container');
        const content = document.getElementById('preview-content');
        if (!viewport || !frame || !content) return;

        // Reset scaling for calculations
        frame.style.transform = 'scale(1)';
        content.style.width = '100%';
        
        const availableWidth = viewport.offsetWidth - 80; // 40px padding on each side
        const activeBtn = document.querySelector('.control-btn.active');
        const targetWidth = activeBtn ? parseInt(activeBtn.dataset.width) : availableWidth;

        if (!activeBtn || activeBtn.dataset.width === '100%') {
            frame.style.width = '100%';
            frame.style.maxWidth = '1200px';
            frame.style.transform = 'scale(1)';
            content.style.width = '100%';
            return;
        }

        // Apply target width to the frame
        frame.style.width = `${targetWidth}px`;
        frame.style.maxWidth = 'none';

        // Check if frame fits in available width
        if (targetWidth > availableWidth) {
            const scale = availableWidth / targetWidth;
            frame.style.transformOrigin = 'top center';
            frame.style.transform = `scale(${scale})`;
            frame.style.position = 'relative';
            // Adjust margin to counteract scale-up displacement if needed
        } else {
            frame.style.transform = 'scale(1)';
        }
    };

    elements.viewportBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.viewportBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            updateViewportScale();
        });
    });

    window.addEventListener('resize', updateViewportScale);

    // Live update on input & Scroll Sync
    const syncScrollTo = (targetId) => {
        const target = elements.previewContent.querySelector('#' + targetId);
        if (target) {
            elements.previewContent.scrollTo({
                top: target.offsetTop,
                behavior: 'smooth'
            });
        }
    };

    [elements.inputs.businessName, elements.inputs.description].forEach(input => {
        input.addEventListener('input', () => {
            safeUpdatePreview();
            safeSave();
        });
        input.addEventListener('focus', () => { syncScrollTo('home'); });
    });

    if (elements.inputs.fontTrigger) {
        elements.inputs.fontTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            elements.inputs.fontDropdown.classList.toggle('active');
        });
    }

    if (elements.inputs.fontItems) {
        elements.inputs.fontItems.forEach(item => {
            item.addEventListener('click', () => {
                state.nameFont = item.dataset.font;
                elements.inputs.fontDropdown.classList.remove('active');
                updateUIStates();
                safeUpdatePreview();
                safeSave();
            });
            item.addEventListener('mouseenter', () => {
                const previewText = elements.previewContent.querySelector('.brand-name-straight');
                if (previewText) previewText.style.fontFamily = item.dataset.font;
            });
            item.addEventListener('mouseleave', () => {
                const previewText = elements.previewContent.querySelector('.brand-name-straight');
                if (previewText) previewText.style.fontFamily = state.nameFont;
            });
        });
    }

    // Close dropdown on outside click
    document.addEventListener('click', () => {
        if (elements.inputs.fontDropdown) elements.inputs.fontDropdown.classList.remove('active');
    });

    if (elements.inputs.headerOpacity) {
        elements.inputs.headerOpacity.addEventListener('input', (e) => {
            const val = e.target.value;
            state.headerOpacity = parseInt(val);
            elements.inputs.headerOpacityVal.innerText = `${val}%`;
            safeUpdatePreview();
            safeSave();
        });
    }

    if (elements.inputs.bgHeight) {
        elements.inputs.bgHeight.addEventListener('input', (e) => {
            state.bgHeight = parseInt(e.target.value);
            safeUpdatePreview();
            safeSave();
        });
    }

    if (elements.inputs.bgWidth) {
        elements.inputs.bgWidth.addEventListener('input', (e) => {
            state.bgWidth = parseInt(e.target.value);
            safeUpdatePreview();
            safeSave();
        });
    }

    [elements.inputs.phone, elements.inputs.address, elements.inputs.email].forEach(input => {
        input.addEventListener('input', () => { safeUpdatePreview(); });
        input.addEventListener('focus', () => { syncScrollTo('contact'); });
    });

    // (Duplicate listener for social input merged above)
    // Download Site functionality for Permanent access
    elements.publishBtn.addEventListener('click', () => {
        const siteTitle = elements.inputs.businessName.value || 'My Business';
        const previewClone = elements.previewContent.cloneNode(true);
        previewClone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
        previewClone.querySelectorAll('.edit-hint').forEach(el => el.remove());

        const html = previewClone.innerHTML;
        const fullContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteTitle}</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
        html { scroll-behavior: smooth; }
        body { margin:0; }
        section { scroll-margin-top: 80px; }
    </style>
</head>
<body>
    <div id="home">
        ${html}
    </div>
</body>
</html>`;

        const blob = new Blob([fullContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${siteTitle.toLowerCase().replace(/\s+/g, '-')}-website.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    const resetApp = () => {
        if (confirm('CAUTION: This will delete all your progress, saved businesses, and custom designs. You cannot undo this action. Proceed?')) {
            localStorage.clear();

            // Unregister service workers to clear cache if any
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    for (let registration of registrations) { registration.unregister(); }
                });
            }

            elements.inputs.loader.classList.remove('hidden');
            elements.inputs.loaderStatus.innerText = 'Resetting system database...';

            setTimeout(() => {
                location.reload(true);
            }, 1000);
        }
    };

    if (elements.inputs.resetBtn) {
        elements.inputs.resetBtn.addEventListener('click', resetApp);
    }

    // --- Data Management (Export / Import) ---
    const exportProject = () => {
        const data = {
            template: state.template,
            accent: state.accent,
            nameColor: state.nameColor,
            heroImg: state.heroImg,
            heroTitle: state.heroTitle,
            heroSub: state.heroSub,
            customServices: state.customServices,
            socialLinks: state.socialLinks,
            inputs: {
                name: elements.inputs.businessName.value,
                desc: elements.inputs.description.value,
                phone: elements.inputs.phone.value,
                address: elements.inputs.address.value,
                email: elements.inputs.email.value,
                nameColor: elements.inputs.nameColor ? elements.inputs.nameColor.value : '#0f172a'
            },
            version: '5.0'
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sitebuilder-project-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const importProject = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (re) => {
            try {
                const data = JSON.parse(re.target.result);
                // Save to storage and reload
                localStorage.setItem('premiumSiteState', JSON.stringify(data));
                elements.inputs.loader.classList.remove('hidden');
                elements.inputs.loaderStatus.innerText = 'Applying your project data...';
                setTimeout(() => {
                    location.reload(true);
                }, 800);
            } catch (err) { alert('Invalid project file format.'); }
        };
        reader.readAsText(file);
    };

    if (elements.inputs.exportBtn) elements.inputs.exportBtn.addEventListener('click', exportProject);
    if (elements.inputs.importFile) elements.inputs.importFile.addEventListener('change', importProject);

    // --- EVENT LISTENER: Section Toggle Logic ---
    document.querySelectorAll('#section-controls input').forEach(input => {
        input.addEventListener('change', (e) => {
            const id = e.target.dataset.section;
            const section = state.sections.find(s => s.id === id);
            if (section) {
                section.enabled = e.target.checked;
                safeUpdatePreview();
                safeSave();
            }
        });
    });

    // --- Boot Sequence ---
    // --- Project Persistence (Export/Import) ---
    const exportBtn = document.getElementById('export-json-btn');
    const importInput = document.getElementById('import-json-file');

    if (exportBtn) {
        exportBtn.onclick = () => {
            safeSave(); // Capture latest changes first
            const data = localStorage.getItem('premiumSiteState');
            if (!data) { alert('No work found to export.'); return; }

            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10);
            a.href = url;
            a.download = `SiteBuilder_Project_${timestamp}.json`;
            a.click();
            URL.revokeObjectURL(url);
        };
    }

    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (re) => {
                try {
                    const data = JSON.parse(re.target.result);
                    // Minimal validation: check for expected top-level keys
                    if (!data.businessName && !data.template) {
                        throw new Error('Invalid project file');
                    }

                    if (confirm('Import this project? All current unsaved work will be replaced.')) {
                        localStorage.setItem('premiumSiteState', JSON.stringify(data));
                        location.reload(); // Refresh app with new data
                    }
                } catch (err) {
                    alert('Error: The file you uploaded is not a valid SiteBuilder project file.');
                    console.error('Import error:', err);
                }
            };
            reader.readAsText(file);
            importInput.value = ''; // Reset input for future uploads
        });
    }

    setTimeout(() => {
        try {
            elements.inputs.loaderStatus.innerText = 'Syncing configurations...';
            loadFromLocalStorage();
            updatePreview();
            setTimeout(updateViewportScale, 100);
        } catch (err) {
            console.error('Boot error:', err);
            elements.inputs.loaderStatus.innerText = 'Recovering session...';
        } finally {
            setTimeout(() => {
                elements.inputs.loader.classList.add('hidden');
            }, 800);
        }
    }, 500);
});
