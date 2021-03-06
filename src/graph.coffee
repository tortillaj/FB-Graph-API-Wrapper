Graph =
  token: null
  initialized: false
  opts:
    appId: $("#fb-root").attr("data-app-id")
    status: true
    cookie: true
    xfbml: false
    oauth: true
    channelUrl: $("#fb-root").attr("data-channel-file")

  callstack: []
  client: {}
  getPermissions: ->
    (if (not @permissions) then {} else scope: @permissions)

  setMessage: (message) ->
    alerts = $("#alerts")
    alerts.append "<div class=\"alert alert-info\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\">&times;</button>" + message + "</div>"

  init: (permissions) ->
    @permissions = permissions
    ((d) ->
      js = undefined
      id = "facebook-jssdk"
      return  if d.getElementById(id)
      js = d.createElement("script")
      js.id = id
      js.async = true
      js.src = "//connect.facebook.net/en_US/all.js"
      d.getElementsByTagName("head")[0].appendChild js
    ) document
    window.fbAsyncInit = ->
      @.initialized = true
      FB.init @opts
      FB.getLoginStatus (response) ->
        if response.status is "connected"
          @token = response.authResponse.accessToken
          @executeCallstack()
        else
          @login()

  executeCallstack: ->
    i = Graph.callstack.length - 1
    while i >= 0
      Graph.callstack[i]()  if typeof Graph.callstack[i] is "function"
      i--

  login: ->
    FB.login ((response) ->
      if response.authResponse
        @token = response.authResponse.accessToken
        $.publish "fb.login", [ response.authResponse.accessToken, response ]
        Graph.executeCallstack()
      else
        @setMessage "You are not logged in to Facebook!"
    ), @getPermissions()

  run: (fn) ->
    unless @initialized
      @callstack.push fn
      return false
    fn()

  cache: (method) ->

  fetch:
    pages: ->
      Graph.run ->
        FB.api "/me/accounts", (response) ->
          pages = []
          i = response.data.length - 1

          while i >= 0
            pages.push
              id: response.data[i].id
              name: response.data[i].name
              token: response.data[i].access_token
              perms: response.data[i].perms
            i--
          $.publish "fb.fetch.pages", [ pages ]

    page: (pid) ->
      Graph.run ->
        FB.api "/" + pid, (response) ->
          page =
            id: response.id
            about: response.about
            title: response.name
            published: response.is_published
            likes: response.likes

          $.publish "fb.fetch.page", [ page ]

    albums: ->
      Graph.run ->
        FB.api "/me/albums", (response) ->
          albums = []
          i = response.data.length - 1

          while i >= 0
            albums.push
              id: response.data[i].id
              name: response.data[i].name
              link: response.data[i].link
              count: response.data[i].count
            i--
          $.publish "fb.fetch.albums", [ albums ]

    addPhotosToAlbum: (album, photos) ->
      $.publish "fb.fetch.photos", [ album, photos ]

    albumPhotos: (album) ->
      FB.api "/" + album.id + "/photos", (photo) ->
        photos = []
        i = photo.data.length - 1

        while i >= 0
          photos.push
            id: photo.data[i].id
            icon: photo.data[i].icon
            link: photo.data[i].link
            picture: photo.data[i].picture
            source: photo.data[i].source
          i--
        Graph.fetch.addPhotosToAlbum album, photos

    photos: ->
      Graph.run ->
        FB.api "/me/albums", (album) ->
          albums = []
          i = album.data.length - 1
          while i >= 0
            Graph.fetch.albumPhotos
              id: album.data[i].id
              name: album.data[i].name
              link: album.data[i].link
              count: album.data[i].count
            i--

  create:
    link: (pid, link) ->
      $.extend link,
        access_token: @token

      Graph.run ->
        FB.api "/links", "post", link, (response) ->
          if not response or response.error
            _this.setMessage "There has been a problem. Please try your post again."
          else
            $.publish "fb.create.link", [ response.id, response ]

    photo: (photo) ->
      $.extend photo,
        access_token: @token

      Graph.run ->
        FB.api "/photos", "post", photo, (response) ->
          if not response or response.error
            @setMessage "There has been a problem. Please try your post again."
          else
            $.publish "fb.post.photo", [ response.id, response ]