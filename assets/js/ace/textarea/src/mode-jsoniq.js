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
__ace_shadowed__.define('ace/mode/jsoniq', ['require', 'exports', 'module' , 'ace/worker/worker_client', 'ace/lib/oop', 'ace/mode/text', 'ace/mode/text_highlight_rules', 'ace/mode/xquery/jsoniq_lexer', 'ace/range', 'ace/mode/behaviour/xquery', 'ace/mode/folding/cstyle', 'ace/anchor', 'ace/ext/language_tools'], function(require, exports, module) ***REMOVED***


var WorkerClient = require("../worker/worker_client").WorkerClient;
var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var JSONiqLexer = require("./xquery/jsoniq_lexer").JSONiqLexer;
var Range = require("../range").Range;
var XQueryBehaviour = require("./behaviour/xquery").XQueryBehaviour;
var CStyleFoldMode = require("./folding/cstyle").FoldMode;
var Anchor = require("../anchor").Anchor;
var LanguageTools = require("../ext/language_tools");

var Mode = function() ***REMOVED***
    this.$tokenizer   = new JSONiqLexer();
    this.$behaviour   = new XQueryBehaviour();
    this.foldingRules = new CStyleFoldMode();
    this.$highlightRules = new TextHighlightRules();
***REMOVED***;

oop.inherits(Mode, TextMode);

(function() ***REMOVED***

    LanguageTools.addCompleter(***REMOVED***
        getCompletions: function(editor, session, pos, prefix, callback) ***REMOVED***
            session.$worker.emit("complete", ***REMOVED*** data: ***REMOVED*** pos: pos, prefix: prefix ***REMOVED*** ***REMOVED***);
            session.$worker.on("complete", function(e)***REMOVED***
                callback(null, e.data);
        ***REMOVED***);
    ***REMOVED***
***REMOVED***);

    this.getNextLineIndent = function(state, line, tab) ***REMOVED***
        var indent = this.$getIndent(line);
        var match = line.match(/\s*(?:then|else|return|[***REMOVED***\(]|<\w+>)\s*$/);
        if (match)
            indent += tab;
        return indent;
***REMOVED***;
    
    this.checkOutdent = function(state, line, input) ***REMOVED***
        if (! /^\s+$/.test(line))
            return false;

        return /^\s*[\***REMOVED***\)]/.test(input);
***REMOVED***;
    
    this.autoOutdent = function(state, doc, row) ***REMOVED***
        var line = doc.getLine(row);
        var match = line.match(/^(\s*[\***REMOVED***\)])/);

        if (!match) return 0;

        var column = match[1].length;
        var openBracePos = doc.findMatchingBracket(***REMOVED***row: row, column: column***REMOVED***);

        if (!openBracePos || openBracePos.row == row) return 0;

        var indent = this.$getIndent(doc.getLine(openBracePos.row));
        doc.replace(new Range(row, 0, row, column-1), indent);
***REMOVED***;

    this.toggleCommentLines = function(state, doc, startRow, endRow) ***REMOVED***
        var i, line;
        var outdent = true;
        var re = /^\s*\(:(.*):\)/;

        for (i=startRow; i<= endRow; i++) ***REMOVED***
            if (!re.test(doc.getLine(i))) ***REMOVED***
                outdent = false;
                break;
        ***REMOVED***
    ***REMOVED***

        var range = new Range(0, 0, 0, 0);
        for (i=startRow; i<= endRow; i++) ***REMOVED***
            line = doc.getLine(i);
            range.start.row  = i;
            range.end.row    = i;
            range.end.column = line.length;

            doc.replace(range, outdent ? line.match(re)[1] : "(:" + line + ":)");
    ***REMOVED***
***REMOVED***;
    this.createWorker = function(session) ***REMOVED***
        
      var worker = new WorkerClient(["ace"], "ace/mode/xquery_worker", "XQueryWorker");
        var that = this;

        worker.attachToDocument(session.getDocument());
        
        worker.on("ok", function(e) ***REMOVED***
          session.clearAnnotations();
    ***REMOVED***);
        
        worker.on("markers", function(e) ***REMOVED***
          session.clearAnnotations();
          that.addMarkers(e.data, session);
    ***REMOVED***);
 
        return worker;
***REMOVED***;
 
    this.removeMarkers = function(session) ***REMOVED***
        var markers = session.getMarkers(false);
        for (var id in markers) ***REMOVED***
            if (markers[id].clazz.indexOf('language_highlight_') === 0) ***REMOVED***
                session.removeMarker(id);
        ***REMOVED***
    ***REMOVED***
        for (var i = 0; i < session.markerAnchors.length; i++) ***REMOVED***
            session.markerAnchors[i].detach();
    ***REMOVED***
        session.markerAnchors = [];
***REMOVED***;

    this.addMarkers = function(annos, mySession) ***REMOVED***
        var _self = this;
        
        if (!mySession.markerAnchors) mySession.markerAnchors = [];
        this.removeMarkers(mySession);
        mySession.languageAnnos = [];
        annos.forEach(function(anno) ***REMOVED***
            var anchor = new Anchor(mySession.getDocument(), anno.pos.sl, anno.pos.sc || 0);
            mySession.markerAnchors.push(anchor);
            var markerId;
            var colDiff = anno.pos.ec - anno.pos.sc;
            var rowDiff = anno.pos.el - anno.pos.sl;
            var gutterAnno = ***REMOVED***
                guttertext: anno.message,
                type: anno.level || "warning",
                text: anno.message
        ***REMOVED***;

            function updateFloat(single) ***REMOVED***
                if (markerId)
                    mySession.removeMarker(markerId);
                gutterAnno.row = anchor.row;
                if (anno.pos.sc !== undefined && anno.pos.ec !== undefined) ***REMOVED***
                    var range = new Range(anno.pos.sl, anno.pos.sc, anno.pos.el, anno.pos.ec);
                    markerId = mySession.addMarker(range, "language_highlight_" + (anno.type ? anno.type : "default"));
            ***REMOVED***
                if (single) mySession.setAnnotations(mySession.languageAnnos);
        ***REMOVED***
            updateFloat();
            anchor.on("change", function() ***REMOVED***
                updateFloat(true);
        ***REMOVED***);
            if (anno.message) mySession.languageAnnos.push(gutterAnno);
    ***REMOVED***);
        mySession.setAnnotations(mySession.languageAnnos);
***REMOVED***; 

    this.$id = "ace/mode/jsoniq";
***REMOVED***).call(Mode.prototype);

