// ==UserScript==
// @name           Facebook News Feed Notifier
// @namespace      http://tlrobinson.net/
// @description    Notify user of new Facebook News Feed items via Growl
// @include        http://*.facebook.com/home.php
// ==/UserScript==

function GM_init()
{    
    var fbNewsFeedNotification = new Growl.NotificationType("Facebook News Feed", true);
    Growl.register("Facebook", [fbNewsFeedNotification]);
    
    unsafeWindow.HomeFeed.prototype._addStoriesToQueueOriginal = unsafeWindow.HomeFeed.prototype._addStoriesToQueue
    unsafeWindow.HomeFeed.prototype._addStoriesToQueue = function(stories) {
        this._addStoriesToQueueOriginal(stories);
        
        var testDiv = document.createElement("div");
        for (var i = 0; i < stories.length; i++)
        {
            testDiv.innerHTML = stories[i];
            var spans = testDiv.getElementsByTagName("span");
            
            var message = (spans.length > 0) ? spans[0].textContent : "Unknown update";
            
            Growl.notify(fbNewsFeedNotification, "Facebook News Feed", message, Growl.Priority.Normal, false);
        }
    }
}

// Add growl.js
var GM_GROWL = document.createElement(’script’);
GM_GROWL.src = ‘http://www.tripthevortex.com/growl/growl.js’;
GM_GROWL.type = ‘text/javascript’;
document.getElementsByTagName(‘head’)[0].appendChild(GM_GROWL);

// Check if growl.js’s loaded
function GM_wait()
{
    if (typeof unsafeWindow.Growl == ‘undefined’)
    {
        console.log("waiting");
            window.setTimeout(GM_wait, 100);
    }
    else
    {
        Growl = unsafeWindow.Growl;
        GM_init();
    }
}
GM_wait();
