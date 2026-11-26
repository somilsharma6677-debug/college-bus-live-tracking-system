# College Bus Live Tracking System

A college bus tracking web application built with **Node.js, Express, Socket.IO, and Leaflet**. Drivers share their live GPS location, and students can select a live bus to view it on a map.

## Features

- Separate student and driver entry points.
- Driver login with a server-issued session token.
- Each driver is assigned a bus by the server.
- Live GPS updates sent through Socket.IO.
- Students can see active buses, search, and select a bus.
- Selected bus appears on a separate Leaflet map.
- Smooth marker movement between location updates.
- Bus is marked offline when the driver stops sharing or disconnects.
- Server validates GPS latitude and longitude before broadcasting.

## Requirements

- Node.js 18 or newer
- npm
- A modern browser

## Run locally

1. Open this project folder in VS Code.
2. Open the terminal in the folder containing `server.js`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Open **http://localhost:3000** in your browser.

For GPS access on a phone or another device, deploy over **HTTPS**. Browsers generally restrict geolocation to secure contexts; `localhost` is also allowed for local testing.

## Demo driver accounts

| Username | Password | Assigned bus |
|---|---|---|
| `driver1` | `pass123` | BUS-01 |
| `driver2` | `pass123` | BUS-02 |
| `driver3` | `pass123` | BUS-03 |

**Important:** These are development/demo credentials. Do not deploy this project publicly with the demo passwords. Configure private credentials before deployment.

## Project structure

```text
bussystem/
├── public/
│   ├── index.html
│   ├── login.html
│   ├── driver.html
│   ├── student.html
│   └── map.html
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Notes and limitations

- The college marker coordinates are currently configured in `public/map.html`; update them to the correct campus coordinates before a real deployment.
- Distance is calculated as straight-line distance (Haversine), not road distance.
- ETA is an approximate estimate based on a fixed average speed. It is not a live traffic or route-based prediction.
- Active bus locations and login sessions are stored in server memory. They reset when the server restarts.
- The demo login accounts are currently defined in `server.js`; use secure, private credentials and HTTPS before public use.

## Tech stack

- **Backend:** Node.js, Express
- **Real-time communication:** Socket.IO
- **Maps:** Leaflet, OpenStreetMap
- **Frontend:** HTML, CSS, JavaScript
