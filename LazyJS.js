(function (window) {
  "use strict";

  var traceOn, evalCounter, nodeCounter;

  traceOn = false;

  evalCounter = 0;
  nodeCounter = 0;

  function enableTrace() {
    traceOn = true;
  }

  function trace(m, s) {
    if (traceOn) {
      console.log(m + ": " + s);
    }
  }

  function evaluatable(x) {
    return x !== undefined && x !== null && x.__eOrV__ !== undefined;
  }

  function traceX(msg, x) {
    if (evaluatable(x)) {
      trace(msg, typeof x + "/" + typeof x.__eOrV__ + ":" + x);
    } else {
      trace(msg, typeof x + ":" + x);
    }
  }

  // interface to eval
  function ev(x) {
    trace("> ev", x);

    if (evaluatable(x)) {
      var x_, xx, x_next;

      x_ = x;
      do {
        if (typeof x.__eOrV__ === 'function') {
          traceX(">> ev()", x);

          xx = x.__eOrV__();
          x.__eOrV__ = xx;
          x = xx;

          traceX("<< ev()", x);
        } else {
          traceX(">> ev", x);

          x = x.__eOrV__;

          traceX("<< ev", x);
        }
      } while (evaluatable(x));

      while (evaluatable(x_)) {
        x_next = x_.__eOrV__;
        x_.__eOrV__ = x;
        x_ = x_next;
      }
    }

    evalCounter += 1;

    trace("< ev", x);

    return x;
  }

  function App_undersat(f, as) {
    this.fun = f;
    this.args = as;
    nodeCounter += 1;
    this.nodeCounter = nodeCounter;
  }

  // Apply node, not enough args
  App_undersat.prototype = {
    __aN__ : function (args) {
      var needs, fun;

      needs = this.needsNrArgs();

      if (args.length < needs) {
        return new App_undersat(this, args);
      } else if (args.length === needs) {
        trace("> App_undersat.__aN__(=sat)", this + "(|args#" + args.length +
              "=(|" + args + "|)|)");

        return this.fun.__aN__(this.args.concat(args));
      } else {
        trace("> App_undersat.__aN__(>sat)", this + "(|args#" + args.length +
              "=(|" + args.slice(0, needs) + "|)+(|" + args.slice(needs) +
              "|)|)");

        fun = ev(this.__aN__(args.slice(0, needs)));

        return {
          __eOrV__ : function () {
            return fun.__aN__(args.slice(needs));
          }
        };
      }
    },
    needsNrArgs : function () {
      return this.fun.needsNrArgs() - this.args.length;
    },
    getName : function () {
      return "A-" + this.needsNrArgs() + "#" + this.nodeId + "'";
    },
    toString : function () {
      return "(" + this.getName() + "=" + this.fun + "@" + this.args + ")";
    }
  };

  function traceFun(msg, fun, args) {
    trace(msg, fun + "(|args#" + args.length + "=" + args + "|)");
  }

  function App(f, as) {
    this.__eOrV__ = function () {
      traceFun("> App.__eOrV__", f, as);

      var x = f.__aN__(as);

      traceFun("< App.__eOrV__", f, as);
      trace("<   ->", this + " -> " + x);

      return x;
    };

    this.fun = f;
    this.args = as;
    nodeCounter += 1;
    this.nodeId = nodeCounter;
  }

  // Apply node, unknown how much is missing or too much
  App.prototype = {
    __aN__ : function (args) {
      var fun = ev(this);
      return {
        __eOrV__ : function () {
          return fun.__aN__(args);
        }
      };
    },
    getName : function () {
      return "A" + this.args.length + "#" + this.nodeId + "'"
        + this.fun.getName();
    },
    getVal : function () {
      return "V#" + this.nodeId + "'" + this.__eOrV__;
    },
    toString : function () {
      if (typeof this.__eOrV__ === 'function') {
        return "(" + this.getName() + "@args#" + this.args.length + "=(|"
          + this.args + "|))";
      } else {
        return "(" + this.getVal() + ")";
      }
    }
  };

  function LFun(evalN, nm) {
    this.needs = evalN.length;
    this.__evN__ = evalN;

    if (nm !== undefined) {
      this.name = nm;
    }

    nodeCounter += 1;
    this.nodeId = nodeCounter;
  }

  // Function node
  LFun.prototype = {
    __aN__ : function (args) {
      var x, fun, remargs;

      if (args.length < this.needs) {
        return new App_undersat(this, args);
      } else if (args.length === this.needs) {
        traceFun("> LFun.__aN__(=sat)", this, args);

        x = this.__evN__.apply(null, args);

        traceFun("< LFun.__aN__(=sat)", this, args);
        trace("<   ->", x);

        return x;
      } else {
        trace("> LFun.__aN__(>sat)", this + "(|needs#" + this.needs + "args#" +
          args.length + "=" + args + "|)");

        fun = ev(this.__evN__.apply(null, args.slice(0, this.needs)));
        remargs = args.slice(this.needs);

        trace("< LFun.__aN__(>sat)", fun + "(|needs#" + this.needs + "remargs#"
          + remargs.length + "=" + remargs + "|)");
        trace("<   ->", fun);

        return {
          __eOrV__ : function () {
            return fun.__aN__(remargs);
          }
        };
      }
    },
    needsNrArgs : function () {
      return this.needs;
    },
    getName : function () {
      return "F" + this.needs + "#" + this.nodeId + "'" + this.name;
    },
    toString : function () {
      return "(" + this.getName() + ")";
    }
  };

  // function construction wrappers
  function fn(f) {
    return new LFun(f);
  }

  // strict application wrappers
  function e1(f, a) {
    return ev(f.__aN__([a]));
  }

  function e2(f, a, b) {
    return ev(f.__aN__([a, b]));
  }

  function e3(f, a, b, c) {
    return ev(f.__aN__([a, b, c]));
  }

  function e4(f, a, b, c, d) {
    return ev(f.__aN__([a, b, c, d]));
  }

  function e5(f, a, b, c, d, e) {
    return ev(f.__aN__([a, b, c, d, e]));
  }

  function eN(f, a) {
    return ev(f.__aN__(a));
  }

  // lazy application wrappers
  function a0(f) {
    return new App(f, []);
  }

  function a1(f, a) {
    return new App(f, [a]);
  }

  function a2(f, a, b) {
    return new App(f, [a, b]);
  }

  function a3(f, a, b, c) {
    return new App(f, [a, b, c]);
  }

  function a4(f, a, b, c, d) {
    return new App(f, [a, b, c, d]);
  }

  function a5(f, a, b, c, d, e) {
    return new App(f, [a, b, c, d, e]);
  }

  function aN(f, a) {
    return new App(f, a);
  }

  // indirection
  function ind() {
    return new App(function () {
      throw "ind: attempt to prematurely evaluate indirection";
    }, []);
  }

  function indSet(i, x) {
    i.__eOrV__ = x;
  }

  window.LFun = LFun;
  window.App = App;
  window.ev = ev;
  window.fn = fn;
  window.e1 = e1;
  window.e2 = e2;
  window.e3 = e3;
  window.e4 = e4;
  window.e5 = e5;
  window.eN = eN;
  window.a0 = a0;
  window.a1 = a1;
  window.a2 = a2;
  window.a3 = a3;
  window.a4 = a4;
  window.a5 = a5;
  window.aN = aN;
  window.ind = ind;
  window.indSet = indSet;

  window.trace = trace;
  window.enableTrace = enableTrace;
}(window));
