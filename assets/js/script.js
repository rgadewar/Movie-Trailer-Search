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
var carouselContainer = $('.carousel');  // Assuming you have a Slick carousel with class 'carousel'
var loadingIconEl = $("#loading-icon");
var movieInputEl = $("#movie");

var submit = document.getElementById('search-button');
var last_Search = JSON.parse(localStorage.getItem("Last Search"));

$(document).ready(function () {
      // Declare the carousel container
      var carouselContainer = $("#carousel");
      // Initialize the carousel
      carouselContainer.slick({
        dots: true,
        infinite: true,
        speed: 100,
        slidesToShow: 1,
        slidesToScroll: 1
      });
     
  function clearResults() {
    // Clear the results from all card content 
    castsView.empty();
    awardView.empty();
    movieRatingsView.empty();
    awardDescView.empty();
    posterCardView.empty();
    trailerView.empty();

    // Unslick the carousel if it's already initialized
    if (carouselContainer.hasClass('slick-initialized')) {
      carouselContainer.slick('unslick');
    }
    carouselContainer.slick("removeSlide", null, null, true);

    // Reload the page to reset the carousel
    location.reload();
  }

  lastSearchButtonEl.on("click", function (event) {
    // calling on function on last search button click
    event.preventDefault();
    var movieTitle = last_Search.Title;
    moviePoster(movieTitle);
    movieCastSearch(movieTitle);
    movieAwards(movieTitle);
    movieRatings(movieTitle);
    searchVideos(movieTitle);
  });

  searchButtonEl.on("click", function (event) {
    event.preventDefault();
    if (movieInputEl.val() === "") {
      return;
    } else {
      // All search button clear prevoius images
      carouselContainer.slick("removeSlide", null, null, true);
      var userInput = movieInputEl.val().trim().toLowerCase();
      movieTitleSearch(userInput);
      moviePoster(userInput);
      movieCastSearch(userInput);
      movieAwards(userInput);
      movieRatings(userInput);
      searchVideos(userInput);
      // Refresh the carousel
      // carouselContainer.slick("refresh");
      movieInputEl.val("");
    }
  });

  function movieTitleSearch(userInput) {
    let movieURL =
    imdbApiURL + "SearchMovie/" + API_KEY + "/" + userInput;
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
      localStorage.setItem("Movie", JSON.stringify(expression));
    });
  }
});

function movieCastSearch(userInput) {
  let movieURL =
  imdbApiURL + "SearchMovie/" + API_KEY + "/" + userInput;
  // This is the API call from imdb Movie ID
  $.ajax({
    url: movieURL,
    method: "GET",
  }).then(function (res) {
    // console.log(res);
    // console.log(res.results[0]);
    // console.log("id " + res.results[0].id);
    var movieId = res.results[0].id;
    castsView.empty();
    let movieCastsURL =
      imdbApiURL + "FullCast/" + API_KEY + "/" + movieId;
    // console.log("ID" + movieId);
    // This is the API call to imdb cast
    $.ajax({
      url: movieCastsURL,
      method: "GET",
    }).then(function (res) {
      //   console.log(res.actors);
      for (var i = 0; i < 10; i++) {
        // console.log("actor" + i + ":" + res.actors[i].name);
        var listItem = document.createElement("li");
        var details = document.createTextNode(res.actors[i].name);
        listItem.append(details);
        castsView.append(listItem);
      }
    });
  });
}

function moviePoster(userInput) {
  carouselContainer.empty();
  // Show loading icon
  loadingIconEl.show();

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
        Authorization: API_KEY
      },
      beforeSend: function () {
        // Show loading icon
        loadingIconEl.show();
      },
      success: function(data) {
        // console.log(data);
        var posters = data.posters;
        // console.log(posters);
        // var carouselContainer = $(".carousel");

        carouselContainer.empty(); // Clear existing carousel content

        // Unslick the carousel if it's already initialized
        if (carouselContainer.hasClass("slick-initialized")) {
          carouselContainer.slick("unslick");
        }

        // Check if there are posters available
        if (posters.length > 0) {
          // Iterate through the posters and create carousel slides
          posters.slice(0, 20).forEach(function(poster) {
            var imageUrl = poster.link;
            console.log(imageUrl);
            var imageElement = $("<img>").attr("src", imageUrl);
            carouselContainer.append(imageElement);
          });

          // Reinitialize the carousel
          carouselContainer.slick({
            autoplay: true,
            autoplaySpeed: 9000, // Set a higher value to increase the delay
            dots: true,
            infinite: true,
            speed: 500,// Transition speed between slides (in milliseconds)
            slidesToShow: 1,
            slidesToScroll: 1
          });

          // Previous button event handler
          $(".prev-button").on("click", function() {
            carouselContainer.slick("slickPrev");
          });

          // Next button event handler
          $(".next-button").on("click", function() {
            carouselContainer.slick("slickNext");
          });
        } else {
          // Clear previous results
          carouselContainer.empty();
        }
        // Hide loading icon
        loadingIconEl.hide();
      },
      
      error: function() {
        console.log("Error fetching movie posters.");
        // Hide loading icon in case of an error
        loadingIconEl.hide();
      }
    });
  });
}

