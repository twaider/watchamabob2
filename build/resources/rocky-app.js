var __loader = (function() {

var loader = {};

loader.packages = {};

loader.packagesLinenoOrder = [{ filename: 'loader.js', lineno: 0 }];

loader.fileExts = ['?', '?.js', '?.json'];
loader.folderExts = ['?/index.js', '?/index.json'];

loader.basepath = function(path) {
  return path.replace(/[^\/]*$/, '');
};

loader.joinpath = function() {
  var result = arguments[0];
  for (var i = 1; i < arguments.length; ++i) {
    if (arguments[i][0] === '/') {
      result = arguments[i];
    } else if (result[result.length-1] === '/') {
      result += arguments[i];
    } else {
      result += '/' + arguments[i];
    }
  }

  if (result[0] === '/') {
    result = result.substr(1);
  }
  return result;
};

var replace = function(a, regexp, b) {
  var z;
  do {
    z = a;
  } while (z !== (a = a.replace(regexp, b)));
  return z;
};

loader.normalize = function(path) {
  path = replace(path, /(?:(^|\/)\.?\/)+/g, '$1');
  path = replace(path, /[^\/]*\/\.\.\//, '');
  path = path.replace(/\/\/+/g, '/');
  path = path.replace(/^\//, '');
  return path;
};

function _require(module) {
  if (module.exports) {
    return module.exports;
  }

  var require = function(path) { return loader.require(path, module); };

  module.exports = {};
  module.loader(module.exports, module, require);
  module.loaded = true;

  return module.exports;
}

loader.require = function(path, requirer) {
  var module = loader.getPackage(path, requirer);
  if (!module) {
    throw new Error("Cannot find module '" + path + "'");
  }

  return _require(module);
};

var compareLineno = function(a, b) { return a.lineno - b.lineno; };

loader.define = function(path, lineno, loadfun) {
  var module = {
    filename: path,
    lineno: lineno,
    loader: loadfun,
  };

  loader.packages[path] = module;
  loader.packagesLinenoOrder.push(module);
  loader.packagesLinenoOrder.sort(compareLineno);
};

loader.getPackageForPath = function(path) {
  return loader.getPackageForFile(path) || loader.getPackageForDirectory(path);
};

loader.getPackage = function(path, requirer) {
  var module;
  var fullPath;
  if (requirer && requirer.filename) {
    fullPath = loader.joinpath(loader.basepath(requirer.filename), path);
  } else {
    fullPath = path;
  }

  // Try loading the module from a path, if it is trying to load from a path.
  if (path.substr(0, 2) === './' || path.substr(0, 1) === '/' || path.substr(0, 3) === '../') {
    module = loader.getPackageForPath(fullPath);
  }

  if (!module) {
    module = loader.getPackageFromSDK(path);
  }

  if (!module) {
    module = loader.getPackageFromBuildOutput(path);
  }

  if (!module) {
    module = loader.getPackageForNodeModule(path);
  }

  return module;
};

loader.getPackageForFile = function(path) {
  path = loader.normalize(path);

  var module;
  var fileExts = loader.fileExts;
  for (var i = 0, ii = fileExts.length; !module && i < ii; ++i) {
    var filepath = fileExts[i].replace('?', path);
    module = loader.packages[filepath];
  }

  return module;
};

loader.getPackageForDirectory = function(path) {
  path = loader.normalize(path);

  var module;
  var packagePackage = loader.packages[loader.joinpath(path, 'package.json')];
  if (packagePackage) {
    var info = _require(packagePackage);
    if (info.main) {
      module = loader.getPackageForFile(loader.joinpath(path, info.main));
    }
  }

  if (!module) {
    module = loader.getPackageForFile(loader.joinpath(path, 'index'));
  }

  return module;
};

loader.getPackageFromSDK = function (path) {
  return loader.getPackageForPath(path);
};

loader.getPackageFromBuildOutput = function(path) {
  var moduleBuildPath = loader.normalize(loader.joinpath('build', 'js', path));

  return loader.getPackageForPath(moduleBuildPath);
};

// Nested node_modules are banned, so we can do a simple search here.
loader.getPackageForNodeModule = function(path) {
  var modulePath = loader.normalize(loader.joinpath('node_modules', path));

  return loader.getPackageForPath(modulePath);
};

loader.getPackageByLineno = function(lineno) {
  var packages = loader.packagesLinenoOrder;
  var module;
  for (var i = 0, ii = packages.length; i < ii; ++i) {
    var next = packages[i];
    if (next.lineno > lineno) {
      break;
    }
    module = next;
  }
  return module;
};

return loader;

})();

__loader.define('rocky', 186, function(exports, module, require) {
module.exports = _rocky;
});
__loader.define('src/rocky/index.js', 189, function(exports, module, require) {
var rocky = require('rocky');

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

  ctx.fillStyle = 'white';
  ctx.rockyFillRadial(cx, 10, 0, 12, 0, 2 * Math.PI);

  for (; i < colors.length; i++) {
    ctx.fillStyle = colors[i];
    ctx.rockyFillRadial(cx, cy, 0, (100 - i * 20), 0, 2 * Math.PI);
  }
}

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

  // Draw the minute hand
  drawHand(ctx, cx, cy, minuteAngle, maxLength, 'black');

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
});
__loader.require('./src/rocky/index');
