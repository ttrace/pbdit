function init_pbtweet()
{
	//database initialize
	database_version = "1.0";
	development = "trur";
	init_web_database();

	//window.console.log('initialize');
	// Event dispatch.
	window.addEventListener ( 'resize' , function(){ window_resize() } , true);

	// initialize window size.
	// window resized event
	window_resize();

	// add mutation event on Thumbnail box
	document.getElementById("preview").addEventListener( "DOMNodeInserted" ,
		function(e)
		{
			thumbnail_builder(e);
		}
		, false );
}

function load_image_on_canvas( src )
{
	var workspace_wrapper = document.getElementById('workspace_wrapper');

	var workspace_image = new Image();
		workspace_image.src = src;
		
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

	//scale slider initial set
	var height_ratio_for_slider = workspace_image.height / workspace_wrapper.offsetHeight;
	var width_ratio_for_slider = workspace_image.width / workspace_wrapper.offsetWidth;

	//image initial scaling	
	var slider_scale = Math.min( height_ratio_for_slider , width_ratio_for_slider )
	
	var scale_slider = document.getElementById('scale_slider');
	scale_slider.image_max = slider_scale;
	
	ctx = workspace.getContext('2d');
	ctx.drawImage(workspace_image, 0, 0, workspace.width, workspace.height);
	
	var image_data = ctx.getImageData( 0, 0, workspace_image.width , workspace_image.height);
//	var image_data = ctx.getImageData( 0, 0, 10 , 10);
	load_image_onto_database( image_data );
}

function load_image_onto_database( getImageData )
{
	var image_height = getImageData.height;
	var image_width = getImageData.width;	
	var pixelData = getImageData.data;
	window.console.log('db onsite' , getImageData, image_height, image_width);
	
	var startTime = new Date();
	window.console.log("Import started at ", startTime);

	db.transaction(
		function(tx)
		{
			for( var i = 0 ; i < image_height ; i ++ )
			{
				for( var j = 0 ; j < image_width ; j ++ )
				{
					tx.executeSql( "INSERT INTO PixelData (x , y , R , G, B, A) VALUES (?, ?, ?, ?, ?, ?)" ,
					[j ,
					 i ,
					 pixelData[ j + ( i * image_height )    ] ,
					 pixelData[ j + ( i * image_height ) + 1] ,
					 pixelData[ j + ( i * image_height ) + 2] ,
					 pixelData[ j + ( i * image_height ) + 3] ]
	// 					,function(){},
	// 					function(tx, error){
	// 						window.console.log("error on write data array on database" , error.message)
	// 					}
					);
					
				}
			}
			//var endTime = new Date();
			//window.console.log(  i ,'/',image_height, 'finished import', endTime - startTime);
		})
	
}

function init_web_database(){
	try
	{
		if (window.openDatabase) {
			var dbname = "pbedit_tmp";
			if(development) dbname += "_dev";
			db = openDatabase(dbname, database_version,"database pbedit image datarray",200000);
			if (!db) 
					alert("Some problem occurs. It may your database storage size limitation is too small for this application\nデータベースストレージ用の容量が不足しているなどの問題が発生しました。");
			} else 
			alert("Your browser does not support client-side database storage.");
	}
	catch(error)
	{
		window.console.log(error.message);
	}
	 init_image_temp();
}

function init_image_temp(){
	// creating temp table for image storage
	db.transaction(
		function(tx)
		{
			var exist_table = 0;
			//tx.executeSql(
			//	"SELECT count(x) FROM PixelData LIMIT 1" , [] 
				//function(tx, result)
				//{
				//	tx.executeSql("DROP PixelData",[]);
				//}
			//);
			
			tx.executeSql(
				"CREATE TEMPORARY TABLE PixelData ( x NUMBER, y NUMBER, R NUMBER, G NUMBER, B NUMBER, A NUMBER)" , [], 
				function(tx, result)
				{
					window.console.log('successed to create temporary table');
				},
				function(tx, err)
				{
					window.console.log('Error', err);
				});

			//test for adding data
			// var x = 0;
// 			var y = 0;
// 			var ch = "R";
// 			var pxValue = 1;
// 
// 			tx.executeSql(
// 				"INSERT INTO PixelData (x , y , ch , val) VALUES (? , ? , ? , ?)" ,
// 				[x , y , ch, pxValue],
// 				function(tx, result)
// 				{
// 					window.console.log('successed to add first data');
// 				} ,
// 				function(tx, error)
// 				{
// 					window.console.log("Error" , error.message);
// 				}
// 				);
		}
	);
}

function blur()
{
	var canvas =  document.getElementById("workspace");
	var ctx = canvas.getContext("2d");
	var image_data = ctx.getImageData( 0, 0, canvas.width , canvas.height);

	var R = 0;
	var G = 0;
	var B = 0;

	setTimeout( function(){ preview_process( 100 , image_data) } , 1);
	
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


// loading images
function load_clipboard(event)
{
	var data = event.clipboardData.getData("Text");
	var pasted_container = document.getElementById('preview');
		
	window.console.log('pasted', data, event.clipboardData, event.clipboardData.types );
	if( event.clipboardData.types.every( function(element, index, key){return(element.match(/png/));}) )
	{
		window.console.log('img');
	}
	else if( hasURL(data) && data.match(/.+(png|jpg|gif|tiff)$/) )
	{
		pasted_container.innerHTML = "";
		var thumbnail = document.createElement("img");
		thumbnail.src = hasURL(data);
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
		window.console.log('edited is image', event.target.nodeName);
	if( event.target.nodeName == "IMG")
	{
		setTimeout( function(){load_image_on_canvas( target.src );} , 1 );
	}
}

function pre_paste(event)
{
	document.getElementById("preview").focus();
}
