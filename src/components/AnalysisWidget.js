import React, { useState, useEffect } from 'react';
import { IconButton, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';
import '../styles/AnalysisWidget.css';

const AnalysisWidget = () => {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
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
      setParsedAnalysis(response.data);  // Set parsed JSON data directly
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
        setParsedAnalysis({});
      }
    } catch (error) {
      console.error("Error deleting analysis:", error);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "Team": return "#FFEBEE";
      case "Market": return "#E3F2FD";
      case "Product/Technology": return "#E8F5E9";
      case "Impact": return "#FFF3E0";
      case "Investment Opportunity": return "#F3E5F5";
      default: return "#F5F5F5";
    }
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
      <ul className="analysis-list">
        {analyses.map((filename, index) => (
          <li key={index} className="analysis-item">
            <Button variant="outlined" className="view-button" onClick={() => handleViewAnalysis(filename)}>
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
          <Typography variant="h6" gutterBottom>Analysis for {selectedAnalysis}</Typography>
          {Object.keys(parsedAnalysis).map((category, index) => (
            <div key={index} className="analysis-section" style={{ backgroundColor: getCategoryColor(category), borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
              <Typography variant="h6" className="analysis-category" gutterBottom>{category}</Typography>
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
                        <TableCell>{item.Criteria}</TableCell>
                        <TableCell>{item.Score}</TableCell>
                        <TableCell>{item.Explanation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnalysisWidget;