exports.Mode = Mode;
***REMOVED***);
__ace_shadowed__.define('ace/mode/xquery/jsoniq_lexer', ['require', 'exports', 'module' ], function(require, exports, module) ***REMOVED***
module.exports = (function e(t,n,r)***REMOVED***function s(o,u)***REMOVED***if(!n[o])***REMOVED***if(!t[o])***REMOVED***var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")***REMOVED***var f=n[o]=***REMOVED***exports:***REMOVED******REMOVED******REMOVED***;t[o][0].call(f.exports,function(e)***REMOVED***var n=t[o][1][e];return s(n?n:e)***REMOVED***,f,f.exports,e,t,n,r)***REMOVED***return n[o].exports***REMOVED***var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s***REMOVED***)(***REMOVED***
1:[function(_dereq_,module,exports)***REMOVED***
                                                            var JSONiqTokenizer = exports.JSONiqTokenizer = function JSONiqTokenizer(string, parsingEventHandler)
                                                            ***REMOVED***
                                                              init(string, parsingEventHandler);
  var self = this;

  this.ParseException = function(b, e, s, o, x)
  ***REMOVED***
    var
      begin = b,
      end = e,
      state = s,
      offending = o,
      expected = x;

    this.getBegin = function() ***REMOVED***return begin;***REMOVED***;
    this.getEnd = function() ***REMOVED***return end;***REMOVED***;
    this.getState = function() ***REMOVED***return state;***REMOVED***;
    this.getExpected = function() ***REMOVED***return expected;***REMOVED***;
    this.getOffending = function() ***REMOVED***return offending;***REMOVED***;

    this.getMessage = function()
    ***REMOVED***
      return offending < 0 ? "lexical analysis failed" : "syntax error";
***REMOVED***;
  ***REMOVED***;

  function init(string, parsingEventHandler)
  ***REMOVED***
    eventHandler = parsingEventHandler;
    input = string;
    size = string.length;
    reset(0, 0, 0);
  ***REMOVED***

  this.getInput = function()
  ***REMOVED***
    return input;
  ***REMOVED***;

  function reset(l, b, e)
  ***REMOVED***
            b0 = b; e0 = b;
    l1 = l; b1 = b; e1 = e;
    end = e;
    eventHandler.reset(input);
  ***REMOVED***

  this.getOffendingToken = function(e)
  ***REMOVED***
    var o = e.getOffending();
    return o >= 0 ? JSONiqTokenizer.TOKEN[o] : null;
  ***REMOVED***;

  this.getExpectedTokenSet = function(e)
  ***REMOVED***
    var expected;
    if (e.getExpected() < 0)
    ***REMOVED***
      expected = JSONiqTokenizer.getTokenSet(- e.getState());
***REMOVED***
    else
    ***REMOVED***
      expected = [JSONiqTokenizer.TOKEN[e.getExpected()]];
***REMOVED***
    return expected;
  ***REMOVED***;

  this.getErrorMessage = function(e)
  ***REMOVED***
    var tokenSet = this.getExpectedTokenSet(e);
    var found = this.getOffendingToken(e);
    var prefix = input.substring(0, e.getBegin());
    var lines = prefix.split("\n");
    var line = lines.length;
    var column = lines[line - 1].length + 1;
    var size = e.getEnd() - e.getBegin();
    return e.getMessage()
         + (found == null ? "" : ", found " + found)
         + "\nwhile expecting "
         + (tokenSet.length == 1 ? tokenSet[0] : ("[" + tokenSet.join(", ") + "]"))
         + "\n"
         + (size == 0 || found != null ? "" : "after successfully scanning " + size + " characters beginning ")
         + "at line " + line + ", column " + column + ":\n..."
         + input.substring(e.getBegin(), Math.min(input.length, e.getBegin() + 64))
         + "...";
  ***REMOVED***;

  this.parse_start = function()
  ***REMOVED***
    eventHandler.startNonterminal("start", e0);
    lookahead1W(14);                // ModuleDecl | Annotation | OptionDecl | Operator | Variable | Tag | AttrTest |
    switch (l1)
    ***REMOVED***
    case 58:                        // '<![CDATA['
      shift(58);                    // '<![CDATA['
      break;
    case 57:                        // '<!--'
      shift(57);                    // '<!--'
      break;
    case 59:                        // '<?'
      shift(59);                    // '<?'
      break;
    case 43:                        // '(#'
      shift(43);                    // '(#'
      break;
    case 45:                        // '(:~'
      shift(45);                    // '(:~'
      break;
    case 44:                        // '(:'
      shift(44);                    // '(:'
      break;
    case 37:                        // '"'
      shift(37);                    // '"'
      break;
    case 41:                        // "'"
      shift(41);                    // "'"
      break;
    case 277:                       // '***REMOVED***'
      shift(277);                   // '***REMOVED***'
      break;
    case 274:                       // '***REMOVED***'
      shift(274);                   // '***REMOVED***'
      break;
    case 42:                        // '('
      shift(42);                    // '('
      break;
    case 46:                        // ')'
      shift(46);                    // ')'
      break;
    case 52:                        // '/'
      shift(52);                    // '/'
      break;
    case 65:                        // '['
      shift(65);                    // '['
      break;
    case 66:                        // ']'
      shift(66);                    // ']'
      break;
    case 49:                        // ','
      shift(49);                    // ','
      break;
    case 51:                        // '.'
      shift(51);                    // '.'
      break;
    case 56:                        // ';'
      shift(56);                    // ';'
      break;
    case 54:                        // ':'
      shift(54);                    // ':'
      break;
    case 36:                        // '!'
      shift(36);                    // '!'
      break;
    case 276:                       // '|'
      shift(276);                   // '|'
      break;
    case 40:                        // '$$'
      shift(40);                    // '$$'
      break;
    case 5:                         // Annotation
      shift(5);                     // Annotation
      break;
    case 4:                         // ModuleDecl
      shift(4);                     // ModuleDecl
      break;
    case 6:                         // OptionDecl
      shift(6);                     // OptionDecl
      break;
    case 15:                        // AttrTest
      shift(15);                    // AttrTest
      break;
    case 16:                        // Wildcard
      shift(16);                    // Wildcard
      break;
    case 18:                        // IntegerLiteral
      shift(18);                    // IntegerLiteral
      break;
    case 19:                        // DecimalLiteral
      shift(19);                    // DecimalLiteral
      break;
    case 20:                        // DoubleLiteral
      shift(20);                    // DoubleLiteral
      break;
    case 8:                         // Variable
      shift(8);                     // Variable
      break;
    case 9:                         // Tag
      shift(9);                     // Tag
      break;
    case 7:                         // Operator
      shift(7);                     // Operator
      break;
    case 35:                        // EOF
      shift(35);                    // EOF
      break;
    default:
      parse_EQName();
***REMOVED***
    eventHandler.endNonterminal("start", e0);
  ***REMOVED***;

  this.parse_StartTag = function()
  ***REMOVED***
    eventHandler.startNonterminal("StartTag", e0);
    lookahead1W(8);                 // QName | S^WS | EOF | '"' | "'" | '/>' | '=' | '>'
    switch (l1)
    ***REMOVED***
    case 61:                        // '>'
      shift(61);                    // '>'
      break;
    case 53:                        // '/>'
      shift(53);                    // '/>'
      break;
    case 29:                        // QName
      shift(29);                    // QName
      break;
    case 60:                        // '='
      shift(60);                    // '='
      break;
    case 37:                        // '"'
      shift(37);                    // '"'
      break;
    case 41:                        // "'"
      shift(41);                    // "'"
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("StartTag", e0);
  ***REMOVED***;

  this.parse_TagContent = function()
  ***REMOVED***
    eventHandler.startNonterminal("TagContent", e0);
    lookahead1(11);                 // Tag | EndTag | PredefinedEntityRef | ElementContentChar | CharRef | EOF |
    switch (l1)
    ***REMOVED***
    case 25:                        // ElementContentChar
      shift(25);                    // ElementContentChar
      break;
    case 9:                         // Tag
      shift(9);                     // Tag
      break;
    case 10:                        // EndTag
      shift(10);                    // EndTag
      break;
    case 58:                        // '<![CDATA['
      shift(58);                    // '<![CDATA['
      break;
    case 57:                        // '<!--'
      shift(57);                    // '<!--'
      break;
    case 21:                        // PredefinedEntityRef
      shift(21);                    // PredefinedEntityRef
      break;
    case 31:                        // CharRef
      shift(31);                    // CharRef
      break;
    case 275:                       // '***REMOVED******REMOVED***'
      shift(275);                   // '***REMOVED******REMOVED***'
      break;
    case 278:                       // '***REMOVED******REMOVED***'
      shift(278);                   // '***REMOVED******REMOVED***'
      break;
    case 274:                       // '***REMOVED***'
      shift(274);                   // '***REMOVED***'
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("TagContent", e0);
  ***REMOVED***;

  this.parse_AposAttr = function()
  ***REMOVED***
    eventHandler.startNonterminal("AposAttr", e0);
    lookahead1(10);                 // PredefinedEntityRef | EscapeApos | AposAttrContentChar | CharRef | EOF | "'" |
    switch (l1)
    ***REMOVED***
    case 23:                        // EscapeApos
      shift(23);                    // EscapeApos
      break;
    case 27:                        // AposAttrContentChar
      shift(27);                    // AposAttrContentChar
      break;
    case 21:                        // PredefinedEntityRef
      shift(21);                    // PredefinedEntityRef
      break;
    case 31:                        // CharRef
      shift(31);                    // CharRef
      break;
    case 275:                       // '***REMOVED******REMOVED***'
      shift(275);                   // '***REMOVED******REMOVED***'
      break;
    case 278:                       // '***REMOVED******REMOVED***'
      shift(278);                   // '***REMOVED******REMOVED***'
      break;
    case 274:                       // '***REMOVED***'
      shift(274);                   // '***REMOVED***'
      break;
    case 41:                        // "'"
      shift(41);                    // "'"
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("AposAttr", e0);
  ***REMOVED***;

  this.parse_QuotAttr = function()
  ***REMOVED***
    eventHandler.startNonterminal("QuotAttr", e0);
    lookahead1(9);                  // PredefinedEntityRef | EscapeQuot | QuotAttrContentChar | CharRef | EOF | '"' |
    switch (l1)
    ***REMOVED***
    case 22:                        // EscapeQuot
      shift(22);                    // EscapeQuot
      break;
    case 26:                        // QuotAttrContentChar
      shift(26);                    // QuotAttrContentChar
      break;
    case 21:                        // PredefinedEntityRef
      shift(21);                    // PredefinedEntityRef
      break;
    case 31:                        // CharRef
      shift(31);                    // CharRef
      break;
    case 275:                       // '***REMOVED******REMOVED***'
      shift(275);                   // '***REMOVED******REMOVED***'
      break;
    case 278:                       // '***REMOVED******REMOVED***'
      shift(278);                   // '***REMOVED******REMOVED***'
      break;
    case 274:                       // '***REMOVED***'
      shift(274);                   // '***REMOVED***'
      break;
    case 37:                        // '"'
      shift(37);                    // '"'
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("QuotAttr", e0);
  ***REMOVED***;

  this.parse_CData = function()
  ***REMOVED***
    eventHandler.startNonterminal("CData", e0);
    lookahead1(1);                  // CDataSectionContents | EOF | ']]>'
    switch (l1)
    ***REMOVED***
    case 14:                        // CDataSectionContents
      shift(14);                    // CDataSectionContents
      break;
    case 67:                        // ']]>'
      shift(67);                    // ']]>'
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("CData", e0);
  ***REMOVED***;

  this.parse_XMLComment = function()
  ***REMOVED***
    eventHandler.startNonterminal("XMLComment", e0);
    lookahead1(0);                  // DirCommentContents | EOF | '-->'
    switch (l1)
    ***REMOVED***
    case 12:                        // DirCommentContents
      shift(12);                    // DirCommentContents
      break;
    case 50:                        // '-->'
      shift(50);                    // '-->'
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("XMLComment", e0);
  ***REMOVED***;

  this.parse_PI = function()
  ***REMOVED***
    eventHandler.startNonterminal("PI", e0);
    lookahead1(3);                  // DirPIContents | EOF | '?' | '?>'
    switch (l1)
    ***REMOVED***
    case 13:                        // DirPIContents
      shift(13);                    // DirPIContents
      break;
    case 62:                        // '?'
      shift(62);                    // '?'
      break;
    case 63:                        // '?>'
      shift(63);                    // '?>'
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("PI", e0);
  ***REMOVED***;

  this.parse_Pragma = function()
  ***REMOVED***
    eventHandler.startNonterminal("Pragma", e0);
    lookahead1(2);                  // PragmaContents | EOF | '#' | '#)'
    switch (l1)
    ***REMOVED***
    case 11:                        // PragmaContents
      shift(11);                    // PragmaContents
      break;
    case 38:                        // '#'
      shift(38);                    // '#'
      break;
    case 39:                        // '#)'
      shift(39);                    // '#)'
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("Pragma", e0);
  ***REMOVED***;

  this.parse_Comment = function()
  ***REMOVED***
    eventHandler.startNonterminal("Comment", e0);
    lookahead1(4);                  // CommentContents | EOF | '(:' | ':)'
    switch (l1)
    ***REMOVED***
    case 55:                        // ':)'
      shift(55);                    // ':)'
      break;
    case 44:                        // '(:'
      shift(44);                    // '(:'
      break;
    case 32:                        // CommentContents
      shift(32);                    // CommentContents
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("Comment", e0);
  ***REMOVED***;

  this.parse_CommentDoc = function()
  ***REMOVED***
    eventHandler.startNonterminal("CommentDoc", e0);
    lookahead1(6);                  // DocTag | DocCommentContents | EOF | '(:' | ':)'
    switch (l1)
    ***REMOVED***
    case 33:                        // DocTag
      shift(33);                    // DocTag
      break;
    case 34:                        // DocCommentContents
      shift(34);                    // DocCommentContents
      break;
    case 55:                        // ':)'
      shift(55);                    // ':)'
      break;
    case 44:                        // '(:'
      shift(44);                    // '(:'
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("CommentDoc", e0);
  ***REMOVED***;

  this.parse_QuotString = function()
  ***REMOVED***
    eventHandler.startNonterminal("QuotString", e0);
    lookahead1(5);                  // JSONChar | JSONCharRef | JSONPredefinedCharRef | EOF | '"'
    switch (l1)
    ***REMOVED***
    case 3:                         // JSONPredefinedCharRef
      shift(3);                     // JSONPredefinedCharRef
      break;
    case 2:                         // JSONCharRef
      shift(2);                     // JSONCharRef
      break;
    case 1:                         // JSONChar
      shift(1);                     // JSONChar
      break;
    case 37:                        // '"'
      shift(37);                    // '"'
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("QuotString", e0);
  ***REMOVED***;

  this.parse_AposString = function()
  ***REMOVED***
    eventHandler.startNonterminal("AposString", e0);
    lookahead1(7);                  // PredefinedEntityRef | EscapeApos | AposChar | CharRef | EOF | "'"
    switch (l1)
    ***REMOVED***
    case 21:                        // PredefinedEntityRef
      shift(21);                    // PredefinedEntityRef
      break;
    case 31:                        // CharRef
      shift(31);                    // CharRef
      break;
    case 23:                        // EscapeApos
      shift(23);                    // EscapeApos
      break;
    case 24:                        // AposChar
      shift(24);                    // AposChar
      break;
    case 41:                        // "'"
      shift(41);                    // "'"
      break;
    default:
      shift(35);                    // EOF
***REMOVED***
    eventHandler.endNonterminal("AposString", e0);
  ***REMOVED***;

  this.parse_Prefix = function()
  ***REMOVED***
    eventHandler.startNonterminal("Prefix", e0);
    lookahead1W(13);                // NCName^Token | S^WS | 'after' | 'allowing' | 'ancestor' | 'ancestor-or-self' |
    whitespace();
    parse_NCName();
    eventHandler.endNonterminal("Prefix", e0);
  ***REMOVED***;

  this.parse__EQName = function()
  ***REMOVED***
    eventHandler.startNonterminal("_EQName", e0);
    lookahead1W(12);                // EQName^Token | S^WS | 'after' | 'allowing' | 'ancestor' | 'ancestor-or-self' |
    whitespace();
    parse_EQName();
    eventHandler.endNonterminal("_EQName", e0);
  ***REMOVED***;

  function parse_EQName()
  ***REMOVED***
    eventHandler.startNonterminal("EQName", e0);
    switch (l1)
    ***REMOVED***
    case 80:                        // 'attribute'
      shift(80);                    // 'attribute'
      break;
    case 94:                        // 'comment'
      shift(94);                    // 'comment'
      break;
    case 118:                       // 'document-node'
      shift(118);                   // 'document-node'
      break;
    case 119:                       // 'element'
      shift(119);                   // 'element'
      break;
    case 122:                       // 'empty-sequence'
      shift(122);                   // 'empty-sequence'
      break;
    case 143:                       // 'function'
      shift(143);                   // 'function'
      break;
    case 150:                       // 'if'
      shift(150);                   // 'if'
      break;
    case 163:                       // 'item'
      shift(163);                   // 'item'
      break;
    case 183:                       // 'namespace-node'
      shift(183);                   // 'namespace-node'
      break;
    case 189:                       // 'node'
      shift(189);                   // 'node'
      break;
    case 214:                       // 'processing-instruction'
      shift(214);                   // 'processing-instruction'
      break;
    case 224:                       // 'schema-attribute'
      shift(224);                   // 'schema-attribute'
      break;
    case 225:                       // 'schema-element'
      shift(225);                   // 'schema-element'
      break;
    case 241:                       // 'switch'
      shift(241);                   // 'switch'
      break;
    case 242:                       // 'text'
      shift(242);                   // 'text'
      break;
    case 251:                       // 'typeswitch'
      shift(251);                   // 'typeswitch'
      break;
    default:
      parse_FunctionName();
***REMOVED***
    eventHandler.endNonterminal("EQName", e0);
  ***REMOVED***

  function parse_FunctionName()
  ***REMOVED***
    eventHandler.startNonterminal("FunctionName", e0);
    switch (l1)
    ***REMOVED***
    case 17:                        // EQName^Token
      shift(17);                    // EQName^Token
      break;
    case 68:                        // 'after'
      shift(68);                    // 'after'
      break;
    case 71:                        // 'ancestor'
      shift(71);                    // 'ancestor'
      break;
    case 72:                        // 'ancestor-or-self'
      shift(72);                    // 'ancestor-or-self'
      break;
    case 73:                        // 'and'
      shift(73);                    // 'and'
      break;
    case 77:                        // 'as'
      shift(77);                    // 'as'
      break;
    case 78:                        // 'ascending'
      shift(78);                    // 'ascending'
      break;
    case 82:                        // 'before'
      shift(82);                    // 'before'
      break;
    case 86:                        // 'case'
      shift(86);                    // 'case'
      break;
    case 87:                        // 'cast'
      shift(87);                    // 'cast'
      break;
    case 88:                        // 'castable'
      shift(88);                    // 'castable'
      break;
    case 91:                        // 'child'
      shift(91);                    // 'child'
      break;
    case 92:                        // 'collation'
      shift(92);                    // 'collation'
      break;
    case 101:                       // 'copy'
      shift(101);                   // 'copy'
      break;
    case 103:                       // 'count'
      shift(103);                   // 'count'
      break;
    case 106:                       // 'declare'
      shift(106);                   // 'declare'
      break;
    case 107:                       // 'default'
      shift(107);                   // 'default'
      break;
    case 108:                       // 'delete'
      shift(108);                   // 'delete'
      break;
    case 109:                       // 'descendant'
      shift(109);                   // 'descendant'
      break;
    case 110:                       // 'descendant-or-self'
      shift(110);                   // 'descendant-or-self'
      break;
    case 111:                       // 'descending'
      shift(111);                   // 'descending'
      break;
    case 116:                       // 'div'
      shift(116);                   // 'div'
      break;
    case 117:                       // 'document'
      shift(117);                   // 'document'
      break;
    case 120:                       // 'else'
      shift(120);                   // 'else'
      break;
    case 121:                       // 'empty'
      shift(121);                   // 'empty'
      break;
    case 124:                       // 'end'
      shift(124);                   // 'end'
      break;
    case 126:                       // 'eq'
      shift(126);                   // 'eq'
      break;
    case 127:                       // 'every'
      shift(127);                   // 'every'
      break;
    case 129:                       // 'except'
      shift(129);                   // 'except'
      break;
    case 132:                       // 'first'
      shift(132);                   // 'first'
      break;
    case 133:                       // 'following'
      shift(133);                   // 'following'
      break;
    case 134:                       // 'following-sibling'
      shift(134);                   // 'following-sibling'
      break;
    case 135:                       // 'for'
      shift(135);                   // 'for'
      break;
    case 144:                       // 'ge'
      shift(144);                   // 'ge'
      break;
    case 146:                       // 'group'
      shift(146);                   // 'group'
      break;
    case 148:                       // 'gt'
      shift(148);                   // 'gt'
      break;
    case 149:                       // 'idiv'
      shift(149);                   // 'idiv'
      break;
    case 151:                       // 'import'
      shift(151);                   // 'import'
      break;
    case 157:                       // 'insert'
      shift(157);                   // 'insert'
      break;
    case 158:                       // 'instance'
      shift(158);                   // 'instance'
      break;
    case 160:                       // 'intersect'
      shift(160);                   // 'intersect'
      break;
    case 161:                       // 'into'
      shift(161);                   // 'into'
      break;
    case 162:                       // 'is'
      shift(162);                   // 'is'
      break;
    case 168:                       // 'last'
      shift(168);                   // 'last'
      break;
    case 170:                       // 'le'
      shift(170);                   // 'le'
      break;
    case 172:                       // 'let'
      shift(172);                   // 'let'
      break;
    case 176:                       // 'lt'
      shift(176);                   // 'lt'
      break;
    case 178:                       // 'mod'
      shift(178);                   // 'mod'
      break;
    case 179:                       // 'modify'
      shift(179);                   // 'modify'
      break;
    case 180:                       // 'module'
      shift(180);                   // 'module'
      break;
    case 182:                       // 'namespace'
      shift(182);                   // 'namespace'
      break;
    case 184:                       // 'ne'
      shift(184);                   // 'ne'
      break;
    case 196:                       // 'only'
      shift(196);                   // 'only'
      break;
    case 198:                       // 'or'
      shift(198);                   // 'or'
      break;
    case 199:                       // 'order'
      shift(199);                   // 'order'
      break;
    case 200:                       // 'ordered'
      shift(200);                   // 'ordered'
      break;
    case 204:                       // 'parent'
      shift(204);                   // 'parent'
      break;
    case 210:                       // 'preceding'
      shift(210);                   // 'preceding'
      break;
    case 211:                       // 'preceding-sibling'
      shift(211);                   // 'preceding-sibling'
      break;
    case 216:                       // 'rename'
      shift(216);                   // 'rename'
      break;
    case 217:                       // 'replace'
      shift(217);                   // 'replace'
      break;
    case 218:                       // 'return'
      shift(218);                   // 'return'
      break;
    case 222:                       // 'satisfies'
      shift(222);                   // 'satisfies'
      break;
    case 227:                       // 'self'
      shift(227);                   // 'self'
      break;
    case 233:                       // 'some'
      shift(233);                   // 'some'
      break;
    case 234:                       // 'stable'
      shift(234);                   // 'stable'
      break;
    case 235:                       // 'start'
      shift(235);                   // 'start'
      break;
    case 246:                       // 'to'
      shift(246);                   // 'to'
      break;
    case 247:                       // 'treat'
      shift(247);                   // 'treat'
      break;
    case 248:                       // 'try'
      shift(248);                   // 'try'
      break;
    case 252:                       // 'union'
      shift(252);                   // 'union'
      break;
    case 254:                       // 'unordered'
      shift(254);                   // 'unordered'
      break;
    case 258:                       // 'validate'
      shift(258);                   // 'validate'
      break;
    case 264:                       // 'where'
      shift(264);                   // 'where'
      break;
    case 268:                       // 'with'
      shift(268);                   // 'with'
      break;
    case 272:                       // 'xquery'
      shift(272);                   // 'xquery'
      break;
    case 70:                        // 'allowing'
      shift(70);                    // 'allowing'
      break;
    case 79:                        // 'at'
      shift(79);                    // 'at'
      break;
    case 81:                        // 'base-uri'
      shift(81);                    // 'base-uri'
      break;
    case 83:                        // 'boundary-space'
      shift(83);                    // 'boundary-space'
      break;
    case 84:                        // 'break'
      shift(84);                    // 'break'
      break;
    case 89:                        // 'catch'
      shift(89);                    // 'catch'
      break;
    case 96:                        // 'construction'
      shift(96);                    // 'construction'
      break;
    case 99:                        // 'context'
      shift(99);                    // 'context'
      break;
    case 100:                       // 'continue'
      shift(100);                   // 'continue'
      break;
    case 102:                       // 'copy-namespaces'
      shift(102);                   // 'copy-namespaces'
      break;
    case 104:                       // 'decimal-format'
      shift(104);                   // 'decimal-format'
      break;
    case 123:                       // 'encoding'
      shift(123);                   // 'encoding'
      break;
    case 130:                       // 'exit'
      shift(130);                   // 'exit'
      break;
    case 131:                       // 'external'
      shift(131);                   // 'external'
      break;
    case 139:                       // 'ft-option'
      shift(139);                   // 'ft-option'
      break;
    case 152:                       // 'in'
      shift(152);                   // 'in'
      break;
    case 153:                       // 'index'
      shift(153);                   // 'index'
      break;
    case 159:                       // 'integrity'
      shift(159);                   // 'integrity'
      break;
    case 169:                       // 'lax'
      shift(169);                   // 'lax'
      break;
    case 190:                       // 'nodes'
      shift(190);                   // 'nodes'
      break;
    case 197:                       // 'option'
      shift(197);                   // 'option'
      break;
    case 201:                       // 'ordering'
      shift(201);                   // 'ordering'
      break;
    case 220:                       // 'revalidation'
      shift(220);                   // 'revalidation'
      break;
    case 223:                       // 'schema'
      shift(223);                   // 'schema'
      break;
    case 226:                       // 'score'
      shift(226);                   // 'score'
      break;
    case 232:                       // 'sliding'
      shift(232);                   // 'sliding'
      break;
    case 238:                       // 'strict'
      shift(238);                   // 'strict'
      break;
    case 249:                       // 'tumbling'
      shift(249);                   // 'tumbling'
      break;
    case 250:                       // 'type'
      shift(250);                   // 'type'
      break;
    case 255:                       // 'updating'
      shift(255);                   // 'updating'
      break;
    case 259:                       // 'value'
      shift(259);                   // 'value'
      break;
    case 260:                       // 'variable'
      shift(260);                   // 'variable'
      break;
    case 261:                       // 'version'
      shift(261);                   // 'version'
      break;
    case 265:                       // 'while'
      shift(265);                   // 'while'
      break;
    case 95:                        // 'constraint'
      shift(95);                    // 'constraint'
      break;
    case 174:                       // 'loop'
      shift(174);                   // 'loop'
      break;
    default:
      shift(219);                   // 'returning'
***REMOVED***
    eventHandler.endNonterminal("FunctionName", e0);
  ***REMOVED***

  function parse_NCName()
  ***REMOVED***
    eventHandler.startNonterminal("NCName", e0);
    switch (l1)
    ***REMOVED***
    case 28:                        // NCName^Token
      shift(28);                    // NCName^Token
      break;
    case 68:                        // 'after'
      shift(68);                    // 'after'
      break;
    case 73:                        // 'and'
      shift(73);                    // 'and'
      break;
    case 77:                        // 'as'
      shift(77);                    // 'as'
      break;
    case 78:                        // 'ascending'
      shift(78);                    // 'ascending'
      break;
    case 82:                        // 'before'
      shift(82);                    // 'before'
      break;
    case 86:                        // 'case'
      shift(86);                    // 'case'
      break;
    case 87:                        // 'cast'
      shift(87);                    // 'cast'
      break;
    case 88:                        // 'castable'
      shift(88);                    // 'castable'
      break;
    case 92:                        // 'collation'
      shift(92);                    // 'collation'
      break;
    case 103:                       // 'count'
      shift(103);                   // 'count'
      break;
    case 107:                       // 'default'
      shift(107);                   // 'default'
      break;
    case 111:                       // 'descending'
      shift(111);                   // 'descending'
      break;
    case 116:                       // 'div'
      shift(116);                   // 'div'
      break;
    case 120:                       // 'else'
      shift(120);                   // 'else'
      break;
    case 121:                       // 'empty'
      shift(121);                   // 'empty'
      break;
    case 124:                       // 'end'
      shift(124);                   // 'end'
      break;
    case 126:                       // 'eq'
      shift(126);                   // 'eq'
      break;
    case 129:                       // 'except'
      shift(129);                   // 'except'
      break;
    case 135:                       // 'for'
      shift(135);                   // 'for'
      break;
    case 144:                       // 'ge'
      shift(144);                   // 'ge'
      break;
    case 146:                       // 'group'
      shift(146);                   // 'group'
      break;
    case 148:                       // 'gt'
      shift(148);                   // 'gt'
      break;
    case 149:                       // 'idiv'
      shift(149);                   // 'idiv'
      break;
    case 158:                       // 'instance'
      shift(158);                   // 'instance'
      break;
    case 160:                       // 'intersect'
      shift(160);                   // 'intersect'
      break;
    case 161:                       // 'into'
      shift(161);                   // 'into'
      break;
    case 162:                       // 'is'
      shift(162);                   // 'is'
      break;
    case 170:                       // 'le'
      shift(170);                   // 'le'
      break;
    case 172:                       // 'let'
      shift(172);                   // 'let'
      break;
    case 176:                       // 'lt'
      shift(176);                   // 'lt'
      break;
    case 178:                       // 'mod'
      shift(178);                   // 'mod'
      break;
    case 179:                       // 'modify'
      shift(179);                   // 'modify'
      break;
    case 184:                       // 'ne'
      shift(184);                   // 'ne'
      break;
    case 196:                       // 'only'
      shift(196);                   // 'only'
      break;
    case 198:                       // 'or'
      shift(198);                   // 'or'
      break;
    case 199:                       // 'order'
      shift(199);                   // 'order'
      break;
    case 218:                       // 'return'
      shift(218);                   // 'return'
      break;
    case 222:                       // 'satisfies'
      shift(222);                   // 'satisfies'
      break;
    case 234:                       // 'stable'
      shift(234);                   // 'stable'
      break;
    case 235:                       // 'start'
      shift(235);                   // 'start'
      break;
    case 246:                       // 'to'
      shift(246);                   // 'to'
      break;
    case 247:                       // 'treat'
      shift(247);                   // 'treat'
      break;
    case 252:                       // 'union'
      shift(252);                   // 'union'
      break;
    case 264:                       // 'where'
      shift(264);                   // 'where'
      break;
    case 268:                       // 'with'
      shift(268);                   // 'with'
      break;
    case 71:                        // 'ancestor'
      shift(71);                    // 'ancestor'
      break;
    case 72:                        // 'ancestor-or-self'
      shift(72);                    // 'ancestor-or-self'
      break;
    case 80:                        // 'attribute'
      shift(80);                    // 'attribute'
      break;
    case 91:                        // 'child'
      shift(91);                    // 'child'
      break;
    case 94:                        // 'comment'
      shift(94);                    // 'comment'
      break;
    case 101:                       // 'copy'
      shift(101);                   // 'copy'
      break;
    case 106:                       // 'declare'
      shift(106);                   // 'declare'
      break;
    case 108:                       // 'delete'
      shift(108);                   // 'delete'
      break;
    case 109:                       // 'descendant'
      shift(109);                   // 'descendant'
      break;
    case 110:                       // 'descendant-or-self'
      shift(110);                   // 'descendant-or-self'
      break;
    case 117:                       // 'document'
      shift(117);                   // 'document'
      break;
    case 118:                       // 'document-node'
      shift(118);                   // 'document-node'
      break;
    case 119:                       // 'element'
      shift(119);                   // 'element'
      break;
    case 122:                       // 'empty-sequence'
      shift(122);                   // 'empty-sequence'
      break;
    case 127:                       // 'every'
      shift(127);                   // 'every'
      break;
    case 132:                       // 'first'
      shift(132);                   // 'first'
      break;
    case 133:                       // 'following'
      shift(133);                   // 'following'
      break;
    case 134:                       // 'following-sibling'
      shift(134);                   // 'following-sibling'
      break;
    case 143:                       // 'function'
      shift(143);                   // 'function'
      break;
    case 150:                       // 'if'
      shift(150);                   // 'if'
      break;
    case 151:                       // 'import'
      shift(151);                   // 'import'
      break;
    case 157:                       // 'insert'
      shift(157);                   // 'insert'
      break;
    case 163:                       // 'item'
      shift(163);                   // 'item'
      break;
    case 168:                       // 'last'
      shift(168);                   // 'last'
      break;
    case 180:                       // 'module'
      shift(180);                   // 'module'
      break;
    case 182:                       // 'namespace'
      shift(182);                   // 'namespace'
      break;
    case 183:                       // 'namespace-node'
      shift(183);                   // 'namespace-node'
      break;
    case 189:                       // 'node'
      shift(189);                   // 'node'
      break;
    case 200:                       // 'ordered'
      shift(200);                   // 'ordered'
      break;
    case 204:                       // 'parent'
      shift(204);                   // 'parent'
      break;
    case 210:                       // 'preceding'
      shift(210);                   // 'preceding'
      break;
    case 211:                       // 'preceding-sibling'
      shift(211);                   // 'preceding-sibling'
      break;
    case 214:                       // 'processing-instruction'
      shift(214);                   // 'processing-instruction'
      break;
    case 216:                       // 'rename'
      shift(216);                   // 'rename'
      break;
    case 217:                       // 'replace'
      shift(217);                   // 'replace'
      break;
    case 224:                       // 'schema-attribute'
      shift(224);                   // 'schema-attribute'
      break;
    case 225:                       // 'schema-element'
      shift(225);                   // 'schema-element'
      break;
    case 227:                       // 'self'
      shift(227);                   // 'self'
      break;
    case 233:                       // 'some'
      shift(233);                   // 'some'
      break;
    case 241:                       // 'switch'
      shift(241);                   // 'switch'
      break;
    case 242:                       // 'text'
      shift(242);                   // 'text'
      break;
    case 248:                       // 'try'
      shift(248);                   // 'try'
      break;
    case 251:                       // 'typeswitch'
      shift(251);                   // 'typeswitch'
      break;
    case 254:                       // 'unordered'
      shift(254);                   // 'unordered'
      break;
    case 258:                       // 'validate'
      shift(258);                   // 'validate'
      break;
    case 260:                       // 'variable'
      shift(260);                   // 'variable'
      break;
    case 272:                       // 'xquery'
      shift(272);                   // 'xquery'
      break;
    case 70:                        // 'allowing'
      shift(70);                    // 'allowing'
      break;
    case 79:                        // 'at'
      shift(79);                    // 'at'
      break;
    case 81:                        // 'base-uri'
      shift(81);                    // 'base-uri'
      break;
    case 83:                        // 'boundary-space'
      shift(83);                    // 'boundary-space'
      break;
    case 84:                        // 'break'
      shift(84);                    // 'break'
      break;
    case 89:                        // 'catch'
      shift(89);                    // 'catch'
      break;
    case 96:                        // 'construction'
      shift(96);                    // 'construction'
      break;
    case 99:                        // 'context'
      shift(99);                    // 'context'
      break;
    case 100:                       // 'continue'
      shift(100);                   // 'continue'
      break;
    case 102:                       // 'copy-namespaces'
      shift(102);                   // 'copy-namespaces'
      break;
    case 104:                       // 'decimal-format'
      shift(104);                   // 'decimal-format'
      break;
    case 123:                       // 'encoding'
      shift(123);                   // 'encoding'
      break;
    case 130:                       // 'exit'
      shift(130);                   // 'exit'
      break;
    case 131:                       // 'external'
      shift(131);                   // 'external'
      break;
    case 139:                       // 'ft-option'
      shift(139);                   // 'ft-option'
      break;
    case 152:                       // 'in'
      shift(152);                   // 'in'
      break;
    case 153:                       // 'index'
      shift(153);                   // 'index'
      break;
    case 159:                       // 'integrity'
      shift(159);                   // 'integrity'
      break;
    case 169:                       // 'lax'
      shift(169);                   // 'lax'
      break;
    case 190:                       // 'nodes'
      shift(190);                   // 'nodes'
      break;
    case 197:                       // 'option'
      shift(197);                   // 'option'
      break;
    case 201:                       // 'ordering'
      shift(201);                   // 'ordering'
      break;
    case 220:                       // 'revalidation'
      shift(220);                   // 'revalidation'
      break;
    case 223:                       // 'schema'
      shift(223);                   // 'schema'
      break;
    case 226:                       // 'score'
      shift(226);                   // 'score'
      break;
    case 232:                       // 'sliding'
      shift(232);                   // 'sliding'
      break;
    case 238:                       // 'strict'
      shift(238);                   // 'strict'
      break;
    case 249:                       // 'tumbling'
      shift(249);                   // 'tumbling'
      break;
    case 250:                       // 'type'
      shift(250);                   // 'type'
      break;
    case 255:                       // 'updating'
      shift(255);                   // 'updating'
      break;
    case 259:                       // 'value'
      shift(259);                   // 'value'
      break;
    case 261:                       // 'version'
      shift(261);                   // 'version'
      break;
    case 265:                       // 'while'
      shift(265);                   // 'while'
      break;
    case 95:                        // 'constraint'
      shift(95);                    // 'constraint'
      break;
    case 174:                       // 'loop'
      shift(174);                   // 'loop'
      break;
    default:
      shift(219);                   // 'returning'
***REMOVED***
    eventHandler.endNonterminal("NCName", e0);
  ***REMOVED***

  function shift(t)
  ***REMOVED***
    if (l1 == t)
    ***REMOVED***
      whitespace();
      eventHandler.terminal(JSONiqTokenizer.TOKEN[l1], b1, e1 > size ? size : e1);
      b0 = b1; e0 = e1; l1 = 0;
***REMOVED***
    else
    ***REMOVED***
      error(b1, e1, 0, l1, t);
***REMOVED***
  ***REMOVED***

  function whitespace()
  ***REMOVED***
    if (e0 != b1)
    ***REMOVED***
      b0 = e0;
      e0 = b1;
      eventHandler.whitespace(b0, e0);
***REMOVED***
  ***REMOVED***

  function matchW(set)
  ***REMOVED***
    var code;
    for (;;)
    ***REMOVED***
      code = match(set);
      if (code != 30)               // S^WS
      ***REMOVED***
        break;
  ***REMOVED***
***REMOVED***
    return code;
  ***REMOVED***

  function lookahead1W(set)
  ***REMOVED***
    if (l1 == 0)
    ***REMOVED***
      l1 = matchW(set);
      b1 = begin;
      e1 = end;
***REMOVED***
  ***REMOVED***

  function lookahead1(set)
  ***REMOVED***
    if (l1 == 0)
    ***REMOVED***
      l1 = match(set);
      b1 = begin;
      e1 = end;
***REMOVED***
  ***REMOVED***

  function error(b, e, s, l, t)
  ***REMOVED***
    throw new self.ParseException(b, e, s, l, t);
  ***REMOVED***

  var lk, b0, e0;
  var l1, b1, e1;
  var eventHandler;

  var input;
  var size;
  var begin;
  var end;

  function match(tokenSetId)
  ***REMOVED***
    var nonbmp = false;
    begin = end;
    var current = end;
    var result = JSONiqTokenizer.INITIAL[tokenSetId];
    var state = 0;

    for (var code = result & 4095; code != 0; )
    ***REMOVED***
      var charclass;
      var c0 = current < size ? input.charCodeAt(current) : 0;
      ++current;
      if (c0 < 0x80)
      ***REMOVED***
        charclass = JSONiqTokenizer.MAP0[c0];
  ***REMOVED***
      else if (c0 < 0xd800)
      ***REMOVED***
        var c1 = c0 >> 4;
        charclass = JSONiqTokenizer.MAP1[(c0 & 15) + JSONiqTokenizer.MAP1[(c1 & 31) + JSONiqTokenizer.MAP1[c1 >> 5]]];
  ***REMOVED***
      else
      ***REMOVED***
        if (c0 < 0xdc00)
        ***REMOVED***
          var c1 = current < size ? input.charCodeAt(current) : 0;
          if (c1 >= 0xdc00 && c1 < 0xe000)
          ***REMOVED***
            ++current;
            c0 = ((c0 & 0x3ff) << 10) + (c1 & 0x3ff) + 0x10000;
            nonbmp = true;
      ***REMOVED***
    ***REMOVED***
        var lo = 0, hi = 5;
        for (var m = 3; ; m = (hi + lo) >> 1)
        ***REMOVED***
          if (JSONiqTokenizer.MAP2[m] > c0) hi = m - 1;
          else if (JSONiqTokenizer.MAP2[6 + m] < c0) lo = m + 1;
          else ***REMOVED***charclass = JSONiqTokenizer.MAP2[12 + m]; break;***REMOVED***
          if (lo > hi) ***REMOVED***charclass = 0; break;***REMOVED***
    ***REMOVED***
  ***REMOVED***

      state = code;
      var i0 = (charclass << 12) + code - 1;
      code = JSONiqTokenizer.TRANSITION[(i0 & 15) + JSONiqTokenizer.TRANSITION[i0 >> 4]];

      if (code > 4095)
      ***REMOVED***
        result = code;
        code &= 4095;
        end = current;
  ***REMOVED***
***REMOVED***

    result >>= 12;
    if (result == 0)
    ***REMOVED***
      end = current - 1;
      var c1 = end < size ? input.charCodeAt(end) : 0;
      if (c1 >= 0xdc00 && c1 < 0xe000) --end;
      return error(begin, end, state, -1, -1);
***REMOVED***

    if (nonbmp)
    ***REMOVED***
      for (var i = result >> 9; i > 0; --i)
      ***REMOVED***
        --end;
        var c1 = end < size ? input.charCodeAt(end) : 0;
        if (c1 >= 0xdc00 && c1 < 0xe000) --end;
  ***REMOVED***
***REMOVED***
    else
    ***REMOVED***
      end -= result >> 9;
***REMOVED***

    return (result & 511) - 1;
  ***REMOVED***
***REMOVED***

JSONiqTokenizer.getTokenSet = function(tokenSetId)
***REMOVED***
  var set = [];
  var s = tokenSetId < 0 ? - tokenSetId : INITIAL[tokenSetId] & 4095;
  for (var i = 0; i < 279; i += 32)
  ***REMOVED***
    var j = i;
    var i0 = (i >> 5) * 2066 + s - 1;
    var i1 = i0 >> 2;
    var i2 = i1 >> 2;
    var f = JSONiqTokenizer.EXPECTED[(i0 & 3) + JSONiqTokenizer.EXPECTED[(i1 & 3) + JSONiqTokenizer.EXPECTED[(i2 & 3) + JSONiqTokenizer.EXPECTED[i2 >> 2]]]];
    for ( ; f != 0; f >>>= 1, ++j)
    ***REMOVED***
      if ((f & 1) != 0)
      ***REMOVED***
        set.push(JSONiqTokenizer.TOKEN[j]);
  ***REMOVED***
***REMOVED***
  ***REMOVED***
  return set;
***REMOVED***;

JSONiqTokenizer.MAP0 =
[
];

JSONiqTokenizer.MAP1 =
[
];

JSONiqTokenizer.MAP2 =
[
];

JSONiqTokenizer.INITIAL =
[
];

JSONiqTokenizer.TRANSITION =
[
];

JSONiqTokenizer.EXPECTED =
[
];

JSONiqTokenizer.TOKEN =
[
  "(0)",
  "JSONChar",
  "JSONCharRef",
  "JSONPredefinedCharRef",
  "ModuleDecl",
  "Annotation",
  "OptionDecl",
  "Operator",
  "Variable",
  "Tag",
  "EndTag",
  "PragmaContents",
  "DirCommentContents",
  "DirPIContents",
  "CDataSectionContents",
  "AttrTest",
  "Wildcard",
  "EQName",
  "IntegerLiteral",
  "DecimalLiteral",
  "DoubleLiteral",
  "PredefinedEntityRef",
  "'\"\"'",
  "EscapeApos",
  "AposChar",
  "ElementContentChar",
  "QuotAttrContentChar",
  "AposAttrContentChar",
  "NCName",
  "QName",
  "S",
  "CharRef",
  "CommentContents",
  "DocTag",
  "DocCommentContents",
  "EOF",
  "'!'",
  "'\"'",
  "'#'",
  "'#)'",
  "'$$'",
  "''''",
  "'('",
  "'(#'",
  "'(:'",
  "'(:~'",
  "')'",
  "'*'",
  "'*'",
  "','",
  "'-->'",
  "'.'",
  "'/'",
  "'/>'",
  "':'",
  "':)'",
  "';'",
  "'<!--'",
  "'<![CDATA['",
  "'<?'",
  "'='",
  "'>'",
  "'?'",
  "'?>'",
  "'NaN'",
  "'['",
  "']'",
  "']]>'",
  "'after'",
  "'all'",
  "'allowing'",
  "'ancestor'",
  "'ancestor-or-self'",
  "'and'",
  "'any'",
  "'append'",
  "'array'",
  "'as'",
  "'ascending'",
  "'at'",
  "'attribute'",
  "'base-uri'",
  "'before'",
  "'boundary-space'",
  "'break'",
  "'by'",
  "'case'",
  "'cast'",
  "'castable'",
  "'catch'",
  "'check'",
  "'child'",
  "'collation'",
  "'collection'",
  "'comment'",
  "'constraint'",
  "'construction'",
  "'contains'",
  "'content'",
  "'context'",
  "'continue'",
  "'copy'",
  "'copy-namespaces'",
  "'count'",
  "'decimal-format'",
  "'decimal-separator'",
  "'declare'",
  "'default'",
  "'delete'",
  "'descendant'",
  "'descendant-or-self'",
  "'descending'",
  "'diacritics'",
  "'different'",
  "'digit'",
  "'distance'",
  "'div'",
  "'document'",
  "'document-node'",
  "'element'",
  "'else'",
  "'empty'",
  "'empty-sequence'",
  "'encoding'",
  "'end'",
  "'entire'",
  "'eq'",
  "'every'",
  "'exactly'",
  "'except'",
  "'exit'",
  "'external'",
  "'first'",
  "'following'",
  "'following-sibling'",
  "'for'",
  "'foreach'",
  "'foreign'",
  "'from'",
  "'ft-option'",
  "'ftand'",
  "'ftnot'",
  "'ftor'",
  "'function'",
  "'ge'",
  "'greatest'",
  "'group'",
  "'grouping-separator'",
  "'gt'",
  "'idiv'",
  "'if'",
  "'import'",
  "'in'",
  "'index'",
  "'infinity'",
  "'inherit'",
  "'insensitive'",
  "'insert'",
  "'instance'",
  "'integrity'",
  "'intersect'",
  "'into'",
  "'is'",
  "'item'",
  "'json'",
  "'json-item'",
  "'key'",
  "'language'",
  "'last'",
  "'lax'",
  "'le'",
  "'least'",
  "'let'",
  "'levels'",
  "'loop'",
  "'lowercase'",
  "'lt'",
  "'minus-sign'",
  "'mod'",
  "'modify'",
  "'module'",
  "'most'",
  "'namespace'",
  "'namespace-node'",
  "'ne'",
  "'next'",
  "'no'",
  "'no-inherit'",
  "'no-preserve'",
  "'node'",
  "'nodes'",
  "'not'",
  "'object'",
  "'occurs'",
  "'of'",
  "'on'",
  "'only'",
  "'option'",
  "'or'",
  "'order'",
  "'ordered'",
  "'ordering'",
  "'paragraph'",
  "'paragraphs'",
  "'parent'",
  "'pattern-separator'",
  "'per-mille'",
  "'percent'",
  "'phrase'",
  "'position'",
  "'preceding'",
  "'preceding-sibling'",
  "'preserve'",
  "'previous'",
  "'processing-instruction'",
  "'relationship'",
  "'rename'",
  "'replace'",
  "'return'",
  "'returning'",
  "'revalidation'",
  "'same'",
  "'satisfies'",
  "'schema'",
  "'schema-attribute'",
  "'schema-element'",
  "'score'",
  "'self'",
  "'sensitive'",
  "'sentence'",
  "'sentences'",
  "'skip'",
  "'sliding'",
  "'some'",
  "'stable'",
  "'start'",
  "'stemming'",
  "'stop'",
  "'strict'",
  "'strip'",
  "'structured-item'",
  "'switch'",
  "'text'",
  "'then'",
  "'thesaurus'",
  "'times'",
  "'to'",
  "'treat'",
  "'try'",
  "'tumbling'",
  "'type'",
  "'typeswitch'",
  "'union'",
  "'unique'",
  "'unordered'",
  "'updating'",
  "'uppercase'",
  "'using'",
  "'validate'",
  "'value'",
  "'variable'",
  "'version'",
  "'weight'",
  "'when'",
  "'where'",
  "'while'",
  "'wildcards'",
  "'window'",
  "'with'",
  "'without'",
  "'word'",
  "'words'",
  "'xquery'",
  "'zero-digit'",
  "'***REMOVED***'",
  "'***REMOVED******REMOVED***'",
  "'|'",
  "'***REMOVED***'",
  "'***REMOVED******REMOVED***'"
];

***REMOVED***,
***REMOVED******REMOVED***],
2:[function(_dereq_,module,exports)***REMOVED***


var JSONiqTokenizer = _dereq_('./JSONiqTokenizer').JSONiqTokenizer;

var TokenHandler = function(code) ***REMOVED***
    var input = code;
    this.tokens = [];
 
    this.reset = function() ***REMOVED***
        input = input;
        this.tokens = [];
***REMOVED***;
    
    this.startNonterminal = function() ***REMOVED******REMOVED***;
    this.endNonterminal = function() ***REMOVED******REMOVED***;

    this.terminal = function(name, begin, end) ***REMOVED***
        this.tokens.push(***REMOVED***
            name: name,
            value: input.substring(begin, end)
    ***REMOVED***);
***REMOVED***;

    this.whitespace = function(begin, end) ***REMOVED***
        this.tokens.push(***REMOVED***
            name: 'WS',
            value: input.substring(begin, end)
    ***REMOVED***);
***REMOVED***;
***REMOVED***;

var keys = 'NaN|after|allowing|ancestor|ancestor-or-self|and|append|array|as|ascending|at|attribute|base-uri|before|boundary-space|break|by|case|cast|castable|catch|child|collation|comment|constraint|construction|contains|context|continue|copy|copy-namespaces|count|decimal-format|decimal-separator|declare|default|delete|descendant|descendant-or-self|descending|digit|div|document|document-node|element|else|empty|empty-sequence|encoding|end|eq|every|except|exit|external|false|first|following|following-sibling|for|from|ft-option|function|ge|greatest|group|grouping-separator|gt|idiv|if|import|in|index|infinity|insert|instance|integrity|intersect|into|is|item|json|json-item|jsoniq|last|lax|le|least|let|loop|lt|minus-sign|mod|modify|module|namespace|namespace-node|ne|next|node|nodes|not|null|object|of|only|option|or|order|ordered|ordering|paragraphs|parent|pattern-separator|per-mille|percent|preceding|preceding-sibling|previous|processing-instruction|rename|replace|return|returning|revalidation|satisfies|schema|schema-attribute|schema-element|score|select|self|sentences|sliding|some|stable|start|strict|switch|text|then|times|to|treat|true|try|tumbling|type|typeswitch|union|unordered|updating|validate|value|variable|version|when|where|while|window|with|words|xquery|zero-digit'.split('|');
var keywords = keys.map(function(val) ***REMOVED*** return ***REMOVED*** name: '\'' + val + '\'', token: 'keyword' ***REMOVED***; ***REMOVED***);
var ncnames = keys.map(function(val) ***REMOVED*** return ***REMOVED*** name: '\'' + val + '\'', token: 'text', next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***; ***REMOVED***);

var cdata = 'constant.language';
var number = 'constant';
var xmlcomment = 'comment';
var pi = 'xml-pe';
var pragma = 'constant.buildin';
var n = function(name)***REMOVED***
    return '\'' + name + '\'';
***REMOVED***;
var Rules = ***REMOVED***
    start: [
        ***REMOVED*** name: n('(#'), token: pragma, next: function(stack)***REMOVED*** stack.push('Pragma'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('(:'), token: 'comment', next: function(stack)***REMOVED*** stack.push('Comment'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('(:~'), token: 'comment.doc', next: function(stack)***REMOVED*** stack.push('CommentDoc'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('<!--'), token: xmlcomment, next: function(stack)***REMOVED*** stack.push('XMLComment'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('<?'), token: pi, next: function(stack) ***REMOVED*** stack.push('PI'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('\'\''), token: 'string', next: function(stack)***REMOVED*** stack.push('AposString'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('"'), token: 'string', next: function(stack)***REMOVED*** stack.push('QuotString'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'Annotation', token: 'support.function' ***REMOVED***,
        ***REMOVED*** name: 'ModuleDecl', token: 'keyword', next: function(stack)***REMOVED*** stack.push('Prefix'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'OptionDecl', token: 'keyword', next: function(stack)***REMOVED*** stack.push('_EQName'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'AttrTest', token: 'support.type' ***REMOVED***,
        ***REMOVED*** name: 'Variable', token: 'variable' ***REMOVED***,
        ***REMOVED*** name: n('<![CDATA['), token: cdata, next: function(stack)***REMOVED*** stack.push('CData'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'IntegerLiteral', token: number ***REMOVED***,
        ***REMOVED*** name: 'DecimalLiteral', token: number ***REMOVED***,
        ***REMOVED*** name: 'DoubleLiteral', token: number ***REMOVED***,
        ***REMOVED*** name: 'Operator', token: 'keyword.operator' ***REMOVED***,
        ***REMOVED*** name: 'EQName', token: function(val) ***REMOVED*** return keys.indexOf(val) !== -1 ? 'keyword' : 'support.function'; ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('('), token: 'lparen' ***REMOVED***,
        ***REMOVED*** name: n(')'), token: 'rparen' ***REMOVED***,
        ***REMOVED*** name: 'Tag', token: 'meta.tag', next: function(stack)***REMOVED*** stack.push('StartTag'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('***REMOVED***'), token: 'text', next: function(stack)***REMOVED*** if(stack.length > 1) ***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('***REMOVED***'), token: 'text', next: function(stack)***REMOVED*** stack.push('start'); ***REMOVED*** ***REMOVED*** //, next: function(stack)***REMOVED*** if(stack.length > 1) ***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED*** ***REMOVED***
    ].concat(keywords),
    _EQName: [
        ***REMOVED*** name: 'EQName', token: 'text', next: function(stack) ***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***
    ].concat(ncnames),
    Prefix: [
        ***REMOVED*** name: 'NCName', token: 'text', next: function(stack) ***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***
    ].concat(ncnames),
    StartTag: [
        ***REMOVED*** name: n('>'), token: 'meta.tag', next: function(stack)***REMOVED*** stack.push('TagContent'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'QName', token: 'entity.other.attribute-name' ***REMOVED***,
        ***REMOVED*** name: n('='), token: 'text' ***REMOVED***,
        ***REMOVED*** name: n('\'\''), token: 'string', next: function(stack)***REMOVED*** stack.push('AposAttr'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('"'), token: 'string', next: function(stack)***REMOVED*** stack.push('QuotAttr'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('/>'), token: 'meta.tag.r', next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***
    ],
    TagContent: [
        ***REMOVED*** name: 'ElementContentChar', token: 'text' ***REMOVED***,
        ***REMOVED*** name: n('<![CDATA['), token: cdata, next: function(stack)***REMOVED*** stack.push('CData'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n('<!--'), token: xmlcomment, next: function(stack)***REMOVED*** stack.push('XMLComment'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'Tag', token: 'meta.tag', next: function(stack)***REMOVED*** stack.push('StartTag'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'PredefinedEntityRef', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: 'CharRef', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: n('***REMOVED******REMOVED***'), token: 'text' ***REMOVED***,
        ***REMOVED*** name: n('***REMOVED******REMOVED***'), token: 'text' ***REMOVED***,
        ***REMOVED*** name: n('***REMOVED***'), token: 'text', next: function(stack)***REMOVED*** stack.push('start'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'EndTag', token: 'meta.tag', next: function(stack)***REMOVED*** stack.pop(); stack.pop(); ***REMOVED*** ***REMOVED***
    ],
    AposAttr: [
        ***REMOVED*** name: n('\'\''), token: 'string', next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'EscapeApos', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: 'AposAttrContentChar', token: 'string' ***REMOVED***,
        ***REMOVED*** name: 'PredefinedEntityRef', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: 'CharRef', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: n('***REMOVED******REMOVED***'), token: 'string' ***REMOVED***,
        ***REMOVED*** name: n('***REMOVED******REMOVED***'), token: 'string' ***REMOVED***,
        ***REMOVED*** name: n('***REMOVED***'), token: 'text', next: function(stack)***REMOVED*** stack.push('start'); ***REMOVED*** ***REMOVED***
    ],
    QuotAttr: [
        ***REMOVED*** name: n('\"'), token: 'string', next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'EscapeQuot', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: 'QuotAttrContentChar', token: 'string' ***REMOVED***,
        ***REMOVED*** name: 'PredefinedEntityRef', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: 'CharRef', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: n('***REMOVED******REMOVED***'), token: 'string' ***REMOVED***,
        ***REMOVED*** name: n('***REMOVED******REMOVED***'), token: 'string' ***REMOVED***,
        ***REMOVED*** name: n('***REMOVED***'), token: 'text', next: function(stack)***REMOVED*** stack.push('start'); ***REMOVED*** ***REMOVED***
    ],
    Pragma: [
        ***REMOVED*** name: 'PragmaContents', token: pragma ***REMOVED***,
        ***REMOVED*** name: n('#'), token: pragma ***REMOVED***,
        ***REMOVED*** name: n('#)'), token: pragma, next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***
    ],
    Comment: [
        ***REMOVED*** name: 'CommentContents', token: 'comment' ***REMOVED***,
        ***REMOVED*** name: n('(:'), token: 'comment', next: function(stack)***REMOVED*** stack.push('Comment'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n(':)'), token: 'comment', next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***
    ],
    CommentDoc: [
        ***REMOVED*** name: 'DocCommentContents', token: 'comment.doc' ***REMOVED***,
        ***REMOVED*** name: 'DocTag', token: 'comment.doc.tag' ***REMOVED***,
        ***REMOVED*** name: n('(:'), token: 'comment.doc', next: function(stack)***REMOVED*** stack.push('CommentDoc'); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: n(':)'), token: 'comment.doc', next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***
    ],
    XMLComment: [
        ***REMOVED*** name: 'DirCommentContents', token: xmlcomment ***REMOVED***,
        ***REMOVED*** name: n('-->'), token: xmlcomment, next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***
    ],
    CData: [
        ***REMOVED*** name: 'CDataSectionContents', token: cdata ***REMOVED***,
        ***REMOVED*** name: n(']]>'), token: cdata, next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***
    ],
    PI: [
        ***REMOVED*** name: 'DirPIContents', token: pi ***REMOVED***,
        ***REMOVED*** name: n('?'), token: pi ***REMOVED***,
        ***REMOVED*** name: n('?>'), token: pi, next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***
    ],
    AposString: [
        ***REMOVED*** name: n('\'\''), token: 'string', next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'PredefinedEntityRef', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: 'CharRef', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: 'EscapeApos', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: 'AposChar', token: 'string' ***REMOVED***
    ],
    QuotString: [
        ***REMOVED*** name: n('"'), token: 'string', next: function(stack)***REMOVED*** stack.pop(); ***REMOVED*** ***REMOVED***,
        ***REMOVED*** name: 'JSONPredefinedCharRef', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: 'JSONCharRef', token: 'constant.language.escape' ***REMOVED***,
        ***REMOVED*** name: 'JSONChar', token: 'string' ***REMOVED***
    ]
***REMOVED***;
    
exports.JSONiqLexer = function() ***REMOVED***
  
    this.tokens = [];
  
    this.getLineTokens = function(line, state) ***REMOVED***
        state = (state === 'start' || !state) ? '["start"]' : state;
        var stack = JSON.parse(state);
        var h = new TokenHandler(line);
        var tokenizer = new JSONiqTokenizer(line, h);
        var tokens = [];
    
        while(true) ***REMOVED***
            var currentState = stack[stack.length - 1];
            try ***REMOVED***
                h.tokens = [];
                tokenizer['parse_' + currentState]();
                var info = null;
        
                if(h.tokens.length > 1 && h.tokens[0].name === 'WS') ***REMOVED***
                    tokens.push(***REMOVED***
                        type: 'text',
                        value: h.tokens[0].value
                ***REMOVED***);
                    h.tokens.splice(0, 1);
            ***REMOVED***
        
                var token = h.tokens[0];
                var rules  = Rules[currentState];
                for(var k = 0; k < rules.length; k++) ***REMOVED***
                    var rule = Rules[currentState][k];
                    if((typeof(rule.name) === 'function' && rule.name(token)) || rule.name === token.name) ***REMOVED***
                        info = rule;
                        break;
                ***REMOVED***
            ***REMOVED***
        
                if(token.name === 'EOF') ***REMOVED*** break; ***REMOVED***
                if(token.value === '') ***REMOVED*** throw 'Encountered empty string lexical rule.'; ***REMOVED***

                tokens.push(***REMOVED***
                    type: info === null ? 'text' : (typeof(info.token) === 'function' ? info.token(token.value) : info.token),
                    value: token.value
            ***REMOVED***);
        
                if(info && info.next) ***REMOVED***
                    info.next(stack);
            ***REMOVED***
      
        ***REMOVED*** catch(e) ***REMOVED***
                if(e instanceof tokenizer.ParseException) ***REMOVED***
                    var index = 0;
                    for(var i=0; i < tokens.length; i++) ***REMOVED***
                        index += tokens[i].value.length;
                ***REMOVED***
                    tokens.push(***REMOVED*** type: 'text', value: line.substring(index) ***REMOVED***);
                    return ***REMOVED***
                        tokens: tokens,
                        state: JSON.stringify(['start'])
                ***REMOVED***;
            ***REMOVED*** else ***REMOVED***
                    throw e;
            ***REMOVED***
        ***REMOVED***
    ***REMOVED***

        return ***REMOVED***
            tokens: tokens,
            state: JSON.stringify(stack)
    ***REMOVED***;
***REMOVED***;
***REMOVED***;
***REMOVED***,
***REMOVED***"./JSONiqTokenizer":1***REMOVED***]***REMOVED***,***REMOVED******REMOVED***,[2])
(2)

***REMOVED***);
__ace_shadowed__.define('ace/mode/behaviour/xquery', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/behaviour', 'ace/mode/behaviour/cstyle', 'ace/mode/behaviour/xml', 'ace/token_iterator'], function(require, exports, module) ***REMOVED***


  var oop = require("../../lib/oop");
  var Behaviour = require('../behaviour').Behaviour;
  var CstyleBehaviour = require('./cstyle').CstyleBehaviour;
  var XmlBehaviour = require("../behaviour/xml").XmlBehaviour;
  var TokenIterator = require("../../token_iterator").TokenIterator;

function hasType(token, type) ***REMOVED***
    var hasType = true;
    var typeList = token.type.split('.');
    var needleList = type.split('.');
    needleList.forEach(function(needle)***REMOVED***
        if (typeList.indexOf(needle) == -1) ***REMOVED***
            hasType = false;
            return false;
    ***REMOVED***
***REMOVED***);
    return hasType;
***REMOVED***
 
  var XQueryBehaviour = function () ***REMOVED***
      
      this.inherit(CstyleBehaviour, ["braces", "parens", "string_dquotes"]); // Get string behaviour
      this.inherit(XmlBehaviour); // Get xml behaviour
      
      this.add("autoclosing", "insertion", function (state, action, editor, session, text) ***REMOVED***
        if (text == '>') ***REMOVED***
            var position = editor.getCursorPosition();
            var iterator = new TokenIterator(session, position.row, position.column);
            var token = iterator.getCurrentToken();
            var atCursor = false;
            var state = JSON.parse(state).pop();
            if ((token && token.value === '>') || state !== "StartTag") return;
            if (!token || !hasType(token, 'meta.tag') && !(hasType(token, 'text') && token.value.match('/')))***REMOVED***
                do ***REMOVED***
                    token = iterator.stepBackward();
            ***REMOVED*** while (token && (hasType(token, 'string') || hasType(token, 'keyword.operator') || hasType(token, 'entity.attribute-name') || hasType(token, 'text')));
        ***REMOVED*** else ***REMOVED***
                atCursor = true;
        ***REMOVED***
            var previous = iterator.stepBackward();
            if (!token || !hasType(token, 'meta.tag') || (previous !== null && previous.value.match('/'))) ***REMOVED***
                return
        ***REMOVED***
            var tag = token.value.substring(1);
            if (atCursor)***REMOVED***
                var tag = tag.substring(0, position.column - token.start);
        ***REMOVED***

            return ***REMOVED***
               text: '>' + '</' + tag + '>',
               selection: [1, 1]
        ***REMOVED***
    ***REMOVED***
***REMOVED***);

  ***REMOVED***
  oop.inherits(XQueryBehaviour, Behaviour);

  exports.XQueryBehaviour = XQueryBehaviour;
***REMOVED***);

__ace_shadowed__.define('ace/mode/behaviour/cstyle', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/behaviour', 'ace/token_iterator', 'ace/lib/lang'], function(require, exports, module) ***REMOVED***


var oop = require("../../lib/oop");
var Behaviour = require("../behaviour").Behaviour;
var TokenIterator = require("../../token_iterator").TokenIterator;
var lang = require("../../lib/lang");

var SAFE_INSERT_IN_TOKENS =
    ["text", "paren.rparen", "punctuation.operator"];
var SAFE_INSERT_BEFORE_TOKENS =
    ["text", "paren.rparen", "punctuation.operator", "comment"];

var context;
var contextCache = ***REMOVED******REMOVED***
var initContext = function(editor) ***REMOVED***
    var id = -1;
    if (editor.multiSelect) ***REMOVED***
        id = editor.selection.id;
        if (contextCache.rangeCount != editor.multiSelect.rangeCount)
            contextCache = ***REMOVED***rangeCount: editor.multiSelect.rangeCount***REMOVED***;
***REMOVED***
    if (contextCache[id])
        return context = contextCache[id];
    context = contextCache[id] = ***REMOVED***
        autoInsertedBrackets: 0,
        autoInsertedRow: -1,
        autoInsertedLineEnd: "",
        maybeInsertedBrackets: 0,
        maybeInsertedRow: -1,
        maybeInsertedLineStart: "",
        maybeInsertedLineEnd: ""
***REMOVED***;
***REMOVED***;

var CstyleBehaviour = function() ***REMOVED***
    this.add("braces", "insertion", function(state, action, editor, session, text) ***REMOVED***
        var cursor = editor.getCursorPosition();
        var line = session.doc.getLine(cursor.row);
        if (text == '***REMOVED***') ***REMOVED***
            initContext(editor);
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && selected !== "***REMOVED***" && editor.getWrapBehavioursEnabled()) ***REMOVED***
                return ***REMOVED***
                    text: '***REMOVED***' + selected + '***REMOVED***',
                    selection: false
            ***REMOVED***;
        ***REMOVED*** else if (CstyleBehaviour.isSaneInsertion(editor, session)) ***REMOVED***
                if (/[\]\***REMOVED***\)]/.test(line[cursor.column]) || editor.inMultiSelectMode) ***REMOVED***
                    CstyleBehaviour.recordAutoInsert(editor, session, "***REMOVED***");
                    return ***REMOVED***
                        text: '***REMOVED******REMOVED***',
                        selection: [1, 1]
                ***REMOVED***;
            ***REMOVED*** else ***REMOVED***
                    CstyleBehaviour.recordMaybeInsert(editor, session, "***REMOVED***");
                    return ***REMOVED***
                        text: '***REMOVED***',
                        selection: [1, 1]
                ***REMOVED***;
            ***REMOVED***
        ***REMOVED***
    ***REMOVED*** else if (text == '***REMOVED***') ***REMOVED***
            initContext(editor);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar == '***REMOVED***') ***REMOVED***
                var matching = session.$findOpeningBracket('***REMOVED***', ***REMOVED***column: cursor.column + 1, row: cursor.row***REMOVED***);
                if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) ***REMOVED***
                    CstyleBehaviour.popAutoInsertedClosing();
                    return ***REMOVED***
                        text: '',
                        selection: [1, 1]
                ***REMOVED***;
            ***REMOVED***
        ***REMOVED***
    ***REMOVED*** else if (text == "\n" || text == "\r\n") ***REMOVED***
            initContext(editor);
            var closing = "";
            if (CstyleBehaviour.isMaybeInsertedClosing(cursor, line)) ***REMOVED***
                closing = lang.stringRepeat("***REMOVED***", context.maybeInsertedBrackets);
                CstyleBehaviour.clearMaybeInsertedClosing();
        ***REMOVED***
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar === '***REMOVED***') ***REMOVED***
                var openBracePos = session.findMatchingBracket(***REMOVED***row: cursor.row, column: cursor.column+1***REMOVED***, '***REMOVED***');
                if (!openBracePos)
                     return null;
                var next_indent = this.$getIndent(session.getLine(openBracePos.row));
        ***REMOVED*** else if (closing) ***REMOVED***
                var next_indent = this.$getIndent(line);
        ***REMOVED*** else ***REMOVED***
                CstyleBehaviour.clearMaybeInsertedClosing();
                return;
        ***REMOVED***
            var indent = next_indent + session.getTabString();

            return ***REMOVED***
                text: '\n' + indent + '\n' + next_indent + closing,
                selection: [1, indent.length, 1, indent.length]
        ***REMOVED***;
    ***REMOVED*** else ***REMOVED***
            CstyleBehaviour.clearMaybeInsertedClosing();
    ***REMOVED***
***REMOVED***);

    this.add("braces", "deletion", function(state, action, editor, session, range) ***REMOVED***
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && selected == '***REMOVED***') ***REMOVED***
            initContext(editor);
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.end.column, range.end.column + 1);
            if (rightChar == '***REMOVED***') ***REMOVED***
                range.end.column++;
                return range;
        ***REMOVED*** else ***REMOVED***
                context.maybeInsertedBrackets--;
        ***REMOVED***
    ***REMOVED***
***REMOVED***);

    this.add("parens", "insertion", function(state, action, editor, session, text) ***REMOVED***
        if (text == '(') ***REMOVED***
            initContext(editor);
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && editor.getWrapBehavioursEnabled()) ***REMOVED***
                return ***REMOVED***
                    text: '(' + selected + ')',
                    selection: false
            ***REMOVED***;
        ***REMOVED*** else if (CstyleBehaviour.isSaneInsertion(editor, session)) ***REMOVED***
                CstyleBehaviour.recordAutoInsert(editor, session, ")");
                return ***REMOVED***
                    text: '()',
                    selection: [1, 1]
            ***REMOVED***;
        ***REMOVED***
    ***REMOVED*** else if (text == ')') ***REMOVED***
            initContext(editor);
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar == ')') ***REMOVED***
                var matching = session.$findOpeningBracket(')', ***REMOVED***column: cursor.column + 1, row: cursor.row***REMOVED***);
                if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) ***REMOVED***
                    CstyleBehaviour.popAutoInsertedClosing();
                    return ***REMOVED***
                        text: '',
                        selection: [1, 1]
                ***REMOVED***;
            ***REMOVED***
        ***REMOVED***
    ***REMOVED***
***REMOVED***);

    this.add("parens", "deletion", function(state, action, editor, session, range) ***REMOVED***
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && selected == '(') ***REMOVED***
            initContext(editor);
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == ')') ***REMOVED***
                range.end.column++;
                return range;
        ***REMOVED***
    ***REMOVED***
***REMOVED***);

    this.add("brackets", "insertion", function(state, action, editor, session, text) ***REMOVED***
        if (text == '[') ***REMOVED***
            initContext(editor);
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && editor.getWrapBehavioursEnabled()) ***REMOVED***
                return ***REMOVED***
                    text: '[' + selected + ']',
                    selection: false
            ***REMOVED***;
        ***REMOVED*** else if (CstyleBehaviour.isSaneInsertion(editor, session)) ***REMOVED***
                CstyleBehaviour.recordAutoInsert(editor, session, "]");
                return ***REMOVED***
                    text: '[]',
                    selection: [1, 1]
            ***REMOVED***;
        ***REMOVED***
    ***REMOVED*** else if (text == ']') ***REMOVED***
            initContext(editor);
            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            if (rightChar == ']') ***REMOVED***
                var matching = session.$findOpeningBracket(']', ***REMOVED***column: cursor.column + 1, row: cursor.row***REMOVED***);
                if (matching !== null && CstyleBehaviour.isAutoInsertedClosing(cursor, line, text)) ***REMOVED***
                    CstyleBehaviour.popAutoInsertedClosing();
                    return ***REMOVED***
                        text: '',
                        selection: [1, 1]
                ***REMOVED***;
            ***REMOVED***
        ***REMOVED***
    ***REMOVED***
***REMOVED***);

    this.add("brackets", "deletion", function(state, action, editor, session, range) ***REMOVED***
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && selected == '[') ***REMOVED***
            initContext(editor);
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == ']') ***REMOVED***
                range.end.column++;
                return range;
        ***REMOVED***
    ***REMOVED***
***REMOVED***);

    this.add("string_dquotes", "insertion", function(state, action, editor, session, text) ***REMOVED***
        if (text == '"' || text == "'") ***REMOVED***
            initContext(editor);
            var quote = text;
            var selection = editor.getSelectionRange();
            var selected = session.doc.getTextRange(selection);
            if (selected !== "" && selected !== "'" && selected != '"' && editor.getWrapBehavioursEnabled()) ***REMOVED***
                return ***REMOVED***
                    text: quote + selected + quote,
                    selection: false
            ***REMOVED***;
        ***REMOVED*** else ***REMOVED***
                var cursor = editor.getCursorPosition();
                var line = session.doc.getLine(cursor.row);
                var leftChar = line.substring(cursor.column-1, cursor.column);
                if (leftChar == '\\') ***REMOVED***
                    return null;
            ***REMOVED***
                var tokens = session.getTokens(selection.start.row);
                var col = 0, token;
                var quotepos = -1; // Track whether we're inside an open quote.

                for (var x = 0; x < tokens.length; x++) ***REMOVED***
                    token = tokens[x];
                    if (token.type == "string") ***REMOVED***
                      quotepos = -1;
                ***REMOVED*** else if (quotepos < 0) ***REMOVED***
                      quotepos = token.value.indexOf(quote);
                ***REMOVED***
                    if ((token.value.length + col) > selection.start.column) ***REMOVED***
                        break;
                ***REMOVED***
                    col += tokens[x].value.length;
            ***REMOVED***
                if (!token || (quotepos < 0 && token.type !== "comment" && (token.type !== "string" || ((selection.start.column !== token.value.length+col-1) && token.value.lastIndexOf(quote) === token.value.length-1)))) ***REMOVED***
                    if (!CstyleBehaviour.isSaneInsertion(editor, session))
                        return;
                    return ***REMOVED***
                        text: quote + quote,
                        selection: [1,1]
                ***REMOVED***;
            ***REMOVED*** else if (token && token.type === "string") ***REMOVED***
                    var rightChar = line.substring(cursor.column, cursor.column + 1);
                    if (rightChar == quote) ***REMOVED***
                        return ***REMOVED***
                            text: '',
                            selection: [1, 1]
                    ***REMOVED***;
                ***REMOVED***
            ***REMOVED***
        ***REMOVED***
    ***REMOVED***
***REMOVED***);

    this.add("string_dquotes", "deletion", function(state, action, editor, session, range) ***REMOVED***
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && (selected == '"' || selected == "'")) ***REMOVED***
            initContext(editor);
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == selected) ***REMOVED***
                range.end.column++;
                return range;
        ***REMOVED***
    ***REMOVED***
***REMOVED***);

***REMOVED***;

    
CstyleBehaviour.isSaneInsertion = function(editor, session) ***REMOVED***
    var cursor = editor.getCursorPosition();
    var iterator = new TokenIterator(session, cursor.row, cursor.column);
    if (!this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS)) ***REMOVED***
        var iterator2 = new TokenIterator(session, cursor.row, cursor.column + 1);
        if (!this.$matchTokenType(iterator2.getCurrentToken() || "text", SAFE_INSERT_IN_TOKENS))
            return false;
***REMOVED***
    iterator.stepForward();
    return iterator.getCurrentTokenRow() !== cursor.row ||
        this.$matchTokenType(iterator.getCurrentToken() || "text", SAFE_INSERT_BEFORE_TOKENS);
***REMOVED***;

CstyleBehaviour.$matchTokenType = function(token, types) ***REMOVED***
    return types.indexOf(token.type || token) > -1;
***REMOVED***;

CstyleBehaviour.recordAutoInsert = function(editor, session, bracket) ***REMOVED***
    var cursor = editor.getCursorPosition();
    var line = session.doc.getLine(cursor.row);
    if (!this.isAutoInsertedClosing(cursor, line, context.autoInsertedLineEnd[0]))
        context.autoInsertedBrackets = 0;
    context.autoInsertedRow = cursor.row;
    context.autoInsertedLineEnd = bracket + line.substr(cursor.column);
    context.autoInsertedBrackets++;
***REMOVED***;

CstyleBehaviour.recordMaybeInsert = function(editor, session, bracket) ***REMOVED***
    var cursor = editor.getCursorPosition();
    var line = session.doc.getLine(cursor.row);
    if (!this.isMaybeInsertedClosing(cursor, line))
        context.maybeInsertedBrackets = 0;
    context.maybeInsertedRow = cursor.row;
    context.maybeInsertedLineStart = line.substr(0, cursor.column) + bracket;
    context.maybeInsertedLineEnd = line.substr(cursor.column);
    context.maybeInsertedBrackets++;
***REMOVED***;

CstyleBehaviour.isAutoInsertedClosing = function(cursor, line, bracket) ***REMOVED***
    return context.autoInsertedBrackets > 0 &&
        cursor.row === context.autoInsertedRow &&
        bracket === context.autoInsertedLineEnd[0] &&
        line.substr(cursor.column) === context.autoInsertedLineEnd;
***REMOVED***;

CstyleBehaviour.isMaybeInsertedClosing = function(cursor, line) ***REMOVED***
    return context.maybeInsertedBrackets > 0 &&
        cursor.row === context.maybeInsertedRow &&
        line.substr(cursor.column) === context.maybeInsertedLineEnd &&
        line.substr(0, cursor.column) == context.maybeInsertedLineStart;
***REMOVED***;

CstyleBehaviour.popAutoInsertedClosing = function() ***REMOVED***
    context.autoInsertedLineEnd = context.autoInsertedLineEnd.substr(1);
    context.autoInsertedBrackets--;
***REMOVED***;

CstyleBehaviour.clearMaybeInsertedClosing = function() ***REMOVED***
    if (context) ***REMOVED***
        context.maybeInsertedBrackets = 0;
        context.maybeInsertedRow = -1;
***REMOVED***
***REMOVED***;



oop.inherits(CstyleBehaviour, Behaviour);

exports.CstyleBehaviour = CstyleBehaviour;
***REMOVED***);

