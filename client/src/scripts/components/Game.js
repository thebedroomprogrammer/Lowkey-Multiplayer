export default (function() {
  // Adding event listner to the window element in order to accept user input. Controls are "W,A,S,D,Space";
  window.addEventListener("keydown", function(e) {
    if ([32, 65, 68, 87, 83].includes(e.keyCode)) {
      e.preventDefault();
      window.keys = window.keys || {};
      window.keys[e.keyCode] = e.type == "keydown";
    } else {
      return;
    }
  });

  window.addEventListener("keyup", function(e) {
    if ([32, 65, 68, 87, 83].includes(e.keyCode)) {
      window.keys[e.keyCode] = e.type == "keydown";
    } else {
      return;
    }
  });

  //Initializing Game Setup
  let canvas;
  let ctx;
  let FPS = 60;
  canvas = document.getElementById("gameCanvas");
  canvas.height = 600;
  canvas.width = 600;
  ctx = canvas.getContext("2d");

  return {
      canvas,
      ctx,
      FPS
  }
})();
