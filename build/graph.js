// Generated by CoffeeScript 1.6.2
var Graph;

Graph = {
  token: null,
  initialized: false,
  opts: {
    appId: $("#fb-root").attr("data-app-id"),
    status: true,
    cookie: true,
    xfbml: false,
    oauth: true,
    channelUrl: $("#fb-root").attr("data-channel-file")
  },
  callstack: [],
  client: {},
  getPermissions: function() {
    if (!this.permissions) {
      return {};
    } else {
      return {
        scope: this.permissions
      };
    }
  },
  setMessage: function(message) {
    var alerts;

    alerts = $("#alerts");
    return alerts.append("<div class=\"alert alert-info\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" + message + "</div>");
  },
  init: function(permissions) {
    this.permissions = permissions;
    (function(d) {
      var id, js;

      js = void 0;
      id = "facebook-jssdk";
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement("script");
      js.id = id;
      js.async = true;
      js.src = "//connect.facebook.net/en_US/all.js";
      return d.getElementsByTagName("head")[0].appendChild(js);
    })(document);
    return window.fbAsyncInit = function() {
      this.initialized = true;
      FB.init(this.opts);
      return FB.getLoginStatus(function(response) {
        if (response.status === "connected") {
          this.token = response.authResponse.accessToken;
          return this.executeCallstack();
        } else {
          return this.login();
        }
      });
    };
  },
  executeCallstack: function() {
    var i, _results;

    i = Graph.callstack.length - 1;
    _results = [];
    while (i >= 0) {
      if (typeof Graph.callstack[i] === "function") {
        Graph.callstack[i]();
      }
      _results.push(i--);
    }
    return _results;
  },
  login: function() {
    return FB.login((function(response) {
      if (response.authResponse) {
        this.token = response.authResponse.accessToken;
        $.publish("fb.login", [response.authResponse.accessToken, response]);
        return Graph.executeCallstack();
      } else {
        return this.setMessage("You are not logged in to Facebook!");
      }
    }), this.getPermissions());
  },
  run: function(fn) {
    if (!this.initialized) {
      this.callstack.push(fn);
      return false;
    }
    return fn();
  },
  cache: function(method) {},
  fetch: {
    pages: function() {
      return Graph.run(function() {
        return FB.api("/me/accounts", function(response) {
          var i, pages;

          pages = [];
          i = response.data.length - 1;
          while (i >= 0) {
            pages.push({
              id: response.data[i].id,
              name: response.data[i].name,
              token: response.data[i].access_token,
              perms: response.data[i].perms
            });
            i--;
          }
          return $.publish("fb.fetch.pages", [pages]);
        });
      });
    },
    page: function(pid) {
      return Graph.run(function() {
        return FB.api("/" + pid, function(response) {
          var page;

          page = {
            id: response.id,
            about: response.about,
            title: response.name,
            published: response.is_published,
            likes: response.likes
          };
          return $.publish("fb.fetch.page", [page]);
        });
      });
    },
    albums: function() {
      return Graph.run(function() {
        return FB.api("/me/albums", function(response) {
          var albums, i;

          albums = [];
          i = response.data.length - 1;
          while (i >= 0) {
            albums.push({
              id: response.data[i].id,
              name: response.data[i].name,
              link: response.data[i].link,
              count: response.data[i].count
            });
            i--;
          }
          return $.publish("fb.fetch.albums", [albums]);
        });
      });
    },
    addPhotosToAlbum: function(album, photos) {
      return $.publish("fb.fetch.photos", [album, photos]);
    },
    albumPhotos: function(album) {
      return FB.api("/" + album.id + "/photos", function(photo) {
        var i, photos;

        photos = [];
        i = photo.data.length - 1;
        while (i >= 0) {
          photos.push({
            id: photo.data[i].id,
            icon: photo.data[i].icon,
            link: photo.data[i].link,
            picture: photo.data[i].picture,
            source: photo.data[i].source
          });
          i--;
        }
        return Graph.fetch.addPhotosToAlbum(album, photos);
      });
    },
    photos: function() {
      return Graph.run(function() {
        return FB.api("/me/albums", function(album) {
          var albums, i, _results;

          albums = [];
          i = album.data.length - 1;
          _results = [];
          while (i >= 0) {
            Graph.fetch.albumPhotos({
              id: album.data[i].id,
              name: album.data[i].name,
              link: album.data[i].link,
              count: album.data[i].count
            });
            _results.push(i--);
          }
          return _results;
        });
      });
    }
  },
  create: {
    link: function(pid, link) {
      $.extend(link, {
        access_token: this.token
      });
      return Graph.run(function() {
        return FB.api("/links", "post", link, function(response) {
          if (!response || response.error) {
            return _this.setMessage("There has been a problem. Please try your post again.");
          } else {
            return $.publish("fb.create.link", [response.id, response]);
          }
        });
      });
    },
    photo: function(photo) {
      $.extend(photo, {
        access_token: this.token
      });
      return Graph.run(function() {
        return FB.api("/photos", "post", photo, function(response) {
          if (!response || response.error) {
            return this.setMessage("There has been a problem. Please try your post again.");
          } else {
            return $.publish("fb.post.photo", [response.id, response]);
          }
        });
      });
    }
  }
};
