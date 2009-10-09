// source for fetching dataURL from cross domain //

var img_list = document.getElementsByTagName('IMG');
for( var i = 0 ; i < img_list.length ; i++ )
{
	var anchor = document.createElement("a");
		anchor.setAttribute("target" , "_blank");
	
	var canvas = document.createElement("canvas");
	anchor.appendChild(canvas);
		canvas.width = 100;
		canvas.height = 100;
		canvas.id = "pbCanvas_" + i;
	document.body.appendChild(anchor);
	
	var ctx = canvas.getContext("2d");
	
	var myImage = new Image();
		myImage.src = img_list[i].src;
	
	ctx.drawImage(myImage , 0, 0);
	try
	{
		anchor.href = canvas.toDataURL("image/png" , "");
	}
	catch(err)
	{
		document.body.removeChild(anchor);
		window.console.log('removed', err.message, ' in ' , i);
	}
}
