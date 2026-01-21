import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StockService, StockItem } from './stock.service';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css']
})
export class StockComponent implements OnInit {

  allStock: StockItem[] = [];
  displayedStock: StockItem[] = [];

  // Filters
  searchTerm: string = '';
  filterCategory: string = '';
  filterStatus: 'All' | 'Low Stock' | 'Out of Stock' | 'Expiring Soon' = 'All';

  // KPIs
  kpiTotalItems = 0;
  kpiLowStock = 0;
  kpiOutOfStock = 0;
  kpiExpiring = 0;

  constructor(private stockService: StockService) { }

  ngOnInit(): void {
    this.stockService.getStockItems().subscribe(data => {
      this.allStock = data;
      this.calculateKPIs();
      this.applyFilters();
    });
  }

  calculateKPIs() {
    this.kpiTotalItems = this.allStock.length;
    this.kpiOutOfStock = this.allStock.filter(i => i.quantity === 0).length;
    this.kpiLowStock = this.allStock.filter(i => i.quantity > 0 && i.quantity <= i.minQuantity).length;

    // Expiring within 30 days
    const thr = new Date();
    thr.setDate(thr.getDate() + 30);
    this.kpiExpiring = this.allStock.filter(i => i.expiryDate <= thr).length;
  }

  applyFilters() {
    let res = this.allStock;

    // 1. Text Search
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      res = res.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.batchNumber.toLowerCase().includes(q)
      );
    }

    // 2. Category
    if (this.filterCategory) {
      res = res.filter(i => i.category === this.filterCategory);
    }

    // 3. Status
    if (this.filterStatus !== 'All') {
      const now = new Date();
      const thr = new Date();
      thr.setDate(now.getDate() + 30);

      if (this.filterStatus === 'Out of Stock') {
        res = res.filter(i => i.quantity === 0);
      } else if (this.filterStatus === 'Low Stock') {
        res = res.filter(i => i.quantity > 0 && i.quantity <= i.minQuantity);
      } else if (this.filterStatus === 'Expiring Soon') {
        res = res.filter(i => i.expiryDate <= thr);
      }
    }

    this.displayedStock = res;
  }

  // --- Helpers for HTML ---

  getStockStatus(item: StockItem): 'Out' | 'Low' | 'OK' {
    if (item.quantity === 0) return 'Out';
    if (item.quantity <= item.minQuantity) return 'Low';
    return 'OK';
  }

  isExpiring(item: StockItem): boolean {
    const thr = new Date();
    thr.setDate(thr.getDate() + 30);
    return item.expiryDate <= thr;
  }

  getProgressBarColor(item: StockItem): string {
    const status = this.getStockStatus(item);
    if (status === 'Out') return '#ef4444'; // Red
    if (status === 'Low') return '#f59e0b'; // Orange
    return '#10b981'; // Green
  }

  getProgressBarWidth(item: StockItem): string {
    if (item.maxQuantity <= 0) return '0%';
    const pct = (item.quantity / item.maxQuantity) * 100;
    return `${Math.min(pct, 100)}%`;
  }
}
