(function () {
  function InstrumenterClient() {
    this._data = {};
  }
  
  InstrumenterClient.prototype = {
    start: function (id, callee) {
      var item = this._data[id];

      if (!item) {
        item = this._data[id] = {
          count: 0,
          callee: callee,
          lastTick: -1,
          timings: []
        };
      }

      item.count++;
      item.lastTick = window.performance.now();
    },

    end: function (id) {
      var item = this._data[id];

      if (item) {
        item.timings.push(window.performance.now() - item.lastTick);
      }
    },

    result: function () {
      var results = Object.keys(this._data)
        .map(function (id) {
          this._data[id].id = id;
          return this._data[id];
        }, this)
        .sort(function (a, b) {
          return b.timings.reduce(sumReducer, 0) -
            a.timings.reduce(sumReducer, 0);
        });

      results.forEach(function (item) {
        var timingsMean = Math.round(mean(item.timings) * 100) / 100;

        console.log('%s ms    %d    %O',
          timingsMean.toFixed(2),
          item.count,
          item);
      });
    }
  };

  function sumReducer(ret, val) {
    return ret += val;
  }

  function mean(arr) {
    return arr.reduce(function (ret, val) { return ret += val; }, 0) / arr.length;
  }

  window.inst = new InstrumenterClient();
}());
