function window_resize()
{
	var workspace_wrapper = document.getElementById('workspace_wrapper');
	var workspace = document.getElementById('workspace');

	var toolbar = document.getElementById('toolbar');

		workspace_wrapper.style.width = (workspace_wrapper.parentNode.offsetWidth - 200 - 20) + 'px';
		workspace_wrapper.style.height = ( document.height - toolbar.offsetHeight - 20) + 'px';

		workspace.style.height = ( workspace_wrapper.offsetHeight - 5 ) + "px";
		workspace.style.width = ( workspace_wrapper.offsetWidth - 200 - 5 )+ "px";

	return( false );
}

function slider_initialize()
{

}

function image_scale(scale_slider)
{
	var scale_ratio = scale_slider.value;
	var workspace = document.getElementById('workspace');
	var current_scale = workspace.width
		workspace.style.webkitTransform = "scale(" + scale_ratio + ")";
}
