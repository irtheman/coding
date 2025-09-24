$(document).ready(function () {
  let H = '....';
  H = H.split('');

  let M = '.....';
  M = M.split('');

  let S = '......';
  S = S.split('');
  
  let Xpos = 0;
  let Ypos = 0;
  let Xbase = 8;
  let Ybase = 8;
  let dots = 12;

  function clock() {
    let time = new Date();
    let secs = time.getSeconds();
    let sec = -1.57 + Math.PI * secs / 30;
    let mins = time.getMinutes();
    let min = -1.57 + Math.PI * mins / 30;
    let hr = time.getHours();
    let hrs = -1.57 + Math.PI * hr / 6 + Math.PI * parseInt(time.getMinutes()) / 360;

    for (i = 0; i < dots; ++i) {
      document.getElementById("dig" + (i + 1)).style.top = 0 - 15 + 40 * Math.sin(-0.49 + dots + i / 1.9).toString() + "px";
      document.getElementById("dig" + (i + 1)).style.left = 0 - 14 + 40 * Math.cos(-0.49 + dots + i / 1.9).toString() + "px";
    }

    for (i = 0; i < S.length; i++) {
      document.getElementById("sec" + (i + 1)).style.top = Ypos + i * Ybase * Math.sin(sec).toString() + "px";
      document.getElementById("sec" + (i + 1)).style.left = Xpos + i * Xbase * Math.cos(sec).toString() + "px";
    }

    for (i = 0; i < M.length; i++) {
      document.getElementById("min" + (i + 1)).style.top = Ypos + i * Ybase * Math.sin(min).toString() + "px";
      document.getElementById("min" + (i + 1)).style.left = Xpos + i * Xbase * Math.cos(min).toString() + "px";
    }

    for (i = 0; i < H.length; i++) {
      document.getElementById("hour" + (i + 1)).style.top = Ypos + i * Ybase * Math.sin(hrs).toString() + "px";
      document.getElementById("hour" + (i + 1)).style.left = Xpos + i * Xbase * Math.cos(hrs).toString() + "px";
    }

    setTimeout(clock, 50);
  }
});