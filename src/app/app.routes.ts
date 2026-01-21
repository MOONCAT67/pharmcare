import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdersComponent } from './orders/orders.component';
import { DeliveriesComponent } from './deliveries/deliveries.component';
import { SalesComponent } from './sales/sales.component';
import { StockComponent } from './stock/stock.component';
import { EmployeesComponent } from './employees/employees.component';
import { RepportComponent } from './repport/repport.component';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';

export const routes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'sign-up',
        component: SignUpComponent
    },
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
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'sign-up',
        component: SignUpComponent
    }
];
