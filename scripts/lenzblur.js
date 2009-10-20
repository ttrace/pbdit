function image_blur()
{
	if( arguments[0] != "preview" )
	{
		preview_key = guid();
		var current_key = preview_key;
	}

	if( parseInt( blur_expression() ) != 0)
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
		
		var canvas_input_preview =  document.getElementById("color_output_preview");
		var ctx_input_preview = canvas_input_preview.getContext("2d");
		var image_data_input_preview = ctx_input_preview.getImageData( 0, 0, canvas_input_preview.width , canvas_input_preview.height);
	
		if( arguments[0] != "preview" )
		{
			blur_timer = setInterval( function(){ blur_process_startar( current_key ) } , 15);
		}
		setTimeout( function(){ preview_blur( image_data_input_preview) } , 1);
		return(false);
	}
	else
	{
		revert_filter( "blur" , "color" );
		finish_blur();
	}
}

function blur_process_startar ( current_key )
{
	var canvas_input =  document.getElementById("color_output");
	var ctx_input = canvas_input.getContext("2d");
	var image_data_input = ctx_input.getImageData( 0, 0, canvas_input.width , canvas_input.height);

	if( current_key == preview_key && document.blur_progress < image_data_input.data.length )
	{
		if(!document.blur_progress)document.blur_progress = 0;
		var start_offset = document.blur_progress;
		real_blur_process( start_offset );
		document.blur_progress += 20000;
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
	var slider_index = document.getElementById("blur").value;
//	var amount = 0;
	var amount = slider_index;
// 	if( slider_index > 11)
// 	{
// 		blur_ratio = slider_index * 0.00025;
// 		amount = parseInt( document.getElementById("workspace").width * blur_ratio );
// 	}
// 	else if( slider_index != 0)
// 	{
// 		amount = 2;
// 	}
//	window.console.log(slider_index , amount);
	return( amount );
}

function preview_blur( image_data_input_preview )
{
	activate_preview();
 	var canvas_workspace_preview = document.getElementById("workspace_preview");
 	var ctx_workspace_preview = canvas_workspace_preview.getContext("2d");

	var canvas_input =  document.getElementById("color_output");
	var preview_scale = canvas_workspace_preview.width / canvas_input.width;

	var blur_amount = blur_expression();
	var preview_blur_pixel = parseInt( blur_amount * preview_scale );
	
	if( preview_blur_pixel > 0)
	{
		if(debug)window.console.log('preview_blur_started:', image_data_input_preview.width, " scale: ",preview_scale, blur_amount , preview_blur_pixel);
	
		for( var i = 0 ; i < (image_data_input_preview.data.length) ; i += 4 )
		{
			var amount_R = 0;
			var amount_G = 0;
			var amount_B = 0;
			var amount_A = 0;
			var sample_case = 0;
			var ignor_case = 0;
	
			for( var yi = preview_blur_pixel * -1 ; yi < preview_blur_pixel ; yi++ )
			{
				var y = parseInt(( i / 4 ) / image_data_input_preview.width) + yi;
				if( y >= 0 && y < image_data_input_preview.height )
				{
					for( var xi = preview_blur_pixel * -1 ; xi < preview_blur_pixel ; xi++)
					{
						var x = ( i / 4 ) % image_data_input_preview.width + xi;
						if( x >= 0 && x < image_data_input_preview.width )
						{
							amount_R += real_color("R" , image_data_input_preview.data[(i + ((xi + yi * image_data_input_preview.width) * 4))    ] );
							amount_G += real_color("G" , image_data_input_preview.data[(i + ((xi + yi * image_data_input_preview.width) * 4)) + 1] );
							amount_B += real_color("B" , image_data_input_preview.data[(i + ((xi + yi * image_data_input_preview.width) * 4)) + 2] );
							amount_A += real_color("A" , image_data_input_preview.data[(i + ((xi + yi * image_data_input_preview.width) * 4)) + 3] );
							sample_case++
						}
						else
						{
							ignor_case++ ;
						}
					}
				}
			}
			image_data_input_preview.data[i]     = index_color ("R" , amount_R / sample_case );
			image_data_input_preview.data[i + 1] = index_color ("G" , amount_G / sample_case );
			image_data_input_preview.data[i + 2] = index_color ("B" , amount_B / sample_case );
			image_data_input_preview.data[i + 3] = index_color ("A" , amount_A / sample_case );
		}	
		ctx_workspace_preview.putImageData(image_data_input_preview, 0, 0);
	}
	
	// for debug
	//innactivate_preview();
}

function real_blur_process( start_offset )
{
	var canvas_workspace =  document.getElementById("workspace");
	var ctx_workspace = canvas_workspace.getContext("2d");
	var image_data = ctx_workspace.getImageData( 0, 0, canvas_workspace.width , canvas_workspace.height);
	var image_width = image_data.width;
	var image_height = image_data.height;

	if( start_offset == 0)
	{
		var initial_canvas =  document.getElementById("color_output");
		var initial_ctx = initial_canvas.getContext("2d");	
		var image_data = initial_ctx.getImageData( 0, 0, canvas_workspace.width , canvas_workspace.height);
	}

	var blur_amount = parseInt( blur_expression() );

// onfocus
//	var blur_amount = 20 - Math.ceil( start_offset / image_data.data.length * 20 );
//	if(debug)window.console.log('blur',start_offset, image_data.data.length );

	var blur_width = (blur_amount *2) + 1;
	var	blur_step = 1;

	var	blur_pixel_length = Math.pow( blur_width , 2 );
	var blur_pixel_array_offset = ( blur_amount * image_width + blur_amount );

	//if(debug)window.console.log('progress' , start_offset,"/", image_data.data.length, " image_width", image_width, blur_pixel_array_offset);
	
	// blur cache process
	var blur_cache = [];

	for( var i = start_offset ; ( i < image_data.data.length && i < (start_offset + 20000) ) ; i += 4 )
//	for( var i = start_offset ; i < (start_offset + 4) ; i += 4);
	{
		var center_x = (i / 4 ) % image_width;
		// init cache for first process or first line;
		if( i == start_offset || (i / 4) % image_width == 0 )
		{
			blur_cache = [];

			for( var j = 0 ; j < blur_pixel_length ; j += blur_step )
			{
				var cache_i = ( image_width * ( j % blur_width ) + Math.floor( j / blur_width) - blur_pixel_array_offset ) * 4 + (i);
				var x = (cache_i / 4) % image_width;
				var y = Math.round( cache_i / 4 / image_width );
				if( x >= 0 && x >= ( center_x - blur_amount ) && x <= ( center_x + blur_amount ) && y >= 0 && y < image_height)
				{
					var blur_cache_array = [
											real_color("R" , image_data.data[cache_i    ]),
											real_color("G" , image_data.data[cache_i + 1]),
											real_color("B" , image_data.data[cache_i + 2]),
											real_color("A" , image_data.data[cache_i + 3]),
											];

					blur_cache = blur_cache.concat( blur_cache_array );
				}
				else
				{
					var blur_cache_array = [null,null,null,null];
					blur_cache = blur_cache.concat( blur_cache_array );
				}
			}
		}
		else
		{
			var add_blur_cache = [];

			for( var j = (blur_width * (blur_width - 1)) ; j < blur_pixel_length ; j += blur_step )
			{
				var cache_i = ( image_width * ( j % blur_width ) + Math.floor( j / blur_width) - blur_pixel_array_offset ) * 4 + (i);
				var x = (cache_i / 4) % image_width;
				var y = Math.round(cache_i / 4 / image_width);
				if( x >= 0 && x >= ( center_x - blur_amount ) && x <= ( center_x + blur_amount ) && y >= 0 && y < image_height )
				{
					var blur_cache_array = [
											real_color("R" , image_data.data[cache_i    ]),
											real_color("G" , image_data.data[cache_i + 1]),
											real_color("B" , image_data.data[cache_i + 2]),
											real_color("A" , image_data.data[cache_i + 3]),
											];

					add_blur_cache = add_blur_cache.concat( blur_cache_array );
				}
				else
				{
					var blur_cache_array = [null,null,null,null];
					add_blur_cache = add_blur_cache.concat( blur_cache_array );

				}
			}

			blur_cache = blur_cache.splice(blur_width * 4);
			blur_cache = blur_cache.concat(add_blur_cache);
		}

		var average = average_pixel_array(　blur_cache　);

		image_data.data[i]     = index_color ("R" , average[0] );
		image_data.data[i + 1] = index_color ("G" , average[1] );
		image_data.data[i + 2] = index_color ("B" , average[2] );
		image_data.data[i + 3] = index_color ("A" , average[3] );
	}

	ctx_workspace.putImageData(image_data, 0, 0);

	progress( "lens_blur" , i / image_data.data.length );

	if( (start_offset + 20000) >= image_data.data.length )
	{	//	blur_process finished
		finish_blur(image_data);		
		// next job
		//image_blur();
		if(debug)window.console.log('finished blur');
	}
}

function average_pixel_array( array )
{
//	if(debug)window.console.log(array);
	var blur_cache = array;
	
	var amount_R = 0;
	var amount_G = 0;
	var amount_B = 0;
	var amount_A = 0;
	var sample_case = 0;
	var ignor_case = 0;
	
	for(var j = 0 ; j < blur_cache.length ; j += 4)
	{
		if( blur_cache[j] == null )
		{
			ignor_case++;
		}
		else
		{
			sample_case++;
			amount_R += blur_cache[j];
			amount_G += blur_cache[j + 1];
			amount_B += blur_cache[j + 2];
			amount_A +=	blur_cache[j + 3];
		}
	}
	
	var average_R = amount_R / sample_case;
	var average_G = amount_G / sample_case;
	var average_B = amount_B / sample_case;
	var average_A = amount_A / sample_case;
	
	return([average_R,average_G,average_B,average_A]);
}

function finish_blur(  )
{
	if( arguments[0] )
	{
		image_data = arguments[0];
	}
	else
	{
		revert_filter( "blur" , "color" );
		var canvas_output =  document.getElementById("blur_output");
		var ctx_output = canvas_output.getContext("2d");
		image_data = ctx_output.getImageData(0 , 0 , canvas_output.width , canvas_output.height );
	}
	progress( "lens_blur" , 0 );
	innactivate_preview();
	var canvas_workspace_preview = document.getElementById("workspace_preview");
	var ctx_workspace_preview = canvas_workspace_preview.getContext("2d");
	var image_data_preview = ctx_workspace_preview.getImageData(0 , 0 , canvas_workspace_preview.width , canvas_workspace_preview.height );

	var canvas_output =  document.getElementById("blur_output");
	var ctx_output = canvas_output.getContext("2d");
		canvas_output.width = image_data.width;
		canvas_output.height = image_data.height;
		ctx_output.putImageData(image_data, 0, 0);

	var canvas_output_preview =  document.getElementById("blur_output_preview");
	var ctx_output_preview = canvas_output_preview.getContext("2d");
		canvas_output_preview.width = canvas_workspace_preview.width;
		canvas_output_preview.height = canvas_workspace_preview.height;
		ctx_output_preview.putImageData( image_data_preview , 0, 0);

	var preview_canvas = document.getElementById("workspace_preview");
		preview_canvas.style.width = "0px";
		preview_canvas.style.height = "0px";

	var image_export_link = document.getElementById('image_share');
		image_export_link.href = canvas_output.toDataURL("image/png", "exported.png");
		
	removeClass(preview_canvas , 'previewing');
}
