const API_KEY = "AIzaSyCb_TJU09jlTs_W9UaSNrkKdAuuDbnHEhg";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

const favoriteIds = JSON.parse(localStorage.getItem('favotiteYT') || "[]");

const videoListItems = document.querySelector('.videolist__items');

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

const formatDate = (isoString) => {
   const date = new Date(isoString);

   const formatter = new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
   });
   return formatter.format(date);
};

const displayListVideo = (videos) => {
   videoListItems.textContent = "";
   const listVideos = videos.items.map(video => {
      // I take next function  from video
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
      li.innerHTML = `
         <article class="video-card">
            <a class="video-card__link" href="video.html?id=${video.id}">
               <img class="video-card__thumbnail" src="${video.snippet.thumbnails.standart?.url || video.snippet.thumbnails.high?.url}" alt="${video.snippet.title}">
               <h3 class="video-card__title">${video.snippet.title}</h3>
               <p class="video-card__channel">${video.snippet.channelTitle}</p>
               <p class="video-card__duration">${getDuration(video.contentDetails.duration)}</p>
            </a>
            <button class="video-card__favorite favorite ${favoriteIds.includes(video.id) ? "active" : ""}" type="button" aria-label="Add to Favorite, ${video.snippet.title}" data-video-id="${video.id}">
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
};

const displayVideo = ({items: [video]}) => {
   const videpElem = document.querySelector('.video');
   videpElem.innerHTML = `
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
};


const init = () => {
   const currentPage = location.pathname.split('/').pop();

   const urlSearchParams = new URLSearchParams(location.search);
   const videoId = urlSearchParams.get("id");
   const searchQuery = urlSearchParams.get("q");

   if (currentPage === 'index.html' || currentPage === '') {
      fetchTrendVideos().then(displayListVideo);
   } else if (currentPage === 'video.html' && videoId) {
      fetchVideoData(videoId).then(displayVideo);
      fetchTrendVideos().then(displayListVideo);
   } else if (currentPage === 'favorite.html') {
      fetchFavoriteVideos().then(displayListVideo);
   } else if (currentPage === 'search.html' || searchQuery) {
      console.log(currentPage);
   }


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