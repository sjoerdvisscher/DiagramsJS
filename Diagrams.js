var Diagrams = (function()
{
  var pub = {};
  
  function svgElt(name, attrs)
  {
    var elt = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (var name in attrs)
      elt.setAttribute(name, attrs[name]);
    return elt;
  }
  
  // hack
  function memo(f)
  {
    var memoTable = {};
    var g = function()
    {
      var key = [];
      for (var i = 0; i < arguments.length; i++)
        key[i] = arguments[i].id || arguments[i];
      key.push(this.id || this);
      var val = memoTable[key];
      if (val !== undefined)
        return val;
      val = memoTable[key] = f.apply(this, arguments);
      return val;
    }
    g.length = f.length;
    return g;
  }
  
  var shapeIdCounter = 0;
  function Shape()
  {
    this.Shape();
  }
  Shape.prototype.Shape = function()
  {
    this.id = "shape" + shapeIdCounter++;
  }
  Shape.prototype.getSVG = function(w, h)
  {
    var svg = svgElt("svg", {
      width: w || 256,
      height: h || w || 256,
      fill: "black"
    });
    svg.appendChild(this.draw({}));
    return svg;
  }
  Shape.prototype.draw = function(defs)
  {
    if (defs[this.id])
    {
      var use = svgElt("use");
      use.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#" + this.id);
      return use;
    }
    
    var elt = defs[this.id] = this._draw(defs);
    elt.id = this.id;
    return elt;
  }
  Shape.prototype.scale = memo(function(s)
  {
    return new Diagrams.With(this, {
      transform: "scale(" + s + ")"
    });
  });
  Shape.prototype.translate = memo(function(dx, dy)
  {
    return new Diagrams.With(this, {
      transform: "translate(" + [dx, dy] + ")"
    });
  });
  
  pub.group = memo(function()
  {
    return new Group(arguments);
  });
  function Group(shapes)
  {
    this.Shape();
    this.shapes = shapes;
  }
  Group.prototype = new Shape();
  Group.prototype._draw = function(defs)
  {
    var g = svgElt("g");
    for (var i = 0; i < this.shapes.length; i++)
      g.appendChild(this.shapes[i].draw(defs));
    return g;
  }
  
  pub.With = function(obj, attrs)
  {
    this.Shape();
    this.refObj = obj;
    this.attrs = attrs;
  }
  pub.With.prototype = new Shape();
  pub.With.prototype._draw = function(defs)
  {
    var g = svgElt("g", this.attrs);
    g.appendChild(this.refObj.draw(defs));
    return g;
  }

  pub.unitCircle = new Shape();
  pub.unitCircle._draw = function()
  {
    return svgElt("circle", { r: 1 });
  }  
  
  pub.circle = function (r)
  { 
    return Diagrams.unitCircle.scale(r); 
  }
  
  return pub;
})();
