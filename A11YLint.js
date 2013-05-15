/*jslint node:true, nomen:true, regexp: true */
/*global $, Color */

// TODO : Move Error Strings To Bundle

var A11YLINT = (function () {
    'use strict';
    var whatLineNumber = function (element) {
            var lines = [],
                lineNumber = 0,
                line = '',
                index = 0;
            $(element).attr('data-a11y-target', 'findme');
            lines = $("#a11ylint_pasteboard").html().split(/\r\n?|\n/);
            lines.forEach(function (line, index) {
                if (line.match(/data-a11y-target/)) {
                    lineNumber = index + 1;
                }
            });
            $(element).removeAttr('data-a11y-target');
            return lineNumber;
        },
        hasContent = function (element, dom, reporter, that) {
            $("#a11ylint_pasteboard").find(element).each(function (index, item) {
                if (!$(this).val() && !$(this).text()) {
                    reporter.error(that.message, whatLineNumber($(this)), that.name);
                }
            });
        },
        rules = {
            adaptable : {
                tableHasSummary: {
                    name:    'Data tables must use summary attribute',
                    message: 'Please add the summary attribute to this table',
                    ruleUrl: 'http://oaa-accessibility.org/rule/3/',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;
                        $("#a11ylint_pasteboard").find('table').each(function () {
                            if (!$(this).attr('summary')) {
                                reporter.error($(this).prop('outerHTML'), whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                },
                tableMustHaveTh: {
                    name:    'Data tables must use th elements',
                    message: 'Data tables must use th elements to indicate header cells for the first cell in all the columns or rows',
                    ruleUrl: 'http://oaa-accessibility.org/rule/4/',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;;
                        $("#a11ylint_pasteboard").find('table').each(function () {
                            if ($(this).find('th').length === 0) {
                                reporter.error($(this).prop('outerHTML'), whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                },
                uniqueSummaryAttr: {
                    name:    'Summary attribute content must be unique',
                    message: 'The summary atribute from the tables should be unique',
                    ruleUrl: 'http://oaa-accessibility.org/rule/5/',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this,
                            summaries = [];
                        $("#a11ylint_pasteboard").find('table').each(function () {
                            var summary = $(this).attr('summary');
                            if (summaries.indexOf(summary) === -1) {
                                summaries.push(summary);
                            } else if (summary) {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                }
            },
            distinguishable : {
                contrastMinimum: {
                    name:    'Color contrast ratio must be > 3 for large text',
                    message: 'The contrast between the colour of text and its background for the element is not sufficient to meet WCAG2.0.',
                    ruleUrl: 'http://oaa-accessibility.org/rule/3/',
                    level: 'A',
                    template: false,
                    callback: function (dom, reporter) {
                        var that = this,
                            getInheritedProperty = function (element, property) {
                                // Is current element's background color set?
                                var color = element.css(property);
                                if ((color !== 'rgba(0, 0, 0, 0)') && (color !== 'transparent')) {
                                    // if so then return that color
                                    return color;
                                }
                                // if not: are you at the pasteboard element?
                                if (element.is('#a11ylint_pasteboard')) {
                                    // return known 'false' value
                                    return false;
                                } else {
                                    // call getBackground with parent item
                                    return getInheritedProperty(element.parent(), property);
                                }
                            };
                        $("#a11ylint_pasteboard").find('h1').each(function () {
                            var background = new Color(getInheritedProperty($(this), 'background-color')),
                                foreground = new Color(getInheritedProperty($(this), 'color')),
                                bgLumens = background.luminosity(),
                                fgLumens = foreground.luminosity(),
                                ratio = Math.round((Math.max(bgLumens, fgLumens) + 0.05) / (Math.min(bgLumens, fgLumens) + 0.05) * 10) / 10;
                            if (ratio <= 3) {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                }
            },
            headingsAndLabels : {
                headingsHasContent: {
                    name:    'Headings must have text content',
                    message: 'All heading elements (h1..h6) should have text content',
                    ruleUrl: 'oaa-accessibility.org/rule/39/',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this,
                            checkHeadingText = function (element, dom, reporter, that) {
                                $("#a11ylint_pasteboard").find(element).each(function () {
                                    if ($(this).text().length < 1) {
                                        reporter.error(that.message, whatLineNumber($(this)), that.name);
                                    }
                                });
                            };
                        checkHeadingText('h1', dom, reporter, that);
                        checkHeadingText('h2', dom, reporter, that);
                        checkHeadingText('h3', dom, reporter, that);
                        checkHeadingText('h4', dom, reporter, that);
                        checkHeadingText('h5', dom, reporter, that);
                        checkHeadingText('h6', dom, reporter, that);
                    }
                }
            },
            inputAssistance : {
                fieldsetHasLegend: {
                    name:    'Each fieldset element should contain a legend element',
                    message: 'Please add a legend element inside of the fieldset tag',
                    ruleUrl: '',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this,
                            reportThis = false;
                        $("#a11ylint_pasteboard").find('fieldset').each(function (index, item) {
                            reportThis = $(this);
                            $(this).find('legend').each(function () {
                                reportThis = false;
                            });
                            if (reportThis) {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                },
                labelWithoutElements: {
                    name:    'The label element should not encapsulate select and textarea elements',
                    message: 'Please remove the select or textarea elements from the label',
                    ruleUrl: '',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;
                        $("#a11ylint_pasteboard").find('label').each(function (index, item) {
                            $(this).find('textarea').each(function () {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            });
                            $(this).find('select').each(function () {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            });
                        });
                    }
                },
                inputImageHasAlt: {
                    name:    'Input element of type=[image] must have an alt or a title attribute',
                    message: 'Please add an alt or title attribute to the input',
                    ruleUrl: '',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;
                        $("#a11ylint_pasteboard").find('input[type=image]').each(function (index, item) {
                            if (!$(this).attr('alt') && !$(this).attr('title')) {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                },
                inputsHasValue: {
                    name:    'Input elements where type=[button|submit|reset] must have a value or title attribute',
                    message: 'All the inputs must have a valid value or title attribute',
                    ruleUrl: '',
                    level: 'AA',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this,
                            inputHasValue = function (element, dom, reporter, that) {
                                $("#a11ylint_pasteboard").find(element).each(function (index, item) {
                                    if (!$(this).val() && !$(this).attr('title')) {
                                        reporter.error(that.message, whatLineNumber($(this)), that.name);
                                    }
                                });
                            };
                        inputHasValue('input[type=button]', dom, reporter, that);
                        inputHasValue('input[type=submit]', dom, reporter, that);
                        inputHasValue('input[type=reset]',  dom, reporter, that);
                    }
                },
                buttonsHasContent: {
                    name:    'Each button element must contain content',
                    message: 'Please ensure that all the buttons has content inside',
                    ruleUrl: '',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;
                        hasContent(':button', dom, reporter, that);
                    }
                },
                labelTextContent: {
                    name:    'Labels must have text content',
                    message: 'All labels must have text content',
                    ruleUrl: '',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;
                        hasContent('label', dom, reporter, that);
                    }
                },
                legendTextContent: {
                    name:    'Legends must have text content',
                    message: 'All legends must have text content',
                    ruleUrl: '',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;
                        hasContent('legend', dom, reporter, that);
                    }
                },
                formUniqueId: {
                    name:    'Form controls must have unique ids',
                    message: 'All forms must have unique ids',
                    ruleUrl: '',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this,
                            s = [];
                        $("#a11ylint_pasteboard").find('form').each(function (index, item) {
                            var e = $(this).attr('id');
                            if (s.indexOf(e) === -1) {
                                s.push(e);
                            } else {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                }
            },
            linkPurpose : {
                linksMoreThan4Chars: {
                    name:    'Link text should be as least four 4 characters long',
                    message: 'The links should have at least 4 characters',
                    ruleUrl: '',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;
                        $("#a11ylint_pasteboard").find('a').each(function () {
                            if ($(this).text().length < 4) {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                },
                linksHaveTitles: {
                    name:    'Links should have descriptive titles',
                    message: 'The links should have descriptive titles',
                    ruleUrl: '',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;
                        $("#a11ylint_pasteboard").find('a').each(function () {
                            if (!$(this).attr('title')) {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                }
            },
            navigable : {
                // TODO: frame is not supported in HTML5. jQuery isn't even seeing it. Should we care?
                frameTitleAttr: {
                    name:    'Frame must have title attr',
                    message: 'Please add title attribute to this frame',
                    ruleurl: 'http://oaa-accessibility.org/rule/10/',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;
                        $("#a11ylint_pasteboard").find('iframe').each(function (index, item) {
                            if (!$(this).attr('title')) {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                },
                frameUniqueTitle: {
                    name:    'Title attributes for frames must be unique',
                    message: 'The title attribute must be unique for all the frames',
                    ruleurl: 'http://oaa-accessibility.org/rule/11/',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this,
                            verifyTitleAttr = function (element, dom, reporter, that) {
                                var s = [];
                                $("#a11ylint_pasteboard").find(element).each(function (index, item) {
                                    var e = $(this).attr('title');
                                    if (s.indexOf(e) === -1) {
                                        s.push(e);
                                    } else {
                                        reporter.error(that.message, whatLineNumber($(this)), that.name);
                                    }
                                });
                            };
                        verifyTitleAttr('iframe', dom, reporter, that);
                    }
                },
                framesNotHiddenOrEmpty: {
                    name:    'Frames should not be hidden or empty',
                    message: 'Frame must always be visible and contain something',
                    ruleUrl: 'http://oaa-accessibility.org/rule/12/',
                    level: 'AA',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this,
                            frameNotHidden = function (element, dom, reporter, that) {
                                $("#a11ylint_pasteboard").find(element).each(function () {
                                    var e = $(this).css('display');
                                    if (e === 'none') {
                                        reporter.error(that.message, whatLineNumber($(this)), that.name);
                                    }
                                });
                            };
                        frameNotHidden('iframe', dom, reporter, that);
                    }
                }
            },
            pageTitled : {
                missingH1: {
                    name:    'Missing or empty H1 element',
                    message: 'There should be at least one H1 element per page and it shouldn\'t be empty',
                    ruleUrl: 'http://oaa-accessibility.org/rule/14/',
                    level: 'A',
                    template: false,
                    callback: function (dom, reporter) {
                        var that = this,
                            e = [];
                
                        $("#a11ylint_pasteboard").find('h1').each(function () {
                            e.push(this);
                        });
                
                        if ((e.length === 0) || ($(e[0]).text() === '')) {
                            reporter.error(that.message, whatLineNumber($(e[0])), that.name);
                        }
                    }
                },
                maxTwoH1: {
                    name:    'No more than two h1 elements',
                    message: 'A document can only a maximum of two H1 elements',
                    ruleUrl: 'http://oaa-accessibility.org/rule/17/',
                    level: 'A',
                    template: false,
                    callback: function (dom, reporter) {
                        var that = this,
                            e = [];
                        $("#a11ylint_pasteboard").find('h1').each(function () {
                            e.push(this);
                            if (e.length > 2) {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                },
                hasTitle: {
                    name:    'Title element should not be empty',
                    message: 'A document must have a title element',
                    ruleUrl: 'http://oaa-accessibility.org/rule/17/',
                    level: 'A',
                    template: false,
                    callback: function (dom, reporter) {
                        var that = this,
                            title = "",
                            matches = [],
                            lines = [],
                            lineCount = 0;
                        matches = dom.match(new RegExp(/<title>(.*)<\/title>/im));
                        title = RegExp.$1;
                        if (title === "" || matches.length === 0) {
                            lines = dom.split(/\r\n?|\n/);
                            for (lineCount = 0; lineCount < lines.length; lineCount += 1) {
                                if (lines[lineCount].match(new RegExp(/<html/i))) {
                                    reporter.error(that.message, lineCount + 1, that.name);
                                }
                            }
                        }
                    }
                },
                titleMoreThanOneWord: {
                    name:    'Title text must contain more than one word',
                    message: 'Title text must contain more than one word',
                    ruleUrl: 'http://oaa-accessibility.org/rule/17/',
                    level: 'A',
                    template: false,
                    callback: function (dom, reporter) {
                        var that = this,
                            title = "",
                            lines = [],
                            lineCount = 0,
                            titleMatcher = new RegExp(/<title>(.*)<\/title>/im);
                        dom.match(new RegExp(titleMatcher));
                        title = RegExp.$1;
                        if (title.split(' ').length <= 1) {
                            lines = dom.split(/\r\n?|\n/);
                            for (lineCount = 0; lineCount < lines.length; lineCount += 1) {
                                if (lines[lineCount].match(titleMatcher)) {
                                    reporter.error(that.message, lineCount + 1, that.name);
                                }
                            }
                        }
                    }
                }
            },
            readable : {
                htmlLang: {
                    name:    'All pages should have lang attr in html tag',
                    message: 'Please add the lang attribute to the html tag',
                    ruleUrl: 'http://oaa-accessibility.org/rule/34/',
                    level: 'A',
                    template: false,
                    callback: function (dom, reporter) {
                        var that = this,
                            lines = [],
                            lineCount = 0,
                            languageMatcher = new RegExp(/<html.+lang=/i);

                        // TODO: Refine this RegExp for whitespace
                        if (!dom.match(new RegExp(languageMatcher))) {
                            lines = dom.split(/\r\n?|\n/);
                            for (lineCount = 0; lineCount < lines.length; lineCount += 1) {
                                if (lines[lineCount].match(new RegExp(/<html/i))) {
                                    reporter.error(that.message, lineCount + 1, that.name);
                                }
                            }
                        }
                    }
                },
                validLangAttr: {
                    name:    'Lang attribute on html element must have a valid two-character language code',
                    message: 'Please, ensure that the lang attribute of the html tag is valid',
                    ruleUrl: 'http://oaa-accessibility.org/rule/35/',
                    level: 'A',
                    template: false,
                    callback: function (dom, reporter) {
                        var that = this,
                            lines = [],
                            lineCount = 0;
                        // TODO: Refine this RegExp for whitespace
                        if (!dom.match(new RegExp(/<html.+lang=['\"]{1}[a-zA-Z]{2}['\"]{1}/i))) {
                            lines = dom.split(/\r\n?|\n/);
                            for (lineCount = 0; lineCount < lines.length; lineCount += 1) {
                                if (lines[lineCount].match(new RegExp(/<html/i))) {
                                    reporter.error(that.message, lineCount + 1, that.name);
                                }
                            }
                        }
                    }
                }
            },
            textAlternatives : {
                validAltText: {
                    name:    'All img must have alt',
                    message: 'Please add the alt attribute to this image',
                    ruleUrl: 'http://oaa-accessibility.org/rule/26/',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;
                        $("#a11ylint_pasteboard").find('img').each(function () {
                            if (!$(this).attr('alt')) {
                                reporter.error(that.message, whatLineNumber($(this)), that.name);
                            }
                        });
                    }
                },
                imgFileNotAltText: {
                    name:    'Image file name is not valid alt text',
                    message: 'The alt attribute of an image cant be an image file',
                    ruleUrl: 'http://oaa-accessibility.org/rule/27/',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this,
                            imageMatcher = new RegExp('^.*\\.(jpg|bmp|jpeg|jfif|gif|png|tif|tiff)$');
                        $("#a11ylint_pasteboard").find('img').each(function () {
                            var alt = $(this).attr('alt');
                            if (alt) {
                                if (imageMatcher.exec(alt.toLowerCase())) {
                                    reporter.error(that.message, whatLineNumber($(this)), that.name);
                                }
                            }
                        });
                    }
                },
                presentationRole: {
                    name:    'If an image has an alt or title attribute, it should not have a presentation role',
                    message: 'Remove the presentation role from the img',
                    ruleUrl: 'http://oaa-accessibility.org/rule/31/',
                    level: 'A',
                    template: true,
                    callback: function (dom, reporter) {
                        var that = this;
                        $("#a11ylint_pasteboard").find('img').each(function () {
                            var alt  = $(this).attr('alt'),
                                role = $(this).attr('role');
                            if (alt) {
                                if (role) {
                                    if (role.toLowerCase() === 'presentation') {
                                        reporter.error(that.message, whatLineNumber($(this)), that.name);
                                    }
                                }
                            }
                        });
                    }
                }
            }
        },
        itself = {
            errors: [],
            report: function (source, jq) {
                this.errors = [];
                var lines  = [],
                    output = {
                        errors: [],
                        error: function (reason, line, evidence) {
                            
                            if (!output.errors[line]) {
                                output.errors[line] = [];
                            }
                            output.errors[line].push({
                                type    : "error",
                                line    : line,
                                reason : reason,
                                evidence    : evidence || {}
                            });
                        }
                    },
                    lineNumber      = 0,
                    rulesetKey      = '',
                    ruleKey         = '',
                    indexOfRuleset  = 0,
                    indexOfRules    = 0,
                    returnArray     = [];
                
                if (typeof source === 'string') {
                    lines = source.split(/\r\n?|\n/);
                } else {
                    lines = source;
                }
                

                $("#a11ylint_pasteboard").html(source);
                for (rulesetKey in rules) {
                    if (rules.hasOwnProperty(rulesetKey)) {
                        for (ruleKey in rules[rulesetKey]) {
                            if (rules[rulesetKey].hasOwnProperty(ruleKey)) {
                                rules[rulesetKey][ruleKey].callback(source, output);
                            }
                        }
                    }
                }
                $("#a11ylint_pasteboard").html('');
                
                for (lineNumber in output.errors) {
                    if (output.errors.hasOwnProperty(lineNumber)) {
                        returnArray = returnArray.concat(output.errors[lineNumber]);
                    }
                }
                this.errors = returnArray;
            }
        };

    return itself;
}());


if (typeof exports === "object" && exports) {
    exports.A11YLINT = A11YLINT;
}
