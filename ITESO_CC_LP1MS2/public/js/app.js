$(document).ready(function() {
  $("#version").html("v0.14");
  
  $("#searchbutton").click( function (e) {
    displayModal();
  });
  
  $("#searchfield").keydown( function (e) {
    if(e.keyCode == 13) {
      displayModal();
    }	
  });
  
  function displayModal() {
    $("#myModal").modal('show');
    $("#status").html("Searching...");
    $("#dialogtitle").html("Search for: "+$("#searchfield").val());
    $("#previous").hide();
    $("#next").hide();
    // Request search to the server.
    $.getJSON('/search/' + $("#searchfield").val() , function(data) {
      renderQueryResults(data);
    });
  }
  // Images to be displayed
  images = [];
  // Index for pagination
  currentIndex = 0;
  $("#next").click( function(e) {
    // Increment current index for pagination.
    currentIndex++;
    let maxImagesToRender = images.length - (currentIndex*4);
    let i;
    // Render images
    for(i = 0; i < maxImagesToRender; i++) {
      $(`#img${i}`).attr("src", images[i + (currentIndex*4)]);
      $(`#img${i}`).show(); 
    }
    // Hide the remaining img elements.
    for(; i <= 3; i++) {
      $(`#img${i}`).hide();
    }

    $("#previous").show();
    if(maxImagesToRender < 4) $(this).hide();
  });
  

  $("#previous").click( function(e) {
    // Decrement current index for pagination.
    currentIndex--;
    for(let i = 0; i < 4; i++) {
      $(`#img${i}`).attr("src", images[i + (currentIndex*4)]);
      $(`#img${i}`).show();
    }
    $("#next").show();
    if(currentIndex == 0) $(this).hide();
  });

  function renderQueryResults(data) {
    // Images to be processed
    images = [];
    if (data.error != undefined) {
      $("#status").html("Error: "+data.error);
    } else {
      // Init current index at 0.
      currentIndex = 0;
      $("#status").html(""+data.num_results+" result(s)");
      let maxImagesToRender = (data.num_results >= 4)? 4: data.num_results;
      let i;
      for(i = 0; i < maxImagesToRender; i++) {
        images = data.results;
        $(`#img${i}`).attr("src", images[i]);
        $(`#img${i}`).show();
      }
      console.log("Current i: ", i);
      // Hide the remaining input elements.
      for(; i <= 3; i++) {
        $(`#img${i}`).hide();
      }
      
      if(data.num_results > 4) {
        $("#next").show();
      }
      
     }
   }
});