//function real_process( image_data )
onmessage = function( event )
{
	var image_data = event.data;
	for( var i = 0 ; i < (image_data.data.length) ; i ++ )
	{
		image_data.data[i]     = index_color ("R" , real_color( "R" , image_data.data[ i ]    ) * 1.1);
		image_data.data[i + 1] = index_color ("G" , real_color( "G" , image_data.data[ i + 1 ]) * 1.3);
		image_data.data[i + 2] = index_color ("B" , real_color( "B" , image_data.data[ i + 2 ]) * 1.5);
	}

	postMessage( image_data )
//	ctx.putImageData(image_data, 0, 0);
}
