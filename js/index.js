// from YT_API.txt import API_KEY
const API_KEY = "AIzaSyCb_TJU09jlTs_W9UaSNrkKdAuuDbnHEhg";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
const router = new Navigo('/', {hash: true});
const main = document.querySelector('.main');

const favoriteIds = JSON.parse(localStorage.getItem('favotiteYT') || "[]");

const preload = {
   elem: document.createElement('div'),
   text: '<p class="preload__text">Loading...</p>',
   append() {
      main.style.display = 'flex';
      main.style.margin = 'auto';
      main.append(this.elem);
   },
   remove() {
      main.style.display = '';
      main.style.margin = '';
      this.elem.remove();
   },
   init() {
      this.elem.classList.add('preload');
      this.elem.innerHTML = this.text;
   }
};
preload.init();

// const videoListItems = document.querySelector('.videolist__items');

const formatDate = (isoString) => {
   const date = new Date(isoString);

   const formatter = new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
   });
   return formatter.format(date);
};

const fetchTrendVideos = async () => {
   try {
      const url = new URL(VIDEOS_URL);
      url.searchParams.append('part', 'contentDetails,id,snippet');
      url.searchParams.append('chart', 'mostPopular');
      url.searchParams.append('maxResults', 12);
      url.searchParams.append('regionCode', 'US');
      url.searchParams.append('key', API_KEY);
      const response = await fetch(url);
      if (!response.ok) {
         throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
   } catch (error) {
      console.error("Catched error:", error);
   }
};

const fetchInCategoryVideos = async () => {
   try {
      const url = new URL(VIDEOS_URL);
      url.searchParams.append('part', 'contentDetails,id,snippet');
      url.searchParams.append('chart', 'videoCategoryId');
      url.searchParams.append('maxResults', 12);
      url.searchParams.append('regionCode', 'US');
      url.searchParams.append('key', API_KEY);
      const response = await fetch(url);
      if (!response.ok) {
         throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
   } catch (error) {
      console.error("Catched error:", error);
   }
};

const fetchFavoriteVideos = async () => {
   try {
      if (favoriteIds.length === 0) return {items: []};
      const url = new URL(VIDEOS_URL);
      url.searchParams.append('part', 'contentDetails,id,snippet');
      url.searchParams.append('maxResults', 12);
      url.searchParams.append('id', favoriteIds.join(','));
      url.searchParams.append('key', API_KEY);

      const response = await fetch(url);

      if (!response.ok) {
         throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
   } catch (error) {
      console.error("Catched error:", error);
   }
};

const fetchVideoData = async (id) => {
   try {
      const url = new URL(VIDEOS_URL);
      url.searchParams.append('part', 'snippet, statistics');
      url.searchParams.append('id', id);
      url.searchParams.append('key', API_KEY);

      const response = await fetch(url);

      if (!response.ok) {
         throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
   } catch (error) {
      console.error("Catched error:", error);
   }
};

const fetchSearchVideos = async (searchQuery, page) => {
   try {
      const url = new URL(SEARCH_URL);
      url.searchParams.append('part', 'snippet');
      url.searchParams.append('q', searchQuery);
      url.searchParams.append('type', 'video');
      url.searchParams.append('key', API_KEY);

      if (page) {
         url.searchParams.append('pageToken', page);
      }

      const response = await fetch(url);

      if (!response.ok) {
         throw new Error(`HTTP error ${response.status}`);
      }
      return await response.json();
   } catch (error) {
      console.error("Catched error:", error);
   }
};

const createListVideo = (videos, titleText, pagination) => {
   // videoListItems.textContent = "";
   const videoListSection = document.createElement('section');
   videoListSection.classList.add("videolist");

   const container = document.createElement('div');
   container.className = 'container';

   const title = document.createElement('h2');
   title.className = 'videolist__title';
   title.textContent = titleText;

   const videoListItems = document.createElement('ul');
   videoListItems.className = 'videolist__items';

   const listVideos = videos.items.map(video => {

      function getDuration(durationCode) {
         const hourMatch = durationCode.match(/(\d+)H/);
         const minutMatch = durationCode.match(/(\d+)M/);
         const secondMatch = durationCode.match(/(\d+)S/);

         const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
         const minuts = minutMatch ? parseInt(minutMatch[1]) : 0;
         const seconds = secondMatch ? parseInt(secondMatch[1]) : 0;

         let resultTime = "";

         if (hours > 0) {
            resultTime += `${hours} ч `
         }
         if (minuts > 0) {
            resultTime += `${minuts} мин `
         }
         if (seconds > 0) {
            resultTime += `${seconds} сек`
         }
         return resultTime.trim();
       };

      const li = document.createElement('li');
      li.classList.add('videolist__item');
      const id = video.id.videoId || video.id;
      li.innerHTML = `
         <article class="video-card">
            <a class="video-card__link" href="#/video/${id}">
               <img class="video-card__thumbnail" src="${video.snippet.thumbnails.standart?.url || video.snippet.thumbnails.high?.url}" alt="${video.snippet.title}">
               <h3 class="video-card__title">${video.snippet.title}</h3>
               <p class="video-card__channel">${video.snippet.channelTitle}</p>
               ${video.contentDetails ? `<p class="video-card__duration">${getDuration(video.contentDetails.duration)}</p>` : ''}
            </a>
            <button class="video-card__favorite favorite ${favoriteIds.includes(id) ? "active" : ""}" type="button" aria-label="Add to Favorite, ${video.snippet.title}" data-video-id="${id}">
               <svg class="video-card__icon">
                  <use class="star-o" xlink:href="images/sprite.svg#star-ow"></use>
                  <use class="star" xlink:href="images/sprite.svg#star"></use>
               </svg>
            </button>
         </article>
      `;
      return li;
   });
   videoListItems.append(...listVideos);
   videoListSection.append(container);
   container.append(title, videoListItems);

   if (pagination) {
      const paginationElem = document.createElement('div');
      paginationElem.className = 'pagination';

      if (pagination.prev) {
         const arrowPrev = document.createElement('a');
         arrowPrev.className = 'pagination__arrow';
         arrowPrev.classList.add('arrow-prev');
         arrowPrev.text = 'Prev page';
         arrowPrev.href = `#/search?q=${pagination.searchQuery}&page=${pagination.prev}`
         paginationElem.append(arrowPrev);
      };

      if (pagination.next) {
         const arrowNext = document.createElement('a');
         arrowNext.className = 'pagination__arrow';
         arrowNext.classList.add('arrow-next');
         arrowNext.text = 'Next page';
         arrowNext.href = `#/search?q=${pagination.searchQuery}&page=${pagination.next}`;
         paginationElem.append(arrowNext);
      };

      videoListSection.append(paginationElem);
   };
   return videoListSection;
};

const createVideo = (video) => {
   const videoSection = document.createElement('section');
   videoSection.className = 'video';
   videoSection.innerHTML = `
      <div class="container">
         <div class="video__player">
            <iframe class="video__iframe" src="https://youtube.com/embed/${video.id}" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen></iframe>
         </div>
         <div class="video__container">
            <div class="video__content">
               <h2 class="video__title">${video.snippet.title}</h2>
               <p class="video__channel">${video.snippet.channelTitle}s</p>
               <p class="video__info">
                  <span class="video__views">${parseInt(video.statistics.viewCount).toLocaleString()} просмотр</span>
                  <span class="video__date">Дата премьеры: ${formatDate(video.snippet.publishedAt,)}</span>
               </p>
               <p class="video__description">
                  ${video.snippet.description}
               </p>
            </div>
            <button class="video__link favorite ${favoriteIds.includes(video.id) ? "active" : ""}"  href="favorite.html">
               <span class="video__no-favorite">Избранное</span>
               <span class="video__favorite">B Избранное</span>
               <svg class="video__icon">
                  <use xlink:href="images/sprite.svg#star-ob"></use>
               </svg>
            </button>
         </div>
      </div>
   `;
   return videoSection;
};

const createHero = () => {
   const heroSection = document.createElement('section');
   heroSection.className = 'hero';
   heroSection.innerHTML = `
      <div class="container">
         <div class="hero__container">
            <a class="hero__link"  href="#/favorite">
               <span>Избранное</span>
               <svg class="hero__icon">
                  <use xlink:href="images/sprite.svg#star-ow"></use>
               </svg>
            </a>

            <svg class="hero__logo" viewBox="0 0 360 48" role="img" aria-label="Logo of service My-Youtub">
               <use xlink:href="images/sprite.svg#logo-wite"></use>
            </svg>

            <h1 class="hero__title">Смотри. Загружай. Создавай</h1>
            <p class="hero__tagline">Удобный видеохостинг для тебя</p>
         </div>
      </div>
   `;
   return heroSection;
};

const createSearch = () => {
   const searchSection = document.createElement('section');
   searchSection.className = 'search';
   const container = document.createElement('div');
   container.className = 'container';
   const title = document.createElement('h2');
   title.className = 'visually-hidden';
   title.textContent = 'search';

   const form = document.createElement('form');
   form.className = 'search__form';
   searchSection.append(container);
   container.append(title, form);
   form.innerHTML = `
      <input class="search__input" type="search" name="search" required placeholder="Найти видео...">
      <button class="search__btn" type="submit">
         <span>поиск</span>
         <svg class="search__icon">
            <use xlink:href="images/sprite.svg#search"></use>
         </svg>
      </button>
   `;

   form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (form.search.value.trim()) {
         router.navigate(`/search?q=${form.search.value}`);
      };
   });

   return searchSection;
};

const createHeader = () => {
   const header = document.querySelector('.header');
   if (header) {
      return header;
   };
   const headerElem = document.createElement('header');
   headerElem.className = 'header';
   headerElem.innerHTML = `
      <div class="container header__container">
         <a class="header__link" href="#">
            <svg class="header__logo" viewBox="0 0 240 32" role="img" aria-label="Logo of service My-Youtub">
               <use xlink:href="images/sprite.svg#logo-orange"></use>
            </svg>
         </a>
         <a class="header__link header__link_favorite"  href="#/favorite">
            <span>Избранное</span>
            <svg class="header__icon">
               <use xlink:href="images/sprite.svg#star-ob"></use>
            </svg>
         </a>
      </div>
   `;
   return headerElem;
};

const indexRoute = async () => {
   document.querySelector('.header')?.remove();
   main.textContent = '';
   preload.append();
   const hero = createHero();
   const search = createSearch();
   const videos = await fetchTrendVideos();
   preload.remove();
   const listVideo = createListVideo(videos, "In trend");
   main.append(hero, search, listVideo);
};

const videoRoute = async (ctx) => {
   const id = ctx.data.id;
   main.textContent = '';
   preload.append();
   document.body.prepend(createHeader());
   const search = createSearch();
   const data = await fetchVideoData(id);
   const video = data.items[0];
   preload.remove();
   const videoSection = createVideo(video);
   main.append(search, videoSection);

   const searchQuery = video.snippet.title;
   const videos = await fetchSearchVideos(searchQuery);
   const listVideo = createListVideo(videos, "Search video");
   main.append(listVideo);
};

const favoriteRoute = async () => {
   document.body.prepend(createHeader());
   main.textContent = '';
   preload.append();
   const search = createSearch();
   const videos = await fetchFavoriteVideos();
   preload.remove();
   const listVideo = createListVideo(videos, "Favorite");
   main.append(search, listVideo);
};
const searchRoute = async (ctx) => {
   const searchQuery = ctx.params.q;
   const page = ctx.params.page;
   if (searchQuery) {
      document.body.prepend(createHeader());
      main.textContent = '';
      preload.append();
      const search = createSearch();
      const videos = await fetchSearchVideos(searchQuery);
      preload.remove();
      const listVideo = createListVideo(videos, "Favorite", page, {
         next: videos.nextPageToken,
         prev: videos.prevPageToken
      });
      main.append(search, listVideo);
   };
};

const init = () => {
   router.on({
      "/": indexRoute,
      "/video/:id": videoRoute,
      "/favorite": favoriteRoute,
      "/search": searchRoute,
   }).resolve();
   // const currentPage = location.pathname.split('/').pop();

   // const urlSearchParams = new URLSearchParams(location.search);
   // const videoId = urlSearchParams.get("id");
   // const searchQuery = urlSearchParams.get("q");

   // if (currentPage === 'index.html' || currentPage === '') {
   //    fetchTrendVideos().then(displayListVideo);
   // } else if (currentPage === 'video.html' && videoId) {
   //    fetchVideoData(videoId).then(displayVideo);
   //    fetchTrendVideos().then(displayListVideo);
   // } else if (currentPage === 'favorite.html') {
   //    fetchFavoriteVideos().then(displayListVideo);
   // } else if (currentPage === 'search.html' || searchQuery) {
   //    console.log(currentPage);
   // }


   document.body.addEventListener('click', ({target}) => {
      const itemFavorite = target.closest('.favorite');
      if (itemFavorite) {
         const videoId = itemFavorite.dataset.videoId;
         if (favoriteIds.includes(videoId)) {
            favoriteIds.splice(favoriteIds.indexOf(videoId), 1);
            localStorage.setItem('favotiteYT', JSON.stringify(favoriteIds));
            itemFavorite.classList.remove('active');
         } else {
            favoriteIds.push(videoId);
            localStorage.setItem('favotiteYT', JSON.stringify(favoriteIds));
            itemFavorite.classList.add('active');
         }
      }
   });
};

init();