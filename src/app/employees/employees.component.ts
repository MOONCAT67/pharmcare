import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeesService, Employee } from './employees.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  allEmployees: Employee[] = [];
  displayedEmployees: Employee[] = [];

  // Filters
  searchTerm: string = '';
  filterRole: string = 'All';
  filterStatus: string = 'All';

  // KPIs
  kpiTotal = 0;
  kpiOnDuty = 0;
  kpiPharmacists = 0;
  kpiDelivery = 0;

  // Selected Employee
  selectedEmp: Employee | null = null;

  constructor(private empService: EmployeesService) { }

  ngOnInit(): void {
    this.empService.getEmployees().subscribe(data => {
      this.allEmployees = data;
      this.calculateKPIs();
      this.applyFilters();
    });
  }

  calculateKPIs() {
    this.kpiTotal = this.allEmployees.length;
    this.kpiOnDuty = this.allEmployees.filter(e => e.status !== 'Off-Duty').length;
    this.kpiPharmacists = this.allEmployees.filter(e => e.role === 'Pharmacist').length;
    this.kpiDelivery = this.allEmployees.filter(e => e.role === 'Delivery').length;
  }

  applyFilters() {
    let res = this.allEmployees;

    // 1. Search
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      res = res.filter(e => e.fullName.toLowerCase().includes(q));
    }

    // 2. Role
    if (this.filterRole !== 'All') {
      res = res.filter(e => e.role === this.filterRole);
    }

    // 3. Status
    if (this.filterStatus !== 'All') {
      res = res.filter(e => e.status === this.filterStatus);
    }

    this.displayedEmployees = res;
  }

  selectEmployee(emp: Employee) {
    this.selectedEmp = emp;
  }

  closeDetails() {
    this.selectedEmp = null;
  }

  // Helpers
  getStatusClass(status: string): string {
    switch (status) {
      case 'Available': return 'st-available';
      case 'Busy': return 'st-busy';
      case 'Off-Duty': return 'st-off';
      default: return '';
    }
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'Pharmacist': return '🩺';
      case 'Assistant': return '💊';
      case 'Delivery': return '🛵';
      default: return '👤';
    }
  }
}
