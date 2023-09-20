// JavaScript for A to Z Tabs and dataTable
  jQuery(function(){
    jQuery('table.display1').dataTable( //datatable for page contains multiple datatables to prevent ID conflict display1 hide search and pages etc..
      {
        paging: false,
        searching: false,
        ordering: true,
        info: false,
        responsive: true
      });
      jQuery('table.display2').dataTable( //datatable for page contains multiple datatables to prevent ID conflict display2 show search and pages etc..
        {
          paging: true,
          searching: true,
          ordering: true,
          info: true,
          responsive: true
        });
  });
  //javaScript for multitable in a page
 //jQuery(document).ready(function() {
  //  jQuery('table.display1').DataTable()
 //}

// JavaScript for Tabs
jQuery(document).ready(function() {
   jQuery('#tabs > div').hide(); // hide all child divs
   jQuery('#tabs div:first').show(); // show first child div
   jQuery('#tabsnav li:first').addClass('active');

   jQuery('.menu-internal').add('#status-li').click(function(){
     jQuery('#tabsnav li').removeClass('active');
     var currentTab = jQuery(this).attr('href');
     jQuery('#tabsnav li a[href="'+currentTab+'"]').parent().addClass('active');
     jQuery('#tabs > div').hide();
     jQuery(currentTab).show();
    return false;
   });

   jQuery('.menu-internal').add('#history-li').click(function(){
      jQuery('#tabsnav li').removeClass('active');
      var currentTab = jQuery(this).attr('href');
      jQuery('#tabsnav li a[href="'+currentTab+'"]').parent().addClass('active');
      jQuery('#tabs > div').hide();
      jQuery(currentTab).show();
      return false;
   });
 });
