// App.js
import React, { useState } from 'react';
import { Upload, FileText, PlayCircle } from 'lucide-react';
import TranscriptPlayback from './Page';
import { processTranscriptFromTextFile } from './Transcript'; // Make sure this matches the export

const App = () => {
  const [transcriptData, setTranscriptData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscriptLoaded, setIsTranscriptLoaded] = useState(false);

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();

      reader.onload = async (e) => {
        const content = e.target.result;

        try {
          let data;
          if (type === 'json') {
            data = JSON.parse(content);
          } else if (type === 'txt') {
            // Use the async function to process the text file
            data = await processTranscriptFromTextFile(content); 
          }
          
          setTranscriptData(data);
          setIsTranscriptLoaded(true);
        } catch (error) {
          console.error('Error processing file:', error);
        } finally {
          setIsLoading(false);
        }
      };

      reader.readAsText(file);
    }
  };

  const loadSampleFile = () => {
    setIsLoading(true);
    fetch('src/assets/OutputFiles/Sample3.json')
      .then(response => response.json())
      .then(data => {
        setTranscriptData(data);
        setIsTranscriptLoaded(true);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading sample file:', error);
        setIsLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-indigo-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center cursor-pointer" onClick={()=>window.location.reload()}>Transcript Editor</h1>
          <p className="text-center text-lg mt-2 opacity-80">Streamline your transcript workflow</p>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 py-12">
        {!isTranscriptLoaded ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <UploadBox
              title="Upload Transcript"
              description="Select a JSON transcript file"
              icon={<Upload className="w-12 h-12 text-indigo-500" />}
              accept=".json"
              onChange={(e) => handleFileUpload(e, 'json')}
            />
            <UploadBox
              title="Convert Text File"
              description="Upload a text file to convert"
              icon={<FileText className="w-12 h-12 text-indigo-500" />}
              accept=".txt"
              onChange={(e) => handleFileUpload(e, 'txt')}
            />
            <SampleBox
              title="Use Sample"
              description="Try a pre-loaded transcript"
              icon={<PlayCircle className="w-12 h-12 text-indigo-500" />}
              onClick={loadSampleFile}
            />
          </div>
        ) : (
          <TranscriptPlayback transcript={transcriptData} />
        )}

        {isLoading && <Loader />}
      </main>

      <footer className="bg-gray-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          &copy; 2024 Transcript Editor. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

const UploadBox = ({ title, description, icon, accept, onChange }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 text-center transition-all duration-300 hover:shadow-xl">
    {icon}
    <h2 className="text-2xl font-semibold mt-4 mb-2">{title}</h2>
    <p className="text-gray-600 mb-4">{description}</p>
    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-300">
      <span>Choose File</span>
      <input type="file" className="hidden" accept={accept} onChange={onChange} />
    </label>
  </div>
);

const SampleBox = ({ title, description, icon, onClick }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 text-center transition-all duration-300 hover:shadow-xl">
    {icon}
    <h2 className="text-2xl font-semibold mt-4 mb-2">{title}</h2>
    <p className="text-gray-600 mb-4">{description}</p>
    <button
      onClick={onClick}
      className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors duration-300"
    >
      Load Sample
    </button>
  </div>
);

const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

export default App;
