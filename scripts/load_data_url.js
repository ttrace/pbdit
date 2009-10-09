// source for fetching dataURL from cross domain //
javascript:
document.baseURI = 'filr:///';
var my_local_url = "file:///Users/Shared/pbedit/index.html";

var img_list = document.getElementsByTagName('IMG');
	var coverflow = document.createElement('div');
		coverflow.style.position = "fixed";
		coverflow.style.backgroundColor = "rgba( 0%, 0%, 0%, 0.8)";
		coverflow.style.top = "0px";
		coverflow.style.left = "0px";
		coverflow.style.height = "100%";
	
for( var i = 0 ; i < img_list.length ; i++ )
{
	if( img_list[i].offsetWidth > 99 )
	{
	var anchor = document.createElement("a");
		anchor.setAttribute("target" , "_self");
		anchor.href = "javascript:window.open('" + my_local_url + "?" + img_list[i].src + "');";
	coverflow.appendChild(anchor);
	
	var thumb = document.createElement("img");
	anchor.appendChild(thumb);
		thumb.width = 100;
		thumb.height = 100;
		thumb.src = img_list[i].src;
		thumb.id = "pbimage_" + i;
	}
}
