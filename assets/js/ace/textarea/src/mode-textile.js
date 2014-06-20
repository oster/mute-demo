/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
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

__ace_shadowed__.define('ace/mode/textile', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text', 'ace/mode/textile_highlight_rules', 'ace/mode/matching_brace_outdent'], function(require, exports, module) ***REMOVED***


var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var TextileHighlightRules = require("./textile_highlight_rules").TextileHighlightRules;
var MatchingBraceOutdent = require("./matching_brace_outdent").MatchingBraceOutdent;

var Mode = function() ***REMOVED***
    this.HighlightRules = TextileHighlightRules;
    this.$outdent = new MatchingBraceOutdent();
***REMOVED***;
oop.inherits(Mode, TextMode);

(function() ***REMOVED***
    this.getNextLineIndent = function(state, line, tab) ***REMOVED***
        if (state == "intag")
            return tab;
        
        return "";
***REMOVED***;

    this.checkOutdent = function(state, line, input) ***REMOVED***
        return this.$outdent.checkOutdent(line, input);
***REMOVED***;

    this.autoOutdent = function(state, doc, row) ***REMOVED***
        this.$outdent.autoOutdent(doc, row);
***REMOVED***;
    
    this.$id = "ace/mode/textile";
***REMOVED***).call(Mode.prototype);

exports.Mode = Mode;

***REMOVED***);

__ace_shadowed__.define('ace/mode/textile_highlight_rules', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/text_highlight_rules'], function(require, exports, module) ***REMOVED***


var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var TextileHighlightRules = function() ***REMOVED***
    this.$rules = ***REMOVED***
        "start" : [
            ***REMOVED***
                token : function(value) ***REMOVED***
                    if (value.charAt(0) == "h")
                        return "markup.heading." + value.charAt(1);
                    else
                        return "markup.heading";
            ***REMOVED***
                regex : "h1|h2|h3|h4|h5|h6|bq|p|bc|pre",
                next  : "blocktag"
        ***REMOVED***
            ***REMOVED***
                token : "keyword",
                regex : "[\\*]+|[#]+"
        ***REMOVED***
            ***REMOVED***
                token : "text",
                regex : ".+"
        ***REMOVED***
        ],
        "blocktag" : [
            ***REMOVED***
                token : "keyword",
                regex : "\\. ",
                next  : "start"
        ***REMOVED***
            ***REMOVED***
                token : "keyword",
                regex : "\\(",
                next  : "blocktagproperties"
        ***REMOVED***
        ],
        "blocktagproperties" : [
            ***REMOVED***
                token : "keyword",
                regex : "\\)",
                next  : "blocktag"
        ***REMOVED***
            ***REMOVED***
                token : "string",
                regex : "[a-zA-Z0-9\\-_]+"
        ***REMOVED***
            ***REMOVED***
                token : "keyword",
                regex : "#"
        ***REMOVED***
        ]
***REMOVED***;
***REMOVED***;

oop.inherits(TextileHighlightRules, TextHighlightRules);

exports.TextileHighlightRules = TextileHighlightRules;

***REMOVED***);

__ace_shadowed__.define('ace/mode/matching_brace_outdent', ['require', 'exports', 'module' , 'ace/range'], function(require, exports, module) ***REMOVED***


var Range = require("../range").Range;

var MatchingBraceOutdent = function() ***REMOVED******REMOVED***;

(function() ***REMOVED***

    this.checkOutdent = function(line, input) ***REMOVED***
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*\***REMOVED***/.test(input);
***REMOVED***;

    this.autoOutdent = function(doc, row) ***REMOVED***
        var line = doc.getLine(row);
        var match = line.match(/^(\s*\***REMOVED***)/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket(***REMOVED***row: row, column: column***REMOVED***);

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
***REMOVED***;

    this.$getIndent = function(line) ***REMOVED***
        return line.match(/^\s*/)[0];
***REMOVED***;

***REMOVED***).call(MatchingBraceOutdent.prototype);

exports.MatchingBraceOutdent = MatchingBraceOutdent;
***REMOVED***);