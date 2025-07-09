import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CallInfo, CallStatus } from '../models/call.model';
import { HttpClient } from '@angular/common/http';

// Import RingCentral SDK
import { SDK } from '@ringcentral/sdk';
// @ts-ignore
import RingCentralWebPhone from 'ringcentral-web-phone';

@Injectable({
  providedIn: 'root'
})
export class RingcentralService {
  private sdk: SDK = new SDK({
    server: environment.ringcentral.serverUrl,
    clientId: environment.ringcentral.clientId,
    clientSecret: environment.ringcentral.clientSecret
  });
  private webPhone: any;
  private session: any;
  private platform: any;

  private currentCallSubject = new BehaviorSubject<CallInfo | null>(null);
  currentCall$ = this.currentCallSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeSDK();
  }

  private initializeSDK(): void {
    this.sdk = new SDK({
      server: environment.ringcentral.serverUrl,
      clientId: environment.ringcentral.clientId,
      clientSecret: environment.ringcentral.clientSecret,
      redirectUri: environment.ringcentral.redirectUri
    });

    this.platform = this.sdk.platform();
  }

  async authenticate(): Promise<boolean> {
    try {
      // For server-side authentication (client credentials flow)
      await this.platform.login({
        username: '', // This would be set in a real implementation
        password: '', // This would be set in a real implementation
        extension: '' // This would be set in a real implementation
      });

      // Initialize WebPhone after authentication
      await this.initializeWebPhone();
      return true;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  }

  private async initializeWebPhone(): Promise<void> {
    try {
      // Get SIP provision
      const sipProvision = await this.platform.post('/restapi/v1.0/client-info/sip-provision', {
        sipInfo: [{ transport: 'WSS' }]
      });

      // Initialize WebPhone with type assertion to bypass type checking
      this.webPhone = new RingCentralWebPhone({
        sipInfo: sipProvision.json(),
        debug: true,
        autoAnswer: false
      });

      // Register event listeners
      this.registerWebPhoneEvents();
    } catch (error) {
      console.error('Failed to initialize WebPhone:', error);
      throw error;
    }
  }

  private registerWebPhoneEvents(): void {
    if (!this.webPhone) return;

    // Incoming call event
    this.webPhone.on('invite', (session: any) => {
      this.session = session;
      
      const phoneNumber = session.request.from.uri.user;
      const callInfo: CallInfo = {
        phoneNumber,
        status: CallStatus.CONNECTING,
        direction: 'inbound'
      };
      
      this.currentCallSubject.next(callInfo);
      
      // Register session events
      this.registerSessionEvents(session);
    });
  }

  private registerSessionEvents(session: any): void {
    // Call accepted
    session.on('accepted', () => {
      const currentCall = this.currentCallSubject.value;
      if (currentCall) {
        this.currentCallSubject.next({
          ...currentCall,
          status: CallStatus.IN_PROGRESS,
          startTime: new Date()
        });
      }
    });

    // Call ended
    session.on('terminated', () => {
      const currentCall = this.currentCallSubject.value;
      if (currentCall) {
        const endTime = new Date();
        const duration = currentCall.startTime 
          ? Math.round((endTime.getTime() - currentCall.startTime.getTime()) / 1000) 
          : 0;
          
        this.currentCallSubject.next({
          ...currentCall,
          status: CallStatus.ENDED,
          endTime,
          duration
        });
        
        // Log call if needed
        this.logCall(currentCall);
      }
    });

    // Call failed
    session.on('failed', () => {
      const currentCall = this.currentCallSubject.value;
      if (currentCall) {
        this.currentCallSubject.next({
          ...currentCall,
          status: CallStatus.FAILED
        });
      }
    });
  }

  makeCall(phoneNumber: string, customerName?: string): void {
    if (!this.webPhone) {
      console.error('WebPhone not initialized');
      return;
    }

    // Create a new call session
    this.session = this.webPhone.userAgent.invite(phoneNumber, {
      media: {
        render: {
          remote: document.getElementById('remoteAudio') as HTMLMediaElement,
          local: document.getElementById('localAudio') as HTMLMediaElement
        }
      }
    });

    // Create call info
    const callInfo: CallInfo = {
      phoneNumber,
      customerName,
      status: CallStatus.CONNECTING,
      direction: 'outbound'
    };
    
    this.currentCallSubject.next(callInfo);
    
    // Register session events
    this.registerSessionEvents(this.session);
  }

  answerCall(): void {
    if (this.session) {
      this.session.accept();
    }
  }

  hangupCall(): void {
    if (this.session) {
      this.session.terminate();
    }
  }

  toggleHold(): void {
    if (!this.session) return;

    const currentCall = this.currentCallSubject.value;
    if (!currentCall) return;

    if (currentCall.status === CallStatus.HOLD) {
      this.session.unhold();
      this.currentCallSubject.next({
        ...currentCall,
        status: CallStatus.IN_PROGRESS
      });
    } else if (currentCall.status === CallStatus.IN_PROGRESS) {
      this.session.hold();
      this.currentCallSubject.next({
        ...currentCall,
        status: CallStatus.HOLD
      });
    }
  }

  toggleMute(): void {
    if (!this.session) return;
    
    if (this.session.isMuted) {
      this.session.unmute();
    } else {
      this.session.mute();
    }
  }

  // Optional: Log call to backend
  private logCall(callInfo: CallInfo): void {
    this.http.post(`${environment.apiEndpoint}/call-logs`, callInfo)
      .subscribe({
        next: () => console.log('Call logged successfully'),
        error: (error) => console.error('Failed to log call:', error)
      });
  }
}