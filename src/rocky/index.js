var rocky = require('rocky'), weather;

function fractionToRadian(fraction) {
  return fraction * 2 * Math.PI;
}

function drawHand(ctx, cx, cy, angle, length, color) {
  // Find the end points
  var x2 = cx + Math.sin(angle) * length;
  var y2 = cy - Math.cos(angle) * length;

  // Configure how we want to draw the hand
  ctx.lineWidth = 12;
  ctx.strokeStyle = color;

  // Begin drawing
  ctx.beginPath();

  // Move to the center point, then draw the line
  ctx.moveTo(cx, cy);
  ctx.lineTo(x2, y2);

  // Stroke the line (output to display)
  ctx.stroke();
}

function drawBackground(ctx, cx, cy) {
  var colors = ['red', 'orange', 'white'], i = 0;

  for (; i < colors.length; i++) {
    ctx.fillStyle = colors[i];
    ctx.rockyFillRadial(cx, cy, 0, (96 - i * 20), 0, 2 * Math.PI);
  }

  ctx.fillStyle = 'white';
  ctx.rockyFillRadial(cx, 28, 0, 8, 0, 2 * Math.PI);
}

function drawWeather(ctx, weather) {
  // Create a string describing the weather
  // var weatherString = weather.celcius + 'ºC, ' + weather.desc;
  var weatherString = weather.fahrenheit + 'ºF, ' + weather.desc;

  // Draw the text, top center
  ctx.fillStyle = 'lightgray';
  ctx.textAlign = 'center';
  ctx.font = '14px Gothic';
  ctx.fillText(weatherString, ctx.canvas.unobstructedWidth / 2, 2);
}

rocky.on('message', function(event) {
  // Receive a message from the mobile device (pkjs)
  var message = event.data;

  if (message.weather) {
    // Save the weather data
    weather = message.weather;

    // Request a redraw so we see the information
    rocky.requestDraw();
  }
});

rocky.on('draw', function(event) {
  var ctx = event.context;
  var d = new Date();

  // Clear the screen
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

  // Determine the width and height of the display
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;

  // Determine the center point of the display
  // and the max size of watch hands
  var cx = w / 2;
  var cy = h / 2;

  // -20 so we're inset 10px on each side
  var maxLength = (Math.min(w, h) - 20) / 2;

  // Calculate the minute hand angle
  var minuteFraction = (d.getMinutes()) / 60;
  var minuteAngle = fractionToRadian(minuteFraction);

  drawBackground(ctx, cx, cy);

  // Draw the conditions (before clock hands, so it's drawn underneath them)
  if (weather) {
    drawWeather(ctx, weather);
  }

  // Draw the minute hand
  drawHand(ctx, cx, cy, minuteAngle, maxLength * 0.85, 'black');

  // Calculate the hour hand angle
  var hourFraction = (d.getHours() % 12 + minuteFraction) / 12;
  var hourAngle = fractionToRadian(hourFraction);

  // Draw the hour hand
  drawHand(ctx, cx, cy, hourAngle, maxLength * 0.6, '#555555');
});

rocky.on('minutechange', function(event) {
  // Display a message in the system logs
  console.log('Another minute with your Pebble!');

  // Request the screen to be redrawn on next pass
  rocky.requestDraw();
});

rocky.on('hourchange', function(event) {
  // Send a message to fetch the weather information (on startup and every hour)
  rocky.postMessage({'fetch': true});
});