function init_pbtweet()
{
	development = "true";

	//database initialize
	database_version = "1.0";
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

 	var long_rate = Math.max( workspace_image.width , workspace_image.height ) / 1200;
 	if( long_rate > 1 )
 	{
 		workspace_image.width = parseInt( workspace_image.width / long_rate ) ;
 		workspace_image.height = parseInt( workspace_image.height / long_rate );
 	}
 		workspace.width = workspace_image.width;
 		workspace.height = workspace_image.height;

	fit_scale();
	
	ctx = workspace.getContext('2d');
	ctx.drawImage(workspace_image, 0, 0, workspace.width, workspace.height);
	
	var image_data = ctx.getImageData( 0, 0, workspace_image.width , workspace_image.height);

	init_image_temp();
	load_image_onto_database( image_data );
}

function load_image_onto_database( getImageData )
{
	var image_height = getImageData.height;
	var image_width = getImageData.width;	
	var pixelData = getImageData.data;
	window.console.log('db onsite' , getImageData, image_height, image_width);
	
	var startTime = new Date();
	window.console.log("Import started at ", pixelData);

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
					 pixelData[ ( j + ( i * image_width ) ) * 4    ] / 255 ,
					 pixelData[ ( j + ( i * image_width ) ) * 4 + 1] / 255 ,
					 pixelData[ ( j + ( i * image_width ) ) * 4 + 2] / 255 ,
					 pixelData[ ( j + ( i * image_width ) ) * 4 + 3] / 255]
					);
				}
			}
			var endTime = new Date();
			window.console.log(  i ,'/',image_height, 'finished import', endTime - startTime);
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
	document.first_load = true;
	init_image_temp();
}

function init_image_temp(){
	// creating temp table for image storage
	db.transaction(
		function(tx)
		{
			var exist_table = 0;
			tx.executeSql(
				"SELECT MAX(x), MAX(y) FROM PixelData" , [] ,
				function(tx, result)
				{
					if( document.first_load != true )
					{
						tx.executeSql(
							"DROP TABLE PixelData",
							[],
							function()
							{
								window.console.log('Table removed successfully');
							},
							function(tx, error)
							{
								window.console.log("Error with table removing" , error.message);
							});
						tx.executeSql(
							"CREATE TABLE PixelData ( x NUMBER, y NUMBER, R REAL, G REAL, B REAL, A REAL)" , [], 
							function(tx, result)
							{
								window.console.log('successed to create table');
							},
							function(tx, err)
							{
								window.console.log('Error', err);
							});
					}
					else
					{
						// restore image from database.
						var row = result.rows.item(0);

						var image_width = row['MAX(x)'] + 1;
						var image_height = row['MAX(y)'] + 1;
						
						window.console.log(image_width, image_height)

						var workspace = document.getElementById('workspace');
							workspace.width = image_width;
							workspace.height = image_height;

						fit_scale();
						document.first_load = false;
						//color_evolved_view( [] );
						redraw();
					}
				},
				function( tx, error ) {
					tx.executeSql(
						"CREATE TABLE PixelData ( x NUMBER, y NUMBER, R REAL, G REAL, B REAL, A REAL)" , [], 
						function(tx, result)
						{
							window.console.log('successed to create temporary table');
						},
						function(tx, err)
						{
							window.console.log('Error', err);
						});
				}
			);
		}
	);
}

function color_evolved_view()
{
	db.transaction(
		function(tx){
// 			tx.executeSql(
// 				"SELECT COUNT(x) FROM Filter LIMIT 1",[],
// 				function(tx){},
// 				function(tx, err)
// 				{
// 					tx.executeSql(
// 						"DROP VIEW Filter",[]
// 					);
// 					window.console.log('removed Filter');
// 				}
// 			);
// 
			var mySqlSeed = "CREATE VIEW Filter AS SELECT x, y ,R ,G ,B ,A FROM PixelData";
			var SqlReplace = /R\ \,\G\ \,B\ /;
			var expression = color_expression();
			var expression_str = expression[0] + "," + expression[1] + "," + expression[2] ;
			var exSql = mySqlSeed.replace( SqlReplace , expression_str);
			tx.executeSql(
				exSql,
				[],
				function(tx, result)
				{
					window.console.log( exSql, 'successed to create color Filter');
				},
				function(tx, err)
				{
					window.console.log('Error', err.message);
				});
		}
	);
}

