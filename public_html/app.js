function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", (e) => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }

          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", (e) => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }

          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}

const http = customHttp();

const newService = (function () {
  const apiKey = "4ae7608b08af4d95bc058326e227cfff";
  const apiUrl = "https://newsapi.org/v2";

  return {
    topHeadlines(country = "ru", category = "technology", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

//Elements
const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const searchInput = form.elements["search"];
const categorySelect = form.elements["category"];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
});

document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  loadNews();
});

//load news function
function loadNews() {
  showLoader();
  const country = countrySelect.value;
  const searchText = searchInput.value;
  const category = categorySelect.value;

  if (!searchText) {
    newService.topHeadlines(country, category, onGetResponse);
  } else {
    newService.everything(searchText, onGetResponse);
  }
}

//Function on get response from server
function onGetResponse(err, res) {
  removeLoader();
  if (err) {
    showAlert(err, "error-msg");
  }

  if (!res.articles.length) {
    return;
  }

  renderNews(res.articles);
}

function clearContainer(container) {
  let child = container.lastElementChild;
  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

function renderNews(news) {
  const newsContainer = document.querySelector(".news-container .row");
  if (newsContainer.children.length) clearContainer(newsContainer);
  let fragment = "";

  news.forEach((newsItem) => {
    const el = newsTemplate(newsItem);
    fragment += el;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

//News item template function
function newsTemplate({ urlToImage, title, url, description }) {
  return `
  <div class="col s12">
    <div class="card">
      <div class="card-image">
        <img src="${
          urlToImage ||
          "https://media.istockphoto.com/id/1185382671/vector/abstract-blurred-colorful-background.jpg?s=612x612&w=0&k=20&c=3YwJa7lCw-cQ-hviINULUokL9lYU4RuGjMP_E_0N8E4="
        }">
        <span class="card-title">${title || ""}</span>
      </div>
      <div class="card-content">
        <p>${description || ""}</p>
      </div>
      <div class="card-action">
        <a href="${url}">Read more</a>
      </div>
    </div>
  </div>`;
}

function showAlert(msg, type = "success") {
  M.toast({ html: msg, classes: type });
}

function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
    `
  );
}

function removeLoader() {
  const loader = document.querySelector(".progress");
  if (loader) {
    loader.remove();
  }
}
