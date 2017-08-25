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
var grid = function grid() {};

grid.prototype.toString = function () {
  return "Gridline Plugin";
};

grid.prototype.activate = function (g) {
  return {
    willDrawChart: this.willDrawChart
  };
};

grid.prototype.willDrawChart = function (e) {
  // Draw the new X/Y grid. Lines appear crisper when pixels are rounded to
  // half-integers. This prevents them from drawing in two rows/cols.
  var g = e.dygraph;
  var ctx = e.drawingContext;
  var layout = g.layout_;
  var area = e.dygraph.plotter_.area;

  function halfUp(x) {
    return Math.round(x) + 0.5;
  }
  function halfDown(y) {
    return Math.round(y) - 0.5;
  }

  var x, y, i, ticks;
  if (g.getOptionForAxis('drawGrid', 'y')) {
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
    ticks = layout.yticks;
    ctx.save();
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

  // draw grid for x axis
  if (g.getOptionForAxis('drawGrid', 'x')) {
    // a tick is the position of a vertical grid line (as an offset ratio of area width)
    ticks = layout.xticks;

    // grid line settings
    ctx.save();
    var strokePattern = g.getOptionForAxis('gridLinePattern', 'x');
    var stroking = strokePattern && strokePattern.length >= 2;
    if (stroking) {
      if (ctx.setLineDash) ctx.setLineDash(strokePattern);
    }
    ctx.strokeStyle = g.getOptionForAxis('gridLineColor', 'x');
    ctx.lineWidth = g.getOptionForAxis('gridLineWidth', 'x');

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

    // -------- HERE is an adding of BIOSERENITY ---------
    // draw more detailed grid
    if (g.getOptionForAxis('detailedGrid', 'x')) {

      ctx.strokeStyle = 'rgb(200,200,200)';

      var SUBDIV_COUNT = 5;
      if(ticks.length===0) {
        ticks = [{pos:0}];
      }
      var deltaRatio = ticks.length > 1 ? (ticks[1].pos - ticks[0].pos) : 1;

      var drawVerticalLine = function( offsetRatio ) {
        var x = halfUp(area.x + offsetRatio * area.w);
        var y = halfDown(area.y + area.h);
        ctx.moveTo(x, y);
        ctx.lineTo(x, area.y);
      }

      var drawVerticalLines = function( recursionLevel ) {
        var TOTAL_SUBDIV_COUNT = Math.pow(SUBDIV_COUNT, recursionLevel);
        if (deltaRatio / TOTAL_SUBDIV_COUNT * area.w > 4 /* pixels */) {
          ctx.beginPath();
          var offsetRatio = deltaRatio / TOTAL_SUBDIV_COUNT;
          // lines before first tick
          for (i = 1; i < TOTAL_SUBDIV_COUNT; i++) {
            drawVerticalLine( ticks[0].pos - i * offsetRatio );
          }
          // next lines
          for (i = 1; i < TOTAL_SUBDIV_COUNT * ticks.length; i++) {
            if (i % SUBDIV_COUNT != 0) { // skip position of higher level ticks
              drawVerticalLine( ticks[0].pos + i * offsetRatio );
            }
          }
          ctx.closePath();
        }
      }

      /**
       * Vertical lines
       */
      drawVerticalLines(1);
      ctx.stroke();

      ctx.setLineDash([2, 8]);
      drawVerticalLines(2);
      ctx.stroke();
      ctx.setLineDash([]);

      /**
       * Horizontal lines
       */
      ctx.beginPath();
      var it = 0;
      var y;
      while (it < area.h) {
        y = halfDown(area.y + it);
        ctx.moveTo(halfUp(area.x), y);
        ctx.lineTo(halfUp(area.x + area.w), y);
        it += deltaRatio / SUBDIV_COUNT * area.w;
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
};
grid.prototype.destroy = function () {};

exports["default"] = grid;
module.exports = exports["default"];
