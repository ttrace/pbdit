onmessage = function( event )
{

	redraw_db.transaction(
		function(tx)
		{
			var pixelData = [];
			tx.executeSql(
				"SELECT R , G , B FROM PixelData where x = 10",
				[],
				function(tx, result)
				{
					window.console.log(result);
				}
			);
		}
	);
	var canvas_code = "TTT";
	postMessage( canvas_code );
}

var redraw_db = openDatabase(dbname, database_version,"database pbedit image datarray",200000);
postMessage('started');
