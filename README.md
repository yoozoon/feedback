# Employee Feedback System

A complete web-based employee feedback system that collects, stores, and analyzes employee motivation and energy levels with interactive dashboards and statistics.

## Features

### 📝 Feedback Collection
- **User-friendly form** with modern UI using Tailwind CSS
- **Structured data collection** including:
  - Employee name (optional for anonymous feedback)
  - Department selection
  - Motivation level (1-10 scale)
  - Energy level (1-10 scale)
  - Detailed feedback text areas
  - Improvement suggestions
- **Real-time form validation** and submission feedback
- **Responsive design** that works on all devices

### 📊 Statistics & Analytics
- **Interactive dashboard** with visual charts
- **Department-wise statistics** showing average motivation and energy levels
- **Distribution charts** for motivation and energy levels
- **Real-time data updates** with refresh functionality
- **Export functionality** to CSV for further analysis

### 💾 Data Management
- **Persistent storage** using JSON files
- **Automatic statistics calculation** and updates
- **Data export** capabilities for external analysis
- **Privacy-focused** with optional anonymization

## Setup Instructions

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation

1. **Clone or download the project files**
   ```bash
   # If using git
   git clone <repository-url>
   cd employee-feedback-system
   
   # Or create a new directory and copy the files
   mkdir employee-feedback-system
   cd employee-feedback-system
   # Copy all project files to this directory
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   # For production
   npm start
   
   # For development (with auto-restart)
   npm run dev
   ```

4. **Access the application**
   - **Feedback Form**: http://localhost:3000
   - **Dashboard**: http://localhost:3000/dashboard

## Usage

### For Employees (Submitting Feedback)
1. Open http://localhost:3000 in your browser
2. Fill out the feedback form:
   - Enter your name (optional)
   - Select your department
   - Rate your motivation level (1-10)
   - Rate your energy level (1-10)
   - Provide detailed feedback in text areas
   - Add suggestions for improvement
3. Click "Submit Feedback"
4. You'll see a success message when your feedback is saved

### For Administrators (Viewing Statistics)
1. Open http://localhost:3000/dashboard in your browser
2. View comprehensive statistics including:
   - Total feedback count
   - Average motivation and energy levels
   - Department-wise breakdown
   - Visual charts and distributions
3. Export data as CSV for further analysis
4. Refresh data to see latest submissions

## Data Storage

The system stores data in the `data/` directory:
- `feedback.json` - Contains all feedback submissions
- `statistics.json` - Contains calculated statistics and summaries

### Data Structure

Each feedback entry includes:
```json
{
  "id": "unique-uuid",
  "employeeName": "John Doe",
  "department": "Engineering",
  "motivationLevel": 8,
  "energyLevel": 7,
  "motivationFactors": "Clear goals and supportive team",
  "energyFactors": "Good work-life balance",
  "suggestions": "More team building activities",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "submittedAt": "2024-01-15T10:30:00.000Z"
}
```

## API Endpoints

### POST /api/submit-feedback
Submit new feedback data
- **Body**: JSON object with feedback data
- **Response**: Success/error message

### GET /api/statistics
Get calculated statistics
- **Response**: JSON object with statistics

### GET /api/feedback
Get all feedback data (anonymized)
- **Response**: Array of feedback objects

### GET /api/export-csv
Export feedback data as CSV
- **Response**: CSV file download

## Customization

### Adding New Departments
Edit the department options in `index.html`:
```html
<option value="Your Department">Your Department</option>
```

### Modifying Form Fields
Add new fields to the form in `index.html` and update the submission handling in both frontend JavaScript and `server.js`.

### Styling Changes
The system uses Tailwind CSS. Modify classes in the HTML files to change the appearance.

## Security Considerations

- **Data Privacy**: Employee names are optional and can be anonymized
- **Input Validation**: Server-side validation prevents malicious data
- **CORS Protection**: Configured for secure cross-origin requests
- **File Security**: Data files are stored server-side only

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change the port in `server.js`: `const PORT = process.env.PORT || 3001;`

2. **Dependencies not installed**
   - Run `npm install` to install required packages

3. **Data not saving**
   - Check that the server has write permissions to the project directory
   - Verify the `data/` directory is created automatically

4. **Dashboard not loading**
   - Check browser console for errors
   - Verify the API endpoints are working by visiting them directly

### Development

To modify the system:
1. Edit HTML files for frontend changes
2. Modify `server.js` for backend logic
3. Update `package.json` for new dependencies
4. Test thoroughly before deployment

## Production Deployment

For production use:
1. Use environment variables for configuration
2. Set up proper logging
3. Use a process manager like PM2
4. Configure reverse proxy (nginx/Apache)
5. Set up regular backups of the data directory
6. Configure SSL/HTTPS

## Contributing

To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
