(function(){var userContext,userInstance,pipe=function(param,val){param.value=val},Super=Object.create(null,{activate:{writable:true,value:function(doActivate){if(doActivate){this.input.disconnect();this.input.connect(this.activateNode);if(this.activateCallback){this.activateCallback(doActivate)}}else{this.input.disconnect();this.input.connect(this.output)}}},bypass:{get:function(){return this._bypass},set:function(value){if(this._lastBypassValue===value){return}this._bypass=value;this.activate(!value);this._lastBypassValue=value}},connect:{value:function(target){this.output.connect(target)}},disconnect:{value:function(target){this.output.disconnect(target)}},connectInOrder:{value:function(nodeArray){var i=nodeArray.length-1;while(i--){if(!nodeArray[i].connect){return console.error("AudioNode.connectInOrder: TypeError: Not an AudioNode.",nodeArray[i])}if(nodeArray[i+1].input){nodeArray[i].connect(nodeArray[i+1].input)}else{nodeArray[i].connect(nodeArray[i+1])}}}},getDefaults:{value:function(){var result={};for(var key in this.defaults){result[key]=this.defaults[key].value}return result}},automate:{value:function(property,value,duration,startTime){var start=startTime?~~(startTime/1e3):userContext.currentTime,dur=duration?~~(duration/1e3):0,_is=this.defaults[property],param=this[property],method;if(param){if(_is.automatable){if(!duration){method="setValueAtTime"}else{method="linearRampToValueAtTime";param.cancelScheduledValues(start);param.setValueAtTime(param.value,start)}param[method](value,dur+start)}else{param=value}}else{console.error("Invalid Property for "+this.name)}}}}),FLOAT="float",BOOLEAN="boolean",STRING="string",INT="int";if(typeof module!=="undefined"&&module.exports){module.exports=Tuna}else if(typeof define==="function"){window.define("Tuna",definition)}else{window.Tuna=Tuna}function definition(){return Tuna}function Tuna(context){if(!(this instanceof Tuna)){return new Tuna(context)}var _window=typeof window==="undefined"?{}:window;if(!_window.AudioContext){_window.AudioContext=_window.webkitAudioContext}if(!context){console.log("tuna.js: Missing audio context! Creating a new context for you.");context=_window.AudioContext&&new _window.AudioContext}if(!context){throw new Error("Tuna cannot initialize because this environment does not support web audio.")}connectify(context);userContext=context;userInstance=this}function connectify(context){if(context.__connectified__===true)return;var gain=context.createGain(),proto=Object.getPrototypeOf(Object.getPrototypeOf(gain)),oconnect=proto.connect;proto.connect=shimConnect;context.__connectified__=true;function shimConnect(){var node=arguments[0];arguments[0]=Super.isPrototypeOf?Super.isPrototypeOf(node)?node.input:node:node.input||node;oconnect.apply(this,arguments);return node}}function dbToWAVolume(db){return Math.max(0,Math.round(100*Math.pow(2,db/6))/100)}function fmod(x,y){var tmp,tmp2,p=0,pY=0,l=0,l2=0;tmp=x.toExponential().match(/^.\.?(.*)e(.+)$/);p=parseInt(tmp[2],10)-(tmp[1]+"").length;tmp=y.toExponential().match(/^.\.?(.*)e(.+)$/);pY=parseInt(tmp[2],10)-(tmp[1]+"").length;if(pY>p){p=pY}tmp2=x%y;if(p<-100||p>20){l=Math.round(Math.log(tmp2)/Math.log(10));l2=Math.pow(10,l);return(tmp2/l2).toFixed(l-p)*l2}else{return parseFloat(tmp2.toFixed(-p))}}function sign(x){if(x===0){return 1}else{return Math.abs(x)/x}}function tanh(n){return(Math.exp(n)-Math.exp(-n))/(Math.exp(n)+Math.exp(-n))}function initValue(userVal,defaultVal){return userVal===undefined?defaultVal:userVal}Tuna.prototype.Bitcrusher=function(properties){if(!properties){properties=this.getDefaults()}this.bufferSize=properties.bufferSize||this.defaults.bufferSize.value;this.input=userContext.createGain();this.activateNode=userContext.createGain();this.processor=userContext.createScriptProcessor(this.bufferSize,1,1);this.output=userContext.createGain();this.activateNode.connect(this.processor);this.processor.connect(this.output);var phaser=0,last=0,input,output,step,i,length;this.processor.onaudioprocess=function(e){input=e.inputBuffer.getChannelData(0),output=e.outputBuffer.getChannelData(0),step=Math.pow(1/2,this.bits);length=input.length;for(i=0;i<length;i++){phaser+=this.normfreq;if(phaser>=1){phaser-=1;last=step*Math.floor(input[i]/step+.5)}output[i]=last}};this.bits=properties.bits||this.defaults.bits.value;this.normfreq=initValue(properties.normfreq,this.defaults.normfreq.value);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Bitcrusher.prototype=Object.create(Super,{name:{value:"Bitcrusher"},defaults:{writable:true,value:{bits:{value:4,min:1,max:16,automatable:false,type:INT},bufferSize:{value:4096,min:256,max:16384,automatable:false,type:INT},bypass:{value:false,automatable:false,type:BOOLEAN},normfreq:{value:.1,min:1e-4,max:1,automatable:false,type:FLOAT}}},bits:{enumerable:true,get:function(){return this.processor.bits},set:function(value){this.processor.bits=value}},normfreq:{enumerable:true,get:function(){return this.processor.normfreq},set:function(value){this.processor.normfreq=value}}});Tuna.prototype.Cabinet=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.activateNode=userContext.createGain();this.convolver=this.newConvolver(properties.impulsePath||"../impulses/impulse_guitar.wav");this.makeupNode=userContext.createGain();this.output=userContext.createGain();this.activateNode.connect(this.convolver.input);this.convolver.output.connect(this.makeupNode);this.makeupNode.connect(this.output);this.makeupGain=initValue(properties.makeupGain,this.defaults.makeupGain.value);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Cabinet.prototype=Object.create(Super,{name:{value:"Cabinet"},defaults:{writable:true,value:{makeupGain:{value:1,min:0,max:20,automatable:true,type:FLOAT},bypass:{value:false,automatable:false,type:BOOLEAN}}},makeupGain:{enumerable:true,get:function(){return this.makeupNode.gain},set:function(value){this.makeupNode.gain.value=value}},newConvolver:{value:function(impulsePath){return new userInstance.Convolver({impulse:impulsePath,dryLevel:0,wetLevel:1})}}});Tuna.prototype.Chorus=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.attenuator=this.activateNode=userContext.createGain();this.splitter=userContext.createChannelSplitter(2);this.delayL=userContext.createDelay();this.delayR=userContext.createDelay();this.feedbackGainNodeLR=userContext.createGain();this.feedbackGainNodeRL=userContext.createGain();this.merger=userContext.createChannelMerger(2);this.output=userContext.createGain();this.lfoL=new userInstance.LFO({target:this.delayL.delayTime,callback:pipe});this.lfoR=new userInstance.LFO({target:this.delayR.delayTime,callback:pipe});this.input.connect(this.attenuator);this.attenuator.connect(this.output);this.attenuator.connect(this.splitter);this.splitter.connect(this.delayL,0);this.splitter.connect(this.delayR,1);this.delayL.connect(this.feedbackGainNodeLR);this.delayR.connect(this.feedbackGainNodeRL);this.feedbackGainNodeLR.connect(this.delayR);this.feedbackGainNodeRL.connect(this.delayL);this.delayL.connect(this.merger,0,0);this.delayR.connect(this.merger,0,1);this.merger.connect(this.output);this.feedback=initValue(properties.feedback,this.defaults.feedback.value);this.rate=initValue(properties.rate,this.defaults.rate.value);this.delay=initValue(properties.delay,this.defaults.delay.value);this.depth=initValue(properties.depth,this.defaults.depth.value);this.lfoR.phase=Math.PI/2;this.attenuator.gain.value=.6934;this.lfoL.activate(true);this.lfoR.activate(true);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Chorus.prototype=Object.create(Super,{name:{value:"Chorus"},defaults:{writable:true,value:{feedback:{value:.4,min:0,max:.95,automatable:false,type:FLOAT},delay:{value:.0045,min:0,max:1,automatable:false,type:FLOAT},depth:{value:.7,min:0,max:1,automatable:false,type:FLOAT},rate:{value:1.5,min:0,max:8,automatable:false,type:FLOAT},bypass:{value:false,automatable:false,type:BOOLEAN}}},delay:{enumerable:true,get:function(){return this._delay},set:function(value){this._delay=2e-4*(Math.pow(10,value)*2);this.lfoL.offset=this._delay;this.lfoR.offset=this._delay;this._depth=this._depth}},depth:{enumerable:true,get:function(){return this._depth},set:function(value){this._depth=value;this.lfoL.oscillation=this._depth*this._delay;this.lfoR.oscillation=this._depth*this._delay}},feedback:{enumerable:true,get:function(){return this._feedback},set:function(value){this._feedback=value;this.feedbackGainNodeLR.gain.value=this._feedback;this.feedbackGainNodeRL.gain.value=this._feedback}},rate:{enumerable:true,get:function(){return this._rate},set:function(value){this._rate=value;this.lfoL.frequency=this._rate;this.lfoR.frequency=this._rate}}});Tuna.prototype.Compressor=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.compNode=this.activateNode=userContext.createDynamicsCompressor();this.makeupNode=userContext.createGain();this.output=userContext.createGain();this.compNode.connect(this.makeupNode);this.makeupNode.connect(this.output);this.automakeup=initValue(properties.automakeup,this.defaults.automakeup.value);this.makeupGain=initValue(properties.makeupGain,this.defaults.makeupGain.value);this.threshold=initValue(properties.threshold,this.defaults.threshold.value);this.release=initValue(properties.release,this.defaults.release.value);this.attack=initValue(properties.attack,this.defaults.attack.value);this.ratio=properties.ratio||this.defaults.ratio.value;this.knee=initValue(properties.knee,this.defaults.knee.value);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Compressor.prototype=Object.create(Super,{name:{value:"Compressor"},defaults:{writable:true,value:{threshold:{value:-20,min:-60,max:0,automatable:true,type:FLOAT},release:{value:250,min:10,max:2e3,automatable:true,type:FLOAT},makeupGain:{value:1,min:1,max:100,automatable:true,type:FLOAT},attack:{value:1,min:0,max:1e3,automatable:true,type:FLOAT},ratio:{value:4,min:1,max:50,automatable:true,type:FLOAT},knee:{value:5,min:0,max:40,automatable:true,type:FLOAT},automakeup:{value:false,automatable:false,type:BOOLEAN},bypass:{value:false,automatable:false,type:BOOLEAN}}},computeMakeup:{value:function(){var magicCoefficient=4,c=this.compNode;return-(c.threshold.value-c.threshold.value/c.ratio.value)/magicCoefficient}},automakeup:{enumerable:true,get:function(){return this._automakeup},set:function(value){this._automakeup=value;if(this._automakeup)this.makeupGain=this.computeMakeup()}},threshold:{enumerable:true,get:function(){return this.compNode.threshold},set:function(value){this.compNode.threshold.value=value;if(this._automakeup)this.makeupGain=this.computeMakeup()}},ratio:{enumerable:true,get:function(){return this.compNode.ratio},set:function(value){this.compNode.ratio.value=value;if(this._automakeup)this.makeupGain=this.computeMakeup()}},knee:{enumerable:true,get:function(){return this.compNode.knee},set:function(value){this.compNode.knee.value=value;if(this._automakeup)this.makeupGain=this.computeMakeup()}},attack:{enumerable:true,get:function(){return this.compNode.attack},set:function(value){this.compNode.attack.value=value/1e3}},release:{enumerable:true,get:function(){return this.compNode.release},set:function(value){this.compNode.release.value=value/1e3}},makeupGain:{enumerable:true,get:function(){return this.makeupNode.gain},set:function(value){this.makeupNode.gain.value=dbToWAVolume(value)}}});Tuna.prototype.Convolver=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.activateNode=userContext.createGain();this.convolver=userContext.createConvolver();this.dry=userContext.createGain();this.filterLow=userContext.createBiquadFilter();this.filterHigh=userContext.createBiquadFilter();this.wet=userContext.createGain();this.output=userContext.createGain();this.activateNode.connect(this.filterLow);this.activateNode.connect(this.dry);this.filterLow.connect(this.filterHigh);this.filterHigh.connect(this.convolver);this.convolver.connect(this.wet);this.wet.connect(this.output);this.dry.connect(this.output);this.dryLevel=initValue(properties.dryLevel,this.defaults.dryLevel.value);this.wetLevel=initValue(properties.wetLevel,this.defaults.wetLevel.value);this.highCut=properties.highCut||this.defaults.highCut.value;this.buffer=properties.impulse||"../impulses/ir_rev_short.wav";this.lowCut=properties.lowCut||this.defaults.lowCut.value;this.level=initValue(properties.level,this.defaults.level.value);this.filterHigh.type="lowpass";this.filterLow.type="highpass";this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Convolver.prototype=Object.create(Super,{name:{value:"Convolver"},defaults:{writable:true,value:{highCut:{value:22050,min:20,max:22050,automatable:true,type:FLOAT},lowCut:{value:20,min:20,max:22050,automatable:true,type:FLOAT},dryLevel:{value:1,min:0,max:1,automatable:true,type:FLOAT},wetLevel:{value:1,min:0,max:1,automatable:true,type:FLOAT},level:{value:1,min:0,max:1,automatable:true,type:FLOAT},bypass:{value:false,automatable:false,type:BOOLEAN}}},lowCut:{get:function(){return this.filterLow.frequency},set:function(value){this.filterLow.frequency.value=value}},highCut:{get:function(){return this.filterHigh.frequency},set:function(value){this.filterHigh.frequency.value=value}},level:{get:function(){return this.output.gain},set:function(value){this.output.gain.value=value}},dryLevel:{get:function(){return this.dry.gain},set:function(value){this.dry.gain.value=value}},wetLevel:{get:function(){return this.wet.gain},set:function(value){this.wet.gain.value=value}},buffer:{enumerable:false,get:function(){return this.convolver.buffer},set:function(impulse){var convolver=this.convolver,xhr=new XMLHttpRequest;if(!impulse){console.log("Tuna.Convolver.setBuffer: Missing impulse path!");return}xhr.open("GET",impulse,true);xhr.responseType="arraybuffer";xhr.onreadystatechange=function(){if(xhr.readyState===4){if(xhr.status<300&&xhr.status>199||xhr.status===302){userContext.decodeAudioData(xhr.response,function(buffer){convolver.buffer=buffer},function(e){if(e)console.log("Tuna.Convolver.setBuffer: Error decoding data"+e)})}}};xhr.send(null)}}});Tuna.prototype.Delay=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.activateNode=userContext.createGain();this.dry=userContext.createGain();this.wet=userContext.createGain();this.filter=userContext.createBiquadFilter();this.delay=userContext.createDelay(10);this.feedbackNode=userContext.createGain();this.output=userContext.createGain();this.activateNode.connect(this.delay);this.activateNode.connect(this.dry);this.delay.connect(this.filter);this.filter.connect(this.feedbackNode);this.feedbackNode.connect(this.delay);this.feedbackNode.connect(this.wet);this.wet.connect(this.output);this.dry.connect(this.output);this.delayTime=properties.delayTime||this.defaults.delayTime.value;this.feedback=initValue(properties.feedback,this.defaults.feedback.value);this.wetLevel=initValue(properties.wetLevel,this.defaults.wetLevel.value);this.dryLevel=initValue(properties.dryLevel,this.defaults.dryLevel.value);this.cutoff=properties.cutoff||this.defaults.cutoff.value;this.filter.type="lowpass";this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Delay.prototype=Object.create(Super,{name:{value:"Delay"},defaults:{writable:true,value:{delayTime:{value:100,min:20,max:1e3,automatable:false,type:FLOAT},feedback:{value:.45,min:0,max:.9,automatable:true,type:FLOAT},cutoff:{value:2e4,min:20,max:2e4,automatable:true,type:FLOAT},wetLevel:{value:.5,min:0,max:1,automatable:true,type:FLOAT},dryLevel:{value:1,min:0,max:1,automatable:true,type:FLOAT},bypass:{value:false,automatable:false,type:BOOLEAN}}},delayTime:{enumerable:true,get:function(){return this.delay.delayTime},set:function(value){this.delay.delayTime.value=value/1e3}},wetLevel:{enumerable:true,get:function(){return this.wet.gain},set:function(value){this.wet.gain.value=value}},dryLevel:{enumerable:true,get:function(){return this.dry.gain},set:function(value){this.dry.gain.value=value}},feedback:{enumerable:true,get:function(){return this.feedbackNode.gain},set:function(value){this.feedbackNode.gain.value=value}},cutoff:{enumerable:true,get:function(){return this.filter.frequency},set:function(value){this.filter.frequency.value=value}}});Tuna.prototype.Filter=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.activateNode=userContext.createGain();this.filter=userContext.createBiquadFilter();this.output=userContext.createGain();this.activateNode.connect(this.filter);this.filter.connect(this.output);this.frequency=properties.frequency||this.defaults.frequency.value;this.Q=properties.resonance||this.defaults.Q.value;this.filterType=initValue(properties.filterType,this.defaults.filterType.value);this.gain=initValue(properties.gain,this.defaults.gain.value);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Filter.prototype=Object.create(Super,{name:{value:"Filter"},defaults:{writable:true,value:{frequency:{value:800,min:20,max:22050,automatable:true,type:FLOAT},Q:{value:1,min:.001,max:100,automatable:true,type:FLOAT},gain:{value:0,min:-40,max:40,automatable:true,type:FLOAT},bypass:{value:false,automatable:false,type:BOOLEAN},filterType:{value:"lowpass",automatable:false,type:STRING}}},filterType:{enumerable:true,get:function(){return this.filter.type},set:function(value){this.filter.type=value}},Q:{enumerable:true,get:function(){return this.filter.Q},set:function(value){this.filter.Q.value=value}},gain:{enumerable:true,get:function(){return this.filter.gain},set:function(value){this.filter.gain.value=value}},frequency:{enumerable:true,get:function(){return this.filter.frequency},set:function(value){this.filter.frequency.value=value}}});Tuna.prototype.Gain=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.activateNode=userContext.createGain();this.gainNode=userContext.createGain();this.output=userContext.createGain();this.activateNode.connect(this.gainNode);this.gainNode.connect(this.output);this.gain=initValue(properties.gain,this.defaults.gain.value);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Gain.prototype=Object.create(Super,{name:{value:"Gain"},defaults:{writable:true,value:{bypass:{value:false,automatable:false,type:BOOLEAN},gain:{value:1,automatable:true,type:FLOAT}}},gain:{enumerable:true,get:function(){return this.gainNode.gain},set:function(value){this.gainNode.gain.value=value}}});Tuna.prototype.MoogFilter=function(properties){if(!properties){properties=this.getDefaults()}this.bufferSize=properties.bufferSize||this.defaults.bufferSize.value;this.input=userContext.createGain();this.activateNode=userContext.createGain();this.processor=userContext.createScriptProcessor(this.bufferSize,1,1);this.output=userContext.createGain();this.activateNode.connect(this.processor);this.processor.connect(this.output);var in1,in2,in3,in4,out1,out2,out3,out4;in1=in2=in3=in4=out1=out2=out3=out4=0;var input,output,f,fb,i,length,inputFactor;this.processor.onaudioprocess=function(e){input=e.inputBuffer.getChannelData(0),output=e.outputBuffer.getChannelData(0),f=this.cutoff*1.16,inputFactor=.35013*(f*f)*(f*f);fb=this.resonance*(1-.15*f*f);length=input.length;for(i=0;i<length;i++){input[i]-=out4*fb;input[i]*=inputFactor;out1=input[i]+.3*in1+(1-f)*out1;in1=input[i];out2=out1+.3*in2+(1-f)*out2;in2=out1;out3=out2+.3*in3+(1-f)*out3;in3=out2;out4=out3+.3*in4+(1-f)*out4;in4=out3;output[i]=out4}};this.cutoff=initValue(properties.cutoff,this.defaults.cutoff.value);this.resonance=initValue(properties.resonance,this.defaults.resonance.value);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.MoogFilter.prototype=Object.create(Super,{name:{value:"MoogFilter"},defaults:{writable:true,value:{bufferSize:{value:4096,min:256,max:16384,automatable:false,type:INT},bypass:{value:false,automatable:false,type:BOOLEAN},cutoff:{value:.065,min:1e-4,max:1,automatable:false,type:FLOAT},resonance:{value:3.5,min:0,max:4,automatable:false,type:FLOAT}}},cutoff:{enumerable:true,get:function(){return this.processor.cutoff},set:function(value){this.processor.cutoff=value}},resonance:{enumerable:true,get:function(){return this.processor.resonance},set:function(value){this.processor.resonance=value}}});Tuna.prototype.Overdrive=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.activateNode=userContext.createGain();this.inputDrive=userContext.createGain();this.waveshaper=userContext.createWaveShaper();this.outputDrive=userContext.createGain();this.output=userContext.createGain();this.activateNode.connect(this.inputDrive);this.inputDrive.connect(this.waveshaper);this.waveshaper.connect(this.outputDrive);this.outputDrive.connect(this.output);this.ws_table=new Float32Array(this.k_nSamples);this.drive=initValue(properties.drive,this.defaults.drive.value);this.outputGain=initValue(properties.outputGain,this.defaults.outputGain.value);this.curveAmount=initValue(properties.curveAmount,this.defaults.curveAmount.value);this.algorithmIndex=initValue(properties.algorithmIndex,this.defaults.algorithmIndex.value);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Overdrive.prototype=Object.create(Super,{name:{value:"Overdrive"},defaults:{writable:true,value:{drive:{value:1,min:0,max:1,automatable:true,type:FLOAT,scaled:true},outputGain:{value:1,min:0,max:1,automatable:true,type:FLOAT,scaled:true},curveAmount:{value:.725,min:0,max:1,automatable:false,type:FLOAT},algorithmIndex:{value:0,min:0,max:5,automatable:false,type:INT},bypass:{value:false,automatable:false,type:BOOLEAN}}},k_nSamples:{value:8192},drive:{get:function(){return this.inputDrive.gain},set:function(value){this._drive=value}},curveAmount:{get:function(){return this._curveAmount},set:function(value){this._curveAmount=value;if(this._algorithmIndex===undefined){this._algorithmIndex=0}this.waveshaperAlgorithms[this._algorithmIndex](this._curveAmount,this.k_nSamples,this.ws_table);this.waveshaper.curve=this.ws_table}},outputGain:{get:function(){return this.outputDrive.gain},set:function(value){this._outputGain=dbToWAVolume(value)}},algorithmIndex:{get:function(){return this._algorithmIndex},set:function(value){this._algorithmIndex=value;this.curveAmount=this._curveAmount}},waveshaperAlgorithms:{value:[function(amount,n_samples,ws_table){amount=Math.min(amount,.9999);var k=2*amount/(1-amount),i,x;for(i=0;i<n_samples;i++){x=i*2/n_samples-1;ws_table[i]=(1+k)*x/(1+k*Math.abs(x))}},function(amount,n_samples,ws_table){var i,x,y;for(i=0;i<n_samples;i++){x=i*2/n_samples-1;y=(.5*Math.pow(x+1.4,2)-1)*y>=0?5.8:1.2;ws_table[i]=tanh(y)}},function(amount,n_samples,ws_table){var i,x,y,a=1-amount;for(i=0;i<n_samples;i++){x=i*2/n_samples-1;y=x<0?-Math.pow(Math.abs(x),a+.04):Math.pow(x,a);ws_table[i]=tanh(y*2)}},function(amount,n_samples,ws_table){var i,x,y,abx,a=1-amount>.99?.99:1-amount;for(i=0;i<n_samples;i++){x=i*2/n_samples-1;abx=Math.abs(x);if(abx<a)y=abx;else if(abx>a)y=a+(abx-a)/(1+Math.pow((abx-a)/(1-a),2));else if(abx>1)y=abx;ws_table[i]=sign(x)*y*(1/((a+1)/2))}},function(amount,n_samples,ws_table){var i,x;for(i=0;i<n_samples;i++){x=i*2/n_samples-1;if(x<-.08905){ws_table[i]=-3/4*(1-Math.pow(1-(Math.abs(x)-.032857),12)+1/3*(Math.abs(x)-.032847))+.01}else if(x>=-.08905&&x<.320018){ws_table[i]=-6.153*(x*x)+3.9375*x}else{ws_table[i]=.630035}}},function(amount,n_samples,ws_table){var a=2+Math.round(amount*14),bits=Math.round(Math.pow(2,a-1)),i,x;for(i=0;i<n_samples;i++){x=i*2/n_samples-1;ws_table[i]=Math.round(x*bits)/bits}}]}});Tuna.prototype.Panner=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.activateNode=userContext.createGain();this.panner=userContext.createStereoPanner();this.output=userContext.createGain();this.activateNode.connect(this.panner);this.panner.connect(this.output);this.pan=initValue(properties.pan,this.defaults.pan.value);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Panner.prototype=Object.create(Super,{name:{value:"Panner"},defaults:{writable:true,value:{bypass:{value:false,automatable:false,type:BOOLEAN},pan:{value:0,min:-1,max:1,automatable:true,type:FLOAT}}},pan:{enumerable:true,get:function(){return this.panner.pan},set:function(value){this.panner.pan.value=value}}});Tuna.prototype.Phaser=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.splitter=this.activateNode=userContext.createChannelSplitter(2);this.filtersL=[];this.filtersR=[];this.feedbackGainNodeL=userContext.createGain();this.feedbackGainNodeR=userContext.createGain();this.merger=userContext.createChannelMerger(2);this.filteredSignal=userContext.createGain();this.output=userContext.createGain();this.lfoL=new userInstance.LFO({target:this.filtersL,callback:this.callback});this.lfoR=new userInstance.LFO({target:this.filtersR,callback:this.callback});var i=this.stage;while(i--){this.filtersL[i]=userContext.createBiquadFilter();this.filtersR[i]=userContext.createBiquadFilter();this.filtersL[i].type="allpass";this.filtersR[i].type="allpass"}this.input.connect(this.splitter);this.input.connect(this.output);this.splitter.connect(this.filtersL[0],0,0);this.splitter.connect(this.filtersR[0],1,0);this.connectInOrder(this.filtersL);this.connectInOrder(this.filtersR);this.filtersL[this.stage-1].connect(this.feedbackGainNodeL);this.filtersL[this.stage-1].connect(this.merger,0,0);this.filtersR[this.stage-1].connect(this.feedbackGainNodeR);this.filtersR[this.stage-1].connect(this.merger,0,1);this.feedbackGainNodeL.connect(this.filtersL[0]);this.feedbackGainNodeR.connect(this.filtersR[0]);this.merger.connect(this.output);this.rate=initValue(properties.rate,this.defaults.rate.value);this.baseModulationFrequency=properties.baseModulationFrequency||this.defaults.baseModulationFrequency.value;this.depth=initValue(properties.depth,this.defaults.depth.value);this.feedback=initValue(properties.feedback,this.defaults.feedback.value);this.stereoPhase=initValue(properties.stereoPhase,this.defaults.stereoPhase.value);this.lfoL.activate(true);this.lfoR.activate(true);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Phaser.prototype=Object.create(Super,{name:{value:"Phaser"},stage:{value:4},defaults:{writable:true,value:{rate:{value:.1,min:0,max:8,automatable:false,type:FLOAT},depth:{value:.6,min:0,max:1,automatable:false,type:FLOAT},feedback:{value:.7,min:0,max:1,automatable:false,type:FLOAT},stereoPhase:{value:40,min:0,max:180,automatable:false,type:FLOAT},baseModulationFrequency:{value:700,min:500,max:1500,automatable:false,type:FLOAT},bypass:{value:false,automatable:false,type:BOOLEAN}}},callback:{value:function(filters,value){for(var stage=0;stage<4;stage++){filters[stage].frequency.value=value}}},depth:{get:function(){return this._depth},set:function(value){this._depth=value;this.lfoL.oscillation=this._baseModulationFrequency*this._depth;this.lfoR.oscillation=this._baseModulationFrequency*this._depth}},rate:{get:function(){return this._rate},set:function(value){this._rate=value;this.lfoL.frequency=this._rate;this.lfoR.frequency=this._rate}},baseModulationFrequency:{enumerable:true,get:function(){return this._baseModulationFrequency},set:function(value){this._baseModulationFrequency=value;this.lfoL.offset=this._baseModulationFrequency;this.lfoR.offset=this._baseModulationFrequency;this._depth=this._depth}},feedback:{get:function(){return this._feedback},set:function(value){this._feedback=value;this.feedbackGainNodeL.gain.value=this._feedback;this.feedbackGainNodeR.gain.value=this._feedback}},stereoPhase:{get:function(){return this._stereoPhase},set:function(value){this._stereoPhase=value;var newPhase=this.lfoL._phase+this._stereoPhase*Math.PI/180;newPhase=fmod(newPhase,2*Math.PI);this.lfoR._phase=newPhase}}});Tuna.prototype.PingPongDelay=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.wet=userContext.createGain();this.stereoToMonoMix=userContext.createGain();this.feedbackLevel=userContext.createGain();this.output=userContext.createGain();this.delayLeft=userContext.createDelay(10);this.delayRight=userContext.createDelay(10);this.activateNode=userContext.createGain();this.splitter=userContext.createChannelSplitter(2);this.merger=userContext.createChannelMerger(2);this.activateNode.connect(this.splitter);this.splitter.connect(this.stereoToMonoMix,0,0);this.splitter.connect(this.stereoToMonoMix,1,0);this.stereoToMonoMix.gain.value=.5;this.stereoToMonoMix.connect(this.wet);this.wet.connect(this.delayLeft);this.feedbackLevel.connect(this.wet);this.delayLeft.connect(this.delayRight);this.delayRight.connect(this.feedbackLevel);this.delayLeft.connect(this.merger,0,0);this.delayRight.connect(this.merger,0,1);this.merger.connect(this.output);this.activateNode.connect(this.output);this.delayTimeLeft=properties.delayTimeLeft!==undefined?properties.delayTimeLeft:this.defaults.delayTimeLeft.value;this.delayTimeRight=properties.delayTimeRight!==undefined?properties.delayTimeRight:this.defaults.delayTimeRight.value;this.feedbackLevel.gain.value=properties.feedback!==undefined?properties.feedback:this.defaults.feedback.value;this.wet.gain.value=properties.wetLevel!==undefined?properties.wetLevel:this.defaults.wetLevel.value;this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.PingPongDelay.prototype=Object.create(Super,{name:{value:"PingPongDelay"},delayTimeLeft:{enumerable:true,get:function(){return this._delayTimeLeft},set:function(value){this._delayTimeLeft=value;this.delayLeft.delayTime.value=value/1e3}},delayTimeRight:{enumerable:true,get:function(){return this._delayTimeRight},set:function(value){this._delayTimeRight=value;this.delayRight.delayTime.value=value/1e3}},wetLevel:{enumerable:true,get:function(){return this.wet.gain},set:function(value){this.wet.gain.value=value}},feedback:{enumerable:true,get:function(){return this.feedbackLevel.gain},set:function(value){this.feedbackLevel.gain.value=value}},defaults:{writable:true,value:{delayTimeLeft:{value:200,min:1,max:1e4,automatable:false,type:INT},delayTimeRight:{value:400,min:1,max:1e4,automatable:false,type:INT},feedback:{value:.3,min:0,max:1,automatable:false,type:FLOAT},wetLevel:{value:.5,min:0,max:1,automatable:false,type:FLOAT},bypass:{value:false,automatable:false,type:BOOLEAN}}}});Tuna.prototype.Tremolo=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.splitter=this.activateNode=userContext.createChannelSplitter(2),this.amplitudeL=userContext.createGain(),this.amplitudeR=userContext.createGain(),this.merger=userContext.createChannelMerger(2),this.output=userContext.createGain();this.lfoL=new userInstance.LFO({target:this.amplitudeL.gain,callback:pipe});this.lfoR=new userInstance.LFO({target:this.amplitudeR.gain,callback:pipe});this.input.connect(this.splitter);this.splitter.connect(this.amplitudeL,0);this.splitter.connect(this.amplitudeR,1);this.amplitudeL.connect(this.merger,0,0);this.amplitudeR.connect(this.merger,0,1);this.merger.connect(this.output);this.rate=properties.rate||this.defaults.rate.value;this.intensity=initValue(properties.intensity,this.defaults.intensity.value);this.stereoPhase=initValue(properties.stereoPhase,this.defaults.stereoPhase.value);this.lfoL.offset=1-this.intensity/2;this.lfoR.offset=1-this.intensity/2;this.lfoL.phase=this.stereoPhase*Math.PI/180;this.lfoL.activate(true);this.lfoR.activate(true);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.Tremolo.prototype=Object.create(Super,{name:{value:"Tremolo"},defaults:{writable:true,value:{intensity:{value:.3,min:0,max:1,automatable:false,type:FLOAT},stereoPhase:{value:0,min:0,max:180,automatable:false,type:FLOAT},rate:{value:5,min:.1,max:11,automatable:false,type:FLOAT},bypass:{value:false,automatable:false,type:BOOLEAN}}},intensity:{enumerable:true,get:function(){return this._intensity},set:function(value){this._intensity=value;this.lfoL.offset=1-this._intensity/2;this.lfoR.offset=1-this._intensity/2;this.lfoL.oscillation=this._intensity;this.lfoR.oscillation=this._intensity}},rate:{enumerable:true,get:function(){return this._rate},set:function(value){this._rate=value;this.lfoL.frequency=this._rate;this.lfoR.frequency=this._rate}},stereoPhase:{enumerable:true,get:function(){return this._stereoPhase},set:function(value){this._stereoPhase=value;var newPhase=this.lfoL._phase+this._stereoPhase*Math.PI/180;newPhase=fmod(newPhase,2*Math.PI);this.lfoR.phase=newPhase}}});Tuna.prototype.WahWah=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.activateNode=userContext.createGain();this.envelopeFollower=new userInstance.EnvelopeFollower({target:this,callback:function(context,value){context.sweep=value}});this.filterBp=userContext.createBiquadFilter();this.filterPeaking=userContext.createBiquadFilter();this.output=userContext.createGain();this.activateNode.connect(this.filterBp);this.filterBp.connect(this.filterPeaking);this.filterPeaking.connect(this.output);this.init();this.automode=initValue(properties.automode,this.defaults.automode.value);this.resonance=properties.resonance||this.defaults.resonance.value;this.sensitivity=initValue(properties.sensitivity,this.defaults.sensitivity.value);this.baseFrequency=initValue(properties.baseFrequency,this.defaults.baseFrequency.value);this.excursionOctaves=properties.excursionOctaves||this.defaults.excursionOctaves.value;this.sweep=initValue(properties.sweep,this.defaults.sweep.value);this.activateNode.gain.value=2;this.envelopeFollower.activate(true);this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.WahWah.prototype=Object.create(Super,{name:{value:"WahWah"},defaults:{writable:true,value:{automode:{value:true,automatable:false,type:BOOLEAN},baseFrequency:{value:.5,min:0,max:1,automatable:false,type:FLOAT},excursionOctaves:{value:2,min:1,max:6,automatable:false,type:FLOAT},sweep:{value:.2,min:0,max:1,automatable:false,type:FLOAT},resonance:{value:10,min:1,max:100,automatable:false,type:FLOAT},sensitivity:{value:.5,min:-1,max:1,automatable:false,type:FLOAT},bypass:{value:false,automatable:false,type:BOOLEAN}}},automode:{get:function(){return this._automode},set:function(value){this._automode=value;if(value){this.activateNode.connect(this.envelopeFollower.input);this.envelopeFollower.activate(true)}else{this.envelopeFollower.activate(false);this.activateNode.disconnect();this.activateNode.connect(this.filterBp)}}},filterFreqTimeout:{value:0},setFilterFreq:{value:function(){try{this.filterBp.frequency.value=Math.min(22050,this._baseFrequency+this._excursionFrequency*this._sweep);this.filterPeaking.frequency.value=Math.min(22050,this._baseFrequency+this._excursionFrequency*this._sweep)}catch(e){clearTimeout(this.filterFreqTimeout);this.filterFreqTimeout=setTimeout(function(){this.setFilterFreq()}.bind(this),0)}}},sweep:{enumerable:true,get:function(){return this._sweep},set:function(value){this._sweep=Math.pow(value>1?1:value<0?0:value,this._sensitivity);this.setFilterFreq()}},baseFrequency:{enumerable:true,get:function(){return this._baseFrequency},set:function(value){this._baseFrequency=50*Math.pow(10,value*2);this._excursionFrequency=Math.min(userContext.sampleRate/2,this.baseFrequency*Math.pow(2,this._excursionOctaves));this.setFilterFreq()}},excursionOctaves:{enumerable:true,get:function(){return this._excursionOctaves},set:function(value){this._excursionOctaves=value;this._excursionFrequency=Math.min(userContext.sampleRate/2,this.baseFrequency*Math.pow(2,this._excursionOctaves));this.setFilterFreq()}},sensitivity:{enumerable:true,get:function(){return this._sensitivity},set:function(value){this._sensitivity=Math.pow(10,value)}},resonance:{enumerable:true,get:function(){return this._resonance},set:function(value){this._resonance=value;this.filterPeaking.Q=this._resonance}},init:{value:function(){this.output.gain.value=1;this.filterPeaking.type="peaking";this.filterBp.type="bandpass";this.filterPeaking.frequency.value=100;this.filterPeaking.gain.value=20;this.filterPeaking.Q.value=5;this.filterBp.frequency.value=100;this.filterBp.Q.value=1}}});Tuna.prototype.EnvelopeFollower=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.jsNode=this.output=userContext.createScriptProcessor(this.buffersize,1,1);this.input.connect(this.output);this.attackTime=initValue(properties.attackTime,this.defaults.attackTime.value);this.releaseTime=initValue(properties.releaseTime,this.defaults.releaseTime.value);this._envelope=0;this.target=properties.target||{};this.callback=properties.callback||function(){};this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.EnvelopeFollower.prototype=Object.create(Super,{name:{value:"EnvelopeFollower"},defaults:{value:{attackTime:{value:.003,min:0,max:.5,automatable:false,type:FLOAT},releaseTime:{value:.5,min:0,max:.5,automatable:false,type:FLOAT},bypass:{value:false,automatable:false,type:BOOLEAN}}},buffersize:{value:256},envelope:{value:0},sampleRate:{value:44100},attackTime:{enumerable:true,get:function(){return this._attackTime},set:function(value){this._attackTime=value;this._attackC=Math.exp(-1/this._attackTime*this.sampleRate/this.buffersize)}},releaseTime:{enumerable:true,get:function(){return this._releaseTime},set:function(value){this._releaseTime=value;this._releaseC=Math.exp(-1/this._releaseTime*this.sampleRate/this.buffersize)}},callback:{get:function(){return this._callback},set:function(value){if(typeof value==="function"){this._callback=value}else{console.error("tuna.js: "+this.name+": Callback must be a function!")}}},target:{get:function(){return this._target},set:function(value){this._target=value}},activate:{value:function(doActivate){this.activated=doActivate;if(doActivate){this.jsNode.connect(userContext.destination);this.jsNode.onaudioprocess=this.returnCompute(this)}else{this.jsNode.disconnect();this.jsNode.onaudioprocess=null}if(this.activateCallback){this.activateCallback(doActivate)}}},returnCompute:{value:function(instance){return function(event){instance.compute(event)}}},compute:{value:function(event){var count=event.inputBuffer.getChannelData(0).length,channels=event.inputBuffer.numberOfChannels,current,chan,rms,i;chan=rms=i=0;if(channels>1){for(i=0;i<count;++i){for(;chan<channels;++chan){current=event.inputBuffer.getChannelData(chan)[i];rms+=current*current/channels}}}else{for(i=0;i<count;++i){current=event.inputBuffer.getChannelData(0)[i];rms+=current*current}}rms=Math.sqrt(rms);if(this._envelope<rms){this._envelope*=this._attackC;this._envelope+=(1-this._attackC)*rms}else{this._envelope*=this._releaseC;this._envelope+=(1-this._releaseC)*rms}this._callback(this._target,this._envelope)}}});Tuna.prototype.LFO=function(properties){if(!properties){properties=this.getDefaults()}this.input=userContext.createGain();this.output=userContext.createScriptProcessor(256,1,1);this.activateNode=userContext.destination;this.frequency=initValue(properties.frequency,this.defaults.frequency.value);this.offset=initValue(properties.offset,this.defaults.offset.value);this.oscillation=initValue(properties.oscillation,this.defaults.oscillation.value);this.phase=initValue(properties.phase,this.defaults.phase.value);this.target=properties.target||{};this.output.onaudioprocess=this.callback(properties.callback||function(){});this.bypass=properties.bypass||this.defaults.bypass.value};Tuna.prototype.LFO.prototype=Object.create(Super,{name:{value:"LFO"},bufferSize:{value:256},sampleRate:{value:44100},defaults:{value:{frequency:{value:1,min:0,max:20,automatable:false,type:FLOAT},offset:{value:.85,min:0,max:22049,automatable:false,type:FLOAT},oscillation:{value:.3,min:-22050,max:22050,automatable:false,type:FLOAT},phase:{value:0,min:0,max:2*Math.PI,automatable:false,type:FLOAT},bypass:{value:false,automatable:false,type:BOOLEAN}}},frequency:{get:function(){return this._frequency},set:function(value){this._frequency=value;this._phaseInc=2*Math.PI*this._frequency*this.bufferSize/this.sampleRate}},offset:{get:function(){return this._offset},set:function(value){this._offset=value}},oscillation:{get:function(){return this._oscillation},set:function(value){this._oscillation=value}},phase:{get:function(){return this._phase},set:function(value){this._phase=value}},target:{get:function(){return this._target},set:function(value){this._target=value}},activate:{value:function(doActivate){if(doActivate){this.output.connect(userContext.destination);if(this.activateCallback){this.activateCallback(doActivate)}}else{this.output.disconnect()}}},callback:{value:function(callback){var that=this;return function(){that._phase+=that._phaseInc;if(that._phase>2*Math.PI){that._phase=0}callback(that._target,that._offset+that._oscillation*Math.sin(that._phase))}}}});Tuna.toString=Tuna.prototype.toString=function(){return"Please visit https://github.com/Theodeus/tuna/wiki for instructions on how to use Tuna.js"}})();
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.StereoPannerNode = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
for(var BaseAudioContext=require("base-audio-context"),WS_CURVE_SIZE=4096,curveL=new Float32Array(WS_CURVE_SIZE),curveR=new Float32Array(WS_CURVE_SIZE),curveFix=new Float32Array([0,0]),curveDC=new Float32Array([1,1]),i=0;i<WS_CURVE_SIZE;i++)curveL[i]=Math.cos(i/WS_CURVE_SIZE*Math.PI*.5),curveR[i]=Math.sin(i/WS_CURVE_SIZE*Math.PI*.5);function StereoPannerNode(e,n){n=n||{};var t=e.createChannelSplitter(2),a=e.createWaveShaper(),o=e.createWaveShaper(),r=e.createGain(),c=e.createWaveShaper(),i=e.createWaveShaper(),l=e.createGain(),u=e.createGain(),d=e.createChannelMerger(2),p="number"==typeof n.pan?n.pan:0;return t.channelCount=2,t.channelCountMode="explicit",t.channelInterpretation="speakers",t.connect(l,0),t.connect(u,1),t.connect(a,1),t.connect(o,1),a.channelCount=1,a.channelCountMode="explicit",a.channelInterpretation="discrete",a.curve=curveDC,a.connect(r),o.channelCount=1,o.channelCountMode="explicit",o.channelInterpretation="discrete",o.curve=curveFix,o.connect(r.gain),r.channelCount=1,r.channelCountMode="explicit",r.channelInterpretation="discrete",r.gain.value=p,r.connect(c),r.connect(i),c.channelCount=1,c.channelCountMode="explicit",c.channelInterpretation="discrete",c.curve=curveL,c.connect(l.gain),i.channelCount=1,i.channelCountMode="explicit",i.channelInterpretation="discrete",i.curve=curveR,i.connect(u.gain),l.channelCount=1,l.channelCountMode="explicit",l.channelInterpretation="discrete",l.gain.value=0,l.connect(d,0,0),u.channelCount=1,u.channelCountMode="explicit",u.channelInterpretation="discrete",u.gain.value=0,u.connect(d,0,1),d.channelCount=1,d.channelCountMode="explicit",d.channelInterpretation="discrete",Object.defineProperties(t,{pan:{value:r.gain,enumerable:!0,writable:!1,configurable:!0},connect:{value:AudioNode.prototype.connect.bind(d),enumerable:!1,writable:!1,configurable:!0},disconnect:{value:AudioNode.prototype.disconnect.bind(d),enumerable:!1,writable:!1,configurable:!0}}),t}StereoPannerNode.polyfill=function(){!BaseAudioContext||"createStereoPanner"in BaseAudioContext.prototype||StereoPannerNode.install()},StereoPannerNode.install=function(){Object.defineProperty(BaseAudioContext.prototype,"createStereoPanner",{value:function(){return new StereoPannerNode(this)},enumerable:!1,writable:!1,configurable:!0})},"function"==typeof Symbol&&"symbol"==typeof Symbol.hasInstance&&Object.defineProperty(StereoPannerNode,Symbol.hasInstance,{value:function(e){return e instanceof AudioNode&&e.pan instanceof AudioParam}}),module.exports=StereoPannerNode;

},{"base-audio-context":2}],2:[function(require,module,exports){
(function (global){
var AudioContext = global.AudioContext || global.webkitAudioContext;
var OfflineAudioContext = global.OfflineAudioContext || global.webkitOfflineAudioContext;
var BaseAudioContext = global.BaseAudioContext || (OfflineAudioContext && Object.getPrototypeOf(OfflineAudioContext));

module.exports = (typeof BaseAudioContext === "function" && BaseAudioContext.prototype) ? BaseAudioContext : AudioContext;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});
StereoPannerNode.polyfill();OMusicPlayer.prototype.addFXToPart = function (fxName, part, source) {
    var fx = this.makeFXNodeForPart(fxName, part)
    if (fx) {
        part.data.fx.push(fx.data);

        this.song.fxChanged("add", part, fx, source);
    }
    return fx;
};

OMusicPlayer.prototype.removeFXFromPart = function (fx, part, source) {
    var index = part.fx.indexOf(fx);
    
    var connectingNode = part.fx[index - 1] || part.preFXGain;
    var connectedNode = part.fx[index + 1] || part.postFXGain;
    fx.disconnect();
    connectingNode.disconnect();
    connectingNode.connect(connectedNode);

    part.fx.splice(index, 1);
    index = part.data.fx.indexOf(fx.data);
    part.data.fx.splice(index, 1);

    this.song.fxChanged("remove", part, fx, source);
};

OMusicPlayer.prototype.adjustFX = function (fx, part, property, value, source) {
    //todo isAudioParam should be set in this file
    if (fx.isAudioParam) {
        fx[property].setValueAtTime(value, tg.player.context.currentTime);
    }
    else {
        fx[property] = value;
    }
    
    fx.data[property] = value;
    var changes = {}
    changes[property] =  value
    this.song.fxChanged(changes, part, fx, source);
}


OMusicPlayer.prototype.setupFX = function () {
    var p = this;
        
    p.fx = {};
    p.fx["EQ"] = {"make" : function (data) {
            var eq = p.makeEQ(data);
            return eq;
        },
        "controls": [
            {"property": "highGain", default: 1, "name": "EQ High", "type": "slider", "min": 0, "max": 1.5, transform: "square"},
            {"property": "midGain", default: 1, "name": "EQ Mid", "type": "slider", "min": 0, "max": 1.5, transform: "square"},
            {"property": "lowGain", default: 1, "name": "EQ Low", "type": "slider", "min": 0, "max": 1.5, transform: "square"}
        ]
    };
    p.fx["CompressorW"] = {"make" : function (data) {
            var compressor = p.context.createDynamicsCompressor();
            compressor.threshold.value = -50;
            compressor.knee.value = 40;
            compressor.ratio.value = 2;
            compressor.attack.value = 0;
            compressor.release.value = 0.25;
            
            Object.defineProperty(compressor, 'bypass', {
                get: function() {
                    return data.bypass;
                },
                set: function(value) {
                    data.bypass = value;
                }
            });
            return compressor;
        },
        "controls": [
            {"property": "threshold", default: -50, "name": "Threshold", "type": "slider", "min": -100, "max": 0},
            {"property": "knee", default: 40, "name": "Knee", "type": "slider", "min": 0, "max": 40},
            {"property": "ratio", default: 2, "name": "Ratio", "type": "slider", "min": 1, "max": 20},
            //{"property": "reduction", "name": "Reduction", "type": "slider", "min": -20, "max": 0},
            {"property": "attack", default: 0, "name": "Attack", "type": "slider", "min": 0, "max": 1},
            {"property": "release", default: 0.25, "name": "Release", "type": "slider", "min": 0, "max": 1}
        ]
    };
    p.fx["DelayW"] = {"make" : function (data) {
            return p.makeDelay(data);
        },
        "controls": [
            {"property": "time", "name": "Delay Time", default: 0.25, "type": "slider", "min": 0, "max": 5, axis:"revx"},
            {"property": "feedback", "name": "Feedback", default: 0.25, "type": "slider", "min": 0, "max": 1.0, axis:"revy"},
        ]
    };    
    p.fx["Delay"] = {"make" : function (data) {return new p.tuna.Delay(data)},
        "controls": [
            {"property": "feedback", default: 0.45, "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "delayTime", default: 150, "name": "Delay Time", "type": "slider", "min": 1, "max": 1000},
            {"property": "wetLevel", default: 0.25, "name": "Wet Level", "type": "slider", "min": 0, "max": 1},
            {"property": "dryLevel", default: 1, "name": "Dry Level", "type": "slider", "min": 0, "max": 1},
            {"property": "cutoff", default: 2000, "name": "Cutoff", "type": "slider", "min": 20, "max": 22050}
        ]
    };
    p.fx["Chorus"] = {"make" : function (data) {return new p.tuna.Chorus(data)},
        "controls": [
            {"property": "rate", default: 1.5, "name": "Rate", "type": "slider", "min": 0.01, "max": 8, axis:"x"},
            {"property": "feedback", default: 0.2, "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "depth", default: 0.7, "name": "Depth", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "delay", default: 0.0045, "name": "Delay", "type": "slider", "min": 0, "max": 1}
        ]
    };
    
    p.fx["Phaser"] = {"make" : function (data) {return new p.tuna.Phaser(data)},
        "controls": [
            {"property": "rate", default: 1.2, "name": "Rate", "type": "slider", "min": 0.01, "max": 12, axis:"x"},
            {"property": "depth", default: 0.3, "name": "Depth", "type": "slider", "min": 0, "max": 1},
            {"property": "feedback", default: 0.2, "name": "Feedback", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "stereoPhase", default: 30, "name": "Stereo Phase", "type": "slider", "min": 0, "max": 180},
            {"property": "baseModulationFrequeny", default: 700, "name": "Base Modulation Freq", "type": "slider", "min": 500, "max": 1500}
        ]
    };        
    p.fx["Overdrive"] = {"make" : function (data) {return new p.tuna.Overdrive(data)},
        "controls" : [
            {"property": "outputGain", default: 0.15, "name": "Output Gain", "type": "slider", "min": 0, "max": 1.5},
            {"property": "drive", default: 0.7, "name": "Drive", "type": "slider", "min": 0, "max": 1, axis:"x"},
            {"property": "curveAmount", default: 0.8, "name": "Curve Amount", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "algorithmIndex", default: 0, "name": "Type", "type": "options", "options": [0,1,2,3,4,5]}
        ]
    };
    p.fx["Compressor"] = {"make" : function (data) {return new p.tuna.Compressor(data)},
        "controls" : [
            {"property": "threshold", default: -1, "name": "Threshold", "type": "slider", "min": -100, "max": 0},
            {"property": "makeupGain", default: 1, "name": "Makeup Gain", "type": "slider", "min": 0, "max": 10},
            {"property": "attack", default: 1, "name": "Attack", "type": "slider", "min": 0, "max": 1000},
            {"property": "release", default: 0, "name": "Release", "type": "slider", "min": 0, "max": 3000},
            {"property": "ratio", default: 4, "name": "Ratio", "type": "slider", "min": 0, "max": 20},
            {"property": "knee", default: 5, "name": "Knee", "type": "slider", "min": 0, "max": 40},
            {"property": "automakeup", default: true, "name": "Auto Makeup", "type": "options", "options": [false, true]}
        ]
    };
    p.fx["Reverb"] = {"make" : function (data) {return new p.tuna.Convolver(data)},
        "controls": [
            {"property": "highCut", default: 22050, "name": "High Cut", "type": "slider", "min": 20, "max": 22050, axis:"revy"},
            {"property": "lowCut", default: 20, "name": "Low Cut", "type": "slider", "min": 20, "max": 22050},
            {"property": "dryLevel", default: 1, "name": "Dry Level", "type": "slider", "min": 0, "max": 1},
            {"property": "wetLevel", default: 1, "name": "Wet Level", "type": "slider", "min": 0, "max": 1, axis:"x"},
            {"property": "level", default: 1, "name": "Level", "type": "slider", "min": 0, "max": 1},
            {"property": "impulse", default: "/omg-music/impulses/ir_rev_short.wav", "name": "Impulse", "type": "hidden"},
        ]
    };
    p.fx["Filter"] = {"make" : function (data) {return new p.tuna.Filter(data)},
        "controls": [
            {"property": "frequency", default: 440, "name": "Frequency", "type": "slider", "min": 20, "max": 22050, axis:"x"},
            {"property": "Q", default: 1, "name": "Q", "type": "slider", "min": 0.001, "max": 100},
            {"property": "gain", default: 0, "name": "Gain", "type": "slider", "min": -40, "max": 40, axis: "y"},
            {"property": "filterType", default: "lowpass", "name": "Filter Type", "type": "options", 
                "options": ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "peaking", "notch", "allpass"]},
        ]
    };
    p.fx["Cabinet"] = {"make" : function (data) {return new p.tuna.Cabinet(data)},
        "controls": [
            {"property": "makeupGain", default: 1, "name": "Makeup Gain", "type": "slider", "min": 0, "max": 20},
            {"property": "impulse", default: "/omg-music/impulses/impulse_guitar.wav", "name": "Impulse", "type": "hidden"}
        ]
    };
    p.fx["Tremolo"] = {"make" : function (data) {return new p.tuna.Tremolo(data)},
        "controls": [
            {"property": "intensity", default: 0.3, "name": "Intensity", "type": "slider", "min": 0, "max": 1, axis:"revy"},
            {"property": "rate", default: 4, "name": "Rate", "type": "slider", "min": 0.001, "max": 8, axis:"x"},
            {"property": "stereoPhase", default: 0, "name": "Stereo Phase", "type": "slider", "min": 0, "max": 180}
        ]
    };
    p.fx["Wah Wah"] = {"make" : function (data) {return new p.tuna.WahWah(data)},
        "controls": [
            {"property": "automode", default: true, "name": "Auto Mode", "type": "options", "options": [false, true]},
            {"property": "baseFrequency", default: 0.5, "name": "Base Frequency", "type": "slider", "min": 0, "max": 1, axis:"x"},
            {"property": "excursionOctaves", default: 2, "name": "Excursion Octaves", "type": "slider", "min": 1, "max": 6},
            {"property": "sweep", default: 0.2, "name": "Sweep", "type": "slider", "min": 0, "max": 1, axis:"y"},
            {"property": "resonance", default: 10, "name": "Resonance", "type": "slider", "min": 1, "max": 10},
            {"property": "sensitivity", default: 0.5, "name": "Sensitivity", "type": "slider", "min": -1, "max": 1}
        ]
    };
    p.fx["Bitcrusher"] = {"make" : function (data) {return new p.tuna.Bitcrusher(data)},
        "controls": [
            {"property": "bits", default: 4, "name": "Bits", "type": "options", "options": [1,2,4,8,16]},
            {"property": "normfreq", default: 0.1, "name": "Normal Frequency", "type": "slider", "min": 0, "max": 1, "transform": "square", axis:"x"},
            {"property": "bufferSize", default: 4096, "name": "Buffer Size", "type": "options", "options": [256,512,1024,2048,4096,8192,16384]}
        ]
    };
    p.fx["Moog"] = {"make" : function (data) {return new p.tuna.MoogFilter(data)},
        "controls": [
            {"property": "cutoff", default: 0.065, "name": "Cutoff", "type": "slider", "min": 0, "max": 1},
            {"property": "resonance", default: 3.5, "name": "Resonance", "type": "slider", "min": 0, "max": 4},
            {"property": "bufferSize", default: 4096, "name": "Buffer Size", "type": "options", "options": [256,512,1024,2048,4096,8192,16384]}
        ]
    };
    p.fx["Ping Pong"] = {"make" : function (data) {return new p.tuna.PingPongDelay(data)},
        "controls": [
            {"property": "wetLevel", default: 0.5, "name": "Wet Level", "type": "slider", "min": 0, "max": 1},
            {"property": "feedback", default: 0.3, "name": "Feedback", "type": "slider", "min": 0, "max": 1},
            {"property": "delayTimeLeft", default: 150, "name": "Delay Time Left", "type": "slider", "min": 1, "max": 10000, axis:"x"},
            {"property": "delayTimeRight", default: 200, "name": "Delay Time Right", "type": "slider", "min": 1, "max": 10000, axis:"revy"}
        ]
    };
    p.fx["Rad Pad"] = {"make" : function (data) {
            return p.makeRadPad(data);
        },
        "controls": [
            {"property": "fx1", default: "None", "name": "FX1", "type": "options", 
                "options": ["None", "DelayW", "Reverb", "Ping Pong"]},
            {"property": "fx2", default: "None", "name": "FX2", "type": "options", 
                "options": ["None", "LPF", "HPF", "BPF"]},
            {"property": "fx3", default: "None", "name": "FX3", "type": "options", 
                "options": ["None", "Tremolo", "Phaser", "Chorus"]},
            {"property": "fx4", default: "None", "name": "FX4", "type": "options", 
                "options": ["None", "Wah Wah", "Bitcrusher", "Overdrive"]},
            {"property": "xy", default: 0.3, "name": "", "type": "xy", "min": 0, "max": 1}
        ]
    };
};

OMusicPlayer.prototype.makeFXNodeForPart = function (fx, part) {
    var fxNode, fxData;
    var fxName = fx;
    if (typeof fx === "object") {
        fxName = fx.name;
        fxData = fx;
    }
    
    var fxNode = this.makeFXNode(fxName, fxData)

    if (fxNode) {
        var connectingNode = part.fx[part.fx.length - 1] || part.preFXGain;
        connectingNode.disconnect(part.postFXGain);
        connectingNode.connect(fxNode);
        fxNode.connect(part.postFXGain);
        part.fx.push(fxNode);
    }
    
    return fxNode;
};

OMusicPlayer.prototype.makeFXNode = function (fxName, fxData) {
    var fxNode;
    var fxInfo = this.fx[fxName];
    if (fxInfo) {
        if (!fxData) {
            fxData = {"name": fxName};
            fxInfo.controls.forEach(control => {
                fxData[control.property] = control.default;
            });
        }
        try {
            fxNode = fxInfo.make(fxData);
            if (fxNode)
                fxNode.data = fxData;    
        }
        catch (e) {console.warn("error creating fx", fxName, e)}
    }
    return fxNode;
};


OMusicPlayer.prototype.makeEQ = function (data) {
    var p = this;
    var input = p.context.createGain();

    // https://codepen.io/andremichelle/pen/RNwamZ/
    // How to hack an equalizer with two biquad filters
    //
    // 1. Extract the low frequencies (highshelf)
    // 2. Extract the high frequencies (lowshelf)
    // 3. Subtract low and high frequencies (add invert) from the source for the mid frequencies.
    // 4. Add everything back together
    //
    // andre.michelle@gmail.com

    var context = this.context;
    
    // EQ Properties
    //
    var gainDb = -40.0;
    var bandSplit = [360,3600];

    input.eqH = context.createBiquadFilter();
    input.eqH.type = "lowshelf";
    input.eqH.frequency.value = bandSplit[0];
    input.eqH.gain.value = gainDb;

    input.eqHInvert = context.createGain();
    input.eqHInvert.gain.value = -1.0;

    input.eqM = context.createGain();

    input.eqL = context.createBiquadFilter();
    input.eqL.type = "highshelf";
    input.eqL.frequency.value = bandSplit[1];
    input.eqL.gain.value = gainDb;

    input.eqLInvert = context.createGain();
    input.eqLInvert.gain.value = -1.0;

    input.connect(input.eqL);
    input.connect(input.eqM);
    input.connect(input.eqH);

    input.eqH.connect(input.eqHInvert);
    input.eqL.connect(input.eqLInvert);

    input.eqHInvert.connect(input.eqM);
    input.eqLInvert.connect(input.eqM);

    input.eqLGain = context.createGain();
    input.eqMGain = context.createGain();
    input.eqHGain = context.createGain();

    if (typeof input.highGain !== "number")
        input.highGain = 1;
    if (typeof input.midGain !== "number")
        input.midGain = 1;
    if (typeof input.lowGain !== "number")
        input.lowGain = 1;
    input.eqHGain.gain.value = input.highGain;
    input.eqMGain.gain.value = input.midGain;
    input.eqLGain.gain.value = input.lowGain;

    input.eqL.connect(input.eqLGain);
    input.eqM.connect(input.eqMGain);
    input.eqH.connect(input.eqHGain);

    input.output = context.createGain();
    input.eqLGain.connect(input.output);
    input.eqMGain.connect(input.output);
    input.eqHGain.connect(input.output);
    
    input.connect = function (to) {
        input.output.connect(to);
    };
    input.disconnect = function (from) {
        input.output.disconnect(from);
    };
    Object.defineProperty(input, 'highGain', {
        set: function(value) {
            data.highGain = value;
            if (!data.bypass) {
                input.eqHGain.gain.value = value;
            }
        }
    });
    Object.defineProperty(input, 'midGain', {
        set: function(value) {
            data.midGain = value;
            if (!data.bypass)
                input.eqMGain.gain.value = value;
        }
    });
    Object.defineProperty(input, 'lowGain', {
        set: function(value) {
            data.lowGain = value;
            if (!data.bypass)
                input.eqLGain.gain.value = value;
        }
    });
    Object.defineProperty(input, 'bypass', {
        get: function() {
            return data.bypass;
        },
        set: function(value) {
            input.eqHGain.gain.value = value ? 1 : data.highGain;
            input.eqMGain.gain.value = value ? 1 : data.midGain;
            input.eqLGain.gain.value = value ? 1 : data.lowGain;
            data.bypass = value;
        }
    });
    input.highGain = data.highGain;
    input.midGain = data.midGain;
    input.lowGain = data.lowGain;
    input.bypass = data.bypass;
    return input;
};

OMusicPlayer.prototype.makeDelay = function (data) {
    var p = this;
    var input = p.context.createGain();
    var output = p.context.createGain();
    var delay  = p.context.createDelay();
    var feedback = p.context.createGain();
    
    feedback.gain.value = data.feedback;
    delay.delayTime.value = data.time;
    
    input.connect(delay);
    input.connect(output);
    delay.connect(feedback);
    feedback.connect(delay);
    feedback.connect(output);
    
    input.connect = function (to) {
        output.connect(to);
    };
    input.disconnect = function (to) {
        output.disconnect(to);
    };
    
    Object.defineProperty(input, 'time', {
        set: function(value) {
            data.time = value;
            //delay.delayTime.setValueAtTime(value, p.context.currentTime);
            delay.delayTime.exponentialRampToValueAtTime(value, p.context.currentTime + p.latency/1000);
        }
    });
    Object.defineProperty(input, 'feedback', {
        set: function(value) {
            data.feedback = value;
            feedback.gain.exponentialRampToValueAtTime(data.bypass ? 0 : value, p.context.currentTime + p.latency/1000);
        }
    });
    Object.defineProperty(input, 'bypass', {
        get: function() {
            return data.bypass;
        },
        set: function(value) {
            data.bypass = value;
            feedback.gain.setValueAtTime(value ? 0 : data.feedback, p.context.currentTime);
        }
    });
    return input;
};



OMusicPlayer.prototype.makeRadPad = function (data) {
    var p = this;
    var input = p.context.createGain();
    var output = p.context.createGain();
    input.connect(output);

    var fxs = [undefined, undefined, undefined, undefined];
    var isTouching = false;

    input.connectWA = input.connect;
    input.disconnectWA = input.disconnect;
    input.connect = function (to) {
        output.connect(to);
    };
    input.disconnect = function (to) {
        output.disconnect(to);
    };

    var getNextNode = function (fxI) {
        for (var i = fxI + 1; i < fxs.length; i++) {
            if (fxs[i]) {
                return fxs[i];
            }
        }
        return output;
    };
    var getPrevNode = function (fxI) {
        for (var i = fxI - 1; i >= 0; i--) {
            if (fxs[i]) {
                return fxs[i];
            }
        }
        return input;
    };
    var initialized = false;
    var setFX = function (value, i) {
        if (data["fx" + (1 + i)] === value && initialized) {
            return;
        }
        data["fx" + (1 + i)] = value;
        
        var prevNode = getPrevNode(i);
        var nextNode = getNextNode(i);
        
        if (fxs[i]) {
            if (prevNode === input) {
                try {input.disconnectWA(fxs[i]);}
                catch (e) {input.disconnectWA();}
            }
            else {
                try {prevNode.disconnect(fxs[i]);} 
                catch (e) {prevNode.disconnect();}
            }
            
            try {fxs[i].disconnect(nextNode);} 
            catch (e) {fxs[i].disconnect();}
        }
        else {
            if (prevNode === input) {
                try {input.disconnectWA(nextNode);}
                catch (e) {input.disconnectWA();}
            }
            else {
                try {prevNode.disconnect(nextNode);} 
                catch (e) {prevNode.disconnect();}
            }
        }
        fxs[i] = undefined;
        
        if (value !== "None") {
            fxs[i] = makeFX(value);
            if (prevNode === input) {
                input.connectWA(fxs[i]);
            }
            else {
                prevNode.connect(fxs[i]);
            }
            fxs[i].connect(nextNode);
        }
        else {
            if (prevNode === input) {
                input.connectWA(nextNode);
            }
            else {
                prevNode.connect(nextNode);
            }
        }
    };
    
    var makeFX = function (value) {
        var name;
        if (p.fx[value]) {
            var node = p.makeFXNode(value);
            name = value;
        }
        if (value === "LPF" || value === "HPF" || value === "BPF") {
            name = "Filter";
            var node = p.makeFXNode(name);
            node.filterType = value === "LPF" ? "lowpass" : value === "HPF" ?
                    "highpass" : "bandpass";
        }
        node.padAxes = {};
        p.fx[name].controls.forEach(function (control) {
            if (control.axis) {
                node.padAxes[control.axis] = control;
            }
        });
        node.bypass = true;
        return node;
    };
    
    Object.defineProperty(input, 'fx1', {
        set: function (value) {
            setFX(value, 0);
        }
    });
    Object.defineProperty(input, 'fx2', {
        set: function (value) {
            setFX(value, 1);
        }
    });
    Object.defineProperty(input, 'fx3', {
        set: function (value) {
            setFX(value, 2);
        }
    });
    Object.defineProperty(input, 'fx4', {
        set: function (value) {
            setFX(value, 3);
        }
    });

    Object.defineProperty(input, 'xy', {
        set: function (xy) {
            fxs.forEach(function (fx) {
                if (!fx) return;
                if (xy[0] === -1) {
                    fx.bypass = true;
                    return;
                }
                if (fx.bypass) {
                    fx.bypass = false;
                }
                if (fx && fx.padAxes.x) {
                    fx[fx.padAxes.x.property] = xy[0] * fx.padAxes.x.max;
                }
                if (fx && fx.padAxes.y) {
                    fx[fx.padAxes.y.property] = xy[1] * fx.padAxes.y.max;
                }                
                if (fx && fx.padAxes.revx) {
                    fx[fx.padAxes.revx.property] = (1 - xy[0]) * fx.padAxes.revx.max;
                }
                if (fx && fx.padAxes.revy) {
                    fx[fx.padAxes.revy.property] = (1 - xy[1]) * fx.padAxes.revy.max;
                }                
            });
        }
    });
    
    Object.defineProperty(input, 'bypass', {
        get: function() {
            return data.bypass;
        },
        set: function(value) {
            data.bypass = value;
        }
    });

    if (data.fx1) setFX(data.fx1, 0);
    if (data.fx2) setFX(data.fx2, 1);
    if (data.fx3) setFX(data.fx3, 2);
    if (data.fx4) setFX(data.fx4, 3);
    initialized = true;

    return input;
};
function OMGSong(div, data, headerOnly) {
    this.div = div;
    this.sections = [];
    this.fx = [];
    this.loop = true;
    this.gain = 1;
    
    if (headerOnly) {
        this.setHeaderData(data);
    }
    else if (!data) {
        this.data = {type: "SONG", name: ""};
    }
    else if (data.type === "SONG") {
        this.setData(data);
        if (data.id) {
            this.saved = true;
        }
    }
    else if (data.type === "SECTION") {
        this.data = {type: "SONG", name: ""};
        new OMGSection(null, data, this);
    }
    else if (data.type == "PART") {
        this.data = {type: "SONG", name: ""};
        new OMGPart(null, data, new OMGSection(null, null, this));
    }
    else {
        data.type = "SONG";
        this.data = data;
    }

    data = this.data;
    
    this.data.omgVersion = Math.max(1, (this.omgVersion || 0));

    this.arrangement = [];
    if (data.arrangement) {
        for (var i = 0; i < data.arrangement.length; i++) {
            for (var j = 0; j < this.sections.length; j++) {
                if (data.arrangement[i] && this.sections[j].data.name === data.arrangement[i].name) {
                    this.arrangement.push({section: this.sections[j], data: data.arrangement[i]});
                    break;
                }
            }
        }
    }
    
    if (!data.fx) {
        data.fx = [];
    }
    
    if (!data.beatParams) {
        data.beatParams = {};
    }
    data.beatParams.subbeats = data.beatParams.subbeats * 1 || 4;
    data.beatParams.beats = data.beatParams.beats * 1 || 4;
    data.beatParams.measures = data.beatParams.measures * 1 || 1;
    data.beatParams.bpm = data.beatParams.bpm * 1 || 120;
    data.beatParams.shuffle = data.beatParams.shuffle * 1 || 0;
    if (!data.keyParams) {
        data.keyParams = {};
    }
    data.keyParams.rootNote = data.keyParams.rootNote * 1 || 0;
    data.keyParams.scale = data.keyParams.scale || [0,2,4,5,7,9,11];
    
    this.onKeyChangeListeners = [];
    this.onBeatChangeListeners = [];
    this.onPartAudioParamsChangeListeners = [];
    this.onPartAddListeners = [];
    this.onChordProgressionChangeListeners = [];
    this.onFXChangeListeners = [];
};

OMGSong.prototype.keyChanged = function (source) {
    var song = this;
    this.onKeyChangeListeners.forEach(listener => listener(song.data.keyParams, source));
};

OMGSong.prototype.beatsChanged = function (source) {
    var song = this;
    this.onBeatChangeListeners.forEach(listener => listener(song.data.beatParams, source));
};

OMGSong.prototype.partMuteChanged = function (part, source) {
    this.onPartAudioParamsChangeListeners.forEach(listener => listener(part, source));
};

OMGSong.prototype.chordProgressionChanged = function (source) {
    this.onChordProgressionChangeListeners.forEach(listener => listener(source));
};

OMGSong.prototype.partAdded = function (part, source) {
    this.onPartAddListeners.forEach(listener => listener(part, source));
};

OMGSong.prototype.fxChanged = function (action, part, fx, source) {
    this.onFXChangeListeners.forEach(listener => listener(action, part, fx, source));
};


OMGSong.prototype.setData = function (data) {
    this.data = data;

    for (var i = 0; i < data.sections.length; i++) {
        var ooo = new OMGSection(null, data.sections[i], this);
    }

    if (!this.data.name)
        this.data.name = "";
};

OMGSong.prototype.getData = function () {

    this.data.sections = [];
    for (var ip = 0; ip < this.sections.length; ip++) {
        this.data.sections[ip] = this.sections[ip].getData();
    }
    if (this.arrangement.length > 0) {
        this.data.arrangement = [];
        for (ip = 0; ip < this.arrangement.length; ip++) {
            this.data.arrangement[ip] = this.arrangement[ip].data;
        }
    }
    else {
        delete this.data.arrangement;
    }
    return this.data;
};

OMGSong.prototype.make = function (data) {
    var newSong;
    var newSection;
    var newPart;

    if (!data) {
        return null;
    }

    var className = data.constructor.name;

    if (className == "OMGSong") {
        return data;
    }

    if (className == "OMGPart") {

        newSong = new OMGSong();
        newSection = new OMGSection(null, null, newSong);
        newSection.parts.push(data);
        data.section = newSection;

        if (data.data.beatParams) {
            newSection.data.beatParams = data.data.beatParams;
            newSong.data.beatParams = newSection.data.beatParams;
        }
        return newSong;
    }

    if (className == "OMGSection") {

        newSong = new OMGSong();
        newSong.sections.push(data);
        if (data.data.beatParams)
            newSong.data.beatParams = data.data.beatParams;
        if (data.data.keyParams)
            newSong.data.keyParams = data.data.keyParams;
        
        data.song = newSong;
        return newSong;
    }

    if (!data.type) {
        return null;
    }

    var newSong;
    if (data.type == "SONG") {
        newSong = new OMGSong(null, data);
        return newSong;
    }

    if (data.type == "SECTION") {
        //newSong = new OMGSong();
        newSection = new OMGSection(null, data);
        return newSection.song;
    }

    if (data.type == "PART") {
        newPart = new OMGPart(null, data);
        return newPart.section.song;
    }

    if (data.type == "SOUNDSET") {
        newPart = new OMGPart(null, {soundSet: data});
        return newPart.section.song;
    }

    return null;
}

function OMGSection(div, data, song) {
    var partData;
    var part;

    this.div = div;
    this.parts = [];
    this.partLookup = {};

    //if there is no song, but the section has key and beat parameters
    //make a song with those parameters
    if (!song) {
        song = new OMGSong();
        if (data && data.beatParams) {
            if (data.beatParams.beats) {
                song.data.beatParams.beats = data.beatParams.beats;
            }
            if (data.beatParams.subbeats) {
                song.data.beatParams.subbeats = data.beatParams.subbeats;
            }
            if (data.beatParams.measures) {
                song.data.beatParams.measures = data.beatParams.measures;
            }
            if (data.beatParams.bpm) {
                song.data.beatParams.bpm = data.beatParams.bpm;
            }
        }
        if (data && data.keyParams) {
            if (typeof data.keyParams.rootNote === "number") {
                song.data.keyParams.rootNote = data.keyParams.rootNote;
            }
            if (data.keyParams.scale) {
                song.data.keyParams.scale = data.keyParams.scale;
            }
        }
    }
    this.song = song;
    this.position = song.sections.length;
    song.sections.push(this);        

    if (data) {
        this.data = data;
        if (data.id) {
            this.saved = true;
        }
    } else {
        this.data = {type: "SECTION", parts: []};
    }
    
    if (!this.data.chordProgression) {
        this.data.chordProgression = [0];
    }

    for (var ip = 0; ip < this.data.parts.length; ip++) {
        partData = this.data.parts[ip];
        part = new OMGPart(null, partData, this);
    }
}

OMGSection.prototype.getData = function () {
    this.data.parts = [];
    for (var ip = 0; ip < this.parts.length; ip++) {
        this.data.parts[ip] = this.parts[ip].data;
    }
    return this.data;
};

OMGSection.prototype.getPart = function (partName) {
    if (this.partLookup[partName]) {
        return this.partLookup[partName];
    }
    
    for (var ip = 0; ip < this.parts.length; ip++) {
        if (this.parts[ip].data.name === partName) {
            this.partLookup[partName] = this.parts[ip];
            return this.parts[ip];
        }
    }
};

function OMGPart(div, data, section) {
    this.div = div;
    this.fx = [];
    if (!section || !section.data) {
        console.log("new OMGPart() called without a section. Not good.");
        try {throw new Exception();}
        catch (e) {console.log(e);}
        var song = new OMGSong();
        section = new OMGSection(null, null, song);
    }

    this.section = section;
    this.position = section.parts.length;
    section.parts.push(this);        

    if (!section.song || !section.song.data) {
        section.song = new OMGSong();
        section.song.sections.push(section.song);
    }

    this.data = data || {};
    this.data.type = this.data.type || "PART";
    
    if (!this.data.fx) {
        this.data.fx = [];
    }

    if (!this.data.surface) {
        if (this.data.soundSet && this.data.soundSet.defaultSurface) {
            this.data.surface = {url: this.data.soundSet.defaultSurface};
        }
        else {
            this.data.surface = {url: "PRESET_VERTICAL"};
        }
    }
    
    if (!this.data.soundSet) {
        this.data.soundSet = {
            name: "Sine Oscillator",
            url: "PRESET_OSC_SINE",
            highNote: 108,
            lowNote: 0,
            chromatic: true,
            octave: 5
        };
    }
    
    if (!this.data.name) {
        this.data.name = this.data.soundSet.name;
    }
    
    if (this.data.surface.url === "PRESET_VERTICAL") {
        if (!this.data.notes) {
            this.data.notes = [];
        }     
    }
    else if (this.data.surface.url === "PRESET_SEQUENCER") {
        if (!this.data.tracks) {
            this.makeTracks();
        }
        for (var i = 0; i < this.data.tracks.length; i++) {
            this.makeAudioParams(this.data.tracks[i]);
        }
    }

    this.notesPlaying = {}
    
    this.makeAudioParams(false, (this.data.soundSet.url || "").startsWith("PRESET_OSC"));
    
    if (this.data.id) {
        this.saved = true;
    }

}

OMGPart.prototype.makeAudioParams = function (track, osc) {
    var obj = track || this.data;
    if (!obj.audioParams) obj.audioParams = {};
    
    //backwards compat, now we use gain instead of volume
    if (typeof obj.audioParams.volume === "number" && 
            typeof obj.audioParams.gain !== "number") {
        obj.audioParams.gain = Math.pow(obj.audioParams.volume, 2);
    }
    if (typeof obj.audioParams.gain !== "number") {
        obj.audioParams.gain = track ? 1 : osc ? 0.2 : 0.6;
    }
    if (typeof obj.audioParams.pan !== "number")
        obj.audioParams.pan = 0;
    if (typeof obj.audioParams.warp !== "number")
        obj.audioParams.warp = 1;
};

OMGPart.prototype.defaultDrumPart = function () {
    return {"type": "PART", 
            "surface": {"url": "PRESET_SEQUENCER"},
            "soundSet": {"url": "HIPKIT", "name": "Hip Hop Drum Kit"},
            "tracks": [{"name": "kick", "sound": "http://mikehelland.com/omg/drums/hh_kick.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "snare", "sound": "//mikehelland.com/omg/drums/hh_clap.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "closed hi-hat", "sound": "//mikehelland.com/omg/drums/rock_hihat_closed.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "open hi-hat", "sound": "//mikehelland.com/omg/drums/hh_hihat.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "tambourine", "sound": "//mikehelland.com/omg/drums/hh_tamb.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "h tom", "sound": "//mikehelland.com/omg/drums/hh_tom_mh.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "m tom", "sound": "//mikehelland.com/omg/drums/hh_tom_ml.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                {"name": "l tom", "sound": "//mikehelland.com/omg/drums/hh_toml.mp3",
                    "data": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
            ]};
};

OMGPart.prototype.makeTracks = function () {
    this.data.tracks = [];
    if (this.data.soundSet && this.data.soundSet.data) {
        var that = this;
        this.data.soundSet.data.forEach(function (sound) {
            var track = {name: sound.name, data: [], 
                    audioParams: {gain: 1, pan: 0, warp: 1}};
            track.sound = (that.data.soundSet.prefix || "") +
                    sound.url + (that.data.soundSet.postfix || "");
            that.data.tracks.push(track);
        });
    }
};

OMGSong.prototype.getFX = function (name) {
    for (var ip = 0; ip < this.fx.length; ip++) {
        if (this.fx[ip].data.name === name) {
            return this.fx[ip];
        }
    }
};
OMGPart.prototype.getFX = function (name) {
    for (var ip = 0; ip < this.fx.length; ip++) {
        if (this.fx[ip].data.name === name) {
            return this.fx[ip];
        }
    }
};
if (typeof omg !== "object") omg = {};
if (!omg.loadedSounds) omg.loadedSounds = {};
if (!omg.downloadedSoundSets) omg.downloadedSoundSets = {};

function OMusicPlayer() {

    this.dev = typeof (omg) == "object" && omg.dev;

    var p = this;

    p.playing = false;
    p.loadedSounds = omg.loadedSounds;
    p.downloadedSoundSets = omg.downloadedSoundSets;
    
    p.latency = 20;
    p.latencyMonitor = 0;
    p.mp3PlayOffset = 0.052
    
    p.context = p.getAudioContext();
    p.tuna = omg.tuna;

    this.auditioningParts = [];

    p.onBeatPlayedListeners = [];
    p.onPlayListeners = [];

    p.iSubBeat = 0;
    p.loopStarted = 0;

    p.nextUp = null;

    p.loopSection = -1;
    
    p.setupFX();
}

OMusicPlayer.prototype.getAudioContext = function () {
    if (omg.audioContext) {
        return omg.audioContext;
    }

    if (!window.AudioContext)
        window.AudioContext = window.webkitAudioContext;

    try {
        omg.audioContext = new AudioContext();
        if (!omg.audioContext.createGain)
            omg.audioContext.createGain = omg.audioContext.createGainNode;
        omg.tuna = new Tuna(omg.audioContext);
    } catch (e) {
        console.warn("no web audio");
        this.disableAudio = true
        return null;
    }

    return omg.audioContext;
};

OMusicPlayer.prototype.play = function (song) {
    var p = this;
    if (!p.context)
        return;

    if (p.context.state === "suspended")
        p.context.resume();

    if (song) {
        if (!p.prepareSong(song)) {
            return;
        }
    }

    if (!p.song.sections || !p.song.sections.length) {
        console.warn("no sections to play()");
        return -1;
    }

    p.setupNextSection(typeof p.startArrangementAt !== "number");

    p.playing = true;
    p.loopStarted = Date.now();
    p.iSubBeat = 0;
    
    p.nextBeatTime = p.context.currentTime + (p.latency / 1000);

    p.currentChordI = 0;
    p.rescaleSection(p.section, p.section.data.chordProgression[0]);

    if (typeof (p.onPlay) == "function") {
        // should use the listeners array, but still here because its used
        p.onPlay(p);
    }
    for (var il = 0; il < p.onPlayListeners.length; il++) {
        try {
            p.onPlayListeners[il].call(null, true);
        } catch (ex) {
            console.error(ex);
        }
    }

    this._play();
};

OMusicPlayer.prototype._play = function () {
    var p = this;
    var beatParams = p.song.data.beatParams;

    if (!p.playing)
        return;

    if (p.stopOnNextBeat) {
        p.stopOnNextBeat = false
        p.stop()
        return
    }

    p.subbeatLength = 1000 / (beatParams.bpm / 60 * beatParams.subbeats);

    if (p.loopSection > -1 && p.loopSection < p.song.sections.length) {
        p.section = p.song.sections[p.loopSection];
        p.sectionI = p.loopSection;
    }
    
    if (p.section.chord !== p.section.data.chordProgression[p.currentChordI]) {
        p.rescaleSection(p.section, p.section.data.chordProgression[p.currentChordI]);
    }

    p.playBeat(p.section, p.iSubBeat);

    for (var il = 0; il < p.onBeatPlayedListeners.length; il++) {
        try {
            p.onBeatPlayedListeners[il].call(null, p.iSubBeat, p.section);
        } catch (ex) {
            console.error(ex);
        }
    }

    p.iSubBeat++;

    var timeToPlay = p.nextBeatTime;
    if (p.iSubBeat % 2 === 1) {
        p.nextBeatTime += (p.subbeatLength + beatParams.shuffle * p.subbeatLength) / 1000;
    }
    else {
        p.nextBeatTime += (p.subbeatLength - beatParams.shuffle * p.subbeatLength) / 1000;
    }

    if (p.iSubBeat >= beatParams.beats * beatParams.subbeats * 
                                    beatParams.measures) {
        p.afterSection();

        //this is autolatenecy
        //if we're late, increase the latency (until 250ms)
        //if we're not late, decrease it 1ms (until 20ms)
        if (p.negativeLatencyCounter > 0) {
            if (p.latency < 250) {
                p.latency += 5;
            }
        }
        else if (p.latency > 20) {
            p.latency--;
        }
        p.negativeLatencyCounter = 0;
    }

    if (p.playing) {
        setTimeout(function () {p._play();}, (p.nextBeatTime - p.context.currentTime) * 1000 - p.latency)
    }

    p.latencyMonitor = Math.round((timeToPlay - p.context.currentTime) * 1000);
    if (p.latencyMonitor < 0)
        p.negativeLatencyCounter++
};

OMusicPlayer.prototype.auditionPart = function (part) {
    this.auditioningParts.push(part);
    if (this.auditioningParts.length === 1) {
        this.iSubBeat = 0;
        this.nextBeatTime = this.context.currentTime + (this.latency / 1000);
        this._audition();
    }
};

OMusicPlayer.prototype.auditionEnd = function (part) {
    var index = this.auditioningParts.indexOf(part);
    if (index > -1) {
        this.auditioningParts.splice(index, 1);
    }
};

OMusicPlayer.prototype._audition = function () {
    
    if (this.playing) {
        this.auditioningParts.length = 0;
        return;
    }
    
    var p = this;
    var beatParams = p.song.data.beatParams;

    p.subbeatLength = 1000 / (beatParams.bpm / 60 * beatParams.subbeats);

    for (part of p.auditioningParts) {
        p.playBeatForMelody(p.iSubBeat, part);
    }

    p.iSubBeat++;

    var timeToPlay = p.nextBeatTime;
    if (p.iSubBeat % 2 === 1) {
        p.nextBeatTime += (p.subbeatLength + beatParams.shuffle * p.subbeatLength) / 1000;
    }
    else {
        p.nextBeatTime += (p.subbeatLength - beatParams.shuffle * p.subbeatLength) / 1000;
    }

    if (p.iSubBeat >= beatParams.beats * beatParams.subbeats * 
                                    beatParams.measures) {
        p.iSubBeat = 0;
    }

    if (p.auditioningParts.length > 0) {
        setTimeout(function () {p._audition ();}, (p.nextBeatTime - p.context.currentTime) * 1000 - p.latency)
    }
};

OMusicPlayer.prototype.afterSection = function () {
    var p = this;
    p.iSubBeat = 0;
    p.loopStarted = Date.now();

    if (p.nextUp) {
        p.song = p.nextUp;
        p.setupNextSection(true);
        p.nextUp = null;
        return;
    }

    var nextChord = false;
    if (p.section.data.chordProgression) {
        p.currentChordI++;
        if (p.currentChordI < p.section.data.chordProgression.length) {
            nextChord = true;
        }
        else {
            p.currentChordI = 0;
        }
        if (p.section.chord !== p.section.data.chordProgression[p.currentChordI]) {
            p.rescaleSection(p.section, p.section.data.chordProgression[p.currentChordI]);
        }
    }

    if (!nextChord) {
        p.lastSection = p.section;

        p.setupNextSection();
    }
};

OMusicPlayer.prototype.setupNextSection = function (fromStart) {
    var p = this;
    if (fromStart) {
        //p.loopSection = -1;
        if (p.song.arrangement.length > 0) {
            p.arrangementI = 0;
            p.section = p.song.arrangement[p.arrangementI].section;
            p.song.arrangement[p.arrangementI].repeated = 0;
        }
        else {
            p.sectionI = 0;
            p.section = p.song.sections[p.sectionI];
        }
        return;
    }
    
    if (typeof p.queueSection === "number") {
        p.loopSection = p.queueSection;
        p.queSection = undefined;
    }
    else if (typeof p.queueSection === "string") {
        for (var i = 0; i < this.song.sections.length; i++) {
            if (this.song.sections[i].data.name === p.queueSection) {
                p.loopSection = i;
                p.queSection = undefined;
                break;
            }
        }
    }


    if (p.loopSection > -1) {
        p.sectionI = p.loopSection;
        p.section = p.song.sections[p.sectionI];
        if (p.onloop) p.onloop()
        return;
    }
    
    if (p.song.arrangement.length > 0) {
        if (typeof p.startArrangementAt === "number") {
            p.arrangementI = p.startArrangementAt;
            p.startArrangementAt = undefined;
            p.section = p.song.arrangement[p.arrangementI].section;
            p.song.arrangement[p.arrangementI].repeated = 0;
            return;
        }
        if (typeof p.arrangementI !== "number" || p.arrangementI === -1) {
            p.arrangementI = 0;
            p.section = p.song.arrangement[0].section;
            return;
        }
        
        if (p.song.arrangement[p.arrangementI].data.repeat) {
            p.song.arrangement[p.arrangementI].repeated = 
                    (p.song.arrangement[p.arrangementI].repeated || 0);
            if (p.song.arrangement[p.arrangementI].repeated < p.song.arrangement[p.arrangementI].data.repeat) {
                p.song.arrangement[p.arrangementI].repeated++;
                return;
            }
            p.song.arrangement[p.arrangementI].repeated = 0;
        }
        p.arrangementI++;
        if (p.arrangementI >= p.song.arrangement.length) {
            p.arrangementI = 0;
            if (!p.song.loop) {
                p.stopOnNextBeat = true
            }
            else {
                if (p.onloop) p.onloop();
            }
        }
        p.section = p.song.arrangement[p.arrangementI].section;
        p.song.arrangement[p.arrangementI].repeated = 0;
        return;
    }

    if (typeof p.sectionI !== "number") {
        p.sectionI = -1; 
    }
    p.sectionI++;
    if (p.sectionI >= p.song.sections.length) {
        p.sectionI = 0;
        if (!p.song.loop) {
            p.stop();
        }
        else {
            if (p.onloop) p.onloop();
        }
    }
    p.section = p.song.sections[p.sectionI];
};

OMusicPlayer.prototype.stop = function () {
    var p = this;

    clearInterval(p.playingIntervalHandle);
    p.playing = false;

    if (typeof (p.onStop) == "function") {
        // should use the listeners array, but still here because its used
        p.onStop(p);
    }
    for (var il = 0; il < p.onPlayListeners.length; il++) {
        try {
            p.onPlayListeners[il].call(null, false);
        } catch (ex) {
            console.error(ex);
        }
    }
    
    for (var il = 0; il < p.onBeatPlayedListeners.length; il++) {
        try {
            p.onBeatPlayedListeners[il].call(null, -1, p.section);
        } catch (ex) {console.error(ex);}
    }


    if (p.song && p.song.sections[p.song.playingSection]) {
        var parts = p.song.sections[p.song.playingSection].parts;
        for (var ip = 0; ip < parts.length; ip++) {
            if (parts[ip].osc) {
                parts[ip].osc.finishPart();
            }

        }
    }
};

OMusicPlayer.prototype.loadSection = function (section, soundsNeeded) {
    var part;
    for (var ipart = 0; ipart < section.parts.length; ipart++) {
        part = section.parts[ipart];
        this.loadPart(part, soundsNeeded);
    }
};

OMusicPlayer.prototype.loadPart = function (part, soundsNeeded, callback) {
    var p = this;

    if (!part.panner && !this.disableAudio) {
        this.makeAudioNodesForPart(part);
    }

    var download = false;
    if (!soundsNeeded) {
        download = true;
        soundsNeeded = {};
    }

    if (part.data.surface.url === "PRESET_SEQUENCER") {
        this.loadDrumbeat(part, soundsNeeded);
        if (callback) callback()
    } else if (part.data.surface.url === "PRESET_MIC") {
        this.loadMic(part, callback)
        download = false
    } else {
        this.loadMelody(part, soundsNeeded);
        if (callback) callback()
    }
    
    if (download) {
        for (var sound in soundsNeeded) {
            p.loadSound(sound);
        }
    }
};

OMusicPlayer.prototype.loadMelody = function (part, soundsNeeded) {
    var p = this;

    var data = part.data;
    
    var section = part.section;
    var song = part.section ? part.section.song : undefined;

    part.currentI = -1;

    if (data.soundSet && data.soundSet.data) {
        if (!p.downloadedSoundSets[data.soundSet.name]) {
            p.downloadedSoundSets[data.soundSet.name] = data.soundSet;
        }
        part.soundSet = data.soundSet;
        p.prepareMelody(part, soundsNeeded);
    }
    else if (data.soundSet && typeof data.soundSet.url === "string") {
        if (data.soundSet.url.startsWith("PRESET_OSC")) {
            part.soundSet = {osc: true};
        }
        else {
            p.getSoundSet(data.soundSet.url, function (soundSet) {
                part.soundSet = soundSet;
                p.prepareMelody(part, soundsNeeded);
            });
        }
    }
  
};

OMusicPlayer.prototype.prepareMelody = function (part, soundsNeeded) {
    var p = this;
    
    this.setupPartWithSoundSet(part.soundSet, part);
    
    if (this.loadFullSoundSets) {
        this.loadSoundsFromSoundSet(part.soundSet);
        return;
    }

    var soundsToLoad = 0;
    var chordsDone = [];
    part.section.data.chordProgression.forEach(chord => {
        if (chordsDone.indexOf(chord) > -1) {
            return;
        }
        chordsDone.push(chord);
        p.rescale(part, part.section.song.data.keyParams, chord, soundsNeeded);
        
    });

    if (soundsToLoad == 0) {
        part.loaded = true;
    }

};

OMusicPlayer.prototype.loadDrumbeat = function (part, soundsNeeded) {

    var tracks = part.data.tracks;
    var empty;
    for (var i = 0; i < tracks.length; i++) {
        if (!this.loadFullSoundSets) {
            empty = true;
            for (var j = 0; j < tracks[i].data.length; j++) {
                if (tracks[i].data[j]) {
                    empty = false;
                    break;
                }
            }
            if (empty) {
                continue;
            }
        }

        if (soundsNeeded && tracks[i].sound && 
                !omg.loadedSounds[tracks[i].sound] &&
                !soundsNeeded[tracks[i].sound]) {
            soundsNeeded[tracks[i].sound] = true;
        }
    }

    if (part.data.soundSet && !part.soundSet) {
        part.soundSet = part.data.soundSet;
    }
};

OMusicPlayer.prototype.playWhenReady = function (sections) {
    var p = this;
    var allReady = true;

    for (var i = 0; i < sections.length; i++) {
        for (var j = 0; j < sections[i].parts.length; j++) {
            if (!sections[i].parts[j].loaded) {
                allReady = false;
                console.info("section " + i + " part " + j + " is not ready");
            }
        }
    }
    if (!allReady) {
        setTimeout(function () {
            p.playWhenReady(sections);
        }, 600);
    } else {
        p.play(sections);
    }
};

OMusicPlayer.prototype.prepareSongFromURL = function (url, callback) {
    var p = this;
    fetch(url).then(function (response) {
        response.json().then(data => {
            try {
                var song = OMGSong.prototype.make(data);
                p.prepareSong(song, callback);
            }
            catch (e) {
                console.error(e);
            }
        });
    });

};

OMusicPlayer.prototype.prepareSong = function (song, callback) {
    var p = this;
    
    if (!song.madeAudioNodes && !this.disableAudio) {
        p.makeAudioNodesForSong(song);
    }
    
    p.keyParams = song.data.keyParams;
    p.beatParams = song.data.beatParams;

    var soundsNeeded = {};

    for (var isection = 0; isection < song.sections.length; isection++) {

        p.loadSection(song.sections[isection], soundsNeeded);
    }

    var finish = function () {
        if (p.playing) {
            p.nextUp = song;
        }
        else {
            p.song = song;
        }
        if (callback) callback();
    };
    
    if (Object.keys(soundsNeeded).length === 0 || p.disableAudio) {
        finish();
        return true;
    }
    
    for (var sound in soundsNeeded) {
        p.loadSound(sound, function (sound) {
            delete soundsNeeded[sound];
            if (Object.keys(soundsNeeded).length === 0) {
                finish();
            }
        });
    }
    return true;
};



OMusicPlayer.prototype.playBeat = function (section, iSubBeat) {
    var p = this;
    for (var ip = 0; ip < section.parts.length; ip++) {
        p.playBeatForPart(iSubBeat, section.parts[ip]);
    }


};

OMusicPlayer.prototype.playBeatForPart = function (iSubBeat, part) {
    var p = this;

    if (part.data.surface.url === "PRESET_SEQUENCER") {
        p.playBeatForDrumPart(iSubBeat, part);
    } 
    else if (part.data.surface.url === "PRESET_MIC") {
        //nothing to do
    } else {
        p.playBeatForMelody(iSubBeat, part);
    }
};

OMusicPlayer.prototype.playBeatForDrumPart = function (iSubBeat, part) {
    var tracks = part.data.tracks;

    if (part.data.audioParams.mute)
        return;
    var strength;
    for (var i = 0; i < tracks.length; i++) {
        if (tracks[i].data[iSubBeat]) {
            if (!tracks[i].audioParams.mute) {
                this.playSound(tracks[i].sound, part, tracks[i].audioParams,
                        typeof tracks[i].data[iSubBeat] === "number" ?
                            tracks[i].data[iSubBeat] : undefined);
            }
        }
    }
};

OMusicPlayer.prototype.playBeatForMelody = function (iSubBeat, part) {
    var p = this;
    var data = part.data;
    var beatToPlay = iSubBeat;
    if (iSubBeat == 0) {
        // this sort of works, for playing melodies longer than 
        // the section goes, but taking it solves problems
        // the one I'm solving now is putting currentI in the right state
        // every time, so it doesn't stop the current section if the same
        // melody is in upnext play list
        //if (part.currentI === -1 || part.currentI === data.notes.length) {
        part.currentI = 0;
        part.nextBeat = 0;
        part.loopedBeats = 0;
        //}
        //else {
        //  if (!part.loopedBeats) part.loopedBeats = 0;
        //  part.loopedBeats += 32;
        //}
    }

    if (part.loopedBeats) {
        beatToPlay += part.loopedBeats;
    }

    if (part.liveNotes && part.liveNotes.length > 0) {
        this.playBeatWithLiveNote(iSubBeat, part);
        return;
    }

    if (part.currentI === -1) {
        part.nextBeat = 0;
        for (var i = 0; i < part.data.notes.length; i++) {
            if (part.nextBeat < this.iSubBeat) {
                part.nextBeat += part.data.notes[i].beats * this.song.data.beatParams.subbeats;
                part.currentI = i + 1;
            }       
        }
    }

    if (beatToPlay === part.nextBeat) {
        if (!data.notes) {
            console.warn("something wrong here");
            return;
        }
        var note = data.notes[part.currentI];

        if (part.data.audioParams.mute) {
            //play solo they can't here ya
        }
        else if (note) {
            p.playNote(note, part, data);
        }
            
        if (note) {
            part.nextBeat += p.song.data.beatParams.subbeats * note.beats;
            part.currentI++;
        }
    }
};

OMusicPlayer.prototype.playBeatWithLiveNote = function (iSubBeat, part) {
    if (!part.liveNotes || !part.liveNotes.length) {
        return;
    }

    if (part.liveNotes.autobeat > 0) {
        if (iSubBeat % part.liveNotes.autobeat === 0) {
            var index = part.liveNotes.nextIndex || 0;
            if (index >= part.liveNotes.length) {
                index = 0;
            }
            
            var note = {note: part.liveNotes[index].note,
                scaledNote: part.liveNotes[index].scaledNote,
                beats: part.liveNotes.autobeat / part.section.song.data.beatParams.subbeats};
            if (part.soundSet && !part.soundSet.osc) {
                note.sound = this.getSoundURL(part.soundSet, part.liveNotes[index]);
            }

            this.playNote(note, part);
            if (this.playing && !part.data.audioParams.mute) {
                this.recordNote(part, note);
                part.currentI = part.data.notes.indexOf(note) + 1;
            }
            part.liveNotes.nextIndex = index + 1;
        }
    }
    else {
        this.extendNote(part, part.liveNotes[0]);    
    }
};

OMusicPlayer.prototype.extendNote = function (part, note) {
    for (var i = 0; i < part.data.notes.length; i++) {
        if (part.data.notes[i] === note) {
            note.beats += 0.25;
            if (part.data.notes[i + 1]) {
                if (part.data.notes[i + 1].beats > 0.25) {
                    part.data.notes[i + 1].beats -= 0.25;
                    part.data.notes[i + 1].rest = true;
                }
                else {
                    part.data.notes.splice(i + 1, 1);
                }
            }
            break;
        }
    }
};

OMusicPlayer.prototype.makeOsc = function (part) {
    var p = this;

    if (!p.context) {
        return;
    }

    if (part.osc) {
        console.info("makeOsc, already exists");
        try {
            part.osc.stop(p.context.currentTime);
            part.osc.disconnect(part.gain);
            part.gain.disconnect(part.preFXGain);
        } catch (e) {
        }
    }

    part.osc = p.context.createOscillator();

    var soundsetURL = part.data.soundSet.url ||
            "PRESET_OSC_TRIANGLE_SOFT_DELAY";
    if (soundsetURL.indexOf("SAW") > -1) {
        part.osc.type = "sawtooth";
    } else if (soundsetURL.indexOf("SINE") > -1) {
        part.osc.type = "sine";
    } else if (soundsetURL.indexOf("SQUARE") > -1) {
        part.osc.type = "square";
    }
    else if (soundsetURL.indexOf("TRIANGLE") > -1) {
        part.osc.type = "triangle";
    }

    part.osc.connect(part.preFXGain);

    part.osc.frequency.setValueAtTime(0, p.context.currentTime);
    part.osc.start(p.context.currentTime);

    part.osc.finishPart = function () {
        
        part.osc.frequency.setValueAtTime(0, p.nextBeatTime);
        //todo keep freq same, reduce volume
        
        //total hack, this is why things should be processed ala AudioContext, not our own thread
        /*setTimeout(function () {
            part.osc.stop(p.context.currentTime);
            part.osc.disconnect(part.preFXGain);

            part.oscStarted = false;
            part.osc = null;
            part.gain = null;
        }, 50);*/
    };

    part.oscStarted = true;

};

OMusicPlayer.prototype.makeSynth = function (part) {
    part.synth = new Synth(this.context, part.data.soundSet.patch)
    patch = patchLoader.load(part.data.soundSet.patch)
    part.synth.loadPatch(patch.instruments.synth)
    part.synth.outputNode.connect(part.preFXGain)

    var fx = part.data.soundSet.patch.daw.fx || []
    fx.forEach((fxData) => {
        part.data.fx.push(fxData)
        this.makeFXNodeForPart(fxData, part);
    })
    delete part.data.soundSet.patch.daw.fx
    
    //todo if (patch.masterVolume) 
}

OMusicPlayer.prototype.makeFrequency = function (mapped) {
    return Math.pow(2, (mapped - 69.0) / 12.0) * 440.0;
};


OMusicPlayer.prototype.loadSound = function (sound, onload) {
    var p = this;

    if (!sound || !p.context || p.disableAudio) {
        return;
    }
    var key = sound;
    var url = sound;
    onload = onload || function () {};
    
    if (p.loadedSounds[key]) {
        onload(key);
        return;
    }
    
    if (url.startsWith("http:") && !window.location.protocol.startsWith("file:")) {
        url = sound.slice(5);
    }

    p.loadedSounds[key] = "loading";

    if (!omg.util) {
        p.downloadSound(url, key, onload);
        return;
    }
    
    var saved = omg.util.getSavedSound(key, function (buffer) {
        if (!buffer) {
            p.downloadSound(url, key, onload);
        }
        else {
            p.context.decodeAudioData(buffer, function (buffer) {
                p.loadedSounds[key] = buffer;
                buffer.omgIsMP3 = url.toLowerCase().endsWith(".mp3");
                onload(key);
            }, function () {
                console.warn("error loading sound url: " + url);
                onload(key);
            });
        }
    });
};

OMusicPlayer.prototype.downloadSound = function (url, key, onload, secondTry) {
    var p = this;
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
        var data = request.response.slice(0);
        p.context.decodeAudioData(request.response, function (buffer) {
            p.loadedSounds[key] = buffer;
            buffer.omgIsMP3 = url.toLowerCase().endsWith(".mp3")
            onload(key);
            if (omg.util) {
                omg.util.saveSound(key, data);
            }
        }, function () {
            console.warn("error loading sound url: " + url);
            onload(key);
        });
    }
    request.onerror = function (e) {
        if (secondTry) {
            return;
        }

        url = "https://cors-anywhere.herokuapp.com/" + url;
        p.downloadSound(url, key, onload, true);
    }
    request.send();
};


OMusicPlayer.prototype.rescale = function (part, keyParams, chord, soundsNeeded) {
    var p = this;

    var data = part.data;
    if (!data || !data.notes) {
        return;
    }

    var octave = data.soundSet.octave;
    var octaves2;
    var newNote;
    var onote;
    var note;

    for (var i = 0; i < data.notes.length; i++) {
        onote = data.notes[i];
        if (onote.rest || 
                typeof onote.note !== "number" || 
                onote.note !== Math.round(onote.note)) {
            continue;
        }

        newNote = onote.note + chord;
        octaves2 = 0;
        while (newNote >= keyParams.scale.length) {
            newNote = newNote - keyParams.scale.length;
            octaves2++;
        }
        while (newNote < 0) {
            newNote = newNote + keyParams.scale.length;
            octaves2--;
        }

        newNote = keyParams.scale[newNote] + octaves2 * 12 + 
                octave * 12 + keyParams.rootNote;

        onote.scaledNote = newNote;
        
        if (part.soundSet && !part.soundSet.osc) {
            p.updateNoteSound(onote, part.soundSet);
        }
        
        if (soundsNeeded && onote.sound && 
                !omg.loadedSounds[onote.sound] &&
                !soundsNeeded[onote.sound]) {
            soundsNeeded[onote.sound] = true;
        }
    }
};

OMusicPlayer.prototype.setupPartWithSoundSet = function (ss, part, load) {
    var p = this;

    if (!ss)
        return;

    var topNote = ss.highNote;
    if (!topNote && ss.data.length) {
        topNote = ss.lowNote + ss.data.length - 1;
    }
    if (!ss.octave) {
        ss.octave = Math.floor((topNote + ss.lowNote) / 2 / 12);
    }
    if (part.data.soundSet && !part.data.soundSet.octave) {
        part.data.soundSet.octave = ss.octave;
    }

    part.soundSet = ss;
};



OMusicPlayer.prototype.updateNoteSound = function (note, soundSet) {
    var noteIndex;

    if (note.rest)
        return;

    if (soundSet.chromatic) {
        noteIndex = note.scaledNote - soundSet.lowNote;
        if (noteIndex < 0) {
            noteIndex = noteIndex % 12 + 12;
        } else {
            while (noteIndex >= soundSet.data.length) {
                noteIndex = noteIndex - 12;
            }
        }
    }
    else {
        noteIndex = note.note;
    }

    if (!soundSet.data[noteIndex]) {
        return;
    }
    note.sound = (soundSet.prefix || "") + 
                soundSet.data[noteIndex].url + 
                (soundSet.postfix || "");

};

//is this used?
OMusicPlayer.prototype.setupDrumPartWithSoundSet = function (ss, part, load) {
    var p = this;

    if (!ss)
        return;

    var prefix = ss.prefix || "";
    var postfix = ss.postfix || "";

    var track;

    for (var ii = 0; ii < Math.max(part.data.tracks.length, ss.data.length); ii++) {
        track = part.data.tracks[ii];
        if (!track) {
            track = {};
            track.data = [];
            track.data[p.getTotalSubbeats()] = false;
            part.data.tracks.push(track);
        }

        if (ii < ss.data.length) {
            track.sound = prefix + ss.data[ii].url + postfix;
            track.name = ss.data[ii].name;            
        }
        else {
            track.sound = "";
            track.name = "";
        }

        if (!track.sound)
            continue;

        if (load && !p.loadedSounds[track.sound]) {
            p.loadSound(track.sound, part);
        }
    }

};

OMusicPlayer.prototype.getSoundSet = function (url, callback) {
    var p = this;

    if (typeof url != "string") {
        return;
    }

    if (!callback) {
        callback = function () {};
    }

    var dl = p.downloadedSoundSets[url];
    if (dl) {
        callback(dl)
        return;
    }

    if (url.indexOf("PRESET_") == 0) {
        callback(url);
        return;
    }

    var xhr2 = new XMLHttpRequest();
    xhr2.open("GET", url, true)
    xhr2.onreadystatechange = function () {

        if (xhr2.readyState == 4) {
            var ojson = JSON.parse(xhr2.responseText);
            if (ojson) {
                p.downloadedSoundSets[url] = ojson;
                callback(ojson);
            } else {
                callback(ojson);
            }
        }
    };
    xhr2.send();

};

OMusicPlayer.prototype.loadSoundsFromSoundSet = function (soundSet) {
    for (var i = 0; i < soundSet.data.length; i++) {
        this.loadSound((soundSet.prefix || "") + soundSet.data[i].url + 
            (soundSet.postfix || ""));
    }
};


OMusicPlayer.prototype.playNote = function (note, part) {
    var p = this;
    
    var fromNow = (note.beats * 4 * p.subbeatLength) / 1000;

    if (!note || note.rest) {
        if (part.osc) {
            part.preFXGain.gain.setTargetAtTime(0, p.context.currentTime, 0.003);
        }
        return;
    }

    if (part.synth) {
        part.baseFrequency = p.makeFrequency(note.scaledNote);
        var noteFrequency = part.baseFrequency * part.data.audioParams.warp
        part.synth.onNoteOn(noteFrequency, 100)
        
        setTimeout(function () {
            part.synth.onNoteOff(noteFrequency)
        }, p.song.data.beatParams.subbeats * note.beats * p.subbeatLength * 0.85);
    }
    else if (part.osc) {
        part.baseFrequency = p.makeFrequency(note.scaledNote);
        part.preFXGain.gain.setTargetAtTime(part.data.audioParams.gain, p.nextBeatTime - 0.003, 0.003);
        part.osc.frequency.setValueAtTime(part.baseFrequency * part.data.audioParams.warp, p.nextBeatTime);
        part.playingI = part.currentI;
        var playingI = part.playingI;
        
        //this should be a timeout so it can be canceled if
        //a different note has played
        setTimeout(function () {
            if (part.osc && part.playingI === playingI) {
                part.preFXGain.gain.setTargetAtTime(0, p.context.currentTime, 0.003);
            }
        }, p.song.data.beatParams.subbeats * note.beats * p.subbeatLength * 0.85);
    }
    else {
        var audio = p.playSound(note.sound, part);
        if (audio) {
            audio.bufferGain.gain.linearRampToValueAtTime(part.data.audioParams.gain, 
                p.context.currentTime + fromNow * 0.995);
            audio.bufferGain.gain.linearRampToValueAtTime(0, p.context.currentTime + fromNow);
            audio.stop(p.context.currentTime + fromNow);
        }
    }
};



OMusicPlayer.prototype.playSound = function (sound, part, audioParams, strength) {
    var p = this;
    if (p.loadedSounds[sound] &&
            p.loadedSounds[sound] !== "loading") {

        var source = p.context.createBufferSource();
        source.bufferGain = p.context.createGain();
        source.buffer = p.loadedSounds[sound];

        var gain = 1;
        var warp = part.data.audioParams.warp;
        if (audioParams) {
            warp = (warp - 1) + (audioParams.warp - 1) + 1;
            gain = audioParams.gain;
        }
        if (audioParams && audioParams.pan) {                        
            source.bufferPanner = p.context.createStereoPanner();            
            source.bufferPanner.pan.setValueAtTime(audioParams.pan, p.context.currentTime);
                        
            source.connect(source.bufferPanner);
            source.bufferPanner.connect(source.bufferGain);
        }
        else {
            source.connect(source.bufferGain);
        }

        if (strength) {
            gain = gain * strength;
        }

        source.bufferGain.gain.setValueAtTime(gain, p.context.currentTime);
        source.bufferGain.connect(part.preFXGain);

        source.playbackRate.value = warp;

        source.start(p.nextBeatTime, source.buffer.omgIsMP3 ? p.mp3PlayOffset : 0);
        
        return source;
    }
};

OMusicPlayer.prototype.getSoundURL = function (soundSet, note) {
    var noteIndex;
    if (soundSet.chromatic) {
        noteIndex = note.scaledNote - soundSet.lowNote;
        if (noteIndex < 0) {
            noteIndex = noteIndex % 12 + 12;
        } else {
            while (noteIndex >= soundSet.data.length) {
                noteIndex = noteIndex - 12;
            }
        }
    }
    else {
        noteIndex = note.note;
    }

    if (!soundSet.data[noteIndex]) {
        return "";
    }

    //kinda hacky place for this
    note.sound = (soundSet.prefix || "") + soundSet.data[noteIndex].url + 
            (soundSet.postfix || "");    
    
    return note.sound;
};

OMusicPlayer.prototype.updatePartVolumeAndPan = function (part) {

    //todo umm?
    if (part.gain && part.osc) {
        //var oscGain = (part.osc.soft ? 1 : 2) * part.data.volume / 10;
        part.gain.gain.setValueAtTime(Math.pow(part.data.volume, 2), this.context.currentTime);
    }
    if (part.bufferGain) {
        part.bufferGain.gain.setValueAtTime(Math.pow(part.data.volume, 2), this.context.currentTime);
    }
    if (part.panner) {
        part.panner.pan.setValueAtTime(part.data.pan, this.context.currentTime);
    }

};


OMusicPlayer.prototype.splitInts = function (input) {
    var newInts = [];
    var elements = input.split(",");
    elements.forEach(function (el) {
        newInts.push(parseInt(el));
    });
    return newInts;
};

OMusicPlayer.prototype.getTotalSubbeats = function () {
    return this.beats * this.subbeats * this.measures;
};

OMusicPlayer.prototype.rescaleSection = function (section, chord) {
    if (typeof chord !== "number") {
        chord = section.data.chordProgression[this.currentChordI];
    }
    var p = this;
    section.parts.forEach(function (part) {
        if (part.data.surface.url === "PRESET_VERTICAL" && part.data.soundSet.chromatic) {
            p.rescale(part, section.song.data.keyParams, chord || 0);
        }
    });
    section.chord = chord;
};

OMusicPlayer.prototype.rescaleSong = function (rootNote, ascale, chord) {
    var p = this;
    var song = this.song.data;
    if (rootNote != undefined) {
        song.rootNote = rootNote;
    }
    if (ascale != undefined) {
        song.ascale = ascale;
    }
    this.song.sections.forEach(function (section) {
        p.rescaleSection(section, chord || 0);
    });
};

OMusicPlayer.prototype.setSubbeatMillis = function (subbeatMillis) {
    this.newSubbeatMillis = subbeatMillis;
};

OMusicPlayer.prototype.playLiveNotes = function (notes, part) {

    if (this.context && this.context.state === "suspended")
        this.context.resume();
    
    if (part.liveNotes && part.liveNotes.liveAudio) {
            part.liveNotes.liveAudio.bufferGain.gain.setTargetAtTime(0, this.context.currentTime, 0.001);
            part.liveNotes.liveAudio.stop(this.context.currentTime + 0.015);
    }
    if (part.synth && part.synth.lastFrequency) {
        part.synth.onNoteOff(part.synth.lastFrequency)
        part.synth.lastFrequency = 0
    }
    
    part.liveNotes = notes;
    if (notes.autobeat === 0) {
        part.playingI = -1;
        if (this.disableAudio) {
            //silence
        }
        else if (part.osc) {
            part.baseFrequency = this.makeFrequency(notes[0].scaledNote);
            part.osc.frequency.setValueAtTime(
                    part.baseFrequency * part.data.audioParams.warp, this.context.currentTime);
            part.preFXGain.gain.setTargetAtTime(part.data.audioParams.gain, this.context.currentTime, 0.003);
        }
        else if (part.synth) {
            part.baseFrequency = this.makeFrequency(notes[0].scaledNote);
            part.synth.lastFrequency = part.baseFrequency * part.data.audioParams.warp
            part.synth.onNoteOn(part.synth.lastFrequency, 100)
        }
        else {
            //var sound = this.getSound(part.data.soundSet, notes[0]);
            notes[0].sound = this.getSoundURL(part.soundSet, notes[0]);
            part.liveNotes.liveAudio = this.playSound(notes[0].sound, part);
        }
        
        if (this.playing && !part.data.audioParams.mute) {
            this.recordNote(part, notes[0]);
            part.currentI = part.data.notes.indexOf(notes[0]) + 1;
        }
    }
    else {
        if (!this.disableAudio && !this.playing && this.auditioningParts.indexOf(part) == -1) {
            this.auditionPart(part);
        }
        
    }
};

OMusicPlayer.prototype.endLiveNotes = function (part) {
  
    if (part.synth && part.synth.lastFrequency) {
        part.synth.onNoteOff(part.synth.lastFrequency)
        part.synth.lastFrequency = 0
    }
    else if (part.osc) {
        part.preFXGain.gain.setTargetAtTime(0,
                this.context.currentTime, 0.003);
    }  
    else {
        if (part.liveNotes && part.liveNotes.liveAudio) {
            part.liveNotes.liveAudio.bufferGain.gain.setTargetAtTime(0, this.context.currentTime, 0.001);
            part.liveNotes.liveAudio.stop(this.context.currentTime + 0.015);
        }
    }
    part.liveNotes = [];
    
    part.nextBeat = 0;
    part.currentI = -1;
    
    if (!this.playing && this.auditioningParts.indexOf(part) > -1) {
        this.auditionEnd(part);
    }
};

OMusicPlayer.prototype.recordNote = function (part, note) {

    var beatsUsed = 0;
    var currentBeat = this.iSubBeat / part.section.song.data.beatParams.subbeats;
    var index = -1;
    for (var i = 0; i < part.data.notes.length; i++) {
        if (currentBeat === beatsUsed) {
            index = i;
            break;
        }
        if (beatsUsed > currentBeat) {
            part.data.notes[i - 1].beats -= beatsUsed - currentBeat;
            index = i;
            break;
        } 
        beatsUsed += part.data.notes[i].beats;
    }
    if (index > -1) {
        part.data.notes.splice(index, 0, note);
        if (beatsUsed - currentBeat > note.beats) {
            part.data.notes.splice(index + 1, 0, {rest:true, beats: beatsUsed - currentBeat - note.beats});
        }
        else if (beatsUsed - currentBeat < note.beats) {
            beatsUsed = note.beats;
            while (part.data.notes[index + 1] && beatsUsed > 0) {
                if (part.data.notes[index + 1].beats > beatsUsed) {
                    part.data.notes[index + 1].beats -= beatsUsed;
                    part.data.notes[index + 1].rest = true;
                    break;
                }
                else {
                    beatsUsed -= part.data.notes[index + 1].beats;
                    part.data.notes.splice(index + 1, 1);
                }
            }
        }
    }
    else {
        var newBeats;
        //add quarter note rests to take up needed space
        while (currentBeat > beatsUsed) {
            newBeats = Math.min(1, currentBeat - beatsUsed);
            part.data.notes.push({rest:true, beats: newBeats});
            beatsUsed += newBeats;
        }
        part.data.notes.push(note);
    }
};

OMusicPlayer.prototype.makeAudioNodesForPart = function (part) {

    var p = this;
    part.panner = p.context.createStereoPanner();
    part.gain = p.context.createGain();
    part.preFXGain = p.context.createGain();
    part.postFXGain = part.gain;
    part.preFXGain.connect(part.postFXGain);
    part.gain.connect(part.panner);
    part.panner.connect(part.section.song.preFXGain);
    part.gain.gain.setValueAtTime(part.data.audioParams.gain, p.context.currentTime);
    part.panner.pan.setValueAtTime(part.data.audioParams.pan, p.context.currentTime);

    for (var i = 0; i < part.data.fx.length; i++) {
        p.makeFXNodeForPart(part.data.fx[i], part);        
    }
    
    if (part.data.soundSet.url && part.data.soundSet.url.startsWith("PRESET_OSC")) {
        p.makeOsc(part);
    }
    else if (part.data.soundSet.patch) {
        p.makeSynth(part)
    }
};

OMusicPlayer.prototype.makeAudioNodesForSong = function (song) {
    var p = this;
    song.preFXGain = p.context.createGain();
    song.postFXGain = p.context.createGain();
    song.preFXGain.connect(song.postFXGain);
    song.postFXGain.connect(p.context.destination);
        
    if (song.data.fx) {
        for (var i = 0; i < song.data.fx.length; i++) {
            p.makeFXNodeForPart(song.data.fx[i], song);        
        }
    }    
    song.madeAudioNodes = true;
};


OMusicPlayer.prototype.getSoundSetForSoundFont = function (name, url) {
  return {"name": name,  "prefix": url, "url": url,
            "type": "SOUNDSET", "soundFont": true, "lowNote": 21, "postfix": "", "chromatic": true, "defaultSurface": "PRESET_VERTICAL", "data": [ { "url": "A0.mp3", "name": "A0" }, { "url": "Bb0.mp3", "name": "Bb0" }, { "url": "B0.mp3", "name": "B0" }, { "url": "C1.mp3", "name": "C1" }, { "url": "Db1.mp3", "name": "Db1" }, { "url": "D1.mp3", "name": "D1" }, { "url": "Eb1.mp3", "name": "Eb1" }, { "url": "E1.mp3", "name": "E1" }, { "url": "F1.mp3", "name": "F1" }, { "url": "Gb1.mp3", "name": "Gb1" }, { "url": "G1.mp3", "name": "G1" }, { "url": "Ab1.mp3", "name": "Ab1" }, { "url": "A1.mp3", "name": "A1" }, { "url": "Bb1.mp3", "name": "Bb1" }, { "url": "B1.mp3", "name": "B1" }, { "url": "C2.mp3", "name": "C2" }, { "url": "Db2.mp3", "name": "Db2" }, { "url": "D2.mp3", "name": "D2" }, { "url": "Eb2.mp3", "name": "Eb2" }, { "url": "E2.mp3", "name": "E2" }, { "url": "F2.mp3", "name": "F2" }, { "url": "Gb2.mp3", "name": "Gb2" }, { "url": "G2.mp3", "name": "G2" }, { "url": "Ab2.mp3", "name": "Ab2" }, { "url": "A2.mp3", "name": "A2" }, { "url": "Bb2.mp3", "name": "Bb2" }, { "url": "B2.mp3", "name": "B2" }, { "url": "C3.mp3", "name": "C3" }, { "url": "Db3.mp3", "name": "Db3" }, { "url": "D3.mp3", "name": "D3" }, { "url": "Eb3.mp3", "name": "Eb3" }, { "url": "E3.mp3", "name": "E3" }, { "url": "F3.mp3", "name": "F3" }, { "url": "Gb3.mp3", "name": "Gb3" }, { "url": "G3.mp3", "name": "G3" }, { "url": "Ab3.mp3", "name": "Ab3" }, { "url": "A3.mp3", "name": "A3" }, { "url": "Bb3.mp3", "name": "Bb3" }, { "url": "B3.mp3", "name": "B3" }, { "url": "C4.mp3", "name": "C4" }, { "url": "Db4.mp3", "name": "Db4" }, { "url": "D4.mp3", "name": "D4" }, { "url": "Eb4.mp3", "name": "Eb4" }, { "url": "E4.mp3", "name": "E4" }, { "url": "F4.mp3", "name": "F4" }, { "url": "Gb4.mp3", "name": "Gb4" }, { "url": "G4.mp3", "name": "G4" }, { "url": "Ab4.mp3", "name": "Ab4" }, { "url": "A4.mp3", "name": "A4" }, { "url": "Bb4.mp3", "name": "Bb4" }, { "url": "B4.mp3", "name": "B4" }, { "url": "C5.mp3", "name": "C5" }, { "url": "Db5.mp3", "name": "Db5" }, { "url": "D5.mp3", "name": "D5" }, { "url": "Eb5.mp3", "name": "Eb5" }, { "url": "E5.mp3", "name": "E5" }, { "url": "F5.mp3", "name": "F5" }, { "url": "Gb5.mp3", "name": "Gb5" }, { "url": "G5.mp3", "name": "G5" }, { "url": "Ab5.mp3", "name": "Ab5" }, { "url": "A5.mp3", "name": "A5" }, { "url": "Bb5.mp3", "name": "Bb5" }, { "url": "B5.mp3", "name": "B5" }, { "url": "C6.mp3", "name": "C6" }, { "url": "Db6.mp3", "name": "Db6" }, { "url": "D6.mp3", "name": "D6" }, { "url": "Eb6.mp3", "name": "Eb6" }, { "url": "E6.mp3", "name": "E6" }, { "url": "F6.mp3", "name": "F6" }, { "url": "Gb6.mp3", "name": "Gb6" }, { "url": "G6.mp3", "name": "G6" }, { "url": "Ab6.mp3", "name": "Ab6" }, { "url": "A6.mp3", "name": "A6" }, { "url": "Bb6.mp3", "name": "Bb6" }, { "url": "B6.mp3", "name": "B6" }, { "url": "C7.mp3", "name": "C7" }, { "url": "Db7.mp3", "name": "Db7" }, { "url": "D7.mp3", "name": "D7" }, { "url": "Eb7.mp3", "name": "Eb7" }, { "url": "E7.mp3", "name": "E7" }, { "url": "F7.mp3", "name": "F7" }, { "url": "Gb7.mp3", "name": "Gb7" }, { "url": "G7.mp3", "name": "G7" }, { "url": "Ab7.mp3", "name": "Ab7" }, { "url": "A7.mp3", "name": "A7" }, { "url": "Bb7.mp3", "name": "Bb7" }, { "url": "B7.mp3", "name": "B7" }, { "url": "C8.mp3", "name": "C8" } ] }  
};


OMusicPlayer.prototype.mutePart = function (part, mute) {
    if (typeof part === "string") {
        part = this.getPart(part);
    }

    if (!part) {
        return
    }

    part.data.audioParams.mute = mute || false;
    this.song.partMuteChanged(part);

    if (part.osc && part.data.audioParams.mute) {
        part.preFXGain.gain.cancelScheduledValues(this.context.currentTime)
        part.preFXGain.gain.setValueAtTime(0, this.context.currentTime)
    }
    if (part.inputSource) {
        if (part.data.audioParams.mute) {
            part.inputSource.disconnect(part.preFXGain)
        }
        else {
            part.inputSource.connect(part.preFXGain)
        }
    }
};

OMusicPlayer.prototype.getSound = function (partName, soundName) {
    var part = this.getPart(partName);
    if (!part) {
        return;
    }
    
    var p = this;
    if (part.data.tracks) {
        for (var i = 0; i < part.data.tracks.length; i++) {
            if (part.data.tracks[i].name === soundName) {
                
                return {
                    play: function () {
                        p.playSound(part.data.tracks[i].sound, part);
                    }
                };
            }
        }
    }
};

OMusicPlayer.prototype.getPart = function (partName) {
    for (var i = 0; i < this.section.parts.length; i++) {
        if (this.section.parts[i].data.name === partName) {
            return this.section.parts[i];
        }
    }
};

OMusicPlayer.prototype.loadMic = function (part, callback) {
    if (!this.allowMic) {
        return
    }
    var p = this
    navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
        part.inputSource = p.context.createMediaStreamSource(stream)
        if (!part.data.audioParams.mute) {
            part.inputSource.connect(part.preFXGain)
        }
        if (callback) callback()
    })
}

OMusicPlayer.prototype.disconnectMic = function (part) {
    if (!part.inputSource) {
        return
    }
    try {
        part.inputSource.disconnect(part.preFXGain)
    }
    catch (e) {}
    part.inputSource.mediaStream.getTracks().forEach(function(track) {
        track.stop();
    });
}



OMusicPlayer.prototype.noteOn = function (note, part, velocity) {
    if (this.disableAudio) {
        return
    }

    if (this.context && this.context.state === "suspended") {
        this.context.resume();
    }
    
    if (part.osc) {
        part.baseFrequency = this.makeFrequency(note.scaledNote);
        part.osc.frequency.setValueAtTime(
                part.baseFrequency * part.data.audioParams.warp, this.context.currentTime);
        part.preFXGain.gain.setTargetAtTime(part.data.audioParams.gain, this.context.currentTime, 0.003);
    }
    else if (part.synth) {
        part.baseFrequency = this.makeFrequency(note.scaledNote);
        part.synth.lastFrequency = part.baseFrequency * part.data.audioParams.warp
        part.synth.onNoteOn(part.synth.lastFrequency, velocity)
        part.notesPlaying[note.scaledNote] = part.synth.lastFrequency
    }
    else {
        //var sound = this.getSound(part.data.soundSet, notes[0]);
        note.sound = this.getSoundURL(part.soundSet, note);
        part.notesPlaying[note.scaledNote] = this.playSound(note.sound, part, undefined, velocity / 120);
    }
        
};

OMusicPlayer.prototype.noteOff = function (note, part) {
  
    if (!part.notesPlaying[note.scaledNote]) {
        return
    }
    else if (part.synth) {
        part.synth.onNoteOff(part.notesPlaying[note.scaledNote])
    }
    else if (part.osc) {
        part.preFXGain.gain.setTargetAtTime(0,
                this.context.currentTime, 0.003);
    }  
    else {
        part.notesPlaying[note.scaledNote].bufferGain.gain.setTargetAtTime(0, this.context.currentTime, 0.001);
        part.notesPlaying[note.scaledNote].stop(this.context.currentTime + 0.015);
    }

    delete part.notesPlaying[note.scaledNote]
    
    part.nextBeat = 0;
    part.currentI = -1;
    
};
if (!omg.ui)
    omg.ui = {};

omg.ui.omgUrl = "/omg-music/"; // omg-music/";

omg.ui.noteImageUrls = [[2, "note_half", "note_rest_half"],
    [1.5, "note_dotted_quarter", "note_rest_dotted_quarter"],
    [1, "note_quarter", "note_rest_quarter"],
    [0.75, "note_dotted_eighth", "note_rest_dotted_eighth"],
    [0.5, "note_eighth", "note_rest_eighth"], //, "note_eighth_upside"],
    [0.375, "note_dotted_sixteenth", "note_rest_dotted_sixteenth"],
    [0.25, "note_sixteenth", "note_rest_sixteenth"], //, "note_sixteenth_upside"],
    [0.125, "note_thirtysecond", "note_rest_thirtysecond"],
    [-1, "note_no_file", "note_no_file"]];
    
omg.ui.noteNames = ["C-", "C#-", "D-", "Eb-", "E-", "F-", "F#-", "G-", "G#-", "A-", "Bb-", "B-",
    "C0", "C#0", "D0", "Eb0", "E0", "F0", "F#0", "G0", "G#0", "A0", "Bb0", "B0",
    "C1", "C#1", "D1", "Eb1", "E1", "F1", "F#1", "G1", "G#1", "A1", "Bb1", "B1",
    "C2", "C#2", "D2", "Eb2", "E2", "F2", "F#2", "G2", "G#2", "A2", "Bb2", "B2",
    "C3", "C#3", "D3", "Eb3", "E3", "F3", "F#3", "G3", "G#3", "A3", "Bb3", "B3",
    "C4", "C#4", "D4", "Eb4", "E4", "F4", "F#4", "G4", "G#4", "A4", "Bb4", "B4",
    "C5", "C#5", "D5", "Eb5", "E5", "F5", "F#5", "G5", "G#5", "A5", "Bb5", "B5",
    "C6", "C#6", "D6", "Eb6", "E6", "F6", "F#6", "G6", "G#6", "A6", "Bb6", "B6",
    "C7", "C#7", "D7", "Eb7", "E7", "F7", "F#7", "G7", "G#7", "A7", "Bb7", "B7",
    "C8"];

omg.ui.keys = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];
    
