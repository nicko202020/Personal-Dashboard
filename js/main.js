// Main.js: Handles Spotify Authentication, Playback Controls, and Updates

const clientId = '4b74fa45b4c94722bb904b5cf85d5f3e';
const clientSecret = '6a96d3f7bc7e49f6a48571c850017836';
const redirectUri = 'http://127.0.0.1:5500/index.html';
const finnhubApiKey = 'cu39n41r01qure9c7ncgcu39n41r01qure9c7nd0';
let accessToken = '';

// Authenticate with Spotify
async function authenticateSpotify() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');

  if (!code) {
    // Redirect to Spotify login
    const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private playlist-read-collaborative';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${encodeURIComponent(scopes)}&show_dialog=true`;
    window.location.href = authUrl;
  } else if (!accessToken) {
    // Exchange authorization code for access token
    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'Basic ' + btoa(`${clientId}:${clientSecret}`),
        },
        body: `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`,
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(`Token exchange failed: ${errorDetails.error_description || response.statusText}`);
      }

      const data = await response.json();
      accessToken = data.access_token;
      console.log('Access Token:', accessToken);
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  }
}

// Fetch Now Playing Track
async function fetchNowPlaying() {
  if (!accessToken) {
    console.error('Access token is missing or invalid.');
    return;
  }

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`Response status: ${response.status}`); // Debugging

    if (response.status === 204) {
      console.log('No content: Nothing is currently playing.');
      document.getElementById('track-title').textContent = 'No song is currently playing';
      document.getElementById('artist-name').textContent = '';
      document.getElementById('album-art').src = ''; // Clear album art
      return;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch now playing: ${response.statusText}`);
    }

    const data = await response.json();

    if (data && data.item) {
      const albumArt = data.item.album.images[0]?.url || '';
      const trackTitle = data.item.name || 'Unknown Track';
      const artistName = data.item.artists.map((artist) => artist.name).join(', ') || 'Unknown Artist';

      document.getElementById('album-art').src = albumArt;
      document.getElementById('track-title').textContent = trackTitle;
      document.getElementById('artist-name').textContent = artistName;

      console.log(`Now playing: ${trackTitle} by ${artistName}`);
    }
  } catch (error) {
    console.error('Error fetching now playing:', error);
  }
}

// Fetch Financial Data using Finnhub
async function fetchFinancialData(symbol) {
  try {
    const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch financial data: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Financial Data:', data); // Debugging

    if (data.c) { // Current price
      const price = data.c;
      const change = data.d; // Change
      const changePercent = data.dp; // Change percentage

      const financialInfoContainer = document.getElementById('financial-info');
      financialInfoContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
          <div style="font-size: 36px; font-weight: bold; margin-bottom: 20px;">
            ${symbol}
          </div>
          <div style="font-size: 24px; margin-bottom: 10px;">
            $${price.toFixed(2)}
          </div>
          <div style="font-size: 20px; color: ${change >= 0 ? '#00ff00' : '#ff0000'};">
            ${change.toFixed(2)} / ${changePercent.toFixed(2)}%
          </div>
        </div>
      `;
    } else {
      console.error('No financial data found for the provided symbol.');
    }
  } catch (error) {
    console.error('Error fetching financial data:', error);
  }
}


// Fetch Carousell Listings
async function fetchCarousellListings(query) {
  const url = 'https://carousell.p.rapidapi.com/searchByKeyword?country=sg&keyword=' + encodeURIComponent(query) + '&sort=mostRecent';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '51987e1752mshf8a79a949148243p130b84jsnf6013f452baf',
      'x-rapidapi-host': 'carousell.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Failed to fetch Carousell listings: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Carousell Listings:', result);

    const centerBox = document.querySelector('.center-box .content-container');
    centerBox.innerHTML = '<h3>Latest Listings</h3>';

    result.slice(0, 5).forEach(listing => {
      centerBox.innerHTML += `
        <div style="margin-bottom: 10px;">
          <a href="${listing.url}" target="_blank" style="color: #00ff00; text-decoration: underline;">
            <strong>${listing.title}</strong>
          </a>
          <p>Price: ${listing.price || 'N/A'}</p>
        </div>
      `;
    });
  } catch (error) {
    console.error('Error fetching Carousell listings:', error);
  }
}

