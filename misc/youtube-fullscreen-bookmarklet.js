var os = document.getElementsByTagName("object");
for (var i = 0; i < os.length; i++)
{
	var o = os[i].cloneNode(true);
	o.innerHTML = '<param name="allowFullScreen" value="true"></param>' + o.innerHTML;
    for (var j = 0; j < o.childNodes.length; j++)
    {
        if (o.childNodes[j].name == "movie")
            o.childNodes[j].value += "&fs=1";
        else if (o.childNodes[j].nodeName.toUpperCase() == "EMBED") {
            o.childNodes[j].src += "&fs=1";
            o.childNodes[j].setAttribute("allowfullscreen", "true");
        }
    }
	os[i].parentNode.replaceChild(o, os[i]);
}