__ace_shadowed__.define('ace/mode/behaviour/xml', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/mode/behaviour', 'ace/token_iterator'], function(require, exports, module) ***REMOVED***


var oop = require("../../lib/oop");
var Behaviour = require("../behaviour").Behaviour;
var TokenIterator = require("../../token_iterator").TokenIterator;

function is(token, type) ***REMOVED***
    return token.type.lastIndexOf(type + ".xml") > -1;
***REMOVED***

var XmlBehaviour = function () ***REMOVED***

    this.add("string_dquotes", "insertion", function (state, action, editor, session, text) ***REMOVED***
        if (text == '"' || text == "'") ***REMOVED***
            var quote = text;
            var selected = session.doc.getTextRange(editor.getSelectionRange());
            if (selected !== "" && selected !== "'" && selected != '"' && editor.getWrapBehavioursEnabled()) ***REMOVED***
                return ***REMOVED***
                    text: quote + selected + quote,
                    selection: false
            ***REMOVED***;
        ***REMOVED***

            var cursor = editor.getCursorPosition();
            var line = session.doc.getLine(cursor.row);
            var rightChar = line.substring(cursor.column, cursor.column + 1);
            var iterator = new TokenIterator(session, cursor.row, cursor.column);
            var token = iterator.getCurrentToken();

            if (rightChar == quote && (is(token, "attribute-value") || is(token, "string"))) ***REMOVED***
                return ***REMOVED***
                    text: "",
                    selection: [1, 1]
            ***REMOVED***;
        ***REMOVED***

            if (!token)
                token = iterator.stepBackward();

            if (!token)
                return;

            while (is(token, "tag-whitespace") || is(token, "whitespace")) ***REMOVED***
                token = iterator.stepBackward();
        ***REMOVED***
            var rightSpace = !rightChar || rightChar.match(/\s/);
            if (is(token, "attribute-equals") && (rightSpace || rightChar == '>') || (is(token, "decl-attribute-equals") && (rightSpace || rightChar == '?'))) ***REMOVED***
                return ***REMOVED***
                    text: quote + quote,
                    selection: [1, 1]
            ***REMOVED***;
        ***REMOVED***
    ***REMOVED***
***REMOVED***);

    this.add("string_dquotes", "deletion", function(state, action, editor, session, range) ***REMOVED***
        var selected = session.doc.getTextRange(range);
        if (!range.isMultiLine() && (selected == '"' || selected == "'")) ***REMOVED***
            var line = session.doc.getLine(range.start.row);
            var rightChar = line.substring(range.start.column + 1, range.start.column + 2);
            if (rightChar == selected) ***REMOVED***
                range.end.column++;
                return range;
        ***REMOVED***
    ***REMOVED***
***REMOVED***);

    this.add("autoclosing", "insertion", function (state, action, editor, session, text) ***REMOVED***
        if (text == '>') ***REMOVED***
            var position = editor.getCursorPosition();
            var iterator = new TokenIterator(session, position.row, position.column);
            var token = iterator.getCurrentToken() || iterator.stepBackward();
            if (!token || !(is(token, "tag-name") || is(token, "tag-whitespace") || is(token, "attribute-name") || is(token, "attribute-equals") || is(token, "attribute-value")))
                return;
            if (is(token, "reference.attribute-value"))
                return;
            if (is(token, "attribute-value")) ***REMOVED***
                var firstChar = token.value.charAt(0);
                if (firstChar == '"' || firstChar == "'") ***REMOVED***
                    var lastChar = token.value.charAt(token.value.length - 1);
                    var tokenEnd = iterator.getCurrentTokenColumn() + token.value.length;
                    if (tokenEnd > position.column || tokenEnd == position.column && firstChar != lastChar)
                        return;
            ***REMOVED***
        ***REMOVED***
            while (!is(token, "tag-name")) ***REMOVED***
                token = iterator.stepBackward();
        ***REMOVED***

            var tokenRow = iterator.getCurrentTokenRow();
            var tokenColumn = iterator.getCurrentTokenColumn();
            if (is(iterator.stepBackward(), "end-tag-open"))
                return;

            var element = token.value;
            if (tokenRow == position.row)
                element = element.substring(0, position.column - tokenColumn);

            if (this.voidElements.hasOwnProperty(element.toLowerCase()))
                 return;

            return ***REMOVED***
               text: '>' + '</' + element + '>',
               selection: [1, 1]
        ***REMOVED***;
    ***REMOVED***
***REMOVED***);

    this.add('autoindent', 'insertion', function (state, action, editor, session, text) ***REMOVED***
        if (text == "\n") ***REMOVED***
            var cursor = editor.getCursorPosition();
            var line = session.getLine(cursor.row);
            var rightChars = line.substring(cursor.column, cursor.column + 2);
            if (rightChars == '</') ***REMOVED***
                var next_indent = this.$getIndent(line);
                var indent = next_indent + session.getTabString();

                return ***REMOVED***
                    text: '\n' + indent + '\n' + next_indent,
                    selection: [1, indent.length, 1, indent.length]
            ***REMOVED***;
        ***REMOVED***
    ***REMOVED***
***REMOVED***);
    
***REMOVED***;

oop.inherits(XmlBehaviour, Behaviour);

exports.XmlBehaviour = XmlBehaviour;
***REMOVED***);

