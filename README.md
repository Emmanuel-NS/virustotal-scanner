# VirusTotal URL Scanner

A web application that allows users to scan URLs for potential security risks using the [VirusTotal API](https://www.virustotal.com/). The application features a user-friendly interface for entering a URL, and it displays scan results including the status from various security engines. It uses Node.js, Express, and Axios on the backend and Nginx/HAProxy for reverse proxy and load balancing.

## Table of Contents

- [Demo-video](#web-demonstration)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Local Development](#local-development)
  - [Production Deployment](#production-deployment)
- [Directory Structure](#directory-structure)
- [Configuration](#configuration)
- [Usage](#usage)
- [Credits](#credits)
- [License](#license)

## Demo-Video

[Watch the demo on YouTube](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

## Features

- **URL Scanning:** Submit a URL and get a detailed scan report.
- **Results Filtering & Sorting:** Filter results by status (e.g., clean, suspicious, malicious) and sort by engine name or status.
- **Search:** Quickly find results from specific engines.
- **Reverse Proxy & Load Balancing:** Supports deployment across multiple servers using Nginx and HAProxy.
- **HTTPS Support:** Secure communication via HTTPS, with automated certificate management (Certbot).

## Technologies Used

- **Backend:** Node.js, Express, Axios, dotenv, cors
- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Reverse Proxy / Load Balancing:** Nginx and HAProxy
- **Certificate Management:** Let's Encrypt (Certbot)
- **Process Management:** PM2

## Prerequisites

- Node.js (v12 or later)
- npm
- Git
- Nginx
- HAProxy (for load balancing, if applicable)
- Certbot (for HTTPS certificate issuance)
- A valid VirusTotal API key

## Installation & Setup

### Local Development

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/your-username/virustotal-scanner.git
   cd virustotal-scanner
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the project root with the following content:
   ```env
   VIRUSTOTAL_API_KEY=your_virustotal_api_key_here
   PORT=3000
   ```

4. **Start the Application:**
   ```bash
   npm start
   ```
   The backend server will run on port 3000.

5. **Access the Application:**
   Open `public/index.html` in your browser (preferably served via a local server, e.g., using [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)).

### Production Deployment

For production, consider the following steps:

1. **Deploy the Code:**
   - Upload the project files to your server(s) (e.g., web-01, web-02, and lb-01).
   
2. **Setup Nginx (on web-01 and web-02):**
   - Configure Nginx to serve the static front-end from the `public/` folder.
   - Use a reverse proxy rule to forward API requests (e.g., `/api/scan`) to the Node.js backend running on port 3000.

3. **Setup HAProxy (on lb-01):**
   - Configure HAProxy to load balance requests among your web servers.
   - Forward API requests (using ACLs based on URL path) to the backend servers.

4. **Obtain HTTPS Certificates:**
   - Use Certbot on each server (or on your load balancer) to obtain and configure HTTPS certificates for your domains/subdomains.

5. **Process Management:**
   - Use PM2 to run and monitor your Node.js application:
     ```bash
     pm2 start server.js --name virustotal-scanner
     pm2 save
     pm2 startup
     ```

## Directory Structure

```
virustotal-scanner/
├── .env                    # Environment variables (API key, PORT, etc.)
├── package.json            # Project metadata and dependencies
├── package-lock.json       # Lockfile for npm dependencies
├── server.js               # Express server handling API requests
└── public/
    └── index.html          # Frontend HTML, CSS, and JavaScript
```

- **server.js:**  
  Contains the Express server that exposes the `/api/scan` endpoint. It calls the VirusTotal API and processes the results.

- **public/index.html:**  
  The main interface for users. It includes forms for entering URLs, displays scan results, and provides filtering/sorting features.

## Configuration

- **Environment Variables:**  
  Use the `.env` file to store sensitive information like the VirusTotal API key.
  
- **Nginx/HAProxy:**  
  - Configure Nginx to serve both static files and proxy API requests.
  - Configure HAProxy on the load balancer (lb-01) to forward API calls to the appropriate backend servers.
  
- **SSL Certificates:**  
  Managed via Certbot with Let's Encrypt. Ensure that your certificates cover all required subdomains.

## Usage

1. **Enter a URL:**  
   In the front-end interface, enter the URL you want to scan.

2. **Scan:**  
   Click the "Scan URL" button. The application sends the URL to the backend, which calls the VirusTotal API.

3. **View Results:**  
   Scan results are displayed on the front end. You can filter and sort these results as needed.

## Credits

- **VirusTotal:**  
  This application uses the [VirusTotal API](https://www.virustotal.com/) to scan URLs. We gratefully acknowledge VirusTotal for providing the API that powers this project.
  
- **Technologies:**  
  Thanks to the developers and communities behind Node.js, Express, Axios, Nginx, HAProxy, Certbot, and PM2 for making this project possible.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
