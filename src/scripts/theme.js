document.addEventListener("DOMContentLoaded", () => {
    const themeIcon = document.querySelector(".icon[alt='Theme']");
  
    chrome.storage.local.get(["theme"], (result) => {
        if (result.theme === "dark") {
            document.body.classList.add("dark");
        }
    });
  
    themeIcon.addEventListener("click", () => {
        document.body.classList.toggle("dark");
    
        const isDark = document.body.classList.contains("dark");
        chrome.storage.local.set({ theme: isDark ? "dark" : "light" });
    });
});  