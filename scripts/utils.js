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

hasURL = function( string )
{
	window.console.log( "hasURL" , string );
	var url_detection_regexp = /(file|http|https):\/\/\/?(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
	if( string.match( url_detection_regexp ) )
	{
		window.console.log( 'URL detector' , string.match( url_detection_regexp )[0] );
		return( string.match( url_detection_regexp )[0] );
	}
	else
	{
		return( false );
	}
}