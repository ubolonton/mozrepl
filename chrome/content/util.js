/*
 * Copyright 2006-2011 by Massimiliano Mirra
 *
 * This file is part of MozRepl.
 *
 * MozRepl is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation; either version 3 of the License, or (at your
 * option) any later version.
 *
 * MozRepl is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The interactive user interfaces in modified source and object code
 * versions of this program must display Appropriate Legal Notices, as
 * required under Section 5 of the GNU General Public License version 3.
 *
 * Author: Massimiliano Mirra, <bard [at] hyperstruct [dot] net>
 *
 */

function helpUrlFor(thing) {
    function mdcXpcomClassUrl(classID) {
        return 'https://developer.mozilla.org/en-US/search?q=' + escape('"'+classID+'"');
    }
    function mdcXulElementUrl(element) {
        return 'http://developer.mozilla.org/en/XUL/' +
            element.nodeName;
    }

    if(typeof(thing) == 'string') {
        if(thing.match(/^@mozilla.org\//))
            return mdcXpcomClassUrl(thing);

    } else if(thing.QueryInterface &&
              (function() {
                  var NS_NOINTERFACE = 0x80004002;
                  try {
                      thing.QueryInterface(Components.interfaces.nsIDOMXULElement);
                      return true;
                  } catch(e if e.result == NS_NOINTERFACE) {}
              })()) {
        return mdcXulElementUrl(thing);
    }
}

function docFor(thing) {
    var printout = '';
    printout += 'TYPE: ' + (typeof(thing)) + '\n';
    if(thing.name)
        printout += 'NAME: ' + thing.name + '\n';
    else if(thing.nodeName)
        printout += 'NODENAME: ' + thing.nodeName + '\n';

    if(typeof(thing) == 'function') {
        var list = argList(thing);
        printout += 'ARGS: ' + (list.length == 0 ?
                                '[none declared]' :
                                list.join(', ')) + '\n';
    }

    if(thing.doc && typeof(thing.doc) == 'string')
        printout += '\n' + thing.doc + '\n';

    return printout;
}

function argList(fn) {
    var match;
    var rx = new RegExp('^function (\\w+)?\\(([^\\)]*)?\\) {');

    match = fn.toString().match(rx);
    if(match[2])
        return match[2].split(', ');
    else
        return [];
}

/**
 * Expose a chrome object's properties to content scripts.
 * See https://developer.mozilla.org/en-US/docs/XPConnect_wrappers#__exposedProps__
 */
function expose(object, properties, privileges /* r/w/rw */) {
    if (properties.length < 1)
        return;

    // "r" includes calling
    var priv = privileges || "r";

    object.__exposedProps__ = object.__exposedProps__ || {};
    for (var i = 0; i < properties.length; i++)
        object.__exposedProps__[properties[i]] = priv;
}
