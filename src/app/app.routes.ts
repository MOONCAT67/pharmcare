import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { DeliveriesComponent } from './deliveries/deliveries.component';
import { SalesComponent } from './sales/sales.component';
import { StockComponent } from './stock/stock.component';
import { EmployeesComponent } from './employees/employees.component';
import { RepportComponent } from './repport/repport.component';

export const routes: Routes = [
    {
        path: '',
        component: DashboardComponent
    },
    {
        path: 'orders',
        component: OrdersComponent
    },
    {
        path: 'deliveries',
        component: DeliveriesComponent
    },
    {
        path: 'sales',
        component: SalesComponent
    },
    {
        path: 'stock',
        component: StockComponent
    },
    {
        path: 'employees',
        component: EmployeesComponent
    },
    {
        path: 'reports',
        component: RepportComponent
    },
];
