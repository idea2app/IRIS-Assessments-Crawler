// JavaScript for A to Z Tabs and dataTable
  jQuery(function(){
    jQuery("#alphalist").dataTable({
      paging: true,
      searching: true,
      ordering: true,
      info: true,
      responsive: true,
      columnDefs: [
       // Assumes column indices 13 and 14 are "Pesticide" and "Archive"
       {"targets": [13, 14], "visible": false}
      ]
    });
    jQuery("#erdlist").dataTable(
    {
      paging: true,
      searching: true,
      ordering: true,
      info: true,
      responsive: true
    });
    jQuery("#archiveList").dataTable(
    {
      paging: true,
      searching: true,
      ordering: true,
      info: true,
      responsive: true
    });
  });

// JavaScript for Tabs

 jQuery(document).ready(function() {
   var currentLink = document.location.href;
   var getEndOfCurrentLink = currentLink.substring(currentLink.indexOf('=') + 1);

   if(getEndOfCurrentLink === 'erd') {
     jQuery('#tabs > div').hide();
     jQuery('#erd').show();
     jQuery('#tabsnav li a[href="#erd"]').parent().addClass('active');
   } else if(getEndOfCurrentLink === 'archive') {
     jQuery('#tabs > div').hide();
     jQuery('#archive').show();
     jQuery('#tabsnav li a[href="#archive"]').parent().addClass('active');
   } else {
     window.history.replaceState({}, document.title, "/" + "AtoZ/?list_type=alpha");
     jQuery('#tabs > div').hide(); // hide all child divs
     jQuery('#tabs div:first').show(); // show first child dive
     jQuery('#tabsnav li:first').addClass('active');
   }

   jQuery('.menu-internal').click(function(){
     //TODO: needs integration for url encoding (decoding)
     var currentTab = jQuery(this).attr('href');
     var referrer = document.referrer;
     if (referrer.indexOf("Events") > -1) {
       window.history.replaceState({}, document.title, "/" + "AtoZ/");
     }
     jQuery('#tabsnav li').removeClass('active');
     if(currentTab === '#alpha'){
       window.location.hash = '?list_type=alpha';
     }
     else if(currentTab === '#erd'){
       window.location.hash = '?list_type=erd';
     }
     else if(currentTab === '#archive'){
       window.location.hash = '?list_type=archive';
     }
     var hash = window.location.hash;
     history.replaceState(hash, null,hash.substring(1));

     jQuery('#tabsnav li a[href="'+currentTab+'"]').parent().addClass('active');
     jQuery('#tabs > div').hide();
     jQuery(currentTab).show();
    return false;
   });
 });
