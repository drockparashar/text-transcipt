// Transcript.js

const generateTimestampsForMultipleSpeakers = (transcript, wordsPerMinute = 150) => {
    const wordsPerSecond = wordsPerMinute / 60;
    const avgDurationPerWord = 1000 / wordsPerSecond; 
    const punctuationPauses = {
      ",": 200,
      ";": 200,
      ".": 500,
      "?": 500,
      "!": 500,
    };
  
    const speakerPause = 800; 
    let currentTime = 0;
    let previousSpeaker = null;
  
    const transcriptWithTimestamps = transcript.map((segment) => {
      const { speaker, text } = segment;
      const words = text.split(" "); 
  
      if (previousSpeaker !== null && previousSpeaker !== speaker) {
        currentTime += speakerPause;
      }
  
      previousSpeaker = speaker; 
  
      const wordTimestamps = words.map((word) => {
        let wordDuration = avgDurationPerWord;
  
        const lastChar = word[word.length - 1];
        if (punctuationPauses[lastChar]) {
          wordDuration += punctuationPauses[lastChar];
        }
  
        const wordData = {
          speaker, 
          text: word,
          start_time: currentTime, 
          duration: wordDuration,
        };
  
        currentTime += wordDuration; 
        return wordData;
      });
  
      return wordTimestamps;
    });
  
    return transcriptWithTimestamps.flat();
  };
  
  export const processTranscriptFromTextFile = async (content) => {
    const lines = content.split('\n');
  
    const transcript = lines
      .map((line) => {
        if (line.includes(':')) {
          const [speaker, text] = line.split(':');
  
          if (speaker && text) {
            return {
              speaker: speaker.trim(),
              text: text.trim(),
            };
          }
        }
        return null; 
      })
      .filter((segment) => segment !== null); 
  
    if (transcript.length === 0) {
      throw new Error('No valid transcript data found in the input file.');
    }
  
    return generateTimestampsForMultipleSpeakers(transcript);
  };
  