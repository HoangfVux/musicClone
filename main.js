"use strict";

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  songs: [
    {
      name: "Watting for U",
      singer: "Mono",
      path: "./assets/music/Waiting-For-You-MONO-Onionn.mp3",
      image: "./assets/img/mono.jpeg"
    },
    {
      name: "Tòng Phu",
      singer: "Keyo",
      path: "./assets/music/Tong-Phu-Keyo.mp3",
      image: "./assets/img/tong-phu.jpg"
    },
    {
      name: "Dat $tick",
      singer: "Rich Chiagga",
      path: "./assets/music/Dat-tick-Rich-Chigga.mp3",
      image: "./assets/img/dat$tick.jpg"
    },
    {
      name: "Querry",
      singer: "QNT & MCK",
      path: "./assets/music/Querry-QNT-Trung-Tran-MCK.mp3",
      image: "./assets/img/querry.jpg"
    },
    {
      name: "Krazy",
      singer: "Andree",
      path: "./assets/music/Krazy-Touliver-Binz-Andree-Evy.mp3",
      image: "./assets/img/krazy.jpg"
    },
    {
      name: "D.C.M.A",
      singer: "Tóc tiên",
      path: "./assets/music/D-C-M-A-Toc-Tien-BigDaddy-Andree-Touliver-Long-Halo.mp3",
      image: "./assets/img/Nga-Anh-1111-5740-1639882562.jpg"
    },
    {
      name: "D.C.M.E",
      singer: "Andree",
      path: "./assets/music/D-C-M-E-Andree-Rhymastic.mp3",
      image: "./assets/img/d.c.m.e.jpg"
    },
    {
      name: "Cho Tôi Lang Thang",
      singer: "Đen",
      path: "./assets/music/Cho-Toi-Lang-Thang-Ngot-Den.mp3",
      image: "./assets/img/chotoilangthang.jpg"
    },
  ],
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function (key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
  },
  render: function () {
    const htmls = this.songs.map((song, index) => {
      return `
      <li>
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url('${song.image}')">
              </div>
              <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
              </div>
              <div class="option">
                <i class="fas fa-ellipsis-h"></i>
              </div>
            </div>
        </li>
          `
    })
    playlist.innerHTML = htmls.join('');
  },
  defineProperties: function () {
    Object.defineProperty(this, 'currentSong', {
      get: function () {
        return this.songs[this.currentIndex];
      }
    })
  },

  handleEvents: function () {
    const cdWidth = cd.offsetWidth

    //Xử lý CD quay / dừng
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)' }
    ], {
      duration: 10000, //10 seconds
      interations: Infinity,
    })
    cdThumbAnimate.pause();


    //Xử lý phóng to thu nhỏ CD
    document.onscroll = function () {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const newCdWidth = cdWidth - scrollTop

      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0

      cd.style.opacity = newCdWidth / cdWidth //Làm mờ khi cuộn

    }

    //Xử lý khi click play
    playBtn.onclick = function () {
      if (app.isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }

    //khi song được play
    audio.onplay = function () {
      app.isPlaying = true;
      player.classList.add('playing')
      cdThumbAnimate.play();
    }

    //Khi song bị pause
    audio.onpause = function () {
      app.isPlaying = false;
      player.classList.remove('playing')
      cdThumbAnimate.pause();
    }

    //Khi tiến độ thay đổi
    audio.ontimeupdate = function () {
      if (audio.duration) {
        const progressPerccent = Math.floor(audio.currentTime / audio.duration * 100);
        progress.value = progressPerccent
      }
    }


    //Xử lý khi tua song
    progress.oninput = function (e) {
      const seekTime = audio.duration / 100 * e.target.value;
      audio.currentTime = seekTime
    }

    //Khi next bài
    nextBtn.onclick = function () {
      if (app.isRandom) {
        app.playRandomSong()
      }
      else {
        app.nextSong()
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    }

    //Khi prev bài
    prevBtn.onclick = function () {
      if (app.isRandom) {
        app.playRandomSong()
      }
      else {
        app.prevSong()
      }
      audio.play();
      app.render();
      app.scrollToActiveSong();
    }

    //Xử lý bật/ tắt random song
    randomBtn.onclick = function (e) {
      app.isRandom = !app.isRandom
      app.setConfig('isRandom', app.isRandom)
      randomBtn.classList.toggle('active', app.isRandom);
    }

    //Xử lý phát lại song
    repeatBtn.onclick = function (e) {
      app.isRepeat = !app.isRepeat
      app.setConfig('isRepeat', app.isRepeat)
      repeatBtn.classList.toggle('active', app.isRepeat);
    }

    //Xử lý next song khi audio ended
    audio.onended = function () {
      if (app.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    }

    // lắng nghe hành vi click vào playlist
    playlist.onclick = function (e) {
      const songNode = e.target.closest('.song:not(.active)');
      if (songNode || e.target.closest('.option')) {

        //Xử lý khi click vào song
        if (songNode) {
          app.currentIndex = Number(songNode.dataset.index);
          app.loadCurrentSong();
          audio.play();
          app.render();
        }

        //Xử lý khi click vào option
        if (e.target.closest('.option')) {
          alert('Error')
        }

      }
    }

  },


  scrollToActiveSong: function () {
    setTimeout(() => {
      if (this.currentIndex === 0) {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        })
      } else {
        $('.song.active').scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }, 500)
  },
  loadCurrentSong: function () {
    heading.textContent = this.currentSong.name;
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path;
  },
  loadConfig: function () {
    this.isRandom = app.config.isRandom
    this.isRandom = app.config.isRepeat
  },

  nextSong: function () {
    this.currentIndex++
    if (this.currentIndex >= this.songs.length) {
      this.currentIndex = 0;
    }
    this.loadCurrentSong()
  },
  prevSong: function () {
    this.currentIndex--
    if (this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1;
    }
    this.loadCurrentSong()
  },
  playRandomSong: function () {
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length);
    }
    while (newIndex === this.currentIndex)

    this.currentIndex = newIndex;
    this.loadCurrentSong()
  },

  start: function () {
    //Gán cấu hình từ config vào object vào ứng dụng
    this.loadConfig();

    //Định nghĩa các thuộc tính cho object
    this.defineProperties();

    //Lắng nghe / xử lý các sự kiện trong (DOM event)
    this.handleEvents();

    //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
    this.loadCurrentSong();

    //Render playlist
    this.render();

    //Hiển thị trạng thái ban đầu của button repeat & random
    randomBtn.classList.toggle('active', this.isRandom);
    repeatBtn.classList.toggle('active', this.isRepeat);
  }

}


app.start();