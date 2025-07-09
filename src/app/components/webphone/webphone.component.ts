import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { RingcentralService } from '../../services/ringcentral.service';
import { QueryParamsService } from '../../services/query-params.service';
import { CallInfo, CallStatus } from '../../models/call.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-webphone',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './webphone.component.html',
  styleUrls: ['./webphone.component.scss']
})
export class WebphoneComponent implements OnInit, OnDestroy {
  customerName: string | null = null;
  phoneNumber: string | null = null;
  currentCall: CallInfo | null = null;
  callStatus = CallStatus;
  
  private subscriptions: Subscription[] = [];

  constructor(
    private ringcentralService: RingcentralService,
    private queryParamsService: QueryParamsService
  ) {}

  ngOnInit(): void {
    // Initialize RingCentral SDK
    this.initializeRingCentral();
    
    // Subscribe to query parameters
    this.subscriptions.push(
      this.queryParamsService.customerName$.subscribe(name => {
        this.customerName = name;
      }),
      
      this.queryParamsService.phoneNumber$.subscribe(phone => {
        this.phoneNumber = phone;
      }),
      
      this.ringcentralService.currentCall$.subscribe(call => {
        this.currentCall = call;
      })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async initializeRingCentral(): Promise<void> {
    try {
      const authenticated = await this.ringcentralService.authenticate();
      if (!authenticated) {
        console.error('Failed to authenticate with RingCentral');
      }
    } catch (error) {
      console.error('Error initializing RingCentral:', error);
    }
  }

  makeCall(): void {
    if (this.phoneNumber) {
      this.ringcentralService.makeCall(this.phoneNumber, this.customerName || undefined);
    }
  }

  answerCall(): void {
    this.ringcentralService.answerCall();
  }

  hangupCall(): void {
    this.ringcentralService.hangupCall();
  }

  toggleHold(): void {
    this.ringcentralService.toggleHold();
  }

  toggleMute(): void {
    this.ringcentralService.toggleMute();
  }

  // Helper methods for UI
  isCallActive(): boolean {
    return this.currentCall !== null && 
           this.currentCall.status !== CallStatus.IDLE && 
           this.currentCall.status !== CallStatus.ENDED &&
           this.currentCall.status !== CallStatus.FAILED;
  }

  isCallConnecting(): boolean {
    return this.currentCall !== null && this.currentCall.status === CallStatus.CONNECTING;
  }

  isCallInProgress(): boolean {
    return this.currentCall !== null && this.currentCall.status === CallStatus.IN_PROGRESS;
  }

  isCallOnHold(): boolean {
    return this.currentCall !== null && this.currentCall.status === CallStatus.HOLD;
  }

  getCallDuration(): string {
    if (!this.currentCall || !this.currentCall.startTime) {
      return '00:00';
    }

    const now = new Date();
    const startTime = this.currentCall.startTime;
    const durationInSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = durationInSeconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}