import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService, FeedbackItem } from './reports.service';

@Component({
  selector: 'app-repport',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './repport.component.html',
  styleUrls: ['./repport.component.css']
})
export class RepportComponent implements OnInit {

  allFeedback: FeedbackItem[] = [];
  displayedFeedback: FeedbackItem[] = [];

  // Filters
  searchTerm: string = '';
  filterSentiment: string = 'All'; // All, Positive, Neutral, Negative

  // KPIs
  kpiTotal = 0;
  kpiPositive = 0;
  kpiNeutral = 0;
  kpiNegative = 0;

  // Selection
  selectedItem: FeedbackItem | null = null;

  constructor(private reportsService: ReportsService) { }

  ngOnInit(): void {
    this.reportsService.getFeedback().subscribe(data => {
      this.allFeedback = data;
      this.calculateKPIs();
      this.applyFilters();
    });
  }

  calculateKPIs() {
    this.kpiTotal = this.allFeedback.length;
    this.kpiPositive = this.allFeedback.filter(f => f.sentiment === 'Positive').length;
    this.kpiNeutral = this.allFeedback.filter(f => f.sentiment === 'Neutral').length;
    this.kpiNegative = this.allFeedback.filter(f => f.sentiment === 'Negative').length;
  }

  applyFilters() {
    let res = this.allFeedback;

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      res = res.filter(f =>
        f.clientName.toLowerCase().includes(q) ||
        f.deliveryId.toLowerCase().includes(q) ||
        f.deliveryAgent.toLowerCase().includes(q)
      );
    }

    if (this.filterSentiment !== 'All') {
      res = res.filter(f => f.sentiment === this.filterSentiment);
    }

    this.displayedFeedback = res;
  }

  selectItem(item: FeedbackItem) {
    this.selectedItem = item;
  }

  closeDetails() {
    this.selectedItem = null;
  }

  getStarsArray(rating: number): number[] {
    return Array(rating).fill(0);
  }

  getStarClass(rating: number): string {
    if (rating >= 4) return 'star-high';
    if (rating === 3) return 'star-mid';
    return 'star-low';
  }

  getSentimentClass(sentiment: string): string {
    switch (sentiment) {
      case 'Positive': return 'badge-pos';
      case 'Negative': return 'badge-neg';
      default: return 'badge-neu';
    }
  }
}
