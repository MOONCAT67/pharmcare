import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Client {
  id: string;
  name: string;
  age: number;
  phone: string;
  address: string;
  lat: number;
  lng: number;
}

export type OrderStatus = 'New' | 'Prepared' | 'Waiting for Delivery' | 'Assigned' | 'On The Way' | 'Delivered' | 'Declined';
export type OrderType = 'Prescription' | 'List';

export interface Medicine {
  id: string;
  name: string;
  imageUrl?: string;
  available: boolean;
}

export interface RecipeData {
  dosage: string;
  timing: string;
  duration: string;
  warnings?: string;
  author?: string;
  createdAt?: string;
}

export interface Order {
  id: string;
  client: Client;
  type: OrderType;
  status: OrderStatus;
  time: string;
  items: string[];
  prescriptionImageUrl?: string;
  assignedDriverId?: string;
  // Medical instructions / recipe metadata
  recipe?: string;
  recipeCreatedAt?: string;
  recipeAuthor?: string;
  // Workstation fields
  medicines: Medicine[];
  prescriptionText?: string;
  recipeData?: RecipeData;
  pickupCode?: string;
  forwardedTo?: string;
}

export interface DeliveryDriver {
  id: string;
  name: string;
  area: string;
  available: boolean;
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, AfterViewInit {
  // Filters
  searchQuery = '';
  statusFilter: '' | OrderStatus = '';
  dateFilter: '' | 'today' | 'week' = '';

  // Mock data (replace with services)
  orders: Order[] = [];
  drivers: DeliveryDriver[] = [];
  pharmacy = { lat: 36.8065, lng: 10.1815 };

  // Selection state
  selectedOrder: Order | null = null;
  selectedDriverId: string | null = null;
  recipeDraft: string = '';
  // Workstation UI state
  activeTab: 'text' | 'image' = 'text';
  imgZoom = 1;
  medSearch = '';
  editingRecipe = false;
  recipeForm: RecipeData = { dosage: '', timing: '', duration: '', warnings: '' };
  pickupInput: string = '';

  // Leaflet map
  private map: any | null = null;
  private mapReady = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.seedMockData();
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.ensureLeaflet()
      .then(() => {
        this.mapReady = true;
      })
      .catch(() => {
        const el = document.getElementById('ordersMap');
        if (el) {
          el.classList.add('map--fallback');
          el.innerHTML = '<div class="map__placeholder">Map unavailable. Could not load Leaflet.</div>';
        }
      });
  }

