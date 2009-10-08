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
	if( scale_slider.value != 0)
	{
		var scale_ratio = scale_slider.value;
	}
	else
	{
		fit_scale();	
	}
	var workspace = document.getElementById('workspace');
	var current_scale = workspace.width
		workspace.style.width = (scale_ratio * workspace.width) + "px";
		workspace.style.height = (scale_ratio * workspace.height) + "px";
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

	window.console.log('scale' , workspace_scale, height_ratio, width_ratio);
	return(true);
}