__ace_shadowed__.define('ace/mode/folding/cstyle', ['require', 'exports', 'module' , 'ace/lib/oop', 'ace/range', 'ace/mode/folding/fold_mode'], function(require, exports, module) ***REMOVED***


var oop = require("../../lib/oop");
var Range = require("../../range").Range;
var BaseFoldMode = require("./fold_mode").FoldMode;

var FoldMode = exports.FoldMode = function(commentRegex) ***REMOVED***
    if (commentRegex) ***REMOVED***
        this.foldingStartMarker = new RegExp(
            this.foldingStartMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.start)
        );
        this.foldingStopMarker = new RegExp(
            this.foldingStopMarker.source.replace(/\|[^|]*?$/, "|" + commentRegex.end)
        );
***REMOVED***
***REMOVED***;
oop.inherits(FoldMode, BaseFoldMode);

(function() ***REMOVED***

    this.foldingStartMarker = /(\***REMOVED***|\[)[^\***REMOVED***\]]*$|^\s*(\/\*)/;
    this.foldingStopMarker = /^[^\[\***REMOVED***]*(\***REMOVED***|\])|^[\s\*]*(\*\/)/;

    this.getFoldWidgetRange = function(session, foldStyle, row, forceMultiline) ***REMOVED***
        var line = session.getLine(row);
        var match = line.match(this.foldingStartMarker);
        if (match) ***REMOVED***
            var i = match.index;

            if (match[1])
                return this.openingBracketBlock(session, match[1], row, i);
                
            var range = session.getCommentFoldRange(row, i + match[0].length, 1);
            
            if (range && !range.isMultiLine()) ***REMOVED***
                if (forceMultiline) ***REMOVED***
                    range = this.getSectionRange(session, row);
            ***REMOVED*** else if (foldStyle != "all")
                    range = null;
        ***REMOVED***
            
            return range;
    ***REMOVED***

        if (foldStyle === "markbegin")
            return;

        var match = line.match(this.foldingStopMarker);
        if (match) ***REMOVED***
            var i = match.index + match[0].length;

            if (match[1])
                return this.closingBracketBlock(session, match[1], row, i);

            return session.getCommentFoldRange(row, i, -1);
    ***REMOVED***
***REMOVED***;
    
    this.getSectionRange = function(session, row) ***REMOVED***
        var line = session.getLine(row);
        var startIndent = line.search(/\S/);
        var startRow = row;
        var startColumn = line.length;
        row = row + 1;
        var endRow = row;
        var maxRow = session.getLength();
        while (++row < maxRow) ***REMOVED***
            line = session.getLine(row);
            var indent = line.search(/\S/);
            if (indent === -1)
                continue;
            if  (startIndent > indent)
                break;
            var subRange = this.getFoldWidgetRange(session, "all", row);
            
            if (subRange) ***REMOVED***
                if (subRange.start.row <= startRow) ***REMOVED***
                    break;
            ***REMOVED*** else if (subRange.isMultiLine()) ***REMOVED***
                    row = subRange.end.row;
            ***REMOVED*** else if (startIndent == indent) ***REMOVED***
                    break;
            ***REMOVED***
        ***REMOVED***
            endRow = row;
    ***REMOVED***
        
        return new Range(startRow, startColumn, endRow, session.getLine(endRow).length);
***REMOVED***;

***REMOVED***).call(FoldMode.prototype);

