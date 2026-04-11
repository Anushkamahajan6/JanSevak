# Mapbox Setup Instructions

## Problem
The heatmap shows an error: "An API access token is required to use Mapbox GL"

## Solution

### Step 1: Get a Mapbox Token
1. Go to https://mapbox.com
2. Sign up for a free account
3. Go to Account → Tokens
4. Copy your default public token (or create a new one)

### Step 2: Create .env File
Create a new file in the `frontend` folder named `.env` (same level as package.json):

```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

Replace `your_mapbox_token_here` with your actual token from Mapbox.

**Example:**
```
VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNrZXhxx...
```

### Step 3: Restart Development Server
1. Stop your development server (Ctrl+C)
2. Run: `npm run dev`
3. Refresh your browser

### Step 4: Test
- Go to Volunteer Page
- Click "Start Volunteering!"
- You should now see the live heatmap

## Files Modified
- `frontend/src/Components/heatmapview.jsx` - Added error handling and token validation
- `frontend/src/context/userContext.jsx` - Fixed profile fetch warning
- `frontend/src/pages/VolunteerPage.jsx` - Fixed heatmap import
- `frontend/src/pages/admin-dashboard/AdminPage.jsx` - Added heatmap to dashboard

## Troubleshooting

**Still seeing blank heatmap?**
- Check browser console (F12) for exact error message
- Make sure `.env` file is in `frontend` folder, not root
- Verify token starts with `pk.`
- Restart dev server after creating .env file

**Token format error?**
- Make sure there are NO quotes around the token in .env
- Don't copy the token URL, only the token itself
