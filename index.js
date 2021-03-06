AFRAME.registerComponent('spin-frames', {
  multiple: true,
  schema: {
    // configurable options
    urls: { type: 'array' },
    vifnum: { type: 'string' },
    folder: { type: 'string' },
    sensitivity: { default: 3.2 },
    eye: { type: 'string', default: 'left' },
    stereo: { type: 'string', default: 'both' },
    frameIndex: { type: 'number', default: 24 },
    clickToSpin: { type: 'boolean', default: false },

    // default flags
    loading: { default: true },
    enabled: { default: true },
    initTick: { type: 'boolean', default: false }
  },
  init: function() {
    this.textures = [];
    this.IMAGECOUNT = 36;
    this.FRAMES = 88;
    this.COUNTER = 2112; // starting image * FRAMES

    this.startX = 0;
    this.lookVector = new THREE.Vector2();
    this.mouseDown = false;
    this.touchDown = false;
    this.bindMethods();
    if (!this.isMobile()) {
      var scene = document.getElementById('a-scene');
      scene.setAttribute('vr-mode-ui', { enabled: false });
    }
  },

  update: function() {
    this.loadImages();
    this.updateMeshTexture(this.data.frameIndex);
    this.setStereoLayer();
  },

  play: function() {
    this.addEventListeners();
  },

  pause: function() {
    this.removeEventListeners();
    this.lookVector.set(0, 0);
  },

  remove: function() {
    this.pause();
  },

  bindMethods: function() {
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.setStereoLayer = this.setStereoLayer.bind(this);
    this.onExitVr = this.onExitVr.bind(this);
    this.onEnterVr = this.onEnterVr.bind(this);
  },

  addEventListeners: function() {
    const canvasEl = this.el.sceneEl.canvas;
    const aScene = document.querySelector('a-scene');
    // Mouse events
    canvasEl.addEventListener('mousedown', this.onMouseDown, false);
    canvasEl.addEventListener('mousemove', this.onMouseMove, false);
    canvasEl.addEventListener('mouseup', this.onMouseUp, false);

    // Touch events
    canvasEl.addEventListener('touchstart', this.onTouchStart, false);
    canvasEl.addEventListener('touchmove', this.onTouchMove, false);
    canvasEl.addEventListener('touchend', this.onTouchEnd, false);

    aScene.addEventListener('enter-vr', this.onEnterVr, false);
    aScene.addEventListener('exit-vr', this.onExitVr, false);
  },

  removeEventListeners: function() {
    const canvasEl = this.el.sceneEl && this.el.sceneEl.canvas;
    if (canvasEl) {
      canvasEl.removeEventListener('mousedown', this.onMouseDown);
      canvasEl.removeEventListener('mousemove', this.onMouseMove);
      canvasEl.removeEventListener('mouseup', this.onMouseUp);

      canvasEl.removeEventListener('touchstart', this.onTouchStart);
      canvasEl.removeEventListener('touchmove', this.onTouchMove);
      canvasEl.removeEventListener('touchend', this.onTouchEnd);
    }
  },

  tick: function(time, delta) {
    if (this.data.initTick) {
      this.updateImageByFrame(time, delta);
    }
  },

  isMobile: function() {
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      return true;
    }
    return false;
  },

  loadImages: function() {
    const loader = new THREE.TextureLoader();
    loader.setPath(this.data.folder);

    if (this.data.urls.length) {
      return this.data.urls.map(path => {
        let texture = loader.load(path);
        texture.minFilter = THREE.LinearFilter;
        this.textures.push(texture);
      });
    }

    for (let i = 10; i <= 360; i += 10) {
      let num = i.toString();
      let paddedNum = '000'.substring(num.length, 4) + num;
      let path = `/AIL${this.data.vifnum}_${this.data.eye}_${paddedNum}.png`;
      let texture = loader.load(path);
      this.textures.push(texture);
    }
  },

  updateMeshTexture: function(index) {
    const mesh = this.el.getObject3D('mesh');
    if (!mesh || !mesh.material) return;
    mesh.material.map = this.textures[index];
  },

  updateImageByFrame: function(time, delta) {
    if (!this.data.clickToSpin) {
      // Calculate rotation if dragging
      this.COUNTER += Math.round(time);
      // Avoid negative modulus
      this.data.frameIndex =
        ((Math.round(this.COUNTER * (1 / this.FRAMES)) % this.IMAGECOUNT) +
          this.IMAGECOUNT) %
        this.IMAGECOUNT;
    } else {
      // Calculate rotation for auto spin
      this.COUNTER += Math.round(delta);
      this.data.frameIndex =
        Math.round(this.COUNTER * (1 / this.FRAMES)) % this.IMAGECOUNT;
    }
    this.updateMeshTexture(this.data.frameIndex);
  },

  isRotationActive: function() {
    return this.data.enabled && (this.mouseDown || this.touchDown);
  },

  rotateObject: function(clientX) {
    if (clientX === this.startX) return;

    const currentX = clientX;
    let direction = 1;

    if (currentX > this.startX) {
      direction = -1;
    }

    const amountMoved =
      Math.abs(currentX - this.startX) * direction * this.data.sensitivity;
    this.updateImageByFrame(amountMoved);
    this.startX = currentX;
  },

  onMouseMove: function(event) {
    if (!this.data.enabled || !this.mouseDown || this.data.clickToSpin) return;

    const previousMouseEvent = this.previousMouseEvent;

    let movementX;
    movementX = event.movementX || event.mozMovementX || 0;

    if (movementX === undefined) {
      movementX = event.screenX - previousMouseEvent.screenX;
    }
    this.previousMouseEvent = event;

    if (this.isRotationActive()) {
      this.lookVector.x += movementX;
      this.rotateObject(this.lookVector.x);
    }
  },

  onMouseDown: function(event) {
    this.mouseDown = true;
    this.previousMouseEvent = event;
  },

  onMouseUp: function() {
    this.mouseDown = false;
    if (!this.data.clickToSpin) return;
    this.data.initTick
      ? (this.data.initTick = false)
      : (this.data.initTick = true);
  },

  // TOUCH CONTROLS
  onTouchMove: function(event) {
    if (!this.data.enabled || !this.touchDown) return;

    const previousTouchEvent = this.previousTouchEvent;
    const touch = event.touches[0];
    const movementX = touch.screenX - previousTouchEvent.touches[0].screenX;

    this.previousTouchEvent = event;

    if (this.isRotationActive()) {
      this.lookVector.x += movementX;
      this.rotateObject(this.lookVector.x);
    }
  },

  onTouchStart: function(event) {
    this.touchDown = true;
    this.previousTouchEvent = event;
  },

  onTouchEnd: function() {
    this.touchDown = false;
  },

  onEnterVr: function() {
    this.setStereoLayer('inVrMode');
  },

  onExitVr: function() {
    window.location.reload(true);
  },

  setStereoLayer: function(event) {
    const data = this.data;
    const obj3D = this.el.object3D.children[0];

    if (data.stereo === 'both' || data.stereo === 'left') {
      obj3D.layers.set(0);
    } else if (data.stereo === 'right') {
      obj3D.layers.set(2);
    }

    if (event === 'inVrMode' && data.stereo === 'both') {
      obj3D.layers.set(1);
    }
  }
});

AFRAME.registerComponent('cursor-listener', {
  multiple: true,
  schema: {
    clicked: { type: 'boolean', default: false }
  },
  init: function() {
    this.bindMethods();
    this.addEventListeners();

    // variables
    this.clicked = false;
    this.currentFrame = '';
  },
  bindMethods: function() {
    this.handleClick = this.handleClick.bind(this);
  },
  addEventListeners: function() {
    this.el.addEventListener('click', this.handleClick, false);
  },
  handleClick: function(event) {
    const camera = document.getElementById('camera');
    console.log(event);
    console.log(this.data);
  }
});
