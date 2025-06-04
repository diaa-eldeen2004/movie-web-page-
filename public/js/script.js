document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("navbar-toggle");
  const verticalNavbar = document.getElementById("vertical-navbar");
  const fileInput =
    document.getElementById("fileInput") || createHiddenFileInput();
  const removeBtn = document.getElementById("removePhotoBtn");
  const resetBtn = document.getElementById("resetPasswordBtn");
  const themeButtons = document.querySelectorAll(".theme-btn");
  const slider = document.getElementById("slider");
  const sliderWrapper = document.querySelector(".slider-wrapper");
  const bigCards = sliderWrapper?.querySelectorAll(".Bigcardx") || [];
  const cards = document.querySelectorAll(".card-container");

  // --- Navbar Toggle ---
  if (toggleButton && verticalNavbar) {
    toggleButton.addEventListener("click", function (e) {
      e.stopPropagation();
      const isOpen = verticalNavbar.classList.toggle("open");
      toggleButton.setAttribute("aria-expanded", isOpen);
      const icon = toggleButton.querySelector("i");
      icon.classList.toggle("fa-bars", !isOpen);
      icon.classList.toggle("fa-times", isOpen);
    });

    document.addEventListener("click", function (e) {
      if (
        !verticalNavbar.contains(e.target) &&
        !toggleButton.contains(e.target)
      ) {
        verticalNavbar.classList.remove("open");
        toggleButton.setAttribute("aria-expanded", "false");
        const icon = toggleButton.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        verticalNavbar.classList.remove("open");
        toggleButton.setAttribute("aria-expanded", "false");
        const icon = toggleButton.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });
  }

  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      localStorage.removeItem("userPhoto");
      setDefaultProfileIcon();
    });
  }

  // --- Password Reset ---
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      window.location.href = "forgot.html";
    });
  }

  // --- Theme Toggle ---
  const savedTheme = localStorage.getItem("theme") || "default-theme";
  document.body.classList.add(savedTheme);

  themeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      document.body.classList.remove(
        "default-theme",
        "dark-theme",
        "light-theme"
      );
      const selectedTheme = this.id;
      document.body.classList.add(selectedTheme);
      localStorage.setItem("theme", selectedTheme);
    });

    button.addEventListener("mouseenter", function () {
      const tooltip = document.createElement("span");
      tooltip.className = "tooltip";
      tooltip.innerText = this.dataset.tooltip;
      this.appendChild(tooltip);
    });

    button.addEventListener("mouseleave", function () {
      const tooltip = this.querySelector(".tooltip");
      if (tooltip) tooltip.remove();
    });
  });

  // --- Card Hover Effects ---
  cards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      if (slider) slider.classList.add("paused");
      card.querySelector(".card").style.transform = "rotateY(180deg)";
    });

    card.addEventListener("mouseleave", () => {
      if (slider) slider.classList.remove("paused");
      card.querySelector(".card").style.transform = "rotateY(0deg)";
    });
  });

  // --- Auto-Scroll for slider-wrapper ---
  if (sliderWrapper && bigCards.length > 0) {
    const cardWidth = bigCards[0].offsetWidth + 40;
    let currentScroll = 0;
    let interval;

    const startSlider = () => {
      interval = setInterval(() => {
        currentScroll += cardWidth;
        if (
          currentScroll >=
          sliderWrapper.scrollWidth - sliderWrapper.clientWidth
        ) {
          currentScroll = 0;
          sliderWrapper.scrollTo({ left: 0, behavior: "auto" }); // instant reset
        } else {
          sliderWrapper.scrollTo({ left: currentScroll, behavior: "smooth" });
        }
      }, 2500);
    };

    const stopSlider = () => clearInterval(interval);

    bigCards.forEach((card) => {
      card.addEventListener("mouseenter", stopSlider);
      card.addEventListener("mouseleave", startSlider);
    });

    sliderWrapper.scrollLeft = 0; // start from beginning
    startSlider();
  }

  // --- Smooth Auto Scroll for horizontal slider ---
  if (slider) {
    let scrollInterval;

    function startAutoScroll() {
      stopAutoScroll();
      scrollInterval = setInterval(() => {
        const isAtEnd =
          Math.ceil(slider.scrollLeft + slider.clientWidth) >=
          slider.scrollWidth;
        if (isAtEnd) {
          slider.scrollTo({ left: 0, behavior: "auto" });
        } else {
          slider.scrollBy({ left: 1, behavior: "smooth" });
        }
      }, 20);
    }

    function stopAutoScroll() {
      clearInterval(scrollInterval);
    }

    slider.addEventListener("mouseenter", stopAutoScroll);
    slider.addEventListener("mouseleave", startAutoScroll);
    setTimeout(startAutoScroll, 300);
  }

  // --- Search Toggle ---
  const searchToggle = document.getElementById("searchToggle");
  const searchInput = document.getElementById("searchInput");
  const closeSearch = document.getElementById("closeSearch");

  if (searchToggle && searchInput && closeSearch) {
    searchToggle.addEventListener("click", () => {
      searchInput.style.display = "inline-block";
      closeSearch.style.display = "inline-block";
      searchToggle.style.display = "none";
      searchInput.focus();
    });

    closeSearch.addEventListener("click", () => {
      searchInput.style.display = "none";
      closeSearch.style.display = "none";
      searchToggle.style.display = "inline-block";
      searchInput.value = "";
    });
  }
});

