const noop = () => {};

export class PexRtcWrapper {
  constructor(videoElement, confNode, confName, displayName, pin, bandwidth = "1264") {
    this.videoElement = videoElement;
    this.confNode = confNode;
    this.confName = confName;
    this.displayName = displayName;
    this.pin = pin;
    this.bandwidth = parseInt(bandwidth);

    this.pexrtc = new PexRTC();

    this.attachEvents();

    this._poster = "";

    console.debug(`Video Element: ${this.videoElement}`);
    console.debug(`Bandwidth: ${this.bandwidth}`);
  }

  _hangupHandler(event) {
    this.pexrtc.disconnect();
    this.videoElement.src = "";
  }

  _setupHandler(videoUrl, pinStatus) {
    console.debug({pinStatus});
    this.pexrtc.connect(this.pin);
  }

  _errorHandler(err) {
      console.error({err});
  }

  _connectHandler(videoUrl) {
    this._poster = this.videoElement.poster;
    this.videoElement.poster = "";
    if (typeof(MediaStream) !== "undefined" && videoUrl instanceof MediaStream) {
        this.videoElement.srcObject = videoUrl;
    }
    else {
        this.videoElement.src = videoUrl;
    }
  }

  _disconnectHandler(reason) {
    console.debug({reason});
    window.removeEventListener('beforeunload', (...args) => this._hangupHandler(...args));
    this.disconnect();
    this.videoElement.poster = this._poster;
  }

  attachEvents() {
    window.addEventListener('beforeunload', (...args) => this._hangupHandler(...args));
    this.pexrtc.onSetup = (...args) => this._setupHandler(...args);
    this.pexrtc.onError = (...args) => this._errorHandler(...args);
    this.pexrtc.onConnect = (...args) => this._connectHandler(...args);
    this.pexrtc.onDisconnect = (...args) => this._disconnectHandler(...args);
  }

  makeCall() {
    this.pexrtc.makeCall(
      this.confNode, this.confName, this.displayName, this.bandwidth);
    return this;
  }

  onMuteAudioChange(isMuted) {}

  toggleMuteAudio(state = null) {
    let args = [];
    if (typeof(state) === "boolean") {
        args.push(state);
    }
    this.onMuteAudioChange(this.pexrtc.muteAudio(...args));
    return this;
  }

  disconnect() {
    this.pexrtc.disconnect();
    return this;
  }

  disconnectAll() {
    this.pexrtc.disconnectAll();
    return this;
  }
}