omg.ui.scales = [{name: "Major", value: [0, 2, 4, 5, 7, 9, 11]},
        {name: "Minor", value: [0, 2, 3, 5, 7, 8, 10]},
        {name: "Pentatonic", value: [0, 2, 5, 7, 9]},
        {name: "Blues", value: [0, 3, 5, 6, 7, 10]},
        {name: "Harmonic Minor", value: [0, 2, 3, 5, 7, 8, 11]},
        {name: "Mixolydian", value: [0, 2, 4, 5, 7, 9, 10]},
        {name: "Chromatic", value: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
    ];

omg.ui.getKeyCaption = function (keyParams) {
    var scaleName = "Major";
    if (keyParams && keyParams.scale) {
        omg.ui.scales.forEach(function (scale) {
            if (scale.value.join() == keyParams.scale.join())
                scaleName = scale.name;
        });
    }
    return omg.ui.keys[(keyParams.rootNote || 0)] + " " + scaleName;
};

omg.ui.soundFontNames = ["accordion","acoustic_bass","acoustic_grand_piano","acoustic_guitar_nylon","acoustic_guitar_steel","agogo","alto_sax","applause","bagpipe","banjo","baritone_sax","bassoon","bird_tweet","blown_bottle","brass_section","breath_noise","bright_acoustic_piano","celesta","cello","choir_aahs","church_organ","clarinet","clavinet","contrabass","distortion_guitar","drawbar_organ","dulcimer","electric_bass_finger","electric_bass_pick","electric_grand_piano","electric_guitar_clean","electric_guitar_jazz","electric_guitar_muted","electric_piano_1","electric_piano_2","english_horn","fiddle","flute","french_horn","fretless_bass","fx_1_rain","fx_2_soundtrack","fx_3_crystal","fx_4_atmosphere","fx_5_brightness","fx_6_goblins","fx_7_echoes","fx_8_scifi","glockenspiel","guitar_fret_noise","guitar_harmonics","gunshot","harmonica","harpsichord","helicopter","honkytonk_piano","kalimba","koto","lead_1_square","lead_2_sawtooth","lead_3_calliope","lead_4_chiff","lead_5_charang","lead_6_voice","lead_7_fifths","lead_8_bass__lead","marimba","melodic_tom","music_box","muted_trumpet","oboe","ocarina","orchestra_hit","orchestral_harp","overdriven_guitar","pad_1_new_age","pad_2_warm","pad_3_polysynth","pad_4_choir","pad_5_bowed","pad_6_metallic","pad_7_halo","pad_8_sweep","pan_flute","percussive_organ","piccolo","pizzicato_strings","recorder","reed_organ","reverse_cymbal","rock_organ","seashore","shakuhachi","shamisen","shanai","sitar","slap_bass_1","slap_bass_2","soprano_sax","steel_drums","string_ensemble_1","string_ensemble_2","synth_bass_1","synth_bass_2","synth_brass_1","synth_brass_2","synth_choir","synth_drum","synth_strings_1","synth_strings_2","taiko_drum","tango_accordion","telephone_ring","tenor_sax","timpani","tinkle_bell","tremolo_strings","trombone","trumpet","tuba","tubular_bells","vibraphone","viola","violin","voice_oohs","whistle","woodblock","xylophone"]


omg.util.getSavedSound = function (sound, callback) {
    if (omg.util.noDB) {
        callback();
        return;
    }
    try {
    var request = indexedDB.open("omg_sounds", 1);
    request.onupgradeneeded = function (e) {
        var db = e.target.result;
        db.createObjectStore("saved_sounds");
    };
    request.onsuccess = function(e) {
        var db = e.target.result;
        var trans = db.transaction("saved_sounds");
        var request = trans.objectStore("saved_sounds").get(sound);
        request.onsuccess = function (e) {
            callback(request.result);
        }
    };
    request.onerror = function (e) {
        omg.util.noDB = true;
        callback();
    };
    } catch (e) {
        console.warn("getSavedSound threw an error", e);
        omg.util.noDB = true;
        callback();
    }
};

omg.util.saveSound = function (sound, data) {
    if (omg.util.noDB) return;
    try {
    indexedDB.open("omg_sounds").onsuccess = function(e) {
        var db = e.target.result;
        var trans = db.transaction(["saved_sounds"], "readwrite");
        trans.objectStore("saved_sounds").put(data, sound);
    };
    } catch (e) {console.log(e);}
};


omg.ui.getImageForNote = function (note, highContrast) {

    var index = (note.rest ? 2 : 0) + (highContrast ? 1 : 0)
    var draw_noteImage = omg.ui.noteImages[8][index];
    if (note.beats == 2.0) {
        draw_noteImage = omg.ui.noteImages[0][index];
    }
    if (note.beats == 1.5) {
        draw_noteImage = omg.ui.noteImages[1][index];
    }
    if (note.beats == 1.0) {
        draw_noteImage = omg.ui.noteImages[2][index];
    }
    if (note.beats == 0.75) {
        draw_noteImage = omg.ui.noteImages[3][index];
    }
    if (note.beats == 0.5) {
        draw_noteImage = omg.ui.noteImages[4][index];
    }
    if (note.beats == 0.375) {
        draw_noteImage = omg.ui.noteImages[5][index];
    }
    if (note.beats == 0.25) {
        draw_noteImage = omg.ui.noteImages[6][index];
    }
    if (note.beats == 0.125) {
        draw_noteImage = omg.ui.noteImages[7][index];
    }

    return draw_noteImage;

};

omg.ui.getNoteImageUrl = function (i, j, highContrast) {
    var fileName = omg.ui.noteImageUrls[i][j];
    if (fileName) {
        return "img/notes/" + (highContrast ? "w_" : "") + fileName + ".png";
    }
};

omg.ui.setupNoteImages = function () {
    if (omg.ui.noteImages)
        return;

    if (!omg.ui.noteImageUrls)
        omg.ui.getImageUrlForNote({beats: 1});

    var noteImages = [];
    var hasImgs = true;
    var img, img2;
    for (var i = 0; i < omg.ui.noteImageUrls.length; i++) {
        img = document.getElementById("omg_" + omg.ui.noteImageUrls[i][1]);
        img2 = document.getElementById("omg_" + omg.ui.noteImageUrls[i][2]);
        if (img && img2) {
            noteImages.push([img, img, img2, img2]);
        }
        else {
            hasImgs = false;
            break;
        }
    }

    if (hasImgs) {
        omg.ui.noteImages = noteImages;
        return;
    }

    noteImages = [];
    var loadedNotes = 0;
    var areAllNotesLoaded = function () {
        loadedNotes++;
        if (loadedNotes == omg.ui.noteImageUrls.length * 4) {
            omg.ui.noteImages = noteImages;
        }
    };

    for (var i = 0; i < omg.ui.noteImageUrls.length; i++) {

        var noteImage = new Image();
        noteImage.onload = areAllNotesLoaded;
        noteImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 1);

        var noteWhiteImage = new Image();
        noteWhiteImage.onload = areAllNotesLoaded;
        noteWhiteImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 1, true);

        var restImage = new Image();
        restImage.onload = areAllNotesLoaded;
        restImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 2);

        var restWhiteImage = new Image();
        restWhiteImage.onload = areAllNotesLoaded;
        restWhiteImage.src = omg.ui.omgUrl + omg.ui.getNoteImageUrl(i, 2, true);

        var imageBundle = [noteImage, noteWhiteImage, restImage, restWhiteImage];
        var upsideDown = omg.ui.getNoteImageUrl(i, 3);
        if (upsideDown) {
            var upsideImage = new Image();
            upsideImage.src = omg.ui.omgUrl + upsideDown;
            imageBundle.push(upsideImage);
        }

        noteImages.push(imageBundle);
    }
};

