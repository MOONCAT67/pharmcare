import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService, SaleItem, SaleCategory, PaymentMethod } from './sales.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css']
})
export class SalesComponent implements OnInit {

  // Data
  allSales: SaleItem[] = [];
  displayedSales: SaleItem[] = [];

  // Filters
  searchTerm: string = '';
  filterCategory: string = '';
  filterPayment: string = '';
  filterDate: string = ''; // YYYY-MM-DD

  // KPIs
  kpiTotalRevenue = 0;
  kpiTotalMedicines = 0;
  kpiTotalOrders = 0;
  kpiAvgOrderValue = 0;

  constructor(private salesService: SalesService) { }

  ngOnInit(): void {
    this.salesService.getSales().subscribe(data => {
      this.allSales = data;
      this.applyFilters(); // Initial calculation
    });
  }

  applyFilters(): void {
    let filtered = this.allSales;

    // 1. Search (Medicine Name)
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s => s.medicineName.toLowerCase().includes(q));
    }

    // 2. Category
    if (this.filterCategory) {
      filtered = filtered.filter(s => s.category === this.filterCategory);
    }

    // 3. Payment
    if (this.filterPayment) {
      filtered = filtered.filter(s => s.paymentMethod === this.filterPayment);
    }

    // 4. Date
    if (this.filterDate) {
      const target = new Date(this.filterDate).setHours(0, 0, 0, 0);
      filtered = filtered.filter(s => {
        const itemDate = new Date(s.soldAt).setHours(0, 0, 0, 0);
        return itemDate === target;
      });
    }

    this.displayedSales = filtered;
    this.calculateKPIs();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterCategory = '';
    this.filterPayment = '';
    this.filterDate = '';
    this.applyFilters();
  }

  private calculateKPIs(): void {
    const data = this.displayedSales;
    if (data.length === 0) {
      this.kpiTotalRevenue = 0;
      this.kpiTotalMedicines = 0;
      this.kpiTotalOrders = 0;
      this.kpiAvgOrderValue = 0;
      return;
    }

    this.kpiTotalRevenue = data.reduce((acc, curr) => acc + (curr.status === 'Completed' ? curr.totalPrice : 0), 0);
    this.kpiTotalMedicines = data.reduce((acc, curr) => acc + (curr.status === 'Completed' ? curr.quantity : 0), 0);

    // Unique orders
    const uniqueOrders = new Set(data.filter(s => s.status === 'Completed').map(s => s.orderId));
    this.kpiTotalOrders = uniqueOrders.size;

    this.kpiAvgOrderValue = this.kpiTotalOrders > 0 ? this.kpiTotalRevenue / this.kpiTotalOrders : 0;
  }
}
