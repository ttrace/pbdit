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
			blur_timer = setInterval( function(){ blur_process_startar( current_key ) } , 25);
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
		document.blur_progress += 10000;
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

	var blur_ammount = blur_expression();
	var preview_blur_pixel = parseInt( blur_ammount * preview_scale );
	
	if( preview_blur_pixel > 0)
	{
		if(debug)window.console.log('preview_blur_started:', image_data_input_preview.width, " scale: ",preview_scale, blur_ammount , preview_blur_pixel);
	
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

	if( start_offset == 0)
	{
		var initial_canvas =  document.getElementById("color_output");
		var initial_ctx = initial_canvas.getContext("2d");	
		var image_data = initial_ctx.getImageData( 0, 0, canvas_workspace.width , canvas_workspace.height);
	}

	var blur_ammount = parseInt( blur_expression() );
//	var blur_width = blur_ammount * 2 + 1;

	if(debug)window.console.log('progress' , start_offset,"/", image_data.data.length,'blur pixel', blur_ammount);
	
// 	var pre_R_Array = [];
// 	var pre_G_Array = [];
// 	var pre_B_Array = [];
// 	var pre_A_Array = [];
// 
// 	for( var i = start_offset ; ( i < image_data.data.length && i < (start_offset + 20000) ) ; i += 4 )
// 	{
// 		if( i % image_data.width == 0)
// 		{
// 			for( var yi = blur_ammount * -1 ; yi <= blur_ammount ; yi++ )
// 			{
// 				var y = parseInt(( i / 4 ) / image_data.width) + yi;
// 				if( y >= 0 && y < image_data.height )
// 				{
// 					for( var xi = blur_ammount * -1 ; xi <= blur_ammount ; xi++)
// 					{
// 						var x = ( i / 4 ) % image_data.width + xi;
// 						if( x >= 0 && x < image_data.width )
// 						{
// 							pre_R_Array.push( real_color("R" , image_data.data[(i + ((xi + yi * image_data.width) * 4))    ] ));
// 							pre_G_Array.push( real_color("G" , image_data.data[(i + ((xi + yi * image_data.width) * 4)) + 1] ));
// 							pre_B_Array.push( real_color("B" , image_data.data[(i + ((xi + yi * image_data.width) * 4)) + 2] ));
// 							pre_A_Array.push( real_color("A" , image_data.data[(i + ((xi + yi * image_data.width) * 4)) + 3] ));
// 						}
// 						else
// 						{
// 							pre_R_Array.push(null);
// 							pre_G_Array.push(null);
// 							pre_B_Array.push(null);
// 							pre_A_Array.push(null);
// 						}
// 					}
// 				}
// 			}
// 		}
// 		else
// 		{
// 			for( var yi = 0 ; yi < blur_width ; yi++ )
// 			{
// 				pre_R_Array.splice(((yi + 1) * blur_width) , 1, ( real_color("R" , image_data.data[(i + ((blur_width + yi * image_data.width) * 4))    ])));
// 				pre_R_Array.splice((yi * blur_width) , 1);
// 				
// 				pre_G_Array.splice(((yi + 1) * blur_width) , 1, ( real_color("G" , image_data.data[(i + ((blur_width + yi * image_data.width) * 4)) + 1])));
// 				pre_G_Array.splice((yi * blur_width) , 1);
// 				
// 				pre_B_Array.splice(((yi + 1) * blur_width) , 1, ( real_color("B" , image_data.data[(i + ((blur_width + yi * image_data.width) * 4)) + 2])));
// 				pre_B_Array.splice((yi * blur_width) , 1);
// 				
// 				pre_A_Array.splice(((yi + 1) * blur_width) , 1, ( real_color("A" , image_data.data[(i + ((blur_width + yi * image_data.width) * 4)) + 3])));
// 				pre_A_Array.splice((yi * blur_width) , 1);
// 			}
// 		}
// 		
// 		var amount_R = 0;
// 		var amount_G = 0;
// 		var amount_B = 0;
// 		var amount_A = 0;
// 		var sample_case = 0;
// 		var ignor_case = 0;
// 
// 		for(var j in pre_R_Array)
// 		{
// 			if( pre_R_Array[j] == null )
// 			{
// 				ignor_case++;
// 			}
// 			else
// 			{
// 				sample_case++;
// 				amount_R += pre_R_Array[j];
// 				amount_G += pre_G_Array[j];
// 				amount_B += pre_B_Array[j];
// 				amount_A +=	pre_A_Array[j];		
// 			}
// 		}
// 
// 		image_data.data[i]     = index_color ("R" , amount_R / sample_case );
// 		image_data.data[i + 1] = index_color ("G" , amount_G / sample_case );
// 		image_data.data[i + 2] = index_color ("B" , amount_B / sample_case );
// 		image_data.data[i + 3] = index_color ("A" , amount_A / sample_case );
// 	}
	
	for( var i = start_offset ; ( i < image_data.data.length && i < (start_offset + 10000) ) ; i += 4 )
	{
		var amount_R = 0;
		var amount_G = 0;
		var amount_B = 0;
		var amount_A = 0;
		var sample_case = 0;
		var ignor_case = 0;

		for( var yi = blur_ammount * -1 ; yi <= blur_ammount ; yi++ )
		{
			var y = parseInt(( i / 4 ) / image_data.width) + yi;
			if( y >= 0 && y < image_data.height )
			{
				for( var xi = blur_ammount * -1 ; xi <= blur_ammount ; xi++)
				{
					var x = ( i / 4 ) % image_data.width + xi;
					if( x >= 0 && x < image_data.width )
					{
						amount_R += real_color("R" , image_data.data[(i + ((xi + yi * image_data.width) * 4))    ] );
						amount_G += real_color("G" , image_data.data[(i + ((xi + yi * image_data.width) * 4)) + 1] );
						amount_B += real_color("B" , image_data.data[(i + ((xi + yi * image_data.width) * 4)) + 2] );
						amount_A += real_color("A" , image_data.data[(i + ((xi + yi * image_data.width) * 4)) + 3] );
						sample_case++
					}
					else
					{
						ignor_case++ ;
					}
				}
			}
		}
		image_data.data[i]     = index_color ("R" , amount_R / sample_case );
		image_data.data[i + 1] = index_color ("G" , amount_G / sample_case );
		image_data.data[i + 2] = index_color ("B" , amount_B / sample_case );
		image_data.data[i + 3] = index_color ("A" , amount_A / sample_case );
	}
	
	ctx_workspace.putImageData(image_data, 0, 0);

	progress( "lens_blur" , i / image_data.data.length );

	if( (start_offset + 10000) > image_data.data.length )
	{	//	blur_process finished
		finish_blur(image_data);		
		// next job
		//image_blur();
	}
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

// color convolution
function color_expression()
{
	var L_biass = ( document.getElementById("exposure").value / 50 ) + 1;
	var C_biass = ( document.getElementById("contrast").value / 50 ) + 1;

	var R_biass = ( document.getElementById("layer_R").value / 50 ) + 1;
		R_biass *= L_biass;
	var G_biass = ( document.getElementById("layer_G").value / 50 ) + 1;
		G_biass *= L_biass;
	var B_biass = ( document.getElementById("layer_B").value / 50 ) + 1;
		B_biass *= L_biass;
	return([ R_biass , G_biass , B_biass , C_biass ]);
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
	activate_preview();
	
	var preview_canvas = document.getElementById("workspace_preview");
	var preview_ctx = preview_canvas.getContext("2d");

	var color_biass = color_expression();
	window.console.log("gamma",color_biass[3]);

	for( var i = 0 ; i < (preview_image_data.data.length) ; i += 4 )
	{
		var R = index_color ("R" , real_color( "R" , preview_image_data.data[ i ]    ) * color_biass[0] );
			R = R / 255;	
			R = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( R - 0.5 )+0.5;

		var G = index_color ("G" , real_color( "G" , preview_image_data.data[ i + 1 ]) * color_biass[1] );
			G = G / 255;			
			G = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( G - 0.5 )+0.5;
		
		var B = index_color ("B" , real_color( "B" , preview_image_data.data[ i + 2 ]) * color_biass[2] );
			B = B / 255;			
			B = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( B - 0.5 )+0.5;

		preview_image_data.data[i]     = R * 255;
		preview_image_data.data[i + 1] = G * 255;
		preview_image_data.data[i + 2] = B * 255;
	}
	
	preview_ctx.putImageData(preview_image_data, 0, 0);

	// next preview pipeline
	//setTimeout( function(){image_blur( 'preview' )} , 100 );
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

		var R = index_color ("R" , real_color( "R" , image_data.data[ i ]    ) * color_biass[0] );
			R = R / 255;	
			R = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( R - 0.5 )+0.5;

		var G = index_color ("G" , real_color( "G" , image_data.data[ i + 1 ]) * color_biass[1] );
			G = G / 255;			
			G = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( G - 0.5 )+0.5;
		
		var B = index_color ("B" , real_color( "B" , image_data.data[ i + 2 ]) * color_biass[2] );
			B = B / 255;			
			B = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( B - 0.5 )+0.5;

		image_data.data[i]     = R * 255;
		image_data.data[i + 1] = G * 255;
		image_data.data[i + 2] = B * 255;

//		image_data.data[i]     = index_color ("R" , real_color( "R" , image_data.data[ i ]    ) * color_biass[0] );
//		image_data.data[i + 1] = index_color ("G" , real_color( "G" , image_data.data[ i + 1 ]) * color_biass[1] );
//		image_data.data[i + 2] = index_color ("B" , real_color( "B" , image_data.data[ i + 2 ]) * color_biass[2] );
	}
	
	ctx.putImageData(image_data, 0, 0);

	progress( "color_edit" , i / image_data.data.length );

	if( (start_offset + 1000000) > image_data.data.length )
	{	//	color_process finished
		progress( "color_edit" , 0 );
		innactivate_preview();
		var canvas_workspace_preview = document.getElementById("workspace_preview");
		var ctx_workspace_preview = canvas_workspace_preview.getContext("2d");
		var image_data_preview = ctx_workspace_preview.getImageData(0 , 0 , canvas_workspace_preview.width , canvas_workspace_preview.height );

		var canvas_output =  document.getElementById("color_output");
		var ctx_output = canvas_output.getContext("2d");
			canvas_output.width = image_data.width;
			canvas_output.height = image_data.height;
			ctx_output.putImageData(image_data, 0, 0);

		var canvas_output_preview =  document.getElementById("color_output_preview");
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
		
		// next job
		image_blur();
	}
}

function progress( target_filter , progress )
{
	var progress_bar = document.getElementById( target_filter ).getElementsByClassName('bar')[0];
	if( progress <= 0.1 )
	{
		progress = 0.1;
	}
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
