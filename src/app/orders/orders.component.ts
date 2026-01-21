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
  // Stock and per-medicine recipe fields
  existsInStock: boolean;
  dosage: string;            // e.g. 500mg
  intakeTimes: {             // timing checkboxes
    morning: boolean;
    noon: boolean;
    evening: boolean;        // Added for new UI
    night: boolean;
    beforeMeals: boolean;
  };
  frequency: string;         // e.g. 2x/day
  duration: string;          // e.g. 7 days
  warnings?: string;         // interactions, age limits, etc.
  recipeValidated: boolean;  // has pharmacist validated this medicine recipe?
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
  // Workstation fields
  medicines: Medicine[];
  prescriptionText?: string;
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
  // Workstation UI state
  activeTab: 'text' | 'image' = 'text';
  imgZoom = 1;
  medSearch = '';
  pickupInput: string = '';

  // Leaflet map
  private map: any | null = null;
  private mapReady = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

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

    const med = (id: string, name: string, exists: boolean, img?: string, init?: Partial<Medicine>): Medicine => ({
      id,
      name,
      imageUrl: img,
      existsInStock: exists,
      dosage: '',
      intakeTimes: { morning: false, noon: false, evening: false, night: false, beforeMeals: false },
      frequency: '',
      duration: '',
      warnings: '',
      recipeValidated: false,
      ...(init || {})
    });

    this.orders = [
      {
        id: 'O-3001', client: clients[0], type: 'Prescription', status: 'New', time: '09:12', items: ['Amoxicillin 500mg', 'Vitamin D3'],
        prescriptionText: 'Rx: Amoxicillin 500mg 3x/day after meals for 7 days. Vit D3 daily.',
        prescriptionImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
        medicines: [
          med('m1', 'Amoxicillin 500mg', true, 'https://images.unsplash.com/photo-1584362917165-526a968579e8?q=80&w=400&auto=format&fit=crop',
            { dosage: '500mg', frequency: '3x/day', duration: '7 days', intakeTimes: { morning: true, noon: true, evening: false, night: true, beforeMeals: false }, recipeValidated: true }),
          med('m2', 'Vitamin D3 1000IU', true, 'https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=400&auto=format&fit=crop')
        ]
      },
      {
        id: 'O-3002', client: clients[1], type: 'Prescription', status: 'New', time: '10:05', items: ['Ibuprofen 400mg'],
        prescriptionImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop',
        medicines: [
          med('m3', 'Ibuprofen 400mg', true, undefined, { dosage: '400mg', frequency: '2x/day', duration: '5 days', intakeTimes: { morning: true, noon: false, evening: false, night: true, beforeMeals: false }, warnings: 'Avoid if gastric issues', recipeValidated: true })
        ]
      },
      {
        id: 'O-3003', client: clients[2], type: 'Prescription', status: 'Waiting for Delivery', time: '10:22', items: ['Paracetamol 1g', 'Cough Syrup'],
        medicines: [
          med('m4', 'Paracetamol 1g', true, undefined, { dosage: '1g', frequency: '3x/day', duration: '3 days', intakeTimes: { morning: true, noon: true, evening: false, night: true, beforeMeals: false }, recipeValidated: true }),
          med('m5', 'Cough Syrup 200ml', true, undefined, { dosage: '10ml', frequency: '1x/night', duration: '5 days', intakeTimes: { morning: false, noon: false, evening: false, night: true, beforeMeals: false }, recipeValidated: true })
        ]
      },
      {
        id: 'O-3004', client: clients[3], type: 'Prescription', status: 'Assigned', time: '11:01', items: ['Vitamin C 1000mg'],
        medicines: [
          med('m6', 'Vitamin C 1000mg', true, undefined, { dosage: '1000mg', frequency: '1x/day', duration: '14 days', intakeTimes: { morning: true, noon: false, evening: false, night: false, beforeMeals: false }, recipeValidated: true })
        ],
        pickupCode: '824193',
        assignedDriverId: 'd3'
      },
      {
        id: 'O-3005', client: clients[2], type: 'Prescription', status: 'Declined', time: '11:20', items: ['Azithromycin 500mg'],
        medicines: [
          med('m7', 'Azithromycin 500mg', false)
        ],
        forwardedTo: 'Pharmacy Downtown'
      }
    ];

    this.drivers = [
      { id: 'd1', name: 'Driver A', area: 'Center', available: true, lat: 36.81, lng: 10.19 },
      { id: 'd2', name: 'Driver B', area: 'North', available: false, lat: 36.87, lng: 10.26 },
      { id: 'd3', name: 'Driver C', area: 'West', available: true, lat: 36.80, lng: 10.17 },
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
    // Initialize workstation state
    this.activeTab = o.prescriptionText ? 'text' : (o.prescriptionImageUrl ? 'image' : 'text');
    this.imgZoom = 1;
    this.medSearch = '';
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
    // Guard: only move when all medicines exist and validated
    if (!this.isOrderFullyValidated(this.selectedOrder)) return;
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

  // Medicine-centric helpers
  hasMissingMedicines(o: Order): boolean { return (o.medicines || []).some(m => !m.existsInStock); }

  anyUnavailable(o: Order): boolean { return this.hasMissingMedicines(o); }

  anyIncomplete(o: Order): boolean {
    const meds = o.medicines || [];
    return meds.some(m => m.existsInStock && !m.recipeValidated);
  }

  isMedicineComplete(m: Medicine): boolean {
    const hasTiming = m.intakeTimes.morning || m.intakeTimes.noon || m.intakeTimes.evening || m.intakeTimes.night || m.intakeTimes.beforeMeals;
    return !!(m.existsInStock && m.dosage && m.frequency && m.duration && hasTiming);
  }

  canValidateMedicine(m: Medicine): boolean { return this.isMedicineComplete(m); }

  validateMedicine(m: Medicine): void {
    if (!this.isMedicineComplete(m)) return;
    m.recipeValidated = true;
  }

  onAvailabilityChange(order: Order, m: Medicine, exists: boolean): void {
    m.existsInStock = !!exists;
    if (!exists) {
      order.status = 'Declined';
      order.forwardedTo = order.forwardedTo || 'Nearest partner pharmacy';
    }
  }

  isOrderFullyValidated(o: Order): boolean {
    const meds = o.medicines || [];
    return meds.length > 0 && meds.every(m => m.existsInStock && m.recipeValidated && this.isMedicineComplete(m));
  }

  validatedCount(o: Order): number {
    const meds = o.medicines || [];
    return meds.filter(m => m.existsInStock && m.recipeValidated).length;
  }

  printCombinedRecipe(): void {
    if (!this.selectedOrder) return;
    if (!isPlatformBrowser(this.platformId)) return;
    const o = this.selectedOrder;
    const blocks = (o.medicines || []).filter(m => m.existsInStock).map(m => `
      <section class="med-block">
        <h3>${m.name}</h3>
        <div><strong>Dosage:</strong> ${m.dosage}</div>
        <div><strong>Frequency:</strong> ${m.frequency}</div>
        <div><strong>Duration:</strong> ${m.duration}</div>
        ${m.warnings ? `<div><strong>Warnings:</strong> ${m.warnings}</div>` : ''}
        <div><strong>Intake:</strong>
          ${(m.intakeTimes.morning ? 'Morning · ' : '')}
          ${(m.intakeTimes.noon ? 'Noon · ' : '')}
          ${(m.intakeTimes.night ? 'Night · ' : '')}
          ${(m.intakeTimes.beforeMeals ? 'Before meals' : '')}
        </div>
      </section>
    `).join('<hr />');
    const html = `<!doctype html><html><head><meta charset="utf-8"/>
      <title>Prescription</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111}
        h2{margin:0 0 6px}
        .muted{color:#555}
        .med-block{margin:16px 0}
        hr{border:none;border-top:1px dashed #999;margin:16px 0}
      </style>
    </head><body>
      <header>
        <h2>Medical Prescription</h2>
        <div class="muted">${new Date().toLocaleString()}</div>
      </header>
      <section>
        <h3>Client</h3>
        <div><strong>Name:</strong> ${o.client.name}</div>
        <div><strong>Phone:</strong> ${o.client.phone}</div>
        <div><strong>Address:</strong> ${o.client.address}</div>
      </section>
      <hr/>
      ${blocks}
      <script>setTimeout(()=>{window.print();window.close();},200);</script>
    </body></html>`;
    const w = window.open('', '_blank');
    if (w) { w.document.write(html); w.document.close(); }
  }

  sendCombinedRecipe(): void {
    if (!this.selectedOrder) return;
    // TODO: integrate with messaging API
    console.info('Send combined recipe to', this.selectedOrder.client.phone, this.selectedOrder.medicines);
  }

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
      const clientIcon = L.divIcon({ className: 'marker', html: '<div class="pin pin--red"></div>', iconSize: [22, 22], iconAnchor: [11, 22] });
      const driverIcon = L.divIcon({ className: 'marker', html: '<div class="pin pin--blue"></div>', iconSize: [22, 22], iconAnchor: [11, 22] });

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
