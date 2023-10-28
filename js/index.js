const API_KEY = "AIzaSyCb_TJU09jlTs_W9UaSNrkKdAuuDbnHEhg";
const VIDEOS_URL = "https://www.googleapis.com/youtube/v3/videos";
const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

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

const displayVideo = (videos) => {
   videoListItems.textContent = "";
   const listVideos = videos.items.map(video => {
      // I take next function  from stackoverflow
      function getDuration(durationCode) {
         var match = durationCode.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

         match = match.slice(1).map(function(x) {
           if (x != null) {
               return x.replace(/\D/, '');
           }
         });

         var hours = (parseInt(match[0]) || 0);
         var minutes = (parseInt(match[1]) || 0);
         var seconds = (parseInt(match[2]) || 0);

         const secondes =  hours * 3600 + minutes * 60 + seconds;

         const t = new Date(secondes*1000);
         const hh = t.getUTCHours();
         const mm = t.getUTCMinutes();
         const ss = t.getSeconds();

         return `${hh > 0 ? hh+"H" : ''} ${mm}M ${ss}S`;
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
            <button class="video-card__favorite" type="button" aria-label="Add to Favorite, ${video.snippet.title}">
               <svg class="video-card__icon">
                  <use class="star-o" xlink:href="images/sprite.svg#star-ob"></use>
                  <use class="star" xlink:href="images/sprite.svg#star"></use>
               </svg>
            </button>
         </article>
      `;
      return li;
   });
   videoListItems.append(...listVideos);
};

fetchTrendVideos().then(displayVideo);