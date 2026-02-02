# WISE_4 Project Management

🚀 A mobile-friendly web application for managing projects with Google Sheets as database.

## Features

- ✅ **Resource Management**: Add, edit, and delete team members with their roles
- ✅ **Task Management**: Comprehensive task tracking with status, dates, milestones, and deliverables
- ✅ **Gantt Chart**: Visual project timeline with monthly breakdown
- ✅ **Mobile Responsive**: Works seamlessly on mobile devices
- ✅ **Google Sheets Integration**: Uses Google Sheets as backend database

## Demo

[View Demo](https://yourusername.github.io/WISE_4/)

## Setup Instructions

### 1. Google Sheets Setup

1. Open your Google Sheet: [WISE_4 Sheet](https://docs.google.com/spreadsheets/d/1nRPxFznNxtHneYaD31-mXr1H3DTfgifI6iciYwq64P4/edit)
2. Make sure it has two sheets:
   - `Project_resources` with columns: Name, Role
   - `Project_tasks` with columns: Tasks, Owner, Status, Start date, End date, Milestone, Deliverable, Notes

### 2. Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Sheets API**
4. Create credentials → API Key
5. Restrict the API key to Google Sheets API only (recommended)

### 3. Configure the App

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/WISE_4.git
   cd WISE_4
   ```

2. Edit `app.js` and replace `YOUR_API_KEY_HERE` with your actual Google API key:
   ```javascript
   const CONFIG = {
       SHEET_ID: '1nRPxFznNxtHneYaD31-mXr1H3DTfgifI6iciYwq64P4',
       API_KEY: 'YOUR_ACTUAL_API_KEY', // Replace this
       ...
   };
   ```

### 4. Deploy to GitHub Pages

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/WISE_4.git
   git push -u origin main
   ```

2. Enable GitHub Pages:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: / (root)
   - Save

3. Your app will be available at: `https://yourusername.github.io/WISE_4/`

## Usage

### Resources Tab
- Click **"+ Add Resource"** to add team members
- Edit or delete resources using action buttons
- Resources appear in the Owner dropdown when creating tasks

### Tasks Tab
- Click **"+ Add Task"** to create new tasks
- Select owner from the dropdown (populated from resources)
- Set status: Not started, In progress, or Completed
- Add start and end dates for Gantt chart visualization
- Upload deliverable files (stores filename)
- Add notes for additional information

### Gantt Chart Tab
- Visual timeline of all tasks
- Shows monthly breakdown with 4-week periods
- Color-coded by status:
  - 🔵 Blue: Not started
  - 🟡 Yellow: In progress
  - 🟢 Green: Completed

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Google Sheets API v4
- **Hosting**: GitHub Pages
- **Design**: Mobile-first responsive design

## File Structure

```
WISE_4/
├── index.html          # Main HTML file
├── styles.css          # Styling and responsive design
├── app.js              # Application logic
├── README.md           # Documentation
└── .gitignore          # Git ignore file
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security Note

⚠️ **Important**: 
- The Google API key is exposed in the client-side code
- Restrict your API key to:
  - Only Google Sheets API
  - Specific HTTP referrers (your domain)
  - This is a read-only implementation for demo purposes

For production use, consider:
- Using Google Apps Script as backend
- Implementing OAuth 2.0 authentication
- Server-side API proxy

## Limitations

- File uploads store only filename (not actual file)
- For real file storage, integrate with Google Drive API
- Current implementation is read-optimized
- For write operations, you'll need to implement Google Sheets API write methods

## Contributing

Feel free to submit issues and pull requests!

## License

MIT License

## Author

MEA WISE Innovation Incubation Program

---

For questions or support, please contact the development team.
