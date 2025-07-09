import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QueryParamsService {
  private customerNameSubject = new BehaviorSubject<string | null>(null);
  customerName$ = this.customerNameSubject.asObservable();

  private phoneNumberSubject = new BehaviorSubject<string | null>(null);
  phoneNumber$ = this.phoneNumberSubject.asObservable();

  constructor(private route: ActivatedRoute) {
    this.initializeFromRoute();
  }

  private initializeFromRoute(): void {
    this.route.queryParams.subscribe(params => {
      if (params['customer']) {
        const customerName = decodeURIComponent(params['customer']);
        this.customerNameSubject.next(customerName);
      }

      if (params['phone']) {
        const phoneNumber = decodeURIComponent(params['phone']);
        this.phoneNumberSubject.next(phoneNumber);
      }
    });
  }

  getCustomerName(): string | null {
    return this.customerNameSubject.value;
  }

  getPhoneNumber(): string | null {
    return this.phoneNumberSubject.value;
  }
}