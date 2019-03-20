!function(t){var e={};function i(o){if(e[o])return e[o].exports;var n=e[o]={i:o,l:!1,exports:{}};return t[o].call(n.exports,n,n.exports,i),n.l=!0,n.exports}i.m=t,i.c=e,i.d=function(t,e,o){i.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},i.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},i.t=function(t,e){if(1&e&&(t=i(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(i.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var n in t)i.d(o,n,function(e){return t[e]}.bind(null,n));return o},i.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return i.d(e,"a",e),e},i.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},i.p="",i(i.s=0)}([function(t,e){AFRAME.registerComponent("spin-frames",{multiple:!0,schema:{vifnum:{type:"string"},folder:{type:"string"},sensitivity:{default:3.2},frameIndex:{type:"number",default:24},clickToSpin:{type:"boolean",default:!1},stereo:{type:"string",default:"left"},loading:{default:!0},enabled:{default:!0},initTick:{type:"boolean",default:!1}},init:function(){this.textures=[],this.IMAGECOUNT=36,this.FRAMES=88,this.COUNTER=2112,this.startX=0,this.lookVector=new THREE.Vector2,this.mouseDown=!1,this.touchDown=!1,this.bindMethods()},update:function(){this.loadImages(),this.updateMeshTexture(this.data.frameIndex),this.setStereoLayer()},play:function(){this.addEventListeners()},pause:function(){this.removeEventListeners(),this.lookVector.set(0,0)},remove:function(){this.pause()},bindMethods:function(){this.onMouseDown=this.onMouseDown.bind(this),this.onMouseMove=this.onMouseMove.bind(this),this.onMouseUp=this.onMouseUp.bind(this),this.onTouchStart=this.onTouchStart.bind(this),this.onTouchMove=this.onTouchMove.bind(this),this.onTouchEnd=this.onTouchEnd.bind(this),this.setStereoLayer=this.setStereoLayer.bind(this),this.onExitVr=this.onExitVr.bind(this),this.onEnterVr=this.onEnterVr.bind(this)},addEventListeners:function(){var t=this.el.sceneEl.canvas,e=document.querySelector("a-scene");t.addEventListener("mousedown",this.onMouseDown,!1),t.addEventListener("mousemove",this.onMouseMove,!1),t.addEventListener("mouseup",this.onMouseUp,!1),t.addEventListener("touchstart",this.onTouchStart,!1),t.addEventListener("touchmove",this.onTouchMove,!1),t.addEventListener("touchend",this.onTouchEnd,!1),e.addEventListener("enter-vr",this.onEnterVr,!1),e.addEventListener("exit-vr",this.onExitVr,!1)},removeEventListeners:function(){var t=this.el.sceneEl&&this.el.sceneEl.canvas;t&&(t.removeEventListener("mousedown",this.onMouseDown),t.removeEventListener("mousemove",this.onMouseMove),t.removeEventListener("mouseup",this.onMouseUp),t.removeEventListener("touchstart",this.onTouchStart),t.removeEventListener("touchmove",this.onTouchMove),t.removeEventListener("touchend",this.onTouchEnd))},tick:function(t,e){this.data.initTick&&this.updateImageByFrame(t,e)},loadImages:function(){var t=new THREE.TextureLoader;this.textures=[];for(var e=10;e<=360;e+=10){var i=e.toString(),o="000".substring(i.length,4)+i;this.textures.push(t.load("".concat(this.data.folder,"AIL").concat(this.data.vifnum,"_").concat(this.data.stereo,"_").concat(o,".png")))}},updateMeshTexture:function(t){var e=this.el.getObject3D("mesh");e&&e.material&&(e.material.map=this.textures[t])},updateImageByFrame:function(t,e){this.data.clickToSpin?(this.COUNTER+=Math.round(e),this.data.frameIndex=Math.round(this.COUNTER*(1/this.FRAMES))%this.IMAGECOUNT):(this.COUNTER+=Math.round(t),this.data.frameIndex=(Math.round(this.COUNTER*(1/this.FRAMES))%this.IMAGECOUNT+this.IMAGECOUNT)%this.IMAGECOUNT),this.updateMeshTexture(this.data.frameIndex)},isRotationActive:function(){return this.data.enabled&&(this.mouseDown||this.touchDown)},rotateObject:function(t){if(t!==this.startX){var e=t,i=1;e>this.startX&&(i=-1);var o=Math.abs(e-this.startX)*i*this.data.sensitivity;this.updateImageByFrame(o),this.startX=e}},onMouseMove:function(t){if(this.data.enabled&&this.mouseDown&&!this.data.clickToSpin){var e,i=this.previousMouseEvent;void 0===(e=t.movementX||t.mozMovementX||0)&&(e=t.screenX-i.screenX),this.previousMouseEvent=t,this.isRotationActive()&&(this.lookVector.x+=e,this.rotateObject(this.lookVector.x))}},onMouseDown:function(t){this.mouseDown=!0,this.previousMouseEvent=t},onMouseUp:function(){this.mouseDown=!1,this.data.clickToSpin&&(this.data.initTick?this.data.initTick=!1:this.data.initTick=!0)},onTouchMove:function(t){if(this.data.enabled&&this.touchDown){var e=this.previousTouchEvent,i=t.touches[0].screenX-e.touches[0].screenX;this.previousTouchEvent=t,this.isRotationActive()&&(this.lookVector.x+=i,this.rotateObject(this.lookVector.x))}},onTouchStart:function(t){this.touchDown=!0,this.previousTouchEvent=t},onTouchEnd:function(){this.touchDown=!1},onEnterVr:function(){this.setStereoLayer("enter-vr")},onExitVr:function(){window.location.reload(!0)},setStereoLayer:function(t){var e=this.el.object3D.children[0];"left"===this.data.stereo&&e.layers.set(0),"right"===this.data.stereo&&(e.layers.set(2),e.visible=!1),"enter-vr"===t&&("left"===this.data.stereo&&e.layers.set(1),"right"===this.data.stereo&&(e.visible=!0,e.layers.set(2))),"exit-vr"===t&&"right"===this.data.stereo&&(e.visible=!1)}})}]);