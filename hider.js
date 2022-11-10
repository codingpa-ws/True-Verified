const findVerified = () => [
  ...document.querySelectorAll('[aria-label="Verified account"]'),
];

const findAllBadges = () =>
  findVerified().map((svg) => {
    let element = svg;
    do {
      element = element.parentElement;
    } while (element && element.getAttribute("role") !== "link");

    let name;

    if (element) {
      name = element.href
        ? new URL(element.href).pathname.match(/\/([^/·]+)/)
        : element.textContent.match(/@([^@ ·]+)/);
      name = name && name[1];
    }

    return { name, svg };
  });

let blue = [];

const isTwitterBlue = (name) => blue.includes(name);

const currentUserName = () => {
  const name = document.querySelector('[data-testid="UserName"]');

  if (!name) return;

  const span = [...name.querySelectorAll("span")].find((span) =>
    span.textContent.trim().match(/^@([^@]+)\b/)
  );

  if (span) {
    return span.textContent.substring(1);
  }
};

let lastCurrentUser = currentUserName();

const checkForNewBlueUsers = () => {
  const badges = findAllBadges();

  for (const badge of badges) {
    if (
      badge.svg.parentElement.getAttribute("role") === "button" &&
      lastCurrentUser !== currentUserName()
    ) {
      const name = currentUserName();
      lastCurrentUser = name;

      if (isTwitterBlue(name)) continue;

      badge.svg.parentElement.click();

      setTimeout(() => {
        const isBlue =
          [...document.querySelectorAll('[role="group"]')].filter((r) =>
            r.textContent.includes("Twitter Blue")
          ).length > 0;
        badge.svg.parentElement.click();

        if (isBlue) {
          blue.push(name);

          chrome.storage.sync.set({ blue });

          console.info(`Found Twitter Blue user: @${name}`);
        }
      }, 25);
    }
  }
};

const check = async () => {
  try {
    checkForNewBlueUsers();

    const badges = findAllBadges();

    const blueUsers = badges.filter((badge) => isTwitterBlue(badge.name));

    for (const badge of blueUsers) {
      badge.svg.style.filter = "grayscale() opacity(0.2)";
    }
  } catch (error) {
    console.error("True Verified error:", error);
  }
};

const start = () => {
  chrome.storage.sync.get(["blue"], ({ blue: blueUsers }) => {
    if (Array.isArray(blueUsers)) {
      blue = blueUsers;

      console.info(
        "Loaded Twitter Blue users from storage: ",
        blueUsers.join(", ")
      );
    }

    setInterval(check, 3000);
  });
};

start();
