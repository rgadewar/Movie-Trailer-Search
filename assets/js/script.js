var API_KEY = "k_3rwfrpt2";
var castsView = $(".castsCard");
var awardView = $(".awardsCard");
var awardDescView = $(".awardsDesc");
var movieRatingsView = $(".movieRatings");
var posterCardView = $(".posterCard");
var trailerView = $(".card-content-trailer");
var rowCards = $("#demo-carousel");
var lastSearchButtonEl = $("#last-search-button");
var searchButtonEl = $("#search-button");
var clearButtonEl = $("#clear-button");
var YOUTUBE_API_KEY = "AIzaSyBwFTI7Sa51Mo1ATzAgIH1hPXYIED0YUzg";
var imdbApiURL = "https://imdb-api.com/en/API/";
var carouselContainer = $(".carousel"); // Assuming you have a Slick carousel with class 'carousel'
var loadingIconEl = $("#loading-icon");
var movieInputEl = $("#movie");
var buttonList = $("#buttonsList");
var submit = document.getElementById("search-button");
var last_Search = JSON.parse(localStorage.getItem("Last Search"));
// var movieArray = [];
var storedData = localStorage.getItem("Movie");

var movieArray = []; // Set a default value

if (storedData !== null) {
  movieArray = JSON.parse(storedData);
}

$(document).ready(function () {
  // Calling clear results on clear-button click
  $("#clear-button").on("click",clearResults);
  // Displaying last few searches
  lastSearch();

  $("#last-search-button").on("click", function (event) {
    event.preventDefault();
    var movieTitle = last_Search.Title;
    movieCastSearch(movieTitle);
    moviePoster(movieTitle);
    movieAwards(movieTitle);
    movieRatings(movieTitle);
    searchVideos(movieTitle);
  });

// serach button event, which calls all other functions
  searchButtonEl.on("click", function (event) {
    event.preventDefault();
    if (movieInputEl.val() === "") {
      return;
    } else {
      // All search button clear prevoius images
      carouselContainer.slick("removeSlide", null, null, true);
       // Clear the results from all card content
      castsView.empty();
      awardView.empty();
      movieRatingsView.empty();
      awardDescView.empty();
      posterCardView.empty();
      trailerView.empty();
      var userInput = movieInputEl.val().trim().toLowerCase();
      movieTitleSearch(userInput);
      moviePoster(userInput);
      movieCastSearch(userInput);
      movieAwards(userInput);
      movieRatings(userInput);
      // Refresh the carousel
      carouselContainer.slick("refresh");
      movieInputEl.val("");
    }
  });
// This functions get movie details and store in local storage for retrieving last seraches
  function movieTitleSearch(userInput) {
    let movieURL = imdbApiURL + "SearchMovie/" + API_KEY + "/" + userInput;
    // This is the API call from imdb Movie ID
    $.ajax({
      url: movieURL,
      method: "GET",
    }).then(function (res) {
      // console.log(res);
      //   console.log(res.results[0]);
      // console.log("id " + res.results[0].id);
      var id = res.results[0].id;
      var expression = res.results[0].expression;
      // Save movie id and title in local storage
      var searchInfo = {
        Title: res.expression,
        MovieID: id,
      };
      localStorage.setItem("Last Search", JSON.stringify(searchInfo));
      // Sending Movie title to storeData to avoid dupliocates
      storeData(res.expression);
    }).catch(function () {
      console.log("Error searching for the movie.");
    });
  }
});
// This function makes api call to IMDB database to get movie id and then one more AJAX call for casts
function movieCastSearch(userInput) {
  castsView.empty();
  let movieURL = imdbApiURL + "SearchMovie/" + API_KEY + "/" + userInput;
  
  // This is the API call to retrieve the movie ID from IMDB
  $.ajax({
    url: movieURL,
    method: "GET",
  }).then(function (res) {
    var movieId = res.results[0].id;
    let movieCastsURL = imdbApiURL + "FullCast/" + API_KEY + "/" + movieId;
    
    // This is the API call to retrieve the cast details for the movie
    $.ajax({
      url: movieCastsURL,
      method: "GET",
      success: function (res) {
        for (var i = 0; i < 10; i++) {
          var listItem = document.createElement("li");
          var details = document.createTextNode(res.actors[i].name);
          listItem.append(details);
          castsView.append(listItem);
          lastSearch();
        }
      },
      error: function () {
        console.log("Error fetching movie casts.");
        loadingIconEl.hide();
      },
    });
  }).catch(function () {
    console.log("Error searching for the movie.");
    loadingIconEl.hide();
  });
}


