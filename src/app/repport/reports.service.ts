import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface FeedbackItem {
    id: string;
    clientName: string;
    clientPhone: string;
    clientLocation: string;
    deliveryId: string;
    deliveryDate: Date;
    deliveryAgent: string;
    rating: number; // 1-5
    comment: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    tags: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ReportsService {

    private mockFeedback: FeedbackItem[] = [];

    constructor() {
        this.seedMockData();
    }

    getFeedback(): Observable<FeedbackItem[]> {
        return of(this.mockFeedback);
    }

    private seedMockData() {
        this.mockFeedback = [
            {
                id: 'FB-101',
                clientName: 'Mme. Samia Kallel',
                clientPhone: '+216 98 765 432',
                clientLocation: 'Ennasr 2, Tunis',
                deliveryId: 'DEL-892',
                deliveryDate: new Date('2024-03-10T14:30:00'),
                deliveryAgent: 'Karim Tounsi',
                rating: 5,
                comment: 'Very fast delivery and polite agent. Thank you so much!',
                sentiment: 'Positive',
                tags: ['Punctual', 'Polite']
            },
            {
                id: 'FB-102',
                clientName: 'Mr. Ali Ben Hassine',
                clientPhone: '+216 22 123 789',
                clientLocation: 'La Marsa, Tunis',
                deliveryId: 'DEL-895',
                deliveryDate: new Date('2024-03-11T10:15:00'),
                deliveryAgent: 'Sami Driver',
                rating: 3,
                comment: 'Medicine was correct but packaging was slightly damaged.',
                sentiment: 'Neutral',
                tags: ['Packaging Issue']
            },
            {
                id: 'FB-103',
                clientName: 'Mme. Fatma Zahra',
                clientPhone: '+216 55 000 111',
                clientLocation: 'Lac 1, Tunis',
                deliveryId: 'DEL-901',
                deliveryDate: new Date('2024-03-12T09:00:00'),
                deliveryAgent: 'Karim Tounsi',
                rating: 1,
                comment: 'Late delivery! I waited for 3 hours. Unacceptable.',
                sentiment: 'Negative',
                tags: ['Late', 'Poor Service']
            },
            {
                id: 'FB-104',
                clientName: 'Dr. Yassine B.',
                clientPhone: '+216 21 333 444',
                clientLocation: 'Manar 1, Tunis',
                deliveryId: 'DEL-910',
                deliveryDate: new Date('2024-03-12T16:45:00'),
                deliveryAgent: 'Sami Driver',
                rating: 5,
                comment: 'Perfect service as always.',
                sentiment: 'Positive',
                tags: ['Excellent']
            },
            {
                id: 'FB-105',
                clientName: 'Mr. Chedly M.',
                clientPhone: '+216 99 888 777',
                clientLocation: 'Carthage, Tunis',
                deliveryId: 'DEL-915',
                deliveryDate: new Date('2024-03-13T11:20:00'),
                deliveryAgent: 'Karim Tounsi',
                rating: 4,
                comment: 'Good service, but the tracking link didn\'t work.',
                sentiment: 'Positive',
                tags: ['App Issue']
            },
            {
                id: 'FB-106',
                clientName: 'Mme. Houda T.',
                clientPhone: '+216 50 123 123',
                clientLocation: 'Menzah 6, Tunis',
                deliveryId: 'DEL-920',
                deliveryDate: new Date('2024-03-13T15:00:00'),
                deliveryAgent: 'Sami Driver',
                rating: 2,
                comment: 'Driver was rude on the phone.',
                sentiment: 'Negative',
                tags: ['Attitude']
            }
        ];
    }
}
