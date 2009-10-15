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

function image_blur()
{
	document.blur_progress = 0;
	try
	{
		clearInterval(blur_timer);
	}
	catch(e)
	{
		if(debug)window.console.log(e.message);
	}
	
	var preview_canvas =  document.getElementById("workspace_preview");
	var preview_ctx = preview_canvas.getContext("2d");
	var preview_image_data = preview_ctx.getImageData( 0, 0, preview_canvas.width , preview_canvas.height);

	preview_key = guid();
	var current_key = preview_key;
	setTimeout( function(){ preview_blur( 1 , preview_image_data) } , 1);
	//blur_timer = setInterval( function(){ blur_process_startar( current_key ) } , 50);
	return(false);
}

function blur_process_startar ( current_key )
{
	var canvas =  document.getElementById("workspace");
	var ctx = canvas.getContext("2d");
	var image_data = ctx.getImageData( 0, 0, canvas.width , canvas.height);

	if( current_key == preview_key && document.blur_progress < image_data.data.length )
	{
		if(!document.blur_progress)document.color_progress = 0;
		var start_offset = document.blur_progress;
		real_process( start_offset );
		document.blur_progress += 1000000;
	}
	else
	{
		clearInterval(blur_timer);
		document.blur_progress = 0;
	}
	return( false );
}

function blur_expression()
{
	var slider_index = document.getElementById("blur").value * 0.001 ;
	var amount = parseInt( document.getElementById("workspace").width * slider_index );
	
	return( amount );
}

function preview_blur( scale , preview_image_data )
{
	var workspace =  document.getElementById("workspace");

	var preview_canvas = document.getElementById("workspace_preview");
	var preview_ctx = preview_canvas.getContext("2d");

		preview_canvas.style.height = workspace.offsetHeight + "px";
		preview_canvas.style.width = workspace.offsetWidth + "px";
		preview_canvas.style.top = workspace.offsetTop + "px";
		preview_canvas.style.left = workspace.offsetLeft + "px";
	addClass(preview_canvas , 'previewing');

	var preview_scale = preview_canvas.width / workspace.width;

	var preArray = new Array();
	var preR = 0;
	var preG = 0;
	var preB = 0;

	var blur_ammount = blur_expression();

	var preview_blur_pixel = parseInt( blur_ammount * preview_scale / 2 );
	if(debug)window.console.log('preview_blur_started:', preview_image_data.width, " scale: ",preview_scale, blur_ammount , preview_blur_pixel);

	for( var i = 0 ; i < (preview_image_data.data.length) ; i += 4 )
	{
		var amount_R = 0;
		var amount_G = 0;
		var amount_B = 0;
		var amount_A = 0;
		var sample_case = 0;
		var ignor_case = 0;

		for( var yi = preview_blur_pixel * -1 ; yi < preview_blur_pixel ; yi++ )
		{
			var y = parseInt(( i / 4 ) / preview_image_data.width) + yi;
			for( var xi = preview_blur_pixel * -1 ; xi < preview_blur_pixel ; xi++)
			{
				var x = ( i / 4 ) % preview_image_data.width + xi;
				if( x >= 0 && x < preview_image_data.width && y >= 0 && y < preview_image_data.height )
				{
					amount_R += real_color("R" , preview_image_data.data[(i + ((xi + yi * preview_image_data.width) * 4))    ] );
					amount_G += real_color("G" , preview_image_data.data[(i + ((xi + yi * preview_image_data.width) * 4)) + 1] );
					amount_B += real_color("B" , preview_image_data.data[(i + ((xi + yi * preview_image_data.width) * 4)) + 2] );
					amount_A += real_color("A" , preview_image_data.data[(i + ((xi + yi * preview_image_data.width) * 4)) + 3] );
					sample_case++
				}
				else
				{
					ignor_case++ ;
				}
			}
		}
		preview_image_data.data[i]     = index_color ("R" , amount_R / sample_case );
		preview_image_data.data[i + 1] = index_color ("G" , amount_G / sample_case );
		preview_image_data.data[i + 2] = index_color ("B" , amount_B / sample_case );
		preview_image_data.data[i + 3] = index_color ("A" , amount_A / sample_case );
	}	
	preview_ctx.putImageData(preview_image_data, 0, 0);
}