// This function makes api call to IMDB database to get movie id and then one more AJAX call for movie posters and create image caraousel
function moviePoster(userInput) {
  carouselContainer.empty();
  // Show loading icon
  loadingIconEl.css("background-color", "transparent").show();
  let movieURL = imdbApiURL + "SearchMovie/" + API_KEY + "/" + userInput;

  $.ajax({
    url: movieURL,
    method: "GET",
  }).then(function (res) {
    var movieId = res.results[0].id;
    let movieURL = imdbApiURL + "Posters/" + API_KEY + "/" + movieId;

    $.ajax({
      url: movieURL,
      headers: {
        Authorization: API_KEY,
      },
      beforeSend: function () {
        // Show loading icon
        loadingIconEl.css("background-color", "transparent").show();
      },
      success: function (data) {
        // console.log(data);
        var posters = data.posters;
        // console.log(posters);
        // var carouselContainer = $(".carousel");

        carouselContainer.empty(); // Clear existing carousel content
        // var cardHeight = 15; 
        // $(".carousel").css("height", cardHeight + "%");

        // Unslick the carousel if it's already initialized
        if (carouselContainer.hasClass("slick-initialized")) {
          carouselContainer.slick("unslick");
        }

        // Check if there are posters available
        if (posters.length > 0) {
          // Iterate through the posters and create carousel slides
          posters.slice(0, 20).forEach(function (poster) {
            var imageUrl = poster.link;
            // console.log(imageUrl);
            var imageElement = $("<img>").attr("src", imageUrl);
            carouselContainer.append(imageElement);
          });

          // Reinitialize the carousel
          carouselContainer.slick({
            autoplay: true,
            autoplaySpeed: 6000, // Set a higher value to increase the delay
            dots: true,
            infinite: true,
            speed: 500, // Transition speed between slides (in milliseconds)
            slidesToShow: 1,
            slidesToScroll: 1,
          });

          // Previous button event handler
          $(".prev-button").on("click", function () {
            carouselContainer.slick("slickPrev");
          });

          // Next button event handler
          $(".next-button").on("click", function () {
            carouselContainer.slick("slickNext");
          });
        } else {
          // Clear previous results
          carouselContainer.empty();
        }
        // Hide loading icon
        loadingIconEl.hide();
      },

      error: function () {
        console.log("Error fetching movie posters.");
        // Hide loading icon in case of an error
        loadingIconEl.hide();
      },
    });
  });
}

// This function makes api call to IMDB database to get movie id and then one more AJAX call for Award 
function movieAwards(userInput) {
  awardView.empty();
  let movieURL = imdbApiURL + "SearchMovie/" + API_KEY + "/" + userInput;

  // This is the API call to retrieve the movie ID from IMDB
  $.ajax({
    url: movieURL,
    method: "GET",
  }).then(function (res) {
    var movieId = res.results[0].id;
    let movieAwardsURL = imdbApiURL + "Awards/" + API_KEY + "/" + movieId;
    
    // This is the API call to retrieve the movie awards
    $.ajax({
      url: movieAwardsURL,
      method: "GET",
      success: function (res) {
        awardDescView.text("Awards: " + res.description);
        if (res.items) {
          for (var i = 0; i < 5; i++) {
            var listItem = document.createElement("li");
            var details = document.createTextNode(res.items[i].eventTitle);
            listItem.appendChild(details);
            awardView.append(listItem);
          }
        }
      },
      error: function () {
        console.log("Error fetching movie awards.");
      },
    });
  }).catch(function () {
    console.log("Error searching for the movie.");
  });
}


// This function makes api call to IMDB database to get movie id and then one more AJAX call for Ratings
function movieRatings(userInput) {
  awardView.empty();
  let movieURL = imdbApiURL + "SearchMovie/" + API_KEY + "/" + userInput;

  // This is the API call to retrieve the movie ID from IMDB
  $.ajax({
    url: movieURL,
    method: "GET",
  }).then(function (res) {
    var movieId = res.results[0].id;
    let movieRatingsURL = imdbApiURL + "Ratings/" + API_KEY + "/" + movieId;
    
    // This is the API call to retrieve the movie ratings
    $.ajax({
      url: movieRatingsURL,
      method: "GET",
      success: function (res) {
        if (res.imDb) {
          movieRatingsView.text("Ratings: " + res.imDb);
        }
      },
      error: function () {
        console.log("Error fetching movie ratings.");
      },
    });
  }).catch(function () {
    console.log("Error searching for the movie.");
  });
}


