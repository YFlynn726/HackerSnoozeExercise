"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    //Creates and returns a URL object referencing the URL
    //The host property of the URL interface is a USVString containing the hostName; shortens it for display UI purposes in stories.js
    let url = new URL(this.url).host;
    return url;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  //static means we can call the class directly and access the static method
  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method? **because its not unique, its the same for every time is it ran.

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map((story) => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(user, { title, author, url }) {
    try {
      const token = user.loginToken;
      const res = await axios({
        method: "POST",
        url: `${BASE_URL}/stories`,
        data: { token, story: { title, author, url } },
      });

      const story = new Story(res.data.story);
      this.stories.unshift(story);
      user.ownStories.unshift(story);

      return story;
    } catch (e) {
      alert("Please enter required info.");
    }
  }

  async removeStory(user, storyId) {
    console.log(storyId);
    console.log(user);
    try {
      await axios({
        url: `${BASE_URL}/stories/${storyId}`,
        method: "DELETE",
        data: { token: user.loginToken },
      });

      //basically cleaning out the list of the removed item so only the stories that was not deleted are still saved in array of the object of the user.

      // filter out the story that doesn't match the storyId
      this.stories = this.stories.filter((story) => story.storyId !== storyId);

      //then filter out ownStories that doesn't match the storyId
      user.ownStories = user.ownStories.filter(
        (item) => item.storyId !== storyId
      );
      //the same for favorites
      user.favorites = user.favorites.filter(
        (item) => item.storyId !== storyId
      );
    } catch (e) {
      alert("Something went wrong. So sorry");
    }
  }
}
/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map((s) => new Story(s));
    this.ownStories = ownStories.map((s) => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  async addFavorite(story) {
    this.favorites.push(story);
    //the underscore means this is developer indication that this should not be moved.
    await this._addOrRemoveFavorite("add", story);
  }

  async removeFavorite(story) {
    this.favorites = this.favorites.filter((s) => s.storyId !== story.storyId);
    await this._addOrRemoveFavorite("remove", story);
  }

  //the underscore means this is developer indication that this should not be moved. Internal function: will not work if moved because it's user specific data being used.
  async _addOrRemoveFavorite(userAction, story) {
    //story is an object of information of that story
    //userAction is if story is being favorited or not
    const method = userAction === "add" ? "POST" : "DELETE";
    const token = this.loginToken;
    await axios({
      url: `${BASE_URL}/users/${this.username}/favorites/${story.storyId}`,
      method: method,
      data: { token },
    });
  }

  isFavorite(story) {
    //this function is returning true or false using some()"finds an element that passes test" in order to determine heart type; comes back with user info
    return this.favorites.some((item) => item.storyId === story.storyId);
  }
}
