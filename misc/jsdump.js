
function pad(n, ch) { var ch = ch || " "; var result = ""; while (n-- > 0) result += ch; return result; }

function dump(obj, stack)
{
    if (!stack)
        stack = [];
    
    stack.push(obj);
    for (var i in obj)
    {
        if (typeof obj[i] == "object")
        {
            var loop = -1;
            for (var j = 0; j < stack.length; j++) {
                if (stack[j] === obj[i]) {
                    loop = j;
                    break;
                }
            }
            if (loop < 0) {
                print(pad(stack.length) + i + " => ");
                dump(obj[i], stack)
            } else {
                print(pad(stack.length) + i + " => [LOOP DETECTED] " + loop);
            }
        }
        else
            print((pad(stack.length) + i + " => " + obj[i]).substring(0,100).replace(/\n/g, " "));
    }
    stack.pop();
}