// This function makes api call to google api to get movie videos
function searchVideos(movieTitle) {
  var $carousel = $(".card-content-trailer");

  $carousel.empty();

  var searchQuery = $("#movie").val();
  var keyword = "movie";
  var requestUrl;

  if (searchQuery) {
    requestUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&part=snippet&maxResults=20&q=${searchQuery}+${keyword}`;
  } else {
    requestUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&part=snippet&maxResults=20&q=${movieTitle}+${keyword}`;
  }

  $.ajax({
    url: requestUrl,
    method: "GET",
  }).then(function (data) {
    var videoItems = data.items.slice(0, 4);

    // Create a new carousel clone
    var $newCarousel = $carousel.clone();

    videoItems.forEach(function (video) {
      var videoId = video.id.videoId;
      var videoUrl = `https://www.youtube.com/embed/${videoId}`;
      var iframe = $("<iframe>")
        .attr("width", "315")
        .attr("height", "200")
        .attr("src", videoUrl)
        .attr("frameborder", "0")
        .attr("allowfullscreen", true);
      var listItem = $("<a>").append(iframe);
      $newCarousel.append(listItem);
    });

    // Replace the original carousel with the new clone
    $carousel.replaceWith($newCarousel);

    // Initialize the carousel on the new clone
    $newCarousel.slick({
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 3000,
      dots: true,
    });
  });

  $("#clear-button").on("click", function () {
    $('.castsCard').empty();
    $('.awardsCard').empty();
    $('.posterCard').empty();
    $carousel.empty();
    location.reload();
  });
}


function lastSearch() {
  buttonList.empty();

  // Add the heading element
  var heading = $("<h4>").text("Last few searches:").css({
    "background-color": "transparent",
    color: "white",
    "margin-bottom": "10px", // Add margin-bottom for new line
  });
  buttonList.prepend(heading);

  for (var i = 0; i < Math.min(10, movieArray.length); i++) {
    var newButton = $("<button>")
      .attr("type", "button")
      .addClass("savedBtn btn btn-secondary btn-lg")
      .text(movieArray[i])
      .attr("data-name", movieArray[i])
      .css({
        "background-color": "#ff0800",
        "margin-right": "15px", // Adjust the margin value as needed
        "margin-bottom": "10px",
      });

    buttonList.append(newButton);
  }
  $(".savedBtn").on("click", function (event) {
    event.preventDefault();
    var userInput = $(this).data("name");
    movieCastSearch(userInput);
    moviePoster(userInput);
    movieAwards(userInput);
    movieRatings(userInput);
    searchVideos(userInput);
  });

}

function storeData(movieInput) {
  var foundMovie = false;

  if (movieArray != null) {
    $(movieArray).each(function (x) {
      if (movieArray[x] === movieInput) {
        foundMovie = true;
      }
    });
  }

  if (foundMovie === false) {
    movieArray.push(movieInput);
  }
  localStorage.setItem("Movie", JSON.stringify(movieArray));
}

function clearResults() {
  console.log("Clearing results...");

  // Clear the results from all card content
  castsView.empty();
  awardView.empty();
  ratingsView.empty();
  movieRatingsView.empty();
  awardDescView.empty();
  posterCardView.empty();
  trailerView.empty();

  // Unslick the carousel if it's already initialized
  if (carouselContainer.hasClass("slick-initialized")) {
    console.log("Unslicking carousel...");
    carouselContainer.slick("unslick");
  }

  // Remove all slides from the carousel
  console.log("Removing carousel slides...");
  carouselContainer.slick("removeSlide", null, null, true);

  // Reload the page to reset the carousel
  console.log("Reloading page...");
  location.reload();
}
// Declare the carousel container
var carouselContainer = $("#carousel");
// Initialize the carousel
carouselContainer.slick({
  dots: true,
  infinite: true,
  speed: 100,
  slidesToShow: 1,
  slidesToScroll: 1,
});

function showLoadingIcon() {
  $("#loading-icon").show();
}

function hideLoadingIcon() {
  $("#loading-icon").hide();
}

function performMovieSearch(userInput) {
  showLoadingIcon();

  movieTitleSearch(userInput);
  moviePoster(userInput);
  movieCastSearch(userInput);
  movieAwards(userInput);
  movieRatings(userInput);

  // Hide the loading icon once all functions are completed
  hideLoadingIcon();
}

