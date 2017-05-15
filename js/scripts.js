
var canvas = (function(undefined) {

  var canvas = document.getElementById("circle"),
    ctx = canvas.getContext("2d"),
    circleColor = "#680000",
    PI = Math.PI,
    circleStart = 1.5,
    circleEnd = -0.5,
    currentEnd = 2,
    step = 0;


  // Circle

  function updateCircle(clock) {
    currentEnd -= step;
    if (step < circleEnd) step = circleEnd;
    draw(clock);
  }

  function draw(clock, reset) {
    clearCanvas();
    drawTime(clock.timeLeft());
    drawCircleBackground();
    if (!reset)
      drawCircle(circleStart * PI, currentEnd * PI);
    else
      drawCircle(0, 2 * PI);
  }

  function drawCircle(start, end) {
    drawCircleBackground();
    ctx.strokeStyle = circleColor;
    ctx.beginPath();
    ctx.arc(180, 180, 135, start, end, false);
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  function drawTime(str) {
    ctx.fillStyle = "#fff";
    ctx.font = "40px Open Sans";
    ctx.textAlign = "center";
    ctx.fillText(str, canvas.width / 2, canvas.height / 2 + 15);
  }


  function drawCircleBackground() {
    ctx.strokeStyle = "#000";
    ctx.beginPath();
    ctx.arc(180, 180, 135, 0, 2 * PI, false);
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function calculateStep(sessionTimeInSeconds) {
    step = (circleStart - circleEnd) / sessionTimeInSeconds;
  }

  function resetCircle(clock) {
    currentEnd = circleStart;
    draw(clock, true);
  }

  return {

    updateCircle: updateCircle,
    resetCircle: resetCircle,
    calculateStep: calculateStep,

  };
})();

// Calculate time

var clock = (function(undefined) {

  var SECOND_IN_MILI = 1000,
    MINUTE_IN_SEC = 60,
    running = false,
    sessionTime = 0,
    timeLeft = sessionTime * MINUTE_IN_SEC,
    clock;

  var countDown = function() {
    if (running !== true) return;

    setTimeout(function() {
      if (running !== true) return;
      updateTime();
      canvas.updateCircle(clock);
      if (timeLeft <= 0) {
        willFinish.innerHTML = "";
        modal.style.display = "block";
        stop();
        return;
      }

      countDown();
    }, SECOND_IN_MILI);

  };

  function updateTime() {
    timeLeft -= 1;
    if (timeLeft < 0) timeLeft = 0;

  }


  function secondsInMHS(s) {

    d = Number(s);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    return {
      h: h,
      m: m,
      s: s,
      string: ((h > 0 ? h + ":" + (m < 10 ? "0" : "") : "") + m + ":" + (s < 10 ? "0" : "") + s)
    };
  }


  
  function changeSessionTime(amount) {
    sessionTime += amount;
    if (sessionTime < 0) sessionTime = 0;
    document.getElementById("sessionTime").innerHTML = sessionTime;
    if (sessionTime > 1440) sessionTime = 0;
    document.getElementById("sessionTime").innerHTML = sessionTime;
  }

  // Message of ending time 

  function finishTime() {
    var date = new Date();
    var now = (date.getHours() * 3600) + (date.getMinutes() * 60) + (date.getSeconds());
    var x = parseInt(sessionTime);
    var hours = Math.floor((now + (x * 60 )))<86400? Math.floor(((now + (x * 60 ))) / 3600): Math.floor(((now + (x * 60 )) - 86400) / 3600);
    var minutes = Math.floor((now + (x * 60 )) / 60 % 60)<86400? Math.floor((now + (x * 60 )) / 60 % 60): Math.floor(((now + (x * 60 )) - 86400) / 60 % 60);
    var willFinish = document.getElementById('willFinish');
    willFinish.innerHTML = " " + (hours<10?'0':'') + hours + ':' + (minutes<10?'0':'') + minutes;
    var msg = document.querySelector('.message');
    msg.classList.remove('is-paused');
    msg.classList.add('fade-in');
  }

 
  // Buttons Stop / Start / Reset


  var start = function() {
    if (running === true) return;
    timeLeft = sessionTime * MINUTE_IN_SEC;
    running = true;
    canvas.resetCircle(clock);
    canvas.calculateStep(timeLeft);
    countDown();
    finishTime();
    var str = document.getElementById("playStop").innerHTML; 
    var res = str.replace("Start", "Stop");
    document.getElementById("playStop").innerHTML = res;
  };

  var stop = function() {
    running = false;
    timeLeft = sessionTime * MINUTE_IN_SEC;
    canvas.resetCircle(clock);
    canvas.calculateStep(timeLeft);
    var str = document.getElementById("playStop").innerHTML; 
    var res = str.replace("Stop", "Start");
    document.getElementById("playStop").innerHTML = res;
    willFinish.innerHTML = "";
    var msg = document.querySelector('.message');
    msg.classList.remove('fade-in');
    msg.classList.add('is-paused');

  };

  document.getElementById("reset").addEventListener("click", reset);
  function reset () {
    sessionTime = 0;
    document.getElementById("sessionTime").innerHTML = sessionTime;
    
  };

  // Modal Window

    var modal = document.getElementById('finishMsg');
    var span = document.getElementsByClassName("close")[0];
    var newtimer = document.getElementById('newTimer');
    var closeapp = document.getElementById('closeApp');

    span.onclick = function() {
      modal.style.display = "none";
      
    }

    newtimer.onclick = function() {
      modal.style.display = "none";
     
    }

    closeapp.onclick = function() {
      modal.style.display = "none";
      window.open('','_self').close();
      
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      
      }
    }


  clock = {
    start: start,
    stop: stop,
    reset: reset,
    timeLeft: function() {
      return secondsInMHS(timeLeft).string;
    },
    changeSessionTime: changeSessionTime,
    isRunning: function() {
      return running;
    }
  };

  return clock;
})();

canvas.resetCircle(clock);


// Buttons

document.getElementById("playStop").addEventListener("click", function() {
  if (!clock.isRunning())
    clock.start();
  else
    clock.stop();
});

document.getElementById("minus").addEventListener("click", function() {
  clock.changeSessionTime(-1);
});
document.getElementById("plus").addEventListener("click", function() {
  clock.changeSessionTime(+1);
});
 document.getElementById("fivemin").addEventListener("click", function() {
  clock.changeSessionTime(+5); 
});
 document.getElementById("tenmin").addEventListener("click", function() {
  clock.changeSessionTime(+10); 
});

document.getElementById("thirtymin").addEventListener("click", function() {
  clock.changeSessionTime(+30); 
});


 