# WISE_4 Project Management

🚀 A mobile-friendly web application for managing projects with Google Sheets as database.

## ✨ Features

### Core Features
- ✅ **Resource Management**: Add, edit, and delete team members with their roles
- ✅ **Task Management**: Comprehensive task tracking with status, dates, milestones, and deliverables
- ✅ **Mobile Responsive**: Works seamlessly on mobile devices
- ✅ **Google Sheets Integration**: Uses Google Sheets as backend database

### 📊 Advanced Gantt Chart
- ✅ **Visual Timeline**: Monthly breakdown with day-by-day view (including weekends)
- ✅ **Date Range Filter**: Select custom date ranges to focus on specific periods
- ✅ **Owner Filter**: Filter tasks by team member to see individual workloads
- ✅ **Today Line**: Red vertical line showing current date position
- ✅ **Smart Display**: Tasks spanning multiple months display continuously
- ✅ **Clear Month Separators**: Bold borders between months for easy navigation
- ✅ **Sorted by Start Date**: Tasks automatically sorted from earliest to latest
- ✅ **Status Colors**: Color-coded bars (green=completed, yellow=in progress, gray=not started)
- ✅ **Cross-Month Tasks**: Tasks that span multiple months display seamlessly across the timeline

## 🎯 New Features Highlights

### 1. Owner Filter
- Dropdown to filter tasks by team member
- "All Owners" option to see everyone's tasks
- Dynamically populated from your resource list
- Combines with date range filter for powerful insights

### 2. Today Line
- Prominent red vertical line marking today's date
- "Today" label at the top
- Only shows when today falls within the displayed timeline
- Helps visualize progress and upcoming deadlines

### 3. Enhanced Timeline
- Full calendar days (28-31 days per month)
- Includes weekends for accurate planning
- Tasks spanning multiple months display as continuous bars
- Precise positioning based on actual dates

## Demo

[View Live Demo](https://yourusername.github.io/WISE_4/)

## Quick Start

### Option 1: Demo Mode (No Setup Required)
1. Open `index-demo.html` in your browser
2. Uses local storage - no Google Sheets needed
3. Perfect for testing and learning

### Option 2: Google Sheets Integration
See [SETUP.md](SETUP.md) for detailed instructions

## 📖 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[SETUP.md](SETUP.md)** - Complete setup guide
- **[GANTT_FEATURES.md](GANTT_FEATURES.md)** - Gantt Chart feature details
- **[OWNER_FILTER_TODAY_LINE.md](OWNER_FILTER_TODAY_LINE.md)** - New features explained
- **[APPS_SCRIPT_SETUP.md](APPS_SCRIPT_SETUP.md)** - Enable write operations
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions

## Usage Examples

### View Team Workload
```
1. Go to Gantt Chart tab
2. Set Owner: "All Owners"
3. Set Date Range: This month
4. See everyone's tasks + Today line
```

### Focus on Individual
```
1. Select Owner: "John Doe"
2. Leave dates empty (auto range)
3. See John's complete timeline
4. Today line shows current progress
```

### Sprint Planning
```
1. Set Date Range: Today to +14 days
2. Owner: "All Owners"
3. See upcoming 2-week sprint
4. Today line at the start
```

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Google Sheets API v4
- **Storage**: Google Sheets (or localStorage for demo)
- **Hosting**: GitHub Pages compatible
- **Design**: Mobile-first responsive design

## File Structure

```
WISE_4_Project/
├── index.html              # Main application (Google Sheets)
├── index-demo.html         # Demo version (localStorage)
├── styles.css              # Responsive styling + Gantt Chart
├── app.js                  # Main application logic
├── app-demo.js             # Demo mode logic
├── google-apps-script.js   # Backend for write operations
├── test-connection.html    # Connection diagnostics
├── demo-data.js            # Sample data for demo
└── docs/
    ├── README.md
    ├── SETUP.md
    ├── GANTT_FEATURES.md
    ├── OWNER_FILTER_TODAY_LINE.md
    └── ...
```

## Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Gantt Chart Features Summary

| Feature | Description |
|---------|-------------|
| 📅 Date Range Filter | Select custom start/end dates |
| 👥 Owner Filter | Filter by team member |
| 🔴 Today Line | Visual marker for current date |
| 📏 Clear Separators | Bold lines between months |
| 🔗 Cross-Month Tasks | Continuous bars across months |
| 📆 Full Calendar | 7 days/week including weekends |
| 🎨 Status Colors | Green/Yellow/Gray coding |
| ⬆️ Auto Sort | Ordered by start date |
| 📱 Mobile Ready | Touch-friendly responsive design |

## Security & Privacy

### API Key Security
⚠️ **Important**: 
- The Google API key is visible in client-side code
- **Required restrictions**:
  - API: Google Sheets API only
  - HTTP referrers: Your domain(s)
  - Consider using Apps Script for production

### Data Privacy
- Your Google Sheet must be public or accessible via API key
- No sensitive data should be stored in public sheets
- For private data, implement OAuth 2.0

## Performance

- Optimized for up to 100 tasks
- Fast rendering (< 100ms for typical datasets)
- Efficient date calculations
- Minimal API calls

## Known Limitations

1. **File Storage**: Filenames only (not actual files)
2. **Write Operations**: Requires Apps Script setup
3. **Real-time Sync**: Manual refresh needed
4. **Complex Dependencies**: Not supported (planned for future)

## Roadmap

- [ ] Drag & drop task scheduling
- [ ] Milestone markers on timeline
- [ ] Export Gantt Chart to PNG/PDF
- [ ] Task dependencies and critical path
- [ ] Multiple project support
- [ ] Team workload balancing
- [ ] Email notifications

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## Support

For issues or questions:
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- Create an issue on GitHub
- Contact the development team

## License

MIT License - feel free to use and modify

## Credits

**Developed by**: MEA WISE Innovation Incubation Program  
**Version**: 2.0  
**Last Updated**: February 2026

---

### Changelog

**v2.0** (Feb 2026)
- ✨ Added Owner Filter to Gantt Chart
- ✨ Added Today Line indicator
- ✨ Enhanced timeline with full calendar days
- ✨ Improved cross-month task display
- ✨ Added clear month separators
- 🐛 Fixed task sorting issues
- 📱 Improved mobile responsiveness

**v1.0** (Initial Release)
- Basic resource and task management
- Simple Gantt Chart visualization
- Google Sheets integration

---

**Made with ❤️ for project teams who need simple, effective planning tools**
