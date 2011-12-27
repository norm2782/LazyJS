(function (window) {
  "use strict";

  var take, filter, nil, sub, id, even, eq, ne, add, sub, mul, div, mod, from,
    last, take, filter, notMultiple, notMultiple2, sieve, sieve2, fib;

  // setup
  function init() {
    // enableTrace();
  }

  function print(x) {
    document.write(x);
  }

  function cons(x, y) { return [0, x, y]; }
  function head(l) { return l[1]; }
  function tail(l) { return l[2]; }
  nil = [1];
  function isNil(x) { return x[0] === 1; }

  function show(x) {
    print(ev(x));
  }

  function showList(l) {
    var list = ev(l);
    switch (list[0]) {
    case 0:
      print(ev(head(list)) + ":");
      showList(tail(list));
      break;

    case 1:
      print("[]");
      break;
    }
  }

  sub = fn(function (a, b) {
    return ev(a) - ev(b);
  });

  take = fn(function (n, xs) {
    var len, list;
    len = ev(n);
    list = ev(xs);
    if (len <= 0 || isNil(list)) {
      return nil;
    } else {
      return cons(head(list), a2(take, a2(sub, len, 1), tail(list)));
    }
  });

  filter = fn(function (a, b) {
    var list, test;
    list = ev(b);
    test = e1(a, head(list));
    if (test) {
      return cons(head(list), a2(filter, a, tail(list)));
    } else {
      return a2(filter, a, tail(list));
    }
  });

  id = fn(function (a) {
    // trace("id: " + a);
    return a;
  });

  even = fn(function (a) {
    // return _ev_(a[0]) % 2 == 0;
    return a2(eq, a2(mod, a, 2), 0);
  });

  eq = fn(function (a, b) {
    return ev(a) === ev(b);
  });

  ne = fn(function (a, b) {
    return ev(a) !== ev(b);
  });

  add = fn(function (a, b) {
    return ev(a) + ev(b);
  });

  mul = fn(function (a, b) {
    return ev(a) * ev(b);
  });

  div = fn(function (a, b) {
    return Math.floor(ev(a) / ev(b));
  });

  mod = fn(function (a, b) {
    return (ev(a) % ev(b));
  });

  from = fn(function (a) {
    return cons(a, a1(from, a2(add, a, 1)));
  });

  last = fn(function (a) {
    var list, list2;
    list = ev(a);
    switch (list[0]) {
    case 0:
      list2 = ev(tail(list));
      switch (list2[0]) {
      case 0:
        return a1(last, tail(list));

      case 1:
        return head(list);
      }
      break;

    case 1:
      return undefined;
    }
  });

  notMultiple = fn(function (a, b) {
    return a2(ne, a2(mul, a2(div, b, a), a), b);
  });

  notMultiple2 = fn(function (a, b) {
    var x, y;
    x = ev(a);
    y = ev(b);
    return (Math.floor(y / x) * x) !== y;
  });

  sieve = fn(function (a) {
    var list = ev(a);
    return cons(head(list), a1(sieve, a2(filter, a1(notMultiple2,
      head(list)), tail(list))));
  });

  sieve2 = fn(function (nmz, a) {
    var list = ev(a);
    return cons(head(list), a2(sieve2, a1(id, nmz), a2(filter, a1(nmz,
      head(list)), tail(list))));
  });

  // test: sieve
  function testSieve() {
    var mainSieve, mainSieve2, d, t1, t2, list;

    mainSieve = a2(take, 10, a1(sieve, a1(from, 2)));
    mainSieve2 = a2(take, 50, a2(sieve2, a1(id, notMultiple2), a1(from, 2)));

    // running it...
    d = new Date();
    t1 = d.getTime();
    // showList(mainSieve);
    show(a1(last, mainSieve));
    d = new Date();
    t2 = d.getTime() - t1;
    print("<hr/>time= " + t2 + " ms<br/>");
  }

  fib = fn(function (n) {
    var m = ev(n);

    if (m < 2) {
      return m;
    } else {
      return a2(add, a1(fib, m - 1), a1(fib, m - 2))
    }
  });

  function testFib() {
    var mainFib, d, t1, t2;
    mainFib = a1(fib, 20);

    // running it...
    d = new Date();
    t1 = d.getTime();
    // showList(mainSieve);
    show(mainFib);
    d = new Date();
    t2 = d.getTime() - t1;
    print("<hr/>time= " + t2 + " ms<br/>");
  }

  function testMisc() {
    var plus, inc1, inc2, two1, two3, arr, x1, x2;

    trace("load & init ok");
    plus = fn(function (a, b) { return ev(a) + ev(b); });
    trace("plus: " + plus);
    inc1 = fn(function (a) {
      trace("inc: " + a);
      var x = ev(a);
      return x+1;
    });
    trace("inc1: " + inc1);
    inc2 = plus.__aN__([10]);
    trace("inc2: " + inc2);
    two1 = 2;
    // var two2 = new AppN_WHNF(2);
    two3 = new App(new LFun(function () { return 2; }), []);
    arr = [two1];
    // trace("two2: " + two2);
    trace("two3: " + two3);
    trace("two3 eval: " + ev(two3));
    trace("two3: " + two3);
    trace("two3 eval: " + ev(two3));
    trace("arr: " + arr);
    x1 = inc2.__aN__(arr);
    trace("inc 2: " + x1);
    x2 = new App(inc2, arr);
    trace("inc del 2: " + x2);
    trace("inc del 2 eval: " + ev(x2));
  }

  function tryOut() {
    var f, l;
    f = function (a, b) {};
    l = cons(1, nil);
    // trace(ToPropertyDescriptor(f));
    // trace(ToPropertyDescriptor(Function));
    // trace(ToPropertyDescriptor("a"));
    // trace(ToPropertyDescriptor(String));
    trace("f " + f.length);
  }

  function main() {
    init();
    // testMisc();
    // tryOut();
    testFib();
    // testSieve();
  }

  window.testSieve = testSieve;
  window.testMisc = testMisc;
  window.tryOut = tryOut;
  window.cons = cons;
  window.nil = nil;
  window.head = head;
  window.tail = tail;
  window.main = main;
  window.take = take;
  window.filter = filter;
  window.id = id;
  window.even = even;
  window.eq = eq;
  window.ne = ne;
  window.add = add;
  window.mul = mul;
  window.div = div;
  window.mod = mod;
  window.from = from;
  window.last = last;
  window.notMultiple = notMultiple;
  window.notMultiple2 = notMultiple2;
  window.sieve = sieve;
  window.sieve2 = sieve2;
}(window));

