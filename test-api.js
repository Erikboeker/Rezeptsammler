
async function testFetch() {
  const params = new URLSearchParams();
  params.set("kategorie", "Hauptspeise");
  const url = `http://localhost:3000/api/rezepte?${params}`;
  console.log("Fetching:", url);
  try {
    const res = await fetch(url);
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data size:", Array.isArray(data) ? data.length : "Not an array");
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

testFetch();