***REMOVED***);

__ace_shadowed__.define('ace/ext/language_tools', ['require', 'exports', 'module' , 'ace/snippets', 'ace/autocomplete', 'ace/config', 'ace/autocomplete/util', 'ace/autocomplete/text_completer', 'ace/editor'], function(require, exports, module) ***REMOVED***


var snippetManager = require("../snippets").snippetManager;
var Autocomplete = require("../autocomplete").Autocomplete;
var config = require("../config");
var util = require("../autocomplete/util");

var textCompleter = require("../autocomplete/text_completer");
var keyWordCompleter = ***REMOVED***
    getCompletions: function(editor, session, pos, prefix, callback) ***REMOVED***
        var state = editor.session.getState(pos.row);
        var completions = session.$mode.getCompletions(state, session, pos, prefix);
        callback(null, completions);
***REMOVED***
***REMOVED***;

var snippetCompleter = ***REMOVED***
    getCompletions: function(editor, session, pos, prefix, callback) ***REMOVED***
        var snippetMap = snippetManager.snippetMap;
        var completions = [];
        snippetManager.getActiveScopes(editor).forEach(function(scope) ***REMOVED***
            var snippets = snippetMap[scope] || [];
            for (var i = snippets.length; i--;) ***REMOVED***
                var s = snippets[i];
                var caption = s.name || s.tabTrigger;
                if (!caption)
                    continue;
                completions.push(***REMOVED***
                    caption: caption,
                    snippet: s.content,
                    meta: s.tabTrigger && !s.name ? s.tabTrigger + "\u21E5 " : "snippet"
            ***REMOVED***);
        ***REMOVED***
    ***REMOVED*** this);
        callback(null, completions);
***REMOVED***
***REMOVED***;

var completers = [snippetCompleter, textCompleter, keyWordCompleter];
exports.addCompleter = function(completer) ***REMOVED***
    completers.push(completer);
***REMOVED***;

var expandSnippet = ***REMOVED***
    name: "expandSnippet",
    exec: function(editor) ***REMOVED***
        var success = snippetManager.expandWithTab(editor);
        if (!success)
            editor.execCommand("indent");
***REMOVED***
    bindKey: "Tab"
***REMOVED***;

var onChangeMode = function(e, editor) ***REMOVED***
    loadSnippetsForMode(editor.session.$mode);
***REMOVED***;

var loadSnippetsForMode = function(mode) ***REMOVED***
    var id = mode.$id;
    if (!snippetManager.files)
        snippetManager.files = ***REMOVED******REMOVED***;
    loadSnippetFile(id);
    if (mode.modes)
        mode.modes.forEach(loadSnippetsForMode);
***REMOVED***;

var loadSnippetFile = function(id) ***REMOVED***
    if (!id || snippetManager.files[id])
        return;
    var snippetFilePath = id.replace("mode", "snippets");
    snippetManager.files[id] = ***REMOVED******REMOVED***;
    config.loadModule(snippetFilePath, function(m) ***REMOVED***
        if (m) ***REMOVED***
            snippetManager.files[id] = m;
            m.snippets = snippetManager.parseSnippetFile(m.snippetText);
            snippetManager.register(m.snippets, m.scope);
            if (m.includeScopes) ***REMOVED***
                snippetManager.snippetMap[m.scope].includeScopes = m.includeScopes;
                m.includeScopes.forEach(function(x) ***REMOVED***
                    loadSnippetFile("ace/mode/" + x);
            ***REMOVED***);
        ***REMOVED***
    ***REMOVED***
***REMOVED***);
***REMOVED***;

var doLiveAutocomplete = function(e) ***REMOVED***
    var editor = e.editor;
    var text = e.args || "";
    var pos = editor.getCursorPosition();
    var line = editor.session.getLine(pos.row);
    var hasCompleter = editor.completer && editor.completer.activated;
    var prefix = util.retrievePrecedingIdentifier(line, pos.column);
    completers.forEach(function(completer) ***REMOVED***
        if (completer.identifierRegexps) ***REMOVED***
            completer.identifierRegexps.forEach(function(identifierRegex)***REMOVED***
                if (!prefix) ***REMOVED***
                    prefix = util.retrievePrecedingIdentifier(line, pos.column, identifierRegex);
            ***REMOVED***
        ***REMOVED***);
    ***REMOVED***
***REMOVED***);
    if (e.command.name === "backspace" && !prefix) ***REMOVED***
        if (hasCompleter) 
            editor.completer.detach();
***REMOVED***
    else if (e.command.name === "insertstring") ***REMOVED***
        if (prefix && !hasCompleter) ***REMOVED***
            if (!editor.completer) ***REMOVED***
                editor.completer = new Autocomplete();
                editor.completer.autoSelect = false;
                editor.completer.autoInsert = false;
        ***REMOVED***
            editor.completer.showPopup(editor);
    ***REMOVED*** else if (!prefix && hasCompleter) ***REMOVED***
            editor.completer.detach();
    ***REMOVED***
***REMOVED***
***REMOVED***;

var Editor = require("../editor").Editor;
require("../config").defineOptions(Editor.prototype, "editor", ***REMOVED***
    enableBasicAutocompletion: ***REMOVED***
        set: function(val) ***REMOVED***
            if (val) ***REMOVED***
                this.completers = completers;
                this.commands.addCommand(Autocomplete.startCommand);
        ***REMOVED*** else ***REMOVED***
                this.commands.removeCommand(Autocomplete.startCommand);
        ***REMOVED***
    ***REMOVED***
        value: false
***REMOVED***
    enableLiveAutocomplete: ***REMOVED***
        set: function(val) ***REMOVED***
            if (val) ***REMOVED***
                this.commands.on('afterExec', doLiveAutocomplete);
        ***REMOVED*** else ***REMOVED***
                this.commands.removeListener('afterExec', doLiveAutocomplete);
        ***REMOVED***
    ***REMOVED***
        value: false
***REMOVED***
    enableSnippets: ***REMOVED***
        set: function(val) ***REMOVED***
            if (val) ***REMOVED***
                this.commands.addCommand(expandSnippet);
                this.on("changeMode", onChangeMode);
                onChangeMode(null, this);
        ***REMOVED*** else ***REMOVED***
                this.commands.removeCommand(expandSnippet);
                this.off("changeMode", onChangeMode);
        ***REMOVED***
    ***REMOVED***
        value: false
***REMOVED***
***REMOVED***);

***REMOVED***);

