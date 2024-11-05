import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, LinearProgress } from '@mui/material';
import axios from 'axios';
import '../styles/FileUploadForm.css';

const FileUploadForm = () => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(null); // Initialize as null
  const [localUploads, setLocalUploads] = useState([]);
  const [networkUploads, setNetworkUploads] = useState([]);

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

  const handleNameChange = (e) => {
    setFileName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }
  
    // Use the provided name or default to the file's original name without the extension
    const finalFileName = fileName || file.name.split(".").slice(0, -1).join(".");
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", `${finalFileName}.pdf`); // Append .pdf to the file name
  
    try {
      setLoadingProgress(0); // Reset and show loading bar
      const response = await axios.post("http://localhost:5000/api/upload", formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setLoadingProgress(percentCompleted); // Update progress
        },
      });
      setLoadingProgress(null); // Hide loading bar after upload
      setMessage(response.data.message);
  
      setLocalUploads((prev) => [...prev, { filename: `${finalFileName}.pdf` }]);
      setNetworkUploads((prev) => [
        ...prev,
        { filename: `${finalFileName}.pdf`, analysis: response.data.analysis },
      ]);
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file. Please try again.");
      setLoadingProgress(null); // Hide loading bar on error
    }
  };
  

  const handleAnalyze = async (filename) => {
    try {
      setLoadingProgress(0); // Reset and show loading bar
      setMessage(`Analyzing ${filename}...`);
      const response = await axios.post(
        "http://localhost:5000/api/analyze",
        { filename },
        {
          onDownloadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setLoadingProgress(percentCompleted); // Update progress
          },
        }
      );
      setLoadingProgress(null); // Hide loading bar after analysis
      setMessage(response.data.message);

      setNetworkUploads((prev) =>
        prev.map((upload) =>
          upload.filename === filename ? { ...upload, analysis: response.data.analysis } : upload
        )
      );
    } catch (error) {
      console.error("Error analyzing file:", error);
      setMessage("Error analyzing file. Please try again.");
      setLoadingProgress(null); // Hide loading bar on error
    }
  };

  const handleDelete = async (filename) => {
    try {
      await axios.delete(`http://localhost:5000/api/delete/${filename}`);
      setMessage(`Deleted ${filename} successfully.`);
      setLocalUploads((prev) => prev.filter((upload) => upload.filename !== filename));
      setNetworkUploads((prev) => prev.filter((upload) => upload.filename !== filename));
    } catch (error) {
      console.error("Error deleting file:", error);
      setMessage("Error deleting file. Please try again.");
    }
  };

  return (
    <div className="file-upload-card">
      <Typography className="file-upload-title" variant="h5" gutterBottom>
        <span className="highlight-text">Upload</span> Your Pitch Deck
      </Typography>
      <form onSubmit={handleSubmit} className="upload-form">
        <TextField
          label="File Name"
          value={fileName}
          onChange={handleNameChange}
          fullWidth
          variant="outlined"
          className="file-name-input"
          placeholder="Enter file name (will be saved as .pdf)"
          style={{ marginBottom: '20px' }}
        />
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
      {loadingProgress !== null && ( // Only show when loadingProgress is not null
        <LinearProgress
          variant="determinate"
          value={loadingProgress}
          style={{ marginTop: '10px', marginBottom: '10px' }}
        />
      )}
      {message && (
        <Typography className="message" variant="body1" style={{ marginTop: '10px' }}>
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
            <Button
              variant="outlined"
              color="secondary"
              className="delete-button"
              onClick={() => handleDelete(upload.filename)}
              style={{ marginLeft: '10px' }}
            >
              Delete
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
            <Button
              variant="outlined"
              color="secondary"
              className="delete-button"
              onClick={() => handleDelete(upload.filename)}
              style={{ marginLeft: '10px' }}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUploadForm;
