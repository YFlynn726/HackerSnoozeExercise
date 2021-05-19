"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, showDeleteBtn = false) {
  //console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  //returns true or false if there is a currentUser because the favorite comp only accessible if logged in
  const showHeart = Boolean(currentUser);

  return $(`
      <li id="${story.storyId}">
        ${showDeleteBtn ? deleteBtnHTML() : ""}
        ${showHeart ? heartHTML(story, currentUser) : ""}  
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function deleteBtnHTML() {
  return `
  <span class="trash-can">
  <i class = "fas fa-trash-alt"></i>
  </span>`;
}

function heartHTML(story, user) {
  //if comes back true then return fas if not then return hearttype of far.
  const isFavorite = user.isFavorite(story);
  const heartType = isFavorite ? "fas" : "far";
  return `
  <span class="heart">
  <i class = "${heartType} fa-heart"></i>
  </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of the stories and render them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

function postNewStory() {
  const form = $("#newStory");
  const $newStoryform = $("#newStory-form");

  form.on("click", async function (e) {
    e.preventDefault();
    const title = $("#title").val();
    const author = $("#author").val();
    const url = $("#url").val();
    const user = currentUser;
    const newStory = {
      title,
      author,
      url,
      user,
    };
    if (title.length === 0) {
      alert("Please enter all information.");
      return false;
    } else {
      $newStoryform.slideUp("slow");
      $newStoryform.trigger("reset");

      //calling api
      const story = await storyList.addStory(currentUser, newStory);
      const $story = generateStoryMarkup(story);
      $allStoriesList.prepend($story);
    }
  });
}
postNewStory();

function favStoryList() {
  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    //looping array of user favs
    for (let story of currentUser.favorites) {
      //$ = function that returns a set of elements found in the DOM
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}
async function toggleStoryFavorite(e) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(e.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  //returns the value of the first element in the provided array that satisfies the provided testing function
  const story = storyList.stories.find((item) => item.storyId === storyId);

  //check if heart is selected already
  if ($tgt.hasClass("fas")) {
    // if so call method to remove story from fav list - calling api
    await currentUser.removeFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  } else {
    // do the opposite
    await currentUser.addFavorite(story);
    $tgt.closest("i").toggleClass("fas far");
  }
}

$storiesLists.on("click", ".heart", toggleStoryFavorite);

function getMyStories() {
  $myStories.empty();

  //loop through curr user stories if none append h5 to div else render stories with trash can icon next to heart icon
  if (currentUser.ownStories.length === 0) {
    $myStories.append(
      "<h5>No stories added yet! Go agead and add a story. :)</h5>"
    );
  } else {
    for (let story of currentUser.ownStories) {
      //true refers to trash can
      let $story = generateStoryMarkup(story, true);
      $myStories.append($story);
    }
  }

  $myStories.show();
}

async function deleteStory(e) {
  const $closestLi = $(e.target).closest("li");
  const storyId = $closestLi.attr("id");

  await storyList.removeStory(currentUser, storyId);

  //update html with updated list
  await getMyStories();
}

$myStories.on("click", ".trash-can", deleteStory);
