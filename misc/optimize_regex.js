// Takes in an array of strings, returns a regex that matches any of the input strings
function optimizedRegex(list)
{
    var buckets = {};
    var optional = false;

    for (var i = 0; i < list.length; i++)
    {
        var str = list[i];
        if (!str)
            optional = true;
        else
        {
            var prefix = str.substring(0, 1);
            if (!buckets[prefix])
                buckets[prefix] = [];
            buckets[prefix].push(str.substring(1))
        }
    }

    var ptrns = [];
    for (var prefix in buckets)
        ptrns.push(prefix + optimizedRegex(buckets[prefix]));

    if (ptrns.length == 0)
        return "";
    if (optional)
        return "(" + ptrns.join("|") + ")?"
    else if (ptrns.length > 1)
        return "(" + ptrns.join("|") + ")"
    else
        return ptrns[0];
}
