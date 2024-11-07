import React, { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import axios from 'axios';
import '../styles/CompareWidget.css';

const CompareWidget = () => {
  const [analyses, setAnalyses] = useState([]);
  const [rankedAnalyses, setRankedAnalyses] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchAndRankAnalyses();
  }, []);

  const fetchAndRankAnalyses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/analyses");
      const analysesData = await Promise.all(
        response.data.map(async (filename) => {
          const analysisResponse = await axios.get(`http://localhost:5000/api/analyses/${filename}`);
          const analysis = analysisResponse.data;

          const overviewResponse = await axios.get(`http://localhost:5000/api/overviews/${filename.replace("_analysis", "_overview")}`);
          const overview = overviewResponse.data;

          const totalScore = calculateTotalScore(analysis);
          return { filename, analysis, overview, totalScore };
        })
      );

      // Sort analyses by total score in descending order
      const rankedData = analysesData.sort((a, b) => b.totalScore - a.totalScore);
      setRankedAnalyses(rankedData);
      setAnalyses(response.data);
    } catch (error) {
      console.error("Error fetching analyses for comparison:", error);
    }
  };

  const calculateTotalScore = (analysis) => {
    let totalScore = 0;
    Object.keys(analysis).forEach((category) => {
      if (Array.isArray(analysis[category])) {
        analysis[category].forEach((item) => {
          totalScore += item.Score;
        });
      }
    });
    return totalScore;
  };

  const toggleRowExpansion = (filename) => {
    setExpandedRow(expandedRow === filename ? null : filename);
  };

  return (
    <div className="compare-widget-card">
      <div className="compare-widget-header">
        <Typography className="compare-widget-title" variant="h5">
          <span className="highlight-text">Compare</span> Analyses
        </Typography>
        <IconButton onClick={fetchAndRankAnalyses} color="primary">
          <RefreshIcon />
        </IconButton>
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Rank</strong></TableCell>
              <TableCell><strong>Pitch Deck</strong></TableCell>
              <TableCell><strong>Total Score</strong></TableCell>
              <TableCell><strong>Overall Score</strong></TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rankedAnalyses.map((data, index) => (
              <React.Fragment key={data.filename}>
                <TableRow
                  onClick={() => toggleRowExpansion(data.filename)}
                  style={{ cursor: 'pointer' }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{data.filename}</TableCell>
                  <TableCell>{data.totalScore}</TableCell>
                  <TableCell>{data.overview.OverallScore || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      {expandedRow === data.filename ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
                
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={expandedRow === data.filename} timeout="auto" unmountOnExit>
                      <div style={{ margin: '20px' }}>
                        {/* Overview Section */}
                        <div className="expanded-section overview-section" style={{ backgroundColor: "#F0F0F0", padding: '10px', borderRadius: '8px', marginBottom: '20px' }}>
                          <Typography variant="h6" gutterBottom>Overview</Typography>
                          <Typography variant="body1"><strong>Geography:</strong> {data.overview.Geography}</Typography>
                          <Typography variant="body1"><strong>Industry:</strong> {data.overview.Industry}</Typography>
                          <Typography variant="body1"><strong>Stage:</strong> {data.overview.Stage}</Typography>
                          <Typography variant="body1"><strong>Overall Score:</strong> {data.overview.OverallScore}</Typography>
                        </div>

                        {/* Detailed Analysis Sections */}
                        {Object.keys(data.analysis).map((category) => (
                          Array.isArray(data.analysis[category]) && (
                            <div key={category} className="expanded-section">
                              <Typography variant="h6" className="expanded-category" gutterBottom>
                                {category}
                              </Typography>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell><strong>Criteria</strong></TableCell>
                                    <TableCell><strong>Score</strong></TableCell>
                                    <TableCell><strong>Explanation</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {data.analysis[category].map((item, idx) => (
                                    <TableRow key={idx}>
                                      <TableCell>{item.Criteria}</TableCell>
                                      <TableCell>{item.Score}</TableCell>
                                      <TableCell>{item.Explanation}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          )
                        ))}
                      </div>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CompareWidget;
