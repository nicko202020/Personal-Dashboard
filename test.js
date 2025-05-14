async function testCarousellRequest(query) {
    try {
      const url = `https://www.carousell.sg/search/${encodeURIComponent(query)}`;
      console.log(`Fetching listings for: ${query}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to fetch Carousell listings: ${response.statusText}`);
      }
  
      const htmlText = await response.text();
      console.log('Carousell HTML Response:', htmlText);
  
      // Parse and extract data (example, requires refinement for production)
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');
      const listings = Array.from(doc.querySelectorAll('.D_h .D_i')).map(item => ({
        title: item.querySelector('.D_j')?.textContent || 'No Title',
        price: item.querySelector('.D_k')?.textContent || 'No Price',
        link: item.querySelector('a')?.href || '#',
      }));
  
      console.log('Extracted Listings:', listings);
    } catch (error) {
      console.error('Error during Carousell request:', error);
    }
  }
  
  // Run test
  testCarousellRequest('3060 12GB');
  