// color convolution
function color_expression()
{
	var R_biass = ( document.getElementById("layer_R").value / 50 ) + 1;
	var G_biass = ( document.getElementById("layer_G").value / 50 ) + 1;
	var B_biass = ( document.getElementById("layer_B").value / 50 ) + 1;
	
	return([ R_biass , G_biass , B_biass ]);
}


function color_change()
{
	document.color_progress = 0;
	try
	{
		clearInterval(color_timer);
	}
	catch(e)
	{
		if(debug)window.console.log(e.message);
	}

	var preview_canvas =  document.getElementById("stored_preview");
	var preview_ctx = preview_canvas.getContext("2d");
	var preview_image_data = preview_ctx.getImageData( 0, 0, preview_canvas.width , preview_canvas.height);

	preview_key = guid();
	var current_key = preview_key;
	setTimeout( function(){ preview_process( preview_image_data) } , 1);
	color_timer = setInterval( function(){ final_process_startar( current_key ) } , 50);
	return(false);
}

function final_process_startar ( current_key )
{
	var canvas =  document.getElementById("stored");
	var ctx = canvas.getContext("2d");
	var image_data = ctx.getImageData( 0, 0, canvas.width , canvas.height);

	if( current_key == preview_key && document.color_progress < image_data.data.length )
	{
		if(!document.color_progress)document.color_progress = 0;
		var start_offset = document.color_progress;
		real_process( start_offset );
		document.color_progress += 1000000;
	}
	else
	{
		clearInterval(color_timer);
		document.color_progress = 0;
	}
	return( false );
}

function preview_process( preview_image_data )
{
	var workspace =  document.getElementById("workspace");

	var preview_canvas = document.getElementById("workspace_preview");
	var preview_ctx = preview_canvas.getContext("2d");

		preview_canvas.style.height = workspace.offsetHeight + "px";
		preview_canvas.style.width = workspace.offsetWidth + "px";
		preview_canvas.style.top = workspace.offsetTop + "px";
		preview_canvas.style.left = workspace.offsetLeft + "px";
	
	addClass(preview_canvas , 'previewing');

	var color_biass = color_expression();

	for( var i = 0 ; i < (preview_image_data.data.length) ; i += 4 )
	{
		preview_image_data.data[i]     = index_color ("R" , real_color( "R" , preview_image_data.data[ i ]    ) * color_biass[0] );
		preview_image_data.data[i + 1] = index_color ("G" , real_color( "G" , preview_image_data.data[ i + 1 ]) * color_biass[1] );
		preview_image_data.data[i + 2] = index_color ("B" , real_color( "B" , preview_image_data.data[ i + 2 ]) * color_biass[2] );
	}
	
	preview_ctx.putImageData(preview_image_data, 0, 0);
}

function real_process( start_offset )
{
	var canvas =  document.getElementById("workspace");
	var ctx = canvas.getContext("2d");
	var image_data = ctx.getImageData( 0, 0, canvas.width , canvas.height);
	if( start_offset == 0)
	{
		var initial_canvas =  document.getElementById("stored");
		var initial_ctx = initial_canvas.getContext("2d");	
		var image_data = initial_ctx.getImageData( 0, 0, canvas.width , canvas.height);
	}

	if(debug)window.console.log('progress' , start_offset, image_data.data.length);

	var color_biass = color_expression();
	
	for( var i = start_offset ; ( i < image_data.data.length && i < (start_offset + 1000000) ) ; i += 4 )
	{
		image_data.data[i]     = index_color ("R" , real_color( "R" , image_data.data[ i ]    ) * color_biass[0] );
		image_data.data[i + 1] = index_color ("G" , real_color( "G" , image_data.data[ i + 1 ]) * color_biass[1] );
		image_data.data[i + 2] = index_color ("B" , real_color( "B" , image_data.data[ i + 2 ]) * color_biass[2] );
	}
	
	ctx.putImageData(image_data, 0, 0);

	if( (start_offset + 1000000) > image_data.data.length )
	{	//	finished
		var preview_canvas = document.getElementById("workspace_preview");
			preview_canvas.style.width = "0px";
			preview_canvas.style.height = "0px";
	
		var image_export_link = document.getElementById('image_share');
			image_export_link.href = canvas.toDataURL("image/png", "exported.png");
			
		removeClass(preview_canvas , 'previewing');
	}
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
