export default (function() {
  // Adding event listner to the window element in order to accept user input. Controls are "W,A,S,D,Space";

  window.addEventListener("resize",()=>{
    canvas.height = window.innerHeight-5;
    canvas.width = window.innerWidth-275;
    let chatWindow = document.getElementById("chatWindow");
    chatWindow.style.height = window.innerHeight-6+"px";
  });

  document
    .getElementById("gameCanvas")
    .addEventListener("keydown", function(e) {
      if ([32, 65, 68, 87, 83,16].includes(e.keyCode)) {
        e.preventDefault();
        window.keys = window.keys || {};
        window.keys[e.keyCode] = e.type == "keydown";
      } else {
        return;
      }
    });

  document.getElementById("gameCanvas").addEventListener("keyup", function(e) {
    if ([32, 65, 68, 87, 83,16].includes(e.keyCode)) {
      window.keys[e.keyCode] = e.type == "keydown";
    } else {
      return;
    }
  });

  //Initializing Game Setup
  let canvas;
  let ctx;
  let FPS = 30;
  let World = {
    height: 5000,
    width: 5000
  };
  let Viewport = {};
  canvas = document.getElementById("gameCanvas");	
  ctx = canvas.getContext("2d");
  canvas.height = window.innerHeight-5;
  canvas.width = window.innerWidth-275;

  return {
    canvas,
    ctx,
    FPS,
    World,
    Viewport
  };
})();
