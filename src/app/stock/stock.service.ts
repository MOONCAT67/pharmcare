import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface StockItem {
    id: string;
    name: string;
    category: 'Prescription' | 'OTC' | 'Parapharmacy' | 'Medical Device';
    imageUrl?: string;
    quantity: number;
    minQuantity: number;
    maxQuantity: number; // For visualization context
    expiryDate: Date;
    batchNumber: string;
    supplier: string;
    lastRestock: Date;
    location: string;
}

@Injectable({
    providedIn: 'root'
})
export class StockService {

    private mockStock: StockItem[] = [];

    constructor() {
        this.seedMockData();
    }

    getStockItems(): Observable<StockItem[]> {
        return of(this.mockStock);
    }

    private seedMockData() {
        const today = new Date();
        const future = (days: number) => new Date(today.getTime() + days * 86400000);
        const past = (days: number) => new Date(today.getTime() - days * 86400000);

        const items: Partial<StockItem>[] = [
            { name: 'Amoxicillin 500mg', category: 'Prescription', quantity: 120, minQuantity: 50, maxQuantity: 500, expiryDate: future(180), supplier: 'PharmaDist', location: 'A-12', imageUrl: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=200&q=80' },
            { name: 'Doliprane 1000mg', category: 'OTC', quantity: 15, minQuantity: 30, maxQuantity: 200, expiryDate: future(365), supplier: 'MediSupply', location: 'B-04', imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80' },
            { name: 'Insulin Lantus', category: 'Prescription', quantity: 5, minQuantity: 10, maxQuantity: 50, expiryDate: future(20), supplier: 'BioCare', location: 'Ref-01', imageUrl: 'https://images.unsplash.com/photo-1631549916768-4119b2d5f926?w=200&q=80' },
            { name: 'Vitamin C 1000mg', category: 'OTC', quantity: 0, minQuantity: 20, maxQuantity: 100, expiryDate: future(120), supplier: 'NutriHealth', location: 'C-08', imageUrl: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&q=80' },
            { name: 'N95 Masks', category: 'Medical Device', quantity: 450, minQuantity: 100, maxQuantity: 1000, expiryDate: future(700), supplier: 'SafeGear', location: 'D-01', imageUrl: 'https://images.unsplash.com/photo-1586942593568-29361efcd571?w=200&q=80' },
            { name: 'Hand Sanitizer', category: 'Parapharmacy', quantity: 8, minQuantity: 20, maxQuantity: 100, expiryDate: future(400), supplier: 'CleanCo', location: 'D-02', imageUrl: 'https://images.unsplash.com/photo-1584483766114-2cea6fac2564?w=200&q=80' },
            { name: 'Ibuprofen 400mg', category: 'OTC', quantity: 85, minQuantity: 40, maxQuantity: 200, expiryDate: future(15), supplier: 'MediSupply', location: 'B-05', imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&q=80' },
            { name: 'Augmentin 1g', category: 'Prescription', quantity: 200, minQuantity: 50, maxQuantity: 300, expiryDate: future(90), supplier: 'PharmaDist', location: 'A-13' },
            { name: 'Spasfon', category: 'OTC', quantity: 42, minQuantity: 30, maxQuantity: 150, expiryDate: future(500), supplier: 'MediSupply', location: 'B-02' },
            { name: 'Thermometer Digital', category: 'Medical Device', quantity: 12, minQuantity: 5, maxQuantity: 30, expiryDate: future(1000), supplier: 'TechMed', location: 'E-01' }
        ];

        this.mockStock = items.map((item, index) => ({
            id: `STK-${1000 + index}`,
            name: item.name!,
            category: item.category as any,
            imageUrl: item.imageUrl,
            quantity: item.quantity!,
            minQuantity: item.minQuantity!,
            maxQuantity: item.maxQuantity!,
            expiryDate: item.expiryDate!,
            batchNumber: `BN-${Math.floor(Math.random() * 10000)}`,
            supplier: item.supplier!,
            lastRestock: past(Math.floor(Math.random() * 30)),
            location: item.location!
        }));
    }
}
