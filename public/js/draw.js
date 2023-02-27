'use strict';
let canvas = document.getElementsByClassName('whiteboard')[0];
let context = canvas.getContext('2d');

(function() {

  //const socket = io();
  let colors = document.getElementsByClassName('color');
  let rubber = document.querySelector('#rubber');


  let current = {
    color: 'black',
    erase: false
  };
  let drawing = false;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', onMouseMove, false);
  
  //Touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', onMouseMove, 10, false); 

  for (let i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  rubber.addEventListener('click', ()=>{ current.erase = true }, false);

  socket.on('drawing', onDrawingEvent);
  socket.on('clearCanvas', ()=>{
    context.clearRect(0, 0, canvas.width, canvas.height);
  });


  window.addEventListener('resize', onResize, false);
  onResize();


  function drawLine(x0, y0, x1, y1, color, erase, emit){
    //let sidebarWidth = document.querySelector('.chat-sidebar').clientWidth;
    //let minusX = window.innerWidth*0.2+3;
    let minusX = window.innerWidth*0.2+5;
    let margin = 115;
    if (document.querySelector('.colors').clientWidth >= 361){
      minusX = 5;
      margin = 120;
    }
    if (erase)
      context.clearRect(x0-minusX-25, y0-margin-25, 50, 50);
    else{
      context.beginPath();
      context.moveTo(x0-minusX, y0-margin);
      context.lineTo(x1-minusX, y1-margin);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      context.closePath();
    }


    if (!emit) { return; }
    let w = canvas.width;
    let h = canvas.height;

    socket.emit('drawing', {
      x0: x0 / w,
      y0: y0 / h,
      x1: x1 / w,
      y1: y1 / h,
      color: color,
      erase: erase
    });
  }

  function onMouseDown(e){
    e.preventDefault();
    drawing = true;
    /*current.x = e.clientX;
    current.y = e.clientY;*/
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY; 
  }

  function onMouseUp(e){
    if (!drawing) return; 
    drawing = false;
    //drawLine(current.x, current.y, e.clientX, e.clientY, current.color, current.erase, true);
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, current.erase, true);
  }

  function onMouseMove(e){
    e.preventDefault();
    if (!drawing) return;
    //drawLine(current.x, current.y, e.clientX, e.clientY, current.color, current.erase,true);
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, current.erase,true);
    /*current.x = e.clientX; //update plot(x,y)
    current.y = e.clientY;*/
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY; 
  }

  function onColorUpdate(e){
    current.erase = false;
    current.color = e.target.className.split(' ')[1];
  }

/*   // limit the number of events per second
  function throttle(callback, delay) {
    let previousCall = new Date().getTime();
    return function() {
      let time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  } */

  function onDrawingEvent(data){
    let w = canvas.width;
    let h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.erase);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = document.querySelector('.whiteboard-container').clientWidth;//window.innerWidth/2;
    console.log(document.querySelector('.whiteboard').clientWidth);
    canvas.height = canvas.width/ 2.031;
    //canvas.width = 670;
    //canvas.height = 400;
    canvas.style.position = "relative";
    //canvas.style.left = window.innerWidth/4+"px";
  }

})();