// Hidden file input generator
function createHiddenFileInput() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.id = "fileInput";
  input.style.display = "none";
  document.body.appendChild(input);
  return input;
}
function slideRow(button, direction) {
  const row = button.parentElement.querySelector(".movie-row");
  const cardWidth = row.querySelector(".movie-card").offsetWidth;
  const scrollAmount = (cardWidth + 16) * 4 * direction; // 16 is the gap
  row.scrollBy({
    left: scrollAmount,
    behavior: "smooth",
  });
}

// Show/hide buttons based on scroll position
document.querySelectorAll(".movie-row").forEach((row) => {
  row.addEventListener("scroll", () => {
    const container = row.parentElement;
    const prevButton = container.querySelector(".prev");
    const nextButton = container.querySelector(".next");

    prevButton.style.opacity = row.scrollLeft > 0 ? "1" : "0";
    nextButton.style.opacity =
      row.scrollLeft + row.clientWidth < row.scrollWidth ? "1" : "0";
  });

  // Trigger scroll event to set initial button states
  row.dispatchEvent(new Event("scroll"));
});

// Sidebar Toggle with console logging
document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("navbar-toggle");
  const closeButton = document.getElementById("sidebar-close");
  const sidebar = document.getElementById("vertical-navbar");
  const movieSection = document.querySelector(".movie-section");

  // Open sidebar
  toggleButton.addEventListener("click", function (e) {
    e.stopPropagation();
    sidebar.classList.add("active");
    movieSection.classList.add("shifted");
  });

  // Close sidebar with close button
  closeButton.addEventListener("click", function (e) {
    e.stopPropagation();
    sidebar.classList.remove("active");
    movieSection.classList.remove("shifted");
  });

  // Close sidebar when clicking outside
  document.addEventListener("click", function (e) {
    if (
      !sidebar.contains(e.target) &&
      !toggleButton.contains(e.target) &&
      sidebar.classList.contains("active")
    ) {
      sidebar.classList.remove("active");
      movieSection.classList.remove("shifted");
    }
  });

  // Navbar scroll effect
  const navbar = document.getElementById("mainNavbar");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Initialize the carousel with Bootstrap's carousel method
  const carousel = new bootstrap.Carousel(
    document.getElementById("mainCarousel"),
    {
      interval: 5000, // 5 seconds per slide
      ride: "carousel",
      wrap: true,
      touch: true, // Enable touch swiping on mobile
    }
  );

  // Pause on hover (optional - remove if you want continuous play)
  document
    .getElementById("mainCarousel")
    .addEventListener("mouseenter", function () {
      carousel.pause();
    });

  document
    .getElementById("mainCarousel")
    .addEventListener("mouseleave", function () {
      carousel.cycle();
    });
});

const movies = [
  {
    title: "cel4",
    image: "front end/images/cel4.jpg",
    year: 2021,
    genre: "Action",
    rating: "8.0",
  },
  {
    title: "Elio",
    image: "images/elio.jpg",
    year: 2020,
    genre: "Drama",
    rating: "7.8",
  },
];

function createMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";

  card.innerHTML = `
    <img src="${movie.image}" alt="${movie.title}">
    <div class="movie-info">
      <div class="rating">⭐ ${movie.rating}</div>
      <h3>${movie.title}</h3>
      <p>${movie.year} • ${movie.genre}</p>
      <div class="card-buttons">
        <button class="watch-btn">▶ Watch</button>
        <button class="info-btn">ℹ Info</button>
      </div>
    </div>
  `;

  return card;
}

const container = document.getElementById("movieRowContainer");

movies.forEach((movie) => {
  const card = createMovieCard(movie);
  container.appendChild(card);
});