function movieAwards(userInput) {
  awardView.empty();
  let movieURL =
  imdbApiURL + "SearchMovie/" + API_KEY + "/" + userInput;
  // This is the API call from imdb Movie ID
  $.ajax({
    url: movieURL,
    method: "GET",
  }).then(function (res) {
    // console.log(res);
    // console.log(res.results[0]);
    // console.log("id " + res.results[0].id);
    var movieId = res.results[0].id;
    let movieCastsURL =
    imdbApiURL + "Awards/" + API_KEY + "/" + movieId;
    // This is the API call to imdb cast
    $.ajax({
      url: movieCastsURL,
      method: "GET",
    }).then(function (res) {
      // console.log(res);
      // console.log(res.description);
      console.log(res.items);
      awardDescView.text("Awards: " + res.description)
      if(res.items){
      for (var i = 0; i < 5; i++) {
        var listItem = document.createElement("li");
        var details = document.createTextNode(res.items[i].eventTitle);
        listItem.appendChild(details);
        awardView.append(listItem);
      }
    }
    });
  });
}

function movieRatings(userInput) {
  awardView.empty();
  let movieURL =
  imdbApiURL + "SearchMovie/" + API_KEY + "/" + userInput;
  // This is the API call from imdb Movie ID
  $.ajax({
    url: movieURL,
    method: "GET",
  }).then(function (res) {
    console.log(res);
    var movieId = res.results[0].id;
    let movieRatingsURL =
    imdbApiURL + "Ratings/" + API_KEY + "/" + movieId;
    // This is the API call to imdb cast
    $.ajax({
      url: movieRatingsURL,
      method: "GET",
    }).then(function (res) {
      console.log(res);
      console.log(res.imDb);
      // movieRatingsView.text("Ratings");
      if(res.imDb){
      movieRatingsView.text("Ratings: " + res.imDb);
      }
    });
  });
}

function searchVideos(movieTitle) {
  // Makes sure the card content trailer class is empty before running
  trailerView.empty();
  // Retrieves the value from the input field
  var searchQuery = movieInputEl.val();
  // Establishes keyword to insert into the URL to filter innaccurate search results
  var keyword = "movie";
  var requestUrl;
  if (searchQuery) {
    requestUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&part=snippet&maxResults=20&q=${searchQuery}+${keyword}`;
  } else {
    requestUrl = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&part=snippet&maxResults=20&q=${movieTitle}+${keyword}`;
  }
  // Jquery fethch the API
  $.ajax({
    url: requestUrl,
    method: "GET",
  }).then(function (data) {
    // Limit youtube api search to only 3 results
    var videoItems = data.items.slice(0, 3);
    videoItems.forEach(function (video) {
      var videoId = video.id.videoId;
      var videoUrl = `https://www.youtube.com/embed/${videoId}`;
      // Create iframe and set iframe attributes0
      var iframe = $("<iframe>")
        .attr("width", "315")
        .attr("height", "200")
        .attr("src", videoUrl)
        .attr("frameborder", "0")
        .attr("allowfullscreen", true);
        // Appends iframe in card-container-trailer
      var listItem = $("<a>").append(iframe);
      trailerView.append(listItem);
    });
  });

    clearButtonEl.on("click",clearResults)
      function clearResults() {
        castsView.empty();
        awardView.empty();
        movieRatingsView.empty();
        awardDescView.empty();
        posterCardView.empty();
        trailerView.empty();
        // Remove all slides from the Slick container
        carouselContainer.empty();
        // Reinitialize the Slick carousel
        carouselContainer.slick('refresh');
        location.reload();
      }
      var cardTitle = $(".card-title");

cardTitle.css({
  "overflow": "hidden",
  "text-overflow": "ellipsis",
  "white-space": "nowrap"
});
  }

  submit.on('click', searchVideos);
