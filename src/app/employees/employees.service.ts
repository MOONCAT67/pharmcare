import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Employee {
    id: string;
    fullName: string;
    role: 'Pharmacist' | 'Assistant' | 'Delivery';
    status: 'Available' | 'Busy' | 'Off-Duty';
    photoUrl: string;
    phone: string;
    email: string;
    shiftStr: string;
    activeTasks: number; // Orders preparing or deliveries in progress
    joinedDate: Date;
}

@Injectable({
    providedIn: 'root'
})
export class EmployeesService {

    private mockEmployees: Employee[] = [];

    constructor() {
        this.seedMockData();
    }

    getEmployees(): Observable<Employee[]> {
        return of(this.mockEmployees);
    }

    private seedMockData() {
        this.mockEmployees = [
            {
                id: 'EMP-001',
                fullName: 'Dr. Sarah Amrani',
                role: 'Pharmacist',
                status: 'Available',
                photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80',
                phone: '+216 20 123 456',
                email: 'sarah.amrani@pharmacy.tn',
                shiftStr: '08:00 - 16:00',
                activeTasks: 0,
                joinedDate: new Date('2020-05-12')
            },
            {
                id: 'EMP-002',
                fullName: 'Ahmed Ben Ali',
                role: 'Assistant',
                status: 'Busy',
                photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80',
                phone: '+216 55 987 654',
                email: 'ahmed.benali@pharmacy.tn',
                shiftStr: '09:00 - 17:00',
                activeTasks: 3,
                joinedDate: new Date('2021-08-01')
            },
            {
                id: 'EMP-003',
                fullName: 'Karim Tounsi',
                role: 'Delivery',
                status: 'Busy',
                photoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&q=80',
                phone: '+216 98 111 222',
                email: 'karim.t@delivery.tn',
                shiftStr: '10:00 - 19:00',
                activeTasks: 2,
                joinedDate: new Date('2022-01-15')
            },
            {
                id: 'EMP-004',
                fullName: 'Lina Majdi',
                role: 'Pharmacist',
                status: 'Off-Duty',
                photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&q=80',
                phone: '+216 22 333 444',
                email: 'lina.majdi@pharmacy.tn',
                shiftStr: '16:00 - 23:00',
                activeTasks: 0,
                joinedDate: new Date('2021-11-20')
            },
            {
                id: 'EMP-005',
                fullName: 'Youssef Gharbi',
                role: 'Assistant',
                status: 'Available',
                photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
                phone: '+216 50 666 777',
                email: 'youssef.g@pharmacy.tn',
                shiftStr: '12:00 - 20:00',
                activeTasks: 1,
                joinedDate: new Date('2023-03-10')
            },
            {
                id: 'EMP-006',
                fullName: 'Sami Driver',
                role: 'Delivery',
                status: 'Available',
                photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80',
                phone: '+216 99 888 777',
                email: 'sami.d@delivery.tn',
                shiftStr: '08:00 - 16:00',
                activeTasks: 0,
                joinedDate: new Date('2022-06-01')
            },
            {
                id: 'EMP-007',
                fullName: 'Nour El Hoda',
                role: 'Assistant',
                status: 'Off-Duty',
                photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
                phone: '+216 21 000 000',
                email: 'nour.h@pharmacy.tn',
                shiftStr: '07:00 - 15:00',
                activeTasks: 0,
                joinedDate: new Date('2023-01-05')
            }
        ];
    }
}
