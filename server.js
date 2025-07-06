const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ensure data directory exists
const dataDir = './data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// File paths
const readingsFile = path.join(dataDir, 'meter-readings.json');
const statisticsFile = path.join(dataDir, 'consumption-stats.json');

// Initialize files if they don't exist
if (!fs.existsSync(readingsFile)) {
  fs.writeFileSync(readingsFile, JSON.stringify([]));
}

if (!fs.existsSync(statisticsFile)) {
  fs.writeFileSync(statisticsFile, JSON.stringify({
    totalReadings: 0,
    totalEnergyConsumption: 0,
    totalWaterConsumption: 0,
    averageDailyEnergy: 0,
    averageDailyWater: 0,
    lastUpdated: new Date().toISOString()
  }));
}

// Helper function to read readings data
function readMeterReadings() {
  try {
    const data = fs.readFileSync(readingsFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading meter readings:', error);
    return [];
  }
}

// Helper function to write readings data
function writeMeterReadings(data) {
  try {
    fs.writeFileSync(readingsFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing meter readings:', error);
  }
}

// Helper function to calculate consumption between readings
function calculateConsumption(currentReading, previousReading) {
  if (!previousReading) return 0;
  return Math.max(0, currentReading - previousReading);
}

// Helper function to calculate statistics
function calculateStatistics(readingsData) {
  const stats = {
    totalReadings: readingsData.length,
    totalEnergyConsumption: 0,
    totalWaterConsumption: 0,
    averageDailyEnergy: 0,
    averageDailyWater: 0,
    dailyConsumption: [],
    weeklyConsumption: [],
    monthlyConsumption: [],
    lastUpdated: new Date().toISOString()
  };

  if (readingsData.length === 0) {
    return stats;
  }

  // Sort readings by date
  const sortedReadings = readingsData.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Calculate consumption for each reading
  const consumptionData = [];
  for (let i = 0; i < sortedReadings.length; i++) {
    const current = sortedReadings[i];
    const previous = i > 0 ? sortedReadings[i - 1] : null;
    
    if (previous) {
      const energyConsumption = calculateConsumption(current.energyMeter1, previous.energyMeter1) +
                               calculateConsumption(current.energyMeter2, previous.energyMeter2);
      const waterConsumption = calculateConsumption(current.waterMeter, previous.waterMeter);
      
      consumptionData.push({
        date: current.date,
        energyConsumption,
        waterConsumption,
        daysDiff: Math.max(1, Math.ceil((new Date(current.date) - new Date(previous.date)) / (1000 * 60 * 60 * 24)))
      });
    }
  }

  // Calculate totals
  stats.totalEnergyConsumption = consumptionData.reduce((sum, item) => sum + item.energyConsumption, 0);
  stats.totalWaterConsumption = consumptionData.reduce((sum, item) => sum + item.waterConsumption, 0);

  // Calculate daily averages
  const totalDays = consumptionData.reduce((sum, item) => sum + item.daysDiff, 0);
  if (totalDays > 0) {
    stats.averageDailyEnergy = stats.totalEnergyConsumption / totalDays;
    stats.averageDailyWater = stats.totalWaterConsumption / totalDays;
  }

  // Group by day, week, month
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Daily consumption (last 30 days)
  for (let i = 0; i < 30; i++) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const dayData = consumptionData.find(item => item.date.startsWith(dateStr));
    
    stats.dailyConsumption.unshift({
      date: dateStr,
      energy: dayData ? dayData.energyConsumption : 0,
      water: dayData ? dayData.waterConsumption : 0
    });
  }

  // Weekly consumption (last 12 weeks)
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    
    const weekData = consumptionData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= weekStart && itemDate < weekEnd;
    });
    
    const weekEnergy = weekData.reduce((sum, item) => sum + item.energyConsumption, 0);
    const weekWater = weekData.reduce((sum, item) => sum + item.waterConsumption, 0);
    
    stats.weeklyConsumption.unshift({
      week: `Week ${12 - i}`,
      energy: weekEnergy,
      water: weekWater
    });
  }

  // Monthly consumption (last 12 months)
  for (let i = 0; i < 12; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const monthData = consumptionData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= monthDate && itemDate < nextMonth;
    });
    
    const monthEnergy = monthData.reduce((sum, item) => sum + item.energyConsumption, 0);
    const monthWater = monthData.reduce((sum, item) => sum + item.waterConsumption, 0);
    
    stats.monthlyConsumption.unshift({
      month: monthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      energy: monthEnergy,
      water: monthWater
    });
  }

  return stats;
}

// Helper function to update statistics
function updateStatistics() {
  const readingsData = readMeterReadings();
  const stats = calculateStatistics(readingsData);
  
  try {
    fs.writeFileSync(statisticsFile, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Error updating statistics:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/submit-reading', (req, res) => {
  try {
    const readingsData = readMeterReadings();
    
    // Add unique ID and timestamp
    const newReading = {
      id: uuidv4(),
      ...req.body,
      submittedAt: new Date().toISOString()
    };

    // Validate required fields
    if (!newReading.date || !newReading.energyMeter1 || !newReading.energyMeter2 || !newReading.waterMeter) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Convert string numbers to actual numbers
    newReading.energyMeter1 = parseFloat(newReading.energyMeter1);
    newReading.energyMeter2 = parseFloat(newReading.energyMeter2);
    newReading.waterMeter = parseFloat(newReading.waterMeter);

    // Add to readings array
    readingsData.push(newReading);
    
    // Save to file
    writeMeterReadings(readingsData);
    
    // Update statistics
    updateStatistics();
    
    res.json({ success: true, message: 'Meter reading submitted successfully' });
  } catch (error) {
    console.error('Error submitting reading:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/statistics', (req, res) => {
  try {
    const stats = JSON.parse(fs.readFileSync(statisticsFile, 'utf8'));
    res.json(stats);
  } catch (error) {
    console.error('Error reading statistics:', error);
    res.status(500).json({ error: 'Error reading statistics' });
  }
});

app.get('/api/readings', (req, res) => {
  try {
    const readingsData = readMeterReadings();
    res.json(readingsData);
  } catch (error) {
    console.error('Error reading meter readings:', error);
    res.status(500).json({ error: 'Error reading meter readings' });
  }
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Export CSV endpoint
app.get('/api/export-csv', (req, res) => {
  try {
    const readingsData = readMeterReadings();
    
    if (readingsData.length === 0) {
      return res.status(404).json({ error: 'No readings data available' });
    }

    // Create CSV header
    const csvHeader = 'ID,Date,Energy Meter 1,Energy Meter 2,Water Meter,Location,Notes,Submitted At\n';
    
    // Create CSV rows
    const csvRows = readingsData.map(reading => {
      const row = [
        reading.id,
        reading.date,
        reading.energyMeter1,
        reading.energyMeter2,
        reading.waterMeter,
        reading.location || '',
        `"${(reading.notes || '').replace(/"/g, '""')}"`,
        reading.submittedAt
      ];
      return row.join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=meter_readings.csv');
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Error exporting CSV' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}/dashboard`);
});