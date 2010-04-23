// javascript:void((function() { if (typeof _colourify === "function") { _colourify(); } else { document.body.appendChild(document.createElement("script")).src='http://localhost/~tlrobinson/colourify.js'; }; })())
_colourify = (function() {
    // from http://news.e-scribe.com/361
    var colourNames = {'aliceblue': 'F0F8FF', 'antiquewhite': 'FAEBD7', 'aquamarine': '7FFFD4', 'azure': 'F0FFFF', 'beige': 'F5F5DC', 'bisque': 'FFE4C4', 'black': '000000', 'blanchedalmond': 'FFEBCD', 'blue': '0000FF', 'blueviolet': '8A2BE2', 'brown': 'A52A2A', 'burlywood': 'DEB887', 'cadetblue': '5F9EA0', 'chartreuse': '7FFF00', 'chocolate': 'D2691E', 'coral': 'FF7F50', 'cornflowerblue': '6495ED', 'cornsilk': 'FFF8DC', 'cyan': '00FFFF', 'darkgoldenrod': 'B8860B', 'darkgreen': '006400', 'darkkhaki': 'BDB76B', 'darkolivegreen': '556B2F', 'darkorange': 'FF8C00', 'darkorchid': '9932CC', 'darksalmon': 'E9967A', 'darkseagreen': '8FBC8F', 'darkslateblue': '483D8B', 'darkslategray': '2F4F4F', 'darkturquoise': '00CED1', 'darkviolet': '9400D3', 'deeppink': 'FF1493', 'deepskyblue': '00BFFF', 'dimgray': '696969', 'dodgerblue': '1E90FF', 'firebrick': 'B22222', 'floralwhite': 'FFFAF0', 'forestgreen': '228B22', 'gainsboro': 'DCDCDC', 'ghostwhite': 'F8F8FF', 'gold': 'FFD700', 'goldenrod': 'DAA520', 'gray': '808080', 'green': '008000', 'greenyellow': 'ADFF2F', 'honeydew': 'F0FFF0', 'hotpink': 'FF69B4', 'indianred': 'CD5C5C', 'ivory': 'FFFFF0', 'khaki': 'F0E68C', 'lavender': 'E6E6FA', 'lavenderblush': 'FFF0F5', 'lawngreen': '7CFC00', 'lemonchiffon': 'FFFACD', 'lightblue': 'ADD8E6', 'lightcoral': 'F08080', 'lightcyan': 'E0FFFF', 'lightgoldenrod': 'EEDD82', 'lightgoldenrodyellow': 'FAFAD2', 'lightgray': 'D3D3D3', 'lightpink': 'FFB6C1', 'lightsalmon': 'FFA07A', 'lightseagreen': '20B2AA', 'lightskyblue': '87CEFA', 'lightslate': '8470FF', 'lightslategray': '778899', 'lightsteelblue': 'B0C4DE', 'lightyellow': 'FFFFE0', 'limegreen': '32CD32', 'linen': 'FAF0E6', 'magenta': 'FF00FF', 'maroon': 'B03060', 'mediumaquamarine': '66CDAA', 'mediumblue': '0000CD', 'mediumorchid': 'BA55D3', 'mediumpurple': '9370DB', 'mediumseagreen': '3CB371', 'mediumslateblue': '7B68EE', 'mediumspringgreen': '00FA9A', 'mediumturquoise': '48D1CC', 'mediumviolet': 'C71585', 'midnightblue': '191970', 'mintcream': 'F5FFFA', 'mistyrose': 'FFE4E1', 'moccasin': 'FFE4B5', 'navajowhite': 'FFDEAD', 'navy': '000080', 'oldlace': 'FDF5E6', 'olivedrab': '6B8E23', 'orange': 'FFA500', 'orangered': 'FF4500', 'orchid': 'DA70D6', 'palegoldenrod': 'EEE8AA', 'palegreen': '98FB98', 'paleturquoise': 'AFEEEE', 'palevioletred': 'DB7093', 'papayawhip': 'FFEFD5', 'peachpuff': 'FFDAB9', 'peru': 'CD853F', 'pink': 'FFC0CB', 'plum': 'DDA0DD', 'powderblue': 'B0E0E6', 'purple': 'A020F0', 'red': 'FF0000', 'rosybrown': 'BC8F8F', 'royalblue': '4169E1', 'saddlebrown': '8B4513', 'salmon': 'FA8072', 'sandybrown': 'F4A460', 'seagreen': '2E8B57', 'seashell': 'FFF5EE', 'sienna': 'A0522D', 'skyblue': '87CEEB', 'slateblue': '6A5ACD', 'slategray': '708090', 'snow': 'FFFAFA', 'springgreen': '00FF7F', 'steelblue': '4682B4', 'tan': 'D2B48C', 'thistle': 'D8BFD8', 'tomato': 'FF6347', 'turquoise': '40E0D0', 'violet': 'EE82EE', 'violetred': 'D02090', 'wheat': 'F5DEB3', 'white': 'FFFFFF', 'whitesmoke': 'F5F5F5', 'yellow': 'FFFF00', 'yellowgreen': '9ACD32'}

    // scrap all stylesheet rules for "color" and "background-color" styles
    var colours = {};
    for (var i = 0; i < document.styleSheets.length; i++) {
        var ss = document.styleSheets[i];
        for (var j = 0; ss && ss.cssRules && j < ss.cssRules.length; j++) {
            var rule = ss.cssRules[j];
            for (var k = 0; rule && k < rule.style.length; k++) {
                var name = rule.style[k];
                if (name === "color" || name === "background-color") {
                    var value = rule.style.getPropertyCSSValue(name).cssText;
                    var match;
                    if (match = value.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)) {
                        value = "#" + decToHex(match[1]) + decToHex(match[2]) + decToHex(match[3]);
                    }
                    else if (colourNames[value.toLowerCase()]) {
                        value = "#" + colourNames[value.toLowerCase()];
                    }

                    value = value.toLowerCase();

                    colours[value] = colours[value] || [];
                    colours[value].push({ rule : rule, name : name });
                }
            }
        }
    }

    var palettes = [];

    initiatePaletteRequest();

    var c = function(response) {
        if (response)
            palettes.push.apply(palettes, response);

        if (palettes.length > 0)
            setPalette(palettes.shift());
        else
            initiatePaletteRequest();
    }
    // for debugging:
    c.colours = colours;
    c.palettes = palettes;
    return c;

    function setPalette(palette) {
        var n = 0;
        for (var originalColor in colours) {
            var newColour = palette.colors[n++ % palette.colors.length];

            var styles = colours[originalColor];
            for (var i = 0; i < styles.length; i++) {
                styles[i].rule.style.setProperty(styles[i].name, "#"+newColour);
            }
        }
    }

    function decToHex(dec) {
        var hex = parseInt(dec, 10).toString(16)
        return Array(3 - hex.length).join("0") + hex;
    }

    // var type = "top";
    var type = "random";
    // var type = "new";
    var numResults = 5;
    var resultOffset = 0;
    function initiatePaletteRequest() {
        document.body.appendChild(document.createElement("script")).src = 'http://www.colourlovers.com/api/palettes/'+type+'?jsonCallback=_colourify&resultOffset='+resultOffset+'&numResults='+numResults;
        resultOffset += numResults;
    }
})();
