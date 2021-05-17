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
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  const showHeart = Boolean(currentUser);
  return $(`
      <li id="${story.storyId}">
      ${showDeleteBtn ? getDeleteBtnHTML() : ""}
      ${showHeart ? getHeartHTML(story, currentUser) : ""}
      
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

//deletebtn
function getDeleteBtnHTML() {
  return `
  <span class="trash-can">
  <i class = "fas fa-trash-alt"></i>
  </span>`;
}

//getHeart
function getHeartHTML(story, user) {
  console.debug("getheartHTML");

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
    $newStoryform.slideUp("slow");
    $newStoryform.trigger("reset");

    const story = await storyList.addStory(currentUser, newStory);
    const $story = generateStoryMarkup(story);
    $allStoriesList.prepend($story);
  });
}
postNewStory();

function favStoryList() {
  $favoritedStories.empty();

  if (currentUser.favorites.length === 0) {
    $favoritedStories.append("<h5>No favorites added!</h5>");
  } else {
    // loop through all of users favorites and generate HTML for them
    for (let story of currentUser.favorites) {
      const $story = generateStoryMarkup(story);
      $favoritedStories.append($story);
    }
  }

  $favoritedStories.show();
}
async function toggleStoryFavorite(evt) {
  console.debug("toggleStoryFavorite");

  const $tgt = $(evt.target);
  const $closestLi = $tgt.closest("li");
  const storyId = $closestLi.attr("id");
  const story = storyList.stories.find((s) => s.storyId === storyId);

  // see if the story is already favorited (checking by presence of heart)
  if ($tgt.hasClass("fas")) {
    // currently a favorite: remove from user's fav list and change heart
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

  //loop through curr user stories if none render method on div else render stories with trash can icon next to heart icon
  if (currentUser.ownStories.length === 0) {
    $myStories.append(
      "<h5>No stories added yet! Go agead and add a story. :)</h5>"
    );
  } else {
    for (let story of currentUser.ownStories) {
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