  // Mock data
  private seedMockData(): void {
    const clients: Client[] = [
      { id: 'c1', name: 'John Smith', age: 62, phone: '+216 22 111 222', address: 'Ave. Habib Bourguiba, Tunis', lat: 36.8005, lng: 10.181 },
      { id: 'c2', name: 'Mary Johnson', age: 35, phone: '+216 23 333 444', address: 'La Marsa, Tunis', lat: 36.891, lng: 10.321 },
      { id: 'c3', name: 'Alex Brown', age: 28, phone: '+216 20 555 666', address: 'Lac 2, Tunis', lat: 36.834, lng: 10.244 },
      { id: 'c4', name: 'Clinic Plus', age: 41, phone: '+216 71 777 888', address: 'Bardo, Tunis', lat: 36.808, lng: 10.139 },
      { id: 'c5', name: 'Laura White', age: 73, phone: '+216 98 999 000', address: 'Carthage, Tunis', lat: 36.856, lng: 10.328 },
    ];

    const meds = (names: Array<{ id: string; name: string; available: boolean; img?: string }>): Medicine[] =>
      names.map(n => ({ id: n.id, name: n.name, available: n.available, imageUrl: n.img }));

    this.orders = [
      {
        id: 'O-2001', client: clients[0], type: 'Prescription', status: 'New', time: '09:12', items: ['Amoxicillin 500mg', 'Vitamin D3'],
        prescriptionText: 'Rx: Amoxicillin 500mg, 3 times daily after meals for 7 days. Vitamin D3 daily after lunch.',
        prescriptionImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
        medicines: meds([
          { id: 'm1', name: 'Amoxicillin 500mg', available: true, img: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=400&auto=format&fit=crop' },
          { id: 'm2', name: 'Vitamin D3 1000IU', available: true, img: 'https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=400&auto=format&fit=crop' }
        ])
      },
      {
        id: 'O-2002', client: clients[1], type: 'List', status: 'Prepared', time: '09:40', items: ['Paracetamol 1g', 'Cough Syrup'],
        prescriptionText: 'Paracetamol 1g if fever. Cough syrup night only.',
        medicines: meds([
          { id: 'm3', name: 'Paracetamol 1g', available: true },
          { id: 'm4', name: 'Cough Syrup 200ml', available: true }
        ]),
        recipeData: { dosage: '1g', timing: 'after meals', duration: '3 days', warnings: 'Do not exceed 3g/day', author: 'Pharmacist Admin', createdAt: new Date().toISOString() }
      },
      {
        id: 'O-2003', client: clients[2], type: 'Prescription', status: 'Waiting for Delivery', time: '10:05', items: ['Ibuprofen 400mg'],
        prescriptionImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
        medicines: meds([
          { id: 'm5', name: 'Ibuprofen 400mg', available: true }
        ]),
        recipeData: { dosage: '400mg', timing: 'after meals', duration: '5 days', warnings: 'Avoid if gastric issues', author: 'Pharmacist Admin', createdAt: new Date().toISOString() }
      },
      {
        id: 'O-2004', client: clients[3], type: 'List', status: 'Assigned', time: '10:22', items: ['Face Mask x50', 'Hand Sanitizer 500ml'],
        medicines: meds([
          { id: 'm6', name: 'Face Mask x50', available: true },
          { id: 'm7', name: 'Hand Sanitizer 500ml', available: true }
        ]),
        recipeData: { dosage: '-', timing: '-', duration: '-', warnings: 'Use as directed', author: 'Pharmacist Admin', createdAt: new Date().toISOString() },
        assignedDriverId: 'd3',
        pickupCode: '824193'
      },
      {
        id: 'O-2005', client: clients[4], type: 'Prescription', status: 'Delivered', time: '11:01', items: ['Vitamin C 1000mg'],
        medicines: meds([
          { id: 'm8', name: 'Vitamin C 1000mg', available: true }
        ]),
        prescriptionText: 'Vitamin C 1000mg daily with breakfast.',
        recipeData: { dosage: '1000mg', timing: 'morning', duration: '14 days', warnings: 'Monitor blood pressure', author: 'Pharm. A. Idriss', createdAt: new Date().toISOString() }
      },
      {
        id: 'O-2006', client: clients[2], type: 'Prescription', status: 'Declined', time: '11:20', items: ['Azithromycin 500mg'],
        medicines: meds([
          { id: 'm9', name: 'Azithromycin 500mg', available: false }
        ]),
        forwardedTo: 'Pharmacy Downtown'
      }
    ];

    this.drivers = [
      { id: 'd1', name: 'Driver A', area: 'Center', available: true,  lat: 36.81, lng: 10.19 },
      { id: 'd2', name: 'Driver B', area: 'North',  available: false, lat: 36.87, lng: 10.26 },
      { id: 'd3', name: 'Driver C', area: 'West',   available: true,  lat: 36.80, lng: 10.17 },
    ];
  }

  // Filtered list
  get filteredOrders(): Order[] {
    const q = this.searchQuery.trim().toLowerCase();
    const status = this.statusFilter;
    const date = this.dateFilter;
    return this.orders.filter(o => {
      const matchesText = !q || [o.id, o.client.name, o.client.address].some(v => v.toLowerCase().includes(q));
      const matchesStatus = !status || o.status === status;
      // Demo date filter: pretend ids ending in 1/2 are today
      const matchesDate = !date || (date === 'today' ? /[12]$/.test(o.id) : true);
      return matchesText && matchesStatus && matchesDate;
    });
  }

  selectOrder(o: Order): void {
    this.selectedOrder = o;
    this.selectedDriverId = o.assignedDriverId ?? null;
    this.recipeDraft = o.recipe ?? '';
    // Initialize workstation state
    this.activeTab = o.prescriptionText ? 'text' : (o.prescriptionImageUrl ? 'image' : 'text');
    this.imgZoom = 1;
    this.medSearch = '';
    this.editingRecipe = false;
    this.recipeForm = {
      dosage: o.recipeData?.dosage || '',
      timing: o.recipeData?.timing || '',
      duration: o.recipeData?.duration || '',
      warnings: o.recipeData?.warnings || ''
    };
    this.pickupInput = '';
    this.renderMap();
  }

  // === Workflow actions (mocked, service-ready placeholders) ===
  markPrepared(): void {
    if (!this.selectedOrder) return;
    if (this.selectedOrder.status !== 'New') return;
    this.selectedOrder.status = 'Prepared';
  }

  moveToWaitingForDelivery(): void {
    if (!this.selectedOrder) return;
    if (this.selectedOrder.status !== 'Prepared') return;
    this.selectedOrder.status = 'Waiting for Delivery';
  }

  // Alias used by new workstation UI
  markWaitingForDelivery(): void { this.moveToWaitingForDelivery(); }

  // Simulates the mobile app driver claim: first available driver who clicks wins
  claimOrder(orderId: string, driverId: string): void {
    // TODO: Replace with OrdersService.claimOrder(orderId, driverId)
    const order = this.orders.find(o => o.id === orderId);
    const driver = this.drivers.find(d => d.id === driverId);
    if (!order || !driver) return;
    if (order.status !== 'Waiting for Delivery') return; // only claimable in this pool
    if (order.assignedDriverId) return; // already claimed
    if (!driver.available) return; // cannot claim if not available
    order.assignedDriverId = driverId;
    order.status = 'Assigned';
    order.pickupCode = this.generatePickupCode();
    driver.available = false; // lock driver to this order
    if (this.selectedOrder?.id === orderId) {
      this.selectedDriverId = driverId;
      this.renderMap();
    }
  }

  simulateRandomClaim(): void {
    if (!this.selectedOrder || this.selectedOrder.status !== 'Waiting for Delivery') return;
    const avail = this.drivers.filter(d => d.available);
    if (avail.length === 0) return;
    const idx = Math.floor(Math.random() * avail.length);
    this.claimOrder(this.selectedOrder.id, avail[idx].id);
  }

  startDelivery(): void {
    if (!this.selectedOrder) return;
    if (this.selectedOrder.status !== 'Assigned') return;
    this.selectedOrder.status = 'On The Way';
    this.renderMap();
  }

  markDelivered(): void {
    if (!this.selectedOrder) return;
    if (this.selectedOrder.status !== 'On The Way') return;
    this.selectedOrder.status = 'Delivered';
    this.renderMap();
  }

  saveRecipe(): void {
    if (!this.selectedOrder) return;
    // Read-only once assigned/on the way/delivered
    if (this.selectedOrder.status === 'Assigned' || this.selectedOrder.status === 'On The Way' || this.selectedOrder.status === 'Delivered') return;
    const text = (this.recipeDraft || '').trim();
    if (!text) return;
    // TODO: Replace with OrdersService.saveRecipe(orderId, recipeText)
    this.selectedOrder.recipe = text;
    this.selectedOrder.recipeAuthor = 'Pharmacist Admin';
    this.selectedOrder.recipeCreatedAt = new Date().toISOString();
  }

  // Workstation helpers and actions
  statusClass(s: OrderStatus): string {
    switch (s) {
      case 'New': return 'badge--new';
      case 'Prepared': return 'badge--prepared';
      case 'Waiting for Delivery': return 'badge--waiting';
      case 'Assigned': return 'badge--assigned';
      case 'On The Way': return 'badge--ontheway';
      case 'Delivered': return 'badge--delivered';
      case 'Declined': return 'badge--missing';
      default: return '';
    }
  }

  setTab(tab: 'text' | 'image'): void { this.activeTab = tab; }
  zoomIn(): void { this.imgZoom = Math.min(2, Math.round((this.imgZoom + 0.1) * 10) / 10); }
  zoomOut(): void { this.imgZoom = Math.max(0.6, Math.round((this.imgZoom - 0.1) * 10) / 10); }

  get visibleMedicines(): Medicine[] {
    if (!this.selectedOrder) return [];
    const q = this.medSearch.trim().toLowerCase();
    const meds = this.selectedOrder.medicines || [];
    return !q ? meds : meds.filter(m => m.name.toLowerCase().includes(q));
  }

  hasMissingMedicines(o: Order): boolean { return (o.medicines || []).some(m => !m.available); }

  enterRecipeMode(): void { this.editingRecipe = true; }
  saveRecipeForm(): void {
    if (!this.selectedOrder) return;
    const data: RecipeData = {
      dosage: (this.recipeForm.dosage || '').trim(),
      timing: (this.recipeForm.timing || '').trim(),
      duration: (this.recipeForm.duration || '').trim(),
      warnings: (this.recipeForm.warnings || '').trim(),
      author: 'Pharmacist Admin',
      createdAt: new Date().toISOString(),
    };
    // TODO: OrdersService.saveRecipe(orderId, recipeText)
    this.selectedOrder.recipeData = data;
    this.editingRecipe = false;
  }

  sendRecipe(): void {
    if (!this.selectedOrder?.recipeData) return;
    // TODO: integrate with messaging API
    console.info('Recipe sent to', this.selectedOrder.client.phone, this.selectedOrder.recipeData);
  }

  printRecipe(): void {
    // TODO: better printable template
    if (!isPlatformBrowser(this.platformId)) return;
    window.print();
  }

  declineOrder(): void { if (this.selectedOrder) this.selectedOrder.status = 'Declined'; }
  forwardOrder(): void { if (this.selectedOrder) { this.selectedOrder.forwardedTo = 'Nearest partner pharmacy'; this.selectedOrder.status = 'Declined'; } }

  verifyPickupCode(): void {
    if (!this.selectedOrder || this.selectedOrder.status !== 'Assigned') return;
    const input = (this.pickupInput || '').trim();
    if (!input) return;
    if (input === this.selectedOrder.pickupCode) this.startDelivery();
  }

  private generatePickupCode(): string {
    // 6-digit numeric code
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  getDriverName(id: string | null | undefined): string {
    if (!id) return '';
    const d = this.drivers.find(x => x.id === id);
    return d?.name ?? id;
  }

  private renderMap(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.mapReady) return;
    const target = document.getElementById('ordersMap');
    if (!target) return;

    this.ensureLeaflet().then((L: any) => {
      if (!this.map) {
        this.map = L.map('ordersMap', { center: [this.pharmacy.lat, this.pharmacy.lng], zoom: 13 });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(this.map);
      }

      // Remove non-tile layers
      const toRemove: any[] = [];
      // @ts-ignore
      this.map.eachLayer((layer: any) => { if (!layer.getAttribution) toRemove.push(layer); });
      toRemove.forEach(l => this.map!.removeLayer(l));

      const pharmacyIcon = L.divIcon({ className: 'marker', html: '<div class="pin pin--green"></div>', iconSize: [24, 24], iconAnchor: [12, 24] });
      const clientIcon   = L.divIcon({ className: 'marker', html: '<div class="pin pin--red"></div>',   iconSize: [22, 22], iconAnchor: [11, 22] });
      const driverIcon   = L.divIcon({ className: 'marker', html: '<div class="pin pin--blue"></div>',  iconSize: [22, 22], iconAnchor: [11, 22] });

      // Pharmacy
      L.marker([this.pharmacy.lat, this.pharmacy.lng], { icon: pharmacyIcon }).addTo(this.map).bindPopup('Pharmacy');

      // Client
      if (this.selectedOrder) {
        const c = this.selectedOrder.client;
        L.marker([c.lat, c.lng], { icon: clientIcon }).addTo(this.map).bindPopup(c.name);
      }

      // Driver
      if (this.selectedOrder?.assignedDriverId) {
        const d = this.drivers.find(x => x.id === this.selectedOrder!.assignedDriverId);
        if (d) L.marker([d.lat, d.lng], { icon: driverIcon }).addTo(this.map).bindTooltip(d.name);
      }

      // Fit
      const bounds: any[] = [[this.pharmacy.lat, this.pharmacy.lng]];
      if (this.selectedOrder) bounds.push([this.selectedOrder.client.lat, this.selectedOrder.client.lng]);
      if (this.selectedOrder?.assignedDriverId) {
        const d = this.drivers.find(x => x.id === this.selectedOrder!.assignedDriverId);
        if (d) bounds.push([d.lat, d.lng]);
      }
      if (bounds.length > 1) {
        // @ts-ignore
        this.map.fitBounds(bounds, { padding: [30, 30] });
      } else {
        this.map.setView([this.pharmacy.lat, this.pharmacy.lng], 13);
      }
    });
  }

  // Load Leaflet from CDN
  private ensureLeaflet(): Promise<any> {
    return new Promise((resolve, reject) => {
      const w = window as any;
      if (w.L) return resolve(w.L);

      const cssId = 'leaflet-css-cdn';
      if (!document.getElementById(cssId)) {
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const scriptId = 'leaflet-js-cdn';
      if (document.getElementById(scriptId)) {
        const check = () => (w.L ? resolve(w.L) : setTimeout(check, 50));
        check();
        return;
      }
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => (w.L ? resolve(w.L) : reject('Leaflet not available after load'));
      script.onerror = () => reject('Failed to load Leaflet script');
      document.body.appendChild(script);
    });
  }
}
