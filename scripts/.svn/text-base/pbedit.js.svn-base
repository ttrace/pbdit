function init_pbtweet()
{
	//window.console.log('initialize');
	// Event dispatch.
	window.addEventListener ( 'resize' , function(){ window_resize() } , true);

	// initialize window size.

	// window resized event
		window_resize();

	// workspace Image
	
}

function load_image_from_disk( input_form )
{
	var workspace_wrapper = document.getElementById('workspace_wrapper');

	var workspace_image = new Image();
		workspace_image.src = input_form.value;
		
	var image_layer = new myCanvas();
		image_layer.image = workspace_image;
		
	var workspace = document.getElementById('workspace');
		workspace.width = workspace_image.width;
		workspace.height = workspace_image.height;

	//workspace scaling
	var height_ratio = workspace_wrapper.offsetHeight / workspace_image.height;
	var width_ratio = workspace_wrapper.offsetWidth / workspace_image.width;

	//image initial scaling	
	var workspace_scale = Math.min( height_ratio , width_ratio )
		workspace.style.height = parseInt( workspace_image.height * workspace_scale - 5) + "px";
		workspace.style.width = parseInt( workspace_image.width * workspace_scale -5) + "px";
	//window.console.log(workspace_scale, workspace.offsetWidth, workspace.offsetHeight);

	//scale slider initial set
	var height_ratio_for_slider = workspace_image.height / workspace_wrapper.offsetHeight;
	var width_ratio_for_slider = workspace_image.width / workspace_wrapper.offsetWidth;
	//window.console.log( height_ratio_for_slider , width_ratio_for_slider );

	//image initial scaling	
	var slider_scale = Math.min( height_ratio_for_slider , width_ratio_for_slider )
	//window.console.log( slider_scale , height_ratio_for_slider , width_ratio_for_slider);
	
	var scale_slider = document.getElementById('scale_slider');
	scale_slider.image_max = slider_scale;
	
	ctx = workspace.getContext('2d');
	ctx.drawImage(workspace_image, 0, 0, workspace.width, workspace.height);

}

function window_resize()
{
	var workspace_wrapper = document.getElementById('workspace_wrapper');
	var workspace = document.getElementById('workspace');

	var toolbar = document.getElementById('toolbar');

		workspace_wrapper.style.width = (workspace_wrapper.parentNode.offsetWidth - 20) + 'px';
		workspace_wrapper.style.height = ( document.height - toolbar.offsetHeight - 20) + 'px';

		workspace.style.height = ( workspace_wrapper.offsetHeight - 5 ) + "px";
		workspace.style.width = ( workspace_wrapper.offsetWidth - 5 )+ "px";

	return( false );
}

function slider_initialize()
{

}

function image_scale(scale_slider)
{
	var scale_ratio = scale_slider.value;
	var workspace = document.getElementById('workspace');
	
		workspace.style.webkitTransform = "scale(" + scale_ratio + ")";
}

function blur()
{
	var canvas =  document.getElementById("workspace");
	var ctx = canvas.getContext("2d");
	var image_data = ctx.getImageData( 0, 0, canvas.width , canvas.height);

//	var image_data = ctx.getImageData( 0, 0, 10 , 10);
// 	var imagejson = new JSON(image_data);
// 	imagejson_string = JSONEncode(image_data);
// 	window.console.log('got image data' , imagejson_string);
	
	var R = 0;
	var G = 0;
	var B = 0;

	setTimeout( function(){ preview_process( 100 , image_data) } , 1);
//	setTimeout( function(){ preview_process( 30 , image_data) } , 500);
	
// 	var blur_proc_1 = new Worker("./scripts/blur.js");
// 	blur_proc_1.postMessage( image_data );
// 	blur_proc_1.onmessage = function( event )
// 	{
// 		ctx.putImageData( event.data , 0, 0);
// 	}
	
	setTimeout( function(){ real_process( image_data) } , 500);

	document.imagedata = image_data;
}

function preview_process( scale , image_data )
{
	var preArray = new Array();
	var preR = 0;
	var preG = 0;
	var preB = 0;

	for( var xi = 0 ; xi < (image_data.width / scale) ; xi ++)
	{
		for( var yi = 0 ; yi < (image_data.height / scale) ; yi ++)
		{
			preArray = get_pixel_collor_array( (xi * scale), (yi * scale) , image_data );
			preR = preArray[0];
			preG = preArray[1];
			preB = preArray[2];
			ctx.fillStyle = "rgb(" + preR + " , " + preG + " , " + preB + ")";
			ctx.fillRect ( (xi * scale), (yi * scale), scale, scale);
		}
	}
}

function real_process( image_data )
{
	for( var i = 0 ; i < (image_data.data.length) ; i ++ )
	{
		image_data.data[i]     = index_color ("R" , real_color( "R" , image_data.data[ i ]    ) * 1.1);
		image_data.data[i + 1] = index_color ("G" , real_color( "G" , image_data.data[ i + 1 ]) * 1.3);
		image_data.data[i + 2] = index_color ("B" , real_color( "B" , image_data.data[ i + 2 ]) * 1.5);
	}
	ctx.putImageData(image_data, 0, 0);
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
