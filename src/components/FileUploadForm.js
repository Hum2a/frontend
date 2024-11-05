import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import axios from 'axios';
import '../styles/FileUploadForm.css';

const FileUploadForm = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [localUploads, setLocalUploads] = useState([]);
  const [networkUploads, setNetworkUploads] = useState([]);

  // Fetch all local and network uploads when the component mounts
  useEffect(() => {
    const fetchUploads = async () => {
      try {
        const localResponse = await axios.get("http://localhost:5000/api/local-uploads");
        setLocalUploads(localResponse.data);

        const networkResponse = await axios.get("http://localhost:5000/api/uploads");
        setNetworkUploads(networkResponse.data);
      } catch (error) {
        console.error("Error fetching uploads:", error);
      }
    };

    fetchUploads();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:5000/api/upload", formData);
      setMessage(response.data.message);

      // Update local and network uploads
      setLocalUploads((prev) => [...prev, { filename: file.name }]);
      setNetworkUploads((prev) => [
        ...prev,
        { filename: file.name, analysis: response.data.analysis },
      ]);
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file. Please try again.");
    }
  };

  const handleAnalyze = async (filename) => {
    try {
      setMessage(`Analyzing ${filename}...`);
      const response = await axios.post("http://localhost:5000/api/analyze", { filename });
      setMessage(response.data.message);

      // Update the analysis in the network uploads
      setNetworkUploads((prev) =>
        prev.map((upload) =>
          upload.filename === filename ? { ...upload, analysis: response.data.analysis } : upload
        )
      );
    } catch (error) {
      console.error("Error analyzing file:", error);
      setMessage("Error analyzing file. Please try again.");
    }
  };

  return (
    <div className="file-upload-card">
      <Typography className="file-upload-title" variant="h5" gutterBottom>
        <span className="highlight-text">Upload</span> Your Pitch Deck
      </Typography>
      <form onSubmit={handleSubmit} className="upload-form">
        <TextField
          className="file-input"
          type="file"
          fullWidth
          onChange={handleFileChange}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <Button className="upload-button" variant="contained" type="submit">
          Upload
        </Button>
      </form>
      {message && (
        <Typography className="message" variant="body1">
          {message}
        </Typography>
      )}

      <Typography className="upload-list-title" variant="h6" gutterBottom>
        <span className="highlight-text">Local</span> Uploads
      </Typography>
      <ul className="upload-list">
        {localUploads.map((upload, index) => (
          <li key={index} className="upload-item">
            <a
              href={`http://localhost:5000/uploads/${upload.filename}`}
              target="_blank"
              rel="noopener noreferrer"
              className="upload-link"
            >
              {upload.filename}
            </a>
            <Button
              variant="outlined"
              className="analyze-button"
              onClick={() => handleAnalyze(upload.filename)}
            >
              Analyze
            </Button>
          </li>
        ))}
      </ul>

      <Typography className="upload-list-title" variant="h6" gutterBottom>
        <span className="highlight-text">Network</span> Uploads
      </Typography>
      <ul className="upload-list">
        {networkUploads.map((upload, index) => (
          <li key={index} className="upload-item">
            <strong>Filename:</strong> {upload.filename} <br />
            <strong>Analysis:</strong> {upload.analysis || "Not analyzed yet"}
            <br />
            <Button
              variant="outlined"
              className="analyze-button"
              onClick={() => handleAnalyze(upload.filename)}
            >
              Analyze
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUploadForm;
