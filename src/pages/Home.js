import React from 'react';
import Navbar from '../components/Navbar';
import FileUploadForm from '../components/FileUploadForm';
import AnalysisWidget from '../components/AnalysisWidget';

const Home = () => {
  return (
    <div>
      <Navbar />
      <FileUploadForm />
      <AnalysisWidget />
    </div>
  );
};

export default Home;
