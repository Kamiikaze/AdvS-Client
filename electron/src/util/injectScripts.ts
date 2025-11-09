export default {
  voe: `

  // Find the first <video> element on the page
  const video = document.querySelector('video');
  
  if (video) {
      // Click the video element
      video.click();
      
      // Optionally, play the video
      video.play().then(() => {
          console.log('Video started playing.');
      }).catch(err => {
          console.error('Error playing video:', err.message);
      });
  
      // Return the video's current state
      video.pause();
      ({ exists: true, paused: video.paused, currentTime: video.currentTime });
  } else {
      // Return an error if no video element is found
      ({ exists: false });
  }
  
  `,
  filemoon: ``,
  vidmoly: ``,
};
