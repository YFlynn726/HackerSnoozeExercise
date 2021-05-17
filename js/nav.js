"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

// lookover________________________

/** Show login/signup on click on "login" */
// function navSubmitStoryClick(evt) {
//   console.debug("navSubmitStoryClick", evt);
//   hidePageComponents();
//   $allStoriesList.show();
//   $submitForm.show();
// }

// $navSubmitStory.on("click", navSubmitStoryClick);

/** Show favorite stories on click on "favorites" */

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  favStoryList();
  $newStoryForm.hide();
}

$body.on("click", "#nav-fav", navFavoritesClick);

/** Show My Stories on clicking "my stories" */

function navMyStories(evt) {
  console.debug("navMyStories", evt);

  hidePageComponents();
  getMyStories();
  $myStories.show();
  $newStoryForm.hide();
}

$body.on("click", "#nav-myStories", navMyStories);

// look over ________________________________^^^^

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navSubmit.show();

  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function navSubmitStory(e) {
  //e.preventDefault();
  console.debug("navSubmitStory");
  hidePageComponents();
  $allStoriesList.show();
  $newStoryForm.show();
}

$navSubmit.on("click", navSubmitStory);

function myProfile() {
  hidePageComponents();
  $userProfile.show();
  $newStoryForm.hide();
}
$navUserProfile.on("click", myProfile);