omg.ui.getTextForNote = function (note, highContrast) {

    switch (note.beats) {
        case 4.0: return note.rest ? "\u{1D13B}" : "\u{1D15D}";
        case 3.75: return note.rest ? "\u{1D13C} \u{1D13D} \u{1D13E} \u{1D13F}" : "\u{1D15E} \u{1D16D} \u{1D16D} \u{1D16D}";
        case 3.5: return note.rest ? "\u{1D13C} \u{1D13D} \u{1D13E}" : "\u{1D15E} \u{1D16D} \u{1D16D}";
        case 3.25: return note.rest ? "\u{1D13C} \u{1D13D} \u{1D13F}" : "\u{1D15E} \u{1D16D} \u{1D161}";
        case 3.0: return note.rest ? "\u{1D13C} \u{1D13D}" : "\u{1D15E} \u{1D16D}";
        case 2.75: return note.rest ? "\u{1D13C} \u{1D13E} \u{1D13F}" : "\u{1D15E} \u{1D160} \u{1D161}";
        case 2.5: return note.rest ? "\u{1D13C} \u{1D13E}" : "\u{1D15E} \u{1D160}";
        case 2.25: return note.rest ? "\u{1D13C} \u{1D13F}" : "\u{1D15E} \u{1D161}";
        case 2.0: return note.rest ? "\u{1D13C}" : "\u{1D15E}";
        case 1.75: return note.rest ? "\u{1D13D} \u{1D13E} \u{1D13F}" : "\u{1D15F} \u{1D16D} \u{1D16D}";
        case 1.5: return note.rest ? "\u{1D13D} \u{1D13E}" : "\u{1D15F} \u{1D16D}";
        case 1.25: return note.rest ? "\u{1D13D} \u{1D13F}" : "\u{1D15F} \u{1D161}";
        case 1.0: return note.rest ? "\u{1D13D}" : "\u{1D15F}";
        case 0.75: return note.rest ? "\u{1D13E} \u{1D13F}" : "\u{1D160} \u{1D16D}";
        case 0.5: return note.rest ? "\u{1D13E}" : "\u{1D160}";
        case 0.375: return note.rest ? "\u{1D13F} \u{1D140}" : "\u{1D161} \u{1D16D}";
        case 0.25: return note.rest ? "\u{1D13F}" : "\u{1D161}";
        case 0.125: return note.rest ? "\u{1D140}" : "\u{1D162}";
    }

    return note.beats > 4 ? (note.rest ? "\u{1D13B} \u{1D144}" : "\u{1D15D} \u{1D144}") : "?";
};

