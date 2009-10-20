function init_pbtweet()
{
	debug = true;
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
			if(debug)window.console.log('added' , e.target);			
				e.target.addEventListener("load", 
				function(e)
				{
					if(debug)window.console.log('LOADED' , e.target);
					thumbnail_builder(e);
				}
				, true );
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

	color_change();	
}

function revert_filter( target_filter , revert_target )
{
	var canvas_input =  document.getElementById( revert_target + "_output");
	var ctx_input = canvas_input.getContext("2d");
	var image_data_input = ctx_input.getImageData( 0, 0, canvas_input.width , canvas_input.height);

	var canvas_input_preview =  document.getElementById( revert_target + "_output_preview");
	var ctx_input_preview = canvas_input_preview.getContext("2d");
	var image_data_input_preview = ctx_input_preview.getImageData( 0, 0, canvas_input_preview.width , canvas_input_preview.height);

	var canvas_output =  document.getElementById( target_filter + "_output");
	var ctx_output = canvas_output.getContext("2d");
		ctx_output.putImageData(image_data_input, 0, 0, canvas_input.width , canvas_input.height);

	var canvas_output_preview =  document.getElementById( target_filter + "_output_preview");
	var ctx_output_preview = canvas_output_preview.getContext("2d");
		ctx_output_preview.putImageData(image_data_input_preview, 0, 0, canvas_output_preview.width , canvas_output_preview.height);

	var canvas_workspace =  document.getElementById( "workspace" );
	var ctx_workspace = canvas_workspace.getContext("2d");
		ctx_workspace.putImageData(image_data_input, 0, 0, canvas_workspace.width , canvas_workspace.height);
}

function progress( target_filter , progress )
{
	var progress_bar = document.getElementById( target_filter ).getElementsByClassName('bar')[0];
	//if( progress <= 0.1 )
	//{
	//	progress = 0.1;
	//}
	progress_bar.style.width = progress * 100 + "px";
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
//		real_color = index_color / 255;
		real_color = Math.exp(index_color / 255);
	return(real_color);
}

function index_color( channel , real_color)
{
	var index_color = 0;
//		index_color = parseInt(real_color * 255);
		index_color = parseInt( Math.log(real_color) * 255 );
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
