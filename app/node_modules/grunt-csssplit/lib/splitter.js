'use strict';

var css = require('css');

function Splitter() {
}

// public
Splitter.prototype.split = function (cssString, maxSelectors) {

    var ast = this._parseCSS(cssString);
    this._totalSelectors = this._iterateRules(ast.stylesheet.rules, 0, true);

    return this._splitCSS(ast, maxSelectors);
};

Splitter.prototype._parseCSS = function (cssString) {
    if(typeof cssString !== 'string') {
        throw new Error('cssString must be a string');
    }

    if(cssString.length < 1) {
        throw new Error('cssString must not be empty');
    }

    // https://github.com/reworkcss/css#cssparsecode-options
    return css.parse(cssString, {position: true});
};


Splitter.prototype._splitCSS = function (ast, maxSelectors) {
    return this._toPages(ast, maxSelectors)
      .map(function (page) {

        return css.stringify(page);

    });
};

Splitter.prototype._iterateRules = function (rules, total, isRoot) {
    total = total || 0;

    var _self = this;

    rules.forEach(function (style) {
        var childTotal = 0;
        if (style.type == 'rule' || style.type == 'media') {
            if (typeof style.selectors === 'object') {
                childTotal += style.selectors.length;
            }

            if (style.rules) {
                childTotal = _self._iterateRules(style.rules, childTotal);
            }
        }

        if (isRoot) {
            // Write the result to a global store
            style.totalSelectors = childTotal;
        }
        total += childTotal;
    });


    return total;
};

Splitter.prototype._initClone = function (ast) {
    var clone = this._cloneAST(ast);
    clone.stylesheet.rules = [];
    return clone;
};

Splitter.prototype._toPages = function (ast, maxSelectors) {
    if (typeof ast !== 'object' || typeof ast.stylesheet !== 'object' || typeof ast.stylesheet.rules !== 'object') {
        return false;
    }
    var pages = [],
      _self = this,
      clone = this._initClone(ast);

    pages.push(clone);

    var selectorsForThisPage = 0;
    ast.stylesheet.rules.forEach(function (rule) {
        if (selectorsForThisPage + rule.totalSelectors <= maxSelectors) {
            selectorsForThisPage += rule.totalSelectors;
            clone.stylesheet.rules.push(rule);
        }
        else {
            selectorsForThisPage = rule.totalSelectors;
            clone = _self._initClone(ast);
            clone.stylesheet.rules.push(rule);
            pages.push(clone);
        }
    });

    return pages;
};

Splitter.prototype._cloneAST = function (ast) {
    return JSON.parse(JSON.stringify(ast));
};

module.exports = function () {
    return new Splitter();
};
