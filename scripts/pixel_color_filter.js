// color convolution
function color_expression()
{
	var L_biass = ( document.getElementById("exposure").value / 100 ) + 1;
	var C_biass = ( document.getElementById("contrast").value / 100 ) + 1;

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
			R = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( R - 0.5 )+0.5;

		var G = index_color ("G" , real_color( "G" , preview_image_data.data[ i + 1 ]) * color_biass[1] );
			G = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( G - 0.5 )+0.5;
		
		var B = index_color ("B" , real_color( "B" , preview_image_data.data[ i + 2 ]) * color_biass[2] );
			B = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( B - 0.5 )+0.5;

		preview_image_data.data[i]     = R;
		preview_image_data.data[i + 1] = G;
		preview_image_data.data[i + 2] = B;
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

		var R = index_color ("R" , real_color( "R" , image_data.data[ i     ]) * color_biass[0] );
//			R = R / 255;	
			R = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( R - 0.5 )+0.5;

		var G = index_color ("G" , real_color( "G" , image_data.data[ i + 1 ]) * color_biass[1] );
//			G = G / 255;			
			G = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( G - 0.5 )+0.5;
		
		var B = index_color ("B" , real_color( "B" , image_data.data[ i + 2 ]) * color_biass[2] );
//			B = B / 255;			
			B = Math.tan( color_biass[3] * 45 * Math.PI / 180) * ( B - 0.5 )+0.5;

//		image_data.data[i    ] = R * 255;
//		image_data.data[i + 1] = G * 255;
//		image_data.data[i + 2] = B * 255;
		image_data.data[i    ] = R;
		image_data.data[i + 1] = G;
		image_data.data[i + 2] = B;

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
