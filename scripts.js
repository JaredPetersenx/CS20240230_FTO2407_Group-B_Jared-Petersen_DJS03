import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";
import {
  callingElements,
  createNewElements,
  newDocument,
} from "./functions.js";

let page = 1;
let matches = books;

const starting = newDocument;

// Creates html element to display a book and all it's relevant data
class CreateCustomButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const id = this.getAttribute("data-preview");
    const author = this.getAttribute("data-author");
    const image = this.getAttribute("data-image");
    const title = this.getAttribute("data-title");

    const element = createNewElements("button");
    element.setAttribute("data-preview", id);

    element.innerHTML = `
    <img class="preview__image" src="${image}"/>

<div class="preview__info">
<h3 class="preview__title">${title}</h3>
<div class="preview__author">${author}</div>
</div>
    `;

    element.appendChild(starting);
  }
}

customElements.define("custom-button", CreateCustomButton);
for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
}

// Creates different book genre's
function createGenre() {
  const genreHtml = newDocument;
  const firstGenreElement = createNewElements("option");
  firstGenreElement.value = "any";
  firstGenreElement.innerText = "All Genres";
  genreHtml.appendChild(firstGenreElement);

  for (const [id, name] of Object.entries(genres)) {
    const element = createNewElements("option");
    element.value = id;
    element.innerText = name;
    genreHtml.appendChild(element);
  }
  callingElements.searchGenres.appendChild(genreHtml);
}

createGenre();

// Give's authors names for each book that's generated
function createAuthor() {
  const authorsHtml = newDocument;
  const firstAuthorElement = createNewElements("option");
  firstAuthorElement.value = "any";
  firstAuthorElement.innerText = "All Authors";
  authorsHtml.appendChild(firstAuthorElement);

  for (const [id, name] of Object.entries(authors)) {
    const element = createNewElements("option");
    element.value = id;
    element.innerText = name;
    authorsHtml.appendChild(element);
  }

  callingElements.searchAuthors.appendChild(authorsHtml);
}

createAuthor();

// Dark and Light mode styling
function stylingToggleThemes() {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    callingElements.settingsThemes.value = "night";
    document.documentElement.style.setProperty("--color-dark", "255, 255, 255");
    document.documentElement.style.setProperty("--color-light", "10, 10, 20");
  } else {
    callingElements.settingsThemes.value = "day";
    document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
    document.documentElement.style.setProperty(
      "--color-light",
      "255, 255, 255"
    );
  }

  callingElements.listButtons.innerText = `Show more (${
    books.length - BOOKS_PER_PAGE
  })`;
  callingElements.listButtons.disabled =
    matches.length - page * BOOKS_PER_PAGE > 0;

  callingElements.listButtons.innerHTML = `
      <span>Show more</span>
      <span class="list__remaining"> (${
        matches.length - page * BOOKS_PER_PAGE > 0
          ? matches.length - page * BOOKS_PER_PAGE
          : 0
      })</span>
  `;
}

stylingToggleThemes();

// Handles navigation bar/modal and book eventlisteners
function setUpEventlisteners() {
  callingElements.cancelButton.addEventListener("click", () => {
    callingElements.searchOverlay.open = false;
  });

  callingElements.settingsCancel.addEventListener("click", () => {
    callingElements.settingsOverlay.open = false;
  });

  callingElements.headerSearch.addEventListener("click", () => {
    callingElements.searchOverlay.open = true;
    callingElements.searchTitle.focus();
  });

  callingElements.headerSettings.addEventListener("click", () => {
    callingElements.settingsOverlay.open = true;
  });

  callingElements.listClose.addEventListener("click", () => {
    callingElements.activeList.open = false;
  });
}

setUpEventlisteners();

// Dark and light mode toggle from navigation bar
function toggleDarkAndLight() {
  callingElements.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);

    if (theme === "night") {
      document.documentElement.style.setProperty(
        "--color-dark",
        "255, 255, 255"
      );
      document.documentElement.style.setProperty("--color-light", "10, 10, 20");
    } else {
      document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
      document.documentElement.style.setProperty(
        "--color-light",
        "255, 255, 255"
      );
    }

    callingElements.settingsOverlay.open = false;
  });
}

toggleDarkAndLight();

// Filtering search results from selected title/ genre / author

callingElements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const filters = Object.fromEntries(formData);
  const result = [];

  for (const book of books) {
    let genreMatch = filters.genre === "any";

    for (const singleGenre of book.genres) {
      if (genreMatch) break;
      if (singleGenre === filters.genre) {
        genreMatch = true;
      }
    }

    if (
      (filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (filters.author === "any" || book.author === filters.author) &&
      genreMatch
    ) {
      result.push(book);
    }
  }

  page = 1;
  matches = result;

  if (result.length < 1) {
    callingElements.listMessage.classList.add("list__message_show");
  } else {
    callingElements.listMessage.classList.remove("list__message_show");
  }

  callingElements.listItems.innerHTML = "";
  const newItems = newDocument;

  for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
    const element = createNewElements("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);

    element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

    newItems.appendChild(element);
  }

  callingElements.listItems.appendChild(newItems);
  callingElements.listButtons.disabled =
    matches.length - page * BOOKS_PER_PAGE < 1;

  callingElements.listButtons.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${
          matches.length - page * BOOKS_PER_PAGE > 0
            ? matches.length - page * BOOKS_PER_PAGE
            : 0
        })</span>
    `;

  window.scrollTo({ top: 0, behavior: "smooth" });
  callingElements.searchOverlay.open = false;
});

callingElements.listButtons.addEventListener("click", () => {
  const fragment = newDocument;

  for (const { author, id, image, title } of matches.slice(
    page * BOOKS_PER_PAGE,
    (page + 1) * BOOKS_PER_PAGE
  )) {
    const element = createNewElements("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);

    element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

    fragment.appendChild(element);
  }

  callingElements.listItems.appendChild(fragment);
  page += 1;
});

function selectedBook() {
  callingElements.listItems.addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
      if (active) break;

      if (node?.dataset?.preview) {
        let result = null;

        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }

        active = result;
      }
    }

    // Modal appear's after a sprcific book is pressed
    if (active) {
      callingElements.activeList.open = true;
      callingElements.listBlur.src = active.image;
      callingElements.listImage.src = active.image;
      callingElements.listTitle.innerText = active.title;
      callingElements.listSubtitel.innerText = `${
        authors[active.author]
      } (${new Date(active.published).getFullYear()})`;
      callingElements.listDescription.innerText = active.description;
    }
  });
}

selectedBook();
