import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type DeliveryStatus = 'Pending' | 'On The Way' | 'Delivered' | 'Cancelled';

export interface Delivery {
  id: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  agentName: string;
  status: DeliveryStatus;
  date: Date;
  deliveryCode: string;
  medicines: Array<{ name: string; qty: string }>; // Simple summary
  totalItems: number;
  timeline: {
    preparedAt?: Date;
    assignedAt?: Date;
    pickedUpAt?: Date;
    deliveredAt?: Date;
  };
}

@Component({
  selector: 'app-deliveries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './deliveries.component.html',
  styleUrls: ['./deliveries.component.css']
})
export class DeliveriesComponent implements OnInit {
  // Filters
  filterDateStart: string = '';
  filterDateEnd: string = '';
  filterClient: string = '';
  filterAgent: string = '';

  // Data
  deliveries: Delivery[] = [];
  agents: string[] = ['Driver A', 'Driver B', 'Driver C', 'Express Delivery'];

  // Selection
  selectedDelivery: Delivery | null = null;

  ngOnInit(): void {
    this.seedMockData();
  }

  get filteredDeliveries(): Delivery[] {
    return this.deliveries.filter(d => {
      // Date Logic
      const dDate = new Date(d.date).setHours(0, 0, 0, 0);
      let afterStart = true;
      let beforeEnd = true;

      if (this.filterDateStart) {
        const start = new Date(this.filterDateStart).setHours(0, 0, 0, 0);
        afterStart = dDate >= start;
      }
      if (this.filterDateEnd) {
        const end = new Date(this.filterDateEnd).setHours(0, 0, 0, 0);
        beforeEnd = dDate <= end;
      }

      // Client Logic
      const matchesClient = !this.filterClient ||
        d.clientName.toLowerCase().includes(this.filterClient.toLowerCase()) ||
        d.clientPhone.includes(this.filterClient);

      // Agent Logic
      const matchesAgent = !this.filterAgent || d.agentName === this.filterAgent;

      return afterStart && beforeEnd && matchesClient && matchesAgent;
    }).sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  selectDelivery(d: Delivery): void {
    this.selectedDelivery = d;
  }

  resetFilters(): void {
    this.filterDateStart = '';
    this.filterDateEnd = '';
    this.filterClient = '';
    this.filterAgent = '';
  }

  // --- Helpers ---
  getStatusClass(s: DeliveryStatus): string {
    switch (s) {
      case 'Pending': return 'status--pending';
      case 'On The Way': return 'status--ontheway';
      case 'Delivered': return 'status--delivered';
      case 'Cancelled': return 'status--cancelled';
      default: return '';
    }
  }

  private seedMockData(): void {
    const now = new Date();
    const subDays = (d: number) => new Date(now.getTime() - d * 86400000);
    const subMins = (m: number) => new Date(now.getTime() - m * 60000);

    const meds = [
      [{ name: 'Amoxicillin 500mg', qty: '1 box' }, { name: 'Doliprane 1000mg', qty: '2 boxes' }],
      [{ name: 'Vitamin C', qty: '1 tube' }],
      [{ name: 'Insulin', qty: '3 pens' }, { name: 'Needles', qty: '1 pack' }],
      [{ name: 'Cough Syrup', qty: '1 bottle' }, { name: 'Throat Lozenges', qty: '1 pack' }],
      [{ name: 'Cardio Aspirin', qty: '1 box' }]
    ];

    this.deliveries = [
      // Today
      {
        id: 'DEL-8821',
        clientName: 'Sarah Connor',
        clientPhone: '+216 22 555 123',
        clientAddress: '12 Rue de Marseille, Tunis',
        agentName: 'Driver A',
        status: 'On The Way',
        date: subMins(45),
        deliveryCode: '9921',
        medicines: meds[0],
        totalItems: 3,
        timeline: { preparedAt: subMins(120), assignedAt: subMins(60), pickedUpAt: subMins(45) }
      },
      {
        id: 'DEL-8822',
        clientName: 'John Doe',
        clientPhone: '+216 55 111 000',
        clientAddress: 'Lac 1, Tunis',
        agentName: 'Driver B',
        status: 'Delivered',
        date: subHour(now, 2),
        deliveryCode: '1102',
        medicines: meds[1],
        totalItems: 1,
        timeline: { preparedAt: subHour(now, 4), assignedAt: subHour(now, 3), pickedUpAt: subHour(now, 2.5), deliveredAt: subHour(now, 2) }
      },
      {
        id: 'DEL-8823',
        clientName: 'Emily Blunt',
        clientPhone: '+216 98 777 888',
        clientAddress: 'Carthage Hannibal',
        agentName: 'Pending Assignment',
        status: 'Pending',
        date: subMins(10),
        deliveryCode: '-',
        medicines: meds[2],
        totalItems: 4,
        timeline: { preparedAt: subMins(10) }
      },
      // Yesterday
      {
        id: 'DEL-8810',
        clientName: 'Michael Scott',
        clientPhone: '+216 21 000 999',
        clientAddress: 'La Marsa Cube',
        agentName: 'Driver C',
        status: 'Delivered',
        date: subDays(1),
        deliveryCode: '3321',
        medicines: meds[3],
        totalItems: 2,
        timeline: { preparedAt: subDays(1), assignedAt: subDays(1), pickedUpAt: subDays(1), deliveredAt: subDays(1) }
      },
      {
        id: 'DEL-8809',
        clientName: 'Dwight Schrute',
        clientPhone: '+216 50 123 456',
        clientAddress: 'Farms Rd, Ariana',
        agentName: 'Driver A',
        status: 'Cancelled',
        date: subDays(1),
        deliveryCode: '-',
        medicines: meds[4],
        totalItems: 1,
        timeline: { preparedAt: subDays(1) }
      },
      // Older
      {
        id: 'DEL-8801',
        clientName: 'Jim Halpert',
        clientPhone: '+216 20 202 020',
        clientAddress: 'Bardo Center',
        agentName: 'Driver B',
        status: 'Delivered',
        date: subDays(3),
        deliveryCode: '5511',
        medicines: meds[0],
        totalItems: 3,
        timeline: { preparedAt: subDays(3), assignedAt: subDays(3), pickedUpAt: subDays(3), deliveredAt: subDays(3) }
      }
    ];

    // Duplicate some for volume
    for (let i = 0; i < 5; i++) {
      const d = { ...this.deliveries[1] };
      d.id = `DEL-879${i}`;
      d.date = subDays(4 + i);
      d.clientName = `Mock Client ${i}`;
      this.deliveries.push(d);
    }
  }
}

function subHour(d: Date, h: number): Date {
  return new Date(d.getTime() - h * 3600000);
}
