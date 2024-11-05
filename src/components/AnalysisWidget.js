import React, { useState, useEffect } from 'react';
import { Button, Typography } from '@mui/material';
import axios from 'axios';
import '../styles/AnalysisWidget.css'; // Adjust the path as necessary

const AnalysisWidget = () => {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [analysisContent, setAnalysisContent] = useState('');

  // Fetch the list of analyses when the component mounts
  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/analyses");
        setAnalyses(response.data);
      } catch (error) {
        console.error("Error fetching analyses:", error);
      }
    };

    fetchAnalyses();
  }, []);

  const handleViewAnalysis = async (filename) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/analyses/${filename}`);
      setSelectedAnalysis(filename);
      setAnalysisContent(response.data);
    } catch (error) {
      console.error("Error fetching analysis content:", error);
    }
  };

  return (
    <div className="analysis-widget-card">
      <Typography className="analysis-widget-title" variant="h5" gutterBottom>
        <span className="highlight-text">Saved</span> Analyses
      </Typography>
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
          </li>
        ))}
      </ul>
      {selectedAnalysis && (
        <div className="analysis-content">
          <Typography variant="h6">Analysis Content for {selectedAnalysis}</Typography>
          <pre>{analysisContent}</pre>
        </div>
      )}
    </div>
  );
};

export default AnalysisWidget;
