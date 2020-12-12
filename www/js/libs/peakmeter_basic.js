//hacked from 
//https://github.com/esonderegger/web-audio-peak-meter/blob/master/index.js
//https://stackoverflow.com/questions/44360301/web-audio-api-creating-a-peak-meter-with-analysernode

function BasicPeakMeter (audioNode, div, context) {
    this.analyser = context.createAnalyser();
    this.audioNode = audioNode;
    this.div = div;
    audioNode.connect(this.analyser);

    this.sampleBuffer = new Float32Array(this.analyser.fftSize);

    this.width = div.clientWidth;
    this.height = div.clientHeight;
    
    this.vertical = this.width < this.height;
    this.channelCount = 1; //this.analyser.channelCount;

    this.meterBar = document.createElement("div")
    this.meterBar.style.position = "absolute"
    this.meterBar.style.bottom = "0px"
    this.meterBar.style.width = "100%"
    this.meterBar.style.height = "0px"
    this.meterBar.style.backgroundColor = "green"

    this.div.appendChild(this.meterBar)
};

BasicPeakMeter.prototype.remove = function () {
    this.div.removeChild(this.meterElement);
    this.audioNode.disconnect(this.analyser);
};


BasicPeakMeter.prototype.updateMeter = function () {
  this.height = this.div.clientHeight
  
  // Compute peak instantaneous power over the interval.
  this.analyser.getFloatTimeDomainData(this.sampleBuffer);
  this.peakInstantaneousPower = 0;
  for (this.update_i = 0; this.update_i < this.sampleBuffer.length; this.update_i++) {
    this.peakInstantaneousPower = Math.max(this.sampleBuffer[this.update_i] ** 2, this.peakInstantaneousPower);
  }
  this.peakInstantaneousPowerDecibels = 10 * Math.log10(this.peakInstantaneousPower);
  
  this.meterBar.style.height = this.div.clientHeight - 
    (this.peakInstantaneousPowerDecibels === -Infinity ? 
    this.height : 
    Math.min(this.height, this.peakInstantaneousPowerDecibels * this.height / -48))
    + "px"
  
};
