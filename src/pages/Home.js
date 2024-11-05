import React from 'react';
import Navbar from '../components/Navbar';
import FileUploadForm from '../components/FileUploadForm';
import AnalysisWidget from '../components/AnalysisWidget';
import '../styles/Home.css'; // You may need to create this stylesheet if it doesn't exist

const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="home-container">
        <FileUploadForm />
        <AnalysisWidget />
      </div>
    </div>
  );
};

export default Home;
