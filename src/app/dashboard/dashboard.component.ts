import { Component, AfterViewInit, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  // ===== Strongly-typed models =====
  // KPIs shown in the top cards
  kpis: { id: string; label: string; value: number; icon: string; delta?: number }[] = [
    { id: 'sales', label: "Today's Sales", value: 1830, icon: 'bi-cash-stack', delta: 6.4 },
    { id: 'orders', label: 'Orders Today', value: 42, icon: 'bi-clipboard-check', delta: 3.1 },
    { id: 'deliveries', label: 'Deliveries In Progress', value: 7, icon: 'bi-truck', delta: -1.2 },
    { id: 'lowStock', label: 'Low Stock Items', value: 12, icon: 'bi-exclamation-triangle' },
  ];

  // Chart mock data (replace later with Chart.js/ApexCharts service)
  salesTodayHourly: number[] = [2, 3, 4, 3, 5, 7, 6, 5, 8, 9, 7, 10];
  weeklySales: number[] = [34, 42, 28, 45, 51, 39, 60];
  salesTodayPath = '';
  weeklySalesPath = '';

  // Recent orders preview (last 5)
  recentOrders: { id: string; clientName: string; orderType: 'Prescription' | 'List'; status: 'New' | 'Assigned' | 'Delivered'; time: string }[] = [
    { id: 'o-101', clientName: 'John Smith', orderType: 'Prescription', status: 'New', time: '09:12' },
    { id: 'o-102', clientName: 'Mary Johnson', orderType: 'List', status: 'Assigned', time: '09:40' },
    { id: 'o-103', clientName: 'Pharma Clinic', orderType: 'Prescription', status: 'Delivered', time: '10:05' },
    { id: 'o-104', clientName: 'Alex Brown', orderType: 'List', status: 'Assigned', time: '10:22' },
    { id: 'o-105', clientName: 'Laura White', orderType: 'Prescription', status: 'New', time: '11:01' },
  ];

  // Deliveries mock + pharmacy location
  pharmacyLocation = { lat: 36.8065, lng: 10.1815 }; // Tunis center example
  deliveries: { id: string; driverName: string; lat: number; lng: number; status: 'PickingUp' | 'EnRoute' | 'Delivered' }[] = [
    { id: 'd-1', driverName: 'Driver A', lat: 36.81, lng: 10.19, status: 'EnRoute' },
    { id: 'd-2', driverName: 'Driver B', lat: 36.80, lng: 10.17, status: 'PickingUp' },
    { id: 'd-3', driverName: 'Driver C', lat: 36.79, lng: 10.20, status: 'EnRoute' },
  ];

  private map: any | null = null; // Leaflet Map instance

  ngOnInit(): void {
    // Compute lightweight SVG paths for inline charts
    this.salesTodayPath = this.createSparklinePath(this.salesTodayHourly, 280, 80, 6);
    this.weeklySalesPath = this.createSparklinePath(this.weeklySales, 280, 80, 12);

    // TODO: Inject KPI/Orders/Delivery services here when ready
    // TODO: Subscribe to WebSocket for real-time KPI/order updates
  }

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    // Only run map logic in the browser (avoid SSR errors: document/window not defined)
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Load Leaflet from CDN at runtime to avoid build-time dependency
    this.loadLeafletFromCDN()
      .then((L: any) => {
        this.map = L.map('deliveryMap', {
          center: [this.pharmacyLocation.lat, this.pharmacyLocation.lng],
          zoom: 13,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(this.map);

        const pharmacyIcon = L.divIcon({
          className: 'marker marker--pharmacy',
          html: '<div class="pin pin--green"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 24],
        });
        const driverIcon = L.divIcon({
          className: 'marker marker--driver',
          html: '<div class="pin pin--blue"></div>',
          iconSize: [22, 22],
          iconAnchor: [11, 22],
        });

        L.marker([this.pharmacyLocation.lat, this.pharmacyLocation.lng], { icon: pharmacyIcon })
          .addTo(this.map)
          .bindPopup('Pharmacy');

        this.deliveries.forEach((d) => {
          L.marker([d.lat, d.lng], { icon: driverIcon }).addTo(this.map).bindTooltip(d.driverName);
        });

        // TODO: Hook real-time driver tracking to update markers via WebSocket
      })
      .catch(() => {
        const el = document.getElementById('deliveryMap');
        if (el) {
          el.classList.add('map--fallback');
          el.innerHTML = '<div class="map__placeholder">Map preview unavailable. Could not load Leaflet.</div>';
        }
      });
  }

  // Load Leaflet JS + CSS from CDN if not present
  private loadLeafletFromCDN(): Promise<any> {
    return new Promise((resolve, reject) => {
      const w = window as any;
      if (w.L) {
        resolve(w.L);
        return;
      }
      // Inject CSS
      const cssId = 'leaflet-css-cdn';
      if (!document.getElementById(cssId)) {
        const link = document.createElement('link');
        link.id = cssId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      // Inject Script
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

  private createSparklinePath(values: number[], width: number, height: number, paddingX = 8): string {
    if (!values.length) return '';
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const stepX = (width - paddingX * 2) / (values.length - 1);
    const points = values.map((v, i) => {
      const x = paddingX + i * stepX;
      const y = height - ((v - min) / range) * (height - 12) - 6; // small padding top/bottom
      return { x, y };
    });
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const ctrlX = (prev.x + curr.x) / 2;
      d += ` Q ${ctrlX},${prev.y} ${curr.x},${curr.y}`;
    }
    return d;
  }
}
