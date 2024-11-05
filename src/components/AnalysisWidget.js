import React, { useState, useEffect } from 'react';
import { IconButton, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import '../styles/AnalysisWidget.css';

const AnalysisWidget = () => {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [analysisContent, setAnalysisContent] = useState('');
  const [parsedAnalysis, setParsedAnalysis] = useState({});
  const [viewMode, setViewMode] = useState('pretty');

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/analyses");
      setAnalyses(response.data);
    } catch (error) {
      console.error("Error fetching analyses:", error);
    }
  };

  const handleViewAnalysis = async (filename) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/analyses/${filename}`);
      setSelectedAnalysis(filename);
      setAnalysisContent(response.data);
      parseAnalysisContent(response.data);
    } catch (error) {
      console.error("Error fetching analysis content:", error);
    }
  };

  const handleDeleteAnalysis = async (filename) => {
    try {
      await axios.delete(`http://localhost:5000/api/analyses/${filename}`);
      setAnalyses((prevAnalyses) => prevAnalyses.filter((file) => file !== filename));
      if (selectedAnalysis === filename) {
        setSelectedAnalysis(null);
        setAnalysisContent('');
        setParsedAnalysis({});
      }
    } catch (error) {
      console.error("Error deleting analysis:", error);
    }
  };

  const parseAnalysisContent = (content) => {
    // Initialize parsed structure
    const parsed = {
      "Team": [],
      "Market": [],
      "Product/Technology": [],
      "Impact": [],
      "Investment Opportunity": []
    };
  
    // Split the content by lines
    const lines = content.split("\n");
  
    // Iterate through each line and look for the structured table pattern
    lines.forEach(line => {
      // Check if the line starts with "|" and contains table content
      if (line.startsWith("|") && !line.startsWith("| Category") && !line.startsWith("|---")) {
        // Split the line into columns based on "|"
        const columns = line.split("|").map(col => col.trim());
  
        // Ensure that the line has exactly 5 columns: "|", "Category", "Criteria", "Score", and "Explanation"
        if (columns.length === 5) {
          const category = columns[1];
          const criteria = columns[2];
          const score = columns[3];
          const explanation = columns[4];
  
          // If the category exists in the parsed object, add the parsed data
          if (parsed[category]) {
            parsed[category].push({ criteria, score, explanation });
          }
        }
      }
    });
  
    // Set the parsed analysis state
    setParsedAnalysis(parsed);
  };
  

  const getCategoryColor = (category) => {
    switch (category) {
      case "Team":
        return "#FFEBEE"; // Light red
      case "Market":
        return "#E3F2FD"; // Light blue
      case "Product/Technology":
        return "#E8F5E9"; // Light green
      case "Impact":
        return "#FFF3E0"; // Light orange
      case "Investment Opportunity":
        return "#F3E5F5"; // Light purple
      default:
        return "#F5F5F5"; // Default light gray
    }
  };

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === 'pretty' ? 'markdown' : 'pretty'));
  };

  return (
    <div className="analysis-widget-card">
      <div className="analysis-widget-header">
        <Typography className="analysis-widget-title" variant="h5">
          <span className="highlight-text">Saved</span> Analyses
        </Typography>
        <IconButton onClick={fetchAnalyses} color="primary">
          <RefreshIcon />
        </IconButton>
      </div>
      <div className="icon-buttons">
        <Tooltip title={viewMode === 'pretty' ? 'Toggle Markdown View' : 'Toggle Pretty View'}>
          <IconButton
            color="primary"
            onClick={() => setViewMode(viewMode === 'pretty' ? 'markdown' : 'pretty')}
          >
            {viewMode === 'pretty' ? <VisibilityOffIcon /> : <VisibilityIcon />}
          </IconButton>
        </Tooltip>
      </div>
      <ul className="analysis-list">
        {analyses.map((filename, index) => (
          <li key={index} className="analysis-item">
            <Button
              variant="outlined"
              className="view-button"
              onClick={() => handleViewAnalysis(filename)}
            >
              {filename}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              className="delete-button"
              onClick={() => handleDeleteAnalysis(filename)}
              style={{ marginLeft: '10px' }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
      {selectedAnalysis && (
        <div className="analysis-content">
          <Typography variant="h6" gutterBottom>
            Analysis for {selectedAnalysis}
          </Typography>
          {viewMode === 'markdown' ? (
            <pre className="markdown-view">{analysisContent}</pre>
          ) : (
            Object.keys(parsedAnalysis).map((category, index) => (
              <div
                key={index}
                className="analysis-section"
                style={{ backgroundColor: getCategoryColor(category), borderRadius: '8px', padding: '15px', marginBottom: '20px' }}
              >
                <Typography variant="h6" className="analysis-category" gutterBottom>
                  {category}
                </Typography>
                <TableContainer component={Paper} className="analysis-table-container">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Criteria</strong></TableCell>
                        <TableCell><strong>Score</strong></TableCell>
                        <TableCell><strong>Explanation</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {parsedAnalysis[category].map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{item.criteria}</TableCell>
                          <TableCell>{item.score}</TableCell>
                          <TableCell>{item.explanation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisWidget;