function color_expression()
{
	var R_biass = "R*" + (( document.getElementById("layer_R").value / 50 ) + 1);
	var G_biass = "G*" + (( document.getElementById("layer_G").value / 50 ) + 1);
	var B_biass = "B*" + (( document.getElementById("layer_B").value / 50 ) + 1);
	
	window.console.log([ R_biass ,G_biass ,B_biass ]);
	return([ R_biass ,G_biass ,B_biass ]);
}

function blur()
{
	var canvas =  document.getElementById("workspace");
	var ctx = canvas.getContext("2d");
	var image_data = ctx.getImageData( 0, 0, canvas.width , canvas.height);

	setTimeout( function(){ preview_process( 10 , image_data) } , 1);
	setTimeout( function(){ real_process( image_data) } , 50);

	document.imagedata = image_data;
}

function redraw()
{
//  Sample codes
//	following code is for workers in future when WebKit supports openDatabase inside workers.
/*
// 	window.console.log("redraw start");
// 	var redraw = new Worker("scripts/worker_redraw.js");
// 	redraw.postMessage('go');
// 	window.console.log(redraw.onerror);
// 	redraw.onmessage = function(event)
// 	{
// 		window.console.log(event.data);
// 	};
*/
	color_evolved_view();
	
	db.transaction(
		function(tx)
		{
			var canvas =  document.getElementById("workspace");
			var ctx = canvas.getContext("2d");

			var PixelDataArray = ctx.getImageData(0, 0, canvas.width, canvas.height);

			//var mySqlSeed = "SELECT R ,G ,B ,A FROM Filter";
			var mySqlSeed = "SELECT R ,G ,B ,A FROM PixelData";
//			var SqlReplace = /R\ \,\G\ \,B\ /;
//			var expression = color_expression();
//			var expression_str = '"' + expression[0] + '","' + expression[1] + '","' + expression[2] + '"' ;
//			var exSql = mySqlSeed.replace( SqlReplace , expression_str);

//			window.console.log('get filter', exSql);

			tx.executeSql(
				mySqlSeed,
				[],
				function(tx , result)
				{
					for( var i = 0 ; i < result.rows.length ; i++ )
					{
						var row = result.rows.item(i);
// 						PixelDataArray.data[ i * 4     ] = parseInt(row['"'+expression[0]+'"'] * 255); // R
// 						PixelDataArray.data[ i * 4 + 1 ] = parseInt(row['"'+expression[1]+'"'] * 255); // G
// 						PixelDataArray.data[ i * 4 + 2 ] = parseInt(row['"'+expression[2]+'"'] * 255); // B
// 						PixelDataArray.data[ i * 4 + 3 ] = parseInt(row['A'] * 255); // A
						PixelDataArray.data[ i * 4     ] = parseInt(row['R'] * (( document.getElementById("layer_R").value / 50 ) + 1) * 255); // R
						PixelDataArray.data[ i * 4 + 1 ] = parseInt(row['G'] * (( document.getElementById("layer_G").value / 50 ) + 1) * 255); // G
						PixelDataArray.data[ i * 4 + 2 ] = parseInt(row['B'] * (( document.getElementById("layer_B").value / 50 ) + 1) * 255); // B
						PixelDataArray.data[ i * 4 + 3 ] = parseInt(row['A'] * 255); // A
					}
					window.console.log('Export', PixelDataArray);
					ctx.putImageData(PixelDataArray, 0, 0);
				}
			);
		}
	);
}

function preview_process( scale , image_data )
{
	var canvas =  document.getElementById("workspace");
	var ctx = canvas.getContext("2d");

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
	var canvas =  document.getElementById("workspace");
	var ctx = canvas.getContext("2d");

	for( var i = 0 ; i < (image_data.data.length) ; i ++ )
	{
		image_data.data[i]     = index_color ("R" , real_color( "R" , image_data.data[ i ]    ) * 1.1);
		image_data.data[i + 1] = index_color ("G" , real_color( "G" , image_data.data[ i + 1 ]) * 1.3);
		image_data.data[i + 2] = index_color ("B" , real_color( "B" , image_data.data[ i + 2 ]) * 1.5);
	}
	

	var ctx = canvas.getContext("2d");
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
