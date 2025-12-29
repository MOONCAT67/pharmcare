import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Client {
  id: string;
  name: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
}

export type OrderStatus = 'New' | 'Assigned' | 'On The Way' | 'Delivered';
export type OrderType = 'Prescription' | 'List';

export interface Order {
  id: string;
  client: Client;
  type: OrderType;
  status: OrderStatus;
  time: string;
  items: string[];
  prescriptionImageUrl?: string;
  assignedDriverId?: string;
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
      { id: 'c1', name: 'John Smith', phone: '+216 22 111 222', address: 'Ave. Habib Bourguiba, Tunis', lat: 36.8005, lng: 10.181 },
      { id: 'c2', name: 'Mary Johnson', phone: '+216 23 333 444', address: 'La Marsa, Tunis', lat: 36.891, lng: 10.321 },
      { id: 'c3', name: 'Alex Brown', phone: '+216 20 555 666', address: 'Lac 2, Tunis', lat: 36.834, lng: 10.244 },
      { id: 'c4', name: 'Clinic Plus', phone: '+216 71 777 888', address: 'Bardo, Tunis', lat: 36.808, lng: 10.139 },
      { id: 'c5', name: 'Laura White', phone: '+216 98 999 000', address: 'Carthage, Tunis', lat: 36.856, lng: 10.328 },
    ];

    this.orders = [
      { id: 'O-1001', client: clients[0], type: 'Prescription', status: 'New',        time: '09:12', items: ['Amoxicillin 500mg', 'Vitamin D3'], prescriptionImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop' },
      { id: 'O-1002', client: clients[1], type: 'List',         status: 'Assigned',   time: '09:40', items: ['Paracetamol 1g', 'Cough Syrup'], assignedDriverId: 'd1' },
      { id: 'O-1003', client: clients[2], type: 'Prescription', status: 'On The Way', time: '10:05', items: ['Ibuprofen 400mg'], prescriptionImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop', assignedDriverId: 'd2' },
      { id: 'O-1004', client: clients[3], type: 'List',         status: 'Assigned',   time: '10:22', items: ['Face Mask x50', 'Hand Sanitizer 500ml'], assignedDriverId: 'd3' },
      { id: 'O-1005', client: clients[4], type: 'Prescription', status: 'Delivered',  time: '11:01', items: ['Vitamin C 1000mg'] },
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
    this.renderMap();
  }

  assignDriver(): void {
    if (!this.selectedOrder || !this.selectedDriverId) return;
    // TODO: OrdersService.assignDriver(orderId, driverId)
    this.selectedOrder.assignedDriverId = this.selectedDriverId;
    this.renderMap();
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
