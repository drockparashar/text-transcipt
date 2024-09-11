import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Download } from 'lucide-react';

const TranscriptPlayback = ({ transcript }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  const [tempText, setTempText] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (transcript && transcript.length > 0) {
      const lastWord = transcript[transcript.length - 1];
      setTotalTime(lastWord.start_time + lastWord.duration);
    }
  }, [transcript]);

  useEffect(() => {
    if (isPlaying && currentTime <= totalTime) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prevTime) => prevTime + 100);
      }, 100);
    } else {
      clearInterval(intervalRef.current);
    }

    if (currentTime > totalTime) {
      setIsPlaying(false);
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isPlaying, currentTime, totalTime]);

  const togglePlayback = () => setIsPlaying(!isPlaying);

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleWordEdit = (index, newText) => {
    const updatedTranscript = [...transcript];
    updatedTranscript[index].text = newText;
    setEditingWord(null);
  };

  const startEditing = (index) => {
    setEditingWord(index);
    setTempText(transcript[index].text);
    setIsPlaying(false);
  };

  const saveEdit = (index) => handleWordEdit(index, tempText);

  const groupBySpeaker = () => {
    const grouped = [];
    let currentSpeaker = transcript[0].speaker;
    let sentence = [];

    transcript.forEach((word, index) => {
      if (word.speaker === currentSpeaker) {
        sentence.push({ ...word, index });
      } else {
        grouped.push({ speaker: currentSpeaker, words: sentence });
        currentSpeaker = word.speaker;
        sentence = [{ ...word, index }];
      }
    });

    grouped.push({ speaker: currentSpeaker, words: sentence });

    return grouped;
  };

  const groupedTranscript = groupBySpeaker();

  const downloadTranscript = () => {
    const blob = new Blob([JSON.stringify(transcript, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transcript.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayback}
            className="p-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-colors duration-300"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button
            onClick={() => setCurrentTime(0)}
            className="p-2 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors duration-300"
          >
            <RotateCcw size={24} />
          </button>

          <button
            onClick={downloadTranscript}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-300"
          >
            <Download size={24} />
          </button>
        </div>

        <div className="text-2xl font-bold text-gray-700">{formatTime(currentTime)}</div>
      </div>

      <div className="space-y-4">
        {groupedTranscript.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-gray-50 rounded-lg p-4">
            <span className="font-bold text-indigo-600 mb-2 block">{group.speaker}</span>
            <div className="space-x-1">
              {group.words.map((word) => (
                <span
                  key={word.index}
                  className={`inline-block p-1 rounded cursor-pointer transition-colors duration-300 ${
                    currentTime >= word.start_time &&
                    currentTime < word.start_time + word.duration
                      ? 'bg-indigo-500 text-white'
                      : 'hover:bg-indigo-100 text-gray-500'
                  }`}
                  onClick={() => startEditing(word.index)}
                >
                  {editingWord === word.index ? (
                    <input
                      type="text"
                      value={tempText}
                      onChange={(e) => setTempText(e.target.value)}
                      onBlur={() => {
                        saveEdit(word.index);
                        setIsPlaying(true);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          saveEdit(word.index);
                          setIsPlaying(true);
                        }
                      }}
                      autoFocus
                      className="w-auto inline-block p-1 border border-indigo-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                  ) : (
                    word.text
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranscriptPlayback;