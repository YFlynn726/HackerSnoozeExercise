"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

//showing all stories and making "hacker-snooze.." a link to get all stories
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

//my fav list link
function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  favStoryList();
  $newStoryForm.hide();
}

$body.on("click", "#nav-fav", navFavoritesClick);

//myStories link
function navMyStories(evt) {
  console.debug("navMyStories", evt);

  hidePageComponents();
  getMyStories();
  $myStories.show();
  $newStoryForm.hide();
}

$body.on("click", "#nav-myStories", navMyStories);

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

//updating navbar when user logins
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $navLogin.hide();
  $navSubmit.show();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

//submit story link
function navSubmitStory() {
  console.debug("navSubmitStory");
  hidePageComponents();
  $allStoriesList.show();
  $newStoryForm.show();
}

$navSubmit.on("click", navSubmitStory);

//username link
function myProfile() {
  hidePageComponents();
  $userProfile.show();
  $newStoryForm.hide();
}
$navUserProfile.on("click", myProfile);
