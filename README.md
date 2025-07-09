# RingCentral WebPhone Widget

A WebRTC-based WebPhone widget built with Angular 16 that integrates with RingCentral APIs. This widget can be embedded in Zoho and launched via a URL that includes query parameters for customer information.

## Features

- Outgoing and incoming call handling using RingCentral WebRTC
- Auto-fills dialer with phone number from URL parameters
- Displays customer name from URL parameters
- Call controls: mute, hold, hang up
- Floating widget UI style
- JWT or client credentials authentication with RingCentral

## Prerequisites

- Node.js 14+
- Angular CLI 16+
- RingCentral developer account with WebRTC permissions
- RingCentral app credentials (client ID, client secret)

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables in `src/environments/environment.ts`:
   ```typescript
   export const environment = {
     production: false,
     ringcentral: {
       clientId: 'YOUR_CLIENT_ID',
       clientSecret: 'YOUR_CLIENT_SECRET',
       serverUrl: 'https://platform.ringcentral.com',
       redirectUri: 'http://localhost:4200'
     }
   };
   ```

## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Embedding in Zoho

To embed this widget in Zoho:

1. Build and deploy the Angular application to your web server
2. In Zoho, use an iframe or a custom button to open the widget URL with query parameters:

```html
<iframe 
  src="https://mydomain.com/webphone?customer=John+Doe&phone=+14155550100" 
  width="350" 
  height="500" 
  frameborder="0">
</iframe>
```

Or create a button that opens the widget in a new window:

```javascript
function openWebPhone(customerName, phoneNumber) {
  const encodedName = encodeURIComponent(customerName);
  const encodedPhone = encodeURIComponent(phoneNumber);
  window.open(`https://mydomain.com/webphone?customer=${encodedName}&phone=${encodedPhone}`, 
    'RingCentral WebPhone', 
    'width=350,height=500,resizable=yes');
}
```

## Authentication

This widget supports two authentication methods:

1. **Client Credentials Flow** (server-to-server): Used when the widget is part of a backend system.
2. **JWT Flow**: Used when you need to authenticate as a specific user.

Configure the appropriate method in the RingCentral service based on your requirements.

## Call Logging (Optional)

To implement call logging to your backend:

1. Configure the callback URL in the environment file:
   ```typescript
   export const environment = {
     // ... other config
     callbackApi: {
       url: 'https://your-api.example.com/call-logs',
       authToken: 'YOUR_AUTH_TOKEN' // if needed
     }
   };
   ```

2. The widget will automatically post call events to this endpoint.

## License

MIT
