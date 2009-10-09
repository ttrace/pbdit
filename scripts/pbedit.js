function init_pbtweet()
{
	debug = "true";
	window_resize();

	//database initialize
	//database_version = "1.0";
	//init_web_database();

	preview_key = "";

	// Event dispatch.
	window.addEventListener ( 'resize' , function(){ window_resize() } , true);

	// add mutation event on Thumbnail box
	document.getElementById("preview").addEventListener( "DOMNodeInserted" ,
		function(e)
		{
			if( e.target.nodeName == "IMG" )
			{
				e.target.addEventListener("load", 
				function(e)
				{
					window.console.log('LOADED' , e.target);
					thumbnail_builder(e);
				}
				, true );		
			}
			//thumbnail_builder(e);
		}
		, false );
	
	if( location.href.match(/\?.+/) )
	{
		if(debug)window.console.log('load image from URL', location.href.match(/\?(.+)/));
		
		var extended_src = location.href.match(/\?(.+)/)[1];
		
		var pasted_container = document.getElementById('preview');
		if( extended_src.match(/.+(png|jpg|jpeg|gif|tiff|tif)$/) )
			{
				pasted_container.innerHTML = "";
				var thumbnail = document.createElement("img");
				thumbnail.src = extended_src;
				if(debug)window.console.log("pasted url", extended_src);
				pasted_container.appendChild(thumbnail);
				pasted_container.blur();
			}
		//load_image_on_canvas( location.href.match(/\?(.+)/)[1] )
	}
}

function load_image_on_canvas( src )
{
	var workspace_wrapper = document.getElementById('workspace_wrapper');

	var source_image = new Image();
		source_image.src = src;
		
	var image_layer = new myCanvas();
		image_layer.image = source_image;
		
	var workspace = document.getElementById('workspace');
	var preview = document.getElementById('workspace_preview');

	var workspace_stored = document.getElementById('stored');
	var preview_stored = document.getElementById('stored_preview');


	var long_rate = Math.max( source_image.width , source_image.height ) / 1600;
	if( long_rate > 1 )
		{
			source_image.width = parseInt( source_image.width / long_rate ) ;
			source_image.height = parseInt( source_image.height / long_rate );
		}
		workspace.width = source_image.width;
		workspace.height = source_image.height;
		workspace_stored.width = source_image.width;
		workspace_stored.height = source_image.height;

	var long_rate_preview = Math.max( source_image.width , source_image.height ) / 200;
	if( long_rate_preview > 1 )
	{
		preview.width = parseInt( source_image.width / long_rate_preview ) ;
		preview.height = parseInt( source_image.height / long_rate_preview );
		preview_stored.width = preview.width ;
		preview_stored.height = preview.height ;
	}
	else
	{
		preview.width = source_image.width;
		preview.height = source_image.height;
		preview_stored.width = source_image.width;
		preview_stored.height = source_image.height;
	}
	
	if(debug)window.console.log(preview.width, preview.height);

	fit_scale();
	
	// draw image on canvas
	var ctx = workspace.getContext('2d');
		ctx.drawImage(source_image, 0, 0, workspace.width, workspace.height);
	var ctx_stored = workspace_stored.getContext('2d');
		ctx_stored.drawImage(source_image, 0, 0, workspace_stored.width, workspace_stored.height);

	// draw image on preview canvas
	var ctx_preview = preview.getContext('2d');
		ctx_preview.drawImage(source_image, 0, 0, preview.width, preview.height);
	var ctx_preview_stored = preview_stored.getContext('2d');
		ctx_preview_stored.drawImage(source_image, 0, 0, preview_stored.width, preview_stored.height);
	
	//var image_data = ctx.getImageData( 0, 0, workspace_image.width , workspace_image.height);

	//init_image_temp();
	//load_image_onto_database( image_data );
}

function color_expression()
{
	var R_biass = ( document.getElementById("layer_R").value / 50 ) + 1;
	var G_biass = ( document.getElementById("layer_G").value / 50 ) + 1;
	var B_biass = ( document.getElementById("layer_B").value / 50 ) + 1;
	
	return([ R_biass , G_biass , B_biass ]);
}

function blur()
{
	var canvas =  document.getElementById("stored");
	var ctx = canvas.getContext("2d");

	var preview_canvas =  document.getElementById("stored_preview");
	var preview_ctx = preview_canvas.getContext("2d");

	var image_data = ctx.getImageData( 0, 0, canvas.width , canvas.height);
	var preview_image_data = preview_ctx.getImageData( 0, 0, preview_canvas.width , preview_canvas.height);

	setTimeout( function(){ preview_process( 1 , preview_image_data) } , 1);
	setTimeout( function(){ real_process( image_data) } , 100);
}

function color_change()
{
	var preview_canvas =  document.getElementById("stored_preview");
	var preview_ctx = preview_canvas.getContext("2d");
	var preview_image_data = preview_ctx.getImageData( 0, 0, preview_canvas.width , preview_canvas.height);

	preview_key = guid();
	var current_key = preview_key + "";
	setTimeout( function(){ preview_process( 1 , preview_image_data) } , 1);
	setTimeout( function(){ final_process_startar( current_key ) } , 800);
	return(false);
}

function final_process_startar ( current_key )
{
	if( current_key == preview_key )
	{
		var canvas =  document.getElementById("stored");
		var ctx = canvas.getContext("2d");
		var image_data = ctx.getImageData( 0, 0, canvas.width , canvas.height);
		real_process( image_data , current_key );
	}
	return( false );
}

