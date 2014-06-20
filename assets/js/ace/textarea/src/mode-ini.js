/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

__ace_shadowed__.define('ace/mode/ini', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text', 'ace/mode/ini_highlight_rules', 'ace/mode/folding/ini'], function(require, exports, module) ***REMOVED***


var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var IniHighlightRules = require("./ini_highlight_rules").IniHighlightRules;
var FoldMode = require("./folding/ini").FoldMode;

var Mode = function() ***REMOVED***
    this.HighlightRules = IniHighlightRules;
    this.foldingRules = new FoldMode();
***REMOVED***;
oop.inherits(Mode, TextMode);

(function() ***REMOVED***
    this.lineCommentStart = ";";
    this.blockComment = ***REMOVED***start: "/*", end: "*/"***REMOVED***;
    this.$id = "ace/mode/ini";
***REMOVED***).call(Mode.prototype);

exports.Mode = Mode;
***REMOVED***);

__ace_shadowed__.define('ace/mode/ini_highlight_rules', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function(require, exports, module) ***REMOVED***


var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var escapeRe = "\\\\(?:[\\\\0abtrn;#=:]|x[a-fA-F\\d]***REMOVED***4***REMOVED***)";

var IniHighlightRules = function() ***REMOVED***
    this.$rules = ***REMOVED***
        start: [***REMOVED***
            token: 'punctuation.definition.comment.ini',
            regex: '#.*',
            push_: [***REMOVED***
                token: 'comment.line.number-sign.ini',
                regex: '$|^',
                next: 'pop'
        ***REMOVED*** ***REMOVED***
                defaultToken: 'comment.line.number-sign.ini'
        ***REMOVED***]
    ***REMOVED*** ***REMOVED***
            token: 'punctuation.definition.comment.ini',
            regex: ';.*',
            push_: [***REMOVED***
                token: 'comment.line.semicolon.ini',
                regex: '$|^',
                next: 'pop'
        ***REMOVED*** ***REMOVED***
                defaultToken: 'comment.line.semicolon.ini'
        ***REMOVED***]
    ***REMOVED*** ***REMOVED***
            token: ['keyword.other.definition.ini', 'text', 'punctuation.separator.key-value.ini'],
            regex: '\\b([a-zA-Z0-9_.-]+)\\b(\\s*)(=)'
    ***REMOVED*** ***REMOVED***
            token: ['punctuation.definition.entity.ini', 'constant.section.group-title.ini', 'punctuation.definition.entity.ini'],
            regex: '^(\\[)(.*?)(\\])'
    ***REMOVED*** ***REMOVED***
            token: 'punctuation.definition.string.begin.ini',
            regex: "'",
            push: [***REMOVED***
                token: 'punctuation.definition.string.end.ini',
                regex: "'",
                next: 'pop'
        ***REMOVED*** ***REMOVED***
                token: "constant.language.escape",
                regex: escapeRe
        ***REMOVED*** ***REMOVED***
                defaultToken: 'string.quoted.single.ini'
        ***REMOVED***]
    ***REMOVED*** ***REMOVED***
            token: 'punctuation.definition.string.begin.ini',
            regex: '"',
            push: [***REMOVED***
                token: "constant.language.escape",
                regex: escapeRe
        ***REMOVED*** ***REMOVED***
                token: 'punctuation.definition.string.end.ini',
                regex: '"',
                next: 'pop'
        ***REMOVED*** ***REMOVED***
                defaultToken: 'string.quoted.double.ini'
        ***REMOVED***]
    ***REMOVED***]
***REMOVED***;

    this.normalizeRules();
***REMOVED***;

IniHighlightRules.metaData = ***REMOVED***
    fileTypes: ['ini', 'conf'],
    keyEquivalent: '^~I',
    name: 'Ini',
    scopeName: 'source.ini'
***REMOVED***;


oop.inherits(IniHighlightRules, TextHighlightRules);

exports.IniHighlightRules = IniHighlightRules;
***REMOVED***);

__ace_shadowed__.define('ace/mode/folding/ini', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/range', 'ace/mode/folding/fold_mode'], function(require, exports, module) ***REMOVED***


var oop = require("../../lib/oop");
var Range = require("../../range").Range;
var BaseFoldMode = require("./fold_mode").FoldMode;

var FoldMode = exports.FoldMode = function() ***REMOVED***
***REMOVED***;
oop.inherits(FoldMode, BaseFoldMode);

(function() ***REMOVED***

    this.foldingStartMarker = /^\s*\[([^\])]*)]\s*(?:$|[;#])/;

    this.getFoldWidgetRange = function(session, foldStyle, row) ***REMOVED***
        var re = this.foldingStartMarker;
        var line = session.getLine(row);
        
        var m = line.match(re);
        
        if (!m) return;
        
        var startName = m[1] + ".";
        
        var startColumn = line.length;
        var maxRow = session.getLength();
        var startRow = row;
        var endRow = row;

        while (++row < maxRow) ***REMOVED***
            line = session.getLine(row);
            if (/^\s*$/.test(line))
                continue;
            m = line.match(re);
            if (m && m[1].lastIndexOf(startName, 0) !== 0)
                break;

            endRow = row;
    ***REMOVED***

        if (endRow > startRow) ***REMOVED***
            var endColumn = session.getLine(endRow).length;
            return new Range(startRow, startColumn, endRow, endColumn);
    ***REMOVED***
***REMOVED***;

***REMOVED***).call(FoldMode.prototype);

***REMOVED***);