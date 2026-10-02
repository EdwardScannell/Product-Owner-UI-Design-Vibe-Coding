/* Minimal stand-in runtime for this page's design-canvas markup.
   Supports {{path}} text/attribute holes, <sc-for list as>, <sc-if value>,
   onClick="{{fn}}" handlers, and a DCLogic base class with setState(). */
(function () {
  'use strict';
  var HOLE = /\{\{\s*([\w.$]+)\s*\}\}/g;
  var ONLY = /^\{\{\s*([\w.$]+)\s*\}\}$/;

  function lookup(scope, path) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    var parts = path.split('.'), v = scope;
    for (var i = 0; i < parts.length; i++) {
      if (v == null) return undefined;
      v = v[parts[i]];
    }
    return v;
  }
  function fill(str, scope) {
    return str.replace(HOLE, function (_, p) {
      var v = lookup(scope, p);
      return v == null || typeof v === 'function' ? '' : String(v);
    });
  }

  function renderNode(node, scope, out) {
    if (node.nodeType === 3) { out.appendChild(document.createTextNode(fill(node.nodeValue, scope))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.tagName.toLowerCase();
    if (tag === 'sc-for') {
      var list = lookup(scope, (node.getAttribute('list') || '').replace(/[{}\s]/g, '')) || [];
      var as = node.getAttribute('as') || 'item';
      list.forEach(function (x) {
        var s = Object.create(scope); s[as] = x;
        node.childNodes.forEach(function (c) { renderNode(c, s, out); });
      });
      return;
    }
    if (tag === 'sc-if') {
      if (lookup(scope, (node.getAttribute('value') || '').replace(/[{}\s]/g, ''))) {
        node.childNodes.forEach(function (c) { renderNode(c, scope, out); });
      }
      return;
    }
    var el = document.createElement(node.tagName);
    Array.prototype.forEach.call(node.attributes, function (a) {
      var name = a.name, val = a.value;
      if (name.indexOf('hint-placeholder') === 0) return;
      var m = val.match(ONLY);
      if (/^on[a-z]+$/.test(name) && m) {
        var fn = lookup(scope, m[1]);
        if (typeof fn === 'function') {
          el.addEventListener(name.slice(2), function (e) { e.preventDefault(); fn(e); });
        }
        return;
      }
      if (name === 'data-dc-src') { name = 'src'; }
      if (m) {
        var v = lookup(scope, m[1]);
        if (v === false || v == null) { if (name.indexOf('aria-') === 0) el.setAttribute(name, 'false'); return; }
        el.setAttribute(name, v === true ? (name.indexOf('aria-') === 0 ? 'true' : '') : String(v));
        return;
      }
      el.setAttribute(name, fill(val, scope));
    });
    node.childNodes.forEach(function (c) { renderNode(c, scope, el); });
    out.appendChild(el);
  }

  var root = null, template = null, instance = null;
  function render() {
    var vals = instance.renderVals();
    var frag = document.createDocumentFragment();
    template.childNodes.forEach(function (c) { renderNode(c, vals, frag); });
    root.innerHTML = '';
    root.appendChild(frag);
    root.style.visibility = 'visible';
  }

  window.DCLogic = function DCLogic(props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (patch) {
    Object.assign(this.state, patch);
    if (root) render();
  };

  document.addEventListener('DOMContentLoaded', function () {
    root = document.querySelector('x-dc');
    if (!root || typeof Component === 'undefined') return; // eslint-disable-line no-undef
    var helmet = root.querySelector('helmet');
    if (helmet) { while (helmet.firstChild) document.head.appendChild(helmet.firstChild); helmet.remove(); }
    template = root.cloneNode(true);
    instance = new Component({}); // eslint-disable-line no-undef
    render();
  });
})();
