import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export type SaleCategory = 'Prescription' | 'OTC' | 'Parapharmacy';
export type PaymentMethod = 'Cash' | 'Card' | 'Insurance';
export type SaleStatus = 'Completed' | 'Refunded';

export interface SaleItem {
    id: string;
    medicineName: string;
    medicineImage?: string;
    category: SaleCategory;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    orderId: string;
    soldAt: Date;
    status: SaleStatus;
    paymentMethod: PaymentMethod;
}

@Injectable({
    providedIn: 'root'
})
export class SalesService {

    private mockSales: SaleItem[] = [];

    constructor() {
        this.generateMockData();
    }

    getSales(): Observable<SaleItem[]> {
        return of(this.mockSales);
    }

    private generateMockData() {
        const medicines = [
            { name: 'Amoxicillin 500mg', price: 12.5, cat: 'Prescription' as SaleCategory, img: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=200&q=80' },
            { name: 'Doliprane 1000mg', price: 3.2, cat: 'OTC' as SaleCategory, img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&q=80' },
            { name: 'Vitamin C 1000mg', price: 8.9, cat: 'OTC' as SaleCategory, img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=200&q=80' },
            { name: 'La Roche-Posay Sunscreen', price: 45.0, cat: 'Parapharmacy' as SaleCategory, img: 'https://images.unsplash.com/photo-1556228720-19875164a63b?w=200&q=80' },
            { name: 'Cough Syrup', price: 6.5, cat: 'OTC' as SaleCategory, img: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=200&q=80' },
            { name: 'Ibuprofen 400mg', price: 5.4, cat: 'OTC' as SaleCategory, img: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=200&q=80' },
            { name: 'Insulin Pen', price: 85.0, cat: 'Prescription' as SaleCategory, img: 'https://images.unsplash.com/photo-1631549916768-4119b2d5f926?w=200&q=80' },
            { name: 'Hand Cream', price: 15.0, cat: 'Parapharmacy' as SaleCategory, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&q=80' }
        ];

        const methods: PaymentMethod[] = ['Cash', 'Card', 'Insurance'];

        // Generate last 50 sales
        const now = new Date();
        for (let i = 0; i < 50; i++) {
            const med = medicines[Math.floor(Math.random() * medicines.length)];
            const qty = Math.floor(Math.random() * 3) + 1; // 1-3
            const isRefund = Math.random() > 0.95; // 5% refund rate

            // Random time within last 48 hours
            const saleTime = new Date(now.getTime() - Math.floor(Math.random() * 48 * 60 * 60 * 1000));

            this.mockSales.push({
                id: `SL-${1000 + i}`,
                medicineName: med.name,
                medicineImage: med.img,
                category: med.cat,
                quantity: qty,
                unitPrice: med.price,
                totalPrice: med.price * qty,
                orderId: `ORD-${2000 + Math.floor(Math.random() * 500)}`,
                soldAt: saleTime,
                status: isRefund ? 'Refunded' : 'Completed',
                paymentMethod: methods[Math.floor(Math.random() * methods.length)]
            });
        }

        // Sort by recent first
        this.mockSales.sort((a, b) => b.soldAt.getTime() - a.soldAt.getTime());
    }
}
