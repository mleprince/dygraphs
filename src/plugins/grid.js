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
var grid = function () {
};

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

  function halfUp(x) { return Math.round(x) + 0.5; }
  function halfDown(y) { return Math.round(y) - 0.5; }

  var x, y, i, ticks;
  if (g.getOptionForAxis('drawGrid', 'y')) {
    var axes = ["y", "y2"];
    var strokeStyles = [], lineWidths = [], drawGrid = [], stroking = [], strokePattern = [];
    for (var i = 0; i < axes.length; i++) {
      drawGrid[i] = g.getOptionForAxis('drawGrid', axes[i]);
      if (drawGrid[i]) {
        strokeStyles[i] = g.getOptionForAxis('gridLineColor', axes[i]);
        lineWidths[i] = g.getOptionForAxis('gridLineWidth', axes[i]);
        strokePattern[i] = g.getOptionForAxis('gridLinePattern', axes[i]);
        stroking[i] = strokePattern[i] && (strokePattern[i].length >= 2);
      }
    }
    ticks = layout.yticks;
    ctx.save();
    // draw grids for the different y axes
    ticks.forEach(tick => {
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
    ticks = layout.xticks;
    ctx.save();
    var strokePattern = g.getOptionForAxis('gridLinePattern', 'x');
    var stroking = strokePattern && (strokePattern.length >= 2);
    if (stroking) {
      if (ctx.setLineDash) ctx.setLineDash(strokePattern);
    }
    ctx.strokeStyle = g.getOptionForAxis('gridLineColor', 'x');
    ctx.lineWidth = g.getOptionForAxis('gridLineWidth', 'x');
    ticks.forEach(tick => {
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
    if (g.getOptionForAxis('detailedGrid', 'x')) {

      ctx.strokeStyle = 'rgb(200,200,200)';


      // affichage de la grille detaillé
      if (ticks.length > 1) {

        var delta = (ticks[1].pos - ticks[0].pos) / 5



        /**
         * Affichage des barres horizontales
         */

        ctx.beginPath();

        var it = 0
        var y;
        while (it < area.h) {
          y = halfDown(area.y + it);
          ctx.moveTo(halfUp(area.x), y);
          ctx.lineTo(halfUp(area.x + area.w), y);
          it += delta * area.w
        }

        /**
         * Affichage des barres verticales
         */


        // 5 premiers
        for (i = 1; i < 5; i++) {
          x = halfUp(area.x + (ticks[0].pos - i * delta) * area.w);
          y = halfDown(area.y + area.h);

          ctx.moveTo(x, y);
          ctx.lineTo(x, area.y);
        }
        // tous les suivants
        for (i = 1; i < 5 * ticks.length; i++) {
          if (i % 5 != 0) {
            y = halfDown(area.y + area.h);
            x = halfUp(area.x + (ticks[0].pos + i * delta) * area.w);
            ctx.moveTo(x, y);
            ctx.lineTo(x, area.y);
          }
        }


        ctx.closePath();
        ctx.stroke();

        if (delta * area.w / 5 > 4) {
          ctx.beginPath();
          ctx.setLineDash([2, 8]);
          // 5 premiers
          for (i = 1; i < 25; i++) {
            x = halfUp(area.x + (ticks[0].pos - i * (delta / 5)) * area.w);
            y = halfDown(area.y + area.h);
            ctx.moveTo(x, y);
            ctx.lineTo(x, area.y);
          }
          // tous les suivants
          for (i = 1; i < 5 * ticks.length * 25; i++) {
            if (i % 5 != 0) {
              y = halfDown(area.y + area.h);
              x = halfUp(area.x + (ticks[0].pos + i * (delta / 5)) * area.w);
              ctx.moveTo(x, y);
              ctx.lineTo(x, area.y);
            }
          }
          ctx.stroke();
          ctx.closePath();
          ctx.setLineDash([]);
        }

      }
    }
  }
};
grid.prototype.destroy = function () {
};

export default grid;
