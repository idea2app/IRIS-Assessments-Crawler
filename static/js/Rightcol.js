jQuery(document).ready(function() {
	// Hide the inline content
	jQuery(".hidden-content").css({'display':'none'});
	// Open inlined content in "box"
	jQuery(".colorbox-inline").colorbox({inline:true,width:"800px",height:"600px",scrolling:true});
});
