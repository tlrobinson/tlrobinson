// change these parameters based on document names and layer ordering
baseDocName = "base.psd";
baseDocTextLayer = 0;
textDocName = "The easy way to do somethingss12.psb";
textDocTextLayer = 0;

knownString = "The easy way "; // the part of the string that's already known
missingLength = 20; // number of characters to figure out

method = 3;
debug = false;

function main()
{
    baseDoc = documents[baseDocName];
    textDoc = documents[textDocName];

    // get the top left corner of the text layer in the main doc
    var mainBounds = baseDoc.artLayers[baseDocTextLayer].bounds,
        mainX = mainBounds[0].as("px"),
        mainY = mainBounds[1].as("px");
    
    // possible characters include space and lowercase.
    var possibleCharacters = [" "];
    for (var i = 0; i < 26; i++)
    {
        possibleCharacters.push(String.fromCharCode("a".charCodeAt(0) + i));
        //possibleCharacters.push(String.fromCharCode("A".charCodeAt(0) + i)); // uncomment for uppercase letters
    }

    var fudgeFactor = 3,    // number of top choices to try
        guess = "";         // guessed letters so far

    for (var charNum = 0; charNum < missingLength; charNum++)
    {
        results = [];
    
        // get the beginning and potential end (width of a "M") of the next character
        var w1 = getStringBounds(knownString + guess),
            w2 = getStringBounds(knownString + guess + "M");

        // PASS 1: half the potential width, since we're not looking at the next character yet

        // half the width of "M"
        setSelection(mainX, mainY, (w1[2].as("px") + w2[2].as("px")) / 2, 15);//w2[3].as("px"));
    
        // get the score for every letter
        for (var i = 0; i < possibleCharacters.length; i++)
        {
            var val = getStringScore(knownString + guess + possibleCharacters[i])
        
            var res = { ch: possibleCharacters[i], v: val };
            results.push(res);
        }

        // sort from best (lowest) to worst score
        results = results.sort(function (a,b) { return a.v - b.v; });
        
        // method 1: too simple, poor results
        if (method == 1)
        {
            guess += results[0].ch;
        }
        else
        {
            // PASS 2: full (potential) width of the current character, testing each of the few top matches and every possible next character
            
            // full width of "M"
            setSelection(mainX, mainY, w2[2].as("px"), 15);//w2[3].as("px"));
        
            var minValue = Number.MAX_VALUE,
                minChar = null,
                minSum = Number.MAX_VALUE,
                minSumChar = null;
            
            // try the few best from the first pass
            for (var i = 0; i < fudgeFactor; i++)
            {
                var sum = 0;
                for (var j = 0; j < possibleCharacters.length; j++)
                {
                    // get the score for the potential best PLUS each possible next character
                    var val = getStringScore(knownString + guess + results[i].ch + possibleCharacters[j])
                
                    sum += val;
                    
                    if (val < minValue)
                    {
                        minValue = val;
                        minChar = results[i].ch;
                    }
                }    
                if (sum < minSum)
                {
                    minSum = sum;
                    minSumChar = results[i].ch;
                }
            }
        
            // if the results aren't consistent let us know
            if (debug && results[0].ch != minSumChar || minChar != minSumChar)
                alert(minChar + "," + minSumChar + " (" +results[0].ch + "," + results[1].ch+ "," + results[2].ch+ ")");
            
            if (method == 2)
            {
                // method 2: best of all permutations
                guess += minChar;
            }
            else
            {
                // method 3: best average 
                guess += minSumChar;
            }
        }
        WaitForRedraw();
    }
}

// measure the gray value mean in the current selection
function getMeasurement()
{
    // delete existing measurements
    app.measurementLog.deleteMeasurements();
    
    // record new measurement
    app.activeDocument = baseDoc;
    app.activeDocument.recordMeasurements();//MeasurementSource.MEASURESELECTION, ["GrayValueMean"]);
    
    // export measurements to a file
    var f = new File ("/tmp/crack-tmp-file.txt");
    app.measurementLog.exportMeasurements(f);//, MeasurementRange.ACTIVEMEASUREMENTS, ["GrayValueMean"]);
    
    // open the file, read, and parse
    f.open();
    var line = f.read();
    var matches = line.match(/[0-9]+(\.[0-9]+)?/);
    if (matches)
    {
        var val = parseFloat(matches[0]);
        return val;
    }
    return null;
}

// sets the value of the test string
function setString(string)
{
    app.activeDocument = textDoc;
    app.activeDocument.artLayers[textDocTextLayer].textItem.contents = string;

    WaitForRedraw();
}

// gets the difference between the original and test strings in the currently selected area 
function getStringScore(string)
{
    setString(string);
    
    // save document to propagate changes parent of smart object
    app.activeDocument = textDoc;
    app.activeDocument.save();
    
    // return the average gray value
    return getMeasurement();
}

// get the bounds of the text
function getStringBounds(string)
{
    app.activeDocument = textDoc;
    // set the string of the text document
    setString(string);
    // select top left pixel. change this if it's not empty
    app.activeDocument.selection.select([[0,0], [0,1], [1,1], [1,0]]);
    // select similar pixels (i.e. everything that's not text)
    app.activeDocument.selection.similar(1, false);
    // invert selection to get just the text
    app.activeDocument.selection.invert();
    // return the bounds of the resulting selection
    return app.activeDocument.selection.bounds;
}

// sets the base document's selection to the given rectange
function setSelection(x, y, w, h)
{
    app.activeDocument = baseDoc;
    app.activeDocument.selection.select([[x,y], [x,y+h], [x+w,y+h], [x+w,y]]);
}

// pauses for Photoshop to redraw. taken from reference docs.
function WaitForRedraw() 
{
    // return; // uncomment for slight speed boost
    var eventWait = charIDToTypeID("Wait") 
    var enumRedrawComplete = charIDToTypeID("RdCm") 
    var typeState = charIDToTypeID("Stte") 
    var keyState = charIDToTypeID("Stte") 
    var desc = new ActionDescriptor() 
    desc.putEnumerated(keyState, typeState, enumRedrawComplete) 
    executeAction(eventWait, desc, DialogModes.NO) 
}

main();