__ace_shadowed__.define('ace/snippets', ['require', 'exports', 'module' , 'ace/lib/lang', 'ace/range', 'ace/keyboard/hash_handler', 'ace/tokenizer', 'ace/lib/dom'], function(require, exports, module) ***REMOVED***

var lang = require("./lib/lang")
var Range = require("./range").Range
var HashHandler = require("./keyboard/hash_handler").HashHandler;
var Tokenizer = require("./tokenizer").Tokenizer;
var comparePoints = Range.comparePoints;

var SnippetManager = function() ***REMOVED***
    this.snippetMap = ***REMOVED******REMOVED***;
    this.snippetNameMap = ***REMOVED******REMOVED***;
***REMOVED***;

(function() ***REMOVED***
    this.getTokenizer = function() ***REMOVED***
        function TabstopToken(str, _, stack) ***REMOVED***
            str = str.substr(1);
            if (/^\d+$/.test(str) && !stack.inFormatString)
                return [***REMOVED***tabstopId: parseInt(str, 10)***REMOVED***];
            return [***REMOVED***text: str***REMOVED***]
    ***REMOVED***
        function escape(ch) ***REMOVED***
            return "(?:[^\\\\" + ch + "]|\\\\.)";
    ***REMOVED***
        SnippetManager.$tokenizer = new Tokenizer(***REMOVED***
            start: [
                ***REMOVED***regex: /:/, onMatch: function(val, state, stack) ***REMOVED***
                    if (stack.length && stack[0].expectIf) ***REMOVED***
                        stack[0].expectIf = false;
                        stack[0].elseBranch = stack[0];
                        return [stack[0]];
                ***REMOVED***
                    return ":";
            ***REMOVED******REMOVED***,
                ***REMOVED***regex: /\\./, onMatch: function(val, state, stack) ***REMOVED***
                    var ch = val[1];
                    if (ch == "***REMOVED***" && stack.length) ***REMOVED***
                        val = ch;
                ***REMOVED***else if ("`$\\".indexOf(ch) != -1) ***REMOVED***
                        val = ch;
                ***REMOVED*** else if (stack.inFormatString) ***REMOVED***
                        if (ch == "n")
                            val = "\n";
                        else if (ch == "t")
                            val = "\n";
                        else if ("ulULE".indexOf(ch) != -1) ***REMOVED***
                            val = ***REMOVED***changeCase: ch, local: ch > "a"***REMOVED***;
                    ***REMOVED***
                ***REMOVED***

                    return [val];
            ***REMOVED******REMOVED***,
                ***REMOVED***regex: /***REMOVED***/, onMatch: function(val, state, stack) ***REMOVED***
                    return [stack.length ? stack.shift() : val];
            ***REMOVED******REMOVED***,
                ***REMOVED***regex: /\$(?:\d+|\w+)/, onMatch: TabstopToken***REMOVED***,
                ***REMOVED***regex: /\$\***REMOVED***[\dA-Z_a-z]+/, onMatch: function(str, state, stack) ***REMOVED***
                    var t = TabstopToken(str.substr(1), state, stack);
                    stack.unshift(t[0]);
                    return t;
            ***REMOVED*** next: "snippetVar"***REMOVED***,
                ***REMOVED***regex: /\n/, token: "newline", merge: false***REMOVED***
            ],
            snippetVar: [
                ***REMOVED***regex: "\\|" + escape("\\|") + "*\\|", onMatch: function(val, state, stack) ***REMOVED***
                    stack[0].choices = val.slice(1, -1).split(",");
            ***REMOVED*** next: "start"***REMOVED***,
                ***REMOVED***regex: "/(" + escape("/") + "+)/(?:(" + escape("/") + "*)/)(\\w*):?",
                 onMatch: function(val, state, stack) ***REMOVED***
                    var ts = stack[0];
                    ts.fmtString = val;

                    val = this.splitRegex.exec(val);
                    ts.guard = val[1];
                    ts.fmt = val[2];
                    ts.flag = val[3];
                    return "";
            ***REMOVED*** next: "start"***REMOVED***,
                ***REMOVED***regex: "`" + escape("`") + "*`", onMatch: function(val, state, stack) ***REMOVED***
                    stack[0].code = val.splice(1, -1);
                    return "";
            ***REMOVED*** next: "start"***REMOVED***,
                ***REMOVED***regex: "\\?", onMatch: function(val, state, stack) ***REMOVED***
                    if (stack[0])
                        stack[0].expectIf = true;
            ***REMOVED*** next: "start"***REMOVED***,
                ***REMOVED***regex: "([^:***REMOVED***\\\\]|\\\\.)*:?", token: "", next: "start"***REMOVED***
            ],
            formatString: [
                ***REMOVED***regex: "/(" + escape("/") + "+)/", token: "regex"***REMOVED***,
                ***REMOVED***regex: "", onMatch: function(val, state, stack) ***REMOVED***
                    stack.inFormatString = true;
            ***REMOVED*** next: "start"***REMOVED***
            ]
    ***REMOVED***);
        SnippetManager.prototype.getTokenizer = function() ***REMOVED***
            return SnippetManager.$tokenizer;
    ***REMOVED***
        return SnippetManager.$tokenizer;
***REMOVED***;

    this.tokenizeTmSnippet = function(str, startState) ***REMOVED***
        return this.getTokenizer().getLineTokens(str, startState).tokens.map(function(x) ***REMOVED***
            return x.value || x;
    ***REMOVED***);
***REMOVED***;

    this.$getDefaultValue = function(editor, name) ***REMOVED***
        if (/^[A-Z]\d+$/.test(name)) ***REMOVED***
            var i = name.substr(1);
            return (this.variables[name[0] + "__"] || ***REMOVED******REMOVED***)[i];
    ***REMOVED***
        if (/^\d+$/.test(name)) ***REMOVED***
            return (this.variables.__ || ***REMOVED******REMOVED***)[name];
    ***REMOVED***
        name = name.replace(/^TM_/, "");

        if (!editor)
            return;
        var s = editor.session;
        switch(name) ***REMOVED***
            case "CURRENT_WORD":
                var r = s.getWordRange();
            case "SELECTION":
            case "SELECTED_TEXT":
                return s.getTextRange(r);
            case "CURRENT_LINE":
                return s.getLine(editor.getCursorPosition().row);
            case "PREV_LINE": // not possible in textmate
                return s.getLine(editor.getCursorPosition().row - 1);
            case "LINE_INDEX":
                return editor.getCursorPosition().column;
            case "LINE_NUMBER":
                return editor.getCursorPosition().row + 1;
            case "SOFT_TABS":
                return s.getUseSoftTabs() ? "YES" : "NO";
            case "TAB_SIZE":
                return s.getTabSize();
            case "FILENAME":
            case "FILEPATH":
                return "";
            case "FULLNAME":
                return "Ace";
    ***REMOVED***
***REMOVED***;
    this.variables = ***REMOVED******REMOVED***;
    this.getVariableValue = function(editor, varName) ***REMOVED***
        if (this.variables.hasOwnProperty(varName))
            return this.variables[varName](editor, varName) || "";
        return this.$getDefaultValue(editor, varName) || "";
***REMOVED***;
    this.tmStrFormat = function(str, ch, editor) ***REMOVED***
        var flag = ch.flag || "";
        var re = ch.guard;
        re = new RegExp(re, flag.replace(/[^gi]/, ""));
        var fmtTokens = this.tokenizeTmSnippet(ch.fmt, "formatString");
        var _self = this;
        var formatted = str.replace(re, function() ***REMOVED***
            _self.variables.__ = arguments;
            var fmtParts = _self.resolveVariables(fmtTokens, editor);
            var gChangeCase = "E";
            for (var i  = 0; i < fmtParts.length; i++) ***REMOVED***
                var ch = fmtParts[i];
                if (typeof ch == "object") ***REMOVED***
                    fmtParts[i] = "";
                    if (ch.changeCase && ch.local) ***REMOVED***
                        var next = fmtParts[i + 1];
                        if (next && typeof next == "string") ***REMOVED***
                            if (ch.changeCase == "u")
                                fmtParts[i] = next[0].toUpperCase();
                            else
                                fmtParts[i] = next[0].toLowerCase();
                            fmtParts[i + 1] = next.substr(1);
                    ***REMOVED***
                ***REMOVED*** else if (ch.changeCase) ***REMOVED***
                        gChangeCase = ch.changeCase;
                ***REMOVED***
            ***REMOVED*** else if (gChangeCase == "U") ***REMOVED***
                    fmtParts[i] = ch.toUpperCase();
            ***REMOVED*** else if (gChangeCase == "L") ***REMOVED***
                    fmtParts[i] = ch.toLowerCase();
            ***REMOVED***
        ***REMOVED***
            return fmtParts.join("");
    ***REMOVED***);
        this.variables.__ = null;
        return formatted;
***REMOVED***;

    this.resolveVariables = function(snippet, editor) ***REMOVED***
        var result = [];
        for (var i = 0; i < snippet.length; i++) ***REMOVED***
            var ch = snippet[i];
            if (typeof ch == "string") ***REMOVED***
                result.push(ch);
        ***REMOVED*** else if (typeof ch != "object") ***REMOVED***
                continue;
        ***REMOVED*** else if (ch.skip) ***REMOVED***
                gotoNext(ch);
        ***REMOVED*** else if (ch.processed < i) ***REMOVED***
                continue;
        ***REMOVED*** else if (ch.text) ***REMOVED***
                var value = this.getVariableValue(editor, ch.text);
                if (value && ch.fmtString)
                    value = this.tmStrFormat(value, ch);
                ch.processed = i;
                if (ch.expectIf == null) ***REMOVED***
                    if (value) ***REMOVED***
                        result.push(value);
                        gotoNext(ch);
                ***REMOVED***
            ***REMOVED*** else ***REMOVED***
                    if (value) ***REMOVED***
                        ch.skip = ch.elseBranch;
                ***REMOVED*** else
                        gotoNext(ch);
            ***REMOVED***
        ***REMOVED*** else if (ch.tabstopId != null) ***REMOVED***
                result.push(ch);
        ***REMOVED*** else if (ch.changeCase != null) ***REMOVED***
                result.push(ch);
        ***REMOVED***
    ***REMOVED***
        function gotoNext(ch) ***REMOVED***
            var i1 = snippet.indexOf(ch, i + 1);
            if (i1 != -1)
                i = i1;
    ***REMOVED***
        return result;
***REMOVED***;

    this.insertSnippet = function(editor, snippetText) ***REMOVED***
        var cursor = editor.getCursorPosition();
        var line = editor.session.getLine(cursor.row);
        var tabString = editor.session.getTabString();
        var indentString = line.match(/^\s*/)[0];
        
        if (cursor.column < indentString.length)
            indentString = indentString.slice(0, cursor.column);

        var tokens = this.tokenizeTmSnippet(snippetText);
        tokens = this.resolveVariables(tokens, editor);
        tokens = tokens.map(function(x) ***REMOVED***
            if (x == "\n")
                return x + indentString;
            if (typeof x == "string")
                return x.replace(/\t/g, tabString);
            return x;
    ***REMOVED***);
        var tabstops = [];
        tokens.forEach(function(p, i) ***REMOVED***
            if (typeof p != "object")
                return;
            var id = p.tabstopId;
            var ts = tabstops[id];
            if (!ts) ***REMOVED***
                ts = tabstops[id] = [];
                ts.index = id;
                ts.value = "";
        ***REMOVED***
            if (ts.indexOf(p) !== -1)
                return;
            ts.push(p);
            var i1 = tokens.indexOf(p, i + 1);
            if (i1 === -1)
                return;

            var value = tokens.slice(i + 1, i1);
            var isNested = value.some(function(t) ***REMOVED***return typeof t === "object"***REMOVED***);          
            if (isNested && !ts.value) ***REMOVED***
                ts.value = value;
        ***REMOVED*** else if (value.length && (!ts.value || typeof ts.value !== "string")) ***REMOVED***
                ts.value = value.join("");
        ***REMOVED***
    ***REMOVED***);
        tabstops.forEach(function(ts) ***REMOVED***ts.length = 0***REMOVED***);
        var expanding = ***REMOVED******REMOVED***;
        function copyValue(val) ***REMOVED***
            var copy = []
            for (var i = 0; i < val.length; i++) ***REMOVED***
                var p = val[i];
                if (typeof p == "object") ***REMOVED***
                    if (expanding[p.tabstopId])
                        continue;
                    var j = val.lastIndexOf(p, i - 1);
                    p = copy[j] || ***REMOVED***tabstopId: p.tabstopId***REMOVED***;
            ***REMOVED***
                copy[i] = p;
        ***REMOVED***
            return copy;
    ***REMOVED***
        for (var i = 0; i < tokens.length; i++) ***REMOVED***
            var p = tokens[i];
            if (typeof p != "object")
                continue;
            var id = p.tabstopId;
            var i1 = tokens.indexOf(p, i + 1);
            if (expanding[id]) ***REMOVED***
                if (expanding[id] === p)
                    expanding[id] = null;
                continue;
        ***REMOVED***
            
            var ts = tabstops[id];
            var arg = typeof ts.value == "string" ? [ts.value] : copyValue(ts.value);
            arg.unshift(i + 1, Math.max(0, i1 - i));
            arg.push(p);
            expanding[id] = p;
            tokens.splice.apply(tokens, arg);

            if (ts.indexOf(p) === -1)
                ts.push(p);
    ***REMOVED***;
        var row = 0, column = 0;
        var text = "";
        tokens.forEach(function(t) ***REMOVED***
            if (typeof t === "string") ***REMOVED***
                if (t[0] === "\n")***REMOVED***
                    column = t.length - 1;
                    row ++;
            ***REMOVED*** else
                    column += t.length;
                text += t;
        ***REMOVED*** else ***REMOVED***
                if (!t.start)
                    t.start = ***REMOVED***row: row, column: column***REMOVED***;
                else
                    t.end = ***REMOVED***row: row, column: column***REMOVED***;
        ***REMOVED***
    ***REMOVED***);
        var range = editor.getSelectionRange();
        var end = editor.session.replace(range, text);

        var tabstopManager = new TabstopManager(editor);
        tabstopManager.addTabstops(tabstops, range.start, end);
        tabstopManager.tabNext();
***REMOVED***;

    this.$getScope = function(editor) ***REMOVED***
        var scope = editor.session.$mode.$id || "";
        scope = scope.split("/").pop();
        if (scope === "html" || scope === "php") ***REMOVED***
            if (scope === "php" && !editor.session.$mode.inlinePhp) 
                scope = "html";
            var c = editor.getCursorPosition()
            var state = editor.session.getState(c.row);
            if (typeof state === "object") ***REMOVED***
                state = state[0];
        ***REMOVED***
            if (state.substring) ***REMOVED***
                if (state.substring(0, 3) == "js-")
                    scope = "javascript";
                else if (state.substring(0, 4) == "css-")
                    scope = "css";
                else if (state.substring(0, 4) == "php-")
                    scope = "php";
        ***REMOVED***
    ***REMOVED***
        
        return scope;
***REMOVED***;

    this.getActiveScopes = function(editor) ***REMOVED***
        var scope = this.$getScope(editor);
        var scopes = [scope];
        var snippetMap = this.snippetMap;
        if (snippetMap[scope] && snippetMap[scope].includeScopes) ***REMOVED***
            scopes.push.apply(scopes, snippetMap[scope].includeScopes);
    ***REMOVED***
        scopes.push("_");
        return scopes;
***REMOVED***;

    this.expandWithTab = function(editor) ***REMOVED***
        var cursor = editor.getCursorPosition();
        var line = editor.session.getLine(cursor.row);
        var before = line.substring(0, cursor.column);
        var after = line.substr(cursor.column);

        var snippetMap = this.snippetMap;
        var snippet;
        this.getActiveScopes(editor).some(function(scope) ***REMOVED***
            var snippets = snippetMap[scope];
            if (snippets)
                snippet = this.findMatchingSnippet(snippets, before, after);
            return !!snippet;
    ***REMOVED*** this);
        if (!snippet)
            return false;

        editor.session.doc.removeInLine(cursor.row,
            cursor.column - snippet.replaceBefore.length,
            cursor.column + snippet.replaceAfter.length
        );

        this.variables.M__ = snippet.matchBefore;
        this.variables.T__ = snippet.matchAfter;
        this.insertSnippet(editor, snippet.content);

        this.variables.M__ = this.variables.T__ = null;
        return true;
***REMOVED***;

    this.findMatchingSnippet = function(snippetList, before, after) ***REMOVED***
        for (var i = snippetList.length; i--;) ***REMOVED***
            var s = snippetList[i];
            if (s.startRe && !s.startRe.test(before))
                continue;
            if (s.endRe && !s.endRe.test(after))
                continue;
            if (!s.startRe && !s.endRe)
                continue;

            s.matchBefore = s.startRe ? s.startRe.exec(before) : [""];
            s.matchAfter = s.endRe ? s.endRe.exec(after) : [""];
            s.replaceBefore = s.triggerRe ? s.triggerRe.exec(before)[0] : "";
            s.replaceAfter = s.endTriggerRe ? s.endTriggerRe.exec(after)[0] : "";
            return s;
    ***REMOVED***
***REMOVED***;

    this.snippetMap = ***REMOVED******REMOVED***;
    this.snippetNameMap = ***REMOVED******REMOVED***;
    this.register = function(snippets, scope) ***REMOVED***
        var snippetMap = this.snippetMap;
        var snippetNameMap = this.snippetNameMap;
        var self = this;
        function wrapRegexp(src) ***REMOVED***
            if (src && !/^\^?\(.*\)\$?$|^\\b$/.test(src))
                src = "(?:" + src + ")"

            return src || "";
    ***REMOVED***
        function guardedRegexp(re, guard, opening) ***REMOVED***
            re = wrapRegexp(re);
            guard = wrapRegexp(guard);
            if (opening) ***REMOVED***
                re = guard + re;
                if (re && re[re.length - 1] != "$")
                    re = re + "$";
        ***REMOVED*** else ***REMOVED***
                re = re + guard;
                if (re && re[0] != "^")
                    re = "^" + re;
        ***REMOVED***
            return new RegExp(re);
    ***REMOVED***

        function addSnippet(s) ***REMOVED***
            if (!s.scope)
                s.scope = scope || "_";
            scope = s.scope
            if (!snippetMap[scope]) ***REMOVED***
                snippetMap[scope] = [];
                snippetNameMap[scope] = ***REMOVED******REMOVED***;
        ***REMOVED***

            var map = snippetNameMap[scope];
            if (s.name) ***REMOVED***
                var old = map[s.name];
                if (old)
                    self.unregister(old);
                map[s.name] = s;
        ***REMOVED***
            snippetMap[scope].push(s);

            if (s.tabTrigger && !s.trigger) ***REMOVED***
                if (!s.guard && /^\w/.test(s.tabTrigger))
                    s.guard = "\\b";
                s.trigger = lang.escapeRegExp(s.tabTrigger);
        ***REMOVED***

            s.startRe = guardedRegexp(s.trigger, s.guard, true);
            s.triggerRe = new RegExp(s.trigger, "", true);

            s.endRe = guardedRegexp(s.endTrigger, s.endGuard, true);
            s.endTriggerRe = new RegExp(s.endTrigger, "", true);
    ***REMOVED***;

        if (snippets.content)
            addSnippet(snippets);
        else if (Array.isArray(snippets))
            snippets.forEach(addSnippet);
***REMOVED***;
    this.unregister = function(snippets, scope) ***REMOVED***
        var snippetMap = this.snippetMap;
        var snippetNameMap = this.snippetNameMap;

        function removeSnippet(s) ***REMOVED***
            var nameMap = snippetNameMap[s.scope||scope];
            if (nameMap && nameMap[s.name]) ***REMOVED***
                delete nameMap[s.name];
                var map = snippetMap[s.scope||scope];
                var i = map && map.indexOf(s);
                if (i >= 0)
                    map.splice(i, 1);
        ***REMOVED***
    ***REMOVED***
        if (snippets.content)
            removeSnippet(snippets);
        else if (Array.isArray(snippets))
            snippets.forEach(removeSnippet);
***REMOVED***;
    this.parseSnippetFile = function(str) ***REMOVED***
        str = str.replace(/\r/g, "");
        var list = [], snippet = ***REMOVED******REMOVED***;
        var re = /^#.*|^(***REMOVED***[\s\S]****REMOVED***)\s*$|^(\S+) (.*)$|^((?:\n*\t.*)+)/gm;
        var m;
        while (m = re.exec(str)) ***REMOVED***
            if (m[1]) ***REMOVED***
                try ***REMOVED***
                    snippet = JSON.parse(m[1])
                    list.push(snippet);
            ***REMOVED*** catch (e) ***REMOVED******REMOVED***
        ***REMOVED*** if (m[4]) ***REMOVED***
                snippet.content = m[4].replace(/^\t/gm, "");
                list.push(snippet);
                snippet = ***REMOVED******REMOVED***;
        ***REMOVED*** else ***REMOVED***
                var key = m[2], val = m[3];
                if (key == "regex") ***REMOVED***
                    var guardRe = /\/((?:[^\/\\]|\\.)*)|$/g;
                    snippet.guard = guardRe.exec(val)[1];
                    snippet.trigger = guardRe.exec(val)[1];
                    snippet.endTrigger = guardRe.exec(val)[1];
                    snippet.endGuard = guardRe.exec(val)[1];
            ***REMOVED*** else if (key == "snippet") ***REMOVED***
                    snippet.tabTrigger = val.match(/^\S*/)[0];
                    if (!snippet.name)
                        snippet.name = val;
            ***REMOVED*** else ***REMOVED***
                    snippet[key] = val;
            ***REMOVED***
        ***REMOVED***
    ***REMOVED***
        return list;
***REMOVED***;
    this.getSnippetByName = function(name, editor) ***REMOVED***
        var snippetMap = this.snippetNameMap;
        var snippet;
        this.getActiveScopes(editor).some(function(scope) ***REMOVED***
            var snippets = snippetMap[scope];
            if (snippets)
                snippet = snippets[name];
            return !!snippet;
    ***REMOVED*** this);
        return snippet;
***REMOVED***;

***REMOVED***).call(SnippetManager.prototype);


var TabstopManager = function(editor) ***REMOVED***
    if (editor.tabstopManager)
        return editor.tabstopManager;
    editor.tabstopManager = this;
    this.$onChange = this.onChange.bind(this);
    this.$onChangeSelection = lang.delayedCall(this.onChangeSelection.bind(this)).schedule;
    this.$onChangeSession = this.onChangeSession.bind(this);
    this.$onAfterExec = this.onAfterExec.bind(this);
    this.attach(editor);
***REMOVED***;
(function() ***REMOVED***
    this.attach = function(editor) ***REMOVED***
        this.index = -1;
        this.ranges = [];
        this.tabstops = [];
        this.selectedTabstop = null;

        this.editor = editor;
        this.editor.on("change", this.$onChange);
        this.editor.on("changeSelection", this.$onChangeSelection);
        this.editor.on("changeSession", this.$onChangeSession);
        this.editor.commands.on("afterExec", this.$onAfterExec);
        this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
***REMOVED***;
    this.detach = function() ***REMOVED***
        this.tabstops.forEach(this.removeTabstopMarkers, this);
        this.ranges = null;
        this.tabstops = null;
        this.selectedTabstop = null;
        this.editor.removeListener("change", this.$onChange);
        this.editor.removeListener("changeSelection", this.$onChangeSelection);
        this.editor.removeListener("changeSession", this.$onChangeSession);
        this.editor.commands.removeListener("afterExec", this.$onAfterExec);
        this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
        this.editor.tabstopManager = null;
        this.editor = null;
***REMOVED***;

    this.onChange = function(e) ***REMOVED***
        var changeRange = e.data.range;
        var isRemove = e.data.action[0] == "r";
        var start = changeRange.start;
        var end = changeRange.end;
        var startRow = start.row;
        var endRow = end.row;
        var lineDif = endRow - startRow;
        var colDiff = end.column - start.column;

        if (isRemove) ***REMOVED***
            lineDif = -lineDif;
            colDiff = -colDiff;
    ***REMOVED***
        if (!this.$inChange && isRemove) ***REMOVED***
            var ts = this.selectedTabstop;
            var changedOutside = !ts.some(function(r) ***REMOVED***
                return comparePoints(r.start, start) <= 0 && comparePoints(r.end, end) >= 0;
        ***REMOVED***);
            if (changedOutside)
                return this.detach();
    ***REMOVED***
        var ranges = this.ranges;
        for (var i = 0; i < ranges.length; i++) ***REMOVED***
            var r = ranges[i];
            if (r.end.row < start.row)
                continue;

            if (comparePoints(start, r.start) < 0 && comparePoints(end, r.end) > 0) ***REMOVED***
                this.removeRange(r);
                i--;
                continue;
        ***REMOVED***

            if (r.start.row == startRow && r.start.column > start.column)
                r.start.column += colDiff;
            if (r.end.row == startRow && r.end.column >= start.column)
                r.end.column += colDiff;
            if (r.start.row >= startRow)
                r.start.row += lineDif;
            if (r.end.row >= startRow)
                r.end.row += lineDif;

            if (comparePoints(r.start, r.end) > 0)
                this.removeRange(r);
    ***REMOVED***
        if (!ranges.length)
            this.detach();
***REMOVED***;
    this.updateLinkedFields = function() ***REMOVED***
        var ts = this.selectedTabstop;
        if (!ts.hasLinkedRanges)
            return;
        this.$inChange = true;
        var session = this.editor.session;
        var text = session.getTextRange(ts.firstNonLinked);
        for (var i = ts.length; i--;) ***REMOVED***
            var range = ts[i];
            if (!range.linked)
                continue;
            var fmt = exports.snippetManager.tmStrFormat(text, range.original)
            session.replace(range, fmt);
    ***REMOVED***
        this.$inChange = false;
***REMOVED***;
    this.onAfterExec = function(e) ***REMOVED***
        if (e.command && !e.command.readOnly)
            this.updateLinkedFields();
***REMOVED***;
    this.onChangeSelection = function() ***REMOVED***
        if (!this.editor)
            return
        var lead = this.editor.selection.lead;
        var anchor = this.editor.selection.anchor;
        var isEmpty = this.editor.selection.isEmpty();
        for (var i = this.ranges.length; i--;) ***REMOVED***
            if (this.ranges[i].linked)
                continue;
            var containsLead = this.ranges[i].contains(lead.row, lead.column);
            var containsAnchor = isEmpty || this.ranges[i].contains(anchor.row, anchor.column);
            if (containsLead && containsAnchor)
                return;
    ***REMOVED***
        this.detach();
***REMOVED***;
    this.onChangeSession = function() ***REMOVED***
        this.detach();
***REMOVED***;
    this.tabNext = function(dir) ***REMOVED***
        var max = this.tabstops.length - 1;
        var index = this.index + (dir || 1);
        index = Math.min(Math.max(index, 0), max);
        this.selectTabstop(index);
        if (index == max)
            this.detach();
***REMOVED***;
    this.selectTabstop = function(index) ***REMOVED***
        var ts = this.tabstops[this.index];
        if (ts)
            this.addTabstopMarkers(ts);
        this.index = index;
        ts = this.tabstops[this.index];
        if (!ts || !ts.length)
            return;
        
        this.selectedTabstop = ts;
        if (!this.editor.inVirtualSelectionMode) ***REMOVED***        
            var sel = this.editor.multiSelect;
            sel.toSingleRange(ts.firstNonLinked.clone());
            for (var i = ts.length; i--;) ***REMOVED***
                if (ts.hasLinkedRanges && ts[i].linked)
                    continue;
                sel.addRange(ts[i].clone(), true);
        ***REMOVED***
    ***REMOVED*** else ***REMOVED***
            this.editor.selection.setRange(ts.firstNonLinked);
    ***REMOVED***
        
        this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
***REMOVED***;
    this.addTabstops = function(tabstops, start, end) ***REMOVED***
        if (!tabstops[0]) ***REMOVED***
            var p = Range.fromPoints(end, end);
            moveRelative(p.start, start);
            moveRelative(p.end, start);
            tabstops[0] = [p];
            tabstops[0].index = 0;
    ***REMOVED***

        var i = this.index;
        var arg = [i, 0];
        var ranges = this.ranges;
        var editor = this.editor;
        tabstops.forEach(function(ts) ***REMOVED***
            for (var i = ts.length; i--;) ***REMOVED***
                var p = ts[i];
                var range = Range.fromPoints(p.start, p.end || p.start);
                movePoint(range.start, start);
                movePoint(range.end, start);
                range.original = p;
                range.tabstop = ts;
                ranges.push(range);
                ts[i] = range;
                if (p.fmtString) ***REMOVED***
                    range.linked = true;
                    ts.hasLinkedRanges = true;
            ***REMOVED*** else if (!ts.firstNonLinked)
                    ts.firstNonLinked = range;
        ***REMOVED***
            if (!ts.firstNonLinked)
                ts.hasLinkedRanges = false;
            arg.push(ts);
            this.addTabstopMarkers(ts);
    ***REMOVED*** this);
        arg.push(arg.splice(2, 1)[0]);
        this.tabstops.splice.apply(this.tabstops, arg);
***REMOVED***;

    this.addTabstopMarkers = function(ts) ***REMOVED***
        var session = this.editor.session;
        ts.forEach(function(range) ***REMOVED***
            if  (!range.markerId)
                range.markerId = session.addMarker(range, "ace_snippet-marker", "text");
    ***REMOVED***);
***REMOVED***;
    this.removeTabstopMarkers = function(ts) ***REMOVED***
        var session = this.editor.session;
        ts.forEach(function(range) ***REMOVED***
            session.removeMarker(range.markerId);
            range.markerId = null;
    ***REMOVED***);
***REMOVED***;
    this.removeRange = function(range) ***REMOVED***
        var i = range.tabstop.indexOf(range);
        range.tabstop.splice(i, 1);
        i = this.ranges.indexOf(range);
        this.ranges.splice(i, 1);
        this.editor.session.removeMarker(range.markerId);
***REMOVED***;

    this.keyboardHandler = new HashHandler();
    this.keyboardHandler.bindKeys(***REMOVED***
        "Tab": function(ed) ***REMOVED***
            if (exports.snippetManager && exports.snippetManager.expandWithTab(ed)) ***REMOVED***
                return;
        ***REMOVED***

            ed.tabstopManager.tabNext(1);
    ***REMOVED***
        "Shift-Tab": function(ed) ***REMOVED***
            ed.tabstopManager.tabNext(-1);
    ***REMOVED***
        "Esc": function(ed) ***REMOVED***
            ed.tabstopManager.detach();
    ***REMOVED***
        "Return": function(ed) ***REMOVED***
            return false;
    ***REMOVED***
***REMOVED***);
***REMOVED***).call(TabstopManager.prototype);


var movePoint = function(point, diff) ***REMOVED***
    if (point.row == 0)
        point.column += diff.column;
    point.row += diff.row;
***REMOVED***;

var moveRelative = function(point, start) ***REMOVED***
    if (point.row == start.row)
        point.column -= start.column;
    point.row -= start.row;
***REMOVED***;


require("./lib/dom").importCssString("\
.ace_snippet-marker ***REMOVED***\
    -moz-box-sizing: border-box;\
    box-sizing: border-box;\
    background: rgba(194, 193, 208, 0.09);\
    border: 1px dotted rgba(211, 208, 235, 0.62);\
    position: absolute;\
***REMOVED***");

exports.snippetManager = new SnippetManager();


***REMOVED***);

