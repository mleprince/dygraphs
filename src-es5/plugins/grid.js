/**
 * @license
 * Copyright 2012 Dan Vanderkam (danvdk@gmail.com)
 * MIT-licensed (http://opensource.org/licenses/MIT)
 */
/*global Dygraph:false */

/*

Current bits of jankiness:
- Direct layout access
- Direct area access

*/

"use strict";

/**
 * Draws the gridlines, i.e. the gray horizontal & vertical lines running the
 * length of the chart.
 *
 * @constructor
 */
Object.defineProperty(exports, "__esModule", {
  value: true
});
var grid = function grid() { };

grid.prototype.toString = function () {
  return "Gridline Plugin";
};

grid.prototype.activate = function (g) {
  return {
    willDrawChart: this.willDrawChart
  };
};

grid.prototype.drawYGrid = function (g, ctx, layout, area, ticks) {

  var axes = ["y", "y2"];
  var strokeStyles = [],
    lineWidths = [],
    drawGrid = [],
    stroking = [],
    strokePattern = [];
  for (var i = 0; i < axes.length; i++) {
    drawGrid[i] = g.getOptionForAxis('drawGrid', axes[i]);
    if (drawGrid[i]) {
      strokeStyles[i] = g.getOptionForAxis('gridLineColor', axes[i]);
      lineWidths[i] = g.getOptionForAxis('gridLineWidth', axes[i]);
      strokePattern[i] = g.getOptionForAxis('gridLinePattern', axes[i]);
      stroking[i] = strokePattern[i] && strokePattern[i].length >= 2;
    }
  }

  ctx.save();

  var x, y;
  // draw grids for the different y axes
  ticks.forEach(function (tick) {
    if (!tick.has_tick) return;
    var axis = tick.axis;
    if (drawGrid[axis]) {
      ctx.save();
      if (stroking[axis]) {
        if (ctx.setLineDash) ctx.setLineDash(strokePattern[axis]);
      }
      ctx.strokeStyle = strokeStyles[axis];
      ctx.lineWidth = lineWidths[axis];

      x = halfUp(area.x);
      y = halfDown(area.y + tick.pos * area.h);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + area.w, y);
      ctx.stroke();

      ctx.restore();
    }
  });
  ctx.restore();
}

grid.prototype.drawXGrid = function (g, ctx, layout, area, ticks) {


  var strokePattern = g.getOptionForAxis('gridLinePattern', 'x');
  var stroking = strokePattern && strokePattern.length >= 2;
  if (stroking) {
    if (ctx.setLineDash) ctx.setLineDash(strokePattern);
  }
  ctx.strokeStyle = g.getOptionForAxis('gridLineColor', 'x');
  ctx.lineWidth = g.getOptionForAxis('gridLineWidth', 'x');

  ctx.save();

  var x, y;

  // draw a tick per second
  ticks.forEach(function (tick) {
    if (!tick.has_tick) return;
    x = halfUp(area.x + tick.pos * area.w);
    y = halfDown(area.y + area.h);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, area.y);
    ctx.closePath();
    ctx.stroke();
  });
  if (stroking) {
    if (ctx.setLineDash) ctx.setLineDash([]);
  }
  ctx.restore();

}

grid.prototype.drawDetailedGrid = function (g, ctx, layout, area, ticks) {

  // -------- HERE is an adding of BIOSERENITY ---------
  // draw more detailed grid

  ctx.save();

  ctx.strokeStyle = 'rgb(200,200,200)';

  var SUBDIV_COUNT = 5;
  if (ticks.length === 0) {
    ticks = [{ pos: 0 }];
  }
  var deltaRatio = ticks.length > 1 ? (ticks[1].pos - ticks[0].pos) : 1; // delta between two ticks in % of the window 


  var drawVerticalLine = function(x) {
    ctx.moveTo(x,area.y);
    ctx.lineTo(x,area.y+area.h)
  }

  var drawHorizontalLine = function (y) {
    ctx.moveTo(area.x, y);
    ctx.lineTo(area.x + area.w, y);
  }

  var drawVerticalLines = function (delta /* in pixels */) {
    ctx.beginPath();

    /**
     * lines before first tick 
     */

    var posFirstTick = ticks[0].pos * area.w;

    for(var x = posFirstTick - delta; x > area.x; x -= delta) {
      drawVerticalLine(halfUp(x));
    }

    /**
     * Lines after first tick
     */
    for(var x = posFirstTick + delta, finalX = area.x+area.w; x < finalX; x += delta) {
      if( (x - posFirstTick) % delta)
      drawVerticalLine(halfUp(x));
    }
    
    ctx.closePath();
    ctx.stroke();
  }

  var drawHorizontalLines = function (delta /* in pixels */) {

    ctx.beginPath();

    for (var y = area.y; y < area.h; y += delta) {
      drawHorizontalLine(halfDown(y))
    }

    ctx.closePath();
    ctx.stroke();
  }

  /**
   * We trace the detailed grid 
   */

  var delta25 = (deltaRatio / 25) * area.w

  if (delta25 > 4 /* pixels */) {
    ctx.strokeStyle = 'rgb(230,230,230)';
    // vertical
    drawVerticalLines(delta25);

    //horizontal
    drawHorizontalLines(delta25);
  }

  var delta5 = (deltaRatio / 5) * area.w

  if (delta5 > 4 /* pixels */) {
    ctx.strokeStyle = 'rgb(200,200,200)';
    // vertical
    drawVerticalLines(delta5);
    // horizontal
    drawHorizontalLines(delta5);
  }

  ctx.restore()
}

function halfUp(x) {
  return Math.round(x) + 0.5;
}
function halfDown(y) {
  return Math.round(y) - 0.5;
}


grid.prototype.willDrawChart = function (e) {
  // Draw the new X/Y grid. Lines appear crisper when pixels are rounded to
  // half-integers. This prevents them from drawing in two rows/cols.
  var g = e.dygraph;
  var ctx = e.drawingContext;
  var layout = g.layout_;
  var area = e.dygraph.plotter_.area;

  var ticks = layout.xticks; // a tick is the position of a vertical grid line (as an offset ratio of area width)

  if (g.getOptionForAxis('drawGrid', 'y')) {
    this.drawYGrid(g, ctx, layout, area, ticks);
  }

  // draw grid for x axis
  if (g.getOptionForAxis('drawGrid', 'x')) {

    if (g.getOptionForAxis('detailedGrid', 'x')) {
      this.drawDetailedGrid(g, ctx, layout, area, ticks);
    }
    this.drawXGrid(g, ctx, layout, area, ticks)
  }
};

grid.prototype.destroy = function () { };

exports["default"] = grid;
module.exports = exports["default"];


grid.prototype.destroy = function () {};

exports["default"] = grid;
module.exports = exports["default"];