/*omg.ui.splitInts = function (string) {
    var ints = string.split(",");
    for (var i = 0; i < ints.length; i++) {
        ints[i] = parseInt(ints[i]);
    }
    return ints;
};

omg.ui.getChordText = function (chord, ascale) {
    while (chord < 0) {
        chord += ascale.length;
    }
    while (chord >=  ascale.length) {
        chord -= ascale.length;
    }
    var chordInterval = ascale[chord];
    if (chordInterval === 0) {
        return "I";
    }
    else if (chordInterval === 2) return "II";
    else if (chordInterval === 3 || chordInterval === 4) return "III";
    else if (chordInterval === 5) return "IV";
    else if (chordInterval === 6) return "Vb";
    else if (chordInterval === 7) return "V";
    else if (chordInterval === 8 || chordInterval === 9) return "VI";
    else if (chordInterval === 10 || chordInterval === 11) return "VII";
    return "?";
}

omg.ui.getChordProgressionText = function (section) {
    var chordsText = "";
    if (section.data.chordProgression) {
        var chords = section.data.chordProgression;
        for (var i = 0; i < chords.length; i++) {
            if (i > 0) {
                chordsText += " - ";
            }
            chordsText += omg.ui.getChordText(chords[i], section.data.ascale);
        }
    }  
    return chordsText;
};*/


omg.ui.useUnicodeNotes = navigator.userAgent.indexOf("Android") === -1 
    && navigator.userAgent.indexOf("iPhone") === -1 
    && navigator.userAgent.indexOf("iPad") === -1 
    && navigator.userAgent.indexOf("Mac OS X") === -1 ;
if (!omg.ui.useUnicodeNotes) {
    omg.ui.setupNoteImages();
}

