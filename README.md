# Utility Consumption Tracker

A complete web application for tracking energy and water consumption with real-time analytics and beautiful visualizations.

## Features

### � Data Collection
- **Energy Meters**: Track readings from two separate energy meters (kWh)
- **Water Meter**: Monitor water consumption (Liters)
- **Date-based Tracking**: Record readings with specific dates
- **Optional Metadata**: Add location and notes to readings

### 📈 Analytics & Visualization
- **Consumption Calculations**: Automatic calculation of daily, weekly, and monthly consumption
- **Interactive Charts**: Beautiful charts powered by Chart.js
  - Daily consumption trends (last 30 days)
  - Energy vs Water distribution
  - Monthly comparison charts
- **Key Metrics Dashboard**: Quick overview of total consumption and averages
- **Cost Estimation**: Estimated daily costs based on consumption

### 💾 Data Storage
- **JSON File Storage**: All data stored in human-readable JSON files
- **Automatic Calculations**: Real-time consumption calculations between readings
- **Data Export**: Export all data to CSV format
- **Statistics**: Comprehensive statistics automatically generated

### 🎨 User Experience
- **Modern UI**: Clean, responsive design with beautiful gradients
- **Icons & Graphics**: FontAwesome icons for enhanced visual appeal
- **Mobile Responsive**: Works perfectly on all device sizes
- **Real-time Updates**: Dashboard updates automatically with new readings

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Clone or download the project**
   ```bash
   cd utility-consumption-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Main form: http://localhost:3000
   - Dashboard: http://localhost:3000/dashboard

## Usage Guide

### Adding Meter Readings

1. **Navigate to the main page** (http://localhost:3000)
2. **Fill in the form**:
   - **Date**: Select the reading date (defaults to today)
   - **Energy Meter 1**: Enter the current reading in kWh
   - **Energy Meter 2**: Enter the second meter reading in kWh
   - **Water Meter**: Enter the water meter reading in Liters
   - **Location** (optional): Specify the location
   - **Notes** (optional): Add any additional observations

3. **Submit the reading** - The system will automatically calculate consumption based on previous readings

### Viewing Analytics

1. **Open the Dashboard** (http://localhost:3000/dashboard)
2. **Explore the analytics**:
   - **Key Metrics**: View total readings, consumption, and estimated costs
   - **Charts**: Analyze trends and patterns
   - **Recent Readings**: Review the latest meter readings
   - **Export Data**: Download all data as CSV

### Understanding Consumption Calculations

- **Daily Consumption**: Difference between consecutive day readings
- **Weekly Consumption**: Sum of daily consumption over 7-day periods
- **Monthly Consumption**: Sum of daily consumption over monthly periods
- **Average Calculations**: Based on total consumption divided by time periods

## Technical Details

### Architecture
- **Frontend**: HTML, CSS (Tailwind), JavaScript
- **Backend**: Node.js with Express
- **Charts**: Chart.js library
- **Icons**: FontAwesome
- **Data Storage**: JSON files in `/data` directory

### API Endpoints
- `POST /api/submit-reading` - Submit new meter reading
- `GET /api/statistics` - Get consumption statistics
- `GET /api/readings` - Get all meter readings
- `GET /api/export-csv` - Export data as CSV

### File Structure
```
utility-consumption-tracker/
├── server.js           # Express server and API
├── index.html          # Main form page
├── dashboard.html      # Analytics dashboard
├── package.json        # Dependencies and scripts
├── README.md          # Documentation
└── data/              # JSON data files (auto-created)
    ├── meter-readings.json    # Raw meter readings
    └── consumption-stats.json # Calculated statistics
```

### Data Schema

#### Meter Reading
```json
{
  "id": "uuid",
  "date": "YYYY-MM-DD",
  "energyMeter1": 1234.56,
  "energyMeter2": 987.65,
  "waterMeter": 45678.90,
  "location": "Main Building",
  "notes": "Monthly reading",
  "submittedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Statistics
```json
{
  "totalReadings": 10,
  "totalEnergyConsumption": 245.67,
  "totalWaterConsumption": 1234.56,
  "averageDailyEnergy": 8.19,
  "averageDailyWater": 41.15,
  "dailyConsumption": [...],
  "weeklyConsumption": [...],
  "monthlyConsumption": [...],
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```

## Customization

### Adjusting Cost Calculations
Edit the cost rates in `dashboard.html`:
```javascript
const energyCostPerKwh = 0.12; // $0.12 per kWh
const waterCostPerL = 0.002;   // $0.002 per liter
```

### Styling
- Modify colors and gradients in the CSS sections
- Tailwind classes can be adjusted for different styling
- Icon colors and styles can be customized

### Adding More Meters
To track additional meters, modify:
1. Form fields in `index.html`
2. Data processing in `server.js`
3. Chart configurations in `dashboard.html`

## Data Management

### Backup
Regularly backup the `/data` directory containing your JSON files.

### Reset Data
To start fresh, delete the files in `/data` directory. They will be recreated automatically.

### Migration
JSON files can be easily migrated between installations or converted to other formats.

## Troubleshooting

### Server Won't Start
- Check if Node.js is installed: `node --version`
- Ensure port 3000 is available
- Check for error messages in terminal

### Data Not Saving
- Verify write permissions in project directory
- Check browser console for error messages
- Ensure `/data` directory exists and is writable

### Charts Not Displaying
- Check internet connection (Chart.js loads from CDN)
- Verify browser console for JavaScript errors
- Ensure JSON data format is correct

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Contributing

Feel free to enhance the application by:
- Adding new chart types
- Implementing additional metrics
- Improving the UI/UX
- Adding data validation
- Creating data import features

## License

MIT License - Feel free to use and modify for your needs.

---

**Made with ❤️ for efficient utility tracking**
