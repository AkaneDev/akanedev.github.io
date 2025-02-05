function redirect(Location = "../index.html") {
    console.log("Redirecting to " + Location);
    setTimeout(() => {
        window.location.href = Location;
    }, 5000);
}
