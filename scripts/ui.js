function window_resize()
{
	var workspace_wrapper = document.getElementById('workspace_wrapper');
	var workspace = document.getElementById('workspace');

	var toolbar = document.getElementById('toolbar');

		workspace_wrapper.style.width = (workspace_wrapper.parentNode.offsetWidth - 200 - 20) + 'px';
		workspace_wrapper.style.height = ( document.height - toolbar.offsetHeight - 20) + 'px';

//		workspace.style.height = ( workspace_wrapper.offsetHeight - 5 ) + "px";
//		workspace.style.width = ( workspace_wrapper.offsetWidth - 200 - 5 )+ "px";

	return( false );
}

function image_scale(scale_slider)
{
	var workspace = document.getElementById('workspace');

	if( scale_slider.value != 0)
	{
		var scale_ratio = scale_slider.value / 5 + 0.5;
	}
	else
	{
		fit_scale();	
	}
	var current_scale = workspace.width
		workspace.style.width = (scale_ratio * workspace.width) + "px";
		workspace.style.height = (scale_ratio * workspace.height) + "px";

// 	var workspace_wrapper = document.getElementById('workspace_wrapper');
// 	var ws_o_height = workspace_wrapper.offsetHeight;
// 	var ws_o_width = workspace_wrapper.offsetWidth;
// 	var ws_height = workspace.offsetHeight;
// 	var ws_width = workspace.offsetWidth;
// 	
// 	var target_y = (ws_height - ws_o_height) / 2;
// 	var target_x = (ws_width - ws_o_width) / 2;
// 	if(debug)window.console.log('scroll to' , target_x , target_y);
// 	workspace_wrapper.scrollLeft = (scale_ratio * workspace.width) / 2 - ws_o_width / 2;
// 	workspace_wrapper.scrollTop = (scale_ratio * workspace.height) / 2 -  ws_o_height / 2;
}

function activate_preview()
{
	var canvas_workspace_preview = document.getElementById("workspace_preview");
		canvas_workspace_preview.style.height = workspace.offsetHeight + "px";
		canvas_workspace_preview.style.width = workspace.offsetWidth + "px";
		canvas_workspace_preview.style.top = workspace.offsetTop + "px";
		canvas_workspace_preview.style.left = workspace.offsetLeft + "px";
	addClass(canvas_workspace_preview , 'previewing');
}

function innactivate_preview()
{
		var canvas_workspace_preview = document.getElementById("workspace_preview");
			canvas_workspace_preview.style.width = "0px";
			canvas_workspace_preview.style.height = "0px";
}

function fit_scale()
{
	var workspace_wrapper = document.getElementById('workspace_wrapper');
	var workspace = document.getElementById('workspace');

	var height_ratio = workspace.height / workspace_wrapper.offsetHeight;
	var width_ratio  = workspace.width  / workspace_wrapper.offsetWidth;

	var workspace_scale = 1 / Math.max( height_ratio , width_ratio );
		workspace.style.height = parseInt( workspace.height * workspace_scale - 5) + "px";
		workspace.style.width = parseInt( workspace.width * workspace_scale -5) + "px";
	
	var scale_slider = document.getElementById('scale_slider');
		scale_slider.value = workspace_scale / 1;

	if(debug)window.console.log('scale' , workspace_scale, height_ratio, width_ratio);
	return(true);
}
