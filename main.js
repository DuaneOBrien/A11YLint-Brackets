/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp:true */
/*global define, brackets, $, window, A11YLINT, _handleShowA11YLint */

define(function (require, exports, module) {
    'use strict';

    var Commands                = brackets.getModule("command/Commands"),
        CommandManager          = brackets.getModule("command/CommandManager"),
        EditorManager           = brackets.getModule("editor/EditorManager"),
        DocumentManager         = brackets.getModule("document/DocumentManager"),
        LanguageManager         = brackets.getModule("language/LanguageManager"),
        Menus                   = brackets.getModule("command/Menus"),
        NativeFileSystem		= brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        FileUtils				= brackets.getModule("file/FileUtils"),
        Dialogs					= brackets.getModule("widgets/Dialogs"),
        Resizer                 = brackets.getModule("utils/Resizer"),
        
        //current module's directory
        moduleDir				= FileUtils.getNativeModuleDirectoryPath(module),
        configFile				= new NativeFileSystem.FileEntry(moduleDir + '/config.js'),
        config					= { options: {}, globals: {} };

    require("A11YLint");
    require('color');
    
    //commands
    var VIEW_HIDE_A11YLINT = "a11ylint.run";
    
    function stripOutScriptTagsButDoNotPretendThatIsSecurity(sourcecode) {
        // The name says it all.  We should be doing something smarter here.  Probably loading it into a iframe if we can solve the potential issues there.
        // This one strips ok, but messes up the wordcount.
        // return sourcecode.replace(new RegExp(/<script(.|\n)*?\/script>/img), '');
        var sanitized = sourcecode.replace(new RegExp(/<script/img), '<noscript');
        return sanitized.replace(new RegExp(/<\/script/img), '</noscript');
        // return sourcecode.replace(new RegExp(/<script(.|\n)*?\/script>/img), '');
    }
    
    function _handleLint() {
        var messages, result;
        
        var editor = EditorManager.getCurrentFullEditor();
        if (!editor) {
            _handleShowA11YLint();
            return;
        }
        var currentDoc = DocumentManager.getCurrentDocument();
        var language = currentDoc ? LanguageManager.getLanguageForPath(currentDoc.file.fullPath) : "";
        
        
        if (language && language.getId() === "html") {
            var text = stripOutScriptTagsButDoNotPretendThatIsSecurity(editor.document.getText());
            result = A11YLINT.report(text, $);
                    
            if (A11YLINT.errors.length > 0) {
                var errors = A11YLINT.errors;
    
                var $a11ylintTable = $("<table class='zebra-striped condensed-table' style='table-layout: fixed; width: 100%'>").append("<tbody>");
                $("<tr><th style='width:50px'>Line</th><th>Declaration</th><th>Message</th></tr>").appendTo($a11ylintTable);
                
                var $selectedRow;
                
                errors.forEach(function (item) {
                    var makeCell = function (content) {
                        return $("<td style='word-wrap: break-word'/>").text(content);
                    };
    
                    /*
                    if item is null, it means a fatal error, for now, not going to say anything about it.
                    */
                    
                    if (item) {
                        
                        if (!item.line) { item.line = ""; }
                        if (!item.evidence) { item.evidence = ""; }
                        
                        var $row = $("<tr/>")
                                    .append(makeCell(item.line))
                                    .append(makeCell(item.evidence))
                                    .append(makeCell(item.reason))
                                    .appendTo($a11ylintTable);
    
                        $row.click(function () {
                            if ($selectedRow) {
                                $selectedRow.removeClass("selected");
                            }
                            $row.addClass("selected");
                            $selectedRow = $row;
        
                            var editor = EditorManager.getCurrentFullEditor();
                            editor.setCursorPos(item.line - 1, item.col - 1);
                            EditorManager.focusEditor();
                        });
                        
                    }
    
                });
    
                console.log("Some Issues");
                $("#a11ylint").show();
                $("#a11ylint .table-container")
                    .empty()
                    .append($a11ylintTable);
                EditorManager.resizeEditor();
            } else {
                //todo - tell the user no issues
                console.log("No Issues");
                $("#a11ylint .table-container")
                    .empty()
                    .append("<p>No issues.</p>");
                $("#a11ylint").hide();
                EditorManager.resizeEditor();
            }
        } else {
            console.log("Not HTML");
            $("#a11ylint .table-container")
                .empty()
                .append("<p>No issues.</p>");
            $("#a11ylint").hide();
            EditorManager.resizeEditor();
        }
    }
    
    function _handleShowA11YLint() {
        var $a11ylint = $("#a11ylint");
        if ($a11ylint.css("display") === "none") {
            $a11ylint.show();
            CommandManager.get(VIEW_HIDE_A11YLINT).setChecked(true);
            _handleLint();
            $(DocumentManager).on("documentSaved documentRefreshed currentDocumentChange", _handleLint);
        } else {
            $a11ylint.hide();
            CommandManager.get(VIEW_HIDE_A11YLINT).setChecked(false);
            $(DocumentManager).off("currentDocumentChange documentSaved documentRefreshed", null,  _handleLint);
        }
        EditorManager.resizeEditor();
    }
    
    CommandManager.register("Enable A11YLint", VIEW_HIDE_A11YLINT, _handleShowA11YLint);

    function init() {
        
        //add the HTML UI
        var content =          '  <div id="a11ylint" class="bottom-panel">'
                             + '  <div class="toolbar simple-toolbar-layout">'
                             + '    <div class="title">A11YLint</div><a href="#" class="close">&times;</a>'
                             + '  </div>'
                             + '  <div class="table-container"/>'
                             + '</div><div id="a11ylint_pasteboard" style="display:none"></div>';

        $(content).insertBefore("#status-bar");

        $('#a11ylint').hide();
        
        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(VIEW_HIDE_A11YLINT);

        $('#a11ylint .close').click(function () {
            CommandManager.execute(VIEW_HIDE_A11YLINT);
        });

        // AppInit.htmlReady() has already executed before extensions are loaded
        // so, for now, we need to call this ourself
        Resizer.makeResizable($('#a11ylint').get(0), "vert", "top", 100);
    }

    function showA11YLintConfigError() {
        Dialogs.showModalDialog(
            Dialogs.DIALOG_ID_ERROR,
            "A11YHint error",
            "Unable to parse config file"
        );
    }
    
    FileUtils.readAsText(configFile).done(function (text, readTimestamp) {

        //try to parse the config file
        try {
            config = JSON.parse(text);
        } catch (e) {
            console.log("Can't parse config file - " + e);
            showA11YLintConfigError();
        }
    }).fail(function (error) {
        showA11YLintConfigError();
    }).then(init);
    
});