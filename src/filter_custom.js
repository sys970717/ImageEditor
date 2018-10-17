var Filter = function() {}

Filter.prototype.filter = function () {
    ctx.putImageData(this.pixels, 0, 0)
}

Filter.factory = function (type) {
    var constr = type, filter
    if (typeof Filter[constr] !== 'function') {
        throw {
            name: "Error",
            message: constr + ' doesn\'t exist'
        }
    }

    if (typeof Filter[constr].prototype.filter !== 'function') {
        Filter[constr].prototype = new Filter()
    }

    // this.pixels = ctx.getImageData(0, 0, state.image_width, state.image_height)
    filter = new Filter[constr]()

    return filter
}

Filter.grayscale = function() {
    this.pixels = ctx.getImageData(0, 0, state.image_width, state.image_height)
    this.filterName = 'grayscale'
    console.log(this.pixels)
    var d = this.pixels.data
    for (var i = 0; i < d.length; i += 4) {
        var r = d[i]
        var g = d[i + 1]
        var b = d[i + 2]
        // CIE luminance for the RGB
        var v = 0.2126 * r + 0.7152 * g + 0.0722 * b
        d[i] = d[i + 1] = d[i + 2] = v
    }
    return this.filter()
}

Filter.threshold = function(){
    var threshold = 200
    this.pixels = ctx.getImageData(0, 0, state.image_width, state.image_height)
    this.filterName = 'threshold'
    var d = this.pixels.data
    for (var i = 0; i < d.length; i += 4) {
        var r = d[i]
        var g = d[i + 1]
        var b = d[i + 2]
        var v = (0.2126 * r + 0.7152 * g + 0.0722 * b >= threshold) ? 255 : 0
        d[i] = d[i + 1] = d[i + 2] = v
    }
    return this.filter()
}

Filter.brightness = function() {
    this.pixels = ctx.getImageData(0, 0, state.image_width, state.image_height)
    this.filterName = 'brightness'
    var adjustment = 10, d = this.pixels.data
    for (var i = 0; i < d.length; i += 4) {
        d[i] += adjustment;
        d[i + 1] += adjustment;
        d[i + 2] += adjustment;
    }
    return this.filter()
}

Filter.convolute = function() {
    
}

Filter.restore = function() {
    this.pixels = state.ctx_original
    return this.filter()
}