__ace_shadowed__.define('ace/autocomplete', ['require', 'exports', 'module' , 'ace/keyboard/hash_handler', 'ace/autocomplete/popup', 'ace/autocomplete/util', 'ace/lib/event', 'ace/lib/lang', 'ace/snippets'], function(require, exports, module) ***REMOVED***


var HashHandler = require("./keyboard/hash_handler").HashHandler;
var AcePopup = require("./autocomplete/popup").AcePopup;
var util = require("./autocomplete/util");
var event = require("./lib/event");
var lang = require("./lib/lang");
var snippetManager = require("./snippets").snippetManager;

var Autocomplete = function() ***REMOVED***
    this.autoInsert = true;
    this.autoSelect = true;
    this.keyboardHandler = new HashHandler();
    this.keyboardHandler.bindKeys(this.commands);

    this.blurListener = this.blurListener.bind(this);
    this.changeListener = this.changeListener.bind(this);
    this.mousedownListener = this.mousedownListener.bind(this);
    this.mousewheelListener = this.mousewheelListener.bind(this);

    this.changeTimer = lang.delayedCall(function() ***REMOVED***
        this.updateCompletions(true);
***REMOVED***.bind(this))
***REMOVED***;

(function() ***REMOVED***
    this.gatherCompletionsId = 0;

    this.$init = function() ***REMOVED***
        this.popup = new AcePopup(document.body || document.documentElement);
        this.popup.on("click", function(e) ***REMOVED***
            this.insertMatch();
            e.stop();
    ***REMOVED***.bind(this));
        this.popup.focus = this.editor.focus.bind(this.editor);
***REMOVED***;

    this.openPopup = function(editor, prefix, keepPopupPosition) ***REMOVED***
        if (!this.popup)
            this.$init();

        this.popup.setData(this.completions.filtered);

        var renderer = editor.renderer;
        this.popup.setRow(this.autoSelect ? 0 : -1);
        if (!keepPopupPosition) ***REMOVED***
            this.popup.setTheme(editor.getTheme());
            this.popup.setFontSize(editor.getFontSize());

            var lineHeight = renderer.layerConfig.lineHeight;

            var pos = renderer.$cursorLayer.getPixelPosition(this.base, true);
            pos.left -= this.popup.getTextLeftOffset();

            var rect = editor.container.getBoundingClientRect();
            pos.top += rect.top - renderer.layerConfig.offset;
            pos.left += rect.left - editor.renderer.scrollLeft;
            pos.left += renderer.$gutterLayer.gutterWidth;

            this.popup.show(pos, lineHeight);
    ***REMOVED***
***REMOVED***;

    this.detach = function() ***REMOVED***
        this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
        this.editor.off("changeSelection", this.changeListener);
        this.editor.off("blur", this.blurListener);
        this.editor.off("mousedown", this.mousedownListener);
        this.editor.off("mousewheel", this.mousewheelListener);
        this.changeTimer.cancel();

        if (this.popup && this.popup.isOpen) ***REMOVED***
            this.gatherCompletionsId = this.gatherCompletionsId + 1;
    ***REMOVED***

        if (this.popup)
            this.popup.hide();

        this.activated = false;
        this.completions = this.base = null;
***REMOVED***;

    this.changeListener = function(e) ***REMOVED***
        var cursor = this.editor.selection.lead;
        if (cursor.row != this.base.row || cursor.column < this.base.column) ***REMOVED***
            this.detach();
    ***REMOVED***
        if (this.activated)
            this.changeTimer.schedule();
        else
            this.detach();
***REMOVED***;

    this.blurListener = function() ***REMOVED***
        var el = document.activeElement;
        if (el != this.editor.textInput.getElement() && el.parentNode != this.popup.container)
            this.detach();
***REMOVED***;

    this.mousedownListener = function(e) ***REMOVED***
        this.detach();
***REMOVED***;

    this.mousewheelListener = function(e) ***REMOVED***
        this.detach();
***REMOVED***;

    this.goTo = function(where) ***REMOVED***
        var row = this.popup.getRow();
        var max = this.popup.session.getLength() - 1;

        switch(where) ***REMOVED***
            case "up": row = row <= 0 ? max : row - 1; break;
            case "down": row = row >= max ? -1 : row + 1; break;
            case "start": row = 0; break;
            case "end": row = max; break;
    ***REMOVED***

        this.popup.setRow(row);
***REMOVED***;

    this.insertMatch = function(data) ***REMOVED***
        if (!data)
            data = this.popup.getData(this.popup.getRow());
        if (!data)
            return false;

        if (data.completer && data.completer.insertMatch) ***REMOVED***
            data.completer.insertMatch(this.editor);
    ***REMOVED*** else ***REMOVED***
            if (this.completions.filterText) ***REMOVED***
                var ranges = this.editor.selection.getAllRanges();
                for (var i = 0, range; range = ranges[i]; i++) ***REMOVED***
                    range.start.column -= this.completions.filterText.length;
                    this.editor.session.remove(range);
            ***REMOVED***
        ***REMOVED***
            if (data.snippet)
                snippetManager.insertSnippet(this.editor, data.snippet);
            else
                this.editor.execCommand("insertstring", data.value || data);
    ***REMOVED***
        this.detach();
***REMOVED***;

    this.commands = ***REMOVED***
        "Up": function(editor) ***REMOVED*** editor.completer.goTo("up"); ***REMOVED***,
        "Down": function(editor) ***REMOVED*** editor.completer.goTo("down"); ***REMOVED***,
        "Ctrl-Up|Ctrl-Home": function(editor) ***REMOVED*** editor.completer.goTo("start"); ***REMOVED***,
        "Ctrl-Down|Ctrl-End": function(editor) ***REMOVED*** editor.completer.goTo("end"); ***REMOVED***,

        "Esc": function(editor) ***REMOVED*** editor.completer.detach(); ***REMOVED***,
        "Space": function(editor) ***REMOVED*** editor.completer.detach(); editor.insert(" ");***REMOVED***,
        "Return": function(editor) ***REMOVED*** return editor.completer.insertMatch(); ***REMOVED***,
        "Shift-Return": function(editor) ***REMOVED*** editor.completer.insertMatch(true); ***REMOVED***,
        "Tab": function(editor) ***REMOVED***
            var result = editor.completer.insertMatch();
            if (!result && !editor.tabstopManager)
                editor.completer.goTo("down");
            else
                return result;
    ***REMOVED***

        "PageUp": function(editor) ***REMOVED*** editor.completer.popup.gotoPageUp(); ***REMOVED***,
        "PageDown": function(editor) ***REMOVED*** editor.completer.popup.gotoPageDown(); ***REMOVED***
***REMOVED***;

    this.gatherCompletions = function(editor, callback) ***REMOVED***
        var session = editor.getSession();
        var pos = editor.getCursorPosition();

        var line = session.getLine(pos.row);
        var prefix = util.retrievePrecedingIdentifier(line, pos.column);

        this.base = editor.getCursorPosition();
        this.base.column -= prefix.length;

        var matches = [];
        var total = editor.completers.length;
        editor.completers.forEach(function(completer, i) ***REMOVED***
            completer.getCompletions(editor, session, pos, prefix, function(err, results) ***REMOVED***
                if (!err)
                    matches = matches.concat(results);
                var pos = editor.getCursorPosition();
                var line = session.getLine(pos.row);
                callback(null, ***REMOVED***
                    prefix: util.retrievePrecedingIdentifier(line, pos.column, results[0] && results[0].identifierRegex),
                    matches: matches,
                    finished: (--total === 0)
            ***REMOVED***);
        ***REMOVED***);
    ***REMOVED***);
        return true;
***REMOVED***;

    this.showPopup = function(editor) ***REMOVED***
        if (this.editor)
            this.detach();

        this.activated = true;

        this.editor = editor;
        if (editor.completer != this) ***REMOVED***
            if (editor.completer)
                editor.completer.detach();
            editor.completer = this;
    ***REMOVED***

        editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
        editor.on("changeSelection", this.changeListener);
        editor.on("blur", this.blurListener);
        editor.on("mousedown", this.mousedownListener);
        editor.on("mousewheel", this.mousewheelListener);

        this.updateCompletions();
***REMOVED***;

    this.updateCompletions = function(keepPopupPosition) ***REMOVED***
        if (keepPopupPosition && this.base && this.completions) ***REMOVED***
            var pos = this.editor.getCursorPosition();
            var prefix = this.editor.session.getTextRange(***REMOVED***start: this.base, end: pos***REMOVED***);
            if (prefix == this.completions.filterText)
                return;
            this.completions.setFilter(prefix);
            if (!this.completions.filtered.length)
                return this.detach();
            if (this.completions.filtered.length == 1
            && this.completions.filtered[0].value == prefix
            && !this.completions.filtered[0].snippet)
                return this.detach();
            this.openPopup(this.editor, prefix, keepPopupPosition);
            return;
    ***REMOVED***
        var _id = this.gatherCompletionsId;
        this.gatherCompletions(this.editor, function(err, results) ***REMOVED***
            var doDetach = function() ***REMOVED***
                if (!results.finished) return;
                return this.detach();
        ***REMOVED***.bind(this);

            var prefix = results.prefix;
            var matches = results && results.matches;
            
            if (!matches || !matches.length)
                return doDetach();
            if (prefix.indexOf(results.prefix) != 0 || _id != this.gatherCompletionsId)
                return;

            this.completions = new FilteredList(matches);
            this.completions.setFilter(prefix);
            var filtered = this.completions.filtered;
            if (!filtered.length)
                return doDetach();
            if (filtered.length == 1 && filtered[0].value == prefix && !filtered[0].snippet)
                return doDetach();
            if (this.autoInsert && filtered.length == 1)
                return this.insertMatch(filtered[0]);

            this.openPopup(this.editor, prefix, keepPopupPosition);
    ***REMOVED***.bind(this));
***REMOVED***;

    this.cancelContextMenu = function() ***REMOVED***
        var stop = function(e) ***REMOVED***
            this.editor.off("nativecontextmenu", stop);
            if (e && e.domEvent)
                event.stopEvent(e.domEvent);
    ***REMOVED***.bind(this);
        setTimeout(stop, 10);
        this.editor.on("nativecontextmenu", stop);
***REMOVED***;

***REMOVED***).call(Autocomplete.prototype);

Autocomplete.startCommand = ***REMOVED***
    name: "startAutocomplete",
    exec: function(editor) ***REMOVED***
        if (!editor.completer)
            editor.completer = new Autocomplete();
        editor.completer.autoInsert = 
        editor.completer.autoSelect = true;
        editor.completer.showPopup(editor);
        editor.completer.cancelContextMenu();
***REMOVED***
    bindKey: "Ctrl-Space|Ctrl-Shift-Space|Alt-Space"
***REMOVED***;

var FilteredList = function(array, filterText, mutateData) ***REMOVED***
    this.all = array;
    this.filtered = array;
    this.filterText = filterText || "";
***REMOVED***;
(function()***REMOVED***
    this.setFilter = function(str) ***REMOVED***
        if (str.length > this.filterText && str.lastIndexOf(this.filterText, 0) === 0)
            var matches = this.filtered;
        else
            var matches = this.all;

        this.filterText = str;
        matches = this.filterCompletions(matches, this.filterText);
        matches = matches.sort(function(a, b) ***REMOVED***
            return b.exactMatch - a.exactMatch || b.score - a.score;
    ***REMOVED***);
        var prev = null;
        matches = matches.filter(function(item)***REMOVED***
            var caption = item.value || item.caption || item.snippet;
            if (caption === prev) return false;
            prev = caption;
            return true;
    ***REMOVED***);

        this.filtered = matches;
***REMOVED***;
    this.filterCompletions = function(items, needle) ***REMOVED***
        var results = [];
        var upper = needle.toUpperCase();
        var lower = needle.toLowerCase();
        loop: for (var i = 0, item; item = items[i]; i++) ***REMOVED***
            var caption = item.value || item.caption || item.snippet;
            if (!caption) continue;
            var lastIndex = -1;
            var matchMask = 0;
            var penalty = 0;
            var index, distance;
            for (var j = 0; j < needle.length; j++) ***REMOVED***
                var i1 = caption.indexOf(lower[j], lastIndex + 1);
                var i2 = caption.indexOf(upper[j], lastIndex + 1);
                index = (i1 >= 0) ? ((i2 < 0 || i1 < i2) ? i1 : i2) : i2;
                if (index < 0)
                    continue loop;
                distance = index - lastIndex - 1;
                if (distance > 0) ***REMOVED***
                    if (lastIndex === -1)
                        penalty += 10;
                    penalty += distance;
            ***REMOVED***
                matchMask = matchMask | (1 << index);
                lastIndex = index;
        ***REMOVED***
            item.matchMask = matchMask;
            item.exactMatch = penalty ? 0 : 1;
            item.score = (item.score || 0) - penalty;
            results.push(item);
    ***REMOVED***
        return results;
***REMOVED***;
***REMOVED***).call(FilteredList.prototype);

exports.Autocomplete = Autocomplete;
exports.FilteredList = FilteredList;

***REMOVED***);

