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
const feedbackFile = path.join(dataDir, 'feedback.json');
const statisticsFile = path.join(dataDir, 'statistics.json');

// Initialize files if they don't exist
if (!fs.existsSync(feedbackFile)) {
  fs.writeFileSync(feedbackFile, JSON.stringify([]));
}

if (!fs.existsSync(statisticsFile)) {
  fs.writeFileSync(statisticsFile, JSON.stringify({
    totalFeedbacks: 0,
    departmentStats: {},
    motivationStats: { average: 0, distribution: {} },
    energyStats: { average: 0, distribution: {} },
    lastUpdated: new Date().toISOString()
  }));
}

// Helper function to read feedback data
function readFeedbackData() {
  try {
    const data = fs.readFileSync(feedbackFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading feedback data:', error);
    return [];
  }
}

// Helper function to write feedback data
function writeFeedbackData(data) {
  try {
    fs.writeFileSync(feedbackFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing feedback data:', error);
  }
}

// Helper function to calculate statistics
function calculateStatistics(feedbackData) {
  const stats = {
    totalFeedbacks: feedbackData.length,
    departmentStats: {},
    motivationStats: { average: 0, distribution: {} },
    energyStats: { average: 0, distribution: {} },
    lastUpdated: new Date().toISOString()
  };

  if (feedbackData.length === 0) {
    return stats;
  }

  // Calculate department statistics
  feedbackData.forEach(feedback => {
    if (!stats.departmentStats[feedback.department]) {
      stats.departmentStats[feedback.department] = {
        count: 0,
        avgMotivation: 0,
        avgEnergy: 0,
        motivationSum: 0,
        energySum: 0
      };
    }
    
    const dept = stats.departmentStats[feedback.department];
    dept.count++;
    dept.motivationSum += feedback.motivationLevel;
    dept.energySum += feedback.energyLevel;
    dept.avgMotivation = dept.motivationSum / dept.count;
    dept.avgEnergy = dept.energySum / dept.count;
  });

  // Calculate motivation statistics
  const motivationLevels = feedbackData.map(f => f.motivationLevel);
  const energyLevels = feedbackData.map(f => f.energyLevel);
  
  stats.motivationStats.average = motivationLevels.reduce((a, b) => a + b, 0) / motivationLevels.length;
  stats.energyStats.average = energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;

  // Calculate distribution
  for (let i = 1; i <= 10; i++) {
    stats.motivationStats.distribution[i] = motivationLevels.filter(level => level === i).length;
    stats.energyStats.distribution[i] = energyLevels.filter(level => level === i).length;
  }

  return stats;
}

// Helper function to update statistics
function updateStatistics() {
  const feedbackData = readFeedbackData();
  const stats = calculateStatistics(feedbackData);
  
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

app.post('/api/submit-feedback', (req, res) => {
  try {
    const feedbackData = readFeedbackData();
    
    // Add unique ID and timestamp
    const newFeedback = {
      id: uuidv4(),
      ...req.body,
      submittedAt: new Date().toISOString()
    };

    // Validate required fields
    if (!newFeedback.department || !newFeedback.motivationLevel || !newFeedback.energyLevel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Add to feedback array
    feedbackData.push(newFeedback);
    
    // Save to file
    writeFeedbackData(feedbackData);
    
    // Update statistics
    updateStatistics();
    
    res.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
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

app.get('/api/feedback', (req, res) => {
  try {
    const feedbackData = readFeedbackData();
    // Remove employee names for privacy (optional)
    const anonymizedData = feedbackData.map(feedback => ({
      ...feedback,
      employeeName: feedback.employeeName === 'Anonymous' ? 'Anonymous' : '***'
    }));
    res.json(anonymizedData);
  } catch (error) {
    console.error('Error reading feedback:', error);
    res.status(500).json({ error: 'Error reading feedback' });
  }
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Export CSV endpoint
app.get('/api/export-csv', (req, res) => {
  try {
    const feedbackData = readFeedbackData();
    
    if (feedbackData.length === 0) {
      return res.status(404).json({ error: 'No feedback data available' });
    }

    // Create CSV header
    const csvHeader = 'ID,Employee Name,Department,Motivation Level,Energy Level,Motivation Factors,Energy Factors,Suggestions,Timestamp\n';
    
    // Create CSV rows
    const csvRows = feedbackData.map(feedback => {
      const row = [
        feedback.id,
        feedback.employeeName || 'Anonymous',
        feedback.department,
        feedback.motivationLevel,
        feedback.energyLevel,
        `"${(feedback.motivationFactors || '').replace(/"/g, '""')}"`,
        `"${(feedback.energyFactors || '').replace(/"/g, '""')}"`,
        `"${(feedback.suggestions || '').replace(/"/g, '""')}"`,
        feedback.submittedAt
      ];
      return row.join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=feedback_data.csv');
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