import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { StatsService } from '../stats.service';

type DashboardBucket = {
  label: string;
  count: number;
};

type DashboardStats = {
  totalCars: number;
  totalUsers: number;
  carsByMake: DashboardBucket[];
  carsByColor: DashboardBucket[];
  carsByYear: DashboardBucket[];
  latestCars: any[];
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private statsService = inject(StatsService);

  stats: DashboardStats | null = null;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loading = true;
    this.error = null;

    this.statsService.getStats().subscribe({
      next: (response) => {
        this.stats = this.normalizeStats(response);
        this.loading = false;
      },
      error: (err: unknown) => {
        if (err instanceof HttpErrorResponse) {
          const backendMessage =
            (typeof err.error === 'string' && err.error) ||
            (typeof err.error?.message === 'string' && err.error.message) ||
            '';

          this.error = backendMessage || 'Failed to load dashboard stats.';
        } else {
          this.error = 'Failed to load dashboard stats.';
        }

        this.loading = false;
      },
    });
  }

  private normalizeStats(response: unknown): DashboardStats {
    const source = this.asRecord(response);
    return {
      totalCars: this.parseCount(source['totalCars']),
      totalUsers: this.parseCount(source['totalUsers']),
      carsByMake: this.normalizeBuckets(source['carsByMake']),
      carsByColor: this.normalizeBuckets(source['carsByColor']),
      carsByYear: this.normalizeBuckets(source['carsByYear']),
      latestCars: Array.isArray(source['latestCars']) ? source['latestCars'] : [],
    };
  }

  private normalizeBuckets(value: unknown): DashboardBucket[] {
    if (Array.isArray(value)) {
      return value
        .map((item) => this.toBucket(item))
        .filter((item): item is DashboardBucket => item !== null);
    }

    const record = this.asRecord(value);
    return Object.entries(record).map(([key, rawCount]) => ({
      label: key,
      count: this.parseCount(rawCount),
    }));
  }

  private toBucket(value: unknown): DashboardBucket | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const item = value as Record<string, unknown>;
    const label = item['_id'];
    if (label === null || label === undefined) {
      return null;
    }

    return {
      label: String(label),
      count: this.parseCount(item['count']),
    };
  }

  private parseCount(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  }
}
