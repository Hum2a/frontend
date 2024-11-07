import React from 'react';
import Navbar from '../components/Navbar';
import FileUploadForm from '../components/FileUploadForm';
import AnalysisWidget from '../components/AnalysisWidget';
import OverviewWidget from '../components/OverviewWidget';
import ResponsesWidget from '../components/ResponsesWidget';
import CompareWidget from '../components/CompareWidget';
import '../styles/Home.css'; // You may need to create this stylesheet if it doesn't exist

const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="home-container">
        <FileUploadForm />
      </div>
      <div className='home-container'>
        <AnalysisWidget />
        <OverviewWidget />
        <ResponsesWidget />
      </div>
      <CompareWidget />
    </div>
  );
};

export default Home;
