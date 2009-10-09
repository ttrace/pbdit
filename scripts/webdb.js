function init_web_database()
{
	// raw image processing
	try
	{
		if (window.openDatabase) {
			var dbname = "pbedit";
			if(development) dbname += "_dev";
			db = openDatabase(dbname, database_version,"database pbedit image datarray",200000);
			if (!db) 
					alert("Some problem occurs. It may your database storage size limitation is too small for this application\nデータベースストレージ用の容量が不足しているなどの問題が発生しました。");
			} else 
			alert("Your browser does not support client-side database storage.");
	}
	catch(error)
	{
		if(debug)window.console.log(error.message);
	}
	document.first_load = true;
	init_image_temp();
}

function init_image_temp()
{
	// creating temp table for image storage
	db.transaction(
		function(tx)
		{
			var exist_table = 0;
			tx.executeSql(
				"SELECT date FROM storedimage" , [] ,
				function(tx, result)
				{
					//load image from Database;
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
					redraw_from_database();
				},
				function( tx, error ) {
					tx.executeSql(
						"CREATE TABLE storedimage ( uid TEXT , date TEXT , imageurl TEXT )" , [], 
						function(tx, result)
						{
							if(debug)window.console.log('successed to create temporary table');
						},
						function(tx, err)
						{
							if(debug)window.console.log('Error', err);
						});
				}
			);
		}
	);
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

function redraw_from_database()
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
						PixelDataArray.data[ i * 4     ] = parseInt(row['"'+expression[0]+'"'] * 255); // R
						PixelDataArray.data[ i * 4 + 1 ] = parseInt(row['"'+expression[1]+'"'] * 255); // G
						PixelDataArray.data[ i * 4 + 2 ] = parseInt(row['"'+expression[2]+'"'] * 255); // B
						PixelDataArray.data[ i * 4 + 3 ] = parseInt(row['A'] * 255); // A
// 						PixelDataArray.data[ i * 4     ] = parseInt(row['R'] * (( document.getElementById("layer_R").value / 50 ) + 1) * 255); // R
// 						PixelDataArray.data[ i * 4 + 1 ] = parseInt(row['G'] * (( document.getElementById("layer_G").value / 50 ) + 1) * 255); // G
// 						PixelDataArray.data[ i * 4 + 2 ] = parseInt(row['B'] * (( document.getElementById("layer_B").value / 50 ) + 1) * 255); // B
// 						PixelDataArray.data[ i * 4 + 3 ] = parseInt(row['A'] * 255); // A
					}
					window.console.log('Export', PixelDataArray);
					ctx.putImageData(PixelDataArray, 0, 0);
				}
			);
		}
	);
}

