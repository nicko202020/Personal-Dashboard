# Interactive Screensaver Dashboard

This project is a web dashboard that integrates Spotify playback, financial data, and Carousell listings in a multi-window layout. 

## Features
- Spotify playback controls 
- Financial ticker data  
- Carousell listings 
- Animated audio visualizer

## Setup Instructions

### 1. Clone the Repository
```bash
https://github.com/yourusername/your-repo.git
cd your-repo
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory with the following content:
```env
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:5500/index.html
FINNHUB_API_KEY=your_finnhub_api_key
RAPIDAPI_KEY=your_rapidapi_key
```
**Note:** Never commit your `.env` file. It is already included in `.gitignore`.

### 3. Install Dependencies
If you use a build tool (like Vite, Webpack, or Create React App), install dependencies:
```bash
npm install
```

### 4. Run the Project
If using Live Server or a similar tool:
- Open `index.html` with Live Server or your preferred static server.

If using a build tool:
```bash
npm run dev
```

## Security Notice
- **Do not expose secrets (client secrets, API keys) in frontend code.**
- For production, use a backend to handle authentication and API requests securely.
- This project is for demonstration and local use only.

## Customization
- Change the Carousell search term in `main.js` (`fetchCarousellListings('3060 12GB')`).
- Adjust the layout and styles in `css/style.css`.

## License
MIT 