// Spotify Playback Controls
async function playPauseTrack() {
  const playPauseButton = document.getElementById('play-pause');
  console.log('Play/Pause button clicked.'); // Debugging

  try {
    const stateResponse = await fetch('https://api.spotify.com/v1/me/player', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!stateResponse.ok) {
      throw new Error(`Failed to fetch player state: ${stateResponse.statusText}`);
    }

    const stateData = await stateResponse.json();

    if (!stateData.is_playing) {
      console.log('Currently paused. Attempting to play.');
      const playResponse = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!playResponse.ok) {
        throw new Error(`Failed to play track: ${playResponse.statusText}`);
      }

      playPauseButton.setAttribute('data-playing', 'true');
      console.log('Playback started.');
    } else {
      console.log('Currently playing. Attempting to pause.');
      const pauseResponse = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!pauseResponse.ok) {
        throw new Error(`Failed to pause track: ${pauseResponse.statusText}`);
      }

      playPauseButton.setAttribute('data-playing', 'false');
      console.log('Playback paused.');
    }
  } catch (error) {
    console.error('Error in play/pause logic:', error);
  }
}

// Spotify Volume Control
document.getElementById('volume-control').addEventListener('input', async (event) => {
  const volume = event.target.value; // Volume as a percentage
  console.log(`Volume slider changed: ${volume}%`); // Debugging

  try {
    const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to set volume: ${response.statusText}`);
    }

    console.log(`Volume set to ${volume}%`);
  } catch (error) {
    console.error('Error setting volume:', error);
  }
});

// Event Listener for Next Track
document.getElementById('next-track').addEventListener('click', async () => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/next', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to skip to next track: ${response.statusText}`);
    }

    await fetchNowPlaying();
  } catch (error) {
    console.error('Error in next track:', error);
  }
});

// Event Listener for Previous Track
document.getElementById('prev-track').addEventListener('click', async () => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to skip to previous track: ${response.statusText}`);
    }

    await fetchNowPlaying();
  } catch (error) {
    console.error('Error in previous track:', error);
  }
});

// Polling for Updates
setInterval(() => {
  fetchNowPlaying().catch(error => console.error('Error in polling now playing:', error));
}, 2000); // Poll every 2 seconds

// Initialize Financial Data and Spotify Integration
document.addEventListener('DOMContentLoaded', () => {
  authenticateSpotify().then(() => {
    if (accessToken) {
      fetchNowPlaying(); // Initial fetch for Spotify
      fetchFinancialData('BB'); // Fetch stock symbol
      fetchCarousellListings('3060 12GB'); // Fetch Carousell listings
    } else {
      console.error('Failed to retrieve access token.');
    }
  });

  // Attach Spotify control event listeners
  const playPauseButton = document.getElementById('play-pause');
  const nextTrackButton = document.getElementById('next-track');
  const prevTrackButton = document.getElementById('prev-track');
  const volumeControl = document.getElementById('volume-control');

  if (playPauseButton) {
    playPauseButton.addEventListener('click', playPauseTrack);
    console.log('Play/Pause event listener attached');
  } else {
    console.error('Play/Pause button not found');
  }

  if (nextTrackButton) {
    nextTrackButton.addEventListener('click', async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/next', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to skip to next track: ${response.statusText}`);
        }
        await fetchNowPlaying();
      } catch (error) {
        console.error('Error in next track:', error);
      }
    });
    console.log('Next Track event listener attached');
  } else {
    console.error('Next Track button not found');
  }

  if (prevTrackButton) {
    prevTrackButton.addEventListener('click', async () => {
      try {
        const response = await fetch('https://api.spotify.com/v1/me/player/previous', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to skip to previous track: ${response.statusText}`);
        }
        await fetchNowPlaying();
      } catch (error) {
        console.error('Error in previous track:', error);
      }
    });
    console.log('Previous Track event listener attached');
  } else {
    console.error('Previous Track button not found');
  }

  if (volumeControl) {
    volumeControl.addEventListener('input', async (event) => {
      const volume = event.target.value; // Volume as a percentage
      console.log(`Volume slider changed: ${volume}%`); // Debugging
      try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${volume}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to set volume: ${response.statusText}`);
        }
        console.log(`Volume set to ${volume}%`);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    });
    console.log('Volume control event listener attached');
  } else {
    console.error('Volume control not found');
  }

  // (Keep the polling and other logic as is)
});

