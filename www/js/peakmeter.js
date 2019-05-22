//hacked from 
//https://github.com/esonderegger/web-audio-peak-meter/blob/master/index.js
//https://stackoverflow.com/questions/44360301/web-audio-api-creating-a-peak-meter-with-analysernode

var PeakMeter = function (audioNode, div, context) {
    this.analyser = context.createAnalyser();
    this.audioNode = audioNode;
    this.div = div;
    audioNode.connect(this.analyser);

    this.sampleBuffer = new Float32Array(this.analyser.fftSize);

    this.width = div.clientWidth;
    this.height = div.clientHeight;
    this.meterElement = this.createContainerDiv(div);
    
    this.vertical = true; //this.width < this.height;
    this.createRainbow(this.meterElement, this.width, this.height, 0, 0);
    this.channelCount = 1; //this.analyser.channelCount;
    this.channelWidth = this.width / this.channelCount;
    if (!this.vertical) {
      this.channelWidth = this.height / this.channelCount;
    }
    
    this.channelMasks = [];
    this.channelPeaks = []; 
    this.maskSizes = [];
    this.channelLeft = 0;
    
    for (var i = 0; i < this.channelCount; i++) {
      //this.createChannelMask(meterElement, this.channelWidth, 0, 0, 0, false);
      this.channelMasks[i] = this.createChannelMask(this.meterElement, this.channelWidth,
                                          0, this.channelLeft, 0);
      this.channelPeaks[i] = 0.0;

      this.channelLeft += this.channelWidth;
      this.maskSizes[i] = 0;
    }
    
};

PeakMeter.prototype.remove = function () {
    this.div.removeChild(this.meterElement);
    this.audioNode.disconnect(this.analyser);
};


PeakMeter.prototype.options = {
    borderSize: 0,
    fontSize: 9,
    backgroundColor: 'black',
    tickColor: '#ddd',
    gradient: ['red 1%', '#ff0 16%', 'lime 45%', '#080 100%'],
    dbRange: 48,
    dbTickSize: 6,
    maskTransition: '0.1s',
  };



PeakMeter.prototype.createContainerDiv = function(parent) {
    var meterElement = document.createElement('div');
    meterElement.style.position = 'absolute';
    meterElement.style.width = '100%';
    meterElement.style.height = '100%';
    meterElement.style.top = "0px";
    meterElement.style.left = "0px";
    
    //meterElement.style.backgroundColor = "yellow"; //options.backgroundColor;
    parent.appendChild(meterElement);
    return meterElement;
  };

PeakMeter.prototype.createRainbow = function(parent, width, height, top, left) {
    var rainbow = document.createElement('div');
    parent.appendChild(rainbow);
    rainbow.style.width = width + 'px';
    rainbow.style.height = height + 'px';
    rainbow.style.position = 'absolute';
    rainbow.style.top = top + 'px';
    if (this.vertical) {
      rainbow.style.left = left + 'px';
      var gradientStyle = 'linear-gradient(to bottom, ' +
        this.options.gradient.join(', ') + ')';
    } else {
      rainbow.style.left = this.options.borderSize + 'px';
      var gradientStyle = 'linear-gradient(to left, ' +
        this.options.gradient.join(', ') + ')';
    }
    rainbow.style.backgroundImage = gradientStyle;
    return rainbow;
};

PeakMeter.prototype.createChannelMask = function(parent, width, top, left, transition) {
    var channelMask = document.createElement('div');
    parent.appendChild(channelMask);
    channelMask.style.position = 'absolute';
    if (this.vertical) {
      channelMask.style.width = width + 'px';
      channelMask.style.height = this.height + 'px';
      channelMask.style.top = top + 'px';
      channelMask.style.left = left + 'px';
    } else {
      channelMask.style.width = this.width + 'px';
      channelMask.style.height = width + 'px';
      channelMask.style.top = left + 'px';
      channelMask.style.right = this.options.fontSize * 2 + 'px';
    }
    channelMask.style.backgroundColor = this.options.backgroundColor;
    if (transition) {
      if (this.vertical) {
        channelMask.style.transition = 'height ' + this.options.maskTransition;
      } else {
        channelMask.style.transition = 'width ' + this.options.maskTransition;
      }
    }
    return channelMask;
  };

PeakMeter.prototype.maskSize = function(floatVal) {
    var meterDimension = this.vertical ? this.height : this.width;
    if (floatVal === -Infinity) {
        return meterDimension;
    } else {
      var d = this.options.dbRange * -1;
      var returnVal = floatVal * meterDimension / d;
      if (returnVal > meterDimension) {
        return meterDimension;
      } else {
        return returnVal;
      }
    }
  };


PeakMeter.prototype.updateMeter = function () {
 //   console.log(this.analyser)
  this.analyser.getFloatTimeDomainData(this.sampleBuffer);

  // Compute average power over the interval.
  /*let sumOfSquares = 0;
  for (let i = 0; i < this.sampleBuffer.length; i++) {
    sumOfSquares += this.sampleBuffer[i] ** 2;
  }
  const avgPowerDecibels = 10 * Math.log10(sumOfSquares / this.sampleBuffer.length);*/
  
  // Compute peak instantaneous power over the interval.
  let peakInstantaneousPower = 0;
  for (let i = 0; i < this.sampleBuffer.length; i++) {
    const power = this.sampleBuffer[i] ** 2;
    peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
  }
  const peakInstantaneousPowerDecibels = 10 * Math.log10(peakInstantaneousPower);
  
  this.channelMasks[0].style.height = this.maskSize(peakInstantaneousPowerDecibels, this.height) + 'px';
  
};



/*
 * 
        for (var i = 0; i < meter.channelCount; i++) {
          if (meter.vertical) {
            //meter.channelMasks[i].style.height = meter.maskSizes[i] + 'px';
          } else {
            //meter.channelMasks[i].style.width = meter.maskSizes[i] + 'px';
          }
          //channelPeakLabels[i].textContent = textLabels[i];
        }

 */