S4 = function()
{
	return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}

guid = function()
{
	return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

//Standard function
hasClass = function(ele,cls)
{
	try
	{
		return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	}
	catch(err)
	{
		return false;
	}
}

addClass = function(ele,cls)
{
	if (!hasClass(ele,cls)) ele.className += " "+cls;
}

removeClass = function(ele,cls)
{
	if (hasClass(ele,cls)) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		ele.className=ele.className.replace(reg,'');
	}
}