__ace_shadowed__.define('ace/autocomplete/popup', ['require', 'exports', 'module' , 'ace/edit_session', 'ace/virtual_renderer', 'ace/editor', 'ace/range', 'ace/lib/event', 'ace/lib/lang', 'ace/lib/dom'], function(require, exports, module) ***REMOVED***


var EditSession = require("../edit_session").EditSession;
var Renderer = require("../virtual_renderer").VirtualRenderer;
var Editor = require("../editor").Editor;
var Range = require("../range").Range;
var event = require("../lib/event");
var lang = require("../lib/lang");
var dom = require("../lib/dom");

var $singleLineEditor = function(el) ***REMOVED***
    var renderer = new Renderer(el);

    renderer.$maxLines = 4;

    var editor = new Editor(renderer);

    editor.setHighlightActiveLine(false);
    editor.setShowPrintMargin(false);
    editor.renderer.setShowGutter(false);
    editor.renderer.setHighlightGutterLine(false);

    editor.$mouseHandler.$focusWaitTimout = 0;

    return editor;
***REMOVED***;

var AcePopup = function(parentNode) ***REMOVED***
    var el = dom.createElement("div");
    var popup = new $singleLineEditor(el);

    if (parentNode)
        parentNode.appendChild(el);
    el.style.display = "none";
    popup.renderer.content.style.cursor = "default";
    popup.renderer.setStyle("ace_autocomplete");

    popup.setOption("displayIndentGuides", false);

    var noop = function()***REMOVED******REMOVED***;

    popup.focus = noop;
    popup.$isFocused = true;

    popup.renderer.$cursorLayer.restartTimer = noop;
    popup.renderer.$cursorLayer.element.style.opacity = 0;

    popup.renderer.$maxLines = 8;
    popup.renderer.$keepTextAreaAtCursor = false;

    popup.setHighlightActiveLine(false);
    popup.session.highlight("");
    popup.session.$searchHighlight.clazz = "ace_highlight-marker";

    popup.on("mousedown", function(e) ***REMOVED***
        var pos = e.getDocumentPosition();
        popup.selection.moveToPosition(pos);
        selectionMarker.start.row = selectionMarker.end.row = pos.row;
        e.stop();
***REMOVED***);

    var lastMouseEvent;
    var hoverMarker = new Range(-1,0,-1,Infinity);
    var selectionMarker = new Range(-1,0,-1,Infinity);
    selectionMarker.id = popup.session.addMarker(selectionMarker, "ace_active-line", "fullLine");
    popup.setSelectOnHover = function(val) ***REMOVED***
        if (!val) ***REMOVED***
            hoverMarker.id = popup.session.addMarker(hoverMarker, "ace_line-hover", "fullLine");
    ***REMOVED*** else if (hoverMarker.id) ***REMOVED***
            popup.session.removeMarker(hoverMarker.id);
            hoverMarker.id = null;
    ***REMOVED***
***REMOVED***
    popup.setSelectOnHover(false);
    popup.on("mousemove", function(e) ***REMOVED***
        if (!lastMouseEvent) ***REMOVED***
            lastMouseEvent = e;
            return;
    ***REMOVED***
        if (lastMouseEvent.x == e.x && lastMouseEvent.y == e.y) ***REMOVED***
            return;
    ***REMOVED***
        lastMouseEvent = e;
        lastMouseEvent.scrollTop = popup.renderer.scrollTop;
        var row = lastMouseEvent.getDocumentPosition().row;
        if (hoverMarker.start.row != row) ***REMOVED***
            if (!hoverMarker.id)
                popup.setRow(row);
            setHoverMarker(row);
    ***REMOVED***
***REMOVED***);
    popup.renderer.on("beforeRender", function() ***REMOVED***
        if (lastMouseEvent && hoverMarker.start.row != -1) ***REMOVED***
            lastMouseEvent.$pos = null;
            var row = lastMouseEvent.getDocumentPosition().row;
            if (!hoverMarker.id)
                popup.setRow(row);
            setHoverMarker(row, true);
    ***REMOVED***
***REMOVED***);
    popup.renderer.on("afterRender", function() ***REMOVED***
        var row = popup.getRow();
        var t = popup.renderer.$textLayer;
        var selected = t.element.childNodes[row - t.config.firstRow];
        if (selected == t.selectedNode)
            return;
        if (t.selectedNode)
            dom.removeCssClass(t.selectedNode, "ace_selected");
        t.selectedNode = selected;
        if (selected)
            dom.addCssClass(selected, "ace_selected");
***REMOVED***);
    var hideHoverMarker = function() ***REMOVED*** setHoverMarker(-1) ***REMOVED***;
    var setHoverMarker = function(row, suppressRedraw) ***REMOVED***
        if (row !== hoverMarker.start.row) ***REMOVED***
            hoverMarker.start.row = hoverMarker.end.row = row;
            if (!suppressRedraw)
                popup.session._emit("changeBackMarker");
            popup._emit("changeHoverMarker");
    ***REMOVED***
***REMOVED***;
    popup.getHoveredRow = function() ***REMOVED***
        return hoverMarker.start.row;
***REMOVED***;

    event.addListener(popup.container, "mouseout", hideHoverMarker);
    popup.on("hide", hideHoverMarker);
    popup.on("changeSelection", hideHoverMarker);

    popup.session.doc.getLength = function() ***REMOVED***
        return popup.data.length;
***REMOVED***;
    popup.session.doc.getLine = function(i) ***REMOVED***
        var data = popup.data[i];
        if (typeof data == "string")
            return data;
        return (data && data.value) || "";
***REMOVED***;

    var bgTokenizer = popup.session.bgTokenizer;
    bgTokenizer.$tokenizeRow = function(i) ***REMOVED***
        var data = popup.data[i];
        var tokens = [];
        if (!data)
            return tokens;
        if (typeof data == "string")
            data = ***REMOVED***value: data***REMOVED***;
        if (!data.caption)
            data.caption = data.value;

        var last = -1;
        var flag, c;
        for (var i = 0; i < data.caption.length; i++) ***REMOVED***
            c = data.caption[i];
            flag = data.matchMask & (1 << i) ? 1 : 0;
            if (last !== flag) ***REMOVED***
                tokens.push(***REMOVED***type: data.className || "" + ( flag ? "completion-highlight" : ""), value: c***REMOVED***);
                last = flag;
        ***REMOVED*** else ***REMOVED***
                tokens[tokens.length - 1].value += c;
        ***REMOVED***
    ***REMOVED***

        if (data.meta) ***REMOVED***
            var maxW = popup.renderer.$size.scrollerWidth / popup.renderer.layerConfig.characterWidth;
            if (data.meta.length + data.caption.length < maxW - 2)
                tokens.push(***REMOVED***type: "rightAlignedText", value: data.meta***REMOVED***);
    ***REMOVED***
        return tokens;
***REMOVED***;
    bgTokenizer.$updateOnChange = noop;
    bgTokenizer.start = noop;

    popup.session.$computeWidth = function() ***REMOVED***
        return this.screenWidth = 0;
***REMOVED***
    popup.isOpen = false;
    popup.isTopdown = false;

    popup.data = [];
    popup.setData = function(list) ***REMOVED***
        popup.data = list || [];
        popup.setValue(lang.stringRepeat("\n", list.length), -1);
        popup.setRow(0);
***REMOVED***;
    popup.getData = function(row) ***REMOVED***
        return popup.data[row];
***REMOVED***;

    popup.getRow = function() ***REMOVED***
        return selectionMarker.start.row;
***REMOVED***;
    popup.setRow = function(line) ***REMOVED***
        line = Math.max(-1, Math.min(this.data.length, line));
        if (selectionMarker.start.row != line) ***REMOVED***
            popup.selection.clearSelection();
            selectionMarker.start.row = selectionMarker.end.row = line || 0;
            popup.session._emit("changeBackMarker");
            popup.moveCursorTo(line || 0, 0);
            if (popup.isOpen)
                popup._signal("select");
    ***REMOVED***
***REMOVED***;

    popup.on("changeSelection", function() ***REMOVED***
        if (popup.isOpen)
            popup.setRow(popup.selection.lead.row);
***REMOVED***);

    popup.hide = function() ***REMOVED***
        this.container.style.display = "none";
        this._signal("hide");
        popup.isOpen = false;
***REMOVED***;
    popup.show = function(pos, lineHeight, topdownOnly) ***REMOVED***
        var el = this.container;
        var screenHeight = window.innerHeight;
        var screenWidth = window.innerWidth;
        var renderer = this.renderer;
        var maxH = renderer.$maxLines * lineHeight * 1.4;
        var top = pos.top + this.$borderSize;
        if (top + maxH > screenHeight - lineHeight && !topdownOnly) ***REMOVED***
            el.style.top = "";
            el.style.bottom = screenHeight - top + "px";
            popup.isTopdown = false;
    ***REMOVED*** else ***REMOVED***
            top += lineHeight;
            el.style.top = top + "px";
            el.style.bottom = "";
            popup.isTopdown = true;
    ***REMOVED***

        el.style.display = "";
        this.renderer.$textLayer.checkForSizeChanges();

        var left = pos.left;
        if (left + el.offsetWidth > screenWidth)
            left = screenWidth - el.offsetWidth;

        el.style.left = left + "px";

        this._signal("show");
        lastMouseEvent = null;
        popup.isOpen = true;
***REMOVED***;

    popup.getTextLeftOffset = function() ***REMOVED***
        return this.$borderSize + this.renderer.$padding + this.$imageSize;
***REMOVED***;

    popup.$imageSize = 0;
    popup.$borderSize = 1;

    return popup;
***REMOVED***;

dom.importCssString("\
.ace_editor.ace_autocomplete .ace_marker-layer .ace_active-line ***REMOVED***\
    background-color: #CAD6FA;\
    z-index: 1;\
***REMOVED***\
.ace_editor.ace_autocomplete .ace_line-hover ***REMOVED***\
    border: 1px solid #abbffe;\
    margin-top: -1px;\
    background: rgba(233,233,253,0.4);\
***REMOVED***\
.ace_editor.ace_autocomplete .ace_line-hover ***REMOVED***\
    position: absolute;\
    z-index: 2;\
***REMOVED***\
.ace_editor.ace_autocomplete .ace_scroller ***REMOVED***\
   background: none;\
   border: none;\
   box-shadow: none;\
***REMOVED***\
.ace_rightAlignedText ***REMOVED***\
    color: gray;\
    display: inline-block;\
    position: absolute;\
    right: 4px;\
    text-align: right;\
    z-index: -1;\
***REMOVED***\
.ace_editor.ace_autocomplete .ace_completion-highlight***REMOVED***\
    color: #000;\
    text-shadow: 0 0 0.01em;\
***REMOVED***\
.ace_editor.ace_autocomplete ***REMOVED***\
    width: 280px;\
    z-index: 200000;\
    background: #fbfbfb;\
    color: #444;\
    border: 1px lightgray solid;\
    position: fixed;\
    box-shadow: 2px 3px 5px rgba(0,0,0,.2);\
    line-height: 1.4;\
***REMOVED***");

exports.AcePopup = AcePopup;

***REMOVED***);

__ace_shadowed__.define('ace/autocomplete/util', ['require', 'exports', 'module' ], function(require, exports, module) ***REMOVED***


exports.parForEach = function(array, fn, callback) ***REMOVED***
    var completed = 0;
    var arLength = array.length;
    if (arLength === 0)
        callback();
    for (var i = 0; i < arLength; i++) ***REMOVED***
        fn(array[i], function(result, err) ***REMOVED***
            completed++;
            if (completed === arLength)
                callback(result, err);
    ***REMOVED***);
***REMOVED***
***REMOVED***

var ID_REGEX = /[a-zA-Z_0-9\$-]/;

exports.retrievePrecedingIdentifier = function(text, pos, regex) ***REMOVED***
    regex = regex || ID_REGEX;
    var buf = [];
    for (var i = pos-1; i >= 0; i--) ***REMOVED***
        if (regex.test(text[i]))
            buf.push(text[i]);
        else
            break;
***REMOVED***
    return buf.reverse().join("");
***REMOVED***

exports.retrieveFollowingIdentifier = function(text, pos, regex) ***REMOVED***
    regex = regex || ID_REGEX;
    var buf = [];
    for (var i = pos; i < text.length; i++) ***REMOVED***
        if (regex.test(text[i]))
            buf.push(text[i]);
        else
            break;
***REMOVED***
    return buf;
***REMOVED***

***REMOVED***);

__ace_shadowed__.define('ace/autocomplete/text_completer', ['require', 'exports', 'module' , 'ace/range'], function(require, exports, module) ***REMOVED***
    var Range = require("../range").Range;
    
    var splitRegex = /[^a-zA-Z_0-9\$\-]+/;

    function getWordIndex(doc, pos) ***REMOVED***
        var textBefore = doc.getTextRange(Range.fromPoints(***REMOVED***row: 0, column:0***REMOVED***, pos));
        return textBefore.split(splitRegex).length - 1;
***REMOVED***
    function wordDistance(doc, pos) ***REMOVED***
        var prefixPos = getWordIndex(doc, pos);
        var words = doc.getValue().split(splitRegex);
        var wordScores = Object.create(null);
        
        var currentWord = words[prefixPos];

        words.forEach(function(word, idx) ***REMOVED***
            if (!word || word === currentWord) return;

            var distance = Math.abs(prefixPos - idx);
            var score = words.length - distance;
            if (wordScores[word]) ***REMOVED***
                wordScores[word] = Math.max(score, wordScores[word]);
        ***REMOVED*** else ***REMOVED***
                wordScores[word] = score;
        ***REMOVED***
    ***REMOVED***);
        return wordScores;
***REMOVED***

    exports.getCompletions = function(editor, session, pos, prefix, callback) ***REMOVED***
        var wordScore = wordDistance(session, pos, prefix);
        var wordList = Object.keys(wordScore);
        callback(null, wordList.map(function(word) ***REMOVED***
            return ***REMOVED***
                name: word,
                value: word,
                score: wordScore[word],
                meta: "local"
        ***REMOVED***;
    ***REMOVED***));
***REMOVED***;
***REMOVED***);