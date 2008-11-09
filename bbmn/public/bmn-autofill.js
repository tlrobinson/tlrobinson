(function() {
    var callback_count = 0;
    
    var userRegex = /(user|name|email|login)/i,
        passwordRegex = /(pass)/i,
        isUserField = function(input) {
            return input.type == "text" &&
            ((input.name && userRegex.test(input.name)) ||
             (input.id && userRegex.test(input.id)));
        },
        isPasswordField = function(input) {
            return input.type == "password" /*&&
            ((input.name && passwordRegex.test(input.name)) ||
             (input.id && passwordRegex.test(input.id)));*/
        };
        
    window.bmn_autofill = function(url) {
        var callback_name = "bmn_callback_" + (callback_count++);
        window[callback_name] = function(result) {
            if (!result || !result.username || !result.password) {
                alert("Couldn't get username and password");
                return;
            }
            
            var needsUser = true,
                needsPassword = true,
                inputs = document.getElementsByTagName("input");
                
            for (var i = 0; i < inputs.length && (needsUser || needsPassword); i++)
            {
                if (needsUser && isUserField(inputs[i]))
                {
                    needsUser = false;
                    inputs[i].value = result.username;
                }
                else if (needsPassword && isPasswordField(inputs[i]))
                {
                    needsPassword = false;
                    inputs[i].value = result.password;
                }
            }
        }
        with(document)body.appendChild(createElement('script')).src='http://bmn.tlrobinson.net/lookup?url='+encodeURIComponent(url)+"&callback="+callback_name;
    }
    bmn_autofill(window.location.host);
})();