function preview_process( scale , preview_image_data )
{
	var workspace =  document.getElementById("workspace");

	var preview_canvas = document.getElementById("workspace_preview");
	var preview_ctx = preview_canvas.getContext("2d");

		preview_canvas.style.height = workspace.offsetHeight + "px";
		preview_canvas.style.width = workspace.offsetWidth + "px";
		preview_canvas.style.top = workspace.offsetTop + "px";
		preview_canvas.style.left = workspace.offsetLeft + "px";
	
	//if(debug)window.console.log( preview_canvas.style.top, preview_canvas.style.left);
	
	addClass(preview_canvas , 'previewing');

	var preArray = new Array();
	var preR = 0;
	var preG = 0;
	var preB = 0;

	var color_biass = color_expression();

	for( var i = 0 ; i < (preview_image_data.data.length) ; i += 4 )
	{
		preview_image_data.data[i]     = index_color ("R" , real_color( "R" , preview_image_data.data[ i ]    ) * color_biass[0] );
		preview_image_data.data[i + 1] = index_color ("G" , real_color( "G" , preview_image_data.data[ i + 1 ]) * color_biass[1] );
		preview_image_data.data[i + 2] = index_color ("B" , real_color( "B" , preview_image_data.data[ i + 2 ]) * color_biass[2] );
	}
	
	preview_ctx.putImageData(preview_image_data, 0, 0);

//	following codes for block previewing

// 	for( var xi = 0 ; xi < (image_data.width / scale) ; xi ++)
// 	{
// 		for( var yi = 0 ; yi < (image_data.height / scale) ; yi ++)
// 		{
// 			preArray = get_pixel_collor_array( (xi * scale), (yi * scale) , image_data );
// 			preR = preArray[0];
// 			preG = preArray[1];
// 			preB = preArray[2];
// 			preview_ctx.fillStyle = "rgb(" + preR + " , " + preG + " , " + preB + ")";
// 			preview_ctx.fillRect ( (xi * scale), (yi * scale), scale, scale);
// 		}
// 	}
}

function real_process( image_data , current_key )
{
	var canvas =  document.getElementById("workspace");
	var ctx = canvas.getContext("2d");

	var color_biass = color_expression();
	var thread_length = 1000;
	
	for( var i = 0 ; ( i < image_data.data.length && preview_key == current_key) ; i += 4 )
	{
		if( preview_key != current_key )
		{
			if(debug)window.console.log('Stopped', i, current_key, preview_key);
			break;
		}
		image_data.data[i]     = index_color ("R" , real_color( "R" , image_data.data[ i ]    ) * color_biass[0] );
		image_data.data[i + 1] = index_color ("G" , real_color( "G" , image_data.data[ i + 1 ]) * color_biass[1] );
		image_data.data[i + 2] = index_color ("B" , real_color( "B" , image_data.data[ i + 2 ]) * color_biass[2] );
	}
	
	var ctx = canvas.getContext("2d");
	ctx.putImageData(image_data, 0, 0);
	var preview_canvas = document.getElementById("workspace_preview");
		preview_canvas.style.width = "0px";
		preview_canvas.style.height = "0px";

	var image_export_link = document.getElementById('image_share');
		image_export_link.href = canvas.toDataURL("image/png", "exported.png");

	removeClass(preview_canvas , 'previewing');
}


function get_pixel_collor_array( x , y , image_data )
{
	var data_array = image_data;
	var image_Height = image_data.height;
	var image_Width = image_data.width;
	var color_array = new Array();

		color_array.push( image_data.data[ x * 4 + (y * image_Width * 4)    ] ); // R
		color_array.push( image_data.data[ x * 4 + (y * image_Width * 4) + 1] ); // G
		color_array.push( image_data.data[ x * 4 + (y * image_Width * 4) + 2] ); // B
	
	//window.console.log(x, y, color_array);
	return(color_array)
}

function real_color( channel , index_color )
{
	var real_color = 0.0;
		real_color = index_color / 255;
	return(real_color);
}

function index_color( channel , real_color)
{
	var index_color = 0;
		index_color = parseInt(real_color * 255);
	
	return(index_color);
}


// loading images
function load_clipboard(event)
{
	var data = event.clipboardData.getData("Text");
	var pasted_container = document.getElementById('preview');
		
	//window.console.log('pasted', data, event.clipboardData, event.clipboardData.types );

	if( !event.clipboardData.types.every( function(element, index, key){return(!element.match(/image/));}) )
	{
		window.console.log('pasted is img');
	}
	else if( hasURL(data) && data.match(/.+(png|jpg|jpeg|gif|tiff|tif)$/) )
	{
		pasted_container.innerHTML = "";
		var thumbnail = document.createElement("img");
		thumbnail.src = hasURL(data);
		window.console.log("pasted url", hasURL(data));
		pasted_container.appendChild(thumbnail);
		pasted_container.blur();
	}
	else
	{
		pasted_container.innerHTML = "";
		pasted_container.innerHTML = "no image...";
	}
}

function thumbnail_builder(event)
{
	// if IMG is built on preview area.
	var target = event.target;
	var pasted_container = document.getElementById('preview');

	if( target.nodeName == "IMG")
	{
		setTimeout( function(){load_image_on_canvas( target.src );} , 1 );
		pasted_container.innerHTML = "";

	}
	else if( target.getElementsByTagName("img")[0] )
	{
		target = target.getElementsByTagName("img")[0];
		setTimeout( function(){load_image_on_canvas( target.src );} , 1 );		
		pasted_container.innerHTML = "";
	}
}

function pre_paste(event)
{
	document.getElementById("preview").focus();
}
